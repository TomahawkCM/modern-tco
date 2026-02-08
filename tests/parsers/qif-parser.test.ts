/**
 * QIF Parser Tests
 * Tests for parsing Quicken Interchange Format files
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { parseQIFFile, isQIFContent, getQIFAccountType } from '@/lib/parsers/qif-parser';

describe('QIF Parser', () => {
  describe('isQIFContent', () => {
    it('should detect valid QIF content', () => {
      expect(isQIFContent('!Type:Bank\nD01/15/2025\nT-45.99\n^')).toBe(true);
      expect(isQIFContent('!type:bank\nD01/15/2025\n^')).toBe(true);
    });

    it('should reject non-QIF content', () => {
      expect(isQIFContent('Date,Amount,Description')).toBe(false);
      expect(isQIFContent('<xml>not qif</xml>')).toBe(false);
      expect(isQIFContent('')).toBe(false);
    });
  });

  describe('getQIFAccountType', () => {
    it('should extract Bank type', () => {
      expect(getQIFAccountType('!Type:Bank\nD01/15/2025\n^')).toBe('Bank');
    });

    it('should extract CCard type', () => {
      expect(getQIFAccountType('!Type:CCard\nD01/15/2025\n^')).toBe('CCard');
    });

    it('should return null for missing type', () => {
      expect(getQIFAccountType('D01/15/2025\nT-45.99\n^')).toBeNull();
    });
  });

  describe('parseQIFFile', () => {
    it('should parse the sample fixture file', () => {
      const content = readFileSync(
        resolve(__dirname, '../fixtures/qif/checking-sample.qif'),
        'utf-8'
      );

      const transactions = parseQIFFile(content);

      expect(transactions.length).toBe(5);

      // Transaction 1: Amazon
      expect(transactions[0].amount).toBe(-45.99);
      expect(transactions[0].description).toContain('AMAZON');
      expect(transactions[0].sourceFormat).toBe('qif');

      // Transaction 2: Starbucks
      expect(transactions[1].amount).toBe(-12.50);
      expect(transactions[1].description).toContain('STARBUCKS');

      // Transaction 3: Payroll (credit)
      expect(transactions[2].amount).toBe(2500.00);
      expect(transactions[2].description).toContain('PAYROLL');

      // Transaction 4: Whole Foods
      expect(transactions[3].amount).toBe(-89.75);

      // Transaction 5: Comcast
      expect(transactions[4].amount).toBe(-150.00);
    });

    it('should parse inline QIF content', () => {
      const content = `!Type:Bank
D01/15/2025
T-25.00
PNetflix
MMonthly subscription
^
D01/16/2025
T100.00
PTransfer from savings
^`;

      const transactions = parseQIFFile(content);
      expect(transactions.length).toBe(2);
      expect(transactions[0].amount).toBe(-25);
      expect(transactions[0].description).toContain('Netflix');
      expect(transactions[1].amount).toBe(100);
    });

    it('should combine payee and memo into description', () => {
      const content = `!Type:Bank
D01/15/2025
T-50.00
PSTARBUCKS #1234
MCoffee and pastry
^`;

      const transactions = parseQIFFile(content);
      expect(transactions[0].description).toBe('STARBUCKS #1234 - Coffee and pastry');
    });

    it('should handle missing payee (memo only)', () => {
      const content = `!Type:Bank
D01/15/2025
T-30.00
MOnline purchase
^`;

      const transactions = parseQIFFile(content);
      expect(transactions[0].description).toBe('Online purchase');
    });

    it('should handle missing both payee and memo', () => {
      const content = `!Type:Bank
D01/15/2025
T-10.00
^`;

      const transactions = parseQIFFile(content);
      expect(transactions[0].description).toBe('Unknown Transaction');
    });

    it('should handle record without trailing ^', () => {
      const content = `!Type:Bank
D01/15/2025
T-25.00
PTest`;

      const transactions = parseQIFFile(content);
      expect(transactions.length).toBe(1);
      expect(transactions[0].amount).toBe(-25);
    });

    it('should handle cleared status', () => {
      const content = `!Type:Bank
D01/15/2025
T-25.00
PTest
C*
^`;

      const transactions = parseQIFFile(content);
      expect(transactions.length).toBe(1);
    });

    it('should set confidence based on parsed data quality', () => {
      const content = `!Type:Bank
D01/15/2025
T-25.00
PTest
^`;

      const transactions = parseQIFFile(content);
      expect(transactions[0].confidence).toBe(0.9); // Both date and amount parsed
    });

    it('should flag low confidence when amount is missing', () => {
      const content = `!Type:Bank
D01/15/2025
PTest
^`;

      const transactions = parseQIFFile(content);
      // Amount is null so confidence should be lower
      expect(transactions[0].confidence).toBe(0.5);
      expect(transactions[0].requiresReview).toBe(true);
    });

    it('should handle empty content', () => {
      const transactions = parseQIFFile('');
      expect(transactions).toEqual([]);
    });

    it('should handle Windows-style line endings', () => {
      const content = '!Type:Bank\r\nD01/15/2025\r\nT-25.00\r\nPTest\r\n^\r\n';
      const transactions = parseQIFFile(content);
      expect(transactions.length).toBe(1);
    });

    it('should handle check number field', () => {
      const content = `!Type:Bank
D01/15/2025
T-500.00
N1234
PUtility company
^`;

      const transactions = parseQIFFile(content);
      expect(transactions[0].checkNum).toBe('1234');
    });
  });
});
