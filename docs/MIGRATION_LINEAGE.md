# Migration Lineage Documentation
## Understanding Supabase Migration Evolution

**Date:** October 11, 2025
**Purpose:** Document migration relationships and explain why multiple versions exist

---

## 🔄 Migration 003-005: Study Content Tables Evolution

### Timeline

```
Sept 26, 2025 - All created in same commit (956aa945)
├── 003_create_study_content_tables.sql     (Initial attempt)
├── 004_improved_study_content_tables.sql   (Bug fixes)
└── 005_fixed_study_content_tables.sql      (Final version) ✅
```

### Why Three Versions Exist

#### Migration 003: Original Implementation ❌
**Created:** Sept 26, 2025
**Issues:**
1. **Wrong UUID Function:**
   ```sql
   -- ❌ Old method (requires uuid-ossp extension)
   id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
   ```

2. **Wrong Data Type:**
   ```sql
   -- ❌ TEXT field (can't sort or calculate)
   estimated_time TEXT NOT NULL
   ```

3. **Missing FK Constraint:**
   ```sql
   -- ❌ No proper foreign key to auth.users
   user_id UUID NOT NULL  -- Just UUID, no FK
   ```

**Status:** ⚠️ DEPRECATED - Do not use

---

#### Migration 004: Improved Version (Partial Fix) ❌
**Created:** Sept 26, 2025 (same day as 003)
**Improvements:**
1. **Better UUID Function:**
   ```sql
   -- ✅ Supabase preferred method
   id UUID PRIMARY KEY DEFAULT gen_random_uuid()
   ```

2. **Correct Data Type:**
   ```sql
   -- ✅ Integer for calculations and analytics
   estimated_time_minutes INTEGER NOT NULL DEFAULT 0
   ```

3. **Proper Foreign Keys:**
   ```sql
   -- ✅ Proper cascade delete constraint
   user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
   ```

4. **Better Extensions:**
   ```sql
   -- ✅ Modern Supabase extensions
   CREATE EXTENSION IF NOT EXISTS pgcrypto;
   CREATE EXTENSION IF NOT EXISTS pg_trgm;
   ```

**New Issues:**
- ❌ Syntax error: `ALTER TABLE ... ADD CONSTRAINT IF NOT EXISTS` (not valid in PostgreSQL)
- PostgreSQL doesn't support IF NOT EXISTS with ADD CONSTRAINT

**Status:** ⚠️ DEPRECATED - Has syntax errors

---

#### Migration 005: Final Fixed Version ✅
**Created:** Sept 26, 2025 (same day, final iteration)
**Fixed:**
1. **Removed Invalid Syntax:**
   ```sql
   -- ✅ Correct syntax (no IF NOT EXISTS)
   ALTER TABLE study_modules
   ADD CONSTRAINT study_modules_domain_check
   CHECK (domain IN ('asking', 'refining', 'action', 'navigation', 'reporting'));
   ```

2. **All Previous Improvements Retained:**
   - gen_random_uuid() ✅
   - Integer time fields ✅
   - Proper auth.users FKs ✅
   - Modern extensions ✅

**Status:** ✅ **CANONICAL** - This is the correct version to use

---

## 📊 Schema Comparison

### Tables Created (All Versions)

#### study_modules
| Column | 003 (Wrong) | 004-005 (Correct) |
|--------|------------|-------------------|
| id     | uuid_generate_v4() | gen_random_uuid() ✅ |
| estimated_time | TEXT ❌ | - (removed) |
| estimated_time_minutes | - | INTEGER ✅ |
| created_at | TIMESTAMP | TIMESTAMPTZ ✅ |

#### user_study_progress
| Column | 003 (Wrong) | 004-005 (Correct) |
|--------|------------|-------------------|
| user_id | UUID (no FK) ❌ | REFERENCES auth.users(id) ✅ |
| time_spent | INTEGER | INTEGER ✅ |

---

## 🎯 Which Migration to Use?

### For Fresh Databases:
**Use Migration 005 ONLY**
- ✅ Correct schema
- ✅ No syntax errors
- ✅ Supabase best practices

### For Existing Databases:
**Check current state first:**

```sql
-- Check if tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('study_modules', 'study_sections', 'user_study_progress');

-- Check data type of estimated_time field
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'study_modules'
AND column_name LIKE '%time%';
```

**If tables exist with wrong schema (from 003):**
1. Migration 004-005 may not fix it (IF NOT EXISTS prevents recreation)
2. Need manual ALTER TABLE to fix data types
3. See "Schema Migration Path" below

---

