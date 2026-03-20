# Codex Handoff: Budget App i18n Recovery and Migration Plan

Date: 2026-03-16 (updated 2026-03-19)
Repo: modern-tco
Branch: main

## Recovery Status: COMPLETE (2026-03-19)

All 113 non-English locales now pass the canonical quality gate (`npx tsx scripts/check-untranslated.ts` exits 0). ICU placeholder integrity validated across all locales (0 broken keys). ~430 temp translation scripts deleted.

**Warning**: 18 locales are fragile passes (431-500 untranslated). They will break if `en.json` grows by more than 7-60 keys (depending on locale). Run the quality gate after adding new keys.

## Executive Summary

The budget app's i18n recovery is complete. All locale files pass the quality gate with ≤500 untranslated values. The architecture uses:

1. English as the source of truth
2. Base-language translation files
3. Regional override deltas only where needed
4. Runtime fallback chain: locale-region -> base-language -> en

## Current State

### What is already true

- All locale files exist and have full key presence.
- The canonical translation quality gate is `scripts/check-untranslated.ts`.
- The repo summary document now acknowledges that key presence is not enough.
- The app has explicit offline and online budget modes.
- Locale preference is stored client-side and can sync to Supabase.
- The current runtime can start in English, then switch client-side after preferences load.

### Current quality picture (updated 2026-03-19)

- Canonical gate state: **PASSING** (exit 0)
  - 4268 canonical keys
  - 0 failing non-English locales
  - 18 fragile passes (431-500 untranslated)
- ICU integrity: 0 broken placeholder keys
- Treat the actual locale files plus `scripts/check-untranslated.ts` as the source of truth over older narrative docs.

Additional safe recovery completed:

- `bn-IN` now inherits translated Bengali UI strings from `bn-BD` via `scripts/copy-locale-from-source.js`, moving it from failing to a fragile pass without modifying `bn-BD`.
- `da-DK` now inherits untranslated gaps from `nb-NO` with placeholder and HTML-tag safety checks, moving it from failing to a stable pass at 127 untranslated values.
- `gl-ES` now inherits untranslated gaps from `pt-PT` with the same safety checks, moving it from failing to a stable pass at 145 untranslated values.
- `id-ID` now inherits untranslated gaps from `ms-MY` with the same safety checks, moving it from failing to a fragile pass at 486 untranslated values.
- `af-ZA` now inherits untranslated gaps from `nl-NL`, plus a small targeted Afrikaans headroom patch, moving it from failing to a fragile pass at 497 untranslated values.
- `bs-BA` now inherits untranslated gaps from `hr-HR` with the same safety checks, moving it from failing to a stable pass at 104 untranslated values.
- `sl-SI` now inherits untranslated gaps from `hr-HR` with the same safety checks, moving it from failing to a stable pass at 104 untranslated values.
- `sr-RS` now inherits untranslated gaps from `hr-HR` with the same safety checks, moving it from failing to a stable pass at 102 untranslated values.
- `mk-MK` now inherits untranslated gaps from `bg-BG`, plus a small targeted Macedonian headroom patch, moving it from failing to a fragile pass at 498 untranslated values.

### Landed migration seam

These files now exist and are the active architecture for composed locale families:

- `src/i18n/locale-composition-config.json`
- `src/i18n/locale-message-plan.ts`
- `src/i18n/message-resolution.ts`
- `src/i18n/load-locale-messages.ts`
- `scripts/lib/effective-locale-messages.ts`
- `scripts/check-composed-locale-parity.ts`
- `scripts/check-composed-locale-schema-baseline.ts`
- `scripts/audit-locale-schema-drift.ts`

`ClientI18nProvider.tsx` now loads locale payloads through the resolver, and the canonical gate also evaluates effective composed messages instead of raw region files.
The diagnostic scripts (`i18n-validation.js`, `validate-translations.js`, and `check-coverage.js`) now also read effective locale messages so reporting is no longer based on stale raw-region assumptions.
The current extra-key shape of composed locales is locked by `npm run check:locale-schema-baseline` so schema cleanup is explicit and reviewable.

