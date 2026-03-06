# Budget App Complete Improvement - Product Requirements Document v2.0

**Project ID:** budget-app-complete-improvement
**Version:** 2.0
**Date:** 2025-01-02
**Status:** Approved - Ready for Archon Execution
**Timeline:** 25 days (55 tasks across 8 phases)

---

## ⚠️ MANDATORY: READ THIS BEFORE EVERY TASK

This PRD is the **single source of truth** for all 55 tasks. Every agent must:

1. ✅ **Read this entire document** before starting ANY task
2. ✅ **Run vibe-check** to identify assumptions and prevent tunnel vision
3. ✅ **Follow design-guide.md** standards (no gradients, single accent, 8px grid)
4. ✅ **Test after every change** in browser
5. ✅ **Update task status** in Archon when complete

**Failure to follow these steps will result in rework and delays.**

---

## 🎯 Project Overview

### Problem Statement

Budget App currently:

- ❌ Violates internal design standards (multiple gradients, 6+ accent colors)
- ❌ Lacks WCAG 2.2 AA accessibility (EU EAA June 2025 legal requirement)
- ❌ Poor mobile experience (71% users prefer mobile)
- ❌ Missing modern 2025 UX patterns (microinteractions, AI insights)
- ❌ Missing competitive features (split transactions, receipts, investment tracking)

### Solution

Comprehensive 55-task improvement plan across 8 phases:

1. **Design System Compliance** (12 tasks, 3 days)
2. **WCAG 2.2 AA Accessibility** (8 tasks, 2 days)
3. **Mobile-First Experience** (11 tasks, 4 days)
4. **Modern UX Patterns** (10 tasks, 4 days)
5. **Smart Features** (8 tasks, 4 days)
6. **Split Transactions** (6 tasks, 3 days)
7. **Receipt Attachments** (5 tasks, 2 days)
8. **Investment Tracking** (6 tasks, 3 days)

### Success Metrics

| Metric                       | Current  | Target   | Validation Method                        |
| ---------------------------- | -------- | -------- | ---------------------------------------- |
| **Design Compliance**        | ~40%     | 100%     | Manual checklist (0 gradients, 1 accent) |
| **Lighthouse Accessibility** | Unknown  | ≥95%     | Automated CI check                       |
| **Pa11y WCAG Violations**    | Unknown  | 0 errors | Automated CI check                       |
| **Google Mobile-Friendly**   | Unknown  | ≥90%     | Google test tool                         |
| **Lighthouse PWA**           | 0%       | 100%     | Automated CI check                       |
| **User Satisfaction**        | Baseline | +25%     | Post-launch survey                       |

---

## 🎨 Design Standards (MANDATORY)

### Color Palette (Single Accent - STRICT ENFORCEMENT)

```css
/* PRIMARY ACCENT (use ONLY for CTAs and key actions) */
--accent: #14b8a6; /* Teal */
--accent-hover: #0f766e; /* Darker teal for hover */
--accent-light: #99f6e4; /* Light teal for backgrounds */

/* GRAY SCALE (use for EVERYTHING else) */
--gray-50: #fafafa; /* Page background */
--gray-100: #f5f5f5; /* Card background */
--gray-200: #e5e5e5; /* Borders */
--gray-300: #d4d4d4; /* Disabled */
--gray-500: #737373; /* Secondary text */
--gray-700: #404040; /* Body text */
--gray-900: #171717; /* Headings */

/* SEMANTIC COLORS (ONLY for their specific meaning) */
--success: #10b981; /* Green - income, positive, success */
--error: #ef4444; /* Red - expenses, errors */
--warning: #f59e0b; /* Yellow - alerts, warnings */
```

**FORBIDDEN COLORS:** Purple, orange, cyan, blue (except semantic), ANY gradients

---

## ♿ WCAG 2.2 AA Requirements (MANDATORY)

### Critical Compliance Checklist

- [ ] **ARIA Labels:** All buttons, icons, form fields have descriptive labels
- [ ] **Focus Indicators:** ring-2 ring-teal-500 on all interactive elements
- [ ] **Semantic HTML:** `<button>`, `<nav>`, `<main>`, `<aside>` (not `<div onClick>`)
- [ ] **Non-Color Status:** Icons + text for all status indicators
- [ ] **Contrast Ratios:** ≥4.5:1 for text, ≥3:1 for UI components
- [ ] **Keyboard Navigation:** All workflows completable without mouse
- [ ] **Screen Reader:** NVDA/VoiceOver announcements for all actions
- [ ] **Skip Navigation:** "Skip to main content" link visible on Tab
- [ ] **Live Regions:** aria-live for dynamic updates (toasts, loading)

### Legal Context

- **EU Accessibility Act (EAA):** June 28, 2025 deadline
- **Market Size:** 1.6B+ people with disabilities ($18T spending power)
- **Penalties:** Non-compliance can result in fines and market exclusion

---

## 📱 Mobile-First Requirements (MANDATORY)

### Statistics

- 71% of users prefer mobile experience
- Touch targets must be ≥44px (accessibility + usability)
- PWA installability increases engagement by 40%

### Critical Mobile Features

- [ ] **Responsive Layout:** Sidebar collapses, bottom nav appears (<768px)
- [ ] **Touch Targets:** All buttons ≥44px tap area
- [ ] **PWA:** Installable, works offline, home screen icon
- [ ] **Swipe Actions:** Swipe-to-delete transactions
- [ ] **Mobile Forms:** Stacked fields, 48px inputs, proper keyboard types
- [ ] **Bottom Sheets:** Modals slide up from bottom on mobile

---

## 🤖 Agent Best Practices

### Before Starting ANY Task

