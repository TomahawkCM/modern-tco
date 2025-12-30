/**
 * Prompt Builder for Translation Automation
 *
 * Generates Claude API prompts for:
 * 1. Base language translations (full context)
 * 2. Regional variant adaptations (lighter prompts)
 */

import { LOCALE_METADATA, type SupportedLocale } from '../../src/i18n/config';

interface LocaleInfo {
  locale: SupportedLocale;
  label: string;
  currency: string;
  dir: 'ltr' | 'rtl';
}

/**
 * Build comprehensive translation prompt for base languages
 */
export function buildBaseTranslationPrompt(
  locale: SupportedLocale,
  sourceJson: object
): string {
  const metadata = LOCALE_METADATA[locale];
  if (!metadata) {
    throw new Error(`No metadata found for locale: ${locale}`);
  }

  const localeInfo: LocaleInfo = {
    locale,
    label: metadata.label,
    currency: metadata.currency,
    dir: metadata.dir,
  };

  const isRTL = metadata.dir === 'rtl';
  const rtlInstructions = isRTL
    ? '\n6. For RTL languages: Only translate text values, keep JSON structure LTR'
    : '';

  return `You are a professional translator specializing in software UI localization for financial applications.

Task: Translate this budget/finance management app interface from English to ${localeInfo.label} (${localeInfo.locale}).

Context:
- Application: Personal budget management tool
- Text Type: UI labels, buttons, navigation menu items, widget titles/descriptions
- Target Audience: General consumers managing personal finances
- Tone: Professional but friendly and approachable
- Currency Standard: ${localeInfo.currency}
- Text Direction: ${localeInfo.dir.toUpperCase()}

Translation Requirements:
1. Translate ALL text values to natural, idiomatic ${localeInfo.label}
2. Preserve the EXACT JSON structure - all keys must remain in English
3. Keep translations concise and suitable for UI display (short labels/buttons)
4. Use standard financial terminology for your locale
5. Maintain consistent terminology throughout${rtlInstructions}

Source JSON (English):
${JSON.stringify(sourceJson, null, 2)}

Instructions:
- Return ONLY the translated JSON object
- No explanations, comments, or additional text
- Ensure valid JSON format
- All keys stay in English, only values are translated

Translated JSON:`;
}

/**
 * Build lighter adaptation prompt for regional variants
 */
export function buildAdaptationPrompt(
  locale: SupportedLocale,
  baseLocale: SupportedLocale,
  baseTranslation: object
): string {
  const metadata = LOCALE_METADATA[locale];
  const baseMetadata = LOCALE_METADATA[baseLocale];

  if (!metadata || !baseMetadata) {
    throw new Error(`Missing metadata for ${locale} or ${baseLocale}`);
  }

  const regionalContext = getRegionalContext(locale, baseLocale);

  return `You are a professional translator specializing in regional dialect adaptation.

Task: Adapt this ${baseMetadata.label} translation for ${metadata.label} (${locale}).

Base Translation (${baseLocale}):
${JSON.stringify(baseTranslation, null, 2)}

Adaptation Requirements:
1. Adjust vocabulary and terminology for ${metadata.label} regional usage
2. Adapt currency and financial terminology (currency: ${metadata.currency})
3. Use regional spelling and grammar conventions
4. Maintain the EXACT JSON structure (keys stay in English)
5. Keep translations concise for UI display

Regional Context:
${regionalContext}

Instructions:
- Return ONLY the adapted JSON object
- No explanations or additional text
- Ensure valid JSON format
- Focus on regional differences in vocabulary and terminology

Adapted JSON:`;
}

/**
 * Get regional context and examples for specific locale adaptations
 */
