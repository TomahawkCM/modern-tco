---
name: swipe-review
description: Use when implementing swipe gestures for transaction review, batch review flows, or gesture-based mobile UX patterns.
---

# Swipe Review

## Overview

Implements swipe-to-review UX for transaction management — swipe right to approve, swipe left to categorize/edit, with batch review mode for monthly reconciliation. Designed for mobile-first thumb-zone interaction with haptic feedback and undo support.

## When to Use

- Implementing swipe gestures on transaction lists
- Building batch transaction review (monthly review)
- Adding gesture-based categorization
- Creating undo patterns for swipe actions
- Implementing haptic feedback for mobile gestures

## Core Principles

- **Thumb-zone optimized** — All swipe actions reachable by thumb
- **Visual feedback** — Color-coded swipe reveals (green=approve, blue=edit)
- **Undo always available** — Toast with undo button for 5 seconds after action
- **Batch mode** — Tinder-style card stack for reviewing uncategorized transactions
- **Haptic feedback** — Vibrate on action threshold crossed (mobile)

## Workflow

### Step 1: Swipe Gesture Detection

```tsx
interface SwipeState {
  startX: number;
  currentX: number;
  direction: 'left' | 'right' | null;
  distance: number;
  triggered: boolean;
}

const SWIPE_THRESHOLD = 80; // px to trigger action
const SWIPE_MAX = 150;      // max visual travel

function useSwipeGesture(onSwipeLeft: () => void, onSwipeRight: () => void) {
  const [state, setState] = useState<SwipeState>({ startX: 0, currentX: 0, direction: null, distance: 0, triggered: false });

  const handlers = {
    onTouchStart: (e: React.TouchEvent) => {
      setState({ startX: e.touches[0].clientX, currentX: e.touches[0].clientX, direction: null, distance: 0, triggered: false });
    },
    onTouchMove: (e: React.TouchEvent) => {
      const currentX = e.touches[0].clientX;
      const distance = currentX - state.startX;
      const direction = distance > 0 ? 'right' : 'left';

      setState(prev => ({
        ...prev,
        currentX,
        direction,
        distance: Math.min(Math.abs(distance), SWIPE_MAX),
      }));

      // Haptic feedback at threshold
      if (Math.abs(distance) >= SWIPE_THRESHOLD && !state.triggered) {
        navigator.vibrate?.(10);
        setState(prev => ({ ...prev, triggered: true }));
      }
    },
    onTouchEnd: () => {
      if (state.distance >= SWIPE_THRESHOLD) {
        if (state.direction === 'right') onSwipeRight();
        if (state.direction === 'left') onSwipeLeft();
      }
      setState({ startX: 0, currentX: 0, direction: null, distance: 0, triggered: false });
    },
  };

  return { handlers, state };
}
```

### Step 2: Swipeable Transaction Row

```tsx
function SwipeableTransaction({ transaction, onApprove, onEdit }: Props) {
  const { handlers, state } = useSwipeGesture(
    () => onEdit(transaction),    // swipe left = edit
    () => onApprove(transaction), // swipe right = approve
  );

  const translateX = state.direction === 'right' ? state.distance : -state.distance;

  return (
    <div className="relative overflow-hidden rounded-lg">
      {/* Left reveal (approve) */}
      <div className="absolute inset-y-0 left-0 flex items-center bg-green-500 px-4">
        <CheckIcon className="h-6 w-6 text-white" />
      </div>
      {/* Right reveal (edit) */}
      <div className="absolute inset-y-0 right-0 flex items-center bg-blue-500 px-4">
        <PencilIcon className="h-6 w-6 text-white" />
      </div>
      {/* Transaction card */}
      <div
        {...handlers}
        className="relative bg-surface-primary p-4 transition-transform"
        style={{ transform: `translateX(${translateX}px)` }}
      >
        <TransactionRow transaction={transaction} />
      </div>
    </div>
  );
}
```

### Step 3: Batch Review Mode (Card Stack)

```tsx
function BatchReview({ transactions }: { transactions: Transaction[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reviewedCount, setReviewedCount] = useState(0);

  const current = transactions[currentIndex];
  if (!current) return <ReviewComplete count={reviewedCount} />;

  const handleAction = (action: 'approve' | 'categorize' | 'skip') => {
    // Apply action
    setCurrentIndex(prev => prev + 1);
    setReviewedCount(prev => prev + 1);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Progress value={(currentIndex / transactions.length) * 100} />
      <p className="text-sm text-muted-foreground">
        {currentIndex + 1} of {transactions.length}
      </p>

      {/* Transaction card with swipe */}
      <div className="w-full max-w-md">
        <SwipeableTransaction
          transaction={current}
          onApprove={() => handleAction('approve')}
          onEdit={() => handleAction('categorize')}
        />
      </div>

      {/* Button alternatives for non-touch */}
      <div className="flex gap-2 sm:flex">
        <Button variant="outline" onClick={() => handleAction('skip')}>Skip</Button>
        <Button variant="default" onClick={() => handleAction('approve')}>Approve</Button>
        <Button variant="secondary" onClick={() => handleAction('categorize')}>Categorize</Button>
      </div>
    </div>
  );
}
```

### Step 4: Undo Pattern

```tsx
function useUndoableAction() {
  const [lastAction, setLastAction] = useState<UndoableAction | null>(null);

  const execute = (action: UndoableAction) => {
    action.execute();
    setLastAction(action);

    // Auto-clear after 5 seconds
    setTimeout(() => setLastAction(null), 5000);
  };

  const undo = () => {
    if (lastAction) {
      lastAction.undo();
      setLastAction(null);
    }
  };

  return { execute, undo, canUndo: !!lastAction };
}

// Toast with undo
function UndoToast({ action, onUndo }: Props) {
  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 flex items-center justify-between rounded-lg bg-gray-900 px-4 py-3 text-white sm:left-auto sm:right-4 sm:w-80">
      <span className="text-sm">{action.description}</span>
      <Button variant="ghost" size="sm" className="text-yellow-400" onClick={onUndo}>
        Undo
      </Button>
    </div>
  );
}
```

## Key Files

| File | Role |
|------|------|
| `src/components/budget/` | Swipeable transaction components |
| `src/hooks/` | Swipe gesture and undo hooks |
| `src/app/budget-app/transactions/` | Transaction list page |

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| No button alternative for swipe | Always provide buttons for keyboard/desktop users |
| Swipe conflicts with scroll | Only detect horizontal swipe when delta-X > delta-Y |
| No haptic feedback | Use `navigator.vibrate(10)` at threshold |
| Undo disappears too quickly | Keep undo toast for 5 seconds minimum |
| Swipe action irreversible | Always implement undo for swipe actions |
| No visual feedback during swipe | Show colored reveal and icon during swipe |

## Validation Checklist

- [ ] Swipe right = approve (green reveal)
- [ ] Swipe left = edit/categorize (blue reveal)
- [ ] Button alternatives for keyboard/desktop users
- [ ] Haptic feedback at action threshold
- [ ] Undo toast appears for 5 seconds after action
- [ ] Batch review mode with progress indicator
- [ ] No conflict between swipe and scroll
- [ ] Works on mobile touch devices

## Related Skills

- `mobile-first-ux` — touch gestures and mobile patterns
- `accessibility-audit` — button alternatives for swipe gestures
- `dashboard-builder` — review widget for uncategorized transactions
