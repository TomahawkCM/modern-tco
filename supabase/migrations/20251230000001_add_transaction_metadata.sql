-- Migration: Add transaction source metadata columns
-- Task 12: Minimal Transaction Source Metadata (No Bank Sync)
-- Created: 2025-12-30

-- Create transactions table if it doesn't exist yet
-- (Budget App may not have created this table in Supabase yet)
CREATE TABLE IF NOT EXISTS public.transactions (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id TEXT,
  date TIMESTAMPTZ NOT NULL,
  category TEXT,
  subcategory TEXT,
  amount NUMERIC NOT NULL,
  description TEXT,
  notes TEXT,
  merchant TEXT,

  -- Split transaction fields (Phase 6)
  split_from_id TEXT,
  is_split BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add transaction source metadata columns (if they don't exist)
-- These prepare the app for subscription upgrade features

-- Source: Where the transaction came from
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'transactions'
    AND column_name = 'source'
  ) THEN
    ALTER TABLE public.transactions
    ADD COLUMN source TEXT CHECK (source IN ('manual', 'import', 'scan', 'sync')) DEFAULT 'manual';
  END IF;
END $$;

-- Source ID: Reference to the import batch, file, or sync session
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'transactions'
    AND column_name = 'source_id'
  ) THEN
    ALTER TABLE public.transactions
    ADD COLUMN source_id TEXT;
  END IF;
END $$;

-- Confidence: ML/AI confidence score for categorization (0.0 to 1.0)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'transactions'
    AND column_name = 'confidence'
  ) THEN
    ALTER TABLE public.transactions
    ADD COLUMN confidence NUMERIC CHECK (confidence >= 0 AND confidence <= 1);
  END IF;
END $$;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id
  ON public.transactions(user_id);

CREATE INDEX IF NOT EXISTS idx_transactions_date
  ON public.transactions(date);

CREATE INDEX IF NOT EXISTS idx_transactions_source
  ON public.transactions(source);

CREATE INDEX IF NOT EXISTS idx_transactions_account_id
  ON public.transactions(account_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only read their own transactions
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
CREATE POLICY "Users can view own transactions"
  ON public.transactions
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own transactions
DROP POLICY IF EXISTS "Users can insert own transactions" ON public.transactions;
CREATE POLICY "Users can insert own transactions"
  ON public.transactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own transactions
DROP POLICY IF EXISTS "Users can update own transactions" ON public.transactions;
CREATE POLICY "Users can update own transactions"
  ON public.transactions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can delete their own transactions
DROP POLICY IF EXISTS "Users can delete own transactions" ON public.transactions;
CREATE POLICY "Users can delete own transactions"
  ON public.transactions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function on update
DROP TRIGGER IF EXISTS trigger_update_transactions_updated_at
  ON public.transactions;

CREATE TRIGGER trigger_update_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_transactions_updated_at();

-- Add helpful comments
COMMENT ON TABLE public.transactions IS 'Budget App transactions with source metadata for subscription upgrade readiness';
COMMENT ON COLUMN public.transactions.source IS 'Transaction source: manual (user entered), import (CSV/file), scan (receipt OCR), sync (bank connection)';
COMMENT ON COLUMN public.transactions.source_id IS 'Reference to import batch ID, file name, or sync session identifier';
COMMENT ON COLUMN public.transactions.confidence IS 'AI/ML confidence score for auto-categorization (0.0 to 1.0)';
