# Budget App — Competitor Landscape

Baseline profiles and pre-built search queries organized by tier. Update facts during research runs; this file provides structure and starting knowledge.

**Last updated**: 2026-02-05
**Full competitive research**: `Plans/BUDGET_APP_COMPLETE_IMPLEMENTATION_PLAN.md`
**Authoritative plan**: `Plans/BUDGET_APP_AUTHORITATIVE_PLAN.md`
**Query convention**: All queries use `[YEAR]`. Substitute the current calendar year at runtime.

---

## Tier 1 — Direct Competitors (9)

### YNAB (You Need A Budget)

- **Model**: Zero-based / envelope budgeting
- **Pricing**: ~$14.99/mo or $109/yr (raised from $99, sharing with up to 6 people)
- **Bank sync**: Plaid + MX (direct feeds for some banks)
- **Strengths**: Strong community, proven methodology, educational content
- **Weaknesses**: No multi-currency, premium pricing, no E2E encryption, learning curve
- **Privacy**: Cloud-stored, company can read data
- **2026 updates**: Spotlight (attention dashboard), UK Open Banking via Apple Wallet, loan planner, templates, cost-of-living calculator, mobile redesign, duplicate account detection
- **Last verified**: 2026-02-05
- **Queries**: `"YNAB new features [YEAR]"`, `"YNAB pricing [YEAR]"`, `"YNAB review [YEAR]"`, `"YNAB changelog"`, `"switching from YNAB reddit [YEAR]"`

### Monarch Money

- **Model**: Comprehensive financial dashboard
- **Pricing**: ~$14.99/mo or $99.99/yr (promo $50/yr for new users NEWYEAR2026)
- **Bank sync**: Plaid
- **Strengths**: Clean UI, investment tracking, net worth, couples features, goal tracking
- **Weaknesses**: US-centric, no offline mode, no E2E encryption, no free tier
- **Privacy**: Cloud-stored, standard security
- **2026 updates**: AI Assistant, reimagined goals, equity tracking, receipt scanning, retail sync extension (Amazon + Target), credit score tracking, connection health dashboard, "yours/mine/ours" couple labels
- **Last verified**: 2026-02-05
- **Queries**: `"Monarch Money new features [YEAR]"`, `"Monarch Money review [YEAR]"`, `"Monarch Money pricing [YEAR]"`

### Copilot Money

- **Model**: AI-first personal finance (iOS/Mac only)
- **Pricing**: ~$13/mo or $95/yr (note: pricing discrepancy across sources — verify live)
- **Bank sync**: Plaid
- **Strengths**: Beautiful UI, AI insights, investment tracking, Apple ecosystem, Apple Editor's Choice
- **Weaknesses**: Apple-only, **Android STILL not available** (promised since 2023), expensive, US-focused
- **Privacy**: Cloud-stored
- **2026 updates**: Transaction AI categorization, budget rebalancing, web app launched, Amazon/Venmo integrations, improved bank connections
- **Last verified**: 2026-02-05
- **Queries**: `"Copilot Money new features [YEAR]"`, `"Copilot Money review [YEAR]"`, `"Copilot app Android [YEAR]"`

### Rocket Money (formerly Truebill)

- **Model**: Subscription killer + budgeting
- **Pricing**: ~$7-14/mo (pay-what-you-want), free tier
- **Bank sync**: Plaid
- **Strengths**: Subscription cancellation, bill negotiation (35-60% success fee), 10M+ users, $2.5B claimed savings
- **Weaknesses**: Revenue from negotiation fees, limited budgeting depth, upselling
- **Privacy**: Cloud-stored, data used for service features
- **2026 updates**: Custom categories, transaction rules, chat with expert, smart savings account
- **Last verified**: 2026-02-05
- **Queries**: `"Rocket Money new features [YEAR]"`, `"Rocket Money review [YEAR]"`, `"Rocket Money pricing changes [YEAR]"`

### Simplifi by Quicken

- **Model**: Cash flow-focused budgeting
- **Pricing**: ~$3.99-5.99/mo or $47.88-71.88/yr
- **Bank sync**: Plaid
- **Strengths**: Unique cash flow projection, spending watchlists, most affordable mainstream option
- **Weaknesses**: Less budgeting depth than YNAB, Quicken legacy baggage, US-focused
- **Privacy**: Cloud-stored
- **2026 updates**: Advanced automation rules, customizable dashboard, Kelley Blue Book vehicle tracking, credit score (VantageScore 3.0), LifeHub bundle
- **Last verified**: 2026-02-05
- **Queries**: `"Simplifi Quicken new features [YEAR]"`, `"Simplifi review [YEAR]"`, `"Simplifi pricing [YEAR]"`

