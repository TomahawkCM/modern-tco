# Online Budget App — DO NOT BUILD List

Status: Permanent Scope Guard
Last Updated: 2026-02-22
Purpose: Prevent Long-Term Scope Creep

---

# CORE PRINCIPLE

If a feature turns this product into a full financial SaaS platform,
DO NOT BUILD IT.

This app is:

- Automated budgeting
- AI-enhanced financial clarity
- Multi-currency aware
- Subscription-based

It is NOT a financial super-app.

---

# 🚫 CATEGORY 1 — Investment Platform Features

Do NOT build:

- Stock trading
- Portfolio optimization tools
- ETF comparison engines
- Crypto exchange integration
- Active portfolio rebalancing
- Real-time market feeds
- Investment recommendation engines

Reason:
Regulatory risk + massive complexity + identity drift.

---

# 🚫 CATEGORY 2 — Tax Platform Features

Do NOT build:

- Tax filing
- Tax document parsing
- Country-specific tax engines
- Capital gains calculators
- VAT/GST filing support

Reason:
Compliance complexity + legal exposure.

---

# 🚫 CATEGORY 3 — Business Accounting Features

Do NOT build:

- Invoice generation
- Accounts receivable tracking
- Payroll management
- Double-entry accounting UI
- Inventory systems
- Business expense reporting

Reason:
Turns product into accounting software.

---

# 🚫 CATEGORY 4 — Enterprise / Multi-Role Systems

Do NOT build:

- Multi-admin role hierarchies
- Team workspaces
- Enterprise billing models
- Client management dashboards

Reason:
Not the target market.

---

# 🚫 CATEGORY 5 — Over-Engineered AI

Do NOT build:

- Autonomous financial agents
- Continuous AI monitoring loops
- AI-driven trading advice
- AI “wealth manager” persona
- Complex multi-model orchestration

AI must remain:

- Grounded
- Deterministic-backed
- Assistive

---

# 🚫 CATEGORY 6 — Feature Bloat in V1/V2

Do NOT build prematurely:

- Multi-tier pricing matrix
- Add-on micro-transactions
- Usage-based billing
- Plugin marketplace
- Custom theme builder
- Advanced analytics dashboards

Keep product focused.

---

# 🚫 CATEGORY 7 — Duplicate Financial Logic

Absolutely forbidden:

- Financial math outside /engine
- Currency conversion shortcuts
- UI-level aggregation logic
- AI-based financial computation

One engine. One truth.

---

# 🚫 CATEGORY 8 — Real-Time Everything

Do NOT promise or build:

- Real-time bank sync everywhere
- Real-time AI predictions
- Real-time cash forecasting loops

Use reasonable sync intervals.

---

# 🚫 CATEGORY 9 — Feature Cannibalization

Do NOT:

- Make Offline obsolete
- Add Online-only financial math
- Introduce inconsistent budgeting rules

Offline and Online must share the same financial brain.

---

# 🚫 CATEGORY 10 — Random Nice-to-Haves

If a feature:

- Sounds cool
- Impresses technically
- Adds architectural complexity
- Is used by <20% of users

It does not belong.

---

# ADDITION RULE

To add a feature that touches finance or core architecture,
it must pass this test:

1. Does it strengthen automation or clarity?
2. Does it align with subscription revenue?
3. Does it preserve engine unity?
4. Does it avoid regulatory expansion?

If any answer is NO → Do Not Build.

---

# FINAL REMINDER

Scope creep kills more startups than competition.

This document exists to protect:

- Focus
- Margins
- Maintainability
- Identity

If in doubt:
Build less.
