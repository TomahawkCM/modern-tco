# Module 00 Accessibility Checklist (Baseline)

- **Page**: http://127.0.0.1:3001/modules/00-tanium-platform-foundation-v2
- **Date**: 2025-10-19T20:22:40Z

## Automated Checks
- Lighthouse accessibility score (desktop preset): **92/100** (from `reports/lighthouse/module-00-v2/baseline.desktop.json`).
- `npm run axe:module00` (Playwright + axe) output saved to `reports/accessibility/module-00-v2/axe-playwright.json`.
- Result: **0 violations** detected after breadcrumb markup fix.

## Manual Verification – To Do
- [ ] Confirm heading hierarchy (H1 → H2 → H3 with no skips).
- [ ] Validate keyboard navigation order through all interactive components (Callouts, Steps, MicroQuizMDX, PracticeButton).
- [ ] Ensure all images/diagram placeholders include descriptive alt text and captions.
- [ ] Check color contrast for text within Callout/InfoBox components against WCAG AA.
- [ ] Run screen reader smoke test (NVDA/VoiceOver) to confirm annunciation of quiz feedback.

## Follow-up Actions
1. Use `npm run axe:module00` after starting the dev server (default port 3001) to verify automated coverage when updates are made.
2. Capture manual checklist evidence (screenshots or notes) and update this file before moving the accessibility task to review.
3. Track any violations or remediation work under Archon task `Module 00 Accessibility Pass (WCAG AA)`.
