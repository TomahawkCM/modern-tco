/**
 * Unit Tests for AIProvider abstraction
 * Tests the BYOK AI interface, JSON helper, global registry, and mock provider.
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  chatCompletionJSON,
  setAIProvider,
  getAIProvider,
  hasAIProvider,
  MockAIProvider,
  type AIProvider,
  type AIResponse,
} from "../ai-provider";

// ============================================================================
// chatCompletionJSON()
// ============================================================================

describe("chatCompletionJSON()", () => {
  it("should parse a valid JSON response", async () => {
    const mock = new MockAIProvider('{"category": "groceries", "confidence": 0.95}');
    const result = await chatCompletionJSON<{ category: string; confidence: number }>(
      mock,
      "Classify this merchant: WALMART"
    );

    expect(result.success).toBe(true);
    expect(result.data).toEqual({ category: "groceries", confidence: 0.95 });
    expect(result.error).toBeUndefined();
  });

  it("should strip ```json code fences", async () => {
    const mock = new MockAIProvider('```json\n{"amount": 42.50}\n```');
    const result = await chatCompletionJSON<{ amount: number }>(mock, "parse this");

    expect(result.success).toBe(true);
    expect(result.data).toEqual({ amount: 42.5 });
  });

  it("should strip bare ``` code fences", async () => {
    const mock = new MockAIProvider('```\n{"key": "value"}\n```');
    const result = await chatCompletionJSON<{ key: string }>(mock, "parse this");

    expect(result.success).toBe(true);
    expect(result.data).toEqual({ key: "value" });
  });

  it("should handle JSON with surrounding whitespace", async () => {
    const mock = new MockAIProvider('  \n  {"trimmed": true}  \n  ');
    const result = await chatCompletionJSON<{ trimmed: boolean }>(mock, "parse");

    expect(result.success).toBe(true);
    expect(result.data).toEqual({ trimmed: true });
  });

  it("should return error for non-JSON response", async () => {
    const mock = new MockAIProvider("This is not JSON at all");
    const result = await chatCompletionJSON(mock, "bad prompt");

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/Failed to parse AI response as JSON/);
    expect(result.data).toBeUndefined();
  });

  it("should return error when provider returns success: false", async () => {
    const failProvider: AIProvider = {
      async chatCompletion() {
        return { success: false, error: "Rate limited" };
      },
    };
    const result = await chatCompletionJSON(failProvider, "anything");

    expect(result.success).toBe(false);
    expect(result.error).toBe("Rate limited");
  });

  it("should return error when provider returns success with no data", async () => {
    const emptyProvider: AIProvider = {
      async chatCompletion() {
        return { success: true } as AIResponse;
      },
    };
    const result = await chatCompletionJSON(emptyProvider, "anything");

    expect(result.success).toBe(false);
    expect(result.error).toBe("No response from AI provider");
  });

  it("should return error when provider returns empty string", async () => {
    const emptyProvider: AIProvider = {
      async chatCompletion() {
        return { success: true, data: "" };
      },
    };
    const result = await chatCompletionJSON(emptyProvider, "anything");

    expect(result.success).toBe(false);
    expect(result.error).toBe("No response from AI provider");
  });

  it("should pass options through to the provider", async () => {
    const mock = new MockAIProvider('{"ok": true}');
    await chatCompletionJSON(mock, "test prompt", {
      model: "gpt-4o",
      temperature: 0.5,
      maxTokens: 2048,
      systemPrompt: "You are a test assistant.",
    });

    const calls = mock.getCalls();
    expect(calls).toHaveLength(1);
    expect(calls[0].prompt).toBe("test prompt");
    expect(calls[0].options).toEqual({
      model: "gpt-4o",
      temperature: 0.5,
      maxTokens: 2048,
      systemPrompt: "You are a test assistant.",
    });
  });

  it("should handle nested JSON objects", async () => {
    const nested = JSON.stringify({
      columns: { date: 0, description: 1, amount: 3 },
      currency: "CAD",
    });
    const mock = new MockAIProvider(nested);
    const result = await chatCompletionJSON<{
      columns: Record<string, number>;
      currency: string;
    }>(mock, "map columns");

    expect(result.success).toBe(true);
    expect(result.data?.columns).toEqual({ date: 0, description: 1, amount: 3 });
    expect(result.data?.currency).toBe("CAD");
  });

  it("should handle JSON arrays", async () => {
    const mock = new MockAIProvider("[1, 2, 3]");
    const result = await chatCompletionJSON<number[]>(mock, "list");

    expect(result.success).toBe(true);
    expect(result.data).toEqual([1, 2, 3]);
  });
});

// ============================================================================
// Global AI Provider Registry
// ============================================================================

describe("Global AI Provider Registry", () => {
  afterEach(() => {
    // Always clean up global state
    setAIProvider(null);
  });

  it("should default to null (no provider)", () => {
    setAIProvider(null); // ensure clean state
    expect(getAIProvider()).toBeNull();
    expect(hasAIProvider()).toBe(false);
  });

  it("should set and get a provider", () => {
    const mock = new MockAIProvider();
    setAIProvider(mock);

    expect(getAIProvider()).toBe(mock);
    expect(hasAIProvider()).toBe(true);
  });

  it("should clear the provider when set to null", () => {
    const mock = new MockAIProvider();
    setAIProvider(mock);
    expect(hasAIProvider()).toBe(true);

    setAIProvider(null);
    expect(getAIProvider()).toBeNull();
    expect(hasAIProvider()).toBe(false);
  });

  it("should replace a provider with a new one", () => {
    const first = new MockAIProvider('{"v": 1}');
    const second = new MockAIProvider('{"v": 2}');

    setAIProvider(first);
    expect(getAIProvider()).toBe(first);

    setAIProvider(second);
    expect(getAIProvider()).toBe(second);
    expect(getAIProvider()).not.toBe(first);
  });

  it("should accept a plain object implementing AIProvider", () => {
    const custom: AIProvider = {
      async chatCompletion(prompt) {
        return { success: true, data: `echo: ${prompt}` };
      },
    };
    setAIProvider(custom);
    expect(getAIProvider()).toBe(custom);
    expect(hasAIProvider()).toBe(true);
  });
});

// ============================================================================
// MockAIProvider
// ============================================================================

describe("MockAIProvider", () => {
  let mock: MockAIProvider;

  beforeEach(() => {
    mock = new MockAIProvider();
  });

  // ---------- Default Response ----------

  describe("default response", () => {
    it("should return the default response when no rules match", async () => {
      const result = await mock.chatCompletion("any prompt");

      expect(result.success).toBe(true);
      expect(result.data).toBe('{"result": "mock"}');
    });

    it("should accept a custom default response", async () => {
      const custom = new MockAIProvider('{"custom": true}');
      const result = await custom.chatCompletion("anything");

      expect(result.data).toBe('{"custom": true}');
    });
  });

  // ---------- Pattern Matching ----------

  describe("pattern matching", () => {
    it("should match by string inclusion", async () => {
      mock.when("classify", '{"category": "food"}');

      const result = await mock.chatCompletion("Please classify this merchant");
      expect(result.data).toBe('{"category": "food"}');
    });

    it("should match by regex", async () => {
      mock.when(/column.*map/i, '{"date": 0, "amount": 1}');

      const result = await mock.chatCompletion("Generate a column mapping for this CSV");
      expect(result.data).toBe('{"date": 0, "amount": 1}');
    });

    it("should return first matching rule", async () => {
      mock.when("first", '{"match": 1}').when("first", '{"match": 2}');

      const result = await mock.chatCompletion("first prompt");
      expect(result.data).toBe('{"match": 1}');
    });

    it("should fall through to default when no rules match", async () => {
      mock.when("specific", '{"specific": true}');

      const result = await mock.chatCompletion("unrelated prompt");
      expect(result.data).toBe('{"result": "mock"}');
    });

    it("should support method chaining on when()", () => {
      const returned = mock.when("a", '{"a": true}').when("b", '{"b": true}');

      expect(returned).toBe(mock);
    });
  });

  // ---------- Call Tracking ----------

  describe("call tracking", () => {
    it("should start with no calls", () => {
      expect(mock.getCalls()).toEqual([]);
    });

    it("should record calls with prompt and options", async () => {
      await mock.chatCompletion("prompt 1");
      await mock.chatCompletion("prompt 2", { model: "gpt-4o", temperature: 0 });

      const calls = mock.getCalls();
      expect(calls).toHaveLength(2);
      expect(calls[0]).toEqual({ prompt: "prompt 1", options: undefined });
      expect(calls[1]).toEqual({
        prompt: "prompt 2",
        options: { model: "gpt-4o", temperature: 0 },
      });
    });

    it("should return a copy of calls (not the internal array)", async () => {
      await mock.chatCompletion("test");
      const calls1 = mock.getCalls();
      const calls2 = mock.getCalls();

      expect(calls1).toEqual(calls2);
      expect(calls1).not.toBe(calls2);
    });
  });

  // ---------- Reset ----------

  describe("reset()", () => {
    it("should clear call history", async () => {
      await mock.chatCompletion("call 1");
      await mock.chatCompletion("call 2");
      expect(mock.getCalls()).toHaveLength(2);

      mock.reset();
      expect(mock.getCalls()).toEqual([]);
    });

    it("should preserve response rules after reset", async () => {
      mock.when("special", '{"special": true}');
      await mock.chatCompletion("special prompt");
      mock.reset();

      expect(mock.getCalls()).toHaveLength(0);

      const result = await mock.chatCompletion("special prompt again");
      expect(result.data).toBe('{"special": true}');
      expect(mock.getCalls()).toHaveLength(1);
    });
  });
});
