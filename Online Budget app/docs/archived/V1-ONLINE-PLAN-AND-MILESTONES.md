# Online Budget App — V1 Plan & Engineering Milestones

Status: Planning
Last Updated: 2026-02-21
Scope: Strict V1 (No Feature Creep)
Hosting: Vercel
Positioning: AI-Powered, Bank-Connected Global Budgeting App

---

# 1. V1 Product Definition

V1 is NOT a full financial SaaS platform.
V1 is:

> A modern, AI-enhanced, bank-connected global budgeting app
> that makes financial clarity effortless for average users.

Core Pillars:

1. Bank Sync
2. Smart Categorization
3. Clean Dashboard
4. AI Insights + Chat
5. Simple Goals

Anything outside these pillars does not ship in V1.

---

# 2. Strict V1 Feature Scope

## 2.1 Bank Sync

- Secure sign up (email + OAuth optional)
- Connect bank accounts via global provider
- Automatic transaction sync
- Multi-currency account support
- Manual account fallback

Not included:

- Investment tracking
- Crypto tracking
- Business accounts
- Family/household accounts

---

## 2.2 Transaction System

- AI auto-categorization
- User re-categorization
- Learning from corrections
- Multi-language category labels
- Multi-currency support

Not included:

- Custom rule builder
- Receipt scanning
- Bulk automation engine

---

## 2.3 Dashboard

Must display:

- Current balances
- Net cash position
- Monthly income vs expenses
- Spending by category (simple chart)
- Savings rate
- Currency indicator

Design principles:

- Card-based
- Minimal
- Calm
- Modern

---

## 2.4 AI Insight Engine

- Monthly summary in plain language
- Spending anomaly detection
- Subscription detection
- Budget risk warnings
- Cash flow warnings
- "Can I afford X?" lightweight calculator
- Optional simple Financial Health Score

Not included:

- Investment advice
- Tax advice
- Retirement modeling

---

## 2.5 Conversational AI Assistant

Users can ask:

- Where did I spend the most?
- How much did I spend on food?
- Can I afford $400/month?

Must:

- Use user transaction data
- Respond clearly and safely
- Avoid regulated financial advice

---

## 2.6 Budgeting (Simple)

- Monthly category budgets
- Progress indicators
- Near-limit alerts
- Optional simple rollover

Not included:

- Complex envelope systems
- Advanced forecasting

---

## 2.7 Goals

- Create savings goal
- Track progress
- Estimated completion date
- AI explanation of progress

---

# 3. Technical Principles (V1)

- Next.js (App Router) on Vercel
- Serverless functions for AI + bank sync
- Managed Postgres database
- Background sync via scheduled jobs
- No microservices
- No over-engineering
- Clear service boundaries

---

# 4. Engineering Milestones

## Milestone 1 — Core Infrastructure (Weeks 1–3)

Goals:

- Project setup (Next.js + Vercel)
- Auth system
- Database schema design
- Bank provider integration (basic)
- Secure token storage

Exit Criteria:

- User can sign up
- User can connect a bank
- Transactions stored securely

---

## Milestone 2 — Transaction & Categorization Engine (Weeks 3–6)

Goals:

- Transaction ingestion pipeline
- AI categorization service
- Manual recategorization UI
- Feedback loop to improve model
- Multi-currency normalization layer

Exit Criteria:

- Transactions categorized automatically
- Corrections persist and improve future predictions

---

## Milestone 3 — Dashboard & Budgeting (Weeks 6–9)

Goals:

- Clean dashboard UI
- Balance aggregation
- Income vs expense summary
- Spending chart
- Budget creation & tracking
- Currency formatting support

Exit Criteria:

- User sees financial overview immediately after login
- Budgets function correctly

---

## Milestone 4 — AI Insight Engine (Weeks 9–12)

Goals:

- Monthly summary generator
- Anomaly detection logic
- Subscription detection
- Budget risk alerts
- "Can I afford X?" logic
- Financial health score (simple formula)

Exit Criteria:

- AI insights generated reliably
- Insights understandable and safe

---

## Milestone 5 — Conversational AI (Weeks 12–14)

Goals:

- Chat interface
- Secure AI context injection
- Query parsing for transaction-based questions
- Guardrails against financial advice

Exit Criteria:

- Users can ask natural-language questions about finances
- Responses are accurate and grounded

---

## Milestone 6 — Polish & Retention Layer (Weeks 14–16)

Goals:

- Performance optimization
- Responsive design refinement
- Notification system
- Onboarding flow optimization
- Analytics instrumentation

Exit Criteria:

- Fast load times
- Clear onboarding
- Stable sync

---

# 5. Post-V1 Consideration (Not Included in Initial Launch)

- Family accounts
- Advanced forecasting
- Monte Carlo modeling
- Tax modeling
- Advanced FX modeling
- Investment portfolio tracking

These require separate RFC and scope approval.

---

# 6. V1 Success Criteria

- User connects bank within 2 minutes
- First insight generated within 60 seconds
- Dashboard load under 2 seconds
- AI response under 5 seconds
- High engagement with AI insights

---

# Final Statement

V1 is intentionally constrained.

It delivers:

- Bank connectivity
- AI-driven clarity
- Global language and currency support
- Clean, modern UX

Without turning into a full financial SaaS platform.

Scope discipline is mandatory for launch success.
