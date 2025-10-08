# Practice Lab: Targeting Checklist (6 min)

**Goal:** Document a lightweight checklist that keeps your production targeting safe and explainable.

## Scenario

You plan to run "Get Running Services from Finance Workstations where Service Name contains `SQL`" during the weekly maintenance window.

## Steps

1. **Describe the population** – Record the current group or filter: `Computer Group[Finance Workstations]` + after-hours schedule.
2. **Validate membership** – Note how you confirm the group is current (e.g., dynamic rule based on OU, last audit date, number of members).
3. **Add guardrails** – List at least two validation checks:
   - Canary run against `Computer Group[Finance Canary]`
   - Monitor for endpoints older than 30 days since last check-in
4. **Set reassessment triggers** – Decide what event forces a review (new software rollout, re-org, or service outage).

### Sample checklist

```
Population: Computer Group[Finance Workstations]
Schedule: Thursdays 20:00 local during change window
Guards:
  - Run canary against Computer Group[Finance Canary] before wider release
  - Alert if membership deviates >10% week over week
  - Confirm Last Check-in time <= 24h before execution
Reassess when:
  - Finance OU structure changes
  - New SQL-based service is deployed in production
  - Canary run returns more than 5 failures
```

### Self-check

- [ ] You can hand the checklist to a teammate and they understand why the population is safe.
- [ ] Guardrails include both validation (before) and monitoring (after) the run.
- [ ] Triggers clearly state when you will revisit the targeting decision.

Share the checklist in your change-management channel or runbook as proof of due diligence.
