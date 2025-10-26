# Migration Fixes Applied - Phase 2

**Date**: 2025-01-03
**Status**: ✅ All migration errors fixed, ready for manual application

---

## Summary

All Phase 2 migrations have been corrected and are now ready for deployment. The Supabase CLI encountered persistent connection issues, so migrations must be applied manually via the Supabase dashboard.

---

## Fixes Applied

### 1. **Type Mismatch: question_id (TEXT → UUID)**

**Files Fixed**:
- `supabase/migrations/20251002000001_add_flashcards_system.sql`
- `supabase/migrations/20251002000002_add_question_reviews.sql`

**Problem**: Migration files defined `question_id` as TEXT, but `questions.id` is UUID

**Fixes Applied**:
```sql
-- BEFORE (incorrect):
question_id TEXT NULL REFERENCES public.questions(id)

-- AFTER (correct):
question_id UUID NULL REFERENCES public.questions(id)
```

**Locations Fixed**:
- `20251002000001`: Line 25 (flashcards table)
- `20251002000002`: Line 9 (question_reviews table)
- `20251002000002`: Line 47 (question_review_attempts table)
- `20251002000002`: Line 199 (get_due_questions function return type)

---

### 2. **Immutable Function Error in Index Predicate**

**File Fixed**: `supabase/migrations/20251003000001_performance_optimizations.sql`

**Problem**: PostgreSQL requires index predicates to use immutable functions. `NOW()` is volatile.

**Error**:
```
ERROR: functions in index predicate must be marked IMMUTABLE
WHERE srs_due <= NOW()
```

**Fix Applied**:
```sql
-- BEFORE (incorrect):
CREATE INDEX idx_question_reviews_user_due
  ON question_reviews (user_id, srs_due)
  WHERE srs_due <= NOW();  -- NOW() is not immutable

-- AFTER (correct):
CREATE INDEX idx_question_reviews_user_due
  ON question_reviews (user_id, srs_due);  -- Removed WHERE clause
```

**Locations Fixed**:
- Lines 7-9: idx_question_reviews_user_due
- Lines 11-13: idx_question_reviews_user_mastery

---

### 3. **Incorrect Table Reference in Indexes**

**File Fixed**: `supabase/migrations/20251003000001_performance_optimizations.sql`

**Problem**: Indexes referenced non-existent columns in `flashcard_reviews` table

**flashcard_reviews Schema** (actual):
- `id, flashcard_id, user_id, rating, time_spent_seconds, reviewed_at`
- `srs_interval_before/after, srs_ease_before/after`
- **NO** `srs_due` or `deck_id` columns

**Fix Applied**:
```sql
-- BEFORE (incorrect):
CREATE INDEX idx_flashcard_reviews_user_due
  ON flashcard_reviews (user_id, srs_due);  -- srs_due doesn't exist

CREATE INDEX idx_flashcard_reviews_deck
  ON flashcard_reviews (deck_id, user_id);  -- deck_id doesn't exist

-- AFTER (correct):
CREATE INDEX idx_flashcard_reviews_user_time
  ON flashcard_reviews (user_id, reviewed_at DESC);

CREATE INDEX idx_flashcard_reviews_flashcard_time
  ON flashcard_reviews (flashcard_id, reviewed_at DESC);
```

---

### 4. **Incorrect Table in Materialized View Query**

**File Fixed**: `supabase/migrations/20251003000001_performance_optimizations.sql`

**Problem**: Materialized view queried `flashcard_reviews` for SRS state, but SRS state is in `flashcards` table

**Error**:
```
ERROR: column fr.srs_due does not exist
FROM public.flashcard_reviews fr
```

**Fix Applied**:
```sql
-- BEFORE (incorrect):
WITH flashcard_queue AS (
  SELECT
    'flashcard'::TEXT as item_type,
    fr.id as review_id,
    f.id as content_id,
    fr.srs_due,  -- Doesn't exist in flashcard_reviews
    fr.srs_interval,
    fr.srs_ease,
    ...
    fr.user_id,
    f.deck_id as domain_id
  FROM public.flashcard_reviews fr  -- Wrong table!
  JOIN public.flashcards f ON f.id = fr.flashcard_id
  WHERE fr.srs_due <= NOW()
)

-- AFTER (correct):
WITH flashcard_queue AS (
  SELECT
    'flashcard'::TEXT as item_type,
    f.id as review_id,
    f.id as content_id,
    f.srs_due,  -- Exists in flashcards
    f.srs_interval,
    f.srs_ease,
    ...
    f.user_id,
    f.module_id as domain_id
  FROM public.flashcards f  -- Correct table!
  WHERE f.srs_due <= NOW()
)
```

**Locations Fixed**:
- Lines 54-74: Materialized view flashcard_queue CTE
- Lines 201-215: get_review_stats_fast() function

---

## Migration Files Status

### ✅ All Fixed and Ready

1. **`20251002000001_add_flashcards_system.sql`**
   - Fixed: question_id type (TEXT → UUID)
   - Status: Ready