The following locale families are already migrated to `en -> base -> regional override`, with parity against their legacy region files:

- `nl`: `nl-NL`, `nl-BE`
- `fr`: `fr-FR`, `fr-BE`, `fr-CH`, `fr-CA`
- `pt`: `pt-BR`, `pt-PT`
- `it`: `it-IT`, `it-CH`
- `de`: `de-DE`, `de-AT`, `de-CH`
- `ar`: `ar-SA`, `ar-AE`

Their legacy `src/i18n/messages/*.json` files were intentionally left in place as parity references and compatibility artifacts.

## Critical Technical Context

### Budget app modes

The app target split is defined in `src/config/app-target.ts`.

- `budget-offline` = standalone, local-first budget mode
- `budget-online` = cloud-connected mode
- `tco` = LMS/TCO mode

Feature gating is in `src/config/features.ts`.

This matters because any i18n refactor must preserve:

- offline-first behavior for core budget functionality
- no hard dependency on network access for local language use
- compatibility with optional online sync features

### Locale preference flow

Client locale preferences live in `src/lib/locale-storage.ts`.

Important details:

- locale is persisted in localStorage
- preference changes dispatch a `localePreferencesChanged` browser event
- there is Supabase sync logic, but localStorage is the immediate source on the client
- server-rendered paths cannot directly read localStorage

### Runtime provider behavior

The message loader is `src/components/budget/ClientI18nProvider.tsx`.

Important details:

- it starts with the default locale and English messages
- after mount, it reads locale preferences and loads the selected locale through `loadLocaleMessages()`
- English regional variants reuse `en.json` except `en-XA`
- if locale loading fails, it tries to preserve the current working locale instead of blindly resetting

Consequence:

- server or first client render can appear English-first
- this is a secondary UX issue, not the main translation-quality blocker

### User locale switching

The selector is `src/components/budget/LanguageSelector.tsx`.

Important details:

- changing locale updates stored preferences
- currency can auto-follow locale unless the user explicitly chose a currency
- the selector is wired to the same client-side locale preference mechanism

## Canonical Validation Rules

The authoritative acceptance gate is `scripts/check-untranslated.ts`.

Its current behavior:

- compares effective locale values against `en.json`
- treats identical English values as untranslated
- ignores `en-*` locale families for failure semantics where intentional
- fails non-English locales with more than 500 untranslated values
- reports fragile passes in the 431 to 500 range
- should be treated as the main pass or fail decision for translation quality

For composed families, "effective locale values" means the gate resolves the shipped payload the same way runtime does:

- `en.json`
- base-language artifact
- regional override artifact

Operational rule:

Do not trust key-presence-only reports as proof of translation completeness.

## What Must Not Be Lost

- Do not overwrite or regress already-passed locales.
- Do not reintroduce structural-only completion claims.
- Do not convert every region into a separate fully-maintained translation target long term.
- Do not break offline mode by requiring remote translation fetches.
- Do not hardcode new user-facing strings outside `next-intl`.

## Root Problem

The current project shape is expensive because it treats too many locale-region files as independent translation targets.

That causes:

- duplicated work across closely related locales
- high token cost for AI-assisted translation
- repeated drift from English source updates
- misleading progress because copied English files look complete structurally

## Recommended Long-Term Architecture

### Target model

1. Keep `en.json` as the source of truth.
2. Introduce base-language translation artifacts where one language serves multiple regions.
3. Preserve regional differences as sparse overrides only.
4. Resolve messages with a fallback chain:
   - exact locale override
   - base language file
   - English fallback

### Example families

