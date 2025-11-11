# Budget App v1 - UX Principles & Design Goals

**Date**: November 9, 2025
**Version**: 1.0
**Status**: Final
**Owner**: Product Designer + UX Specialist

---

## Purpose of This Document

This document defines the **core UX principles and measurable design goals** that will guide all design and implementation decisions for Budget App v1. These principles synthesize findings from:

1. **Competitive Analysis** (5 budget apps: Mint, YNAB, Monarch, Copilot, Simplifi)
2. **Mobile Navigation Analysis** (Notion, Todoist, Chase Bank, NN/g research)
3. **Seniors-Friendly UI Patterns** (AARP, GoodRx, Medisafe + academic research)
4. **Budget App UX Audit** (37 improvement opportunities identified)

**How to Use**:
- **Design Decisions**: When choosing between two design approaches, check which aligns better with these principles
- **Code Reviews**: Reject implementations that violate core principles (e.g., touch targets <48px)
- **Feature Prioritization**: Features that support multiple principles take priority
- **Success Metrics**: Track these metrics weekly to measure progress toward goals

---

## Core UX Principles

### 1. **Accessible to All Ages (60+ Optimized)**

**Principle**: Design for users aged 60-80 first. If it works for seniors, it works for everyone.

**What This Means**:
- ✅ **18px base typography** (not 16px industry standard)
- ✅ **48px minimum touch targets** (not 44px iOS minimum)
- ✅ **7:1 contrast in high-contrast mode** (not just 4.5:1 WCAG AA)
- ✅ **Plain language labels** ("Add Money" not "Create Inflow Transaction")
- ✅ **Reduced cognitive load** (4-5 dashboard widgets max, not 7+)
- ❌ **No jargon** (no "budget variance", "amortization schedule" without tooltips)
- ❌ **No tiny text** (no text-xs/12px anywhere)

**Decision Framework**:
- Before adding a feature: "Can my 70-year-old parent use this without my help?"
- Before shipping UI: "Would this pass a contrast checker at 7:1?"

**Competitive Advantage**: **No budget app** currently optimizes for seniors (18px+ type, 48px+ targets, 7:1 contrast)

**Success Metrics**:
| Metric | Baseline | Target (v1) | How to Measure |
|--------|----------|-------------|----------------|
| Base font size | 16px | 18px | Tailwind config |
| Minimum touch target | 44px | 48px | Automated test (Playwright) |
| Lighthouse Accessibility | Unknown | 95+ | CI/CD check |
| Seniors task completion | N/A | 90%+ | User testing (5 users, 5 tasks) |
| Text-xs usage | 23 instances | 0 instances | `grep -r "text-xs" src/` |

**Reject If**:
- Touch target <48px
- Base text size <18px
- Color-only differentiation
- Jargon without explanation
- >6 widgets on default dashboard

---

### 2. **Mobile-First Always**

**Principle**: Design for mobile (375px width) first, then scale up. Mobile users are the majority.

**What This Means**:
- ✅ **Bottom tab bar** for primary navigation (Home, Transactions, Budgets, More)
- ✅ **4 tabs maximum** (not 5) - proven pattern from Copilot, YNAB, Monarch
- ✅ **Sheet menu** for secondary navigation (accessed via "More")
- ✅ **Pull-to-refresh** on all list pages
- ✅ **Swipe gestures** for common actions (swipe-to-delete)
- ✅ **Mobile-first responsive** (single column → multi-column)
- ❌ **No hamburger-only** navigation on mobile
- ❌ **No horizontal scrolling** required

**Decision Framework**:
- Design mobile view FIRST for every feature
- Desktop is enhancement, not requirement
- Test every page on iPhone SE (smallest common screen: 375x667px)

**Competitive Advantage**: Hybrid navigation (tab bar + menu) is modern standard we're adopting

**Success Metrics**:
| Metric | Baseline | Target (v1) | How to Measure |
|--------|----------|-------------|----------------|
| Mobile tab bar items | 5 | 4 | layout.tsx navigation |
| Mobile task completion | N/A | 95%+ | User testing (mobile-only) |
| Horizontal scroll pages | Unknown | 0 | Visual review |
| Pull-to-refresh pages | 1 (Transactions) | 5 (all lists) | Feature audit |
| Mobile-first components | Unknown | 100% | Code review |

