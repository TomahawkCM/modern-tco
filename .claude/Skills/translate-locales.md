---
name: translate-locales
description: Use when translating locale files for the budget app. Guides Claude through reading en.json, identifying untranslated keys, and writing translations directly — no external API needed.
---

# Translate Locales

## Overview

Translate the budget app's locale files by reading `en.json` as the source of truth and writing translated values directly into target locale files. Claude performs translations inline — no OpenAI API or external pipeline required.

## Invocation

```
/budget:translate-locales es-ES           # Single locale
/budget:translate-locales es-ES fr-FR     # Multiple locales
/budget:translate-locales all             # All 113+ locales
/budget:translate-locales es-ES --force   # Retranslate already-translated keys
```

## Workflow

### Step 1: Read Source

Read the English source file:
```
src/i18n/messages/en.json
```

Note the total key count and namespace structure. The file has ~88 namespaces (top-level keys like `nav`, `budget`, `dashboard`, `transactions`, etc.).

### Step 2: Read Target Locale

Read the target locale file:
```
src/i18n/messages/{locale}.json
```

### Step 3: Identify Work

Compare values between English and target:
- A key is **untranslated** if its value exactly matches the English value
- A key is **missing** if it doesn't exist in the target file
- Use `--force` to retranslate all keys regardless

Run the status checker first to understand scope:
```bash
npx tsx scripts/check-untranslated.ts {locale}
```

### Step 4: Check Regional Base

If the target locale is a regional variant, check its base first:

| Variant | Base | Adapt From |
|---------|------|------------|
| es-MX, es-AR, es-CL, es-CO, es-CR, es-DO, es-EC, es-GT, es-HN, es-NI, es-PA, es-PE, es-PR, es-PY, es-SV, es-US, es-UY, es-VE | es-ES | Vocabulary, idioms |
| fr-CA, fr-BE, fr-CH | fr-FR | Vocabulary, spelling |
| de-AT, de-CH | de-DE | Vocabulary |
| pt-PT | pt-BR | Spelling, vocabulary |
| zh-TW, zh-HK | zh-CN | Traditional characters, terms |
| en-GB, en-AU, en-CA, en-IE, en-IN, en-NZ, en-SG, en-ZA | en-US | Spelling (color→colour, etc.) |

**Translate the base locale first if it's not already translated.** Then adapt the variant from the base.

### Step 5: Translate in Batches

Process by namespace (top-level JSON key), max ~200-300 keys per batch. For large namespaces, subdivide further.

**Approach:**
1. Read a namespace from en.json
2. Translate all untranslated keys for that namespace
3. Write the updated locale file
4. Move to next namespace

### Step 6: Write Result

Write the complete updated locale file using the Write tool. Ensure:
- JSON is valid and properly formatted
- Key structure matches en.json exactly
- No keys are missing or added

### Step 7: Validate

```bash
node scripts/validate-translations.js --locales {locale}
npx tsx scripts/check-untranslated.ts {locale}
```

Verify:
- JSON is valid
- Key count matches en.json
- Coverage improved as expected

## Translation Rules

### General
- **Never translate JSON keys** — only translate string values
- **Preserve interpolation variables exactly**: `{name}`, `{amount}`, `{count}`, `{date}`, etc.
- **Preserve HTML entities and markup** in values (e.g., `<strong>`, `&nbsp;`)
- Use natural, native phrasing — avoid literal word-for-word translation
- Match formality level to locale conventions (e.g., formal "Sie" for de-DE, "tu" for es-MX)

### ICU Plural Forms

Expand or contract plural categories per target language following CLDR plural rules:

| Languages | Plural Categories |
|-----------|-------------------|
| English, French, German, Portuguese, Spanish, Italian, Dutch, Swedish, Norwegian, Danish | `one`, `other` |
| Arabic | `zero`, `one`, `two`, `few`, `many`, `other` |
| Polish, Russian, Ukrainian, Croatian, Serbian, Bosnian | `one`, `few`, `many`, `other` |
| Czech, Slovak | `one`, `few`, `many`, `other` |
| Chinese, Japanese, Korean, Vietnamese, Thai, Turkish, Indonesian, Malay | `other` only |
| Romanian | `one`, `few`, `other` |
| Lithuanian | `one`, `few`, `many`, `other` |
| Latvian | `zero`, `one`, `other` |
| Slovenian | `one`, `two`, `few`, `other` |
| Irish | `one`, `two`, `few`, `many`, `other` |
| Welsh | `zero`, `one`, `two`, `few`, `many`, `other` |

**Example — English to Arabic:**
```json
// English (one, other)
"{count, plural, one {# transaction} other {# transactions}}"

// Arabic (zero, one, two, few, many, other)
"{count, plural, zero {لا معاملات} one {معاملة واحدة} two {معاملتان} few {# معاملات} many {# معاملة} other {# معاملة}}"
```

**Example — English to Japanese:**
```json
// English (one, other)
"{count, plural, one {# transaction} other {# transactions}}"

// Japanese (other only)
"{count, plural, other {#件の取引}}"
```

### RTL Locales

RTL locales: `ar-AE`, `ar-SA`, `fa-IR`, `he-IL`, `ur-PK`

- Use native script (Arabic, Hebrew, Persian, Urdu)
- Respect RTL text direction
- Do NOT add Unicode directional marks unless the string mixes LTR/RTL content
- Preserve interpolation variable positions appropriate for RTL reading order

### Regional Variants

When adapting from a base translation:
- **es-MX/AR/CL/CO etc. from es-ES**: Use local vocabulary (e.g., "computadora" not "ordenador"), adjust voseo/tuteo as appropriate
- **fr-CA from fr-FR**: Use Quebec French terms (e.g., "courriel" not "e-mail"), different number formatting
- **de-AT/CH from de-DE**: Local vocabulary (e.g., "Jänner" not "Januar" for de-AT)
- **pt-PT from pt-BR**: European Portuguese spelling, vocabulary differences
- **zh-TW/HK from zh-CN**: Convert to Traditional characters, adapt terms
- **English variants**: Primarily spelling changes — color→colour, center→centre, analyze→analyse, etc.

## Priority Order

When translating multiple locales, follow this priority:

### Tier 1 (Core markets)
`es-ES`, `es-MX`, `fr-FR`, `fr-CA`, `de-DE`, `pt-BR`, `ja-JP`, `ko-KR`, `zh-CN`, `hi-IN`

### Tier 2 (Regional variants from Tier 1 bases)
Adapt from the Tier 1 base: `es-AR`, `es-CO`, `fr-BE`, `de-AT`, `pt-PT`, `zh-TW`, `zh-HK`, `en-GB`, `en-AU`, `en-CA`, etc.

### Tier 3 (All remaining)
All other locales alphabetically.

## Key Files

| File | Role |
|------|------|
| `src/i18n/messages/en.json` | Source of truth (all keys) |
| `src/i18n/messages/{locale}.json` | Target locale files |
| `scripts/check-untranslated.ts` | Translation coverage checker |
| `scripts/validate-translations.js` | Structural validation |
| `scripts/sync-translations.js` | Sync en.json structure to all locales |
| `scripts/sync-missing-keys.js` | Add missing keys with English fallback |

## Related Skills

- `i18n-workflow` — Adding new translation keys to the codebase
- `localization-qa` — QA testing for translations, RTL, formatting
