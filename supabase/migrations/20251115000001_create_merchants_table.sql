-- ============================================================================
-- Merchant Intelligence & OpenAI Categorization - Database Schema
-- Migration: 20251115000001_create_merchants_table.sql
--
-- Creates the merchant catalog and feedback tables for the Budget App
-- merchant intelligence system. Stores merchant-level metadata (no raw
-- transaction data) for privacy-preserving classification.
--
-- Architecture:
--   - merchants: Global merchant catalog keyed by merchant_token
--   - merchant_feedback: User corrections and confirmations for learning
--
-- Privacy: Only merchant tokens and aggregate statistics, never raw PII
-- ============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- ENUMS
-- ============================================================================

-- Source of merchant classification
CREATE TYPE merchant_source AS ENUM (
  'openai',    -- Classified by OpenAI API
  'user',      -- User-defined/corrected
  'rule',      -- Rule-based classification
  'mixed'      -- Combination of sources
);

-- Business type classification
CREATE TYPE business_type AS ENUM (
  'saas',           -- Software as a Service
  'retail',         -- Retail stores
  'restaurant',     -- Restaurants and cafes
  'grocery',        -- Grocery stores
  'utility',        -- Utilities (gas, electric, water)
  'insurance',      -- Insurance providers
  'subscription',   -- Subscription services
  'entertainment',  -- Entertainment venues
  'healthcare',     -- Healthcare providers
  'transportation', -- Transportation services
  'other'           -- Other business types
);