1. **Read this PRD** (entire document, not just your task)
2. **Run vibe-check** (identify assumptions, check for tunnel vision)
3. **Review design-guide.md** (if UI work)
4. **Check task dependencies** (do prerequisites exist?)
5. **Understand success criteria** (how will you know you're done?)

### During Task Execution

1. **Test incrementally** (browser after every change)
2. **Follow naming conventions** (camelCase components, kebab-case files)
3. **Add comments** for complex logic
4. **Avoid over-engineering** (simple solutions first)
5. **Coordinate with other agents** (if dependencies exist)

### After Completing Task

1. **Validate success criteria** (checklist from task description)
2. **Test edge cases** (empty states, errors, mobile)
3. **Update Archon status** (mark task complete)
4. **Document any issues** (blockers, tech debt, future improvements)
5. **Notify dependent tasks** (if others are waiting)

---

## 📋 PHASE 1: Design System Compliance (Days 1-3, 12 tasks)

### Objectives

- Remove ALL gradients from codebase
- Consolidate to single teal accent color
- Improve basic UX (toasts, tooltips, sample data)

### Tasks

#### Task 1.1.1: Audit all gradients in budget app

**Duration:** 1 hour
**Agent:** frontend-developer
**Vibe-Check:** ✅ MANDATORY before starting

**Description:**
Search entire `src/app/budget-app/` directory for gradient usage:

- `grep -r "gradient" src/app/budget-app/ --include="*.tsx"`
- Document every occurrence (file, line number, component, usage)
- Create removal checklist with priority order

**Success Criteria:**

- [ ] Complete list of all gradients with file paths
- [ ] Checklist created for removal tasks
- [ ] Shared with Tasks 1.1.2-1.1.4

**Files:** None (audit only)
**Dependencies:** None

---

#### Task 1.1.2: Remove gradients from dashboard metric cards

**Duration:** 2 hours
**Agent:** react-specialist
**Vibe-Check:** ✅ MANDATORY before starting

**Description:**
Remove `bg-gradient-to-r`, `bg-gradient-to-br` from dashboard components:

- MetricCard component: Replace gradient top bar with `border-l-4 border-teal-500`
- Update all metric cards (Net Worth, Income, Expenses, Budget Status)
- Ensure visual hierarchy maintained without gradients

**Before:**

```tsx
<div className="h-2 bg-gradient-to-r from-purple-500 to-indigo-600" />
```

**After:**

```tsx
<div className="border-l-4 border-teal-500 bg-white" />
```

**Success Criteria:**

- [ ] 0 gradients in dashboard page
- [ ] Metric cards visually clear without gradients
- [ ] Teal accent used appropriately

**Files:**

- `src/app/budget-app/page.tsx` (lines 56-74, MetricCard component)

**Dependencies:** Task 1.1.1

---

#### Task 1.1.3: Remove gradients from transaction components

**Duration:** 1.5 hours
**Agent:** frontend-developer
**Vibe-Check:** ✅ MANDATORY before starting

**Description:**
Remove gradients from transaction-related components:

- Transaction list (if any gradient backgrounds)
- Transaction modal (category badges, buttons)
- Category badges: solid colors only

**Success Criteria:**

- [ ] 0 gradients in transactions page
- [ ] 0 gradients in TransactionModal
- [ ] Category badges use solid colors

**Files:**

- `src/app/budget-app/transactions/page.tsx`
- `src/components/budget/TransactionModal.tsx`

**Dependencies:** Task 1.1.1

---

#### Task 1.1.4: Remove gradients from budget/reports pages

**Duration:** 1.5 hours
**Agent:** frontend-developer
**Vibe-Check:** ✅ MANDATORY before starting

**Description:**
Remove gradients from remaining pages:

- Budget progress bars: solid colors (green/yellow/red)
- Reports page chart cards
- Import/export/settings pages

**Success Criteria:**

- [ ] 0 gradients in budgets page
- [ ] 0 gradients in reports page
- [ ] Progress bars use solid semantic colors

**Files:**

- `src/app/budget-app/budgets/page.tsx`
- `src/app/budget-app/reports/page.tsx`
- `src/app/budget-app/import/page.tsx`
- `src/app/budget-app/export/page.tsx`
- `src/app/budget-app/settings/page.tsx`

**Dependencies:** Task 1.1.1

---

#### Task 1.1.5: Define single accent color palette

**Duration:** 1 hour
**Agent:** ui-ux-designer
**Vibe-Check:** ✅ MANDATORY before starting

**Description:**
Document complete color system:

- Select teal (#14b8a6) as primary accent
- Define hover states (#0f766e)
- Define light backgrounds (#99f6e4)
- Define gray scale (50-900)
- Define semantic colors (success, error, warning)
- Update `tailwind.config.ts` if needed

**Success Criteria:**

- [ ] Color palette documented
- [ ] Approved by design standards (.claude/Skills/design-guide.md)
- [ ] Tailwind config updated if necessary
- [ ] Shared with all Phase 1 agents

**Files:**

- `tailwind.config.ts` (optional, may use default Tailwind colors)
- Documentation file

**Dependencies:** None

---

#### Task 1.1.6: Replace purple/orange/cyan with teal

**Duration:** 2 hours
**Agent:** frontend-developer
**Vibe-Check:** ✅ MANDATORY before starting

**Description:**
Find and replace accent colors:

- `grep -r "purple-" src/app/budget-app/ --include="*.tsx"` → teal or gray
- `grep -r "orange-" src/app/budget-app/ --include="*.tsx"` → teal or gray
- `grep -r "cyan-" src/app/budget-app/ --include="*.tsx"` → teal or gray
- `grep -r "blue-" src/app/budget-app/ --include="*.tsx"` → keep if semantic, else teal
- Keep green/red ONLY for semantic meaning (income/expense/success/error)

**Success Criteria:**

- [ ] Max 4 distinct colors visible in app (gray + teal + green + red)
- [ ] Visual inspection confirms single accent (teal)
- [ ] Semantic colors used correctly

**Files:** All budget-app components

**Dependencies:** Task 1.1.5

---

#### Task 1.2.1: Install and configure react-hot-toast

**Duration:** 30 minutes
**Agent:** frontend-developer
**Vibe-Check:** ✅ MANDATORY before starting

**Description:**
Set up toast notification system:

- `npm install react-hot-toast`
- Add `<Toaster />` to budget app layout
- Configure default styling (teal accent, 4 second duration)

**Example:**

```tsx
import { Toaster } from "react-hot-toast";

export default function BudgetAppLayout({ children }) {
  return (
    <>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          success: { style: { background: "#10b981" } },
          error: { style: { background: "#ef4444" } },
        }}
      />
    </>
  );
}
```

**Success Criteria:**

- [ ] react-hot-toast installed
- [ ] Toaster component in layout
- [ ] Styled with teal accent

**Files:**

- `package.json`
- `src/app/budget-app/layout.tsx`

**Dependencies:** None

---

#### Task 1.2.2: Replace alert() with toast.success/error

**Duration:** 1.5 hours
**Agent:** react-specialist
**Vibe-Check:** ✅ MANDATORY before starting

**Description:**
Replace all browser alerts with toasts:

- `grep -r "alert(" src/app/budget-app/ --include="*.tsx"`
- `grep -r "confirm(" src/app/budget-app/ --include="*.tsx"`
- Replace `alert("Success")` → `toast.success("Success")`
- Replace `alert("Error")` → `toast.error("Error")`
- Replace `confirm("Are you sure?")` → Custom modal or toast.promise()

**Success Criteria:**

- [ ] 0 `alert()` calls remaining (grep returns nothing)
- [ ] 0 `confirm()` calls remaining (use modals instead)
- [ ] All success/error messages show as toasts

**Files:** All budget-app components

**Dependencies:** Task 1.2.1

---

#### Task 1.2.3: Add tooltips to icon buttons

**Duration:** 2 hours
**Agent:** frontend-developer
**Vibe-Check:** ✅ MANDATORY before starting

**Description:**
Add descriptive tooltips to all icon-only buttons:

- Install `@radix-ui/react-tooltip`
- Wrap icon buttons (Edit, Delete, Categorize, Upload, etc.)
- Include keyboard shortcuts in tooltips where applicable

**Example:**

```tsx
<Tooltip>
  <TooltipTrigger asChild>
    <button aria-label="Delete transaction">
      <Trash2 className="h-4 w-4" />
    </button>
  </TooltipTrigger>
  <TooltipContent>
    <p>Delete transaction</p>
    <p className="text-xs text-gray-400">Keyboard: Del</p>
  </TooltipContent>
</Tooltip>
```

**Success Criteria:**

- [ ] All icon buttons have tooltips
- [ ] Tooltips show on hover (desktop) and long-press (mobile)
- [ ] Keyboard shortcuts mentioned where applicable

**Files:** All pages with icon buttons

**Dependencies:** None

---

#### Task 1.2.4: Create CSV export guide component

**Duration:** 1 hour
**Agent:** frontend-developer
**Vibe-Check:** ✅ MANDATORY before starting

**Description:**
Create step-by-step guide for exporting CSV from banks:

- BMO: Login → Accounts → Export → CSV format
- Home Trust: Login → Statements → Download CSV
- Add screenshots or links to bank help pages
- Display on import page when no transactions exist

**Success Criteria:**

- [ ] Guide component created
- [ ] Clear instructions for BMO and Home Trust
- [ ] Displays on empty import page
- [ ] Links to bank help pages (if available)

**Files:**

- `src/components/budget/CSVGuide.tsx` (new file)
- `src/app/budget-app/import/page.tsx` (integrate guide)

**Dependencies:** None

---

#### Task 1.2.5: Create sample data generator

**Duration:** 3 hours
**Agent:** data-analyst
**Vibe-Check:** ✅ MANDATORY before starting

**Description:**
Generate realistic demo transactions:

- 50 transactions spanning 3 months
- Variety: Groceries ($50-$200), Bills ($100-$500), Income ($3000), Restaurants ($20-$80)
- Include common merchants: Sobeys, Tim Hortons, Rogers, Bell, Netflix, etc.
- Auto-categorize using existing rules
- "Load Sample Data" button on empty dashboard

**Success Criteria:**

- [ ] 50 realistic transactions generated
- [ ] Covers major categories (15+)
- [ ] Dates spread over 3 months
- [ ] Button works, data loads instantly

**Files:**

- `src/lib/sample-data.ts` (new file)
- `src/app/budget-app/page.tsx` (add button to empty state)

**Dependencies:** None

---

#### Task 1.2.6: Add empty state components

**Duration:** 1 hour
**Agent:** ui-ux-designer
**Vibe-Check:** ✅ MANDATORY before starting

**Description:**
Design and implement empty states:

- Dashboard: Piggy bank icon + "Welcome! Let's get started" + CTAs
- Transactions: Receipt icon + "No transactions yet" + "Import CSV" button
- Budgets: Target icon + "Set your first budget" + CTA
- Reports: Chart icon + "Import transactions to see reports"

**Success Criteria:**

- [ ] All empty pages have friendly guidance
- [ ] Clear CTAs (Import CSV, Add Transaction, Set Budget)
- [ ] Icons and visual hierarchy
- [ ] Matches app design style

**Files:** All empty state pages

**Dependencies:** None

---

## 📋 PHASE 2: WCAG 2.2 AA Accessibility (Days 4-5, 8 tasks)

### Objectives

- Achieve Lighthouse Accessibility ≥95%
- Pass Pa11y with 0 WCAG violations
- Enable screen reader navigation
- Ensure keyboard-only usability

### Tasks

#### Task 2.1.1: Add ARIA labels to all buttons

**Duration:** 2 hours
**Agent:** accessibility-tester (LEAD)
**Vibe-Check:** ✅ MANDATORY before starting

**Description:**
Audit and add ARIA labels:

- All icon-only buttons need `aria-label`
- Form inputs need `aria-describedby` for help text
- Decorative icons need `aria-hidden="true"`
- Group related elements with `aria-labelledby`

**Example:**

```tsx
<button
  onClick={handleDelete}
  aria-label="Delete transaction permanently"
  aria-describedby="delete-help"
>
  <Trash2 className="w-4 h-4" aria-hidden="true" />
</button>
<span id="delete-help" className="sr-only">
  This action cannot be undone
</span>
```

**Success Criteria:**

- [ ] All buttons have descriptive labels
- [ ] All form fields properly labeled
- [ ] Decorative icons marked aria-hidden
- [ ] Pa11y shows no "missing label" errors

**Files:** All interactive components

**Dependencies:** None

---

#### Task 2.1.2: Implement keyboard focus indicators

**Duration:** 1.5 hours
**Agent:** frontend-developer
**Vibe-Check:** ✅ MANDATORY before starting

**Description:**
Add visible focus indicators to all interactive elements:

- Add `focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2`
- Test tab order (should be logical: top-to-bottom, left-to-right)
- Ensure focus visible on buttons, links, inputs, selects, textareas

**Success Criteria:**

- [ ] All interactive elements have visible focus
- [ ] Focus indicator is 2px teal ring with 2px offset
- [ ] Tab order is logical (can navigate entire app)
- [ ] No focus traps (can always Tab to next element)

**Files:** All interactive components

**Dependencies:** None

---

#### Task 2.1.3: Add semantic HTML structure

**Duration:** 2 hours
**Agent:** frontend-developer
**Vibe-Check:** ✅ MANDATORY before starting

**Description:**
Replace divs with semantic HTML:

- `<div onClick={}>` → `<button type="button">`
- Navigation → `<nav aria-label="Primary navigation">`
- Main content → `<main id="main-content">`
- Sidebars → `<aside aria-label="Budget summary">`
- Headers → `<header>`

**Success Criteria:**

- [ ] 0 `<div onClick>` patterns (use `<button>`)
- [ ] `<nav>`, `<main>`, `<aside>` used correctly
- [ ] Landmark roles clear (helps screen reader navigation)

**Files:**

- `src/app/budget-app/layout.tsx`
- All pages

**Dependencies:** None

---

#### Task 2.1.4: Add non-color status indicators

**Duration:** 2.5 hours
**Agent:** accessibility-tester
**Vibe-Check:** ✅ MANDATORY before starting

**Description:**
Add icons + text to status indicators:

- Budget progress bars: Add icons (✓ green, ⚠️ yellow, ✗ red)
- Add text labels: "On track", "Warning", "Over budget"
- Transaction categories: Icon + text, not just color badge
- Ensure status clear in grayscale (test with Chrome DevTools grayscale filter)

**Before (color only):**

```tsx
<div className="h-2 bg-red-500" style={{ width: `${percentage}%` }} />
```

**After (color + icon + text):**

```tsx
<div className="flex items-center gap-2">
  <AlertCircle className="h-4 w-4 text-red-600" aria-label="Over budget" />
  <div className="h-2 flex-1 bg-red-500" style={{ width: `${percentage}%` }} />
  <span className="text-sm font-medium">Over budget ({percentage}%)</span>
</div>
```

**Success Criteria:**

- [ ] All status indicators have icons + text
- [ ] Status comprehensible in grayscale
- [ ] Screen reader announces status clearly

**Files:** Budget progress bars, transaction badges, alerts

**Dependencies:** None

---

#### Task 2.1.5: Implement skip navigation link

**Duration:** 30 minutes
**Agent:** accessibility-tester
**Vibe-Check:** ✅ MANDATORY before starting

**Description:**
Add "Skip to main content" link:

- Hidden by default (sr-only)
- Visible when focused (first Tab press)
- Links to `<main id="main-content">`
- Styled to match app theme

**Example:**

```tsx
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-teal-500 focus:px-4 focus:py-2 focus:text-white"
>
  Skip to main content
</a>
```

**Success Criteria:**

- [ ] Skip link appears on first Tab press
- [ ] Clicking skip link jumps to main content
- [ ] Styled to match app theme
- [ ] WCAG 2.4.1 compliance

**Files:**

- `src/app/budget-app/layout.tsx`

**Dependencies:** Task 2.1.3 (semantic HTML)

---

#### Task 2.1.6: Add live regions for dynamic updates

**Duration:** 1 hour
**Agent:** accessibility-tester
**Vibe-Check:** ✅ MANDATORY before starting

**Description:**
Add aria-live regions for screen reader announcements:

- Toast notifications: `aria-live="polite"`
- Loading states: `aria-busy="true"` + `aria-label="Loading..."`
- Form errors: `aria-live="assertive"`
- Status messages: sr-only announcements

**Example:**

```tsx
// Toast (already has aria-live in react-hot-toast)
<Toaster aria-live="polite" />

// Loading
<div aria-busy="true" aria-label="Loading transactions...">
  <LoadingSpinner />
</div>

// Form error
<span className="sr-only" aria-live="assertive">
  {error && `Error: ${error}`}
</span>
```

**Success Criteria:**

- [ ] Screen reader announces toast messages
- [ ] Loading states announced
- [ ] Form errors announced immediately
- [ ] No redundant announcements (polite vs assertive)

**Files:** All components with dynamic updates

**Dependencies:** Task 1.2.1 (toast system)

---

#### Task 2.1.7: Test with NVDA screen reader

**Duration:** 2 hours
**Agent:** accessibility-tester
**Vibe-Check:** ✅ MANDATORY before starting

**Description:**
Manual screen reader testing:

- Install NVDA (Windows) or VoiceOver (Mac)
- Navigate entire app using only screen reader
- Complete workflows: Import CSV → Categorize → Set Budget → View Report
- Document any issues (missing labels, confusing flow, etc.)

**Test Checklist:**

- [ ] Can navigate to all pages using screen reader
- [ ] All buttons/links announced with clear labels
- [ ] Form fields have clear labels and instructions
- [ ] Table data readable (transactions, budgets)
- [ ] Charts described (or skippable with explanation)
- [ ] Modals announced when opened
- [ ] No confusion about page structure

**Success Criteria:**

- [ ] All workflows completable with screen reader only
- [ ] No major confusion or missing information
- [ ] Issues documented for fixes

**Files:** None (testing only)

**Dependencies:** Tasks 2.1.1-2.1.6

---

#### Task 2.1.8: Run Lighthouse & Pa11y audits

**Duration:** 1 hour
**Agent:** qa-expert
**Vibe-Check:** ✅ MANDATORY before starting

**Description:**
Automated accessibility testing:

- Run Lighthouse: `lighthouse http://localhost:3000/budget-app --only-categories=accessibility`
- Target: ≥95% accessibility score
- Run Pa11y: `pa11y http://localhost:3000/budget-app --standard WCAG2AA --threshold 0`
- Target: 0 errors
- Fix any failures, re-run until passing

**Success Criteria:**

- [ ] Lighthouse Accessibility ≥95%
- [ ] Pa11y WCAG2AA: 0 errors
- [ ] Report saved for documentation

**Files:** None (testing only)

**Dependencies:** Tasks 2.1.1-2.1.6

---

## 📋 PHASE 3: Mobile-First Experience (Days 6-9, 11 tasks)

### Objectives

- Google Mobile-Friendly ≥90%
- Lighthouse PWA score 100%
- App installable on iOS and Android
- All workflows usable on mobile

### Tasks

#### Task 3.1.1: Implement collapsible sidebar

**Duration:** 3 hours
**Agent:** react-specialist
**Vibe-Check:** ✅ MANDATORY before starting

**Description:**
Make sidebar responsive:

- Desktop (≥768px): Always visible, 256px width
- Mobile (<768px): Hidden by default, slide in with animation
- Hamburger menu button (top-left, mobile only)
- Overlay closes sidebar when clicked outside

**Implementation:**

```tsx
const [sidebarOpen, setSidebarOpen] = useState(false);

// Hamburger button (mobile only)
<button
  className="lg:hidden fixed top-4 left-4 z-50"
  onClick={() => setSidebarOpen(!sidebarOpen)}
  aria-label="Toggle navigation menu"
  aria-expanded={sidebarOpen}
>
  <Menu className="w-6 h-6" />
</button>

// Sidebar
<aside className={`
  fixed lg:static inset-y-0 left-0 z-40
  w-64 bg-white border-r
  transform transition-transform duration-300
  ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
`}>
  {/* Navigation */}
</aside>

// Overlay (mobile only)
{sidebarOpen && (
  <div
    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
    onClick={() => setSidebarOpen(false)}
    aria-hidden="true"
  />
)}
```

**Success Criteria:**

- [ ] Sidebar always visible on desktop (≥768px)
- [ ] Sidebar hidden by default on mobile (<768px)
- [ ] Hamburger menu opens sidebar with animation
- [ ] Overlay closes sidebar on mobile
- [ ] ARIA labels for screen readers

**Files:**

- `src/app/budget-app/layout.tsx`

**Dependencies:** None

---

#### Task 3.1.2: Create bottom navigation bar

**Duration:** 2 hours
**Agent:** frontend-developer
**Vibe-Check:** ✅ MANDATORY before starting

**Description:**
Add bottom tab bar for mobile:

- 4 tabs: Home, Transactions, Budgets, Reports
- Icons + labels
- Active state indicator (teal underline)
- Hidden on desktop (≥768px)
- Fixed to bottom on mobile

**Implementation:**

```tsx
<nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-white md:hidden">
  <div className="flex h-16 items-center justify-around">
    <Link
      href="/budget-app"
      className={`flex flex-col items-center gap-1 px-3 py-2 ${
        isActive("/budget-app") ? "text-teal-500" : "text-gray-600"
      }`}
    >
      <Home className="h-5 w-5" />
      <span className="text-xs">Home</span>
    </Link>
    {/* Repeat for Transactions, Budgets, Reports */}
  </div>
</nav>;

{
  /* Add padding to main content to prevent bottom nav overlap */
}
<main className="pb-20 md:pb-0">{children}</main>;
```

**Success Criteria:**

- [ ] Bottom nav visible on mobile (<768px)
- [ ] Hidden on desktop (≥768px)
- [ ] Active state shows current page
- [ ] Icons + labels clear
- [ ] Main content not hidden behind nav (pb-20)

**Files:**

- `src/app/budget-app/layout.tsx`

**Dependencies:** None

---

#### Task 3.1.3: Make all touch targets ≥44px

**Duration:** 2 hours
**Agent:** ui-ux-designer
**Vibe-Check:** ✅ MANDATORY before starting

**Description:**
Ensure all interactive elements meet touch target size:

- Audit all buttons, links, inputs using Chrome DevTools
- Add `min-h-[44px]` to small buttons
- Increase padding on compact elements
- Test on real mobile device

**Example fixes:**

```tsx
// Before (too small)
<button className="p-1">
  <Edit className="w-4 h-4" />
</button>

// After (≥44px)
<button className="p-3 min-h-[44px] min-w-[44px]">
  <Edit className="w-4 h-4" />
</button>
```

**Success Criteria:**

- [ ] Chrome DevTools "Show rulers" confirms ≥44px
- [ ] All buttons, links, inputs meet target size
- [ ] Tested on real device (iPhone/Android)

**Files:** All interactive components

**Dependencies:** None

---

#### Task 3.1.4: Create mobile card view for transactions

**Duration:** 3 hours
**Agent:** frontend-developer
**Vibe-Check:** ✅ MANDATORY before starting

**Description:**
Replace table with card layout on mobile:

- Desktop (≥768px): Table view
- Mobile (<768px): Card layout (one transaction per card)
- Each card: Description, category badge, date, amount
- Maintain edit/delete actions

**Implementation:**

```tsx
{
  /* Desktop table */
}
<div className="hidden md:block">
  <table>{/* existing table */}</table>
</div>;

{
  /* Mobile cards */
}
<div className="space-y-2 md:hidden">
  {transactions.map((tx) => (
    <div key={tx.id} className="rounded-lg bg-white p-4 shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="font-semibold text-gray-900">{tx.description}</p>
          <p className="mt-1 text-sm text-gray-500">{tx.category}</p>
          <p className="mt-1 text-xs text-gray-400">{new Date(tx.date).toLocaleDateString()}</p>
        </div>
        <div className="text-right">
          <p className={`font-bold ${tx.amount > 0 ? "text-green-600" : "text-gray-900"}`}>
            ${Math.abs(tx.amount).toFixed(2)}
          </p>
          <div className="mt-2 flex gap-2">
            <button className="p-2" aria-label="Edit">
              <Edit className="h-4 w-4" />
            </button>
            <button className="p-2" aria-label="Delete">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  ))}
</div>;
```

**Success Criteria:**

- [ ] Table view on desktop (≥768px)
- [ ] Card view on mobile (<768px)
- [ ] All transaction data visible
- [ ] Actions (edit/delete) accessible

**Files:**

- `src/app/budget-app/transactions/page.tsx`

**Dependencies:** None

---

#### Task 3.1.5: Implement swipe-to-delete

**Duration:** 2 hours
**Agent:** react-specialist
**Vibe-Check:** ✅ MANDATORY before starting

**Description:**
Add swipe gestures to transaction cards:

- Install `react-swipeable`
- Swipe left reveals delete button
- Swipe right dismisses
- Only on mobile card view

**Implementation:**

```tsx
import { useSwipeable } from "react-swipeable";

const [swipedId, setSwipedId] = useState<string | null>(null);

const handlers = useSwipeable({
  onSwipedLeft: () => setSwipedId(tx.id),
  onSwipedRight: () => setSwipedId(null),
  preventDefaultTouchmoveEvent: true,
  trackMouse: false, // Mobile only
});

<div {...handlers} className="relative overflow-hidden">
  <div className={`transition-transform ${swipedId === tx.id ? "-translate-x-20" : ""}`}>
    {/* Transaction card */}
  </div>
  {swipedId === tx.id && (
    <button
      className="absolute inset-y-0 right-0 flex w-20 items-center justify-center bg-red-600 text-white"
      onClick={() => handleDelete(tx.id)}
    >
      <Trash2 className="h-5 w-5" />
    </button>
  )}
</div>;
```

**Success Criteria:**

- [ ] Swipe left reveals delete button
- [ ] Swipe right dismisses
- [ ] Only on mobile (<768px)
- [ ] Smooth animation

**Files:**

- `src/app/budget-app/transactions/page.tsx`

**Dependencies:** Task 3.1.4 (mobile card view)

---

#### Task 3.1.6: Optimize forms for mobile

**Duration:** 2 hours
**Agent:** frontend-developer
**Vibe-Check:** ✅ MANDATORY before starting

**Description:**
Make forms mobile-friendly:

- Stack fields vertically on mobile (remove grid)
- Increase input height to 48px
- Use `inputMode` for correct mobile keyboards
- Full-width inputs on mobile

**Implementation:**

```tsx
{
  /* Desktop: 2 columns, Mobile: 1 column */
}
<div className="space-y-4 md:grid md:grid-cols-2 md:gap-4">
  <div>
    <label className="mb-2 block text-sm font-medium">Amount</label>
    <input
      type="number"
      inputMode="decimal"
      className="h-12 w-full rounded-lg border px-4 md:h-10"
    />
  </div>
  <div>
    <label className="mb-2 block text-sm font-medium">Date</label>
    <input type="date" className="h-12 w-full rounded-lg border px-4 md:h-10" />
  </div>
</div>;
```

**Success Criteria:**

- [ ] Fields stacked on mobile (<768px)
- [ ] Input height 48px on mobile
- [ ] Correct keyboard types (decimal, email, tel, etc.)
- [ ] Easy to complete on mobile

**Files:**

- `src/components/budget/TransactionModal.tsx`
- All form components

**Dependencies:** None

---

#### Task 3.1.7: Implement bottom sheet modals

**Duration:** 3 hours
**Agent:** react-specialist
**Vibe-Check:** ✅ MANDATORY before starting

**Description:**
Make modals responsive:

- Desktop: Centered modal (current behavior)
- Mobile: Bottom sheet that slides up
- Swipe down to dismiss (mobile)

**Implementation:**

```tsx
<div
  className={`fixed inset-x-0 z-50 md:inset-0 ${isOpen ? "bottom-0" : "-bottom-full"} transition-all duration-300 md:flex md:items-center md:justify-center`}
>
  {/* Desktop: Centered with backdrop */}
  {/* Mobile: Bottom sheet */}
  <div
    className={`max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-xl md:mx-4 md:max-w-2xl md:rounded-lg`}
  >
    {children}
  </div>
</div>
```

**Success Criteria:**

- [ ] Desktop: Centered modal
- [ ] Mobile: Bottom sheet
- [ ] Swipe down to dismiss (mobile)
- [ ] Smooth animations

**Files:**

- `src/components/budget/TransactionModal.tsx`
- All modal components

**Dependencies:** None

---

#### Task 3.2.1: Create PWA manifest.json

**Duration:** 1 hour
**Agent:** frontend-developer
**Vibe-Check:** ✅ MANDATORY before starting

**Description:**
Create PWA manifest:

- App name, short_name, description
- Icons (192px, 512px)
- Theme color (teal #14b8a6)
- Display: standalone
- Start URL: /budget-app

**manifest.json:**

```json
{
  "name": "Budget App - Household Finance Manager",
  "short_name": "Budget App",
  "description": "Privacy-first budget management app",
  "start_url": "/budget-app",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#14b8a6",
  "icons": [
    {
      "src": "/icons/budget-app-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/budget-app-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

**Success Criteria:**

- [ ] manifest.json created
- [ ] Icons created (192px, 512px)
- [ ] Manifest linked in layout

**Files:**

- `public/manifest.json`
- `public/icons/budget-app-192.png`
- `public/icons/budget-app-512.png`
- `src/app/budget-app/layout.tsx` (link manifest)

**Dependencies:** None

---

#### Task 3.2.2: Implement service worker

**Duration:** 2 hours
**Agent:** performance-engineer
**Vibe-Check:** ✅ MANDATORY before starting

**Description:**
Create service worker for offline support:

- Cache budget app pages
- Cache-first strategy for assets
- Network-first for API calls (if any)
- Offline fallback page

**sw.js:**

```js
const CACHE_NAME = "budget-app-v1";
const urlsToCache = [
  "/budget-app",
  "/budget-app/transactions",
  "/budget-app/budgets",
  "/budget-app/reports",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)));
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});
```

**Success Criteria:**

- [ ] Service worker created
- [ ] Caches budget app pages
- [ ] Works offline (dashboard loads without network)

**Files:**

- `public/sw.js`

**Dependencies:** None

---

#### Task 3.2.3: Add install prompt

**Duration:** 1.5 hours
**Agent:** frontend-developer
**Vibe-Check:** ✅ MANDATORY before starting

**Description:**
Add "Install App" prompt:

- Capture `beforeinstallprompt` event
- Show install button after 3 visits (localStorage)
- Trigger prompt on button click

**Implementation:**

```tsx
const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
const [showInstall, setShowInstall] = useState(false);

useEffect(() => {
  const visits = parseInt(localStorage.getItem("visits") || "0");
  localStorage.setItem("visits", (visits + 1).toString());

  if (visits >= 2) {
    setShowInstall(true);
  }

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    setDeferredPrompt(e);
  });
}, []);

