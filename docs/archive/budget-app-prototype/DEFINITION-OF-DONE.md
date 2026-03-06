# Online Budget App — Definition of Done (DoD)

Status: Quality Governance Document
Last Updated: 2026-02-22
Scope: All V1 Implementations (Offline + Online Alignment)

---

# PURPOSE

This document defines when a task, feature, or milestone is considered COMPLETE.

"It works" is not Done.
"It compiles" is not Done.
"It passes manual test" is not Done.

Done means:
Technically correct. Architecturally aligned. Secure. Logged. Tested.

---

# ✅ UNIVERSAL COMPLETION CRITERIA

Every task must satisfy ALL of the following:

1. ✅ Aligns with documented architecture
2. ✅ Respects strict repository structure
3. ✅ Does not introduce scope creep
4. ✅ Does not duplicate financial math
5. ✅ Passes linting & type checks
6. ✅ Includes error handling
7. ✅ Includes minimal inline documentation
8. ✅ Updates PROGRESS_LOG.md

If any item is missing → NOT DONE.

---

# ✅ FINANCIAL ENGINE TASKS

Additional requirements:

- All money stored in minor units
- ISO 4217 currency compliance
- Deterministic outputs
- No environment dependencies
- Unit tests for new calculations
- Engine version reviewed/updated if logic changed

If math changes without version review → NOT DONE.

---

# ✅ DATABASE TASKS (Supabase)

Must include:

- Migration file created
- Proper indexing applied
- RLS enabled
- RLS policy tested
- No direct client-side privilege escalation

If RLS not verified → NOT DONE.

---

# ✅ API / SERVER TASKS

Must include:

- Subscription enforcement check (if applicable)
- Input validation
- Error handling
- No direct financial math outside engine
- No unbounded external API calls

If API bypasses subscription logic → NOT DONE.

---

# ✅ AI FEATURES

Must include:

- Deterministic data pre-computed before LLM call
- Guardrails against financial advice
- No raw transaction dump to LLM unless scoped
- Token usage controlled

If AI calculates totals → NOT DONE.

---

# ✅ UI FEATURES

Must include:

- Responsive layout
- No direct DB access in components
- No financial calculations in UI
- Clear loading states
- Error feedback to user

If UI contains business logic → NOT DONE.

---

# ✅ BANK INTEGRATION TASKS

Must include:

- Idempotent ingestion logic
- Duplicate protection
- Pending vs posted handling
- Sync status transparency
- Error state logging

If duplicate transactions possible → NOT DONE.

---

# ✅ SUBSCRIPTION / BILLING TASKS

Must include:

- Stripe webhook idempotency
- Subscription status update
- Downgrade handling
- Trial state handling
- Protected API enforcement

If free users can access premium routes → NOT DONE.

---

# ✅ TESTING REQUIREMENTS

For any non-trivial change:

- At least one validation test
- Manual verification checklist
- Edge case consideration documented

If edge cases not reviewed → NOT DONE.

---

# ✅ DOCUMENTATION REQUIREMENTS

Every completed feature must:

- Update PROGRESS_LOG.md
- Update relevant docs if architecture changes
- Document new environment variables

If documentation not updated → NOT DONE.

---

# 🚫 AUTOMATIC FAILURE CONDITIONS

The task is automatically NOT DONE if:

- New folder added without approval
- Financial math appears outside /engine
- Duplicate helper logic created
- Hardcoded currency formatting introduced
- Scope expanded beyond milestone

---

# 📊 QUALITY CHECK BEFORE MARKING DONE

Ask:

1. Does this introduce long-term maintenance risk?
2. Does this break Offline/Online parity?
3. Does this weaken subscription enforcement?
4. Does this violate any governance rule?

If unsure → escalate before marking complete.

---

# FINAL RULE

Done means:

- Architecturally consistent
- Financially correct
- Secure
- Logged
- Maintainable

If any of those are missing, it is not Done.
