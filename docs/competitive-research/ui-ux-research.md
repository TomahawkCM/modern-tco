# Mobile-First UI/UX Research & Design Guide

> **Date:** 2026-02-14
> **Purpose:** Comprehensive mobile-first UI/UX research for the budget app — design patterns, component strategies, and best practices for a browser-based PWA supporting 114 languages, 72+ currencies, full RTL, and WCAG 2.1 AA accessibility.
> **Builds on:** [competitor-analysis.md](./competitor-analysis.md), [market-trends.md](./market-trends.md), [our-position.md](./our-position.md)

---

## Table of Contents

1. [Competitor UI Analysis](#1-competitor-ui-analysis)
2. [Navigation Patterns](#2-navigation-patterns)
3. [Bottom Sheet & Drawer Patterns](#3-bottom-sheet--drawer-patterns)
4. [Gesture & Touch Interactions](#4-gesture--touch-interactions)
5. [Skeleton Loading & Perceived Performance](#5-skeleton-loading--perceived-performance)
6. [Micro-Interactions & Animations](#6-micro-interactions--animations)
7. [Data Visualization on Mobile](#7-data-visualization-on-mobile)
8. [Currency & Number Input](#8-currency--number-input)
9. [RTL & Internationalization UI](#9-rtl--internationalization-ui)
10. [PWA Native Feel](#10-pwa-native-feel)
11. [Accessibility on Mobile](#11-accessibility-on-mobile)
12. [Design System Recommendations](#12-design-system-recommendations)

---

## 1. Competitor UI Analysis

### Award-Winning Budget App Design Patterns

The top-performing budget apps share a design philosophy of **clarity, calm, and control**. Financial data is inherently stressful — the UI must reduce cognitive load, not add to it.

#### Copilot Money (Apple Design Award Finalist 2024)

Copilot's design philosophy centers on three pillars: clarity, control, and calm.

- **Daily Glanceable Summary**: The home screen shows a single daily digest — net cash flow, upcoming bills, and budget status — all above the fold. Users can assess their financial health in under 3 seconds.
- **Dark Mode First**: Copilot uses a dark canvas with high-contrast accent colors (teal/green for income, red for overspend). This maps directly to our existing `slate-950` background with `teal-400` accents.
- **Adaptive Budgets**: Budgets auto-adjust mid-month based on spending velocity. The UI communicates this through animated progress rings that change color as categories approach limits.
- **Genmoji Customization**: Users assign custom emoji to categories, making visual scanning of transaction lists instant. The emoji replaces generic category icons.
- **Dashboard Visualizations**: Cash flow charts use a simplified "waterfall" style — income in, expenses out, net remaining. No complex multi-axis charts on mobile.
- **Card-Based Layout**: Every data group is a discrete card with rounded corners, subtle shadows, and clear hierarchy. Cards use consistent 16px padding and 12px border-radius.

> _Source: Copilot Money (copilot.money), Apple Design Awards 2024 Finalists_

#### Monarch Money

- **Beautiful Modern Design**: Monarch pairs traditional envelope budgeting with a modern UI that feels premium. Clean typography, generous whitespace, and subtle gradient accents.
- **Flexible + Traditional**: Supports both zero-based (every dollar assigned) and flexible (just track limits) budgeting, toggled per-category. The UI adapts the budget card layout based on the chosen style.
- **AI Assistant**: Monarch's AI assistant uses a conversational UI embedded as a bottom sheet, not a full-screen takeover. Users ask natural language questions ("How much did I spend on dining this month?") and get inline chart responses.
- **Net Worth Dashboard**: A dedicated net worth tracking view with historical trend lines. The mobile view collapses detailed account tables into expandable accordion cards.

> _Source: Monarch Money (monarchmoney.com), Procreator Design fintech UX research_

#### Cleo (Engagement Champion)

- **20x Engagement via Chat-First UI**: Cleo's entire experience is built around a chat interface. Users interact with their finances through conversation rather than traditional forms and tables.
- **Personality-Driven "Roast Mode"**: Cleo can "roast" users for overspending, using humor to make financial awareness less painful. This opt-in tone is available alongside a supportive "Hype" mode.
- **Progressive Disclosure**: Complex features (credit building, savings goals, advance payday) surface only when relevant, through conversational prompts rather than persistent menu items.
- **Card-Based Transaction Feed**: Transactions render as chat bubbles with merchant logos, amounts, and one-tap categorization buttons.

> _Source: Cleo (meetcleo.com), Wavespace fintech UX report, NN/g engagement research_

#### Key UI Patterns Across All Leaders

| Pattern                        | Why It Works                                      | Our Status                                           |
| ------------------------------ | ------------------------------------------------- | ---------------------------------------------------- |
| Card-based layouts             | Discrete visual groups reduce cognitive load      | Partial — using cards in dashboard, need consistency |
| Progressive disclosure         | Shows complexity only when needed                 | Implemented in Sidebar seniors mode                  |
| One primary CTA above the fold | Drives engagement without choice paralysis        | FAB for quick transaction entry                      |
| Dark mode as default           | Reduces eye strain for finance apps (evening use) | Implemented — `defaultTheme="dark"`                  |
| Glanceable summaries           | Financial health in <3 seconds                    | Dashboard widgets exist, needs polish                |
| Conversational elements        | 20x engagement vs traditional UI                  | ChatbotWidget exists, needs expansion                |

### Recommendations

1. **Audit card consistency**: Ensure all data-bearing containers use a shared card component with consistent padding (16px), border-radius (12px), and glassmorphism treatment.
2. **Add daily glanceable summary**: The dashboard home should show a single "today" card above the fold — net cash flow, next bill due, budget health score.
3. **Expand chat UI**: Build on the existing `ChatbotWidget` to support inline chart responses and conversational budget queries.

---

## 2. Navigation Patterns

### Bottom Tab Bar: The Gold Standard

Research conclusively shows that bottom tab navigation outperforms all alternatives on mobile:

- **Redbooth case study**: After switching from a hamburger menu to a bottom tab bar, Redbooth saw a **65% increase in DAU** (daily active users) and a **70% jump in session time**. Users navigate more when tabs are visible.
- **Luke Wroblewski (ex-Google)**: "Obvious always wins" — navigation hidden behind a hamburger icon reduces discoverability by 50%+.
- **70% of app uninstalls** happen due to confusing navigation (AppMySite research, 2024).
- **Fitts's Law**: Bottom-of-screen targets are fastest to reach on mobile — thumb zone analysis shows the bottom 40% of the screen is the most accessible region.

> _Sources: Redbooth (via UX Collective), AppMySite mobile navigation study 2024, DesignStudioUIUX research, Acclaim Agency_

### The Hybrid Model

The optimal mobile navigation combines:

1. **Bottom tab bar** for 4-5 primary destinations (always visible)
2. **Hamburger/drawer** for secondary features (accessible but not cluttering)
3. **FAB (Floating Action Button)** for the single most important action

#### Our Current Implementation

Our app already follows this best-practice hybrid model:

- **Bottom tab bar** (`src/components/budget/layout/MobileNav.tsx`): 5 tabs — Home, Budget, Accounts, Activity, More
  - Uses `min-h-touch` for accessible touch targets (44px)
  - Uses `min-w-[64px]` for comfortable tap width
  - Fixed at bottom with `safe-area-inset-bottom` padding
  - Hidden on `md:` and above (tablet/desktop use sidebar)
  - Localized labels via `useTranslations("mobileNav")`

- **Sidebar drawer** (`src/app/budget-app/layout.tsx:152-168`): Full navigation for secondary features
  - Opens as a left `Sheet` on mobile
  - 21 navigation items in `Sidebar.tsx` with essential/secondary classification
  - Seniors mode reduces to 6 essential items

- **FAB** (`src/components/budget/layout/FloatingActionButton.tsx`): Quick transaction entry
  - Positioned with `insetInlineEnd` (RTL-aware)
  - Positioned above the bottom nav: `calc(env(safe-area-inset-bottom) + 72px)`
  - Hidden on `md:` and above

### Recommendations

1. **Haptic feedback on tab switch**: Add `navigator.vibrate(10)` on tab tap for tactile confirmation (supported on Android/Chrome, gracefully degrades on iOS).
2. **Animated active tab indicator**: Use a `motion.div` with `layoutId` (like the Sidebar's `activeNav` indicator at `Sidebar.tsx:254-259`) on the bottom tab bar for smooth tab-switching animation.
3. **Badge counts**: Add unread notification counts and pending transaction badges to relevant tabs (Activity tab especially).
4. **Contextual FAB**: Consider changing the FAB action based on the active tab (e.g., "Add Budget" on Budget tab, "Add Account" on Accounts tab).
5. **More tab**: The "More" tab should use a grid layout (2 columns of icon+label cells) rather than a traditional list, for faster scanning of secondary features.

### Anti-Patterns to Avoid

- **Hamburger-only navigation**: Reduces discoverability by 50%+ (our app correctly avoids this)
- **More than 5 bottom tabs**: Tabs become too small to tap accurately; 5 is the maximum
- **Swipe-between-tabs**: Conflicts with horizontal swipe gestures on content (swipe-to-delete, carousel navigation)
- **Dynamic tab order**: Users build muscle memory for tab positions; never rearrange

---

## 3. Bottom Sheet & Drawer Patterns

### Vaul: The iOS-Native Bottom Sheet for Web

Our app already has Vaul installed (`src/components/ui/drawer.tsx`) — the leading bottom sheet library for React. Vaul provides:

- **Physics-based animations**: Spring-driven open/close that matches iOS sheet behavior
- **Snap points**: Configurable resting positions (e.g., peek, half, full)
- **Nested scrolling**: Proper scroll container handling inside sheets
- **Background scaling**: `shouldScaleBackground` creates the iOS "stacked cards" effect (enabled by default in our drawer)
- **Accessibility**: Full keyboard and screen reader support

> _Source: Vaul (github.com/emilkowalski/vaul), shadcn/ui documentation_

### The Responsive Modal Pattern

shadcn/ui recommends a specific responsive pattern that we should adopt:

```
Mobile (< 768px): Use Drawer (bottom sheet)
Desktop (>= 768px): Use Dialog (centered modal)
```

This is the **ResponsiveModal** pattern — the same action shows as a bottom-sliding drawer on mobile and a centered dialog on desktop. Users get the best interaction for their device.

#### Our Current State

- `src/components/budget/ui/BottomSheet.tsx`: Uses `Sheet` (Radix Dialog) with `side="bottom"` on mobile and `side="right"` on desktop. Implements swipe-to-dismiss via Framer Motion's `drag="y"` with a dismiss threshold of 100px.
- **Gap**: Does not use Vaul's snap points. The existing implementation wraps Radix Sheet with manual gesture handling, when Vaul provides this natively with better physics.

### Snap Point Patterns

iOS-style snap points for different use cases:

| Snap Point      | Height               | Use Case                                        |
| --------------- | -------------------- | ----------------------------------------------- |
| **Quick Peek**  | 148px (fixed)        | Transaction detail preview, quick actions       |
| **Half Screen** | 0.5 (50%)            | Filter panels, category picker, settings        |
| **Full Height** | 1 (100% - safe area) | Transaction editing, long forms, search results |

Example configuration with Vaul:

```tsx
<Drawer snapPoints={[148, 0.5, 1]} fadeFromIndex={1}>
```

### When to Use Each Pattern

| Component              | Mobile               | Desktop       | Example                     |
| ---------------------- | -------------------- | ------------- | --------------------------- |
| **Transaction detail** | Drawer (peek → full) | Right panel   | Tap a transaction           |
| **Quick categorize**   | Drawer (half)        | Popover       | Swipe action on transaction |
| **Filter panel**       | Drawer (half → full) | Sidebar panel | Filter transactions/reports |
| **Settings toggle**    | Drawer (peek)        | Dialog        | Quick preference change     |
| **New transaction**    | Drawer (full)        | Dialog        | FAB → entry form            |
| **Confirmation**       | Drawer (peek)        | Alert Dialog  | Delete confirmation         |
| **Search results**     | Drawer (half → full) | Inline        | Command palette results     |

### Recommendations

1. **Create `ResponsiveModal` wrapper**: Compose Vaul `Drawer` + Radix `Dialog` into a single component that switches based on `useDeviceClass()` from `src/lib/breakpoints.ts`.
2. **Upgrade BottomSheet.tsx**: Replace the manual Framer Motion drag handling with Vaul's native snap points and gesture system. Keep the `showDragHandle` prop but use Vaul's built-in handle.
3. **Add snap point presets**: Export standard snap configs (`SNAP_PEEK`, `SNAP_HALF`, `SNAP_FULL`) for consistent sheet heights across the app.
4. **Handle safe areas**: Full-height drawers must account for `env(safe-area-inset-top)` and `env(safe-area-inset-bottom)` to avoid content behind the status bar or home indicator.

---

## 4. Gesture & Touch Interactions

### Swipe Actions for Transaction Lists

Swipeable list items are the primary touch gesture in financial apps. Users expect to perform quick actions without opening a detail view.

#### Motion (Framer Motion) Swipe Patterns

Framer Motion (already in use — `src/components/budget/layout/Sidebar.tsx` imports it for `motion` and `layoutId`) provides the foundation for swipe interactions:

- **Drag constraints**: `dragConstraints={{ left: -150, right: 150 }}` limits swipe distance
- **Velocity-based triggers**: `onDragEnd` with `info.velocity.x > 500` triggers the action
- **Spring animations**: `transition={{ type: "spring", stiffness: 300, damping: 30 }}` for snappy return
- **Visual feedback**: Reveal action buttons behind the swiped row with opacity tied to drag offset

> _Source: Motion.dev iOS-style swipe tutorial, Framer Motion documentation_

#### Recommended Swipe Actions

| Direction           | Action        | Visual Cue                     |
| ------------------- | ------------- | ------------------------------ |
| Swipe left (short)  | Categorize    | Category icon + name revealed  |
| Swipe left (full)   | Archive/Hide  | Gray background slides in      |
| Swipe right (short) | Mark reviewed | Checkmark revealed             |
| Swipe right (full)  | Delete        | Red background with trash icon |

### Pull-to-Refresh

For syncing transaction data (Supabase or bank connections):

- Use `onDragEnd` with `drag="y"` and `dragConstraints={{ top: 0 }}` on the transaction list container
- Show a circular progress indicator that completes as the pull distance increases
- Trigger refresh when pull distance exceeds 80px
- Disable during active sync to prevent double-fetches

### Drag-and-Drop

Already partially implemented in the widget grid (`src/dashboard/widgets/WidgetGrid.tsx`). Extend for:

- **Budget category reordering**: Long-press to enter reorder mode, drag categories to reprioritize
- **Account ordering**: Drag accounts to set display order on the accounts page
- **Dashboard widget arrangement**: Already supported — ensure touch handles are 44px minimum

### Touch Target Standards

| Standard         | Minimum Size | Our Implementation                   |
| ---------------- | ------------ | ------------------------------------ |
| Apple HIG        | 44×44 px     | MobileNav: `min-h-touch` (44px)      |
| Material Design  | 48×48 dp     | —                                    |
| WCAG 2.5.8 (AAA) | 44×44 CSS px | —                                    |
| Our Seniors Mode | 52×52 px     | Sidebar: `min-h-[52px]` via `py-3.5` |

### Long-Press Context Menu

For power-user actions that don't warrant a swipe:

- Long-press on a transaction → context menu with: Edit, Split, Duplicate, Add Note, Delete
- Long-press on a budget category → context menu with: Edit Limit, Reset, Hide, Reorder
- Use `onPointerDown` + `setTimeout(500ms)` + `onPointerUp` cancellation pattern
- Trigger `navigator.vibrate(15)` at menu open for haptic confirmation

### Recommendations

1. **Build `SwipeableListItem` component**: Generic swipeable row with configurable left/right actions, using Framer Motion drag. Used for transactions, subscriptions, and recurring items.
2. **Implement pull-to-refresh**: Add to the transaction list and dashboard for manual data sync.
3. **Add long-press context menus**: Provide secondary actions without cluttering the visible UI.
4. **Respect `prefers-reduced-motion`**: Replace swipe animations with instant slide or tap-to-reveal alternatives when motion is reduced.

---

## 5. Skeleton Loading & Perceived Performance

### Why Skeletons Matter

Skeleton screens reduce **perceived loading time by 20-67%** compared to spinners or blank screens. They create the illusion that content is loading progressively, reducing user anxiety.

- **NN/g research**: Users perceive skeleton-loaded interfaces as 35% faster than spinner-loaded ones, even with identical actual load times.
- **LogRocket study**: Skeleton screens maintain user attention during load, reducing bounce rates by up to 15% on data-heavy pages.
- **Psychological basis**: Skeletons leverage the "endowed progress effect" — users feel the task (loading) is partially complete before any content arrives.

> _Sources: NN/g perceived performance research, LogRocket skeleton loading guide, freeCodeCamp UI loading patterns, Clay.global skeleton UX study_

### Skeleton Types

| Type        | Animation                                | Best For                          |
| ----------- | ---------------------------------------- | --------------------------------- |
| **Shimmer** | Left-to-right gradient slide             | Text content, transaction lists   |
| **Pulse**   | Opacity fade (0.5 → 1 → 0.5)             | Images, charts, avatars           |
| **Wave**    | Sequential shimmer across multiple items | Card grids, dashboards            |
| **None**    | Static gray boxes                        | `prefers-reduced-motion` fallback |

### Our Current State

- **shadcn/ui Skeleton** (`src/components/ui/skeleton.tsx`): Already installed, provides the base `Skeleton` component with pulse animation.
- **React 19 Suspense**: Available for wrapping lazy-loaded components with skeleton fallbacks.

### Finance-Specific Skeleton Patterns

#### Transaction List Row

```
┌─────────────────────────────────────────┐
│ [●●] ████████████████  ██████████  ████ │
│      ████████████                       │
└─────────────────────────────────────────┘
```

Circle (merchant icon) + two lines (merchant name, date) + amount right-aligned.

#### Balance Card

```
┌─────────────────────────────────────────┐
│ ████████                                │
│ ██████████████████                      │
│ ████████████████████████████  ← bar     │
└─────────────────────────────────────────┘
```

Short label + large amount + progress bar.

#### Chart Placeholder

```
┌─────────────────────────────────────────┐
│ ████████          (title)               │
│                                         │
│   ▐█▌  ▐██▌  ▐█▌  ▐███▌  ▐██▌  ▐█▌    │
│   ─────────────────────────────────     │
│   ████  ████  ████  ████  ████  ████    │
└─────────────────────────────────────────┘
```

Title skeleton + bar chart placeholders + axis label skeletons.

### Implementation Strategy

1. **Suspense boundaries**: Wrap each page section with `<Suspense fallback={<SectionSkeleton />}>` using React 19's streaming SSR.
2. **Lazy charts**: All chart components should be `dynamic(() => import(...), { ssr: false })` with chart-specific skeleton fallbacks.
3. **Skeleton timing**: Show skeletons for minimum 200ms to avoid flash; maximum 3 seconds before showing error state.
4. **Progressive loading**: Dashboard should load in this order:
   - Instant: Navigation shell, header, tab bar (from layout — already SSR'd)
   - Fast (<500ms): Balance cards, budget summary (lightweight queries)
   - Deferred (<2s): Charts, transaction list, analytics widgets (heavy queries)

### Recommendations

1. **Create `SkeletonPage` templates**: Pre-built skeleton layouts for Dashboard, Transactions, Budgets, and Reports pages.
2. **Add shimmer variant**: Extend the shadcn Skeleton with a shimmer animation option (CSS `@keyframes shimmer` with `background: linear-gradient`).
3. **Target <2s dashboard load**: On low-end smartphones (Moto G Power class), the dashboard should render meaningful content within 2 seconds. Use skeleton bridges for anything slower.
4. **Skeleton for modals/sheets**: When a bottom sheet opens and needs to fetch data, show a skeleton inside the sheet immediately rather than delaying the sheet open.

---

## 6. Micro-Interactions & Animations

### Why Micro-Interactions Matter in Finance

Financial actions are inherently stressful — transferring money, categorizing expenses, and reviewing budgets involve real consequences. Micro-interactions provide:

- **Confirmation**: Visual + haptic feedback confirms the action was registered
- **Anxiety reduction**: Smooth animations make the app feel stable and predictable
- **Delight in small moments**: Celebrating savings milestones turns a chore into motivation

> _Sources: NN/g micro-interaction research, Interaction Design Foundation emotion in UX, UXPin financial UX patterns_

### Haptic Feedback

Use `navigator.vibrate()` (Web Vibration API) for tactile confirmation:

| Action             | Vibration Pattern                              | Fallback (no vibration)    |
| ------------------ | ---------------------------------------------- | -------------------------- |
| Transaction saved  | `vibrate(15)` — single short tap               | Toast notification         |
| Budget limit saved | `vibrate(15)` — single short tap               | Toast notification         |
| Category assigned  | `vibrate(10)` — light tap                      | Inline checkmark animation |
| Payment completed  | `vibrate([15, 50, 15])` — double tap           | Success animation          |
| Delete confirmed   | `vibrate(25)` — firm tap                       | Toast with undo            |
| Error occurred     | `vibrate([30, 50, 30, 50, 30])` — triple pulse | Shake animation            |
| Milestone reached  | `vibrate([15, 30, 15, 30, 50])` — celebration  | Confetti animation         |

**Note**: iOS Safari does not support the Vibration API. Always provide visual fallbacks. The haptic patterns above are Android/Chrome enhancements.

### Toast Notifications

Already have `ToastProvider` (`src/components/budget/Toast.tsx`). Ensure toasts follow these patterns:

- **Success**: Green accent, checkmark icon, auto-dismiss after 3s
- **Info**: Blue accent, info icon, auto-dismiss after 4s
- **Warning**: Amber accent, warning icon, auto-dismiss after 5s (or manual dismiss)
- **Error**: Red accent, error icon, stays until dismissed, includes retry action
- **Undo**: All destructive actions (delete, categorize) show toast with "Undo" button for 5 seconds

### Celebration Animations

Already have a gamification engine (`src/lib/budget-gamification.ts`) and celebration library (`src/lib/celebration.ts`). Trigger animations for:

- Staying under budget for a full month → confetti burst
- Reaching a savings goal → fireworks + badge unlock
- Paying off a debt → checkmark animation + streak counter
- 7-day streak of logging expenses → streak flame animation

### Framer Motion Animation Principles for Finance

The animations must be **calm and professional** — not flashy or playful:

| Animation Type  | Duration               | Easing                                   | Use Case               |
| --------------- | ---------------------- | ---------------------------------------- | ---------------------- |
| Page transition | 200-300ms              | `ease-out`                               | Route changes          |
| Modal open      | 250ms                  | `spring { stiffness: 300, damping: 30 }` | Sheet/dialog open      |
| Modal close     | 200ms                  | `ease-in`                                | Sheet/dialog close     |
| List item enter | 150ms (staggered 30ms) | `ease-out`                               | Transaction list load  |
| List item exit  | 100ms                  | `ease-in`                                | Swipe-to-delete        |
| Progress bar    | 500-800ms              | `ease-in-out`                            | Budget bar fill        |
| Number counter  | 400ms                  | `ease-out`                               | Balance amount change  |
| Layout shift    | 200ms                  | `spring { stiffness: 500, damping: 35 }` | Reorder, layout change |

### Shared Layout Animations

The Sidebar already uses `motion.div` with `layoutId="activeNav"` (`src/components/budget/layout/Sidebar.tsx:254-259`) for smooth active-state transitions. Extend this pattern to:

- Bottom tab active indicator
- Card expand/collapse transitions
- Page-level route transitions (shared header elements)

### Respecting User Preferences

```tsx
// Always check for reduced motion preference
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// In Framer Motion
<motion.div
  animate={{ opacity: 1, y: 0 }}
  transition={prefersReducedMotion ? { duration: 0 } : { type: "spring" }}
/>;
```

Our `AccessibilityQuickToggle` already includes a "Reduce Motion" toggle (`settings.reduceMotion`) — ensure all animations check this setting.

### Recommendations

1. **Create `useHaptic()` hook**: Wraps `navigator.vibrate()` with pattern presets and respects the reduce-motion setting.
2. **Animated number transitions**: Use a `AnimatedNumber` component for balance displays that smoothly counts between values.
3. **Staggered list animations**: Transaction list items should animate in with 30ms stagger for a polished "waterfall" effect.
4. **Consistent spring configs**: Export shared spring configurations (`SPRING_SNAPPY`, `SPRING_GENTLE`, `SPRING_BOUNCY`) for consistent animation feel.

---

## 7. Data Visualization on Mobile

### Mobile Chart Challenges

Charts on mobile face unique constraints: small screens, touch interactions (not hover), varying text sizes, and the need for instant comprehension.

> _Sources: Recharts documentation, embeddable.com mobile chart best practices, Syncfusion responsive chart guide_

### Our Current State

- **Recharts** via `src/components/ui/chart.tsx`: Already installed with `<ResponsiveContainer>` for auto-sizing.
- Used in dashboard widgets, budget views, and reports.

### Mobile Chart Best Practices

#### 1. Simplify Data Granularity

| Desktop                  | Mobile                         | Why                                       |
| ------------------------ | ------------------------------ | ----------------------------------------- |
| Daily data points        | Weekly/monthly aggregates      | Too many bars/points on small screens     |
| Multi-series line charts | Single-series or stacked bars  | Multiple overlapping lines are unreadable |
| Detailed legends         | Inline labels or tap-to-reveal | Legends consume valuable screen space     |
| Full axis labels         | Abbreviated (Jan, Feb...)      | Long labels overlap on narrow screens     |

#### 2. Touch-Friendly Interactions

- **Replace hover tooltips with tap**: On mobile, `onMouseEnter` doesn't exist. Use `onClick` on data points to show tooltip popover.
- **Minimum tap target**: Data points need at least 44px hit areas — use `activeDot={{ r: 22 }}` in Recharts line charts.
- **Pinch-to-zoom**: For time-series charts spanning long periods, support pinch-zoom to drill into date ranges.
- **Swipe between periods**: Left/right swipe to navigate between months or quarters on the chart.

#### 3. Progressive Disclosure for Charts

```
Level 1 (visible): Summary StatCards showing key metrics (totals, averages, trends)
Level 2 (tap to expand): Simple bar/donut chart with key breakdowns
Level 3 (drill down): Full interactive chart with date range picker and filters
```

This matches the competitor pattern — Copilot and Monarch both show summary numbers first, then reveal charts on interaction.

### Chart Types by Use Case

| Use Case            | Recommended Chart          | Why                             |
| ------------------- | -------------------------- | ------------------------------- |
| Monthly spending    | Horizontal bar             | Easy to compare categories      |
| Budget vs actual    | Progress bar / gauge       | Instant visual — over or under? |
| Spending trend      | Area chart (single series) | Shows direction clearly         |
| Income vs expenses  | Stacked bar (2 series)     | Clear comparison                |
| Category breakdown  | Donut chart                | Part-of-whole at a glance       |
| Net worth over time | Line chart                 | Trend is the story              |
| Cash flow           | Waterfall chart            | Income in, expenses out, net    |

### Performance Optimization

- **Lazy load all charts**: `dynamic(() => import("./SpendingChart"), { ssr: false })` — charts are heavy and not needed for initial render.
- **Memoize chart data**: Use `useMemo` to prevent re-computation on every render:
  ```tsx
  const chartData = useMemo(() => computeChartData(transactions), [transactions]);
  ```
- **Limit data points**: Cap at 30-50 data points on mobile. Aggregate beyond that.
- **Canvas renderer**: For charts with 100+ data points, consider canvas-based rendering over SVG for smoother performance on low-end devices.

### Dark Mode Chart Theming

Charts must maintain sufficient contrast in dark mode:

- Axis lines: `stroke: "hsl(var(--muted-foreground))"`
- Grid lines: `stroke: "hsl(var(--border))"` at 0.3 opacity
- Bar/area fills: Use the app's teal/blue gradient palette
- Text: Use `hsl(var(--foreground))` for labels, never hardcoded colors
- Ensure 4.5:1 contrast ratio between data series and background (WCAG AA)

### Recommendations

1. **Create `ChartCard` wrapper**: Combines a stat summary header + lazy-loaded chart + skeleton loading state in a single reusable component.
2. **Add tap-to-tooltip**: Replace hover behavior with tap on all mobile charts.
3. **Summary-first layout**: Dashboard shows `StatCard` components above the fold; charts render below the fold with intersection-observer-triggered lazy loading.
4. **Responsive chart switching**: Use `useDeviceClass()` to render simplified charts on phone vs. detailed charts on desktop.

---

## 8. Currency & Number Input

### The Input Problem

Currency input is one of the hardest mobile UX challenges. Browser-native `<input type="number">` is fundamentally broken for currencies:

- No formatting (no thousands separators, no currency symbol placement)
- Inconsistent keyboard across browsers and OSes
- `step` attribute causes unexpected validation behavior
- No support for locale-aware decimal separators (`,` vs `.`)
- No support for zero-decimal currencies (JPY, KRW, VND)

> _Sources: freeCodeCamp currency input patterns, react-currency-input-field documentation, @react-input/number-format documentation_

### Recommended Approach

Use `<input type="text" inputMode="decimal">` with custom formatting:

```tsx
<input
  type="text"
  inputMode="decimal" // Shows numeric keyboard WITH decimal point
  value={displayValue} // Formatted: "1,234.56" or "1.234,56"
  onChange={handleRawInput} // Store raw numeric value
  onFocus={showRawValue} // Remove formatting when editing
  onBlur={formatValue} // Re-format when done
/>
```

#### iOS Keyboard Quirk

- `inputMode="numeric"` on iOS shows `0-9` only — **no decimal point**.
- `inputMode="decimal"` on iOS shows `0-9` plus `.` — this is what we need for currency.
- On Android, both show a numeric keyboard with `.`.

### Library Options

#### Option A: `react-currency-input-field` (Recommended)

- Locale-aware formatting via `Intl.NumberFormat`
- `decimalsLimit` prop to handle zero-decimal currencies
- `intlConfig={{ locale, currency }}` for automatic formatting
- Prefix/suffix currency symbol placement
- 4.2KB gzipped, no dependencies

#### Option B: `@react-input/number-format`

- Uses `Intl.NumberFormat` directly for locale awareness
- Mask-style input (formats as you type)
- Supports `locales` prop for locale-aware separators
- 3.1KB gzipped

### Currency-Specific Formatting Rules

| Currency | Decimal Places | Separator           | Symbol Position  | Example                |
| -------- | -------------- | ------------------- | ---------------- | ---------------------- |
| USD, EUR | 2              | `.` or `,` (locale) | Prefix or suffix | $1,234.56 / 1.234,56 € |
| JPY      | 0              | `,`                 | Prefix           | ¥1,234                 |
| KRW      | 0              | `,`                 | Prefix           | ₩1,234                 |
| VND      | 0              | `.`                 | Suffix           | 1.234 ₫                |
| BHD, KWD | 3              | `.` or `,`          | Varies           | 1,234.567 BHD          |
| BTC      | 8              | `.`                 | Prefix           | ₿0.00123456            |

### Arabic/Hindi Numeral Systems

Our app supports 114 locales, many of which use non-Latin numerals:

- **Arabic-Indic**: ٠١٢٣٤٥٦٧٨٩ (ar-SA, ar-EG)
- **Extended Arabic-Indic**: ۰۱۲۳۴۵۶۷۸۹ (fa-IR, ur-PK)
- **Devanagari**: ०१२३४५६७८९ (hi-IN, ne-NP)
- **Thai**: ๐๑๒๓๔๕๖๗๘๙ (th-TH)
- **Bengali**: ০১২৩৪৫৬৭৮৯ (bn-BD, bn-IN)

Use `Intl.NumberFormat(locale).format(number)` for display, but **always store raw numeric values** internally. Our existing `Decimal.js` usage (required by CLAUDE.md) ensures precision.

### Input Pattern

```
User types → raw string "1234.56"
            → Decimal.js validates and stores
            → Intl.NumberFormat(locale, { style: "currency", currency }) formats for display
```

### Recommendations

1. **Build `CurrencyInput` component**: Wraps `react-currency-input-field` with our locale/currency context from `next-intl`. Auto-detects decimal places from ISO 4217 currency code.
2. **Zero-decimal handling**: For JPY, KRW, VND — suppress decimal input entirely and use `decimalsLimit={0}`.
3. **Format on blur**: Show raw value during editing (easier to type) and formatted value when the field loses focus.
4. **Negative amounts**: Support negative input for refunds/credits with a clear visual treatment (red text, minus prefix).
5. **Calculator mode**: Consider a calculator-style input panel for transaction amounts (like Copilot) — large buttons, running total display, no keyboard.

---

## 9. RTL & Internationalization UI

### CSS Logical Properties: Mandatory

With 114 locales including Arabic (ar), Hebrew (he), Persian (fa), and Urdu (ur), **every layout property must use CSS logical properties**. Physical properties (`left`, `right`, `margin-left`, etc.) break in RTL.

> _Sources: MDN CSS Logical Properties, Flowbite RTL guide, tailwindcss-rtl plugin, React Aria RTL patterns_

### Tailwind CSS Logical Property Mapping

| Physical (DO NOT USE) | Logical (USE THIS)     | Tailwind Class |
| --------------------- | ---------------------- | -------------- |
| `padding-left`        | `padding-inline-start` | `ps-*`         |
| `padding-right`       | `padding-inline-end`   | `pe-*`         |
| `margin-left`         | `margin-inline-start`  | `ms-*`         |
| `margin-right`        | `margin-inline-end`    | `me-*`         |
| `left`                | `inset-inline-start`   | `start-*`      |
| `right`               | `inset-inline-end`     | `end-*`        |
| `border-left`         | `border-inline-start`  | `border-s-*`   |
| `border-right`        | `border-inline-end`    | `border-e-*`   |
| `text-align: left`    | `text-align: start`    | `text-start`   |
| `text-align: right`   | `text-align: end`      | `text-end`     |
| `float: left`         | `float: inline-start`  | `float-start`  |
| `float: right`        | `float: inline-end`    | `float-end`    |

### Our Codebase RTL Audit

The codebase already uses some logical properties correctly:

- **Sidebar** (`Sidebar.tsx:109`): `border-e border-white/10` — correct, uses logical border
- **Sidebar active indicator** (`Sidebar.tsx:256`): `border-s-2 border-teal-500` — correct
- **FAB** (`FloatingActionButton.tsx:28`): `insetInlineEnd: "16px"` — correct, RTL-aware positioning
- **Collapse toggle** (`Sidebar.tsx:120`): `-end-3` — correct, uses logical positioning

**Areas needing attention:**

- Sheet component (`sheet.tsx:37-43`): Uses physical `left-0`, `right-0` in variants — these are for `inset-x` (horizontal) so actually correct for full-width sheets, but the `left`/`right` side variants should map to `start`/`end`.
- Any component using `ml-*`, `mr-*`, `pl-*`, `pr-*` should be audited and converted to `ms-*`, `me-*`, `ps-*`, `pe-*`.

### Setting `dir="rtl"` Dynamically

The `<html>` element must have `dir="rtl"` set dynamically based on locale. Our `next-intl` setup should handle this in the root layout:

```tsx
// In root layout.tsx
<html lang={locale} dir={isRTL(locale) ? "rtl" : "ltr"}>
```

RTL locales: `ar`, `he`, `fa`, `ur`, `ps`, `sd`, `yi`, `ku` (Sorani), `dv`, `ckb`

### Icon Mirroring

Directional icons must be mirrored in RTL:

| Icon Type          | Mirror in RTL? | Examples                                                   |
| ------------------ | -------------- | ---------------------------------------------------------- |
| Navigation arrows  | Yes            | `ChevronRight` → points left, `ChevronLeft` → points right |
| Back/forward       | Yes            | Browser back, breadcrumb arrows                            |
| Progress direction | Yes            | Progress bars, sliders                                     |
| Text alignment     | Yes            | Align-left icon → align-right                              |
| Non-directional    | No             | Search, settings, home, star, heart                        |
| Media controls     | No             | Play, pause, skip (universal)                              |

Mirror using CSS: `[dir="rtl"] .mirror-icon { transform: scaleX(-1); }` or Tailwind: `rtl:scale-x-[-1]`

### Arabic Typography

Arabic text requires special consideration:

- **Font size**: Increase 20-25% for visual balance with Latin text. Arabic characters are denser and smaller at the same pixel size.
- **Line height**: Increase to 1.8-2.0 for Arabic (vs 1.5 for Latin). Arabic diacritics need vertical space.
- **Font stacking**: Specify Arabic-optimized fonts before Latin fonts:
  ```css
  font-family: "IBM Plex Arabic", "IBM Plex Sans", system-ui, sans-serif;
  ```
- **Number direction**: In Arabic text, numbers are still LTR. CSS `unicode-bidi: embed` handles this correctly by default.

### Form Input RTL Handling

- **Labels**: Flow naturally with `dir` attribute — no special handling needed
- **Placeholder text**: Aligns to `text-start` (correct side for the locale)
- **Clear buttons**: Move from right to left automatically with `end-*` positioning
- **Chevrons**: Dropdown arrows swap sides via logical positioning
- **Currency symbols**: Some currencies place the symbol after the amount in certain locales (e.g., `1.234,56 €` in German vs `€1,234.56` in US English). Use `Intl.NumberFormat` — it handles this automatically.
- **Phone number inputs**: Always LTR regardless of locale (phone numbers are universal)

### Text Expansion

Different languages have vastly different text lengths for the same content:

| Language | Relative to English | Example ("Settings") |
| -------- | ------------------- | -------------------- |
| German   | 130-150%            | "Einstellungen"      |
| Finnish  | 130-170%            | "Asetukset"          |
| Arabic   | 125-140%            | "الإعدادات"          |
| Japanese | 60-80%              | "設定"               |
| Chinese  | 50-70%              | "设置"               |

**Design for 150% expansion**: All buttons, labels, and navigation items must accommodate text 50% longer than English without truncation or overflow.

### Recommendations

1. **Run RTL lint**: Add an ESLint rule or CI check that flags physical property usage (`ml-`, `mr-`, `pl-`, `pr-`, `left-`, `right-`) in Tailwind classes.
2. **Font scaling for Arabic**: Add a CSS custom property `--font-scale` that's set to `1.2` for Arabic/Hebrew locales, applied to base font size.
3. **Test with native speakers**: Automated RTL testing catches layout issues but misses semantic mirroring problems (e.g., a "forward" icon that reads as "backward" to an Arabic user).
4. **Bidirectional text**: Use `<bdi>` elements around user-generated content (merchant names, account names) that may mix LTR and RTL text.
5. **Text truncation**: Use `text-overflow: ellipsis` with `direction: inherit` — truncation must happen at the correct end for the locale.

---

## 10. PWA Native Feel

### Current PWA Infrastructure

Our app already has solid PWA foundations:

- **Service worker**: `usePWA()` hook registers the service worker (`src/hooks/usePWA.ts`)
- **iOS install banner**: `IOSInstallBanner` component prompts iOS users to add to home screen
- **PWA install prompt**: `PWAInstallPrompt` handles the `beforeinstallprompt` event for Android/Desktop
- **iOS state preservation**: `useIOSStatePreservation()` saves scroll position and route on iOS background/resume
- **Safe areas**: `env(safe-area-inset-*)` used throughout layout, MobileNav, and FAB

### Making a PWA Feel Native

The gap between "web app" and "native app" is smaller than ever, but specific patterns close it further:

> _Sources: web.dev PWA best practices, MDN Web App Manifest, Purrweb fintech app design guide_

#### 1. Display Mode

```json
// manifest.json
{
  "display": "standalone", // Hides browser chrome
  "orientation": "portrait" // Lock orientation for finance app
}
```

`standalone` mode removes the browser URL bar, making the app feel like a native install. Verify this is set in our web app manifest.

#### 2. Status Bar Theming

```html
<!-- iOS -->
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

<!-- Android -->
<meta name="theme-color" content="#020617" />
<!-- slate-950 -->
```

Match the status bar color to our app's dark background for a seamless top edge.

#### 3. Splash Screens

Apple requires specific icon sizes for splash screens on iOS PWAs. Generate splash images for all iOS device sizes (640x1136 through 1290x2796).

#### 4. Offline Indicator

Users must know when they're offline and what actions are queued:

```
┌─────────────────────────────────────────┐
│ ⚠ You're offline · 3 actions pending    │
│ Changes will sync when connected   [×]  │
└─────────────────────────────────────────┘
```

- Show a persistent bar at the top (below header) when `navigator.onLine === false`
- Queue offline actions (transaction add, categorize, delete) in IndexedDB
- Show pending action count
- Auto-sync when connection restores with merge conflict resolution

#### 5. App-Like Page Transitions

Use Framer Motion `AnimatePresence` + `layoutId` for shared-element transitions between pages:

```tsx
// Shared element: a transaction card expands into a detail view
<motion.div layoutId={`transaction-${id}`}>
  {/* Card content on list page, Detail content on detail page */}
</motion.div>
```

This creates the "zoom into detail" transition that native apps provide.

#### 6. Prevent Overscroll Bounce

```css
html,
body {
  overscroll-behavior: none; /* Prevents pull-to-refresh conflict + bounce */
}
```

This eliminates the "rubber band" bounce on iOS that makes web apps feel non-native. Only apply this on the outer body — allow overscroll within scroll containers where pull-to-refresh is desired.

#### 7. Disable Text Selection on UI Elements

```css
nav,
button,
[role="tab"],
.card-header {
  -webkit-user-select: none;
  user-select: none;
}
```

Native apps don't let you select navigation text or button labels. Apply selectively — never disable selection on content text (transaction descriptions, notes, etc.).

#### 8. Web App Install UX

- **Prompt timing**: Don't prompt on first visit. Wait until the user has completed at least 2 sessions or 3+ meaningful actions (added a transaction, created a budget).
- **Custom prompt**: Use a branded in-app prompt (not the browser default) explaining the benefits: "Add to Home Screen for faster access, offline support, and notifications."

### Recommendations

1. **Audit manifest.json**: Verify `display: standalone`, `theme_color: #020617`, proper icon sizes, and `orientation: portrait`.
2. **Build offline indicator**: A `<OfflineBanner />` component that detects connectivity and shows pending action count.
3. **Add shared-element transitions**: Use `layoutId` for transaction list → detail view transitions.
4. **Prevent overscroll**: Add `overscroll-behavior: none` to the body, with opt-in override for pull-to-refresh containers.
5. **Deferred install prompt**: Only show PWA install prompt after user has engaged with the app meaningfully (3+ actions or 2+ sessions).

---

## 11. Accessibility on Mobile

### Touch Target Compliance

Mobile accessibility starts with touch targets. Small targets cause misclicks, which is especially harmful in financial apps where a misclick could trigger the wrong transaction.

> _Sources: WCAG 2.1 SC 2.5.5, Apple HIG Touch Targets, Material Design accessibility guidelines_

| Standard          | Minimum Size            | Our Implementation                        |
| ----------------- | ----------------------- | ----------------------------------------- |
| WCAG 2.5.5 (AA)   | 44×44 CSS px            | MobileNav: `min-h-touch` + `min-w-[64px]` |
| WCAG 2.5.8 (AAA)  | 44×44 CSS px            | —                                         |
| Apple HIG         | 44×44 pt                | —                                         |
| Material Design 3 | 48×48 dp                | —                                         |
| Our Seniors Mode  | 52×52 px                | Sidebar: `min-h-[52px]` + `py-3.5`        |
| With spacing      | 8px gap between targets | MobileNav: `justify-around` provides this |

### Focus Management

Critical for keyboard and screen reader users:

- **Modal/Sheet focus trap**: When a Sheet or Drawer opens, focus must be trapped inside. Radix UI's Dialog (used in our Sheet) handles this automatically. Vaul (Drawer) also traps focus.
- **Focus restoration**: When a modal closes, focus must return to the trigger element. Both Radix and Vaul handle this.
- **Skip links**: Already implemented in `layout.tsx:119-125` — `<a href="#main-content">Skip to main content</a>` with focus-visible styling.
- **Tab order**: Ensure `tabIndex` follows visual order. Our `main` element has `tabIndex={0}` for skip link targeting.

### Screen Reader Support

- **Icon-only buttons**: Must have `aria-label`. Our FAB correctly has `aria-label="Add transaction"` (`FloatingActionButton.tsx:29`).
- **Live regions**: Dynamic content (balance updates, toast notifications, sync status) should use `aria-live="polite"` (or `"assertive"` for errors).
- **Route announcements**: When navigating between pages, announce the new page title to screen readers. Next.js handles this, but verify with VoiceOver/TalkBack.
- **Chart alternatives**: All charts must have a text alternative. Add `<table>` fallback or `aria-label` describing the chart data.
- **Financial amounts**: Screen readers should hear "one thousand two hundred thirty-four dollars and fifty-six cents" not "one two three four dot five six." Use `Intl.NumberFormat` with `style: "currency"` in `aria-label`.

### Motion Preferences

- **`prefers-reduced-motion`**: Already have a "Reduce Motion" toggle in `AccessibilityQuickToggle`. When active:
  - Replace spring animations with instant transitions (`duration: 0`)
  - Disable parallax effects and decorative animations
  - Keep functional animations (skeleton pulse, loading indicator) but simplify them
  - Replace swipe gestures with tap alternatives

- **`prefers-contrast`**: High contrast mode (also in our AccessibilityQuickToggle):
  - Increase border visibility from `border-white/10` to `border-white/30`
  - Replace subtle gradients with solid backgrounds
  - Ensure all text meets 7:1 contrast ratio (WCAG AAA)
  - Add visible focus indicators (already using `focus-visible:ring-2 ring-teal-500`)

### Seniors Mode (Already Implemented)

Our seniors mode (`src/contexts/SeniorsModeContext.tsx`) provides:

- **52px touch targets**: `min-h-[52px]` on navigation items
- **Simplified navigation**: Reduces 21 nav items to 6 essential items
- **Larger text**: Font size multiplier (1.0x, 1.25x, 1.5x)
- **Larger icons**: `h-6 w-6` instead of `h-5 w-5`
- **Toggle placement**: Prominent in mobile header via `AccessibilityQuickToggle compact`

### Recommendations

1. **Add `aria-live` regions**: For balance displays, toast container, and sync status bar.
2. **Chart text alternatives**: Add `role="img"` with descriptive `aria-label` to all chart containers, plus a visually-hidden data table.
3. **Screen reader currency formatting**: Use `Intl.NumberFormat` in `aria-label` attributes for all financial amounts.
4. **Keyboard testing**: Test full app navigation with keyboard only — ensure every interactive element is reachable and operable.
5. **VoiceOver/TalkBack testing**: Test critical flows (add transaction, view budget, change category) with iOS VoiceOver and Android TalkBack.

---

## 12. Design System Recommendations

### Component Architecture

Consolidate on **shadcn/ui + Vaul** as the mobile component layer. Our 58 installed shadcn components provide the base; the following additions create a complete mobile-first design system.

### Proposed Component Library

#### `ResponsiveModal`

**Purpose:** Drawer on mobile, Dialog on desktop (shadcn recommended pattern).

```tsx
// Usage
<ResponsiveModal open={open} onOpenChange={setOpen}>
  <ResponsiveModal.Header>
    <ResponsiveModal.Title>Edit Transaction</ResponsiveModal.Title>
  </ResponsiveModal.Header>
  <ResponsiveModal.Body>{/* form content */}</ResponsiveModal.Body>
  <ResponsiveModal.Footer>{/* action buttons */}</ResponsiveModal.Footer>
</ResponsiveModal>
```

- Uses `useDeviceClass()` from `src/lib/breakpoints.ts` internally
- Renders Vaul `Drawer` when `deviceClass === "phone"`
- Renders Radix `Dialog` when `deviceClass === "tablet" | "desktop"`
- Supports snap points on mobile: `snapPoints={[0.5, 1]}`

#### `SwipeableListItem`

**Purpose:** Framer Motion swipe actions for transaction rows.

- Left swipe: reveals action buttons (categorize, edit)
- Right swipe: reveals secondary actions (delete, archive)
- Full swipe: triggers primary action (configurable)
- Respects `prefers-reduced-motion` — falls back to tap-to-reveal
- Props: `leftActions`, `rightActions`, `onFullSwipeLeft`, `onFullSwipeRight`

#### `SkeletonPage`

**Purpose:** Page-level skeleton loading templates.

- Pre-built templates: `SkeletonDashboard`, `SkeletonTransactionList`, `SkeletonBudgetView`, `SkeletonReportView`
- Uses shimmer animation variant on skeleton elements
- Wraps with React 19 `Suspense` boundary
- Respects `prefers-reduced-motion` — uses static gray boxes instead of shimmer

#### `CurrencyInput`

**Purpose:** Locale-aware currency input with correct keyboard.

- Built on `react-currency-input-field`
- Auto-detects decimal places from ISO 4217 currency code
- Uses `inputMode="decimal"` for correct mobile keyboard
- Formats on blur, raw on focus
- Supports zero-decimal currencies (JPY, KRW, VND)
- Integrates with `next-intl` for locale detection

#### `StatCard`

**Purpose:** Glanceable metric cards for dashboard.

Already partially exists as `src/components/budget/StatCard.tsx`. Standardize with:

- Title + metric + trend indicator (up/down arrow + percentage)
- Optional sparkline (tiny inline chart)
- Skeleton loading state
- Tap to drill down (navigates to detail view)
- Consistent card styling: glass-surface, 16px padding, 12px border-radius

#### `ChartCard`

**Purpose:** Responsive chart with skeleton loading and lazy mount.

- Wraps Recharts charts with `Suspense` and chart-specific skeleton
- Lazy loads chart component with `dynamic(() => import(...))`
- Shows `StatCard` summary above chart
- Switches to simplified chart variant on phone
- Intersection observer for below-fold lazy rendering
- Memoizes chart data to prevent re-renders

### Color System

Already using a dark-mode-first palette:

| Token                | Value                   | Usage                         |
| -------------------- | ----------------------- | ----------------------------- |
| `--background`       | `slate-950` (#020617)   | App background                |
| `--foreground`       | `slate-200` (#e2e8f0)   | Primary text                  |
| `--muted`            | `slate-800` (#1e293b)   | Card backgrounds              |
| `--accent`           | `teal-400` (#2dd4bf)    | Primary accent, active states |
| `--accent-secondary` | `blue-500` (#3b82f6)    | Gradient endpoints            |
| `--success`          | `emerald-400` (#34d399) | Income, positive trends       |
| `--destructive`      | `red-400` (#f87171)     | Overspend, delete actions     |
| `--warning`          | `amber-400` (#fbbf24)   | Approaching limit             |

Ensure all accent colors meet **4.5:1** contrast against the background (WCAG AA text) and **3:1** for large text/UI components.

### Typography Scale

Use `clamp()` for fluid typography that scales with viewport width, eliminating breakpoint jumps:

| Level     | Size | clamp()                           | Usage                     |
| --------- | ---- | --------------------------------- | ------------------------- |
| Display   | 36px | `clamp(1.75rem, 4vw, 2.25rem)`    | Dashboard balance         |
| Heading 1 | 28px | `clamp(1.5rem, 3vw, 1.75rem)`     | Page titles               |
| Heading 2 | 22px | `clamp(1.25rem, 2.5vw, 1.375rem)` | Section headers           |
| Heading 3 | 18px | `clamp(1rem, 2vw, 1.125rem)`      | Card titles               |
| Body      | 16px | `1rem` (fixed)                    | Content text              |
| Caption   | 14px | `0.875rem` (fixed)                | Labels, metadata          |
| Small     | 12px | `0.75rem` (fixed)                 | Tertiary text, timestamps |

Body and smaller text should NOT use fluid scaling — readability at small sizes requires fixed values.

Apply the seniors mode font size multiplier (`settings.fontSizeMultiplier`: 1.0, 1.25, 1.5) on top of these base sizes.

### Spacing System

Already using Tailwind's 4px-based scale (`p-1` = 4px, `p-2` = 8px, etc.):

| Token    | Value      | Usage                                    |
| -------- | ---------- | ---------------------------------------- |
| `gap-xs` | 4px (p-1)  | Between icon and label                   |
| `gap-sm` | 8px (p-2)  | Between list items, card content spacing |
| `gap-md` | 16px (p-4) | Card padding, section spacing            |
| `gap-lg` | 24px (p-6) | Page section gaps                        |
| `gap-xl` | 32px (p-8) | Major section separation                 |

### Touch-First Form Controls

Mobile forms need:

- **Larger tap targets**: All form controls minimum 44px height
- **Clear labels**: Label above the input (not floating/inline — floating labels cause accessibility issues and text truncation in long translations)
- **Inline validation**: Show errors below the field immediately, not on submit. Use `aria-describedby` to associate error messages.
- **Auto-advance**: After selecting from a dropdown, auto-advance focus to the next field
- **Smart defaults**: Pre-fill based on context (last used category, current date, most common currency)
- **Sticky submit button**: On long forms, keep the primary action button fixed at the bottom of the viewport

### Animation Tokens

Export shared spring configurations for consistent feel:

| Token           | Config                               | Usage                            |
| --------------- | ------------------------------------ | -------------------------------- |
| `SPRING_SNAPPY` | `{ stiffness: 500, damping: 35 }`    | Layout shifts, tab switches      |
| `SPRING_GENTLE` | `{ stiffness: 200, damping: 25 }`    | Page transitions, card expand    |
| `SPRING_BOUNCY` | `{ stiffness: 300, damping: 15 }`    | Celebrations, attention grabbers |
| `EASE_STANDARD` | `{ duration: 0.2, ease: "easeOut" }` | Fade, opacity changes            |
| `NONE`          | `{ duration: 0 }`                    | Reduced motion fallback          |

### Implementation Priority

| Priority | Component                | Effort | Impact                                            |
| -------- | ------------------------ | ------ | ------------------------------------------------- |
| **P0**   | `ResponsiveModal`        | Medium | Every modal/sheet in the app benefits             |
| **P0**   | `CurrencyInput`          | Medium | Core to transaction entry — most used interaction |
| **P1**   | `SwipeableListItem`      | Medium | Transaction list — most viewed screen             |
| **P1**   | `SkeletonPage` templates | Low    | Perceived performance on every page               |
| **P1**   | `StatCard` (standardize) | Low    | Dashboard — first impression                      |
| **P2**   | `ChartCard`              | Medium | Reports and budget views                          |
| **P2**   | Animation tokens         | Low    | Consistency across all animations                 |
| **P3**   | RTL lint rule            | Low    | Prevents regression as codebase grows             |

---

## Sources

### Competitor Analysis

- Copilot Money — copilot.money (Apple Design Award Finalist 2024)
- Monarch Money — monarchmoney.com
- Cleo — meetcleo.com

### UX Research & Methodology

- NN/g (Nielsen Norman Group) — Mobile UX, perceived performance, micro-interactions
- UXPin — Financial UX patterns, dashboard design
- Interaction Design Foundation — Emotion in UX, Fitts's Law
- Luke Wroblewski — "Obvious Always Wins" navigation research

### Mobile Navigation Research

- Redbooth bottom tab bar case study (via UX Collective)
- AppMySite — "70% of app uninstalls" mobile navigation research (2024)
- DesignStudioUIUX — Mobile navigation patterns comparison
- Acclaim Agency — Tab bar vs hamburger menu analysis

### Skeleton & Performance

- LogRocket — Skeleton loading guide, perceived performance
- freeCodeCamp — UI loading patterns
- Clay.global — Skeleton UX study

### Fintech UX Guides

- Wavespace — Fintech mobile UX best practices
- Procreator Design — Finance app UI/UX research
- Purrweb — Fintech app design patterns
- Webstacks — SaaS mobile-first design
- ANODA — Banking app UX research

### Component & Library Documentation

- Motion.dev / Framer Motion — Animation, gesture, swipe tutorials
- Vaul (github.com/emilkowalski/vaul) — Bottom sheet documentation
- shadcn/ui — Component patterns, responsive modal recommendation
- Radix UI — Accessible primitive documentation
- Recharts — Chart library documentation
- react-currency-input-field — Currency input component
- @react-input/number-format — Locale-aware number formatting

### RTL & Internationalization

- MDN — CSS Logical Properties reference
- Flowbite — RTL Tailwind CSS guide
- tailwindcss-rtl — Plugin documentation
- React Aria — RTL accessibility patterns

### PWA & Web Standards

- web.dev — PWA best practices, Web App Manifest
- MDN — Service Workers, Vibration API, Web App Manifest
- Apple Developer — Safari PWA capabilities, status bar styling

### Accessibility

- WCAG 2.1 — Success Criteria 2.5.5 (Target Size), 2.4.1 (Bypass Blocks)
- Apple HIG — Touch target guidelines
- Material Design 3 — Accessibility guidelines
- Syncfusion — Accessible chart patterns
