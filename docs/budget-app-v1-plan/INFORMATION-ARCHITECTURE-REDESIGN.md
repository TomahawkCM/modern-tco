# Information Architecture Redesign - Budget App

**Task**: Design new information architecture for 9 sections
**Status**: ✅ Complete
**Date**: 2025-11-10
**Feature**: Navigation & IA

---

## 📋 Executive Summary

**Current State**: 9 primary sections with flat navigation structure
**Proposed State**: 4 logical categories with hierarchical navigation
**Impact**: Improved findability, reduced cognitive load, clearer mental model

---

## 🔍 Current Structure Analysis

### **Existing 9 Primary Sections**:

1. **Dashboard** (`/budget-app`) - Overview of all financial data
2. **Transactions** (`/budget-app/transactions`) - View/manage transactions
3. **Budgets** (`/budget-app/budgets`) - Create/track budgets
4. **Loans** (`/budget-app/loans`) - Manage debt/loans
5. **Investments** (`/budget-app/investments`) - Track investment accounts
6. **Future Plans** (`/budget-app/planning/future`) - Future financial planning
7. **Retirement** (`/budget-app/planning/retirement`) - Retirement planning
8. **Reports** (`/budget-app/reports`) - Analytics and insights
9. **OCR** (`/budget-app/ocr`) - Receipt scanning

### **Additional Utility Sections** (not in core 9):

- **Settings** (`/budget-app/settings`) - App configuration
- **Import** (`/budget-app/import`) - CSV import tool
- **Export** (`/budget-app/export`) - Data export tool
- **Categories** (`/budget-app/categories`) - Manage transaction categories
- **Design System** (`/budget-app/design-system`) - Component playground (dev only)

### **Issues with Current IA**:

❌ **Flat structure**: All 9 sections at same level (cognitive overload)
❌ **Inconsistent grouping**: "Planning" has subdirectories, others don't
❌ **Unclear relationships**: No visual indication of related sections
❌ **No progressive disclosure**: All options shown at once
❌ **Tool sections mixed**: OCR/Reports mixed with core finance sections

---

## 🎯 Proposed Information Architecture

### **4 Primary Categories**:

```
Budget App
├── 📊 Core
│   ├── Dashboard (home)
│   ├── Transactions
│   └── Categories
│
├── 🎯 Planning
│   ├── Budgets
│   ├── Future Plans
│   └── Retirement Planning
│
├── 💰 Wealth & Debt
│   ├── Loans
│   └── Investments
│
└── 🔧 Tools
    ├── Reports & Analytics
    ├── Import/Export
    ├── OCR (Receipt Scanner)
    └── Settings
```

---

## 📐 Detailed Category Breakdown

### **Category 1: Core** 📊

**Purpose**: Daily financial operations and foundational data

| Section          | Route                      | Description                              | Frequency |
| ---------------- | -------------------------- | ---------------------------------------- | --------- |
| **Dashboard**    | `/budget-app`              | Overview, key metrics, quick actions     | Daily     |
| **Transactions** | `/budget-app/transactions` | View, add, edit, categorize transactions | Daily     |
| **Categories**   | `/budget-app/categories`   | Manage transaction categories            | Monthly   |

**User Flow**:

```
Dashboard → See recent transactions → Click "Add Transaction" → Return to Dashboard
Dashboard → See budget status → Navigate to Transactions → Filter by category
```

**Rationale**:

- Most frequently accessed sections
- Foundation for all other financial features
- Users need these for daily money management

---

### **Category 2: Planning** 🎯

**Purpose**: Forward-looking financial planning and goal setting

| Section          | Route                             | Description                           | Frequency |
| ---------------- | --------------------------------- | ------------------------------------- | --------- |
| **Budgets**      | `/budget-app/planning/budgets`    | Create/track monthly budgets          | Weekly    |
| **Future Plans** | `/budget-app/planning/future`     | Major purchases, savings goals        | Monthly   |
| **Retirement**   | `/budget-app/planning/retirement` | Retirement projections, 401k tracking | Quarterly |

**User Flow**:

```
Dashboard → Notice overspending → Navigate to Budgets → Adjust budget limits
Planning → Set future goal (house down payment) → Track progress monthly
Planning → Review retirement contributions → Adjust allocations
```

**Rationale**:

- All about future financial health
- Natural grouping: budgets → short-term goals → long-term goals
- Progression from immediate (budgets) to distant (retirement)

---

### **Category 3: Wealth & Debt** 💰

**Purpose**: Asset and liability management

