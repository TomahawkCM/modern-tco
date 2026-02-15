# UI/UX Design Plan: Privacy-First Agentic Budget App (2026)

> **SUPERSEDED**: Design specs integrated into `Plans/BUDGET_APP_AUTHORITATIVE_PLAN.md` Pre-Phase 0 and Phase 8 sections. Kept for historical reference.

**Design Philosophy:** A "Cyber-Soft" aesthetic that balances the high-security feel of ProtonMail with the vibrant, emotional engagement of modern Fintech. Built with **React, Vite, and Mantine UI**.

---

## 1. Visual Identity & Theme

- **Primary State:** Sophisticated Dark Mode (Deep Charcoals/Inky Blacks).
- **Action Colors:** \* **Income:** Electric Blue
  - **Expenses:** Neon Magenta
  - **Savings/Goals:** Emerald Green
- **Typography:** Inter for UI elements; JetBrains Mono for data/currency to convey precision.
- **Interactions:** Subtle micro-animations using `framer-motion` to make data transitions feel fluid.

---

## 2. Dashboard: The "Instant Value" View

The dashboard avoids dense spreadsheets in favor of "at-a-glance" financial health.

- **The Safe-to-Spend Dial:** A central `RingProgress` component showing remaining monthly funds after bills and goals are secured.
- **The Scenario Slider:** A horizontal WASM-powered timeline. Dragging the slider projects bank balances 3–12 months into the future based on current trends.
- **Privacy Toggle:** A global header icon that instantly blurs all currency values for use in public spaces.

---

## 3. The "Review Flow" (Transaction Management)

Treating transaction review as a ritual, not a chore.

- **Tinder-Style Inbox:** New transactions appear as cards.
  - **Swipe Right:** Confirm/Categorize.
  - **Swipe Left:** Split or Flag for Review.
  - **Tap:** Open detailed view.
- **Emotional ROI Tagging:** Color-coded chips for `Joy`, `Regret`, and `Essential` to track the emotional impact of spending.
- **Line-Item Accordion:** For retail purchases (Amazon/Walmart), an expansion panel reveals the specific items pulled by the local scraper agent.

---

## 4. Agentic Autopilot Interface

Clear UI feedback for autonomous background tasks.

- **Negotiation Hub:** A sidebar showing active agent tasks (e.g., "Negotiating Telus Bill"). Includes status bars and "Review Draft Script" buttons.
- **Action Modals:** Clean, high-impact modals for autonomous rerouting prompts (e.g., "I found a $50 surplus. Move to Emergency Fund?").

---

## 5. Edmonton & Canadian Localizations

- **The "CRA Corner":** A specialized tab for tax-eligible tracking.
  - **FHSA Progress:** Visual bar for the $8,000 annual limit.
  - **Receipt Vault:** Drag-and-drop zone for T2200 and donation receipts.
- **Utility Benchmarking:** A widget comparing EPCOR/Telus spending against Edmonton city averages using a simple "Efficiency Score."

---

## 6. Technical Components (Mantine Implementation)

- **Shell:** `AppShell` with a responsive sidebar and persistent global stats in the header.
- **Input:** Custom `Select` and `Autocomplete` components with emoji support for intuitive categorization.
- **Visualization:** `Recharts` integration for the Cash Flow Time-Machine and Net Worth projections.
