/**
 * MT940 (SWIFT) Parser Tests
 * Tests for parsing bank statement format used widely in Europe
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { parseMT940File, isMT940Content } from '@/lib/parsers/mt940-parser';

describe('MT940 Parser', () => {
  describe('isMT940Content', () => {
    it('should detect valid MT940 content', () => {
      expect(isMT940Content(':20:STMT001\n:60F:C250114EUR5000,00\n:61:250115D45,50N023NONREF')).toBe(true);
    });

    it('should detect content with :20: and :61: tags', () => {
      expect(isMT940Content(':20:REF123\n:61:250115C1000,00N051')).toBe(true);
    });

    it('should reject non-MT940 content', () => {
      expect(isMT940Content('Date,Amount,Description')).toBe(false);
      expect(isMT940Content('<?xml version="1.0"?>')).toBe(false);
      expect(isMT940Content('!Type:Bank')).toBe(false);
    });
  });

  describe('parseMT940File', () => {
    it('should parse the Deutsche Bank sample fixture', async () => {
      const content = readFileSync(
        resolve(__dirname, '../fixtures/mt940/deutsche-bank-sample.sta'),
        'utf-8'
      );

      const transactions = await parseMT940File(content);

      expect(transactions.length).toBe(5);

      // Transaction 1: EDEKA (debit)
      expect(transactions[0].amount).toBe(-45.50);
      expect(transactions[0].description).toContain('EDEKA');
      expect(transactions[0].sourceFormat).toBe('mt940');
      expect(transactions[0].transactionType).toBe('DEBIT');

      // Transaction 2: Gehaltszahlung (credit)
      expect(transactions[1].amount).toBe(1250.00);
      expect(transactions[1].description).toContain('GEHALTSZAHLUNG');
      expect(transactions[1].transactionType).toBe('CREDIT');

      // Transaction 3: Amazon (debit)
      expect(transactions[2].amount).toBe(-89.90);
      expect(transactions[2].description).toContain('AMAZON');

      // Transaction 4: Deutsche Telekom (debit)
      expect(transactions[3].amount).toBe(-35.00);

      // Transaction 5: Ueberweisung (credit)
      expect(transactions[4].amount).toBe(200.00);
    });

    it('should parse inline MT940 content', async () => {
      const content = `:20:TEST001
:25:DE89370400440532013000
:28C:1/1
:60F:C250114EUR1000,00
:61:250115D25,50N023NONREF
:86:GROCERY STORE PURCHASE
:62F:C974,50EUR250115
-}`;

      const transactions = await parseMT940File(content);
      expect(transactions.length).toBeGreaterThanOrEqual(1);
      expect(transactions[0].amount).toBe(-25.50);
    });

    it('should handle credit/debit indicator correctly', async () => {
      const content = `:20:TEST
:25:ACCT
:28C:1/1
:60F:C250114EUR5000,00
:61:250115D100,00N023NONREF
:86:DEBIT TRANSACTION
:61:250116C200,00N051NONREF
:86:CREDIT TRANSACTION
:62F:C5100,00EUR250116
-}`;

      const transactions = await parseMT940File(content);
      expect(transactions.length).toBe(2);
      expect(transactions[0].amount).toBeLessThan(0); // Debit = negative
      expect(transactions[1].amount).toBeGreaterThan(0); // Credit = positive
    });

    it('should handle empty content gracefully', async () => {
      const transactions = await parseMT940File('');
      expect(transactions).toEqual([]);
    });

    it('should handle content with no transactions', async () => {
      const content = `:20:NOSTMT
:25:DE89370400440532013000
:28C:1/1
:60F:C250114EUR5000,00
:62F:C5000,00EUR250114
-}`;

      const transactions = await parseMT940File(content);
      expect(transactions).toEqual([]);
    });

    it('should set high confidence for well-parsed transactions', async () => {
      const content = `:20:TEST
:25:ACCT
:28C:1/1
:60F:C250114EUR5000,00
:61:250115D50,00N023NONREF
:86:TEST TRANSACTION
:62F:C4950,00EUR250115
-}`;

      const transactions = await parseMT940File(content);
      expect(transactions[0].confidence).toBeGreaterThanOrEqual(0.8);
    });

    it('should extract currency from opening balance', async () => {
      const content = `:20:TEST
:25:ACCT
:28C:1/1
:60F:C250114EUR5000,00
:61:250115D50,00N023NONREF
:86:TEST
:62F:C4950,00EUR250115
-}`;

      const transactions = await parseMT940File(content);
      expect(transactions[0].currency).toBe('EUR');
    });
  });
});
