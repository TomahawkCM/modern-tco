import { describe, it, expect } from "vitest";
import { computeGoalProgress } from "./goal-progress";

describe("computeGoalProgress", () => {
  const today = new Date("2026-06-15");

  it("computes progress percentage and remaining", () => {
    const result = computeGoalProgress(
      {
        targetMinor: 100000,
        savedMinor: 40000,
        monthlySavingsMinor: 10000,
        deadline: "2027-01-01",
      },
      today
    );

    expect(result.percentComplete).toBeCloseTo(40);
    expect(result.remainingMinor).toBe(60000);
    expect(result.isComplete).toBe(false);
  });

  it("estimates completion date from monthly savings rate", () => {
    const result = computeGoalProgress(
      {
        targetMinor: 100000,
        savedMinor: 40000,
        monthlySavingsMinor: 10000,
        deadline: "2027-06-01",
      },
      today
    );

    // 60000 remaining / 10000 per month = 6 months from 2026-06-15
    // Estimated: 2026-12-15
    expect(result.estimatedCompletionDate).toBe("2026-12-15");
    expect(result.onTrack).toBe(true);
  });

  it("marks off-track when estimated date exceeds deadline", () => {
    const result = computeGoalProgress(
      {
        targetMinor: 100000,
        savedMinor: 10000,
        monthlySavingsMinor: 5000,
        deadline: "2026-09-01",
      },
      today
    );

    // 90000 remaining / 5000 per month = 18 months → 2027-12-15
    // Deadline 2026-09-01 → off track
    expect(result.onTrack).toBe(false);
  });

  it("handles overfunded goal", () => {
    const result = computeGoalProgress(
      {
        targetMinor: 50000,
        savedMinor: 60000,
        monthlySavingsMinor: 5000,
        deadline: "2027-01-01",
      },
      today
    );

    expect(result.percentComplete).toBeCloseTo(120);
    expect(result.remainingMinor).toBe(0);
    expect(result.isComplete).toBe(true);
    expect(result.onTrack).toBe(true);
  });

  it("handles exactly funded goal", () => {
    const result = computeGoalProgress(
      {
        targetMinor: 50000,
        savedMinor: 50000,
        monthlySavingsMinor: 5000,
        deadline: "2027-01-01",
      },
      today
    );

    expect(result.percentComplete).toBeCloseTo(100);
    expect(result.remainingMinor).toBe(0);
    expect(result.isComplete).toBe(true);
  });

  it("handles zero target", () => {
    const result = computeGoalProgress(
      {
        targetMinor: 0,
        savedMinor: 0,
        monthlySavingsMinor: 0,
        deadline: "2027-01-01",
      },
      today
    );

    expect(result.percentComplete).toBe(100);
    expect(result.isComplete).toBe(true);
    expect(result.remainingMinor).toBe(0);
  });

  it("handles zero monthly savings with remaining balance", () => {
    const result = computeGoalProgress(
      {
        targetMinor: 100000,
        savedMinor: 30000,
        monthlySavingsMinor: 0,
        deadline: "2027-01-01",
      },
      today
    );

    expect(result.percentComplete).toBeCloseTo(30);
    expect(result.estimatedCompletionDate).toBeNull();
    expect(result.onTrack).toBe(false);
  });

  it("handles no deadline", () => {
    const result = computeGoalProgress(
      {
        targetMinor: 100000,
        savedMinor: 40000,
        monthlySavingsMinor: 10000,
        deadline: null,
      },
      today
    );

    // No deadline → can't be off track, but still estimates completion
    expect(result.estimatedCompletionDate).toBe("2026-12-15");
    expect(result.onTrack).toBe(true);
  });

  it("handles zero savings and no deadline", () => {
    const result = computeGoalProgress(
      {
        targetMinor: 50000,
        savedMinor: 0,
        monthlySavingsMinor: 0,
        deadline: null,
      },
      today
    );

    expect(result.estimatedCompletionDate).toBeNull();
    expect(result.onTrack).toBe(false);
  });
});
