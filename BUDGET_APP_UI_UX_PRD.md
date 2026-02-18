# Product Requirements Document: Budget App UI/UX Modernization

**Version:** 1.0
**Date:** 2025-01-02
**Status:** Approved - Ready for Implementation
**Priority:** High
**Estimated Timeline:** 12-18 days (4 phases)
**Project ID:** budget-app-ui-ux-modernization

---

## ⚠️ READ THIS FIRST - BEFORE EVERY TASK

This PRD serves as the single source of truth for the Budget App UI/UX modernization project. **All agents and developers MUST read this document before starting any task** to ensure alignment with:

1. **Internal design standards** (`.claude/Skills/design-guide.md`)
2. **2025 industry best practices** (fintech UX, WCAG 2.2 AA)
3. **Agent coordination strategies** (mesh, hierarchical, adaptive)
4. **Success metrics and validation criteria**

---

## Executive Summary

### Problem Statement

The Budget App currently violates internal design standards and lacks 2025 industry-standard UX patterns:

- ❌ **Design Guide Violations**: Multiple gradients, 6+ competing accent colors
- ❌ **Accessibility Gaps**: No WCAG 2.2 support, zero ARIA labels, color-only indicators
- ❌ **Missing Modern UX**: No microinteractions, no predictive insights, poor mobile experience

### Solution

Comprehensive UI/UX modernization across 4 phases to achieve:

- ✅ **Design Compliance**: Single accent color, clean minimalist aesthetic
- ✅ **WCAG 2.2 AA**: Required for EU market by June 2025 (EAA deadline)
- ✅ **Modern Patterns**: Microinteractions, AI insights, mobile-first PWA

### Success Metrics

| Metric                   | Current | Target   | Validation                  |
| ------------------------ | ------- | -------- | --------------------------- |
| Design Guide Compliance  | ~40%    | 100%     | Manual checklist review     |
| Lighthouse Accessibility | Unknown | ≥95%     | Automated CI check          |
| WCAG Violations (Pa11y)  | Unknown | 0 errors | Automated CI check          |
| Mobile Usability Score   | Unknown | ≥90%     | Google Mobile-Friendly Test |
| Onboarding Completion    | Unknown | +25%     | Analytics tracking          |

---

## Research Findings Summary

### Internal Design Guide Analysis (`.claude/Skills/design-guide.md`)

**Core Violations Found:**

1. **Gradient Overload**: MetricCards have `bg-gradient-to-r` top bars (purple-indigo, green-emerald, red-rose, blue-cyan)
   - Guide: "Never: Generic purple/blue gradients"
   - Fix: Replace with solid 1px border-left accent stripe