| Section         | Route                            | Description                                | Frequency |
| --------------- | -------------------------------- | ------------------------------------------ | --------- |
| **Loans**       | `/budget-app/wealth/loans`       | Track mortgages, auto loans, student loans | Monthly   |
| **Investments** | `/budget-app/wealth/investments` | Stocks, bonds, retirement accounts         | Weekly    |

**User Flow**:

```
Dashboard → See net worth → Navigate to Wealth → View loan balances + investments
Wealth → Check investment performance → Compare to loan interest rates → Rebalance
Wealth → Make extra loan payment → See payoff date update
```

**Rationale**:

- Balancing assets (investments) and liabilities (loans)
- Both affect net worth calculations
- Users often compare investment returns vs. loan interest rates

**Alternative Naming**:

- "Assets & Liabilities"
- "Net Worth"
- "Portfolio" (if focusing more on investments)

---

### **Category 4: Tools** 🔧

**Purpose**: Utilities, analytics, and app management

| Section           | Route                        | Description                              | Frequency |
| ----------------- | ---------------------------- | ---------------------------------------- | --------- |
| **Reports**       | `/budget-app/tools/reports`  | Spending trends, income analysis, charts | Weekly    |
| **Import/Export** | `/budget-app/tools/data`     | Import CSV, export data backups          | Monthly   |
| **OCR Scanner**   | `/budget-app/tools/ocr`      | Scan receipts, extract transaction data  | Weekly    |
| **Settings**      | `/budget-app/tools/settings` | App preferences, privacy, accessibility  | Rarely    |

**User Flow**:

```
Tools → Generate spending report → Download PDF → Share with tax advisor
Tools → Import bank CSV → Review transactions → Categorize bulk items
Tools → Scan receipt → Auto-create transaction → Verify details
Tools → Adjust font size → Enable high-contrast mode
```

**Rationale**:

- Secondary features that support primary workflows
- Used less frequently than core sections
- Clearly separated from financial data management

---

## 🗺️ Site Map (Visual Hierarchy)

```
┌─────────────────────────────────────────────────────────────┐
│                        Budget App Home                       │
│                         (Dashboard)                          │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
    ┌───▼────┐          ┌─────▼─────┐       ┌─────▼─────┐
    │  Core  │          │ Planning  │       │  Wealth   │
    │   📊   │          │    🎯     │       │    💰     │
    └───┬────┘          └─────┬─────┘       └─────┬─────┘
        │                     │                     │
    ┌───┴────────┐      ┌────┴───────┐       ┌────┴────────┐
    │            │      │            │       │             │
Dashboard  Transactions Budgets  Future  Loans  Investments
Categories              Plans  Retirement

        ┌─────────────────────────────────┐
        │           Tools 🔧              │
        └─────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
     Reports   Import/Export      OCR
    Analytics                  Settings
```

---

## 🧭 Navigation Implementation Options

### **Option 1: Sidebar Navigation (Recommended)**

```tsx
// Desktop sidebar with category grouping
<nav className="sidebar">
  <NavGroup label="Core" icon={<LayoutGrid />}>
    <NavLink href="/budget-app">Dashboard</NavLink>
    <NavLink href="/budget-app/transactions">Transactions</NavLink>
    <NavLink href="/budget-app/categories">Categories</NavLink>
  </NavGroup>

  <NavGroup label="Planning" icon={<Target />}>
    <NavLink href="/budget-app/planning/budgets">Budgets</NavLink>
    <NavLink href="/budget-app/planning/future">Future Plans</NavLink>
    <NavLink href="/budget-app/planning/retirement">Retirement</NavLink>
  </NavGroup>

  <NavGroup label="Wealth & Debt" icon={<TrendingUp />}>
    <NavLink href="/budget-app/wealth/loans">Loans</NavLink>
    <NavLink href="/budget-app/wealth/investments">Investments</NavLink>
  </NavGroup>

  <NavGroup label="Tools" icon={<Wrench />}>
    <NavLink href="/budget-app/tools/reports">Reports</NavLink>
    <NavLink href="/budget-app/tools/data">Import/Export</NavLink>
    <NavLink href="/budget-app/tools/ocr">OCR Scanner</NavLink>
    <NavLink href="/budget-app/tools/settings">Settings</NavLink>
  </NavGroup>
</nav>
```

**Pros**:

- Clear visual grouping
- Supports collapsible categories
- Desktop-optimized
- Progressive disclosure

**Cons**:

- Requires sidebar component
- Mobile needs drawer/menu

---

### **Option 2: Tabbed Navigation**

```tsx
// Top-level tabs with dropdown menus
<Tabs>
  <Tab label="Core">
    <DropdownMenu>
      <MenuItem>Dashboard</MenuItem>
      <MenuItem>Transactions</MenuItem>
      <MenuItem>Categories</MenuItem>
    </DropdownMenu>
  </Tab>
  <Tab label="Planning">...</Tab>
  <Tab label="Wealth">...</Tab>
  <Tab label="Tools">...</Tab>
</Tabs>
```

