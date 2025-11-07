# Budget App UI/UX - Agent Assignment Quick Reference

**Project:** Budget App UI/UX Modernization
**PRD:** See `BUDGET_APP_UI_UX_PRD.md` (READ THIS FIRST!)
**Timeline:** 12-18 days (4 phases)

---

## Quick Task Assignment Guide

### Phase 1: Design System Compliance (2-3 days)

#### Task 1.1: Remove Gradient Overload (4-6 hours)
**Assigned To:**
- **Primary**: frontend-developer, react-specialist
- **Support**: refactoring-specialist
- **Coordination**: mesh-coordinator

**Action Items:**
1. Find all `bg-gradient-to-r` and `bg-gradient-to-br` in budget-app components
2. Replace with solid colors + optional border-left-4 border-teal-500
3. Verify: `grep -r "gradient" src/app/budget-app/` returns 0 results

---

#### Task 1.2: Consolidate to Single Accent Color (2-3 hours)
**Assigned To:**
- **Primary**: ui-ux-designer, frontend-developer
- **Coordination**: single-lead (design-led)

**Action Items:**
1. Select teal (#14b8a6) as single accent
2. Replace all purple/orange/cyan with gray or teal
3. Keep green/red/yellow ONLY for semantic meaning
4. Verify: Max 4 distinct colors visible

---

#### Task 1.3: Implement WCAG 2.2 AA Accessibility (6-8 hours)
**Assigned To:**
- **Primary**: accessibility-tester (LEAD), frontend-developer
- **Support**: qa-expert
- **Coordination**: hierarchical-coordinator

**Action Items:**
1. Add ARIA labels to all interactive elements
2. Add focus indicators: `focus:ring-2 focus:ring-teal-500`
3. Add non-color status indicators (icons + text)
4. Use semantic HTML (`<button>`, `<nav>`, `<main>`)
5. Verify: Lighthouse ≥95%, Pa11y 0 errors

---

### Phase 2: 2025 UX Patterns (3-5 days)

#### Task 2.1: Add Microinteractions (1 day)
**Assigned To:**
- **Primary**: frontend-developer, ui-ux-designer
- **Coordination**: mesh-coordinator

**Action Items:**
1. Add button press animations: `active:scale-95`
2. Add success checkmarks: Animated SVG
3. Add loading skeletons: Shimmer effect
4. Replace `alert()` with react-hot-toast
5. Add animated progress counters: CountUp component
6. Verify: All actions have visual feedback, no alerts

---

#### Task 2.2: Implement Predictive Insights (2 days)
**Assigned To:**
- **Primary**: data-analyst, frontend-developer
- **Support**: react-specialist, data-scientist
- **Coordination**: adaptive-coordinator

**Action Items:**
1. "You usually spend $X on Y" (3-month average)
2. Overspending alerts: "At this rate, you'll exceed budget by..."
3. Recurring transaction detection: Flag weekly/monthly patterns
4. Budget forecast: Trend line projections
5. Verify: 3+ insights visible on dashboard (90+ days data)

---

#### Task 2.3: Enhanced Data Visualization (1-2 days)
**Assigned To:**
- **Primary**: data-scientist, frontend-developer
- **Support**: ui-ux-designer
- **Coordination**: adaptive-coordinator

**Action Items:**
1. Add trend lines with projections (dotted for forecast)
2. Add heat map: Spending by day-of-week (7x4-5 grid)
3. Add sparklines: Mini 7-day trends in metric cards
4. Enhanced tooltips: Show comparative context
5. Verify: All charts have interactive tooltips

---

### Phase 3: Mobile-First Optimization (3-4 days)

#### Task 3.1: Responsive Redesign (2 days)
**Assigned To:**
- **Primary**: frontend-developer, ui-ux-designer
- **Support**: react-specialist, typescript-pro
- **Coordination**: coordinated-swarm

**Action Items:**
1. Collapsible sidebar: Hamburger menu (<768px)
2. Bottom navigation: Mobile tab bar (Home, Transactions, Budgets, Reports)
3. Touch targets: All buttons ≥44px
4. Tables: Horizontal scroll + mobile card view option
5. Forms: Stacked fields, larger inputs (48px height)
6. Modals: Bottom sheet style on mobile
7. Verify: Google Mobile-Friendly ≥90%

---

#### Task 3.2: PWA Implementation (1 day)
**Assigned To:**
- **Primary**: frontend-developer, performance-engineer
- **Coordination**: single-lead

**Action Items:**
1. Create `public/manifest.json`
2. Create `public/sw.js` (service worker)
3. Register service worker in layout
4. Add "Add to Home Screen" prompt
5. Create PWA icons (192px, 512px)
6. Verify: Lighthouse PWA 100%, installs on iOS/Android

---

#### Task 3.3: Mobile-Optimized Workflows (1 day)
**Assigned To:**
- **Primary**: frontend-developer, ui-ux-designer
- **Coordination**: mesh-coordinator

**Action Items:**
1. Swipe-to-delete transactions
2. Sticky table headers on scroll
3. Pull-to-refresh on lists
4. Optimized chart sizes (reduce height for mobile)
5. Verify: All workflows testable on mobile device

---

### Phase 4: Advanced Features (4-6 days)

#### Task 4.1: Guided Onboarding Tour (1 day)
**Assigned To:**
- **Primary**: frontend-developer, tutorial-engineer
- **Support**: technical-writer
- **Coordination**: mesh-coordinator

**Action Items:**
1. Install Intro.js or Shepherd.js
2. Create 5-step tour (Welcome → Import → Categorize → Budget → Dashboard)
3. Add "Don't show again" option
4. Track completion in localStorage
5. Verify: 80%+ users complete tour

---

#### Task 4.2: Smart Categorization Enhancements (1-2 days)
**Assigned To:**
- **Primary**: data-scientist, frontend-developer
- **Support**: react-specialist
- **Coordination**: adaptive-coordinator

**Action Items:**
1. ML suggestions: TensorFlow.js model
2. Bulk categorization UI: Multi-select + categorize
3. Confidence meter: 5-bar scale showing certainty
4. "Learn from this" button: Explicit feedback
5. Verify: Auto-categorization ≥90% accurate after 100 transactions

---

#### Task 4.3: Split Transactions (1 day)
**Assigned To:**
- **Primary**: frontend-developer, react-specialist
- **Coordination**: single-lead

**Action Items:**
1. Create split modal (open from transaction row)
2. Allow split by percentage or fixed amount
3. Support multi-way splits (3+ categories)
4. Update database schema: `splitFromId`, `isSplit` fields
5. Verify: Can split and view correctly in list

---

#### Task 4.4: Receipt Attachments (1-2 days)
**Assigned To:**
- **Primary**: frontend-developer, backend-developer (OCR logic)
- **Coordination**: mesh-coordinator

**Action Items:**
1. Drag & drop photo upload (react-dropzone)
2. IndexedDB blob storage (5MB per receipt)
3. Image preview thumbnail
4. Camera capture (mobile web API)
5. Optional: OCR extraction (Tesseract.js)
6. Verify: Upload receipt, view in transaction details

---

#### Task 4.5: Keyboard Shortcuts (4 hours)
**Assigned To:**
- **Primary**: frontend-developer
- **Coordination**: single-lead

**Action Items:**
1. Implement shortcuts: N (new), / (search), B (budgets), D (dashboard), ? (help), Esc (close)
2. Create shortcuts overlay (show on ? key)
3. Ignore shortcuts when typing in inputs
4. Verify: All shortcuts work, ? overlay shows list

---

## Agent Capability Matrix

| Agent | Skills | Best For | Avoid For |
|-------|--------|----------|-----------|
| **frontend-developer** | React, TypeScript, UI | Most UI tasks | ML/data science |
| **react-specialist** | React patterns, hooks | Complex state management | Design, data |
| **typescript-pro** | Type safety, generics | Type definitions | Visual design |
| **ui-ux-designer** | Visual design, flows | Design system, mockups | Implementation |
| **accessibility-tester** | WCAG, ARIA, screen readers | Accessibility audits | General development |
| **data-scientist** | ML, TensorFlow, statistics | ML models, predictions | UI implementation |
| **data-analyst** | Data queries, metrics | Analytics, insights | Visual design |
| **performance-engineer** | Optimization, profiling | PWA, performance tuning | Design, content |
| **qa-expert** | Test strategies, QA | Test planning | Implementation |
| **test-automator** | Jest, Playwright, CI | Automated tests | Manual testing |
| **tutorial-engineer** | Onboarding, guides | Tours, help content | Development |
| **technical-writer** | Documentation, API docs | User guides, README | Implementation |
| **refactoring-specialist** | Code quality, cleanup | Large refactors | New features |
| **code-reviewer** | Standards, best practices | PR reviews | Initial development |

---

## Coordination Strategy Reference

### When to Use Each Strategy

**Mesh Coordinator** (Parallel Execution)
- **Use when:** Tasks are independent, minimal dependencies
- **Examples:** Remove gradients across multiple files, add microinteractions, keyboard shortcuts
- **Pros:** Fast (parallel work), minimal overhead
- **Cons:** Risk of conflicts, needs good merge strategy

**Hierarchical Coordinator** (Lead Agent)
- **Use when:** One expert should direct others
- **Examples:** Accessibility (accessibility-tester leads), complex architecture decisions
- **Pros:** Clear direction, consistent standards
- **Cons:** Bottleneck at lead, slower decision-making

**Adaptive Coordinator** (Data-Driven)
- **Use when:** Multiple approaches possible, need to test and measure
- **Examples:** Predictive insights, ML categorization, data visualizations
- **Pros:** Best solution wins, evidence-based
- **Cons:** Requires metrics, longer experimentation phase

**Coordinated Swarm** (Frequent Sync)
- **Use when:** Complex cross-cutting changes, high interdependency
- **Examples:** Responsive redesign (affects layout, components, types)
- **Pros:** Handles complexity, incremental integration
- **Cons:** High coordination overhead, frequent syncs needed

**Single-Lead** (Solo Execution)
- **Use when:** Simple, linear tasks
- **Examples:** PWA setup, split transactions, keyboard shortcuts
- **Pros:** Fastest for simple tasks, no coordination
- **Cons:** No parallelism, single point of failure

---

## Task Sequencing Rules

### MUST DO IN ORDER:
1. Phase 1 before Phase 2 (design compliance first)
2. Phase 1.3 (accessibility) after Phase 1.2 (colors finalized)
3. Phase 3.1 (responsive) before Phase 3.3 (mobile workflows)
4. Phase 3.2 (PWA) after Phase 3.1 (responsive layout ready)

### CAN DO IN PARALLEL:
- Phase 1.1 (gradients) + Phase 1.2 (colors) - different agents, minimal conflict
- Phase 2.1 (microinteractions) + Phase 2.2 (insights) - different components
- Phase 4.1 (tour) + Phase 4.3 (split) + Phase 4.5 (shortcuts) - independent features

### DEFER IF NEEDED:
- Phase 4 (all advanced features) - nice-to-have, not critical
- Phase 2.3 (enhanced viz) - can use basic charts if time-constrained
- Phase 4.4 (receipts) - most complex, least essential

---

## Testing Assignments

### Automated Testing
**Assigned To:** test-automator, qa-expert

**Tasks:**
- [ ] Setup Lighthouse CI (accessibility ≥95%, performance ≥90%, PWA 100%)
- [ ] Setup Pa11y (0 WCAG violations)
- [ ] Write Jest unit tests (≥80% coverage for new components)
- [ ] Write Playwright E2E tests (import, add, edit, delete, budget, report flows)

### Manual Testing
**Assigned To:** accessibility-tester, ui-ux-designer, qa-expert

**Tasks:**
- [ ] Screen reader test: NVDA (Windows) + VoiceOver (Mac/iOS)
- [ ] Keyboard-only test: Complete all workflows without mouse
- [ ] Device test: iPhone SE, iPad Air, Pixel 7, Desktop (Chrome/Firefox/Safari)
- [ ] Color blindness test: Protanopia, Deuteranopia, Tritanopia, Achromatopsia
- [ ] Zoom test: 200%, 300% browser zoom

---

## Emergency Contacts

**If Task is Blocked:**
1. Check PRD (`BUDGET_APP_UI_UX_PRD.md`) for clarification
2. Check design guide (`.claude/Skills/design-guide.md`)
3. Ask coordinating agent for guidance
4. Escalate to project lead if critical blocker

**If Agent Unavailable:**
- frontend-developer → react-specialist (backup)
- ui-ux-designer → frontend-developer (can do basic design)
- accessibility-tester → qa-expert (basic a11y knowledge)
- data-scientist → data-analyst (simpler approach)

---

## Project Checkpoints

### Checkpoint 1: After Phase 1 (Day 3)
**Review:**
- [ ] All gradients removed
- [ ] Single accent color verified
- [ ] Lighthouse accessibility ≥95%
- [ ] Pa11y 0 errors
- [ ] Manual screen reader + keyboard tests passed

**Decision:** Proceed to Phase 2 or fix issues?

### Checkpoint 2: After Phase 2 (Day 8)
**Review:**
- [ ] All microinteractions implemented
- [ ] 3+ insights visible on dashboard
- [ ] All charts have enhanced tooltips
- [ ] Heat map renders correctly

**Decision:** Proceed to Phase 3 or defer Phase 4?

### Checkpoint 3: After Phase 3 (Day 12)
**Review:**
- [ ] Google Mobile-Friendly ≥90%
- [ ] Lighthouse PWA 100%
- [ ] App installs on iOS + Android
- [ ] All mobile workflows testable

**Decision:** Proceed to Phase 4 or launch with current features?

### Final Checkpoint: After Phase 4 (Day 18)
**Review:**
- [ ] All deliverables completed
- [ ] All tests passing
- [ ] User testing: 5/5 users successful
- [ ] No regressions detected

**Decision:** Ready to merge and deploy!

---

**REMEMBER:** Always read the PRD (`BUDGET_APP_UI_UX_PRD.md`) before starting ANY task. It contains detailed requirements, validation criteria, and success metrics for every task.