2. **Multiple Accent Colors**: 6+ colors used simultaneously (blue, green, red, purple, orange, teal)
   - Guide: "Choose ONE accent color, use sparingly for CTAs"
   - Fix: Select teal (#14b8a6) as single accent, use grays for everything else

3. **8px Grid Compliance**: Generally good (Tailwind enforces this)
   - Continue using: 8, 16, 24, 32, 48, 64px spacing

4. **Typography**: Mostly compliant (16px body minimum, clear hierarchy)
   - Minor fix: Ensure no text below 16px (check small labels)

5. **Shadows**: Compliant (subtle shadows used)
   - Continue: `shadow-sm`, `shadow-md`, avoid heavy shadows

### Industry Best Practices Research (2025 Fintech UX)

**Top 10 Trends Identified:**

1. **AI-Driven Personalization**: "You usually spend $X on groceries" (3-month average)
2. **Microinteractions**: Button animations, success checkmarks, loading skeletons
3. **Biometric Auth**: Not applicable (local-first, no auth)
4. **Data Visualization**: Trend lines, heat maps, sparklines, interactive tooltips
5. **Financial Wellness**: Budgeting tools, goal tracking (already implemented)
6. **Mobile-First**: 71% of users prefer mobile, must be excellent
7. **Gamification**: Already implemented (not a focus)
8. **Predictive Analytics**: Overspending alerts, recurring detection, forecasts
9. **Simplified Onboarding**: Guided tour, sample data, progress indicators
10. **Conversational UI**: Voice/chat interfaces (future consideration)

### Accessibility Requirements (WCAG 2.2 AA)

**Critical Requirements:**

- **POUR Principles**: Perceivable, Operable, Understandable, Robust
- **European Accessibility Act (EAA)**: June 28, 2025 deadline
- **Market Size**: 1.6B+ people with disabilities ($18T spending power)
- **Technical Standards**: WCAG 2.1 AA minimum, WCAG 2.2 recommended

**Implementation Checklist:**

- [ ] Text alternatives for all images/icons
- [ ] Color contrast ≥4.5:1 for text, ≥3:1 for UI components
- [ ] Keyboard navigation for all interactive elements
- [ ] ARIA labels, roles, live regions
- [ ] Non-color status indicators (icons + color)
- [ ] Focus indicators (ring-2 on interactive elements)
- [ ] Screen reader announcements for dynamic updates
- [ ] Semantic HTML (`<button>`, `<nav>`, `<main>`, `<aside>`)

### Competitive Analysis (Monarch Money, YNAB)

**Key Differentiators:**

- ✅ **Privacy**: Local-first (1000x better than competitors)
- ✅ **Planning**: Best-in-class retirement calculator (Canadian CPP/OAS)
- ⚠️ **Automation**: Missing vs Monarch (no auto-sync by design)
- ⚠️ **Mobile**: Needs improvement vs competitors (native apps)

**UI Benchmarks:**

- **Monarch**: Clean, visual dashboards, excellent mobile UX
- **YNAB**: Functional but dated UI, steep learning curve
- **Our Target**: Monarch-level polish + privacy advantage

---

## Phase 1: Design System Compliance (2-3 days)

### Objective

Align with internal `.claude/Skills/design-guide.md` standards

### Tasks

#### Task 1.1: Remove Gradient Overload (4-6 hours)

**Files Affected:** All `src/app/budget-app/**/*.tsx` components

**Changes Required:**

```tsx
// BEFORE (violates guide)
<div className="bg-gradient-to-r from-purple-500 to-indigo-600">

// AFTER (compliant)
<div className="border-l-4 border-teal-500 bg-white">
```

**Specific Components:**

- `src/app/budget-app/page.tsx` - MetricCard component (lines 56-74)
- All card components with gradient top bars
- Remove: `from-green-500 to-emerald-600`, `from-red-500 to-rose-600`, etc.

**Agent Assignment:**

- **Primary**: frontend-developer, react-specialist
- **Support**: refactoring-specialist
- **Coordination**: mesh-coordinator (parallel edits across files)

**Validation:**

- Run: `grep -r "gradient" src/app/budget-app/ --include="*.tsx"`
- Expected: 0 results (or only in comments)

---

#### Task 1.2: Consolidate to Single Accent Color (2-3 hours)

**Files Affected:** All budget-app components

**Color Palette:**

```css
/* APPROVED PALETTE */
--accent: #14b8a6; /* Teal - single accent for CTAs */
--gray-50: #fafafa; /* Background */
--gray-100: #f5f5f5; /* Cards, hover states */
--gray-200: #e5e5e5; /* Borders */
--gray-900: #171717; /* Text */

/* SEMANTIC ONLY (not accent) */
--success: #10b981; /* Green for positive */
--error: #ef4444; /* Red for negative */
--warning: #f59e0b; /* Yellow for alerts */
```

**Replacement Strategy:**

- Purple/blue → Teal (if accent) or Gray (if not critical)
- Orange → Teal (accent) or Gray (neutral)
- Cyan → Teal
- Keep green/red/yellow ONLY for semantic meaning (income/expense/warning)

**Agent Assignment:**

- **Primary**: ui-ux-designer, frontend-developer
- **Support**: None
- **Coordination**: single-lead (design-led approach)

**Validation:**

- Visual inspection: Only 1 accent color visible
- Color counter: Max 4 distinct colors (gray scale + teal + green + red)

---

#### Task 1.3: Implement WCAG 2.2 AA Accessibility (6-8 hours)

**Files Affected:** All interactive components

**Critical Changes:**

1. **ARIA Labels**

```tsx
// BEFORE
<button onClick={handleDelete}>
  <Trash2 className="w-4 h-4" />
</button>

// AFTER
<button
  onClick={handleDelete}
  aria-label="Delete transaction"
  aria-describedby="delete-help-text"
>
  <Trash2 className="w-4 h-4" aria-hidden="true" />
</button>
<span id="delete-help-text" className="sr-only">
  Permanently remove this transaction from your records
</span>
```

2. **Keyboard Focus Indicators**

```tsx
// Add to all interactive elements
className = "focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2";
```

3. **Non-Color Status Indicators**

```tsx
// BEFORE (color only)
<div className="bg-red-100">
  <div className="bg-red-500 h-2" style={{width: `${percentage}%`}} />
</div>

// AFTER (color + icon)
<div className="bg-red-100 flex items-center gap-2">
  <AlertCircle className="w-4 h-4 text-red-600" aria-label="Over budget" />
  <div className="bg-red-500 h-2" style={{width: `${percentage}%`}} />
  <span className="text-sm font-semibold">{percentage}% (over budget)</span>
</div>
```

4. **Semantic HTML**

```tsx
// Use proper semantic elements
<nav aria-label="Primary navigation">
<main id="main-content">
<aside aria-label="Budget status">
<button type="button"> (not <div onClick>)
```

**Agent Assignment:**

- **Primary**: accessibility-tester, frontend-developer
- **Support**: qa-expert
- **Coordination**: hierarchical-coordinator (accessibility-tester leads)

**Validation:**

- Lighthouse Accessibility: ≥95%
- Pa11y: 0 WCAG violations
- Manual screen reader test (NVDA/VoiceOver)
- Manual keyboard-only navigation test

---

## Phase 2: 2025 UX Patterns (3-5 days)

### Objective

Match industry standards for modern fintech apps

### Tasks

#### Task 2.1: Add Microinteractions (1 day)

**Files Affected:** Buttons, cards, modals, progress bars

**Microinteraction Library:**

1. **Button Press Animation**

```tsx
className = "transition-transform active:scale-95 duration-150";
```

2. **Success Checkmark Animation**

```tsx
// After successful action (import, save, delete)
<motion.div
  initial={{ scale: 0 }}
  animate={{ scale: 1 }}
  transition={{ type: "spring", duration: 0.5 }}
>
  <CheckCircle className="h-16 w-16 text-green-500" />
</motion.div>
```

3. **Loading Skeleton**

```tsx
// Instead of spinner, show content-shaped skeletons
<div className="animate-pulse space-y-4">
  <div className="h-4 w-3/4 rounded bg-gray-200"></div>
  <div className="h-4 w-1/2 rounded bg-gray-200"></div>
</div>
```

4. **Toast Notifications**

```tsx
// Replace alert() with react-hot-toast
import toast from "react-hot-toast";

toast.success("Transaction saved!");
toast.error("Failed to import CSV");
toast.loading("Processing...");
```

5. **Animated Progress Counters**

```tsx
// Percentage counts up from 0 to target
<CountUp end={percentage} duration={1} suffix="%" />
```

**Agent Assignment:**

- **Primary**: frontend-developer, ui-ux-designer
- **Support**: None
- **Coordination**: mesh-coordinator (parallel implementation)

**Validation:**

- All user actions have visual feedback
- No `alert()` or `confirm()` remaining
- Smooth 60fps animations (Chrome DevTools performance)

---

#### Task 2.2: Implement Predictive Insights (2 days)

**Files Affected:** Dashboard, Reports, Budget pages

**Insights to Implement:**

1. **Average Spending Insight**

```tsx
// Calculate 3-month rolling average per category
const averageSpending =
  transactions
    .filter((tx) => tx.category === category && isLast3Months(tx.date))
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0) / 3;

// Display
<InsightCard icon={TrendingUp}>
  You usually spend ${averageSpending.toFixed(0)} on {category} per month
</InsightCard>;
```

2. **Overspending Alert**

```tsx
// Forecast end-of-month spending
const daysInMonth = getDaysInMonth(new Date());
const dayOfMonth = new Date().getDate();
const projectedSpending = (spent / dayOfMonth) * daysInMonth;
const overage = projectedSpending - budget;

if (overage > 0) {
  <AlertCard icon={AlertCircle} color="warning">
    At this rate, you'll exceed your {category} budget by ${overage.toFixed(0)}
  </AlertCard>;
}
```

3. **Recurring Transaction Detection**

```tsx
// Flag transactions that occur weekly/monthly
const patterns = detectRecurringPatterns(transactions);

patterns.forEach((pattern) => {
  <InsightCard icon={RefreshCw}>
    Recurring: {pattern.description} appears every {pattern.frequency}
    <Button size="sm">Create Auto-Entry</Button>
  </InsightCard>;
});
```

4. **Budget Forecast**

```tsx
// Add trend line to area chart
const trendLine = calculateLinearRegression(monthlySpending);
const nextMonthForecast = trendLine.predict(nextMonth);

<AreaChart
  data={[...historicalData, { month: "Next", value: nextMonthForecast, isDashed: true }]}
/>;
```

**Agent Assignment:**

- **Primary**: data-analyst, frontend-developer
- **Support**: react-specialist, data-scientist
- **Coordination**: adaptive-coordinator (data-driven decisions)

**Validation:**

- 3+ insights visible on dashboard (for users with 90+ days of data)
- Insights update when transactions change
- Accuracy: Forecasts within 10% of actual (test with historical data)

---

#### Task 2.3: Enhanced Data Visualization (1-2 days)

**Files Affected:** Dashboard charts, Reports page

**Enhancements:**

1. **Trend Lines with Projections**

```tsx
// Add dotted projection line to area chart
<Area
  type="monotone"
  dataKey="projection"
  stroke="#14b8a6"
  strokeDasharray="5 5"
  fill="none"
  connectNulls
/>
```

2. **Spending Heat Map**

```tsx
// 7 columns (days of week) x 4-5 rows (weeks in month)
<div className="grid grid-cols-7 gap-1">
  {daysInMonth.map((day) => (
    <div
      key={day}
      className={`h-10 rounded ${getHeatColor(spendingOnDay)}`}
      title={`${day}: $${spendingOnDay}`}
    >
      {day}
    </div>
  ))}
</div>

// Color scale: white (no spending) → light teal → dark teal (high spending)
```

3. **Sparklines in Metric Cards**

```tsx
// Mini 7-day trend chart (40px height)
<Sparklines data={last7Days} width={100} height={40}>
  <SparklinesLine color="#14b8a6" />
</Sparklines>
```

4. **Interactive Tooltips with Context**

```tsx
// Enhanced tooltip
<Tooltip
  content={(props) => (
    <div className="rounded-lg border bg-white p-3 shadow-lg">
      <p className="font-semibold">{props.label}</p>
      <p className="text-sm text-gray-600">{props.value} (23% higher than last month)</p>
      <p className="text-xs text-gray-500">Average: $X | Trend: ↑</p>
    </div>
  )}
/>
```

**Agent Assignment:**

- **Primary**: data-scientist, frontend-developer
- **Support**: ui-ux-designer
- **Coordination**: adaptive-coordinator

**Validation:**

- All charts have interactive hover tooltips
- Heat map shows spending patterns
- Sparklines render in metric cards
- Trend lines visible in reports

---

## Phase 3: Mobile-First Optimization (3-4 days)

### Objective

Make mobile experience excellent (71% of users prefer mobile)

### Tasks

#### Task 3.1: Responsive Redesign (2 days)

**Files Affected:** Layout, sidebar, tables, forms, modals

**Breakpoints:**

```css
/* Tailwind breakpoints */
sm: 640px   /* Small tablets */
md: 768px   /* Tablets */
lg: 1024px  /* Small laptops */
xl: 1280px  /* Desktops */
```

**Key Changes:**

1. **Collapsible Sidebar**

```tsx
// Desktop: Always visible (w-64)
// Mobile: Hidden by default, show with hamburger menu

const [sidebarOpen, setSidebarOpen] = useState(false);

<div className="lg:flex">
  {/* Mobile hamburger */}
  <button
    className="fixed left-4 top-4 z-50 lg:hidden"
    onClick={() => setSidebarOpen(!sidebarOpen)}
    aria-label="Toggle navigation menu"
  >
    <Menu className="h-6 w-6" />
  </button>

  {/* Sidebar */}
  <aside
    className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r bg-white transition-transform duration-300 lg:static ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} `}
  >
    {/* Navigation */}
  </aside>

  {/* Overlay on mobile */}
  {sidebarOpen && (
    <div
      className="fixed inset-0 z-30 bg-black/50 lg:hidden"
      onClick={() => setSidebarOpen(false)}
    />
  )}
