create extension if not exists "pgcrypto";

-- Notes table for personal study notes with spaced repetition state
create table if not exists public.notes (
  id text primary key,
  user_id uuid not null,
  text text not null,
  tags text[] default array[]::text[],
  srs jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Helpful indexes
create index if not exists idx_notes_user on public.notes(user_id);
create index if not exists idx_notes_updated_at on public.notes(updated_at);

-- Updated_at trigger function (idempotent)
create or replace function public.handle_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists notes_updated_at on public.notes;
create trigger notes_updated_at before update on public.notes
  for each row execute procedure public.handle_updated_at();

-- Row Level Security: users can only manage their own notes
alter table public.notes enable row level security;

do $$
begin
  begin
    create policy notes_select_own on public.notes
      for select to authenticated
      using (auth.uid() = user_id);
  exception when duplicate_object then null; end;

  begin
    create policy notes_insert_own on public.notes
      for insert to authenticated
      with check (auth.uid() = user_id);
  exception when duplicate_object then null; end;

  begin
    create policy notes_update_own on public.notes
      for update to authenticated
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  exception when duplicate_object then null; end;

  begin
    create policy notes_delete_own on public.notes
      for delete to authenticated
      using (auth.uid() = user_id);
  exception when duplicate_object then null; end;
end $$;

