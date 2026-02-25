-- Migration 006: Budgets table
-- Depends on: 003 (categories table), 001 (users table)
--
-- Monthly category budgets. User sets a spending limit per category
-- per month. Engine computes progress (no financial math in DB).

CREATE TABLE IF NOT EXISTS public.budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  amount_minor BIGINT NOT NULL CHECK (amount_minor > 0),
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  period VARCHAR(10) NOT NULL DEFAULT 'monthly' CHECK (period IN ('monthly')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, category_id, period)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON public.budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_category_id ON public.budgets(category_id);

-- RLS
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY budgets_select ON public.budgets
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY budgets_insert ON public.budgets
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY budgets_update ON public.budgets
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY budgets_delete ON public.budgets
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Updated_at trigger
CREATE TRIGGER budgets_updated_at
  BEFORE UPDATE ON public.budgets
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();
