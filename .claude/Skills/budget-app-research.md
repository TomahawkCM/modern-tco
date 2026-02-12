---
name: budget-app-research
description: Use when researching feature upgrades, competitive intelligence, market trends, or pricing for the budget app
---

# Budget App Research

Systematic competitive research combining knowledge of the offline app (36 routes, 70+ components, 17 AI modules, 114 locales) and the 9-phase online plan with live web research. Produces structured intelligence reports with actionable recommendations.

**Year convention**: All search queries below use `[YEAR]`. Always substitute the current calendar year at runtime (e.g., 2026 → 2027 when the year changes). For trend queries, also search `[YEAR-1]` to catch late-published content.

## Research Preparation

1. Read `references/current-features-inventory.md` — load offline feature baseline
2. Read `references/competitor-landscape.md` — load competitor profiles and search queries
3. Read `Plans/BUDGET_APP_AUTHORITATIVE_PLAN.md` — only if mapping recommendations to specific phases
4. **Check for previous reports**: Read the most recent file in `docs/competitive-research/` to establish a baseline for change detection. If no prior report exists, note this is the first run.
5. Ask user for research focus:

| Mode | Scope | When |
|------|-------|------|
| **Full sweep** | All competitors, all categories | Quarterly |
| **Competitor deep-dive** | Single competitor analysis | Ad hoc |
| **Feature-area research** | Specific feature category | Pre-feature design |
| **Phase validation** | Validate a planned phase against market | Pre-phase kickoff |

### Context Budget

A full sweep is large. Manage context by:
- **Monthly quick check**: Phase A only, Tier 1 top 5 competitors. Use a single agent.
- **Quarterly full sweep**: Use parallel subagents — one per research phase (A/B/C/D/E). Merge results in the final report.
- **Deep-dive / feature-area**: Single agent, focused scope. No parallelization needed.
- Prefer `firecrawl_scrape` for structured pages (pricing, changelogs). Prefer `WebSearch` for sentiment and trend queries. This avoids burning context on full-page HTML.

---

## Phase A: Competitor Feature Tracking

Search per competitor using queries from `references/competitor-landscape.md`. Prioritize Tier 1 (direct) first, then expand by relevance.

**Search templates** (replace `[name]` per competitor, `[YEAR]` with current year):
- `"[name] new features [YEAR]"`
- `"[name] changelog [YEAR]"`
- `"[name] review [YEAR]"`
- `"[name] pricing [YEAR]"`

**Direct scraping targets** (use firecrawl when available):
- `[competitor].com/pricing` — pricing page
- `[competitor].com/changelog` or `/blog` — feature announcements
- `[competitor].com/features` — feature comparison page

**Capture per competitor**:
- New features since last research run
- Pricing changes
- User sentiment shift
- Privacy incidents or claims
- Positioning changes (new messaging, new audience)

---

## Phase B: Technology & Regulatory Trends

Search queries mapped to online plan phases:

| Query | Phase |
|-------|-------|
| `"open banking API [YEAR] Section 1033 CFPB"` | Phase 6 |
| `"Plaid alternatives [YEAR]"`, `"SimpleFIN vs Plaid"` | Phase 2 |
| `"FIDO2 passkey adoption fintech [YEAR]"` | Phase 1 |
| `"federated learning privacy finance [YEAR]"` | Phase 4 |
| `"personal finance AI agent [YEAR]"` | Phase 4 |
| `"PSD3 open banking Europe [YEAR]"` | Phase 6 |
| `"BNPL tracking regulation [YEAR]"` | Phase 7 |
| `"credit score API fintech [YEAR]"` | Phase 2 |
| `"zero knowledge encryption fintech [YEAR]"` | Phase 1 |
| `"PWA vs native finance app [YEAR]"` | Phase 8 |

### Regulatory landscape (beyond Section 1033 / PSD3)

