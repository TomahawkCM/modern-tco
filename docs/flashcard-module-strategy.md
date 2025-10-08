# Flashcard Module Strategy

## 1. Market Benchmark: What "Best-in-Class" Looks Like

| Platform | Key Strengths | Notable Learning Science Hooks |
| --- | --- | --- |
| **Anki** | Open ecosystem, custom SM-2*/FSRS scheduling, community marketplaces, powerful add-ons | Fine-grained spaced repetition controls, leech suspension, incremental card creation |
| **SuperMemo (SM18)** | Originator of SM-2 with incremental reading, detailed forgetting curve analytics | Algorithm tunes retention % targets per topic, promotes active recall + metacognitive reflection |
| **Quizlet** | Massive shared decks, multimodal study modes (flashcards, tests, games) | Retrieval practice through varied formats, lightweight gamification, AI explanations |
| **Brainscape** | Adaptive confidence-based repetition, polished UX | Confidence ratings map to spaced repetition intervals, analytics on mastery |
| **RemNote** | Knowledge graph, backlinks, PDF/lecture capture, incremental elaboration | Integrates elaborative interrogation, dual coding (text + media), active recall workflows |
| **Mochi / Memrise** | AI-assisted generation, streak mechanics, native mobile UX | Contextual hints, audio/visual embeds, interleaving through smart mixes |
| **Art of Memory / Memory League** | Competitive training drills, mnemonic system coaching | Spaced retrieval, deliberate practice, community challenges reinforcing motivation |

**Patterns to emulate**
- Rich authoring pipeline: bulk import, AI-assisted drafting, duplicate detection, readability checks.
- Adaptive scheduling: modern FSRS-style algorithms, deck-level retention targets, auto-adjusted ease factors.
- Contextual scaffolding: multi-step hints, linked resources, mnemonic suggestions, incremental elaboration.
- Motivation loops: streaks, time-on-task goals, domain mastery heatmaps, community sharing.
- Analytics & insights: forgetting curves, retention by topic/difficulty, recommendation engine for next study focus.

## 2. Evidence-Based Learning Techniques to Anchor The Roadmap

1. **Spaced Repetition** – Schedule reviews along expanding intervals tuned to individual forgetting rates (SM-2 → FSRS).
2. **Active Retrieval Practice** – Force recall before reveal; offer self-assessment that feeds scheduling.
3. **Interleaving & Variation** – Mix domains/problem types to improve discrimination and transfer.
4. **Elaborative Encoding** – Prompt “why/how” reasoning, examples, or analogies on the back side.
5. **Dual Coding / Multimodal Inputs** – Pair text with visuals, diagrams, or audio for richer encoding.
6. **Concrete Examples & Scenarios** – Frame cards in realistic Tanium workflows, not only definitions.
7. **Metacognitive Reflection** – Encourage confidence ratings, error logging, and post-session review summaries.
8. **Successive Relearning** – Revisit tough cards across sessions with increased spacing + fresh context.
9. **Gamified Motivation** – Streaks, milestones, progress heatmaps; avoid anxiety by framing as “consistency goals.”
10. **Microlearning Nuggets** – Deliver daily bites (e.g., 10-card smart sets) with reminders and cross-channel nudges.

## 3. Current Module Gaps (Baseline)

- **Content duplication** – 20 repeated fronts (e.g., “What is the 'from' clause…?” x16) degrade recall efficiency.
- **Metadata sparsity** – 261/331 cards missing `difficulty`; only 19 provide hints; explanations skew to MCQ-derived subset.
- **Homogeneous card types** – 330/331 marked `concept`; minimal procedural or scenario coverage.
- **Tagging inconsistencies** – Domain tags diverge between generator and seeder, blocking reliable analytics.
- **Hint UX** – Alerts open as blocking modals; no progressive clues or retention of hint usage.
- **Language onboarding** – SM-2 jargon surfaces immediately; rating buttons lack tooltips/context.

## 4. Strategic Objectives

1. **Content Quality & Coverage** – Unique, exam-aligned cards spanning foundational, procedural, troubleshooting, and strategy layers.
2. **Learning Experience Excellence** – Gentle onboarding, clear guidance, frictionless review loop, delight additives.
3. **Adaptive Intelligence** – Smarter scheduling, personalized recommendations, mastery tracking.
4. **Ecosystem & Scalability** – Author workflows, QA guardrails, analytics dashboards, extensibility for future certifications.