</div>;
```

2. **Mobile Bottom Navigation**

```tsx
// Show on mobile (<768px), hide on desktop
<nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t z-40">
  <div className="flex justify-around items-center h-16">
    <NavButton icon={Home} label="Home" href="/budget-app" />
    <NavButton icon={Receipt} label="Transactions" href="/budget-app/transactions" />
    <NavButton icon={PieChart} label="Budgets" href="/budget-app/budgets" />
    <NavButton icon={BarChart3} label="Reports" href="/budget-app/reports" />
  </div>
</nav>

// Add padding-bottom to main content on mobile
<main className="pb-20 md:pb-0">
```

3. **Touch-Friendly Targets**

```tsx
// All buttons ≥44px tap area
className="min-h-[44px] px-4 py-3"

// Table rows with larger touch target
<tr className="h-14">  {/* 56px height */}
```

4. **Mobile Table View**

```tsx
// Desktop: Table
// Mobile: Card view

<div className="hidden md:block">
  <table>{/* Standard table */}</table>
</div>

<div className="md:hidden space-y-2">
  {transactions.map(tx => (
    <div className="bg-white rounded-lg p-4 shadow">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-semibold">{tx.description}</p>
          <p className="text-sm text-gray-500">{tx.category}</p>
          <p className="text-xs text-gray-400">{formatDate(tx.date)}</p>
        </div>
        <p className={`font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-gray-900'}`}>
          ${Math.abs(tx.amount)}
        </p>
      </div>
    </div>
  ))}
</div>
```

5. **Mobile Form Optimization**

```tsx
// Stacked fields (no grid on mobile)
<div className="space-y-4 md:grid md:grid-cols-2 md:gap-4">

// Larger input heights
<input className="h-12 md:h-10" />

// Number inputs with proper mobile keyboard
<input type="number" inputMode="decimal" />
```

6. **Bottom Sheet Modals (Mobile)**

```tsx
// Desktop: Center modal
// Mobile: Bottom sheet that slides up

<div
  className={`fixed inset-x-0 z-50 md:inset-0 md:flex md:items-center md:justify-center ${isOpen ? "bottom-0" : "-bottom-full"} transition-all duration-300`}
>
  {/* Desktop: Centered card with max-width */}
  {/* Mobile: Full-width bottom sheet */}
  <div className="max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white md:mx-4 md:max-h-[80vh] md:max-w-2xl md:rounded-lg">
    {/* Modal content */}
  </div>
</div>
```

**Agent Assignment:**

- **Primary**: frontend-developer, ui-ux-designer
- **Support**: react-specialist, typescript-pro
- **Coordination**: coordinated-swarm (complex, cross-cutting changes)

**Validation:**

- Google Mobile-Friendly Test: ≥90%
- Manual test on 3 screen sizes: 375px (iPhone SE), 768px (iPad), 1920px (Desktop)
- All touch targets ≥44px (Chrome DevTools → Show rulers)
- Sidebar collapses on mobile, bottom nav appears

---

#### Task 3.2: PWA Implementation (1 day)

**Files Affected:** `public/manifest.json`, `src/app/layout.tsx`, service worker

**Manifest File:**

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
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "screenshots": [
    {
      "src": "/screenshots/dashboard.png",
      "sizes": "1280x720",
      "type": "image/png"
    }
  ]
}
```

