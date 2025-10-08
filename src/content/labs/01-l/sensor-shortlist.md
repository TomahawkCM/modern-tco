# Practice Lab: Sensor Shortlist Sprint (7 min)

**Goal:** Build a reusable shortlist of sensors you can drop into upcoming hygiene investigations.

## Scenario

You are preparing an executive readiness check for **Windows update hygiene** across laptops assigned to the Sales and Finance teams.

## Steps

1. **Select the outcome** – Write the question you expect to run (e.g., "Get Windows Update Status from Sales Laptops").
2. **Research sensors** – In the Sensor Catalog or docs, review options related to patching and remediation signals.
3. **Capture details** – For three sensors, note:
   - Description/purpose
   - Primary columns returned (data type)
   - Typical run time or performance considerations in your environment
4. **Rank suitability** – Mark which sensor you would run first, which fills gaps, and which is a fallback if the others fail.

### Sample shortlist entry

| Sensor | Purpose | Key Columns | Run Time Notes |
| --- | --- | --- | --- |
| `Windows Update Status` | Shows last install status and KBs required | `Computer Name`, `Status`, `Last Install Date` | Returns in <10s across laptop group |
| `Pending Actions` | Surfaces outstanding remediation actions | `Action Name`, `Status`, `Age` | Slightly slower (~20s) due to enrichment |
| `Patch Status` | High-level compliance roll-up | `Compliance State`, `Missing Patches` | Fast (<5s), great for quick exec readouts |

### Self-check

- [ ] Each sensor includes purpose, column expectations, and performance notes.
- [ ] You can articulate which sensor best supports the stated outcome and why.
- [ ] The shortlist is saved (notes, Notion, or Tanium saved question description) for the next review session.

Bonus: Drop the shortlist into a shared folder or Confluence page and tag future you. This becomes the seed for your automation plan in Unit 05.
