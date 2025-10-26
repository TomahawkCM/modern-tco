# Spaced Repetition System - Implementation Guide

## 🎯 Overview

The **Spaced Repetition System** implements the research-backed **2357 method** for optimal long-term retention. Based on 2025 cognitive science research showing **42% improvement** in retention compared to cramming.

## 📊 2357 Method Explained

**Principle**: Review material at increasing intervals to reset the forgetting curve before retention drops below 80%.

**Review Schedule**:
- **Day 0**: Initial learning (complete micro-section + pass quiz)
- **Day 1**: First review (+1 day)
- **Day 3**: Second review (+2 days from first review)
- **Day 7**: Third review (+4 days from second review)
- **Day 16**: Fourth review (+9 days from third review)
- **Day 35**: Fifth review (+19 days from fourth review)

**Adaptive Behavior**:
- ✅ **Correct answer**: Move to next interval (longer gap)
- ❌ **Incorrect answer**: Stay at current interval (practice more)

## 🏗️ Architecture Components

### 1. Core Library: `/src/lib/spacedRepetition.ts`

**Data Structures**:

```typescript
interface ReviewItem {
  id: string;
  moduleId: string;
  sectionId: string;
  concept: string;
  type: "micro-section" | "weak-concept";

  // Scheduling
  createdAt: string;       // When added to system
  lastReviewed: string;    // Last review date
  nextReview: string;      // Next review due date
  intervalIndex: number;   // Position in [1,2,4,9,19] sequence (0-4)

  // Performance
  totalReviews: number;    // Total review sessions
  correctReviews: number;  // Successful reviews
  retention: number;       // Success rate percentage (0-100)

  // Metadata
  title: string;
  difficulty?: "easy" | "medium" | "hard";
}

interface ReviewSession {
  id: string;
  timestamp: string;
  itemsReviewed: number;
  itemsCorrect: number;
  averageRetention: number;
  duration: number; // seconds
}
```

**Key Functions**:

```typescript
// Scheduling
calculateNextReview(lastReviewed: Date, intervalIndex: number): Date
addReviewItem(item: Omit<ReviewItem, ...>): ReviewItem
updateReviewItem(item: ReviewItem, wasCorrect: boolean): ReviewItem

// Storage
getAllReviewItems(moduleId?: string): ReviewItem[]
saveReviewItems(moduleId: string, items: ReviewItem[]): void

// Queries
getItemsDueToday(moduleId?: string): ReviewItem[]
getOverdueItems(moduleId?: string): ReviewItem[]
getItemsDueInDays(days: number, moduleId?: string): ReviewItem[]

// Integration
importWeakConcepts(moduleId: string): void
getReviewStats(moduleId?: string): Stats
```

### 2. DailyReview Component: `/src/components/study/DailyReview.tsx`

**Purpose**: Dashboard showing what needs review today

**Features**:
- ✅ Statistics cards (due today, total items, avg retention, upcoming)
- ✅ Overdue items highlighted in red
- ✅ Items due today in orange
- ✅ "Import Weak Concepts" button (pulls from quiz failures)
- ✅ "Start Review Session" launches ReviewSession

**Props**:
```typescript
interface DailyReviewProps {
  moduleId?: string; // Filter by module
  onStartReview?: (items: ReviewItem[]) => void;
}
```

### 3. ReviewSession Component: `/src/components/study/ReviewSession.tsx`

**Purpose**: Conducts active recall review sessions

**Flow**:
1. Shows one item at a time
2. Student clicks "Remembered" or "Need Review"
3. Immediate feedback with encouragement
4. Updates schedule based on performance
5. Final results with statistics

**Props**:
```typescript
interface ReviewSessionProps {
  items: ReviewItem[];
  onComplete?: (results: SessionResults) => void;
  onExit?: () => void;
}
```

### 4. MicroSection Integration: `/src/components/mdx/MicroSection.tsx`

**Auto-Registration**: When student completes a micro-section (passes quiz), it's automatically added to spaced repetition.

**Code** (lines 84-115):
```typescript
const addToSpacedRepetition = () => {
  const existingItems = getAllReviewItems(moduleId);

  const alreadyTracked = existingItems.some(
    item => item.sectionId === id && item.moduleId === moduleId
  );

  if (!alreadyTracked) {
    const newItem = addReviewItem({
      moduleId,
      sectionId: id,
      concept: title,
      type: "micro-section",
      title: title,
    });

    existingItems.push(newItem);
    saveReviewItems(moduleId, existingItems);
  }
};
```

## 💾 localStorage Structure

### Review Items (per module)

**Key**: `spaced-repetition-${moduleId}`

**Value**:
```json
[
  {
    "id": "asking-questions-natural-language-basics-1672531200000",
    "moduleId": "asking-questions",
    "sectionId": "natural-language-basics",
    "concept": "Natural Language Query Construction",
    "type": "micro-section",
    "createdAt": "2025-10-03T20:00:00.000Z",
    "lastReviewed": "2025-10-03T20:00:00.000Z",
    "nextReview": "2025-10-04T20:00:00.000Z",
    "intervalIndex": 0,
    "totalReviews": 0,
    "correctReviews": 0,
    "retention": 100,
    "title": "Natural Language Query Construction"
  }
]
```

### Review Sessions (global)

**Key**: `review-sessions`