**Reject If**:
- Requires horizontal scrolling
- Hamburger-only navigation
- >4 items in mobile tab bar
- Feature only works on desktop

---

### 3. **3-Tap Maximum to Any Feature**

**Principle**: Users should reach any feature within 3 taps from the home screen. Zero dead ends.

**What This Means**:
- ✅ **Flat information architecture** (max 3 levels deep)
- ✅ **Breadcrumbs** on all pages (Dashboard > Loans > Mortgage Details)
- ✅ **Command palette** (Cmd/Ctrl+K) for power users (1-tap to anywhere)
- ✅ **Quick actions** on dashboard (Add Transaction, Import CSV, View Reports)
- ❌ **No hidden features** (everything in navigation or command palette)
- ❌ **No dead ends** (always a clear path back)

**Decision Framework**:
- Count taps from dashboard to feature: ≤3 taps OR accessible via command palette
- Always provide breadcrumbs on pages >2 levels deep
- Critical actions (Add Transaction) should be 1-tap from anywhere

**Tap Count Audit**:
| Feature | Current Taps | Target Taps | Path |
|---------|--------------|-------------|------|
| Add Transaction | 1 | 1 | Tab bar → Transactions (has FAB) |
| View Budget | 2 | 2 | Tab bar → Budgets |
| Import CSV | 2 | 2 | More → Import CSV |
| View Loan Details | 3 | 3 | More → Loans → Select Loan |
| Change Theme | 3 | 3 | More → Settings → Theme (or Cmd+K → "theme") |
| Generate Report | 3 | 3 | More → Reports → Select Type |

**Command Palette** (1-tap to anywhere):
```
Cmd/Ctrl+K opens:
- "new transaction" → Add Transaction modal
- "import" → Import CSV page
- "theme dark" → Switch to dark mode
- "budget groceries" → Jump to Groceries budget
- (fuzzy search all features)
```

**Success Metrics**:
| Metric | Baseline | Target (v1) | How to Measure |
|--------|----------|-------------|----------------|
| Features >3 taps away | Unknown | 0 | IA audit |
| Command palette | Not implemented | Implemented | Feature check |
| Breadcrumbs on pages | 0 pages | All pages >2 levels | Code audit |
| Dashboard quick actions | 3 | 5+ | page.tsx check |

**Reject If**:
- Feature requires >3 taps AND not in command palette
- Page has no breadcrumbs (if >2 levels deep)
- Dead end (no way back to dashboard)

---

### 4. **WCAG 2.2 AA Compliant (Industry First)**

**Principle**: Meet or exceed WCAG 2.2 Level AA standards. First budget app to publicly claim this.

