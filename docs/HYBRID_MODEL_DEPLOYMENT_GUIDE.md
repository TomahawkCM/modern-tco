# Hybrid Model Deployment Guide

**Version:** 2.0
**Date:** October 10, 2025
**Status:** Ready for Deployment

---

## 🎯 Overview

This guide walks you through deploying the hybrid model content population system, which includes:
- **Flashcard Library System** (500+ curated flashcards)
- **Mock Exam System** (6 progressive exams)
- **AI Content Generation Tools** (questions + flashcards)

**Zero Breaking Changes:** All existing systems preserved and enhanced.

---

## 📋 Prerequisites

### 1. Environment Setup

```bash
# Verify Node.js version (16+)
node --version

# Verify Supabase CLI installed
supabase --version

# If not installed:
npm install -g supabase

# Verify Anthropic API key set
echo $ANTHROPIC_API_KEY
```

### 2. Project Setup

```bash
# Install dependencies (if needed)
npm install

# Verify build passes
npm run build
```

---

## 🚀 Deployment Steps

### Step 1: Apply Database Migration

**Option A: Using Deployment Script (Recommended)**

```bash
# Make script executable
chmod +x scripts/deploy-hybrid-model.sh

# Run deployment
./scripts/deploy-hybrid-model.sh
```

**Option B: Manual Deployment**

```bash
# Apply migration
supabase db push

# Verify tables created
supabase db execute "
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('flashcard_library', 'flashcard_library_progress', 'content_import_logs')
"

# Verify functions created
supabase db execute "
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('update_flashcard_library_progress', 'get_library_flashcards_due_for_review')
"
```

**Expected Output:**
```
✅ flashcard_library
✅ flashcard_library_progress
✅ content_import_logs
✅ update_flashcard_library_progress()
✅ get_library_flashcards_due_for_review()
```

---

### Step 2: Verify Existing Systems Intact

```bash
# Check existing flashcards table (user-created)
supabase db execute "SELECT COUNT(*) FROM flashcards"

# Check existing exam_sessions table
supabase db execute "SELECT COUNT(*) FROM exam_sessions"

# Check existing questions table
supabase db execute "SELECT COUNT(*) FROM questions"
```

**Expected:** All existing tables should return without errors.

---

### Step 3: Generate Initial Content

#### 3.1 Generate Questions (First Batch)

```bash
# Set API key (if not already set)
export ANTHROPIC_API_KEY=sk-ant-your-key-here

# Generate 50 beginner questions for Asking Questions domain
npx tsx scripts/generate-questions.ts \
  --domain asking_questions \
  --difficulty beginner \
  --count 50

# Check output
ls -la src/data/generated/
```

**Expected Output:**
```
✅ Generated 50 questions successfully!
📁 Output file: src/data/generated/generated-questions-asking_questions-beginner-2025-10-10.ts
```

#### 3.2 Generate Flashcards (First Batch)

```bash
# Generate 30 medium flashcards for Asking Questions domain
npx tsx scripts/generate-flashcards.ts \
  --domain asking_questions \
  --difficulty medium \
  --count 30

# Check output
ls -la src/data/generated/
```

**Expected Output:**
```
✅ Generated 30 flashcards successfully!
📁 Output file: src/data/generated/generated-flashcards-asking_questions-medium-2025-10-10.ts
```

---

### Step 4: Import Generated Content

#### 4.1 Import Questions to Database

Create import script `scripts/import-questions.ts`:

```typescript
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import generatedQuestions from '../src/data/generated/generated-questions-asking_questions-beginner-2025-10-10';

async function importQuestions() {
  const supabase = createClientComponentClient();

  const { data, error } = await supabase
    .from('questions')
    .insert(generatedQuestions);

  if (error) {
    console.error('Import failed:', error);
  } else {
    console.log(`✅ Imported ${generatedQuestions.length} questions`);
  }
}

importQuestions();
```

Run:
```bash
npx tsx scripts/import-questions.ts
```

#### 4.2 Import Flashcards to Database

```typescript
import { bulkImportFlashcards } from '@/lib/flashcard-library-service';
import generatedFlashcards from '../src/data/generated/generated-flashcards-asking_questions-medium-2025-10-10';

async function importFlashcards() {
  const result = await bulkImportFlashcards({
    cards: generatedFlashcards,
    source: 'ai_generated',
    sourceDescription: 'First batch - Asking Questions domain, medium difficulty'
  });

  console.log(`✅ Imported ${result.successfulItems}/${result.totalItems} flashcards`);
  if (result.failedItems > 0) {
    console.error(`❌ ${result.failedItems} failed:`, result.errors);
  }
}

importFlashcards();
```

---

### Step 5: Test Systems

#### 5.1 Test Mock Exam Builder

```typescript
import { createMockExamSession } from '@/lib/mock-exam-builder';

async function testMockExam() {
  // Create diagnostic exam for test user
  const session = await createMockExamSession(
    'mock-exam-1-diagnostic',
    'test-user-id'
  );

  if (session) {
    console.log('✅ Mock exam created successfully');
    console.log(`   Questions: ${session.questions.length}`);
    console.log(`   Time limit: ${session.timeLimitMinutes} minutes`);
  }
}

testMockExam();
```

#### 5.2 Test Flashcard Library

```typescript
import {
  getLibraryFlashcards,
  getLibraryFlashcardStats
} from '@/lib/flashcard-library-service';

async function testFlashcardLibrary() {
  // Get library cards
  const { cards, total } = await getLibraryFlashcards({
    domains: ['asking_questions'],
    limit: 10
  });

  console.log(`✅ Retrieved ${cards.length} flashcards (total: ${total})`);

  // Get stats
  const stats = await getLibraryFlashcardStats('test-user-id');
  console.log(`   Total library cards: ${stats?.totalLibraryCards}`);
  console.log(`   Due today: ${stats?.cardsDueToday}`);
}

testFlashcardLibrary();
```

