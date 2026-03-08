---
name: i18n-workflow
description: Use when adding or updating translations across the 114-locale system
---

# i18n Workflow

Step-by-step process for adding or updating internationalized strings.

## Steps

### 1. Add the English key

Add the new translation key to `src/i18n/messages/en.json`. Follow dot-notation convention: `{page}.{section}.{element}`.

```json
{
  "budget": {
    "import": {
      "newKey": "English translation text"
    }
  }
}
```

### 2. Use the key in the component

```tsx
import { useTranslations } from 'next-intl';

export function MyComponent() {
  const t = useTranslations('budget.import');
  return <p>{t('newKey')}</p>;
}
```

For date/number formatting, use `useFormatter`:

```tsx
import { useFormatter } from 'next-intl';

const format = useFormatter();
format.dateTime(date, { dateStyle: 'medium' });
format.number(amount, { style: 'currency', currency: 'USD' });
```

For pluralization, use ICU message format in the JSON:

```json
{
  "items": "{count, plural, one {# item} other {# items}}"
}
```

### 3. Verify the key renders

Run the dev server and confirm the English string renders correctly. Check that:
- The key resolves (no missing-translation warnings in console)
- Formatting is correct (dates, numbers, plurals)
- The string fits the UI layout

### 4. Sync structure to all locales

Run the sync script to propagate the new key structure to all locale files (adds missing keys with English fallback values):

```bash
node scripts/sync-translations.js
```

This ensures all 114 locale files have the key (with English as placeholder).

### 5. Translate to other locales

Use the translate-locales skill to translate the new keys:

```bash
/budget:translate-locales es-ES fr-FR de-DE    # Tier 1 locales
/budget:translate-locales all                   # All locales
```

The skill handles ICU plural expansion, RTL locales, and regional variants automatically. See `.claude/Skills/translate-locales.md` for full details.

### 6. Validate translations

```bash
node scripts/validate-translations.js          # Structural completeness
npx tsx scripts/check-untranslated.ts           # Translation coverage
npx tsx scripts/check-untranslated.ts --keys es-ES  # Check specific locale
```

### 7. Backward compatibility

When renaming or restructuring keys:
- Keep the old key as a fallback until all references are updated
- Search codebase for all usages of the old key before removing it
- Never change the key hierarchy in a way that breaks existing locale files

## Complete Workflow Summary

```
en.json (add key) → sync-translations.js (propagate) → /budget:translate-locales (translate) → validate-translations.js (verify)
```

## Reference

- Locale files: `src/i18n/messages/` (114 files)
- Source of truth: `src/i18n/messages/en.json`
- i18n config: `src/i18n/`
- Library: `next-intl` ([docs](https://next-intl-docs.vercel.app/))
- Translation skill: `.claude/Skills/translate-locales.md`
- Status checker: `scripts/check-untranslated.ts`
- Structure sync: `scripts/sync-translations.js`
- Validator: `scripts/validate-translations.js`
- Related rule: `.claude/rules/i18n.md`
