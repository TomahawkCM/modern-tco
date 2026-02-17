/**
 * Search Query Parser
 * Parses structured search queries like:
 * - "amount:>100 category:groceries coffee"
 * - "$50-100 last week"
 * - "Amazon over $50"
 *
 * Supports operators: :, >, <, >=, <=, .. (range)
 * Date shortcuts: today, yesterday, last7, last30, thismonth, lastmonth, thisyear
 */

import { normalizeText } from "./transaction-search";

export interface ParsedFilters {
  amountMin?: number;
  amountMax?: number;
  category?: string;
  dateStart?: Date;
  dateEnd?: Date;
  account?: string;
  type?: "income" | "expense";
  tag?: string;
  merchant?: string;
  isRecurring?: boolean;
  isSplit?: boolean;
  /** Negated filters — these exclude matching results */
  negated?: {
    category?: string;
    account?: string;
    tag?: string;
    merchant?: string;
    type?: "income" | "expense";
  };
}

export interface ParsedQuery {
  textQuery: string; // Remaining text for fuzzy search
  filters: ParsedFilters;
  hasStructuredFilters: boolean;
}

/**
 * Design Decision: English-only search syntax
 *
 * Date shortcuts (today, yesterday, last7, thismonth, etc.) and structured
 * filter prefixes (amount:, category:, date:, account:, type:, tag:,
 * merchant:, is:) are intentionally kept in English as a universal search
 * syntax. This follows the convention used by GitHub, Gmail, and other
 * major search implementations where the query DSL is locale-independent.
 *
 * The fuzzy text portion of queries (not the structured filters) does
 * support locale-aware matching via diacritics normalization — searching
 * "cafe" will match "café", "nino" will match "niño", etc.
 */

// Date shortcuts mapping
const DATE_SHORTCUTS: Record<string, () => { start: Date; end: Date }> = {
  today: () => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return { start, end };
  },
  yesterday: () => {
    const start = new Date();
    start.setDate(start.getDate() - 1);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  },
  last7: () => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 7);
    start.setHours(0, 0, 0, 0);
    return { start, end };
  },
  lastweek: () => DATE_SHORTCUTS["last7"](),
  last30: () => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    start.setHours(0, 0, 0, 0);
    return { start, end };
  },
  lastmonth: () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    return { start, end };
  },
  thismonth: () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date();
    return { start, end };
  },
  thisyear: () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const end = new Date();
    return { start, end };
  },
  lastyear: () => {
    const now = new Date();
    const start = new Date(now.getFullYear() - 1, 0, 1);
    const end = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
    return { start, end };
  },
};

// Natural language date phrases
type DatePatternResult = { start: Date; end: Date };
type DatePatternFn = (match?: RegExpMatchArray) => DatePatternResult;

const NATURAL_DATE_PATTERNS: [RegExp, DatePatternFn][] = [
  [/last\s+week/i, DATE_SHORTCUTS["last7"]],
  [
    /this\s+week/i,
    () => {
      const now = new Date();
      const dayOfWeek = now.getDay();
      const start = new Date(now);
      start.setDate(now.getDate() - dayOfWeek);
      start.setHours(0, 0, 0, 0);
      return { start, end: now };
    },
  ],
  [/last\s+month/i, DATE_SHORTCUTS["lastmonth"]],
  [/this\s+month/i, DATE_SHORTCUTS["thismonth"]],
  [/last\s+year/i, DATE_SHORTCUTS["lastyear"]],
  [/this\s+year/i, DATE_SHORTCUTS["thisyear"]],
  [
    /past\s+(\d+)\s+days?/i,
    (match?: RegExpMatchArray) => {
      const days = match ? parseInt(match[1], 10) : 7;
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - days);
      start.setHours(0, 0, 0, 0);
      return { start, end };
    },
  ],
];

