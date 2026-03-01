-- Migration: 009_financial_tracking
-- Phase 4: Financial Tracking tables
-- 8 tables with RLS policies
--
-- Table order respects FK dependencies:
-- 1. user_subscriptions (deps: users, categories)
-- 2. excluded_subscription_merchants (deps: users)
-- 3. loans (deps: users)
-- 4. loan_payments (deps: users, loans)
-- 5. investment_accounts (deps: users)
-- 6. holdings (deps: users, investment_accounts)
-- 7. properties (deps: users)
-- 8. net_worth_snapshots (deps: users)

-- ============================================================
-- 1. User Subscriptions (recurring billing tracker)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  merchant_name TEXT NOT NULL,
  amount_minor INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  frequency TEXT NOT NULL DEFAULT 'monthly',
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  next_billing_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);

ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_subscriptions_select_own" ON public.user_subscriptions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "user_subscriptions_insert_own" ON public.user_subscriptions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_subscriptions_update_own" ON public.user_subscriptions
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "user_subscriptions_delete_own" ON public.user_subscriptions
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- 2. Excluded Subscription Merchants (opt-out list)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.excluded_subscription_merchants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  merchant_token TEXT NOT NULL,
  UNIQUE(user_id, merchant_token)
);

CREATE INDEX IF NOT EXISTS idx_excluded_subscription_merchants_user_id ON public.excluded_subscription_merchants(user_id);

ALTER TABLE public.excluded_subscription_merchants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "excluded_subscription_merchants_select_own" ON public.excluded_subscription_merchants
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "excluded_subscription_merchants_insert_own" ON public.excluded_subscription_merchants
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "excluded_subscription_merchants_update_own" ON public.excluded_subscription_merchants
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "excluded_subscription_merchants_delete_own" ON public.excluded_subscription_merchants
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- 3. Loans (debt tracking)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  loan_type TEXT NOT NULL,
  original_balance_minor INTEGER NOT NULL,
  current_balance_minor INTEGER NOT NULL,
  interest_rate NUMERIC(5,2) NOT NULL,
  minimum_payment_minor INTEGER NOT NULL DEFAULT 0,
  start_date DATE,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'active',
  currency TEXT NOT NULL DEFAULT 'USD',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_loans_user_id ON public.loans(user_id);

ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "loans_select_own" ON public.loans
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "loans_insert_own" ON public.loans
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "loans_update_own" ON public.loans
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "loans_delete_own" ON public.loans
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- 4. Loan Payments (payment history)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.loan_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  loan_id UUID NOT NULL REFERENCES public.loans(id) ON DELETE CASCADE,
  amount_minor INTEGER NOT NULL,
  payment_date DATE NOT NULL,
  principal_minor INTEGER,
  interest_minor INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_loan_payments_user_id ON public.loan_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_loan_payments_loan_id ON public.loan_payments(loan_id);

ALTER TABLE public.loan_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "loan_payments_select_own" ON public.loan_payments
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "loan_payments_insert_own" ON public.loan_payments
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "loan_payments_update_own" ON public.loan_payments
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "loan_payments_delete_own" ON public.loan_payments
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- 5. Investment Accounts (brokerage / retirement accounts)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.investment_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  account_type TEXT NOT NULL,
  institution TEXT,
  currency TEXT NOT NULL DEFAULT 'USD',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_investment_accounts_user_id ON public.investment_accounts(user_id);

ALTER TABLE public.investment_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "investment_accounts_select_own" ON public.investment_accounts
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "investment_accounts_insert_own" ON public.investment_accounts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "investment_accounts_update_own" ON public.investment_accounts
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "investment_accounts_delete_own" ON public.investment_accounts
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- 6. Holdings (individual securities within investment accounts)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.holdings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  investment_account_id UUID NOT NULL REFERENCES public.investment_accounts(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  name TEXT,
  shares NUMERIC(12,4) NOT NULL,
  purchase_price_minor INTEGER NOT NULL,
  purchase_date DATE,
  currency TEXT NOT NULL DEFAULT 'USD',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_holdings_user_id ON public.holdings(user_id);
CREATE INDEX IF NOT EXISTS idx_holdings_investment_account_id ON public.holdings(investment_account_id);

ALTER TABLE public.holdings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "holdings_select_own" ON public.holdings
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "holdings_insert_own" ON public.holdings
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "holdings_update_own" ON public.holdings
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "holdings_delete_own" ON public.holdings
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- 7. Properties (real estate assets)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  purchase_price_minor INTEGER,
  current_value_minor INTEGER,
  mortgage_balance_minor INTEGER DEFAULT 0,
  monthly_expenses_minor INTEGER DEFAULT 0,
  purchase_date DATE,
  currency TEXT NOT NULL DEFAULT 'USD',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_properties_user_id ON public.properties(user_id);

ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "properties_select_own" ON public.properties
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "properties_insert_own" ON public.properties
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "properties_update_own" ON public.properties
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "properties_delete_own" ON public.properties
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- 8. Net Worth Snapshots (periodic balance sheet)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.net_worth_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  total_assets_minor INTEGER NOT NULL,
  total_liabilities_minor INTEGER NOT NULL,
  net_worth_minor INTEGER NOT NULL,
  breakdown JSONB,
  currency TEXT NOT NULL DEFAULT 'USD',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, snapshot_date)
);

CREATE INDEX IF NOT EXISTS idx_net_worth_snapshots_user_id ON public.net_worth_snapshots(user_id);

ALTER TABLE public.net_worth_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "net_worth_snapshots_select_own" ON public.net_worth_snapshots
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "net_worth_snapshots_insert_own" ON public.net_worth_snapshots
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "net_worth_snapshots_update_own" ON public.net_worth_snapshots
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "net_worth_snapshots_delete_own" ON public.net_worth_snapshots
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
