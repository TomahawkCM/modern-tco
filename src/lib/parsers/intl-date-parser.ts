/**
 * International Date Parser
 * Handles date parsing across all languages and formats.
 * Uses a fallback chain: locale-specific → chrono-node → numeric patterns → Date constructor
 */

import * as chrono from 'chrono-node';

/**
 * Parse a date string that may be in any language or format.
 *
 * Supported formats:
 * - Numeric: 15/01/2025, 2025-01-15, 01.15.2025
 * - English: Jan 15, 2025 / 15 January 2025
 * - Spanish: 15 Ene 2025 / 15 de enero de 2025
 * - French: 15 Fév 2025 / 15 février 2025
 * - German: 15. Jan. 2025 / 15. Januar 2025
 * - Japanese: 2025年1月15日
 * - Chinese: 2025年1月15日
 * - Korean: 2025년 1월 15일
 * - Arabic: ١٥/٠١/٢٠٢٥
 * - And many more via chrono-node
 *
 * @param str - Date string in any format
 * @param locale - Optional BCP 47 locale hint
 * @returns Parsed Date or null
 */
export function parseDate(str: string, locale?: string): Date | null {
  if (!str || typeof str !== 'string') return null;

  const cleaned = str.trim();
  if (cleaned.length === 0) return null;

  // Step 1: Try locale-specific month name patterns
  const localeResult = tryLocaleMonthParsing(cleaned, locale);
  if (localeResult) return localeResult;

  // Step 2: Try CJK date patterns (2025年1月15日, 2025년 1월 15일)
  const cjkResult = tryCJKDateParsing(cleaned);
  if (cjkResult) return cjkResult;

  // Step 3: Try Arabic/Eastern digit conversion then numeric parsing
  const arabicResult = tryArabicDigitParsing(cleaned);
  if (arabicResult) return arabicResult;

  // Step 4: Try chrono-node (handles many natural language date formats)
  const chronoResult = tryChronoParsing(cleaned, locale);
  if (chronoResult) return chronoResult;

  // Step 5: Try common numeric patterns
  const numericResult = tryNumericParsing(cleaned, locale);
  if (numericResult) return numericResult;

  // Step 6: Last resort - JavaScript Date constructor
  try {
    const date = new Date(cleaned);
    if (!isNaN(date.getTime()) && isReasonableDate(date)) {
      return date;
    }
  } catch {
    // Fall through
  }

  return null;
}

// Month names in major languages
const MONTH_NAMES: Record<string, string[]> = {
  // English
  en: ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'],
  en_abbr: ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'],

  // Spanish
  es: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
  es_abbr: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],

  // French
  fr: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  fr_abbr: ['janv', 'févr', 'mars', 'avr', 'mai', 'juin', 'juil', 'août', 'sept', 'oct', 'nov', 'déc'],

  // German
  de: ['januar', 'februar', 'märz', 'april', 'mai', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'dezember'],
  de_abbr: ['jan', 'feb', 'mär', 'apr', 'mai', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dez'],

  // Portuguese
  pt: ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'],
  pt_abbr: ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'],

  // Italian
  it: ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'],
  it_abbr: ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'],

  // Dutch
  nl: ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'],
  nl_abbr: ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'],

  // Russian
  ru: ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'],
  ru_gen: ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'],

  // Turkish
  tr: ['ocak', 'şubat', 'mart', 'nisan', 'mayıs', 'haziran', 'temmuz', 'ağustos', 'eylül', 'ekim', 'kasım', 'aralık'],
  tr_abbr: ['oca', 'şub', 'mar', 'nis', 'may', 'haz', 'tem', 'ağu', 'eyl', 'eki', 'kas', 'ara'],

  // Polish
  pl: ['styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec', 'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień'],
  pl_gen: ['stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca', 'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'],

  // Czech
  cs: ['leden', 'únor', 'březen', 'duben', 'květen', 'červen', 'červenec', 'srpen', 'září', 'říjen', 'listopad', 'prosinec'],

  // Hungarian
  hu: ['január', 'február', 'március', 'április', 'május', 'június', 'július', 'augusztus', 'szeptember', 'október', 'november', 'december'],

  // Romanian
  ro: ['ianuarie', 'februarie', 'martie', 'aprilie', 'mai', 'iunie', 'iulie', 'august', 'septembrie', 'octombrie', 'noiembrie', 'decembrie'],

  // Swedish
  sv: ['januari', 'februari', 'mars', 'april', 'maj', 'juni', 'juli', 'augusti', 'september', 'oktober', 'november', 'december'],

  // Norwegian
  no: ['januar', 'februar', 'mars', 'april', 'mai', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'desember'],

  // Danish
  da: ['januar', 'februar', 'marts', 'april', 'maj', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'december'],

  // Finnish
  fi: ['tammikuu', 'helmikuu', 'maaliskuu', 'huhtikuu', 'toukokuu', 'kesäkuu', 'heinäkuu', 'elokuu', 'syyskuu', 'lokakuu', 'marraskuu', 'joulukuu'],

  // Indonesian
  id: ['januari', 'februari', 'maret', 'april', 'mei', 'juni', 'juli', 'agustus', 'september', 'oktober', 'november', 'desember'],

  // Malay
  ms: ['januari', 'februari', 'mac', 'april', 'mei', 'jun', 'julai', 'ogos', 'september', 'oktober', 'november', 'disember'],

  // Vietnamese
  vi_month: ['tháng 1', 'tháng 2', 'tháng 3', 'tháng 4', 'tháng 5', 'tháng 6', 'tháng 7', 'tháng 8', 'tháng 9', 'tháng 10', 'tháng 11', 'tháng 12'],

  // Thai
  th: ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'],
  th_abbr: ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'],

  // Hindi
  hi: ['जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्तूबर', 'नवंबर', 'दिसंबर'],

  // Arabic
  ar: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],

  // Hebrew
  he: ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'],

  // Korean
  ko: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
};

