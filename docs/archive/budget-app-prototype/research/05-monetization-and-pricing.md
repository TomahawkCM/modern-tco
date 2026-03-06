# Monetization & Pricing Strategy

## Market Pricing Landscape

| App                   | Monthly | Annual  | Savings | Model                 |
| --------------------- | ------- | ------- | ------- | --------------------- |
| YNAB                  | $14.99  | $109.00 | 39%     | Subscription          |
| Monarch Money         | $14.99  | $99.99  | 44%     | Subscription          |
| Copilot Money         | $13.00  | $95.00  | 39%     | Subscription          |
| Simplifi              | $5.99   | $71.88  | 0%      | Subscription          |
| Cleo Plus             | $5.99   | -       | -       | Monthly only          |
| Cleo Builder          | $14.99  | -       | -       | Monthly only          |
| Rocket Money          | $6-12   | $72-144 | Varies  | Subscription          |
| MoneyWiz              | $4.99   | -       | -       | Monthly only          |
| PocketSmith           | $9.95   | -       | -       | Monthly only          |
| Actual Budget         | Free    | Free    | -       | Donations ($34.6K/yr) |
| **Our App (Offline)** | -       | $19.99  | -       | One-time purchase     |

**Market sweet spot**: $80-$100/year for premium budget apps. The average user is willing to pay this for comprehensive features.

## Proposed Pricing

### Tier Structure

| Tier       | Price                  | Target Audience                                |
| ---------- | ---------------------- | ---------------------------------------------- |
| **Free**   | $0 forever             | Individual users who want privacy + local-only |
| **Pro**    | $59/year ($6.99/month) | Power users wanting cloud sync + full AI       |
| **Family** | $89/year ($9.99/month) | Households with up to 5 members                |

### Why These Prices

**Free tier**: Competes with Actual Budget (free, local-first) but adds AI (limited), 114 languages, 11 calculators, and better UX. Creates large user base for conversion funnel.

**Pro at $59/year**:

- 40% cheaper than YNAB ($109) with more features (AI, encryption, offline)
- 41% cheaper than Monarch ($100) with encryption + offline + 114 languages
- 38% cheaper than Copilot ($95) with cross-platform + encryption
- Psychologically under $5/month when paid annually

**Family at $89/year**:

- Cheaper than a single YNAB subscription ($109)
- Replaces Monarch for families ($100/person, so $200 for a couple)
- Up to 5 members = $17.80/person/year

### Annual vs Monthly Pricing

| Plan   | Monthly | Annual         | Savings |
| ------ | ------- | -------------- | ------- |
| Pro    | $6.99   | $59 ($4.92/mo) | 30%     |
| Family | $9.99   | $89 ($7.42/mo) | 26%     |

Monthly pricing is intentionally set to make annual significantly more attractive, driving upfront revenue and reducing churn.

## Feature Distribution

### Free Tier (Generous — Drive Adoption)

Everything in the current offline app, plus:

- All offline features (transactions, budgets, accounts, categories)
- Unlimited transactions and accounts
- 114 languages and multi-currency support
- Bank CSV/OFX/PDF import (71+ bank configs)
- 11 financial calculators
- Receipt scanning via OCR
- Client-side encryption at rest
- Local export/backup
- Basic AI chatbot (5 messages/day)
- Basic financial insights
- Gamification (streaks, badges)

### Pro Tier (The Money Maker)

Everything in Free, plus:

- Cloud sync across unlimited devices
- Automatic cloud backup
- SimpleFIN bank sync (real-time balance updates)
- Unlimited AI chatbot messages
- Advanced AI insights + Weekly Recap
- Cash flow forecasting (30/60/90 day)
- Financial Health Score with recommendations
- Subscription optimization suggestions
- Bill prediction system
- E2E encryption for cloud data
- Smart behavioral nudges
- Priority support
- API access (for power users and integrations)

### Family Tier (Household Collaboration)

Everything in Pro, plus:

