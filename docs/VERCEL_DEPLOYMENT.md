# Vercel Deployment Guide (modern‑tco)

This document explains how the Modern Tanium TCO app is deployed to Vercel and how to operate it in production.

## Overview

- Project: Modern TCO (Next.js 15 + TypeScript)
- Production URL: https://modern-tco.vercel.app
- Root Directory in Vercel: `Tanium TCO/modern-tco`
- No `vercel.json` is used. Build settings come from Vercel Project Settings and `next.config.js`.

## Build & Runtime

- Build command: `next build` (provided by Vercel)
- Output: Next.js serverless/edge functions + static assets
- Node version: 20.x (set in Vercel Project → Build & Development Settings)
- Next config:
  - No basePath. App serves at `/`.
  - Redirects old paths: `/tanium/*` → `/*` (see `next.config.js` → `redirects()`)

## Required Environment Variables (Production)

Set these in Vercel Project → Settings → Environment Variables.

- `NEXT_PUBLIC_SUPABASE_URL` (string)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (string)
- Optional server-only: `SUPABASE_SERVICE_ROLE_KEY` (string) — only if admin operations are required in server routes
- Optional safeguard: `ENABLE_SIMULATOR` ("true" to enable) — simulator endpoints are disabled by default in production

Notes:
- Do not commit sensitive keys in the repo; prefer Vercel env.
- Local dev uses `.env.local`. Production uses Vercel env and `.env.production` defaults are not read by Vercel.

## Linking & Deploying (CLI)

From `Tanium TCO/modern-tco`:

```bash
vercel link                # Link this folder to the Vercel project
vercel --prod              # Deploy production

# Or with the latest CLI
npx vercel@latest --prod
```

Verify link: `.vercel/project.json` should point to your `modern-tco` project.

## Ignored Build Step (optional)

Skip builds when commits don’t touch `modern-tco`:

```
git diff --quiet ${VERCEL_GIT_COMMIT_SHA}~1 ${VERCEL_GIT_COMMIT_SHA} -- 'Tanium TCO/modern-tco/**' \
  && echo 'No modern-tco changes' && exit 0 || exit 1
```

Configure under Project → Settings → Git → Ignored Build Step.

## Routes & Redirects

- App serves at root: `/`
- Legacy links automatically redirect:
  - `/tanium` → `/`
  - `/tanium/:path*` → `/:path*`

## Simulator Endpoints (Production)

- `/api/sim-eval` - ✅ **Enabled** in production (uses TypeScript engine, no Python dependency)
- `/api/sim-meta` - ✅ **Enabled** in production (returns sensor catalog and examples)
- `/api/sim-saved` - ✅ **Enabled** in production (returns saved queries list)
- `/api/sim-save` - ❌ **Disabled** in production (requires Python subprocess, not supported on Vercel)
- `/api/sim-run` - ❌ **Disabled** in production (requires Python subprocess, not supported on Vercel)

**What Works**: Query evaluation, examples, sensor catalog, export (CSV/JSON)
**What Doesn't**: Saving queries to disk (requires Python subprocess)

## Troubleshooting

- “Build settings ignored due to vercel.json”: remove any `vercel.json` in this folder; project uses `next.config.js`.
- 404s on `/tanium/*`: expected; they redirect to `/`.
- 500s involving file system imports: content loading was updated to be bundler‑safe; if you add new FS reads, guard them from running in serverless.
- Supabase auth env missing: ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` exist in Vercel.

## Change Log (Deployment‑related)

- Removed `vercel.json` in favor of Next config + Vercel settings
- Cleared basePath; added `/tanium/*` → `/*` redirects in `next.config.js`
- Disabled simulator APIs by default in production
- Made study content loading bundle‑safe for serverless

