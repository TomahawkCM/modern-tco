# Missing & Improvable Features — Gap Analysis

## Overview

This document identifies features that are either missing from the online plan, already built offline but not accounted for in the cloud migration, or represent untapped market opportunities that no competitor addresses well.

**Methodology**: Codebase audit of all 35+ IndexedDB tables, 36 pages, 50+ components, and 18 AI modules cross-referenced against the phased rollout plan, competitive landscape, and current market trends (Reddit user requests, fintech industry reports, app store reviews).

---

## Category A: Built Offline But Missing From Online Plan

These features already exist in the codebase with tables, pages, and/or components. They are NOT mentioned in the phased rollout and need cloud sync schemas, AI integration, and online UX enhancements.

### A1. Properties Management

**Existing code**: `src/app/budget-app/properties/`, `properties` table in IndexedDB

**Current capabilities**: Add properties with purchase price, current value, mortgage details, tax information, HOA fees, rental income tracking.

**What's missing for online**:

- Supabase schema for `budget_properties` with household_id
- Auto-valuation API integration (Zillow Zestimate API for US, Zoopla for UK)
- Household-shared property ownership (joint property between family members)
- Net worth integration (properties as assets)
- AI tool: `get_properties` — "What's my real estate equity?" "How much have my properties appreciated?"
- Mortgage payoff projections linked to debt scenarios

**Phase assignment**: Phase 3 (Competitive Edge) — extends net worth completeness

---

### A2. Expense Splitting

**Existing code**: `splitPeople`, `expenseSplits` tables, split-related UI components

**Current capabilities**: Track who paid what, split transactions among people, basic split calculations.

**What's missing for online**:

- Cloud sync for splits across household members (real-time)
- Settlement tracking: "Sarah owes Rob $23.50" with one-tap settle
- Splitwise-like running balance between household members
- Group splits for shared expenses (groceries, utilities, rent)
- AI tool: `get_expense_splits` — "Who owes what?" "How much do I owe Sarah this month?"
- AI tool: `create_split` — "Split the Costco receipt 60/40 with Sarah"
- Push notification when someone logs a shared expense

**Phase assignment**: Phase 2 (AI + Family) — natural extension of household features

---

### A3. Paycheck Planning

**Existing code**: `paycheckPlans` table, paycheck allocation page

**Current capabilities**: 6-paycheck lookahead, allocate paycheck amounts to budget categories, track allocation vs actual spending.

**What's missing for online**:

- Cloud sync of paycheck plans
- AI-assisted allocation: "Distribute my $2,450 paycheck" → AI suggests optimal allocation based on budget status, upcoming bills, and savings goals
- Family shared visibility: partner can see paycheck allocation plans
- Recurring paycheck templates (save allocation pattern, auto-apply)
- AI tool: `allocate_paycheck` — "I got paid $2,450, distribute it"

**Phase assignment**: Phase 2 (AI + Family) — extends AI assistant capability

---

### A4. Event Budgets

**Existing code**: `eventBudgets`, `eventBudgetCategories` tables

**Current capabilities**: Create project-specific budgets (vacation, wedding, home renovation) with dedicated category tracking separate from monthly budgets.

**What's missing for online**:

- Cloud sync for event budgets
- Collaborative event planning: family members contribute to shared event budget
- Per-member contribution tracking ("Rob paid $500, Sarah paid $350")
- Event budget timeline/deadline with countdown
- AI tool: `get_event_budgets` — "How much have we spent on the vacation so far?" "Are we on track for the wedding budget?"
- Photo/receipt attachment per event expense

**Phase assignment**: Phase 3 (Competitive Edge) — unique differentiator

---

### A5. Debt Scenario Modeling

**Existing code**: `debtScenarios` table, debt payoff calculators (`src/app/budget-app/calculators/`)

**Current capabilities**: Snowball vs avalanche comparison, calculate payoff timelines, extra payment impact analysis.

**What's missing for online**:

- Cloud persistence of saved scenarios
- AI-powered "what-if" analysis: "What if I pay $200 extra per month on my car loan?"
- Side-by-side scenario comparison visualization
- Integration with paycheck planning (auto-allocate extra to debt)
- AI tool: `get_loan_details` with `extra_payment` parameter
- Shared household debt payoff strategy (partner visibility)

**Phase assignment**: Phase 3 (Competitive Edge) — extends financial calculators

---

### A6. Loan Amortization

**Existing code**: `loans`, `loanPayments` tables, loan-related calculators

