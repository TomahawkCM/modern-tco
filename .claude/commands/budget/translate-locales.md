---
name: translate-locales
description: Translate budget app locale files. Args - locale(s) to translate (e.g., es-ES, "es-ES fr-FR", or "all"). Optional --force flag to retranslate.
---

# Translate Locales

Use the `translate-locales` skill from `.claude/Skills/translate-locales.md`.

**Arguments:** `$ARGUMENTS`

Follow the skill workflow exactly:
1. Read `src/i18n/messages/en.json` as source
2. Read target locale file(s)
3. Check translation status with `npx tsx scripts/check-untranslated.ts {locale}`
4. For regional variants, translate base locale first if needed
5. Translate by namespace, max 200-300 keys per batch
6. Write updated locale file
7. Validate with `node scripts/validate-translations.js` and `npx tsx scripts/check-untranslated.ts {locale}`

Refer to the full skill for translation rules (ICU plurals, RTL, regional variants, priority tiers).