// Structured filter patterns
const FILTER_PATTERNS = {
  // amount:>100, amount:<50, amount:50-100, amount:>=50
  amount: /amount:([<>]=?)?(\d+(?:\.\d+)?)?(?:\.\.|-)?(\d+(?:\.\d+)?)?/gi,
  // $50-100, $>50, $<100, over $50, under $100
  dollarAmount:
    /(?:\$([<>]=?)?(\d+(?:\.\d+)?)?(?:\.\.|-)?(\d+(?:\.\d+)?)?|(?:over|above|more\s+than)\s+\$?(\d+(?:\.\d+)?)|(?:under|below|less\s+than)\s+\$?(\d+(?:\.\d+)?))/gi,
  // category:groceries, cat:food, category:"Food & Dining"
  category: /(?:category|cat):(?:"([^"]+)"|(\w+))/gi,
  // date:last30, date:thismonth
  date: /date:(\w+)/gi,
  // account:checking, acc:savings, account:"My Savings"
  account: /(?:account|acc):(?:"([^"]+)"|(\w+))/gi,
  // type:income, type:expense
  type: /type:(income|expense)/gi,
  // tag:vacation, tag:business, tag:"road trip"
  tag: /tag:(?:"([^"]+)"|(\w+))/gi,
  // merchant:amazon, from:starbucks, merchant:"Whole Foods"
  merchant: /(?:merchant|from):(?:"([^"]+)"|(\w+))/gi,
  // is:recurring, is:split
  is: /is:(recurring|split|income|expense)/gi,
};

// Negated filter patterns: -category:food, -tag:vacation, -merchant:amazon, -type:income, -account:checking
const NEGATION_PATTERNS = {
  category: /-(?:category|cat):(?:"([^"]+)"|(\w+))/gi,
  tag: /-tag:(?:"([^"]+)"|(\w+))/gi,
  merchant: /-(?:merchant|from):(?:"([^"]+)"|(\w+))/gi,
  type: /-type:(income|expense)/gi,
  account: /-(?:account|acc):(?:"([^"]+)"|(\w+))/gi,
};

/**
 * Parse a search query into structured filters and remaining text
 */