**Current capabilities**: Track loans with balances, interest rates, payment history, remaining term.

**What's missing for online**:

- Detailed amortization schedule view (month-by-month principal vs interest breakdown)
- Extra payment impact visualization ("Pay $100 extra → save $4,200 in interest, pay off 2 years early")
- Cloud sync of loan data
- AI awareness: "When will my car loan be paid off?" "How much interest have I paid this year?"
- Refinancing comparison: "Your current rate is 6.5%. Rates are now 5.2% — refinancing could save you $X"

**Phase assignment**: Phase 3 (extends existing calculators)

---

### A7. Net Worth Snapshots

**Existing code**: `netWorthSnapshots` table

**Current capabilities**: Periodic snapshots of total assets minus liabilities.

**What's missing for online**:

- Historical net worth charting over months/years with trend line
- Household combined net worth view
- Per-asset-class breakdown (cash, investments, property, retirement)
- AI awareness: "How has my net worth changed this year?" "What's driving the increase?"
- Milestone celebrations: "Your net worth crossed $100K!"
- Comparison to national/age-based averages (anonymized, opt-in)

**Phase assignment**: Phase 2 (extends dashboard)

---

### A8. Budget Rollovers

**Existing code**: `budgetRollovers` table

**Current capabilities**: Carry over unused budget from one month to the next (YNAB-style "roll with the punches").

**What's missing for online**:

- Cloud sync of rollover state
- Visual indicator on budget bars showing carried-over amounts
- AI awareness of rollover balances: "You have $50 rolled over in dining from last month"
- Configurable rollover rules per category (some categories roll over, some reset)
- Maximum rollover caps to prevent excessive accumulation

**Phase assignment**: Phase 1 (part of core budget sync)

---

### A9. Merchant Intelligence

**Existing code**: `merchantRules`, `merchantCorrections` tables, `src/lib/ai/smart-transaction-enrichment.ts`

**Current capabilities**: AI-powered merchant name correction, category assignment rules, user corrections stored for future matching.

**What's missing for online**:

- Crowdsourced merchant database: online users contribute corrections (anonymized)
- Improved AI categorization accuracy from collective data (Standard tier only)
- Merchant logo/icon lookup service
- "Smart suggestions": When user categorizes a merchant, suggest category based on how other users categorized it
- Regional merchant awareness (different merchants in different countries)
- Privacy-preserving aggregation (only share merchant→category mappings, never amounts or frequency)

**Phase assignment**: Phase 2 (natural fit with AI enhancement)

---

## Category B: Improvable With Cloud/AI

Features that exist but would be significantly enhanced with cloud infrastructure and AI integration.

### B1. ML Categorization Model

**Current state**: TensorFlow.js local model at `src/lib/ai/ml-model-training-pipeline.ts`

**Current limitation**: Model trains only on individual user's data (small dataset = low accuracy)

**Online enhancement**:

- Cloud model training on anonymized aggregate data (Standard tier only — respects encryption tiers)
- Pre-trained models downloaded to device for offline inference
- Accuracy improvement from orders-of-magnitude larger training dataset
- Federated learning approach for E2E tier (model updates without exposing data)
- Per-locale models (different spending patterns in different countries)

**Phase assignment**: Phase 3

---

### B2. Receipt OCR Pipeline

**Current state**: Local camera capture at `src/app/budget-app/ocr/`

**Online enhancement**:

- Cloud OCR pipeline with higher accuracy (Google Vision API or AWS Textract)
- Auto-match receipt to bank-synced transaction (amount + date + merchant)
- AI line-item splitting: photograph grocery receipt → split into food categories
- Receipt storage in Supabase Storage (searchable, backed up)
- Multi-language receipt parsing (114 locales)

**Phase assignment**: Phase 2 (extends AI capabilities)

---

### B3. Calendar Integration

**Current state**: ICS export at `src/app/api/calendar/ics/route.ts`

**Online enhancement**:

- Interactive visual calendar view (not just export)
- Bill due dates with color-coding by category
- Paydays marked with income amount
- Budget reset dates
- Drag-to-reschedule bills
- Subscription renewal dates
- Event budget milestones
- Google Calendar / Apple Calendar two-way sync

**Phase assignment**: Phase 4

---

### B4. Financial Reports

**Current state**: Basic reports page with charts

**Online enhancement**:

