# Budget App Plan — Expansion Sections

> These sections should be merged into `BUDGET_APP_AUTHORITATIVE_PLAN.md` at the indicated insertion points.

---

## INSERT AFTER: "Architecture Overview" section, BEFORE: "Pre-Phase 0"

---

## UI/UX Design System ("Cyber-Soft")

### Design Philosophy

"Cyber-Soft" — the high-security confidence of ProtonMail combined with the emotional engagement of modern fintech. Every screen communicates: "Your data is locked down, but managing it feels delightful."

### Color System (Mantine Custom Theme)

```typescript
// theme/budget-theme.ts
import { createTheme, MantineColorsTuple } from "@mantine/core";

const income: MantineColorsTuple = [
  "#E3F8FF",
  "#B5ECFF",
  "#7DDBFF",
  "#45C8FF",
  "#1AB5FF",
  "#0099E6",
  "#007ACC",
  "#005C99",
  "#003D66",
  "#001F33",
];
const expense: MantineColorsTuple = [
  "#FFE3F0",
  "#FFB5D4",
  "#FF7DB5",
  "#FF4596",
  "#FF1A7A",
  "#E6005E",
  "#CC0052",
  "#990040",
  "#66002B",
  "#330015",
];
const savings: MantineColorsTuple = [
  "#E3FFF0",
  "#B5FFD9",
  "#7DFFBE",
  "#45FFA3",
  "#1AFF88",
  "#00E66E",
  "#00CC62",
  "#009949",
  "#006631",
  "#003318",
];

export const budgetTheme = createTheme({
  primaryColor: "teal",
  colors: { income, expense, savings },
  fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
  fontFamilyMonospace: "JetBrains Mono, Fira Code, monospace",
  defaultRadius: "md",
  cursorType: "pointer",
  respectReducedMotion: true,
  other: {
    seniorsFontMultiplier: 1.0, // 1.25 in Seniors Mode
    seniorsMinTouchTarget: "52px", // 44px standard WCAG
  },
});
```

### Typography Scale

| Use                   | Font           | Size            | Weight | Line Height |
| --------------------- | -------------- | --------------- | ------ | ----------- |
| Page title            | Inter          | 28px / 1.75rem  | 700    | 1.3         |
| Section header        | Inter          | 22px / 1.375rem | 600    | 1.4         |
| Card title            | Inter          | 18px / 1.125rem | 600    | 1.4         |
| Body text             | Inter          | 16px / 1rem     | 400    | 1.6         |
| Currency values       | JetBrains Mono | 16px / 1rem     | 500    | 1.4         |
| Large currency (hero) | JetBrains Mono | 32px / 2rem     | 700    | 1.2         |
| Labels / metadata     | Inter          | 14px / 0.875rem | 400    | 1.5         |
| Small / captions      | Inter          | 12px / 0.75rem  | 400    | 1.5         |

**Seniors Mode**: All sizes multiply by `var(--seniors-font-multiplier)` (default 1.0, seniors 1.25).

### Core Layout (Mantine AppShell v7)

```
┌──────────────────────────────────────────────────────┐
│ Header: Logo | Privacy Toggle | Search(Cmd+K) | User │
├──────────┬───────────────────────────────────────────┤
│ Navbar   │ Main Content Area                         │
│          │                                           │
│ ● Dash   │ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│ ● Accts  │ │Safe-to-  │ │Bills Due │ │Projected │  │
│ ● Trans  │ │Spend     │ │This Week │ │Balance   │  │
│ ● Budget │ │(Ring)    │ │(List)    │ │(Chart)   │  │
│ ● Report │ └──────────┘ └──────────┘ └──────────┘  │
│ ● Invest │                                           │
│ ● Goals  │ ┌─────────────────────────────────────┐  │
│ ● Subs   │ │ Recent Transactions (VirtualTable)  │  │
│ ● Import │ └─────────────────────────────────────┘  │
│          │                                           │
│ ──────── │ ┌───────────┐ ┌────────────────────┐     │
│ Sync ●   │ │Spending   │ │Monthly Trend       │     │
│ AI Coach │ │by Category│ │(Area chart)        │     │
│          │ └───────────┘ └────────────────────┘     │
├──────────┴───────────────────────────────────────────┤
│ Footer: v1.0 | Sync status | Encryption lock icon   │
└──────────────────────────────────────────────────────┘
```

