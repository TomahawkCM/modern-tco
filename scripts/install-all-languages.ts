
import fs from 'fs';
import path from 'path';

// Comprehensive list of languages/locales
const LOCALES = [
  { code: 'af-ZA', name: 'Afrikaans', currency: 'ZAR' },
  { code: 'am-ET', name: 'Amharic', currency: 'ETB' },
  { code: 'ar-AE', name: 'Arabic (UAE)', currency: 'AED', dir: 'rtl' },
  { code: 'ar-SA', name: 'Arabic (Saudi Arabia)', currency: 'SAR', dir: 'rtl' },
  { code: 'az-AZ', name: 'Azerbaijani', currency: 'AZN' },
  { code: 'be-BY', name: 'Belarusian', currency: 'BYN' },
  { code: 'bg-BG', name: 'Bulgarian', currency: 'BGN' },
  { code: 'bn-BD', name: 'Bengali (Bangladesh)', currency: 'BDT' },
  { code: 'bn-IN', name: 'Bengali (India)', currency: 'INR' },
  { code: 'bs-BA', name: 'Bosnian', currency: 'BAM' },
  { code: 'ca-ES', name: 'Catalan', currency: 'EUR' },
  { code: 'cs-CZ', name: 'Czech', currency: 'CZK' },
  { code: 'cy-GB', name: 'Welsh', currency: 'GBP' },
  { code: 'da-DK', name: 'Danish', currency: 'DKK' },
  { code: 'de-AT', name: 'German (Austria)', currency: 'EUR' },
  { code: 'de-CH', name: 'German (Switzerland)', currency: 'CHF' },
  { code: 'de-DE', name: 'German (Germany)', currency: 'EUR' },
  { code: 'el-GR', name: 'Greek', currency: 'EUR' },
  { code: 'en-AU', name: 'English (Australia)', currency: 'AUD' },
  { code: 'en-CA', name: 'English (Canada)', currency: 'CAD' },
  { code: 'en-GB', name: 'English (UK)', currency: 'GBP' },
  { code: 'en-IE', name: 'English (Ireland)', currency: 'EUR' },
  { code: 'en-IN', name: 'English (India)', currency: 'INR' },
  { code: 'en-NZ', name: 'English (New Zealand)', currency: 'NZD' },
  { code: 'en-SG', name: 'English (Singapore)', currency: 'SGD' },
  { code: 'en-US', name: 'English (US)', currency: 'USD' },
  { code: 'en-ZA', name: 'English (South Africa)', currency: 'ZAR' },
  { code: 'es-AR', name: 'Spanish (Argentina)', currency: 'ARS' },
  { code: 'es-BO', name: 'Spanish (Bolivia)', currency: 'BOB' },
  { code: 'es-CL', name: 'Spanish (Chile)', currency: 'CLP' },
  { code: 'es-CO', name: 'Spanish (Colombia)', currency: 'COP' },
  { code: 'es-CR', name: 'Spanish (Costa Rica)', currency: 'CRC' },
  { code: 'es-DO', name: 'Spanish (Dominican Republic)', currency: 'DOP' },
  { code: 'es-EC', name: 'Spanish (Ecuador)', currency: 'USD' },
  { code: 'es-ES', name: 'Spanish (Spain)', currency: 'EUR' },
  { code: 'es-GT', name: 'Spanish (Guatemala)', currency: 'GTQ' },
  { code: 'es-HN', name: 'Spanish (Honduras)', currency: 'HNL' },
  { code: 'es-MX', name: 'Spanish (Mexico)', currency: 'MXN' },
  { code: 'es-NI', name: 'Spanish (Nicaragua)', currency: 'NIO' },
  { code: 'es-PA', name: 'Spanish (Panama)', currency: 'USD' },
  { code: 'es-PE', name: 'Spanish (Peru)', currency: 'PEN' },
  { code: 'es-PR', name: 'Spanish (Puerto Rico)', currency: 'USD' },
  { code: 'es-PY', name: 'Spanish (Paraguay)', currency: 'PYG' },
  { code: 'es-SV', name: 'Spanish (El Salvador)', currency: 'USD' },
  { code: 'es-US', name: 'Spanish (US)', currency: 'USD' },
  { code: 'es-UY', name: 'Spanish (Uruguay)', currency: 'UYU' },
  { code: 'es-VE', name: 'Spanish (Venezuela)', currency: 'VES' },
  { code: 'et-EE', name: 'Estonian', currency: 'EUR' },
  { code: 'eu-ES', name: 'Basque', currency: 'EUR' },
  { code: 'fa-IR', name: 'Persian', currency: 'IRR', dir: 'rtl' },
  { code: 'fi-FI', name: 'Finnish', currency: 'EUR' },
  { code: 'fil-PH', name: 'Filipino', currency: 'PHP' },
  { code: 'fr-BE', name: 'French (Belgium)', currency: 'EUR' },
  { code: 'fr-CA', name: 'French (Canada)', currency: 'CAD' },
  { code: 'fr-CH', name: 'French (Switzerland)', currency: 'CHF' },
  { code: 'fr-FR', name: 'French (France)', currency: 'EUR' },
  { code: 'gl-ES', name: 'Galician', currency: 'EUR' },
  { code: 'gu-IN', name: 'Gujarati', currency: 'INR' },
  { code: 'he-IL', name: 'Hebrew', currency: 'ILS', dir: 'rtl' },
  { code: 'hi-IN', name: 'Hindi', currency: 'INR' },
  { code: 'hr-HR', name: 'Croatian', currency: 'EUR' },
  { code: 'hu-HU', name: 'Hungarian', currency: 'HUF' },
  { code: 'hy-AM', name: 'Armenian', currency: 'AMD' },
  { code: 'id-ID', name: 'Indonesian', currency: 'IDR' },
  { code: 'is-IS', name: 'Icelandic', currency: 'ISK' },
  { code: 'it-CH', name: 'Italian (Switzerland)', currency: 'CHF' },
  { code: 'it-IT', name: 'Italian (Italy)', currency: 'EUR' },
  { code: 'ja-JP', name: 'Japanese', currency: 'JPY' },
  { code: 'ka-GE', name: 'Georgian', currency: 'GEL' },
  { code: 'kk-KZ', name: 'Kazakh', currency: 'KZT' },
  { code: 'km-KH', name: 'Khmer', currency: 'KHR' },
  { code: 'kn-IN', name: 'Kannada', currency: 'INR' },
  { code: 'ko-KR', name: 'Korean', currency: 'KRW' },
  { code: 'ky-KG', name: 'Kyrgyz', currency: 'KGS' },
  { code: 'lo-LA', name: 'Lao', currency: 'LAK' },
  { code: 'lt-LT', name: 'Lithuanian', currency: 'EUR' },
  { code: 'lv-LV', name: 'Latvian', currency: 'EUR' },
  { code: 'mk-MK', name: 'Macedonian', currency: 'MKD' },
  { code: 'ml-IN', name: 'Malayalam', currency: 'INR' },
  { code: 'mn-MN', name: 'Mongolian', currency: 'MNT' },
  { code: 'mr-IN', name: 'Marathi', currency: 'INR' },
  { code: 'ms-MY', name: 'Malay', currency: 'MYR' },
  { code: 'my-MM', name: 'Burmese', currency: 'MMK' },
  { code: 'nb-NO', name: 'Norwegian Bokmål', currency: 'NOK' },
  { code: 'ne-NP', name: 'Nepali', currency: 'NPR' },
  { code: 'nl-BE', name: 'Dutch (Belgium)', currency: 'EUR' },
  { code: 'nl-NL', name: 'Dutch (Netherlands)', currency: 'EUR' },
  { code: 'pa-IN', name: 'Punjabi', currency: 'INR' },
  { code: 'pl-PL', name: 'Polish', currency: 'PLN' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)', currency: 'BRL' },
  { code: 'pt-PT', name: 'Portuguese (Portugal)', currency: 'EUR' },
  { code: 'ro-RO', name: 'Romanian', currency: 'RON' },
  { code: 'ru-RU', name: 'Russian', currency: 'RUB' },
  { code: 'si-LK', name: 'Sinhala', currency: 'LKR' },
  { code: 'sk-SK', name: 'Slovak', currency: 'EUR' },
  { code: 'sl-SI', name: 'Slovenian', currency: 'EUR' },
  { code: 'sq-AL', name: 'Albanian', currency: 'ALL' },
  { code: 'sr-RS', name: 'Serbian', currency: 'RSD' },
  { code: 'sv-SE', name: 'Swedish', currency: 'SEK' },
  { code: 'sw-TZ', name: 'Swahili', currency: 'TZS' },
  { code: 'ta-IN', name: 'Tamil', currency: 'INR' },
  { code: 'te-IN', name: 'Telugu', currency: 'INR' },
  { code: 'th-TH', name: 'Thai', currency: 'THB' },
  { code: 'tr-TR', name: 'Turkish', currency: 'TRY' },
  { code: 'uk-UA', name: 'Ukrainian', currency: 'UAH' },
  { code: 'ur-PK', name: 'Urdu', currency: 'PKR', dir: 'rtl' },
  { code: 'uz-UZ', name: 'Uzbek', currency: 'UZS' },
  { code: 'vi-VN', name: 'Vietnamese', currency: 'VND' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', currency: 'CNY' },
  { code: 'zh-HK', name: 'Chinese (Hong Kong)', currency: 'HKD' },
  { code: 'zh-TW', name: 'Chinese (Traditional)', currency: 'TWD' },
  { code: 'zu-ZA', name: 'Zulu', currency: 'ZAR' }
];

const CONFIG_PATH = path.join(process.cwd(), 'src/i18n/config.ts');
const MESSAGES_DIR = path.join(process.cwd(), 'src/i18n/messages');

// Generate config.ts
const generateConfig = () => {
  const supportedLocales = LOCALES.map(l => `"${l.code}"`).join(',\n  ');
  const metadata = LOCALES.map(l => `  "${l.code}": {
    label: "${l.name}",
    dir: "${l.dir || 'ltr'}" as const,
    currency: "${l.currency}",
    numberingSystem: "standard" as const,
  }`).join(',\n');

  const content = `/**
 * i18n Configuration
 *
 * Defines supported locales, default locale, and locale validation
 * Auto-generated by scripts/install-all-languages.ts
 */

export type SupportedLocale = 
  | ${LOCALES.map(l => `"${l.code}"`).join('\n  | ')};

/**
 * Supported locales
 */
export const SUPPORTED_LOCALES: SupportedLocale[] = [
  ${supportedLocales}
];

export const DEFAULT_LOCALE: SupportedLocale = "en-US";

/**
 * Locale metadata for display and formatting
 */
export const LOCALE_METADATA = {
${metadata}
} as const;

/**
 * Validate if a locale is supported
 */
export function isValidLocale(locale: string): locale is SupportedLocale {
  return SUPPORTED_LOCALES.includes(locale as SupportedLocale);
}
`;

  fs.writeFileSync(CONFIG_PATH, content);
  console.log(`Updated ${CONFIG_PATH}`);
};

// Generate message files
const generateMessageFiles = () => {
  const enPath = path.join(MESSAGES_DIR, 'en.json');
  if (!fs.existsSync(enPath)) {
    console.error('en.json not found!');
    return;
  }
  
  const enContent = fs.readFileSync(enPath, 'utf-8');

  LOCALES.forEach(locale => {
    const filePath = path.join(MESSAGES_DIR, `${locale.code}.json`);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, enContent);
      console.log(`Created ${locale.code}.json`);
    } else {
      // Optional: Merge keys if needed, but for now just skip overwriting
      console.log(`Skipped ${locale.code}.json (already exists)`);
    }
  });
};

generateConfig();
generateMessageFiles();