**Service Worker (Basic Offline Caching):**

```js
// public/sw.js
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("budget-app-v1").then((cache) => {
      return cache.addAll([
        "/budget-app",
        "/budget-app/transactions",
        "/budget-app/budgets",
        "/budget-app/reports",
      ]);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
```

**Register Service Worker:**

```tsx
// src/app/layout.tsx
useEffect(() => {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js");
  }
}, []);
```

**"Add to Home Screen" Prompt:**

```tsx
// Show prompt after user has used app 3+ times
const [deferredPrompt, setDeferredPrompt] = useState(null);

useEffect(() => {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    setDeferredPrompt(e);
  });
}, []);

const handleInstallClick = () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      setDeferredPrompt(null);
    });
  }
};
```

**Agent Assignment:**

- **Primary**: frontend-developer, performance-engineer
- **Support**: None
- **Coordination**: single-lead

**Validation:**

- Lighthouse PWA score: 100%
- App installs on iOS (Safari → Share → Add to Home Screen)
- App installs on Android (Chrome → Install app)
- Offline mode works (dashboard loads without network)

---

#### Task 3.3: Mobile-Optimized Workflows (1 day)

**Files Affected:** Transaction list, tables, charts

**Swipe-to-Delete Transactions:**

```tsx
// Use react-swipeable or implement manually
import { useSwipeable } from "react-swipeable";

const handlers = useSwipeable({
  onSwipedLeft: () => setShowDelete(true),
  preventDefaultTouchmoveEvent: true,
  trackMouse: false,
});

<div {...handlers} className="relative">
  <div className={`transition-transform ${showDelete ? "-translate-x-20" : ""}`}>
    <TransactionRow {...tx} />
  </div>
  {showDelete && (
    <button
      className="absolute inset-y-0 right-0 w-20 bg-red-600 text-white"
      onClick={() => handleDelete(tx.id)}
    >
      Delete
    </button>
  )}
</div>;
```

**Sticky Headers on Scroll:**

```tsx
<thead className="sticky top-0 z-10 bg-gray-50">{/* Table headers */}</thead>
```

**Pull-to-Refresh:**

```tsx
// Use react-pull-to-refresh or implement manually
<PullToRefresh onRefresh={loadData}>
  <TransactionList />
</PullToRefresh>
```

**Optimized Chart Sizes:**

```tsx
// Reduce height on mobile
<ResponsiveContainer width="100%" height={isMobile ? 200 : 300}>
  <PieChart>{/* ... */}</PieChart>
</ResponsiveContainer>
```

**Agent Assignment:**

- **Primary**: frontend-developer, ui-ux-designer
- **Support**: None
- **Coordination**: mesh-coordinator

**Validation:**

- Swipe left on transaction → Delete button appears
- Table headers stick on scroll
- Pull down on list → Refresh indicator
- Charts sized appropriately on mobile

---

## Phase 4: Advanced Features (4-6 days)

### Objective

Competitive differentiation and power user features

### Tasks

#### Task 4.1: Guided Onboarding Tour (1 day)

**Library:** Intro.js or Shepherd.js

**Tour Steps:**

1. Welcome → "Let's import your first bank statement"
2. Upload CSV → "Drag & drop your bank's CSV file"
3. Auto-categorization → "We've automatically categorized your transactions"
4. Set budget → "Set spending limits for each category"
5. Dashboard → "Track your financial health here"
6. Reports → "Visualize your spending patterns"

**Implementation:**

```tsx
import Shepherd from "shepherd.js";
import "shepherd.js/dist/css/shepherd.css";

const tour = new Shepherd.Tour({
  useModalOverlay: true,
  defaultStepOptions: {
    classes: "shadow-lg bg-white",
    scrollTo: true,
  },
});

tour.addStep({
  id: "welcome",
  text: "Welcome to Budget App! Let's get you started.",
  buttons: [
    {
      text: "Skip Tour",
      action: tour.cancel,
    },
    {
      text: "Start",
      action: tour.next,
    },
  ],
});

// Track completion
tour.on("complete", () => {
  localStorage.setItem("tourCompleted", "true");
});
```

**Agent Assignment:**

- **Primary**: frontend-developer, tutorial-engineer
- **Support**: technical-writer
- **Coordination**: mesh-coordinator

**Validation:**

- 80%+ users complete tour (track in localStorage)
- Tour can be dismissed and replayed
- Tour works on mobile and desktop

---

#### Task 4.2: Smart Categorization Enhancements (1-2 days)

**ML-Based Suggestions (TensorFlow.js):**

```tsx
// Train model on user corrections
import * as tf from "@tensorflow/tfjs";

// Features: description length, amount, day of week, merchant keywords
const model = tf.sequential({
  layers: [
    tf.layers.dense({ inputShape: [features.length], units: 64, activation: "relu" }),
    tf.layers.dense({ units: categories.length, activation: "softmax" }),
  ],
});

// Train on user's historical data
const xs = tf.tensor2d(transactions.map((tx) => extractFeatures(tx)));
const ys = tf.oneHot(
  transactions.map((tx) => categoryIndex[tx.category]),
  categories.length
);

await model.fit(xs, ys, { epochs: 50 });

// Predict category for new transaction
const prediction = model.predict(tf.tensor2d([features]));
const categoryIndex = prediction.argMax(-1).dataSync()[0];
```

**Bulk Categorization UI:**

```tsx
// Multi-select transactions
const [selectedIds, setSelectedIds] = useState<string[]>([]);

<Checkbox
  checked={selectedIds.includes(tx.id)}
  onChange={(e) => {
    if (e.target.checked) {
      setSelectedIds([...selectedIds, tx.id]);
    } else {
      setSelectedIds(selectedIds.filter((id) => id !== tx.id));
    }
  }}
/>;

// Bulk action bar
{
  selectedIds.length > 0 && (
    <div className="fixed inset-x-4 bottom-4 rounded-lg bg-white p-4 shadow-xl">
      <p>{selectedIds.length} transactions selected</p>
      <Button onClick={handleBulkCategorize}>Categorize All As...</Button>
    </div>
  );
}
```

**Confidence Meter:**

