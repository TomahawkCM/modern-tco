-- Align database column names with application expectations

-- user_study_progress: add time_spent_minutes in addition to time_spent
alter table public.user_study_progress
  add column if not exists time_spent_minutes integer not null default 0;

update public.user_study_progress
  set time_spent_minutes = coalesce(time_spent, 0)
  where time_spent_minutes = 0;

-- study_sections: add estimated_time_minutes mirroring estimated_time
alter table public.study_sections
  add column if not exists estimated_time_minutes integer;

update public.study_sections
  set estimated_time_minutes = estimated_time
  where estimated_time_minutes is null;

-- study_modules: add estimated_time_minutes (cannot derive from text reliably)
alter table public.study_modules
  add column if not exists estimated_time_minutes integer;

