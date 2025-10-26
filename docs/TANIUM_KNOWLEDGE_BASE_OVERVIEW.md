# Tanium Knowledge Base (KB) - System Overview

**Status**: 🚧 **DRAFT** - Placeholder content, infrastructure complete
**Location**: `/kb` route + `docs/KB/` directory
**Database**: Supabase PostgreSQL (`kb_modules`, `kb_lessons`, `kb_questions`, `kb_exports`)
**Integration**: ✅ Service layer complete, ⚠️ Content needs population

---

## 📚 What Is the KB?

The **Tanium Knowledge Base (KB)** is a separate content system from the main TCO certification study modules. It provides:

- **Micro-lessons**: Short, focused tutorials on specific Tanium topics
- **Reference material**: Quick-access documentation for console features
- **Question bank**: Assessment questions aligned with KB domains
- **Export capability**: JSON bundles for downstream integration

**Key Difference from Main Study Content**:
- **Main Study Content** (`/study`): 11.6 hours, 6 comprehensive MDX modules, exam-focused
- **KB** (`/kb`): Modular micro-lessons, reference library, draft/experimental content

---

## 🏗️ Architecture

### Database Tables (Supabase)

```sql
-- Master list of KB modules
kb_modules (
  id TEXT PRIMARY KEY,
  title TEXT,
  domain TEXT,  -- AQ, RQ, TA, NB, RD
  status TEXT,  -- draft, review, published
  metadata JSONB,
  order_index INT
)

-- Individual lesson pages
kb_lessons (
  id TEXT PRIMARY KEY,
  module_id TEXT REFERENCES kb_modules(id),
  slug TEXT,
  title TEXT,
  summary TEXT,
  duration_minutes INT,
  contributors TEXT[],
  status TEXT,
  content TEXT  -- Markdown content
)

-- Question bank
kb_questions (
  id TEXT PRIMARY KEY,
  module_id TEXT REFERENCES kb_modules(id),
  domain TEXT,
  question TEXT,
  answer TEXT,
  choices JSONB,
  difficulty TEXT,
  tags TEXT[],
  metadata JSONB
)

-- Export tracking
kb_exports (
  id UUID PRIMARY KEY,
  batch_type TEXT,
  status TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  payload_path TEXT,
  metadata JSONB
)
```

### Domain Mapping

| Code | Full Name |
|------|-----------|
| AQ | Asking Questions |
| RQ | Refining Questions & Targeting |
| TA | Taking Action |
| NB | Navigation & Module Functions |
| RD | Reporting & Data Export |

**Mapping Function**: `mapKbDomain()` in `src/lib/kb-service.ts:17-31`

---

## 📂 File Structure

```
docs/KB/
├── APP_INTEGRATION_PLAN.md          # System integration documentation
├── export/
│   ├── README.md                     # Export automation guide
│   ├── LESSON_EXPORT_TEMPLATE.json  # JSON schema template
│   └── out/
│       └── kb-lessons.json           # Generated export bundle
└── lessons/
    ├── asking-questions-fundamentals.md      # 36 lines (draft)
    ├── navigation-console-mastery.md         # 36 lines (draft)
    ├── refining-questions-targeting.md       # 36 lines (draft)
    ├── reporting-analytics-workbench.md      # 36 lines (draft)
    └── taking-action-readiness.md            # 36 lines (draft)

scripts/
├── kb-import.ts                      # Import lessons to database
├── kb-import-rest.ts                 # REST API importer
├── kb-export-lessons.ts              # Export to JSON bundles
├── kb-apply-schema.ts                # Apply database schema
├── kb-setup-public.ts                # Public schema setup
├── check-kb-tables.js                # Validate table existence
├── lib/
│   └── kb-lesson-loader.ts           # Lesson parsing utility
└── sql/
    └── public_kb_setup.sql            # SQL schema definitions

src/lib/
├── kb-service.ts                     # Supabase query layer
└── knowledge-check.ts                # Assessment utilities

src/app/kb/
└── page.tsx                          # KB landing page (/kb route)
```

---

## 🚀 Automation Scripts

### NPM Commands

