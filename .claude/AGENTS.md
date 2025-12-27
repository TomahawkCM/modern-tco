# Agent System Documentation

> Part of the Claude Code configuration. See also: [CLAUDE.md](./CLAUDE.md) | [TOOLS.md](./TOOLS.md) | [WORKFLOWS.md](./WORKFLOWS.md)

---

## Agent Overview

**Available Agents**: Built-in Task tool agents + custom specialists

**Key Agent Types**:
- React/TypeScript (12): react-specialist, typescript-pro, state-management-expert
- Enterprise LMS (15): tco-content-specialist, assessment-engine-specialist, video-system-architect
- Database (20): database-architect, supabase-specialist, rls-policy-designer
- Testing (25): test-automator, playwright-specialist, accessibility-tester
- Performance (18): performance-engineer, bundle-analyzer, lighthouse-optimizer
- Debugging (3): debug-specialist, error-detective, analyzer

---

## Auto-Spawn Patterns

| Task Type | Primary Agent(s) |
|-----------|------------------|
| UI work | **modern-ui-agent**, react-specialist, typescript-pro |
| **shadcn/ui** | **shadcn-frontend-agent** (registry, variants, theming) |
| Database | database-architect, supabase-specialist, security-engineer |
| Testing | test-automator, e2e-specialist, qa-engineer |
| Debugging | debug-specialist, error-detective, performance-engineer |
| Library/Framework Docs | **context7** (resolve-library-id + get-library-docs) |
| Browser/Website Issues | **browser-troubleshooter** (visual, functional, performance) |
| Budget App | **budget-app-specialist** (import, transactions, subscriptions) |

**Configuration**: `.claude/agent-routing-config.json`

---

## Modern UI Agent (Primary)

**Elite UI/UX development agent for React 19 + Next.js 16 + shadcn/ui stack**

### Core Expertise

| Domain | Capabilities |
|--------|-------------|
| **React 19** | Server Components, Actions, useOptimistic, use() hook, streaming |
| **Next.js 16** | App Router, RSC, parallel routes, intercepting routes, loading/error states |
| **shadcn/ui** | Component registry, CVA variants, Radix primitives, composable patterns |
| **Tailwind CSS** | JIT mode, arbitrary values, design tokens, responsive, dark mode |
| **Framer Motion** | Layout animations, gestures, variants, orchestration |
| **Accessibility** | WCAG 2.1 AA, ARIA patterns, keyboard navigation, screen readers |
| **Performance** | Core Web Vitals, bundle optimization, lazy loading, memoization |

### When to Use

**Automatically triggered for:**
- Component creation/modification
- Styling and theming tasks
- Accessibility implementation
- Animation design
- Responsive layouts
- shadcn component additions
- Visual debugging
- Form design
- Design system updates

### Tool Access

```
Mandatory: vibe-check (error prevention)
Primary:   filesystem, shadcn, playwright
Secondary: context7, github
```

### Component Creation Workflow

```
1. Check shadcn registry → shadcn.search_items_in_registries
2. View examples → shadcn.get_item_examples_from_registries
3. Add if needed → npx shadcn@latest add [component]
4. Customize with CVA variants
5. Ensure TypeScript strict compliance
6. Add accessibility (ARIA, keyboard nav)
7. Test visually → playwright.browser_snapshot
8. Verify responsive behavior
9. Check dark mode
```

### Quick Reference Patterns

**Server Component (data fetching):**
```tsx
// app/page.tsx - Server Component
async function getData() {
  const res = await fetch('/api/data', { next: { revalidate: 3600 } })
  return res.json()
}

export default async function Page() {
  const data = await getData()
  return <ClientComponent data={data} />
}
```

**Client Component (interactivity):**
```tsx
'use client'
import { useState, useOptimistic, useTransition } from 'react'

export function InteractiveForm({ action }) {
  const [optimisticValue, setOptimistic] = useOptimistic(initialValue)
  const [isPending, startTransition] = useTransition()
  // ...
}
```

**shadcn Component Pattern:**
```tsx
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva('base-classes', {
  variants: { variant: { default: '', outline: '' }, size: { sm: '', md: '', lg: '' } },
  defaultVariants: { variant: 'default', size: 'md' }
})

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  )
)
```

### Accessibility Checklist

- [ ] Keyboard navigation works (Tab, Enter, Escape, Arrow keys)
- [ ] Focus states visible (ring-2 ring-ring ring-offset-2)
- [ ] ARIA labels meaningful (aria-label, aria-labelledby)
- [ ] Color contrast ≥4.5:1 text, ≥3:1 UI
- [ ] Touch targets ≥44x44px
- [ ] Reduced motion respected (@media prefers-reduced-motion)
- [ ] Screen reader tested

