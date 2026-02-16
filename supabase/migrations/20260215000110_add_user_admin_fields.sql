-- Add admin-related fields to users table (if not already present)

alter table public.users
  add column if not exists role text default 'member' check (role in ('owner','admin','member','viewer','child')),
  add column if not exists is_suspended boolean not null default false;

create index if not exists users_role_idx on public.users(role);
create index if not exists users_is_suspended_idx on public.users(is_suspended);
