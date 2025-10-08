# Practice Lab: Iterate Fast (8 min)

**Goal:** Design the automation path for a question that consistently delivers value.

## Scenario

Your question "Get Windows Update Status from Computer Group[Executive Laptops]" revealed 15% non-compliant devices. Stakeholders want proactive notifications before patch deadlines slip.

## Steps

1. **Capture the baseline** – Log the current query string, run time, and most recent result trend.
2. **Define improvement** – Decide what change improves signal quality (e.g., add filter for `Operating System contains "Windows 11"`).
3. **Plan automation** – Outline how often to run (daily at 06:00), who to notify (endpoint engineering), and thresholds that trigger alerts (>5% non-compliant).
4. **Assign ownership** – Record who maintains the automation and escalation contacts if results degrade.

### Sample automation blueprint

```
Question: Get Windows Update Status from Computer Group[Executive Laptops]
Enhancement: Add filter where Last Scan Age > 2 days
Schedule: Daily at 06:00 local
Alerting: PagerDuty -> Endpoint Engineering if non-compliant > 5%
Artifacts: Saved question + PowerBI dashboard tile
Owner: Jordan (Endpoint Eng) | Escalation: patch-ops@company.com
Next review: 30 days after launch
```

### Self-check

- [ ] Success criteria are measurable (threshold + schedule).
- [ ] Notifications/owners are documented so the handoff is clear.
- [ ] You scheduled a future review to ensure automation still solves the problem.

Capture the blueprint in your shared runbook and link to the saved question so auditors see the full lifecycle.
