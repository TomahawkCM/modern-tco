# Microsoft Learn–Inspired Playbook for Tanium TCO Modules

Purpose

- Translate proven Microsoft Learn patterns into concrete improvements for Tanium TCO study modules.
- Standardize module structure, strengthen knowledge checks, and increase hands-on practice and completion.

References

- Microsoft Learn training hub: https://learn.microsoft.com/training/
- Microsoft Writing Style Guide (tone, clarity, inclusivity): https://learn.microsoft.com/style-guide/

---

## 1) What Microsoft Learn Does Well

- Learning Path → Module → Unit hierarchy
  - Paths sequence related modules; modules contain small units (5–15 minutes).
  - Each unit declares clear outcomes and ends with a knowledge check.

- Outcome-first, active learning
  - Every unit starts with “What you’ll learn” and finishes with “Check your knowledge.”
  - Frequent practice with step-by-step labs and sandboxes; learners apply immediately, not later.

- Microlearning and scannability
  - Units are short, focused, and written in direct second-person language.
  - Content is chunked with headings, bullets, visuals, and copy‑pasteable commands.

- Consistent structure and navigation
  - Predictable unit flow: Intro → Learn → Practice → Knowledge Check → Summary → Next steps.
  - Progress indicators and achievement cues (badges/XP) reinforce momentum.

- Accessibility and inclusivity by default
  - Plain language, alt text, descriptive link text, keyboard-friendly interactions.
  - Style and terminology are consistent and localization‑ready.

---

## 2) Target State for TCO Modules

- Standard module template
  - Front‑matter with `title`, `estimatedTime`, `difficulty`, `prerequisites`, `objectives` (1–3), `tags`, and `domainSlug`.
  - 30–90 minutes per module; 4–8 units per module; 5–12 minutes per unit.

- Unit (micro‑section) template
  - Learn → Practice → Check (Use `MicroSection`, `PracticeButton`, `MicroQuizMDX`).
  - Each unit has: name, 1–2 outcomes, 3–5 key takeaways, 1–3 quick MCQs.

- Embedded practice
  - At least one hands‑on action per unit that maps to `labs/` or the simulator in `sim/`.
  - Clear success criteria and expected output/screens.

- Progressive navigation and progress cues
  - Use `MicroSectionProgressGrid` to show unit completion and lock future units when prerequisites aren’t met.

- Assessment layering
  - Inline unit checks (formative) + end‑module check (summative, 5–10 items) + periodic mixed‑topic reviews.

- Accessibility and style
  - Apply Microsoft Writing Style Guide conventions: active voice, direct address, inclusive terms, scannable lists.

---

## 3) Concrete Changes to Apply Now

Structure and pacing

- Convert long sections into 5–12 minute `MicroSection`s with explicit outcomes and key takeaways.
- Cap walls of text; prefer short paragraphs and ordered steps.

Practice-first integration

- Add one `PracticeButton` per micro‑section. Link to an exact lab step in `src/content/labs/...` or a simulator action in `sim/`.
- For simulator-backed units, provide input/output examples and a screenshot reference where applicable.

Knowledge checks that teach

- Add 2–3 `MicroQuizMDX` questions per micro‑section.
- Write explanations that correct misconceptions and reinforce the mental model (not just the “right answer”).

Progress cues and gating

- Adopt `MicroSectionProgressGrid` on study overview pages; mark sections `locked` until prior units are complete.
- Show overall minutes completed vs. total to help with time planning.

Persona and prerequisites

- Tag modules by role (Operator, Administrator, Security Analyst) and list prerequisite concepts or modules.
- Provide “If you’re this persona, start here” guidance in `00-tanium-platform-foundation.mdx`.

Accessibility and editorial

- Add alt text for all images; ensure link text is descriptive; avoid “click here.”
- Use consistent terminology and capitalization across modules (e.g., sensor, package, action, module).

---

## 4) Mapping to This Repository

- Micro‑units
  - Author with `src/components/mdx/MicroSection.tsx` and model after `src/content/modules/MICROLEARNING_EXAMPLE.mdx`.

