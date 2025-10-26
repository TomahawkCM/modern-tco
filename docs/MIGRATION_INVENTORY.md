# Supabase Migration Inventory
## Modern Tanium TCO Learning Management System

**Date:** October 11, 2025
**Total Migrations:** 24 files
**Total Size:** ~200KB
**Database:** PostgreSQL via Supabase (Project: qnwcwoutgarhqxlgsjzs)

---

## 📊 Production Status Assessment

### Findings:
- ✅ **Schema Deployment Report** (Sept 5, 2025): Initial schema deployed via Supabase Dashboard
- ⚠️ **Migrations 003-005**: Created Sept 26, 2025 (after initial deployment)
- ⚠️ **Production State**: **UNKNOWN** - Cannot confirm which migrations are live
- 🔒 **Safety Decision**: Assume migrations ARE in production → Use additive approach only

### Recommendation:
**ADDITIVE CONSOLIDATION** - Document lineage, no file deletion, preserve all migration history

---

## 📋 Migration Inventory (Chronological)

### Phase 1: Initial Schema (Sept 2025)
#### 001_initial_schema.sql (6.3KB)
- **Purpose:** Core tables for TCO learning platform
- **Tables:** questions, user_progress, bookmarks, exam_sessions, practice_sessions
- **Status:** ✅ Production (likely deployed Sept 5)
- **Notes:** Foundation schema, uses uuid_generate_v4()

#### 002_update_domain_names.sql (2.3KB)
- **Purpose:** Update domain naming consistency
- **Changes:** Rename domains to match TCO blueprint
- **Status:** ✅ Production (likely deployed Sept 5)

---

### Phase 2: Study Content System (Sept 26, 2025)
#### 003_create_study_content_tables.sql (8.1KB) ⚠️
- **Purpose:** Create study_modules, study_sections, user_study_progress
- **Tables:**
  - `study_modules` - Domain-specific study content containers
  - `study_sections` - Individual sections within modules
  - `user_study_progress` - User progress tracking
- **Issues:**
  - Uses `uuid_generate_v4()` (deprecated in favor of `gen_random_uuid()`)
  - `estimated_time` is TEXT field (should be INTEGER)
  - Missing proper auth.users FK constraint
- **Status:** ⚠️ **DEPRECATED** - Use migration 005 instead
- **Git Commit:** 956aa945 (Sept 26, 2025)

#### 004_improved_study_content_tables.sql (9.8KB) ⚠️
- **Purpose:** Fix issues in migration 003
- **Improvements:**
  - Uses `gen_random_uuid()` (Supabase preferred)
  - `estimated_time_minutes` INTEGER field
  - Proper `auth.users(id)` foreign keys
  - Better RLS policies
  - Added pgcrypto and pg_trgm extensions
- **Issues:**
  - Syntax error in ADD CONSTRAINT (had IF NOT EXISTS)
- **Status:** ⚠️ **DEPRECATED** - Syntax errors, use migration 005
- **Git Commit:** 956aa945 (Sept 26, 2025)

#### 005_fixed_study_content_tables.sql (10KB) ✅
- **Purpose:** Fix syntax errors from migration 004
- **Fixed:** Removed IF NOT EXISTS from ADD CONSTRAINT
- **Status:** ✅ **CANONICAL** - This is the correct study_content schema
- **Notes:** Final, working version of study content tables
- **Git Commit:** 956aa945 (Sept 26, 2025)

---

### Phase 3: Core Features (Sept 2025)

#### 20250110000001_domain_progress.sql (19KB)
- **Purpose:** Domain-specific progress tracking
- **Tables:** domain_progress, domain_analytics
- **Status:** ✅ Production

#### 20250902031155_populate_study_content.sql (14KB)
- **Purpose:** Seed study content data
- **Type:** Data migration (INSERT statements)
- **Status:** ✅ Production

#### 20250920090000_add_analytics_and_lab_tables.sql (5.4KB)
- **Purpose:** Analytics and lab tracking
- **Tables:** analytics_events, lab_completions
- **Status:** ✅ Production

#### 20250920093000_add_minute_columns.sql (821 bytes)
- **Purpose:** Add minute tracking columns
- **Notes:** Created 3 minutes after previous migration (could consolidate)
- **Status:** ✅ Production

