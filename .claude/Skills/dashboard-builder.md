---
name: dashboard-builder
description: Use when creating or modifying dashboard widgets, implementing drag-and-drop grid, or building dashboard preset layouts.
---

# Dashboard Builder

## Overview

Implements a widget-based dashboard system with a registry pattern, multiple size variants, drag-and-drop grid, and preset layouts. Users can customize their dashboard by adding, removing, and rearranging widgets.

## When to Use

- Creating new dashboard widgets
- Modifying dashboard grid layout
- Implementing drag-and-drop for widgets
- Adding preset dashboard layouts
- Building widget settings or configuration

## Core Principles

- **Widget registry** — All widgets registered in a central registry with metadata
- **Size variants** — Each widget supports S, M, L, XL sizes for responsive grid
- **Lazy loading** — Widgets load only when visible in viewport
- **State in localStorage** — Widget layout and preferences stored locally
- **Preset layouts** — Pre-built layouts for common use cases (overview, spending focus, savings focus)

## Workflow

### Step 1: Widget Registry

```ts
// src/dashboard/widgets/registry.ts
interface WidgetDefinition {
  id: string;
  name: string;
  description: string;
  component: React.LazyExoticComponent<React.ComponentType<WidgetProps>>;
  defaultSize: WidgetSize;
  supportedSizes: WidgetSize[];
  category: 'overview' | 'spending' | 'income' | 'goals' | 'tracking';
  refreshInterval?: number; // ms, if widget auto-refreshes
}

type WidgetSize = 'sm' | 'md' | 'lg' | 'xl';

const WIDGET_REGISTRY: Record<string, WidgetDefinition> = {
  'budget-summary': {
    id: 'budget-summary',
    name: 'Budget Summary',
    description: 'Monthly budget overview with spending progress',
    component: lazy(() => import('./BudgetSummaryWidget')),
    defaultSize: 'md',
    supportedSizes: ['sm', 'md', 'lg'],
    category: 'overview',
  },
  'spending-chart': {
    id: 'spending-chart',
    name: 'Spending by Category',
    description: 'Pie chart of spending categories',
    component: lazy(() => import('./SpendingChartWidget')),
    defaultSize: 'lg',
    supportedSizes: ['md', 'lg', 'xl'],
    category: 'spending',
  },
  'recent-transactions': {
    id: 'recent-transactions',
    name: 'Recent Transactions',
    description: 'Latest 10 transactions',
    component: lazy(() => import('./RecentTransactionsWidget')),
    defaultSize: 'md',
    supportedSizes: ['sm', 'md', 'lg'],
    category: 'overview',
  },
  'streak-widget': {
    id: 'streak-widget',
    name: 'Current Streak',
    description: 'Daily logging streak tracker',
    component: lazy(() => import('./StreakWidget')),
    defaultSize: 'sm',
    supportedSizes: ['sm', 'md'],
    category: 'tracking',
  },
  'savings-goal': {
    id: 'savings-goal',
    name: 'Savings Goal Progress',
    description: 'Progress toward active savings goals',
    component: lazy(() => import('./SavingsGoalWidget')),
    defaultSize: 'md',
    supportedSizes: ['sm', 'md', 'lg'],
    category: 'goals',
  },
};
```

### Step 2: Widget Size Grid

```tsx
// Grid column spans for each size
const SIZE_COLS: Record<WidgetSize, string> = {
  sm: 'col-span-1',                        // 1 column
  md: 'col-span-1 sm:col-span-2',          // 1 on mobile, 2 on tablet+
  lg: 'col-span-1 sm:col-span-2 lg:col-span-3', // responsive
  xl: 'col-span-1 sm:col-span-2 lg:col-span-4', // full width on desktop
};

function DashboardGrid({ widgets }: { widgets: WidgetInstance[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {widgets.map(widget => (
        <div key={widget.id} className={SIZE_COLS[widget.size]}>
          <WidgetWrapper definition={WIDGET_REGISTRY[widget.widgetId]} instance={widget} />
        </div>
      ))}
    </div>
  );
}
```

### Step 3: Widget Component Pattern

```tsx
// src/dashboard/widgets/BudgetSummaryWidget.tsx
interface WidgetProps {
  size: WidgetSize;
  config?: Record<string, unknown>;
}

function BudgetSummaryWidget({ size, config }: WidgetProps) {
  const budget = useBudgetSummary();

  if (size === 'sm') {
    return (
      <div className="text-center">
        <p className="text-2xl font-bold">${budget.remaining}</p>
        <p className="text-sm text-muted-foreground">remaining</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between">
        <span>Spent</span>
        <span className="font-medium">${budget.spent}</span>
      </div>
      <Progress value={budget.percentUsed} />
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>${budget.spent} of ${budget.total}</span>
        <span>${budget.remaining} left</span>
      </div>
      {size === 'lg' && <CategoryBreakdown categories={budget.categories} />}
    </div>
  );
}
```

### Step 4: Preset Layouts

```ts
const PRESET_LAYOUTS: Record<string, WidgetInstance[]> = {
  overview: [
    { id: '1', widgetId: 'budget-summary', size: 'lg' },
    { id: '2', widgetId: 'recent-transactions', size: 'md' },
    { id: '3', widgetId: 'spending-chart', size: 'md' },
    { id: '4', widgetId: 'streak-widget', size: 'sm' },
    { id: '5', widgetId: 'savings-goal', size: 'sm' },
  ],
  'spending-focus': [
    { id: '1', widgetId: 'spending-chart', size: 'xl' },
    { id: '2', widgetId: 'recent-transactions', size: 'lg' },
    { id: '3', widgetId: 'budget-summary', size: 'md' },
  ],
  minimal: [
    { id: '1', widgetId: 'budget-summary', size: 'md' },
    { id: '2', widgetId: 'recent-transactions', size: 'md' },
  ],
};
```

### Step 5: Layout Persistence

```ts
function useDashboardLayout() {
  const [layout, setLayout] = useState<WidgetInstance[]>(() => {
    const saved = localStorage.getItem('dashboard-layout');
    return saved ? JSON.parse(saved) : PRESET_LAYOUTS.overview;
  });

  const saveLayout = useCallback((newLayout: WidgetInstance[]) => {
    setLayout(newLayout);
    localStorage.setItem('dashboard-layout', JSON.stringify(newLayout));
  }, []);

  return { layout, saveLayout };
}
```

## Key Files

| File | Role |
|------|------|
| `src/dashboard/widgets/` | Widget components and registry |
| `src/app/budget-app/page.tsx` | Dashboard page |
| `src/components/budget/` | Shared budget components used by widgets |

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Loading all widgets eagerly | Use `React.lazy()` for each widget |
| Widget doesn't adapt to size prop | Implement all `supportedSizes` variants |
| Dashboard layout not persisting | Save to localStorage on every change |
| No skeleton loader for lazy widgets | Add `Suspense` with `<WidgetSkeleton />` fallback |
| Hard-coded dashboard layout | Use registry + user-configurable layout |
| Widgets fetching data independently | Use shared data context to avoid duplicate API calls |

## Validation Checklist

- [ ] All widgets registered in the registry with metadata
- [ ] Each widget renders correctly at all supported sizes
- [ ] Layout persists across sessions (localStorage)
- [ ] Widgets lazy-loaded with skeleton fallback
- [ ] Responsive grid works at all breakpoints
- [ ] Preset layouts available and selectable
- [ ] New widget can be added with minimal boilerplate

## Related Skills

- `mobile-first-ux` — responsive grid layout
- `performance-budget` — lazy loading widgets
- `gamification-engine` — streak widget implementation
- `design-tokens` — consistent widget styling