| Query | Relevance |
|-------|-----------|
| `"GDPR financial data processing [YEAR]"` | EU data handling for cloud sync |
| `"India DPDP Act fintech [YEAR]"` | Data protection in high-growth i18n market |
| `"Australia CDR open banking [YEAR]"` | Consumer Data Right, bank sync in AU |
| `"data residency requirements fintech [YEAR]"` | Where cloud data can be stored |
| `"financial data portability regulation [YEAR]"` | Global portability trends |
| `"CCPA CPRA financial data [YEAR]"` | California privacy for US users |

---

## Phase C: User Sentiment Mining

### Reddit & Forums

- `"YNAB complaints reddit [YEAR]"`
- `"switching from YNAB [YEAR]"`
- `"best budget app reddit [YEAR]"`
- `"budget app privacy concerns reddit"`
- `"couples budget app reddit [YEAR]"`
- `"offline budget app reddit"`
- `"Monarch Money complaints [YEAR]"`
- `"budget app self hosted [YEAR]"`

### App Stores & Review Sites

- `site:g2.com "[competitor] review"` for Tier 1 competitors
- `site:capterra.com "[competitor] review"` for Tier 1 competitors
- `"[competitor] app store reviews [YEAR]"` for competitors with mobile apps
- `"[competitor] trustpilot [YEAR]"` for Tier 1 competitors
- Check iOS App Store and Google Play ratings for Tier 1 competitors (scrape with firecrawl if possible, otherwise note from search snippets)

**Focus areas**: pain points, unmet needs, switching triggers, feature requests, privacy concerns, rating trends (improving or declining).

---

## Phase D: Pricing Intelligence

- `"[competitor] pricing [YEAR]"` for each Tier 1 competitor
- `"personal finance app pricing comparison [YEAR]"`
- `"SaaS pricing personal finance [YEAR]"`
- `"budget app free vs premium features [YEAR]"`

**Direct scrape**: Use `firecrawl_scrape` on each Tier 1 competitor's `/pricing` page for exact current pricing. Search results often show outdated figures.

**Compare against our planned tiers**:
- Free: Offline-only, manual entry, 1 device
- Premium $5.99/mo: Cloud sync, bank connections, AI coach
- Family $11.99/mo: Multi-user, shared budgets, family roles

---

## Phase E: Geographic Market Intelligence

Exploit the 114-locale advantage by identifying underserved markets:

- `"personal finance app [country] [YEAR]"` for: India, Brazil, Indonesia, Nigeria, Philippines, Vietnam, Mexico, Turkey
- `"budget app [language] [YEAR]"` for: Hindi, Portuguese, Bahasa, Tagalog
- `"fintech personal finance emerging markets [YEAR]"`
- `"personal finance app localization [YEAR]"`

**Evaluate per market**:
- Local competitors (if any)
- Smartphone/banking penetration
- Currency and regulatory complexity
- Demand signals (app store search volume, Reddit/forum activity)
- Whether our i18n coverage already serves the locale

---

## Analysis Framework

Apply four lenses to all findings:

### Lens 1: Feature Gap Matrix

| Category | Our Offline | Our Online Plan (Phase) | Competitor A | Competitor B | ... |
|----------|-------------|------------------------|--------------|--------------|-----|
| Budgeting | Has | Has (P1: methodology selector) | Has | Has | |
| Bank sync | Partial | Planned (P2: Plaid) | Has | Has | |
| AI coach | Missing | Planned (P4) | Has | Missing | |
| ... | | | | | |

