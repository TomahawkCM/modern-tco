# UI/UX & Cross-Platform Design Addendum

**Applies to**: `CLAUDE_CODE_EXECUTION_PLAN.md`
**Purpose**: Ensure every screen feels native-quality on iOS, Android, tablets, and desktop browsers.
**Core principle**: This app must feel like a $100M fintech product, not a side project.

---

## Design Philosophy: "Cyber-Soft"

The visual identity sits between ProtonMail's security confidence and Monarch Money's polished warmth. Every screen communicates two things: "Your data is locked down" and "Managing money feels delightful."

**The anti-pattern to avoid**: Feature-rich apps that feel overwhelming. Monarch Money has 607 screens but feels simple because of progressive disclosure and consistent patterns. We must do the same with 3x more features — hide complexity behind simple surfaces.

---

## 1. Mobile-First Design Rules

Every component is designed for a 375px-wide phone screen FIRST, then expanded to tablet and desktop. Not the reverse.

### Touch Target Minimums

| Element                  | Minimum Size                | Seniors Mode                  |
| ------------------------ | --------------------------- | ----------------------------- |
| Buttons (primary)        | 48 × 48px                   | 56 × 56px                     |
| Buttons (secondary)      | 44 × 44px                   | 52 × 52px                     |
| List items / rows        | 48px height                 | 56px height                   |
| Icons (tappable)         | 44 × 44px hit area          | 52 × 52px hit area            |
| Checkbox / Radio         | 24px visual + 44px hit area | 28px visual + 52px hit area   |
| Close / dismiss buttons  | 44 × 44px                   | 52 × 52px                     |
| Swipe gesture activation | 100px horizontal drag       | 80px (easier in seniors mode) |

### Safe Area Handling

```css
/* iOS notch, Dynamic Island, home indicator */
:root {
  --safe-area-top: env(safe-area-inset-top, 0px);
  --safe-area-bottom: env(safe-area-inset-bottom, 0px);
  --safe-area-left: env(safe-area-inset-left, 0px);
  --safe-area-right: env(safe-area-inset-right, 0px);
}

/* Apply to app shell */
.app-header {
  padding-top: calc(var(--safe-area-top) + 12px);
}

.bottom-tab-bar {
  padding-bottom: calc(var(--safe-area-bottom) + 8px);
}

/* PWA standalone mode — viewport-fit=cover for full-bleed */
/* In manifest.json or meta tag: */
/* <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"> */
```

### Thumb Zone Optimization

On phones, the bottom 40% of the screen is the natural thumb zone. Critical actions go here.

```
┌──────────────────────────┐
│                          │  ← Hard to reach (less used info)
│    Header / Status       │
│                          │
│──────────────────────────│
│                          │  ← Comfortable (content/data)
│    Main Content Area     │
│    (scrollable)          │
│                          │
│──────────────────────────│
│                          │  ← Natural thumb zone (primary actions)
│    FAB / Quick Actions   │
│    Bottom Tab Bar        │
│                          │
└──────────────────────────┘
```

**Rules**:

- Primary action button (Add Transaction, Quick Add) → Floating Action Button (FAB) bottom-right, 56px diameter
- Navigation → Bottom tab bar (5 items max)
- Destructive actions (delete, cancel) → NEVER in thumb zone. Always require confirmation.
- Pull-to-refresh → standard gesture on all scrollable lists

---

## 2. Platform-Specific Layouts

### 2.1 Phone (320px–576px) — iOS & Android

```
┌──────────────────────────┐
│ ← Back    Page Title   ⋮ │  ← Compact header (44px)
│──────────────────────────│
│                          │
│  ┌────────────────────┐  │
│  │  Safe-to-Spend     │  │  ← Hero widget (full width)
│  │  $1,247.00         │  │
│  │  ████████░░░ 62%   │  │
│  └────────────────────┘  │
│                          │
│  Category Breakdown      │  ← Scrollable content
│  ┌──────────────────┐    │
│  │ 🛒 Groceries     │    │
│  │ $180 / $400  45% │    │
│  │ ████░░░░░░░░░░░░ │    │
│  ├──────────────────┤    │
│  │ 🍽️ Dining        │    │
│  │ $95 / $200   48% │    │
│  │ █████░░░░░░░░░░░ │    │
│  └──────────────────┘    │
│                          │
│          [+]             │  ← FAB: Add Transaction
│──────────────────────────│
│ 🏠  📊  💰  📋  ⋯     │  ← Bottom tabs (5 max + More)
└──────────────────────────┘
```

**Bottom Tab Bar items** (max 5 visible, overflow in "More" drawer):

1. 🏠 Dashboard (home)
2. 📊 Budget
3. 💰 Accounts
4. 📋 Transactions
5. ⋯ More (Settings, Reports, Goals, Import, AI Coach, Subscriptions, Investments)

**Navigation patterns**:

- Stack navigation (push/pop) within each tab — maintain scroll position when switching tabs
- Bottom sheet (Mantine Drawer position="bottom") for quick actions, transaction details, category picker
- Full-screen modal for complex flows (import wizard, onboarding, receipt scanner)
- Swipe-back gesture to navigate back (React Router + gesture handler)

