import { describe, it, expect } from "vitest";
import { detectSubscriptions } from "./subscription-detection";

describe("detectSubscriptions", () => {
  it("detects recurring monthly transactions from same merchant", () => {
    const result = detectSubscriptions({
      transactions: [
        { merchantToken: "NETFLIX", amountMinor: -1599, transactionDate: "2026-01-15" },
        { merchantToken: "NETFLIX", amountMinor: -1599, transactionDate: "2025-12-15" },
        { merchantToken: "NETFLIX", amountMinor: -1599, transactionDate: "2025-11-15" },
      ],
      minOccurrences: 2,
      amountTolerancePercent: 10,
    });

    expect(result).toHaveLength(1);
    expect(result[0]!.merchantToken).toBe("NETFLIX");
    expect(result[0]!.averageAmountMinor).toBe(-1599);
    expect(result[0]!.occurrences).toBe(3);
    expect(result[0]!.isActive).toBe(true);
  });

  it("detects subscriptions with slight amount variation", () => {
    const result = detectSubscriptions({
      transactions: [
        { merchantToken: "SPOTIFY", amountMinor: -999, transactionDate: "2026-01-10" },
        { merchantToken: "SPOTIFY", amountMinor: -1049, transactionDate: "2025-12-10" },
        { merchantToken: "SPOTIFY", amountMinor: -999, transactionDate: "2025-11-10" },
      ],
      minOccurrences: 2,
      amountTolerancePercent: 10,
    });

    expect(result).toHaveLength(1);
    expect(result[0]!.merchantToken).toBe("SPOTIFY");
    expect(result[0]!.occurrences).toBe(3);
  });

  it("ignores one-off transactions", () => {
    const result = detectSubscriptions({
      transactions: [
        { merchantToken: "AMAZON", amountMinor: -5000, transactionDate: "2026-01-05" },
        { merchantToken: "NETFLIX", amountMinor: -1599, transactionDate: "2026-01-15" },
        { merchantToken: "NETFLIX", amountMinor: -1599, transactionDate: "2025-12-15" },
      ],
      minOccurrences: 2,
      amountTolerancePercent: 10,
    });

    // Only NETFLIX recurs, AMAZON is one-off
    expect(result).toHaveLength(1);
    expect(result[0]!.merchantToken).toBe("NETFLIX");
  });

  it("rejects merchant with widely varying amounts", () => {
    const result = detectSubscriptions({
      transactions: [
        { merchantToken: "AMAZON", amountMinor: -5000, transactionDate: "2026-01-05" },
        { merchantToken: "AMAZON", amountMinor: -15000, transactionDate: "2025-12-05" },
        { merchantToken: "AMAZON", amountMinor: -2500, transactionDate: "2025-11-05" },
      ],
      minOccurrences: 2,
      amountTolerancePercent: 10,
    });

    // Amounts vary too much — not a subscription
    expect(result).toHaveLength(0);
  });

  it("handles empty transactions", () => {
    const result = detectSubscriptions({
      transactions: [],
      minOccurrences: 2,
      amountTolerancePercent: 10,
    });

    expect(result).toHaveLength(0);
  });

  it("uses default parameters when not specified", () => {
    const result = detectSubscriptions({
      transactions: [
        { merchantToken: "NETFLIX", amountMinor: -1599, transactionDate: "2026-01-15" },
        { merchantToken: "NETFLIX", amountMinor: -1599, transactionDate: "2025-12-15" },
      ],
    });

    expect(result).toHaveLength(1);
  });

  it("marks subscription as inactive when latest charge is old", () => {
    const result = detectSubscriptions({
      transactions: [
        { merchantToken: "HULU", amountMinor: -799, transactionDate: "2025-06-15" },
        { merchantToken: "HULU", amountMinor: -799, transactionDate: "2025-05-15" },
        { merchantToken: "HULU", amountMinor: -799, transactionDate: "2025-04-15" },
      ],
      minOccurrences: 2,
      amountTolerancePercent: 10,
      today: "2026-01-15",
    });

    expect(result).toHaveLength(1);
    expect(result[0]!.merchantToken).toBe("HULU");
    expect(result[0]!.isActive).toBe(false);
  });

  it("computes monthly cost estimate", () => {
    const result = detectSubscriptions({
      transactions: [
        { merchantToken: "NETFLIX", amountMinor: -1599, transactionDate: "2026-01-15" },
        { merchantToken: "NETFLIX", amountMinor: -1599, transactionDate: "2025-12-15" },
        { merchantToken: "SPOTIFY", amountMinor: -999, transactionDate: "2026-01-10" },
        { merchantToken: "SPOTIFY", amountMinor: -999, transactionDate: "2025-12-10" },
      ],
      minOccurrences: 2,
      amountTolerancePercent: 10,
    });

    expect(result).toHaveLength(2);
    // Total monthly subscription cost = 1599 + 999 = 2598
    const totalMonthly = result.reduce(
      (sum, s) => sum + Math.abs(s.averageAmountMinor),
      0
    );
    expect(totalMonthly).toBe(2598);
  });
});