## 🔧 Schema Migration Path

### If You Ran Migration 003 (Wrong Schema)

**Problem:** Migrations 004-005 use `CREATE TABLE IF NOT EXISTS`, which won't recreate existing tables

**Solution:** Manual schema fix

```sql
-- Step 1: Backup data
CREATE TABLE study_modules_backup AS SELECT * FROM study_modules;

-- Step 2: Drop old table
DROP TABLE study_modules CASCADE;

-- Step 3: Run migration 005 (will create correct schema)
-- Then restore data with type conversion
INSERT INTO study_modules (...)
SELECT
  id,
  domain,
  title,
  CAST(REGEXP_REPLACE(estimated_time, '[^0-9]', '', 'g') AS INTEGER) as estimated_time_minutes,
  -- ... other columns
FROM study_modules_backup;

-- Step 4: Verify and cleanup
SELECT * FROM study_modules LIMIT 5;
DROP TABLE study_modules_backup;
```

---

## 📚 October 2025 Migrations

### Consolidation Opportunity

**Current State (Oct 10, 2025):**
```
20251010000001_add_ai_personalization.sql        (24KB) - AI profiles, recommendations
20251010000002_add_advanced_analytics.sql        (18KB) - Advanced metrics, patterns
20251010000003_add_content_population_tables.sql (13KB) - Import logs, validation
20251010000004_add_domain_field_to_questions.sql (4.5KB) - Add domain to questions
20251010000005_add_reference_columns_to_questions.sql (674B) - Add references
```

**All created on same day (Oct 10) - Could consolidate:**

**Option 1: Merge by Theme**
```
20251010000001_ai_and_analytics.sql         (42KB) - Combines 001+002
20251010000002_content_system_enhancements.sql (18KB) - Combines 003+004+005
```

**Option 2: Leave As-Is**
- Already deployed? Keep current structure
- Well-documented? No need to change
- Small files? Easy to understand

**Recommendation:** Only consolidate if NOT yet in production

---

## 🚦 Migration Best Practices (Going Forward)

### DO:
✅ **Plan before creating** - Design full schema change before migration
✅ **Test locally first** - Always test on fresh DB before production
✅ **Use meaningful names** - Clear, descriptive migration names
✅ **Document changes** - Add comments explaining WHY not just WHAT
✅ **Group related changes** - Put related schema changes in one migration
✅ **Version control** - Commit migrations with descriptive messages

### DON'T:
❌ **Split related changes** - Don't create 3 migrations in 5 minutes
❌ **Use IF NOT EXISTS for fixes** - Won't fix existing tables
❌ **Modify existing migrations** - Once deployed, migrations are immutable
❌ **Delete deployed migrations** - Keep all production migrations forever
❌ **Rush to production** - Test thoroughly in dev/staging first

---

## 📋 Checklist: Before Creating New Migration

- [ ] Have I tested this schema change locally?
- [ ] Does this belong in an existing migration?
- [ ] Is my migration name descriptive?
- [ ] Have I documented WHY this change is needed?
- [ ] Does my SQL use Supabase best practices (gen_random_uuid, TIMESTAMPTZ)?
- [ ] Have I verified foreign key constraints?
- [ ] Is this a complete feature (not a partial fix)?

---

## 🔍 How to Check Current Schema

### Option 1: Supabase Dashboard
1. Go to https://supabase.com/dashboard/project/qnwcwoutgarhqxlgsjzs
2. SQL Editor → Run:
   ```sql
   SELECT * FROM supabase_migrations.schema_migrations
   ORDER BY version;
   ```

### Option 2: Supabase CLI
```bash
supabase db remote changes
```

### Option 3: Local Check
```bash
# See what migrations have been applied
supabase migration list

# Compare local vs remote
supabase db diff
```

---

## 🎯 Summary

### Study Content Tables (003-005):
- **Migration 003:** ❌ Wrong data types, deprecated
- **Migration 004:** ❌ Syntax errors, deprecated
- **Migration 005:** ✅ Correct schema, use this

### Strategy:
- **Keep all files** (don't delete, production state unknown)
- **Mark 003-004 as deprecated** (add warning headers)
- **Document lineage** (this file serves that purpose)
- **Guide developers to 005** (update all docs to reference correct migration)

### Future:
- **Consolidate Oct 10 migrations** (if not in production)
- **Squash for v2.0** (when safe to do major version)
- **Better planning** (avoid creating 3 versions of same migration)

---

**Document Owner:** Database Architecture Team
**Last Updated:** October 11, 2025
**Next Review:** When production schema is confirmed