### Performance Targets

| Metric | Target | Tool |
|--------|--------|------|
| LCP | < 2.5s | Lighthouse |
| FID | < 100ms | Lighthouse |
| CLS | < 0.1 | Lighthouse |
| INP | < 200ms | Lighthouse |
| Bundle | Minimize | npm run analyze |

### Common Error Patterns

| Error | Cause | Solution |
|-------|-------|----------|
| Hydration mismatch | Server/client difference | useEffect for client-only |
| Cannot pass function | Server→Client boundary | Use server actions |
| Missing 'use client' | Hook in server component | Add directive at top |
| CSS not applying | Tailwind purge | Check content paths |

**Configuration**: `.claude/agents/modern-ui-agent.json`

---

## shadcn UI Frontend Agent

**Specialized agent for shadcn/ui component development, registry exploration, and design system management**

### Core Expertise

| Domain | Capabilities |
|--------|-------------|
| **Component Installation** | Registry search, CLI execution, dependency resolution |
| **Component Customization** | CVA variants, cn() utility, props extension, forwardRef |
| **Composite Components** | Multi-component composition, Radix primitives, Slot/asChild |
| **Theming & Styling** | HSL tokens, CSS variables, dark mode (class strategy) |
| **Animation Integration** | Framer Motion, tailwindcss-animate, reduced motion |
| **Accessibility** | WCAG 2.1 AA, ARIA, keyboard nav, focus management |
| **Registry Exploration** | Fuzzy search, examples, blocks, multi-registry |

### When to Use

**Automatically triggered for:**
- `shadcn`, `shadcn/ui`, `add component`, `registry`
- `cva`, `class-variance-authority`, `variants`
- `design system`, `theme`, `dark mode`, `css variables`
- Component names: `button variant`, `card`, `dialog`, `tabs`, etc.
- `Search ... in registry`, `Install ... from shadcn`

### Tool Access

```
Mandatory: vibe-check (error prevention)
Primary:   shadcn, filesystem, context7, playwright
Secondary: github, firecrawl
Bash:      npx shadcn@latest add [component], npm run dev
```

### shadcn MCP Tools

| Tool | Purpose |
|------|---------|
| `search_items_in_registries` | Fuzzy search for components |
| `view_items_in_registries` | Get detailed component info |
| `get_item_examples_from_registries` | Find usage examples/demos |
| `get_add_command_for_items` | Get CLI install command |
| `get_audit_checklist` | Post-install verification |
| `list_items_in_registries` | Paginated registry list |

### Component Installation Workflow

```
1. vibe-check → Verify component doesn't exist
2. shadcn.search_items_in_registries → Find component
3. shadcn.view_items_in_registries → Get details
4. shadcn.get_add_command_for_items → Get CLI command
5. bash: npx shadcn@latest add [component]
6. filesystem: verify src/components/ui/[component].tsx
7. shadcn.get_audit_checklist → Final verification
```

### CVA Variant Creation Workflow

```
1. vibe-check → Check existing variants
2. filesystem: read src/components/ui/[component].tsx
3. Analyze existing CVA configuration
4. Add new variant to buttonVariants object
5. filesystem: update component
6. playwright: visual test both modes
```

### Project Context

| Setting | Value |
|---------|-------|
| Style | `new-york` |
| RSC | `true` |
| TypeScript | `true` |
| Base Color | `neutral` |
| CSS Variables | enabled |
| Components Path | `src/components/ui/` |
| Globals CSS | `src/app/globals.css` |
| Registry | `@shadcn` |

### Quick Reference

**Adding a component:**
```bash
npx shadcn@latest add button
npx shadcn@latest add dialog --overwrite
npx shadcn@latest diff button
```

**CVA pattern:**
```tsx
const variants = cva('base-classes', {
  variants: {
    variant: { default: '', outline: '', gradient: 'bg-gradient-to-r' },
    size: { sm: '', md: '', lg: '' }
  },
  defaultVariants: { variant: 'default', size: 'md' }
})
```

**cn() utility:**
```tsx
cn(buttonVariants({ variant, size }), 'custom-class', className)
```

**CSS Variables (HSL format):**
```css
:root {
  --primary: 173 80% 40%;
  --primary-foreground: 0 0% 100%;
}
.dark {
  --primary: 173 80% 50%;
}
```

### Collaboration

| Scenario | Handoff To |
|----------|-----------|
| Complex React 19 patterns | modern-ui-agent |
| State management architecture | modern-ui-agent |
| Component installation | **from** modern-ui-agent |
| CVA variants, theming | **from** modern-ui-agent |

