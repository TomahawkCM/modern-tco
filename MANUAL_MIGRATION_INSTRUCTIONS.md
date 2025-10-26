# Manual Migration Instructions for Phase 2

**Status**: Alternative deployment method (if automated push fails)
**Date**: 2025-01-03

---

## Background

The automated `npx supabase db push` command encountered connectivity issues with the Supabase production database. This document provides manual instructions to apply Phase 2 migrations via the Supabase web dashboard SQL editor.

---

## Migrations to Apply

Apply these three migration files in sequence:

### 1. Flashcards System (20251002000001)
**File**: `supabase/migrations/20251002000001_add_flashcards_system.sql`
**Size**: 11,350 bytes
**Purpose**: Core flashcard spaced repetition system

### 2. Question Reviews (20251002000002)
**File**: `supabase/migrations/20251002000002_add_question_reviews.sql`
**Size**: 15,422 bytes
**Purpose**: Question spaced repetition and review sessions

### 3. Performance Optimizations (20251003000001)
**File**: `supabase/migrations/20251003000001_performance_optimizations.sql`
**Size**: 9,811 bytes
**Purpose**: Materialized views and database indexes

---

## Manual Migration Steps

### Step 1: Access Supabase SQL Editor

1. Open browser and navigate to: https://supabase.com/dashboard/project/qnwcwoutgarhqxlgsjzs
2. Click on "SQL Editor" in the left sidebar
3. Click "+ New query" to create a new SQL query

### Step 2: Apply Migration 1 (Flashcards System)

```bash
# From your terminal, copy the SQL:
cat supabase/migrations/20251002000001_add_flashcards_system.sql
```

1. Copy the entire contents of the file
2. Paste into the SQL Editor
3. Click "Run" or press Ctrl/Cmd + Enter
4. Verify success (should see "Success. No rows returned")

**Expected Tables Created**:
- `public.flashcards`
- `public.flashcard_reviews`

### Step 3: Apply Migration 2 (Question Reviews)

```bash
# Copy the SQL:
cat supabase/migrations/20251002000002_add_question_reviews.sql
```

1. Clear the SQL Editor (or create new query)
2. Paste the migration SQL
3. Click "Run"
4. Verify success

**Expected Tables Created**:
- `public.question_reviews`
- `public.review_sessions`
- `public.question_review_attempts`

**Expected Functions Created**:
- `get_review_stats(user_id UUID)`
- `calculate_review_streak(user_id UUID)`
- `get_unified_review_queue(user_id UUID, limit_count INT)`

### Step 4: Apply Migration 3 (Performance Optimizations)

```bash
# Copy the SQL:
cat supabase/migrations/20251003000001_performance_optimizations.sql
```

1. Clear the SQL Editor
2. Paste the migration SQL
3. Click "Run"
4. Verify success

**Expected Objects Created**:
- Materialized view: `mv_unified_review_queue`
- Table: `mv_refresh_log`
- Function: `refresh_review_queue()`
- Function: `get_unified_review_queue_fast(user_id UUID, limit_count INT)`
- Function: `get_review_stats_fast(user_id UUID)`
- 15 database indexes

### Step 5: Refresh Materialized View

After applying all three migrations, run this in the SQL Editor:

```sql
SELECT refresh_review_queue();
```

This populates the materialized view for the first time.

### Step 6: Verify Migrations

Run these verification queries in the SQL Editor:

```sql
-- Check tables exist (should return 5 rows)
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'flashcards',
  'flashcard_reviews',
  'question_reviews',
  'review_sessions',
  'question_review_attempts'
);

-- Check functions exist (should return 5 rows minimum)
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
  'get_review_stats',
  'calculate_review_streak',
  'get_unified_review_queue',
  'get_unified_review_queue_fast',
  'refresh_review_queue'
);

-- Check materialized view exists (should return 1 row)
SELECT matviewname FROM pg_matviews
WHERE schemaname = 'public'
AND matviewname = 'mv_unified_review_queue';

-- Check indexes created (should return 15+ rows)
SELECT indexname FROM pg_indexes
WHERE schemaname = 'public'
AND (
  indexname LIKE 'idx_flashcard_%' OR
  indexname LIKE 'idx_question_reviews_%' OR
  indexname LIKE 'idx_review_sessions_%'
);
```