const handleInstall = () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(() => {
      setDeferredPrompt(null);
      setShowInstall(false);
    });
  }
};
```

**Success Criteria:**

- [ ] Install prompt appears after 3 visits
- [ ] Button triggers install dialog
- [ ] Works on Chrome, Edge, Samsung Internet

**Files:**

- `src/app/budget-app/page.tsx`

**Dependencies:** Task 3.2.1 (manifest)

---

#### Task 3.2.4: Test PWA on iOS and Android

**Duration:** 1 hour
**Agent:** qa-expert
**Vibe-Check:** ✅ MANDATORY before starting

**Description:**
Manual PWA testing:

- iOS Safari: Add to Home Screen
- Android Chrome: Install app
- Test offline mode (airplane mode)
- Run Lighthouse PWA audit

**Test Checklist:**

- [ ] iOS: Add to Home Screen works
- [ ] Android: Install prompt appears
- [ ] App launches in standalone mode
- [ ] Offline mode works (dashboard loads)
- [ ] Lighthouse PWA score = 100%

**Success Criteria:**

- [ ] Lighthouse PWA 100%
- [ ] Installs on both platforms
- [ ] Works offline

**Files:** None (testing only)

**Dependencies:** Tasks 3.2.1-3.2.3

---

## 📋 PHASE 4: Modern UX Patterns (Days 10-13, 10 tasks)

### Objectives

- Add microinteractions for visual feedback
- Implement predictive insights and analytics
- Enhanced data visualizations

### Tasks

#### Task 4.1.1: Add button press animations

**Duration:** 1 hour
**Agent:** frontend-developer
**Vibe-Check:** ✅ MANDATORY before starting

**Description:**
Add tactile feedback to all interactive elements:

- Add `active:scale-95 transition-transform` to all buttons
- Add `hover:scale-105` to primary CTAs
- Test on mobile (touch feedback)

**Example:**

```tsx
<button className="rounded-lg bg-teal-500 px-4 py-2 text-white transition-all duration-150 hover:scale-105 hover:bg-teal-600 active:scale-95">
  Save Budget
