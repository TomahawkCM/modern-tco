# Module Verification Checklist Template

- **Module ID**: `module-xx`
- **Reviewer**: `Name`
- **Date**: `YYYY-MM-DD`
- **Branch / PR**: `content/codex-rewrite` / `<link>`

## 1. Structure & Pedagogy

- [ ] Why → What → How → Apply sections present.
- [ ] Analogy present in “Why” and referenced later (`Beginner anchor`).
- [ ] Knowledge checks (6–12) distributed across sections.
- [ ] Checkpoint quiz (5–10 Qs with rationales) in “Apply”.
- [ ] Mini-practice tasks (1–3) per section completed.
- [ ] One-sentence summary closes each section.

## 2. Accessibility (WCAG AA)

- [ ] Heading levels sequential (H1 → H2 → H3) with no skips.
- [ ] All images/diagrams include descriptive alt text.
- [ ] Interactive components reachable via keyboard (Tab/Shift+Tab).
- [ ] Focus states visible and meet contrast ratio ≥ 3:1.
- [ ] Screen reader labels/aria attributes verified for quizzes and buttons.
- [ ] Axe/Lighthouse accessibility run attached (`reports/accessibility/<module>/`).

## 3. Performance

- [ ] Lighthouse desktop ≥ 80 (attach JSON).
- [ ] LCP < 3.0s.
- [ ] Bundle size reviewed (note large imports, dynamic chunks).
- [ ] Deferred/lazy components documented.
- [ ] Performance README updated.

## 4. Content QA

- [ ] Exam mapping table covers each subsection (link to TCO topics).
- [ ] Beginner anchors (analogy, diagram placeholder, first-success pathway).
- [ ] Pitfalls & debugging guidance included.
- [ ] Glossary terms defined inline and in global glossary.
- [ ] Inline knowledge checks reference analytics event IDs (if applicable).

## 5. Evidence Archive

- [ ] Accessibility checklist updated (`reports/accessibility/<module>/accessibility-checklist.md`).
- [ ] Performance README & JSON committed (`reports/lighthouse/<module>/`).
- [ ] Flashcard pack confirmed (40–80 cards).
- [ ] Flashcard import script/path validated.
- [ ] QA notes stored in `reports/qa/<module>-journey.md` (or module-specific).

## 6. Sign-off

| Role | Name | Date | Notes |
| --- | --- | --- | --- |
| Content lead | | | |
| Accessibility | | | |
| Performance | | | |
| QA | | | |

> **Reminder**: Update the Archon task status with links to the evidence above when moving to `review` or `done`.

