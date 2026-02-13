---
name: competitive-monitor
description: Use when tracking competitor releases, pricing changes, feature announcements, or updating the competitive landscape analysis.
---

# Competitive Monitor

## Overview

Systematic tracking of competitor budget apps — feature releases, pricing changes, user sentiment, and market positioning. Maintains a living competitive matrix and triggers re-evaluation when competitors ship features on our roadmap.

## When to Use

- Quarterly competitive review
- When a competitor announces a major feature or pricing change
- Before planning new features (check competitor landscape)
- When evaluating our competitive positioning
- Updating the competitive comparison matrix

## Core Principles

- **Systematic, not reactive** — Quarterly reviews, not just when scared
- **Feature-focused** — Track features and UX, not marketing claims
- **Honest assessment** — Acknowledge where competitors are better
- **Action-oriented** — Each review produces actionable insights
- **User perspective** — Evaluate from the user's viewpoint, not developer's

## Competitors to Track

| Competitor | Type | Pricing | Key Strength |
|-----------|------|---------|--------------|
| YNAB | Zero-based budgeting | $14.99/mo | Methodology, community |
| Monarch Money | Comprehensive finance | $14.99/mo | Full financial picture |
| Copilot | AI-first budgeting | $14.99/mo | Design, AI insights |
| Rocket Money | Bill negotiation | $6-12/mo | Subscription cancellation |
| Simplifi by Quicken | Traditional budgeting | $5.99/mo | Quicken ecosystem |
| Actual Budget | Open source | Free/self-host | Privacy, local-first |
| Lunch Money | Developer-friendly | $10/mo | API, developer tools |
| DAS Budget | Envelope budgeting | Free/$5/mo | Simplicity |

## Workflow

### Step 1: Quarterly Review Template

```markdown
# Competitive Review — Q[X] [YEAR]

## Major Changes This Quarter

### [Competitor Name]
- **New Features**: [list]
- **Pricing Changes**: [if any]
- **User Sentiment**: [positive/negative/neutral from Reddit/reviews]
- **Impact on Us**: [none/low/medium/high]

## Feature Comparison Matrix Update

| Feature | Us | YNAB | Monarch | Copilot | Actual |
|---------|-----|------|---------|---------|--------|
| Bank Sync | ❌ | ✅ | ✅ | ✅ | ❌ |
| E2E Encryption | ✅ | ❌ | ❌ | ❌ | ✅ |
| i18n (100+ locales) | ✅ | ❌ | ❌ | ❌ | ❌ |
| AI Insights | ✅ | ❌ | ✅ | ✅ | ❌ |
| Family Sharing | ❌ | ❌ | ✅ | ❌ | ❌ |
| Investment Track | ❌ | ❌ | ✅ | ✅ | ❌ |
| Offline-first | ✅ | ❌ | ❌ | ❌ | ✅ |
| Open Source | ❌ | ❌ | ❌ | ❌ | ✅ |

## Our Advantages
1. [List current advantages]

## Our Gaps
1. [List where we trail]

## Recommended Actions
1. [Prioritized actions based on competitive landscape]
```

### Step 2: Information Sources

```
Reddit:
- r/ynab — YNAB user discussions, complaints
- r/monarchmoney — Monarch community
- r/personalfinance — General budgeting discussions
- r/budgetingapps — Cross-app comparisons

Review Sites:
- App Store / Google Play reviews (sort by recent)
- G2 / Capterra reviews
- Trustpilot

News:
- TechCrunch (fintech category)
- Product Hunt launches
- Company blogs/changelogs

Pricing:
- Direct pricing pages (check quarterly)
- r/ynab pricing discussions
```

### Step 3: Trigger Events

When to do an off-cycle review:

| Trigger | Action |
|---------|--------|
| Competitor ships feature we planned | Evaluate: accelerate our version or differentiate |
| Competitor raises prices | Marketing opportunity: highlight our value |
| Competitor has major outage | Note but don't exploit; focus on our reliability |
| New competitor enters market | Add to tracking list, full initial analysis |
| Competitor discontinues | Analyze their user migration opportunity |

### Step 4: Competitive Positioning Updates

After each review, update positioning messages:

```markdown
## Current Positioning

**Primary**: "The ProtonMail of personal finance" — privacy-first budgeting
**Secondary**: "Budget in any language" — 114 locale support
**Tertiary**: "Your data, your device" — offline-first, no cloud required

## Positioning vs. Specific Competitors

vs. YNAB: "Same philosophy, better privacy, works offline"
vs. Monarch: "Your financial data stays on your device"
vs. Copilot: "AI insights without compromising privacy"
vs. Actual Budget: "Open-source privacy with polished UX"
```

## Key Files

| File | Role |
|------|------|
| `.claude/Skills/references/competitor-landscape.md` | Current competitive landscape |
| `docs/competitive-research/` | Competitive research documents |

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Only reviewing when worried | Schedule quarterly reviews |
| Copying competitor features blindly | Evaluate fit with our positioning first |
| Ignoring indirect competitors (spreadsheets, banking apps) | Track adjacent solutions too |
| Only tracking features, not UX | Test competitor apps directly |
| Not updating positioning after review | Refresh messaging based on landscape changes |

## Validation Checklist

- [ ] All 8 competitors reviewed
- [ ] Feature matrix updated with current state
- [ ] Pricing checked for changes
- [ ] User sentiment reviewed (Reddit, reviews)
- [ ] Advantages and gaps honestly assessed
- [ ] Actionable recommendations produced
- [ ] Positioning messages refreshed if needed

## Related Skills

- `budget-app-research` — deeper competitive research methodology
- `privacy-marketing` — privacy positioning updates
- `roadmap-builder` — feature prioritization based on competitive gaps