</button>
```

**Success Criteria:**

- [ ] All buttons respond to press (visual scale feedback)
- [ ] Smooth animations (150ms duration)
- [ ] Works on mobile touch
- [ ] No layout shift

**Files:** All button components

**Dependencies:** None

---

#### Task 4.1.2: Create success checkmark animation

**Duration:** 2 hours
**Agent:** ui-ux-designer
**Vibe-Check:** ✅ MANDATORY before starting

**Description:**
Design animated SVG checkmark for success states:

- Scale + fade animation (0.3s duration)
- Green circular background (#10b981)
- Use after successful actions (save, import, delete)
- Auto-dismiss after 2 seconds

**Example:**

```tsx
<motion.div
  initial={{ scale: 0, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  transition={{ duration: 0.3 }}
  className="fixed right-4 top-4 rounded-lg bg-green-100 p-4"
>
  <CheckCircle className="h-6 w-6 text-green-600" />
  <span className="ml-2">Transaction saved!</span>
</motion.div>
```

**Success Criteria:**

- [ ] Animated checkmark component created
- [ ] Smooth scale + fade animation
- [ ] Auto-dismisses after 2 seconds
- [ ] Used for all success actions

**Files:**

- `src/components/budget/SuccessCheckmark.tsx` (new file)

**Dependencies:** None

---

#### Task 4.1.3: Implement loading skeletons

**Duration:** 3 hours
**Agent:** react-specialist
**Vibe-Check:** ✅ MANDATORY before starting

**Description:**
Create skeleton components with shimmer effect:

- Card skeleton (dashboard metric cards)
- Table row skeleton (transactions list)
- Chart skeleton (reports page)
- Shimmer animation: gray-200 → gray-300 gradient

**Example:**

```tsx
<div className="animate-pulse">
  <div className="mb-2 h-4 w-3/4 rounded bg-gray-200"></div>
  <div className="h-4 w-1/2 rounded bg-gray-200"></div>
</div>
```

**Success Criteria:**

- [ ] Skeleton components match final content shape
- [ ] Smooth shimmer animation
- [ ] Replace all spinner instances
- [ ] Loading states feel faster

**Files:**

- `src/components/budget/Skeleton.tsx` (new file)
- All pages with loading states

**Dependencies:** None

---

#### Task 4.1.4: Add animated progress counters

**Duration:** 2 hours
**Agent:** frontend-developer
**Vibe-Check:** ✅ MANDATORY before starting

**Description:**
Install and implement number count-up animations:

- Install `react-countup`
- Apply to metric cards (Net Worth, Income, Expenses)
- Apply to budget percentages
- Animate on mount and when values change

**Example:**

```tsx
import CountUp from "react-countup";

<CountUp start={0} end={netWorth} duration={1.5} prefix="$" decimals={2} separator="," />;
```

**Success Criteria:**

- [ ] Numbers count up smoothly on page load
- [ ] Count updates when data changes
- [ ] Currency formatting preserved
- [ ] Performance not impacted

**Files:**

- `package.json`
- `src/app/budget-app/page.tsx`
- Budget progress bars

**Dependencies:** None

---

#### Task 4.2.1: Calculate 3-month rolling averages

**Duration:** 3 hours
**Agent:** data-analyst
**Vibe-Check:** ✅ MANDATORY before starting
**Agent Routing Reference:** `.claude/agent-routing-config.json` (analytics.primaryAgents[1])

**Description:**
Create insight: "You usually spend $X on Y":

- Group transactions by category and month
- Calculate average spending per category (last 3 months)
- Create InsightCard component
- Display top 5 categories

**Example Output:**

```
💡 Insights:
- You usually spend $450/month on Groceries
- Your average monthly income is $3,200
- Restaurants cost you $180/month on average
```

**Success Criteria:**

- [ ] Averages calculated correctly
- [ ] Displays top 5 spending categories
- [ ] Only shows with ≥90 days of data
- [ ] InsightCard component created

**Files:**

- `src/lib/analytics/insights.ts` (new file)
- `src/components/budget/InsightCard.tsx` (new file)
- `src/app/budget-app/page.tsx` (integrate)

**Dependencies:** None

---

#### Task 4.2.2: Implement overspending alerts

**Duration:** 4 hours
**Agent:** data-analyst
**Vibe-Check:** ✅ MANDATORY before starting
**Agent Routing Reference:** `.claude/agent-routing-config.json` (analytics.primaryAgents[1])

**Description:**
Create projected overspending alerts:

- Calculate: `projectedSpending = (spent / daysElapsed) * daysInMonth`
- Compare to budget
- Show alert if `projected > budget`
- Display: "At this rate, you'll exceed budget by $X"

**Example:**

```tsx
{
  projectedSpending > budget && (
    <Alert variant="warning">
      ⚠️ At this rate, you'll exceed your {category} budget by $
      {(projectedSpending - budget).toFixed(2)} this month.
    </Alert>
  );
}
```

**Success Criteria:**

- [ ] Projection formula accurate
- [ ] Alerts show when overspending likely
- [ ] Updates daily (based on current date)
- [ ] Clear actionable message

**Files:**

- `src/lib/analytics/projections.ts` (new file)
- `src/app/budget-app/budgets/page.tsx` (integrate)

**Dependencies:** None

---

#### Task 4.2.3: Detect recurring transactions

**Duration:** 4 hours
**Agent:** data-scientist
**Vibe-Check:** ✅ MANDATORY before starting
**Agent Routing Reference:** `.claude/agent-routing-config.json` (analytics.primaryAgents[0])

**Description:**
Implement recurring transaction detection algorithm:

- Find transactions: same amount ±5%, same merchant, regular intervals (7/14/30 days)
- Flag as recurring
- Show insight: "Recurring: Netflix $15.99 monthly"

**Algorithm:**

```typescript
function detectRecurring(transactions: Transaction[]) {
  // Group by merchant
  // Check amount variance ≤5%
  // Check interval consistency (7/14/30 days ±2 days)
  // Return recurring patterns
}
```

**Success Criteria:**

- [ ] Detects monthly subscriptions (30 days ±2)
- [ ] Detects bi-weekly payments (14 days ±2)
- [ ] Detects weekly expenses (7 days ±2)
- [ ] ≥90% accuracy on common subscriptions

**Files:**

- `src/lib/analytics/recurring-detector.ts` (new file)
- `src/app/budget-app/page.tsx` (show insights)

**Dependencies:** None

---

#### Task 4.2.4: Add budget forecast trend lines

**Duration:** 3 hours
**Agent:** data-scientist
**Vibe-Check:** ✅ MANDATORY before starting
**Agent Routing Reference:** `.claude/agent-routing-config.json` (analytics.primaryAgents[0])

**Description:**
Add linear regression forecast to spending chart:

- Calculate linear regression on monthly spending
- Project next 30 days (dotted line)
- Add to area chart on dashboard
- Show confidence interval (optional)

**Implementation:**

```typescript
import { linearRegression } from "simple-statistics";

const forecast = linearRegression(historicalData);
const futurePoints = generateForecast(forecast, 30);
```

**Success Criteria:**

- [ ] Trend line shows on chart
- [ ] Dotted style for forecast (vs solid for actual)
- [ ] Reasonable projection (not wildly off)
- [ ] Updates when data changes

**Files:**

- `src/lib/analytics/forecasting.ts` (new file)
- `src/app/budget-app/page.tsx` (chart integration)

**Dependencies:** Install `simple-statistics` package

---

#### Task 4.3.1: Add heat map for spending by day

**Duration:** 6 hours
**Agent:** data-scientist
**Vibe-Check:** ✅ MANDATORY before starting
**Agent Routing Reference:** `.claude/agent-routing-config.json` (analytics.primaryAgents[0])

**Description:**
Create spending heat map (7 columns × 4-5 rows):

- X-axis: Days of week (Mon-Sun)
- Y-axis: Weeks in current month
- Color scale: white (no spending) → light teal → dark teal (high spending)
- Tooltip shows date and amount

**Example:**

```
     Mon  Tue  Wed  Thu  Fri  Sat  Sun
W1   $50  $20  $80  $30  $120 $200 $150
W2   $40  $25  $70  $35  $110 $180 $140
...
```

**Success Criteria:**

- [ ] 7×4-5 grid displays correctly
- [ ] Color scale represents spending intensity
- [ ] Tooltips show date + amount
- [ ] Reveals weekly patterns

**Files:**

- `src/components/budget/HeatMap.tsx` (new file)
- `src/app/budget-app/reports/page.tsx` (integrate)

**Dependencies:** Consider `react-calendar-heatmap` or custom implementation

---

#### Task 4.3.2: Implement sparklines in metric cards

**Duration:** 3 hours
**Agent:** frontend-developer
**Vibe-Check:** ✅ MANDATORY before starting
**Agent Routing Reference:** `.claude/agent-routing-config.json` (analytics.primaryAgents[2])

**Description:**
Add mini 7-day trend charts to metric cards:

- Install `react-sparklines`
- Show 7-day mini trend (40px height)
- Add to Net Worth, Income, Expenses cards
- Teal color matching accent

**Example:**

```tsx
import { Sparklines, SparklinesLine } from "react-sparklines";

<Sparklines data={last7Days} width={100} height={40}>
  <SparklinesLine color="#14b8a6" />
</Sparklines>;
```

**Success Criteria:**

- [ ] Sparklines show in metric cards
- [ ] 7-day data displayed
- [ ] Smooth line rendering
- [ ] Matches app color scheme (teal)

**Files:**

- `package.json`
- `src/app/budget-app/page.tsx` (MetricCard component)

**Dependencies:** None

---

#### Task 4.3.3: Enhanced tooltips with context

**Duration:** 2 hours
**Agent:** frontend-developer
**Vibe-Check:** ✅ MANDATORY before starting

**Description:**
Customize Recharts tooltips to show context:

- Value + % change vs last month
- Average comparison
- Trend indicator (↑ ↓ →)

**Example:**

```tsx
<Tooltip
  content={({ active, payload }) => {
    if (!active) return null;
    const value = payload[0].value;
    const prevMonth = getPrevMonthValue();
    const change = (((value - prevMonth) / prevMonth) * 100).toFixed(1);

    return (
      <div className="rounded border bg-white p-2 shadow">
        <p className="font-bold">${value}</p>
        <p className="text-sm text-gray-600">
          {change > 0 ? "↑" : "↓"} {Math.abs(change)}% vs last month
        </p>
      </div>
    );
  }}
/>
```

**Success Criteria:**

- [ ] Tooltips show value + context
- [ ] % change calculated correctly
- [ ] Trend indicators clear
- [ ] Applied to all charts

**Files:**

- All chart components (dashboard, reports)

**Dependencies:** None

---

## 📋 PHASE 5: Smart Features (Days 14-17, 8 tasks)

### Objectives

- Guided onboarding experience
- Keyboard shortcuts for power users
- Automatic subscription detection and tracking

### Tasks

#### Task 5.1.1: Install and configure Shepherd.js

**Duration:** 1 hour
**Agent:** frontend-developer
**Vibe-Check:** ✅ MANDATORY before starting

**Description:**
Setup onboarding tour framework:

- Install `shepherd.js`
- Create tour configuration
- Style to match app theme (teal accent)
- Add to budget app layout

**Example:**

```typescript
import Shepherd from "shepherd.js";
import "shepherd.js/dist/css/shepherd.css";

const tour = new Shepherd.Tour({
  useModalOverlay: true,
  defaultStepOptions: {
    cancelIcon: { enabled: true },
    classes: "shepherd-theme-custom",
  },
});
```

**Success Criteria:**

- [ ] shepherd.js installed
- [ ] Tour configuration created
- [ ] Styled with teal accent
- [ ] Ready for step definitions

**Files:**

- `package.json`
- `src/lib/tour.ts` (new file)

**Dependencies:** None

---

#### Task 5.1.2: Create 5-step onboarding tour

**Duration:** 4 hours
**Agent:** tutorial-engineer
**Vibe-Check:** ✅ MANDATORY before starting
**Agent Routing Reference:** `.claude/agent-routing-config.json` (documentation.primaryAgents[2])

**Description:**
Create comprehensive first-time user tour:

**Step 1: Welcome** → Import CSV
**Step 2: Auto-categorization** explained
**Step 3: Set first budget**
**Step 4: Dashboard overview**
**Step 5: Reports and planning**

Add "Don't show again" option, track completion in localStorage.

**Example Steps:**

```typescript
tour.addStep({
  id: "welcome",
  title: "👋 Welcome to Budget App!",
  text: "Let's get you started. First, import your bank transactions.",
  attachTo: { element: ".import-button", on: "bottom" },
  buttons: [{ text: "Next", action: tour.next }],
});
```

**Success Criteria:**

- [ ] 5-step tour completed
- [ ] Clear, helpful messaging
- [ ] Dismissible and trackable
- [ ] 80%+ users complete tour (metric)

**Files:**

- `src/lib/tour.ts` (expand with steps)
- `src/app/budget-app/layout.tsx` (trigger on first visit)

**Dependencies:** Task 5.1.1

---

#### Task 5.1.3: Implement keyboard shortcuts

**Duration:** 3 hours
**Agent:** frontend-developer
**Vibe-Check:** ✅ MANDATORY before starting

**Description:**
Add global keyboard shortcuts:

- **N** = New transaction modal
- **/** = Focus search bar
- **B** = Navigate to budgets
- **D** = Navigate to dashboard
- **?** = Show shortcuts help
- **Esc** = Close modals

Ignore shortcuts when typing in inputs.

**Implementation:**

```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Ignore if typing in input/textarea
    if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName)) {
      return;
    }

    switch (e.key) {
      case "n":
        openNewTransaction();
        break;
      case "/":
        focusSearch();
        break;
      case "b":
        router.push("/budget-app/budgets");
        break;
      // ...
    }
  };

  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, []);