- Knowledge checks
  - Use `src/components/mdx/MicroQuizMDX.tsx` with clear `question`, `options`, `correctAnswer`, `explanation`, `concept`.

- Hands‑on practice
  - Place lab steps under `src/content/labs/<module>/...` and link with `PracticeButton`.
  - For simulated flows, leverage `sim/tanium_simulator_v2.py` to create predictable, fast feedback loops.

- Progress UI
  - Use `src/components/progress/MicroSectionProgressGrid.tsx` in study dashboards; set `locked` logic to enforce sequence.

- Navigation and references
  - Keep module IDs, anchors, and section IDs stable so progress links and deep links remain valid.

---

## 5) Author Checklist (Copy/Paste)

- Outcomes
  - [ ] 1–3 crisp learning objectives per module and per unit.
  - [ ] Estimated time set for module and each unit.

- Content
  - [ ] Break content into 5–12 minute `MicroSection`s with 3–5 key takeaways.
  - [ ] Replace long paragraphs with lists and numbered steps.
  - [ ] Include at least one worked example per concept.

- Practice
  - [ ] One `PracticeButton` per micro‑section pointing to a lab/simulator step.
  - [ ] Success criteria and expected output/screens are specified.

- Assessment
  - [ ] 2–3 `MicroQuizMDX` items per micro‑section with teaching explanations.
  - [ ] 5–10 question end‑module check aligned to objectives.

- Accessibility & Style
  - [ ] Alt text for images; descriptive link text; keyboard‑friendly sequences.
  - [ ] Active voice, second person; inclusive terminology (see Microsoft Style Guide).

- QA
  - [ ] All anchors/IDs resolve; progress grid reflects counts; no broken links.
  - [ ] Estimated reading time ≈ actual; labs complete in the stated time.

---

## 6) Measurement and Iteration

- Metrics to instrument
  - Module and unit completion rate; average time per unit; quiz accuracy first‑attempt vs. second‑attempt.
  - Time‑to‑first‑practice; practice completion rate; drop‑off points by unit.

- Lightweight instrumentation ideas
  - Fire client events on: micro‑section start/complete, quiz submit/result, practice start/complete.
  - Aggregate anonymously to existing analytics or a simple events table (e.g., via `supabase/`).

- Review cadence
  - Weekly: scan metrics and fix top drop‑off items.
  - Monthly: rebalance unit lengths; add or sharpen quizzes; refresh screenshots.

---

## 7) 30/60/90 Plan

- 30 days
  - Convert Modules 1–2 to micro‑sections with quizzes and practice.
  - Add progress grid to the study overview and wire basic gating.

- 60 days
  - Convert Modules 3–5; add end‑module checks; align labs in `labs/`.
  - Instrument quiz/practice events and build a simple completion dashboard.

- 90 days
  - Tune pacing with metrics; expand persona paths and add mixed‑topic reviews.
  - Accessibility pass across all modules (links, alt text, color contrast).

---

## 8) Example: Micro‑Section Pattern (MDX)

```mdx
<MicroSection
  id="unit-id"
  moduleId="module-2"
  title="Do one thing well"
  estimatedMinutes={8}
  sectionNumber={2}
  totalSections={6}
  keyTakeaways={[
    "State the one outcome up front",
    "Show one concrete example",
    "End with practice and a check"
  ]}
  quickCheck={
    <>
      <MicroQuizMDX
        question="What’s the goal of this unit?"
        options={["Learn concept A","Do example B","Memorize terms","All of the above"]}
        correctAnswer="Do example B"
        explanation="Tie the concept to a concrete example—then reinforce with a knowledge check."
        concept="Outcome Focus"
      />
    </>
  }
>

...unit content here...

<PracticeButton moduleId="module-2" objectiveId="obj-2-1" />

</MicroSection>
```

---

Maintainer Notes

- Keep this playbook close to the modules (`src/content/modules/`). Revisit after each cohort to capture new insights.