### EveryDollar (Ramsey Solutions)

- **Model**: Zero-based budgeting (Dave Ramsey method)
- **Pricing**: Free (manual) / ~$17.99/mo premium (bank sync)
- **Bank sync**: Plaid (premium only)
- **Strengths**: Simple UI, margin finder feature, strong brand (Ramsey audience)
- **Weaknesses**: Expensive premium, limited analytics, no investments, ideological audience
- **Privacy**: Cloud-stored
- **Last verified**: 2025-05
- **Queries**: `"EveryDollar new features [YEAR]"`, `"EveryDollar review [YEAR]"`, `"EveryDollar pricing [YEAR]"`

### PocketGuard

- **Model**: "In My Pocket" safe-to-spend focus
- **Pricing**: Free tier / ~$7.99/mo or $34.99/yr premium
- **Bank sync**: Plaid
- **Strengths**: Safe-to-spend concept, simple interface, debt payoff tools
- **Weaknesses**: Ads in free tier, limited reporting, data concerns
- **Privacy**: Cloud-stored, ad-supported free tier
- **Last verified**: 2025-05
- **Queries**: `"PocketGuard new features [YEAR]"`, `"PocketGuard review [YEAR]"`, `"PocketGuard pricing [YEAR]"`

### Goodbudget

- **Model**: Envelope budgeting (virtual envelopes)
- **Pricing**: Free (limited) / ~$8/mo or $65/yr
- **Bank sync**: Manual entry only (no Plaid)
- **Strengths**: True envelope method, manual entry advocates, couples sharing
- **Weaknesses**: No bank sync, dated UI, limited analytics
- **Privacy**: Cloud-stored but no bank credentials
- **Last verified**: 2025-05
- **Queries**: `"Goodbudget new features [YEAR]"`, `"Goodbudget review [YEAR]"`

### Lunch Money

- **Model**: Multi-currency budgeting with developer API
- **Pricing**: $5+/mo pay-what-you-want / min $60/yr (increasing from Mar 2026)
- **Bank sync**: Plaid (US/Canada), SaltEdge (international), manual CSV
- **Strengths**: Native multi-currency (160+), developer API, automation rules, crypto tracking, solo-developer transparency, 100% customer-funded (no investors)
- **Weaknesses**: Solo developer (bus factor = 1), limited mobile experience, smaller feature set, no E2E encryption, no offline mode
- **Privacy**: Cloud-stored, no data monetization, no investor pressure to monetize data
- **2026 updates**: Pay-what-you-want minimum increasing, continued API improvements
- **Threat level**: Growing. Closest multi-currency competitor. Expat/digital nomad market overlap is high. Our E2E encryption + offline + AI modules differentiate.
- **Last verified**: 2026-02-05
- **Queries**: `"Lunch Money app new features [YEAR]"`, `"Lunch Money review [YEAR]"`, `"Lunch Money multi-currency [YEAR]"`, `"Lunch Money vs YNAB [YEAR]"`, `"Lunch Money pricing [YEAR]"`

---

## Tier 2 — Wealth Overlap (3)

Overlap with Phase 5 (investments, net worth).

### Empower (formerly Personal Capital)

- **Model**: Wealth management + free financial dashboard
- **Pricing**: Free dashboard / wealth management fees on AUM
- **Strengths**: Best investment tracking, net worth dashboard, retirement planner
- **Weaknesses**: Aggressive upselling to advisory, weak budgeting, US-only
- **Last verified**: 2025-05
- **Queries**: `"Empower Personal Capital new features [YEAR]"`, `"Empower dashboard review [YEAR]"`

### Wealthfront

- **Model**: Robo-advisor with financial planning
- **Pricing**: 0.25% AUM
- **Strengths**: Tax-loss harvesting, automated investing, cash account
- **Weaknesses**: Not a budgeting tool, planning tools are secondary
- **Last verified**: 2025-05
- **Queries**: `"Wealthfront new features [YEAR]"`, `"Wealthfront financial planning tools [YEAR]"`

### Betterment

- **Model**: Robo-advisor with goal-based investing
- **Pricing**: 0.25% AUM (Digital) / 0.40% (Premium)
- **Strengths**: Goal-based approach, tax coordination, checking/savings
- **Weaknesses**: Not a budgeting tool, fee pressure from free alternatives
- **Last verified**: 2025-05
- **Queries**: `"Betterment new features [YEAR]"`, `"Betterment budgeting tools [YEAR]"`

---

