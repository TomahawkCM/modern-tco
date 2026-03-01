-- Migration: 008_import_tables
-- Creates import_metadata and imported_fitids tables
-- Used by the transaction import feature (Phase 3)
--
-- Table order respects FK dependencies:
-- 1. import_metadata (deps: users)
-- 2. imported_fitids (deps: users, accounts)

-- ============================================================
-- 1. Import Metadata (tracks each import session)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.import_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  bank_slug TEXT,
  row_count INTEGER NOT NULL,
  imported_count INTEGER NOT NULL,
  skipped_count INTEGER NOT NULL DEFAULT 0,
  imported_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_import_metadata_user_id ON public.import_metadata(user_id);

ALTER TABLE public.import_metadata ENABLE ROW LEVEL SECURITY;

CREATE POLICY "import_metadata_select_own" ON public.import_metadata
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "import_metadata_insert_own" ON public.import_metadata
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "import_metadata_delete_own" ON public.import_metadata
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- 2. Imported FITIDs (deduplication tracking)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.imported_fitids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  fitid TEXT NOT NULL,
  account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
  UNIQUE(user_id, fitid)
);

CREATE INDEX IF NOT EXISTS idx_imported_fitids_user_id ON public.imported_fitids(user_id);

ALTER TABLE public.imported_fitids ENABLE ROW LEVEL SECURITY;

CREATE POLICY "imported_fitids_select_own" ON public.imported_fitids
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "imported_fitids_insert_own" ON public.imported_fitids
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "imported_fitids_delete_own" ON public.imported_fitids
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
