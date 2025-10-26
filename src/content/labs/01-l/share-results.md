# Practice Lab: Snapshot and Share (5 min)

**Goal:** Package the result of a live question into a concise executive-ready update.

## Scenario

Your question "Get Disk Space from Computer Group[Production Servers]" shows several servers below 10% free space.

## Steps

1. **Pull the data** – Run or open the saved question and export the top 5 lowest free-space servers.
2. **Highlight the insight** – Capture the headline metric (e.g., "3 servers below 5% free space; highest risk: `SERVER-API-03`").
3. **Add recommended action** – Suggest an immediate step (extend volume, archive logs, or notify storage team).
4. **Share with context** – Post in your team channel/email with a short subject line and link to the saved question.

### Sample message

> **Subject:** Prod Disk Space Alert – 3 servers <5% free
>
> - `SERVER-API-03` (3% free) – extend volume by 20 GB during tonight's window
> - `SERVER-DB-01` (4% free) – purge archived logs, rerun question after maintenance
> - `SERVER-WEB-07` (4.5% free) – storage ticket #INC-342515 opened
>
> Saved question: `Get Disk Space from Computer Group[Production Servers]`

### Self-check

- [ ] Message leads with the insight, not a screenshot.
- [ ] You reference the saved question or dashboard so recipients can drill down.
- [ ] Recommended action and owner are explicit.

Track acknowledgement or follow-up tasks in your runbook so you can show impact during retrospectives.
