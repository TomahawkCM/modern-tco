-- ============================================================================
-- Verification Script for Collective Learning Tables
-- Run this in the Supabase SQL Editor to verify tables were created
-- ============================================================================

-- Check if tables exist
SELECT
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('category_patterns', 'bank_formats', 'merchants', 'merchant_feedback')
ORDER BY table_name;

-- Check category_patterns structure
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'category_patterns'
ORDER BY ordinal_position;

-- Check bank_formats structure
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'bank_formats'
ORDER BY ordinal_position;

-- Check RLS policies
SELECT
  tablename,
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE tablename IN ('category_patterns', 'bank_formats', 'merchants', 'merchant_feedback')
ORDER BY tablename, policyname;

-- Check helper functions exist
SELECT
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'update_category_pattern_feedback',
    'update_bank_format_result',
    'increment_merchant_counters'
  )
ORDER BY routine_name;

-- Quick test: Insert sample data
BEGIN;

-- Insert sample category pattern
INSERT INTO public.category_patterns (
  description_pattern,
  pattern_type,
  category,
  subcategory,
  confidence,
  usage_count,
  success_count
) VALUES (
  'STARBUCKS%',
  'starts_with',
  'Food & Dining',
  'Coffee Shops',
  0.95,
  120,
  114
) ON CONFLICT DO NOTHING;

-- Insert sample bank format
INSERT INTO public.bank_formats (
  bank_name,
  bank_slug,
  column_mappings,
  date_format,
  has_header_row,
  amount_format,
  confidence,
  successful_imports
) VALUES (
  'TD Canada Trust',
  'td-canada-trust',
  '{"date": "Date", "description": "Description", "amount": "Amount"}'::jsonb,
  'MM/DD/YYYY',
  true,
  'single',
  0.95,
  47
) ON CONFLICT (bank_slug) DO NOTHING;

-- Verify inserts
SELECT 'Category Patterns' as table_name, COUNT(*) as row_count FROM public.category_patterns
UNION ALL
SELECT 'Bank Formats', COUNT(*) FROM public.bank_formats
UNION ALL
SELECT 'Merchants', COUNT(*) FROM public.merchants
UNION ALL
SELECT 'Merchant Feedback', COUNT(*) FROM public.merchant_feedback;

ROLLBACK; -- Don't actually commit test data

-- ============================================================================
-- Expected Output:
-- ============================================================================
-- 1. Four tables should exist (category_patterns, bank_formats, merchants, merchant_feedback)
-- 2. Each table should have proper columns with correct types
-- 3. RLS policies should be enabled on all tables
-- 4. Helper functions should exist
-- 5. Sample insert should succeed (then rollback)
-- ============================================================================
