# TCO Study Curriculum — 20 Hours

Goal: Provide enough structured content to pass the real TCO exam with confidence. The plan blends videos, MDX lessons, guided labs, and large practice sets.

Time budget: ~20 hours total (flexible paced)

Breakdown by Domain (Exam Weights)
- Domain 1 — Asking Questions (22%): 4.5h
- Domain 2 — Refining Questions & Targeting (23%): 5h
- Domain 3 — Taking Action (15%): 3.5h
- Domain 4 — Navigation & Basic Module Functions (23%): 4.5h
- Domain 5 — Reporting & Data Export (17%): 2.5h

Structure per Domain
- Core Lessons (MDX): 45–90 min
- Hands-on Labs (guided): 60–90 min
- Videos (YouTube/MP4): 30–60 min
- Practice Blocks (questions): 30–60 min

Module Map and Targets
1) Asking Questions (4.5h)
   - MDX lesson deep-dive: 60–75m
   - Videos: Interact basics + result interpretation: 45–60m
   - Labs: Natural language patterns, sensor exploration: 60–75m
   - Practice: 30–45m (25–50 questions)

2) Refining Questions & Targeting (5h)
   - MDX lesson deep-dive: 75–90m
   - Videos: Groups and filters at scale: 45–60m
   - Labs: Group creation, complex filters, drill‑downs: 90m
   - Practice: 45–60m (30–60 questions)

3) Taking Action (3.5h)
   - MDX lesson deep-dive: 45–60m
   - Videos: packages/actions + approvals: 30–45m
   - Labs: safe deployment workflow + monitoring: 60m
   - Practice: 30–45m (20–40 questions)

4) Navigation & Basic Modules (4.5h)
   - MDX lesson deep-dive: 60–75m
   - Videos: console navigation + core modules: 45–60m
   - Labs: interface drills + module switching: 60–75m
   - Practice: 30–45m (25–50 questions)

5) Reporting & Data Export (2.5h)
   - MDX lesson deep-dive: 30–45m
   - Videos: exports + Connect basics: 30–45m
   - Labs: CSV/JSON export + scheduled jobs: 45–60m
   - Practice: 20–30m (15–30 questions)

Implementation Checklist
- Content
  - Expand `src/content/modules/*.mdx` to hit above runtimes.
  - Add 2–3 labs per domain (step lists with screenshots or code blocks).
  - Add “Quick Recall” sections per topic (bullets + one‑liners).
- Videos
  - Curate per‑module playlist in `src/content/videos/manifest.json`.
  - Use existing `VideoEmbed` (YouTube) and `TCOVideoPlayer` (MP4) with analytics.
  - Add transcripts (VTT) and link in MDX.
- Practice
  - Enable large sets (25–100) via slider on `/practice` (done).
  - Keep domain practice “all questions” default; allow per‑domain override later.
- Navigation
  - Surface Videos on domain pages (done) and link to `/learn/[slug]`.
- Analytics
  - Retain play/pause/milestones for videos; track practice block sizes.

Next Steps
1. Fill out MDX lessons to target durations above.
2. Populate `src/content/videos/manifest.json` with final playlist.
3. Author labs under `src/content/labs/<domain>/` and link from MDX.
4. Grow question bank coverage (aim 200–300+ verified items).

