# Performance Budget & Playbook

## Targets
- **Lighthouse (desktop)** ≥ 80 for module pages.
- **Largest Contentful Paint (LCP)** < 3.0 seconds on cable-fast profile.
- **Total Blocking Time (TBT)** < 200 ms.
- **JavaScript bundle** per module page < 250 KB gzipped.

## Measurement Cadence
- Capture baseline Lighthouse report before changes (`reports/lighthouse/baseline/`).
- Re-run Lighthouse after major content or technical updates.
- Track metrics in PR summaries and Archon task evidence.

## Optimization Tactics
- **Code Splitting**: Use dynamic imports for heavyweight MDX sections and client components.
- **Image Optimization**: Serve via `next/image` with width/height, lazy loading, and AVIF/WEBP formats.
- **Content Chunking**: Break large MDX modules into logical partials and load on demand.
- **Hydration Discipline**: Keep hero section server-rendered; defer interactive widgets below the fold.
- **Data Loading**: Move bulky question/flashcard data to lazy fetches or API endpoints.
- **Caching**: Leverage static generation or ISR where possible; enable HTTP caching for media.

## Tooling
- Lighthouse CLI (`npm run lighthouse:module -- /modules/00-tanium-platform-foundation-v2`).
- Chrome DevTools Performance panel for deep traces.
- `next build --profile` to analyze webpack bundle sizes.

## Roles & Responsibilities
- **Performance Engineer**: Owns Lighthouse runs and remediation plans.
- **Content Authors**: Adhere to budget; coordinate when adding media-heavy content.
- **QA**: Verifies metrics during review and regression testing.

## Reporting Template
1. Baseline vs. post-change metrics table.
2. Summary of bottlenecks identified.
3. Actions taken (with links to commits or configs).
4. Outstanding risks and follow-up tasks.
