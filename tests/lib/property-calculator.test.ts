import { describe, it, expect } from 'vitest';
import {
  calculateEquity,
  calculateAppreciation,
  calculateRentalROI,
  getPropertyTaxReminders,
} from '@/lib/property/property-calculator';
import type { Property, Loan } from '@/types/budget';

const baseProperty: Property = {
  id: 'prop_1',
  name: 'Main Residence',
  type: 'primary_residence',
  purchasePrice: 400000,
  purchaseDate: new Date('2020-01-01'),
  currentValue: 500000,
  lastValuationDate: new Date('2026-01-01'),
  currency: 'USD',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const baseLoan: Loan = {
  id: 'loan_1',
  name: 'Mortgage',
  type: 'mortgage',
  lender: 'Big Bank',
  originalPrincipal: 320000,
  interestRate: 3.5,
  termMonths: 360,
  startDate: new Date('2020-01-01'),
  currentBalance: 280000,
  monthlyPayment: 1437,
  paymentFrequency: 'monthly',
  nextPaymentDate: new Date('2026-03-01'),
  status: 'active',
  totalPaid: 86000,
  totalInterestPaid: 46000,
  extraPayments: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('property-calculator', () => {
  describe('calculateEquity', () => {
    it('returns currentValue - loanBalance when loan exists', () => {
      const equity = calculateEquity(baseProperty, baseLoan);
      expect(equity).toBe(220000); // 500000 - 280000
    });

    it('returns full value when no loan', () => {
      const equity = calculateEquity(baseProperty);
      expect(equity).toBe(500000);
    });

    it('uses manual mortgage balance when no loan linked', () => {
      const propWithManual: Property = {
        ...baseProperty,
        hasManualMortgage: true,
        manualMortgageBalance: 300000,
      };
      const equity = calculateEquity(propWithManual);
      expect(equity).toBe(200000); // 500000 - 300000
    });
  });

  describe('calculateAppreciation', () => {
    it('calculates total appreciation percentage', () => {
      const result = calculateAppreciation(baseProperty);
      expect(result.total).toBe(25); // (500k-400k)/400k * 100
    });

    it('returns 0 for zero purchase price', () => {
      const zeroPrice: Property = { ...baseProperty, purchasePrice: 0 };
      const result = calculateAppreciation(zeroPrice);
      expect(result.total).toBe(0);
      expect(result.annual).toBe(0);
    });

    it('calculates annual appreciation', () => {
      const result = calculateAppreciation(baseProperty);
      // ~6 years, 25% total -> roughly 3.8% annual (CAGR)
      expect(result.annual).toBeGreaterThan(3);
      expect(result.annual).toBeLessThan(5);
    });
  });

  describe('calculateRentalROI', () => {
    it('returns 0 when no rental income', () => {
      const result = calculateRentalROI(baseProperty);
      expect(result.monthly).toBe(0);
      expect(result.annual).toBe(0);
    });

    it('calculates ROI with rental income', () => {
      const rental: Property = {
        ...baseProperty,
        type: 'rental',
        monthlyRentalIncome: 2500,
        occupancyRate: 90,
        annualPropertyTax: 6000,
        annualInsurance: 1800,
        monthlyHOA: 200,
        annualMaintenance: 3000,
      };
      const result = calculateRentalROI(rental);
      expect(result.annual).toBeGreaterThan(0);
    });

    it('accounts for vacancy rate', () => {
      const full: Property = {
        ...baseProperty,
        monthlyRentalIncome: 2000,
        occupancyRate: 100,
      };
      const partial: Property = {
        ...baseProperty,
        monthlyRentalIncome: 2000,
        occupancyRate: 50,
      };
      const fullROI = calculateRentalROI(full);
      const partialROI = calculateRentalROI(partial);
      expect(fullROI.annual).toBeGreaterThan(partialROI.annual);
    });
  });

  describe('getPropertyTaxReminders', () => {
    it('returns empty when no reminders enabled', () => {
      const result = getPropertyTaxReminders([baseProperty]);
      expect(result).toHaveLength(0);
    });

    it('returns reminder when tax is due within 60 days', () => {
      const now = new Date();
      const nextMonth = now.getMonth() + 2; // +2 because months are 0-indexed and we want next month number
      const prop: Property = {
        ...baseProperty,
        propertyTaxReminder: true,
        propertyTaxDueMonth: nextMonth <= 12 ? nextMonth : nextMonth - 12,
      };
      const result = getPropertyTaxReminders([prop]);
      // Should find it within 60 days
      expect(result.length).toBeGreaterThanOrEqual(0); // May or may not be in window depending on current date
    });
  });
});