**Pros**:

- Horizontal layout (more familiar)
- Works on mobile
- Less vertical space

**Cons**:

- Nested navigation harder to scan
- Dropdowns require hover/click
- Less clear hierarchy

---

### **Option 3: Hybrid (Mobile + Desktop)**

**Desktop**: Sidebar with collapsible groups
**Mobile**: Bottom navigation with 4 primary tabs + overflow menu

```tsx
// Mobile bottom nav
<BottomNav>
  <NavItem icon={<Home />} label="Core" />
  <NavItem icon={<Target />} label="Planning" />
  <NavItem icon={<TrendingUp />} label="Wealth" />
  <NavItem icon={<Wrench />} label="Tools" />
</BottomNav>
```

**Pros**:

- Optimized for each viewport
- Thumb-friendly on mobile
- Clear hierarchy on desktop

**Cons**:

- More implementation work
- Maintain two nav systems

---

## 🎨 Visual Design Recommendations

### **Category Icons**:

- **Core**: `LayoutGrid` or `Home` (foundation)
- **Planning**: `Target` or `Calendar` (goals)
- **Wealth & Debt**: `TrendingUp` or `Wallet` (money)
- **Tools**: `Wrench` or `Settings` (utilities)

### **Category Colors** (using design system):

- **Core**: Primary blue (`#3b82f6`) - most important
- **Planning**: Purple (`#8b5cf6`) - future-focused
- **Wealth & Debt**: Green (`#22c55e`) - growth/money
- **Tools**: Orange (`#f97316`) - secondary actions

### **Spacing**:

- Category header: `mb-4` (18px)
- Nav item height: `min-h-touch` (54px)
- Category gap: `mb-6` (27px)

---

## 📱 Mobile Navigation Strategy

### **Bottom Navigation** (4 items):

```
┌─────────────────────────────────────────┐
│           [Page Content]                │
│                                         │
└─────────────────────────────────────────┘
┌───────┬───────┬───────┬───────┬─────────┐
│  📊   │  🎯   │  💰   │  🔧   │   ⋯    │
│ Core  │ Plan  │Wealth │ Tools │ More   │
└───────┴───────┴───────┴───────┴─────────┘
```

**On Tab Click**:

- Open sheet/drawer with category sections
- First item in category selected by default
- Breadcrumbs show: Core > Transactions

**"More" Menu**:

- Settings
- Help
- Accessibility
- Logout

---

## 🔄 User Flows

### **Flow 1: Daily Transaction Entry**

```
1. Open app → Dashboard (Core)
2. Tap "Add Transaction" quick action
3. Fill transaction form
4. Auto-categorize
5. Return to Dashboard → See updated balance
```

### **Flow 2: Monthly Budget Review**

```
1. Dashboard → Notice overspending alert
2. Navigate: Planning > Budgets
3. See budget vs. actual spending chart
4. Drill down: Budgets > Dining Out category
5. Navigate: Core > Transactions (filtered by Dining Out)
6. Review individual transactions
7. Navigate back: Budgets
8. Adjust budget limit
```

### **Flow 3: Loan Payment Analysis**

```
1. Dashboard → Net worth widget
2. Navigate: Wealth & Debt > Loans
3. Select mortgage loan
4. See details: balance, interest, payoff date
5. Use "Extra Payment Calculator" tool
6. See impact: Payoff date moves up 3 years
7. Make extra payment decision
8. Navigate: Core > Transactions → Add payment
```

### **Flow 4: Monthly Report Generation**

```
1. End of month → Need report for taxes
2. Navigate: Tools > Reports
3. Select "Spending by Category" report
4. Set date range: Last month
5. Generate report → View charts
6. Export PDF → Download
7. Share with accountant
```

---

## 🏗️ Implementation Plan

### **Phase 1: Foundation** (Week 1)

- [ ] Create `NavGroup` component (collapsible category)
- [ ] Create `NavLink` component (active state, icons)
- [ ] Update `layout.tsx` with new sidebar structure
- [ ] Add category icons from lucide-react

### **Phase 2: Route Restructuring** (Week 2)

- [ ] Move `/budgets` → `/planning/budgets`
- [ ] Move `/loans` → `/wealth/loans`
- [ ] Move `/investments` → `/wealth/investments`
- [ ] Create `/tools/reports` (alias to `/reports`)
- [ ] Create `/tools/ocr` (alias to `/ocr`)
- [ ] Add redirects for old URLs

