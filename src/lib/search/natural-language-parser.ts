/**
 * Natural Language Search Parser
 * Converts human-friendly queries to structured search
 *
 * Examples:
 * - "coffee last week" -> { merchant: "coffee", dateRange: last7 }
 * - "Amazon over $50" -> { merchant: "Amazon", amountMin: 50 }
 * - "groceries this month" -> { category: "groceries", dateRange: thismonth }
 * - "large purchases yesterday" -> { amountMin: 100, dateRange: yesterday }
 */

import { parseSearchQuery, type ParsedQuery, type ParsedFilters } from "./query-parser";

export interface NaturalLanguageResult {
  /** Structured query from parsing */
  query: ParsedQuery;
  /** Confidence score (0-1) */
  confidence: number;
  /** Human-readable interpretation */
  interpretation: string;
  /** Original input */
  originalInput: string;
}

// Amount-related patterns
const AMOUNT_PATTERNS: [RegExp, (match: RegExpMatchArray) => Partial<ParsedFilters>][] = [
  // "over $50", "above $100", "more than $25"
  [
    /(?:over|above|more\s+than)\s+\$?(\d+(?:\.\d+)?)/i,
    (m) => ({ amountMin: parseFloat(m[1]) + 0.01 }),
  ],
  // "under $50", "below $100", "less than $25"
  [
    /(?:under|below|less\s+than)\s+\$?(\d+(?:\.\d+)?)/i,
    (m) => ({ amountMax: parseFloat(m[1]) - 0.01 }),
  ],
  // "$50-100", "$50 to $100"
  [
    /\$(\d+(?:\.\d+)?)\s*(?:-|to)\s*\$?(\d+(?:\.\d+)?)/i,
    (m) => ({
      amountMin: parseFloat(m[1]),
      amountMax: parseFloat(m[2]),
    }),
  ],
  // "around $50", "about $100", "roughly $25"
  [
    /(?:around|about|roughly|approximately)\s+\$?(\d+(?:\.\d+)?)/i,
    (m) => ({
      amountMin: parseFloat(m[1]) * 0.8,
      amountMax: parseFloat(m[1]) * 1.2,
    }),
  ],
  // "expensive" (arbitrary threshold)
  [/\bexpensive\b/i, () => ({ amountMin: 100 })],
  // "cheap", "small"
  [/\b(?:cheap|small|minor)\b/i, () => ({ amountMax: 25 })],
  // "large", "big"
  [/\b(?:large|big|major)\s+(?:purchase|transaction|expense)?s?\b/i, () => ({ amountMin: 100 })],
];

// Date-related patterns
// Type for date pattern functions - some need the match, some don't
type DatePatternFn = (match?: RegExpMatchArray) => { dateStart: Date; dateEnd: Date };

const DATE_PATTERNS: [RegExp, DatePatternFn][] = [
  // "today"
  [
    /\btoday\b/i,
    () => {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      return { dateStart: start, dateEnd: end };
    },
  ],
  // "yesterday"
  [
    /\byesterday\b/i,
    () => {
      const start = new Date();
      start.setDate(start.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setHours(23, 59, 59, 999);
      return { dateStart: start, dateEnd: end };
    },
  ],
  // "last week", "this week"
  [
    /\blast\s+week\b/i,
    () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      return { dateStart: start, dateEnd: end };
    },
  ],
  [
    /\bthis\s+week\b/i,
    () => {
      const now = new Date();
      const dayOfWeek = now.getDay();
      const start = new Date(now);
      start.setDate(now.getDate() - dayOfWeek);
      start.setHours(0, 0, 0, 0);
      return { dateStart: start, dateEnd: now };
    },
  ],
  // "last month", "this month"
  [
    /\blast\s+month\b/i,
    () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      return { dateStart: start, dateEnd: end };
    },
  ],
  [
    /\bthis\s+month\b/i,
    () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return { dateStart: start, dateEnd: now };
    },
  ],
  // "last year", "this year"
  [
    /\blast\s+year\b/i,
    () => {
      const now = new Date();
      const start = new Date(now.getFullYear() - 1, 0, 1);
      const end = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
      return { dateStart: start, dateEnd: end };
    },
  ],
  [
    /\bthis\s+year\b/i,
    () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), 0, 1);
      return { dateStart: start, dateEnd: now };
    },
  ],
  // "past X days/weeks/months"
  [
    /\bpast\s+(\d+)\s+days?\b/i,
    (match?: RegExpMatchArray) => {
      const days = match ? parseInt(match[1], 10) : 7;
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - days);
      start.setHours(0, 0, 0, 0);
      return { dateStart: start, dateEnd: end };
    },
  ],
  [
    /\bpast\s+(\d+)\s+weeks?\b/i,
    (match?: RegExpMatchArray) => {
      const weeks = match ? parseInt(match[1], 10) : 1;
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - weeks * 7);
      start.setHours(0, 0, 0, 0);
      return { dateStart: start, dateEnd: end };
    },
  ],
  [
    /\bpast\s+(\d+)\s+months?\b/i,
    (match?: RegExpMatchArray) => {
      const months = match ? parseInt(match[1], 10) : 1;
      const end = new Date();
      const start = new Date();
      start.setMonth(start.getMonth() - months);
      start.setHours(0, 0, 0, 0);
      return { dateStart: start, dateEnd: end };
    },
  ],
  // "recently", "recent"
  [
    /\brecent(?:ly)?\b/i,
    () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      return { dateStart: start, dateEnd: end };
    },
  ],
];