```

**Success Criteria:**

- [ ] All 6 shortcuts work
- [ ] Shortcuts ignored when typing
- [ ] No conflicts with browser shortcuts
- [ ] Documented in help overlay

**Files:**

- `src/hooks/useKeyboardShortcuts.ts` (new file)
- `src/app/budget-app/layout.tsx` (global hook)

**Dependencies:** None

---

#### Task 5.1.4: Create shortcuts overlay (? key)

**Duration:** 1 hour
**Agent:** frontend-developer
**Vibe-Check:** ✅ MANDATORY before starting

**Description:**
Create keyboard shortcuts help modal:

- Opens with **?** key
- Lists all shortcuts with <kbd> styling
- Closes with **Esc**

**Example:**

```tsx
<Modal open={showShortcuts} onClose={() => setShowShortcuts(false)}>
  <h2 className="mb-4 text-lg font-bold">Keyboard Shortcuts</h2>
  <div className="space-y-2">
    <div className="flex justify-between">
      <span>New transaction</span>
      <kbd className="rounded bg-gray-100 px-2 py-1">N</kbd>
    </div>
    {/* ... more shortcuts ... */}
  </div>
</Modal>
```

**Success Criteria:**

- [ ] ? key opens modal
- [ ] All shortcuts listed
- [ ] <kbd> tags styled nicely
- [ ] Esc closes modal

**Files:**

- `src/components/budget/ShortcutsModal.tsx` (new file)
- `src/app/budget-app/layout.tsx` (integrate)

**Dependencies:** Task 5.1.3

---

#### Task 5.2.1: Create subscription detection algorithm

**Duration:** 4 hours
**Agent:** data-scientist
**Vibe-Check:** ✅ MANDATORY before starting
**Agent Routing Reference:** `.claude/agent-routing-config.json` (analytics.primaryAgents[0])

**Description:**
Detect recurring monthly charges (subscriptions):

- Same merchant, similar amount (±5%), regular intervals (~30 days)
- Identify common subscriptions (Netflix, Spotify, etc.)
- Create subscriptions data structure

**Algorithm:**

```typescript
function detectSubscriptions(transactions: Transaction[]) {
  const grouped = groupByMerchant(transactions);
  const subscriptions = [];

  for (const [merchant, txs] of grouped) {
    if (txs.length >= 3) {
      const avgAmount = average(txs.map((t) => t.amount));
      const avgInterval = averageInterval(txs.map((t) => t.date));

      if (avgInterval >= 28 && avgInterval <= 32) {
        subscriptions.push({
          merchant,
          amount: avgAmount,
          frequency: "monthly",
          nextCharge: predictNextCharge(txs),
        });
      }
    }
  }

  return subscriptions;
}
```

**Success Criteria:**

- [ ] Detects monthly subscriptions (28-32 day intervals)
- [ ] Handles amount variance (±5%)
- [ ] Predicts next charge date
- [ ] ≥90% accuracy on common subscriptions

**Files:**

- `src/lib/analytics/subscription-detector.ts` (new file)

**Dependencies:** Task 4.2.3 (recurring detection) - can share some logic

---

#### Task 5.2.2: Build subscriptions dashboard card

**Duration:** 3 hours
**Agent:** frontend-developer
**Vibe-Check:** ✅ MANDATORY before starting

**Description:**
Create subscriptions overview card:

- List all detected subscriptions
- Show monthly cost per subscription
- Show next charge date
- Total monthly subscription cost

**Example:**

```tsx
<Card>
  <h3 className="mb-4 text-lg font-bold">📱 Subscriptions</h3>
  <div className="space-y-2">
    {subscriptions.map((sub) => (
      <div key={sub.merchant} className="flex justify-between">
        <div>
          <p className="font-medium">{sub.merchant}</p>
          <p className="text-sm text-gray-500">Next charge: {formatDate(sub.nextCharge)}</p>
        </div>
        <p className="font-bold">${sub.amount}/mo</p>
      </div>
    ))}
  </div>
  <div className="mt-4 border-t pt-4">
    <p className="text-sm text-gray-600">Total monthly subscriptions:</p>
    <p className="text-2xl font-bold text-teal-600">${totalMonthly}</p>
  </div>
