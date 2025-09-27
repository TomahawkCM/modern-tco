-- Add optional module/section references to notes for grouping
alter table public.notes
  add column if not exists module_id uuid null references public.study_modules(id) on delete set null,
  add column if not exists section_id uuid null references public.study_sections(id) on delete set null;

create index if not exists idx_notes_section on public.notes(section_id);
create index if not exists idx_notes_module on public.notes(module_id);

