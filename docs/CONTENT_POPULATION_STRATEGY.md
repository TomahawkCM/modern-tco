# Content Population Strategy - Tanium TCO Platform

**Status:** Planning Phase
**Goal:** Populate platform with world-class content to reach 100% student readiness
**Timeline:** 4-6 weeks (phased approach)

---

## 📊 Current Content Inventory

### ✅ What We Have (Production-Ready)

#### 1. Study Content (MDX Modules)
- **6 comprehensive modules** (11.6 hours total, 16,849 lines)
- **83 micro-sections** with embedded assessments
- **140+ inline questions** integrated into content
- **50+ InfoBoxes** and PracticeButtons
- **Quality Score:** 9.2/10

#### 2. Question Bank
- **200 questions** in `imported-questions-master.ts`
- Distributed across all 6 TCO domains
- TypeScript format with full metadata
- **Quality:** High (detailed explanations, tags, references)

#### 3. Videos
- **9 videos defined** in `tco-videos.ts`
- **Total watch time:** ~2.5 hours
- **Issue:** Some have placeholder URLs (help.tanium.com)
- **Need:** 15-20 additional curated videos

#### 4. Infrastructure (100% Complete)
- Video analytics system ✅
- Interactive lab framework ✅
- Assessment engine ✅
- Spaced repetition system ✅
- AI personalization ✅

---

## 🎯 Content Population Goals

### Phase 1: Question Bank Expansion (Week 1-2)
**Goal:** Expand from 200 → 800+ questions

**Strategy:**
1. **AI-Generated Questions** (400 questions)
   - Use Claude 3.5 Sonnet to generate domain-specific questions
   - Based on official Tanium documentation
   - Validated against TCO exam blueprint
   - 3 difficulty levels per topic

2. **Import Existing Questions** (200 questions)
   - Check for additional legacy question files
   - Import from domain-specific TypeScript files:
     - `questions-asking.ts`
     - `questions-navigation.ts`
     - `questions-refining.ts`
     - `questions-reporting.ts`
     - `questions-taking.ts`

3. **Expert Review Questions** (100 questions)
   - Curated from Tanium University materials
   - Official certification practice questions
   - Community-contributed questions

4. **Scenario-Based Questions** (100 questions)
   - Real-world troubleshooting scenarios
   - Multi-step problem-solving questions
   - Performance-based testing (PBT) style

**Distribution by Domain (TCO Blueprint Alignment):**
- Asking Questions (22%): ~176 questions
- Refining & Targeting (23%): ~184 questions
- Taking Action (15%): ~120 questions
- Navigation (23%): ~184 questions
- Reporting (17%): ~136 questions

**Tools Needed:**
- [ ] AI question generation script (Claude API)
- [ ] Legacy question import tool
- [ ] Question validation & deduplication tool
- [ ] Bulk import to Supabase script

---

### Phase 2: Video Curation & Integration (Week 2-3)
**Goal:** Curate 25-30 high-quality videos covering all TCO domains

**Strategy:**

#### 2.1 Find Real Videos (Replace Placeholders)
**Current placeholders to replace (7 videos):**
1. `tco-navigation-basics` - Help.tanium.com placeholder
2. `mastering-interact-part1` - Help.tanium.com placeholder
3. `mastering-interact-part2` - Help.tanium.com placeholder
4. `tco-package-deployment` - Help.tanium.com placeholder
5. `tco-targeting-filtering` - Help.tanium.com placeholder
6. `tco-reporting-basics` - Help.tanium.com placeholder
7. `tco-practice-scenarios` - Help.tanium.com placeholder

**Sources:**
- Tanium YouTube Channel (official)
- Tanium Tech Talks series
- SecuritySenses TCO series
- Community expert tutorials

#### 2.2 Add New Videos (15-20 videos)
**By Domain:**

**Asking Questions (5 videos):**
- "Sensor Library Deep Dive" (15 min)
- "Advanced Question Syntax" (12 min)
- "Saved Questions Best Practices" (10 min)
- "Question Performance Optimization" (8 min)
- "Common Question Mistakes" (10 min)

**Refining & Targeting (5 videos):**
- "Computer Groups Masterclass" (20 min)
- "Advanced Filtering Techniques" (15 min)
- "RBAC and Scoping" (12 min)
- "Targeting Strategies" (10 min)
- "Filter Performance Tips" (8 min)

**Taking Action (4 videos):**
- "Package Development 101" (25 min)
- "Action Deployment Workflows" (18 min)
- "Monitoring Action Status" (10 min)
- "Rollback and Recovery" (12 min)

**Navigation & Modules (5 videos):**
- "Console Navigation Tour" (15 min)
- "Trends Module Deep Dive" (20 min)
- "Connect Integration Basics" (18 min)
- "Module Administration" (12 min)
- "Dashboard Customization" (10 min)

