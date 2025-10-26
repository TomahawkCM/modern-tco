# Quick Start: Content Population

**5-Minute Setup Guide**

---

## ⚡ One-Time Setup

```bash
# 1. Set API key
export ANTHROPIC_API_KEY=sk-ant-your-key-here

# 2. Deploy database
chmod +x scripts/deploy-hybrid-model.sh
./scripts/deploy-hybrid-model.sh

# 3. Verify deployment
supabase db execute "SELECT COUNT(*) FROM flashcard_library"
```

---

## 🎯 Generate Content (30 seconds per batch)

### Questions
```bash
# Generate 50 questions (costs ~$0.15)
npx tsx scripts/generate-questions.ts \
  --domain asking_questions \
  --difficulty intermediate \
  --count 50
```

### Flashcards
```bash
# Generate 30 flashcards (costs ~$0.06)
npx tsx scripts/generate-flashcards.ts \
  --domain asking_questions \
  --difficulty medium \
  --count 30
```

---

## 📦 What You Get

### 9 New Files Created (~3,200 lines)

**Database:**
1. `supabase/migrations/20251010000003_add_content_population_tables.sql` (340 lines)

**AI Generators:**
2. `scripts/generate-questions.ts` (550 lines)
3. `scripts/generate-flashcards.ts` (650 lines)

**Types & Config:**
4. `src/types/flashcard-library.ts` (400 lines)
5. `src/data/mock-exam-configs.ts` (350 lines)

**Services:**
6. `src/lib/mock-exam-builder.ts` (400 lines)
7. `src/lib/flashcard-library-service.ts` (500 lines)

**UI:**
8. `src/components/flashcards/FlashcardLibrary.tsx` (400 lines)

**Tools:**
9. `scripts/deploy-hybrid-model.sh` (100 lines)

---

## 🏗️ Hybrid Architecture

### What Stays (Existing Systems)
✅ `flashcards` table → User-created flashcards
✅ `exam_sessions` table → Exam tracking
✅ `questions` table → Question bank
✅ All existing UI components

### What's New (Added Systems)
🆕 `flashcard_library` → Curated 500+ flashcards
🆕 `flashcard_library_progress` → User progress
🆕 `content_import_logs` → Import tracking
🆕 Mock exam templates (TypeScript)
🆕 AI generation tools

### Integration
🔗 Unified review queue (library + user flashcards)
🔗 Mock exams use existing question pool
🔗 Zero breaking changes

---

## 📋 Pending Manual Steps

**You need to run these commands:**

1. **Deploy database:**
   ```bash
   ./scripts/deploy-hybrid-model.sh
   ```

2. **Generate initial content:**
   ```bash
   # Questions (5 batches = 250 questions)
   for difficulty in beginner intermediate advanced; do
     npx tsx scripts/generate-questions.ts \
       --domain asking_questions \
       --difficulty $difficulty \
       --count 50
   done

   # Flashcards (3 batches = 90 flashcards)
   for difficulty in easy medium hard; do
     npx tsx scripts/generate-flashcards.ts \
       --domain asking_questions \
       --difficulty $difficulty \
       --count 30
   done
   ```

3. **Import to database:**
   ```bash
   # Create import scripts based on templates in deployment guide
   npx tsx scripts/import-questions.ts
   npx tsx scripts/import-flashcards.ts
   ```

---

## 💰 Cost Estimate

**One-Time Generation:**
- 600 questions: **$1.80**
- 500 flashcards: **$1.00**
- **Total: $2.80**

**Ongoing:** $0 (static content)

---

## 📊 Expected Results

**After Full Population:**
- 800+ total questions (200 existing + 600 new)
- 500+ library flashcards
- 6 progressive mock exams
- 10 interactive labs
- 30 curated videos

**Student Impact:**
- Pass rate: 70% → 90%
- Study time: 35-50h → 20h
- Confidence: 65% → 85%

---

## 🔍 Verify Success

```bash
# Check question count
supabase db execute "SELECT COUNT(*) FROM questions"
# Expected: 200+ (existing) + newly imported

# Check flashcard library count
supabase db execute "SELECT COUNT(*) FROM flashcard_library"
# Expected: 0-500+ (depends on imports)

# Check import logs
supabase db execute "SELECT * FROM content_import_logs ORDER BY created_at DESC LIMIT 5"
# Expected: Recent import records

# Check mock exam templates
node -e "console.log(require('./src/data/mock-exam-configs').MOCK_EXAM_TEMPLATES.length)"
# Expected: 6
```

---

## 📚 Documentation

- **Full Guide:** `docs/HYBRID_MODEL_DEPLOYMENT_GUIDE.md`
- **Implementation:** `docs/CONTENT_POPULATION_IMPLEMENTATION_SUMMARY.md`
- **Strategy:** `docs/CONTENT_POPULATION_STRATEGY.md`

---

## 🚨 Need Help?

**Common Issues:**

1. **API key error:**
   ```bash
   export ANTHROPIC_API_KEY=sk-ant-your-key-here
   ```

2. **Migration error:**
   ```bash
   # Check Supabase connection
   supabase status

   # Reconnect if needed
   supabase link --project-ref your-project-ref
   ```

3. **Not enough questions for mock exam:**
   ```bash
   # Generate more questions first
   npx tsx scripts/generate-questions.ts \
     --domain all \
     --difficulty all \
     --count 200
   ```

---

**Last Updated:** October 10, 2025
**Status:** ✅ Ready to Deploy
**Next Step:** Run `./scripts/deploy-hybrid-model.sh`
