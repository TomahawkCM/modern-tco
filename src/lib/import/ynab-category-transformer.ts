/**
 * YNAB Category Transformer (Y-013)
 * Transforms YNAB category hierarchy to Budget App Category format
 *
 * YNAB Structure:
 * - Category Group (master) → Our Category
 * - Category (child) → Our Subcategory
 *
 * Key features:
 * - Preserves YNAB category hierarchy
 * - Maps YNAB IDs to names for transaction reference
 * - Handles hidden/archived categories
 * - Auto-assigns colors and icons
 */

import type { Category } from "@/types/budget";
import type { NormalizedCategoryGroup, NormalizedCategory, ParsedYNABData } from "./ynab-parser";

// ============================================================================
// Types
// ============================================================================

export interface CategoryTransformOptions {
  /** How to handle hidden YNAB categories */
  hiddenCategoryAction: "skip" | "archive" | "import";
  /** Include system/internal categories */
  includeSystemCategories?: boolean;
  /** Merge with existing categories if names match */
  mergeWithExisting?: Category[];
  /** Custom color mappings by category name */
  customColors?: Record<string, string>;
  /** Custom icon mappings by category name */
  customIcons?: Record<string, string>;
}

export interface CategoryTransformResult {
  /** Transformed categories */
  categories: Category[];
  /** Category ID to name mapping (for transaction reference) */
  categoryIdMap: Map<string, { category: string; subcategory?: string }>;
  /** Statistics */
  stats: CategoryTransformStats;
  /** Warnings during transformation */
  warnings: string[];
}

export interface CategoryTransformStats {
  totalGroups: number;
  totalCategories: number;
  importedCategories: number;
  archivedCategories: number;
  skippedCategories: number;
  mergedCategories: number;
  newSubcategories: number;
}

// ============================================================================
// Color and Icon Mappings
// ============================================================================

const DEFAULT_CATEGORY_COLORS: Record<string, string> = {
  // Fixed Expenses (Blue family)
  "fixed expenses": "#3B82F6",
  "immediate obligations": "#2563EB",
  bills: "#1D4ED8",
  housing: "#3B82F6",
  rent: "#3B82F6",
  mortgage: "#3B82F6",

  // Flexible Spending (Green family)
  "flexible spending": "#10B981",
  "true expenses": "#059669",
  everyday: "#047857",
  variable: "#10B981",

  // Food & Dining (Orange family)
  food: "#F97316",
  dining: "#EA580C",
  groceries: "#C2410C",
  "food & dining": "#F97316",

  // Transportation (Purple family)
  transportation: "#8B5CF6",
  car: "#7C3AED",
  transit: "#6D28D9",
  auto: "#8B5CF6",

  // Utilities (Yellow family)
  utilities: "#F59E0B",
  electric: "#EAB308",
  water: "#CA8A04",

  // Entertainment (Pink family)
  entertainment: "#EC4899",
  streaming: "#DB2777",
  "fun & entertainment": "#EC4899",
  hobbies: "#EC4899",

  // Shopping (Indigo family)
  shopping: "#6366F1",
  clothing: "#4F46E5",
  "stuff i forgot to budget for": "#6366F1",

  // Health (Red family)
  health: "#EF4444",
  medical: "#DC2626",
  healthcare: "#EF4444",

  // Savings Goals (Emerald family)
  savings: "#34D399",
  goals: "#6EE7B7",
  "savings goals": "#34D399",
  "quality of life goals": "#34D399",
  emergency: "#10B981",

  // Debt (Dark Red family)
  debt: "#B91C1C",
  loans: "#991B1B",
  "debt payments": "#B91C1C",
  "credit card payments": "#B91C1C",

  // Giving (Cyan family)
  giving: "#06B6D4",
  charity: "#0891B2",
  gifts: "#0E7490",

  // Income (Teal family)
  income: "#14B8A6",
  inflow: "#0D9488",
  salary: "#0F766E",

  // Annual/Periodic (Slate family)
  "annual expenses": "#64748B",
  yearly: "#475569",
  subscriptions: "#64748B",

  // Default
  default: "#6B7280",
};

