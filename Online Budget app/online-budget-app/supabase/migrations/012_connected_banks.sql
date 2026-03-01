-- Migration: 012_connected_banks
-- Phase 8: Connected bank accounts for Plaid/provider sync
--
-- Stores encrypted access tokens for connected bank providers.
-- Each row links a user to a bank connection via Plaid (or other providers).

-- ============================================================
-- 1. Connected Banks (Plaid / provider bank connections)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.connected_banks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  access_token_encrypted TEXT NOT NULL,
  institution_id UUID REFERENCES public.institutions(id),
  last_synced_at TIMESTAMPTZ,
  sync_cursor TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_connected_banks_user_id ON public.connected_banks(user_id);
CREATE INDEX IF NOT EXISTS idx_connected_banks_institution_id ON public.connected_banks(institution_id);

CREATE TRIGGER set_connected_banks_updated_at
  BEFORE UPDATE ON public.connected_banks
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.connected_banks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "connected_banks_select_own" ON public.connected_banks
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "connected_banks_insert_own" ON public.connected_banks
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "connected_banks_update_own" ON public.connected_banks
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "connected_banks_delete_own" ON public.connected_banks
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