**Mobile (xs/sm)**: Navbar collapses to bottom tab bar via `AppShell.Footer`. Top 5 nav items as tabs; overflow in "More" drawer. `AppShell.Navbar` uses `hiddenFrom="sm"`.

### Key Component Specifications

#### Safe-to-Spend Dial (Central Dashboard Widget)

**Component**: Mantine `RingProgress` with custom `sections` array

```typescript
// SafeToSpendDial.tsx
interface SafeToSpendProps {
  available: number; // Remaining safe-to-spend
  budgeted: number; // Reserved for active budgets
  upcomingBills: number; // Bills due in look-ahead period
  totalBalance: number; // Account balance
  lookAheadDays: 7 | 14 | 30;
  currency: string;
  locale: string;
}
```

- **Segments**: Green (available ≥30%), Yellow (budgeted), Orange (upcoming bills), Red (if available ≤0%)
- **Center**: Large JetBrains Mono currency display with privacy blur class
- **Interaction**: Click segment → breakdown `Drawer`; outer ring drag → change look-ahead period
- **Animation**: `framer-motion` count-up on mount (500ms spring), segment transitions (200ms)
- **Size**: 200px diameter desktop, 160px mobile
- **Threshold colors**: ≥30% remaining = green, 10-30% = yellow, 1-10% = orange, ≤0% = red

#### Transaction Review Inbox ("Swipe-to-Review")

**Mobile (gesture-based)**:

```typescript
// TransactionReviewCard.tsx
interface ReviewGestures {
  swipeRight: (threshold: 100) => "approve"; // Green flash + haptic
  swipeLeft: (threshold: 100) => "flag"; // Amber flash
  swipeUp: (threshold: 80) => "split"; // Opens SplitModal
  tap: () => "detail"; // Full edit view
}
```

- **Library**: `react-spring` with `useDrag` hook for physics-based gestures
- **Card stack**: Z-indexed stack showing top 3 cards, most recent on top
- **Emotional ROI tags**: Mantine `Badge` variants: `Joy` (green.6), `Regret` (red.6), `Essential` (blue.6), `Routine` (gray.6)
- **Batch mode**: Progress bar showing `reviewed / total`, "Review all" rapid-fire button

**Desktop (keyboard-driven)**:

| Key        | Action           |
| ---------- | ---------------- |
| `→` or `A` | Approve          |
| `←` or `F` | Flag for review  |
| `↑` or `S` | Split            |
| `Enter`    | Open detail view |
| `Space`    | Next transaction |
| `Esc`      | Exit review mode |

#### Privacy Toggle

- **Location**: Header `ActionIcon` with lock/unlock icon, always visible
- **Shortcut**: `Ctrl+Shift+P` (Windows/Linux), `Cmd+Shift+P` (macOS)
- **Scope**: All elements with `.financial-value` class — currency amounts, account names, balances, chart data labels, net worth
- **CSS**: `filter: blur(8px); transition: filter 200ms ease;`
- **State**: React context (`PrivacyContext`) + `localStorage` persistence
- **Visual indicator**: Lock icon in header changes state, subtle red dot when privacy mode active

#### Scenario Slider (Cash Flow Time Machine)

- **Chart**: Recharts `AreaChart` with Mantine `Slider` overlay
- **Data layers**:
  - Solid line: Expected (ML prediction + recurring patterns)
  - Semi-transparent fill (15% opacity): Confidence band (best/worst)
  - Dotted markers: User-added what-if events
- **What-if interactions**: Click on timeline → `Popover` to add event
  - Preset events: "Cancel subscription", "New income", "One-time expense", "Savings withdrawal"
  - Custom event: Name, amount, frequency (one-time/monthly/annual), start date
- **Recalculation**: Debounced 150ms as slider moves, Web Worker for Monte Carlo simulation
- **Range**: 3 / 6 / 12 month toggle buttons

#### AI Coach Panel

- **Collapsed state**: Icon + notification badge at bottom of sidebar
- **Expanded state**: Slide-out `Drawer` from right side (mobile: full-screen modal)
- **Chat interface**: Message bubbles with typing indicator, suggestion chips
- **Context awareness**: Reads current page to offer relevant suggestions
  - On Dashboard: "Your dining spending is 40% above last month"
  - On Budgets: "You have $200 unallocated this month"
  - On Transactions: "I categorized 12 new transactions — review?"
- **Action buttons**: "Apply suggestion", "Dismiss", "Tell me more"

### Dark Mode Colors

