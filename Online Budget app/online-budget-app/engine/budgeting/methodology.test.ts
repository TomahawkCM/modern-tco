import { describe, it, expect } from "vitest";
import {
  computeFiftyThirtyTwenty,
  computePayYourselfFirst,
  computeZeroBasedStatus,
} from "./methodology";

describe("computeFiftyThirtyTwenty", () => {
  it("splits income into 50/30/20", () => {
    const result = computeFiftyThirtyTwenty(500000); // $5,000
    expect(result.allocations).toHaveLength(3);
    expect(result.allocations[0]).toEqual({
      label: "needs",
      percentOfIncome: 50,
      amountMinor: 250000,
    });
    expect(result.allocations[1]).toEqual({
      label: "wants",
      percentOfIncome: 30,
      amountMinor: 150000,
    });
    expect(result.allocations[2]).toEqual({
      label: "savings",
      percentOfIncome: 20,
      amountMinor: 100000,
    });
    expect(result.unallocatedMinor).toBe(0);
  });

  it("handles odd amounts without rounding errors", () => {
    const result = computeFiftyThirtyTwenty(333333);
    const total = result.allocations.reduce((s, a) => s + a.amountMinor, 0);
    expect(total).toBe(333333);
  });

  it("handles zero income", () => {
    const result = computeFiftyThirtyTwenty(0);
    expect(result.allocations[0]!.amountMinor).toBe(0);
    expect(result.allocations[1]!.amountMinor).toBe(0);
    expect(result.allocations[2]!.amountMinor).toBe(0);
  });
});

describe("computePayYourselfFirst", () => {
  it("defaults to 20% savings", () => {
    const result = computePayYourselfFirst(500000);
    expect(result.allocations[0]).toEqual({
      label: "savings",
      percentOfIncome: 20,
      amountMinor: 100000,
    });
    expect(result.allocations[1]).toEqual({
      label: "spending",
      percentOfIncome: 80,
      amountMinor: 400000,
    });
  });

  it("accepts custom savings rate", () => {
    const result = computePayYourselfFirst(400000, 30);
    expect(result.allocations[0]!.amountMinor).toBe(120000);
    expect(result.allocations[1]!.amountMinor).toBe(280000);
  });

  it("clamps savings rate to 0-100", () => {
    const over = computePayYourselfFirst(100000, 150);
    expect(over.allocations[0]!.percentOfIncome).toBe(100);

    const under = computePayYourselfFirst(100000, -10);
    expect(under.allocations[0]!.percentOfIncome).toBe(0);
  });
});

describe("computeZeroBasedStatus", () => {
  it("shows zero unallocated when fully allocated", () => {
    const result = computeZeroBasedStatus(500000, 500000);
    expect(result.unallocatedMinor).toBe(0);
    expect(result.allocations[0]!.percentOfIncome).toBe(100);
  });

  it("shows positive unallocated when under-allocated", () => {
    const result = computeZeroBasedStatus(500000, 400000);
    expect(result.unallocatedMinor).toBe(100000);
    expect(result.allocations[0]!.percentOfIncome).toBe(80);
  });

  it("shows negative unallocated when over-allocated", () => {
    const result = computeZeroBasedStatus(500000, 600000);
    expect(result.unallocatedMinor).toBe(-100000);
  });

  it("handles zero income", () => {
    const result = computeZeroBasedStatus(0, 0);
    expect(result.unallocatedMinor).toBe(0);
    expect(result.allocations[0]!.percentOfIncome).toBe(0);
  });
});