const DEFAULT_CATEGORY_ICONS: Record<string, string> = {
  // Housing
  rent: "Home",
  mortgage: "Home",
  housing: "Home",
  "home maintenance": "Wrench",

  // Utilities
  utilities: "Lightbulb",
  electric: "Zap",
  water: "Droplet",
  gas: "Flame",
  internet: "Wifi",
  phone: "Phone",

  // Food
  groceries: "ShoppingCart",
  "dining out": "UtensilsCrossed",
  food: "Apple",
  restaurant: "UtensilsCrossed",

  // Transportation
  transportation: "Car",
  "auto maintenance": "Wrench",
  "car insurance": "Shield",
  transit: "Bus",
  fuel: "Fuel",

  // Entertainment
  entertainment: "Tv",
  streaming: "Play",
  subscriptions: "CreditCard",
  hobbies: "Gamepad2",
  "fun money": "Sparkles",

  // Health
  health: "Heart",
  medical: "Stethoscope",
  fitness: "Dumbbell",
  gym: "Dumbbell",

  // Shopping
  shopping: "ShoppingBag",
  clothing: "Shirt",
  amazon: "Package",

  // Savings
  savings: "PiggyBank",
  "emergency fund": "Shield",
  vacation: "Plane",
  goals: "Target",

  // Debt
  debt: "CreditCard",
  loans: "Landmark",
  "credit card": "CreditCard",
  "student loan": "GraduationCap",

  // Giving
  giving: "Gift",
  charity: "Heart",
  gifts: "Gift",

  // Income
  income: "DollarSign",
  salary: "Wallet",
  wages: "Banknote",
  inflow: "ArrowDownCircle",

  // Insurance
  insurance: "Shield",
  "life insurance": "Shield",
  "health insurance": "Shield",

  // Education
  education: "GraduationCap",
  "school supplies": "Book",

  // Personal
  "personal care": "Smile",
  "hair care": "Scissors",

  // Default
  default: "Folder",
};

// System categories to skip
const SYSTEM_CATEGORY_PATTERNS = [
  /^internal\s+master\s+category$/i,
  /^hidden\s+categories$/i,
  /^credit\s+card\s+payments$/i,
  /^deferred\s+income/i,
  /^to\s+be\s+budgeted$/i,
  /^ready\s+to\s+assign$/i,
];

// ============================================================================
// Main Transformer
// ============================================================================

/**
 * Transform YNAB categories to Budget App format
 */