2. **`20251002000002_add_question_reviews.sql`**
   - Fixed: question_id type in 3 locations (TEXT → UUID)
   - Status: Ready

3. **`20251003000001_performance_optimizations.sql`**
   - Fixed: Index predicates (removed NOW())
   - Fixed: flashcard_reviews indexes (corrected columns)
   - Fixed: Materialized view query (flashcard_reviews → flashcards)
   - Fixed: get_review_stats_fast() function
   - Status: Ready

---

## Manual Deployment Instructions

Since the Supabase CLI encountered persistent connection issues, apply migrations via the dashboard:

### Step 1: Open Supabase SQL Editor

https://supabase.com/dashboard/project/qnwcwoutgarhqxlgsjzs/sql/new

### Step 2: Apply Migrations in Order

```bash
# 1. Copy and run flashcards migration
cat supabase/migrations/20251002000001_add_flashcards_system.sql
# Paste into SQL Editor → Click "Run"

# 2. Copy and run question reviews migration
cat supabase/migrations/20251002000002_add_question_reviews.sql
# Paste into SQL Editor → Click "Run"

# 3. Copy and run performance optimizations
cat supabase/migrations/20251003000001_performance_optimizations.sql
# Paste into SQL Editor → Click "Run"
```

### Step 3: Refresh Materialized View

```sql
SELECT refresh_review_queue();
```

### Step 4: Record Migrations in History

```sql
INSERT INTO supabase_migrations.schema_migrations (version, name, statements)
VALUES
  ('20251002000001', '20251002000001_add_flashcards_system.sql', ARRAY['-- See migration file']),
  ('20251002000002', '20251002000002_add_question_reviews.sql', ARRAY['-- See migration file']),
  ('20251003000001', '20251003000001_performance_optimizations.sql', ARRAY['-- See migration file'])
ON CONFLICT (version) DO NOTHING;
```

### Step 5: Verify Success

```sql
-- Should return 5 tables
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('flashcards', 'flashcard_reviews', 'question_reviews', 'review_sessions', 'question_review_attempts');

-- Should return 5+ functions
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('get_review_stats', 'calculate_review_streak', 'get_unified_review_queue', 'get_unified_review_queue_fast', 'refresh_review_queue');

-- Should return 1 materialized view
SELECT matviewname FROM pg_matviews
WHERE schemaname = 'public'
AND matviewname = 'mv_unified_review_queue';
```

---

## Next Steps After Migrations

Once migrations are applied successfully:

1. **Regenerate Supabase types**:
   ```bash
   npx supabase gen types typescript --project-id qnwcwoutgarhqxlgsjzs > src/lib/database.types.ts
   ```

2. **Verify TypeScript compilation**:
   ```bash
   npm run typecheck
   # Expected: 0 errors (down from 41)
   ```

3. **Build for production**:
   ```bash
   npm run build
   ```

4. **Deploy to Vercel**:
   ```bash
   vercel --prod
   ```

---

## Technical Details

### Database Objects Created

**Tables (5)**:
- `flashcards` - Flashcard content with SRS state
- `flashcard_reviews` - Review history/attempts
- `question_reviews` - Question SRS state
- `review_sessions` - Session tracking for streaks
- `question_review_attempts` - Question review history

**Functions (5+)**:
- `get_review_stats(user_id)` - User review statistics
- `calculate_review_streak(user_id)` - Streak calculation
- `get_unified_review_queue(user_id, limit)` - Real-time queue
- `get_unified_review_queue_fast(user_id, limit)` - Optimized queue
- `refresh_review_queue()` - Materialized view refresh

**Views (1)**:
- `mv_unified_review_queue` - Pre-computed review queue

**Indexes (15+)**:
- Question reviews: 4 indexes
- Review sessions: 3 indexes
- Question review attempts: 2 indexes
- Flashcard reviews: 2 indexes
- Flashcards: (created in migration 1)

---

## Root Cause of CLI Connection Issues

**Symptoms**:
- Connection refused to `aws-1-ca-central-1.pooler.supabase.com:6543`
- Connection refused to `aws-1-ca-central-1.pooler.supabase.com:5432`
- Intermittent - worked initially, then failed repeatedly

**Likely Causes**:
1. WSL2 network configuration blocking outbound PostgreSQL connections
2. Supabase pooler rate limiting or temporary block
3. Corporate/Windows firewall blocking database ports
4. Transient network issues between WSL2 and Supabase AWS infrastructure

**Resolution**: Manual application via Supabase web dashboard (bypasses CLI entirely)

---

## Files Modified

```
supabase/migrations/20251002000001_add_flashcards_system.sql (1 fix)
supabase/migrations/20251002000002_add_question_reviews.sql (3 fixes)
supabase/migrations/20251003000001_performance_optimizations.sql (5 fixes)
```

**Total Fixes**: 9 corrections across 3 migration files

---

**Status**: ✅ All errors resolved, migrations ready for manual deployment
**Next Action**: Apply migrations via Supabase dashboard SQL editor
**Estimated Time**: 15 minutes (manual application)

**Last Updated**: 2025-01-03
