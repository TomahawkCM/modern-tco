/**
 * Bank Config Verification Test Suite
 * Tests each bank config against sample CSV rows to verify parsing works correctly.
 * Configs with test fixtures here are considered "verified".
 */

import { describe, it, expect } from "vitest";
import {
  ALL_BANKS,
  getBankConfig,
  hasDualAmountColumns,
  parseAmount,
} from "../bank-configs";

/** Sample CSV fixture for verification */
interface BankFixture {
  bankKey: string;
  /** CSV header row */
  header: string;
  /** Sample data rows */
  rows: string[];
  /** Expected parsed results per row */
  expected: Array<{
    date: string; // Expected date string from parsing
    description: string;
    amount: number; // Expected numeric amount (negative = expense)
  }>;
}

/**
 * Verified bank fixtures — each represents real-world CSV format.
 * Banks listed here have verified: true status.
 */
const VERIFIED_FIXTURES: BankFixture[] = [
  // ========================
  // Canadian Banks
  // ========================
  {
    bankKey: "td",
    header: "Transaction Date,Description,Amount",
    rows: [
      "01/15/2025,STARBUCKS COFFEE,4.50",   // TD: positive = expense (flipped by multiplier -1)
      "01/16/2025,PAYROLL DEPOSIT,-2500.00", // TD: negative = income (flipped by multiplier -1)
      "01/17/2025,AMAZON.CA,89.99",
    ],
    expected: [
      { date: "01/15/2025", description: "STARBUCKS COFFEE", amount: -4.5 },
      { date: "01/16/2025", description: "PAYROLL DEPOSIT", amount: 2500.0 },
      { date: "01/17/2025", description: "AMAZON.CA", amount: -89.99 },
    ],
  },
  {
    bankKey: "rbc",
    header: "Transaction Date,Description 1,Amount",
    rows: [
      "01/15/2025,TIM HORTONS,-3.25",
      "01/16/2025,E-TRANSFER RECEIVED,500.00",
    ],
    expected: [
      { date: "01/15/2025", description: "TIM HORTONS", amount: -3.25 },
      { date: "01/16/2025", description: "E-TRANSFER RECEIVED", amount: 500.0 },
    ],
  },
  {
    bankKey: "tangerine",
    header: "Date,Name,Amount",
    rows: [
      "01/20/2025,SHOPPERS DRUG MART,-15.99",
      "01/21/2025,INTEREST EARNED,12.34",
    ],
    expected: [
      { date: "01/20/2025", description: "SHOPPERS DRUG MART", amount: -15.99 },
      { date: "01/21/2025", description: "INTEREST EARNED", amount: 12.34 },
    ],
  },

  // ========================
  // American Banks
  // ========================
  {
    bankKey: "chase",
    header: "Posting Date,Description,Amount",
    rows: [
      "01/15/2025,UBER EATS,-22.50",
      "01/16/2025,DIRECT DEPOSIT,3500.00",
    ],
    expected: [
      { date: "01/15/2025", description: "UBER EATS", amount: -22.50 },
      { date: "01/16/2025", description: "DIRECT DEPOSIT", amount: 3500.0 },
    ],
  },
  {
    bankKey: "bankofamerica",
    header: "Date,Description,Amount",
    rows: [
      "01/15/2025,NETFLIX.COM,-15.99",
      "01/16/2025,ACH PAYMENT,1200.00",
    ],
    expected: [
      { date: "01/15/2025", description: "NETFLIX.COM", amount: -15.99 },
      { date: "01/16/2025", description: "ACH PAYMENT", amount: 1200.0 },
    ],
  },
  {
    bankKey: "wellsfargo",
    header: "Date,Description,Amount",
    rows: ["01/15/2025,WALMART,-67.83", "01/16/2025,PAYROLL,2800.00"],
    expected: [
      { date: "01/15/2025", description: "WALMART", amount: -67.83 },
      { date: "01/16/2025", description: "PAYROLL", amount: 2800.0 },
    ],
  },

  // ========================
  // UK Banks
  // ========================
  {
    bankKey: "barclays",
    header: "Date,Memo,Amount",
    rows: [
      "15/01/2025,TESCO STORES,-45.67",
      "16/01/2025,SALARY PAYMENT,3200.00",
    ],
    expected: [
      { date: "15/01/2025", description: "TESCO STORES", amount: -45.67 },
      { date: "16/01/2025", description: "SALARY PAYMENT", amount: 3200.0 },
    ],
  },
  {
    bankKey: "hsbc",
    header: "Date,Description,Amount",
    rows: [
      "15/01/2025,SAINSBURYS,-32.10",
      "16/01/2025,STANDING ORDER,500.00",
    ],
    expected: [
      { date: "15/01/2025", description: "SAINSBURYS", amount: -32.10 },
      { date: "16/01/2025", description: "STANDING ORDER", amount: 500.0 },
    ],
  },

  // ========================
  // European Banks
  // ========================
  {
    bankKey: "n26",
    header: "Date,Payee,Amount (EUR)",
    rows: [
      "2025-01-15,LIDL BERLIN,-23.45",
      "2025-01-16,SALARY,2800.00",
    ],
    expected: [
      { date: "2025-01-15", description: "LIDL BERLIN", amount: -23.45 },
      { date: "2025-01-16", description: "SALARY", amount: 2800.0 },
    ],
  },
  {
    bankKey: "revolut",
    header: "Completed Date,Description,Amount",
    rows: [
      "25 Dec 2024,SPOTIFY,-9.99",
      "26 Dec 2024,TRANSFER IN,100.00",
    ],
    expected: [
      { date: "25 Dec 2024", description: "SPOTIFY", amount: -9.99 },
      { date: "26 Dec 2024", description: "TRANSFER IN", amount: 100.0 },
    ],
  },

  // ========================
  // Australian Banks
  // ========================
  {
    bankKey: "commbank",
    header: "Date,Description,Amount",
    rows: [
      "15/01/2025,WOOLWORTHS,-78.90",
      "16/01/2025,SALARY DEPOSIT,4200.00",
    ],
    expected: [
      { date: "15/01/2025", description: "WOOLWORTHS", amount: -78.90 },
      { date: "16/01/2025", description: "SALARY DEPOSIT", amount: 4200.0 },
    ],
  },
  {
    bankKey: "anz",
    header: "Date,Description,Amount",
    rows: [
      "15/01/2025,COLES SUPERMARKET,-55.30",
      "16/01/2025,INTEREST,8.50",
    ],
    expected: [
      { date: "15/01/2025", description: "COLES SUPERMARKET", amount: -55.30 },
      { date: "16/01/2025", description: "INTEREST", amount: 8.50 },
    ],
  },

  // ========================
  // Asian Banks
  // ========================
  {
    bankKey: "dbs",
    header: "Transaction Date,Transaction Ref1,Debit Amount,Credit Amount",
    rows: [
      "25 Dec 2024,GRAB FOOD,15.50,",
      "26 Dec 2024,SALARY,,5000.00",
    ],
    expected: [
      { date: "25 Dec 2024", description: "GRAB FOOD", amount: 15.50 },
      { date: "26 Dec 2024", description: "SALARY", amount: 0 }, // Credit in separate column
    ],
  },
];