| Element           | Light                    | Dark                            |
| ----------------- | ------------------------ | ------------------------------- |
| Background        | `#FAFAFA`                | `#1A1B1E`                       |
| Surface (card)    | `#FFFFFF`                | `#25262B`                       |
| Surface hover     | `#F8F9FA`                | `#2C2E33`                       |
| Border            | `#DEE2E6`                | `#373A40`                       |
| Text primary      | `#212529`                | `#C1C2C5`                       |
| Text secondary    | `#868E96`                | `#909296`                       |
| Income highlight  | `#0099E6`                | `#1AB5FF`                       |
| Expense highlight | `#E6005E`                | `#FF1A7A`                       |
| Savings highlight | `#00CC62`                | `#1AFF88`                       |
| Glassmorphism bg  | `rgba(255,255,255,0.85)` | `rgba(26,27,30,0.85)`           |
| Card glow (hover) | none                     | `0 0 20px rgba(20,184,166,0.1)` |

### Animation Guidelines

- **Page transitions**: Framer Motion `AnimatePresence` with fade (150ms)
- **Card enter**: Fade up (translateY: 20px → 0, opacity: 0 → 1, 300ms spring)
- **Widget updates**: Number count-up animation (500ms spring, overshoot: 0.05)
- **Gesture feedback**: Spring physics (`tension: 200, friction: 20`)
- **Loading states**: Mantine `Skeleton` components matching final layout
- **Celebrations**: `canvas-confetti` on milestones (debt payoff, savings goal hit, etc.)
- **Reduced motion**: All animations check `useReducedMotion()` — if true, instant transitions

### Accessibility Standards (WCAG 2.2 AA+)

| Requirement      | Standard                         | Our Implementation                                      |
| ---------------- | -------------------------------- | ------------------------------------------------------- |
| Touch targets    | 44px minimum                     | 44px default, 48px Seniors, 52px primary actions        |
| Focus indicators | Visible, high contrast           | 3px solid ring, 2px offset, teal.4 dark / teal.8 light  |
| Reduced motion   | Respect `prefers-reduced-motion` | All Framer Motion in `useReducedMotion()` guard         |
| Screen reader    | Semantic HTML + ARIA             | `aria-label` on all interactive; chart → table fallback |
| Keyboard nav     | Full traversal                   | Tab order, skip-to-content, visible focus               |
| Color blind      | No color-only meaning            | Icon + label always paired with color                   |
| RTL support      | Bidirectional layout             | Mantine's `dir="rtl"` + logical CSS properties          |
| Contrast ratio   | 4.5:1 body, 3:1 large            | Tested with Lighthouse + axe-core                       |
| Zoom/reflow      | Usable at 200% zoom              | Responsive design + relative units                      |

### Responsive Breakpoints

| Mantine breakpoint | Min width | Layout                                                     |
| ------------------ | --------- | ---------------------------------------------------------- |
| xs                 | 0         | Single column, bottom tab nav, stacked widgets             |
| sm                 | 576px     | Single column, collapsible sidebar (hamburger)             |
| md                 | 768px     | Two-column, compact sidebar (icons only)                   |
| lg                 | 992px     | Two-column, full sidebar (icons + labels)                  |
| xl                 | 1200px    | Three-column (sidebar + main + aside panel for AI/details) |

---

## INSERT: Expand "Pre-Phase 0: Migration Strategy" with component mapping

---

### shadcn/ui → Mantine Component Migration Map

This table maps every currently-used shadcn/ui component to its Mantine equivalent.

