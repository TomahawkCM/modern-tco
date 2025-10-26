
# Documentation Index – Modern TCO LMS

Use this index to find the right document quickly during development, staging, and production operations.

## Operations & Production
- Production Readiness Playbook: `docs/OPS/PRODUCTION_READINESS_PLAYBOOK.md`
- Production Design (architecture & ops): `docs/OPS/PRODUCTION_DESIGN.md`
- Go‑Live Checklist: `docs/OPS/GO_LIVE_CHECKLIST.md`
- Runbook (incidents, rollbacks, migrations): `docs/OPS/RUNBOOK.md`
- Secrets & Configuration: `docs/OPS/SECRETS.md`
- CSP Template & Guidance: `docs/OPS/CSP_TEMPLATE.md`

## Development & Testing
- Next Session TODOs: `docs/NEXT_SESSION_TODO.md`
- Test Strategy & Commands: `docs/OPS/TEST_STRATEGY.md`
- Query Builder Enhancements: `docs/QUERY_BUILDER_ENHANCEMENTS.md` ← **NEW**
- Supabase Guides: `docs/supabase/`
- PostgreSQL Guides: `docs/postgresql/`

## Content & Knowledge Base
- Learning Modules (MDX): `src/content/modules/`
- Question Bank (JSON, import/export): `src/content/questions/`
- Knowledge Base (research): `docs/knowledge-base/`
  - Lighthouse Knowledge Base: `docs/knowledge-base/LIGHTHOUSE_KNOWLEDGE_BASE.md` ← **NEW**

## App Routes (handy)
- Study Center: `/modules`
- Review Center: `/study/review` (lists all needs‑review sections across modules)
- Practice launcher: `/practice`
  - Query params:
    - `domain=` Single domain (e.g., `Asking%20Questions`)
    - `domains=` Multi‑domain CSV (e.g., `Asking%20Questions,Refining%20Questions%20%26%20Targeting`)
    - `count=` Number of questions (25/50/75/100)
    - `quick=1` Auto‑start
    - `reveal=1` Reveal correct answer/explanation on selection (practice mode)
  - Examples:
    - `/practice?domain=Asking%20Questions&count=25&quick=1&reveal=1`
    - `/practice?domains=Asking%20Questions,Refining%20Questions%20%26%20Targeting&count=25&quick=1&reveal=1`
- Mock exam: `/mock?variant=A` (105Q/105min; variants A/B/C)

## Useful Commands (quick copy/paste)
```
set -a; source .env.local 2>/dev/null || true; set +a

# Seed & Stats
npm run content:seed
npm run content:stats

# Seed study modules + sections from MDX (requires NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY)
npm run content:seed:modules

# Weighted RPC test
npx tsx scripts/test-weighted-rpc.ts 105

# Apply SQL via API (optional; PAT)
npm run db:apply-sql:api -- --file supabase/sql/get_weighted_random_questions.sql

# Tests
npm run lint
npm run typecheck
npm run test
# E2E (use your Playwright command or scripts)
```

## Lighthouse (local dev)
```
# Install Chromium for Playwright once
npm run lighthouse:setup

# Run against your dev server on port 3003
npm run lighthouse:3003:pw

# If Chrome shows a security interstitial in headless, use 127.0.0.1
CHROME_PATH=$(node -e "console.log(require('playwright').chromium.executablePath())") \
  node scripts/lighthouse.mjs http://127.0.0.1:3003 /welcome /practice /mock /review

# Summarize the latest run (scores only)
npm run lighthouse:summary
```

See detailed guidance and troubleshooting in `docs/knowledge-base/LIGHTHOUSE_KNOWLEDGE_BASE.md`.