**Configuration**: `.claude/agents/shadcn-frontend-agent.json`

---

## Budget App Specialist

**Expert agent for budget app development with bank import parsing and financial data management**

### Core Expertise

| Domain | Capabilities |
|--------|-------------|
| **Bank Imports** | CSV, OFX/QFX, PDF parsing for 15+ North American banks |
| **Data Validation** | Duplicate detection (FITID/fuzzy/AI), anomaly detection |
| **AI Integration** | Smart column mapping, merchant enrichment, auto-categorization |
| **Database** | IndexedDB with Dexie.js, client-side encryption |
| **Analytics** | Spending trends, subscription detection, forecasting |

### When to Use

**Automatically triggered for:**
- Transaction import (CSV, OFX, PDF)
- Bank statement parsing issues
- Subscription tracking
- Budget management
- Spending analytics
- Merchant categorization
- Import error debugging

### Tool Access

```
Mandatory: vibe-check (error prevention)
Primary:   filesystem, playwright
Secondary: context7, firecrawl
```

### Supported Banks

| Bank | Status | Notes |
|------|--------|-------|
| BMO | Verified | Standard CSV format |
| Home Trust | Verified | Split debit/credit |
| TD Canada | Needs Testing | Multiple format variations |
| RBC | Needs Testing | Split columns vary |
| Scotiabank | Untested | - |
| CIBC | Untested | - |
| Chase | Needs Testing | Date format variations |
| Capital One | Needs Testing | Split format issues |

### Import Pipeline

```
1. File Upload (CSV/OFX/PDF)
2. Format Detection → identify file type
3. Bank Detection → signature patterns + AI fallback
4. Parsing → bank-specific logic
5. Duplicate Detection → FITID/fuzzy/AI matching
6. Validation → anomaly + business rules
7. Enrichment → merchant normalization, categories
8. Preview → user review
9. Import → bulk add to IndexedDB
10. Audit → collective learning update
```

### Key Files

| Category | Files |
|----------|-------|
| **Parsers** | `csv-parser.ts`, `ofx-parser.ts`, `pdf-bank-parser.ts`, `bank-configs.ts` |
| **AI** | `smart-bank-detection.ts`, `smart-column-mapper.ts`, `smart-duplicate-detection.ts` |
| **Database** | `budget-db.ts`, `subscription-detector.ts` |
| **Components** | `AIColumnMapperModal.tsx`, `ErrorRecoveryModal.tsx`, `ValidationWarningsModal.tsx` |

### Improvement Roadmap

**Priority 1**: Verify estimated bank formats (TD, RBC, Scotiabank, CIBC)
**Priority 2**: Improve PDF OCR (scanned image support, better error messages)
**Priority 3**: Add CSV export and PDF report generation
**Priority 4**: User-friendly error messages and retry logic

**Configuration**: `.claude/agents/budget-app-specialist.json`

---

## Agent Assignment Matrix

| Task Type | Best Agent(s) | Rationale |
|-----------|--------------|----------|
| **React/UI Components** | **modern-ui-agent**, react-specialist, typescript-pro | React 19 + Next.js 16 + shadcn/ui expertise |
| **shadcn/ui Tasks** | **shadcn-frontend-agent**, modern-ui-agent | Registry, CVA variants, theming, design system |
| **Database/Schema** | database-architect, supabase-specialist, rls-policy-designer | PostgreSQL + Supabase + security |
| **Testing/QA** | test-automator, playwright-specialist, qa-engineer | Automated testing + E2E coverage |
| **Content/MDX** | tco-content-specialist, markdown-expert | MDX modules + learning content |
| **Assessment/Quiz** | assessment-engine-specialist, question-generator | Question generation + evaluation |
| **Video Integration** | video-system-architect, analytics-specialist | Video tracking + milestone system |
| **Performance** | performance-engineer, bundle-analyzer, lighthouse-optimizer | Optimization + metrics |
| **API/Backend** | api-specialist, backend-architect, security-engineer | REST/GraphQL + security |
| **DevOps/Deploy** | devops-engineer, docker-specialist, deployment-specialist | CI/CD + containerization |
| **Debug/Troubleshoot** | debug-specialist, error-detective, analyzer | Error triage + root cause analysis |
| **Budget App** | **budget-app-specialist**, database-architect | Bank imports + financial data |
| **General/Mixed** | full-stack-specialist, system-architect | Multi-domain tasks |

### Agent Selection Criteria

1. **Task Domain Match**: Agent specialization aligns with task requirements
2. **Tool Access**: Agent has required MCP tools/permissions
3. **Complexity Level**: Agent experience matches task complexity
4. **Historical Success**: Proven track record on similar tasks
