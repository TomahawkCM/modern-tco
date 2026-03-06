---
name: gamification-engine
description: Use when implementing streaks, badges, challenges, celebration animations, or any reward/motivation mechanics in the budget app.
---

# Gamification Engine

## Overview

Implements engagement and motivation mechanics — daily/weekly streaks, achievement badges, challenges, and celebration animations. Reuses the LMS gamification infrastructure (contexts, badge system) adapted for personal finance behaviors like logging transactions, staying under budget, and reaching savings goals.

## When to Use

- Adding streak tracking (daily login, daily logging)
- Creating achievement badges
- Building challenge templates (savings challenges, no-spend days)
- Implementing celebration animations (confetti, milestones)
- Adding XP/points system for budget behaviors

## Core Principles

- **Intrinsic motivation first** — Gamification supports good financial habits, not replaces motivation
- **Reuse LMS infrastructure** — The LMS already has badge, progress, and achievement systems in `src/contexts/`
- **Celebrate milestones** — 7, 14, 30, 60, 90, 180, 365 days deserve recognition
- **Streak freeze** — Allow 2 freezes per month to prevent frustration
- **No punishment** — Breaking a streak is acknowledged gently, not punished

## Workflow

### Step 1: Define Streak Types

```ts
interface StreakConfig {
  id: string;
  name: string;
  description: string;
  frequency: 'daily' | 'weekly';
  condition: (userData: UserData) => boolean;
  freezesPerMonth: number;
  milestones: number[]; // days
}

const STREAKS: StreakConfig[] = [
  {
    id: 'daily-log',
    name: 'Logging Streak',
    description: 'Log at least one transaction every day',
    frequency: 'daily',
    condition: (data) => data.transactionsLoggedToday > 0,
    freezesPerMonth: 2,
    milestones: [7, 14, 30, 60, 90, 180, 365],
  },
  {
    id: 'weekly-review',
    name: 'Review Streak',
    description: 'Review your spending every week',
    frequency: 'weekly',
    condition: (data) => data.weeklyReviewCompleted,
    freezesPerMonth: 1,
    milestones: [4, 8, 12, 26, 52],
  },
  {
    id: 'under-budget',
    name: 'Budget Streak',
    description: 'Stay under budget for consecutive months',
    frequency: 'monthly',
    condition: (data) => data.totalSpent.lte(data.totalBudget),
    freezesPerMonth: 0,
    milestones: [1, 3, 6, 12],
  },
];
```

### Step 2: Streak Tracking Logic

```ts
interface StreakState {
  streakId: string;
  currentCount: number;
  longestCount: number;
  lastCompletedDate: string; // ISO date
  freezesUsedThisMonth: number;
  isFrozen: boolean;
}

function updateStreak(state: StreakState, completed: boolean, today: string): StreakState {
  const lastDate = new Date(state.lastCompletedDate);
  const currentDate = new Date(today);
  const daysDiff = Math.floor((currentDate.getTime() - lastDate.getTime()) / 86400000);

  if (completed) {
    return {
      ...state,
      currentCount: daysDiff <= 1 ? state.currentCount + 1 : 1,
      longestCount: Math.max(state.longestCount, state.currentCount + 1),
      lastCompletedDate: today,
    };
  }

  // Missed day - use freeze if available
  if (daysDiff === 1 && state.freezesUsedThisMonth < 2) {
    return {
      ...state,
      freezesUsedThisMonth: state.freezesUsedThisMonth + 1,
      isFrozen: true,
    };
  }

  // Streak broken
  return { ...state, currentCount: 0, isFrozen: false };
}
```

### Step 3: Badge/Achievement System

```ts
interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; // Lucide icon name
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  condition: (stats: UserStats) => boolean;
}

const BADGES: Badge[] = [
  { id: 'first-transaction', name: 'First Step', description: 'Log your first transaction', icon: 'footprints', tier: 'bronze', condition: (s) => s.totalTransactions >= 1 },
  { id: 'century', name: 'Century', description: 'Log 100 transactions', icon: 'trophy', tier: 'silver', condition: (s) => s.totalTransactions >= 100 },
  { id: 'budget-master', name: 'Budget Master', description: 'Stay under budget for 6 months', icon: 'crown', tier: 'gold', condition: (s) => s.monthsUnderBudget >= 6 },
  { id: 'saver', name: 'Super Saver', description: 'Save $10,000 total', icon: 'piggy-bank', tier: 'platinum', condition: (s) => s.totalSaved >= 10000 },
  // ... more badges
];
```

### Step 4: Milestone Celebrations

```tsx
import confetti from 'canvas-confetti';

function celebrateMilestone(milestone: number) {
  // Fire confetti animation
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#10b981', '#059669', '#047857'], // Budget green theme
  });
}

// Milestone celebration component
function MilestoneToast({ streak, milestone }: Props) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 p-4 text-white">
      <span className="text-3xl">🔥</span>
      <div>
        <p className="font-bold">{milestone}-Day Streak!</p>
        <p className="text-sm opacity-90">{streak.name} — Keep it going!</p>
      </div>
    </div>
  );
}
```

### Step 5: Challenge Templates

```ts
interface Challenge {
  id: string;
  name: string;
  description: string;
  duration: number; // days
  target: ChallengeTarget;
  reward: string; // badge ID
}

const CHALLENGES: Challenge[] = [
  {
    id: 'no-spend-week',
    name: 'No-Spend Week',
    description: 'Go 7 days without non-essential purchases',
    duration: 7,
    target: { type: 'max-spending', amount: 0, categories: ['entertainment', 'shopping', 'dining'] },
    reward: 'no-spend-champion',
  },
  {
    id: 'savings-sprint',
    name: '30-Day Savings Sprint',
    description: 'Save an extra $500 in 30 days',
    duration: 30,
    target: { type: 'save-amount', amount: 500 },
    reward: 'sprint-saver',
  },
];
```

## Key Files

| File | Role |
|------|------|
| `src/contexts/` | Existing LMS gamification contexts to reuse |
| `src/components/budget/` | UI components for streaks/badges |
| `src/lib/analytics/` | User behavior tracking for streak calculation |

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Punishing streak breaks harshly | Use gentle messaging + streak freeze option |
| Making gamification the primary motivation | It supports habits, doesn't create them |
| Too many badges diluting meaning | Keep badges meaningful, max 30-40 total |
| Not persisting streak state across sessions | Store in encrypted IndexedDB |
| Confetti on every minor action | Reserve celebrations for real milestones |

## Validation Checklist

- [ ] Streak logic handles timezone differences correctly
- [ ] Streak freeze works (max 2/month)
- [ ] Milestone celebrations trigger at correct thresholds
- [ ] Badge conditions tested with edge cases
- [ ] All gamification data encrypted (stored via EncryptedDB)
- [ ] Celebrations don't block UI interaction
- [ ] Gentle messaging for streak breaks

## Related Skills

- `onboarding-wizard` — initial gamification setup during onboarding
- `dashboard-builder` — streak/badge widgets for dashboard
- `e2e-encryption` — gamification data must be encrypted