export function parseSearchQuery(query: string): ParsedQuery {
  const filters: ParsedFilters = {};
  let remainingQuery = query;
  let hasStructuredFilters = false;

  // Parse amount filters: amount:>100, amount:50-100
  const amountMatches = [...query.matchAll(FILTER_PATTERNS.amount)];
  for (const match of amountMatches) {
    hasStructuredFilters = true;
    remainingQuery = remainingQuery.replace(match[0], "");
    const operator = match[1];
    const value1 = match[2] ? parseFloat(match[2]) : undefined;
    const value2 = match[3] ? parseFloat(match[3]) : undefined;

    if (value2 !== undefined && value1 !== undefined) {
      // Range: amount:50-100 or amount:50..100
      filters.amountMin = Math.min(value1, value2);
      filters.amountMax = Math.max(value1, value2);
    } else if (value1 !== undefined) {
      switch (operator) {
        case ">":
          filters.amountMin = value1 + 0.01;
          break;
        case ">=":
          filters.amountMin = value1;
          break;
        case "<":
          filters.amountMax = value1 - 0.01;
          break;
        case "<=":
          filters.amountMax = value1;
          break;
        default:
          // Exact match - use small range
          filters.amountMin = value1 - 0.005;
          filters.amountMax = value1 + 0.005;
      }
    }
  }

  // Parse dollar amount filters: $50-100, over $50, under $100
  const dollarMatches = [...query.matchAll(FILTER_PATTERNS.dollarAmount)];
  for (const match of dollarMatches) {
    hasStructuredFilters = true;
    remainingQuery = remainingQuery.replace(match[0], "");

    if (match[4]) {
      // "over $50", "above $50", "more than $50"
      filters.amountMin = parseFloat(match[4]) + 0.01;
    } else if (match[5]) {
      // "under $100", "below $100", "less than $100"
      filters.amountMax = parseFloat(match[5]) - 0.01;
    } else {
      const operator = match[1];
      const value1 = match[2] ? parseFloat(match[2]) : undefined;
      const value2 = match[3] ? parseFloat(match[3]) : undefined;

      if (value2 !== undefined && value1 !== undefined) {
        filters.amountMin = Math.min(value1, value2);
        filters.amountMax = Math.max(value1, value2);
      } else if (value1 !== undefined) {
        switch (operator) {
          case ">":
            filters.amountMin = value1 + 0.01;
            break;
          case ">=":
            filters.amountMin = value1;
            break;
          case "<":
            filters.amountMax = value1 - 0.01;
            break;
          case "<=":
            filters.amountMax = value1;
            break;
          default:
            // $50 alone means exact-ish match
            filters.amountMin = value1 - 0.5;
            filters.amountMax = value1 + 0.5;
        }
      }
    }
  }

  // Parse category filter (supports quoted: category:"Food & Dining")
  const categoryMatch = FILTER_PATTERNS.category.exec(query);
  if (categoryMatch) {
    hasStructuredFilters = true;
    remainingQuery = remainingQuery.replace(categoryMatch[0], "");
    filters.category = categoryMatch[1] || categoryMatch[2]; // group 1 = quoted, group 2 = unquoted
  }
  FILTER_PATTERNS.category.lastIndex = 0;

  // Parse date filter
  const dateMatch = FILTER_PATTERNS.date.exec(query);
  if (dateMatch) {
    hasStructuredFilters = true;
    remainingQuery = remainingQuery.replace(dateMatch[0], "");
    const shortcut = DATE_SHORTCUTS[dateMatch[1].toLowerCase()];
    if (shortcut) {
      const { start, end } = shortcut();
      filters.dateStart = start;
      filters.dateEnd = end;
    }
  }
  FILTER_PATTERNS.date.lastIndex = 0;

  // Parse natural date phrases (if no explicit date filter)
  if (!filters.dateStart) {
    for (const [pattern, getRange] of NATURAL_DATE_PATTERNS) {
      const naturalMatch = remainingQuery.match(pattern);
      if (naturalMatch) {
        hasStructuredFilters = true;
        remainingQuery = remainingQuery.replace(naturalMatch[0], "");
        const range = typeof getRange === "function" ? getRange(naturalMatch) : getRange;
        if (range) {
          filters.dateStart = range.start;
          filters.dateEnd = range.end;
        }
        break;
      }
    }
  }

  // Parse account filter (supports quoted: account:"My Savings")
  const accountMatch = FILTER_PATTERNS.account.exec(query);
  if (accountMatch) {
    hasStructuredFilters = true;
    remainingQuery = remainingQuery.replace(accountMatch[0], "");
    filters.account = accountMatch[1] || accountMatch[2];
  }
  FILTER_PATTERNS.account.lastIndex = 0;

  // Parse type filter
  const typeMatch = FILTER_PATTERNS.type.exec(query);
  if (typeMatch) {
    hasStructuredFilters = true;
    remainingQuery = remainingQuery.replace(typeMatch[0], "");
    filters.type = typeMatch[1] as "income" | "expense";
  }
  FILTER_PATTERNS.type.lastIndex = 0;

  // Parse is: filters (is:income, is:expense, is:recurring, is:split)
  const isMatch = FILTER_PATTERNS.is.exec(query);
  if (isMatch) {
    hasStructuredFilters = true;
    remainingQuery = remainingQuery.replace(isMatch[0], "");
    if (isMatch[1] === "income" || isMatch[1] === "expense") {
      filters.type = isMatch[1];
    } else if (isMatch[1] === "recurring") {
      filters.isRecurring = true;
    } else if (isMatch[1] === "split") {
      filters.isSplit = true;
    }
  }
  FILTER_PATTERNS.is.lastIndex = 0;

  // Parse tag filter (supports quoted: tag:"road trip")
  const tagMatch = FILTER_PATTERNS.tag.exec(query);
  if (tagMatch) {
    hasStructuredFilters = true;
    remainingQuery = remainingQuery.replace(tagMatch[0], "");
    filters.tag = tagMatch[1] || tagMatch[2];
  }
  FILTER_PATTERNS.tag.lastIndex = 0;

  // Parse merchant filter (supports quoted: merchant:"Whole Foods")
  const merchantMatch = FILTER_PATTERNS.merchant.exec(query);
  if (merchantMatch) {
    hasStructuredFilters = true;
    remainingQuery = remainingQuery.replace(merchantMatch[0], "");
    filters.merchant = merchantMatch[1] || merchantMatch[2];
  }
  FILTER_PATTERNS.merchant.lastIndex = 0;

  // Parse negated filters: -category:food, -merchant:amazon, etc.
  const negated: NonNullable<ParsedFilters["negated"]> = {};
  let hasNegation = false;

  const negCategoryMatch = NEGATION_PATTERNS.category.exec(remainingQuery);
  if (negCategoryMatch) {
    hasNegation = true;
    remainingQuery = remainingQuery.replace(negCategoryMatch[0], "");
    negated.category = negCategoryMatch[1] || negCategoryMatch[2];
  }
  NEGATION_PATTERNS.category.lastIndex = 0;

  const negTagMatch = NEGATION_PATTERNS.tag.exec(remainingQuery);
  if (negTagMatch) {
    hasNegation = true;
    remainingQuery = remainingQuery.replace(negTagMatch[0], "");
    negated.tag = negTagMatch[1] || negTagMatch[2];
  }
  NEGATION_PATTERNS.tag.lastIndex = 0;

  const negMerchantMatch = NEGATION_PATTERNS.merchant.exec(remainingQuery);
  if (negMerchantMatch) {
    hasNegation = true;
    remainingQuery = remainingQuery.replace(negMerchantMatch[0], "");
    negated.merchant = negMerchantMatch[1] || negMerchantMatch[2];
  }
  NEGATION_PATTERNS.merchant.lastIndex = 0;

  const negTypeMatch = NEGATION_PATTERNS.type.exec(remainingQuery);
  if (negTypeMatch) {
    hasNegation = true;
    remainingQuery = remainingQuery.replace(negTypeMatch[0], "");
    negated.type = negTypeMatch[1] as "income" | "expense";
  }
  NEGATION_PATTERNS.type.lastIndex = 0;

  const negAccountMatch = NEGATION_PATTERNS.account.exec(remainingQuery);
  if (negAccountMatch) {
    hasNegation = true;
    remainingQuery = remainingQuery.replace(negAccountMatch[0], "");
    negated.account = negAccountMatch[1] || negAccountMatch[2];
  }
  NEGATION_PATTERNS.account.lastIndex = 0;

  if (hasNegation) {
    hasStructuredFilters = true;
    filters.negated = negated;
  }

  // Normalize the text query (strip diacritics) so that accent-insensitive
  // matching works with the normalized Fuse.js index
  const cleanedTextQuery = remainingQuery.trim().replace(/\s+/g, " ");

  return {
    textQuery: normalizeText(cleanedTextQuery),
    filters,
    hasStructuredFilters,
  };
}

