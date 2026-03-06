# Unified Shared Financial Engine Architecture

Status: Strategic Architecture Definition
Last Updated: 2026-02-22
Scope: Offline + Online Alignment
Goal: Single Source of Financial Truth Across Modes

---

# 1. Core Principle

There must be ONE financial engine.

Not:

- One engine for Offline
- Another engine for Online

But:

> A shared, versioned, deterministic financial engine library
> used by both Offline and Online environments.

This prevents:

- Math drift
- Projection inconsistencies
- Budget logic divergence
- Currency rounding differences

---

# 2. Architectural Overview

The system will be layered:

UI Layer (Offline App)
UI Layer (Online App)
↓
Financial Engine (Shared Core Library)
↓
Currency + Budget + Projection Modules
↓
Pure Deterministic Output

AI and Bank Sync sit ABOVE the engine.
They never modify engine math.

---

# 3. Deployment Model

The engine must be:

- Framework-agnostic
- UI-agnostic
- Storage-agnostic
- Environment-agnostic

It should run:

- In browser (Offline)
- In serverless (Online)
- Potentially in worker threads

No engine logic may depend on:

- Supabase
- Stripe
- Plaid
- Salt Edge
- AI providers

Engine = pure computation only.

---

# 4. Core Engine Modules

The unified engine contains:

## 4.1 Money Module

- ISO 4217 currency codes
- Minor unit integer storage
- Deterministic rounding rules

## 4.2 Budget Module

- Monthly category aggregation
- Rollover logic
- Budget progress calculations

## 4.3 Transaction Aggregation Module

- Income vs expense computation
- Category totals
- Time-window filtering

## 4.4 Goal Module

- Goal progress computation
- Time-to-target estimation

## 4.5 Financial Modeling Module (Advanced)

- Projection engine
- Scenario modeling
- Forecasting
- Multi-currency conversion (display-level only)

Offline and Online must call identical functions.

---

# 5. Data Contract

The engine consumes standardized input:

- Accounts
- Transactions
- Budgets
- Goals
- User settings (currency, locale)

And returns structured output:

- Dashboard aggregates
- Budget progress
- Goal status
- Projection data

No direct database access allowed.

---

# 6. Versioning Strategy

The engine must be versioned.

Example:
engine v1.0.0

If calculation logic changes:

- Bump minor or major version
- Store engine version with projections

This allows:

- Reproducible results
- Auditability
- Rollback capability

---

# 7. Offline Integration

Offline app:

- Loads engine locally
- Uses local storage or local DB
- Executes calculations client-side

No network dependency required.

---

# 8. Online Integration

Online app:
Option A (V1):

- Execute engine client-side for dashboard math

Option B (Future):

- Execute engine server-side for heavy projections

Either way, the same engine library is used.

---

# 9. AI Separation Rule

AI may:

- Read engine output
- Explain engine output

AI may NOT:

- Perform financial calculations
- Override deterministic totals
- Modify stored financial data

Engine = truth
AI = narrator

---

# 10. Currency Consistency Rule

All money values:

- Stored in minor units
- Associated with ISO currency code

Conversion:

- Only at presentation layer
- Never persisted as transformed base value

Offline and Online must follow identical currency logic.

---

# 11. Sync & Conflict Considerations (Future Hybrid)

If hybrid mode introduced:

Engine must operate on:

- Immutable transaction records
- Versioned snapshots

Conflict resolution handled outside engine.

Engine never merges conflicting records.

---

# 12. Testing Strategy

Unified test suite:

- Shared test cases
- Snapshot tests for projections
- Edge-case currency tests
- Zero-income scenarios
- High inflation scenarios

Tests must run in:

- Offline environment
- Online CI pipeline

No environment-specific math allowed.

---

# 13. Governance Rules

1. No duplicate calculation logic anywhere else.
2. No dashboard shortcut math in UI.
3. No AI-based calculations.
4. No currency conversion shortcuts.
5. Any financial rule change requires version bump.

---

# 14. Long-Term Benefits

This unified engine ensures:

- Feature parity across modes
- Easier maintenance
- Reduced bugs
- Faster feature rollout
- Consistent financial trust

It allows:
Offline = Sovereign computation
Online = Automated data feed + AI overlay

But both run on the same financial brain.

---

# Final Strategic Statement

The financial engine is the core asset of the product.

Offline and Online are delivery mechanisms.

If the engine stays unified,
the ecosystem stays coherent.

If the engine fragments,
the product fragments.

This architecture prevents that fragmentation.