**Keyboard handling**:

- Currency inputs → `inputMode="decimal"` (shows numeric keyboard with decimal on both iOS and Android)
- Date inputs → Mantine DatePickerInput (native-feeling calendar, NOT browser date picker)
- Search → `inputMode="search"` with instant filtering
- Auto-dismiss keyboard when tapping outside input
- Scroll input into view when keyboard opens (prevent content being hidden behind keyboard)

**iOS-specific PWA requirements**:

- `apple-mobile-web-app-capable: yes` meta tag
- `apple-mobile-web-app-status-bar-style: black-translucent` for full-bleed header
- `apple-touch-icon` for home screen icon (180×180px)
- Custom "Add to Home Screen" instructional banner (iOS has no install prompt like Android)
- Handle iOS PWA state restoration — app must resume where user left off, not reload
- Service worker caching to prevent blank screen on cold launch
- Push notifications require home screen install (iOS 16.4+) — show educational prompt

**Android-specific PWA enhancements**:

- `beforeinstallprompt` event → custom install banner at moment of engagement (after first budget created)
- Splash screen via manifest `background_color` + `theme_color` + icon
- Chrome's "Add to Home Screen" mini-infobar → intercept and customize timing
- Badge API for unread notification count on home screen icon

### 2.2 Tablet (576px–992px) — iPad & Android Tablets

```
┌───────────────────────────────────────────────────┐
│  Logo    🔒 Privacy    🔍 Search (Cmd+K)    👤    │
│───────────────────────────────────────────────────│
│         │                                         │
│ Sidebar │  ┌──────────┐  ┌──────────┐            │
│ (icons  │  │Safe-to-  │  │Bills Due │            │
│  only)  │  │Spend     │  │This Week │            │
│         │  │$1,247    │  │$430      │            │
│ 🏠 Dash │  └──────────┘  └──────────┘            │
│ 💰 Acct │                                         │
│ 📋 Txns │  ┌──────────────────────────┐          │
│ 📊 Budg │  │ Recent Transactions      │          │
│ 📈 Rpts │  │ ─────────────────────── │          │
│ 🎯 Goal │  │ Starbucks    -$5.40     │          │
│ 🔄 Subs │  │ Metro        -$87.32    │          │
│ 📥 Impt │  │ Payroll    +$2,450.00   │          │
│         │  └──────────────────────────┘          │
│ ──────  │                                         │
│ 🤖 AI   │  ┌────────────┐ ┌────────────┐        │
│ ⚙️ Set  │  │ Spending   │ │ Monthly    │        │
│         │  │ by Cat.    │ │ Trend      │        │
│         │  └────────────┘ └────────────┘        │
└─────────┴─────────────────────────────────────────┘
```

**Tablet rules**:

- Sidebar collapsed to icons only (expandable on tap/hover) — saves horizontal space
- Two-column widget layout on dashboard
- Transaction list uses wider rows with more visible data (date, payee, category, amount all inline)
- Bottom sheet → Side panel for details (slide from right)
- Split view for master-detail patterns (transaction list left, detail right)
- iPadOS: Handle Split View / Slide Over multitasking — layout must reflow gracefully
- Landscape orientation: 3-column layout if width > 1024px

### 2.3 Desktop Browser (992px+)

```
┌──────────────────────────────────────────────────────────────────┐
│  Logo        🔒 Privacy Toggle    🔍 Search (Cmd+K)    👤 User  │
│──────────┬───────────────────────────────────────────────────────│
│          │                                                       │
│ Sidebar  │  ┌──────────┐ ┌──────────┐ ┌──────────┐             │
│ (full)   │  │Safe-to-  │ │Bills Due │ │Projected │             │
│          │  │Spend     │ │This Week │ │Balance   │             │
│ Dashboard│  │(Ring)    │ │(List)    │ │(Chart)   │             │
│ Accounts │  └──────────┘ └──────────┘ └──────────┘             │
│ Transact │                                                       │
│ Budget   │  ┌────────────────────────────────────────────┐      │
│ Reports  │  │ Recent Transactions (VirtualTable)          │      │
│ Investmt │  │ Sortable columns, inline edit, batch select │      │
│ Goals    │  └────────────────────────────────────────────┘      │
│ Subscript│                                                       │
│ Import   │  ┌──────────────┐ ┌─────────────────────┐          │
│          │  │Spending      │ │Monthly Trend        │          │
│ ──────── │  │by Category   │ │(Area chart)         │          │
│ Sync ●   │  └──────────────┘ └─────────────────────┘          │
│ AI Coach │                                                       │
│          │                                                       │
│──────────┴───────────────────────────────────────────────────────│
│  Footer: v1.0  │  ● Synced 30s ago  │  🔒 Encrypted            │
└──────────────────────────────────────────────────────────────────┘
```

**Desktop rules**:

