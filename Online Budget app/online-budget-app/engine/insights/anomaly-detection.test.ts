import { describe, it, expect } from "vitest";
import {
  detectAnomalies,
  detectAnomaliesFromTransactions,
} from "./anomaly-detection";

describe("detectAnomalies", () => {
  it("flags category with spending significantly above baseline", () => {
    const result = detectAnomalies({
      currentMonth: [
        { categoryKey: "dining", spentMinor: 80000 },
        { categoryKey: "groceries", spentMinor: 52000 },
      ],
      baselineMonths: [
        [
          { categoryKey: "dining", spentMinor: 20000 },
          { categoryKey: "groceries", spentMinor: 50000 },
        ],
        [
          { categoryKey: "dining", spentMinor: 25000 },
          { categoryKey: "groceries", spentMinor: 48000 },
        ],
      ],
      thresholdPercent: 50,
    });

    // Dining: baseline avg=22500, current=80000 → +255% (anomaly)
    // Groceries: baseline avg=49000, current=52000 → +6% (not anomaly)
    expect(result).toHaveLength(1);
    expect(result[0]!.categoryKey).toBe("dining");
    expect(result[0]!.direction).toBe("increase");
    expect(result[0]!.deviationPercent).toBeGreaterThan(50);
  });

  it("flags category with spending significantly below baseline", () => {
    const result = detectAnomalies({
      currentMonth: [
        { categoryKey: "groceries", spentMinor: 10000 },
      ],
      baselineMonths: [
        [{ categoryKey: "groceries", spentMinor: 50000 }],
        [{ categoryKey: "groceries", spentMinor: 50000 }],
      ],
      thresholdPercent: 50,
    });

    // Groceries: baseline avg=50000, current=10000 → -80% (anomaly)
    expect(result).toHaveLength(1);
    expect(result[0]!.categoryKey).toBe("groceries");
    expect(result[0]!.direction).toBe("decrease");
    expect(result[0]!.deviationPercent).toBeCloseTo(80);
  });

  it("returns empty array when no anomalies", () => {
    const result = detectAnomalies({
      currentMonth: [
        { categoryKey: "groceries", spentMinor: 50000 },
      ],
      baselineMonths: [
        [{ categoryKey: "groceries", spentMinor: 48000 }],
        [{ categoryKey: "groceries", spentMinor: 52000 }],
      ],
      thresholdPercent: 50,
    });

    expect(result).toHaveLength(0);
  });

  it("skips categories with zero baseline (new spending is not an anomaly)", () => {
    const result = detectAnomalies({
      currentMonth: [
        { categoryKey: "travel", spentMinor: 200000 },
        { categoryKey: "groceries", spentMinor: 50000 },
      ],
      baselineMonths: [
        [{ categoryKey: "groceries", spentMinor: 50000 }],
      ],
      thresholdPercent: 50,
    });

    // Travel has no baseline — cannot determine anomaly, should be skipped
    // Groceries is stable (0% change) — not an anomaly
    expect(result).toHaveLength(0);
  });

  it("handles empty baseline", () => {
    const result = detectAnomalies({
      currentMonth: [{ categoryKey: "groceries", spentMinor: 50000 }],
      baselineMonths: [],
      thresholdPercent: 50,
    });

    expect(result).toHaveLength(0);
  });

  it("uses default threshold of 50% when not specified", () => {
    const result = detectAnomalies({
      currentMonth: [
        { categoryKey: "dining", spentMinor: 70000 },
      ],
      baselineMonths: [
        [{ categoryKey: "dining", spentMinor: 50000 }],
      ],
    });

    // 70000 vs 50000 = +40% — below 50% threshold
    expect(result).toHaveLength(0);
  });

  it("sorts anomalies by deviation descending", () => {
    const result = detectAnomalies({
      currentMonth: [
        { categoryKey: "dining", spentMinor: 90000 },
        { categoryKey: "transport", spentMinor: 80000 },
      ],
      baselineMonths: [
        [
          { categoryKey: "dining", spentMinor: 30000 },
          { categoryKey: "transport", spentMinor: 40000 },
        ],
      ],
      thresholdPercent: 50,
    });

    // Dining: +200%, Transport: +100%
    expect(result).toHaveLength(2);
    expect(result[0]!.categoryKey).toBe("dining");
    expect(result[1]!.categoryKey).toBe("transport");
  });
});

describe("detectAnomaliesFromTransactions", () => {
  it("filters expenses and delegates to detectAnomalies", () => {
    const current = [
      { amountMinor: -8000, currency: "USD", categoryKey: "dining" as string | null },
      { amountMinor: -5000, currency: "USD", categoryKey: "groceries" as string | null },
      { amountMinor: 100000, currency: "USD", categoryKey: "salary" as string | null },
    ];
    const baseline = [
      [
        { amountMinor: -2000, currency: "USD", categoryKey: "dining" as string | null },
        { amountMinor: -5000, currency: "USD", categoryKey: "groceries" as string | null },
      ],
      [
        { amountMinor: -2500, currency: "USD", categoryKey: "dining" as string | null },
        { amountMinor: -4800, currency: "USD", categoryKey: "groceries" as string | null },
      ],
    ];

    const result = detectAnomaliesFromTransactions(current, baseline, "USD");

    // Dining: baseline avg ~2250, current 8000 → ~255% (anomaly)
    // Groceries: baseline avg ~4900, current 5000 → ~2% (not anomaly)
    // Salary: excluded (income)
    expect(result).toHaveLength(1);
    expect(result[0]!.categoryKey).toBe("dining");
    expect(result[0]!.direction).toBe("increase");
  });

  it("excludes uncategorized transactions", () => {
    const current = [
      { amountMinor: -8000, currency: "USD", categoryKey: null as string | null },
      { amountMinor: -5000, currency: "USD", categoryKey: "groceries" as string | null },
    ];
    const baseline = [
      [{ amountMinor: -5000, currency: "USD", categoryKey: "groceries" as string | null }],
    ];

    const result = detectAnomaliesFromTransactions(current, baseline, "USD");

    // Groceries: 0% change, not anomaly. Uncategorized: excluded.
    expect(result).toHaveLength(0);
  });

  it("returns empty for empty transactions", () => {
    const result = detectAnomaliesFromTransactions([], [], "USD");
    expect(result).toHaveLength(0);
  });

  it("passes through custom threshold", () => {
    const current = [
      { amountMinor: -7000, currency: "USD", categoryKey: "dining" as string | null },
    ];
    const baseline = [
      [{ amountMinor: -5000, currency: "USD", categoryKey: "dining" as string | null }],
    ];

    // 40% change — below default 50% but above custom 30%
    const withDefault = detectAnomaliesFromTransactions(current, baseline, "USD");
    expect(withDefault).toHaveLength(0);

    const withCustom = detectAnomaliesFromTransactions(current, baseline, "USD", 30);
    expect(withCustom).toHaveLength(1);
    expect(withCustom[0]!.categoryKey).toBe("dining");
  });
});
