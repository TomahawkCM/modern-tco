-- Ensure questions.module_id exists to link with study_modules
ALTER TABLE public.questions
  ADD COLUMN IF NOT EXISTS module_id UUID NULL REFERENCES public.study_modules(id) ON DELETE SET NULL;

-- Add index if not present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_questions_module_id'
  ) THEN
    CREATE INDEX idx_questions_module_id ON public.questions(module_id);
  END IF;
END $$;

