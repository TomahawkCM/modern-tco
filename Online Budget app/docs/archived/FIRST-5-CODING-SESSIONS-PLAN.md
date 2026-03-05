# Online Budget App — First 5 Coding Sessions Plan (Locked Execution Path)

Status: Execution Control Plan
Last Updated: 2026-02-22
Purpose: Prevent Claude from Wandering During Early Build
Scope: Milestone 1 (Core Infrastructure Only)

---

# OVERARCHING RULE

For the first 5 sessions:

- No AI implementation
- No bank sync implementation
- No dashboard UI polish
- No modeling engine expansion

Only build infrastructure foundations.

If Claude attempts to expand scope → STOP.

---

# SESSION 1 — Project Skeleton + Repo Enforcement

## Objective

Create strict Next.js project structure aligned to:

- V1-STRICT-REPOSITORY-STRUCTURE.md

## Tasks

- Initialize Next.js (App Router)
- Create required top-level folders:
  - app/
  - components/
  - lib/
  - server/
  - engine/
  - supabase/
  - integrations/
  - ai/
  - styles/
- Add placeholder index files where needed
- Configure TypeScript strict mode

## Exit Criteria

- Folder structure exactly matches locked doc
- No extra folders
- Project builds successfully

---

# SESSION 2 — Supabase Integration + Auth

## Objective

Establish secure Supabase connection with RLS foundation.

## Tasks

- Install Supabase client
- Configure environment variables
- Create auth flow (email/password)
- Implement basic session handling
- Create initial RLS policy template

## Exit Criteria

- User can sign up
- User session persists
- RLS enabled on users table

---

# SESSION 3 — Subscription Foundation (Stripe)

## Objective

Implement subscription backbone before bank sync.

## Tasks

- Create subscriptions table
- Add Stripe integration wrapper (in integrations/stripe)
- Implement webhook endpoint
- Update subscription status on event
- Protect API routes based on subscription status

## Exit Criteria

- Subscription row created per user
- Webhook updates subscription correctly
- Trial state supported

---

# SESSION 4 — Core Database Schema (Transactions + Accounts)

## Objective

Implement financial data schema without sync logic.

## Tasks

- Create accounts table
- Create transactions table
- Create categories + translations tables
- Add RLS policies
- Add proper indexing

## Constraints

- No bank API calls yet
- No categorization logic yet
- No AI logic yet

## Exit Criteria

- Tables created via migration
- RLS enforced
- Test insert works per user

---

# SESSION 5 — Engine Integration Skeleton

## Objective

Integrate unified financial engine as isolated module.

## Tasks

- Implement engine folder skeleton
- Add Money module
- Add Aggregation module (basic income/expense totals)
- Wire minimal test call from dashboard page

## Critical Rule

All financial math must live in engine/.

## Exit Criteria

- Dashboard can display total income vs expenses
- No math outside engine/
- Engine version file created

---

# STRICT PROGRESSION RULE

Claude must NOT move to:

- AI layer
- Bank integration
- Dashboard polish
- Budget UI
- Goals

Until these 5 sessions are completed and stable.

---

# WHY THIS ORDER

This sequence ensures:

1. Structure before features
2. Security before sync
3. Monetization before cost generation
4. Schema before ingestion
5. Engine before AI

This prevents:

- Rewrites
- Schema drift
- Financial inconsistency
- Cost leaks

---

# GOVERNANCE CHECKPOINT (After Session 5)

Before proceeding to Milestone 2:

- Review PROGRESS_LOG.md
- Confirm folder structure compliance
- Confirm RLS policies
- Confirm no duplicate financial math
- Confirm Stripe enforcement works

Only then proceed to bank sync implementation.

---

# FINAL INSTRUCTION

These first 5 sessions determine system stability.

No improvisation.
No acceleration.
No scope creep.

Discipline now prevents collapse later.