| shadcn/ui Component | Mantine Equivalent                      | Notes                                                      |
| ------------------- | --------------------------------------- | ---------------------------------------------------------- |
| `Accordion`         | `Accordion`                             | Direct equivalent                                          |
| `Alert`             | `Alert`                                 | Direct equivalent                                          |
| `AlertDialog`       | `Modal` with confirm variant            | Use `modals.openConfirmModal()` from `@mantine/modals`     |
| `Avatar`            | `Avatar`                                | Direct equivalent                                          |
| `Badge`             | `Badge`                                 | Direct equivalent                                          |
| `Button`            | `Button`                                | CVA variants → Mantine `variant` prop                      |
| `Calendar`          | `DatePicker`                            | `@mantine/dates` package                                   |
| `Card`              | `Card` / `Paper`                        | `Paper` for simple, `Card` for structured                  |
| `Carousel`          | `Carousel`                              | `@mantine/carousel` (Embla-based, same underlying library) |
| `Chart`             | Recharts (keep)                         | Recharts is framework-agnostic, no migration needed        |
| `Checkbox`          | `Checkbox`                              | Direct equivalent                                          |
| `Collapsible`       | `Collapse`                              | Direct equivalent                                          |
| `Combobox`          | `Combobox` / `Select` with `searchable` | Mantine has built-in searchable Select                     |
| `Command (⌘K)`      | `Spotlight`                             | `@mantine/spotlight` — full command palette                |
| `ContextMenu`       | `Menu` with trigger                     | Use `Menu` with right-click trigger                        |
| `DataTable`         | `Table` + `@tanstack/react-table`       | Keep TanStack Table; wrap in Mantine `Table` styles        |
| `DatePicker`        | `DatePickerInput`                       | `@mantine/dates`                                           |
| `Dialog`            | `Modal`                                 | Direct equivalent                                          |
| `Drawer`            | `Drawer`                                | Direct equivalent                                          |
| `DropdownMenu`      | `Menu`                                  | Direct equivalent                                          |
| `Form`              | `useForm` from `@mantine/form`          | Replace react-hook-form with Mantine form OR keep RHF      |
| `HoverCard`         | `HoverCard`                             | Direct equivalent                                          |
| `Input`             | `TextInput`                             | Direct equivalent with built-in label/error                |
| `Label`             | `Text`                                  | Use as standalone or built into Input components           |
| `Menubar`           | `Menu`                                  | Compose multiple `Menu` components                         |
| `NavigationMenu`    | `NavLink`                               | Mantine NavLink with nested children                       |
| `Pagination`        | `Pagination`                            | Direct equivalent                                          |
| `Popover`           | `Popover`                               | Direct equivalent                                          |
| `Progress`          | `Progress` / `RingProgress`             | Both available                                             |
| `RadioGroup`        | `Radio.Group`                           | Direct equivalent                                          |
| `ScrollArea`        | `ScrollArea`                            | Direct equivalent                                          |
| `Select`            | `Select`                                | Direct equivalent with search support                      |
| `Separator`         | `Divider`                               | Direct equivalent                                          |
| `Sheet`             | `Drawer`                                | Sheet = Drawer in Mantine                                  |
| `Skeleton`          | `Skeleton`                              | Direct equivalent                                          |
| `Slider`            | `Slider`                                | Direct equivalent                                          |
| `Switch`            | `Switch`                                | Direct equivalent                                          |
| `Table`             | `Table`                                 | Direct equivalent                                          |
| `Tabs`              | `Tabs`                                  | Direct equivalent                                          |
| `Textarea`          | `Textarea`                              | Direct equivalent                                          |
| `Toast`             | `Notifications`                         | `@mantine/notifications` — more powerful                   |
| `Toggle`            | `ActionIcon` / `SegmentedControl`       | Context-dependent                                          |
| `Tooltip`           | `Tooltip`                               | Direct equivalent                                          |

**Custom components NOT in Mantine** (require custom implementation):

- `3d-card`, `animated-testimonials`, `background-beams`, `bento-grid` → Custom with Framer Motion
- `floating-navbar`, `hero-parallax`, `infinite-moving-cards` → Custom (landing page only)
- `meteors`, `sparkles`, `text-generate-effect` → Custom (decorative only)

### Routing Migration Map