**Reporting & Export (4 videos):**
- "Report Builder Tutorial" (20 min)
- "Data Export Methods" (15 min)
- "Scheduled Reports" (10 min)
- "Connect Destinations" (12 min)

**Exam Strategy (3 videos):**
- "TCO Exam Format & Tips" (15 min)
- "Time Management Strategies" (10 min)
- "Last-Minute Review" (12 min)

**Tools Needed:**
- [ ] YouTube video search & validation script
- [ ] Video metadata extractor (duration, transcript)
- [ ] Bulk video import tool
- [ ] Video quality checker (resolution, captions)

---

### Phase 3: Interactive Labs (Week 3-4)
**Goal:** 10 hands-on labs covering practical TCO skills

**Existing Labs to Import (5 labs):**
According to context, we have "5 interactive labs (69 minutes) ready to import"
- Need to locate these lab definitions
- Import into lab framework
- Test all validation logic

**New Labs to Create (5 labs):**

1. **"Your First Tanium Question" (10 min)**
   - Guided walkthrough of Interact module
   - Create simple natural language query
   - Understand question results
   - Save question for reuse

2. **"Building Computer Groups" (12 min)**
   - Create static computer group
   - Create dynamic computer group
   - Nest groups for complex targeting
   - Test group membership

3. **"Deploying Your First Package" (15 min)**
   - Select pre-built package
   - Configure package parameters
   - Target specific computer group
   - Monitor deployment progress

4. **"Creating a Custom Report" (12 min)**
   - Build multi-sensor question
   - Format question results
   - Export to CSV
   - Schedule automated report

5. **"Troubleshooting with Tanium" (15 min)**
   - Investigate endpoint issue
   - Use sensors to gather data
   - Take corrective action
   - Verify resolution

**Lab Components:**
- Step-by-step instructions with screenshots
- Validation checkpoints (auto-grading)
- Hint system (4 levels: subtle → explicit)
- Estimated completion time
- Certificate of completion

**Tools Needed:**
- [ ] Lab definition schema
- [ ] Lab import/export tool
- [ ] Lab preview system
- [ ] Lab progress tracking

---

### Phase 4: Flashcards & Study Aids (Week 4-5)
**Goal:** 500+ flashcards for active recall practice

**Flashcard Categories:**

#### 4.1 Terminology Flashcards (150 cards)
- Key Tanium concepts
- Platform terminology
- Module names and purposes
- Technical definitions

**Example:**
```
Front: What is a "sensor" in Tanium?
Back: A script or query that runs on endpoints to retrieve specific data. Tanium includes 500+ built-in sensors covering OS, hardware, applications, and security information.
Tags: [definitions, sensors, platform-fundamentals]
```

#### 4.2 Syntax & Commands (100 cards)
- Natural language query syntax
- Common sensor usage patterns
- Filter syntax examples
- Package parameter formats

#### 4.3 Best Practices (100 cards)
- Question optimization tips
- Security best practices
- Performance recommendations
- Troubleshooting techniques

#### 4.4 Exam-Focused (150 cards)
- High-frequency exam topics
- Common exam traps
- Quick reference formulas
- Memorization aids

**Tools Needed:**
- [ ] Flashcard generation script (AI-powered)
- [ ] Flashcard import tool
- [ ] Flashcard database schema
- [ ] Spaced repetition integration

---

### Phase 5: Mock Exams (Week 5-6)
**Goal:** 6 full-length mock exams + 12 domain-specific practice tests

**Full Mock Exams (6 exams):**
- **75 questions each** (matches real TAN-1000 format)
- **105 minutes** timed format
- **Domain distribution** matches TCO blueprint:
  - Asking Questions: 22% (16-17 questions)
  - Refining & Targeting: 23% (17-18 questions)
  - Taking Action: 15% (11-12 questions)
  - Navigation: 23% (17-18 questions)
  - Reporting: 17% (12-13 questions)

**Mock Exam Difficulty Progression:**
1. **Exam 1:** 60% Easy, 30% Medium, 10% Hard (Diagnostic)
2. **Exam 2:** 50% Easy, 40% Medium, 10% Hard (Foundation)
3. **Exam 3:** 40% Easy, 45% Medium, 15% Hard (Intermediate)
4. **Exam 4:** 30% Easy, 50% Medium, 20% Hard (Advanced)
5. **Exam 5:** 25% Easy, 50% Medium, 25% Hard (Pre-Exam)
6. **Exam 6:** 20% Easy, 50% Medium, 30% Hard (Final Challenge)

**Domain-Specific Practice Tests (12 tests):**
- **2 tests per domain** (25 questions each, 35 minutes)
- Focused deep-dive into single domain
- Immediate feedback after each question
- Targeted remediation recommendations

