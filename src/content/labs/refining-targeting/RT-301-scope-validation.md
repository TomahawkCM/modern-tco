# RT-301 — Scope Validation and Rollback Cohorts

Objective
- Establish rollback static cohort and validate a dynamic target safely
- Execute a no-op action to confirm scope and telemetry

Steps
1. Create Static Group: “Rollback‑D2‑2025‑Q1” and add 10 safe devices
2. Dynamic Group from RT‑201 reused as primary target
3. Intersect Target: (Dynamic Group) AND NOT (Rollback‑D2‑2025‑Q1)
4. Create no‑op package (echo) in Deploy; approval required
5. Execute action against intersected target
6. Validate success metrics and sample device logs; prepare rollback steps

Success Criteria
- No‑op action executes on expected devices only
- Rollback cohort remains untouched and ready
- Logs captured and linked to the change record
