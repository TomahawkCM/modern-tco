/**
 * AI Orchestration Layer
 *
 * Contains:
 * - Prompt templates
 * - Context builders
 * - Guardrails
 * - LLM wrappers
 *
 * Rules:
 * - AI cannot compute financial values.
 * - AI only narrates engine output.
 */

// Types
export type { NarrativeResult, ChatResult } from "./types";

// Client
export { callNarrative } from "./client";

// System prompt
export { NARRATIVE_SYSTEM_PROMPT } from "./system-prompt";

// Context builders
export {
  buildMonthlySummaryContext,
  buildAnomalyContext,
  buildSubscriptionContext,
  buildBudgetRiskContext,
  buildAffordabilityContext,
} from "./context-builders";

// Narrators
export {
  narrateMonthlySummary,
  narrateAnomalies,
  narrateSubscriptions,
  narrateBudgetRisk,
  narrateAffordability,
} from "./narrators";
