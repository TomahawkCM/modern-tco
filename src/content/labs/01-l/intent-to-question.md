# Practice Lab: Intent to Question (5 min)

**Goal:** Translate a stakeholder request into a precise Tanium question you can run immediately.

## Scenario

A security manager messages: *"Confirm which laptops in APAC have the CrowdStrike Falcon sensor missing or stale in the last 24 hours."*

## Steps

1. **Capture intent** – Write the request as a single sentence: outcome + population + time window.
2. **Align the signal** – Identify the best-fit sensor (for example, `CrowdStrike Falcon Sensor`) and confirm it reports status values.
3. **Draft the question** – Use the `Get [sensor] from [targets] where [filters]` pattern to target APAC laptops and the desired freshness threshold.
4. **Plan iteration** – List a follow-up variation (e.g., "What is the last check-in time for affected devices?") to continue the conversation after first results.

### Sample answer

```
Intent: "Surface APAC laptops missing CrowdStrike Falcon in the last 24 hours."
Query: Get Computer Name from Computer Group[APAC Laptops]
       where CrowdStrike Falcon Sensor contains "Not Installed"
       and Last Check-in time <= now-24h
Follow-up: "Get Logged In User from Computer Group[APAC Laptops]
           where CrowdStrike Falcon Sensor contains \"Not Installed\""
```

### Self-check

- [ ] Question follows the Get / From / Where structure without console-specific jargon.
- [ ] Sensor and filters map directly to the stakeholder wording (population, condition, time window).
- [ ] At least one follow-up variation anticipates the next conversation thread.

Record your answer in your study notes, then rate confidence (Low / Medium / High). Revisit during flashcard review if confidence is below "High".
