/**
 * Tesseract Language Map
 * Maps app locale codes (BCP 47) to Tesseract.js language codes.
 * Covers all 113 supported app locales.
 */

const LOCALE_TO_TESSERACT: Record<string, string> = {
  // Arabic
  'ar': 'ara',
  'ar-SA': 'ara',
  'ar-EG': 'ara',
  'ar-AE': 'ara',
  'ar-MA': 'ara',

  // Bengali
  'bn': 'ben',
  'bn-BD': 'ben',
  'bn-IN': 'ben',

  // Bulgarian
  'bg': 'bul',
  'bg-BG': 'bul',

  // Catalan
  'ca': 'cat',
  'ca-ES': 'cat',

  // Chinese
  'zh': 'chi_sim',
  'zh-CN': 'chi_sim',
  'zh-Hans': 'chi_sim',
  'zh-TW': 'chi_tra',
  'zh-Hant': 'chi_tra',
  'zh-HK': 'chi_tra',

  // Croatian
  'hr': 'hrv',
  'hr-HR': 'hrv',

  // Czech
  'cs': 'ces',
  'cs-CZ': 'ces',

  // Danish
  'da': 'dan',
  'da-DK': 'dan',

  // Dutch
  'nl': 'nld',
  'nl-NL': 'nld',
  'nl-BE': 'nld',

  // English
  'en': 'eng',
  'en-US': 'eng',
  'en-GB': 'eng',
  'en-CA': 'eng',
  'en-AU': 'eng',
  'en-NZ': 'eng',
  'en-IE': 'eng',
  'en-ZA': 'eng',
  'en-IN': 'eng',
  'en-SG': 'eng',

  // Estonian
  'et': 'est',
  'et-EE': 'est',

  // Filipino / Tagalog
  'fil': 'tgl',
  'tl': 'tgl',

  // Finnish
  'fi': 'fin',
  'fi-FI': 'fin',

  // French
  'fr': 'fra',
  'fr-FR': 'fra',
  'fr-CA': 'fra',
  'fr-BE': 'fra',
  'fr-CH': 'fra',

  // German
  'de': 'deu',
  'de-DE': 'deu',
  'de-AT': 'deu',
  'de-CH': 'deu',

  // Greek
  'el': 'ell',
  'el-GR': 'ell',

  // Gujarati
  'gu': 'guj',
  'gu-IN': 'guj',

  // Hebrew
  'he': 'heb',
  'he-IL': 'heb',

  // Hindi
  'hi': 'hin',
  'hi-IN': 'hin',

  // Hungarian
  'hu': 'hun',
  'hu-HU': 'hun',

  // Icelandic
  'is': 'isl',
  'is-IS': 'isl',

  // Indonesian
  'id': 'ind',
  'id-ID': 'ind',

  // Italian
  'it': 'ita',
  'it-IT': 'ita',
  'it-CH': 'ita',

  // Japanese
  'ja': 'jpn',
  'ja-JP': 'jpn',

  // Kannada
  'kn': 'kan',
  'kn-IN': 'kan',

  // Kazakh
  'kk': 'kaz',
  'kk-KZ': 'kaz',

  // Korean
  'ko': 'kor',
  'ko-KR': 'kor',

  // Latvian
  'lv': 'lav',
  'lv-LV': 'lav',

  // Lithuanian
  'lt': 'lit',
  'lt-LT': 'lit',

  // Malay
  'ms': 'msa',
  'ms-MY': 'msa',

  // Malayalam
  'ml': 'mal',
  'ml-IN': 'mal',

  // Marathi
  'mr': 'mar',
  'mr-IN': 'mar',

  // Norwegian
  'nb': 'nor',
  'nb-NO': 'nor',
  'nn': 'nor',
  'nn-NO': 'nor',
  'no': 'nor',

  // Persian / Farsi
  'fa': 'fas',
  'fa-IR': 'fas',

  // Polish
  'pl': 'pol',
  'pl-PL': 'pol',

  // Portuguese
  'pt': 'por',
  'pt-BR': 'por',
  'pt-PT': 'por',

  // Punjabi
  'pa': 'pan',
  'pa-IN': 'pan',

  // Romanian
  'ro': 'ron',
  'ro-RO': 'ron',

  // Russian
  'ru': 'rus',
  'ru-RU': 'rus',

  // Serbian
  'sr': 'srp',
  'sr-RS': 'srp',
  'sr-Latn': 'srp',
  'sr-Cyrl': 'srp',

  // Slovak
  'sk': 'slk',
  'sk-SK': 'slk',

  // Slovenian
  'sl': 'slv',
  'sl-SI': 'slv',

  // Spanish
  'es': 'spa',
  'es-ES': 'spa',
  'es-MX': 'spa',
  'es-AR': 'spa',
  'es-CO': 'spa',
  'es-CL': 'spa',
  'es-PE': 'spa',

  // Swahili
  'sw': 'swa',
  'sw-KE': 'swa',

  // Swedish
  'sv': 'swe',
  'sv-SE': 'swe',

  // Tamil
  'ta': 'tam',
  'ta-IN': 'tam',

  // Telugu
  'te': 'tel',
  'te-IN': 'tel',

  // Thai
  'th': 'tha',
  'th-TH': 'tha',

  // Turkish
  'tr': 'tur',
  'tr-TR': 'tur',

  // Ukrainian
  'uk': 'ukr',
  'uk-UA': 'ukr',

  // Urdu
  'ur': 'urd',
  'ur-PK': 'urd',

  // Uzbek
  'uz': 'uzb',
  'uz-UZ': 'uzb',

  // Vietnamese
  'vi': 'vie',
  'vi-VN': 'vie',

  // Welsh
  'cy': 'cym',
  'cy-GB': 'cym',

  // Afrikaans
  'af': 'afr',
  'af-ZA': 'afr',

  // Albanian
  'sq': 'sqi',
  'sq-AL': 'sqi',

  // Amharic
  'am': 'amh',
  'am-ET': 'amh',

  // Armenian
  'hy': 'hye',
  'hy-AM': 'hye',

  // Azerbaijani
  'az': 'aze',
  'az-AZ': 'aze',

  // Basque
  'eu': 'eus',
  'eu-ES': 'eus',

  // Bosnian
  'bs': 'bos',
  'bs-BA': 'bos',

  // Georgian
  'ka': 'kat',
  'ka-GE': 'kat',

  // Khmer
  'km': 'khm',
  'km-KH': 'khm',

  // Lao
  'lo': 'lao',
  'lo-LA': 'lao',

  // Macedonian
  'mk': 'mkd',
  'mk-MK': 'mkd',

  // Mongolian
  'mn': 'mon',
  'mn-MN': 'mon',

  // Myanmar (Burmese)
  'my': 'mya',
  'my-MM': 'mya',

  // Nepali
  'ne': 'nep',
  'ne-NP': 'nep',

  // Sinhala
  'si': 'sin',
  'si-LK': 'sin',

  // Galician
  'gl': 'glg',
  'gl-ES': 'glg',
};