function getRegionalContext(locale: SupportedLocale, baseLocale: SupportedLocale): string {
  // Spanish variants
  if (locale.startsWith('es-')) {
    const region = locale.split('-')[1];
    const contexts: Record<string, string> = {
      'MX': '- Use Mexican Spanish (e.g., "computadora" not "ordenador")\n- Informal "tú" is acceptable\n- Currency references should feel natural for Mexico',
      'AR': '- Use Argentine Spanish (e.g., "computadora", "vos" forms)\n- Lunfardo is acceptable for informal terms\n- Currency: Argentine peso (ARS)',
      'CL': '- Use Chilean Spanish vocabulary\n- "Tú" form is standard\n- Currency: Chilean peso (CLP)',
      'CO': '- Use Colombian Spanish (e.g., "computador")\n- Formal "usted" for professional tone\n- Currency: Colombian peso (COP)',
    };
    return contexts[region] || `- Adapt for ${LOCALE_METADATA[locale].label} regional usage`;
  }

  // Portuguese variants
  if (locale.startsWith('pt-')) {
    if (locale === 'pt-BR') {
      return '- Use Brazilian Portuguese (e.g., "tela" not "ecrã")\n- Brazilian spelling and grammar\n- Currency: Brazilian real (BRL)';
    }
    if (locale === 'pt-PT') {
      return '- Use European Portuguese spelling\n- More formal register\n- Currency: Euro (EUR)';
    }
  }

  // French variants
  if (locale.startsWith('fr-')) {
    const region = locale.split('-')[1];
    const contexts: Record<string, string> = {
      'CA': '- Use Canadian French (Québécois)\n- Some anglicisms are acceptable\n- Currency: Canadian dollar (CAD)',
      'CH': '- Use Swiss French\n- More formal than French French\n- Currency: Swiss franc (CHF)',
      'BE': '- Use Belgian French\n- Septante/nonante number system\n- Currency: Euro (EUR)',
    };
    return contexts[region] || `- Adapt for ${LOCALE_METADATA[locale].label}`;
  }

  // German variants
  if (locale.startsWith('de-')) {
    const region = locale.split('-')[1];
    const contexts: Record<string, string> = {
      'AT': '- Use Austrian German vocabulary\n- Austrian spellings where applicable\n- Currency: Euro (EUR)',
      'CH': '- Use Swiss German (High German) vocabulary\n- Avoid ß, use ss\n- Currency: Swiss franc (CHF)',
    };
    return contexts[region] || `- Adapt for ${LOCALE_METADATA[locale].label}`;
  }

  // Chinese variants
  if (locale.startsWith('zh-')) {
    if (locale === 'zh-CN') {
      return '- Use Simplified Chinese characters\n- Mainland China terminology\n- Currency: Yuan (CNY)';
    }
    if (locale === 'zh-TW') {
      return '- Use Traditional Chinese characters\n- Taiwan terminology\n- Currency: New Taiwan dollar (TWD)';
    }
    if (locale === 'zh-HK') {
      return '- Use Traditional Chinese characters\n- Hong Kong Cantonese-influenced terminology\n- Currency: Hong Kong dollar (HKD)';
    }
  }

  // English variants
  if (locale.startsWith('en-')) {
    const region = locale.split('-')[1];
    const contexts: Record<string, string> = {
      'GB': '- Use British English spelling (colour, centre, etc.)\n- British terminology\n- Currency: Pound sterling (GBP)',
      'AU': '- Use Australian English spelling\n- Australian terminology\n- Currency: Australian dollar (AUD)',
      'CA': '- Use Canadian English (mix of US/UK spelling)\n- Canadian terminology\n- Currency: Canadian dollar (CAD)',
    };
    return contexts[region] || `- Use ${LOCALE_METADATA[locale].label} conventions`;
  }

  // Default context
  return `- Adapt for ${LOCALE_METADATA[locale].label} regional conventions\n- Use appropriate local terminology\n- Currency: ${LOCALE_METADATA[locale].currency}`;
}

/**
 * Determine if a locale should use base translation or adaptation
 */
export function shouldUseBaseTranslation(locale: SupportedLocale): boolean {
  // English variants always copy en.json
  if (locale.startsWith('en-')) {
    return false; // Will be handled separately
  }

  // Base languages (one per language family)
  const baseLanguages = [
    'af-ZA', 'am-ET', 'ar-SA', 'az-AZ', 'be-BY', 'bg-BG', 'bn-IN', 'bs-BA',
    'ca-ES', 'cs-CZ', 'cy-GB', 'da-DK', 'de-DE', 'el-GR', 'es-ES', 'et-EE',
    'eu-ES', 'fa-IR', 'fi-FI', 'fil-PH', 'fr-FR', 'gl-ES', 'gu-IN', 'he-IL',
    'hi-IN', 'hr-HR', 'hu-HU', 'hy-AM', 'id-ID', 'is-IS', 'it-IT', 'ja-JP',
    'ka-GE', 'kk-KZ', 'km-KH', 'kn-IN', 'ko-KR', 'ky-KG', 'lo-LA', 'lt-LT',
    'lv-LV', 'mk-MK', 'ml-IN', 'mn-MN', 'mr-IN', 'ms-MY', 'my-MM', 'nb-NO',
    'ne-NP', 'nl-NL', 'pa-IN', 'pl-PL', 'pt-PT', 'ro-RO', 'ru-RU', 'si-LK',
    'sk-SK', 'sl-SI', 'sq-AL', 'sr-RS', 'sv-SE', 'sw-TZ', 'ta-IN', 'te-IN',
    'th-TH', 'tr-TR', 'uk-UA', 'ur-PK', 'uz-UZ', 'vi-VN', 'zh-CN', 'zu-ZA'
  ];

  return baseLanguages.includes(locale);
}

/**
 * Get the base locale for a regional variant
 */
export function getBaseLocale(locale: SupportedLocale): SupportedLocale | null {
  if (shouldUseBaseTranslation(locale)) {
    return null; // This is already a base locale
  }

  const lang = locale.split('-')[0];

  // Language family base mappings
  const baseMapping: Record<string, SupportedLocale> = {
    'es': 'es-ES',  // Spanish variants -> Spain
    'fr': 'fr-FR',  // French variants -> France
    'de': 'de-DE',  // German variants -> Germany
    'pt': 'pt-PT',  // Portuguese variants -> Portugal
    'zh': 'zh-CN',  // Chinese variants -> Simplified
    'ar': 'ar-SA',  // Arabic variants -> Saudi Arabia
    'nl': 'nl-NL',  // Dutch variants -> Netherlands
    'en': 'en',     // English (will be handled separately)
    'it': 'it-IT',  // Italian variants -> Italy
    'bn': 'bn-IN',  // Bengali variants -> India
  };

  return baseMapping[lang] || null;
}
