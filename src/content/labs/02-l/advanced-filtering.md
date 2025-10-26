# Practice Lab: Advanced Filtering Chains (8 min)

**Goal:** Create a layered filter set that balances precision with responsiveness.

## Scenario refresher

You ran a question that flooded the console with thousands of rows. The intent was solid, but the target list was too broad. In this lab you will capture the intent, document the noisy result, and tighten the filters until the question returns only the highest-signal endpoints.

## Preparation checklist (2 min)

- Pull up one question from the last week that produced more rows than you could act on.
- Locate the original natural-language prompt or stakeholder request so you can validate the outcome later.
- Open the filter builder UI or have your saved filter syntax ready for editing.

## Guided steps (5 min)

1. **Baseline the noisy run.** Record the unfiltered row count, average return time, and the field you actually care about (for example, `IsCompliant` or `LastExecution`).
2. **Add a narrowing filter.** Apply a first filter that aligns to your primary dimension (platform, patch group, business unit). Capture the new row count and runtime delta.
3. **Layer a precision filter.** Introduce a second filter that targets behaviour or risk (for example, "last seen > 5 days" or "threat score >= 70"). Note how much data remains and whether it highlights outliers clearly.
4. **Stress-test the chain.** Flip one filter to the opposite condition or widen the value range to confirm the question still returns quickly and degrades gracefully.

## Document the outcome (1 min)

- Capture the final filter syntax and why it works.
- List two situations where this filter chain should **not** be used so teammates avoid false positives.
- Identify the data owner who should review the refined filter before it becomes the new standard.

## Completion signal

Save the filter chain as a template in your shared notebook, add the runtime delta, and tag the audience who most benefits from the refined view.
