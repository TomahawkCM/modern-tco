import { describe, it, expect } from "vitest";
import { convertMinor } from "./convert";
import { minorAmount } from "./operations";

describe("convertMinor", () => {
  it("converts USD to EUR at 0.92 rate", () => {
    const usd = minorAmount(10000, "USD"); // $100.00
    const result = convertMinor(usd, "EUR", 0.92);
    expect(result.amountMinor).toBe(9200); // €92.00
    expect(result.currency).toBe("EUR");
  });

  it("converts EUR to USD at 1.087 rate", () => {
    const eur = minorAmount(5000, "EUR"); // €50.00
    const result = convertMinor(eur, "USD", 1.087);
    expect(result.amountMinor).toBe(5435); // $54.35
    expect(result.currency).toBe("USD");
  });

  it("returns same amount when target currency matches source", () => {
    const usd = minorAmount(2500, "USD");
    const result = convertMinor(usd, "USD", 1.0);
    expect(result.amountMinor).toBe(2500);
    expect(result.currency).toBe("USD");
  });

  it("handles zero amount", () => {
    const zero = minorAmount(0, "GBP");
    const result = convertMinor(zero, "EUR", 1.15);
    expect(result.amountMinor).toBe(0);
    expect(result.currency).toBe("EUR");
  });

  it("handles negative amounts (expenses)", () => {
    const expense = minorAmount(-3500, "CAD"); // -$35.00 CAD
    const result = convertMinor(expense, "USD", 0.74);
    expect(result.amountMinor).toBe(-2590); // -$25.90 USD
    expect(result.currency).toBe("USD");
  });

  it("rounds to nearest integer (banker's rounding)", () => {
    // 1234 * 0.925 = 1141.45 → should round to 1141
    const amount = minorAmount(1234, "USD");
    const result = convertMinor(amount, "EUR", 0.925);
    expect(result.amountMinor).toBe(1141);
  });

  it("rounds up at .5 boundary when digit before is odd", () => {
    // 100 * 1.005 = 100.5 → banker's rounding: nearest even = 100
    const amount = minorAmount(100, "USD");
    const result = convertMinor(amount, "EUR", 1.005);
    expect(result.amountMinor).toBe(100);
  });

  it("rounds up at .5 boundary when digit before is even producing odd result", () => {
    // 100 * 1.015 = 101.5 → banker's rounding: nearest even = 102
    const amount = minorAmount(100, "USD");
    const result = convertMinor(amount, "EUR", 1.015);
    expect(result.amountMinor).toBe(102);
  });

  it("throws on zero rate", () => {
    const amount = minorAmount(1000, "USD");
    expect(() => convertMinor(amount, "EUR", 0)).toThrow("rate must be positive");
  });

  it("throws on negative rate", () => {
    const amount = minorAmount(1000, "USD");
    expect(() => convertMinor(amount, "EUR", -1.5)).toThrow(
      "rate must be positive"
    );
  });

  it("preserves precision on large amounts", () => {
    // $1,000,000.00 at 0.92 = €920,000.00
    const large = minorAmount(100_000_000, "USD");
    const result = convertMinor(large, "EUR", 0.92);
    expect(result.amountMinor).toBe(92_000_000);
    expect(result.currency).toBe("EUR");
  });

  it("handles small fractional rates", () => {
    // 1000 JPY at 0.0067 = ~6.70 USD → 670 minor
    const jpy = minorAmount(1000, "JPY");
    const result = convertMinor(jpy, "USD", 0.0067);
    expect(result.amountMinor).toBe(7); // 1000 * 0.0067 = 6.7 → rounds to 7
    expect(result.currency).toBe("USD");
  });
});