/**
 * Try parsing date using locale-specific month names
 */
function tryLocaleMonthParsing(str: string, locale?: string): Date | null {
  const lower = str.toLowerCase()
    .replace(/\./g, '')    // Remove dots (German: "15. Jan.")
    .replace(/,/g, '')     // Remove commas
    .replace(/\bde\b/g, '') // Remove Spanish/Portuguese "de"
    .replace(/\bof\b/g, '') // Remove English "of"
    .replace(/\bel\b/g, '') // Remove Spanish "el"
    .trim()
    .replace(/\s+/g, ' ');

  // Try all language month lists
  for (const [, months] of Object.entries(MONTH_NAMES)) {
    for (let monthIdx = 0; monthIdx < months.length; monthIdx++) {
      const monthName = months[monthIdx].toLowerCase();
      if (!lower.includes(monthName)) continue;

      // Extract day and year from around the month name
      const parts = lower.split(monthName).map(p => p.trim());

      let day: number | null = null;
      let year: number | null = null;

      for (const part of parts) {
        const numbers = part.match(/\d+/g);
        if (numbers) {
          for (const num of numbers) {
            const n = parseInt(num, 10);
            if (n >= 1 && n <= 31 && day === null) {
              day = n;
            } else if (n >= 1900 && n <= 2100) {
              year = n;
            } else if (n >= 0 && n <= 99 && year === null) {
              year = n + 2000;
            }
          }
        }
      }

      if (day !== null) {
        year = year ?? new Date().getFullYear();
        const date = new Date(year, monthIdx, day);
        if (!isNaN(date.getTime()) && isReasonableDate(date)) {
          return date;
        }
      }
    }
  }

  return null;
}

/**
 * Parse CJK date formats: 2025年1月15日, 2025년 1월 15일
 */
function tryCJKDateParsing(str: string): Date | null {
  // Japanese/Chinese: 2025年1月15日 or ２０２５年１月１５日
  const normalized = str.replace(/[０-９]/g, ch =>
    String.fromCharCode(ch.charCodeAt(0) - 0xFF10 + 0x30)
  );

  const cjkMatch = normalized.match(/(\d{2,4})\s*年\s*(\d{1,2})\s*月\s*(\d{1,2})\s*日/);
  if (cjkMatch) {
    let year = parseInt(cjkMatch[1], 10);
    if (year < 100) year += 2000;
    const month = parseInt(cjkMatch[2], 10);
    const day = parseInt(cjkMatch[3], 10);
    const date = new Date(year, month - 1, day);
    if (!isNaN(date.getTime()) && isReasonableDate(date)) {
      return date;
    }
  }

  // Korean: 2025년 1월 15일
  const koreanMatch = normalized.match(/(\d{2,4})\s*년\s*(\d{1,2})\s*월\s*(\d{1,2})\s*일/);
  if (koreanMatch) {
    let year = parseInt(koreanMatch[1], 10);
    if (year < 100) year += 2000;
    const month = parseInt(koreanMatch[2], 10);
    const day = parseInt(koreanMatch[3], 10);
    const date = new Date(year, month - 1, day);
    if (!isNaN(date.getTime()) && isReasonableDate(date)) {
      return date;
    }
  }

  return null;
}

/**
 * Convert Arabic/Eastern Arabic digits to Western digits and try numeric parsing
 */