```tsx
// Show confidence score for auto-categories
<div className="flex items-center gap-2">
  <span className="text-sm">{category}</span>
  <div className="flex gap-1">
    {[...Array(5)].map((_, i) => (
      <div
        key={i}
        className={`h-4 w-1 rounded ${
          i < Math.floor(confidence * 5) ? "bg-teal-500" : "bg-gray-200"
        }`}
      />
    ))}
  </div>
  <span className="text-xs text-gray-500">{(confidence * 100).toFixed(0)}%</span>
</div>
```

**"Learn from This" Button:**

```tsx
// Explicit feedback for learning
<Button
  size="sm"
  variant="ghost"
  onClick={() => {
    recordCorrection({
      originalDescription: tx.description,
      suggestedCategory: autoCategory,
      correctedCategory: tx.category,
      timestamp: new Date(),
    });
    toast.success("Thanks! We'll remember this for similar transactions.");
  }}
>
  Learn from this
</Button>
```

**Agent Assignment:**

- **Primary**: data-scientist, frontend-developer
- **Support**: react-specialist
- **Coordination**: adaptive-coordinator

**Validation:**

- Auto-categorization accuracy ≥90% after 100 user corrections
- Bulk categorization works for 10+ selected transactions
- Confidence meter shows 1-5 bars based on score
- "Learn from this" updates model and shows confirmation

---

#### Task 4.3: Split Transactions (1 day)

**Split Modal:**

```tsx
// Open from transaction row
<Button size="sm" onClick={() => setShowSplitModal(true)}>
  Split
</Button>

// Modal UI
<Modal isOpen={showSplitModal}>
  <h2>Split Transaction</h2>
  <p>Original: {transaction.description} - ${transaction.amount}</p>

  <div className="space-y-4">
    {splits.map((split, index) => (
      <div key={index} className="flex gap-2">
        <Select
          value={split.category}
          onChange={(e) => updateSplit(index, 'category', e.target.value)}
        >
          {categories.map(cat => <option key={cat.id}>{cat.name}</option>)}
        </Select>
        <Input
          type="number"
          value={split.amount}
          onChange={(e) => updateSplit(index, 'amount', e.target.value)}
          placeholder="$0.00"
        />
        <Button onClick={() => removeSplit(index)}>Remove</Button>
      </div>
    ))}

    <Button onClick={addSplit}>+ Add Split</Button>

    <div className="text-sm text-gray-500">
      Total: ${splits.reduce((sum, s) => sum + s.amount, 0)} / ${transaction.amount}
    </div>
  </div>

  <Button
    onClick={handleSaveSplits}
    disabled={totalSplitAmount !== transaction.amount}
  >
    Save Splits
  </Button>
</Modal>
```

**Database Schema:**

```tsx
// Add splitFromId to Transaction type
interface Transaction {
  // ... existing fields
  splitFromId?: string; // ID of original transaction (if this is a split)
  isSplit: boolean; // Whether this transaction has been split
}

// When splitting:
// 1. Mark original transaction as isSplit: true
// 2. Create new transactions with splitFromId: original.id
// 3. Hide original from lists, show splits instead
```

**Agent Assignment:**

- **Primary**: frontend-developer, react-specialist
- **Support**: None
- **Coordination**: single-lead

**Validation:**

- Can split transaction into 2+ parts
- Total splits equal original amount (validation)
- Split transactions show in list correctly
- Can "unsplit" to restore original

---

#### Task 4.4: Receipt Attachments (1-2 days)

**File Upload UI:**

```tsx
// Drag & drop + file input
import { useDropzone } from "react-dropzone";

const { getRootProps, getInputProps } = useDropzone({
  accept: { "image/*": [] },
  maxSize: 5 * 1024 * 1024, // 5MB
  onDrop: handleFileUpload,
});

<div {...getRootProps()} className="rounded-lg border-2 border-dashed p-8">
  <input {...getInputProps()} />
  <Upload className="mx-auto h-12 w-12 text-gray-400" />
  <p className="text-center text-gray-600">Drag & drop receipt, or click to browse</p>
</div>;
```

**IndexedDB Blob Storage:**

```tsx
// Store in separate object store
interface Receipt {
  id: string;
  transactionId: string;
  fileName: string;
  fileType: string;
  blob: Blob;
  uploadedAt: Date;
}

// Add to database schema
export class BudgetDatabase extends Dexie {
  receipts!: Table<Receipt>;

  constructor() {
    super("HouseholdBudgetApp");
    this.version(2).stores({
      // ... existing stores
      receipts: "id, transactionId, uploadedAt",
    });
  }
}

// Save receipt
async function saveReceipt(transactionId: string, file: File) {
  const receipt: Receipt = {
    id: `receipt_${Date.now()}`,
    transactionId,
    fileName: file.name,
    fileType: file.type,
    blob: file,
    uploadedAt: new Date(),
  };

  await db.receipts.add(receipt);
}
```

**Image Preview:**

```tsx
// Show thumbnail in transaction details
const [receiptUrl, setReceiptUrl] = useState<string | null>(null);

useEffect(() => {
  async function loadReceipt() {
    const receipt = await db.receipts.where("transactionId").equals(tx.id).first();
    if (receipt) {
      const url = URL.createObjectURL(receipt.blob);
      setReceiptUrl(url);
    }
  }
  loadReceipt();

  return () => {
    if (receiptUrl) URL.revokeObjectURL(receiptUrl);
  };
}, [tx.id]);

{
  receiptUrl && (
    <div className="mt-4">
      <p className="mb-2 text-sm font-medium text-gray-700">Receipt</p>
      <img
        src={receiptUrl}
        alt="Receipt"
        className="w-full max-w-sm cursor-pointer rounded-lg border"
        onClick={() => window.open(receiptUrl, "_blank")}
      />
    </div>
  );
}
```

**Optional OCR (Tesseract.js):**

```tsx
import Tesseract from "tesseract.js";

async function extractTextFromReceipt(file: File) {
  const {
    data: { text },
  } = await Tesseract.recognize(file, "eng");

  // Extract merchant and amount with regex
  const merchantMatch = text.match(/[A-Z\s]{3,}/); // All-caps words
  const amountMatch = text.match(/\$?[\d,]+\.\d{2}/); // Currency format

  return {
    merchant: merchantMatch?.[0].trim(),
    amount: amountMatch?.[0].replace(/[$,]/g, ""),
  };
}
```

**Agent Assignment:**

- **Primary**: frontend-developer, backend-developer (OCR logic)
- **Support**: None
- **Coordination**: mesh-coordinator

**Validation:**

- Upload receipt → Saved to IndexedDB
- Receipt appears in transaction details
- Image preview works (thumbnail + full view)
- File size limit enforced (5MB)
- OCR extracts merchant/amount (if implemented)

---

#### Task 4.5: Keyboard Shortcuts (4 hours)

