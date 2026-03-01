# Online Budget App — Strict Repository Structure (V1 Locked)

Status: Architecture Lock
Last Updated: 2026-02-22
Scope: Prevent Folder Sprawl & Architectural Drift

---

# 1. Core Principle

Claude (and any engineer) MUST follow this structure exactly.

No new top-level folders without explicit approval.
No parallel "utils" duplication.
No random "helpers" directories.
No alternative financial logic folders.

One structure. One source of truth.

---

# 2. Top-Level Structure

/online-budget-app
│
├── app/ # Next.js App Router
├── components/ # UI components only
├── lib/ # Shared logic (non-UI, non-API)
├── server/ # Server-only logic
├── engine/ # Shared financial engine (core brain)
├── supabase/ # DB types + RLS policies
├── integrations/ # Plaid, Salt Edge, Stripe adapters
├── ai/ # AI orchestration layer
├── styles/ # Global styles
├── public/ # Static assets
├── docs/ # Architecture + planning docs
└── package.json

Nothing else at root.

---

# 3. Folder Responsibilities

---

## 3.1 app/

Purpose:
Next.js routes and layout.

Rules:

- No financial calculations here.
- No direct database queries.
- No business logic beyond UI composition.

Example:
app/dashboard/page.tsx
app/api/stripe/webhook/route.ts

---

## 3.2 components/

Purpose:
Reusable UI components.

Rules:

- Presentation only.
- No financial math.
- No Supabase calls directly.

Example:
components/dashboard/BalanceCard.tsx
components/budget/BudgetProgress.tsx

---

## 3.3 lib/

Purpose:
Shared utilities and helpers.

Allowed:

- Date helpers
- Formatting helpers
- Validation
- Constants

NOT allowed:

- Financial engine logic (must live in /engine)
- Supabase queries

---

## 3.4 engine/ 🚨 CRITICAL

Purpose:
Unified shared financial engine.

Rules:

- Pure deterministic functions only.
- No database calls.
- No API calls.
- No environment-specific code.
- Versioned.

Substructure:

engine/
├── money/
├── budgeting/
├── aggregation/
├── goals/
├── projections/
├── index.ts
└── version.ts

All financial calculations must live here.

---

## 3.5 server/

Purpose:
Server-side orchestration logic.

Allowed:

- Supabase queries
- Stripe validation
- AI request orchestration
- Sync jobs

Not allowed:

- Core financial math duplication

---

## 3.6 supabase/

Purpose:
Database definitions and policies.

Contains:

- SQL migrations
- RLS policies
- DB types

No business logic here.

---

## 3.7 integrations/

Purpose:
External service adapters.

Subfolders:

integrations/
├── plaid/
├── saltedg e/
├── stripe/

Rules:

- Wrap external APIs.
- Never expose provider raw objects outside this layer.

---

## 3.8 ai/

Purpose:
AI orchestration only.

Contains:

- Prompt templates
- Context builders
- Guardrails
- LLM wrappers

Rules:

- AI cannot compute financial values.
- AI only narrates engine output.

---

# 4. Forbidden Patterns

❌ No duplicate “utils” folders in random modules.
❌ No second financial engine in server/.
❌ No direct Plaid calls inside app/.
❌ No SQL inside UI components.
❌ No business logic in page.tsx.
❌ No environment conditionals inside engine.

If such code appears, it must be refactored.

---

# 5. Naming Conventions

- All money variables end with \_minor
- Currency variables use ISO 4217
- API routes follow /api/<domain>/<action>
- Database table names are plural snake_case
- Engine modules use camelCase

---

# 6. Engine Protection Rule

If any financial calculation appears outside /engine,
that is a violation.

It must be moved immediately.

---

# 7. Future-Proofing Rule

If adding new features:

Ask:

1. Is this financial math? → engine/
2. Is this external API? → integrations/
3. Is this UI only? → components/
4. Is this server orchestration? → server/

Never invent new top-level folders casually.

---

# 8. Governance Clause

This structure is locked for V1.

Changes require explicit architectural review.

Folder sprawl kills maintainability.
This document prevents that.

---

# Final Reminder

The repository structure enforces discipline.

Offline + Online alignment depends on:

- One engine
- One structure
- Clear boundaries

If the structure stays clean,
the product stays coherent.