function tryArabicDigitParsing(str: string): Date | null {
  // Check if string contains Arabic-Indic digits (٠-٩)
  if (!/[٠-٩]/.test(str)) return null;

  const converted = str.replace(/[٠-٩]/g, d =>
    String.fromCharCode(d.charCodeAt(0) - 0x0660 + 0x30)
  );

  return tryNumericParsing(converted);
}

/**
 * Try chrono-node for natural language date parsing
 */
function tryChronoParsing(str: string, locale?: string): Date | null {
  try {
    const results = chrono.parse(str, { instant: new Date() });
    if (results.length > 0) {
      const date = results[0].date();
      if (isReasonableDate(date)) {
        return date;
      }
    }
  } catch {
    // chrono-node failed, continue
  }

  return null;
}

/**
 * Try parsing common numeric date patterns
 */
function tryNumericParsing(str: string, locale?: string): Date | null {
  const patterns: Array<{ regex: RegExp; parse: (m: RegExpMatchArray) => Date | null }> = [
    // YYYY-MM-DD or YYYY/MM/DD
    {
      regex: /(\d{4})[\-\/\.](\d{1,2})[\-\/\.](\d{1,2})/,
      parse: (m) => {
        const date = new Date(parseInt(m[1]), parseInt(m[2]) - 1, parseInt(m[3]));
        return isValidDate(date, parseInt(m[1]), parseInt(m[2]), parseInt(m[3])) ? date : null;
      },
    },
    // DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY (European, most of world)
    // Also matches MM/DD/YYYY (US) — we use locale hint to disambiguate
    {
      regex: /(\d{1,2})[\-\/\.](\d{1,2})[\-\/\.](\d{4})/,
      parse: (m) => {
        const a = parseInt(m[1]);
        const b = parseInt(m[2]);
        const year = parseInt(m[3]);

        // If locale suggests US format (month first)
        const isUSFormat = locale && (locale.startsWith('en-US') || locale === 'en');

        if (isUSFormat) {
          // MM/DD/YYYY
          const date = new Date(year, a - 1, b);
          if (isValidDate(date, year, a, b)) return date;
        }

        // Try DD/MM/YYYY first (more common worldwide)
        if (a >= 1 && a <= 31 && b >= 1 && b <= 12) {
          const date = new Date(year, b - 1, a);
          if (isValidDate(date, year, b, a)) return date;
        }

        // Fall back to MM/DD/YYYY
        if (a >= 1 && a <= 12 && b >= 1 && b <= 31) {
          const date = new Date(year, a - 1, b);
          if (isValidDate(date, year, a, b)) return date;
        }

        return null;
      },
    },
    // DD/MM/YY or MM/DD/YY (2-digit year)
    {
      regex: /(\d{1,2})[\-\/\.](\d{1,2})[\-\/\.](\d{2})$/,
      parse: (m) => {
        const a = parseInt(m[1]);
        const b = parseInt(m[2]);
        let year = parseInt(m[3]);
        year = year < 50 ? 2000 + year : 1900 + year;

        const isUSFormat = locale && (locale.startsWith('en-US') || locale === 'en');

        if (isUSFormat && a >= 1 && a <= 12 && b >= 1 && b <= 31) {
          const date = new Date(year, a - 1, b);
          if (isValidDate(date, year, a, b)) return date;
        }

        if (a >= 1 && a <= 31 && b >= 1 && b <= 12) {
          const date = new Date(year, b - 1, a);
          if (isValidDate(date, year, b, a)) return date;
        }

        if (a >= 1 && a <= 12 && b >= 1 && b <= 31) {
          const date = new Date(year, a - 1, b);
          if (isValidDate(date, year, a, b)) return date;
        }

        return null;
      },
    },
  ];

  for (const pattern of patterns) {
    const match = str.match(pattern.regex);
    if (match) {
      const date = pattern.parse(match);
      if (date && isReasonableDate(date)) return date;
    }
  }

  return null;
}

/**
 * Validate that a date matches the expected components
 */
function isValidDate(date: Date, year: number, month: number, day: number): boolean {
  return (
    !isNaN(date.getTime()) &&
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

/**
 * Check if a date is within a reasonable range for financial data
 * (not more than 10 years ago, not in the future beyond a few days)
 */
function isReasonableDate(date: Date): boolean {
  const now = new Date();
  const tenYearsAgo = new Date();
  tenYearsAgo.setFullYear(now.getFullYear() - 10);

  // Allow a few days in the future (for pending transactions)
  const nearFuture = new Date();
  nearFuture.setDate(now.getDate() + 7);

  return date >= tenYearsAgo && date <= nearFuture;
}