| Next.js Route                                     | React Router Equivalent | Component              |
| ------------------------------------------------- | ----------------------- | ---------------------- |
| `src/app/budget-app/page.tsx`                     | `/`                     | `DashboardPage`        |
| `src/app/budget-app/transactions/page.tsx`        | `/transactions`         | `TransactionsPage`     |
| `src/app/budget-app/accounts/page.tsx`            | `/accounts`             | `AccountsPage`         |
| `src/app/budget-app/budgets/page.tsx`             | `/budgets`              | `BudgetsPage`          |
| `src/app/budget-app/reports/page.tsx`             | `/reports`              | `ReportsPage`          |
| `src/app/budget-app/calculators/page.tsx`         | `/calculators`          | `CalculatorsPage`      |
| `src/app/budget-app/calculators/[type]/page.tsx`  | `/calculators/:type`    | `CalculatorDetailPage` |
| `src/app/budget-app/investments/page.tsx`         | `/investments`          | `InvestmentsPage`      |
| `src/app/budget-app/loans/page.tsx`               | `/loans`                | `LoansPage`            |
| `src/app/budget-app/loans/[id]/page.tsx`          | `/loans/:id`            | `LoanDetailPage`       |
| `src/app/budget-app/loans/[id]/edit/page.tsx`     | `/loans/:id/edit`       | `LoanEditPage`         |
| `src/app/budget-app/loans/new/page.tsx`           | `/loans/new`            | `NewLoanPage`          |
| `src/app/budget-app/import/page.tsx`              | `/import`               | `ImportPage`           |
| `src/app/budget-app/export/page.tsx`              | `/export`               | `ExportPage`           |
| `src/app/budget-app/settings/page.tsx`            | `/settings`             | `SettingsPage`         |
| `src/app/budget-app/admin/page.tsx`               | `/admin`                | `AdminPage`            |
| `src/app/budget-app/categories/page.tsx`          | `/categories`           | `CategoriesPage`       |
| `src/app/budget-app/subscriptions/page.tsx`       | `/subscriptions`        | `SubscriptionsPage`    |
| `src/app/budget-app/ocr/page.tsx`                 | `/scan`                 | `ScanPage`             |
| `src/app/budget-app/offline/page.tsx`             | `/sync`                 | `SyncStatusPage`       |
| `src/app/budget-app/friday-review/page.tsx`       | `/review`               | `WeeklyReviewPage`     |
| `src/app/budget-app/planning/future/page.tsx`     | `/planning/future`      | `FuturePlanningPage`   |
| `src/app/budget-app/planning/retirement/page.tsx` | `/planning/retirement`  | `RetirementPage`       |
| `src/app/budget-app/train-ml/page.tsx`            | `/ml-training`          | `MLTrainingPage`       |
| `src/app/budget-app/design-system/page.tsx`       | `/design-system`        | `DesignSystemPage`     |
| `src/app/budget-app/landing/page.tsx`             | `/welcome`              | `LandingPage`          |
| `src/app/budget-app/auth/*/page.tsx`              | `/auth/*`               | Auth pages             |
| `src/app/budget-app/debug/page.tsx`               | `/debug`                | `DebugPage`            |

### API Layer Migration

Replace Next.js API routes with **Hono.js** on Cloudflare Workers (or Express for self-hosted):

| Next.js API Route            | Hono Route                     | Handler                   |
| ---------------------------- | ------------------------------ | ------------------------- |
| `api/import/analyze-columns` | `POST /api/import/columns`     | `analyzeColumns`          |
| `api/import/analyze-error`   | `POST /api/import/error`       | `analyzeImportError`      |
| `api/bank/detect`            | `POST /api/bank/detect`        | `detectBankFormat`        |
| `api/chat`                   | `POST /api/chat`               | `aiChatHandler`           |
| `api/calendar/ics`           | `GET /api/calendar/ics`        | `generateICS`             |
| `api/merchants/resolve`      | `POST /api/merchants/resolve`  | `resolveMerchant`         |
| `api/merchants/feedback`     | `POST /api/merchants/feedback` | `merchantFeedback`        |
| `api/email/send`             | `POST /api/email/send`         | `sendEmail`               |
| `api/email/unsubscribe`      | `GET /api/email/unsubscribe`   | `handleUnsubscribe`       |
| (NEW) `api/auth/passkey/*`   | `POST /api/auth/passkey/*`     | Passkey registration/auth |
| (NEW) `api/stripe/webhook`   | `POST /api/stripe/webhook`     | Stripe webhook handler    |
| (NEW) `api/sync/*`           | `POST /api/sync/*`             | Cloud sync endpoints      |
| (NEW) `api/plaid/*`          | `POST /api/plaid/*`            | Plaid Link/webhook        |
| (NEW) `api/family/*`         | `POST /api/family/*`           | Family group management   |

**Hono architecture**:

```typescript
// api/index.ts
import { Hono } from "hono";
import { cors } from "hono/cors";
import { jwt } from "hono/jwt";

const app = new Hono();
app.use("/api/*", cors());
app.use("/api/*", jwt({ secret: env.JWT_SECRET }));

app.route("/api/auth", authRoutes);
app.route("/api/sync", syncRoutes);
app.route("/api/import", importRoutes);
app.route("/api/chat", chatRoutes);
app.route("/api/stripe", stripeRoutes);
app.route("/api/plaid", plaidRoutes);
app.route("/api/family", familyRoutes);
app.route("/api/merchants", merchantRoutes);

export default app;
```

### i18n Migration

