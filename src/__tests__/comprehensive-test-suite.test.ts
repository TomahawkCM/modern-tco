/**
 * Focused regression tests for storage utilities and type helpers.
 * These tests replace the previous placeholder suite with actionable coverage.
 */

import { safeLocalStorage, safeSessionStorage, sanitizers, validators } from "@/utils/storageUtils";

const validExamSession = {
  id: "session-1",
  mode: "practice",
  questions: [],
  currentIndex: 0,
  answers: {},
  startTime: new Date().toISOString(),
  completed: false,
};

describe("storageUtils validators", () => {
  it("accepts a structurally valid exam session", () => {
    expect(validators.examSession(validExamSession)).toBe(true);
  });

  it("rejects an exam session without identifiers", () => {
    expect(
      validators.examSession({
        ...validExamSession,
        id: undefined,
      })
    ).toBe(false);
  });

  it("sanitises malformed exam sessions", () => {
    const sanitised = sanitizers.examSession({
      id: 42,
      mode: null,
      questions: null,
      currentIndex: -10,
      answers: null,
      completed: "yes",
      score: 150,
    });

    expect(sanitised.id).toMatch(/^session-/u);
    expect(sanitised.mode).toBe("practice");
    expect(Array.isArray(sanitised.questions)).toBe(true);
    expect(sanitised.currentIndex).toBe(0);
    expect(typeof sanitised.answers).toBe("object");
    expect(sanitised.completed).toBe(false);
    expect(sanitised.score).toBeLessThanOrEqual(100);
  });
});

describe("safeLocalStorage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("returns fallback when data is absent", () => {
    const fallback = { id: "fallback" };
    const value = safeLocalStorage.getItem("missing", { fallback });
    expect(value).toEqual(fallback);
  });

  it("removes corrupted data and returns fallback", () => {
    window.localStorage.setItem("session", "not-json");
    const fallback = { id: "fallback" };
    const result = safeLocalStorage.getItem("session", { fallback });
    expect(result).toEqual(fallback);
    expect(window.localStorage.getItem("session")).toBeNull();
  });

  it("persists valid data that passes validation", () => {
    window.localStorage.setItem("session", JSON.stringify(validExamSession));
    const result = safeLocalStorage.getItem<Record<string, unknown>>("session", {
      validate: validators.examSession,
    });
    expect(result).not.toBeNull();
    expect(result).toMatchObject({ id: "session-1" });
  });

  it("rejects values that fail validation when setting", () => {
    const invalidSession = { ...validExamSession, id: undefined } as Record<string, unknown>;
    const stored = safeLocalStorage.setItem("session", invalidSession, {
      validate: validators.examSession,
    });
    expect(stored).toBe(false);
    expect(window.localStorage.getItem("session")).toBeNull();
  });
});

describe("safeSessionStorage", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it("stores and retrieves JSON payloads", () => {
    const payload = { theme: "dark", language: "en", difficulty: "medium" };
    const stored = safeSessionStorage.setItem("settings", payload, {
      validate: validators.settings,
    });
    expect(stored).toBe(true);

    const retrieved = safeSessionStorage.getItem<Record<string, unknown>>("settings", {
      validate: validators.settings,
    });

    expect(retrieved).not.toBeNull();
    expect(retrieved).toMatchObject({ theme: "dark" });
  });

  it("falls back when validation fails", () => {
    window.sessionStorage.setItem("settings", JSON.stringify({ theme: 123 }));
    const fallback = { theme: "light" };
    const result = safeSessionStorage.getItem("settings", {
      validate: validators.settings,
      fallback,
    });

    expect(result).toEqual(fallback);
  });
});