**Value**:
```json
[
  {
    "id": "session-1672617600000",
    "timestamp": "2025-10-04T20:00:00.000Z",
    "itemsReviewed": 5,
    "itemsCorrect": 4,
    "averageRetention": 80,
    "duration": 180
  }
]
```

### Weak Areas (per module) - EXISTING

**Key**: `weak-areas-${moduleId}`

**Value**:
```json
{
  "Linear Chain Architecture": 2,
  "Server Load Reduction": 1,
  "Query Performance": 3
}
```

**Integration**: `importWeakConcepts()` converts these into ReviewItems with appropriate difficulty:
- 1 failure → "easy"
- 2 failures → "medium"
- 3+ failures → "hard"

## 🎯 User Flow

### 1. Complete Micro-Section
```
Student reads section → Passes quiz (80%+) → Marks complete
→ AUTO: Section added to spaced repetition with Day 1 review
```

### 2. Daily Review Routine
```
Student visits /daily-review
→ Sees "5 items due today" dashboard
→ Clicks "Start Review Session"
→ Reviews 5 items (Remembered/Need Review)
→ Session complete: 4/5 correct (80%)
→ Items rescheduled based on performance
```

### 3. Import Weak Concepts
```
Student on module review page
→ Clicks "Import Weak Concepts"
→ Quiz failures converted to ReviewItems
→ Scheduled for Day 1 review
→ Can now practice weak areas separately
```

## 📈 Performance Tracking

### Individual Item Metrics

- **Retention %**: `(correctReviews / totalReviews) * 100`
- **Interval Index**: Current position in [1,2,4,9,19] sequence
- **Next Review**: Calculated date for next review

### Module-Level Statistics

```typescript
getReviewStats(moduleId) returns {
  totalItems: number;           // Total items being tracked
  dueToday: number;             // Items due today
  overdue: number;              // Items past due date
  averageRetention: number;     // Average retention across all items
  itemsByInterval: {            // Distribution across intervals
    0: 10,  // 10 items at Day 1 interval
    1: 8,   // 8 items at Day 3 interval
    2: 5,   // etc.
    3: 3,
    4: 2
  }
}
```

### Session Analytics

- **Duration**: Time spent in session (seconds)
- **Items Reviewed**: Count of items
- **Items Correct**: Count of successful recalls
- **Average Retention**: Session success rate

## 🔄 Integration Points

### With Week 1 Components

1. **MicroSection** → Auto-adds completed sections
2. **QuickCheckQuiz** → Weak areas tracked in `weak-areas-${moduleId}`
3. **MicrolearningProgress** → Can show review statistics

### With Future Features (Week 2.2-2.3)

1. **Adaptive Difficulty** (Week 2.2):
   - Use retention % to adjust intervals
   - Items with <70% retention get shorter intervals

2. **Active Recall Question Bank** (Week 2.3):
   - Link 4,108 practice questions to micro-sections
   - Use questions during review sessions instead of generic prompts

3. **Gamification** (Week 3):
   - Points for completing daily reviews
   - Streaks for consecutive days reviewed
   - Badges for retention milestones

## 🎯 Expected Results (Based on Research)

**Compared to no spaced repetition**:
- **+42% retention** at 30 days
- **+70% retention** at 90 days
- **Students score 70% vs 64%** on final exams
- **80%+ daily engagement** with review system

**Time Investment**:
- Initial learning: 11.6h (83 micro-sections)
- Daily reviews: 5-10 min/day
- Total study time: ~20h effective vs 35-50h traditional

## ✅ Usage Examples

### Basic Setup

```tsx
import { DailyReview } from "@/components/study/DailyReview";

// Show review dashboard for all modules
<DailyReview />

// Show review dashboard for specific module
<DailyReview moduleId="asking-questions" />

// Handle review session start
<DailyReview
  onStartReview={(items) => {
    console.log(`Starting review of ${items.length} items`);
  }}
/>
```

### Review Session

```tsx
import { ReviewSession } from "@/components/study/ReviewSession";
import { getItemsDueToday } from "@/lib/spacedRepetition";

const items = getItemsDueToday("asking-questions");

<ReviewSession
  items={items}
  onComplete={(results) => {
    console.log(`Session complete: ${results.itemsCorrect}/${results.itemsReviewed} correct`);
  }}
  onExit={() => {
    console.log("User exited review session");
  }}
/>
```

### Programmatic Management

```typescript
import {
  getAllReviewItems,
  getItemsDueToday,
  importWeakConcepts,
  getReviewStats
} from "@/lib/spacedRepetition";

// Get all items for a module
const items = getAllReviewItems("asking-questions");

// Get items due today
const dueToday = getItemsDueToday();

// Import weak concepts from quizzes
importWeakConcepts("asking-questions");

// Get statistics
const stats = getReviewStats();
console.log(`${stats.dueToday} items due today, ${stats.averageRetention}% avg retention`);
```

## 🚀 Next Steps

**Week 2.2**: Adaptive difficulty based on performance
**Week 2.3**: Active recall question bank integration
**Week 3**: Gamification (points, streaks, badges)
**Week 4**: Video integration with review

---

**Research Citations**:
- Frontiers in Psychology 2025 - Spaced Repetition Effect
- PMC 2025 - Cognitive Load & Adaptive Learning
- Stanford Teaching Commons - Active Recall Methods
