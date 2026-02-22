import { describe, it, expect } from "vitest";
import {
  addMinor,
  subtractMinor,
  sumMinor,
  toMajorUnits,
  formatMoney,
  minorAmount,
} from "./operations";

describe("minorAmount", () => {
  it("creates a MinorAmount", () => {
    const m = minorAmount(1500, "USD");
    expect(m.amountMinor).toBe(1500);
    expect(m.currency).toBe("USD");
  });
});

describe("addMinor", () => {
  it("adds two same-currency amounts", () => {
    const a = minorAmount(1000, "USD");
    const b = minorAmount(500, "USD");
    const result = addMinor(a, b);
    expect(result.amountMinor).toBe(1500);
    expect(result.currency).toBe("USD");
  });

  it("throws on currency mismatch", () => {
    const a = minorAmount(1000, "USD");
    const b = minorAmount(500, "EUR");
    expect(() => addMinor(a, b)).toThrow("Currency mismatch");
  });
});

describe("subtractMinor", () => {
  it("subtracts two same-currency amounts", () => {
    const a = minorAmount(1000, "USD");
    const b = minorAmount(300, "USD");
    const result = subtractMinor(a, b);
    expect(result.amountMinor).toBe(700);
    expect(result.currency).toBe("USD");
  });

  it("allows negative results", () => {
    const a = minorAmount(100, "USD");
    const b = minorAmount(500, "USD");
    const result = subtractMinor(a, b);
    expect(result.amountMinor).toBe(-400);
  });

  it("throws on currency mismatch", () => {
    const a = minorAmount(1000, "USD");
    const b = minorAmount(500, "GBP");
    expect(() => subtractMinor(a, b)).toThrow("Currency mismatch");
  });
});

describe("sumMinor", () => {
  it("sums an array of same-currency amounts", () => {
    const amounts = [
      minorAmount(100, "USD"),
      minorAmount(200, "USD"),
      minorAmount(300, "USD"),
    ];
    const result = sumMinor(amounts, "USD");
    expect(result.amountMinor).toBe(600);
    expect(result.currency).toBe("USD");
  });

  it("returns zero for empty array", () => {
    const result = sumMinor([], "USD");
    expect(result.amountMinor).toBe(0);
    expect(result.currency).toBe("USD");
  });

  it("throws if any amount has wrong currency", () => {
    const amounts = [
      minorAmount(100, "USD"),
      minorAmount(200, "EUR"),
    ];
    expect(() => sumMinor(amounts, "USD")).toThrow("Currency mismatch");
  });
});

describe("toMajorUnits", () => {
  it("converts minor to major units", () => {
    expect(toMajorUnits(1500)).toBe(15.0);
  });

  it("handles zero", () => {
    expect(toMajorUnits(0)).toBe(0);
  });

  it("handles negative amounts", () => {
    expect(toMajorUnits(-350)).toBe(-3.5);
  });
});

describe("formatMoney", () => {
  it("formats USD amount", () => {
    const result = formatMoney(minorAmount(1500, "USD"));
    expect(result).toContain("15");
  });

  it("formats zero", () => {
    const result = formatMoney(minorAmount(0, "USD"));
    expect(result).toContain("0");
  });

  it("formats negative amount", () => {
    const result = formatMoney(minorAmount(-1500, "USD"));
    expect(result).toContain("15");
  });
});
