# Lighthouse Knowledge Base – Modern TCO LMS

This document is a practical, “what you need to know and do” guide for using Google Lighthouse to measure and improve the Modern TCO LMS. It covers how Lighthouse works, how to run it locally and in CI, how to interpret results, and safe remediation strategies tailored to our Next.js 15 stack.

## Overview

- Lighthouse audits web pages for Performance, Accessibility, Best Practices, SEO, and (optionally) PWA.
- It can run in Chrome DevTools, as a CLI (`lighthouse`), via Node API, or programmatically as we do in this repository.
- Scores are derived from lab measurements collected by a headless Chrome instance. Performance is a weighted aggregate of page-speed metrics (e.g., LCP, CLS, FCP, Speed Index, Total Blocking Time, etc.). Exact metric set/weights may evolve with Lighthouse versions.
- Results are reported as an HTML report (human-readable) and JSON (machine-parsable). We save both in `reports/lighthouse/<timestamp>`.

## Running Lighthouse (this repository)

Local dev (recommended)
- Install Playwright Chromium once:
  - `npm run lighthouse:setup`
- Start the dev server (Next.js will choose an available port if 3000 is busy):
  - `npm run dev`
- Run Lighthouse against your dev port (example: 3003) using Playwright’s Chromium:
  - `npm run lighthouse:3003:pw`
 - View a quick summary of the latest run (scores only):
   - `npm run lighthouse:summary`

Notes
- Our runner (`scripts/lighthouse.mjs`) passes Chrome flags suitable for local dev/containers:
  - `--headless=new --no-sandbox --disable-gpu --disable-dev-shm-usage --allow-insecure-localhost --ignore-certificate-errors --no-first-run --no-default-browser-check`
- Reports are saved under `reports/lighthouse/<timestamp>` as `desktop__*.report.html/json` and `mobile__*.report.html/json`.
 - If you hit Chrome’s security interstitial in headless mode, see the “Common local pitfalls and fixes” section below for reliable workarounds (127.0.0.1 base or running from DevTools).

Production‑like measurements
- For more accurate scores (bundle size, TTI), build and start a production server:
  - `npm run build && npm start`
  - Then run `node scripts/lighthouse.mjs http://localhost:3000 /welcome /practice /mock /review`
- Expect dev runs to score worse (larger bundles, no minification, hot reload overhead).

## How Lighthouse measures Performance (plain‑language)

- Lighthouse simulates a page load in headless Chrome and collects timing/interaction metrics under a controlled environment (mobile/desktop presets, throttling profiles).
- The Performance score is a weighted average of several metrics. Common ones include:
  - Largest Contentful Paint (LCP): time to render the largest visible element.
  - Total Blocking Time (TBT): total time the main thread is blocked by long tasks.
  - Cumulative Layout Shift (CLS): visual stability during load.
  - First Contentful Paint (FCP): time to first pixel.
  - Speed Index (SI): how quickly content is visually displayed.
  - Interaction to Next Paint (INP): responsiveness to user input (in recent Lighthouse versions).
- Each metric has pass/fail thresholds and contributes differently to the score.

## Key audits you’ll see frequently

- “Avoid enormous network payloads” (total‑byte‑weight)
- “Reduce unused JavaScript” (unused‑javascript)
- “Eliminate render‑blocking resources” (render‑blocking‑resources)
- “Reduce unused CSS” (unused‑css‑rules)
- “Minify JavaScript/CSS” (unminified‑javascript / unminified‑css)
- “Reduce JavaScript execution time” (bootup‑time)
- “Efficiently encode images”, “Defer offscreen images” (uses‑optimized‑images / offscreen‑images)

## Next.js 15 + React – safe remediation patterns

- Defer non‑critical JS
  - Avoid loading analytics and error trackers during critical path; initialize via `requestIdleCallback` (done for PostHog and Sentry in this repo).
- Code‑split heavy components (done)
  - Use `next/dynamic` for large UI (e.g., `QuestionCard`, `ExamTimer`) so practice/mock route JS shrinks on initial load.
- Limit global providers on routes that don’t need them (partially done)
  - Only initialize contexts needed for the page to avoid large hydration payloads.
- Optimize images
  - Prefer `next/image` and remotePatterns; ensure intrinsic sizes; lazy‑load offscreen images.
- CSS improvements
  - Ensure Tailwind is purging unused classes for production; keep global CSS lean.