- Full sidebar with icons AND labels (collapsible to icons-only via toggle)
- Three-column dashboard widget layout (xl breakpoint 1200px+)
- Transaction table with sortable columns, inline editing, right-click context menu
- Keyboard shortcuts throughout (see shortcut table below)
- Cmd+K spotlight search (Mantine Spotlight) — search transactions, accounts, categories, settings
- Hover states on all interactive elements (cursor: pointer, subtle background change)
- Right-click context menus on transactions (Edit, Categorize, Split, Delete, Flag)
- Drag-and-drop for dashboard widget reordering

---

## 3. Responsive Breakpoint System (Mantine)

```typescript
// theme/budget-theme.ts — add to createTheme
breakpoints: {
  xs: '320px',   // Small phones
  sm: '576px',   // Large phones / small tablets
  md: '768px',   // Tablets portrait
  lg: '992px',   // Tablets landscape / small desktop
  xl: '1200px',  // Desktop
  xxl: '1440px', // Large desktop
}
```

| Breakpoint   | Layout        | Navigation                          | Widgets             |
| ------------ | ------------- | ----------------------------------- | ------------------- |
| xs (320px+)  | Single column | Bottom tabs (5)                     | Stacked, full-width |
| sm (576px+)  | Single column | Bottom tabs (5)                     | Stacked, full-width |
| md (768px+)  | Two-column    | Icon sidebar + bottom tabs removed  | 2-column grid       |
| lg (992px+)  | Two-column    | Full sidebar (icons + labels)       | 2-column grid       |
| xl (1200px+) | Three-column  | Full sidebar + optional aside panel | 3-column grid       |

**Critical rule**: Content never stretches beyond 1440px. Center with auto margins on ultra-wide screens. Background extends full width, content constrained.

---

## 4. Component Design Specifications

Every component follows the "Cyber-Soft" aesthetic and works across all device sizes.

### 4.1 Cards

```typescript
// Standard card pattern (Mantine Paper)
<Paper
  radius="md"         // 8px
  p="lg"              // 24px padding
  shadow="sm"         // Subtle shadow in light mode
  withBorder           // 1px border in light mode
  style={{
    // Dark mode: subtle glow on hover
    '&:hover': {
      boxShadow: colorScheme === 'dark'
        ? '0 0 20px rgba(20, 184, 166, 0.1)'  // Teal glow
        : '0 4px 6px rgba(0, 0, 0, 0.1)',
    },
  }}
>
```

**Card spacing**: 16px gap between cards (grid gap). 24px internal padding. 12px between card title and content.

### 4.2 Currency Display

```typescript
// Currency values always use JetBrains Mono
<Text
  ff="monospace"           // JetBrains Mono
  fw={500}
  size="lg"
  className="financial-value" // Privacy toggle targets this class
  c={amount >= 0 ? 'income.5' : 'expense.5'}  // Semantic coloring
>
  {formatCurrency(amount, locale, currency)}
</Text>
```

**Privacy blur**:

```css
.privacy-active .financial-value {
  filter: blur(8px);
  transition: filter 200ms ease;
  user-select: none;
}

/* Tap/hover to peek (mobile: long-press, desktop: hover) */
.privacy-active .financial-value:hover,
.privacy-active .financial-value:active {
  filter: none;
}
```

### 4.3 Category Chips

```typescript
<Badge
  leftSection={<span>{category.emoji}</span>}
  variant="light"
  color={category.color}
  size="lg"
  radius="xl"
  style={{ cursor: 'pointer' }}
>
  {category.name}
</Badge>
```

### 4.4 Transaction Row

**Phone layout** (single row, 48px min height):

```
┌────────────────────────────────────────┐
│ 🛒  Metro Grocery          -$87.32    │
│     Groceries · Today                  │
└────────────────────────────────────────┘
```

**Desktop layout** (table row with columns):

```
│ Date       │ Payee          │ Category    │ Account  │    Amount │
│ Feb 9, 2026│ Metro Grocery  │ 🛒 Grocery │ Checking │   -$87.32 │
```

**Interaction states**:

- Default: clean white/dark background
- Hover (desktop): subtle background tint + row shadow
- Selected: accent color left border (4px) + light tint background
- Swipe right (mobile): green overlay slides in → "Approved ✓"
- Swipe left (mobile): amber overlay slides in → "Flagged ⚠"
- Long-press (mobile): context menu (Edit, Split, Delete, Flag)
- Right-click (desktop): same context menu

### 4.5 Bottom Sheets (Mobile)

Used for: Transaction details, category picker, quick add, filters, account selector.

```typescript
<Drawer
  position="bottom"
  size="auto"          // Content-determined height
  radius="lg"          // Rounded top corners (16px)
  overlayProps={{ opacity: 0.35, blur: 4 }}
  withCloseButton={false}  // Use drag handle instead
  padding="lg"
>
  {/* Drag handle indicator */}
  <Center mb="md">
    <Box w={40} h={4} bg="gray.4" style={{ borderRadius: 2 }} />
  </Center>
  {/* Content */}
</Drawer>
```

**Behavior**:

