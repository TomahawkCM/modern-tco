/**
 * Thin Anthropic SDK client — singleton for server-side usage.
 *
 * Requires ANTHROPIC_API_KEY env var.
 * Uses Claude Haiku for cost-efficient narrative generation.
 *
 * No provider abstraction. No retry logic. No rate limiting.
 * No streaming. No caching. Stateless per-call.
 */
import Anthropic from "@anthropic-ai/sdk";

import type { NarrativeResult } from "./types";
import { NARRATIVE_SYSTEM_PROMPT } from "./system-prompt";

let instance: Anthropic | null = null;

export const NARRATIVE_MODEL = "claude-haiku-4-5";
export const NARRATIVE_MAX_TOKENS = 300;
export const NARRATIVE_TEMPERATURE = 0.2;

function getClient(): Anthropic {
  if (!instance) {
    instance = new Anthropic();
  }
  return instance;
}

/**
 * Send a single narrative request to Claude Haiku.
 *
 * - Injects the locked system prompt automatically.
 * - Returns NarrativeResult (never throws).
 * - Stateless — no conversation memory between calls.
 */
export async function callNarrative(
  userMessage: string
): Promise<NarrativeResult> {
  try {
    const client = getClient();
    const response = await client.messages.create({
      model: NARRATIVE_MODEL,
      max_tokens: NARRATIVE_MAX_TOKENS,
      temperature: NARRATIVE_TEMPERATURE,
      system: NARRATIVE_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return { ok: false, error: "No text in LLM response" };
    }

    return { ok: true, narrative: textBlock.text };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { ok: false, error: message };
  }
}