- AI-narrated reports: "Your February spending was 8% lower than January, primarily driven by..."
- Shareable PDF reports (household monthly summary for family meetings)
- Year-over-year comparison charts
- Tax-ready expense summaries by category
- Custom date range reports
- Category deep-dive reports with trend analysis

**Phase assignment**: Phase 3

---

### B5. Import Pipeline

**Current state**: CSV/OFX/PDF import with AI matching

**Online enhancement**:

- Cloud-powered duplicate detection across devices (same transaction imported on phone and laptop)
- Shared import mappings in household (one person's mapping rules apply to all)
- AI learns from all family members' corrections (collective intelligence)
- Automatic bank statement detection (recognize bank format without user selection)
- Cloud-stored import history (re-import with improved mappings)

**Phase assignment**: Phase 2 (natural fit with cloud sync)

---

### B6. Friday Review (Weekly Guided Review)

**Current state**: Likely a guided weekly review flow or placeholder

**Online enhancement**:

- AI-guided review ritual: "Let's review your week together"
- Step-by-step walkthrough:
  1. Review uncategorized transactions
  2. Check budget status for each category
  3. Upcoming bills this week
  4. Progress toward savings goals
  5. AI suggestions for budget adjustments
- Customizable review day (not just Friday)
- Household joint review option (both partners go through it together)
- Streak tracking for consistent reviews

**Phase assignment**: Phase 2 (extends AI assistant)

---

## Category C: Completely Missing (Market Opportunities)

Features that don't exist in the codebase at all. Prioritized by user demand signals and competitive differentiation potential.

### C1. BNPL (Buy Now, Pay Later) Tracking — HIGH PRIORITY

**Market signal**: BNPL market projected at $450B+ by 2026. Services like Klarna, Afterpay, Affirm, PayPal Pay-in-4 are used by 45% of Gen Z and Millennials. No budget app tracks BNPL obligations well — they show up as confusing partial transactions.

**Feature design**:

- Dedicated BNPL tracker: add a BNPL plan (merchant, total, installment count, dates)
- Automatic detection: AI recognizes BNPL patterns in transactions ("Klarna", "Afterpay")
- Obligation dashboard: total BNPL outstanding, next installments due
- Budget impact: BNPL installments counted as committed spending in "safe to spend"
- AI warning: "You have $340 in BNPL obligations due this month"
- Interest tracking for interest-bearing BNPL plans

**Phase assignment**: Phase 3

---

### C2. Refund Tracking — HIGH PRIORITY

**Market signal**: Common Reddit complaint — returns and refunds get lost. Users want to track "I returned the $89 jacket, where's my refund?"

**Feature design**:

- Link refund to original transaction
- Status tracking: pending → processing → received
- Expected refund date (merchant-specific estimates)
- Notification when refund arrives (matched by amount)
- AI: "Do I have any pending refunds?" "The refund from Amazon should arrive by Tuesday"
- Dashboard widget showing pending refund total

**Phase assignment**: Phase 2

---

### C3. Annual Financial Review / Year-in-Review — HIGH PRIORITY

**Market signal**: Spotify Wrapped generated massive social sharing. Financial year-in-review has viral potential and builds engagement.

**Feature design**:

- Generated every December/January
- Animated story format (swipeable cards):
  - Total earned, spent, saved
  - Biggest spending category
  - Biggest single purchase
  - Most frequented merchant
  - Savings goal progress
  - Net worth change
  - "Financial personality" (saver, spender, investor, etc.)
  - Streak statistics
  - Gamification achievements earned
- Shareable image/card (privacy-safe: percentages, not amounts)
- Comparison to previous year
- Goal setting for next year based on insights

**Phase assignment**: Phase 3

---

### C4. Spending Heatmap — MEDIUM PRIORITY

**Market signal**: Popular in personal finance subreddits. Visual, intuitive, shareable.

**Feature design**:

- GitHub-style contribution graph but for spending
- Color intensity = spending amount per day
- Hover/tap to see daily total
- Filter by category
- Identify patterns: "You spend most on weekends" "Tuesday is your cheapest day"
- Year-at-a-glance view

**Phase assignment**: Phase 3

---

### C5. Money Flow (Sankey) Diagram — MEDIUM PRIORITY

**Market signal**: Highly upvoted in r/personalfinance. Visually compelling way to understand money flow.

**Feature design**:

- Interactive Sankey diagram: Income sources → Budget categories → Top merchants
- Monthly or custom date range
- Clickable nodes to drill into transactions
- Exportable as image
- AI narration: "Most of your dining budget goes to DoorDash ($180/mo)"

**Phase assignment**: Phase 3

---

### C6. Geo-Tagged Spending — MEDIUM PRIORITY

**Market signal**: Useful for travel budgets, identifying spending patterns by location.

**Feature design**:

- Map view of spending locations (opt-in, uses browser geolocation)
- Cluster view for frequent locations
- Travel mode: auto-detect when spending in a different city/country
- Travel budget tracking (auto-categorize by trip)
- Privacy: location data stored locally only (never synced to cloud unless explicitly shared)

**Phase assignment**: Phase 4

---

### C7. Crypto/Digital Asset Tracking — LOW PRIORITY

**Market signal**: Growing demand but niche. CoinGecko API is free.

**Feature design**:

- Read-only portfolio view (manual entry, not wallet connection)
- CoinGecko API for price data
- Include in net worth calculation
- Basic P&L tracking
- NOT a trading platform — just tracking

**Phase assignment**: Phase 4

---

### C8. Green Finance / Carbon Footprint — LOW PRIORITY

**Market signal**: Emerging trend in Europe. Klarna shows CO2 estimates per purchase. Regulatory pressure increasing.

**Feature design**:

- Estimate CO2 from spending categories using standard factors
- Monthly carbon footprint report
- Comparison to national average
- Tips to reduce impact
- "Green score" alongside financial health score

**Phase assignment**: Phase 4

---

### C9. Tax Optimization Hints — MEDIUM PRIORITY

**Market signal**: Users want help at tax time. No budget app provides locale-aware tax suggestions.

**Feature design**:

- Locale-aware deduction suggestions: "You've spent $X on home office supplies — this may be deductible"
- Category-based tax classification (business vs personal for self-employed)
- Tax-ready export by category for accountants
- Country-specific rules (US: Schedule C, UK: Self Assessment, etc.)
- End-of-year tax checklist
- AI: "Based on your spending, here are potential deductions for this tax year"

**Phase assignment**: Phase 3

---

### C10. Investment Watchlists / Price Alerts — LOW PRIORITY

**Market signal**: Users with investment tracking want alerts without using a separate app.

**Feature design**:

- Extend existing `investments` table
- Set price alerts for holdings
- Daily portfolio summary notification
- Dividend tracking and reinvestment
- Simple buy/sell logging

**Phase assignment**: Phase 4

---

## Updated AI Tool Count

The current plan has 14 AI tools. This gap analysis adds 7 more:

| #   | Tool                 | Type  | Source |
| --- | -------------------- | ----- | ------ |
| 15  | `get_properties`     | Read  | A1     |
| 16  | `get_expense_splits` | Read  | A2     |
| 17  | `get_event_budgets`  | Read  | A4     |
| 18  | `get_loan_details`   | Read  | A6     |
| 19  | `get_refunds`        | Read  | C2     |
| 20  | `create_split`       | Write | A2     |
| 21  | `allocate_paycheck`  | Write | A3     |

**Total: 21 AI tools** (14 original + 7 new)

---

## Impact on Phased Rollout

### Phase 2 Additions (6 items)

- A2: Expense splitting with household settlement
- A3: AI-assisted paycheck planning
- A7: Net worth snapshots (historical charting)
- A9: Merchant intelligence (crowdsourced)
- B6: AI-guided Friday Review
- C2: Refund tracking

### Phase 3 Additions (9 items)

- A1: Properties with auto-valuations
- A4: Event budgets (collaborative)
- A5: AI-powered debt scenario modeling
- A6: Loan amortization schedules
- B1: Cloud ML model training
- B4: AI-narrated financial reports
- C1: BNPL tracking
- C3: Annual Year-in-Review
- C4: Spending heatmap + C5: Sankey diagram
- C9: Tax optimization hints

### Phase 4 Additions (4 items)

- B3: Interactive visual calendar
- C6: Geo-tagged spending
- C7: Crypto portfolio tracking
- C8: Green finance / carbon footprint
- C10: Investment watchlists

---

## Sources

- Reddit r/personalfinance, r/ynab, r/budgetapp — user complaints and feature requests (Feb 2026)
- Allied Market Research — "Buy Now Pay Later Market" report (2025)
- Klarna Engineering Blog — Carbon footprint estimation methodology
- Fintech industry reports — Emerging trends in personal finance apps (2025-2026)
- Codebase audit of all IndexedDB tables, pages, and components in `src/`