## Tier 3 — Neobank Overlap (3)

Overlap with multi-currency, spending analytics, subscription detection.

### Revolut

- **Model**: Super-app (banking, crypto, investing, budgets)
- **Pricing**: Free / Plus ~$3.99/mo / Premium ~$9.99/mo / Metal ~$16.99/mo
- **Strengths**: Multi-currency king, crypto, analytics, global coverage
- **Weaknesses**: Not a dedicated budgeting tool, regulatory concerns, support issues
- **Last verified**: 2025-05
- **Queries**: `"Revolut budgeting features [YEAR]"`, `"Revolut new features [YEAR]"`, `"Revolut analytics [YEAR]"`

### Monzo

- **Model**: Digital bank with budgeting features
- **Pricing**: Free / Plus ~£5/mo / Premium ~£15/mo
- **Strengths**: Spending pots, instant categorization, UK favorite
- **Weaknesses**: UK-focused, limited external account aggregation
- **Last verified**: 2025-05
- **Queries**: `"Monzo budgeting features [YEAR]"`, `"Monzo new features [YEAR]"`

### N26

- **Model**: European neobank
- **Pricing**: Free / Smart ~€4.90/mo / You ~€9.90/mo / Metal ~€16.90/mo
- **Strengths**: Multi-country Europe, spaces (sub-accounts), instant notifications
- **Weaknesses**: Regulatory issues, feature limitations by country
- **Last verified**: 2025-05
- **Queries**: `"N26 budgeting features [YEAR]"`, `"N26 new features [YEAR]"`

---

## Tier 4 — Privacy / Open-Source (3)

Nearest privacy competitors. Relevant to our E2E encryption differentiator.

### Actual Budget

- **Model**: Open-source, self-hostable envelope budgeting
- **Pricing**: Free (self-host) / $7/mo or $84/yr (cloud hosted)
- **Bank sync**: SimpleFIN, GoCardless
- **Strengths**: Privacy-first, self-hosting, open-source, YNAB-like workflow, active community, E2E encryption (optional, password-derived)
- **Weaknesses**: Fewer features, smaller team, no AI, limited mobile, no multi-currency
- **Privacy**: Self-hosted = full control; cloud = optional E2E encryption, one-way activation
- **2026 updates**: Plugin system (first plugins = bank sync providers), goals UI improvements, growing YNAB refugee community
- **Threat level**: Growing. Closest privacy competitor. Our $49/yr self-hosted tier directly competes.
- **Last verified**: 2026-02-05
- **Queries**: `"Actual Budget new features [YEAR]"`, `"Actual Budget review [YEAR]"`, `"Actual Budget vs YNAB [YEAR]"`, `"Actual Budget E2E encryption"`, `"Actual Budget user growth [YEAR]"`

### Firefly III

- **Model**: Self-hosted personal finance manager
- **Pricing**: Free (open-source)
- **Bank sync**: Nordigen/GoCardless (community plugin)
- **Strengths**: Full self-hosting, powerful rules engine, double-entry, API
- **Weaknesses**: Complex setup, no official mobile app, steep learning curve
- **Privacy**: Complete user control (self-hosted)
- **Last verified**: 2025-05
- **Queries**: `"Firefly III new features [YEAR]"`, `"Firefly III review [YEAR]"`

### GnuCash

- **Model**: Desktop double-entry accounting
- **Pricing**: Free (open-source)
- **Bank sync**: OFX/QFX import
- **Strengths**: Mature, double-entry, powerful reporting, desktop native
- **Weaknesses**: Dated UI, steep learning curve, no cloud, not user-friendly
- **Privacy**: Local-only by default
- **Last verified**: 2025-05
- **Queries**: `"GnuCash update [YEAR]"`, `"GnuCash alternatives [YEAR]"`

---

## Tier 5 — Emerging / AI-First

### Mine / MoneyGPT
- **Model**: AI agent learning spending habits
- **Pricing**: TBD (recently funded)
- **Funding**: $14M Series A (Jan 2026, per PYMNTS — unverified)
- **Target**: Young adults
- **Threat**: AI-first approach, well-funded
- **Last verified**: 2026-02-05

### Tendi.ai
- **Model**: AI financial advisor
- **Unique**: Financial Health Index (0-100), trained on CFP exam content
- **Last verified**: 2026-02-05

### Arta AI
- **Model**: Agentic investment system
- **Unique**: RAG + function calling + convex optimization
- **Last verified**: 2026-02-05

### ElektraFi
- **Model**: Unprompted AI recommendations
- **Unique**: Monitors account data, proactive suggestions
- **Last verified**: 2026-02-05

