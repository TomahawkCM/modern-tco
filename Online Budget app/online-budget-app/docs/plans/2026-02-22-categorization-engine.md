# Categorization Engine Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a pure, deterministic categorization engine that classifies transactions by merchant name/description using rule-based pattern matching with confidence scoring.

**Architecture:** `engine/categorization/` module with three layers: (1) types defining the data contracts, (2) a rule registry of regex patterns mapped to category keys, (3) a core `categorize()` function that cascades through merchant rules then pattern rules. All functions are pure — no DB, no AI, no side effects. Category keys match the seeded `categories.key` values from migration 004.

**Tech Stack:** TypeScript (strict), Vitest for TDD, regex pattern matching.

---

### Task 1: Types and Interfaces

**Files:**
- Create: `engine/categorization/types.ts`
- Test: None (type-only file)

**Step 1: Create type definitions**

```typescript
// engine/categorization/types.ts

/** Result returned by the categorization engine */
export interface CategorizationResult {
  /** Category key matching categories.key in DB (e.g. "groceries") */
  readonly categoryKey: string;
  /** Parent category key (e.g. "food_dining") */
  readonly parentKey: string;
  /** Confidence score 0-1 */
  readonly confidence: number;
  /** How the match was determined */
  readonly method: "merchant_rule" | "pattern_rule";
}

/** A merchant-specific rule (exact token match, highest priority) */
export interface MerchantRule {
  /** Normalized merchant token (uppercase, trimmed) */
  readonly merchantToken: string;
  /** Display name for the merchant */
  readonly displayName: string;
  /** Category key */
  readonly categoryKey: string;
  /** Parent category key */
  readonly parentKey: string;
}

/** A regex pattern rule (fallback after merchant rules) */
export interface PatternRule {
  /** Regex pattern to test against description */
  readonly pattern: RegExp;
  /** Category key */
  readonly categoryKey: string;
  /** Parent category key */
  readonly parentKey: string;
  /** Confidence score for this rule (0.85-0.95) */
  readonly confidence: number;
}
```

**Step 2: Run type check**

Run: `npx tsc --noEmit`
Expected: Exit 0

---

### Task 2: Merchant Token Extraction

**Files:**
- Create: `engine/categorization/tokenizer.ts`
- Test: `engine/categorization/tokenizer.test.ts`

**Step 1: Write failing tests**

```typescript
// engine/categorization/tokenizer.test.ts
import { describe, it, expect } from "vitest";
import { extractMerchantToken } from "./tokenizer";

describe("extractMerchantToken", () => {
  it("extracts and uppercases simple merchant name", () => {
    expect(extractMerchantToken("Whole Foods Market")).toBe("WHOLE FOODS MARKET");
  });

  it("strips trailing reference numbers", () => {
    expect(extractMerchantToken("NETFLIX.COM  #123456")).toBe("NETFLIX.COM");
  });

  it("strips trailing location codes", () => {
    expect(extractMerchantToken("STARBUCKS  TORONTO ON")).toBe("STARBUCKS");
  });

  it("strips date patterns", () => {
    expect(extractMerchantToken("UBER EATS 15FEB2026")).toBe("UBER EATS");
  });

  it("returns null for generic descriptions", () => {
    expect(extractMerchantToken("PAYMENT RECEIVED")).toBeNull();
    expect(extractMerchantToken("TRANSFER")).toBeNull();
    expect(extractMerchantToken("DEPOSIT")).toBeNull();
  });

  it("returns null for empty or too-short input", () => {
    expect(extractMerchantToken("")).toBeNull();
    expect(extractMerchantToken("AB")).toBeNull();
  });

  it("returns null for all-numeric tokens", () => {
    expect(extractMerchantToken("123456789")).toBeNull();
  });

  it("trims whitespace", () => {
    expect(extractMerchantToken("  COSTCO  ")).toBe("COSTCO");
  });
});
```

**Step 2: Run tests, verify red**

Run: `npx vitest run engine/categorization/tokenizer.test.ts`
Expected: FAIL

**Step 3: Implement tokenizer**

