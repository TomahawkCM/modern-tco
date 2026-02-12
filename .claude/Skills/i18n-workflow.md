---
name: i18n-workflow
description: Use when adding or updating translations across the 113-locale system
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

### 4. Propagate to other locales

List the locale files that need the new key. The 113 locale files live in `src/i18n/messages/`. At minimum, ensure the key exists in:
- `en.json` (English — primary, already done)
- `de.json` (German — if actively used)
- `nl.json` (Dutch — if actively used)

Other locales can use the English fallback until translated.

### 5. Backward compatibility

When renaming or restructuring keys:
- Keep the old key as a fallback until all references are updated
- Search codebase for all usages of the old key before removing it
- Never change the key hierarchy in a way that breaks existing locale files

## Reference

- Locale files: `src/i18n/messages/`
- i18n config: `src/i18n/`
- Library: `next-intl` ([docs](https://next-intl-docs.vercel.app/))
- Related rule: `.claude/rules/i18n.md`
