# RFC-002 Implementation Plan

## UI/UX Architecture + Engineering Tickets + UX Confusion Audit

Related:

- RFC-001: Global Multi-Currency Financial Simulation Engine
- RFC-002: UI/UX Architecture for Global Financial Simulation Platform

Status: Draft
Last Updated: 2026-02-21

---

# PART 1 — Engineering Tickets (With Dependency Order)

This section converts the UI RFC into implementable engineering tickets grouped by phase and dependency.

---

## PHASE P0 — Foundation UI (Global Baseline)

### P0-1: Design System Foundations

Dependencies: None

- Define color tokens (semantic only)
- Define typography scale
- Define spacing scale
- Create base layout primitives
- Accessibility baseline (WCAG AA tokens)

---

### P0-2: MoneyDisplay Component

Dependencies: P0-1

- Locale-aware currency formatting
- Minor unit support
- Compact mode
- Native vs reporting toggle support
- Unit tests for formatting edge cases

---

### P0-3: FinancialShell Layout

Dependencies: P0-1

- Primary navigation
- Scenario selector dropdown
- Reporting currency indicator
- Advanced mode toggle (hidden initially)

---

### P0-4: NetWorthHero Component

Dependencies: P0-2, P0-3

- Headline net worth
- Trend arrow
- Delta display (baseline only)

---

### P0-5: AssumptionEditor (Basic)

Dependencies: P0-3

- Reporting currency selector
- Static FX input fields
- Base inflation input
- Return rate input
- Compounding frequency

---

### P0-6: CurrencyExposurePie

Dependencies: P0-2

- Pie visualization
- Tooltip breakdown
- Accessible color mapping

---

### P0-7: Basic Timeline (Net Worth + Debt Only)

Dependencies: Engine output stable

- Net worth line
- Debt curve
- Hover breakdown
- Inflation-adjusted toggle
- Performance profiling

---

### P0-8: TransparencyPanel

Dependencies: P0-5

- Display FX assumptions
- Display inflation assumptions
- Display compounding rules
- Plain-language explanation section

---

P0 Exit Criteria:

- Multi-currency works with static FX
- Timeline renders under 100ms
- All financial outputs transparent

---

## PHASE P1 — Scenario Intelligence

### P1-1: ScenarioTree Component

Dependencies: P0 complete

- Tree rendering
- Duplicate scenario
- Rename
- Delete branch

---

### P1-2: ComparisonGrid

Dependencies: P1-1

- Side-by-side layout
- Delta highlighting
- Net worth difference
- Retirement shift
- FX impact

---

### P1-3: FX Drift Modeling UI

Dependencies: Engine drift support

- Drift input per currency
- Validation
- Tooltip explanations

---

### P1-4: SensitivitySlider Component

Dependencies: Engine recalculation stability

- Slider for FX sensitivity
- Slider for interest rate shock
- Real-time recalculation

---

### P1-5: Enhanced TimelineCanvas

Dependencies: P0-7

- Currency exposure overlay
- Scenario comparison overlay
- Improved hover state

---

P1 Exit Criteria:

- Branching works reliably
- Comparison clear and readable
- Drift modeling stable

---

## PHASE P2 — Advanced Modeling UI

### P2-1: Monte Carlo Controls

Dependencies: Engine Monte Carlo complete

- Simulation count input
- Volatility inputs
- Progress indicator

---

### P2-2: Risk Heatmap

Dependencies: Monte Carlo output

- Probability visualization
- Accessible gradient scale

---

### P2-3: Stress Testing Controls

Dependencies: Engine stress support

- Interest shock slider
- FX shock slider
- Inflation shock slider

---

### P2-4: Timeline Zoom + Advanced Interaction

Dependencies: TimelineCanvas stable

- Zoom control
- Scroll optimization
- Worker-based calculation support

---

P2 Exit Criteria:

- Monte Carlo under 1 second
- No UI blocking
- Risk visualization understandable in user testing

---

# PART 2 — UX Confusion Audit

This section predicts where users may struggle.

---

## Risk Area 1: Native vs Reporting Currency Confusion

Problem:
Users may not understand why totals differ from native asset values.

Mitigation:

- Always display reporting currency badge
- Hover explanation: “Converted using FX assumptions”
- Toggle clearly labeled

---

## Risk Area 2: FX Drift Misinterpretation

Problem:
Users may treat drift as guaranteed outcome.

Mitigation:

- Add disclaimer: “Drift is an assumption, not prediction”
- Provide quick explanation tooltip
- Highlight sensitivity impact

---

## Risk Area 3: Scenario Overwhelm

Problem:
Users may create too many branches.

Mitigation:

- Limit visible depth initially
- Encourage naming scenarios
- Offer cleanup suggestion

---

## Risk Area 4: Monte Carlo Misunderstanding

Problem:
Users may interpret probability bands as certainty.

Mitigation:

- Plain language: “Based on simulated variability”
- Tooltip explaining percentile outcomes

---

## Risk Area 5: Inflation vs Return Confusion

Problem:
Users may not understand inflation-adjusted view.

Mitigation:

- Toggle labeled: “Show today’s dollars”
- Inline explanation

---

## Risk Area 6: Performance Perception

Problem:
Heavy recalculations may feel laggy.

Mitigation:

- Debounce sliders
- Loading indicator for Monte Carlo
- Use web workers for heavy math

---

## Risk Area 7: Advanced Mode Intimidation

Problem:
Users may fear advanced settings.

Mitigation:

- Default collapsed
- Clear description: “Optional advanced modeling”
- Never require advanced fields

---

# Conclusion

This document operationalizes the UI RFC into:

- Ordered engineering tickets
- Clear phase gates
- Anticipated UX failure points

The goal is disciplined execution without overwhelming users while preserving modeling power.