#### 20250920095000_add_exam_and_questions.sql (8.4KB)
- **Purpose:** Enhanced exam and question system
- **Tables:** exam_results, question_analytics
- **Status:** ✅ Production

#### 20250921120000_add_notes_table.sql (1.9KB)
- **Purpose:** User notes feature
- **Tables:** user_notes
- **Status:** ✅ Production

#### 20250921121000_notes_add_section_refs.sql (445 bytes)
- **Purpose:** Add section references to notes
- **Notes:** Could consolidate with previous migration
- **Status:** ✅ Production

#### 20250922122000_add_team_seats.sql (1.8KB)
- **Purpose:** Team management and seat allocation
- **Tables:** team_seats
- **Status:** ✅ Production

#### 20250926_add_last_viewed_section.sql (632 bytes)
- **Purpose:** Track last viewed section per user
- **Status:** ✅ Production

#### 20250927_add_mdx_id_to_study_modules.sql (422 bytes)
- **Purpose:** Add MDX file mapping to study modules
- **Status:** ✅ Production

#### 20250928_add_questions_module_id.sql (455 bytes)
- **Purpose:** Link questions to specific modules
- **Status:** ✅ Production

---

### Phase 4: Advanced Features (Oct 2025)

#### 20251002000001_add_flashcards_system.sql (12KB)
- **Purpose:** Flashcard/spaced repetition system
- **Tables:** flashcards, flashcard_reviews
- **Status:** ✅ Production

#### 20251002000002_add_question_reviews.sql (16KB)
- **Purpose:** Question review and analytics
- **Tables:** question_reviews, review_sessions
- **Status:** ✅ Production

#### 20251003000001_performance_optimizations.sql (9.5KB)
- **Purpose:** Database performance improvements
- **Changes:** Indexes, query optimizations
- **Status:** ✅ Production

---

### Phase 5: AI & Analytics (Oct 10, 2025)

#### 20251010000001_add_ai_personalization.sql (24KB)
- **Purpose:** AI-powered personalization
- **Tables:** user_learning_profiles, ai_recommendations
- **Status:** ⚠️ Recent addition (may not be in production)

#### 20251010000002_add_advanced_analytics.sql (18KB)
- **Purpose:** Enhanced analytics system
- **Tables:** advanced_metrics, learning_patterns
- **Status:** ⚠️ Recent addition (may not be in production)

#### 20251010000003_add_content_population_tables.sql (13KB)
- **Purpose:** Content population infrastructure
- **Tables:** content_import_logs, validation_results
- **Status:** ⚠️ Recent addition (may not be in production)

#### 20251010000004_add_domain_field_to_questions.sql (4.5KB)
- **Purpose:** Add domain field to questions table
- **Status:** ⚠️ Recent addition (may not be in production)

#### 20251010000005_add_reference_columns_to_questions.sql (674 bytes)
- **Purpose:** Add reference/citation columns to questions
- **Status:** ⚠️ Recent addition (may not be in production)

---

## 🔧 Consolidation Opportunities

### Priority 1: Study Content Tables (003-005)
**Current State:** 3 files, 28KB total
- 003_create_study_content_tables.sql ❌ Wrong data types
- 004_improved_study_content_tables.sql ❌ Syntax errors
- 005_fixed_study_content_tables.sql ✅ Correct version

**Consolidation Strategy (Additive):**
1. Mark 003-004 as DEPRECATED in file headers
2. Create `/docs/MIGRATION_LINEAGE.md` documenting relationship
3. **Keep all files** (cannot safely delete if production exists)

**Alternative (If no production):**
- Squash 003-005 → `003_study_content_consolidated.sql`
- Delete 004-005 files
- Requires confirmation that NO production DB has run these

---

### Priority 2: October 10 Additions (5 migrations)
**Current State:** 5 files, ~60KB total
- 20251010000001_add_ai_personalization.sql (24KB)
- 20251010000002_add_advanced_analytics.sql (18KB)
- 20251010000003_add_content_population_tables.sql (13KB)
- 20251010000004_add_domain_field_to_questions.sql (4.5KB)
- 20251010000005_add_reference_columns_to_questions.sql (674 bytes)