```bash
# Initialize KB system (full setup)
npm run kb:init
# Equivalent to: kb:setup-public → kb:import-rest → kb:check

# Individual operations
npm run kb:apply-schema           # Create database tables
npm run kb:apply-schema -- --dry-run  # Preview SQL without executing
npm run kb:import-lessons         # Import markdown → database
npm run kb:import-lessons -- --dry-run  # Preview import mutations
npm run kb:export-lessons         # Export database → JSON
npm run check:tables              # Validate kb_* tables exist
```

### Workflow

1. **Author Content**: Create `.md` files in `docs/KB/lessons/` with frontmatter
2. **Apply Schema**: `npm run kb:apply-schema` (one-time setup)
3. **Import Lessons**: `npm run kb:import-lessons` (upserts to database)
4. **Generate Exports**: `npm run kb:export-lessons` (creates JSON bundle)
5. **View in App**: Visit `/kb` to see imported modules

---

## 📊 Current Status (as of Oct 8, 2025)

### Content Inventory

**Lessons Created**: 5 total (all DRAFT status)

| Lesson | Domain | Duration | Status | Lines |
|--------|--------|----------|--------|-------|
| Asking Questions Fundamentals | AQ | 25 min | Draft | 36 |
| Navigation & Console Mastery | NB | 20 min | Draft | 36 |
| Refining Questions & Targeting | RQ | 30 min | Draft | 36 |
| Reporting & Analytics Workbench | RD | 25 min | Draft | 36 |
| Taking Action Readiness | TA | 20 min | Draft | 36 |

**Total Content**: 180 lines (placeholder/template content)

### Database Status

**Schema Applied**: ✅ SQL definitions exist in `scripts/sql/public_kb_setup.sql`
**Tables Created**: ⚠️ Needs verification (run `npm run check:tables`)
**Data Populated**: ⚠️ Needs import (run `npm run kb:import-lessons`)
**Export Generated**: ✅ `docs/KB/export/out/kb-lessons.json` (last: Sept 20, 2025)

### UI Integration

**Route**: `/kb` → `src/app/kb/page.tsx`
**Service Layer**: ✅ `src/lib/kb-service.ts` (complete)
**Functions Available**:
- `getKbModules()`: Fetch all KB modules
- `getKbSummary()`: Get counts and domain breakdown
- `mapKbDomain(code)`: Convert domain codes to full names

**Expected Behavior**:
- Cards showing module counts by domain
- `hasKbTables: true` when schema exists
- Non-zero metrics when data imported

---

## 🔧 Technical Implementation

### Service Layer (`src/lib/kb-service.ts`)

```typescript
// Type definitions
export type KbModule = {
  id: string;
  title: string;
  domain: string;
  metadata?: unknown;
};

export type KbSummary = {
  hasKbTables: boolean;
  modulesCount: number;
  questionsCount: number;
  byDomain: Record<string, number>;
};

// Fetch modules from Supabase
export async function getKbModules(): Promise<KbModule[]> {
  const { data, error } = await supabase
    .from("kb_modules")
    .select("id,title,domain,metadata")
    .order("id");
  if (error) return [];
  return (data as KbModule[]) || [];
}

// Get summary statistics
export async function getKbSummary(): Promise<KbSummary> {
  // Returns counts by domain and table existence check
}
```

### Lesson Format (Markdown Frontmatter)

```markdown
---
id: kb.aq.fundamentals
domain: AQ
slug: asking-questions-fundamentals
title: Asking Questions Fundamentals
duration_minutes: 25
status: draft
contributors: []
---

## Overview
Lesson content in markdown...

## Learning Objectives
- [ ] Objective 1
- [ ] Objective 2

## Lesson Flow
1. Step 1
2. Step 2
```

### Export Format (JSON)

```json
{
  "metadata": {
    "generatedAt": "2025-09-20T01:24:23.232Z",
    "moduleCount": 5,
    "lessonCount": 5
  },
  "modules": [
    {
      "id": "kb.aq.fundamentals",
      "title": "Asking Questions Fundamentals",
      "domain": "AQ",
      "status": "draft",
      "lessons": [
        {
          "slug": "asking-questions-fundamentals",
          "title": "...",
          "content": "## Overview\n...",
          "durationMinutes": 25
        }
      ]
    }
  ]
}
```

---

## ✅ What's Complete

