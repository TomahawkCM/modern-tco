# Budget App v1 - Complete Implementation Guide

**Quick Links**:

- [Archon Project](https://archon-mcp) ID: `5b93c0bb-2bb5-4af3-b646-f7540a612dee`
- [Vision & Non-Goals](./01-Vision-and-Non-Goals.md)
- [PRD](./02-PRD-Budget-App-v1.md)
- [Day-1 Kickoff](./15-Day-1-Kickoff-Checklist.md)
- [Demo Scripts](./16-Weekly-Demo-Scripts.md)

---

## 📋 Quick Reference: All Planning Topics

This consolidated guide covers all essential planning topics for Budget App v1 modernization.

---

## 3. Information Architecture & Navigation

### Current State (9 Sections)

- Dashboard, Transactions, Budgets, Loans, Investments, Future Plans, Retirement, Reports, OCR

### Proposed IA Grouping

1. **Core** (always visible)
   - Dashboard
   - Transactions
2. **Planning** (primary tab bar)
   - Budgets
   - Future Plans
3. **Debt** (primary tab bar)
   - Loans
4. **Wealth** (collapsible/More menu)
   - Investments
   - Retirement
5. **Tools** (More menu)
   - Reports
   - OCR / Scan Receipt

### Navigation Patterns

**Desktop** (≥768px):

- Left sidebar: Always visible
- Grouped sections with headers
- Collapsible advanced groups (Wealth, Tools)
- Active state: teal accent, bold text

**Mobile** (<768px):

- **Bottom Tab Bar** (persistent, 4-5 items):
  - Home (Dashboard)
  - Transactions
  - Budgets
  - Loans
  - More (expands to sheet with remaining sections)
- **Touch targets**: 48px minimum height
- **Labels**: Icons + text (not icons-only for clarity)

**Command Palette** (all devices):

- Trigger: Cmd/Ctrl+K
- Fuzzy search: Navigate to any section
- Quick actions: "Add Transaction", "Import CSV", "New Budget"
- Theme switcher

### Empty States

**Every section needs**:

- Friendly illustration (not stock photo)
- Clear headline: "No transactions yet"
- CTA button: "Add Your First Transaction"
- Optional help text: "Track where your money goes"

---

## 4. Interaction Model & UI Patterns

### Core Patterns

**Buttons**:

- Primary: Teal background, white text, 48px height (mobile)
- Secondary: Teal border, teal text, 48px height
- Ghost: No border, teal text on hover
- Destructive: Red background, white text + confirmation required

**Forms**:

- Labels above inputs (not floating/inline)
- Native HTML5 types: `type="number"`, `type="date"`
- Real-time validation (debounced)
- Error messages below field in red with icon
- Success states with green checkmark

**Lists & Tables**:

- Row height: 56px minimum (mobile)
- Alternating backgrounds (subtle gray-50/white)
- Hover states on desktop (gray-100)
- Swipe actions on mobile (delete, edit)

**Dialogs & Modals**:

- Max-width: 600px
- Focus trap (Tab cycles through modal only)
- Close on Escape key
- Backdrop click closes (unless destructive action)

**Toasts**:

- Bottom-center on mobile
- Top-right on desktop
- Auto-dismiss: 4s (success), 6s (warning), manual (error)
- Respect reduced motion (no slide animation)

---

## 5. Design System - Token Sheet

### Spacing Scale (Tailwind)

```
0:   0px
1:   4px
2:   8px
3:   12px
4:   16px
5:   20px
6:   24px
8:   32px
10:  40px
12:  48px
16:  64px
```

### Typography

**Base Size**: 18px (up from 16px for seniors-friendliness)

**Scale**:

- `text-xs`: 14px (captions, metadata)
- `text-sm`: 16px (secondary content)
- `text-base`: 18px (body text, default)
- `text-lg`: 20px (section headers)
- `text-xl`: 24px (page titles)
- `text-2xl`: 30px (dashboard metrics)
- `text-3xl`: 36px (large numbers)

**Font Stack**: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif

### Color Tokens

**Light Mode**:

```css
--color-background: #ffffff;
--color-foreground: #1a1a1a;
--color-primary: #14b8a6 (teal-500);
--color-secondary: #6b7280 (gray-500);
--color-muted: #f3f4f6 (gray-100);
--color-border: #e5e7eb (gray-200);
```

**Dark Mode**:

```css
--color-background: #0a0a0a;
--color-foreground: #f5f5f5;
--color-primary: #14b8a6 (teal-500, same);
--color-secondary: #9ca3af (gray-400);
--color-muted: #1f2937 (gray-800);
--color-border: #374151 (gray-700);
```

**High-Contrast Mode**:

```css
--color-background: #000000;
--color-foreground: #ffffff;
--color-primary: #00d4aa (lighter teal, 7: 1 contrast);
--color-secondary: #cccccc;
--color-muted: #1a1a1a;
--color-border: #666666;
```

**Semantic Colors** (all modes):

- Success: Green-500 (#10b981) / Green-400
- Warning: Yellow-500 (#eab308) / Yellow-400
- Error: Red-500 (#ef4444) / Red-400
- Info: Blue-500 (#3b82f6) / Blue-400

### Motion Tokens

```css
--duration-fast: 150ms;
--duration-normal: 300ms;
--duration-slow: 500ms;
--easing-default: cubic-bezier(0.4, 0, 0.2, 1);
--easing-emphasized: cubic-bezier(0.2, 0, 0, 1);
```

**Reduced Motion** (`prefers-reduced-motion: reduce`):

```css
--duration-fast: 0ms;
--duration-normal: 50ms;
--duration-slow: 50ms;
```

---

## 6. Accessibility Checklist (WCAG 2.2 AA)

### Visual

- [ ] Contrast ratio ≥4.5:1 for text (all theme modes)
- [ ] Contrast ratio ≥3:1 for UI components (buttons, borders)
- [ ] Non-color indicators (icons, patterns) for status
- [ ] Text resizable to 200% without loss of functionality
- [ ] No content loss at 320px viewport width

### Interactive

- [ ] All functionality keyboard accessible (no mouse-only)
- [ ] Visible focus indicators (2px teal ring)
- [ ] Touch targets ≥48px × 48px (WCAG 2.2 new)
- [ ] Skip links to main content
- [ ] No keyboard traps

### Content

- [ ] Page titles descriptive (`<title>Budget App - Transactions</title>`)
- [ ] Headings hierarchical (h1 → h2 → h3, no skips)
- [ ] Form labels associated (`<label for="..."`)
- [ ] Error messages descriptive ("Amount must be greater than $0")
- [ ] Alt text for images/charts

### Screen Readers

- [ ] Landmarks (nav, main, aside, footer)
- [ ] ARIA labels where HTML insufficient
- [ ] Live regions for dynamic content (toasts)
- [ ] Chart text alternatives ("Spending: Food 30%, Transport 20%...")
- [ ] Table headers with proper scope

---

## 7. MVP Scope & Cutlines

### Must-Have (P0) - Blocking Launch

- ✅ All existing features preserved (transactions, budgets, loans, imports)
- ✅ 3 theme modes working (light, dark, high-contrast)
- ✅ Reduced motion mode
- ✅ Mobile-first navigation (tab bar + command palette)
- ✅ 18px base typography
- ✅ AI chatbot (OpenAI) with basic queries
- ✅ WCAG 2.2 AA compliance (95+ Lighthouse score)
- ✅ PWA install works on all platforms
- ✅ User & developer documentation

### Should-Have (P1) - Launch with Caveats

- Dashboard customization (widget visibility, order)
- Storybook component playground
- Onboarding tour
- Advanced chatbot actions (add transaction, create budget)
- User acceptance testing with 5+ seniors

### Could-Have (P2) - Defer to v1.1

- Voice input for transactions
- Receipt OCR auto-categorization
- Budget templates (50/30/20 rule, etc.)
- Investment portfolio performance charts
- Retirement income projection calculator
- Spending insights with trend analysis

---

## 8. Import Playbook (CSV/PDF)

**Current Implementation**: Already working! CSV/OFX/QFX import with 15+ bank support.

**v1 Enhancements**:

- Larger preview table (show first 20 rows, not 10)
- Clearer duplicate indicators (badge: "Duplicate", tooltip with match reason)
- Better error messages ("Column 'Date' not found. Please select date column manually.")
- Import history widget on dashboard ("Last import: 100 transactions on Nov 8")

**Duplicate Detection Strategy**:

1. **Perfect match** (OFX only): `FITID` unique identifier
2. **Fuzzy match** (CSV): Date ±1 day + Amount exact + Description 80% similar
3. **AI match** (optional): OpenAI API confidence scoring (already implemented)

**Error Handling**:

- Invalid date format → "Date '2023-32-01' is invalid. Expected format: YYYY-MM-DD"
- Missing required column → "Amount column required. Please map a column."
- File too large → "File exceeds 5MB. Please split into smaller files."

---

## 9. Loans Spec (Amortization & Extra Payments)

**Current Implementation**: Fully working with amortization chart, payment history, extra payment calculator.

**v1 UI Enhancements**:

- **Amortization Chart**:
  - Clearer legend ("Principal" / "Interest" with icons)
  - Tooltip on hover: "Month 24: $350 principal, $150 interest"
  - Keyboard navigation (arrow keys move through months)
  - Text alternative: "120-month amortization: Months 1-36 are 70% interest, 37-120 are 60% principal"
- **Extra Payment Calculator**:
  - Slider for extra amount ($0-$1000/month)
  - Instant visual feedback on chart
  - Plain language result: "Pay $200 extra/month → Payoff in 8 years (2 years faster), save $4,320 in interest"
- **Payment History**:
  - Table with sortable columns (Date, Amount, Principal, Interest, Balance)
  - Filter by year
  - Export to CSV

---

## 10. Reports & Dashboards Spec

**Dashboard Widgets** (Week 1 default layout):

1. **Metric Cards** (4 cards, full-width row):
   - Net Worth, Income MTD, Expenses MTD, Net Savings MTD
2. **Category Spending** (half-width):
   - Pie chart (top 5 categories)
   - Text alternative: List format with percentages
3. **Income vs Expense Trend** (half-width):
   - Line chart (6 months)
   - Text alternative: "Oct: +$500, Nov: -$200, ..."
4. **Recent Transactions** (full-width):
   - Last 10 transactions
   - "View All" link to transactions page

**Reports Page** (dedicated section):

- Monthly spending breakdown (table + chart)
- Year-over-year comparison
- Category trends (12 months)
- Budget vs actual
- Debt payoff progress
- Export all reports to CSV

---

## 11. Performance & Offline Strategy

**IndexedDB (Dexie v9)**:

- Current schema: 14 tables (transactions, budgets, loans, etc.)
- Migrations: Auto-upgrade on version change
- Indexes: Compound indexes for fast queries

**PWA Service Worker**:

- Cache-first: App shell, static assets
- Network-first: Dynamic data (transactions, budgets)
- Offline fallback page
- Background sync for pending imports

**Performance Targets**:

- Bundle size: <300KB initial
- Code splitting: Route-based chunks
- Lazy loading: Charts (Recharts), heavy components
- Image optimization: WebP with PNG fallback

---

## 12. Telemetry & Privacy

**Analytics** (PostHog, self-hosted only):

- Opt-in required (banner on first visit)
- Events tracked:
  - Page views
  - Feature usage (transaction added, budget created)
  - Error events (crash reports)
  - Performance metrics (TTI, LCP)
- **No PII**: Hash user IDs, no transaction amounts/descriptions

**Error Monitoring** (Sentry, optional):

- Production errors only
- Stack traces, browser info
- User consent required

**Privacy Policy** (in-app, /privacy):

- Data never leaves device (local-first)
- Optional analytics with opt-in
- No third-party tracking or ads
- Export/delete data anytime

---

## 13. QA & Test Plan

**Playwright E2E Tests**:

- Critical user flows:
  - Add/edit/delete transaction
  - Create budget, track progress
  - Import CSV (sample file)
  - Navigate between sections
  - Switch theme modes
  - Use chatbot
- Run in 3 modes: light, dark, high-contrast
- Cross-browser: Chromium, Firefox, WebKit

**Manual Testing**:

- Accessibility audit (keyboard, screen reader)
- Device testing (iOS Safari, Android Chrome, Desktop)
- Performance audit (Lighthouse on 3G throttling)
- Visual regression (Percy or Chromatic)

**User Testing**:

- 5+ seniors (60+)
- Tasks: Add transaction, create budget, import CSV, use chatbot
- Success metric: 95%+ completion rate, <90s for transaction entry

---

## 14. Release Plan (2-4 Weeks)

### Week 1: Research & Design

- **Deliverables**: Competitive analysis, IA sitemap, token spec
- **Demo**: Friday - Present research findings

### Week 2: Navigation & Accessibility

- **Deliverables**: New navigation live, 3 theme modes working
- **Demo**: Friday - Show mobile/desktop nav, theme switching

### Week 3: UI Polish & Chatbot

- **Deliverables**: Dashboard polished, feature UIs improved, chatbot functional
- **Demo**: Friday - Full app walkthrough with chatbot queries

### Week 4: QA & Launch

- **Deliverables**: All tests passing, docs published, deployed to production
- **Demo**: Friday - Launch-ready presentation with UAT results

**Launch Checklist**:

- [ ] All 60 Archon tasks marked "done"
- [ ] Playwright tests passing (80%+ coverage)
- [ ] Lighthouse scores 95+ (all pages, all modes)
- [ ] UAT completed (5+ seniors, 95%+ success)
- [ ] Docs published (user guide + dev docs)
- [ ] Production deployed (PWA verified)
- [ ] Error monitoring active
- [ ] Rollback plan documented

**Go/No-Go Criteria**:

- ✅ No P0 bugs
- ✅ Accessibility compliance verified
- ✅ Performance targets met
- ✅ UAT feedback addressed

**Post-Launch (Week 5)**:

- Monitor error rates (target <0.1%)
- Track success metrics (PWA install rate, return rate)
- Collect user feedback
- Plan v1.1 features

---

## 🚀 Getting Started

1. Read [Vision & Non-Goals](./01-Vision-and-Non-Goals.md)
2. Review [PRD](./02-PRD-Budget-App-v1.md)
3. Follow [Day-1 Kickoff](./15-Day-1-Kickoff-Checklist.md)
4. Access Archon tasks: `find_tasks(project_id="5b93c0bb-2bb5-4af3-b646-f7540a612dee")`
5. Start Week 1 research tasks

**Questions?** Check the planning docs or ask in team channel.

**Ready to build!** 🎨
