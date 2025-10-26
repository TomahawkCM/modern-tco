# Learn-Style Module Review & Recommendations

## 1. Snapshot: Learn Experimental vs. Production Modules

| Dimension | Learn Experimental (`01-asking-questions-learn-experimental.mdx`) | Production Module (`01-asking-questions.mdx`) | Impact |
| --- | --- | --- | --- |
| **Structure** | Five `MicroSection` blocks, each a 5–12 minute blurb with bullet key takeaways and generic workflow steps. | Rich narrative organized by exam objectives with deep dives, QueryPlayground exercises, InfoBoxes, and hands-on labs. | Learn variant reads inspirational but lacks the concrete scaffolding that anchors practice and exam alignment. |
| **Interactivity** | Depends on `MicroQuizMDX` pulling random question bank items by domain/tag. Practice buttons point to short Markdown task lists. | Custom practice per concept (QueryPlayground, structured labs) with expected outputs and hints embedded in context. | Random quizzes could mismatch the unit focus; labs lack self-checks, so learners may stall without feedback. |
| **Authenticity** | Minimal references to actual Tanium UI, commands, or sensors; written in motivational language. | Provides real query strings, sensor walkthroughs, troubleshooting tips, screenshots. | Learn units don’t yet prove mastery of real console tasks. |
| **Metadata & Taxonomy** | Missing `blueprintWeight`, objective count, version; estimatedTime stored as number; status `experimental`. | Consistent front matter with blueprint weighting, objectives array, status `published`. | Tooling (dashboards, progress tracking) assumes production metadata; Learn files would need normalization before merge. |
| **Lab Assets** | Labs in `src/content/labs/01-l/*.md` describe steps but no validation, sample outputs, or timing cues. | Production labs embed in-module references, clear completion criteria, and sometimes supporting assets. | Without self-contained guidance, solo learners can’t confirm success—at odds with the “5–10 minute win” promise. |

## 2. Content Improvement Priorities

1. **Infuse Concrete Tanium Context**
   - Mirror production examples—sample questions, screenshot callouts, expected results—inside each MicroSection.
   - Reference specific sensors, modules, and UI affordances to ground instructions.

2. **Curate Unit-Specific Quick Checks**
   - Replace generic `getReadOnlyQuestions` pulls with small question pools purpose-built for each learning outcome.
   - Return immediate feedback (explanations, linked refreshers) to keep the microlearning loop tight.

3. **Level-Up Practice Labs**
   - Convert Markdown checklists into guided labs with example inputs/outputs, success criteria, and optional solution reveals.
   - Include reflective prompts (“What would you automate next?”) to reinforce metacognition.

4. **Normalize Metadata & Taxonomy**
   - Add `blueprintWeight`, `objectives`, `version`, consistent `estimatedTime` string formatting.
   - Tag alignment with production modules ensures analytics and recommendation systems behave predictably.

5. **Borrow Proven Interactive Components**
   - Drop in QueryPlayground, InfoBox, and Table components where appropriate while preserving the shorter pacing.
   - Introduce micro-scenarios or decision trees tied to exam-relevant tasks.

6. **Storytelling Enhancements**
   - Start each MicroSection with a short scenario anchored to the Tanium role (operations lead, security analyst, etc.).
   - Close with a “Next best action” snippet connecting to flashcards or practice questions for interleaving.

## 3. Implementation Approach for a Solo Dev

- **Phase 0: Structure Parity** – Update front matter, add blueprint alignment, ensure practice buttons resolve to enhanced labs.
- **Phase 1: Contextual Depth** – Layer in concrete examples, QueryPlayground embeds, and curated knowledge checks.
- **Phase 2: Feedback Loop** – Upgrade labs + quizzes with auto-feedback; connect to flashcard system for spaced follow-up.
- **Phase 3: Analytics** – Instrument `emitLearnExp` events to capture unit completions, quiz accuracy, time-on-task.

Delivering improvements in sprints keeps scope manageable while driving toward parity with published content.
