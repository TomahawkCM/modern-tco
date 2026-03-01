-- Migration: 010_planning_tables
-- Phase 5: Planning & Goal tables
-- 4 tables with RLS policies
--
-- Table order:
-- 1. future_purchases (deps: users)
-- 2. retirement_plans (deps: users)
-- 3. paycheck_plans (deps: users)
-- 4. debt_scenarios (deps: users)

-- ============================================================
-- 1. Future Purchases (savings goal tracker)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.future_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_amount_minor INTEGER NOT NULL,
  current_savings_minor INTEGER NOT NULL DEFAULT 0,
  monthly_savings_minor INTEGER NOT NULL DEFAULT 0,
  target_date DATE,
  priority TEXT DEFAULT 'medium',
  currency TEXT NOT NULL DEFAULT 'USD',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_future_purchases_user_id ON public.future_purchases(user_id);

ALTER TABLE public.future_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "future_purchases_select_own" ON public.future_purchases
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "future_purchases_insert_own" ON public.future_purchases
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "future_purchases_update_own" ON public.future_purchases
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "future_purchases_delete_own" ON public.future_purchases
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- 2. Retirement Plans (retirement projection)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.retirement_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  current_age INTEGER NOT NULL,
  retirement_age INTEGER NOT NULL DEFAULT 65,
  current_savings_minor INTEGER NOT NULL DEFAULT 0,
  monthly_contribution_minor INTEGER NOT NULL DEFAULT 0,
  expected_return_percent NUMERIC(5,2) NOT NULL DEFAULT 7.0,
  currency TEXT NOT NULL DEFAULT 'USD',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_retirement_plans_user_id ON public.retirement_plans(user_id);

ALTER TABLE public.retirement_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "retirement_plans_select_own" ON public.retirement_plans
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "retirement_plans_insert_own" ON public.retirement_plans
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "retirement_plans_update_own" ON public.retirement_plans
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "retirement_plans_delete_own" ON public.retirement_plans
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- 3. Paycheck Plans (paycheck allocation)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.paycheck_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  schedule_type TEXT NOT NULL,
  pay_amount_minor INTEGER NOT NULL,
  next_pay_date DATE NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  allocations JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_paycheck_plans_user_id ON public.paycheck_plans(user_id);

ALTER TABLE public.paycheck_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "paycheck_plans_select_own" ON public.paycheck_plans
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "paycheck_plans_insert_own" ON public.paycheck_plans
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "paycheck_plans_update_own" ON public.paycheck_plans
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "paycheck_plans_delete_own" ON public.paycheck_plans
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- 4. Debt Scenarios (debt payoff strategy comparison)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.debt_scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  strategy TEXT NOT NULL,
  extra_payment_minor INTEGER NOT NULL DEFAULT 0,
  config JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_debt_scenarios_user_id ON public.debt_scenarios(user_id);

ALTER TABLE public.debt_scenarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "debt_scenarios_select_own" ON public.debt_scenarios
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "debt_scenarios_insert_own" ON public.debt_scenarios
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "debt_scenarios_update_own" ON public.debt_scenarios
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "debt_scenarios_delete_own" ON public.debt_scenarios
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
