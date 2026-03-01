# Phased Rollout Plan

## Overview

Four phases, each with clear deliverables and validation metrics. Each phase builds on the previous one. The offline version remains completely intact throughout.

---

## Phase 1: Cloud Foundation (MVP)

**Goal**: Get existing offline users to the cloud with zero friction. Establish the subscription business.

### Deliverables

| #    | Task                                                | Depends On | Key Files                                    |
| ---- | --------------------------------------------------- | ---------- | -------------------------------------------- |
| 1.1  | Supabase PostgreSQL schema for all 32 budget tables | —          | New migration files                          |
| 1.2  | RLS policies for household-scoped isolation         | 1.1        | Supabase migrations                          |
| 1.3  | Cloud transport module                              | 1.1        | `src/lib/sync/cloud-transport.ts` (new)      |
| 1.4  | Dexie.js change hook middleware                     | 1.3        | `src/lib/budget-db.ts`                       |
| 1.5  | Migration wizard (offline → online)                 | 1.3        | `src/components/budget/migration/` (new)     |
| 1.6  | Multi-device sync                                   | 1.3        | `src/contexts/LANSyncContext.tsx` (extend)   |
| 1.7  | Feature flag activation (`APP_MODE = "online"`)     | —          | `src/config/features.ts`                     |
| 1.8  | Auth flow polish (already built)                    | —          | `src/app/budget-app/auth/`                   |
| 1.9  | Stripe subscription: Free + Pro tiers               | —          | `src/app/api/v1/stripe/` (extend)            |
| 1.10 | Automatic cloud backup (nightly)                    | 1.1        | Supabase Edge Function                       |
| 1.11 | Sync status indicator in UI                         | 1.6        | `src/components/budget/`                     |
| 1.12 | Billing management page                             | 1.9        | `src/app/budget-app/settings/billing/` (new) |

### Validation Metrics

| Metric                 | Target      | How to Measure                                 |
| ---------------------- | ----------- | ---------------------------------------------- |
| Migration success rate | > 95%       | Successful uploads / total attempts            |
| Sync latency           | < 2 seconds | Time from change to Realtime broadcast receipt |
| Data integrity         | Zero loss   | Checksum comparison post-migration             |
| Auth completion rate   | > 90%       | Signup starts / signup completions             |
| First sync success     | > 98%       | First full sync completions                    |

### Infrastructure Required

- Supabase project (Pro plan: $25/month)
- Stripe account with subscription products configured
- Vercel deployment with environment variables
- Supabase local for integration testing (Docker)

---

## Phase 2: AI + Family

**Goal**: Differentiate with the AI assistant and household collaboration. This is the phase that makes users choose us over Monarch.

### Deliverables

| #    | Task                                                    | Depends On | Key Files                                      |
| ---- | ------------------------------------------------------- | ---------- | ---------------------------------------------- |
| 2.1  | Enhanced AI chatbot with 14 budget tools                | Phase 1    | `src/app/api/chat/route.ts`                    |
| 2.2  | FinancialContext snapshot assembly                      | 2.1        | `src/lib/ai/financial-context.ts` (new)        |
| 2.3  | Tool result rendering (cards, tables, charts)           | 2.1        | `src/components/budget/chatbot/`               |
| 2.4  | Natural language transaction entry                      | 2.1        | Extends `create_transaction` tool              |
| 2.5  | Personality modes (Professional / Encouraging / Direct) | 2.1        | System prompt variants                         |
| 2.6  | Smart Insights Engine (8 insight types)                 | Phase 1    | `src/lib/ai/insights-engine.ts` (new)          |
| 2.7  | Weekly Financial Recap                                  | 2.6        | `src/lib/ai/weekly-recap.ts` (new)             |
| 2.8  | Sparkle insights on dashboard                           | 2.6        | Dashboard component updates                    |
| 2.9  | Household creation + member invitation                  | Phase 1    | `src/app/budget-app/settings/household/` (new) |
| 2.10 | Shared budgets with role-based access                   | 2.9        | RLS policy updates                             |
| 2.11 | Activity feed ("Sarah added $45 at Target")             | 2.9        | `src/components/budget/activity-feed/` (new)   |
| 2.12 | Individual transaction privacy toggle                   | 2.9        | Transaction model extension                    |
| 2.13 | E2E encryption option (Tier 2)                          | Phase 1    | `src/lib/encryption.ts` (extend)               |
| 2.14 | Family pricing tier + Stripe product                    | 2.9        | Stripe configuration                           |
| 2.15 | Voice input via Web Speech API                          | 2.4        | `src/hooks/useSpeechRecognition.ts` (new)      |

