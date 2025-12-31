# Translation Glossaries

This directory contains terminology glossaries for the Budget App i18n system. Glossaries ensure consistent translation of key terms across all locales.

## Purpose

Glossaries provide:
- **Consistency**: Standardized translations for important terms
- **Quality**: Preferred terminology validated by native speakers
- **Alternatives**: Multiple acceptable translations for flexibility
- **Validation**: Automated quality checks in `scripts/lib/translation-quality.ts`

## Structure

Each glossary file is a JSON object mapping English terms to arrays of approved translations:

```json
{
  "dashboard": ["panel de control", "tablero"],
  "budget": ["presupuesto"],
  "transaction": ["transacción"]
}
```

- **First item**: Preferred/primary translation
- **Additional items**: Acceptable alternatives

## Available Glossaries

| Locale | Language | Coverage |
|--------|----------|----------|
| `es-MX.json` | Spanish (Mexico) | Core Budget App terms |
| `fr-FR.json` | French (France) | Core Budget App terms |
| `de-DE.json` | German (Germany) | Core Budget App terms |
| `pt-BR.json` | Portuguese (Brazil) | Core Budget App terms |
| `ja-JP.json` | Japanese (Japan) | Core Budget App terms |
| `zh-CN.json` | Chinese (Simplified) | Core Budget App terms |
| `ar-SA.json` | Arabic (Saudi Arabia) | Core Budget App terms (RTL) |
| `hi-IN.json` | Hindi (India) | Core Budget App terms |
| `ru-RU.json` | Russian (Russia) | Core Budget App terms |
| `it-IT.json` | Italian (Italy) | Core Budget App terms |

## Core Terms

All glossaries include translations for:

### Navigation
- dashboard, transactions, budgets, reports, accounts, categories, goals, import, export, settings, help, about

### Actions
- save, cancel, delete, edit, add

### UI States
- loading, recent, upcoming

### Financial Terms
- spending, balance, income, expenses, trends, bills, monthly, progress

### General
- data, welcome

## Usage in Translation Scripts

Glossaries are automatically loaded by `scripts/lib/translation-quality.ts`:

```typescript
import glossary from '@/i18n/glossaries/${locale}.json';

// Check if translation matches glossary
const approvedTranslations = glossary[englishTerm];
if (approvedTranslations && !approvedTranslations.includes(translation)) {
  console.warn(`Non-standard translation for "${englishTerm}"`);
}
```

## Adding New Glossaries

To add a glossary for a new locale:

1. Create `/src/i18n/glossaries/{locale}.json`
2. Include all core terms from existing glossaries
3. Use native speaker expertise or Claude AI translation
4. List primary translation first, alternatives after
5. Update this README with the new locale

## Updating Existing Glossaries

When adding new terms:

1. Add the term to ALL glossary files for consistency
2. Update the "Core Terms" section in this README
3. Run `npm run translate:incremental` to apply changes
4. Verify with `npm run coverage:report`

## Quality Guidelines

**Good translations:**
- Natural in target language
- Contextually appropriate for Budget App
- Consistent with existing terminology
- Region-specific when needed (e.g., es-MX vs es-ES)

**Avoid:**
- Direct word-for-word translations
- Technical jargon unless necessary
- Overly formal or informal tone
- Inconsistent terminology

## RTL Languages

RTL (right-to-left) glossaries include:
- `ar-SA.json` (Arabic)

These work with the RTL utilities in `/src/lib/rtl-utils.ts` to provide proper directionality support.

## Integration

Glossaries integrate with:
- **Translation scripts**: `scripts/translate-incremental.ts`
- **Quality validation**: `scripts/lib/translation-quality.ts`
- **Coverage reports**: `scripts/generate-coverage-report.ts`
- **AI translation**: Claude API prompts include glossary terms

## Future Enhancements

- [ ] Add glossaries for remaining 104 locales
- [ ] Create industry-specific glossaries (banking, finance)
- [ ] Add pronunciation guides for customer support
- [ ] Implement glossary validation in CI/CD
- [ ] Create glossary management UI

---

Last updated: 2025-12-30
Created as part of Task 70 (i18n automation infrastructure)
