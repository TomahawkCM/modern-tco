-- Analytics events table for client and server tracking
create extension if not exists "pgcrypto";

create table if not exists public.analytics_events (
  event_id uuid primary key default gen_random_uuid(),
  user_id uuid null,
  session_id text null,
  event_type text not null,
  event_timestamp timestamptz not null default now(),
  event_data jsonb null,
  created_at timestamptz not null default now()
);

alter table public.analytics_events enable row level security;

do $$ begin
  begin
    create policy analytics_events_insert_any on public.analytics_events
      for insert
      with check (true);
  exception when duplicate_object then null; end;
  begin
    create policy analytics_events_read_own on public.analytics_events
      for select using (
        user_id is null or user_id = auth.uid()
      );
  exception when duplicate_object then null; end;
end $$;

-- Lab progress tables used by labProgressService
create table if not exists public.lab_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null,
  lab_id text not null,
  lab_title text null,
  domain text null,
  started_at timestamptz not null default now(),
  completed_at timestamptz null,
  current_step integer not null default 0,
  total_steps integer not null default 0,
  completion_time_seconds integer null,
  score integer null,
  attempts integer not null default 0,
  hints_used integer not null default 0,
  validation_failures integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lab_steps (
  id uuid primary key default gen_random_uuid(),
  lab_progress_id uuid not null references public.lab_progress(id) on delete cascade,
  step_number integer not null,
  step_title text null,
  completed_at timestamptz null,
  validation_attempts integer not null default 0,
  hint_used boolean not null default false,
  user_input text null,
  created_at timestamptz not null default now()
);

create table if not exists public.lab_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  achievement_type text not null,
  achievement_title text not null,
  description text null,
  earned_at timestamptz not null default now(),
  lab_id text null,
  metadata jsonb not null default '{}'::jsonb
);

-- Simple updated_at trigger for lab_progress
create or replace function public.handle_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists lab_progress_updated_at on public.lab_progress;
create trigger lab_progress_updated_at
  before update on public.lab_progress
  for each row execute procedure public.handle_updated_at();

-- Indexes for performance
create index if not exists idx_lab_progress_user on public.lab_progress(user_id);
create index if not exists idx_lab_progress_lab on public.lab_progress(lab_id);
create index if not exists idx_lab_steps_progress on public.lab_steps(lab_progress_id);
create index if not exists idx_lab_achievements_user on public.lab_achievements(user_id);

-- RLS policies for lab tables
alter table public.lab_progress enable row level security;
alter table public.lab_steps enable row level security;
alter table public.lab_achievements enable row level security;

do $$ begin
  -- lab_progress policies
  begin
    create policy lab_progress_select_own on public.lab_progress for select using (
      user_id = auth.uid()
    );
  exception when duplicate_object then null; end;
  begin
    create policy lab_progress_modify_own on public.lab_progress for insert with check (
      user_id = auth.uid()
    );
  exception when duplicate_object then null; end;
  begin
    create policy lab_progress_update_own on public.lab_progress for update using (
      user_id = auth.uid()
    ) with check (
      user_id = auth.uid()
    );
  exception when duplicate_object then null; end;

  -- lab_steps policies: permit access if related progress row belongs to user
  begin
    create policy lab_steps_select_own on public.lab_steps for select using (
      exists (
        select 1 from public.lab_progress p
        where p.id = lab_progress_id and p.user_id = auth.uid()
      )
    );
  exception when duplicate_object then null; end;
  begin
    create policy lab_steps_insert_own on public.lab_steps for insert with check (
      exists (
        select 1 from public.lab_progress p
        where p.id = lab_progress_id and p.user_id = auth.uid()
      )
    );
  exception when duplicate_object then null; end;
  begin
    create policy lab_steps_update_own on public.lab_steps for update using (
      exists (
        select 1 from public.lab_progress p
        where p.id = lab_progress_id and p.user_id = auth.uid()
      )
    ) with check (
      exists (
        select 1 from public.lab_progress p
        where p.id = lab_progress_id and p.user_id = auth.uid()
      )
    );
  exception when duplicate_object then null; end;

  -- lab_achievements policies
  begin
    create policy lab_achievements_select_own on public.lab_achievements for select using (
      user_id = auth.uid()
    );
  exception when duplicate_object then null; end;
  begin
    create policy lab_achievements_insert_own on public.lab_achievements for insert with check (
      user_id = auth.uid()
    );
  exception when duplicate_object then null; end;
end $$;

