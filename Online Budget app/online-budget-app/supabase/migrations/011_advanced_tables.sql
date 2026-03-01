-- Migration: 011_advanced_tables
-- Phase 6: Advanced feature tables
-- 6 tables with RLS policies + Supabase Storage bucket
--
-- Table order respects FK dependencies:
-- 1. financial_scenarios (deps: users)
-- 2. event_budgets (deps: users)
-- 3. event_budget_items (deps: event_budgets)
-- 4. split_persons (deps: users)
-- 5. expense_splits (deps: users, transactions, split_persons)
-- 6. receipts (deps: users, transactions)

-- ============================================================
-- 1. Financial Scenarios (what-if projections)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.financial_scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  config JSONB NOT NULL DEFAULT '{}',
  results JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_financial_scenarios_user_id ON public.financial_scenarios(user_id);

ALTER TABLE public.financial_scenarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "financial_scenarios_select_own" ON public.financial_scenarios
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "financial_scenarios_insert_own" ON public.financial_scenarios
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "financial_scenarios_update_own" ON public.financial_scenarios
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "financial_scenarios_delete_own" ON public.financial_scenarios
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- 2. Event Budgets (one-off event budgets: wedding, vacation, etc.)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.event_budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  total_budget_minor INTEGER NOT NULL,
  start_date DATE,
  end_date DATE,
  currency TEXT NOT NULL DEFAULT 'USD',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_event_budgets_user_id ON public.event_budgets(user_id);

ALTER TABLE public.event_budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "event_budgets_select_own" ON public.event_budgets
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "event_budgets_insert_own" ON public.event_budgets
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "event_budgets_update_own" ON public.event_budgets
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "event_budgets_delete_own" ON public.event_budgets
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- 3. Event Budget Items (line items within an event budget)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.event_budget_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_budget_id UUID NOT NULL REFERENCES public.event_budgets(id) ON DELETE CASCADE,
  category_name TEXT NOT NULL,
  budget_minor INTEGER NOT NULL,
  spent_minor INTEGER NOT NULL DEFAULT 0,
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_event_budget_items_event_budget_id ON public.event_budget_items(event_budget_id);

ALTER TABLE public.event_budget_items ENABLE ROW LEVEL SECURITY;

-- event_budget_items policies join through event_budgets to check user_id
CREATE POLICY "event_budget_items_select_own" ON public.event_budget_items
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.event_budgets eb
    WHERE eb.id = event_budget_items.event_budget_id
      AND eb.user_id = auth.uid()
  ));

CREATE POLICY "event_budget_items_insert_own" ON public.event_budget_items
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.event_budgets eb
    WHERE eb.id = event_budget_items.event_budget_id
      AND eb.user_id = auth.uid()
  ));

CREATE POLICY "event_budget_items_update_own" ON public.event_budget_items
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.event_budgets eb
    WHERE eb.id = event_budget_items.event_budget_id
      AND eb.user_id = auth.uid()
  ));

CREATE POLICY "event_budget_items_delete_own" ON public.event_budget_items
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.event_budgets eb
    WHERE eb.id = event_budget_items.event_budget_id
      AND eb.user_id = auth.uid()
  ));

-- ============================================================
-- 4. Split Persons (people you split expenses with)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.split_persons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_split_persons_user_id ON public.split_persons(user_id);

ALTER TABLE public.split_persons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "split_persons_select_own" ON public.split_persons
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "split_persons_insert_own" ON public.split_persons
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "split_persons_update_own" ON public.split_persons
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "split_persons_delete_own" ON public.split_persons
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- 5. Expense Splits (shared expense tracking)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.expense_splits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
  person_id UUID NOT NULL REFERENCES public.split_persons(id) ON DELETE CASCADE,
  amount_minor INTEGER NOT NULL,
  is_settled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_expense_splits_user_id ON public.expense_splits(user_id);
CREATE INDEX IF NOT EXISTS idx_expense_splits_person_id ON public.expense_splits(person_id);
CREATE INDEX IF NOT EXISTS idx_expense_splits_transaction_id ON public.expense_splits(transaction_id);

ALTER TABLE public.expense_splits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "expense_splits_select_own" ON public.expense_splits
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "expense_splits_insert_own" ON public.expense_splits
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "expense_splits_update_own" ON public.expense_splits
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "expense_splits_delete_own" ON public.expense_splits
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- 6. Receipts (receipt image storage + OCR data)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
  storage_path TEXT NOT NULL,
  extracted_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_receipts_user_id ON public.receipts(user_id);
CREATE INDEX IF NOT EXISTS idx_receipts_transaction_id ON public.receipts(transaction_id);

ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "receipts_select_own" ON public.receipts
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "receipts_insert_own" ON public.receipts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "receipts_update_own" ON public.receipts
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "receipts_delete_own" ON public.receipts
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- 7. Supabase Storage: receipt-images bucket
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipt-images', 'receipt-images', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: authenticated users can manage their own receipt files
-- Files are stored under the user's UUID folder: {user_id}/{filename}
CREATE POLICY "receipt_images_select_own" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'receipt-images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "receipt_images_insert_own" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'receipt-images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "receipt_images_update_own" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'receipt-images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "receipt_images_delete_own" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'receipt-images' AND (storage.foldername(name))[1] = auth.uid()::text);