Status per cell: **Has** / **Planned (Phase #)** / **Missing**

### Lens 2: Competitive Advantage Assessment

- **LEADING**: We have or plan something competitors lack
- **PARITY**: We match or will match competitors
- **TRAILING**: Competitors have features we don't plan
- **UNIQUE**: Features no competitor offers (our differentiators)

Flag any **TRAILING** items as potential additions to the roadmap.

### Lens 3: Privacy Differentiator Analysis

For every finding, evaluate:
- Can this feature work with E2E encryption?
- What privacy trade-offs do competitors make to deliver it?
- Can we deliver equivalent value without compromising zero-knowledge?
- Does this strengthen or weaken our "ProtonMail of finance" positioning?

### Lens 4: Recommendation Prioritization

Score every recommendation on two axes:

| | Low Effort | High Effort |
|---|---|---|
| **High Strategic Impact** | Do first | Plan into next phase |
| **Low Strategic Impact** | Do if convenient | Skip or defer |

**Strategic impact** = how many of these are true:
- Addresses a TRAILING gap vs. Tier 1 competitors
- Exploits a UNIQUE differentiator (privacy, i18n, offline)
- Directly supports a planned phase (reduces risk, validates approach)
- Strong user demand signal (sentiment mining evidence)
- Privacy-compatible without trade-offs

---

## Handling Conflicting Information

When sources disagree on pricing, features, or dates:
1. **Primary source wins**: Scrape the competitor's own website. Their pricing/features page is ground truth.
2. **Recency wins**: More recent sources override older ones. Note the publication date.
3. **Flag unresolved conflicts**: If ground truth can't be established, note the conflict in the report with both claims and sources.
4. **Never guess**: If a data point can't be verified, mark it with `(unverified)` in the report.

---

## Output Format

Structure every research report as:

```markdown
# Competitive Research Report — [Focus] — YYYY-MM-DD

## Executive Summary
- [3-5 key bullets]

## Changes Since Last Report
- [Delta from previous report — new features, pricing changes, market shifts]
- [If first report, state "Baseline report — no prior data"]

## New Competitor Developments
### [Competitor Name]
- **New features**: ...
- **Pricing changes**: ...
- **User sentiment**: ...
- **Privacy stance**: ...

## Feature Gap Analysis

### Consider Adding (prioritized)
| Feature | Competitors With It | Suggested Phase | Effort | Strategic Impact | Privacy Compatible |
|---------|-------------------|-----------------|--------|-----------------|-------------------|

### Where We Lead
| Feature | Our Advantage | Nearest Competitor |
|---------|--------------|-------------------|

### Where We Trail
| Feature | Leader | Gap Severity | Recommendation |
|---------|--------|-------------|----------------|

## Pricing Intelligence
| Competitor | Free Tier | Paid Tier | Annual | Notable | Source |
|-----------|-----------|-----------|--------|---------|--------|

## User Sentiment Insights
- [Pain points, switching triggers, unmet needs]
- [App store rating trends if available]

## Geographic Opportunities
| Market | Local Competition | Our i18n Coverage | Demand Signal | Recommendation |
|--------|------------------|-------------------|---------------|----------------|

## Technology Recommendations
| Technology | Use Case | Phase | Privacy Compatible | Notes |
|-----------|----------|-------|--------------------|-------|

## Regulatory Updates
- [Section 1033, PSD3, GDPR, DPDP Act, CDR — status and implications]

## Emerging Threats & Opportunities
- [New entrants, market shifts, regulatory changes]

## Recommended Phase Adjustments
- [Specific changes to phase plan based on findings, prioritized by impact]

## Sources
- [All URLs cited in the report, with access date]
```

---

## Cadence & Storage

| Frequency | Scope | Trigger |
|-----------|-------|---------|
| Monthly | Quick check — Phase A, top 5 competitors | Calendar reminder |
| Quarterly | Full sweep — all phases (A-E) | Calendar reminder |
| Pre-phase | Run before starting any development phase | Phase kickoff |
| Ad hoc | Competitor deep-dive or feature-area research | User request |

Save reports to: `docs/competitive-research/YYYY-MM-DD-[focus].md`

Each report should reference the previous report's date in the "Changes Since Last Report" section to maintain a chain.

---

## Related Skills

- `idea-validator` — Evaluate specific new feature ideas surfaced by research
- `roadmap-builder` — Reprioritize phase plan based on findings
- `marketing-writer` — Turn competitive advantages into positioning copy