## 5. Initiative Roadmap

### Phase 0 – Foundation & Hygiene (Weeks 1-2)
- Run automated duplicate + similarity detection with rewrite queue.
- Normalize metadata (`difficulty`, `source`, `domain`, hints) and ensure generator enforces schema.
- Align taxonomy between generator, seeder, and UI filters; add automated tests for taxonomy drift.
- Author style guide for tone, reading level (≤ Grade 8 target), and card templates by persona.

### Phase 1 – Learner Experience Lift (Weeks 3-5)
- Onboarding microcopy + interactive tutorial explaining SM-2, ratings, and daily goals.
- Replace JS alerts with inline progressive hints (keyword → question → explanation) and track usage.
- Introduce diversified card templates (definition, scenario, decision tree, “why it matters”), with review mode mixing.
- Surface readability + clarity checks in authoring pipeline; enforce acceptance criteria before publish.

### Phase 2 – Adaptive & Motivational Layer (Weeks 6-9)
- Upgrade scheduler to FSRS-style adaptive intervals; expose mastery targets per domain/difficulty.
- Add confidence slider / self-assessment to feed scheduling, with metacognitive prompts post-session.
- Implement mastery heatmap dashboard + streak goals with recovery buffers (“soft streaks”).
- Build deck diagnostics showing hardest cards, hint frequency, average recall time; feed author backlog.

### Phase 3 – Authoring & Community Scale (Weeks 10-14)
- AI-assisted card drafting from modules, transcripts, and practice question misses (human-in-the-loop review).
- Collaborative deck workflows: review queue, change history, tagging suggestions, duplicate warnings.
- Marketplace-style sharing for curated decks (per release or customer vertical) with versioning.
- Launch spaced learning campaigns: scheduled push (email/in-app) for upcoming exams, focusing on weak domains.

## 6. Implementation Pillars & Key Tasks

- **Content Ops**
  - Deduplication pipeline (text similarity, n-gram filters) with manual approval queue.
  - Metadata enrichment service (difficulty heuristics, readability scoring, hint generation prompts).
  - Scenario library capturing Tanium workflows, incidents, reporting cases for higher-order cards.

- **Product & UX**
  - Progressive disclosure UI for learning science concepts (SM-2 explainer, interval preview).
  - Session planner (10/20/All) with recommended mix (due + new + challenge cards) and interleaving rules.
  - Hint evolution: convertible to Mnemonic Builder capturing user-generated cues.

- **Adaptive Engine**
  - FSRS implementation with retention target input (e.g., 90%) + mastery forecasts.
  - Data instrumentation for review outcomes, hint usage, card difficulty adjustments.
  - Recommendation engine: suggests creating cards after failed quiz, surfaces “next best” domains.

- **Analytics & QA**
  - Dashboards for retention, accuracy, average recall time, hint reliance, per-domain mastery.
  - Quality scorecards for decks (duplicate %, readability, learning objective coverage).
  - A/B testing framework to compare hint strategies, rating labels, or motivational nudges.

## 7. Success Metrics & Feedback Loops

- **Learning Outcomes**: Target ≥90% 7-day retention, +15% practice exam uplift for flashcard users.
- **Engagement**: Daily active review streak ≥4 days median; session completion rate ≥80%.
- **Content Quality**: Duplicate incidence <1%; 100% of cards tagged with difficulty + domain + hint/explanation.
- **Author Efficiency**: <10 min avg time from draft to publish with automated QA signals.
- **Feedback Signals**: NPS for flashcard experience >50; qualitative learner interviews quarterly.

## 8. Dependencies & Next Steps

1. Finalize learning science guidelines + style guide (content ops + instructional design).
2. Prioritize engineering tickets for dedupe + metadata enforcement (Phase 0 blockers).
3. Conduct learner interviews focusing on onboarding pain points and motivation triggers.
4. Align with analytics team on instrumentation events + dashboard requirements.
5. Draft detailed project timeline with owners, sprints, and acceptance criteria per initiative.

---

*SM-2 is the classic SuperMemo algorithm; FSRS (Free Spaced Repetition Scheduler) is a modern successor emphasizing speed, retention targets, and personalization.