/**
 * Get the Tesseract language code for a given app locale.
 * Falls back to English if the locale is not mapped.
 *
 * @param appLocale - BCP 47 locale code (e.g., 'de-DE', 'ja', 'pt-BR')
 * @returns Tesseract language code (e.g., 'deu', 'jpn', 'por')
 */
export function getOCRLanguage(appLocale: string): string {
  // Try exact match first
  if (LOCALE_TO_TESSERACT[appLocale]) {
    return LOCALE_TO_TESSERACT[appLocale];
  }

  // Try base language (e.g., 'de' from 'de-DE')
  const baseLang = appLocale.split('-')[0];
  if (LOCALE_TO_TESSERACT[baseLang]) {
    return LOCALE_TO_TESSERACT[baseLang];
  }

  // Default to English
  return 'eng';
}

/**
 * Get all supported OCR languages.
 * Returns unique Tesseract codes with their display names.
 */
export function getSupportedOCRLanguages(): Array<{ code: string; name: string }> {
  const LANGUAGE_NAMES: Record<string, string> = {
    afr: 'Afrikaans',
    amh: 'Amharic',
    ara: 'Arabic',
    aze: 'Azerbaijani',
    ben: 'Bengali',
    bos: 'Bosnian',
    bul: 'Bulgarian',
    cat: 'Catalan',
    ces: 'Czech',
    chi_sim: 'Chinese (Simplified)',
    chi_tra: 'Chinese (Traditional)',
    cym: 'Welsh',
    dan: 'Danish',
    deu: 'German',
    ell: 'Greek',
    eng: 'English',
    est: 'Estonian',
    eus: 'Basque',
    fas: 'Persian',
    fin: 'Finnish',
    fra: 'French',
    glg: 'Galician',
    guj: 'Gujarati',
    heb: 'Hebrew',
    hin: 'Hindi',
    hrv: 'Croatian',
    hun: 'Hungarian',
    hye: 'Armenian',
    ind: 'Indonesian',
    isl: 'Icelandic',
    ita: 'Italian',
    jpn: 'Japanese',
    kan: 'Kannada',
    kat: 'Georgian',
    kaz: 'Kazakh',
    khm: 'Khmer',
    kor: 'Korean',
    lao: 'Lao',
    lav: 'Latvian',
    lit: 'Lithuanian',
    mal: 'Malayalam',
    mar: 'Marathi',
    mkd: 'Macedonian',
    mon: 'Mongolian',
    msa: 'Malay',
    mya: 'Myanmar',
    nep: 'Nepali',
    nld: 'Dutch',
    nor: 'Norwegian',
    pan: 'Punjabi',
    pol: 'Polish',
    por: 'Portuguese',
    ron: 'Romanian',
    rus: 'Russian',
    sin: 'Sinhala',
    slk: 'Slovak',
    slv: 'Slovenian',
    spa: 'Spanish',
    sqi: 'Albanian',
    srp: 'Serbian',
    swa: 'Swahili',
    swe: 'Swedish',
    tam: 'Tamil',
    tel: 'Telugu',
    tgl: 'Filipino',
    tha: 'Thai',
    tur: 'Turkish',
    ukr: 'Ukrainian',
    urd: 'Urdu',
    uzb: 'Uzbek',
    vie: 'Vietnamese',
  };

  return Object.entries(LANGUAGE_NAMES)
    .map(([code, name]) => ({ code, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
