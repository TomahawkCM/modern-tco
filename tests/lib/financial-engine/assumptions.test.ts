/**
 * Assumptions Manager Tests
 *
 * Tests for assumption presets, load/save/reset, and localStorage persistence.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  DEFAULT_ASSUMPTIONS,
  CONSERVATIVE_ASSUMPTIONS,
  AGGRESSIVE_ASSUMPTIONS,
  loadAssumptions,
  saveAssumptions,
  resetAssumptions,
  getPresetAssumptions,
} from "@/lib/financial-engine/assumptions";

// ============================================================================
// Preset Assumptions
// ============================================================================

describe("Preset Assumptions", () => {
  it("should have valid default assumptions", () => {
    expect(DEFAULT_ASSUMPTIONS.id).toBe("default");
    expect(DEFAULT_ASSUMPTIONS.inflationRate).toBe(3.0);
    expect(DEFAULT_ASSUMPTIONS.preRetirementReturn).toBe(7.0);
    expect(DEFAULT_ASSUMPTIONS.postRetirementReturn).toBe(5.0);
    expect(DEFAULT_ASSUMPTIONS.safeWithdrawalRate).toBe(4.0);
    expect(DEFAULT_ASSUMPTIONS.socialSecurityAge).toBe(67);
    expect(DEFAULT_ASSUMPTIONS.socialSecurityMonthly).toBe(1900);
    expect(DEFAULT_ASSUMPTIONS.lifeExpectancy).toBe(85);
    expect(DEFAULT_ASSUMPTIONS.taxRate).toBe(22);
  });

  it("should have valid conservative assumptions", () => {
    expect(CONSERVATIVE_ASSUMPTIONS.id).toBe("conservative");
    expect(CONSERVATIVE_ASSUMPTIONS.inflationRate).toBe(3.5);
    expect(CONSERVATIVE_ASSUMPTIONS.preRetirementReturn).toBe(5.0);
    expect(CONSERVATIVE_ASSUMPTIONS.postRetirementReturn).toBe(3.5);
    expect(CONSERVATIVE_ASSUMPTIONS.safeWithdrawalRate).toBe(3.5);
    expect(CONSERVATIVE_ASSUMPTIONS.lifeExpectancy).toBe(90);
  });

  it("should have valid aggressive assumptions", () => {
    expect(AGGRESSIVE_ASSUMPTIONS.id).toBe("aggressive");
    expect(AGGRESSIVE_ASSUMPTIONS.inflationRate).toBe(2.5);
    expect(AGGRESSIVE_ASSUMPTIONS.preRetirementReturn).toBe(9.0);
    expect(AGGRESSIVE_ASSUMPTIONS.postRetirementReturn).toBe(6.5);
    expect(AGGRESSIVE_ASSUMPTIONS.safeWithdrawalRate).toBe(4.5);
    expect(AGGRESSIVE_ASSUMPTIONS.lifeExpectancy).toBe(82);
  });

  it("conservative should be more cautious than default", () => {
    expect(CONSERVATIVE_ASSUMPTIONS.inflationRate).toBeGreaterThan(
      DEFAULT_ASSUMPTIONS.inflationRate
    );
    expect(CONSERVATIVE_ASSUMPTIONS.preRetirementReturn).toBeLessThan(
      DEFAULT_ASSUMPTIONS.preRetirementReturn
    );
    expect(CONSERVATIVE_ASSUMPTIONS.safeWithdrawalRate).toBeLessThan(
      DEFAULT_ASSUMPTIONS.safeWithdrawalRate
    );
    expect(CONSERVATIVE_ASSUMPTIONS.lifeExpectancy).toBeGreaterThan(
      DEFAULT_ASSUMPTIONS.lifeExpectancy
    );
  });

  it("aggressive should be more optimistic than default", () => {
    expect(AGGRESSIVE_ASSUMPTIONS.inflationRate).toBeLessThan(DEFAULT_ASSUMPTIONS.inflationRate);
    expect(AGGRESSIVE_ASSUMPTIONS.preRetirementReturn).toBeGreaterThan(
      DEFAULT_ASSUMPTIONS.preRetirementReturn
    );
    expect(AGGRESSIVE_ASSUMPTIONS.safeWithdrawalRate).toBeGreaterThan(
      DEFAULT_ASSUMPTIONS.safeWithdrawalRate
    );
  });

  it("getPresetAssumptions should return all 3 presets", () => {
    const presets = getPresetAssumptions();
    expect(presets).toHaveLength(3);
    expect(presets[0]).toBe(DEFAULT_ASSUMPTIONS);
    expect(presets[1]).toBe(CONSERVATIVE_ASSUMPTIONS);
    expect(presets[2]).toBe(AGGRESSIVE_ASSUMPTIONS);
  });

  it("all presets should have required fields", () => {
    const presets = getPresetAssumptions();
    for (const preset of presets) {
      expect(typeof preset.id).toBe("string");
      expect(typeof preset.name).toBe("string");
      expect(typeof preset.inflationRate).toBe("number");
      expect(typeof preset.preRetirementReturn).toBe("number");
      expect(typeof preset.postRetirementReturn).toBe("number");
      expect(typeof preset.safeWithdrawalRate).toBe("number");
      expect(typeof preset.socialSecurityAge).toBe("number");
      expect(typeof preset.socialSecurityMonthly).toBe("number");
      expect(typeof preset.lifeExpectancy).toBe("number");
      expect(typeof preset.taxRate).toBe("number");
      expect(typeof preset.updatedAt).toBe("number");
    }
  });
});

// ============================================================================
// Load / Save / Reset
// ============================================================================

describe("localStorage operations", () => {
  let mockStorage: Record<string, string>;

  beforeEach(() => {
    mockStorage = {};
    vi.stubGlobal("localStorage", {
      getItem: vi.fn((key: string) => mockStorage[key] ?? null),
      setItem: vi.fn((key: string, value: string) => {
        mockStorage[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete mockStorage[key];
      }),
    });
  });

  it("loadAssumptions should return defaults when nothing stored", () => {
    const result = loadAssumptions();
    expect(result).toEqual(DEFAULT_ASSUMPTIONS);
  });

  it("saveAssumptions should store to localStorage", () => {
    saveAssumptions(DEFAULT_ASSUMPTIONS);
    expect(localStorage.setItem).toHaveBeenCalled();
  });

  it("should round-trip save and load", () => {
    const custom = {
      ...DEFAULT_ASSUMPTIONS,
      id: "custom",
      name: "My Assumptions",
      inflationRate: 4.0,
    };

    saveAssumptions(custom);

    // Parse what was saved
    const savedCall = vi.mocked(localStorage.setItem).mock.calls[0];
    mockStorage[savedCall[0]] = savedCall[1];

    const loaded = loadAssumptions();
    expect(loaded.id).toBe("custom");
    expect(loaded.inflationRate).toBe(4.0);
  });

  it("loadAssumptions should return defaults for invalid JSON", () => {
    mockStorage["financial-engine-assumptions"] = "not-json";
    const result = loadAssumptions();
    expect(result).toEqual(DEFAULT_ASSUMPTIONS);
  });

  it("loadAssumptions should return defaults for invalid data shape", () => {
    mockStorage["financial-engine-assumptions"] = JSON.stringify({ foo: "bar" });
    const result = loadAssumptions();
    expect(result).toEqual(DEFAULT_ASSUMPTIONS);
  });

  it("resetAssumptions should remove from localStorage", () => {
    resetAssumptions();
    expect(localStorage.removeItem).toHaveBeenCalledWith("financial-engine-assumptions");
  });
});