**Shortcut Implementation:**

```tsx
// Global keyboard listener
useEffect(() => {
  function handleKeyPress(e: KeyboardEvent) {
    // Ignore if typing in input
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return;
    }

    switch (e.key) {
      case "n":
        e.preventDefault();
        setShowTransactionModal(true);
        break;
      case "/":
        e.preventDefault();
        searchInputRef.current?.focus();
        break;
      case "b":
        e.preventDefault();
        router.push("/budget-app/budgets");
        break;
      case "d":
        e.preventDefault();
        router.push("/budget-app");
        break;
      case "?":
        e.preventDefault();
        setShowShortcutsOverlay(true);
        break;
      case "Escape":
        setShowModal(false);
        setShowShortcutsOverlay(false);
        break;
    }
  }

  window.addEventListener("keydown", handleKeyPress);
  return () => window.removeEventListener("keydown", handleKeyPress);
}, []);
```

**Shortcuts Overlay:**

```tsx
// Show on "?" key
<Modal isOpen={showShortcutsOverlay}>
  <h2 className="mb-4 text-2xl font-bold">Keyboard Shortcuts</h2>
  <div className="space-y-2">
    <ShortcutRow keys={["N"]} description="New transaction" />
    <ShortcutRow keys={["/"]} description="Search" />
    <ShortcutRow keys={["B"]} description="Go to Budgets" />
    <ShortcutRow keys={["D"]} description="Go to Dashboard" />
    <ShortcutRow keys={["?"]} description="Show this dialog" />
    <ShortcutRow keys={["Esc"]} description="Close modal" />
  </div>
</Modal>;

function ShortcutRow({ keys, description }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-gray-700">{description}</span>
      <div className="flex gap-1">
        {keys.map((key) => (
          <kbd
            key={key}
            className="rounded border border-gray-300 bg-gray-100 px-2 py-1 font-mono text-sm"
          >
            {key}
          </kbd>
        ))}
      </div>
    </div>
  );
}
```

**Agent Assignment:**

- **Primary**: frontend-developer
- **Support**: None
- **Coordination**: single-lead

**Validation:**

- All shortcuts work as documented
- `?` overlay shows complete list
- Shortcuts don't interfere with typing in inputs
- `Esc` closes all modals

---

## Testing & Validation Plan

### Automated Testing

#### Lighthouse CI

```bash
# Run in CI pipeline
npx lighthouse-ci autorun \
  --collect.url=http://localhost:3000/budget-app \
  --assert.preset=lighthouse:recommended \
  --assert.assertions.accessibility=0.95 \
  --assert.assertions.performance=0.90 \
  --assert.assertions.pwa=1.0
```

**Target Scores:**

- Accessibility: ≥95
- Performance: ≥90
- PWA: 100
- Best Practices: ≥90

#### Pa11y Accessibility Tests

```bash
# Run for each page
pa11y http://localhost:3000/budget-app \
  --standard WCAG2AA \
  --threshold 0

pa11y http://localhost:3000/budget-app/transactions \
  --standard WCAG2AA \
  --threshold 0
```

**Target:** 0 WCAG 2.0 AA violations

#### Jest Unit Tests

```tsx
// Test all new components
describe("MetricCard", () => {
  it("renders without gradients", () => {
    const { container } = render(<MetricCard {...props} />);
    expect(container.innerHTML).not.toContain("gradient");
  });

  it("has proper ARIA labels", () => {
    const { getByRole } = render(<MetricCard {...props} />);
    expect(getByRole("img", { name: /net worth/i })).toBeInTheDocument();
  });

  it("meets contrast ratio requirements", () => {
    const { getByText } = render(<MetricCard {...props} />);
    const title = getByText("Net Worth");
    const styles = window.getComputedStyle(title);
    expect(getContrastRatio(styles.color, styles.backgroundColor)).toBeGreaterThan(4.5);
  });
});
```

**Target:** ≥80% code coverage for new components

#### Playwright E2E Tests

```typescript
// Test critical user flows
test("complete transaction workflow", async ({ page }) => {
  await page.goto("/budget-app");
  await page.click("text=Add Transaction");
  await page.fill('[aria-label="Description"]', "Test Transaction");
  await page.fill('[aria-label="Amount"]', "50.00");
  await page.click('[aria-label="Category"]');
  await page.click("text=Food & Dining");
  await page.click("text=Add Transaction");
  await expect(page.locator("text=Test Transaction")).toBeVisible();
});

test("keyboard navigation", async ({ page }) => {
  await page.goto("/budget-app");
  await page.keyboard.press("n");
  await expect(page.locator("text=Add Transaction")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("text=Add Transaction")).not.toBeVisible();
});
```

**Target:** All critical paths tested (import, add, edit, delete, budget, report)

### Manual Testing

#### Device Testing Matrix

| Device        | Screen Size | Browser          | Tester |
| ------------- | ----------- | ---------------- | ------ |
| iPhone SE     | 375x667     | Safari 17        | Manual |
| iPhone 14 Pro | 393x852     | Safari 17        | Manual |
| iPad Air      | 820x1180    | Safari 17        | Manual |
| Pixel 7       | 412x915     | Chrome 120       | Manual |
| Galaxy S23    | 360x800     | Samsung Internet | Manual |
| Desktop       | 1920x1080   | Chrome 120       | Manual |
| Desktop       | 1920x1080   | Firefox 121      | Manual |
| Desktop       | 1920x1080   | Safari 17        | Manual |

#### Accessibility Testing

1. **Screen Reader Test**
   - NVDA (Windows) - Navigate entire app
   - VoiceOver (Mac/iOS) - Navigate entire app
   - All actions announced correctly
   - All images have alt text
   - All form fields have labels

2. **Keyboard-Only Test**
   - Disconnect mouse/trackpad
   - Complete all workflows (import, add, edit, delete, budget)
   - Tab order logical
   - Focus indicators visible
   - Shortcuts work

3. **Color Blindness Test**
   - Use Chrome DevTools → Rendering → Emulate vision deficiencies
   - Test: Protanopia, Deuteranopia, Tritanopia, Achromatopsia
   - All status indicators comprehensible without color

4. **Zoom Test**
   - Browser zoom: 200%, 300%
   - Text legible, layout intact
   - No horizontal scroll (except tables)

#### Performance Testing

1. **Page Load Times**
   - Dashboard: <2s (3G network)
   - Transactions: <3s (with 1000 transactions)
   - Reports: <5s (with 1 year of data)

2. **Animation Smoothness**
   - Chrome DevTools → Performance → Record
   - All animations 60fps
   - No jank during scroll

