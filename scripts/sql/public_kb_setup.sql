-- Option A: Public schema KB objects for Supabase REST access
-- Run this in the Supabase SQL Editor for your project.

-- Ensure required extensions are available for UUID generation
create extension if not exists "pgcrypto";

-- 0) Create modules table first (referenced by lessons/questions)
create table if not exists public.kb_modules (
  id text primary key,
  title text not null,
  domain text not null check (domain in ('AQ','RQ','TA','NB','RD')),
  description text,
  status text default 'draft',
  order_index integer default 0,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- If kb_modules existed prior without timestamps, add them
alter table public.kb_modules add column if not exists created_at timestamptz default now();
alter table public.kb_modules add column if not exists updated_at timestamptz default now();

-- 1) Create lessons table in public schema (to match app REST queries)
create table if not exists public.kb_lessons (
  id uuid primary key default gen_random_uuid(),
  module_id text references public.kb_modules(id) on delete cascade,
  slug text not null,
  title text not null,
  summary text,
  duration_minutes integer,
  content text,
  tags text[] default array[]::text[],
  contributors text[] default array[]::text[],
  status text default 'draft',
  skill_level text default 'beginner',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (module_id, slug)
);

-- If kb_lessons existed prior without timestamps, add them
alter table public.kb_lessons add column if not exists created_at timestamptz default now();
alter table public.kb_lessons add column if not exists updated_at timestamptz default now();

-- If kb_lessons already existed without module_id, add it and FK now
alter table public.kb_lessons add column if not exists module_id text;
do $$ begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.kb_lessons'::regclass
      and contype = 'f'
  ) then
    alter table public.kb_lessons
      add constraint kb_lessons_module_id_fkey
      foreign key (module_id) references public.kb_modules(id) on delete cascade;
  end if;
end $$;

-- Now that module_id is guaranteed, create indexes
create index if not exists idx_public_kb_lessons_module on public.kb_lessons(module_id);
create index if not exists idx_public_kb_lessons_slug on public.kb_lessons(slug);
create index if not exists idx_public_kb_lessons_status on public.kb_lessons(status);

-- 1b) Updated-at trigger helper and trigger for kb_modules/kb_lessons
create or replace function public.kb_handle_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists kb_modules_updated_at on public.kb_modules;
create trigger kb_modules_updated_at
  before update on public.kb_modules
  for each row execute procedure public.kb_handle_updated_at();

drop trigger if exists kb_lessons_updated_at on public.kb_lessons;
create trigger kb_lessons_updated_at
  before update on public.kb_lessons
  for each row execute procedure public.kb_handle_updated_at();

-- 1c) Optional: enable simple read-only RLS on kb_* (adjust as needed)
alter table public.kb_modules enable row level security;
alter table public.kb_lessons enable row level security;

do $$ begin
  begin
    create policy kb_modules_read on public.kb_modules for select using (true);
  exception when duplicate_object then null; end;
  begin
    create policy kb_lessons_read on public.kb_lessons for select using (true);
  exception when duplicate_object then null; end;
end $$;

-- 2) Create question table + statistics view expected by validators
create table if not exists public.kb_questions (
  id text primary key,
  module_id text references public.kb_modules(id) on delete set null,
  domain text not null check (domain in ('AQ','RQ','TA','NB','RD')),
  question text not null,
  answer text,
  choices jsonb,
  difficulty text default 'intermediate',
  tags text[] default array[]::text[],
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

drop trigger if exists kb_questions_updated_at on public.kb_questions;
create trigger kb_questions_updated_at
  before update on public.kb_questions
  for each row execute procedure public.kb_handle_updated_at();

-- Ensure kb_questions has module_id if table pre-existed without it
alter table public.kb_questions add column if not exists module_id text;
do $$ begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.kb_questions'::regclass
      and contype = 'f'
  ) then
    alter table public.kb_questions
      add constraint kb_questions_module_id_fkey
      foreign key (module_id) references public.kb_modules(id) on delete set null;
  end if;
end $$;

-- Now that module_id is guaranteed, create indexes
create index if not exists idx_public_kb_questions_module on public.kb_questions(module_id);
create index if not exists idx_public_kb_questions_domain on public.kb_questions(domain);
create index if not exists idx_public_kb_questions_difficulty on public.kb_questions(difficulty);

create or replace view public.question_statistics as
select
  domain,
  count(*) as question_count,
  round((count(*) * 100.0 / (select count(*) from public.questions)), 2) as percentage,
  count(*) filter (where difficulty = 'beginner') as beginner_count,
  count(*) filter (where difficulty = 'intermediate') as intermediate_count,
  count(*) filter (where difficulty = 'advanced') as advanced_count
from public.questions
group by domain
order by question_count desc;

-- Note: RLS is typically disabled on public.* in many projects; if you enable RLS,
-- you must add SELECT policies for anonymous users.
