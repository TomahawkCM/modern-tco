# Question & Flashcard Authoring Guidelines

- **Audience**: Assessment authors, curriculum contributors
- **Last updated**: 2025-10-19
- **Related tasks**: Archon “Authoring Guidelines for Q/A and Flashcards”

## 1. Core Principles
- Write for beginners first; explain acronyms on first use.
- Map every item to a TCO domain and cite the relevant objective in the metadata.
- Keep cognitive load low (≤ 3 clauses per sentence).
- Prefer real-world Tanium scenarios over abstract trivia.

## 2. Question Format (Mock Exam & Practice)

| Element | Requirement | Example |
| --- | --- | --- |
| **Stem** | One clear problem statement in present tense. Avoid double negatives. | “An operator needs to confirm which endpoints have Patch XYZ installed. Which sensor should they start with?” |
| **Options** | 4 choices; plausible distractors that target a single misconception each. Shuffle-safe (no “All of the above”). | `["Installed Patches", "Running Processes", "Question History", "Endpoint Activity"]` |
| **Answer** | Exactly one correct option; document the rationale. | Correct: `"Installed Patches"` |
| **Rationale** | 1–2 sentences. Explain why the answer is correct *and* why the main distractor is wrong. | “The Installed Patches sensor returns patch inventory. Running Processes lists active executables, which won’t confirm patch status.” |
| **Difficulty** | `beginner`, `intermediate`, or `advanced`. Anchor to the rubric below. | `difficulty: "beginner"` |
| **Tags** | Array of domain + subtopic slugs (e.g., `["navigation", "interact"]`). | `tags: ["navigation", "interact"]` |

### Difficulty Rubric
- **Beginner** – recall terminology, console navigation, default workflows.
- **Intermediate** – apply concepts to filter/targeting, basic troubleshooting.
- **Advanced** – multi-step scenarios, optimization, or risk mitigation trade-offs.

### Accessibility Checklist (per question)
- Plain-language stem (Flesch-Kincaid ≤ 8th grade; use Hemmingway/Grammarly when in doubt).
- Avoid gendered language and idioms.
- Provide alt text for any media references; keep questions text-first by default.

## 3. Flashcard Format

| Field | Requirement |
| --- | --- |
| `id` | Stable slug: `module00-term-peer-to-peer` |
| `front` | Prompt (question, scenario, or definition request). |
| `back` | Answer with <= 3 sentences or bullet list. Include “why it matters.” |
| `tags` | Module + topic, e.g., `["module00", "architecture"]`. |
| `difficulty` | `easy`, `medium`, `hard` (mapped from question difficulty). |

### Flashcard Tips
- Lead with a cue/action (“Define…”, “List…”, “When would you…”).
- Use parallel structure across cards in the same set.
- Embed mnemonic/analogy references from the module to reinforce memory.
- For processes, include a 3-step summary (Step 1 / Step 2 / Step 3).

## 4. Quality Gates

1. **Peer Review** – Every batch gets a second author’s pass for clarity and alignment.
2. **Analytics Tagging** – Ensure `eventId` or `analyticsTag` fields (if present) reference the same slug as Module 00 v2 instrumentation.
3. **Spec Kit Compliance** – Verify plain language and tone against `.specify/constitution.md`.
4. **Import Dry Run** – Execute `node scripts/verify-question-import.ts --path <file>` (requires Supabase env) before merging.

## 5. CSV & JSON Examples

```csv
id,question,choices,answer_index,difficulty,tags,rationale
module00-question-sensor-vs-package,"Which component collects live endpoint data?", "Sensors|Packages|Actions|Deployments",0,beginner,"platform-foundation|sensors","Sensors ask questions; packages make changes."
```

```json
{
  "id": "module00-card-sensor-definition",
  "front": "Define a Tanium sensor in one sentence.",
  "back": "A sensor is a reusable question template that collects live data from the endpoints you target.",
  "tags": ["module00", "platform-foundation"],
  "difficulty": "easy"
}
```

## 6. Submission Checklist

- [ ] Stem, options, and rationale populated.
- [ ] Difficulty + tags align with module outline.
- [ ] Plain language and accessibility requirements met.
- [ ] QA reviewed and pushed through Archon workflow (`todo → doing → review → done`).
- [ ] Evidence (CSV/JSON snippet + rationale) attached to the Archon task.