- Avoid large inline JSON / bundling all content
  - Keep MDX rendered on module pages and avoid importing entire banks on welcome/dashboard.
- Remove dev‑only logs and heavy console output in production.

## Interpreting our reports

- Desktop vs Mobile: always compare both — mobile throttling reveals JS execution and layout issues.
- Look at “Opportunities” and “Diagnostics” sections for clear, prioritized fixes.
- Track “Total Blocking Time” and “Largest Contentful Paint” — these often drive the score.
- Use the JSON to extract metric deltas over time; we write both `.html` and `.json` for each page.

## Recommended workflow

1) Baseline
   - Run against `/welcome`, `/practice`, `/mock`, `/review` in production mode; archive reports.
2) Identify top 2–3 wins
   - Look for 100–500 KB+ JS savings, render‑blocking styles, or deferrable scripts.
3) Implement safely
   - Code‑split heavy UI; defer non‑critical JS; move expensive work out of initial render; reduce above‑the‑fold DOM.
4) Re‑measure
   - Confirm the score moves; ensure no regressions in A11Y/Best Practices/SEO.
5) Track over time
   - Save JSON metrics for trend graphs; alert if metrics regress.

## Budgets & CI

- Performance budgets help enforce limits (total JS, image payloads, LCP, etc.).
- You can pass a config file to Lighthouse that includes budgets; when budgets are exceeded, the audit fails.
- CI suggestions:
  - Run Lighthouse against a preview URL post‑build (e.g., Vercel preview).
  - Parse JSON to extract performance score and key metrics; fail CI or warn on regressions.
  - Keep thresholds modest to avoid flakiness (±3–5 points tolerance).

## Common local pitfalls and fixes

- “Unable to connect to Chrome”
  - Install Playwright Chromium: `npm run lighthouse:setup`
  - Use our `:pw` scripts so Lighthouse launches that binary.
- “Chrome prevented page load with an interstitial” (headless)
  - Some environments still trigger interstitials even with our bypass flags.
  - Option A — Use 127.0.0.1 instead of localhost (often avoids the interstitial):
    - Install Playwright Chromium if you haven’t: `npm run lighthouse:setup`
    - Run with explicit Playwright Chromium and 127.0.0.1 base, e.g. for dev on 3003:
      - `CHROME_PATH=$(node -e "console.log(require('playwright').chromium.executablePath())") node scripts/lighthouse.mjs http://127.0.0.1:3003 /welcome /practice /mock /review`
    - Summarize latest run:
      - `npm run lighthouse:summary`
  - Option B — Run headed via Chrome DevTools (interactive):
    - Open the target page in Chrome (e.g., `http://localhost:3003/welcome`)
    - Open DevTools → Lighthouse → choose Desktop/Mobile → Analyze
    - Save the report if you want to compare later
  - For production-like accuracy, build and run the server (`npm run build && npm start`), then audit `http://127.0.0.1:3000` with the same command pattern as Option A.
- Dev vs Prod
  - Dev server scores are pessimistic; use `npm run build && npm start` for realistic numbers.

## Quick reference (this repo)

- Scripts
  - `npm run lighthouse:setup` — install Playwright Chromium
  - `npm run lighthouse` — audits on port 3000
  - `npm run lighthouse:3001` — audits on port 3001
  - `npm run lighthouse:3003` — audits on port 3003
  - `npm run lighthouse:3003:pw` — audits on port 3003 using Playwright Chromium
  - `npm run lighthouse:summary` — print scores from the latest run
- Runner
  - `scripts/lighthouse.mjs` — configurable targets; outputs HTML + JSON per page
- Reports
  - `reports/lighthouse/<timestamp>`

## FAQ

- Why do scores fluctuate?
  - Lab conditions, resource timing variability, and dev server characteristics cause variance. Use production builds and multiple runs for stability.
- Should I loosen CSP to improve scores?
  - No. Keep CSP tight; performance fixes should come from code splitting, deferring scripts, and payload reduction — not from relaxing security.
- Which pages matter most?
  - `/welcome` (first impression), `/practice` (core learning flow), `/mock` (heavy UI), `/review` (repeat flow). Prioritize those.

---

For broader optimization, see `docs/OPS/PRODUCTION_READINESS_PLAYBOOK.md` (Phase 5) for performance strategy and `docs/NEXT_SESSION_TODO.md` for current perf tasks.