```typescript
// engine/categorization/tokenizer.ts

const GENERIC_TOKENS = new Set([
  "PAYMENT", "TRANSFER", "DEPOSIT", "WITHDRAWAL", "DEBIT",
  "CREDIT", "PURCHASE", "ONLINE PURCHASE", "PAYMENT RECEIVED",
  "DIRECT DEPOSIT", "E-TRANSFER", "INTERAC", "ATM",
  "FEE", "INTEREST", "CHARGE", "REFUND",
]);

const DATE_PATTERN = /\s+\d{1,2}(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)\d{2,4}$/i;
const REF_NUMBER_PATTERN = /\s+#\d+$/;
const LOCATION_SUFFIX = /\s+[A-Z]{2,3}\s*$/;
const TRAILING_DIGITS = /\s+\d{3,}$/;

/**
 * Extract a normalized merchant token from a transaction description.
 * Returns null if the description is generic, too short, or all digits.
 */
export function extractMerchantToken(description: string): string | null {
  let token = description.trim().toUpperCase();

  if (token.length < 3) return null;

  // Strip trailing noise
  token = token
    .replace(DATE_PATTERN, "")
    .replace(REF_NUMBER_PATTERN, "")
    .replace(TRAILING_DIGITS, "")
    .replace(LOCATION_SUFFIX, "")
    .trim();

  if (token.length < 3) return null;
  if (/^\d+$/.test(token)) return null;
  if (GENERIC_TOKENS.has(token)) return null;

  return token;
}
```

**Step 4: Run tests, verify green**

Run: `npx vitest run engine/categorization/tokenizer.test.ts`
Expected: All 8 tests PASS

---

### Task 3: Pattern Rules Registry

**Files:**
- Create: `engine/categorization/rules.ts`
- Test: `engine/categorization/rules.test.ts`

**Step 1: Write failing tests**

```typescript
// engine/categorization/rules.test.ts
import { describe, it, expect } from "vitest";
import { PATTERN_RULES } from "./rules";

describe("PATTERN_RULES", () => {
  it("has rules for all major expense categories", () => {
    const parentKeys = new Set(PATTERN_RULES.map((r) => r.parentKey));
    expect(parentKeys.has("food_dining")).toBe(true);
    expect(parentKeys.has("transportation")).toBe(true);
    expect(parentKeys.has("bills_utilities")).toBe(true);
    expect(parentKeys.has("shopping")).toBe(true);
    expect(parentKeys.has("entertainment")).toBe(true);
    expect(parentKeys.has("health_fitness")).toBe(true);
    expect(parentKeys.has("housing")).toBe(true);
  });

  it("has rules for income categories", () => {
    const parentKeys = new Set(PATTERN_RULES.map((r) => r.parentKey));
    expect(parentKeys.has("income")).toBe(true);
  });

  it("has rules for transfer categories", () => {
    const parentKeys = new Set(PATTERN_RULES.map((r) => r.parentKey));
    expect(parentKeys.has("transfers")).toBe(true);
  });

  it("all rules have confidence between 0.8 and 1.0", () => {
    for (const rule of PATTERN_RULES) {
      expect(rule.confidence).toBeGreaterThanOrEqual(0.8);
      expect(rule.confidence).toBeLessThanOrEqual(1.0);
    }
  });

  it("all patterns are case-insensitive", () => {
    for (const rule of PATTERN_RULES) {
      expect(rule.pattern.flags).toContain("i");
    }
  });

  it("matches known merchants correctly", () => {
    const groceryRule = PATTERN_RULES.find(
      (r) => r.categoryKey === "groceries" && r.pattern.test("WHOLE FOODS")
    );
    expect(groceryRule).toBeDefined();

    const coffeeRule = PATTERN_RULES.find(
      (r) => r.categoryKey === "coffee_shops" && r.pattern.test("STARBUCKS")
    );
    expect(coffeeRule).toBeDefined();
  });
});
```

**Step 2: Run tests, verify red**

**Step 3: Implement rules registry**

Create `engine/categorization/rules.ts` with a curated set of global pattern rules (not 265+ — keep it manageable, ~60-80 rules covering common global merchants). Each rule maps to seeded category keys from migration 004.

**Step 4: Run tests, verify green**

---

### Task 4: Core Categorize Function

**Files:**
- Create: `engine/categorization/categorize.ts`
- Test: `engine/categorization/categorize.test.ts`

**Step 1: Write failing tests**