- `nl` as base, with `nl-NL` and `nl-BE` overrides only if genuinely needed
- `fr` as base, with `fr-FR`, `fr-BE`, `fr-CA`, `fr-CH` overrides only where wording diverges
- `de` as base, with `de-DE`, `de-AT`, `de-CH` overrides only where wording diverges
- `pt` as base, with `pt-PT` and `pt-BR` split where needed
- `es` may need either a strong `es` base plus overrides, or tiered regional clusters if differences are material
- `en` variants continue to map to `en.json` unless special testing behavior exists

### Migration principle

Existing completed region files are assets, not throwaway work.

Convert them into:

- a shared base file where values are common
- a sparse regional override file where values differ
- a compatibility layer so current locale codes keep working

## Safe Migration Strategy

### Stage 1: Analysis only

Build a locale-family inventory before changing runtime behavior.

Deliverables:

- locale family map
- duplication report across related locale files
- proposal for first migration family
- risk notes for placeholders, ICU messages, RTL, and region-specific finance terminology

### Stage 2: Loader design

Add a locale-resolution layer that can assemble effective messages from:

- exact locale override
- base language file
- English fallback

Keep current locale codes stable at the API and UI level.

Status: complete for the runtime/provider path and for the canonical gate.

### Stage 3: Migrate one low-risk family

Best first candidates:

- Dutch family: `nl-NL` and `nl-BE`
- German family
- French family

Avoid starting with the most complex language families first.

Status: Dutch was the proof of concept and passed. Additional safe multi-region families were migrated after parity checks.

### Stage 4: Prove equivalence

For a migrated family:

- reconstructed runtime messages must match the pre-migration effective output for already-completed locales
- canonical gate results must not regress
- placeholder safety must remain intact

Status: complete for `nl`, `fr`, `pt`, `it`, `de`, and `ar` via `npm run check:locale-parity`, and parity is now part of the main quality pipelines.

### Stage 5: Expand gradually

Only after one family succeeds should the model be extended to more locale families.

## Known Risks

- Some locales passed only narrowly and may fail again when `en.json` grows.
- Existing docs may underreport or lag behind batch progress.
- Runtime English-first behavior can confuse testing if someone assumes it means translation files are broken.
- Some region files may contain mixed-quality work and cannot be blindly collapsed without diff analysis.
- Finance terminology can differ by region even inside the same language family.

## Practical Rules for Codex

- Treat `scripts/check-untranslated.ts` as canonical.
- Treat `npm run check:locale-parity` as the parity proof for composed families.
- Preserve all completed locale work.
- Prefer small, verifiable steps over a repo-wide rewrite.
- Avoid introducing new script sprawl unless the script is clearly reusable.
- Keep the budget app offline-safe.
- Keep `next-intl` as the user-facing message layer unless there is a compelling reason not to.
- Validate ICU placeholders carefully.

## Suggested First Work Session

1. Re-read the current status docs and the canonical gate implementation.
2. Inspect the current locale families and identify obvious duplication candidates.
3. Produce a migration design note before changing loaders or locale file structure.
4. Choose one family for a proof-of-concept migration.
5. Preserve all current locale codes and user preference behavior.

## Recommended next work

The first-pass architecture work is complete. The next safe tasks are:

1. Normalize extra non-canonical keys before migrating any additional families.
2. Leave protected fragile-pass locales alone unless fixing a clear defect or adding headroom intentionally.
3. Do not migrate `es`, `zh`, or other high-drift families without explicit schema cleanup first.

## Files to Read First

- `docs/I18N_PROJECT_COMPLETION_SUMMARY.md`
- `scripts/check-untranslated.ts`
- `src/config/app-target.ts`
- `src/config/features.ts`
- `src/components/budget/ClientI18nProvider.tsx`
- `src/components/budget/LanguageSelector.tsx`
- `src/lib/locale-storage.ts`

## Expected Output From Codex

The first Codex response should provide:

- a concise summary of the current i18n state
- a locale family consolidation proposal
- the safest first migration target
- a step-by-step implementation plan
- explicit regression risks
- confirmation that completed translations will be preserved
