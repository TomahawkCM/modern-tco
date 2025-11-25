-- ============================================================================
-- Collective Learning System - Additional Tables
-- Migration: 20251116000001_create_collective_learning_tables.sql
--
-- Adds category pattern learning and bank format learning tables to
-- complement the existing merchants table for full collective intelligence.
--
-- Architecture:
--   - category_patterns: Description-based category learning
--   - bank_formats: CSV column mapping learning
--   - Integrates with existing merchants table
--
-- Privacy: Only patterns and statistics, no raw transaction data
-- ============================================================================

-- ============================================================================
-- CATEGORY PATTERNS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.category_patterns (
  -- Primary key
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Pattern identification
  description_pattern TEXT NOT NULL,  -- e.g., "STARBUCKS%", "AMZ*%"
  pattern_type TEXT NOT NULL DEFAULT 'contains',  -- 'contains', 'starts_with', 'ends_with', 'regex'

  -- Category classification
  category TEXT NOT NULL,
  subcategory TEXT,

  -- Learning metrics
  confidence DECIMAL(5,4) DEFAULT 0.5000,  -- 0.0000 to 1.0000
  usage_count INTEGER DEFAULT 1,           -- How many times pattern was matched
  success_count INTEGER DEFAULT 0,         -- Users who kept the suggestion
  rejection_count INTEGER DEFAULT 0,       -- Users who changed it

  -- Source tracking
  source TEXT DEFAULT 'user',  -- 'user', 'ai', 'rule', 'admin'

  -- Timestamps
  first_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT category_patterns_confidence_valid CHECK (confidence >= 0.0 AND confidence <= 1.0),
  CONSTRAINT category_patterns_usage_count_valid CHECK (usage_count >= 0),
  CONSTRAINT category_patterns_success_count_valid CHECK (success_count >= 0),
  CONSTRAINT category_patterns_rejection_count_valid CHECK (rejection_count >= 0),
  CONSTRAINT category_patterns_pattern_not_empty CHECK (char_length(description_pattern) > 0),
  CONSTRAINT category_patterns_category_not_empty CHECK (char_length(category) > 0)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_category_patterns_description ON public.category_patterns(description_pattern);
CREATE INDEX IF NOT EXISTS idx_category_patterns_category ON public.category_patterns(category);
CREATE INDEX IF NOT EXISTS idx_category_patterns_confidence ON public.category_patterns(confidence DESC);
CREATE INDEX IF NOT EXISTS idx_category_patterns_usage_count ON public.category_patterns(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_category_patterns_last_seen ON public.category_patterns(last_seen DESC);

-- Full-text search for pattern matching
CREATE INDEX IF NOT EXISTS idx_category_patterns_pattern_trgm
  ON public.category_patterns USING gin(description_pattern gin_trgm_ops);

-- Comment
COMMENT ON TABLE public.category_patterns IS 'Global category learning patterns. Stores description-based categorization rules learned from user behavior.';

-- ============================================================================
-- BANK FORMATS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.bank_formats (
  -- Primary key
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Bank identification
  bank_name TEXT NOT NULL,
  bank_slug TEXT NOT NULL UNIQUE,  -- lowercase, no spaces (e.g., "td-canada-trust")

  -- Column mappings (JSON object)
  column_mappings JSONB NOT NULL,  -- {"date": "Transaction Date", "amount": "Amount", ...}

  -- Format metadata
  date_format TEXT,                 -- e.g., "MM/DD/YYYY", "YYYY-MM-DD"
  has_header_row BOOLEAN DEFAULT true,
  amount_format TEXT DEFAULT 'single',  -- 'single', 'debit_credit', 'signed'

  -- Learning metrics
  confidence DECIMAL(5,4) DEFAULT 0.5000,
  successful_imports INTEGER DEFAULT 1,
  failed_imports INTEGER DEFAULT 0,
  last_successful_import TIMESTAMP WITH TIME ZONE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT bank_formats_confidence_valid CHECK (confidence >= 0.0 AND confidence <= 1.0),
  CONSTRAINT bank_formats_successful_imports_valid CHECK (successful_imports >= 0),
  CONSTRAINT bank_formats_failed_imports_valid CHECK (failed_imports >= 0),
  CONSTRAINT bank_formats_bank_name_not_empty CHECK (char_length(bank_name) > 0),
  CONSTRAINT bank_formats_bank_slug_not_empty CHECK (char_length(bank_slug) > 0)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bank_formats_bank_name ON public.bank_formats(bank_name);
CREATE INDEX IF NOT EXISTS idx_bank_formats_bank_slug ON public.bank_formats(bank_slug);
CREATE INDEX IF NOT EXISTS idx_bank_formats_confidence ON public.bank_formats(confidence DESC);

-- Comment
COMMENT ON TABLE public.bank_formats IS 'Global bank format configurations. Stores CSV column mappings learned from successful imports.';

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE public.category_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_formats ENABLE ROW LEVEL SECURITY;

-- Category patterns: Read-only for authenticated users, service role for writes
CREATE POLICY "Allow authenticated users to read category patterns"
  ON public.category_patterns
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow service role to manage category patterns"
  ON public.category_patterns
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Bank formats: Read-only for authenticated users, service role for writes
CREATE POLICY "Allow authenticated users to read bank formats"
  ON public.bank_formats
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow service role to manage bank formats"
  ON public.bank_formats
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at for category_patterns
CREATE OR REPLACE FUNCTION update_category_patterns_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_category_patterns_updated_at
  BEFORE UPDATE ON public.category_patterns
  FOR EACH ROW
  EXECUTE FUNCTION update_category_patterns_updated_at();

-- Auto-update updated_at for bank_formats
CREATE OR REPLACE FUNCTION update_bank_formats_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_bank_formats_updated_at
  BEFORE UPDATE ON public.bank_formats
  FOR EACH ROW
  EXECUTE FUNCTION update_bank_formats_updated_at();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Update category pattern confidence based on user feedback
CREATE OR REPLACE FUNCTION update_category_pattern_feedback(
  p_pattern_id UUID,
  p_accepted BOOLEAN
)
RETURNS void AS $$
BEGIN
  UPDATE public.category_patterns
  SET
    usage_count = usage_count + 1,
    success_count = success_count + CASE WHEN p_accepted THEN 1 ELSE 0 END,
    rejection_count = rejection_count + CASE WHEN NOT p_accepted THEN 1 ELSE 0 END,
    confidence = CASE
      WHEN (success_count + CASE WHEN p_accepted THEN 1 ELSE 0 END +
            rejection_count + CASE WHEN NOT p_accepted THEN 1 ELSE 0 END) = 0 THEN 0.5
      ELSE (
        (success_count + CASE WHEN p_accepted THEN 1 ELSE 0 END)::decimal /
        (success_count + CASE WHEN p_accepted THEN 1 ELSE 0 END +
         rejection_count + CASE WHEN NOT p_accepted THEN 1 ELSE 0 END)
      ) * 0.7 + LEAST((usage_count + 1)::decimal / 100.0, 1.0) * 0.3
    END,
    last_seen = NOW()
  WHERE id = p_pattern_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update bank format success/failure
CREATE OR REPLACE FUNCTION update_bank_format_result(
  p_bank_slug TEXT,
  p_success BOOLEAN
)
RETURNS void AS $$
BEGIN
  UPDATE public.bank_formats
  SET
    successful_imports = successful_imports + CASE WHEN p_success THEN 1 ELSE 0 END,
    failed_imports = failed_imports + CASE WHEN NOT p_success THEN 1 ELSE 0 END,
    confidence = CASE
      WHEN (successful_imports + CASE WHEN p_success THEN 1 ELSE 0 END +
            failed_imports + CASE WHEN NOT p_success THEN 1 ELSE 0 END) = 0 THEN 0.5
      ELSE (
        (successful_imports + CASE WHEN p_success THEN 1 ELSE 0 END)::decimal /
        (successful_imports + CASE WHEN p_success THEN 1 ELSE 0 END +
         failed_imports + CASE WHEN NOT p_success THEN 1 ELSE 0 END)
      )
    END,
    last_successful_import = CASE WHEN p_success THEN NOW() ELSE last_successful_import END
  WHERE bank_slug = p_bank_slug;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION update_category_pattern_feedback TO authenticated;
GRANT EXECUTE ON FUNCTION update_category_pattern_feedback TO service_role;
GRANT EXECUTE ON FUNCTION update_bank_format_result TO authenticated;
GRANT EXECUTE ON FUNCTION update_bank_format_result TO service_role;

-- ============================================================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================================================

-- Uncomment to insert sample category patterns
-- INSERT INTO public.category_patterns (description_pattern, pattern_type, category, subcategory, confidence, usage_count, success_count)
-- VALUES
--   ('STARBUCKS%', 'starts_with', 'Food & Dining', 'Coffee Shops', 0.95, 120, 114),
--   ('NETFLIX%', 'starts_with', 'Entertainment', 'Streaming Services', 0.98, 85, 83),
--   ('%PHARMACY%', 'contains', 'Healthcare', 'Pharmacy', 0.87, 45, 39);

-- Uncomment to insert sample bank formats
-- INSERT INTO public.bank_formats (bank_name, bank_slug, column_mappings, date_format, confidence, successful_imports)
-- VALUES
--   ('TD Canada Trust', 'td-canada-trust',
--    '{"date": "Date", "description": "Description", "amount": "Amount"}'::jsonb,
--    'MM/DD/YYYY', 0.95, 47),
--   ('Chase Bank', 'chase-bank',
--    '{"date": "Posting Date", "description": "Description", "amount": "Amount", "balance": "Balance"}'::jsonb,
--    'MM/DD/YYYY', 0.92, 33);

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
