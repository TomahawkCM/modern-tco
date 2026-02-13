---
name: localization-qa
description: Use when testing translations, RTL layouts, locale-specific formatting, or running quality checks across the 114 supported locales.
---

# Localization QA

## Overview

Quality assurance for the budget app's 114 locale support — translation completeness checking, RTL layout testing, date/number/currency formatting per locale, zero-decimal currency handling, and screenshot comparison across locales.

## When to Use

- After adding new translation keys
- Testing RTL layouts (Arabic, Hebrew, Farsi, Urdu)
- Verifying currency/date/number formatting per locale
- Running locale coverage reports
- Testing zero-decimal currencies (JPY, KRW, etc.)
- Visual regression testing across locales

## Core Principles

- **Completeness first** — Every key must exist in every locale (fallback to English is a bug)
- **RTL is not just text direction** — Layout, icons, charts all need RTL consideration
- **Format, don't hardcode** — Use `Intl` APIs for all locale-sensitive formatting
- **Test representative locales** — Can't test all 114; pick representatives per category
- **Zero-decimal currencies** — JPY ¥1000 not ¥1000.00

## Workflow

### Step 1: Translation Completeness Check

```bash
# Script to check all locales have all keys
node -e "
const fs = require('fs');
const path = require('path');
const messagesDir = 'src/i18n/messages';
const baseKeys = Object.keys(flattenJSON(JSON.parse(fs.readFileSync(path.join(messagesDir, 'en.json')))));
const files = fs.readdirSync(messagesDir).filter(f => f.endsWith('.json'));

for (const file of files) {
  const locale = file.replace('.json', '');
  const keys = Object.keys(flattenJSON(JSON.parse(fs.readFileSync(path.join(messagesDir, file)))));
  const missing = baseKeys.filter(k => !keys.includes(k));
  if (missing.length > 0) {
    console.log(\`\${locale}: \${missing.length} missing keys\`);
    missing.slice(0, 5).forEach(k => console.log(\`  - \${k}\`));
  }
}

function flattenJSON(obj, prefix = '') {
  return Object.entries(obj).reduce((acc, [key, val]) => {
    const newKey = prefix ? \`\${prefix}.\${key}\` : key;
    if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
      Object.assign(acc, flattenJSON(val, newKey));
    } else {
      acc[newKey] = val;
    }
    return acc;
  }, {});
}
"
```

### Step 2: Representative Locale Test Matrix

| Category | Locales | What to Test |
|----------|---------|-------------|
| LTR Latin | en, de, fr, es, pt | Standard layout, special chars (ü, ñ, ç) |
| RTL | ar, he, fa, ur | Layout mirroring, text alignment, icon direction |
| CJK | zh, ja, ko | Character rendering, text wrapping, font fallback |
| Long strings | de, fi, el | German compounds, Finnish words, layout overflow |
| Zero-decimal | ja (JPY), ko (KRW) | No decimal places in currency |
| Non-Latin scripts | th, hi, bn, ka | Script rendering, line height, font support |
| Compact | zh, ja | Shorter strings, check spacing isn't too loose |

### Step 3: RTL Layout Testing

```tsx
// Force RTL for testing
<html dir="rtl" lang="ar">

// Components needing RTL awareness:
// ✓ Flex direction (row → row-reverse for RTL)
// ✓ Margin/padding (left/right swap)
// ✓ Icons with directional meaning (arrows, back buttons)
// ✓ Charts (axis direction)
// ✓ Progress bars (fill direction)
// ✓ Swipe gestures (direction swap)

// Use logical properties (auto-RTL)
// GOOD: ml-4 → ms-4 (margin-inline-start)
// GOOD: pl-4 → ps-4 (padding-inline-start)
// GOOD: text-left → text-start

// Tailwind logical property classes:
// ms-4 (margin-start), me-4 (margin-end)
// ps-4 (padding-start), pe-4 (padding-end)
// start-0 (inset-inline-start), end-0 (inset-inline-end)
```

### Step 4: Currency Formatting Tests