```typescript
// engine/categorization/categorize.test.ts
import { describe, it, expect } from "vitest";
import { categorize } from "./categorize";
import type { MerchantRule } from "./types";

describe("categorize", () => {
  const merchantRules: MerchantRule[] = [
    {
      merchantToken: "COSTCO WHOLESALE",
      displayName: "Costco",
      categoryKey: "groceries",
      parentKey: "food_dining",
    },
  ];

  it("matches merchant rule with highest confidence", () => {
    const result = categorize("COSTCO WHOLESALE #1234", merchantRules);
    expect(result).not.toBeNull();
    expect(result!.categoryKey).toBe("groceries");
    expect(result!.method).toBe("merchant_rule");
    expect(result!.confidence).toBe(0.99);
  });

  it("falls back to pattern rules when no merchant match", () => {
    const result = categorize("NETFLIX.COM", []);
    expect(result).not.toBeNull();
    expect(result!.categoryKey).toBe("streaming");
    expect(result!.parentKey).toBe("entertainment");
    expect(result!.method).toBe("pattern_rule");
  });

  it("returns null for unrecognized description", () => {
    const result = categorize("XYZZY CORP MYSTERIOUS PAYMENT", []);
    expect(result).toBeNull();
  });

  it("prefers merchant rules over pattern rules", () => {
    // Merchant rule maps Netflix to a custom category
    const customRules: MerchantRule[] = [
      {
        merchantToken: "NETFLIX.COM",
        displayName: "Netflix",
        categoryKey: "bills_utilities",
        parentKey: "bills_utilities",
      },
    ];
    const result = categorize("NETFLIX.COM", customRules);
    expect(result!.categoryKey).toBe("bills_utilities");
    expect(result!.method).toBe("merchant_rule");
  });

  it("handles empty description gracefully", () => {
    const result = categorize("", []);
    expect(result).toBeNull();
  });

  it("matches case-insensitively", () => {
    const result = categorize("starbucks coffee", []);
    expect(result).not.toBeNull();
    expect(result!.parentKey).toBe("food_dining");
  });

  it("categorizes salary/payroll as income", () => {
    const result = categorize("PAYROLL DEPOSIT ACME INC", []);
    expect(result).not.toBeNull();
    expect(result!.categoryKey).toBe("salary");
    expect(result!.parentKey).toBe("income");
  });

  it("categorizes transfers correctly", () => {
    const result = categorize("TRANSFER TO SAVINGS", []);
    expect(result).not.toBeNull();
    expect(result!.parentKey).toBe("transfers");
  });
});
```

**Step 2: Run tests, verify red**

**Step 3: Implement categorize function**

```typescript
// engine/categorization/categorize.ts
import { extractMerchantToken } from "./tokenizer";
import { PATTERN_RULES } from "./rules";
import type { CategorizationResult, MerchantRule } from "./types";

/**
 * Categorize a transaction description using a two-tier cascade:
 * 1. Merchant rules (exact token match, confidence 0.99)
 * 2. Pattern rules (regex match, confidence 0.85-0.95)
 *
 * Returns null if no match found.
 */
export function categorize(
  description: string,
  merchantRules: MerchantRule[]
): CategorizationResult | null {
  if (!description || description.trim().length === 0) return null;

  // Tier 1: Merchant rule match (highest priority)
  const token = extractMerchantToken(description);
  if (token) {
    const merchantMatch = merchantRules.find(
      (r) => r.merchantToken === token
    );
    if (merchantMatch) {
      return {
        categoryKey: merchantMatch.categoryKey,
        parentKey: merchantMatch.parentKey,
        confidence: 0.99,
        method: "merchant_rule",
      };
    }
  }

  // Tier 2: Pattern rule match (fallback)
  const upper = description.toUpperCase();
  for (const rule of PATTERN_RULES) {
    if (rule.pattern.test(upper)) {
      return {
        categoryKey: rule.categoryKey,
        parentKey: rule.parentKey,
        confidence: rule.confidence,
        method: "pattern_rule",
      };
    }
  }

  return null;
}
```

**Step 4: Run tests, verify green**

---

### Task 5: Module Barrel Export + Engine Integration

**Files:**
- Create: `engine/categorization/index.ts`
- Modify: `engine/index.ts`

**Step 1: Create barrel export**

```typescript
// engine/categorization/index.ts
export type {
  CategorizationResult,
  MerchantRule,
  PatternRule,
} from "./types";
export { extractMerchantToken } from "./tokenizer";
export { categorize } from "./categorize";
export { PATTERN_RULES } from "./rules";
```

**Step 2: Add to engine entry point**

Add to `engine/index.ts`:
```typescript
// Categorization module
export type {
  CategorizationResult,
  MerchantRule,
  PatternRule,
} from "./categorization";
export { categorize, extractMerchantToken, PATTERN_RULES } from "./categorization";
```

**Step 3: Run full test suite + type check**

Run: `npx vitest run && npx tsc --noEmit`
Expected: All tests pass, exit 0

---

### Task 6: Verify and Update Progress Log

- `npx tsc --noEmit` — exit 0
- `npx vitest run` — all tests pass
- Confirm no financial math outside engine/
- Confirm no DB calls in engine/categorization/
- Update `docs/PROGRESS_LOG.md`
