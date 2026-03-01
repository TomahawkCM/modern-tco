/**
 * Unit Tests for Duplicate Detection Module
 * Tests basic and smart duplicate detection with Claude API integration
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { detectDuplicates, calculateSimilarity } from "../csv-parser";
import { cleanDescription } from "@/lib/ai/smart-duplicate-detection";
import type { ParsedTransaction, Transaction } from "@/types/budget";

// Mock smart-duplicate-detection: pass through real exports but wrap
// detectDuplicatesEnhanced as a spy so individual tests can override it
vi.mock("@/lib/ai/smart-duplicate-detection", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/ai/smart-duplicate-detection")>();
  return {
    ...actual,
    detectDuplicatesEnhanced: vi.fn().mockImplementation(actual.detectDuplicatesEnhanced),
  };
});

describe("Duplicate Detection Module", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ========================================
  // Basic Duplicate Detection Tests
  // ========================================
  describe("Basic Duplicate Detection", () => {
    it("should detect exact duplicates (same date, amount, description)", async () => {
      const existing: Transaction[] = [
        {
          id: "tx1",
          accountId: "acc1",
          date: new Date("2025-01-15"),
          description: "STARBUCKS",
          amount: -4.5,
          category: null,
          subcategory: null,
          notes: "",
          isRecurring: false,
          tags: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const newTxs: ParsedTransaction[] = [
        {
          date: new Date("2025-01-15"),
          description: "STARBUCKS",
          amount: -4.5,
          isDuplicate: false,
          confidence: 1.0,
        },
      ];

      await detectDuplicates(newTxs, existing, false);

      expect(newTxs[0].isDuplicate).toBe(true);
      expect(newTxs[0].confidence).toBeGreaterThan(0.8);
    });

    it("should detect duplicates with similar descriptions", async () => {
      const existing: Transaction[] = [
        {
          id: "tx1",
          accountId: "acc1",
          date: new Date("2025-01-15"),
          description: "STARBUCKS COFFEE",
          amount: -4.5,
          category: null,
          subcategory: null,
          notes: "",
          isRecurring: false,
          tags: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const newTxs: ParsedTransaction[] = [
        {
          date: new Date("2025-01-15"),
          description: "STARBUCKS",
          amount: -4.5,
          isDuplicate: false,
          confidence: 1.0,
        },
      ];

      await detectDuplicates(newTxs, existing, false);

      expect(newTxs[0].isDuplicate).toBe(true);
    });

    it("should not mark as duplicate if amounts differ", async () => {
      const existing: Transaction[] = [
        {
          id: "tx1",
          accountId: "acc1",
          date: new Date("2025-01-15"),
          description: "STARBUCKS",
          amount: -4.5,
          category: null,
          subcategory: null,
          notes: "",
          isRecurring: false,
          tags: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const newTxs: ParsedTransaction[] = [
        {
          date: new Date("2025-01-15"),
          description: "STARBUCKS",
          amount: -5.5, // Different amount
          isDuplicate: false,
          confidence: 1.0,
        },
      ];

      await detectDuplicates(newTxs, existing, false);

      expect(newTxs[0].isDuplicate).toBe(false);
    });

    it("should not mark as duplicate if dates differ significantly", async () => {
      const existing: Transaction[] = [
        {
          id: "tx1",
          accountId: "acc1",
          date: new Date("2025-01-15"),
          description: "STARBUCKS",
          amount: -4.5,
          category: null,
          subcategory: null,
          notes: "",
          isRecurring: false,
          tags: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const newTxs: ParsedTransaction[] = [
        {
          date: new Date("2025-02-15"), // Different month
          description: "STARBUCKS",
          amount: -4.5,
          isDuplicate: false,
          confidence: 1.0,
        },
      ];

      await detectDuplicates(newTxs, existing, false);

      expect(newTxs[0].isDuplicate).toBe(false);
    });

    it("should handle FITID matches (OFX perfect duplicates)", async () => {
      const existing: Transaction[] = [
        {
          id: "tx1",
          accountId: "acc1",
          date: new Date("2025-01-15"),
          description: "STARBUCKS",
          amount: -4.5,
          category: null,
          subcategory: null,
          notes: "",
          isRecurring: false,
          tags: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          // @ts-ignore - FITID is stored in a custom field
          fitid: "FITID123",
        },
      ];

      const newTxs: ParsedTransaction[] = [
        {
          date: new Date("2025-01-15"),
          description: "STARBUCKS COFFEE SHOP",
          amount: -4.5,
          isDuplicate: false,
          confidence: 1.0,
          fitid: "FITID123", // Same FITID
        },
      ];

      await detectDuplicates(newTxs, existing, false);

      expect(newTxs[0].isDuplicate).toBe(true);
      expect(newTxs[0].confidence).toBe(1.0);
    });
  });

  // ========================================
  // Smart Duplicate Detection Tests
  // ========================================
  describe("Smart Duplicate Detection (Claude API)", () => {
    it("should use smart detection when enabled and fall back on error", async () => {
      const { detectDuplicatesEnhanced } = await import("@/lib/ai/smart-duplicate-detection");

      // Make smart detection throw to verify fallback
      vi.mocked(detectDuplicatesEnhanced).mockRejectedValueOnce(new Error("API Error"));

      const existing: Transaction[] = [
        {
          id: "tx1",
          accountId: "acc1",
          date: new Date("2025-01-15"),
          description: "STARBUCKS",
          amount: -4.5,
          category: null,
          subcategory: null,
          notes: "",
          isRecurring: false,
          tags: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const newTxs: ParsedTransaction[] = [
        {
          date: new Date("2025-01-15"),
          description: "STARBUCKS",
          amount: -4.5,
          isDuplicate: false,
          confidence: 1.0,
        },
      ];

      // Should not crash — falls back to basic detection
      await expect(detectDuplicates(newTxs, existing, true)).resolves.not.toThrow();

      // Basic fallback should still detect the exact match
      expect(newTxs[0].isDuplicate).toBe(true);
    });

    it("should fallback to basic detection when Claude API is disabled", async () => {
      const existing: Transaction[] = [
        {
          id: "tx1",
          accountId: "acc1",
          date: new Date("2025-01-15"),
          description: "STARBUCKS",
          amount: -4.5,
          category: null,
          subcategory: null,
          notes: "",
          isRecurring: false,
          tags: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const newTxs: ParsedTransaction[] = [
        {
          date: new Date("2025-01-15"),
          description: "STARBUCKS",
          amount: -4.5,
          isDuplicate: false,
          confidence: 1.0,
        },
      ];

      await detectDuplicates(newTxs, existing, false);

      expect(newTxs[0].isDuplicate).toBe(true);
    });

    it("should handle API errors gracefully", async () => {
      const { detectDuplicatesEnhanced } = await import("@/lib/ai/smart-duplicate-detection");

      vi.mocked(detectDuplicatesEnhanced).mockRejectedValueOnce(new Error("API Error"));

      const existing: Transaction[] = [
        {
          id: "tx1",
          accountId: "acc1",
          date: new Date("2025-01-15"),
          description: "STARBUCKS",
          amount: -4.5,
          category: null,
          subcategory: null,
          notes: "",
          isRecurring: false,
          tags: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const newTxs: ParsedTransaction[] = [
        {
          date: new Date("2025-01-15"),
          description: "STARBUCKS",
          amount: -4.5,
          isDuplicate: false,
          confidence: 1.0,
        },
      ];

      // Should not crash, should fallback to basic detection
      await expect(detectDuplicates(newTxs, existing, true)).resolves.not.toThrow();
    });
  });

  // ========================================
  // Description Cleaning Tests
  // ========================================
  describe("Description Cleaning", () => {
    it("should remove account numbers from descriptions", () => {
      const cleaned = cleanDescription("AMAZON.COM XXXX-1234");
      expect(cleaned).not.toContain("XXXX-1234");
      expect(cleaned).not.toContain("1234");
    });

    it("should remove transaction IDs", () => {
      const cleaned = cleanDescription("STARBUCKS 1234567890123456");
      expect(cleaned).not.toContain("1234567890123456");
    });

    it("should remove BMO prefixes", () => {
      const cleaned = cleanDescription("[PR] STARBUCKS");
      expect(cleaned).toBe("STARBUCKS");
    });

    it("should remove dates from descriptions", () => {
      const cleaned = cleanDescription("STARBUCKS 01/15/2025");
      expect(cleaned).not.toContain("01/15/2025");
    });

    it("should preserve merchant name", () => {
      const cleaned = cleanDescription("AMAZON.COM ORDER #123");
      expect(cleaned).toContain("AMAZON");
    });
  });

  // ========================================
  // Similarity Calculation Tests
  // ========================================
  describe("Similarity Calculation", () => {
    it("should return 1.0 for identical strings", () => {
      const similarity = calculateSimilarity("STARBUCKS", "STARBUCKS");
      expect(similarity).toBe(1.0);
    });

    it("should return high similarity for similar strings", () => {
      const similarity = calculateSimilarity("STARBUCKS", "STARBUCKS COFFEE");
      expect(similarity).toBeGreaterThan(0.5);
    });

    it("should return low similarity for different strings", () => {
      const similarity = calculateSimilarity("STARBUCKS", "AMAZON");
      expect(similarity).toBeLessThan(0.5);
    });

    it("should be case-insensitive", () => {
      const similarity1 = calculateSimilarity("STARBUCKS", "starbucks");
      const similarity2 = calculateSimilarity("STARBUCKS", "STARBUCKS");
      expect(similarity1).toBe(similarity2);
    });
  });

  // ========================================
  // Edge Cases
  // ========================================
  describe("Edge Cases", () => {
    it("should handle empty transaction arrays", async () => {
      const existing: Transaction[] = [];
      const newTxs: ParsedTransaction[] = [];

      await expect(detectDuplicates(newTxs, existing, false)).resolves.not.toThrow();
    });

    it("should handle transactions without categories", async () => {
      const existing: Transaction[] = [
        {
          id: "tx1",
          accountId: "acc1",
          date: new Date("2025-01-15"),
          description: "STARBUCKS",
          amount: -4.5,
          category: null,
          subcategory: null,
          notes: "",
          isRecurring: false,
          tags: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const newTxs: ParsedTransaction[] = [
        {
          date: new Date("2025-01-15"),
          description: "STARBUCKS",
          amount: -4.5,
          isDuplicate: false,
          confidence: 1.0,
        },
      ];

      await detectDuplicates(newTxs, existing, false);
      expect(newTxs[0].isDuplicate).toBe(true);
    });

    it("should handle very long descriptions", async () => {
      const longDesc = "A".repeat(1000);
      const existing: Transaction[] = [
        {
          id: "tx1",
          accountId: "acc1",
          date: new Date("2025-01-15"),
          description: longDesc,
          amount: -4.5,
          category: null,
          subcategory: null,
          notes: "",
          isRecurring: false,
          tags: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const newTxs: ParsedTransaction[] = [
        {
          date: new Date("2025-01-15"),
          description: longDesc,
          amount: -4.5,
          isDuplicate: false,
          confidence: 1.0,
        },
      ];

      await detectDuplicates(newTxs, existing, false);
      expect(newTxs[0].isDuplicate).toBe(true);
    });
  });
});
