
# Next Session TODOs – Modern TCO LMS

UI Enhancements (shadcn) — Completed This Session
- Analytics: Domains tab uses resizable split (table + radar) with shadcn patterns
- Modules: Client table view (facets, sticky header) + Server table
- Command Palette (Ctrl/Cmd+K) and User Menu dropdown
- Per-user persisted state for tables (sorting/filters/visibility/facets) and Review filters/tab

UI Enhancements (shadcn) — Next
- Persist Analytics tab selection and resizable panel sizes
- Add Review Center analytics table (domain/difficulty counts) with filters and sticky header
- Extend table pattern to per-module drilldowns (sections/lessons list)
- Scope Modules view toggle (Grid/Table) to user (persist key `:u:<userId>`)
- Optional: Clean up unused shadcn UI components in `src/components/ui` (accordion, avatar, carousel, chart, etc.)

Priority (P0)
- Production Lighthouse pass (build/start) and 2–3 additional quick wins if needed (target ≥ 90 Perf).
- E2E coverage (no need to run locally now):
  - Resume deep‑link from Modules grid → module section
  - Review Center list → module section navigation
  - Mixed Review CTA starts multi‑domain practice

Priority (P1)
- Tighten security headers; finalize CSP (YouTube, Supabase, optional Sentry/PostHog), document deltas.
- Add server‑side error tracking for API routes (mask PII) if needed.
- Upgrades to practice targeting: weight multi‑domain selection by needs‑review counts.

Priority (P2)
- Persist explicit lastViewed section to DB (not inferred) for accuracy.
- Add “Reset all progress” confirmation and per‑module analytics (time spent, sections completed).
- Seeding enhancements: accept flags `--replace-domain`, `--dry-run` for safe runs.

Notes
- Review Center: `/study/review` now available; entry added to global nav and Modules page.
- Seeding command: `npm run content:seed:modules` (requires Supabase URL + service key).
- All production docs live under `docs/OPS/`.