### Validation Metrics

| Metric                      | Target                            | How to Measure                           |
| --------------------------- | --------------------------------- | ---------------------------------------- |
| AI chatbot usage            | > 3 messages/week per active user | Message count per user                   |
| AI tool call accuracy       | > 90%                             | Correct tool selection / total calls     |
| Household invite acceptance | > 60%                             | Accepted / sent invitations              |
| AI categorization accuracy  | > 85%                             | Correct categories / total auto-assigned |
| Weekly recap open rate      | > 40%                             | Opened recaps / sent recaps              |
| E2E encryption adoption     | > 15% of Pro users                | Users with encryption enabled            |

---

## Phase 3: Competitive Edge

**Goal**: Features that no competitor has. This is the phase that earns us press coverage and word-of-mouth.

### Deliverables

| #    | Task                                           | Depends On   | Key Files                                               |
| ---- | ---------------------------------------------- | ------------ | ------------------------------------------------------- |
| 3.1  | Financial Health Score (0-100)                 | Phase 2      | `src/lib/analytics/health-score.ts` (extend)            |
| 3.2  | Health Score recommendations                   | 3.1          | AI-generated actionable advice                          |
| 3.3  | Cash flow forecasting (30/60/90 day)           | Phase 2      | `src/lib/ai/cashflow-forecast.ts` (new)                 |
| 3.4  | Subscription optimization engine               | Phase 2      | `src/lib/ai/subscription-optimizer.ts` (new)            |
| 3.5  | Bill prediction system                         | Phase 2      | `src/lib/ai/bill-predictor.ts` (new)                    |
| 3.6  | Enhanced gamification (XP, levels, challenges) | Phase 1      | `src/components/budget/gamification/` (extend)          |
| 3.7  | Household leaderboards                         | 3.6, Phase 2 | `src/components/budget/gamification/leaderboard/` (new) |
| 3.8  | Financial challenges ("No-spend weekend")      | 3.6          | `src/lib/gamification/challenges.ts` (new)              |
| 3.9  | Smart behavioral nudges                        | Phase 2      | Push notifications + in-app                             |
| 3.10 | Zero-Knowledge encryption (Tier 3)             | 2.13         | `src/lib/encryption.ts` (extend)                        |
| 3.11 | Open banking adapter: goCardless (EU/UK)       | Phase 1      | `src/lib/banking/gocardless/` (new)                     |
| 3.12 | Open banking adapter: Plaid (US)               | Phase 1      | `src/lib/banking/plaid/` (new)                          |
| 3.13 | API access for Pro users                       | Phase 1      | `src/app/api/v2/` (new)                                 |
| 3.14 | Bill negotiation suggestions                   | Phase 2      | AI-powered comparison                                   |

### Validation Metrics

| Metric                   | Target                | How to Measure                           |
| ------------------------ | --------------------- | ---------------------------------------- |
| 90-day retention         | > 45%                 | Active at day 90 / signed up             |
| Health Score engagement  | > 50% check weekly    | Weekly Health Score views / active users |
| Paid conversion          | > 5%                  | Paid users / active free users           |
| Gamification engagement  | > 30% earn badges     | Users with badges / total active         |
| Challenge participation  | > 20% join challenges | Challenge participants / active users    |
| NPS (Net Promoter Score) | > 50                  | Survey responses                         |

