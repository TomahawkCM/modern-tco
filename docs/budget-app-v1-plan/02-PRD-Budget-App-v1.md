# Product Requirements Document - Budget App v1 (Local-First)

## Problem Statement

**Users struggle to manage personal finances** due to overly complex apps that prioritize features over usability. Existing budget apps suffer from:

1. **Poor Accessibility**: Small touch targets, low contrast, jargon-heavy labels
2. **Overwhelming Complexity**: Too many features visible at once, steep learning curves
3. **Privacy Concerns**: Cloud-first architecture, data sharing with third parties
4. **Mobile-Last Design**: Desktop-centric UI that doesn't translate well to phones
5. **Seniors Exclusion**: Assumes tech-savvy users, no accommodations for older adults

**Target Impact**: Create a budget app that **any adult can use confidently within 90 seconds**, with particular focus on seniors (60+) who are often excluded from financial technology.

---

## Target Users

### Primary Persona: "Margaret" - Retiree Managing Fixed Income

- **Age**: 68 years old
- **Tech Literacy**: Moderate (uses email, Facebook, online banking)
- **Financial Goal**: Track spending against fixed monthly income (pensions, CPP, OAS)
- **Pain Points**:
  - Small text and buttons frustrate her (needs reading glasses)
  - Confusing jargon ("amortization", "reconciliation") causes anxiety
  - Worried about privacy (doesn't trust cloud apps)
  - Wants to see where money goes without complex charts

### Secondary Persona: "David" - Working Professional with Student Loans

- **Age**: 32 years old
- **Tech Literacy**: High (power user, multiple devices)
- **Financial Goal**: Pay off $45K student debt while saving for house down payment
- **Pain Points**:
  - Needs loan amortization to see payoff impact of extra payments
  - Wants mobile-first experience (manages finances on commute)
  - Existing apps are either too simple OR overcomplicated
  - Desires AI-assisted insights without losing control

### Tertiary Persona: "Sofia" - Small Business Owner

- **Age**: 44 years old
- **Tech Literacy**: Moderate-High
- **Financial Goal**: Separate business/personal expenses, track invoice payments
- **Pain Points**:
  - Needs bulk import from bank CSVs (50+ transactions/month)
  - Categories must be customizable for tax purposes
  - Requires offline access (travels frequently)
  - Wants quick entry on mobile between client meetings

---

## Use Cases

### UC1: First-Time Setup (< 90 seconds)

**Actor**: New user (any persona)
**Steps**:

1. Open app (PWA or web)
2. Dismiss welcome screen (optional 30s product tour)
3. Add first account ("Checking - TD Bank", starting balance $2,500)
4. Add first transaction ("-$4.50, Coffee, Food & Dining")
5. See updated dashboard with balance and spending chart

**Success Criteria**:

- No authentication required (local-only)
- 4-step flow maximum
- Large, obvious "Add Transaction" button
- Confirmation: "You're all set! Track your spending here."

---

### UC2: Daily Transaction Entry (Margaret)

**Actor**: Senior user on mobile
**Steps**:

1. Tap floating "+" button (bottom-right, 56px)
2. Enter amount: "$23.45" (native number keyboard)
3. Select category from visual grid (icons + labels, 48px targets)
4. Tap "Save" (or swipe down to dismiss)

**Success Criteria**:

- Entry completes in 2 taps + typing
- Category defaults to last used
- Date defaults to today
- Visual confirmation (toast: "Groceries added - $23.45")

---

### UC3: Monthly Budget Review (David)

**Actor**: Professional user on desktop
**Steps**:

1. Navigate to "Budgets" (sidebar or command palette Cmd+K)
2. Review progress bars for each category (green <80%, yellow 80-100%, red >100%)
3. Click "Dining Out" budget (95% spent: $190/$200)
4. See list of transactions contributing to budget
5. Adjust budget limit for next month

**Success Criteria**:

- Visual progress indicators (not just numbers)
- One-click drill-down to transactions
- Non-color status indicators (%, icons)
- Plain language: "You've spent $190 of $200 on dining this month"

---

### UC4: CSV Import (Sofia)

**Actor**: Business owner importing 50 transactions
**Steps**:

1. Click "Import CSV" from dashboard quick actions
2. Drag-drop or select CSV file from bank
3. Review preview table (first 10 rows, duplicates highlighted)
4. Confirm import (or adjust field mappings if auto-detect fails)
5. See success message: "48 new transactions imported, 2 duplicates skipped"

**Success Criteria**:

- Auto-detect bank format (15+ banks supported)
- Duplicate detection with confidence scores
- Clear preview before commit
- Error handling with actionable messages

---

### UC5: Loan Payoff Planning (David)

**Actor**: User with student loan
**Steps**:

1. Navigate to "Loans" → "Student Loan"
2. View amortization chart (principal vs interest over time)
3. Use extra payment calculator: "What if I pay $100 extra/month?"
4. See updated payoff date: "Payoff 2 years faster, save $3,200 in interest"
5. Add extra payment to next scheduled payment

**Success Criteria**:

- Amortization chart accessible (text alternative available)
- Calculator shows immediate visual feedback
- Plain language results (no financial jargon)
- Optional: Link transactions to loan payments

---

### UC6: AI Chatbot Query (Margaret)

**Actor**: Senior user needing help
**Steps**:

1. Click chatbot button (bottom-right, persistent)
2. Type or speak: "How much did I spend on groceries this month?"
3. Chatbot responds: "You spent $342.15 on groceries in November. That's 12% more than October ($305.80)."
4. Optional follow-up: "Show me my grocery transactions"
5. Chatbot displays filtered transaction list

**Success Criteria**:

- Natural language understanding
- Conversational, non-technical responses
- Privacy opt-in required (consent dialog on first use)
- Graceful degradation ("I can't answer that, try asking...")

---

## Success Metrics

### Onboarding & Usability

- **First Transaction Time**: 90% of users complete within 90 seconds
- **Task Completion Rate**: 95%+ for add transaction, create budget, import CSV
- **Error Rate**: <2% false positives on duplicate detection

### Accessibility

- **Lighthouse Score**: 95+ across all pages and theme modes
- **Touch Target Compliance**: 100% of interactive elements ≥48px
- **Screen Reader Compatibility**: 100% of features usable with NVDA/VoiceOver/JAWS

### Performance

- **Time to Interactive**: <3s on 3G networks
- **Bundle Size**: <300KB initial load
- **Offline Functionality**: 100% features work offline (local-first)

### Adoption & Engagement (Post-Launch)

- **PWA Install Rate**: 30% of users install within first week
- **Return Rate**: 60% of users return within 7 days
- **Feature Usage**: 80%+ use transactions, 50%+ use budgets, 20%+ use loans

---

## User Stories (Prioritized)

### Must-Have (P0)

- As Margaret, I want **large, readable text (18px+)** so I don't need to zoom or squint
- As David, I want **mobile-first navigation** so I can manage finances on my commute
- As Sofia, I want **bulk CSV import** so I don't manually enter 50 transactions
- As any user, I want **dark mode** so I can use the app at night without eye strain
- As Margaret, I want **plain language labels** so I understand what each button does

### Should-Have (P1)

- As David, I want **loan amortization with extra payment calc** so I can plan debt payoff
- As Sofia, I want **custom categories** so I can organize expenses for tax purposes
- As any user, I want **AI chatbot assistance** so I can ask questions in plain English
- As Margaret, I want **high-contrast mode** so I can see buttons clearly
- As David, I want **keyboard shortcuts** so I can navigate quickly on desktop

### Could-Have (P2)

- As Sofia, I want **receipt attachment** so I can store proof of purchases
- As David, I want **spending insights** so I can identify wasteful patterns
- As any user, I want **export to CSV** so I can analyze data in Excel
- As Margaret, I want **onboarding tour** so I learn features at my own pace
- As Sofia, I want **budget rollover** so unused funds carry forward to next month

---

## Non-Functional Requirements

### Accessibility

- WCAG 2.2 Level AA compliance (4.5:1 contrast, 48px touch targets)
- Support for screen readers (NVDA, VoiceOver, JAWS)
- Keyboard navigation for all features
- Reduced motion mode (respects prefers-reduced-motion)

### Performance

- Lighthouse Performance score ≥90
- First Contentful Paint <1.5s
- Largest Contentful Paint <2.5s
- Cumulative Layout Shift <0.1

### Security & Privacy

- No data leaves device (100% local-first)
- Optional client-side encryption for sensitive fields
- No third-party tracking or analytics (PostHog self-hosted only)
- Clear privacy policy in-app

### Compatibility

- Modern browsers: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- Mobile: iOS 14+, Android 10+
- PWA installable on all supported platforms
- Graceful degradation for older browsers

---

## Out of Scope (Deferred to v1.1+)

- Live bank account integration (Plaid, Flinks)
- Multi-user / household sharing
- Real-time market data for investments
- Tax preparation tools
- Server-side sync / cloud backup
- Advanced ML predictions beyond rule-based insights

**Rationale**: Focus v1 on core local-first experience with exceptional UX. Add opt-in cloud features in future releases based on user demand.
