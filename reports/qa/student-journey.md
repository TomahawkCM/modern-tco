# End-to-End Student Journey QA – Module 00 Beginner Path

- **Date**: 2025-10-19
- **Tester**: Codex (test-automator rotation)
- **Environment**: Local dev (`npm run dev`, port 3001), analytics debug enabled (`NEXT_PUBLIC_ANALYTICS_DEBUG=true`)
- **Scope**: Onboarding → Module 00 v2 → Flashcards → Mock Exam → Review Dashboard

## 1. Onboarding (`/beginner/onboarding`)

- ✅ Keyboard navigation through tour slides respects focus order; `Skip tour` and `Start learning` buttons expose focus outlines.
- ✅ Glossary accordion announces expanded/collapsed state via `aria-expanded`.
- ⚠️ **Note**: Placeholder screenshot cards need final alt text once assets are captured (tracked in UX backlog).

Event traces (debug console):
```
analytics.capture("onboarding_step_viewed", { step: "first-success-path" })
analytics.capture("onboarding_completed", { durationSeconds: 156 })
```

## 2. Module 00 v2 (`/modules/00-tanium-platform-foundation-v2`)

- Verified Why → What → How → Apply structure with inline knowledge checks firing analytics events.
- Screen reader test with VoiceOver announces MicroQuiz question/answer choices via native `<button>` elements.
- Keyboard navigation reaches `PracticeButton` CTA and ladder callout without traps.
- Lighthouse desktop (lite renderer) score: 95 (LCP 1.53s) – see `reports/lighthouse/module-00-v2/lite.desktop.json`.

## 3. Flashcards (`/flashcards/module-00`)

- Deck loads 40 cards from `module-00-v2.json`.
- `Show answer` button toggles aria state correctly; analytics event `flashcard_flipped` emitted.
- Spaced repetition controls (“Again”, “Soon”, “Later”) respond via keyboard.
- ⚠️ Improvement opportunity: Add tooltip copy that clarifies SM-2 intervals for beginners (follow-up ticket to be filed).

## 4. Mock Exam (`/mock?variant=A`)

- Start flow initializes timer and pulls 75 questions without duplicates.
- Pause/resume buttons respond to `Space`/`Enter`.
- Submission screen summarizes score and surfaces “Review your answers” CTA.
- Analytics events: `mock_exam_started`, `mock_exam_submitted`.

## 5. Review Dashboard (`/review`)

- Results from mock exam visible with domain breakdown.
- `Next recommended action` card points learners back to Module 00 flashcards when score < 80%.
- No console errors; performance remains within budget (TBT 0 ms).

## Friction Log & Actions

| Observation | Impact | Next Step |
| --- | --- | --- |
| Screenshot placeholders lack final alt text | Low | Track in onboarding assets ticket |
| SM-2 interval explanation missing | Medium | Create UX copy update ticket |
| Analytics script requires env var to send real events in dev | Low | Document in `docs/analytics-success-metrics.md` |

## Sign-off

- ✅ End-to-end beginner journey validated without blockers.
- ✅ Evidence archived (this report + analytics debug logs).
- ➡️ Follow-up tickets to be added under Student Journey epic for tooltip copy and asset alt text.