</Card>
```

**Success Criteria:**

- [ ] Subscriptions card displays on dashboard
- [ ] Lists all detected subscriptions
- [ ] Shows next charge dates
- [ ] Total monthly cost calculated

**Files:**

- `src/components/budget/SubscriptionsCard.tsx` (new file)
- `src/app/budget-app/page.tsx` (integrate)

**Dependencies:** Task 5.2.1

---

#### Task 5.2.3: Implement price change alerts

**Duration:** 2 hours
**Agent:** data-analyst
**Vibe-Check:** ✅ MANDATORY before starting
**Agent Routing Reference:** `.claude/agent-routing-config.json` (analytics.primaryAgents[1])

**Description:**
Detect subscription price increases:

- Compare current charge to historical average
- Alert if increase >5%
- Show in subscriptions card

**Example:**

```tsx
{
  priceIncrease > 0.05 && (
    <Alert variant="warning" className="text-sm">
      ⚠️ {sub.merchant} increased by ${(currentPrice - avgPrice).toFixed(2)}
    </Alert>
  );
}
```

**Success Criteria:**

- [ ] Detects price increases >5%
- [ ] Shows alert in subscriptions card
- [ ] Clear indication of old vs new price
- [ ] Only shows for confirmed subscriptions

**Files:**

- `src/lib/analytics/subscription-detector.ts` (expand)
- `src/components/budget/SubscriptionsCard.tsx` (add alerts)

**Dependencies:** Task 5.2.1

---

#### Task 5.2.4: Add "Cancel subscription" tracking

**Duration:** 2 hours
**Agent:** frontend-developer
**Vibe-Check:** ✅ MANDATORY before starting

**Description:**
Track cancelled subscriptions:

- Button to mark subscription as "cancelled"
- Hide from active list
- Track cancelled date
- Move to "Cancelled Subscriptions" section

**Example:**

```tsx
<button onClick={() => markCancelled(sub.id)} className="text-sm text-gray-500 hover:text-red-600">
  Mark as cancelled
</button>;

{
  /* Separate section */
}
<details className="mt-4">
  <summary className="cursor-pointer text-sm text-gray-600">
    Cancelled Subscriptions ({cancelledCount})
  </summary>
  <div className="mt-2 space-y-2">
    {cancelledSubs.map((sub) => (
      <div className="text-sm text-gray-500 line-through">
        {sub.merchant} - Cancelled {formatDate(sub.cancelledDate)}
      </div>
    ))}
  </div>
</details>;
```

**Success Criteria:**

- [ ] Can mark subscriptions as cancelled
- [ ] Cancelled subs hidden from active list
- [ ] Cancelled date tracked
- [ ] Separate "Cancelled" section (collapsible)

**Files:**

- `src/lib/budget-db.ts` (add cancelledDate field)
- `src/components/budget/SubscriptionsCard.tsx` (UI)

**Dependencies:** Task 5.2.2

---

## 📋 PHASE 6: Split Transactions (Days 18-20, 6 tasks)

### Objectives

- Enable splitting transactions across multiple categories
- Update database schema for split relationships
- Maintain data integrity

### Tasks

#### Task 6.1.1: Design split transaction UI

**Duration:** 2 hours
**Agent:** ui-ux-designer
**Vibe-Check:** ✅ MANDATORY before starting

**Description:**
Design mockup for split transaction modal:

- "Split" button on transaction row
- Modal with add/remove split rows
- Each split: category, amount, notes
- Show total vs original amount (must match)
- Visual indication when totals don't match

**Mockup Requirements:**

- Clean, intuitive layout
- Add/remove split buttons
- Live total validation
- Clear error states

**Success Criteria:**

- [ ] Mockup designed and approved
- [ ] User flow documented
- [ ] Error states defined
- [ ] Shared with developers

**Files:**

- Design mockup (Figma/wireframe)

**Dependencies:** None

---

#### Task 6.1.2: Implement split transaction modal

**Duration:** 4 hours
**Agent:** react-specialist
**Vibe-Check:** ✅ MANDATORY before starting

**Description:**
Build split transaction modal from mockup:

- Modal component with dynamic split rows
- Add/remove split functionality
- Category dropdown per split
- Amount input with validation
- Live total calculation
- Validate: sum of splits = original amount

**Example:**

```tsx
const [splits, setSplits] = useState([{ category: "", amount: 0, notes: "" }]);

const total = splits.reduce((sum, split) => sum + split.amount, 0);
const isValid = Math.abs(total - transaction.amount) < 0.01;

<Modal>
  <h2>Split Transaction</h2>
  <p>Original: ${transaction.amount}</p>

  {splits.map((split, idx) => (
    <div key={idx}>
      <CategorySelect value={split.category} />
      <input type="number" value={split.amount} />
      <button onClick={() => removeSplit(idx)}>Remove</button>
    </div>
  ))}

  <button onClick={addSplit}>+ Add Split</button>

  <div className={isValid ? "text-green-600" : "text-red-600"}>
    Total: ${total.toFixed(2)} {isValid ? "✓" : "≠ Original"}
  </div>

  <button disabled={!isValid} onClick={handleSave}>
    Save
  </button>
</Modal>;
```

**Success Criteria:**

- [ ] Modal matches design mockup
- [ ] Can add/remove splits dynamically
- [ ] Validates total = original amount
- [ ] Clear visual feedback

**Files:**

- `src/components/budget/SplitTransactionModal.tsx` (new file)

**Dependencies:** Task 6.1.1

---

#### Task 6.1.3: Update database schema for splits

**Duration:** 2 hours
**Agent:** backend-developer
**Vibe-Check:** ✅ MANDATORY before starting

**Description:**
Add split relationship fields to Transaction type:

- `splitFromId: string | null` - ID of original transaction
- `isSplit: boolean` - Marks original as split
- Update IndexedDB schema version
- Migration logic for existing data

**Schema:**

```typescript
export interface Transaction {
  id: string;
  // ... existing fields
  splitFromId?: string | null; // NEW: ID of parent transaction
  isSplit?: boolean; // NEW: True if this tx was split
}

// Schema version bump
export class BudgetDatabase extends Dexie {
  constructor() {
    super("BudgetAppDB");
    this.version(2).stores({
      // Increment version
      transactions: "++id, accountId, date, category, splitFromId, [accountId+date]",
    });
  }
}
```

**Success Criteria:**

- [ ] Schema updated with new fields
- [ ] Version incremented
- [ ] Migration handles existing data
- [ ] No data loss

**Files:**

- `src/lib/budget-db.ts`
- `src/types/budget.ts`

**Dependencies:** None

---

#### Task 6.1.4: Implement split save logic

**Duration:** 3 hours
**Agent:** frontend-developer
**Vibe-Check:** ✅ MANDATORY before starting

**Description:**
Save split transactions to database:

- Mark original transaction as `isSplit: true`
- Create new transactions for each split with `splitFromId`
- Hide original, show splits in transaction list
- Maintain referential integrity

**Logic:**

```typescript
async function saveSplitTransaction(original: Transaction, splits: Split[]) {
  // 1. Mark original as split (don't delete)
  await db.transactions.update(original.id, { isSplit: true });

  // 2. Create new transactions for each split
  for (const split of splits) {
    await db.transactions.add({
      ...original,
      id: generateId(),
      splitFromId: original.id,
      category: split.category,
      amount: split.amount,
      notes: split.notes,
    });
  }
}

// 3. Filter out split originals from display
const visibleTransactions = allTransactions.filter((tx) => !tx.isSplit);
```

**Success Criteria:**

- [ ] Original marked as isSplit
- [ ] Split transactions created with splitFromId
- [ ] Original hidden from list
- [ ] Splits display correctly

**Files:**

- `src/lib/transactions.ts` (new helper functions)
- `src/app/budget-app/transactions/page.tsx` (filter logic)

**Dependencies:** Tasks 6.1.2, 6.1.3

---

#### Task 6.1.5: Add "unsplit" functionality

**Duration:** 2 hours
**Agent:** frontend-developer
**Vibe-Check:** ✅ MANDATORY before starting

**Description:**
Implement undo split:

- Button to restore original transaction
- Delete all split transactions
- Mark original `isSplit: false`
- Show confirmation dialog

**Example:**

```typescript
async function unsplitTransaction(originalId: string) {
  if (!confirm("Undo split? This will delete split transactions.")) {
    return;
  }

  // 1. Find all splits
  const splits = await db.transactions.where("splitFromId").equals(originalId).toArray();

  // 2. Delete splits
  await db.transactions.bulkDelete(splits.map((s) => s.id));

  // 3. Restore original
  await db.transactions.update(originalId, { isSplit: false });

  toast.success("Transaction unsplit successfully");
}
```

**Success Criteria:**

- [ ] Can undo splits
- [ ] Split transactions deleted
- [ ] Original restored
- [ ] Confirmation dialog shown

**Files:**

- `src/lib/transactions.ts` (add unsplit function)
- `src/app/budget-app/transactions/page.tsx` (UI button)

**Dependencies:** Task 6.1.4

---

#### Task 6.1.6: Test split transactions end-to-end

**Duration:** 1 hour
**Agent:** qa-expert
**Vibe-Check:** ✅ MANDATORY before starting

**Description:**
Comprehensive testing of split transaction feature:

- Split transaction 2-way (50/50)
- Split transaction 3-way (different categories)
- Verify totals in reports
- Verify category budgets updated
- Test unsplit functionality
- Edge cases (split amount = 0, negative amounts)

**Test Checklist:**

- [ ] 2-way split works correctly
- [ ] 3-way split works correctly
- [ ] Totals correct in dashboard
- [ ] Categories correct in reports
- [ ] Budgets reflect split amounts
- [ ] Unsplit restores correctly
- [ ] Edge cases handled

**Success Criteria:**

- [ ] All test scenarios pass
- [ ] No data integrity issues
- [ ] Reports accurate
- [ ] Issues documented

**Files:** None (testing only)

**Dependencies:** Task 6.1.5

---

## 📋 PHASE 7: Receipt Attachments (Days 21-22, 5 tasks)

### Objectives

- Enable photo receipt uploads
- Store receipts in IndexedDB
- Display receipts in transaction details

### Tasks

#### Task 7.1.1: Install react-dropzone

**Duration:** 30 minutes
**Agent:** frontend-developer
**Vibe-Check:** ✅ MANDATORY before starting

**Description:**
Setup file upload library:

- Install `react-dropzone`
- Configure for image uploads (PNG, JPEG, PDF)
- 5MB file size limit
- Multiple file support

**Example:**

```typescript
import { useDropzone } from "react-dropzone";

const { getRootProps, getInputProps } = useDropzone({
  accept: {
    "image/*": [".png", ".jpg", ".jpeg"],
    "application/pdf": [".pdf"],
  },
  maxSize: 5242880, // 5MB
  multiple: false,
});
```

**Success Criteria:**

- [ ] react-dropzone installed
- [ ] Configured for images/PDFs
- [ ] 5MB limit enforced
- [ ] Ready to use

**Files:**

- `package.json`

**Dependencies:** None

---

#### Task 7.1.2: Add receipts to database schema

**Duration:** 1.5 hours
**Agent:** backend-developer
**Vibe-Check:** ✅ MANDATORY before starting

**Description:**
Create receipts object store:

- New IndexedDB table: `receipts`
- Fields: id, transactionId, fileName, blob, uploadedAt
- Update schema version
- Index by transactionId for fast lookups

**Schema:**

```typescript
export interface Receipt {
  id: string;
  transactionId: string;
  fileName: string;
  blob: Blob;
  mimeType: string;
  size: number;
  uploadedAt: Date;
}