- Drag handle at top (40×4px pill) for grab-and-drag
- Snap points: 40% height (peek), 80% height (expanded), dismiss on drag below 20%
- Background dimming with blur
- Keyboard-aware: sheet moves up when keyboard opens

### 4.6 Empty States

Every screen needs a designed empty state — not a blank page.

```typescript
// Pattern for all empty states
<Stack align="center" justify="center" h="60vh" gap="md">
  <ThemeIcon size={80} radius="xl" variant="light" color="teal">
    <IconWallet size={40} />
  </ThemeIcon>
  <Title order={3}>No transactions yet</Title>
  <Text c="dimmed" ta="center" maw={320}>
    Connect a bank account or add your first transaction to get started.
  </Text>
  <Group>
    <Button leftSection={<IconPlus />}>Add Transaction</Button>
    <Button variant="light" leftSection={<IconLink />}>Connect Bank</Button>
  </Group>
</Stack>
```

**Required empty states**:

- Dashboard (no data) → onboarding CTA
- Transactions (none) → "Add your first" or "Connect bank"
- Budget (none set) → methodology quiz CTA
- Reports (insufficient data) → "Need at least 7 days of data"
- Goals (none) → "What are you saving for?"
- Subscriptions (none detected) → "Connect bank to auto-detect"
- Search (no results) → "No matches. Try different keywords."

### 4.7 Loading States

**Skeleton screens** (not spinners) for all data-dependent views:

```typescript
// Transaction list skeleton
<Stack gap="xs">
  {Array.from({ length: 6 }).map((_, i) => (
    <Group key={i} p="sm">
      <Skeleton circle height={40} />
      <Stack gap={4} style={{ flex: 1 }}>
        <Skeleton height={16} width="60%" />
        <Skeleton height={12} width="30%" />
      </Stack>
      <Skeleton height={16} width={80} />
    </Group>
  ))}
</Stack>
```

**Rules**:

- NEVER use a full-screen spinner. Use skeleton screens that match the final layout.
- Skeleton pulse animation: subtle opacity animation (0.3 → 0.7 → 0.3, 1.5s ease-in-out loop)
- Progressive loading: show cached data immediately, overlay with fresh data when available
- Optimistic updates: when user adds a transaction, show it immediately in the list before sync confirms

### 4.8 Error States

```typescript
// Inline error (within a component)
<Alert
  icon={<IconAlertCircle />}
  title="Connection failed"
  color="red"
  variant="light"
  radius="md"
  withCloseButton
>
  Couldn't sync with your bank. We'll retry automatically.
  <Button variant="subtle" size="xs" mt="xs">Retry now</Button>
</Alert>

// Full-page error (route-level)
<Stack align="center" justify="center" h="60vh">
  <ThemeIcon size={80} radius="xl" variant="light" color="red">
    <IconCloudOff size={40} />
  </ThemeIcon>
  <Title order={3}>Something went wrong</Title>
  <Text c="dimmed">Your data is safe — it's stored locally on your device.</Text>
  <Button onClick={reload}>Try Again</Button>
</Stack>
```

**Error principles**:

