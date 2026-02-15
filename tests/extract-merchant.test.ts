import { describe, it, expect } from 'vitest';
import { extractMerchant } from '../src/lib/receipt-ocr';

describe('extractMerchant', () => {
  describe('Strategy A: Known merchant patterns', () => {
    it('detects EPCOR in utility bill text', () => {
      const text = `Account Number: 33647850
EPCOR
Electricity Services
123 Main St
Edmonton, AB T5J 1R1
Bill Date: Jan 15, 2026
Amount Due: $142.56`;
      expect(extractMerchant(text)).toBe('EPCOR');
    });

    it('detects EPCOR even deep in the text', () => {
      const text = `Statement of Account
Page 1 of 3
Account: 33647850
Service Address: 456 Elm Ave
Your EPCOR electricity charges
Billing Period: Dec 15 - Jan 14`;
      expect(extractMerchant(text)).toBe('EPCOR');
    });

    it('detects Walmart', () => {
      const text = `WALMART #1234
SUPERCENTRE
123 RETAIL DR
CITY, AB T1A 2B3
01/15/2026  14:32`;
      expect(extractMerchant(text)).toBe('WALMART');
    });

    it('detects Starbucks', () => {
      const text = `Starbucks Coffee
Store #45678
100 Downtown Ave
Your Order`;
      expect(extractMerchant(text)).toBe('STARBUCKS');
    });

    it('detects 7-ELEVEN', () => {
      const text = `7-ELEVEN #12345
500 Jasper Ave
Edmonton AB`;
      expect(extractMerchant(text)).toBe('7-ELEVEN');
    });

    it('detects Tim Hortons', () => {
      const text = `Tim Hortons
Order #789
Medium Double Double  $2.10`;
      expect(extractMerchant(text)).toBe('TIM HORTONS');
    });

    it('detects ENMAX utility', () => {
      const text = `Your Monthly Bill
ENMAX Energy Corporation
Account: 998877
Total Due: $205.43`;
      expect(extractMerchant(text)).toBe('ENMAX');
    });

    it('detects Costco', () => {
      const text = `COSTCO WHOLESALE
Membership #: 111222333
Items: 15
Total: $234.56`;
      expect(extractMerchant(text)).toBe('COSTCO');
    });

    it('detects BC Hydro', () => {
      const text = `BC Hydro
Account Summary
Service Period: Dec 2025 - Jan 2026
Amount Due: $89.12`;
      expect(extractMerchant(text)).toBe('BC HYDRO');
    });

    it('detects PG&E', () => {
      const text = `PG&E
Pacific Gas and Electric
Account: 1234567890
Total Current Charges: $156.78`;
      expect(extractMerchant(text)).toBe('PG&E');
    });
  });

  describe('Strategy B: Label-based extraction', () => {
    it('extracts from "Sold by:" label', () => {
      const text = `Receipt
Sold by: Mountain Equipment Co-op
Date: 2026-01-10
Total: $89.99`;
      expect(extractMerchant(text)).toBe('Mountain Equipment Co-op');
    });

    it('extracts from "Company:" label', () => {
      const text = `Invoice #12345
Company: Nordic Design Studio
Date: 2026-01-10`;
      expect(extractMerchant(text)).toBe('Nordic Design Studio');
    });

    it('extracts from "Billed by:" label', () => {
      const text = `Statement
Billed by: City Water Services
Account: 987654`;
      expect(extractMerchant(text)).toBe('City Water Services');
    });
  });

  describe('Strategy C: All-caps and mixed-case detection', () => {
    it('detects all-caps merchant with numbers', () => {
      const text = `EPCOR #33647850
Electricity Bill
Amount Due: $142.56`;
      // Strategy A catches EPCOR first, but test the pattern
      expect(extractMerchant(text)).toBe('EPCOR');
    });

    it('detects generic all-caps merchant name', () => {
      const text = `ALPINE BAKERY
Fresh Bread  $5.49
Croissant x2  $7.98
Total: $13.47`;
      expect(extractMerchant(text)).toBe('ALPINE BAKERY');
    });

    it('does not pick up address lines', () => {
      const text = `123 Main St
ALPINE BAKERY
Fresh Bread  $5.49`;
      expect(extractMerchant(text)).toBe('ALPINE BAKERY');
    });

    it('does not pick up RECEIPT as merchant', () => {
      const text = `RECEIPT
ALPINE BAKERY
Total: $13.47`;
      expect(extractMerchant(text)).toBe('ALPINE BAKERY');
    });

    it('does not pick up INVOICE as merchant', () => {
      const text = `INVOICE
PEAK PLUMBING
Service Call: $150.00`;
      expect(extractMerchant(text)).toBe('PEAK PLUMBING');
    });

    it('accepts mixed-case merchant in first 10 lines', () => {
      const text = `RECEIPT
#12345678
2026-01-15
(780) 555-1234
123 Main St Edmonton
$45.00
$3.50
Maple Leaf Foods
Amount: $45.00`;
      expect(extractMerchant(text)).toBe('Maple Leaf Foods');
    });

    it('does not treat a standalone BILL as merchant', () => {
      const text = `BILL
SUMMIT ELECTRIC
Total: $210.00`;
      expect(extractMerchant(text)).toBe('SUMMIT ELECTRIC');
    });

    it('skips phone number lines', () => {
      const text = `(780) 555-1234
VALLEY DINER
Burger  $12.99`;
      expect(extractMerchant(text)).toBe('VALLEY DINER');
    });

    it('skips account number lines', () => {
      const text = `#12345678
RIVER CAFE
Latte  $5.50`;
      expect(extractMerchant(text)).toBe('RIVER CAFE');
    });
  });

  describe('Strategy D: Filename extraction', () => {
    it('extracts merchant from filename when text has no match', () => {
      const text = `33647850
2026-01-15
$142.56
01/15 - 02/14`;
      expect(extractMerchant(text, 'EPCOR_33647850_2026-01-15.pdf')).toBe('EPCOR');
    });

    it('extracts first alpha token from underscore-separated filename', () => {
      const text = `Page 1
12345
$50.00`;
      expect(extractMerchant(text, 'Hydro_bill_jan_2026.pdf')).toBe('HYDRO');
    });

    it('skips numeric-only tokens in filename', () => {
      const text = `Page 1
12345
$50.00`;
      expect(extractMerchant(text, '2026_01_15_receipt.pdf')).toBe('RECEIPT');
    });

    it('returns null if filename has no alpha tokens', () => {
      const text = `12345
$50.00`;
      expect(extractMerchant(text, '123_456.pdf')).toBeNull();
    });
  });

  describe('Strategy E: Short-line fallback', () => {
    it('falls back to short text line as last resort', () => {
      const text = `Rustic Kitchen
150 Oak Lane Unit 2B
(403) 555-9876
Total: $32.50`;
      // "Rustic Kitchen" should be picked up by Strategy C mixed-case pass
      expect(extractMerchant(text)).toBe('Rustic Kitchen');
    });
  });

  describe('Edge cases', () => {
    it('returns null for empty text', () => {
      expect(extractMerchant('')).toBeNull();
    });

    it('returns null for text with only numbers', () => {
      expect(extractMerchant('12345\n67890\n11111')).toBeNull();
    });

    it('handles text with only whitespace lines', () => {
      expect(extractMerchant('   \n  \n   ')).toBeNull();
    });

    it('known merchant takes priority over all-caps generic', () => {
      const text = `GROCERY MART
Welcome to Costco
Total: $150.00`;
      // Costco is a known merchant, should win over GROCERY MART
      expect(extractMerchant(text)).toBe('COSTCO');
    });
  });
});
