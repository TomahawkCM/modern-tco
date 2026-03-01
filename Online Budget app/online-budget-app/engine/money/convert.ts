import type { MinorAmount } from "./types";

/**
 * Convert a monetary amount from one currency to another using a given rate.
 *
 * - Display-level only — never persists converted values.
 * - Pure function — no DB, no side effects.
 * - Uses banker's rounding (round half to even) for the converted minor units.
 *
 * @param amount  Source amount in minor units with currency
 * @param toCurrency  Target ISO 4217 currency code
 * @param rate  Conversion rate (1 source unit = rate target units)
 * @returns Converted MinorAmount in target currency
 */
export function convertMinor(
  amount: MinorAmount,
  toCurrency: string,
  rate: number
): MinorAmount {
  if (rate <= 0) {
    throw new Error("rate must be positive");
  }

  if (amount.currency === toCurrency) {
    return { amountMinor: amount.amountMinor, currency: toCurrency };
  }

  const raw = amount.amountMinor * rate;
  return { amountMinor: bankersRound(raw), currency: toCurrency };
}

/**
 * Banker's rounding (round half to even).
 * When the fractional part is exactly 0.5, rounds to the nearest even integer.
 */
function bankersRound(value: number): number {
  const sign = value < 0 ? -1 : 1;
  const abs = Math.abs(value);
  const floor = Math.floor(abs);
  const fraction = abs - floor;

  // Check if fraction is exactly 0.5 (within floating-point tolerance)
  if (Math.abs(fraction - 0.5) < 1e-9) {
    // Round to nearest even
    return sign * (floor % 2 === 0 ? floor : floor + 1);
  }

  return sign * Math.round(abs);
}
