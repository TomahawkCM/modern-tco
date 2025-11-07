/**
 * Rule-Based Transaction Categorization
 * Canadian merchants and common patterns
 */

import type { CategoryRule, CategorizationResult } from '@/types/budget';

/**
 * Clean BMO-specific formatting from description
 * Handles both [PR] physical and [OP] online purchases
 */
function cleanBMODescription(description: string): string {
  let cleaned = description.trim();

  // Detect transaction type
  const isOnlinePurchase = /^\[OP\]/i.test(cleaned);

  // Remove BMO-specific prefixes: [PR], [OP], etc.
  cleaned = cleaned.replace(/^\[[A-Z]{2}\]/i, '').trim();

  if (isOnlinePurchase) {
    // Handle [OP] format: "ONLINE PURCHASE  1AUG2025SKIPTHEDISHES MB"
    // Extract merchant from: TYPE  DATEMERCHANTNAME LOCATION

    // Find date pattern and capture everything after it: \d{1,2}[A-Z]{3}\d{4}(.+)
    const dateMatch = cleaned.match(/\d{1,2}[A-Z]{3}\d{4}(.+)/);
    if (dateMatch && dateMatch[1]) {
      // Extract merchant name (remove trailing province/country codes)
      let merchant = dateMatch[1].trim();

      // Remove trailing 2-letter location codes and numbers
      merchant = merchant.replace(/\s+\d+\s*$/, '').trim(); // Remove trailing numbers
      merchant = merchant.replace(/\s+([A-Z]{2}|CAN)\s*$/i, '').trim(); // Remove province/country

      return merchant;
    }
  }

  // Handle [PR] physical purchases (original logic)
  // Remove location info (multiple spaces followed by location)
  cleaned = cleaned.replace(/\s{2,}.*$/,'').trim();

  // Remove trailing # numbers and location codes
  cleaned = cleaned.replace(/\s+#\d+.*$/, '').trim();
  cleaned = cleaned.replace(/\s+(AB|BC|ON|QC|MB|SK|NS|NB|PE|NL|YT|NT|NU|CAN)(\s+.*)?$/i, '').trim();

  return cleaned;
}

// Canadian merchant patterns
export const CATEGORY_RULES: CategoryRule[] = [
  // Food & Dining - Coffee
  {
    pattern: /tim hortons|tims|starbucks|second cup|bridgehead/i,
    category: 'Food & Dining',
    subcategory: 'Coffee',
    confidence: 0.95,
  },

  // Food & Dining - Groceries
  {
    pattern:
      /safeway|sobeys|metro|loblaws|no frills|freshco|food basics|walmart|costco|independent|fortinos|zehrs|valu-mart|superstore|real cdn|real canadian|italian centre|mini max/i,
    category: 'Food & Dining',
    subcategory: 'Groceries',
    confidence: 0.95,
  },

  // Food & Dining - Restaurants
  {
    pattern:
      /restaurant|pizza|burger|sushi|thai|chinese|indian|pub|grill|cafe|bistro|diner|ninja noodle|banh mi|chili's|chilis/i,
    category: 'Food & Dining',
    subcategory: 'Restaurants',
    confidence: 0.85,
  },

  // Food & Dining - Fast Food
  {
    pattern:
      /mcdonalds|burger king|wendy's|arby's|a&w|kfc|subway|harvey's|mary brown's|popeyes|domino/i,
    category: 'Food & Dining',
    subcategory: 'Fast Food',
    confidence: 0.95,
  },

  // Food & Dining - Delivery
  {
    pattern: /uber eats|doordash|skip the dishes|skipthedishes|grubhub|deliveroo/i,
    category: 'Food & Dining',
    subcategory: 'Delivery',
    confidence: 0.95,
  },

  // Transportation - Gas
  {
    pattern:
      /shell|esso|petro-can|petro canada|husky|pioneer|ultramar|mohawk|circle k/i,
    category: 'Transportation',
    subcategory: 'Gas',
    confidence: 0.95,
  },

  // Transportation - Public Transit
  {
    pattern: /ttc|presto|go transit|oc transpo|stm|translink|transit/i,
    category: 'Transportation',
    subcategory: 'Public Transit',
    confidence: 0.95,
  },

  // Transportation - Parking
  {
    pattern: /parking|impark|easypark|honk/i,
    category: 'Transportation',
    subcategory: 'Parking',
    confidence: 0.9,
  },

  // Bills & Utilities - Phone
  {
    pattern:
      /rogers|bell|telus|fido|koodo|virgin mobile|freedom mobile|shaw mobile|videotron/i,
    category: 'Bills & Utilities',
    subcategory: 'Phone',
    confidence: 0.95,
  },

  // Bills & Utilities - Internet
  {
    pattern: /rogers|bell|telus|shaw|cogeco|teksavvy|start\.ca|vmedia/i,
    category: 'Bills & Utilities',
    subcategory: 'Internet',
    confidence: 0.85,
  },

  // Bills & Utilities - Electricity/Gas
  {
    pattern:
      /hydro|toronto hydro|enbridge|fortis|bc hydro|hydro one|alectra|epcor|saskpower|manitoba hydro/i,
    category: 'Bills & Utilities',
    subcategory: 'Electricity',
    confidence: 0.95,
  },

  // Bills & Utilities - Insurance
  {
    pattern:
      /insurance|intact|td insurance|desjardins|wawanesa|co-operators|belair|rbc insurance/i,
    category: 'Bills & Utilities',
    subcategory: 'Insurance',
    confidence: 0.9,
  },

  // Bills & Utilities - Subscriptions
  {
    pattern: /apple\.com\/bill|apple\.com|recurring pymnt|online purchase.*apple/i,
    category: 'Bills & Utilities',
    subcategory: 'Subscriptions',
    confidence: 0.9,
  },

  // Shopping - General
  {
    pattern:
      /amazon|walmart|canadian tire|winners|homesense|marshalls|giant tiger|dollarama|dollar tree/i,
    category: 'Shopping',
    subcategory: 'Home Goods',
    confidence: 0.85,
  },

  // Shopping - Electronics
  {
    pattern: /best buy|the source|canada computers|staples|apple store|microsoft/i,
    category: 'Shopping',
    subcategory: 'Electronics',
    confidence: 0.9,
  },

  // Shopping - Clothing
  {
    pattern:
      /h&m|zara|gap|old navy|american eagle|roots|lululemon|sportchek|mark's|hudson bay/i,
    category: 'Shopping',
    subcategory: 'Clothing',
    confidence: 0.9,
  },

  // Entertainment - Streaming
  {
    pattern:
      /netflix|spotify|apple music|disney\+|amazon prime|crave|youtube premium/i,
    category: 'Entertainment',
    subcategory: 'Streaming',
    confidence: 0.95,
  },

  // Entertainment - Movies
  {
    pattern: /cineplex|landmark|imax|theatre/i,
    category: 'Entertainment',
    subcategory: 'Movies',
    confidence: 0.9,
  },

  // Health & Fitness - Gym
  {
    pattern: /goodlife|fit4less|planet fitness|ymca|community centre|yoga|gym/i,
    category: 'Health & Fitness',
    subcategory: 'Gym',
    confidence: 0.9,
  },

  // Health & Fitness - Pharmacy
  {
    pattern: /shoppers|rexall|pharma plus|walmart pharmacy|costco pharmacy/i,
    category: 'Health & Fitness',
    subcategory: 'Pharmacy',
    confidence: 0.9,
  },

  // Housing - Utilities (catch-all)
  {
    pattern: /rent|mortgage|property tax|condo fee|maintenance fee/i,
    category: 'Housing',
    subcategory: 'Rent/Mortgage',
    confidence: 0.85,
  },

  // Income
  {
    pattern: /payroll|salary|direct deposit|etransfer|e-transfer/i,
    category: 'Income',
    subcategory: 'Salary',
    confidence: 0.9,
  },

  // Savings & Investments
  {
    pattern: /questrade|wealthsimple|td direct|rbc direct|tfsa|rrsp|investment/i,
    category: 'Savings & Investments',
    subcategory: 'Stocks',
    confidence: 0.9,
  },

  // Education
  {
    pattern: /university|college|tuition|textbook|bookstore|coursera|udemy/i,
    category: 'Education',
    subcategory: 'Tuition',
    confidence: 0.85,
  },

  // Pets
  {
    pattern: /pet|petsmart|petvalue|ren's pets|vet|veterinary/i,
    category: 'Pets',
    subcategory: 'Food',
    confidence: 0.85,
  },

  // Travel
  {
    pattern: /air canada|westjet|hotel|airbnb|booking\.com|expedia/i,
    category: 'Travel',
    subcategory: 'Flights',
    confidence: 0.9,
  },
];

/**
 * Categorize a transaction using rules
 */
export function categorizeTransaction(
  description: string
): CategorizationResult | null {
  // Clean BMO-specific formatting first
  const cleanedDesc = cleanBMODescription(description);
  const normalizedDesc = cleanedDesc.trim();

  // Try each rule
  for (const rule of CATEGORY_RULES) {
    if (rule.pattern.test(normalizedDesc)) {
      return {
        category: rule.category,
        subcategory: rule.subcategory,
        confidence: rule.confidence,
        method: 'rule',
      };
    }
  }

  return null;
}

/**
 * Categorize using hybrid approach (rules + ML)
 * Falls back to ML if no rule matches
 */
export async function categorizeTransactionHybrid(
  description: string
): Promise<CategorizationResult | null> {
  // Try rule-based first (fast and accurate for known patterns)
  const ruleResult = categorizeTransaction(description);
  if (ruleResult) {
    return ruleResult;
  }

  // Fall back to ML model for unknown patterns
  try {
    const { getMLCategorizer } = await import('./ml-categorizer');
    const mlCategorizer = getMLCategorizer();

    if (mlCategorizer.ready) {
      const mlResult = await mlCategorizer.predict(description);
      if (mlResult && mlResult.confidence > 0.6) {
        return mlResult;
      }
    }
  } catch (error) {
    console.error('ML categorization failed:', error);
  }

  return null;
}

/**
 * Batch categorize transactions
 */
export function categorizeTransactions(
  descriptions: string[]
): CategorizationResult[] {
  return descriptions.map(
    (desc) =>
      categorizeTransaction(desc) || {
        category: 'Miscellaneous',
        subcategory: 'Other',
        confidence: 0.5,
        method: 'rule',
      }
  );
}

/**
 * Add custom rule
 */
export function addCustomRule(rule: CategoryRule): void {
  CATEGORY_RULES.push(rule);
}

/**
 * Get all rules for a category
 */
export function getRulesForCategory(category: string): CategoryRule[] {
  return CATEGORY_RULES.filter((rule) => rule.category === category);
}

/**
 * Learn from user correction
 * (For future ML implementation)
 */
export interface UserCorrection {
  originalDescription: string;
  suggestedCategory: string;
  suggestedSubcategory?: string;
  correctedCategory: string;
  correctedSubcategory?: string;
  timestamp: Date;
}

const userCorrections: UserCorrection[] = [];

export function recordCorrection(correction: UserCorrection): void {
  userCorrections.push(correction);

  // If we see the same pattern 3+ times, create a rule
  const similar = userCorrections.filter(
    (c) =>
      c.correctedCategory === correction.correctedCategory &&
      c.originalDescription
        .toLowerCase()
        .includes(correction.originalDescription.toLowerCase().substring(0, 10))
  );

  if (similar.length >= 3) {
    // Extract common pattern
    const pattern = extractCommonPattern(similar.map((c) => c.originalDescription));
    if (pattern) {
      addCustomRule({
        pattern: new RegExp(pattern, 'i'),
        category: correction.correctedCategory,
        subcategory: correction.correctedSubcategory,
        confidence: 0.8,
      });
    }
  }
}

/**
 * Extract common pattern from descriptions
 */
function extractCommonPattern(descriptions: string[]): string | null {
  if (descriptions.length < 2) return null;

  // Find common words
  const words = descriptions.map((d) =>
    d
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 3)
  );

  const commonWords = words[0].filter((word) =>
    words.every((wordList) => wordList.includes(word))
  );

  return commonWords.length > 0 ? commonWords[0] : null;
}

/**
 * Get categorization statistics
 */
export function getCategorizationStats(): {
  totalRules: number;
  customRules: number;
  corrections: number;
  topCategories: string[];
} {
  const customRules = CATEGORY_RULES.filter((r) => r.confidence < 0.9).length;

  const categoryCount = new Map<string, number>();
  CATEGORY_RULES.forEach((rule) => {
    categoryCount.set(rule.category, (categoryCount.get(rule.category) || 0) + 1);
  });

  const topCategories = Array.from(categoryCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map((e) => e[0]);

  return {
    totalRules: CATEGORY_RULES.length,
    customRules,
    corrections: userCorrections.length,
    topCategories,
  };
}