#### 5.3 Test Unified Review Queue

```typescript
import { getUnifiedReviewQueue } from '@/lib/flashcard-library-service';

async function testUnifiedQueue() {
  const queue = await getUnifiedReviewQueue('test-user-id', 20);

  const libraryCards = queue.filter(c => c.source === 'library').length;
  const userCards = queue.filter(c => c.source === 'user_created').length;

  console.log('✅ Unified review queue:');
  console.log(`   Library cards: ${libraryCards}`);
  console.log(`   User cards: ${userCards}`);
  console.log(`   Total: ${queue.length}`);
}

testUnifiedQueue();
```

---

## 📊 Verification Checklist

### Database Verification

- [ ] `flashcard_library` table created
- [ ] `flashcard_library_progress` table created
- [ ] `content_import_logs` table created
- [ ] `update_flashcard_library_progress()` function exists
- [ ] `get_library_flashcards_due_for_review()` function exists
- [ ] Existing `flashcards` table intact (user-created)
- [ ] Existing `exam_sessions` table intact
- [ ] RLS policies active on all new tables

### Generated Content Verification

- [ ] Questions generated successfully
- [ ] Flashcards generated successfully
- [ ] TypeScript files valid (no syntax errors)
- [ ] JSON structure correct
- [ ] All required fields present

### Import Verification

- [ ] Questions imported to database
- [ ] Flashcards imported to database
- [ ] Import logs created in `content_import_logs`
- [ ] No duplicate entries
- [ ] All foreign keys valid

### Integration Verification

- [ ] Mock exam builder works
- [ ] Flashcard library service works
- [ ] Unified review queue works
- [ ] No conflicts with existing systems
- [ ] UI components render correctly

---

## 🔍 Troubleshooting

### Migration Fails

**Error:** `relation "flashcards" already exists`

**Solution:** This is expected! The existing `flashcards` table is for user-created cards. The new system uses `flashcard_library`. No action needed.

---

### Question Generation Fails

**Error:** `ANTHROPIC_API_KEY environment variable not set`

**Solution:**
```bash
export ANTHROPIC_API_KEY=sk-ant-your-key-here
```

---

### Import Fails

**Error:** `RLS policy violation`

**Solution:** Check that you're using a valid user_id or service role key for imports.

```bash
# Use service role for bulk imports
export SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

### Mock Exam Has No Questions

**Error:** `Only 0 questions available for template requiring 75`

**Solution:** Not enough questions in database yet. Generate more questions first:

```bash
# Generate questions across all domains
for domain in asking_questions refining_targeting taking_action navigation reporting; do
  npx tsx scripts/generate-questions.ts --domain $domain --difficulty medium --count 30
done
```

---

## 📈 Content Population Roadmap

### Week 1: Core Questions (200 → 600)

```bash
# Day 1-2: Generate questions for all domains
for domain in asking_questions refining_targeting taking_action navigation reporting; do
  for difficulty in beginner intermediate advanced; do
    npx tsx scripts/generate-questions.ts \
      --domain $domain \
      --difficulty $difficulty \
      --count 40
  done
done

# Day 3: Import to database
npx tsx scripts/bulk-import-questions.ts
```

**Result:** 600 AI-generated questions ready

---

### Week 2: Flashcard Library (0 → 500)

```bash
# Day 1-2: Generate flashcards for all domains
for domain in asking_questions refining_targeting taking_action navigation reporting; do
  for difficulty in easy medium hard; do
    npx tsx scripts/generate-flashcards.ts \
      --domain $domain \
      --difficulty $difficulty \
      --count 35
  done
done

# Day 3: Import to database
npx tsx scripts/bulk-import-flashcards.ts
```

**Result:** 500+ library flashcards ready

---

### Week 3-4: Remaining Content

- Import existing 200 questions
- Curate 20+ videos
- Develop/import 10 interactive labs
- Final quality assurance

---

## 🎯 Success Criteria

**Deployment is successful when:**

✅ **Database:**
- All 3 new tables created
- All 2 new functions working
- All existing tables preserved
- RLS policies active

✅ **Content:**
- 50+ questions generated (initial)
- 30+ flashcards generated (initial)
- Content imported successfully
- No validation errors

✅ **Integration:**
- Mock exam builder works
- Flashcard library works
- Unified review queue works
- UI components functional

✅ **Zero Breaking Changes:**
- Existing flashcard system works
- Existing exam system works
- No data loss
- No API changes

---

## 📞 Support

**Documentation:**
- Implementation Summary: `docs/CONTENT_POPULATION_IMPLEMENTATION_SUMMARY.md`
- Content Strategy: `docs/CONTENT_POPULATION_STRATEGY.md`
- This Guide: `docs/HYBRID_MODEL_DEPLOYMENT_GUIDE.md`

**Scripts:**
- Question Generator: `scripts/generate-questions.ts`
- Flashcard Generator: `scripts/generate-flashcards.ts`
- Deployment: `scripts/deploy-hybrid-model.sh`

**Database:**
- Migration: `supabase/migrations/20251010000003_add_content_population_tables.sql`

**Code:**
- Types: `src/types/flashcard-library.ts`
- Mock Exam Configs: `src/data/mock-exam-configs.ts`
- Mock Exam Builder: `src/lib/mock-exam-builder.ts`
- Flashcard Service: `src/lib/flashcard-library-service.ts`
- Flashcard UI: `src/components/flashcards/FlashcardLibrary.tsx`

---

**Last Updated:** October 10, 2025
**Deployment Version:** 2.0 (Hybrid Model)
**Status:** ✅ Ready for Production