**What This Means**:
- ✅ **48px touch targets** (2.5.8 Target Size - Level AA new in WCAG 2.2)
- ✅ **4.5:1 text contrast** minimum (1.4.3 Contrast - Level AA)
- ✅ **3:1 UI component contrast** (1.4.11 Non-text Contrast - Level AA)
- ✅ **Keyboard navigation** for all features (2.1.1 Keyboard - Level A)
- ✅ **Screen reader labels** (sr-only, ARIA) (4.1.2 Name, Role, Value - Level A)
- ✅ **Reduced motion mode** (2.3.3 Animation from Interactions - Level AAA, but we're doing it)
- ✅ **Focus indicators** visible on all interactive elements (2.4.7 Focus Visible - Level AA)
- ✅ **Data table alternatives** for all charts (1.1.1 Non-text Content - Level A)
- ❌ **No color-only differentiation** (1.4.1 Use of Color - Level A)
- ❌ **No keyboard traps** (2.1.2 No Keyboard Trap - Level A)

**Decision Framework**:
- Run axe DevTools on EVERY page before merging PR
- Test with NVDA (Windows), VoiceOver (Mac/iOS), JAWS (enterprise)
- All new features must pass Lighthouse Accessibility audit (95+)
- Manual keyboard navigation test required

**Competitive Advantage**: **First budget app** to publicly claim WCAG 2.2 AA compliance

**Success Metrics**:
| Metric | Baseline | Target (v1) | How to Measure |
|--------|----------|-------------|----------------|
| Lighthouse Accessibility | Unknown | 95+ | Automated (CI/CD) |
| axe DevTools violations | Unknown | 0 critical | Automated (CI/CD) |
| Keyboard navigable pages | Unknown | 100% | Manual testing |
| Screen reader errors | Unknown | 0 critical | NVDA/VoiceOver/JAWS |
| Focus indicator coverage | Unknown | 100% | Visual audit |
| Charts with table toggle | 0 of 2 | 2 of 2 | Feature check |

**Testing Checklist** (before launch):
- [ ] Lighthouse: 95+ on all pages
- [ ] axe DevTools: 0 critical violations
- [ ] NVDA: All pages navigable
- [ ] VoiceOver: All pages navigable
- [ ] JAWS: Forms and tables work
- [ ] Keyboard only: Complete 5 tasks
- [ ] Color contrast: All text 4.5:1+, UI 3:1+

**Reject If**:
- Lighthouse Accessibility <95
- axe DevTools shows critical violations
- Color-only differentiation (red=bad, green=good without icon/text)
- Focus not visible on interactive element
- Feature not keyboard-accessible

---

### 5. **Progressive Disclosure (Simplicity First)**

**Principle**: Show the essentials, hide the complexity. Advanced features are available, not prominent.

**What This Means**:
- ✅ **Default dashboard**: 4-5 widgets (metrics, budget status, recent transactions, quick actions)
- ✅ **Advanced dashboard**: User can show/hide 5+ additional widgets (charts, insights, anomaly alerts)
- ✅ **Simple forms**: Amount, category, date, note. Advanced fields (tags, splits, recurring) collapsible
- ✅ **Smart defaults**: Today's date, last category used, suggested payee
- ✅ **Progressive complexity**: Basic → Intermediate → Advanced user paths
- ❌ **No information overload**: Don't show 10 metrics on first visit
- ❌ **No required advanced fields**: Split transactions, tags, recurring patterns are optional

**Decision Framework**:
- Essential (shown by default): What 80% of users need 80% of the time
- Advanced (hidden/collapsible): What 20% of users need or 80% need rarely
- Test with new users: "What should happen when you click this button?"

**Default vs Advanced**:
| Feature | Default (Simple) | Advanced (Hidden/Collapsible) |
|---------|------------------|-------------------------------|
| **Add Transaction** | Amount, category, date, note | Split, tags, recurring pattern, receipt upload |
| **Dashboard** | 4 widgets: Metrics, Budget, Transactions, Quick Actions | 6 widgets: Charts, Insights, Anomalies, Debt, Recurring |
| **Budget Progress** | Current month only | Historical trends, forecasting |
| **Loan Details** | Balance, next payment | Amortization schedule, early payoff calculator |
| **Categories** | Preset categories (Groceries, Gas, etc.) | Custom categories, subcategories, icons |

**Success Metrics**:
| Metric | Baseline | Target (v1) | How to Measure |
|--------|----------|-------------|----------------|
| Default dashboard widgets | 7+ | 4-5 | page.tsx config |
| Transaction form fields shown | Unknown | 4 required, rest collapsible | Component audit |
| New user onboarding time | N/A | <5 min to first transaction | User testing |
| Feature discovery rate | N/A | 60%+ discover advanced features by week 2 | Analytics |
| Cognitive load score | N/A | <40 (SUS System Usability Scale) | User survey |

**Reject If**:
- Dashboard shows >6 widgets by default
- Form requires >5 fields for basic transaction
- Advanced feature is not discoverable (no tooltip, help text, or onboarding hint)
- User confused by options ("What does this do?")

---

### 6. **Privacy-First & Local-First**

**Principle**: Data lives on the user's device. Zero server sync, zero tracking, zero data mining.

**What This Means**:
- ✅ **IndexedDB storage** (all transactions, budgets, categories local)
- ✅ **No server calls** for budget data
- ✅ **Offline-first PWA** (works without internet)
- ✅ **User controls export** (CSV, JSON, PDF - their data, their choice)
- ✅ **AI chatbot opt-in** with clear data usage explanation
- ❌ **No analytics without consent** (PostHog only if user opts in)
- ❌ **No external API calls** for core features
- ❌ **No cloud sync** (maybe future feature, but never required)

**Decision Framework**:
- Does this feature send data to a server? → Requires opt-in consent
- Can this work offline? → Make it work offline first
- Does this use cookies/tracking? → Requires cookie consent banner

**Competitive Advantage**: Mint (shutdown), YNAB, Monarch, Copilot all require accounts + cloud sync. We're **local-first**.

**Success Metrics**:
| Metric | Baseline | Target (v1) | How to Measure |
|--------|----------|-------------|----------------|
| Core features offline | Unknown | 100% | Offline testing |
| Server calls (non-AI) | Unknown | 0 | Network inspector |
| AI opt-in rate | N/A | 40%+ | Analytics (if opted in) |
| Data export formats | CSV only | CSV, JSON, PDF | Feature check |
| PWA installable | No | Yes | Lighthouse PWA check |

**Reject If**:
- Core feature requires internet
- Analytics/tracking enabled by default
- Data sent to server without explicit user action (export, AI chat)
- Feature breaks when offline

---

### 7. **Delight Through Performance**

**Principle**: Fast is a feature. Smooth animations, instant feedback, <3s page loads.

**What This Means**:
- ✅ **<3s Time to Interactive (TTI)** on 4G mobile
- ✅ **<1s page transitions** (Next.js App Router)
- ✅ **Instant feedback** on user actions (optimistic UI updates)
- ✅ **Skeleton loaders** instead of spinners (DashboardSkeleton)
- ✅ **Progressive rendering** (metrics → charts → widgets)
- ✅ **Respect reduced motion** (instant transitions for accessibility)
- ✅ **Smooth animations** (60fps) when motion-safe
- ❌ **No blocking operations** (lazy load heavy dependencies: TensorFlow, Recharts)
- ❌ **No jank** (no >16ms frame times on interactions)

**Decision Framework**:
- Lighthouse Performance score: ≥90 on mobile (4G throttled)
- Run performance budget check on every PR
- User should FEEL the speed difference vs competitors

**Performance Budget**:
| Metric | Current | Target (v1) | Blocker Fix |
|--------|---------|-------------|-------------|
| Initial Bundle Size | 1.6MB | 0.8MB (-50%) | Route-based code splitting |
| Time to Interactive (TTI) | 5.8s | 3.8s (-34%) | Lazy load TensorFlow/Recharts |
| First Contentful Paint (FCP) | Unknown | <2s | Optimize fonts, images |
| Largest Contentful Paint (LCP) | Unknown | <3s | Image optimization, lazy load charts |
| Cumulative Layout Shift (CLS) | Unknown | <0.1 | Reserve space for dynamic content |

**Animation Standards**:
- Fast (150ms): Button hovers, focus rings
- Normal (300ms): Page transitions, modals open/close
- Slow (500ms): Data visualizations, progressive reveals
- Reduced motion: 0ms (instant) for all animations

**Success Metrics**:
| Metric | Baseline | Target (v1) | How to Measure |
|--------|----------|-------------|----------------|
| Lighthouse Performance | Unknown | 90+ (mobile) | CI/CD |
| TTI | 5.8s | <3.8s | Lighthouse |
| Bundle size | 1.6MB | <0.8MB | webpack-bundle-analyzer |
| User-perceived speed rating | N/A | 4.5/5 | User survey |
| Frame rate during animations | Unknown | 60fps | Chrome DevTools |

**Reject If**:
- Lighthouse Performance <90
- Blocking operation on UI thread >500ms
- Animation <60fps (when motion-safe)
- Bundle size increase without justification

---

## Design Goals & Success Metrics

### Goal 1: Launch-Ready Accessibility (P0)

**Goal**: Achieve WCAG 2.2 AA compliance and 95+ Lighthouse Accessibility score across all pages before v1 launch.

**Why This Matters**:
- **Competitive advantage**: First budget app to publicly claim WCAG 2.2 AA
- **Legal compliance**: Meets ADA requirements for public-facing apps
- **Seniors-friendly**: Ensures 60+ users can use all features

**Success Criteria**:
- [ ] Lighthouse Accessibility ≥95 on ALL pages (Dashboard, Transactions, Budgets, Loans, Reports, Settings)
- [ ] axe DevTools: 0 critical violations
- [ ] Manual screen reader testing: NVDA, VoiceOver, JAWS pass
- [ ] Keyboard navigation: All features accessible without mouse
- [ ] Touch targets: ALL buttons/links ≥48x48px
- [ ] Color contrast: ALL text ≥4.5:1, UI ≥3:1
- [ ] High-contrast mode: ≥7:1 contrast on all text

**Timeline**: Week 1-2 of implementation (P0 blockers from audit)

**Owner**: Accessibility Engineer + Frontend Specialist

**Tracking**: Create automated accessibility test in CI/CD (fail PR if Lighthouse <95)

---

### Goal 2: Seniors-First Typography & Touch Targets (P0)

**Goal**: Implement 18px base typography and 48px minimum touch targets as the new standard, tested with users 60+.

**Why This Matters**:
- **Untapped market**: NO budget apps currently optimize for seniors
- **Age-related vision**: 18px readable without reading glasses for most 60-69 year-olds
- **Motor skills**: 48px targets accommodate arthritis, tremors, reduced dexterity

**Success Criteria**:
- [ ] Base font size: 18px (Tailwind `text-base` updated in config)
- [ ] Minimum touch target: 48x48px on ALL interactive elements
- [ ] text-xs (12px) usage: 0 instances in codebase
- [ ] Seniors user testing: 90%+ task completion rate (5 users, 5 tasks each)
- [ ] No user feedback: "Text too small" or "Button hard to tap"

**Timeline**: Week 1 (global config change + search/replace)

**Owner**: Frontend Specialist + Design System Architect

**Tracking**:
```bash
# Automated check in CI/CD
npm run check-typography  # Fails if text-xs found or base != 18px
npm run check-touch-targets  # Fails if any button <48px
```

**User Testing Tasks**:
1. Add a grocery expense of $45.67
2. View your budget for Groceries
3. Find a transaction from last month
4. Change theme to high-contrast mode
5. Export your transactions to CSV

---

### Goal 3: Mobile-First Navigation (4-Tab Standard) (P0)

**Goal**: Refactor mobile navigation to 4-tab bottom bar + grouped "More" menu, matching industry standards.

**Why This Matters**:
- **Proven pattern**: Copilot (4.8/5), YNAB, Monarch all use 4 tabs
- **Thumb-reach ergonomics**: 5 tabs harder to reach on large phones
- **Reduced cognitive load**: Fewer choices = faster decisions

**Success Criteria**:
- [ ] Mobile tab bar: Exactly 4 items (Home, Transactions, Budgets, More)
- [ ] "More" menu: Grouped into 3 sections (Tracking, Wealth, Tools)
- [ ] Touch targets: min-h-[48px] on all tab bar items (up from 44px)
- [ ] Desktop sidebar: Grouped with same 3 sections
- [ ] Mobile user testing: 95%+ successfully find "Loans" in More menu

**Timeline**: Week 2 (refactor layout.tsx)

**Owner**: React Specialist + UX Specialist

**Before/After**:
```typescript
// BEFORE (5 tabs)
[Home] [Transactions] [Loans] [Budgets] [More]

// AFTER (4 tabs)
[Home] [Transactions] [Budgets] [More]

// "More" menu (grouped)
TRACKING & ANALYSIS
- Scan Receipt
- Loans  ← moved here
- Reports
- Categories

WEALTH & PLANNING
- Investments
- Future Plans
- Retirement

TOOLS & SETTINGS
- Import CSV
- Export Data
- Settings
```

---

### Goal 4: Theme Modes (Light + Dark + High-Contrast) (P0)

**Goal**: Implement 3-mode theme system with persistent user preference, including industry-first high-contrast mode.

**Why This Matters**:
- **Accessibility**: High-contrast mode (7:1) helps low-vision users
- **Modern expectation**: Dark mode is table stakes in 2025
- **Competitive first**: NO budget apps offer high-contrast mode

**Success Criteria**:
- [ ] 3 theme modes implemented: Light, Dark, High-Contrast
- [ ] Theme switcher in Settings (3 large buttons, 64px touch targets)
- [ ] Persistent preference (localStorage)
- [ ] Auto-detect `prefers-color-scheme: dark` on first visit
- [ ] High-contrast mode: ≥7:1 contrast on ALL text (white on black)
- [ ] All charts readable in all 3 themes
- [ ] Theme switch: <200ms transition (smooth)

**Timeline**: Week 1-2 (design system refactor)

**Owner**: Design System Architect + Frontend Architect

**Testing**:
- [ ] Contrast checker (Stark plugin): All pass 7:1 in high-contrast mode
- [ ] User testing: "Which theme do you prefer?" (track adoption)
- [ ] Lighthouse: Still 95+ in all 3 themes

**Color Tokens**:
```typescript
// High-Contrast Mode (7:1+ minimum)
{
  background: '#000000',       // Pure black
  foreground: '#FFFFFF',       // Pure white (21:1)
  primary: '#5EEAD4',          // Teal-300 lighter (12.6:1)
  // All UI: 7:1+ contrast
  // All borders: 3:1+ contrast
}
```

---

### Goal 5: Command Palette for Power Users (P1)

**Goal**: Implement Cmd/Ctrl+K command palette for 1-tap access to any feature (fuzzy search).

**Why This Matters**:
- **Power user love**: Copilot (4.8/5) has this, users rave about it
- **Accessibility**: Keyboard-only users can navigate without mouse
- **Efficiency**: Faster than 3 taps for power users

**Success Criteria**:
- [ ] Cmd/Ctrl+K opens command palette
- [ ] Fuzzy search all features (transactions, budgets, settings, navigation)
- [ ] Keyboard-only operation (arrow keys, enter, escape)
- [ ] Recent actions at top of list
- [ ] Theme switching: "theme dark" instantly switches
- [ ] Quick actions: "new transaction" opens modal
- [ ] Search transactions: "groceries" shows matching transactions
- [ ] Power user adoption: 30%+ use command palette weekly

**Timeline**: Week 2-3

**Owner**: Frontend Specialist + React Specialist

**shadcn Component**: Use `Command` component (keyboard-accessible)

**Command Examples**:
```
Type "new" → "New Transaction", "New Budget", "New Loan"
Type "theme" → "Light Mode", "Dark Mode", "High-Contrast Mode"
Type "import" → "Import CSV", "Import OFX", "Import QFX"
Type "groceries" → Shows all grocery transactions
Type "budget" → "View Budgets", "Add Budget", "Budget Report"
```

---

### Goal 6: Dashboard Widget Customization (P1)

**Goal**: Allow users to show/hide dashboard widgets and reorder via drag-and-drop (defaults to simplified 4-5 widgets).

**Why This Matters**:
- **Progressive disclosure**: Seniors get simple 4-widget dashboard, power users customize
- **User preference**: Monarch Money (high rating) offers this
- **Reduced cognitive load**: Hide widgets you don't use

**Success Criteria**:
- [ ] Default dashboard: 4-5 widgets (Net Worth, Monthly Summary, Budget Status, Recent Transactions, Quick Actions)
- [ ] Widget settings: Show/hide each widget (toggle)
- [ ] Advanced widgets hidden by default: Charts, Insights, Anomalies, Debt, Recurring
- [ ] Drag-and-drop reordering (desktop)
- [ ] Settings persisted to localStorage
- [ ] Mobile: Vertical drag-and-drop (same as desktop behavior)
- [ ] Widget adoption: Track which widgets users show/hide

**Timeline**: Week 3

**Owner**: React Specialist + UX Specialist

**Default vs Advanced Widgets**:
```typescript
// DEFAULT (simple, shown to new users)
const defaultWidgets = [
  'net-worth',           // 4 metric cards
  'budget-status',       // Top 3 budgets
  'recent-transactions', // Last 8 transactions
  'quick-actions',       // Add, Import, Reports buttons
];

// ADVANCED (hidden, power users enable)
const advancedWidgets = [
  'spending-by-category',  // Pie chart
  'income-vs-expenses',    // Area chart
  'recurring-transactions', // Auto-detected patterns
  'anomaly-alerts',        // Unusual spending
  'debt-overview',         // Loan summary
];
```

---

## How to Use These Principles in Practice

### Scenario 1: Adding a New Feature

**Example**: User requests "Recurring transaction templates"

**Questions to Ask**:
1. **Accessible to All Ages**: Can a 70-year-old create a template without my help?
   - ✅ Use plain language: "Repeat This Transaction" not "Create Recurring Template"
   - ✅ 48px button touch targets
   - ✅ 18px label text

2. **Mobile-First**: Does this work on a phone?
   - ✅ Bottom sheet for template creation (not modal)
   - ✅ Large form fields (52px height)
   - ✅ Swipe to delete template

3. **3-Tap Maximum**: How do users find this?
   - ✅ Add button in transaction form: "Repeat This Transaction"
   - ✅ Command palette: "recurring templates" → list all
   - Path: Transaction form → "Repeat" button = 2 taps ✅

4. **WCAG 2.2 AA**: Is this accessible?
   - ✅ Keyboard navigation: Tab through form fields
   - ✅ Screen reader: "Create recurring transaction. Repeat every 30 days."
   - ✅ Test with axe DevTools before merge

5. **Progressive Disclosure**: Is this essential or advanced?
   - ❌ Advanced feature (20% of users)
   - ✅ Hide behind "Repeat This Transaction" collapsible section in form
   - ✅ Don't show by default on simple transaction form

6. **Privacy-First**: Does this send data to a server?
   - ✅ No, stored in IndexedDB locally
   - ✅ Works offline

7. **Delight Through Performance**: Is this fast?
   - ✅ Instant feedback when creating template (optimistic UI)
   - ✅ No API call, just IndexedDB write (<10ms)

**Decision**: ✅ Implement with progressive disclosure, mobile-first, accessible design

---

### Scenario 2: Design Decision (Button Size)

**Decision**: Designer proposes 40x40px icon buttons for mobile transaction list actions.

**Analysis**:
- ❌ **Violates Principle 1** (Accessible to All Ages): 40px < 48px minimum
- ❌ **Violates Principle 4** (WCAG 2.2 AA): WCAG 2.5.8 requires 24px minimum, we target 48px
- ✅ **Aligns with Principle 2** (Mobile-First): Touch-optimized

**Decision**: ❌ Reject → Increase to min-h-[48px] min-w-[48px]

---

### Scenario 3: Prioritizing Features

**3 feature requests**:
1. Add cryptocurrency tracking
2. Add high-contrast mode
3. Add loan amortization calculator

**Scoring against principles** (1 point per principle aligned):
| Feature | P1 | P2 | P3 | P4 | P5 | P6 | P7 | Total | Priority |
|---------|----|----|----|----|----|----|----|----|----------|
| Crypto | 0 | 0 | 0 | 0 | 0 | 1 | 0 | **1** | P2 (nice-to-have) |
| High-Contrast | 1 | 1 | 1 | 1 | 0 | 1 | 0 | **5** | **P0** (launch blocker) |
| Amortization | 0 | 1 | 1 | 0 | 1 | 1 | 0 | **4** | P1 (post-launch) |

**Decision**:
1. **High-contrast mode** (5 principles) → P0, ship in v1
2. **Amortization calculator** (4 principles) → P1, ship post-launch
3. **Crypto tracking** (1 principle) → P2, maybe later

---

## Success Tracking Dashboard

**Track weekly in standups**:

| Metric | Week 1 | Week 2 | Week 3 | Week 4 | Target |
|--------|--------|--------|--------|--------|--------|
| **Lighthouse Accessibility** | ? | ? | ? | ? | 95+ |
| **Base font size** | 16px | 18px ✅ | 18px | 18px | 18px |
| **Touch targets <48px** | ? | 0 ✅ | 0 | 0 | 0 |
| **Mobile tab bar items** | 5 | 5 | 4 ✅ | 4 | 4 |
| **Theme modes** | 1 (Light) | 3 ✅ | 3 | 3 | 3 |
| **Command palette** | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Dashboard widgets** | 7 | 7 | 5 ✅ | 5 | 4-5 |
| **Lighthouse Performance** | ? | ? | 90+ ✅ | 90+ | 90+ |

---

## Revision History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2025-11-09 | Initial principles defined based on Epic 1 research | Product Designer |
| | | | |

---

**Next Document**: `/docs/design-system/theme-modes.md` (Design System implementation)