1. ✅ **Database Schema**: SQL definitions in `scripts/sql/public_kb_setup.sql`
2. ✅ **Automation Scripts**: Import, export, schema application
3. ✅ **Service Layer**: Supabase integration (`kb-service.ts`)
4. ✅ **UI Route**: `/kb` page with metrics display
5. ✅ **Domain Mapping**: Code → Full name conversion
6. ✅ **Export Pipeline**: Markdown → Database → JSON
7. ✅ **Documentation**: Integration plan and automation guide

---

## ⚠️ What Needs Work

1. ⚠️ **Content Population**: All 5 lessons are placeholder/draft content
2. ⚠️ **Database Verification**: Tables may not be created in Supabase yet
3. ⚠️ **Import Execution**: Lessons not imported to database
4. ⚠️ **Question Bank**: `kb_questions` table empty
5. ⚠️ **UI Polish**: `/kb` route needs design updates
6. ⚠️ **Testing**: No unit tests for KB service layer
7. ⚠️ **RLS Policies**: Read-only security policies need verification
8. ⚠️ **MDX Integration**: Decision needed on in-app rendering vs external links

---

## 🎯 Recommended Next Steps

### Phase 1: Database Setup (30 minutes)

```bash
# 1. Verify Supabase connection
npx supabase status

# 2. Apply KB schema
npm run kb:apply-schema

# 3. Verify tables created
npm run check:tables

# Expected output:
# ✅ kb_modules exists
# ✅ kb_lessons exists
# ✅ kb_questions exists
# ✅ kb_exports exists
```

### Phase 2: Content Import (15 minutes)

```bash
# 1. Preview what will be imported
npm run kb:import-lessons -- --dry-run

# 2. Import lessons to database
npm run kb:import-lessons

# 3. Verify import success
npm run kb:export-lessons

# 4. Check /kb route shows non-zero counts
```

### Phase 3: Content Development (HIGH PRIORITY)

**Goal**: Replace placeholder content with production-ready Tanium lessons

**Approach**:
1. **Reuse Main Study Content**: Extract micro-lessons from existing MDX modules
2. **TCO Domain Alignment**: Ensure KB lessons complement certification content
3. **5-10 Min Chunks**: Each lesson should be digestible in one sitting
4. **Progressive Disclosure**: Link to full modules for deeper study

**Priority Lessons** (based on exam blueprint):
- **AQ** (22% weight): Asking Questions fundamentals ⭐ HIGH
- **RQ** (23% weight): Targeting and computer groups ⭐ HIGH
- **NB** (23% weight): Console navigation ⭐ HIGH
- **RD** (17% weight): Reporting and export ⭐ MEDIUM
- **TA** (15% weight): Package deployment ⭐ MEDIUM

### Phase 4: Integration with Main App

**Decisions Needed**:
1. Should KB lessons render in-app (MDX) or link externally?
2. Do we integrate KB questions into `/practice` mode?
3. Should `/study` modules link to related KB lessons?
4. Do we expose KB data via public API?

---

## 🔐 Security & Access Control

### Row-Level Security (RLS)

**Current Setup** (from `APP_INTEGRATION_PLAN.md`):
- ✅ Anonymous users: `SELECT` (read-only)
- ❌ Anonymous users: `INSERT`/`UPDATE`/`DELETE` blocked
- ✅ Service account: Full CRUD via importer scripts

**Verification**:
```sql
-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename LIKE 'kb_%';
```

### Data Integrity

- **Referential Integrity**: Foreign keys enforce module → lesson relationships
- **Validation**: Importer scripts validate frontmatter before database writes
- **Audit Trail**: `kb_exports` table tracks all export batches

---

## 📖 Documentation References

### Primary Docs

1. **`docs/KB/APP_INTEGRATION_PLAN.md`** - System integration guide (comprehensive)
2. **`docs/KB/export/README.md`** - Export automation and JSON schema
3. **`scripts/sql/public_kb_setup.sql`** - Database schema definitions
4. **`src/lib/kb-service.ts`** - Service layer implementation

### Related Systems

- **Main Study Content**: `src/content/modules/*.mdx` (11.6 hours TCO certification)
- **Practice Questions**: `src/data/questions/` (200+ questions, 4,108 in old app)
- **Assessment Engine**: `src/lib/exam-simulator.ts` (could integrate KB questions)

---

## 💡 Use Cases

### 1. Quick Reference During Study