/**
 * Format a ParsedQuery back into a search string (for display)
 */
export function formatParsedQuery(parsed: ParsedQuery): string {
  const parts: string[] = [];

  if (parsed.filters.amountMin !== undefined && parsed.filters.amountMax !== undefined) {
    parts.push(`$${parsed.filters.amountMin.toFixed(0)}-${parsed.filters.amountMax.toFixed(0)}`);
  } else if (parsed.filters.amountMin !== undefined) {
    parts.push(`amount:>${parsed.filters.amountMin.toFixed(0)}`);
  } else if (parsed.filters.amountMax !== undefined) {
    parts.push(`amount:<${parsed.filters.amountMax.toFixed(0)}`);
  }

  if (parsed.filters.category) {
    parts.push(`category:${parsed.filters.category}`);
  }

  if (parsed.filters.dateStart && parsed.filters.dateEnd) {
    const now = new Date();
    const daysDiff = Math.floor(
      (now.getTime() - parsed.filters.dateStart.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysDiff <= 7) {
      parts.push("date:last7");
    } else if (daysDiff <= 30) {
      parts.push("date:last30");
    } else {
      parts.push("date:thismonth");
    }
  }

  if (parsed.filters.account) {
    parts.push(`account:${parsed.filters.account}`);
  }

  if (parsed.filters.type) {
    parts.push(`type:${parsed.filters.type}`);
  }

  if (parsed.filters.tag) {
    parts.push(`tag:${parsed.filters.tag}`);
  }

  if (parsed.filters.merchant) {
    parts.push(`merchant:${parsed.filters.merchant}`);
  }

  if (parsed.textQuery) {
    parts.push(parsed.textQuery);
  }

  return parts.join(" ");
}

/**
 * Get available filter suggestions for autocomplete
 */
export function getFilterSuggestions(partial: string): string[] {
  const suggestions: string[] = [];
  const lowerPartial = partial.toLowerCase();

  // Suggest filter prefixes
  const prefixes = ["amount:", "category:", "date:", "account:", "type:", "tag:", "merchant:"];

  for (const prefix of prefixes) {
    if (prefix.startsWith(lowerPartial)) {
      suggestions.push(prefix);
    }
  }

  // Suggest amount operators
  if (lowerPartial.startsWith("amount:") || lowerPartial.startsWith("$")) {
    suggestions.push("amount:>100", "amount:<50", "amount:50-100", "$50-100");
  }

  // Suggest date shortcuts
  if (lowerPartial.startsWith("date:")) {
    suggestions.push(
      "date:today",
      "date:yesterday",
      "date:last7",
      "date:last30",
      "date:thismonth",
      "date:lastmonth",
      "date:thisyear"
    );
  }

  // Suggest types
  if (lowerPartial.startsWith("type:") || lowerPartial.startsWith("is:")) {
    suggestions.push("type:income", "type:expense", "is:recurring");
  }

  return suggestions.slice(0, 8);
}