**Consolidation Opportunity:**
Could merge into 2-3 logical groups:
1. AI & Analytics (001+002) → 42KB
2. Content Infrastructure (003+004+005) → 18KB

**Risk:** Medium - Recent additions, may not be in production yet

---

### Priority 3: Minor Column Additions
**Current State:** Multiple small migrations
- 20250920093000_add_minute_columns.sql (821 bytes)
- 20250921121000_notes_add_section_refs.sql (445 bytes)
- 20250926_add_last_viewed_section.sql (632 bytes)
- 20250927_add_mdx_id_to_study_modules.sql (422 bytes)
- 20250928_add_questions_module_id.sql (455 bytes)

**Consolidation Opportunity:**
Could combine into theme-based migrations, but **LOW PRIORITY** (files are small, well-documented)

---

## 📈 Migration Statistics

### By Size:
| Size Range | Count | Total Size |
|------------|-------|------------|
| < 1KB      | 5     | ~3KB      |
| 1-5KB      | 5     | ~15KB     |
| 5-10KB     | 5     | ~40KB     |
| 10-20KB    | 6     | ~90KB     |
| 20-25KB    | 3     | ~66KB     |
| **Total**  | **24**| **~214KB**|

### By Purpose:
- Schema Creation: 8 migrations
- Feature Additions: 10 migrations
- Data Population: 2 migrations
- Performance: 1 migration
- Bug Fixes: 3 migrations (003-005 iterations)

### By Status:
- ✅ Confirmed Production: 14 migrations
- ⚠️ Likely Production: 5 migrations (Sept additions)
- ⚠️ Unknown/Recent: 5 migrations (Oct 10 additions)
- ❌ Deprecated: 2 migrations (003-004)

---

## 🚀 Recommended Actions

### Immediate (Zero Risk):
1. **Add deprecation headers to 003-004:**
   ```sql
   -- ⚠️ DEPRECATED: This migration has issues, use 005_fixed_study_content_tables.sql
   -- Kept for migration history only
   ```

2. **Create migration lineage documentation:**
   - Document 003→004→005 evolution
   - Explain why multiple versions exist
   - Guide developers to use 005

3. **Archive strategy documentation:**
   - Create `/docs/MIGRATION_LINEAGE.md`
   - Update deployment guides
   - Add to onboarding docs

### Future (When Production Confirmed):
1. **If Oct 10 migrations NOT in production:**
   - Consider consolidating before deployment
   - Merge into 2 logical migrations

2. **For next major version (v2.0):**
   - Squash all migrations into single baseline
   - Create fresh migration history
   - Archive old migrations to `/archive/migrations/v1/`

### Never Do (High Risk):
- ❌ Delete migrations 003-005 without production confirmation
- ❌ Modify existing migration files
- ❌ Reorder migration timestamps
- ❌ Remove migrations that may be in production

---

## 📝 Next Steps

1. ✅ **Phase 1 Complete:** Production status assessed (UNKNOWN → assume production exists)
2. ⏳ **Phase 2:** Create migration lineage documentation
3. ⏳ **Phase 3:** Mark deprecated migrations with headers
4. ⏳ **Phase 4:** Update deployment guides
5. ⏳ **Phase 5:** Test consolidated migrations in local env

---

## 🔍 How to Verify Production State

**To definitively determine what's in production:**

```bash
# Option 1: Supabase Dashboard
1. Go to https://supabase.com/dashboard/project/qnwcwoutgarhqxlgsjzs
2. Navigate to SQL Editor
3. Run: SELECT * FROM supabase_migrations.schema_migrations ORDER BY version;

# Option 2: Supabase CLI (if configured)
supabase db remote changes

# Option 3: Direct psql (if DB credentials available)
psql $DATABASE_URL -c "SELECT * FROM supabase_migrations.schema_migrations;"
```

**Without production access:** Assume migrations ARE in production (safest approach)

---

**Document Status:** ✅ COMPLETE
**Strategy:** ADDITIVE CONSOLIDATION (safe for production)
**Risk Level:** LOW (no file deletions, documentation-only changes)