```ts
// Test currency formatting across locales
const testCases = [
  { amount: '1234.56', currency: 'USD', locale: 'en-US', expected: '$1,234.56' },
  { amount: '1234.56', currency: 'EUR', locale: 'de-DE', expected: '1.234,56 €' },
  { amount: '1234.56', currency: 'EUR', locale: 'fr-FR', expected: '1 234,56 €' },
  { amount: '1234', currency: 'JPY', locale: 'ja-JP', expected: '￥1,234' },
  { amount: '1234', currency: 'KRW', locale: 'ko-KR', expected: '₩1,234' },
  { amount: '1234.56', currency: 'GBP', locale: 'en-GB', expected: '£1,234.56' },
  { amount: '1234.56', currency: 'CHF', locale: 'de-CH', expected: 'CHF 1'234.56' },
  { amount: '1234.56', currency: 'INR', locale: 'en-IN', expected: '₹1,234.56' },
  { amount: '1234.56', currency: 'BRL', locale: 'pt-BR', expected: 'R$ 1.234,56' },
];
```

### Step 5: Date Format Verification

```ts
// Date formats vary significantly by locale
const dateTests = [
  { date: '2025-03-15', locale: 'en-US', expected: '3/15/2025' },     // M/D/Y
  { date: '2025-03-15', locale: 'en-GB', expected: '15/03/2025' },    // D/M/Y
  { date: '2025-03-15', locale: 'de-DE', expected: '15.03.2025' },    // D.M.Y
  { date: '2025-03-15', locale: 'ja-JP', expected: '2025/03/15' },    // Y/M/D
  { date: '2025-03-15', locale: 'ko-KR', expected: '2025. 3. 15.' }, // Y. M. D.
  { date: '2025-03-15', locale: 'zh-CN', expected: '2025/3/15' },     // Y/M/D
];
```

### Step 6: Pluralization Rules

```ts
// Different languages have different plural rules
// English: one, other
// Arabic: zero, one, two, few, many, other
// Polish: one, few, many, other
// Japanese: other (no plural forms)

// Test plural forms
const pluralTests = [
  { key: 'transactions.count', count: 0, locale: 'en', expected: '0 transactions' },
  { key: 'transactions.count', count: 1, locale: 'en', expected: '1 transaction' },
  { key: 'transactions.count', count: 5, locale: 'en', expected: '5 transactions' },
  // Arabic has 6 plural forms
  { key: 'transactions.count', count: 0, locale: 'ar', expected: '٠ معاملات' },
  { key: 'transactions.count', count: 1, locale: 'ar', expected: 'معاملة واحدة' },
  { key: 'transactions.count', count: 2, locale: 'ar', expected: 'معاملتان' },
];
```

## Key Files

| File | Role |
|------|------|
| `src/i18n/messages/` | 113 locale message files |
| `src/i18n/messages/en.json` | Base locale (source of truth for keys) |
| `src/app/globals.css` | RTL styles |
| `src/lib/parsers/intl-amount-parser.ts` | Locale-aware amount parsing |
| `src/lib/parsers/intl-date-parser.ts` | Locale-aware date parsing |

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Not checking all locales for missing keys | Run completeness script after adding keys |
| Using `ml-4`/`mr-4` instead of logical properties | Use `ms-4`/`me-4` for RTL compatibility |
| Formatting JPY as ¥1,000.00 | Zero-decimal currencies: no decimal places |
| Assuming all locales use comma for thousands | Use `Intl.NumberFormat` always |
| Testing only English | Test at least one locale from each category |
| Hardcoding date format | Always use `Intl.DateTimeFormat` |

## Validation Checklist

- [ ] No missing translation keys in any locale
- [ ] RTL layout correct for Arabic, Hebrew, Farsi, Urdu
- [ ] Zero-decimal currencies display correctly (JPY, KRW)
- [ ] Date formats correct per locale
- [ ] Currency formats correct per locale (position, separator)
- [ ] Pluralization rules correct for tested locales
- [ ] No text overflow from long German/Finnish translations
- [ ] CJK characters render correctly with proper fonts

## Related Skills

- `i18n-workflow` — adding new translations
- `design-tokens` — typography and spacing for different scripts
- `accessibility-audit` — screen reader language support
- `test-patterns` — i18n test helpers
