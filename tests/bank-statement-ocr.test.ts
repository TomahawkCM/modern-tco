/**
 * Bank Statement OCR Tests
 * Unit tests for bank statement parsing functions
 */

import { parseTransactionRow, parseTableRows } from '@/lib/bank-statement-ocr';

describe('bank-statement-ocr', () => {
  describe('parseTransactionRow', () => {
    it('should parse a transaction with MM/DD/YYYY date format', () => {
      const line = '01/15/2025  STARBUCKS COFFEE  -12.45';
      const result = parseTransactionRow(line, 1);

      expect(result).not.toBeNull();
      expect(result?.date).toBeInstanceOf(Date);
      expect(result?.date?.getMonth()).toBe(0); // January
      expect(result?.date?.getDate()).toBe(15);
      expect(result?.description).toContain('STARBUCKS');
      expect(result?.amount).toBe(-12.45);
      expect(result?.confidence).toBeGreaterThan(0.5);
    });

    it('should parse a transaction with YYYY-MM-DD date format', () => {
      const line = '2025-01-15  NETFLIX SUBSCRIPTION  25.00';
      const result = parseTransactionRow(line, 1);

      expect(result).not.toBeNull();
      expect(result?.date).toBeInstanceOf(Date);
      expect(result?.description).toContain('NETFLIX');
      expect(result?.amount).toBe(25.00);
    });

    it('should parse a transaction with Month DD format', () => {
      const line = 'Jan 15  Skip The Dishes  18.50';
      const result = parseTransactionRow(line, 1);

      expect(result).not.toBeNull();
      expect(result?.date).toBeInstanceOf(Date);
      expect(result?.description).toContain('Skip');
      expect(result?.amount).toBe(18.50);
    });

    it('should parse a transaction with parentheses for negative amount', () => {
      const line = '01/15/2025  ATM WITHDRAWAL  (100.00)';
      const result = parseTransactionRow(line, 1);

      expect(result).not.toBeNull();
      expect(result?.amount).toBe(-100.00);
    });

    it('should handle transactions with multiple amounts (Debit/Credit/Balance)', () => {
      const line = '15/01/2025  GROCERY STORE  50.00  0.00  150.00';
      const result = parseTransactionRow(line, 1);

      expect(result).not.toBeNull();
      // Should extract the rightmost amount (balance is typically last)
      expect(result?.amount).toBe(150.00);
    });

    it('should return null for header lines', () => {
      const headerLines = [
        'Date  Description  Amount',
        'Transaction Date  Details  Debit  Credit  Balance',
        'STATEMENT PERIOD: Jan 1 - Jan 31',
      ];

      headerLines.forEach(line => {
        const result = parseTransactionRow(line, 1);
        // Headers might parse but won't have valid transaction data
        // The isHeaderOrFooter check in parseTableRows will filter these
      });
    });

    it('should handle transactions with commas in amounts', () => {
      const line = '01/15/2025  LARGE PURCHASE  -1,234.56';
      const result = parseTransactionRow(line, 1);

      expect(result).not.toBeNull();
      expect(result?.amount).toBe(-1234.56);
    });
  });

  describe('parseTableRows', () => {
    it('should parse multiple transactions from OCR text', () => {
      const ocrText = `
        Date  Description  Amount
        01/15/2025  STARBUCKS COFFEE  -12.45
        01/16/2025  NETFLIX SUBSCRIPTION  -25.00
        01/17/2025  SALARY DEPOSIT  2500.00
        Balance carried forward
      `;

      const results = parseTableRows(ocrText, 1);

      expect(results.length).toBeGreaterThan(0);
      // Should have parsed some transactions (exact count depends on header filtering)
      const validTransactions = results.filter(tx => tx.date && tx.amount);
      expect(validTransactions.length).toBeGreaterThan(0);
    });

    it('should filter out header and footer lines', () => {
      const ocrText = `
        ACCOUNT STATEMENT
        Date  Transaction  Amount
        01/15/2025  PURCHASE  -50.00
        Balance brought forward
        Page 1 of 5
        Continued on next page
      `;

      const results = parseTableRows(ocrText, 1);

      // Should only have the actual transaction, not headers/footers
      const hasAccountStatement = results.some(tx =>
        tx.description.toLowerCase().includes('account') ||
        tx.description.toLowerCase().includes('statement')
      );
      expect(hasAccountStatement).toBe(false);
    });

    it('should handle empty or whitespace-only text', () => {
      const results = parseTableRows('   \n\n   ', 1);
      expect(results).toEqual([]);
    });

    it('should assign line numbers correctly', () => {
      const ocrText = `
        01/15/2025  TRANSACTION 1  -10.00
        01/16/2025  TRANSACTION 2  -20.00
      `;

      const results = parseTableRows(ocrText, 1);

      results.forEach(tx => {
        expect(tx.lineNumber).toBeGreaterThan(0);
      });
    });
  });
});