- Up to 5 household members
- Shared budgets with role-based access (owner, admin, member, viewer)
- Real-time activity feed
- Combined net worth view
- Shared savings goals with per-member tracking
- Individual transaction privacy
- Household leaderboards (opt-in)
- Family financial challenges

## Revenue Projections

### Conversion Assumptions

Based on industry benchmarks:

- Free-to-paid conversion: 3-5% (Actual Budget has ~0.5% donation rate, but we offer more value)
- Monthly-to-annual: 60-70% (standard for SaaS)
- Pro:Family ratio: 70:30 (most users are individuals)
- Churn rate: 5-8% monthly for monthly, 15-25% annual for annual

### Year 1 Scenarios

| Scenario     | Free Users | Conversion | Paid Users | Mix              | Annual Revenue |
| ------------ | ---------- | ---------- | ---------- | ---------------- | -------------- |
| Conservative | 10,000     | 3%         | 300        | 70/30 Pro/Family | ~$20K          |
| Moderate     | 50,000     | 4%         | 2,000      | 70/30            | ~$134K         |
| Optimistic   | 200,000    | 5%         | 10,000     | 65/35            | ~$660K         |

### Cost Structure (Per User/Year)

| Cost                   | Amount         | Notes                                   |
| ---------------------- | -------------- | --------------------------------------- |
| Supabase (Pro plan)    | ~$0.50/user    | Shared instance, scales with usage      |
| OpenAI API             | ~$2-5/user     | GPT-4o-mini for chat, GPT-4o for recaps |
| Stripe fees            | ~$1.50/user    | 2.9% + $0.30 per transaction            |
| SimpleFIN              | $0             | User pays SimpleFIN directly            |
| Infrastructure         | ~$1/user       | Vercel, monitoring, CI/CD               |
| **Total cost/user**    | **~$5-8/year** |                                         |
| **Revenue/user (Pro)** | **$59/year**   |                                         |
| **Gross margin**       | **~87-92%**    |                                         |

## Monetization Principles

1. **Free tier must be genuinely useful**: Not a crippled demo. Users should be able to manage their full financial life on Free. This drives word-of-mouth and builds trust.

2. **Cloud + AI is the natural upgrade**: When users want multi-device sync or deeper AI insights, the upgrade is obvious and worth it.

3. **No paywalling privacy**: E2E encryption is available on Pro, but the free tier's local-only model is inherently private. We never charge for privacy.

4. **Family tier encourages household adoption**: Cheaper than two individual Pro subscriptions, incentivizes shared budgeting.

5. **No ads, no data selling**: Revenue comes from subscriptions only. This is our competitive differentiator against free ad-supported apps.

6. **Annual pricing dominant**: Design the pricing page to emphasize annual savings. Most revenue should come from annual subscriptions.

## Competitive Positioning

### Against YNAB ($109/year)

"Everything YNAB does, plus AI, encryption, offline mode, and 114 languages — for $59/year."

### Against Monarch ($99.99/year)

"Monarch's AI features with E2E encryption, offline-first design, and 114 languages — for $59/year."

### Against Cleo ($72-180/year)

"Cleo's personality and gamification with real budgeting tools, encryption, and family collaboration — for $59/year."

### Against Actual Budget (Free)

"Actual's privacy and local-first approach with AI, cloud sync, and a polished UI — with a free tier that matches Actual."

## Stripe Integration

### Existing Infrastructure

- Stripe checkout session route exists at `src/app/api/v1/stripe/create-checkout-session/route.ts`
- `useTrialStatus` hook supports trial/active/expired states
- Upgrade page at `src/app/budget-app/auth/upgrade/page.tsx`

### Required Additions

- Stripe webhook handler for subscription events (created, updated, canceled, payment failed)
- Stripe Customer Portal integration (manage subscription, update payment method)
- Proration handling for tier upgrades/downgrades
- Grace period on payment failure (3 retry attempts over 7 days)
- Downgrade flow: Pro → Free (cloud data preserved for 30 days, then deleted)
