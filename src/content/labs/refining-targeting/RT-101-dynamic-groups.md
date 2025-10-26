# RT-101 — Dynamic Groups: Windows servers missing critical patch

Objective
- Build a dynamic group targeting Windows servers with a missing critical patch
- Validate membership with a dry-run question
- Publish to the correct content set and document owner

Steps
1. Console → Computer Groups → Create Dynamic Group
2. Rule: Platform = Windows AND (Role contains "Server") AND (Patch Status = "Missing Critical")
3. Save → Content Set: “Platform Operations” → Owner: “Ops‑Win”
4. Interact → Target: the new group → Question: “Get Computer Name from <group>”
5. Sample 10 devices → verify correctness and expected distribution
6. Add description: purpose, owner, created by, validation date

Success Criteria
- Membership matches expectations (±5% tolerance)
- Documentation field populated; owner notified
- Dry‑run results exported or stored for audit
