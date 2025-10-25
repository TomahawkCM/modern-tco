create extension if not exists "pgcrypto";

-- Questions table used by app services
create table if not exists public.questions (
  id text primary key,
  question text not null,
  options jsonb not null default '[]'::jsonb,
  correct_answer text,
  explanation text,
  difficulty text,
  category text,
  tags text[] default array[]::text[],
  domain text,
  module_id uuid null references public.study_modules(id) on delete set null,
  study_guide_ref text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_questions_domain on public.questions(domain);
create index if not exists idx_questions_difficulty on public.questions(difficulty);
create index if not exists idx_questions_category on public.questions(category);

drop trigger if exists questions_updated_at on public.questions;
create trigger questions_updated_at before update on public.questions
  for each row execute procedure public.handle_updated_at();

alter table public.questions enable row level security;
do $$ begin
  begin
    create policy questions_read on public.questions for select using (true);
  exception when duplicate_object then null; end;
end $$;

-- Exam sessions to track user exam runs
create table if not exists public.exam_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  started_at timestamptz not null default now(),
  completed_at timestamptz null,
  status text default 'active',
  total_questions integer,
  correct_answers integer,
  score integer,
  last_activity timestamptz default now(),
  config jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Ensure columns exist on pre-existing exam_sessions
alter table public.exam_sessions add column if not exists last_activity timestamptz default now();
alter table public.exam_sessions add column if not exists status text default 'active';
alter table public.exam_sessions add column if not exists config jsonb;
alter table public.exam_sessions add column if not exists created_at timestamptz default now();
alter table public.exam_sessions add column if not exists updated_at timestamptz default now();

create index if not exists idx_exam_sessions_user on public.exam_sessions(user_id);
create index if not exists idx_exam_sessions_last_activity on public.exam_sessions(last_activity);

drop trigger if exists exam_sessions_updated_at on public.exam_sessions;
create trigger exam_sessions_updated_at before update on public.exam_sessions
  for each row execute procedure public.handle_updated_at();

alter table public.exam_sessions enable row level security;
do $$ begin
  begin
    create policy exam_sessions_select_own on public.exam_sessions for select to authenticated using (user_id = auth.uid());
  exception when duplicate_object then null; end;
  begin
    create policy exam_sessions_insert_own on public.exam_sessions for insert to authenticated with check (user_id = auth.uid());
  exception when duplicate_object then null; end;
  begin
    create policy exam_sessions_update_own on public.exam_sessions for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
  exception when duplicate_object then null; end;
end $$;

-- User progress per question
create table if not exists public.user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  exam_session_id uuid null references public.exam_sessions(id) on delete set null,
  question_id text null references public.questions(id) on delete set null,
  selected_answer text,
  is_correct boolean,
  time_spent_seconds integer,
  completed_at timestamptz default now(),
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Backfill columns for existing user_progress tables
alter table public.user_progress add column if not exists time_spent_seconds integer;
alter table public.user_progress add column if not exists metadata jsonb default '{}'::jsonb;
alter table public.user_progress add column if not exists created_at timestamptz default now();
alter table public.user_progress add column if not exists updated_at timestamptz default now();

create index if not exists idx_user_progress_user on public.user_progress(user_id);
create index if not exists idx_user_progress_session on public.user_progress(exam_session_id);
create index if not exists idx_user_progress_question on public.user_progress(question_id);

drop trigger if exists user_progress_updated_at on public.user_progress;
create trigger user_progress_updated_at before update on public.user_progress
  for each row execute procedure public.handle_updated_at();

alter table public.user_progress enable row level security;
do $$ begin
  begin
    create policy user_progress_select_own on public.user_progress for select to authenticated using (user_id = auth.uid());
  exception when duplicate_object then null; end;
  begin
    create policy user_progress_insert_own on public.user_progress for insert to authenticated with check (user_id = auth.uid());
  exception when duplicate_object then null; end;
  begin
    create policy user_progress_update_own on public.user_progress for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
  exception when duplicate_object then null; end;
end $$;

-- Aggregated user statistics per category/domain
create table if not exists public.user_statistics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  category text not null,
  total_questions integer default 0,
  correct_answers integer default 0,
  accuracy_rate numeric,
  average_time numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, category)
);

create index if not exists idx_user_statistics_user on public.user_statistics(user_id);

drop trigger if exists user_statistics_updated_at on public.user_statistics;
create trigger user_statistics_updated_at before update on public.user_statistics
  for each row execute procedure public.handle_updated_at();

alter table public.user_statistics enable row level security;
do $$ begin
  begin
    create policy user_statistics_select_own on public.user_statistics for select to authenticated using (user_id = auth.uid());
  exception when duplicate_object then null; end;
  begin
    create policy user_statistics_upsert_own on public.user_statistics for insert to authenticated with check (user_id = auth.uid());
  exception when duplicate_object then null; end;
  begin
    create policy user_statistics_update_own on public.user_statistics for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
  exception when duplicate_object then null; end;
end $$;

-- Module progress per user
create table if not exists public.user_module_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  module_id uuid not null references public.study_modules(id) on delete cascade,
  completed_sections integer,
  total_sections integer,
  status text,
  last_updated timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, module_id)
);

create index if not exists idx_user_module_progress_user on public.user_module_progress(user_id);
create index if not exists idx_user_module_progress_module on public.user_module_progress(module_id);

drop trigger if exists user_module_progress_updated_at on public.user_module_progress;
create trigger user_module_progress_updated_at before update on public.user_module_progress
  for each row execute procedure public.handle_updated_at();

alter table public.user_module_progress enable row level security;
do $$ begin
  begin
    create policy user_module_progress_select_own on public.user_module_progress for select to authenticated using (user_id = auth.uid());
  exception when duplicate_object then null; end;
  begin
    create policy user_module_progress_upsert_own on public.user_module_progress for insert to authenticated with check (user_id = auth.uid());
  exception when duplicate_object then null; end;
  begin
    create policy user_module_progress_update_own on public.user_module_progress for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
  exception when duplicate_object then null; end;
end $$;