-- ============================================================================
-- MERCHANTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.merchants (
  -- Primary key
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

  -- Merchant identification (UNIQUE key for lookups)
  merchant_token TEXT NOT NULL UNIQUE,
  canonical_name TEXT NOT NULL,

  -- Classification metadata
  default_category TEXT NOT NULL,
  default_subcategory TEXT,
  business_type business_type DEFAULT 'other',
  is_subscription BOOLEAN DEFAULT false,

  -- Confidence and source tracking
  confidence DECIMAL(5,4) DEFAULT 0.0000,  -- 0.0000 to 1.0000
  source merchant_source NOT NULL DEFAULT 'openai',
  explanation TEXT,  -- Human-readable reason for classification

  -- Learning and feedback counters
  classification_count INTEGER DEFAULT 1,    -- How many times this merchant has been classified
  user_agreement_count INTEGER DEFAULT 0,    -- How many users accepted this classification
  user_correction_count INTEGER DEFAULT 0,   -- How many users corrected this classification

  -- Timestamps
  first_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT merchants_merchant_token_not_empty CHECK (char_length(merchant_token) > 0),
  CONSTRAINT merchants_canonical_name_not_empty CHECK (char_length(canonical_name) > 0),
  CONSTRAINT merchants_confidence_valid CHECK (confidence >= 0.0 AND confidence <= 1.0),
  CONSTRAINT merchants_classification_count_valid CHECK (classification_count >= 0),
  CONSTRAINT merchants_user_agreement_count_valid CHECK (user_agreement_count >= 0),
  CONSTRAINT merchants_user_correction_count_valid CHECK (user_correction_count >= 0)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_merchants_merchant_token ON public.merchants(merchant_token);
CREATE INDEX IF NOT EXISTS idx_merchants_canonical_name ON public.merchants(canonical_name);
CREATE INDEX IF NOT EXISTS idx_merchants_category ON public.merchants(default_category);
CREATE INDEX IF NOT EXISTS idx_merchants_source ON public.merchants(source);
CREATE INDEX IF NOT EXISTS idx_merchants_is_subscription ON public.merchants(is_subscription);
CREATE INDEX IF NOT EXISTS idx_merchants_last_seen_at ON public.merchants(last_seen_at DESC);

-- Full-text search index for merchant names
CREATE INDEX IF NOT EXISTS idx_merchants_canonical_name_trgm ON public.merchants USING gin(canonical_name gin_trgm_ops);

-- Comment on table
COMMENT ON TABLE public.merchants IS 'Global merchant catalog for Budget App. Stores merchant-level classification metadata (no raw transaction data). Keyed by merchant_token for privacy-preserving lookups.';

-- ============================================================================
-- MERCHANT_FEEDBACK TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.merchant_feedback (
  -- Primary key
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

  -- Foreign key to merchants
  merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,

  -- User/tenant identification (hashed for privacy)
  user_or_tenant_key TEXT NOT NULL,  -- Hashed user ID or tenant ID

  -- Feedback data
  chosen_category TEXT NOT NULL,
  chosen_subcategory TEXT,
  previous_category TEXT,
  previous_subcategory TEXT,
  accepted_suggestion BOOLEAN NOT NULL,  -- true if user accepted AI suggestion, false if corrected

  -- Context
  country TEXT,  -- ISO country code (e.g., "CA", "US")

  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT merchant_feedback_user_key_not_empty CHECK (char_length(user_or_tenant_key) > 0),
  CONSTRAINT merchant_feedback_chosen_category_not_empty CHECK (char_length(chosen_category) > 0),
  CONSTRAINT merchant_feedback_country_format CHECK (country IS NULL OR char_length(country) = 2)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_merchant_feedback_merchant_id ON public.merchant_feedback(merchant_id);
CREATE INDEX IF NOT EXISTS idx_merchant_feedback_user_key ON public.merchant_feedback(user_or_tenant_key);
CREATE INDEX IF NOT EXISTS idx_merchant_feedback_created_at ON public.merchant_feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_merchant_feedback_accepted ON public.merchant_feedback(accepted_suggestion);

-- Comment on table
COMMENT ON TABLE public.merchant_feedback IS 'User feedback on merchant classifications. Tracks corrections and confirmations for continuous learning. Uses hashed user keys for privacy.';

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on both tables
ALTER TABLE public.merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merchant_feedback ENABLE ROW LEVEL SECURITY;

-- Merchants table: Allow all authenticated users to read, only service role to write
CREATE POLICY "Allow authenticated users to read merchants"
  ON public.merchants
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow service role to manage merchants"
  ON public.merchants
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Merchant feedback: Allow users to insert their own feedback, read their own, service role for all
CREATE POLICY "Allow authenticated users to insert merchant feedback"
  ON public.merchant_feedback
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow users to read their own feedback"
  ON public.merchant_feedback
  FOR SELECT
  TO authenticated
  USING (user_or_tenant_key = auth.uid()::text OR user_or_tenant_key = md5(auth.uid()::text));

CREATE POLICY "Allow service role to manage merchant feedback"
  ON public.merchant_feedback
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp on merchants table
CREATE OR REPLACE FUNCTION update_merchants_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_merchants_updated_at
  BEFORE UPDATE ON public.merchants
  FOR EACH ROW
  EXECUTE FUNCTION update_merchants_updated_at();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to increment merchant counters (called by application code)
CREATE OR REPLACE FUNCTION increment_merchant_counters(
  p_merchant_id UUID,
  p_increment_classification BOOLEAN DEFAULT true,
  p_increment_agreement BOOLEAN DEFAULT false,
  p_increment_correction BOOLEAN DEFAULT false
)
RETURNS void AS $$
BEGIN
  UPDATE public.merchants
  SET
    classification_count = classification_count + CASE WHEN p_increment_classification THEN 1 ELSE 0 END,
    user_agreement_count = user_agreement_count + CASE WHEN p_increment_agreement THEN 1 ELSE 0 END,
    user_correction_count = user_correction_count + CASE WHEN p_increment_correction THEN 1 ELSE 0 END,
    last_seen_at = NOW()
  WHERE id = p_merchant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION increment_merchant_counters TO authenticated;
GRANT EXECUTE ON FUNCTION increment_merchant_counters TO service_role;

-- ============================================================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================================================

-- Uncomment to insert sample merchants for testing
-- INSERT INTO public.merchants (merchant_token, canonical_name, default_category, default_subcategory, business_type, is_subscription, confidence, source, explanation)
-- VALUES
--   ('OPENAI', 'OpenAI', 'AI & Developer Tools', 'Subscriptions', 'saas', true, 0.96, 'openai', 'OpenAI provides AI APIs and ChatGPT subscriptions.'),
--   ('NETFLIX', 'Netflix', 'Entertainment', 'Streaming Services', 'subscription', true, 0.98, 'openai', 'Netflix is a streaming entertainment service.'),
--   ('SKIPTHEDISHES', 'SkipTheDishes', 'Food & Dining', 'Delivery', 'retail', false, 0.94, 'openai', 'SkipTheDishes is a food delivery service.');

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