export function transformYNABCategories(
  data: ParsedYNABData,
  options: CategoryTransformOptions = { hiddenCategoryAction: "archive" }
): CategoryTransformResult {
  const warnings: string[] = [];
  const stats: CategoryTransformStats = {
    totalGroups: data.categoryGroups.length,
    totalCategories: 0,
    importedCategories: 0,
    archivedCategories: 0,
    skippedCategories: 0,
    mergedCategories: 0,
    newSubcategories: 0,
  };

  // Build existing category map for merging
  const existingCategoryMap = buildExistingCategoryMap(options.mergeWithExisting || []);

  // Build ID to name mapping
  const categoryIdMap = new Map<string, { category: string; subcategory?: string }>();

  const categories: Category[] = [];
  let orderIndex = 0;

  for (const group of data.categoryGroups) {
    // Skip system categories
    if (isSystemCategory(group.name) && !options.includeSystemCategories) {
      continue;
    }

    // Handle hidden groups
    if (group.hidden && options.hiddenCategoryAction === "skip") {
      stats.skippedCategories += group.categories.length;
      continue;
    }

    // Count total categories
    stats.totalCategories += group.categories.length;

    // Check if we should merge with existing category
    const existingCat = existingCategoryMap.get(group.name.toLowerCase());

    if (existingCat) {
      // Merge subcategories into existing category
      const result = mergeWithExisting(existingCat, group, categoryIdMap, options);
      stats.mergedCategories++;
      stats.newSubcategories += result.newSubcategoriesAdded;

      // Add ID mappings for group's categories
      for (const cat of group.categories) {
        categoryIdMap.set(cat.id, {
          category: existingCat.name,
          subcategory: cat.name,
        });
      }
    } else {
      // Create new category
      const category = createCategory(group, orderIndex++, categoryIdMap, options, warnings);

      if (category) {
        categories.push(category);
        stats.importedCategories++;

        if (category.archived) {
          stats.archivedCategories++;
        }
      }
    }
  }

  return {
    categories,
    categoryIdMap,
    stats,
    warnings: [...data.warnings, ...warnings],
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

function isSystemCategory(name: string): boolean {
  return SYSTEM_CATEGORY_PATTERNS.some((pattern) => pattern.test(name));
}

function buildExistingCategoryMap(categories: Category[]): Map<string, Category> {
  return new Map(categories.map((c) => [c.name.toLowerCase(), c]));
}

function getCategoryColor(name: string, customColors?: Record<string, string>): string {
  const lowerName = name.toLowerCase();

  // Check custom colors first
  if (customColors) {
    for (const [key, color] of Object.entries(customColors)) {
      if (lowerName.includes(key.toLowerCase())) {
        return color;
      }
    }
  }

  // Check default colors
  for (const [key, color] of Object.entries(DEFAULT_CATEGORY_COLORS)) {
    if (lowerName.includes(key)) {
      return color;
    }
  }

  return DEFAULT_CATEGORY_COLORS["default"];
}

function getCategoryIcon(name: string, customIcons?: Record<string, string>): string {
  const lowerName = name.toLowerCase();

  // Check custom icons first
  if (customIcons) {
    for (const [key, icon] of Object.entries(customIcons)) {
      if (lowerName.includes(key.toLowerCase())) {
        return icon;
      }
    }
  }

  // Check default icons
  for (const [key, icon] of Object.entries(DEFAULT_CATEGORY_ICONS)) {
    if (lowerName.includes(key)) {
      return icon;
    }
  }

  return DEFAULT_CATEGORY_ICONS["default"];
}

function determineType(groupName: string): "expense" | "income" {
  const incomePatterns = [
    /income/i,
    /inflow/i,
    /salary/i,
    /wages/i,
    /ready\s+to\s+assign/i,
    /to\s+be\s+budgeted/i,
  ];

  return incomePatterns.some((p) => p.test(groupName)) ? "income" : "expense";
}

function createCategory(
  group: NormalizedCategoryGroup,
  order: number,
  categoryIdMap: Map<string, { category: string; subcategory?: string }>,
  options: CategoryTransformOptions,
  warnings: string[]
): Category | null {
  const now = new Date();

  // Filter subcategories based on hidden settings
  const subcategories: string[] = [];

  for (const cat of group.categories) {
    if (cat.hidden && options.hiddenCategoryAction === "skip") {
      continue;
    }

    subcategories.push(cat.name);

    // Add to ID map
    categoryIdMap.set(cat.id, {
      category: group.name,
      subcategory: cat.name,
    });
  }

  if (subcategories.length === 0 && group.categories.length > 0) {
    warnings.push(`Skipped empty category group: ${group.name}`);
    return null;
  }

  const isArchived = group.hidden && options.hiddenCategoryAction === "archive";

  return {
    id: crypto.randomUUID(),
    name: group.name,
    type: determineType(group.name),
    subcategories,
    color: getCategoryColor(group.name, options.customColors),
    icon: getCategoryIcon(group.name, options.customIcons),
    isDefault: false,
    order,
    archived: isArchived,
    archivedAt: isArchived ? now : undefined,
    createdAt: now,
  };
}

function mergeWithExisting(
  existing: Category,
  group: NormalizedCategoryGroup,
  categoryIdMap: Map<string, { category: string; subcategory?: string }>,
  options: CategoryTransformOptions
): { newSubcategoriesAdded: number } {
  let newSubcategoriesAdded = 0;

  for (const cat of group.categories) {
    if (cat.hidden && options.hiddenCategoryAction === "skip") {
      continue;
    }

    // Check if subcategory already exists (case-insensitive)
    const existsInSubcategories = existing.subcategories.some(
      (sub) => sub.toLowerCase() === cat.name.toLowerCase()
    );

    if (!existsInSubcategories) {
      existing.subcategories.push(cat.name);
      newSubcategoriesAdded++;
    }

    // Add to ID map
    categoryIdMap.set(cat.id, {
      category: existing.name,
      subcategory: cat.name,
    });
  }

  return { newSubcategoriesAdded };
}

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Quick transform with default options
 */
export function quickTransformCategories(data: ParsedYNABData): CategoryTransformResult {
  return transformYNABCategories(data, {
    hiddenCategoryAction: "archive",
    includeSystemCategories: false,
  });
}

/**
 * Transform and merge with existing categories
 */
export function transformAndMergeCategories(
  data: ParsedYNABData,
  existingCategories: Category[]
): CategoryTransformResult {
  return transformYNABCategories(data, {
    hiddenCategoryAction: "archive",
    includeSystemCategories: false,
    mergeWithExisting: existingCategories,
  });
}

/**
 * Get all unique category names from YNAB data
 */
export function extractCategoryNames(data: ParsedYNABData): {
  groups: string[];
  categories: string[];
  mapping: Map<string, string[]>;
} {
  const groups: string[] = [];
  const categories: string[] = [];
  const mapping = new Map<string, string[]>();

  for (const group of data.categoryGroups) {
    if (isSystemCategory(group.name)) continue;

    groups.push(group.name);
    const groupCategories: string[] = [];

    for (const cat of group.categories) {
      categories.push(cat.name);
      groupCategories.push(cat.name);
    }

    mapping.set(group.name, groupCategories);
  }

  return { groups, categories, mapping };
}

/**
 * Create a category ID lookup for use during transaction import
 */
export function buildCategoryLookup(
  data: ParsedYNABData
): Map<string, { category: string; subcategory?: string }> {
  const result = transformYNABCategories(data, {
    hiddenCategoryAction: "import",
  });
  return result.categoryIdMap;
}