---

## Phase 4: Scale + Polish (Ongoing)

**Goal**: Expand the platform and reach.

### Deliverables

| #    | Task                                           | Priority |
| ---- | ---------------------------------------------- | -------- |
| 4.1  | PWA push notifications                         | High     |
| 4.2  | Apple Watch / Wear OS companion                | Medium   |
| 4.3  | Home screen widgets (iOS, Android, Windows)    | Medium   |
| 4.4  | Team/business tier                             | Medium   |
| 4.5  | Community marketplace for bank CSV parsers     | Low      |
| 4.6  | Public API with webhook support                | Medium   |
| 4.7  | White-label for financial advisors             | Low      |
| 4.8  | Native mobile apps (React Native or Capacitor) | High     |
| 4.9  | Multi-agent AI orchestration                   | Medium   |
| 4.10 | On-device AI inference (ONNX)                  | Low      |
| 4.11 | Tax optimization suggestions                   | Medium   |
| 4.12 | Investment portfolio analysis                  | Medium   |

---

## Dependency Graph

```
Phase 1 (Foundation)
├── 1.1 Schema ──┬── 1.2 RLS
│                ├── 1.3 Cloud Transport ──┬── 1.4 Change Hook
│                │                        ├── 1.5 Migration Wizard
│                │                        └── 1.6 Multi-Device Sync ── 1.11 Sync Status
│                └── 1.10 Cloud Backup
├── 1.7 Feature Flags
├── 1.8 Auth Flow
└── 1.9 Stripe ── 1.12 Billing Page

Phase 2 (AI + Family) ← Depends on Phase 1
├── 2.1 AI Tools ──┬── 2.2 Financial Context
│                  ├── 2.3 Tool Rendering
│                  ├── 2.4 NL Transaction Entry ── 2.15 Voice Input
│                  └── 2.5 Personality Modes
├── 2.6 Insights ──┬── 2.7 Weekly Recap
│                  └── 2.8 Sparkle Icons
├── 2.9 Households ──┬── 2.10 Shared Budgets
│                    ├── 2.11 Activity Feed
│                    ├── 2.12 Privacy Toggle
│                    └── 2.14 Family Tier
└── 2.13 E2E Encryption

Phase 3 (Competitive Edge) ← Depends on Phase 2
├── 3.1 Health Score ── 3.2 Recommendations
├── 3.3 Cashflow Forecast
├── 3.4 Subscription Optimizer
├── 3.5 Bill Prediction
├── 3.6 Gamification ──┬── 3.7 Leaderboards
│                      └── 3.8 Challenges
├── 3.9 Behavioral Nudges
├── 3.10 Zero-Knowledge
├── 3.11 goCardless
├── 3.12 Plaid
├── 3.13 API Access
└── 3.14 Bill Negotiation

Phase 4 (Scale) ← Ongoing after Phase 3
└── Independent features, prioritized by impact
```

---

## Risk Mitigation

| Risk                          | Mitigation                                                                                                      |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Sync conflicts confuse users  | Ship with auto-resolve (LWW) by default. Manual resolution only for critical fields (amounts).                  |
| AI gives bad financial advice | Add disclaimer. Personality modes are tone only, not advice quality. No investment advice.                      |
| Migration data loss           | Checksum verification. 24-hour undo. Local data never deleted.                                                  |
| OpenAI costs spike            | Token budgets per user. Model routing (mini for simple, full for complex). Alert at 80% budget.                 |
| Low conversion rate           | Generous free tier drives adoption. Clear upgrade prompts at friction points (multi-device, AI limit).          |
| Competitor copies features    | Ship fast. Our 114-language advantage is a structural moat. E2E encryption is technically complex to replicate. |