describe("Bank Config Verification Suite", () => {
  describe("Config completeness", () => {
    it("should have all required fields in every bank config", () => {
      for (const [key, config] of Object.entries(ALL_BANKS)) {
        expect(config.name, `${key} missing name`).toBeTruthy();
        expect(config.dateColumn, `${key} missing dateColumn`).toBeTruthy();
        expect(config.descriptionColumn, `${key} missing descriptionColumn`).toBeTruthy();
        expect(config.amountColumn, `${key} missing amountColumn`).toBeTruthy();
        expect(config.dateFormat, `${key} missing dateFormat`).toBeTruthy();
      }
    });

    it("should have consistent hasHeader defaults", () => {
      for (const [key, config] of Object.entries(ALL_BANKS)) {
        // All configs should either explicitly set hasHeader or leave it undefined (default true)
        if (config.hasHeader !== undefined) {
          expect(typeof config.hasHeader).toBe("boolean");
        }
      }
    });
  });

  describe("Verified bank fixtures", () => {
    for (const fixture of VERIFIED_FIXTURES) {
      describe(`${fixture.bankKey} (${ALL_BANKS[fixture.bankKey]?.name || "UNKNOWN"})`, () => {
        const config = getBankConfig(fixture.bankKey);

        it("should have a valid config", () => {
          expect(config).not.toBeNull();
        });

        it("should have matching column names in header", () => {
          if (!config) return;
          const headers = fixture.header.split(",").map((h) => h.trim());

          expect(
            headers,
            `dateColumn '${config.dateColumn}' not found in header`
          ).toContain(config.dateColumn);
          expect(
            headers,
            `descriptionColumn '${config.descriptionColumn}' not found in header`
          ).toContain(config.descriptionColumn);
          expect(
            headers,
            `amountColumn '${config.amountColumn}' not found in header`
          ).toContain(config.amountColumn);
        });

        it("should correctly parse sample amounts", () => {
          if (!config) return;
          const headers = fixture.header.split(",").map((h) => h.trim());
          const amountIdx = headers.indexOf(config.amountColumn);

          fixture.rows.forEach((row, i) => {
            const cols = row.split(",");
            const rawAmount = cols[amountIdx]?.trim();
            if (!rawAmount) return; // Skip empty amounts (dual-column banks)

            const parsed = parseAmount(rawAmount, fixture.bankKey);
            const multiplier = config.amountMultiplier ?? 1;
            const expected = fixture.expected[i].amount;

            expect(
              parsed * multiplier,
              `Row ${i}: expected ${expected}, got ${parsed * multiplier} from '${rawAmount}'`
            ).toBeCloseTo(expected, 2);
          });
        });

        it("should extract description from correct column", () => {
          if (!config) return;
          const headers = fixture.header.split(",").map((h) => h.trim());
          const descIdx = headers.indexOf(config.descriptionColumn);

          fixture.rows.forEach((row, i) => {
            const cols = row.split(",");
            const description = cols[descIdx]?.trim();
            expect(description).toBe(fixture.expected[i].description);
          });
        });
      });
    }
  });

  describe("Dual column bank identification", () => {
    it("should correctly identify dual-column banks", () => {
      // Spot-check a few known dual-column banks
      expect(hasDualAmountColumns("scotiabank")).toBe(true);
      expect(hasDualAmountColumns("cibc")).toBe(true);
      expect(hasDualAmountColumns("lloyds")).toBe(true);
      expect(hasDualAmountColumns("hdfc")).toBe(true);
      expect(hasDualAmountColumns("dbs")).toBe(true);
    });

    it("should not identify single-column banks as dual", () => {
      expect(hasDualAmountColumns("td")).toBe(false);
      expect(hasDualAmountColumns("chase")).toBe(false);
      expect(hasDualAmountColumns("n26")).toBe(false);
    });
  });

  describe("Amount parsing edge cases", () => {
    it("should parse Indonesian comma-decimal format", () => {
      const result = parseAmount("1.234.567,89", "bca");
      expect(result).toBeCloseTo(1234567.89, 2);
    });

    it("should parse standard format for non-Indonesian banks", () => {
      const result = parseAmount("1,234.56", "chase");
      expect(result).toBeCloseTo(1234.56, 2);
    });

    it("should handle empty amount strings", () => {
      const result = parseAmount("", "chase");
      expect(result).toBe(0);
    });
  });
});
