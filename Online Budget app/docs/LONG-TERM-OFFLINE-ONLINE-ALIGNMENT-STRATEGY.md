# Long-Term Offline + Online Alignment Strategy

Status: Strategic Roadmap Planning
Last Updated: 2026-02-22
Scope: Feature Parity + Product Cohesion

---

# 1. Core Strategic Principle

Offline and Online are NOT separate products.
They are two operating modes of the same financial system.

Offline = Sovereign Mode (Local, Manual, Modeling-First)
Online = Automated Mode (Sync, AI, Cloud Convenience)

Long-term goal:

> Full feature parity in financial capability,
> Differentiated by automation and infrastructure layer.

This avoids product fragmentation and user confusion.

---

# 2. Non-Negotiable Rule

Every financial feature built Offline must eventually exist Online.

However:

Offline may receive advanced modeling features first.
Online may receive automation and AI features first.

Parity does not mean identical UX —
it means identical financial power.

---

# 3. Feature Parity Matrix (Long-Term)

| Capability                | Offline | Online                | Notes                   |
| ------------------------- | ------- | --------------------- | ----------------------- |
| Manual transaction entry  | ✅      | ✅                    | Required parity         |
| CSV import                | ✅      | ✅                    | Required parity         |
| Bank sync                 | ❌      | ✅                    | Online-only automation  |
| Multi-currency modeling   | ✅      | ✅                    | Core parity requirement |
| Budgeting                 | ✅      | ✅                    | Core parity             |
| Goals                     | ✅      | ✅                    | Core parity             |
| Financial modeling engine | ✅      | ✅ (server or client) | Long-term required      |
| Scenario modeling         | ✅      | ✅                    | May phase in            |
| Advanced forecasting      | ✅      | ✅                    | After V1                |
| Monte Carlo               | ✅      | ✅                    | Online premium feature  |
| AI insights               | Limited | ✅                    | Online advantage        |
| AI chat                   | Limited | ✅                    | Online advantage        |
| Cross-device sync         | ❌      | ✅                    | Online differentiator   |

---

# 4. Architectural Alignment Strategy

## 4.1 Shared Financial Engine

Long-term requirement:

A shared financial engine library used by both:

- Offline (local execution)
- Online (server or edge execution)

This ensures:

- Identical math
- Identical projections
- No divergence bugs

Never maintain two separate calculation engines.

---

## 4.2 Shared Data Model

Offline and Online must:

- Use identical schema structure
- Use ISO currency codes
- Store money in minor units
- Maintain identical category definitions

This allows:

- Import/export between modes
- Future sync compatibility

---

# 5. Long-Term Integration Path

Phase 1 (Current)

- Offline: Advanced modeling
- Online: Automation + AI

Phase 2

- Online gains full modeling engine
- Offline gains optional Online sync bridge

Phase 3

- Unified account identity
- Optional hybrid mode:
  - Local modeling
  - Cloud sync when enabled

---

# 6. Hybrid Future Vision (Optional)

Eventually users could:

- Use Offline for privacy-heavy modeling
- Toggle Online sync for live bank data

But this requires:

- Careful sync conflict resolution
- Clear ownership rules
- Versioned financial snapshots

Not V1 priority.

---

# 7. Avoiding Feature Drift

Biggest long-term risk:
Offline becomes "power user"
Online becomes "simplified SaaS"

This fragments roadmap.

Mitigation:

- Maintain unified feature roadmap document
- No feature shipped to Offline without Online parity plan
- No Online feature that breaks financial consistency

---

# 8. Development Discipline Rules

1. One financial engine.
2. One category taxonomy.
3. One currency model.
4. One budgeting logic.
5. AI layer only in Online.
6. Automation layer only in Online.

Everything else must converge.

---

# 9. Long-Term Roadmap Alignment (3–5 Years)

Year 1:

- V1 Online launch
- Feature parity on budgeting & goals

Year 2:

- Online modeling engine parity
- Scenario modeling in cloud

Year 3:

- Optional hybrid sync model
- Advanced forecasting unified

Year 4–5:

- Unified financial OS
- Offline-first with cloud augmentation

---

# 10. Product Positioning Summary

Offline:
"Your private financial lab."

Online:
"Your automated financial assistant."

Both:
"The same financial brain."

This avoids cannibalization.
It creates a layered ecosystem.

---

# Final Strategic Conclusion

Long-term success requires:

- Feature parity in financial capability
- Differentiation only in automation + AI
- Shared engine and data model
- No divergence in math logic

Offline builds trust and sovereignty.
Online builds convenience and recurring revenue.

They must evolve together — not compete.
