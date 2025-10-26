
# Go‑Live Checklist – Modern TCO LMS

## Data & RPC
- [ ] `npm run content:stats` matches expected totals and distribution
- [ ] `npx tsx scripts/test-weighted-rpc.ts 105` prints TCO‑weighted counts

## UX & A11Y
- [ ] No top/side nav overlap on all pages (desktop/mobile)
- [ ] Keyboard navigation: focus rings visible; skip links present
- [ ] Lighthouse A11Y ≥ 95

## Performance
- [ ] Lighthouse Performance ≥ 90 (desktop + mobile profiles)
- [ ] No large unused bundles; lazy load non‑critical components

## Security
- [ ] Supabase keys rotated; env set in hosting; no secrets in repo
- [ ] Security headers present; CSP finalized (after whitelisting origins)
- [ ] RLS validated (reads ok, writes blocked without service role)

## Tests & CI
- [ ] Unit/integration tests green on CI
- [ ] E2E critical paths pass (practice, mock, review)
- [ ] Build successful on CI (Next.js)

## Release
- [ ] PR review done; CI green
- [ ] Deploy to production; verify smoke checks
- [ ] Create release notes and tag
