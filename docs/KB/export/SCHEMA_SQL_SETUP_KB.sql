-- Knowledge Base Schema Setup (kb_*)
-- Creates read-only tables consumed by the Knowledge Base dashboard.

create extension if not exists "pgcrypto";
create schema if not exists kb;

-- Modules are keyed by string identifiers so they match lesson stub slugs
create table if not exists kb.kb_modules (
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

create table if not exists kb.kb_lessons (
    id uuid primary key default gen_random_uuid(),
    module_id text references kb.kb_modules(id) on delete cascade,
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
    unique(module_id, slug)
);

create table if not exists kb.kb_questions (
    id text primary key,
    module_id text references kb.kb_modules(id) on delete set null,
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

create table if not exists kb.kb_exports (
    id uuid primary key default gen_random_uuid(),
    batch_type text not null,
    status text default 'pending',
    payload_path text,
    notes text,
    started_at timestamptz default now(),
    completed_at timestamptz,
    metadata jsonb default '{}'::jsonb
);

-- Indexes for faster lookups
create index if not exists idx_kb_modules_domain on kb.kb_modules(domain);
create index if not exists idx_kb_modules_status on kb.kb_modules(status);
create index if not exists idx_kb_lessons_module on kb.kb_lessons(module_id);
create index if not exists idx_kb_lessons_slug on kb.kb_lessons(slug);
create index if not exists idx_kb_lessons_status on kb.kb_lessons(status);
create index if not exists idx_kb_questions_module on kb.kb_questions(module_id);
create index if not exists idx_kb_questions_domain on kb.kb_questions(domain);
create index if not exists idx_kb_questions_difficulty on kb.kb_questions(difficulty);

-- Timestamp trigger helper
create or replace function kb.handle_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Attach triggers
create trigger kb_modules_updated_at
  before update on kb.kb_modules
  for each row execute procedure kb.handle_updated_at();

create trigger kb_lessons_updated_at
  before update on kb.kb_lessons
  for each row execute procedure kb.handle_updated_at();

create trigger kb_questions_updated_at
  before update on kb.kb_questions
  for each row execute procedure kb.handle_updated_at();

-- Read-only RLS policies
alter table kb.kb_modules enable row level security;
alter table kb.kb_lessons enable row level security;
alter table kb.kb_questions enable row level security;

create policy kb_modules_read on kb.kb_modules for select using (true);
create policy kb_lessons_read on kb.kb_lessons for select using (true);
create policy kb_questions_read on kb.kb_questions for select using (true);

-- Prevent writes from anon/service roles by default (explicit grants required)
create policy kb_modules_no_write on kb.kb_modules for all using (false) with check (false);
create policy kb_lessons_no_write on kb.kb_lessons for all using (false) with check (false);
create policy kb_questions_no_write on kb.kb_questions for all using (false) with check (false);

comment on table kb.kb_modules is 'Knowledge Base modules displayed in the /kb dashboard';
comment on table kb.kb_lessons is 'Rich lesson metadata backing the Knowledge Base';
comment on table kb.kb_questions is 'Domain-aligned KB question bank';
comment on table kb.kb_exports is 'Audit log of KB export batches sent to downstream systems';
