---
name: onboarding-wizard
description: Use when building or modifying the onboarding flow, first-run experience, or getting-started guide for the budget app.
---

# Onboarding Wizard

## Overview

Designs the first-run experience for new users — a 4-step wizard that takes under 2 minutes. Guides users from "just installed" to "ready to budget" with progressive disclosure, sample data, and a getting-started checklist.

## When to Use

- Building or modifying the initial setup flow
- Adding a "getting started" checklist
- Implementing sample/demo data mode
- Designing first-time user experience for any feature
- Adding progressive disclosure to complex features

## Core Principles

- **Under 2 minutes** — The entire onboarding takes < 2 minutes or users abandon
- **Value before input** — Show what the app can do before asking for data
- **Progressive disclosure** — Introduce features gradually, not all at once
- **Skip-friendly** — Every step has a "Skip for now" option
- **Sample data** — Let users explore with realistic demo data before committing

## Workflow

### Step 1: Define the 4-Step Wizard

```
Step 1: Welcome & Method Quiz (30 sec)
  "How do you want to budget?"
  → Zero-based / Envelope / 50-30-20 / Not sure

Step 2: Income Setup (30 sec)
  "What's your monthly take-home pay?"
  → Single amount input with currency picker
  → "I'll add this later" skip option

Step 3: Category Picker (30 sec)
  "Pick your budget categories"
  → Pre-selected common categories (rent, groceries, transport, etc.)
  → Add/remove with one tap
  → Suggest based on method chosen in Step 1

Step 4: First Budget (30 sec)
  "Set spending limits for your top categories"
  → Pre-filled with suggested amounts based on income + method
  → Adjustable sliders or inputs
  → "Use suggestions" one-tap option
```

### Step 2: Wizard Component Structure

```tsx
interface WizardStep {
  id: string;
  title: string;
  subtitle: string;
  component: React.ComponentType<StepProps>;
  optional: boolean;
  estimatedSeconds: number;
}

const ONBOARDING_STEPS: WizardStep[] = [
  { id: 'method', title: 'Your Budget Style', subtitle: 'How do you want to manage money?', component: MethodQuiz, optional: false, estimatedSeconds: 30 },
  { id: 'income', title: 'Your Income', subtitle: "What's your monthly take-home?", component: IncomeSetup, optional: true, estimatedSeconds: 30 },
  { id: 'categories', title: 'Categories', subtitle: 'What do you spend on?', component: CategoryPicker, optional: false, estimatedSeconds: 30 },
  { id: 'budget', title: 'Your First Budget', subtitle: 'Set your spending limits', component: FirstBudget, optional: true, estimatedSeconds: 30 },
];
```

### Step 3: Progress Indicator

```tsx
function WizardProgress({ currentStep, totalSteps }: Props) {
  return (
    <div className="flex items-center gap-2 px-4 py-3">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div
          key={i}
          className={cn(
            'h-1 flex-1 rounded-full transition-colors',
            i < currentStep ? 'bg-green-500' :
            i === currentStep ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
          )}
        />
      ))}
    </div>
  );
}
```

### Step 4: Sample Data Mode

```ts
// Allow users to explore with demo data before entering real data
const SAMPLE_DATA = {
  income: 5000,
  categories: [
    { name: 'Rent', budgeted: 1500, spent: 1500 },
    { name: 'Groceries', budgeted: 600, spent: 523.47 },
    { name: 'Transport', budgeted: 200, spent: 185.00 },
    { name: 'Entertainment', budgeted: 150, spent: 210.50 },
    { name: 'Savings', budgeted: 1000, spent: 1000 },
  ],
  transactions: generateSampleTransactions(30), // 30 days of realistic data
};

function enableSampleMode() {
  localStorage.setItem('budget-sample-mode', 'true');
  // Load sample data into temporary store (not encrypted store)
}
```

### Step 5: Getting Started Checklist

Post-onboarding checklist shown on dashboard:

```tsx
const GETTING_STARTED_ITEMS = [
  { id: 'set-budget', label: 'Set your first monthly budget', done: hasBudget },
  { id: 'add-transaction', label: 'Add your first transaction', done: hasTransaction },
  { id: 'import-data', label: 'Import bank transactions', done: hasImported },
  { id: 'set-goal', label: 'Create a savings goal', done: hasGoal },
  { id: 'review-week', label: 'Review your first week', done: hasReviewed },
];

function GettingStartedChecklist() {
  const items = useGettingStartedItems();
  const completed = items.filter(i => i.done).length;

  if (completed === items.length) return null; // Hide when all done

  return (
    <Card>
      <CardHeader>
        <CardTitle>Getting Started ({completed}/{items.length})</CardTitle>
        <Progress value={(completed / items.length) * 100} />
      </CardHeader>
      <CardContent>
        {items.map(item => (
          <div key={item.id} className="flex items-center gap-3 py-2">
            {item.done ? <CheckCircle className="text-green-500" /> : <Circle className="text-gray-300" />}
            <span className={item.done ? 'line-through text-muted-foreground' : ''}>{item.label}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
```

### Step 6: Completion Celebration

```tsx
function OnboardingComplete() {
  useEffect(() => {
    // Trigger confetti on completion
    confetti({ particleCount: 80, spread: 60 });
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 py-8 text-center">
      <span className="text-5xl">🎉</span>
      <h2 className="text-2xl font-bold">You're All Set!</h2>
      <p className="text-muted-foreground max-w-md">
        Your budget is ready. Start logging transactions and watch your financial picture come together.
      </p>
      <Button size="lg" asChild>
        <Link href="/budget-app">Go to Dashboard</Link>
      </Button>
    </div>
  );
}
```

## Key Files

| File | Role |
|------|------|
| `src/app/budget-app/onboarding/` | Onboarding wizard pages |
| `src/components/budget/` | Shared budget components |
| `src/lib/seed-data.ts` | Sample data generation |
| `src/contexts/` | Budget context for storing onboarding results |

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Requiring too much info upfront | Max 4 steps, each < 30 seconds |
| No skip option | Every step must have "Skip for now" |
| Showing advanced features during onboarding | Progressive disclosure — basics first |
| Sample data stored in encrypted DB | Use temporary store, not encrypted DB |
| No way to redo onboarding | Add "Reset onboarding" in settings |
| Not tracking completion | Store onboarding state for analytics |

## Validation Checklist

- [ ] Complete wizard in under 2 minutes
- [ ] Every step has "Skip for now" option
- [ ] Progress indicator shows current step
- [ ] Sample data mode works without creating real records
- [ ] Getting Started checklist appears post-onboarding
- [ ] Completion celebration triggers properly
- [ ] Wizard state persists if user leaves mid-flow
- [ ] Mobile-first layout (thumb-friendly)

## Related Skills

- `mobile-first-ux` — onboarding must be mobile-optimized
- `gamification-engine` — celebration on completion, streak start
- `budget-methods` — method selection in Step 1
- `design-tokens` — consistent styling throughout wizard