| Current (next-intl)            | New (react-intl / FormatJS)                                            |
| ------------------------------ | ---------------------------------------------------------------------- |
| `useTranslations('namespace')` | `useIntl()` + `intl.formatMessage()`                                   |
| `t('key')`                     | `<FormattedMessage id="key" />` or `intl.formatMessage({ id: 'key' })` |
| `useFormatter()`               | `intl.formatNumber()`, `intl.formatDate()`                             |
| `NextIntlClientProvider`       | `IntlProvider` from `react-intl`                                       |
| Message format: ICU            | Same ICU format — JSON files port as-is                                |

**Migration effort**: LOW. JSON message files are format-compatible. Main work is replacing hook calls in ~195 components.

---

## INSERT AFTER: "Sources" section (at end of document)

---

## Infrastructure & Deployment

### Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Production Stack                              │
│                                                                      │
│  ┌──────────────────┐    ┌──────────────────┐    ┌──────────────┐  │
│  │ Cloudflare Pages │    │ Cloudflare       │    │ Supabase     │  │
│  │ (SPA hosting)    │    │ Workers (API)    │    │ (Database)   │  │
│  │                  │    │                  │    │              │  │
│  │ - Vite build     │    │ - Hono.js API    │    │ - PostgreSQL │  │
│  │ - Global CDN     │    │ - Auth endpoints │    │ - RLS        │  │
│  │ - Custom domain  │    │ - Stripe webhook │    │ - Realtime   │  │
│  │ - Free SSL       │    │ - Plaid proxy    │    │ - Auth       │  │
│  │ - Unlimited BW   │    │ - AI proxy       │    │ - Storage    │  │
│  └──────────────────┘    └──────────────────┘    └──────────────┘  │
│                                                                      │
│  ┌──────────────────┐    ┌──────────────────┐    ┌──────────────┐  │
│  │ Stripe           │    │ Plaid            │    │ Anthropic    │  │
│  │ (Billing)        │    │ (Bank sync)      │    │ (AI Coach)   │  │
│  └──────────────────┘    └──────────────────┘    └──────────────┘  │
│                                                                      │
│  ┌──────────────────┐    ┌──────────────────┐    ┌──────────────┐  │
│  │ PostHog          │    │ Sentry           │    │ Resend       │  │
│  │ (Analytics +     │    │ (Error tracking  │    │ (Email)      │  │
│  │  Feature Flags)  │    │  + Performance)  │    │              │  │
│  └──────────────────┘    └──────────────────┘    └──────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### Self-Hosted Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Docker Compose (single VPS)                             │
│                                                          │
│  ┌───────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Nginx     │  │ Hono API     │  │ PostgreSQL   │     │
│  │ (reverse  │  │ (Node.js)    │  │ (local)      │     │
│  │  proxy +  │  │              │  │              │     │
│  │  static)  │  │              │  │              │     │
│  └───────────┘  └──────────────┘  └──────────────┘     │
│                                                          │
│  ┌───────────┐  ┌──────────────┐                        │
│  │ Supabase  │  │ Redis        │                        │
│  │ (self-    │  │ (sessions +  │                        │
│  │  hosted)  │  │  rate limit) │                        │
│  └───────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────┘
```

### CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: "22" }
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test:unit
      - run: npm run test:integration

  visual-regression:
    runs-on: ubuntu-latest
    needs: lint-and-test
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:visual
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/

  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm audit --audit-level=high
      - uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

  deploy-preview:
    if: github.event_name == 'pull_request'
    needs: [lint-and-test, visual-regression]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npm run build
      - uses: cloudflare/wrangler-action@v3
        with:
          command: pages deploy dist --project-name=budget-app-preview

  deploy-production:
    if: github.ref == 'refs/heads/main'
    needs: [lint-and-test, visual-regression, security-scan]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npm run build
      - uses: cloudflare/wrangler-action@v3
        with:
          command: pages deploy dist --project-name=budget-app
      # Deploy API (Cloudflare Workers)
      - run: cd api && npx wrangler deploy
      # Run Supabase migrations
      - uses: supabase/setup-cli@v1
      - run: supabase db push --linked
```

### Database Migrations (Supabase CLI)

```bash
# Create new migration
supabase migration new add_family_groups

# Apply migrations locally
supabase db reset

# Push to staging
supabase db push --linked --target staging

# Push to production
supabase db push --linked --target production
```

**Migration workflow**:

