---
name: code-review-budget
description: Use when reviewing PRs or code changes to budget app features. Provides budget-app-specific review checklist beyond standard code review.
---

# Budget App Code Review

## Overview

Budget-app-specific code review checklist that goes beyond general code quality. Checks for financial math correctness (Decimal.js), encryption compliance, i18n completeness, feature flag usage, and performance impact. Every PR touching budget app code should pass these checks.

## When to Use

- Reviewing any PR that touches `src/components/budget/` or `src/app/budget-app/`
- Reviewing changes to financial calculations or data handling
- Reviewing new features before merge
- Self-reviewing your own budget app code before committing

## Core Principles

- **Money must use Decimal.js** — This is the #1 most common bug source
- **PII must be encrypted** — Any new data field storing personal info needs encryption
- **Strings must use i18n** — No hardcoded user-facing English text
- **Features need flags** — New features should be behind feature flags
- **Bundle size matters** — New dependencies need size justification

## Review Checklist

### 1. Financial Math

```
□ All monetary calculations use Decimal.js (not native number)
□ No parseFloat() or Number() on financial values
□ No toFixed() without Decimal.js (use toDecimalPlaces())
□ Currency amounts passed as strings between components
□ No floating-point comparison (===) on money values
□ Zero-decimal currencies handled (JPY, KRW, VND)
□ Rounding only at display time, not intermediate calculations
```

### 2. Encryption & Privacy

```
□ New data fields storing PII use EncryptedDB
□ No plaintext PII in localStorage, sessionStorage, or cookies
□ No console.log of decrypted financial data
□ No PII sent to external APIs without user consent
□ Encryption keys never stored persistently (memory only)
□ New API routes don't expose encrypted data in plaintext
```

### 3. Internationalization

```
□ All user-facing strings use useTranslations() / t()
□ No hardcoded English text in JSX
□ Currency formatting uses Intl.NumberFormat (not $ prefix)
□ Date formatting uses locale-aware formatter
□ Number formatting respects locale (comma vs. dot decimal)
□ New translation keys added to en.json (base locale)
□ Pluralization rules correct (one/other at minimum)
```

### 4. Feature Flags

```
□ New features wrapped in isFeatureEnabled() check
□ Feature flag added to features.json with metadata
□ "Coming Soon" UI shows when flag is disabled
□ Flag has correct mode (standalone/online/both)
```

### 5. Performance

```
□ No new dependency > 50KB gzipped without justification
□ Heavy components use dynamic() import
□ Lists > 50 items use virtual scrolling
□ Images use next/image with explicit dimensions
□ No synchronous operations that could block UI
□ Skeleton loaders prevent layout shift
```

### 6. Type Safety

```
□ No new any types without justification comment
□ Zod schemas for all external input validation
□ Props interfaces defined (not inline)
□ Return types explicit on exported functions
□ No @ts-ignore or @ts-expect-error without explanation
```

### 7. Accessibility

```
□ Interactive elements use semantic HTML (button, not div onClick)
□ Touch targets ≥ 44×44px
□ ARIA labels on icon-only buttons
□ Color not sole indicator of state
□ Focus management on modals/dialogs
```

### 8. Error Handling

```
□ API calls have try/catch with user-friendly error messages
□ Form validation shows inline errors (not just alert)
□ Offline scenarios handled gracefully
□ Import errors don't crash the app
□ Error boundaries around independent sections
```

## Workflow

### Step 1: Quick Scan (2 min)

Look for obvious issues:
- Any `parseFloat`, `Number()`, or `toFixed()` on money
- Any hardcoded English strings in JSX
- Any `console.log` of financial data
- Any `any` types without comment

### Step 2: Checklist Review (5 min)

Go through each section of the checklist above.

### Step 3: Test Coverage Check

```bash
# Check if new code has tests
npm test -- --coverage --changedSince=main

# Check if E2E tests cover the new flow
grep -r "test-id-from-new-code" tests/e2e/
```

### Step 4: Bundle Impact

```bash
# Check if new dependencies were added
git diff main -- package.json | grep "+"
# For each new dep, check size
npx bundlephobia <new-dep-name>
```

## Key Files

| File | Role |
|------|------|
| `src/components/budget/` | Budget UI (review focus) |
| `src/lib/encryption/encrypted-db-wrapper.ts` | Encryption wrapper (PII check) |
| `src/config/features.json` | Feature flags (new feature check) |
| `src/i18n/messages/en.json` | Base translation file |
| `package.json` | Dependency changes |

## Common Review Findings

| Finding | Severity | Fix |
|---------|----------|-----|
| `parseFloat` on currency | Critical | Replace with `new Decimal(value)` |
| Hardcoded `$` in JSX | Medium | Use `Intl.NumberFormat` with currency |
| Missing feature flag | Medium | Add to `features.json` + wrap in `isFeatureEnabled()` |
| `console.log(transaction)` | High | Remove or replace with `[ENCRYPTED]` |
| New 80KB dependency | Medium | Justify or find lighter alternative |
| No loading skeleton | Low | Add `<Skeleton />` matching final dimensions |

## Validation Checklist

- [ ] All 8 checklist sections reviewed
- [ ] No Decimal.js violations
- [ ] No unencrypted PII storage
- [ ] No hardcoded English strings
- [ ] Bundle impact acceptable
- [ ] Test coverage adequate
- [ ] Accessibility basics met

## Related Skills

- `financial-calculator` — Decimal.js patterns reference
- `e2e-encryption` — encryption requirements
- `i18n-workflow` — translation workflow
- `feature-flag-ops` — feature flag requirements
- `performance-budget` — bundle size limits
- `test-patterns` — testing requirements