3. **Memory Usage**
   - Chrome DevTools → Memory
   - No memory leaks (heap snapshot before/after)
   - IndexedDB storage <50MB (with 5000 transactions)

### Regression Testing

**Before/After Checklist:**

- [ ] Import CSV still works (BMO, Home Trust)
- [ ] Auto-categorization accuracy unchanged or improved
- [ ] All existing features functional
- [ ] No performance degradation
- [ ] No new console errors/warnings
- [ ] All tests passing

---

## Risk Mitigation

| Risk                           | Impact | Probability | Mitigation Strategy                                          |
| ------------------------------ | ------ | ----------- | ------------------------------------------------------------ |
| Breaking existing features     | High   | Medium      | Add Jest tests before refactoring, run full E2E suite        |
| Accessibility regression       | High   | Low         | Automated Pa11y CI checks, manual screen reader tests        |
| Mobile performance issues      | Medium | Medium      | Lighthouse CI performance budgets, real device testing       |
| Gradient removal breaks design | Medium | Low         | Prototype new design in single component first, get feedback |
| Timeline overrun (12-18 days)  | Medium | Medium      | Execute Phase 1 first (critical), defer Phase 4 if needed    |
| User confusion (new design)    | Low    | High        | Guided tour, clear changelog, rollout to subset first        |
| IndexedDB storage limits       | Low    | Low         | Monitor storage usage, add warning at 45MB                   |
| Browser compatibility          | Low    | Low         | Test on IE11 (if required), polyfills for older browsers     |

**Rollback Plan:**

- Keep old components in `src/app/budget-app-old/`
- Use feature flag: `const useNewDesign = localStorage.getItem('newDesign') === 'true'`
- Git branches: `main` (old), `ui-modernization` (new), merge after validation

---

## Deliverables Checklist

### Phase 1: Design System Compliance