- Always reassure users their data is safe (it's local)
- Provide a clear action (Retry, Go Back, Contact Support)
- Never show raw error messages or stack traces
- Offline errors are informational, not critical ("You're offline. Changes will sync when you reconnect.")

---

## 5. Navigation Patterns

### 5.1 Mobile Navigation

**Bottom tab bar** (persistent, always visible):

```typescript
<Tabs
  value={activeTab}
  onChange={navigate}
  variant="pills"
  style={{
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 'var(--safe-area-bottom)',
    background: 'var(--mantine-color-body)',
    borderTop: '1px solid var(--mantine-color-default-border)',
    zIndex: 100,
  }}
>
  <Tabs.List grow justify="space-around">
    <Tabs.Tab value="dashboard" leftSection={<IconHome />}>Home</Tabs.Tab>
    <Tabs.Tab value="budget" leftSection={<IconChartPie />}>Budget</Tabs.Tab>
    <Tabs.Tab value="accounts" leftSection={<IconWallet />}>Accounts</Tabs.Tab>
    <Tabs.Tab value="transactions" leftSection={<IconList />}>Activity</Tabs.Tab>
    <Tabs.Tab value="more" leftSection={<IconDots />}>More</Tabs.Tab>
  </Tabs.List>
</Tabs>
```

**"More" drawer**: Full-screen overlay listing all remaining sections with icons. Groups: Tools (Reports, Goals, Calculators), Import (CSV, Scan Receipt), AI Coach, Settings.

**Page transitions** (framer-motion):

```typescript
// Horizontal slide for tab switches
<AnimatePresence mode="wait">
  <motion.div
    key={pathname}
    initial={{ opacity: 0, x: direction > 0 ? 20 : -20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: direction > 0 ? -20 : 20 }}
    transition={{ duration: 0.15, ease: 'easeInOut' }}
  >
    {children}
  </motion.div>
</AnimatePresence>
```

### 5.2 Desktop Navigation

**Sidebar** (Mantine AppShell.Navbar):

- Width: 240px expanded, 72px collapsed (icons only)
- Toggle: Click hamburger icon or press `[` to collapse/expand
- Sections separated by subtle dividers
- Active item: accent-colored background + left border
- Hover: subtle background tint
- Scroll if items overflow (with hidden scrollbar)

### 5.3 Keyboard Shortcuts (Desktop)

```typescript
const SHORTCUTS = {
  // Global
  "mod+k": "Open spotlight search",
  "mod+shift+p": "Toggle privacy mode",
  "mod+n": "New transaction",
  "mod+shift+n": "New budget category",
  "[": "Toggle sidebar",

  // Navigation
  "g then d": "Go to Dashboard",
  "g then b": "Go to Budget",
  "g then t": "Go to Transactions",
  "g then a": "Go to Accounts",
  "g then r": "Go to Reports",
  "g then s": "Go to Settings",

  // Transaction review
  ArrowRight: "Approve transaction",
  ArrowLeft: "Flag transaction",
  ArrowUp: "Split transaction",
  Enter: "Open detail view",
  Space: "Next transaction",
  Escape: "Exit review mode",

  // Table navigation
  j: "Next row",
  k: "Previous row",
  e: "Edit selected",
  Delete: "Delete selected (with confirmation)",
};
```

**Shortcut hints**: Show `⌘K` next to search bar, `⌘N` on "Add" buttons. Full shortcut cheatsheet via `?` key.

---

## 6. Micro-Interactions & Animation Catalog

Every interaction should feel responsive and alive. All animations respect `prefers-reduced-motion`.

### Animation Tokens

```typescript
const MOTION = {
  // Timing
  instant: 0, // State changes (checkbox, toggle)
  fast: 100, // Hover states, tooltips
  normal: 200, // Drawer open, tab switch
  emphasized: 300, // Card enter, page transition
  dramatic: 500, // Number count-up, celebration

  // Springs
  snappy: { tension: 300, friction: 20 }, // Buttons, toggles
  smooth: { tension: 200, friction: 20 }, // Drawers, sheets
  bouncy: { tension: 200, friction: 12 }, // Celebrations, FAB
  gentle: { tension: 120, friction: 14 }, // Page transitions

  // Easing
  easeOut: [0.0, 0.0, 0.2, 1.0], // Enter animations
  easeIn: [0.4, 0.0, 1.0, 1.0], // Exit animations
  standard: [0.4, 0.0, 0.2, 1.0], // Move/resize
};
```

### Interaction Catalog

| Interaction         | Animation                                       | Duration       | Notes                                         |
| ------------------- | ----------------------------------------------- | -------------- | --------------------------------------------- |
| Page enter          | Fade up (translateY 16px → 0, opacity 0 → 1)    | 200ms          | Stagger children by 50ms                      |
| Tab switch          | Horizontal slide (direction-aware)              | 150ms          | Based on tab index direction                  |
| Card appear         | Fade up with slight scale (0.98 → 1)            | 300ms spring   | Stagger in lists                              |
| Button press        | Scale down (0.97)                               | 100ms          | Spring back on release                        |
| Toggle switch       | Thumb slide + color fill                        | 200ms          | Smooth bezier                                 |
| Bottom sheet open   | Slide up from bottom + overlay fade             | 250ms          | Spring physics                                |
| Pull to refresh     | Custom spinner + rubber-band overscroll         | Gesture-driven | Show sync status                              |
| Number change       | Count-up/down animation                         | 500ms          | JetBrains Mono digits roll                    |
| Budget threshold    | Progress bar color shift (green → yellow → red) | 300ms          | Smooth gradient transition                    |
| Swipe-to-review     | Card slides with rubber-band resistance         | Gesture-driven | Green/amber overlay reveals                   |
| Transaction added   | List item slides in from top + flash            | 300ms          | Optimistic — appears instantly                |
| Transaction deleted | Slide out left + collapse height                | 200ms          | With undo toast (5 seconds)                   |
| Milestone reached   | canvas-confetti burst                           | 2000ms         | Goal reached, streak milestone, debt paid off |
| Safe-to-spend load  | Ring progress fills with count-up               | 500ms spring   | Center number counts up in sync               |
| Skeleton pulse      | Opacity 0.3 → 0.7 → 0.3                         | 1500ms loop    | Subtle, not distracting                       |
| Privacy blur on     | All `.financial-value` blur(8px)                | 200ms ease     | Smooth, staggered                             |
| Error shake         | Horizontal shake (±4px, 3 cycles)               | 300ms          | Form validation errors                        |
| Success checkmark   | SVG path draw animation                         | 400ms          | After successful save/sync                    |

### Reduced Motion

```typescript
import { useReducedMotion } from '@mantine/hooks';

function AnimatedCard({ children }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduceMotion ? { duration: 0 } : { duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}
```

**Rule**: Every `motion.*` component and CSS animation must be wrapped in a reduced-motion check. Users who set `prefers-reduced-motion: reduce` in their OS get instant state changes with no animation.

---

## 7. Dark Mode Implementation

Dark mode is the PRIMARY theme. Light mode is the alternative.

### Color Mapping

| Element          | Light Mode         | Dark Mode        |
| ---------------- | ------------------ | ---------------- |
| Background       | `#FAFAFA`          | `#1A1B1E`        |
| Surface (cards)  | `#FFFFFF`          | `#25262B`        |
| Surface hover    | `#F8F9FA`          | `#2C2E33`        |
| Surface elevated | `#FFFFFF` + shadow | `#2C2E33` + glow |
| Border           | `#DEE2E6`          | `#373A40`        |
| Text primary     | `#212529`          | `#C1C2C5`        |
| Text secondary   | `#868E96`          | `#909296`        |
| Text disabled    | `#ADB5BD`          | `#5C5F66`        |
| Income values    | `#0099E6`          | `#1AB5FF`        |
| Expense values   | `#E6005E`          | `#FF1A7A`        |
| Savings values   | `#00CC62`          | `#1AFF88`        |
| Accent (teal)    | `#0D9488`          | `#14B8A6`        |
| Danger           | `#DC2626`          | `#EF4444`        |
| Warning          | `#D97706`          | `#F59E0B`        |

### Dark Mode Special Effects

```css
/* Glassmorphism on elevated surfaces (dark mode only) */
[data-mantine-color-scheme="dark"] .glass-card {
  background: rgba(37, 38, 43, 0.85);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

/* Subtle teal glow on hover (dark mode only) */
[data-mantine-color-scheme="dark"] .card-interactive:hover {
  box-shadow: 0 0 20px rgba(20, 184, 166, 0.08);
}

/* Encryption lock icon glow in footer (dark mode) */
[data-mantine-color-scheme="dark"] .encryption-indicator {
  text-shadow: 0 0 8px rgba(20, 184, 166, 0.4);
}
```

---

## 8. Offline Experience Design

The app must feel fully functional offline — not degraded.

### Offline Indicator

**Subtle, not alarming**: Small dot indicator in header or footer that changes color.

- 🟢 Green dot: Connected, synced
- 🟡 Yellow dot: Connected, syncing in progress
- 🔴 Red dot: Offline (with tooltip: "Offline — changes will sync when you reconnect")
- ⚪ Gray dot: Never connected (new install, no account)

**Never**: Full-screen "You're offline" banner. The app works offline — don't make it feel broken.

### Offline-Capable Screens

| Screen            | Offline Behavior                                                  |
| ----------------- | ----------------------------------------------------------------- |
| Dashboard         | Full functionality, cached data                                   |
| Add Transaction   | Full functionality, queued for sync                               |
| View Transactions | Full list from IndexedDB                                          |
| Budget View       | Full functionality                                                |
| Reports/Charts    | Generated from local data                                         |
| Receipt Scanner   | Full OCR (Tesseract.js is local)                                  |
| Settings          | Full access                                                       |
| AI Coach          | Degraded — show pre-computed insights, disable Claude API queries |
| Bank Sync         | Disabled — show last sync time, "Will sync when online"           |
| Plaid Link        | Disabled — requires network                                       |

### Optimistic Updates

Every write operation appears immediately in the UI before sync confirms:

```typescript
// Transaction creation — optimistic
async function addTransaction(txn: Transaction) {
  // 1. Save to IndexedDB immediately
  await db.transactions.add(txn);

  // 2. Update UI immediately (React state)
  dispatch({ type: "TRANSACTION_ADDED", payload: txn });

  // 3. Queue for cloud sync (background)
  syncQueue.enqueue({
    type: "create",
    entity: "transaction",
    data: txn,
    timestamp: Date.now(),
  });

  // 4. If online, sync now. If offline, will sync later.
  if (navigator.onLine) {
    syncEngine.pushPending();
  }
}
```

---

## 9. Accessibility (WCAG 2.2 AA+)

Not optional. Not Phase 8. Built into every component from Phase 1.

| Requirement         | Implementation                                                                                                      |
| ------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Touch targets       | 44px default, 48px recommended, 52px seniors mode                                                                   |
| Focus indicators    | 3px ring, 2px offset, high contrast color                                                                           |
| Reduced motion      | All animations in `useReducedMotion()` guard                                                                        |
| Screen reader       | `aria-label` on all icons; `aria-live` for dynamic values (safe-to-spend updates)                                   |
| Keyboard navigation | Full tab traversal, skip-to-content link, `Escape` to close modals                                                  |
| Color blind         | Icon + label ALWAYS paired with color (never color alone for meaning)                                               |
| RTL layout          | Mantine `dir="rtl"` + CSS logical properties (`margin-inline-start` not `margin-left`)                              |
| Contrast            | 4.5:1 body text, 3:1 large text, verified with axe-core                                                             |
| Zoom/reflow         | All layouts reflow at 200% zoom without horizontal scroll                                                           |
| Form labels         | Every input has a visible label (NOT placeholder-only)                                                              |
| Error messages      | Announced via `aria-live="assertive"`, linked to input via `aria-describedby`                                       |
| Chart alternatives  | Every chart has a table fallback for screen readers                                                                 |
| Currency values     | `aria-label` includes both amount and currency name ("negative eighty-seven dollars and thirty-two cents Canadian") |

### Seniors Mode (Phase 1)

```typescript
// SeniorsModeContext.tsx
const SENIORS_OVERRIDES = {
  fontMultiplier: 1.25, // All text 25% larger
  minTouchTarget: "52px", // Larger touch targets
  animationSpeed: 0.5, // Slower animations (or none)
  simplifiedNavigation: true, // Fewer items in tab bar
  highContrast: true, // Enhanced contrast ratios
  confirmDestructive: true, // Extra confirmation on delete/edit
  showLabelsAlways: true, // Text labels on all icon buttons
};
```

---

## 10. Performance Budgets

| Metric                   | Target                     | Measurement          |
| ------------------------ | -------------------------- | -------------------- |
| Initial bundle (JS)      | < 200KB gzipped            | Vite build output    |
| Total initial load       | < 500KB (JS + CSS + fonts) | Lighthouse           |
| First Contentful Paint   | < 1.5s on 4G               | Lighthouse mobile    |
| Largest Contentful Paint | < 2.5s on 4G               | Lighthouse mobile    |
| Time to Interactive      | < 3.0s on 4G               | Lighthouse mobile    |
| Cumulative Layout Shift  | < 0.1                      | Lighthouse           |
| First Input Delay        | < 100ms                    | Web Vitals           |
| Lighthouse Performance   | ≥ 90                       | Lighthouse mobile    |
| Lighthouse PWA           | 100                        | Lighthouse           |
| Lighthouse Accessibility | ≥ 95                       | Lighthouse           |
| 100K transactions render | Smooth scrolling (60fps)   | Virtual scroll test  |
| Offline cold launch      | < 2s to interactive        | Service worker cache |

### Code Splitting Strategy

```typescript
// Route-level code splitting (React.lazy)
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Transactions = lazy(() => import("./pages/Transactions"));
const Reports = lazy(() => import("./pages/Reports"));
const AICoach = lazy(() => import("./pages/AICoach"));
const ImportWizard = lazy(() => import("./pages/ImportWizard"));
const Settings = lazy(() => import("./pages/Settings"));

// Heavy library lazy loading
const ReceiptScanner = lazy(() => import("./features/ReceiptScanner")); // Tesseract.js
const MonteCarloEngine = lazy(() => import("./features/MonteCarlo")); // TensorFlow.js
const ChartModule = lazy(() => import("./features/Charts")); // Recharts
```

**Rules**:

- Every route is a lazy-loaded chunk
- Heavy libraries (Tesseract.js, TF.js, Recharts) loaded on demand
- Core shell (layout, navigation, auth) in main bundle
- Fonts loaded with `font-display: swap` to prevent FOIT
- Images: WebP format, responsive srcset, lazy loading

---

## 11. Cross-Platform Testing Matrix

### Required Device Testing

| Device                | OS         | Browser    | Priority    | Notes                             |
| --------------------- | ---------- | ---------- | ----------- | --------------------------------- |
| iPhone 15/16          | iOS 17-18  | Safari PWA | 🔴 Critical | Primary mobile target             |
| iPhone SE 3           | iOS 17+    | Safari PWA | 🔴 Critical | Smallest supported screen (375px) |
| iPhone 14 Pro         | iOS 17+    | Safari PWA | 🟡 High     | Dynamic Island handling           |
| iPad Air/Pro          | iPadOS 17+ | Safari PWA | 🟡 High     | Tablet layout, Split View         |
| Samsung Galaxy S24    | Android 14 | Chrome PWA | 🔴 Critical | Primary Android target            |
| Google Pixel 8        | Android 14 | Chrome PWA | 🟡 High     | Stock Android experience          |
| Samsung Galaxy Tab S9 | Android 14 | Chrome PWA | 🟡 High     | Android tablet                    |
| MacBook (Chrome)      | macOS      | Chrome     | 🔴 Critical | Primary desktop browser           |
| MacBook (Safari)      | macOS      | Safari     | 🟡 High     | WebKit differences                |
| Windows (Chrome)      | Windows 11 | Chrome     | 🔴 Critical | Most common desktop               |
| Windows (Edge)        | Windows 11 | Edge       | 🟡 High     | Chromium-based                    |
| Windows (Firefox)     | Windows 11 | Firefox    | 🟢 Medium   | Gecko rendering                   |
| Linux (Chrome)        | Ubuntu     | Chrome     | 🟢 Medium   | Developer audience                |

### Automated Testing

```typescript
// playwright.config.ts
export default defineConfig({
  projects: [
    // Mobile
    { name: "iPhone 15", use: { ...devices["iPhone 15"] } },
    { name: "iPhone SE", use: { ...devices["iPhone SE"] } },
    { name: "Pixel 7", use: { ...devices["Pixel 7"] } },
    // Tablet
    { name: "iPad Pro 11", use: { ...devices["iPad Pro 11"] } },
    // Desktop
    { name: "Desktop Chrome", use: { ...devices["Desktop Chrome"] } },
    { name: "Desktop Safari", use: { ...devices["Desktop Safari"] } },
    { name: "Desktop Firefox", use: { ...devices["Desktop Firefox"] } },
  ],
});
```

**Visual regression tests**: Capture screenshots at every breakpoint for every major screen. Fail CI if pixel diff > 0.1%.

---

## 12. iOS PWA-Specific Implementation Guide

iOS PWAs have unique requirements. These are non-negotiable for a native-feeling experience.

### Meta Tags (index.html)

```html
<meta
  name="viewport"
  content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover"
/>
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="Budget" />
<link rel="apple-touch-icon" href="/icons/apple-touch-icon-180.png" />
<link rel="apple-touch-startup-image" href="/splash/launch.png" />
```

### iOS Splash Screens

Generate splash screens for all iOS device sizes. Use the `apple-touch-startup-image` media queries:

```html
<!-- iPhone 15 Pro Max (430 x 932) -->
<link
  rel="apple-touch-startup-image"
  media="(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)"
  href="/splash/iphone-15-pro-max.png"
/>
<!-- iPhone SE (375 x 667) -->
<link
  rel="apple-touch-startup-image"
  media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)"
  href="/splash/iphone-se.png"
/>
<!-- ... repeat for all device sizes -->
```

### iOS State Preservation

```typescript
// Save app state before iOS suspends the PWA
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    // Save current route, scroll positions, form state to IndexedDB
    saveAppState({
      route: window.location.pathname,
      scrollPositions: getScrollPositions(),
      formState: getActiveFormState(),
      timestamp: Date.now(),
    });
  }
});

// Restore state on relaunch
window.addEventListener("load", async () => {
  const savedState = await loadAppState();
  if (savedState && Date.now() - savedState.timestamp < 3600000) {
    // Within 1 hour
    navigate(savedState.route);
    restoreScrollPositions(savedState.scrollPositions);
  }
});
```

### iOS Install Prompt (Custom Banner)

Since iOS has no `beforeinstallprompt`, build a custom educational banner:

```typescript
function IOSInstallBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

  useEffect(() => {
    // Show after user has used app for 2+ sessions and isn't already installed
    if (isIOS && !isStandalone && getSessionCount() >= 2) {
      setShowBanner(true);
    }
  }, []);

  if (!showBanner) return null;

  return (
    <Alert icon={<IconDownload />} title="Add to Home Screen" withCloseButton onClose={() => setShowBanner(false)}>
      <Text size="sm">
        Tap <IconShare size={16} style={{ display: 'inline' }} /> then "Add to Home Screen" for the full app experience with offline access and notifications.
      </Text>
    </Alert>
  );
}
```

---

## 13. Integration with Execution Plan

This addendum applies to EVERY phase in the execution plan. Specifically:

| Phase       | UI/UX Requirements from This Document                                                                                                                                      |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pre-Phase 0 | Project structure, theme, breakpoints, animation tokens, font loading                                                                                                      |
| Phase 1     | Mobile-first dashboard, bottom tabs, safe-to-spend widget, onboarding flow, empty states, loading skeletons, FAB, iOS/Android PWA meta tags, install prompts, seniors mode |
| Phase 2     | Swipe-to-review gestures, bottom sheets for transaction details, bulk selection UI, receipt scanner camera UI, weekly recap card, push notification permission flow        |
| Phase 3     | Family member avatars, shared/personal toggle, comment threads on transactions, expense splitting UI, streak visualization, confetti celebrations                          |
| Phase 4     | AI coach chat interface (right drawer on desktop, full-screen on mobile), natural language input, insight cards, decision mode overlay                                     |
| Phase 5     | Net worth chart with touch-scrub, investment allocation donut, Monte Carlo confidence bands, dashboard widget drag-and-drop                                                |
| Phase 6     | Document vault file browser, rules engine visual builder, API key management UI                                                                                            |
| Phase 7     | Tax progress bars (RRSP/TFSA room), HST breakdown tables                                                                                                                   |
| Phase 8     | Emotional ROI badge picker, wearable widget previews                                                                                                                       |
| Phase 9     | Benchmarking comparison cards, voice input waveform UI                                                                                                                     |

### Claude Code CLI Instruction

When building ANY component, Claude Code should:

1. **Check this addendum** for the component's mobile/tablet/desktop layout
2. **Use the animation tokens** from Section 6 — never hardcode animation values
3. **Include all states**: default, hover, active, disabled, loading, empty, error
4. **Test at 375px width FIRST** before expanding to wider layouts
5. **Wrap all animations** in `useReducedMotion()` guard
6. **Use CSS logical properties** for RTL support (`margin-inline-start` not `margin-left`)
7. **Add aria labels** to every interactive element
8. **Use Mantine's responsive props**: `<Grid cols={{ base: 1, sm: 2, lg: 3 }}>`
9. **Skeleton screens** for every data-dependent view — no spinners
10. **Optimistic updates** for every write operation — instant UI feedback
