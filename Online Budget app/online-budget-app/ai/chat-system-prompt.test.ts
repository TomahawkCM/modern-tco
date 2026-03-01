import { describe, it, expect } from "vitest";
import { CHAT_SYSTEM_PROMPT } from "./chat-system-prompt";

describe("CHAT_SYSTEM_PROMPT", () => {
  it("is a non-empty string", () => {
    expect(typeof CHAT_SYSTEM_PROMPT).toBe("string");
    expect(CHAT_SYSTEM_PROMPT.length).toBeGreaterThan(100);
  });

  it("contains financial advice prohibition", () => {
    expect(CHAT_SYSTEM_PROMPT).toContain("financial advice");
  });

  it("contains data-only instruction", () => {
    expect(CHAT_SYSTEM_PROMPT).toContain("JSON input");
  });

  it("contains conversational instruction", () => {
    expect(CHAT_SYSTEM_PROMPT).toContain("question");
  });

  it("prohibits inventing numbers", () => {
    expect(CHAT_SYSTEM_PROMPT).toContain("Do not invent");
  });
});
