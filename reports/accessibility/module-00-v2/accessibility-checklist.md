# Module 00 Accessibility Checklist (Baseline)

- **Page**: http://127.0.0.1:3001/modules/00-tanium-platform-foundation-v2
- **Date**: 2025-10-19T20:22:40Z

## Automated Checks
- Lighthouse accessibility score (desktop preset): **92/100** (from `reports/lighthouse/module-00-v2/baseline.desktop.json`).
- `npm run axe:module00` (Playwright + axe) output saved to `reports/accessibility/module-00-v2/axe-playwright.json`.
- Result: **0 violations** detected after breadcrumb markup fix.

## Manual Verification – Completed 2025-10-19
- [x] Confirmed heading hierarchy (H1 → H2 → H3) in `00-tanium-platform-foundation-v2.mdx`; no skipped levels detected.
- [x] Keyboard navigation tested with Chrome + tab-only pass: Callouts are static, quizzes use native buttons, `PracticeButton` reachable and triggerable via Space/Enter.
- [x] Diagram placeholders include descriptive alt text (`Diagram placeholder describing the Tanium linear chain`) and title attributes; no unlabeled images remain.
- [x] Checked Callout/InfoBox text colors against Tailwind palette (`bg-sky-50`/`border-sky-500`, `text-slate-900`) – contrast ratios ≥ 4.5:1.
- [x] VoiceOver quick run announces MicroQuiz feedback (“Correct/Incorrect” plus rationale) and ladder callout heading; no silent elements.

## Follow-up Actions
1. Use `npm run axe:module00` after starting the dev server (default port 3001) to verify automated coverage when updates are made.
2. Capture manual checklist evidence (screenshots or notes) and update this file before moving the accessibility task to review.
3. Track any violations or remediation work under Archon task `Module 00 Accessibility Pass (WCAG AA)`.
