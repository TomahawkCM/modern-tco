/**
 * Property Calculator
 *
 * Calculates equity, appreciation, rental ROI, and property tax reminders
 * for the global real estate tracking system.
 */

import { db } from "@/lib/budget-db";
import { roundToCents } from "@/lib/money";
import type { Property, Loan } from "@/types/budget";

/**
 * Calculate equity for a property.
 * Equity = current value - mortgage balance.
 */
export function calculateEquity(property: Property, loan?: Loan): number {
  let mortgageBalance = 0;

  if (loan) {
    mortgageBalance = loan.currentBalance;
  } else if (property.hasManualMortgage && property.manualMortgageBalance != null) {
    mortgageBalance = property.manualMortgageBalance;
  }

  return roundToCents(property.currentValue - mortgageBalance);
}

/**
 * Calculate appreciation since purchase.
 * Returns annual and total appreciation percentages.
 */
export function calculateAppreciation(property: Property): { annual: number; total: number } {
  if (property.purchasePrice <= 0) {
    return { annual: 0, total: 0 };
  }

  const totalAppreciation =
    ((property.currentValue - property.purchasePrice) / property.purchasePrice) * 100;

  const purchaseDate = new Date(property.purchaseDate);
  const now = new Date();
  const yearsHeld = (now.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);

  const annualAppreciation =
    yearsHeld > 0
      ? (Math.pow(property.currentValue / property.purchasePrice, 1 / yearsHeld) - 1) * 100
      : totalAppreciation;

  return {
    annual: roundToCents(annualAppreciation),
    total: roundToCents(totalAppreciation),
  };
}

/**
 * Calculate rental ROI for an investment property.
 * Takes into account rental income, vacancy rate, and annual expenses.
 */
export function calculateRentalROI(property: Property): { monthly: number; annual: number } {
  if (!property.monthlyRentalIncome || property.currentValue <= 0) {
    return { monthly: 0, annual: 0 };
  }

  const occupancy = (property.occupancyRate ?? 100) / 100;
  const monthlyGrossIncome = property.monthlyRentalIncome * occupancy;

  // Monthly expenses
  const monthlyPropertyTax = (property.annualPropertyTax ?? 0) / 12;
  const monthlyInsurance = (property.annualInsurance ?? 0) / 12;
  const monthlyMaintenance = (property.annualMaintenance ?? 0) / 12;
  const monthlyHOA = property.monthlyHOA ?? 0;

  const monthlyNetIncome =
    monthlyGrossIncome - monthlyPropertyTax - monthlyInsurance - monthlyMaintenance - monthlyHOA;

  const monthlyROI = (monthlyNetIncome / property.currentValue) * 100;
  const annualROI = monthlyROI * 12;

  return {
    monthly: roundToCents(monthlyROI),
    annual: roundToCents(annualROI),
  };
}

/**
 * Get upcoming property tax reminders.
 * Returns properties with tax due dates in the next 60 days.
 */
export function getPropertyTaxReminders(
  properties: Property[]
): Array<{ property: Property; dueDate: Date }> {
  const now = new Date();
  const sixtyDaysFromNow = new Date();
  sixtyDaysFromNow.setDate(sixtyDaysFromNow.getDate() + 60);

  const reminders: Array<{ property: Property; dueDate: Date }> = [];

  for (const prop of properties) {
    if (!prop.propertyTaxReminder || !prop.propertyTaxDueMonth) continue;

    // Build due date for current year
    const dueDate = new Date(now.getFullYear(), prop.propertyTaxDueMonth - 1, 1);

    // If already past, check next year
    if (dueDate < now) {
      dueDate.setFullYear(dueDate.getFullYear() + 1);
    }

    if (dueDate >= now && dueDate <= sixtyDaysFromNow) {
      reminders.push({ property: prop, dueDate });
    }
  }

  return reminders;
}

/**
 * Get all properties from the database.
 */
export async function getAllProperties(): Promise<Property[]> {
  return db.properties.toArray();
}

/**
 * Get total property value across all properties, optionally converted to a base currency.
 * For simplicity, returns sum in original currencies (multi-currency conversion
 * would require exchange rate data).
 */
export async function getTotalPropertyValue(): Promise<number> {
  const properties = await db.properties.toArray();
  return properties.reduce((sum, p) => sum + p.currentValue, 0);
}