1. Create migration SQL file locally
2. Test against local Supabase instance
3. PR review includes migration review
4. Merge to `main` → CI runs `supabase db push`
5. Rollback: Create reverse migration, never manual SQL in production

### Feature Flags (PostHog)

PostHog provides feature flags + A/B testing in one platform (already in the codebase for analytics).

```typescript
// lib/feature-flags.ts
import posthog from "posthog-js";

export const FeatureFlags = {
  AI_COACH_ENABLED: "ai-coach-enabled",
  PASSKEY_AUTH: "passkey-auth",
  FAMILY_SHARING: "family-sharing",
  MONTE_CARLO: "monte-carlo-projection",
  DOCUMENT_VAULT: "document-vault",
  RULES_ENGINE: "rules-engine",
  CREDIT_SCORE: "credit-score",
  SWIPE_REVIEW: "swipe-review",
} as const;

export function isFeatureEnabled(flag: keyof typeof FeatureFlags): boolean {
  return posthog.isFeatureEnabled(FeatureFlags[flag]) ?? false;
}
```

**Rollout strategy per feature**:

1. **Internal**: Team-only (flag: `internal_testing`)
2. **Beta**: 5% of premium users → 25% → 50% → 100%
3. **GA**: Remove flag, feature always on

### Monitoring & Observability

**Stack: PostHog (analytics + flags) + Sentry (errors + performance)**

#### Sentry Configuration

```typescript
// lib/monitoring/sentry.ts
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      // PRIVACY: Mask all financial data in replays
      maskAllText: true,
      maskAllInputs: true,
      blockAllMedia: true,
    }),
  ],
  tracesSampleRate: 0.1, // 10% of transactions
  replaysSessionSampleRate: 0.01, // 1% of sessions
  replaysOnErrorSampleRate: 0.5, // 50% of error sessions
  beforeSend(event) {
    // CRITICAL: Strip any financial data from error reports
    if (event.extra) {
      delete event.extra.transactions;
      delete event.extra.balances;
      delete event.extra.accounts;
    }
    return event;
  },
});
```

#### PostHog Configuration

```typescript
// lib/monitoring/posthog.ts
import posthog from "posthog-js";

posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
  api_host: import.meta.env.VITE_POSTHOG_HOST,
  person_profiles: "identified_only", // Privacy: only track signed-in users
  autocapture: false, // Privacy: no automatic click tracking
  capture_pageview: true, // Track page navigation
  capture_pageleave: true, // Track session duration
  disable_session_recording: true, // Privacy: no session recording by default
  sanitize_properties: (properties) => {
    // Remove any financial values from analytics
    delete properties.amount;
    delete properties.balance;
    return properties;
  },
});
```

#### Key Metrics Dashboards

**Performance Dashboard (Sentry)**:

- Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1
- API response times by endpoint (P50, P95, P99)
- Error rate per release
- Sync failure rate

**Product Dashboard (PostHog)**:

- DAU/MAU ratio (target: 60%+)
- Feature adoption per flag
- Onboarding completion funnel
- Safe-to-spend daily view rate (target: 80%)
- Subscription conversion funnel (free → trial → premium)
- AI coach engagement (conversations/week)

#### Alerting Rules

| Alert                    | Condition              | Channel           | Severity |
| ------------------------ | ---------------------- | ----------------- | -------- |
| Error rate spike         | >5% in 5 min           | PagerDuty + Slack | P1       |
| Sync failures            | >1% in 15 min          | Slack             | P2       |
| API latency              | P95 > 2s for 5 min     | Slack             | P2       |
| Deployment failure       | CI job fails on main   | Slack + email     | P1       |
| Stripe webhook failure   | 3 consecutive failures | PagerDuty         | P1       |
| Database connection pool | >80% utilization       | Slack             | P2       |
| SSL certificate expiry   | <14 days remaining     | Email             | P3       |

### Environment Management

| Environment    | Purpose                | Infrastructure                   | Database                 |
| -------------- | ---------------------- | -------------------------------- | ------------------------ |
| **local**      | Development            | Vite dev server + local Supabase | Local PostgreSQL         |
| **preview**    | PR review              | Cloudflare Pages preview URL     | Supabase branch          |
| **staging**    | Pre-production testing | Cloudflare Pages staging         | Supabase staging project |
| **production** | Live users             | Cloudflare Pages + Workers       | Supabase production      |

### Security Infrastructure