**Market**: AI personal finance $1B (2025) → projected $3.7B by 2033 (18.1% CAGR)

Broad discovery queries for new entrants:

- `"AI personal finance app [YEAR]"`
- `"new budget app launch [YEAR]"`
- `"Y Combinator fintech personal finance [YEAR]"`
- `"AI money management startup [YEAR]"`
- `"personal finance app Product Hunt [YEAR]"`
- `"fintech seed funding personal finance [YEAR]"`

---

## Competitive Dimensions

Status labels per [budget-app-research skill Lens 2](../../.claude/Skills/budget-app-research.md):
- **LEADING**: We have or plan something competitors lack
- **PARITY**: We match or will match competitors
- **TRAILING**: Competitors have features we don't plan
- **UNIQUE**: Features no competitor offers

| Dimension | Status | Our Current Strength | Risk Level | Notes (2026) |
|-----------|--------|---------------------|------------|--------------|
| Privacy / E2E encryption | **LEADING** | Strong (local AES-256, zero-knowledge) | Low | Actual Budget adding E2E, but no others |
| Budgeting depth | **LEADING** | Strong (envelope, goals, rollover, alerts) | Medium | YNAB still gold standard; we plan 4 methodologies |
| Bank sync coverage | **TRAILING** | Moderate (71 CSV + partial SimpleFIN) | High | Plaid expected; Section 1033 on hold |
| AI / ML features | **LEADING** | Strong (17 modules, LSTM, NLP) | Medium-High | AI finance exploding (Mine, Tendi, etc.) |
| Multi-currency | **PARITY** | Moderate (72 currencies, formatting) | Medium | Revolut sets bar; Lunch Money closest; P1 closes gap |
| Investment tracking | **TRAILING** | Basic (portfolio page exists) | High | Empower far ahead; Monarch adding |
| Family / couples | **TRAILING** | Missing | High | Monarch shipped "yours/mine/ours" |
| Mobile experience | **TRAILING** | PWA only | High | Copilot/neobanks native |
| i18n coverage | **UNIQUE** | Very strong (114 locales, 16 glossaries, RTL) | Low | No competitor exceeds ~10 languages |
| Open platform / API | **TRAILING** | Missing | Medium | Lunch Money has public API; growing demand |
| Receipt scanning / OCR | **PARITY** | Foundation exists (Tesseract.js) | Medium | Monarch just shipped (cloud). We do local. |
| Canadian tax features | **UNIQUE** | Missing (planned P7) | Low (niche) | Unserved market, good differentiator |
| Rules / automation | **TRAILING** | Missing | Medium | Simplifi added; Firefly III has strong engine |
| Offline-first | **UNIQUE** | Full functionality offline | Low | No competitor offers complete offline parity |
| LAN peer-to-peer sync | **UNIQUE** | Zero-cloud multi-device | Low | No competitor offers this |
| Document vault (E2E) | **UNIQUE** | Missing (planned P6) | Low | No competitor offers encrypted doc storage |

---

## Regulatory Watch

| Regulation | Status (2026-02-05) | Impact |
|------------|---------------------|--------|
| **Section 1033 (US)** | On hold — court injunction (Oct 2025), CFPB reversing course | Original April 2026 deadline will NOT be met. Don't depend on it. |
| **PSD3 (EU)** | Political agreement reached (Nov 2025) | Compliance likely H2 2027 or early 2028 |
| **Canadian open banking** | Framework progressing | Moving faster than US; build architecture to support |
| **Passkeys / FIDO2** | At tipping point — 87% of companies planning | Regulatory mandates: UAE, India, Philippines (2026) |

## Evergreen Research Questions

Always revisit these during research runs:

1. Are any competitors adding E2E encryption or zero-knowledge claims?
2. Is Actual Budget gaining meaningful market share from YNAB?
3. What is YNAB user sentiment after price increases — stabilized or still churning?
4. Are neobanks (Revolut, Monzo) making dedicated budget apps obsolete?
5. How fast are AI finance tools evolving — any breakout products?
6. What does CFPB Section 1033 / PSD3 mean for competition and bank sync?
7. Are users willing to pay a premium for privacy (evidence from surveys, behavior)?
8. What triggers users to switch from YNAB or Monarch — what are they looking for?
9. Has Copilot Money finally shipped Android? (Promised since 2023, still missing as of Feb 2026)
10. Are any competitors adding Canadian tax features (RRSP/TFSA)?
11. What is the state of Lunch Money's multi-currency — still the closest competitor?
12. Is the Actual Budget plugin ecosystem growing? (First plugins = bank sync providers)
