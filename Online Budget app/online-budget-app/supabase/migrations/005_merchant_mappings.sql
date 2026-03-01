-- Migration: 005_merchant_mappings
-- Creates user-owned merchant mapping table for learned categorization rules
-- Per V1-DATABASE-SCHEMA-DESIGN.md section 10 (extended with user_id for RLS)
--
-- Depends on: 001 (users), 003 (categories)

-- ============================================================
-- 1. Merchant Mappings (user-owned, RLS-protected)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.merchant_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  merchant_token TEXT NOT NULL,
  display_name TEXT NOT NULL,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- One mapping per merchant per user
  UNIQUE(user_id, merchant_token)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_merchant_mappings_user_id
  ON public.merchant_mappings(user_id);

CREATE INDEX IF NOT EXISTS idx_merchant_mappings_merchant_token
  ON public.merchant_mappings(merchant_token);

-- ============================================================
-- 2. RLS Policies
-- ============================================================

ALTER TABLE public.merchant_mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "merchant_mappings_select_own" ON public.merchant_mappings
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "merchant_mappings_insert_own" ON public.merchant_mappings
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "merchant_mappings_update_own" ON public.merchant_mappings
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "merchant_mappings_delete_own" ON public.merchant_mappings
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- 3. Auto-update trigger
-- ============================================================

CREATE TRIGGER set_merchant_mappings_updated_at
  BEFORE UPDATE ON public.merchant_mappings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