**Mock Exam Features:**
- Randomized question order
- Timed countdown with warnings (10 min, 5 min, 1 min)
- Flagging system (mark for review)
- Simulated exam environment (no distractions)
- Detailed score report with domain breakdown
- Performance comparison vs previous attempts
- Weak area identification with study recommendations

**Tools Needed:**
- [ ] Mock exam builder tool
- [ ] Exam question randomizer
- [ ] Exam timer component (already exists)
- [ ] Score report generator (already exists)
- [ ] Exam import/export tool

---

## 🔧 Technical Implementation Plan

### Database Schema Updates

#### 1. Flashcards Table
```sql
CREATE TABLE IF NOT EXISTS public.flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  domain TEXT NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  tags TEXT[] DEFAULT '{}',
  study_guide_ref TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### 2. Student Flashcard Progress
```sql
CREATE TABLE IF NOT EXISTS public.student_flashcard_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  flashcard_id UUID NOT NULL REFERENCES public.flashcards(id),
  ease_factor DECIMAL(3,2) DEFAULT 2.50,
  interval_days INTEGER DEFAULT 1,
  next_review_date DATE NOT NULL,
  review_count INTEGER DEFAULT 0,
  last_reviewed_at TIMESTAMPTZ,
  UNIQUE(user_id, flashcard_id)
);
```

#### 3. Mock Exams Table
```sql
CREATE TABLE IF NOT EXISTS public.mock_exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  difficulty_level TEXT,
  total_questions INTEGER NOT NULL,
  time_limit_minutes INTEGER NOT NULL,
  question_ids TEXT[] NOT NULL, -- Array of question IDs
  domain_distribution JSONB, -- {"asking_questions": 22, "refining_targeting": 23, ...}
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### 4. Mock Exam Attempts
```sql
CREATE TABLE IF NOT EXISTS public.mock_exam_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  mock_exam_id UUID NOT NULL REFERENCES public.mock_exams(id),
  score_percentage DECIMAL(5,2) NOT NULL,
  time_taken_minutes INTEGER NOT NULL,
  domain_scores JSONB, -- {"asking_questions": 78.5, ...}
  correct_count INTEGER NOT NULL,
  total_count INTEGER NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 🤖 AI-Powered Content Generation

### Question Generation Prompt Template

```
You are an expert Tanium TCO (Certified Operator) exam question writer. Generate 10 high-quality multiple-choice questions for the following domain:

**Domain:** {domain_name}
**Difficulty:** {difficulty_level}
**Topics:** {topic_list}
**Exam Blueprint Weight:** {blueprint_weight}%

For each question:
1. Write a clear, concise question stem (1-2 sentences)
2. Provide 4 answer choices (A, B, C, D)
3. Identify the correct answer
4. Write a detailed explanation (2-3 sentences) explaining why the correct answer is right and why others are wrong
5. Add 3-5 relevant tags
6. Include study guide reference

Ensure questions test:
- Practical application (not just memorization)
- Real-world scenarios
- TCO certification objectives
- Tanium platform knowledge

Output format: JSON array matching this schema:
[{
  "question": "...",
  "choices": [{"id": "a", "text": "..."}],
  "correctAnswerId": "a",
  "domain": "asking_questions",
  "difficulty": "medium",
  "explanation": "...",
  "tags": ["interact", "sensors"],
  "studyGuideRef": "..."
}]
```

### Video Discovery Prompt Template

```
Find 5 high-quality YouTube videos about Tanium TCO certification for the domain: {domain_name}

Search criteria:
- Official Tanium content preferred
- Duration: 10-30 minutes
- Published within last 3 years
- Clear audio and video quality
- English language
- Has captions/subtitles

For each video, provide:
1. Video title
2. YouTube URL
3. Duration (seconds)
4. Description (2-3 sentences)
5. Difficulty level (Beginner/Intermediate/Advanced)
6. Relevant tags
7. Thumbnail URL