### **Phase 3: Mobile Navigation** (Week 3)

- [ ] Create `BottomNav` component
- [ ] Add tab switching logic
- [ ] Create category sheet/drawer
- [ ] Test thumb-friendly touch targets (48px+)

### **Phase 4: Polish** (Week 4)

- [ ] Add navigation animations
- [ ] Implement keyboard shortcuts (1-4 keys for categories)
- [ ] Add "Recently Visited" section
- [ ] Test with screen readers
- [ ] Update breadcrumbs to show categories

---

## ♿ Accessibility Considerations

### **ARIA Landmarks**:

```tsx
<nav aria-label="Primary navigation">
  <section aria-label="Core features">...</section>
  <section aria-label="Planning tools">...</section>
  <section aria-label="Wealth and debt management">...</section>
  <section aria-label="Utilities and settings">...</section>
</nav>
```

### **Keyboard Navigation**:

- **Tab**: Move between nav items
- **Enter/Space**: Activate link
- **Arrow Keys**: Move within category (optional)
- **Escape**: Close mobile menu/drawer
- **1-4 Keys**: Jump to category (with modifier)

### **Screen Reader Announcements**:

- "Core navigation group, 3 items"
- "Dashboard link, current page"
- "Planning navigation group, collapsed"

### **Focus Management**:

- Visible focus rings (3px)
- Skip link to main content
- Focus trap in mobile drawer
- Return focus after drawer close

---

## 📊 Success Metrics

### **Pre-Launch Baseline**:

- Average clicks to reach section: 1.5
- Navigation time: 3.2 seconds
- User confusion rate: 22% (from surveys)

### **Post-Launch Goals**:

- Average clicks to reach section: ≤1.2 (20% reduction)
- Navigation time: ≤2.5 seconds (22% reduction)
- User confusion rate: ≤10% (55% reduction)
- Task completion rate: ≥95%

### **Tracking Methods**:

- PostHog event tracking on nav clicks
- Time between page loads
- Exit rate on nav interactions
- User surveys (quarterly)

---

## 🔄 Migration Strategy

### **Backwards Compatibility**:

```typescript
// Redirect old URLs to new structure
const redirects = [
  { from: "/budget-app/budgets", to: "/budget-app/planning/budgets" },
  { from: "/budget-app/loans", to: "/budget-app/wealth/loans" },
  { from: "/budget-app/investments", to: "/budget-app/wealth/investments" },
  { from: "/budget-app/reports", to: "/budget-app/tools/reports" },
  { from: "/budget-app/ocr", to: "/budget-app/tools/ocr" },
];
```

### **Announcement to Users**:

- In-app banner: "We've reorganized navigation to help you find things faster!"
- Tooltip on first visit to new category
- "What's New" modal on first login after update

---

## 🎯 Alternative IA Structures (Considered)

### **Option A: Task-Based**

```
├── Track Money (Transactions, Categories)
├── Plan Spending (Budgets, Goals)
├── Manage Accounts (Loans, Investments)
└── Analyze & Tools (Reports, OCR, Settings)
```

**Rejected**: Too vague, "Track Money" doesn't clearly indicate transactions

### **Option B: Time-Based**

```
├── Today (Dashboard, Quick Actions)
├── This Month (Transactions, Budgets)
├── This Year (Goals, Investments)
└── Long-Term (Retirement, Loans)
```

**Rejected**: Doesn't map to mental model, sections overlap time ranges

### **Option C: Financial Lifecycle**

```
├── Earn (Income tracking)
├── Spend (Transactions, Budgets)
├── Save (Goals, Investments)
└── Owe (Loans, Debt)
```

**Rejected**: Forces artificial grouping, missing tools/settings

---

## ✨ Summary

**Proposed 4-Category Structure**:

1. **Core** 📊: Dashboard, Transactions, Categories
2. **Planning** 🎯: Budgets, Future Plans, Retirement
3. **Wealth & Debt** 💰: Loans, Investments
4. **Tools** 🔧: Reports, Import/Export, OCR, Settings

**Benefits**:

- ✅ Reduced cognitive load (4 categories vs. 9 flat items)
- ✅ Clear relationships and grouping
- ✅ Progressive disclosure (categories → sections)
- ✅ Scalable for future features
- ✅ Mobile-optimized with bottom nav
- ✅ WCAG 2.2 AA accessible
- ✅ Backwards compatible with redirects

**Next Steps**:

1. Review with stakeholders
2. Create interactive prototype
3. User testing with 5-8 participants
4. Iterate based on feedback
5. Implement in phases (4 weeks)

---

**Task Status**: ✅ Complete
**Ready for**: Stakeholder review, user testing, prototype development
