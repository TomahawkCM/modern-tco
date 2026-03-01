import type { MinorAmount } from "./types";

export function minorAmount(amountMinor: number, currency: string): MinorAmount {
  return { amountMinor, currency };
}

export function addMinor(a: MinorAmount, b: MinorAmount): MinorAmount {
  if (a.currency !== b.currency) {
    throw new Error(`Currency mismatch: ${a.currency} vs ${b.currency}`);
  }
  return { amountMinor: a.amountMinor + b.amountMinor, currency: a.currency };
}

export function subtractMinor(a: MinorAmount, b: MinorAmount): MinorAmount {
  if (a.currency !== b.currency) {
    throw new Error(`Currency mismatch: ${a.currency} vs ${b.currency}`);
  }
  return { amountMinor: a.amountMinor - b.amountMinor, currency: a.currency };
}

export function sumMinor(amounts: MinorAmount[], currency: string): MinorAmount {
  let total = 0;
  for (const amt of amounts) {
    if (amt.currency !== currency) {
      throw new Error(`Currency mismatch: expected ${currency}, got ${amt.currency}`);
    }
    total += amt.amountMinor;
  }
  return { amountMinor: total, currency };
}

export function absMinor(amount: MinorAmount): MinorAmount {
  return { amountMinor: Math.abs(amount.amountMinor), currency: amount.currency };
}

export function toMajorUnits(amountMinor: number, decimals: number = 2): number {
  return amountMinor / Math.pow(10, decimals);
}

export function formatMoney(
  amount: MinorAmount,
  locale: string = "en-US"
): string {
  const major = toMajorUnits(amount.amountMinor);
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: amount.currency,
  }).format(major);
}
