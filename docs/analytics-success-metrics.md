# Analytics & Success Metrics Plan

## Goals
- Measure the effectiveness of the beginner-first rewrite.
- Track when learners complete critical milestones (onboarding tour, Module 00 progress, flashcard creation, quiz success).
- Capture drop-off points to guide future UX iterations.

## Key KPIs
| KPI | Definition | Event(s) | Baseline Note |
| --- | --- | --- | --- |
| Beginner onboarding completion rate | % of unique visitors who finish `/beginner/onboarding` | `beginner_onboarding_view`, `beginner_onboarding_cta` | First baseline after launch (TBD) |
| Module 00 first success completion | % of learners reaching Module 00 quiz checkpoint | `micro_quiz_answered` (correct) | Module 00 v2 launch baseline |
| Flashcard adoption | # flashcards created/imported after Module 00 | `flashcard_created`, `flashcard_autogen` | Track week-over-week |
| Practice conversion | # quick drills launched from Module 00 / onboarding | `beginner_onboarding_cta` with `cta: 'start_module_00'` or `practice_start` | Compare to previous module version |

## Instrumented Events
| Event | Trigger | Properties |
| --- | --- | --- |
| `beginner_onboarding_view` | `/beginner/onboarding` loads | `section` (string) |
| `beginner_onboarding_cta` | CTA click within onboarding or dashboard | `cta` (string), `location` (string), `state` (optional) |
| `micro_quiz_answered` | MicroQuiz submit | `question`, `correct`, `moduleId`, `sectionId`, `concept` |
| `flashcard_created` | Manual flashcard creation | `moduleId`, `sectionId`, `cardType` |
| `flashcard_autogen` | Auto-generation success | `moduleId`, `count` |
| `module_practice_start` | Practice button pressed in Module 00 | Already instrumented via analytics capture |
| `query_playground_result` | User checks a query | `title`, `difficulty`, `correct`, `attempts` |

> Note: Some components (MicroQuiz, FlashcardGenerator, QueryPlayground) already emit PostHog events. The lightweight analytics wrapper ensures events fire even without PostHog key (no-ops otherwise).

## Implementation Summary
- `src/app/beginner/onboarding/page.tsx`: captures page view + CTA clicks.
- `src/components/dashboard/BeginnerDashboard.tsx`: records CTA usage when launching onboarding.
- `src/components/study/MicroQuiz.tsx`: improved toasts + uses analytics wrapper (existing instrumentation kept).
- `src/components/flashcards/FlashcardGenerator.tsx`: emits `flashcard_created`/`flashcard_autogen`.
- `src/components/mdx/QueryPlayground.tsx`: emits `query_playground_result` with attempts and hint usage (in-progress).

## Baseline Data Collection
1. Deploy branch `content/codex-rewrite` to preview and confirm instrumentation via browser console (`window.posthog?.debug()` or enabling `NEXT_PUBLIC_ANALYTICS_DEBUG=true`).
2. After production launch, monitor PostHog dashboards for KPIs above.
3. Record first-week baseline in this document (add table updates).

## Follow-ups
- Integrate analytics events with Module progress API (pending Supabase audit).
- Create a simple dashboard (Supabase SQL or PostHog insights) to visualise onboarding completion vs. Module 00 quiz success.