Output format: JSON array
```

---

## 📈 Success Metrics

### Content Quantity Targets
- [x] **Questions:** 200 → 800+ (4x increase)
- [x] **Videos:** 9 → 30+ (3.3x increase)
- [x] **Labs:** 0 → 10 (new capability)
- [x] **Flashcards:** 0 → 500+ (new capability)
- [x] **Mock Exams:** 0 → 6 full + 12 domain tests (new capability)

### Content Quality Targets
- **Question Quality Score:** >8.5/10 (expert review)
- **Video Engagement:** >70% completion rate
- **Lab Completion:** >80% students complete at least 5 labs
- **Flashcard Retention:** >75% accuracy after 3 reviews
- **Mock Exam Predictiveness:** Correlation >0.85 with real exam scores

### Student Impact Targets
- **Pass Rate:** 70% → 90%+ (+29%)
- **Study Time:** 35-50h → 20-25h (-50%)
- **Confidence:** 65% → 85%+ (+31%)
- **Engagement:** 45% DAU → 70% DAU (+56%)

---

## 🚀 Implementation Timeline

### Week 1-2: Question Bank Expansion
- **Day 1-2:** Build AI question generation tool
- **Day 3-4:** Generate 400 AI questions, validate quality
- **Day 5-6:** Import legacy questions from TypeScript files
- **Day 7-9:** Expert review and curation
- **Day 10:** Bulk import to Supabase, validate distribution

**Deliverable:** 800+ questions across all domains in production database

---

### Week 2-3: Video Curation & Integration
- **Day 1-3:** YouTube video search and quality validation
- **Day 4-5:** Replace 7 placeholder videos with real content
- **Day 6-8:** Add 15-20 new curated videos
- **Day 9-10:** Extract video metadata, generate thumbnails
- **Day 11:** Bulk video import, test video analytics

**Deliverable:** 25-30 high-quality videos with full metadata and analytics

---

### Week 3-4: Interactive Labs
- **Day 1-2:** Locate and import 5 existing lab definitions
- **Day 3-5:** Create 5 new lab scenarios with validation logic
- **Day 6-7:** Build lab preview and testing system
- **Day 8:** User acceptance testing with 5 beta testers
- **Day 9:** Bug fixes and improvements
- **Day 10:** Production deployment

**Deliverable:** 10 interactive labs with auto-grading and certificates

---

### Week 4-5: Flashcards & Study Aids
- **Day 1-2:** Design flashcard database schema and API
- **Day 3-5:** AI-generate 500+ flashcards across all categories
- **Day 6-7:** Build flashcard review interface with spaced repetition
- **Day 8-9:** Integrate with existing spaced repetition system
- **Day 10:** User testing and refinement

**Deliverable:** 500+ flashcards with spaced repetition algorithm

---

### Week 5-6: Mock Exams
- **Day 1-2:** Build mock exam creation tool
- **Day 3-5:** Create 6 full mock exams with difficulty progression
- **Day 6-7:** Create 12 domain-specific practice tests
- **Day 8-9:** Build detailed score reporting with remediation
- **Day 10:** Performance testing with 50 concurrent exam-takers

**Deliverable:** 6 full mock exams + 12 domain tests in production

---

## 🛠️ Tools & Scripts to Build

### Priority 1 (Week 1)
1. **AI Question Generator** (`scripts/generate-questions.ts`)
2. **Legacy Question Importer** (`scripts/import-legacy-questions.ts`)
3. **Question Validator** (`scripts/validate-questions.ts`)
4. **Bulk Supabase Importer** (`scripts/bulk-import-questions.ts`)

### Priority 2 (Week 2-3)
5. **YouTube Video Searcher** (`scripts/search-youtube-videos.ts`)
6. **Video Metadata Extractor** (`scripts/extract-video-metadata.ts`)
7. **Video Quality Checker** (`scripts/check-video-quality.ts`)
8. **Bulk Video Importer** (`scripts/bulk-import-videos.ts`)

### Priority 3 (Week 3-4)
9. **Lab Definition Parser** (`scripts/parse-lab-definitions.ts`)
10. **Lab Import Tool** (`scripts/import-labs.ts`)
11. **Lab Preview Builder** (`components/LabPreview.tsx`)
12. **Lab Progress Tracker** (`lib/labProgress.ts`)

### Priority 4 (Week 4-5)
13. **Flashcard Generator** (`scripts/generate-flashcards.ts`)
14. **Flashcard Importer** (`scripts/import-flashcards.ts`)
15. **Flashcard Review Interface** (`components/FlashcardReview.tsx`)

### Priority 5 (Week 5-6)
16. **Mock Exam Builder** (`scripts/build-mock-exam.ts`)
17. **Exam Question Randomizer** (`lib/examRandomizer.ts`)
18. **Score Report Generator** (`components/ExamScoreReport.tsx`)

---

## 📝 Next Steps (Immediate Actions)

1. **Create Content Management Dashboard** - Central hub for importing/managing all content types
2. **Build AI Question Generator** - Start with 100 questions to validate quality
3. **YouTube Video Research** - Find 5 videos to replace top-priority placeholders
4. **Lab Schema Definition** - Formalize lab structure for import
5. **Database Migrations** - Add flashcards and mock_exams tables

**Start Date:** October 10, 2025
**Target Completion:** November 20, 2025 (6 weeks)
**Owner:** Content Population Team

---

**Next:** Begin with Week 1 - Question Bank Expansion
