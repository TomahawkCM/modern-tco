-- Add admin audit log and family group tables

-- Audit log for admin actions
create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.users(id) on delete set null,
  action text not null,
  target_user_id uuid references public.users(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_log_actor_id_idx on public.audit_log(actor_id);
create index if not exists audit_log_target_user_id_idx on public.audit_log(target_user_id);
create index if not exists audit_log_created_at_idx on public.audit_log(created_at desc);

alter table public.audit_log enable row level security;

-- Service role full access
create policy "audit_log service role all"
  on public.audit_log
  for all
  to service_role
  using (true)
  with check (true);

-- Allow authenticated users to view their own audit entries
create policy "audit_log users can read own"
  on public.audit_log
  for select
  to authenticated
  using (actor_id = auth.uid() or target_user_id = auth.uid());

-- Family groups
create table if not exists public.family_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references public.users(id) on delete cascade,
  invite_code text unique,
  created_at timestamptz not null default now()
);

create index if not exists family_groups_owner_id_idx on public.family_groups(owner_id);

alter table public.family_groups enable row level security;

create policy "family_groups service role all"
  on public.family_groups
  for all
  to service_role
  using (true)
  with check (true);

create policy "family_groups owners can read"
  on public.family_groups
  for select
  to authenticated
  using (owner_id = auth.uid());

-- Family members
create table if not exists public.family_members (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.family_groups(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner','admin','member','viewer','child')),
  permissions jsonb not null default '[]'::jsonb,
  can_see_all_accounts boolean not null default false,
  visible_accounts uuid[] not null default '{}'::uuid[],
  spending_limit numeric,
  created_at timestamptz not null default now(),
  unique (family_id, user_id)
);

create index if not exists family_members_family_id_idx on public.family_members(family_id);
create index if not exists family_members_user_id_idx on public.family_members(user_id);

alter table public.family_members enable row level security;

create policy "family_members service role all"
  on public.family_members
  for all
  to service_role
  using (true)
  with check (true);

create policy "family_members users can read own"
  on public.family_members
  for select
  to authenticated
  using (user_id = auth.uid());