**Scenario**: Student studying Module 2 (Refining Questions) needs quick reminder on computer groups

**Flow**:
- Visit `/kb`
- Find "Refining Questions & Targeting" module
- Read 5-min lesson on computer group syntax
- Return to main study module

### 2. Post-Certification Reference

**Scenario**: Certified analyst needs to look up specific console feature

**Flow**:
- Search KB for "reporting workbench"
- Find step-by-step tutorial
- Export as JSON for team wiki

### 3. Content Review Workflow

**Scenario**: Subject matter expert reviews draft KB content

**Flow**:
- Edit `docs/KB/lessons/navigation-console-mastery.md`
- Run `npm run kb:import-lessons -- --dry-run` to preview
- Run `npm run kb:import-lessons` to publish
- Visit `/kb` to verify live update

---

## 🎓 Comparison: KB vs Main Study Content

| Feature | Main Study Content | Knowledge Base (KB) |
|---------|-------------------|---------------------|
| **Location** | `/study`, `src/content/modules/*.mdx` | `/kb`, `docs/KB/lessons/*.md` |
| **Purpose** | Comprehensive TCO certification prep | Quick reference, micro-lessons |
| **Content Volume** | 11.6 hours, 16,849 lines, 6 modules | 5 lessons, 180 lines (draft) |
| **Database** | PostgreSQL (modules, progress) | PostgreSQL (kb_modules, kb_lessons) |
| **Assessment** | 140+ integrated questions, 200 practice | Separate kb_questions table |
| **Status** | ✅ Production-ready | ⚠️ Draft/placeholder |
| **Blueprint Alignment** | 100% TAN-1000 certification | Supplementary material |
| **Interactivity** | MDX components, InfoBoxes, QuickChecks | Markdown with frontmatter |
| **Export** | Static MDX files | JSON bundles via automation |

**Strategic Relationship**:
- KB provides "just-in-time" micro-lessons
- Main study content provides comprehensive certification prep
- KB questions could augment practice mode
- Cross-linking between systems recommended

---

## 📊 Metrics & Analytics

**Current Metrics** (from `getKbSummary()`):
- `hasKbTables`: Boolean - Are KB tables created?
- `modulesCount`: Number - Total modules imported
- `questionsCount`: Number - Total questions in kb_questions
- `byDomain`: Object - Module count per domain (AQ, RQ, TA, NB, RD)

**Potential Analytics**:
- Most-viewed KB lessons
- Average time spent on KB pages
- KB → Main study content conversion rate
- KB search queries (if search implemented)

---

## 🔮 Future Enhancements

### Short-term (Next 1-2 Months)

1. **Content Population**: Replace all 5 draft lessons with production content
2. **Database Import**: Execute `npm run kb:import-lessons` in production
3. **UI Polish**: Update `/kb` route with modern design
4. **Search**: Add KB-specific search functionality

### Medium-term (2-6 Months)

1. **MDX Integration**: Render KB lessons in-app with interactive components
2. **Question Bank**: Populate `kb_questions` with 50+ assessment items
3. **Cross-linking**: Link main study modules to related KB lessons
4. **API Exposure**: Public API endpoints for partner integrations

### Long-term (6+ Months)

1. **AI-Powered Search**: Semantic search across KB content
2. **User Contributions**: Allow certified users to submit KB lessons
3. **Multi-language**: Translate KB content to Spanish, French, etc.
4. **Video Integration**: Embed video walkthroughs in KB lessons
5. **Versioning**: Track KB content changes for Tanium version updates

---

## 🏁 Summary

The **Tanium Knowledge Base** is a fully-architected, partially-implemented micro-lesson system with:

✅ **Complete infrastructure**: Database schema, automation, service layer, UI route
⚠️ **Draft content**: 5 placeholder lessons totaling 180 lines
🎯 **Next action**: Populate with production content from main study modules

**Strategic Value**:
- Quick reference for post-certification analysts
- Modular content easily updated as Tanium evolves
- JSON export enables integration with external systems
- Complements main TCO certification content

**Recommended Priority**: **MEDIUM** - Infrastructure ready, awaiting content population. Can be developed in parallel with main study content refinement.

---

**Last Updated**: October 9, 2025
**Maintained By**: Tanium TCO LMS Team
**Documentation**: `docs/KB/APP_INTEGRATION_PLAN.md`
