---
name: performance-budget
description: Use when optimizing performance, analyzing bundle size, addressing Core Web Vitals, or adding new dependencies. Enforces performance budgets and optimization patterns.
---

# Performance Budget

## Overview

Defines hard performance targets for the budget app and provides optimization patterns. Every new feature, dependency, and code change must stay within these budgets. The app must remain fast on mid-range mobile devices (Moto G Power class) and slow 3G connections.

## When to Use

- Adding a new npm dependency (check bundle impact)
- Optimizing page load performance (LCP, FID, CLS)
- Implementing lazy loading or code splitting
- Building features with large data sets (1000+ transactions)
- Running performance audits or Lighthouse checks
- Reviewing pull requests for performance impact

## Core Principles

- **Performance budgets are hard limits** — Never ship code that exceeds them
- **Measure on real devices** — Chrome DevTools throttling + real mid-range phone
- **Bundle size is a feature** — Every KB matters on mobile
- **Lazy by default** — Only load what the viewport needs
- **Virtual for scale** — Virtualize any list >50 items

## Performance Targets

| Metric | Target | Red Line |
|--------|--------|----------|
| LCP (Largest Contentful Paint) | < 2.5s | > 4.0s |
| FID (First Input Delay) | < 100ms | > 300ms |
| CLS (Cumulative Layout Shift) | < 0.1 | > 0.25 |
| INP (Interaction to Next Paint) | < 200ms | > 500ms |
| Initial JS bundle | < 250KB gzipped | > 350KB |
| Per-route JS chunk | < 100KB gzipped | > 150KB |
| Total page weight | < 1MB | > 2MB |
| Time to Interactive | < 3.5s on 3G | > 5s |
| New dependency limit | < 50KB gzipped | Must justify |

## Workflow

### Step 1: Measure Current Performance

```bash
# Run Lighthouse audit
npx lighthouse http://localhost:3000/budget-app --output=json --output-path=./lighthouse-report.json

# Analyze bundle size
npm run analyze  # if available, or:
ANALYZE=true npm run build

# Check specific route size
npx @next/bundle-analyzer
```

### Step 2: Before Adding Dependencies

Check bundle impact before installing:

```bash
# Check package size
npx bundlephobia <package-name>

# Or use the website: bundlephobia.com
```

Rules:
- < 10KB gzipped: Approved by default
- 10-50KB gzipped: Needs justification (no lighter alternative?)
- > 50KB gzipped: Must be lazy-loaded and requires strong justification

### Step 3: Code Splitting Patterns

**Route-level splitting** (automatic with Next.js App Router):
```
src/app/budget-app/
  page.tsx              → /budget-app (own chunk)
  transactions/page.tsx → /budget-app/transactions (own chunk)
  reports/page.tsx      → /budget-app/reports (own chunk)
```

**Component-level lazy loading**:
```tsx
import dynamic from 'next/dynamic';

// Heavy chart component — only load when needed
const SpendingChart = dynamic(
  () => import('@/components/budget/SpendingChart'),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,  // Charts don't need SSR
  }
);
```

**Feature-level splitting**:
```tsx
// Load calculator engine only when calculator page is opened
const calcEngine = await import('@/lib/calculators/compound-interest');
```

### Step 4: Virtual Scrolling for Large Lists

Use virtual scrolling for any list that could exceed 50 items:

```tsx
import { useVirtualizer } from '@tanstack/react-virtual';

function TransactionList({ transactions }: { transactions: Transaction[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: transactions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 72, // estimated row height
    overscan: 5,
  });

  return (
    <div ref={parentRef} className="h-[calc(100vh-200px)] overflow-auto">
      <div style={{ height: virtualizer.getTotalSize() }} className="relative w-full">
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <TransactionRow
            key={transactions[virtualRow.index].id}
            style={{
              position: 'absolute',
              top: virtualRow.start,
              height: virtualRow.size,
            }}
            transaction={transactions[virtualRow.index]}
          />
        ))}
      </div>
    </div>
  );
}
```

### Step 5: Image Optimization

```tsx
import Image from 'next/image';

// Always use next/image for optimization
<Image
  src="/icons/category-food.svg"
  alt="Food category"
  width={24}
  height={24}
  loading="lazy"    // lazy by default for below-fold
  priority={false}  // set true only for above-fold LCP images
/>
```

### Step 6: Prevent Layout Shift

```tsx
// Reserve space for dynamic content
<div className="h-[200px]">  {/* Fixed height for chart container */}
  {isLoading ? <ChartSkeleton /> : <SpendingChart data={data} />}
</div>

// Set explicit dimensions on images
<Image width={48} height={48} ... />

// Use CSS aspect-ratio for responsive containers
<div className="aspect-video">
```

## Key Files

| File | Role |
|------|------|
| `next.config.js` | Bundle configuration, webpack optimization |
| `tailwind.config.ts` | Purge settings for CSS |
| `package.json` | Dependency list (audit regularly) |
| `src/app/budget-app/layout.tsx` | Budget app layout (route-level splitting) |

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Importing entire lodash (`import _ from 'lodash'`) | Use specific imports (`import debounce from 'lodash/debounce'`) |
| Loading charts on initial page load | Use `dynamic()` with `ssr: false` |
| Rendering 1000+ items in a flat list | Use `@tanstack/react-virtual` |
| Adding heavy deps without checking size | Always run `npx bundlephobia <pkg>` first |
| No loading skeleton → CLS jump | Add skeleton loader matching final layout dimensions |
| Inline SVG icons duplicated across components | Use icon component library with tree-shaking |

## Validation Checklist

- [ ] Lighthouse Performance score ≥ 90
- [ ] LCP < 2.5s on simulated slow 4G
- [ ] CLS < 0.1 (no layout jumps)
- [ ] Initial bundle < 250KB gzipped
- [ ] No new dependency > 50KB without justification
- [ ] Lists > 50 items use virtual scrolling
- [ ] Heavy components use `dynamic()` import
- [ ] All images use `next/image` with explicit dimensions
- [ ] Skeleton loaders prevent layout shift

## Reference

- `references/performance-benchmarks.md` — detailed performance benchmarks and targets

## Related Skills

- `mobile-first-ux` — performance critical on mobile
- `pwa-optimization` — caching strategies for offline performance
- `dashboard-builder` — widget lazy loading patterns