export class BudgetDatabase extends Dexie {
  receipts!: Table<Receipt>;

  constructor() {
    super("BudgetAppDB");
    this.version(3).stores({
      // Increment version
      // ... existing tables
      receipts: "++id, transactionId, uploadedAt",
    });
  }
}
```

**Success Criteria:**

- [ ] receipts table exists
- [ ] Schema version incremented
- [ ] Indexed by transactionId
- [ ] Migration successful

**Files:**

- `src/lib/budget-db.ts`
- `src/types/budget.ts`

**Dependencies:** None

---

#### Task 7.1.3: Implement receipt upload UI

**Duration:** 3 hours
**Agent:** frontend-developer
**Vibe-Check:** ✅ MANDATORY before starting

**Description:**
Build receipt upload interface:

- Drag & drop zone in transaction modal
- File input fallback
- Show preview thumbnail after upload
- Upload to IndexedDB on save

**Example:**

```tsx
const [receiptFile, setReceiptFile] = useState<File | null>(null);
const [previewUrl, setPreviewUrl] = useState<string>("");

const onDrop = (acceptedFiles: File[]) => {
  const file = acceptedFiles[0];
  setReceiptFile(file);
  setPreviewUrl(URL.createObjectURL(file));
};

<div {...getRootProps()} className="border-2 border-dashed p-4">
  <input {...getInputProps()} />
  {previewUrl ? (
    <img src={previewUrl} alt="Receipt preview" className="h-32 w-32" />
  ) : (
    <p>Drag & drop receipt, or click to select</p>
  )}
</div>;

// On save:
if (receiptFile) {
  await db.receipts.add({
    id: generateId(),
    transactionId: transaction.id,
    fileName: receiptFile.name,
    blob: receiptFile,
    mimeType: receiptFile.type,
    size: receiptFile.size,
    uploadedAt: new Date(),
  });
}
```

**Success Criteria:**

- [ ] Drag & drop works
- [ ] File input fallback works
- [ ] Preview shows after select
- [ ] Uploads to IndexedDB on save

**Files:**

- `src/components/budget/TransactionModal.tsx`

**Dependencies:** Tasks 7.1.1, 7.1.2

---

#### Task 7.1.4: Add camera capture for mobile

**Duration:** 2 hours
**Agent:** frontend-developer
**Vibe-Check:** ✅ MANDATORY before starting

**Description:**
Enable mobile camera capture:

- Use `<input type="file" accept="image/*" capture="environment">`
- Opens camera on mobile devices
- Upload captured photo
- Show alongside drag & drop

**Example:**

```tsx
<div className="flex gap-2">
  {/* Desktop: Drag & drop */}
  <div {...getRootProps()} className="flex-1">
    <input {...getInputProps()} />
    <p>Drag & drop receipt</p>
  </div>

  {/* Mobile: Camera */}
  <label className="md:hidden">
    <input
      type="file"
      accept="image/*"
      capture="environment"
      className="hidden"
      onChange={handleCameraCapture}
    />
    <button type="button" className="btn">
      📷 Camera
    </button>
  </label>
</div>
```

**Success Criteria:**

- [ ] Camera opens on mobile
- [ ] Captured photo uploads
- [ ] Works alongside drag & drop
- [ ] Mobile-only (hidden on desktop)

**Files:**

- `src/components/budget/TransactionModal.tsx`

**Dependencies:** Task 7.1.3

---

#### Task 7.1.5: Display receipts in transaction details

**Duration:** 2 hours
**Agent:** frontend-developer
**Vibe-Check:** ✅ MANDATORY before starting

**Description:**
Show receipts in transaction view:

- Load receipt blob from IndexedDB
- Create object URL for display
- Show thumbnail, click to view full size
- Clean up object URLs (memory leak prevention)

**Example:**

```tsx
const [receipt, setReceipt] = useState<Receipt | null>(null);
const [imageUrl, setImageUrl] = useState<string>("");

useEffect(() => {
  const loadReceipt = async () => {
    const r = await db.receipts.where("transactionId").equals(transaction.id).first();

    if (r) {
      setReceipt(r);
      const url = URL.createObjectURL(r.blob);
      setImageUrl(url);
    }
  };

  loadReceipt();

  // Cleanup
  return () => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
  };
}, [transaction.id]);

{
  imageUrl && (
    <div>
      <h4 className="mb-2 text-sm font-medium">Receipt</h4>
      <a href={imageUrl} target="_blank" rel="noopener">
        <img src={imageUrl} alt="Receipt" className="h-32 w-32 object-cover" />
      </a>
    </div>
  );
}
```

**Success Criteria:**

- [ ] Receipts load and display
- [ ] Thumbnail clickable (opens full size)
- [ ] Object URLs cleaned up
- [ ] No memory leaks

**Files:**

- `src/app/budget-app/transactions/page.tsx` (transaction details view)

**Dependencies:** Task 7.1.3

---

## 📋 PHASE 8: Investment Tracking (Days 23-25, 6 tasks)

### Objectives

- Track investment holdings (RRSP, TFSA, Company Shares, Non-registered)
- Integrate free market data API
- Calculate portfolio performance

### Tasks

#### Task 8.1.1: Design investment tracking schema

**Duration:** 2 hours
**Agent:** backend-developer
**Vibe-Check:** ✅ MANDATORY before starting

**Description:**
Define database schema for investment accounts and holdings:

**InvestmentAccount:**

- id, name, type (RRSP, TFSA, Non-registered, Company shares)
- institution, accountNumber

**Holding:**

- id, accountId, symbol, quantity, purchasePrice, purchaseDate, notes

**Example:**

```typescript
export interface InvestmentAccount {
  id: string;
  name: string;
  type: "RRSP" | "TFSA" | "Non-registered" | "Company shares";
  institution?: string;
  accountNumber?: string;
  createdAt: Date;
}

export interface Holding {
  id: string;
  accountId: string;
  symbol: string; // Stock symbol (e.g., "AAPL", "MSFT")
  quantity: number;
  purchasePrice: number;
  purchaseDate: Date;
  notes?: string;
}
```

**Success Criteria:**

- [ ] Schema documented
- [ ] All required fields defined
- [ ] Relationships clear
- [ ] Approved for implementation

**Files:**

- `src/types/budget.ts` (add interfaces)

**Dependencies:** None

---

#### Task 8.1.2: Add holdings table to database

**Duration:** 1 hour
**Agent:** backend-developer
**Vibe-Check:** ✅ MANDATORY before starting

**Description:**
Create IndexedDB tables for investments:

- `investmentAccounts` object store
- `holdings` object store
- Update schema version
- Add indexes for queries

**Schema:**

```typescript
export class BudgetDatabase extends Dexie {
  investmentAccounts!: Table<InvestmentAccount>;
  holdings!: Table<Holding>;

  constructor() {
    super("BudgetAppDB");
    this.version(4).stores({
      // Increment version
      // ... existing tables
      investmentAccounts: "++id, type, createdAt",
      holdings: "++id, accountId, symbol, purchaseDate, [accountId+symbol]",
    });
  }
}
```

**Success Criteria:**

- [ ] investmentAccounts table exists
- [ ] holdings table exists
- [ ] Schema version incremented (v4)
- [ ] Indexes created

**Files:**

- `src/lib/budget-db.ts`

**Dependencies:** Task 8.1.1

---

#### Task 8.1.3: Create investment accounts page

**Duration:** 3 hours
**Agent:** frontend-developer
**Vibe-Check:** ✅ MANDATORY before starting

**Description:**
Build investment accounts management page:

- List all investment accounts
- Add/edit/delete accounts
- Account types: RRSP, TFSA, Non-registered, Company shares
- Show total value per account

**Example:**

```tsx
<div>
  <h1>Investment Accounts</h1>
  <button onClick={openAddModal}>+ Add Account</button>

  <div className="space-y-4">
    {accounts.map((account) => (
      <Card key={account.id}>
        <h3>{account.name}</h3>
        <p className="text-sm text-gray-600">{account.type}</p>
        <p className="text-2xl font-bold text-teal-600">${calculateAccountValue(account.id)}</p>
        <div className="flex gap-2">
          <button onClick={() => editAccount(account)}>Edit</button>
          <button onClick={() => deleteAccount(account.id)}>Delete</button>
        </div>
      </Card>
    ))}
  </div>
</div>
```

**Success Criteria:**

- [ ] Can list accounts
- [ ] Can add new accounts
- [ ] Can edit accounts
- [ ] Can delete accounts
- [ ] Account types selectable

**Files:**

- `src/app/budget-app/investments/page.tsx` (new file)
- `src/components/budget/InvestmentAccountModal.tsx` (new file)

**Dependencies:** Task 8.1.2

---

#### Task 8.1.4: Build holdings management UI

**Duration:** 4 hours
**Agent:** frontend-developer
**Vibe-Check:** ✅ MANDATORY before starting

**Description:**
Create holdings management interface:

- Add/edit holdings (symbol, quantity, purchase price/date)
- List holdings per account
- Show total value (quantity × current price)
- Color-code gains/losses (green/red)

**Example:**

```tsx
<div>
  <h2>Holdings - {account.name}</h2>
  <button onClick={openAddHoldingModal}>+ Add Holding</button>

  <table>
    <thead>
      <tr>
        <th>Symbol</th>
        <th>Quantity</th>
        <th>Purchase Price</th>
        <th>Current Price</th>
        <th>Value</th>
        <th>Gain/Loss</th>
      </tr>
    </thead>
    <tbody>
      {holdings.map((holding) => {
        const currentPrice = prices[holding.symbol] || 0;
        const value = holding.quantity * currentPrice;
        const cost = holding.quantity * holding.purchasePrice;
        const gainLoss = value - cost;

        return (
          <tr key={holding.id}>
            <td>{holding.symbol}</td>
            <td>{holding.quantity}</td>
            <td>${holding.purchasePrice}</td>
            <td>${currentPrice}</td>
            <td>${value.toFixed(2)}</td>
            <td className={gainLoss >= 0 ? "text-green-600" : "text-red-600"}>
              {gainLoss >= 0 ? "+" : ""}
              {gainLoss.toFixed(2)}({((gainLoss / cost) * 100).toFixed(1)}%)
            </td>
          </tr>
        );
      })}
    </tbody>
  </table>
</div>
```

**Success Criteria:**

- [ ] Can add holdings
- [ ] Can edit holdings
- [ ] List shows all holding details
- [ ] Gains/losses calculated correctly
- [ ] Color-coded performance

**Files:**

- `src/app/budget-app/investments/[accountId]/page.tsx` (new file)
- `src/components/budget/HoldingModal.tsx` (new file)

**Dependencies:** Task 8.1.2

---

#### Task 8.1.5: Integrate free market data API

**Duration:** 4 hours
**Agent:** backend-developer
**Vibe-Check:** ✅ MANDATORY before starting

**Description:**
Integrate free stock price API:

- Use Alpha Vantage or Yahoo Finance free tier
- Fetch daily prices for holdings
- Cache prices in IndexedDB (1 hour TTL)
- Handle API rate limits

**Implementation:**

```typescript
// src/lib/market-data.ts

const ALPHA_VANTAGE_KEY = "YOUR_FREE_KEY";
const CACHE_TTL = 3600000; // 1 hour

interface PriceCache {
  symbol: string;
  price: number;
  fetchedAt: Date;
}

