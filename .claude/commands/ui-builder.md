---
name: ui-builder
description: Universal shadcn/ui builder for pages, components, and layout compositions. Auto-detects project stack and generates code matching existing conventions.
---

# UI Builder

Build pages, components, and layout compositions using shadcn/ui with automatic project convention detection.

## Phase 1: Project Detection

Before asking any questions, silently detect the project stack by reading these files (skip any that don't exist):

| File | What to Extract |
|------|----------------|
| `components.json` | shadcn style (new-york/default), RSC, TSX, aliases, registries |
| `package.json` | Framework, React version, i18n lib, animation lib, form lib, validation lib, state management, icon lib |
| `tailwind.config.*` | Tailwind version (v3 vs v4), theme extensions, custom screens, dark mode strategy |
| `tsconfig.json` | Path aliases, strict mode |
| `src/components/ui/` | List all installed shadcn components (glob `*.tsx`) |
| `src/components/` | Scan top-level directories for app-specific component areas |
| `src/hooks/` | Scan for project-specific hooks (e.g., `useMediaQuery`, `useSeniorsMode`, `useIOSStatePreservation`) |
| `src/app/` | Scan for existing page structure and routing patterns |

Store detection results mentally as `PROJECT_CONTEXT`. Do not output detection results to the user unless they ask.

Also detect i18n infrastructure:
| `src/i18n/config.ts` | Supported locales, RTL locales, LOCALE_METADATA, default locale |
| `src/lib/rtl-utils.ts` | RTL hooks (`useRTL`, `useDirection`, `getRTLAlignment`) |
| `src/i18n/utils/` | Formatting utilities (`formatCurrency`, `formatNumber`, `formatDate`) |
| `tailwind.config.*` → plugins | Check for `tailwindcss-rtl` plugin |

### Detection Map

| Dependency | Category |
|-----------|----------|
| `next-intl`, `react-intl`, `react-i18next`, `i18next` | i18n |
| `tailwindcss-rtl` | RTL CSS support |
| `framer-motion`, `motion` | Animation |
| `react-hook-form`, `formik` | Forms |
| `zod`, `yup`, `valibot` | Validation |
| `zustand`, `jotai`, `@reduxjs/toolkit`, `recoil` | State |
| `lucide-react`, `@heroicons/react`, `react-icons`, `@phosphor-icons/react` | Icons |
| `recharts`, `chart.js`, `@nivo/*`, `visx` | Charts |
| `@tanstack/react-table` | Tables |
| `decimal.js`, `dinero.js`, `big.js` | Financial math |
| `@dnd-kit/core`, `react-beautiful-dnd` | Drag and drop |

## Phase 2: Quick Triage

Ask exactly 2-3 questions using AskUserQuestion. Adapt based on project detection.

**Question 1 — What are you building?**
Options:
- **Page** — Full route with server/client components
- **Component** — Reusable UI component with props interface
- **Layout/Composition** — Arrange existing components into a layout (outputs a code snippet, not a new file)
- **Block** — A self-contained page section (hero, pricing, feature grid, stats bar, etc.)

**Question 2 — Where in the app?**
Generate options dynamically from detected `src/app/` directories. Always include "New area" as an option.

**Question 3 (only if needed) — Any specific requirements?**
Only ask this if the user's initial prompt was vague. If they gave specifics like "data table with filters and date range", skip this question and proceed.

## Phase 3: Component Research

Before generating any code, use the shadcn MCP tools in this order.

**IMPORTANT — Registry search tips (learned from testing):**
- Use **single keywords**, not multi-word phrases. `"card"` works, `"tabs card settings"` returns nothing.
- Run **multiple single-keyword searches in parallel** for broader coverage.
- Block names use specific patterns: `"chart-area-default"`, `"chart-radar-dots"`, not `"block dashboard"`.
- Example searches use the pattern `"<component>-demo"` (e.g., `"tabs-demo"`, `"card-demo"`).

### Step 1: Search for relevant components (use parallel single-keyword searches)
```
mcp__shadcn__search_items_in_registries
  registries: ["@shadcn"]
  query: "card"

mcp__shadcn__search_items_in_registries
  registries: ["@shadcn"]
  query: "tabs"
```

### Step 2: Get examples for key components
```
mcp__shadcn__get_item_examples_from_registries
  registries: ["@shadcn"]
  query: "<component>-demo"  (e.g., "tabs-demo", "card-demo", "data-table-demo")
```

### Step 3: View source of unfamiliar components
```
mcp__shadcn__view_items_in_registries
  items: ["@shadcn/<component>"]
```

### Step 4: Cross-reference with installed components
Compare registry results with the installed components detected in Phase 1. Flag any that need installing.

### Step 5: Check for file conflicts
**Before generating any files, verify the target paths don't already exist.** Use `ls` or `Glob` to check:
- For pages: check if `src/app/{area}/{page-name}/page.tsx` exists
- For components: check if `src/components/{area}/{ComponentName}.tsx` exists
- For blocks: check if `src/components/{area}/blocks/{BlockName}.tsx` exists

If a file exists, **read it first** and ask the user whether to:
1. Extend/modify the existing file
2. Create alongside it with a different name
3. Replace it entirely

Never silently overwrite existing files.

## Phase 4: Code Generation

### Convention Rules (apply automatically based on PROJECT_CONTEXT)

**Always:**
- TypeScript strict — no `any`, proper interfaces for all props
- Export both component and props type: `export type { ComponentProps }`
- Use path aliases from `tsconfig.json` (typically `@/`)
- Use `cn()` from utils for all conditional class merging
- Accessible: proper ARIA attributes, keyboard handling, focus management
- Responsive: test at mobile (320px), tablet (768px), desktop (1200px) breakpoints
- Only import hooks/libraries that are actually used in the component body — no dead imports

**If RSC detected (Next.js App Router):**
- Pages: server component `page.tsx` + client component `client.tsx`
- `'use client'` only on interactive components
- Use `Suspense` + skeleton fallbacks for async content
- Metadata exports in server components

**If i18n detected (120 locales, 5 RTL languages):**
- Use i18n for **hardcoded user-facing strings** within the component
- Do NOT use i18n for **props passed in from the parent** (the parent handles translation)
- Only import the i18n hook if the component itself renders hardcoded strings
- Provide i18n key list at the end for the user to add to translation files
- Key format: `{area}.{section}.{element}` (e.g., `settings.profile.nameLabel`)
- Use `useFormatter()` from `next-intl` for dates, numbers, and currencies — never raw `.toLocaleString()`
- Use project utilities when available: `formatCurrency()` from `@/i18n/utils/formatCurrency`, `formatNumber()` from `@/i18n/utils/formatNumber`

**RTL & bidirectional text (critical for ar-SA, ar-AE, fa-IR, he-IL, ur-PK):**
- Use **logical CSS properties** via Tailwind RTL plugin — prefer `ps-4`/`pe-4` (padding-inline-start/end) over `pl-4`/`pr-4`; prefer `ms-4`/`me-4` over `ml-4`/`mr-4`
- Use `text-start`/`text-end` instead of `text-left`/`text-right`
- Use `start-0`/`end-0` instead of `left-0`/`right-0` for positioning
- Use `float-start`/`float-end` instead of `float-left`/`float-right`
- For icons that indicate direction (arrows, chevrons), flip them in RTL: use `rtl:rotate-180` or the project's `getRTLAlignment()` utility from `@/lib/rtl-utils`
- Import `useDirection` or `useRTL` from `@/lib/rtl-utils` when component needs direction-aware logic (e.g., swipe gestures, carousel direction, popover placement)
- Set `dir` attribute on inputs that may contain mixed LTR/RTL content (e.g., email fields are always LTR even in RTL layouts): `<Input dir="ltr" />`

**Text expansion safety (German +40%, Finnish +60%, Russian +30%):**
- Never use fixed `w-` widths on containers holding translated text — use `min-w-` or `max-w-` with flex/grid
- Prefer `flex-wrap` on horizontal layouts with multiple translated labels
- Avoid `truncate` on primary content — only on secondary/supplementary text and always with a `title` attribute showing the full text
- Use `line-clamp-2` or `line-clamp-3` instead of single-line truncation when space is constrained
- Button text: use `whitespace-nowrap` only if the button also has `min-w-fit` to expand with content
- Tab labels: allow the `TabsList` to scroll horizontally (`overflow-x-auto`) rather than truncating labels
- Table headers: use `whitespace-nowrap` to prevent awkward line breaks, let the table scroll horizontally

**If animation library detected:**
- Entry animations for cards/sections (fade + slide up)
- `AnimatePresence` for mount/unmount transitions
- `layout` prop for layout shifts
- Keep animations subtle — 0.2-0.3s duration, small y offset (8-12px)

**If form + validation detected:**
- Form components use the detected form library
- Validation schemas using the detected validation library
- Proper error display with field-level messages
- Loading states on submit buttons

**If financial math library detected:**
- All monetary values use the detected library (never floating point)
- Proper currency formatting

**If project-specific hooks detected (e.g., `useSeniorsMode`, `useMediaQuery`):**
- Import and integrate the project's own hooks
- Larger touch targets (48px minimum) when accessibility hooks are present
- Respect user's accessibility preferences

### Template: Page Generation

**IMPORTANT:** Always check if the page route already exists before generating.

```
src/app/{area}/{page-name}/page.tsx      ← Server component
src/app/{area}/{page-name}/client.tsx    ← Client component (only if interactive)
```

**page.tsx structure:**
```tsx
import { Metadata } from 'next';
import { ClientPageName } from './client';

export const metadata: Metadata = {
  title: '...',
  description: '...',
};

export default function PageName() {
  return <ClientPageName />;
}
```

**client.tsx structure:**
```tsx
'use client';

import { /* detected i18n hook */ } from '...';
import { /* detected components */ } from '@/components/ui/...';
import { cn } from '@/lib/utils';

export function ClientPageName() {
  // i18n setup (only if this component renders hardcoded strings)
  // state
  // handlers
  // render
}
```

### Template: Component Generation

**IMPORTANT:** Always check if the component file already exists before generating.

```
src/components/{area}/{ComponentName}.tsx
```

**Structure:**
```tsx
'use client';

import { /* only imports that are actually used */ } from '...';
import { cn } from '@/lib/utils';

export interface ComponentNameProps {
  /** JSDoc for non-obvious props */
  className?: string;
}

export function ComponentName({ className, ...props }: ComponentNameProps) {
  return (
    <div className={cn('base-classes', className)}>
      {/* implementation */}
    </div>
  );
}
```

**If component has variants, use `cva`:**
```tsx
import { cva, type VariantProps } from 'class-variance-authority';

const componentVariants = cva('base-classes', {
  variants: {
    variant: { ... },
    size: { ... },
  },
  defaultVariants: { ... },
});

export interface ComponentNameProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof componentVariants> {}
```

### Template: Layout Composition

**Output a code snippet only — no new files.** The snippet should:
- Reference existing components by their actual import paths
- Use CSS Grid or Flexbox for layout
- Include responsive breakpoints
- Use `Suspense` boundaries around heavy components
- Dynamic imports for charts, editors, or components > 50KB

Present the snippet with clear instructions on where to paste it.

### Template: Block Generation

**IMPORTANT:** Always check if the blocks directory and file already exist.

Place blocks in a `blocks/` subdirectory under the relevant component area:
```
src/components/{area}/blocks/{BlockName}.tsx
```

**Structure:**
```tsx
'use client';

export interface BlockNameProps {
  className?: string;
}

export function BlockName({ className }: BlockNameProps) {
  // Self-contained with its own state if needed
  // Responsive by default
  // Loading skeleton for async data
}
```

## Phase 5: Post-Generation Audit

After generating code, always:

### Step 1: Type check
Run `npx tsc --noEmit 2>&1 | grep "<generated-file-names>"` to verify generated code has no type errors. Use the project's tsconfig (not individual file mode).

### Step 2: Run shadcn audit
```
mcp__shadcn__get_audit_checklist
```
Verify generated code against the checklist items.

### Step 3: List missing components
If any shadcn components need installing, provide the exact commands:
```
mcp__shadcn__get_add_command_for_items
  items: ["@shadcn/component-name", ...]
```

### Step 4: i18n & RTL audit
If i18n was detected, verify the generated code:

**Translation keys** — list all keys used:
```
Keys to add to en.json (then run i18n-workflow for other locales):
  area.section.key1: "Default text"
  area.section.key2: "Default text"
```
Do NOT list keys if the component only receives translated strings via props.

**RTL checklist** — scan generated code for these violations:
- [ ] No `pl-` / `pr-` / `ml-` / `mr-` — must use `ps-` / `pe-` / `ms-` / `me-` (logical properties)
- [ ] No `text-left` / `text-right` — must use `text-start` / `text-end`
- [ ] No `left-` / `right-` positioning — must use `start-` / `end-`
- [ ] No `float-left` / `float-right` — must use `float-start` / `float-end`
- [ ] Directional icons (arrows, chevrons) have `rtl:rotate-180`
- [ ] No fixed `w-` on containers with translated text
- [ ] No `truncate` on primary content without `title` attribute fallback
- [ ] `dir="ltr"` on email/URL inputs in forms
- [ ] Tab labels allow horizontal scroll, not truncation

If any violations are found, fix them before presenting the final code.

### Step 5: Summary
Provide a brief summary:
- Files created/modified
- Components used (existing vs newly installed)
- Any `npx shadcn add` commands needed
- i18n keys to add (if any)
- RTL compliance: pass/fail with details
- Other manual steps (env vars, API routes, etc.)

## Modern Patterns Reference

Use these when appropriate — don't force them where they don't fit.

### React 19
- `use()` for reading promises and context in render
- `useOptimistic` for optimistic UI updates
- `useActionState` for form action state
- `<form action={...}>` for progressive enhancement
- `ref` as a prop (no more `forwardRef`)

### Responsive Component Pattern
```tsx
// Desktop: Popover, Mobile: Drawer
const isDesktop = useMediaQuery('(min-width: 768px)');
// Render different component trees based on breakpoint
```

### Suspense + Skeleton Pattern
```tsx
<Suspense fallback={<Skeleton className="h-[200px] w-full" />}>
  <AsyncComponent />
</Suspense>
```

### Dynamic Import Pattern
```tsx
const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <Skeleton className="h-[300px]" />,
  ssr: false,
});
```

### Container Queries (component-level responsiveness)
```tsx
<div className="@container">
  <div className="@md:grid-cols-2 @lg:grid-cols-3 grid grid-cols-1">
    ...
  </div>
</div>
```

## Skill Boundaries

**This skill handles:**
- UI code generation (pages, components, layouts, blocks)
- shadcn component research and installation commands
- Convention enforcement and audit

**Delegate to other skills:**
- Testing → `tdd` or `test-driven-development` skill
- i18n translations → `i18n-workflow` skill
- API routes → handle separately
- Deployment → `pre-deploy-check` skill
- Debugging → `debug-issue` or `systematic-debugging` skill