// Type patterns
const TYPE_PATTERNS: [RegExp, "income" | "expense"][] = [
  [/\b(?:income|salary|payment|deposit|refund)\b/i, "income"],
  [/\b(?:expense|spent|purchase|bought|paid|bill)\b/i, "expense"],
];

// Common category aliases
const CATEGORY_ALIASES: Record<string, string[]> = {
  "Food & Dining": [
    "food",
    "restaurant",
    "restaurants",
    "dining",
    "eating out",
    "takeout",
    "delivery",
  ],
  Groceries: ["grocery", "groceries", "supermarket", "market"],
  Transportation: ["transport", "gas", "fuel", "uber", "lyft", "taxi", "transit", "bus", "subway"],
  Entertainment: ["entertainment", "movies", "games", "streaming", "netflix", "spotify"],
  Shopping: ["shopping", "clothes", "clothing", "amazon", "online shopping"],
  Utilities: ["utilities", "electric", "electricity", "water", "internet", "phone", "cell"],
  Healthcare: ["health", "healthcare", "medical", "doctor", "pharmacy", "prescription"],
  Travel: ["travel", "hotel", "flight", "airbnb", "vacation"],
  Subscriptions: ["subscription", "subscriptions", "monthly", "recurring"],
};

/**
 * Parse natural language query into structured filters
 */
export function parseNaturalLanguage(input: string): NaturalLanguageResult {
  let remainingInput = input.toLowerCase().trim();
  const filters: ParsedFilters = {};
  const interpretations: string[] = [];
  let confidence = 1.0;

  // Try structured query parser first
  const structuredResult = parseSearchQuery(input);
  if (structuredResult.hasStructuredFilters) {
    return {
      query: structuredResult,
      confidence: 0.95, // High confidence for explicit filters
      interpretation: `Searching with filters: ${formatFilters(structuredResult.filters)}`,
      originalInput: input,
    };
  }

  // Parse amount patterns
  for (const [pattern, extractFilter] of AMOUNT_PATTERNS) {
    const match = remainingInput.match(pattern);
    if (match) {
      const extracted = extractFilter(match);
      Object.assign(filters, extracted);
      remainingInput = remainingInput.replace(match[0], "").trim();
      interpretations.push(formatAmountFilter(extracted));
      confidence *= 0.9;
    }
  }

  // Parse date patterns
  for (const [pattern, getRange] of DATE_PATTERNS) {
    const match = remainingInput.match(pattern);
    if (match) {
      const range = getRange(match);
      filters.dateStart = range.dateStart;
      filters.dateEnd = range.dateEnd;
      remainingInput = remainingInput.replace(match[0], "").trim();
      interpretations.push(formatDateFilter(range));
      confidence *= 0.9;
      break; // Only use first date match
    }
  }

  // Parse type patterns
  for (const [pattern, type] of TYPE_PATTERNS) {
    if (pattern.test(remainingInput)) {
      filters.type = type;
      remainingInput = remainingInput.replace(pattern, "").trim();
      interpretations.push(`Type: ${type}`);
      confidence *= 0.85;
      break;
    }
  }

  // Match category aliases
  for (const [category, aliases] of Object.entries(CATEGORY_ALIASES)) {
    for (const alias of aliases) {
      const aliasPattern = new RegExp(`\\b${alias}\\b`, "i");
      if (aliasPattern.test(remainingInput)) {
        filters.category = category;
        remainingInput = remainingInput.replace(aliasPattern, "").trim();
        interpretations.push(`Category: ${category}`);
        confidence *= 0.85;
        break;
      }
    }
    if (filters.category) break;
  }

  // Clean up remaining text
  remainingInput = remainingInput
    .replace(/\s+/g, " ")
    .replace(/\b(?:for|at|in|from|the|a|an|my|to)\b/gi, "")
    .trim();

  // Build result
  const hasFilters = Object.keys(filters).length > 0;

  return {
    query: {
      textQuery: remainingInput,
      filters,
      hasStructuredFilters: hasFilters,
    },
    confidence: hasFilters ? confidence : 0.7,
    interpretation:
      interpretations.length > 0
        ? interpretations.join(", ")
        : `Searching for "${remainingInput || input}"`,
    originalInput: input,
  };
}

