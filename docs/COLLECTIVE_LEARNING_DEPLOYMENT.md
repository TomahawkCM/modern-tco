# Collective Learning System - Deployment Guide

## 📋 Overview

This guide covers deploying the collective learning database tables to your Supabase project.

## 🗄️ Database Tables

The collective learning system uses 4 tables:

1. **`merchants`** (existing) - Merchant normalization and categorization
2. **`merchant_feedback`** (existing) - User corrections for learning
3. **`category_patterns`** (new) - Description-based category learning
4. **`bank_formats`** (new) - CSV column mapping learning

## 🚀 Deployment Steps

### Option 1: Supabase Dashboard (Recommended)

1. **Open Supabase SQL Editor**
   - Go to: https://supabase.com/dashboard/project/qnwcwoutgarhqxlgsjzs/sql
   - Or navigate to: Dashboard → SQL Editor → New Query

2. **Copy Migration Content**
   - Open: `supabase/migrations/20251116000001_create_collective_learning_tables.sql`
   - Copy entire file contents

3. **Execute Migration**
   - Paste into SQL Editor
   - Click "Run" button
   - Wait for completion (~2-3 seconds)

4. **Verify Success**
   - Run verification script: `scripts/verify-collective-learning-tables.sql`
   - Should see 4 tables with proper structure
   - RLS policies should be enabled

### Option 2: Supabase CLI (If Configured)

```bash
# Link to project (if not already linked)
supabase link --project-ref qnwcwoutgarhqxlgsjzs

# Push migration
supabase db push

# Verify
supabase db diff
```

## ✅ Verification Checklist

After deployment, verify:

- [ ] **Tables Created**: 4 tables exist (`category_patterns`, `bank_formats`, `merchants`, `merchant_feedback`)
- [ ] **RLS Enabled**: All tables have Row Level Security policies
- [ ] **Functions Created**: 3 helper functions exist
- [ ] **Indexes Created**: Performance indexes on key columns
- [ ] **Triggers Working**: Auto-update timestamps work

### Quick Verification Query

```sql
-- Run this to verify everything is working
SELECT
  table_name,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = t.table_name) as policy_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_name IN ('category_patterns', 'bank_formats', 'merchants', 'merchant_feedback')
ORDER BY table_name;
```

Expected output:

```
table_name          | policy_count
--------------------+-------------
bank_formats        | 2
category_patterns   | 2
merchant_feedback   | 3
merchants           | 2
```

## 🧪 Testing the System

### 1. Test Category Pattern Lookup

```sql
-- Insert test pattern
INSERT INTO public.category_patterns (
  description_pattern,
  pattern_type,
  category,
  subcategory,
  confidence,
  usage_count,
  success_count
) VALUES (
  'NETFLIX%',
  'starts_with',
  'Entertainment',
  'Streaming Services',
  0.98,
  85,
  83
);

-- Verify it can be retrieved
SELECT * FROM public.category_patterns WHERE description_pattern = 'NETFLIX%';
```

### 2. Test Bank Format Learning

```sql
-- Insert test bank format
INSERT INTO public.bank_formats (
  bank_name,
  bank_slug,
  column_mappings,
  date_format,
  confidence,
  successful_imports
) VALUES (
  'Chase Bank',
  'chase-bank',
  '{"date": "Posting Date", "description": "Description", "amount": "Amount"}'::jsonb,
  'MM/DD/YYYY',
  0.92,
  33
);

-- Verify retrieval
SELECT * FROM public.bank_formats WHERE bank_slug = 'chase-bank';
```

### 3. Test Application Integration

1. **Import a CSV file** through the Budget App
2. **Check browser console** for logs:
   ```
   [CollectiveLearning] Learning from X transactions
   [CollectiveLearning] Learning complete
   ```
3. **Verify database** has new entries:
   ```sql
   SELECT COUNT(*) FROM merchants;
   SELECT COUNT(*) FROM category_patterns;
   SELECT COUNT(*) FROM bank_formats;
   ```

## 🔒 Security Verification

Verify RLS policies are working:

```sql
-- As authenticated user, should be able to read
SET LOCAL ROLE authenticated;
SELECT COUNT(*) FROM merchants;
SELECT COUNT(*) FROM category_patterns;
SELECT COUNT(*) FROM bank_formats;

-- As authenticated user, should NOT be able to write
-- (should fail with permission error)
INSERT INTO merchants (merchant_token, canonical_name, default_category)
VALUES ('TEST', 'Test Merchant', 'Test');
```

## 📊 Monitoring

After deployment, monitor:

1. **Learning Effectiveness**

   ```sql
   -- Track confidence growth over time
   SELECT
     DATE_TRUNC('day', created_at) as date,
     AVG(confidence) as avg_confidence,
     COUNT(*) as pattern_count
   FROM category_patterns
   GROUP BY DATE_TRUNC('day', created_at)
   ORDER BY date DESC
   LIMIT 7;
   ```

2. **Usage Statistics**

   ```sql
   -- Most commonly learned merchants
   SELECT
     canonical_name,
     default_category,
     classification_count,
     confidence
   FROM merchants
   ORDER BY classification_count DESC
   LIMIT 10;
   ```

3. **Bank Format Success Rates**
   ```sql
   -- Bank formats with highest success rates
   SELECT
     bank_name,
     successful_imports,
     failed_imports,
     confidence,
     ROUND(successful_imports::numeric / NULLIF(successful_imports + failed_imports, 0) * 100, 1) as success_rate
   FROM bank_formats
   ORDER BY successful_imports DESC;
   ```

## 🐛 Troubleshooting

### "Table already exists" Error

The migration is idempotent - it uses `IF NOT EXISTS` clauses. If you see this error, tables are already created.

### "Permission denied" Errors

- Verify you're logged in to Supabase Dashboard as owner/admin
- Check RLS policies are correctly configured
- Verify service_role key is set in environment variables

### Functions Not Working

```sql
-- Check if functions exist
SELECT routine_name, routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE '%merchant%' OR routine_name LIKE '%category%' OR routine_name LIKE '%bank%';
```

## 📈 Performance Optimization

After deployment and initial data accumulation:

1. **Analyze Tables**

   ```sql
   ANALYZE public.category_patterns;
   ANALYZE public.bank_formats;
   ANALYZE public.merchants;
   ```

2. **Check Index Usage**
   ```sql
   SELECT
     schemaname,
     tablename,
     indexname,
     idx_scan,
     idx_tup_read,
     idx_tup_fetch
   FROM pg_stat_user_indexes
   WHERE tablename IN ('category_patterns', 'bank_formats', 'merchants')
   ORDER BY idx_scan DESC;
   ```

## 🎯 Success Criteria

Deployment is successful when:

- ✅ All 4 tables exist
- ✅ All RLS policies are active
- ✅ Helper functions work correctly
- ✅ Test inserts succeed
- ✅ Application can query and write data
- ✅ Console logs show "[CollectiveLearning]" messages
- ✅ Database grows with each import

## 📚 Additional Resources

- Migration File: `supabase/migrations/20251116000001_create_collective_learning_tables.sql`
- Service Layer: `src/lib/collective-learning-service.ts`
- Verification Script: `scripts/verify-collective-learning-tables.sql`
- Main Documentation: `docs/COLLECTIVE_LEARNING_DEPLOYMENT.md` (this file)
