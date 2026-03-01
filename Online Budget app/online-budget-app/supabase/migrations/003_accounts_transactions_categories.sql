-- Migration: 003_accounts_transactions_categories
-- Creates institutions, accounts, transactions, categories,
-- category_translations, and user_category_overrides tables
-- Per V1-DATABASE-SCHEMA-DESIGN.md sections 4-6
--
-- Table order respects FK dependencies:
-- 1. institutions (no deps)
-- 2. accounts (deps: users, institutions)
-- 3. categories (self-referencing parent_id)
-- 4. category_translations (deps: categories)
-- 5. user_category_overrides (deps: users, categories)
-- 6. transactions (deps: users, accounts, categories)

-- ============================================================
-- 1. Institutions (shared reference table, not user-owned)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.institutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id TEXT,
  name TEXT NOT NULL,
  country_code VARCHAR(2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_institutions_provider_id ON public.institutions(provider_id);

-- Institutions are shared reference data — no RLS needed
-- Populated by bank sync integration (future session)

-- ============================================================
-- 2. Accounts
-- ============================================================
CREATE TABLE IF NOT EXISTS public.accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  institution_id UUID REFERENCES public.institutions(id) ON DELETE SET NULL,
  provider_account_id TEXT,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'checking'
    CHECK (type IN ('checking', 'savings', 'credit', 'investment', 'loan', 'other')),
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  balance_minor BIGINT NOT NULL DEFAULT 0,
  is_manual BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON public.accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_institution_id ON public.accounts(institution_id);

ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "accounts_select_own" ON public.accounts
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "accounts_insert_own" ON public.accounts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "accounts_update_own" ON public.accounts
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "accounts_delete_own" ON public.accounts
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER set_accounts_updated_at
  BEFORE UPDATE ON public.accounts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- 3. Categories (Multi-Language Compatible)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) NOT NULL UNIQUE,
  parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  is_system BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON public.categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_key ON public.categories(key);

-- Categories are system-level shared data — no RLS needed
-- All users can read categories; only service role can insert/update

-- ============================================================
-- 4. Category Translations
-- ============================================================
CREATE TABLE IF NOT EXISTS public.category_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  locale VARCHAR(10) NOT NULL,
  display_name TEXT NOT NULL,
  UNIQUE(category_id, locale)
);

CREATE INDEX IF NOT EXISTS idx_category_translations_category_id ON public.category_translations(category_id);
CREATE INDEX IF NOT EXISTS idx_category_translations_locale ON public.category_translations(locale);

-- Category translations are shared — no RLS needed

-- ============================================================
-- 5. User Category Overrides
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_category_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  custom_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_category_overrides_user_id ON public.user_category_overrides(user_id);

ALTER TABLE public.user_category_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "overrides_select_own" ON public.user_category_overrides
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "overrides_insert_own" ON public.user_category_overrides
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "overrides_update_own" ON public.user_category_overrides
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "overrides_delete_own" ON public.user_category_overrides
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- 6. Transactions (Multi-Currency Safe)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  provider_transaction_id TEXT,
  amount_minor BIGINT NOT NULL,
  currency VARCHAR(3) NOT NULL,
  description TEXT,
  merchant_name TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  transaction_date DATE NOT NULL,
  posted_at TIMESTAMPTZ,
  is_pending BOOLEAN NOT NULL DEFAULT false,
  confidence_score NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Critical indexes per V1-DATABASE-SCHEMA-DESIGN.md section 12
CREATE INDEX IF NOT EXISTS idx_transactions_user_id_date ON public.transactions(user_id, transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON public.transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON public.transactions(category_id);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "transactions_select_own" ON public.transactions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "transactions_insert_own" ON public.transactions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "transactions_update_own" ON public.transactions
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "transactions_delete_own" ON public.transactions
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER set_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
