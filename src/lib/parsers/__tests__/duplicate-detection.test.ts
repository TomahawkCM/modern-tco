/**
 * Unit Tests for Duplicate Detection Module
 * Tests basic and smart duplicate detection with Claude API integration
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  detectDuplicates,
  calculateSimilarity,
} from '../csv-parser';
import {
  detectSmartDuplicates,
  detectDuplicatesEnhanced,
  cleanDescription,
} from '@/lib/ai/smart-duplicate-detection';
import type { ParsedTransaction, Transaction } from '@/types/budget';

describe('Duplicate Detection Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ========================================
  // Basic Duplicate Detection Tests
  // ========================================
  describe('Basic Duplicate Detection', () => {
    it('should detect exact duplicates (same date, amount, description)', async () => {
      const existing: Transaction[] = [
        {
          id: 'tx1',
          accountId: 'acc1',
          date: new Date('2025-01-15'),
          description: 'STARBUCKS',
          amount: -4.50,
          category: null,
          subcategory: null,
          notes: '',
          isRecurring: false,
          tags: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const newTxs: ParsedTransaction[] = [
        {
          date: new Date('2025-01-15'),
          description: 'STARBUCKS',
          amount: -4.50,
          isDuplicate: false,
          confidence: 1.0,
        },
      ];

      await detectDuplicates(newTxs, existing, false);

      expect(newTxs[0].isDuplicate).toBe(true);
      expect(newTxs[0].confidence).toBeGreaterThan(0.8);
    });

    it('should detect duplicates with similar descriptions', async () => {
      const existing: Transaction[] = [
        {
          id: 'tx1',
          accountId: 'acc1',
          date: new Date('2025-01-15'),
          description: 'STARBUCKS COFFEE',
          amount: -4.50,
          category: null,
          subcategory: null,
          notes: '',
          isRecurring: false,
          tags: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const newTxs: ParsedTransaction[] = [
        {
          date: new Date('2025-01-15'),
          description: 'STARBUCKS',
          amount: -4.50,
          isDuplicate: false,
          confidence: 1.0,
        },
      ];

      await detectDuplicates(newTxs, existing, false);

      expect(newTxs[0].isDuplicate).toBe(true);
    });

    it('should not mark as duplicate if amounts differ', async () => {
      const existing: Transaction[] = [
        {
          id: 'tx1',
          accountId: 'acc1',
          date: new Date('2025-01-15'),
          description: 'STARBUCKS',
          amount: -4.50,
          category: null,
          subcategory: null,
          notes: '',
          isRecurring: false,
          tags: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const newTxs: ParsedTransaction[] = [
        {
          date: new Date('2025-01-15'),
          description: 'STARBUCKS',
          amount: -5.50, // Different amount
          isDuplicate: false,
          confidence: 1.0,
        },
      ];

      await detectDuplicates(newTxs, existing, false);

      expect(newTxs[0].isDuplicate).toBe(false);
    });

    it('should not mark as duplicate if dates differ significantly', async () => {
      const existing: Transaction[] = [
        {
          id: 'tx1',
          accountId: 'acc1',
          date: new Date('2025-01-15'),
          description: 'STARBUCKS',
          amount: -4.50,
          category: null,
          subcategory: null,
          notes: '',
          isRecurring: false,
          tags: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const newTxs: ParsedTransaction[] = [
        {
          date: new Date('2025-02-15'), // Different month
          description: 'STARBUCKS',
          amount: -4.50,
          isDuplicate: false,
          confidence: 1.0,
        },
      ];

      await detectDuplicates(newTxs, existing, false);

      expect(newTxs[0].isDuplicate).toBe(false);
    });

    it('should handle FITID matches (OFX perfect duplicates)', async () => {
      const existing: Transaction[] = [
        {
          id: 'tx1',
          accountId: 'acc1',
          date: new Date('2025-01-15'),
          description: 'STARBUCKS',
          amount: -4.50,
          category: null,
          subcategory: null,
          notes: '',
          isRecurring: false,
          tags: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          // @ts-ignore - FITID is stored in a custom field
          fitid: 'FITID123',
        },
      ];

      const newTxs: ParsedTransaction[] = [
        {
          date: new Date('2025-01-15'),
          description: 'STARBUCKS COFFEE SHOP',
          amount: -4.50,
          isDuplicate: false,
          confidence: 1.0,
          fitid: 'FITID123', // Same FITID
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
  describe('Smart Duplicate Detection (Claude API)', () => {
    it('should detect semantic duplicates (AMAZON PRIME vs AMZN MKTP CA)', async () => {
      const existing: Transaction[] = [
        {
          id: 'tx1',
          accountId: 'acc1',
          date: new Date('2025-01-15'),
          description: 'AMAZON PRIME',
          amount: -12.99,
          category: null,
          subcategory: null,
          notes: '',
          isRecurring: false,
          tags: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const newTxs: ParsedTransaction[] = [
        {
          date: new Date('2025-01-15'),
          description: 'AMZN MKTP CA',
          amount: -12.99,
          isDuplicate: false,
          confidence: 1.0,
        },
      ];

      // Mock Claude API response
      vi.mock('@anthropic-ai/sdk', () => ({
        default: vi.fn().mockImplementation(() => ({
          messages: {
            create: vi.fn().mockResolvedValue({
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    isDuplicate: true,
                    confidence: 0.95,
                    reason: 'Both refer to Amazon Prime subscription',
                  }),
                },
              ],
            }),
          },
        })),
      }));

      // Mock privacy settings
      vi.mock('@/lib/budget-privacy-settings', () => ({
        isSmartDuplicateDetectionEnabled: () => true,
        isClaudeAPIEnabled: () => true,
      }));

      await detectDuplicates(newTxs, existing, true);

      // Should mark as duplicate with high confidence
      expect(newTxs[0].isDuplicate).toBe(true);
      expect(newTxs[0].confidence).toBeGreaterThan(0.7);
    });

    it('should fallback to basic detection when Claude API is disabled', async () => {
      const existing: Transaction[] = [
        {
          id: 'tx1',
          accountId: 'acc1',
          date: new Date('2025-01-15'),
          description: 'STARBUCKS',
          amount: -4.50,
          category: null,
          subcategory: null,
          notes: '',
          isRecurring: false,
          tags: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const newTxs: ParsedTransaction[] = [
        {
          date: new Date('2025-01-15'),
          description: 'STARBUCKS',
          amount: -4.50,
          isDuplicate: false,
          confidence: 1.0,
        },
      ];

      await detectDuplicates(newTxs, existing, false);

      expect(newTxs[0].isDuplicate).toBe(true);
    });

    it('should handle API errors gracefully', async () => {
      const existing: Transaction[] = [
        {
          id: 'tx1',
          accountId: 'acc1',
          date: new Date('2025-01-15'),
          description: 'STARBUCKS',
          amount: -4.50,
          category: null,
          subcategory: null,
          notes: '',
          isRecurring: false,
          tags: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const newTxs: ParsedTransaction[] = [
        {
          date: new Date('2025-01-15'),
          description: 'STARBUCKS',
          amount: -4.50,
          isDuplicate: false,
          confidence: 1.0,
        },
      ];

      // Mock API error
      vi.mock('@/lib/ai/smart-duplicate-detection', () => ({
        detectDuplicatesEnhanced: vi.fn().mockRejectedValue(new Error('API Error')),
      }));

      // Should not crash, should fallback to basic detection
      await expect(detectDuplicates(newTxs, existing, true)).resolves.not.toThrow();
    });
  });

  // ========================================
  // Description Cleaning Tests
  // ========================================
  describe('Description Cleaning', () => {
    it('should remove account numbers from descriptions', () => {
      const cleaned = cleanDescription('AMAZON.COM XXXX-1234');
      expect(cleaned).not.toContain('XXXX-1234');
      expect(cleaned).not.toContain('1234');
    });

    it('should remove transaction IDs', () => {
      const cleaned = cleanDescription('STARBUCKS 1234567890123456');
      expect(cleaned).not.toContain('1234567890123456');
    });

    it('should remove BMO prefixes', () => {
      const cleaned = cleanDescription('[PR] STARBUCKS');
      expect(cleaned).toBe('STARBUCKS');
    });

    it('should remove dates from descriptions', () => {
      const cleaned = cleanDescription('STARBUCKS 01/15/2025');
      expect(cleaned).not.toContain('01/15/2025');
    });

    it('should preserve merchant name', () => {
      const cleaned = cleanDescription('AMAZON.COM ORDER #123');
      expect(cleaned).toContain('AMAZON');
    });
  });

  // ========================================
  // Similarity Calculation Tests
  // ========================================
  describe('Similarity Calculation', () => {
    it('should return 1.0 for identical strings', () => {
      const similarity = calculateSimilarity('STARBUCKS', 'STARBUCKS');
      expect(similarity).toBe(1.0);
    });

    it('should return high similarity for similar strings', () => {
      const similarity = calculateSimilarity('STARBUCKS', 'STARBUCKS COFFEE');
      expect(similarity).toBeGreaterThan(0.5);
    });

    it('should return low similarity for different strings', () => {
      const similarity = calculateSimilarity('STARBUCKS', 'AMAZON');
      expect(similarity).toBeLessThan(0.5);
    });

    it('should be case-insensitive', () => {
      const similarity1 = calculateSimilarity('STARBUCKS', 'starbucks');
      const similarity2 = calculateSimilarity('STARBUCKS', 'STARBUCKS');
      expect(similarity1).toBe(similarity2);
    });
  });

  // ========================================
  // Edge Cases
  // ========================================
  describe('Edge Cases', () => {
    it('should handle empty transaction arrays', async () => {
      const existing: Transaction[] = [];
      const newTxs: ParsedTransaction[] = [];

      await expect(detectDuplicates(newTxs, existing, false)).resolves.not.toThrow();
    });

    it('should handle transactions without categories', async () => {
      const existing: Transaction[] = [
        {
          id: 'tx1',
          accountId: 'acc1',
          date: new Date('2025-01-15'),
          description: 'STARBUCKS',
          amount: -4.50,
          category: null,
          subcategory: null,
          notes: '',
          isRecurring: false,
          tags: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const newTxs: ParsedTransaction[] = [
        {
          date: new Date('2025-01-15'),
          description: 'STARBUCKS',
          amount: -4.50,
          isDuplicate: false,
          confidence: 1.0,
        },
      ];

      await detectDuplicates(newTxs, existing, false);
      expect(newTxs[0].isDuplicate).toBe(true);
    });

    it('should handle very long descriptions', async () => {
      const longDesc = 'A'.repeat(1000);
      const existing: Transaction[] = [
        {
          id: 'tx1',
          accountId: 'acc1',
          date: new Date('2025-01-15'),
          description: longDesc,
          amount: -4.50,
          category: null,
          subcategory: null,
          notes: '',
          isRecurring: false,
          tags: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const newTxs: ParsedTransaction[] = [
        {
          date: new Date('2025-01-15'),
          description: longDesc,
          amount: -4.50,
          isDuplicate: false,
          confidence: 1.0,
        },
      ];

      await detectDuplicates(newTxs, existing, false);
      expect(newTxs[0].isDuplicate).toBe(true);
    });
  });
});