| Layer              | Implementation                                       |
| ------------------ | ---------------------------------------------------- |
| **Transport**      | TLS 1.3 everywhere (Cloudflare handles SSL)          |
| **Authentication** | Supabase Auth + WebAuthn passkeys                    |
| **Authorization**  | Supabase RLS policies per table                      |
| **Secrets**        | Cloudflare Workers secrets (API keys, tokens)        |
| **Dependencies**   | Snyk scanning in CI, Dependabot PRs                  |
| **CSP**            | Content Security Policy headers via Cloudflare Rules |
| **Rate limiting**  | Cloudflare WAF rules + Hono rate limiter             |
| **CORS**           | Strict origin allowlist in Hono middleware           |
| **Audit trail**    | All admin actions logged to `audit_log` table        |

### Cost Estimates (Monthly at Scale)

| Service            | Free Tier           | 10K users     | 100K users        |
| ------------------ | ------------------- | ------------- | ----------------- |
| Cloudflare Pages   | Free (unlimited BW) | Free          | Free              |
| Cloudflare Workers | 100K req/day free   | $5/mo         | $25/mo            |
| Supabase           | Free (50K MAU)      | $25/mo (Pro)  | $599/mo (Team)    |
| Stripe             | 2.9% + 30¢ per txn  | ~$180/mo      | ~$1,800/mo        |
| Plaid              | 100 items free      | $500/mo       | $5,000/mo         |
| Sentry             | 5K errors free      | $26/mo (Team) | $80/mo (Business) |
| PostHog            | 1M events free      | Free          | $450/mo           |
| Resend             | 3K emails free      | $20/mo        | $50/mo            |
| Anthropic (Claude) | Pay-per-use         | ~$200/mo      | ~$2,000/mo        |
| **Total**          | **Free**            | **~$960/mo**  | **~$10,000/mo**   |

**Revenue at those scales**: 10K users at 5% premium ($5.99/mo) = $2,995/mo revenue. 100K users = $29,950/mo. Healthy margins at both scales.

---

## Updated Competitor Intelligence (Feb 2026 Addendum)

### PocketGuard Pricing Collapse (Opportunity)

- **Old**: Free tier available, $34.99/yr premium
- **New (2026)**: No free tier, $74.99/yr ($12.99/mo monthly)
- **User reaction**: Significant backlash on Reddit, users actively seeking alternatives
- **Our advantage**: Free tier + $5.99/mo premium undercuts PocketGuard by 54%
- **Action**: Consider targeted marketing to PocketGuard refugees

### EveryDollar Relaunch (January 2026)

- **Margin Finder**: Auto-identifies $3,015 average overspending in 15 minutes
- **Live group coaching**: Dave Ramsey methodology groups ($17.99/mo premium required)
- **Daily micro-lessons**: Contextual financial education
- **Paycheck planning**: Allocate paychecks to specific budget categories
- **Our response**: Phase 4 Margin Finder + AI Coach covers same ground with privacy-first approach

### Monarch Money UI Intelligence

- **607 UI screens** catalogued for design reference (NicelyDone)
- Independent web and mobile dashboard customization
- Monthly review swipe-through for cash flow insights
- Investment tracking still limited (no allocation view, poor income tracking)
- **Design insight**: Monarch's success comes from polish, not feature count. Our UI must match or exceed their quality.

---

## Sources (Expanded)

### Competitor Research (Original)

See `Plans/BUDGET_APP_COMPLETE_IMPLEMENTATION_PLAN.md` for full URL list.

### Additional Sources (v2.0 Expansion)

- [PocketGuard Pricing 2026](https://pocketguard.com/pricing/)
- [EveryDollar Review 2026 - NerdWallet](https://www.nerdwallet.com/finance/learn/everydollar-app-review)
- [Monarch Money UI Screens - NicelyDone](https://nicelydone.club/apps/monarch)
- [Mantine v7 Changelog](https://mantine.dev/changelog/7-0-0/)
- [Mantine Dark Theme Docs](https://mantine.dev/theming/theme-object/)
- [Supabase CI/CD Docs](https://supabase.com/docs/guides/deployment)
- [PostHog vs Sentry Comparison](https://posthog.com/blog/posthog-vs-sentry)
- [Cloudflare Pages Vite Deploy](https://vite.dev/guide/static-deploy)
- [Hono.js + React + Vite + Cloudflare](https://github.com/ARAldhafeeri/hono-react-vite-cloudflare)
- [Supabase Stripe Sync](https://supabase.com/)