**Expected Results**:
- 5 tables found
- 5+ functions found
- 1 materialized view found
- 15+ indexes found

---

## Step 7: Update Migration History (Important!)

After manually applying migrations, you need to record them in the migration history table so the CLI knows they're applied:

```sql
-- Record Migration 1
INSERT INTO supabase_migrations.schema_migrations (version, name, statements)
VALUES ('20251002000001', '20251002000001_add_flashcards_system.sql', ARRAY['-- See migration file'])
ON CONFLICT (version) DO NOTHING;

-- Record Migration 2
INSERT INTO supabase_migrations.schema_migrations (version, name, statements)
VALUES ('20251002000002', '20251002000002_add_question_reviews.sql', ARRAY['-- See migration file'])
ON CONFLICT (version) DO NOTHING;

-- Record Migration 3
INSERT INTO supabase_migrations.schema_migrations (version, name, statements)
VALUES ('20251003000001', '20251003000001_performance_optimizations.sql', ARRAY['-- See migration file'])
ON CONFLICT (version) DO NOTHING;

-- Verify migrations recorded
SELECT version, name FROM supabase_migrations.schema_migrations
WHERE version IN ('20251002000001', '20251002000002', '20251003000001')
ORDER BY version;
```

---

## Post-Migration Steps

After manually applying migrations, continue with the deployment process:

### 1. Regenerate Supabase Types

```bash
# From your terminal:
npx supabase gen types typescript --project-id qnwcwoutgarhqxlgsjzs > src/lib/database.types.ts
```

### 2. Verify TypeScript Compilation

```bash
npm run typecheck
# Expected: 0 errors (down from 41)
```

### 3. Build and Deploy

```bash
npm run build
vercel --prod
```

---

## Troubleshooting

### Problem: Permission Denied Errors

**Solution**: Ensure you're logged into Supabase dashboard with owner/admin access

### Problem: "Relation already exists" Errors

**Solution**: Some objects may already exist from previous attempts. This is safe - the migrations use `CREATE TABLE IF NOT EXISTS` and `DO $$ BEGIN ... END $$` blocks for idempotency.

You can safely ignore these errors:
- `relation "flashcards" already exists`
- `relation "question_reviews" already exists`
- `function "get_review_stats" already exists`

### Problem: Syntax Errors

**Solution**: Ensure you copied the ENTIRE migration file, including all statements. The files are large (9-15KB each).

### Problem: Foreign Key Constraint Errors

**Solution**: Ensure migrations are applied in order:
1. Flashcards first (20251002000001)
2. Question reviews second (20251002000002)
3. Performance optimizations third (20251003000001)

---

## Alternative: Use psql Direct Connection

If the Supabase web editor has issues, you can connect via psql:

```bash
# Get connection string from Supabase Dashboard > Settings > Database
# Then run:
psql "postgresql://postgres:[YOUR-PASSWORD]@aws-1-ca-central-1.pooler.supabase.com:5432/postgres" < supabase/migrations/20251002000001_add_flashcards_system.sql
psql "postgresql://postgres:[YOUR-PASSWORD]@aws-1-ca-central-1.pooler.supabase.com:5432/postgres" < supabase/migrations/20251002000002_add_question_reviews.sql
psql "postgresql://postgres:[YOUR-PASSWORD]@aws-1-ca-central-1.pooler.supabase.com:5432/postgres" < supabase/migrations/20251003000001_performance_optimizations.sql
```

---

## Verification Checklist

After manual migration:

- [ ] All 5 tables exist
- [ ] All 5+ functions exist
- [ ] Materialized view exists
- [ ] 15+ indexes exist
- [ ] Migration history updated
- [ ] Supabase types regenerated
- [ ] TypeScript compilation passes (0 errors)
- [ ] Production build succeeds

---

**Last Updated**: 2025-01-03
**Next Step**: Regenerate types → Build → Deploy
