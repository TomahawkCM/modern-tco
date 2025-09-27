create extension if not exists "pgcrypto";

-- Team seats for basic team plan management
create table if not exists public.team_seats (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  email text not null,
  status text not null default 'invited',
  invited_at timestamptz not null default now(),
  accepted_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(owner_id, email)
);

alter table public.team_seats
  add constraint team_seats_status_check
  check (status in ('invited','active','revoked'));

create index if not exists idx_team_seats_owner on public.team_seats(owner_id);
create index if not exists idx_team_seats_email on public.team_seats(email);

drop trigger if exists team_seats_updated_at on public.team_seats;
create trigger team_seats_updated_at before update on public.team_seats
  for each row execute procedure public.handle_updated_at();

alter table public.team_seats enable row level security;

do $$ begin
  begin
    create policy team_seats_select_own on public.team_seats for select to authenticated using (owner_id = auth.uid());
  exception when duplicate_object then null; end;
  begin
    create policy team_seats_insert_own on public.team_seats for insert to authenticated with check (owner_id = auth.uid());
  exception when duplicate_object then null; end;
  begin
    create policy team_seats_update_own on public.team_seats for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
  exception when duplicate_object then null; end;
  begin
    create policy team_seats_delete_own on public.team_seats for delete to authenticated using (owner_id = auth.uid());
  exception when duplicate_object then null; end;
end $$;

