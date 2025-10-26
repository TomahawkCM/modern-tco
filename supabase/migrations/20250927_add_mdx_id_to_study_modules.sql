-- Add mdx_id column to study_modules to link MDX frontmatter to DB rows

ALTER TABLE public.study_modules
  ADD COLUMN IF NOT EXISTS mdx_id TEXT;

-- Ensure uniqueness if populated
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_study_modules_mdx_id'
  ) THEN
    CREATE UNIQUE INDEX idx_study_modules_mdx_id ON public.study_modules(mdx_id);
  END IF;
END $$;

