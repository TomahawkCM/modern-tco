---
name: react-migration
description: Use when porting components or logic from Next.js to React+Vite+Mantine for the online version of the budget app.
---

# React Migration

## Overview

Guides the incremental migration of the budget app from Next.js 16 + shadcn/ui to a React + Vite + Mantine stack for the online version. Identifies portable code (~27K LOC in `src/lib/`), maps component equivalents, and provides patterns for SSR→CSR transitions.

## When to Use

- Porting a component from Next.js to React+Vite
- Mapping shadcn/ui components to Mantine equivalents
- Migrating Next.js App Router routes to React Router
- Converting SSR patterns to client-side rendering
- Identifying which code is portable vs. Next.js-specific

## Core Principles

- **Incremental migration** — Don't rewrite everything; port incrementally
- **Lib code is portable** — `src/lib/` (~27K LOC) works in any React app
- **Component mapping** — Every shadcn/ui component has a Mantine equivalent
- **Route mapping** — App Router file-based routes → React Router config
- **SSR → CSR** — Budget app is client-heavy; most pages don't need SSR

## Workflow

### Step 1: Identify Portable Code

```
FULLY PORTABLE (no changes needed):
├── src/lib/encryption/         — All encryption logic
├── src/lib/parsers/            — All file parsers
├── src/lib/analytics/          — All analytics calculations
├── src/lib/ai/                 — AI service modules
├── src/lib/calculators/        — Financial calculators
├── src/lib/seed-data.ts        — Sample data generation
└── src/contexts/               — React contexts (minor adjustments)

NEEDS ADAPTATION:
├── src/components/budget/      — Replace shadcn → Mantine components
├── src/components/ui/          — Replace with Mantine primitives
├── src/app/budget-app/         — Replace App Router → React Router
├── src/app/api/                — Extract to standalone Express/Hono API
└── src/hooks/                  — Some use Next.js-specific APIs

NOT PORTABLE:
├── src/app/layout.tsx          — Next.js layout system
├── next.config.js              — Next.js config
├── src/middleware.ts            — Next.js middleware
└── MDX pipeline                — LMS-only, not needed
```

### Step 2: Component Mapping (shadcn → Mantine)

```ts
const COMPONENT_MAP: Record<string, string> = {
  // Layout
  'Card, CardHeader, CardContent':      '@mantine/core: Card, Card.Section',
  'Dialog, DialogContent':              '@mantine/core: Modal',
  'Sheet, SheetContent':                '@mantine/core: Drawer',
  'Tabs, TabsList, TabsTrigger':        '@mantine/core: Tabs',
  'Accordion':                          '@mantine/core: Accordion',

  // Form
  'Input':                              '@mantine/core: TextInput',
  'Select':                             '@mantine/core: Select',
  'Checkbox':                           '@mantine/core: Checkbox',
  'Switch':                             '@mantine/core: Switch',
  'Slider':                             '@mantine/core: Slider',
  'Textarea':                           '@mantine/core: Textarea',

  // Feedback
  'Badge':                              '@mantine/core: Badge',
  'Alert':                              '@mantine/core: Alert',
  'Toast / Sonner':                     '@mantine/notifications: notifications',
  'Progress':                           '@mantine/core: Progress',
  'Skeleton':                           '@mantine/core: Skeleton',

  // Navigation
  'DropdownMenu':                       '@mantine/core: Menu',
  'Command':                            '@mantine/core: Spotlight',
  'Popover':                            '@mantine/core: Popover',
  'Tooltip':                            '@mantine/core: Tooltip',

  // Data Display
  'Table':                              '@mantine/core: Table',
  'Avatar':                             '@mantine/core: Avatar',
  'Calendar':                           '@mantine/dates: Calendar',
};
```

### Step 3: Route Migration

```ts
// Next.js App Router (file-based)
// src/app/budget-app/page.tsx        → /budget-app
// src/app/budget-app/import/page.tsx  → /budget-app/import
// src/app/budget-app/[id]/page.tsx    → /budget-app/:id

// React Router equivalent
import { createBrowserRouter } from 'react-router-dom';

const router = createBrowserRouter([
  {
    path: '/budget-app',
    element: <BudgetLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'import', element: <ImportPage /> },
      { path: 'transactions', element: <TransactionList /> },
      { path: 'transactions/:id', element: <TransactionDetail /> },
      { path: 'reports', element: <Reports /> },
      { path: 'settings', element: <Settings /> },
      { path: 'calculators', element: <Calculators /> },
      // ... etc
    ],
  },
]);
```

### Step 4: SSR → CSR Patterns

```tsx
// BEFORE (Next.js SSR)
// src/app/budget-app/page.tsx
export default async function BudgetPage() {
  // Server-side data fetching
  const data = await fetchBudgetData();
  return <BudgetDashboard data={data} />;
}

// AFTER (React CSR)
// src/pages/BudgetPage.tsx
export default function BudgetPage() {
  const { data, isLoading } = useBudgetData(); // Client-side fetch

  if (isLoading) return <DashboardSkeleton />;
  return <BudgetDashboard data={data} />;
}
```

### Step 5: API Route Extraction

```ts
// BEFORE: Next.js API route
// src/app/api/plaid/sync/route.ts
export async function POST(req: Request) { ... }

// AFTER: Express/Hono standalone API
// api/routes/plaid.ts
import { Hono } from 'hono';
const app = new Hono();
app.post('/plaid/sync', async (c) => { ... });
```

### Step 6: i18n Migration

```ts
// BEFORE: next-intl
import { useTranslations } from 'next-intl';
const t = useTranslations('Budget');

// AFTER: react-i18next
import { useTranslation } from 'react-i18next';
const { t } = useTranslation('budget');

// Message format is similar but namespace handling differs
// next-intl:  t('Budget.title')
// i18next:    t('budget:title') or t('title') with namespace
```

## Key Files

| File | Role |
|------|------|
| `src/lib/` | Portable library code (~27K LOC) |
| `src/contexts/` | React contexts (mostly portable) |
| `src/components/budget/` | Components to migrate (shadcn → Mantine) |
| `src/app/budget-app/` | Routes to migrate (App Router → React Router) |
| `src/app/api/` | API routes to extract |
| `src/i18n/messages/` | Translation files (format may need adaptation) |

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Rewriting lib code unnecessarily | `src/lib/` is framework-agnostic — copy directly |
| Using `next/image` in migrated code | Replace with standard `<img>` or Mantine Image |
| Using `next/link` in migrated code | Replace with React Router `<Link>` |
| Forgetting to replace `useRouter` | Next.js `useRouter` → React Router `useNavigate` |
| Migrating everything at once | Port one route at a time, verify, then continue |

## Validation Checklist

- [ ] All `src/lib/` code compiles without Next.js dependencies
- [ ] Component mapping covers all used shadcn/ui components
- [ ] Routes work in React Router (no 404s)
- [ ] i18n translations load correctly
- [ ] Encryption/decryption works identically
- [ ] No `next/*` imports in migrated code
- [ ] API routes extracted to standalone server

## Related Skills

- `e2e-encryption` — encryption code is fully portable
- `supabase-patterns` — Supabase client works in both environments
- `test-patterns` — tests should work in both environments