- [ ] All gradients removed (`grep -r "gradient"` returns 0)
- [ ] Single accent color (teal #14b8a6) used consistently
- [ ] ARIA labels on all interactive elements
- [ ] Keyboard focus indicators (ring-2 ring-teal-500)
- [ ] Non-color status indicators (icons + text)
- [ ] Semantic HTML (`<button>`, `<nav>`, `<main>`)
- [ ] Lighthouse Accessibility ≥95%
- [ ] Pa11y 0 errors
- [ ] Manual screen reader test passed

### Phase 2: 2025 UX Patterns

- [ ] Button press animations (active:scale-95)
- [ ] Success checkmarks (animated SVG)
- [ ] Loading skeletons (shimmer effect)
- [ ] Toast notifications (no `alert()` remaining)
- [ ] Animated progress counters (CountUp)
- [ ] 3+ predictive insights on dashboard
- [ ] Overspending alerts implemented
- [ ] Recurring transaction detection
- [ ] Budget forecast trend lines
- [ ] Heat map for spending by day
- [ ] Sparklines in metric cards
- [ ] Interactive tooltips with context

### Phase 3: Mobile-First

- [ ] Collapsible sidebar (hamburger menu <768px)
- [ ] Bottom navigation bar (mobile)
- [ ] All touch targets ≥44px
- [ ] Mobile card view for tables
- [ ] Stacked forms on mobile
- [ ] Bottom sheet modals on mobile
- [ ] PWA manifest.json
- [ ] Service worker registered
- [ ] "Add to Home Screen" prompt
- [ ] Offline caching works
- [ ] Swipe-to-delete transactions
- [ ] Sticky table headers
- [ ] Pull-to-refresh
- [ ] Google Mobile-Friendly ≥90%
- [ ] Lighthouse PWA 100%

### Phase 4: Advanced Features

- [ ] Guided onboarding tour (Intro.js/Shepherd)
- [ ] 5-step tour script
- [ ] 80%+ users complete tour
- [ ] ML categorization (TensorFlow.js)
- [ ] Bulk categorization UI
- [ ] Confidence meter (5-bar scale)
- [ ] "Learn from this" button
- [ ] Auto-categorization ≥90% accurate
- [ ] Split transaction modal
- [ ] Split by percentage/fixed amount
- [ ] Multi-way splits (3+ categories)
- [ ] Receipt upload (drag & drop)
- [ ] IndexedDB blob storage
- [ ] Image preview thumbnail
- [ ] OCR extraction (optional)
- [ ] Keyboard shortcuts (N, /, B, D, ?, Esc)
- [ ] Shortcuts overlay (? key)

### Documentation

- [ ] Updated design-guide.md with budget app examples
- [ ] Accessibility report (Lighthouse + Pa11y)
- [ ] Mobile UX report (Google Mobile-Friendly)
- [ ] User guide (onboarding tour script)
- [ ] Keyboard shortcuts reference
- [ ] Changelog (user-facing)

### Testing

- [ ] All Jest tests passing (≥80% coverage)
- [ ] All Playwright E2E tests passing
- [ ] Lighthouse CI: Accessibility ≥95%, Performance ≥90%, PWA 100%
- [ ] Pa11y: 0 WCAG violations
- [ ] Manual tests: 8 devices tested
- [ ] Screen reader tests: NVDA + VoiceOver
- [ ] Keyboard-only test passed
- [ ] Color blindness test passed (4 types)
- [ ] Zoom test passed (200%, 300%)
- [ ] Regression tests: All existing features work

---

## Agent Coordination Strategies

### Mesh Coordinator (Parallel, Independent Tasks)

**Use for:** Phase 1.1, Phase 2.1, Phase 3.3, Phase 4.1, Phase 4.4

**How it works:**

- Agents work in parallel on different files
- Minimal dependencies between agents
- Each agent completes their subtask independently
- Periodic sync points to merge changes

**Example (Phase 1.1 - Remove Gradients):**

1. frontend-developer: Remove gradients from `page.tsx`, `transactions/page.tsx`
2. react-specialist: Remove gradients from modals, cards components
3. refactoring-specialist: Verify no gradients remain, check CSS classes
4. Sync: Merge all changes, resolve conflicts, test

### Hierarchical Coordinator (Lead Agent Directs)

**Use for:** Phase 1.3 (Accessibility)

**How it works:**

- One lead agent (accessibility-tester) defines requirements
- Other agents (frontend-developer, qa-expert) implement under direction
- Lead reviews all changes before merge
- Top-down decision making

**Example (Phase 1.3 - WCAG Accessibility):**

1. accessibility-tester: Audit current state, create checklist, define ARIA standards
2. frontend-developer: Implement ARIA labels, focus indicators, semantic HTML
3. qa-expert: Write automated Pa11y tests
4. accessibility-tester: Manual screen reader test, approve/reject changes

### Adaptive Coordinator (Data-Driven Decisions)

**Use for:** Phase 2.2 (Predictive Insights), Phase 2.3 (Data Viz), Phase 4.2 (ML Categorization)

**How it works:**

- Agents adapt based on data/metrics
- If approach isn't working, pivot to alternative
- Continuous measurement of outcomes
- Experiments run in parallel, best approach wins

**Example (Phase 2.2 - Predictive Insights):**

1. data-analyst: Prototype 3 insight algorithms (moving average, linear regression, exponential smoothing)
2. frontend-developer: Create UI for top-performing algorithm
3. Measure: Which algorithm has best accuracy on historical data?
4. Adapt: Ship best algorithm, discard others

### Coordinated Swarm (Complex, Cross-Cutting)

**Use for:** Phase 3.1 (Responsive Redesign)

**How it works:**

- Multiple agents tackling interdependent tasks
- Frequent communication and sync points
- Shared context (design system, breakpoints)
- Incremental integration (merge often)

**Example (Phase 3.1 - Responsive Redesign):**

1. ui-ux-designer: Define mobile breakpoints, touch target sizes, layout patterns
2. frontend-developer: Implement sidebar collapse, bottom nav, mobile forms
3. react-specialist: Refactor components for responsive props
4. typescript-pro: Update type definitions for new props
5. Sync every 2 hours: Demo progress, identify blockers, adjust approach

### Single-Lead (Simple, Linear Tasks)

**Use for:** Phase 1.2, Phase 3.2, Phase 4.3, Phase 4.5

**How it works:**

- One agent completes task start-to-finish
- No coordination overhead
- Fast execution for simple tasks
- Other agents only for code review

**Example (Phase 4.5 - Keyboard Shortcuts):**

1. frontend-developer: Implement all shortcuts, create overlay, test
2. (Optional) code-reviewer: Quick code review before merge
3. Done

---

## Success Criteria

### Phase 1: Design System Compliance

**Passed if:**

- [ ] `grep -r "gradient" src/app/budget-app/` returns 0 results
- [ ] Manual count: ≤4 distinct colors used (gray + teal + green + red)
- [ ] Lighthouse Accessibility score ≥95%
- [ ] Pa11y audit: 0 errors
- [ ] Manual screen reader test: All actions announced
- [ ] Manual keyboard test: All workflows completable without mouse

### Phase 2: 2025 UX Patterns

**Passed if:**

- [ ] No `alert()` or `confirm()` in code (replaced with toasts)
- [ ] All buttons have visible press animation
- [ ] Dashboard shows ≥3 insights for users with 90+ days of data
- [ ] All charts have interactive tooltips
- [ ] Heat map renders for current month
- [ ] Sparklines visible in metric cards

### Phase 3: Mobile-First

**Passed if:**

- [ ] Google Mobile-Friendly Test score ≥90%
- [ ] Lighthouse PWA score = 100%
- [ ] Manual test on iPhone: App installs, works offline
- [ ] Manual test on Android: App installs, works offline
- [ ] All touch targets ≥44px (measure in Chrome DevTools)
- [ ] Sidebar collapses on <768px screens
- [ ] Bottom navigation appears on <768px screens

### Phase 4: Advanced Features

**Passed if:**

- [ ] Onboarding tour completes in <2 minutes
- [ ] 80%+ test users complete tour (track in localStorage)
- [ ] Auto-categorization accuracy ≥90% after 100 transactions
- [ ] Bulk categorize: Can categorize 10+ transactions at once
- [ ] Split transaction: Can split into 3+ categories, total equals original
- [ ] Receipt upload: Image saves to IndexedDB, displays in transaction details
- [ ] All keyboard shortcuts work, `?` overlay shows complete list

### Overall Project Success

**Passed if ALL criteria met:**

- [ ] Design guide compliance: 100%
- [ ] Lighthouse scores: Accessibility ≥95%, Performance ≥90%, PWA 100%
- [ ] Pa11y: 0 WCAG violations
- [ ] Mobile usability: ≥90%
- [ ] User testing: 5/5 users can complete all workflows
- [ ] No regressions: All existing features work
- [ ] Performance: No degradation vs baseline
- [ ] Timeline: Completed within 12-18 days

---

## Appendix A: File Structure

```
modern-tco/
├── BUDGET_APP_UI_UX_PRD.md                     # This document
├── src/
│   ├── app/
│   │   └── budget-app/
│   │       ├── layout.tsx                      # Sidebar + responsive shell
│   │       ├── page.tsx                        # Dashboard with metric cards
│   │       ├── transactions/
│   │       │   └── page.tsx                    # Transaction list + modal
│   │       ├── budgets/
│   │       │   └── page.tsx                    # Budget tracking
│   │       ├── import/
│   │       │   └── page.tsx                    # CSV import
│   │       ├── reports/
│   │       │   └── page.tsx                    # Charts + visualizations
│   │       ├── export/
│   │       │   └── page.tsx                    # Data export
│   │       ├── settings/
│   │       │   └── page.tsx                    # Account/category management
│   │       └── planning/
│   │           ├── future/
│   │           │   └── page.tsx                # Future purchase planner
│   │           └── retirement/
│   │               └── page.tsx                # Retirement calculator
│   ├── components/
│   │   └── budget/
│   │       ├── TransactionModal.tsx            # Add/edit transaction
│   │       ├── MetricCard.tsx                  # (New) Gradient-free cards
│   │       ├── InsightCard.tsx                 # (New) Predictive insights
│   │       ├── OnboardingTour.tsx              # (New) Guided tour
│   │       ├── KeyboardShortcuts.tsx           # (New) Shortcuts overlay
│   │       └── SplitTransactionModal.tsx       # (New) Split UI
│   ├── lib/
│   │   ├── budget-db.ts                        # IndexedDB schema
│   │   ├── categorization/
│   │   │   ├── rules.ts                        # Rule-based categorization
│   │   │   └── ml-model.ts                     # (New) TensorFlow.js model
│   │   └── parsers/
│   │       └── csv-parser.ts                   # BMO/Home Trust parsers
│   └── types/
│       └── budget.ts                           # TypeScript definitions
├── public/
│   ├── manifest.json                           # (New) PWA manifest
│   ├── sw.js                                   # (New) Service worker
│   └── icons/
│       ├── icon-192.png                        # (New) PWA icons
│       └── icon-512.png
├── .claude/
│   ├── Skills/
│   │   └── design-guide.md                     # Internal design standards
│   └── agent-routing-config.json               # Agent assignments
└── tests/
    ├── unit/
    │   └── components/                         # Jest tests
    └── e2e/
        └── budget-app.spec.ts                  # Playwright tests
```

---

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
