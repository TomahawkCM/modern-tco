# Online Budget App — Master Plan

## Quick Reference

This document summarizes the full plan. Detailed research is in the `research/` directory.

| Document                                       | Contents                                                                                 |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `research/01-competitive-analysis.md`          | 10 competitor deep-dives, feature matrix, market gaps                                    |
| `research/02-ai-strategy.md`                   | Agentic AI architecture, 14 tools, personality modes, insights engine                    |
| `research/03-architecture-deep-dive.md`        | Sync engine, Supabase schema, encryption tiers, RLS, testing                             |
| `research/04-open-banking-and-bank-sync.md`    | SimpleFIN, Plaid, TrueLayer, goCardless comparison                                       |
| `research/05-monetization-and-pricing.md`      | Pricing tiers, feature matrix, revenue projections                                       |
| `research/06-ux-and-onboarding.md`             | 7-step onboarding, dashboard design, accessibility                                       |
| `research/07-phased-rollout.md`                | 4-phase rollout with deliverables and metrics                                            |
| `research/08-multi-device-sync-deep-dive.md`   | Sync scenarios, edge cases, conflict resolution UX, performance targets                  |
| `research/09-family-household-deep-dive.md`    | Roles, permissions, invitation flows, privacy, shared goals, activity feed               |
| `research/10-missing-features-gap-analysis.md` | 9 offline features missing from plan, 6 improvable features, 10 new market opportunities |
| `docs/FOLDER-STRUCTURE.md`                     | Complete folder structure: ~194 new files, ~31 extended, organized by phase              |

---

## The Vision

Build the **smartest, easiest-to-use, most private** online budget app in the world.

**No competitor offers all of these together:**

- E2E encryption + AI assistant + offline-first + 114 languages + multi-currency + family collaboration + WCAG 2.2 AA accessibility

**Pricing**: Free tier + $59/year Pro + $89/year Family (40-45% cheaper than Monarch/YNAB with more features)

---

## Architecture Summary

- **Dual-mode**: `APP_MODE = "standalone"` (offline) / `"online"` (cloud). Same codebase, feature-flagged.
- **Local-first**: IndexedDB (Dexie.js) remains primary store in both modes.
- **Cloud sync**: New `cloud-transport.ts` plugs into existing `SyncEngine` (vector clocks, conflict resolution).
- **Database**: 32 IndexedDB tables mirrored to Supabase PostgreSQL with RLS.
- **Encryption**: 3 tiers (Standard / E2E / Zero-Knowledge), extending existing AES-256-GCM.
- **Auth**: Supabase Auth (already integrated) with household membership and roles.

---

## AI Strategy Summary

- **Agentic financial co-pilot**: Not a sidebar widget — the main interaction mode.
- **21 budget tools** with OpenAI function calling (Structured Outputs, `strict: true`).
- **3 personality modes**: Professional, Encouraging, Direct.
- **8 proactive insight types**: Spending velocity, bill prediction, savings milestone, subscription waste, category optimization, safe-to-spend, weekly recap, budget risk.
- **Voice input**: Web Speech API for hands-free interaction.
- **Works with all encryption tiers**: Standard (server AI), E2E (proxied), Zero-Knowledge (client-only).

---

## Phased Rollout

| Phase | Focus            | Key Deliverables                                                                                           |
| ----- | ---------------- | ---------------------------------------------------------------------------------------------------------- |
| **1** | Cloud Foundation | Supabase schema, cloud sync, migration wizard, Stripe subscriptions                                        |
| **2** | AI + Family      | 21 AI tools, insights engine, weekly recap, households, shared budgets, expense splitting, refund tracking |
| **3** | Competitive Edge | Health score, forecasting, gamification, BNPL tracking, Year-in-Review, open banking, tax hints            |
| **4** | Scale            | Push notifications, wearables, native apps, marketplace, geo-spending, crypto tracking                     |

---

## Competitive Position

| vs. YNAB ($109/yr)                                  | vs. Monarch ($100/yr)                          | vs. Cleo ($72-180/yr)                                 | vs. Actual (Free)              |
| --------------------------------------------------- | ---------------------------------------------- | ----------------------------------------------------- | ------------------------------ |
| +AI, +encryption, +offline, +114 languages, -$50/yr | +encryption, +offline, +114 languages, -$41/yr | +real budgeting, +encryption, +family, +114 languages | +AI, +cloud sync, +polished UI |