/**
 * Format filters for display
 */
function formatFilters(filters: ParsedFilters): string {
  const parts: string[] = [];

  if (filters.amountMin !== undefined && filters.amountMax !== undefined) {
    parts.push(`$${filters.amountMin.toFixed(0)}-$${filters.amountMax.toFixed(0)}`);
  } else if (filters.amountMin !== undefined) {
    parts.push(`over $${filters.amountMin.toFixed(0)}`);
  } else if (filters.amountMax !== undefined) {
    parts.push(`under $${filters.amountMax.toFixed(0)}`);
  }

  if (filters.category) {
    parts.push(`category: ${filters.category}`);
  }

  if (filters.dateStart && filters.dateEnd) {
    parts.push(`date range specified`);
  }

  if (filters.type) {
    parts.push(`type: ${filters.type}`);
  }

  return parts.join(", ") || "none";
}

/**
 * Format amount filter for display
 */
function formatAmountFilter(filter: Partial<ParsedFilters>): string {
  if (filter.amountMin !== undefined && filter.amountMax !== undefined) {
    return `Amount: $${filter.amountMin.toFixed(0)}-$${filter.amountMax.toFixed(0)}`;
  } else if (filter.amountMin !== undefined) {
    return `Amount: over $${filter.amountMin.toFixed(0)}`;
  } else if (filter.amountMax !== undefined) {
    return `Amount: under $${filter.amountMax.toFixed(0)}`;
  }
  return "";
}

/**
 * Format date filter for display
 */
function formatDateFilter(range: { dateStart: Date; dateEnd: Date }): string {
  const now = new Date();
  const daysDiff = Math.floor((now.getTime() - range.dateStart.getTime()) / (1000 * 60 * 60 * 24));

  if (daysDiff === 0) return "Date: today";
  if (daysDiff === 1) return "Date: yesterday";
  if (daysDiff <= 7) return "Date: last 7 days";
  if (daysDiff <= 30) return "Date: last 30 days";
  if (daysDiff <= 90) return "Date: last 3 months";
  return `Date: ${range.dateStart.toLocaleDateString()} - ${range.dateEnd.toLocaleDateString()}`;
}

/**
 * Get search examples for user guidance
 */
export function getSearchExamples(): { query: string; description: string }[] {
  return [
    { query: "coffee last week", description: "Coffee purchases from the past week" },
    { query: "Amazon over $50", description: "Amazon orders over $50" },
    { query: "groceries this month", description: "Grocery spending this month" },
    { query: "restaurants yesterday", description: "Restaurant charges from yesterday" },
    { query: "large purchases", description: "Transactions over $100" },
    { query: "amount:>200 category:shopping", description: "Shopping over $200 (structured)" },
    { query: "$25-100 last 30 days", description: "Mid-range purchases recently" },
    { query: "type:income this year", description: "All income this year" },
  ];
}