export async function getStockPrice(symbol: string): Promise<number> {
  // Check cache first
  const cached = await db.priceCache.where("symbol").equals(symbol).first();

  if (cached && Date.now() - cached.fetchedAt.getTime() < CACHE_TTL) {
    return cached.price;
  }

  // Fetch from API
  const response = await fetch(
    `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_KEY}`
  );
  const data = await response.json();
  const price = parseFloat(data["Global Quote"]["05. price"]);

  // Cache result
  await db.priceCache.put({
    symbol,
    price,
    fetchedAt: new Date(),
  });

  return price;
}
```

**Success Criteria:**

- [ ] API integration working
- [ ] Prices fetched for holdings
- [ ] Prices cached (1 hour TTL)
- [ ] Rate limits handled gracefully
- [ ] Fallback for API errors

**Files:**

- `src/lib/market-data.ts` (new file)
- `src/lib/budget-db.ts` (add priceCache table)

**Dependencies:** None (but should integrate with Task 8.1.4 for display)

---

#### Task 8.1.6: Create portfolio performance chart

**Duration:** 3 hours
**Agent:** data-scientist
**Vibe-Check:** ✅ MANDATORY before starting
**Agent Routing Reference:** `.claude/agent-routing-config.json` (analytics.primaryAgents[0])

**Description:**
Calculate and visualize portfolio performance:

- Calculate portfolio value over time
- Area chart showing growth
- Show total gain/loss ($ and %)
- Show total return %

**Calculations:**

```typescript
function calculatePortfolioValue(holdings: Holding[], prices: Record<string, number>) {
  return holdings.reduce((total, holding) => {
    const currentPrice = prices[holding.symbol] || holding.purchasePrice;
    return total + holding.quantity * currentPrice;
  }, 0);
}

function calculateTotalReturn(holdings: Holding[], prices: Record<string, number>) {
  const currentValue = calculatePortfolioValue(holdings, prices);
  const totalCost = holdings.reduce((total, h) => total + h.quantity * h.purchasePrice, 0);
  return ((currentValue - totalCost) / totalCost) * 100;
}
```

**Chart Example:**

```tsx
<ResponsiveContainer width="100%" height={300}>
  <AreaChart data={historicalValues}>
    <XAxis dataKey="date" />
    <YAxis />
    <Tooltip />
    <Area type="monotone" dataKey="value" fill="#14b8a6" stroke="#14b8a6" />
  </AreaChart>
</ResponsiveContainer>

<div className="mt-4">
  <p className="text-sm text-gray-600">Total Return</p>
  <p className={`text-2xl font-bold ${totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
    {totalReturn >= 0 ? '+' : ''}{totalReturn.toFixed(2)}%
  </p>
</div>
```

**Success Criteria:**

- [ ] Portfolio value calculated correctly
- [ ] Chart displays historical performance
- [ ] Total gain/loss shown ($ and %)
- [ ] Color-coded (green for gains, red for losses)

**Files:**

- `src/lib/analytics/portfolio.ts` (new file)
- `src/app/budget-app/investments/page.tsx` (add chart)

**Dependencies:** Tasks 8.1.4, 8.1.5

---

## ✅ Success Validation

### Automated Testing

- **Lighthouse CI:** Accessibility ≥95%, Performance ≥90%, PWA 100%
- **Pa11y:** 0 WCAG 2.0 AA violations
- **Jest:** ≥80% code coverage for new components
- **Playwright:** E2E tests for all critical flows

### Manual Testing

- **Screen reader:** NVDA (Windows) + VoiceOver (Mac/iOS)
- **Keyboard-only:** Complete all workflows without mouse
- **Mobile devices:** iPhone SE, iPad Air, Pixel 7, Galaxy S23
- **Color blindness:** Protanopia, Deuteranopia, Tritanopia, Achromatopsia
- **Zoom:** 200%, 300% browser zoom

---

## 🚨 Risk Mitigation

| Risk                         | Mitigation                              |
| ---------------------------- | --------------------------------------- |
| Breaking existing features   | Add tests before refactoring            |
| Accessibility regression     | Automated Pa11y CI checks               |
| Mobile performance issues    | Lighthouse performance budgets          |
| Timeline overrun             | Ship Phase 1-2 first (critical path)    |
| Agent coordination conflicts | Clear task dependencies, frequent syncs |

---

## 📚 Reference Documents

- **Design Standards:** `.claude/Skills/design-guide.md`
- **Agent Routing:** `.claude/agent-routing-config.json`
- **Task Assignments:** `BUDGET_APP_AGENT_ASSIGNMENTS.md`

---

**END OF PRD**

**REMEMBER:** Read this document before EVERY task. Run vibe-check. Follow design standards. Test after every change. Update Archon status.---

## Appendix B: Color Palette Reference

### Approved Colors

```css
/* PRIMARY ACCENT (use sparingly for CTAs only) */
--accent: #14b8a6; /* Teal - buttons, links, highlights */
--accent-hover: #0f766e; /* Darker teal for hover */
--accent-light: #99f6e4; /* Light teal for backgrounds */

/* GRAY SCALE (use for everything else) */
--gray-50: #fafafa; /* Page background */
--gray-100: #f5f5f5; /* Card background, hover states */
--gray-200: #e5e5e5; /* Borders, dividers */
--gray-300: #d4d4d4; /* Disabled states */
--gray-400: #a3a3a3; /* Placeholder text */
--gray-500: #737373; /* Secondary text */
--gray-600: #525252; /* Secondary headings */
--gray-700: #404040; /* Body text */
--gray-800: #262626; /* Strong emphasis */
--gray-900: #171717; /* Headings, primary text */

/* SEMANTIC COLORS (only for their specific meaning) */
--success: #10b981; /* Green - income, positive, success */
--success-light: #d1fae5; /* Light green background */
--error: #ef4444; /* Red - expenses (when negative), errors */
--error-light: #fee2e2; /* Light red background */
--warning: #f59e0b; /* Yellow - alerts, caution */
--warning-light: #fef3c7; /* Light yellow background */
```

### Color Usage Rules

**DO:**

- ✅ Use teal (#14b8a6) for primary CTAs (Import, Add, Save)
- ✅ Use gray scale for all other UI elements
- ✅ Use green (#10b981) ONLY for income, positive numbers, success states
- ✅ Use red (#ef4444) ONLY for expenses, negative numbers, errors
- ✅ Use yellow (#f59e0b) ONLY for warnings, alerts, caution

**DON'T:**

- ❌ Use purple, orange, blue, cyan, or any other colors
- ❌ Use gradients (except in legacy components that will be removed)
- ❌ Use multiple accent colors
- ❌ Use color as the sole indicator of status (add icons + text)

### Example Implementations

```tsx
// PRIMARY CTA (teal accent)
<button className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg">
  Import CSV
</button>

// SECONDARY BUTTON (gray)
<button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg">
  Cancel
</button>

// INCOME (green, semantic)
<span className="text-green-600 font-semibold">
  +${income.toFixed(2)}
</span>

// EXPENSE (gray or red if negative context)
<span className="text-gray-900 font-semibold">
  ${expense.toFixed(2)}
</span>

// OVER BUDGET ALERT (red + icon, semantic)
<div className="bg-red-50 border-l-4 border-red-500 p-4">
  <div className="flex items-center gap-2">
    <AlertCircle className="w-5 h-5 text-red-600" />
    <span className="text-red-800 font-semibold">Over budget by $120</span>
  </div>
</div>

// SUCCESS STATE (green + checkmark)
<div className="bg-green-50 border border-green-200 rounded-lg p-3">
  <div className="flex items-center gap-2">
    <CheckCircle className="w-5 h-5 text-green-600" />
    <span className="text-green-800">Transaction saved successfully</span>
  </div>
</div>
```

---

## Appendix C: Agent Contact Matrix

| Agent Role                 | Expertise                                    | When to Assign                         | Coordination Style           |
| -------------------------- | -------------------------------------------- | -------------------------------------- | ---------------------------- |
| **frontend-developer**     | React, TypeScript, UI implementation         | Most UI tasks                          | Mesh, Hierarchical, Swarm    |
| **react-specialist**       | React patterns, hooks, context, optimization | Complex React logic                    | Mesh, Adaptive, Swarm        |
| **typescript-pro**         | Type safety, interfaces, generics            | Type definitions, refactoring          | Swarm                        |
| **ui-ux-designer**         | Visual design, user flows, accessibility     | Design system, mockups, UX research    | Single-Lead, Mesh            |
| **accessibility-tester**   | WCAG, ARIA, screen readers, keyboard nav     | Accessibility audits, manual testing   | Hierarchical (lead)          |
| **data-scientist**         | ML, statistics, data analysis, TensorFlow    | Predictive insights, ML categorization | Adaptive                     |
| **data-analyst**           | SQL, data queries, metrics, dashboards       | Data-driven features, analytics        | Adaptive                     |
| **performance-engineer**   | Optimization, bundle size, rendering         | PWA, performance tuning                | Single-Lead                  |
| **qa-expert**              | Test strategies, quality assurance           | Test planning, validation              | Hierarchical (support)       |
| **test-automator**         | Jest, Playwright, CI/CD                      | Automated test implementation          | Mesh                         |
| **tutorial-engineer**      | Onboarding, documentation, user guides       | Guided tours, help content             | Mesh                         |
| **technical-writer**       | Documentation, API docs, README              | User-facing documentation              | Mesh                         |
| **refactoring-specialist** | Code quality, DRY, cleanup                   | Large refactors, code review           | Mesh, Hierarchical (support) |
| **code-reviewer**          | Code standards, best practices               | PR reviews, quality checks             | Single-Lead (final check)    |

---

## Appendix D: Glossary

**Terms:**

- **WCAG 2.2 AA**: Web Content Accessibility Guidelines, Level AA compliance
- **EAA**: European Accessibility Act (June 28, 2025 deadline)
- **ARIA**: Accessible Rich Internet Applications (screen reader support)
- **PWA**: Progressive Web App (installable, offline-capable)
- **Microinteractions**: Small animations that provide feedback (button press, success checkmark)
- **Sparkline**: Mini chart showing trend in small space (e.g., 7-day trend in metric card)
- **Heat map**: Grid showing intensity data (e.g., spending by day-of-week)
- **Bottom sheet**: Mobile modal pattern that slides up from bottom
- **Touch target**: Minimum size for tappable elements (44px for accessibility)
- **Mesh coordinator**: Parallel agent execution with minimal dependencies
- **Hierarchical coordinator**: One lead agent directs others
- **Adaptive coordinator**: Data-driven approach, best solution wins
- **Coordinated swarm**: Multiple agents with frequent sync points

**Acronyms:**

- **TCO**: Total Cost of Ownership (primary app in this project)
- **CSV**: Comma-Separated Values (bank statement format)
- **BMO**: Bank of Montreal
- **ML**: Machine Learning
- **OCR**: Optical Character Recognition (extract text from images)
- **PRD**: Product Requirements Document (this document)
- **CI/CD**: Continuous Integration / Continuous Deployment

---

## Document Version History

| Version | Date       | Author              | Changes                               |
| ------- | ---------- | ------------------- | ------------------------------------- |
| 1.0     | 2025-01-02 | Claude (Sonnet 4.5) | Initial PRD created based on research |

---

**END OF PRD**

**REMEMBER:** Read this document BEFORE starting ANY task in this project. All phases, tasks, and validation criteria are defined here. If you have questions or need clarification, refer back to this document first.
