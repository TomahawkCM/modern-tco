/**
 * Natural Language Import Configuration
 * Uses OpenAI API to parse user intent and auto-generate bank configurations
 *
 * Example: "Import my TD checking account CSV" → auto-configures TD parser
 *
 * Privacy: Only sends user's natural language input, no transaction data
 */

import OpenAI from "openai";
import { BANK_CONFIGS } from "@/lib/parsers/csv-parser";
import type { BankConfig } from "@/types/budget";
import { isAIFeaturesEnabled } from "@/lib/budget-privacy-settings";

export interface ImportIntent {
  bank: string | null; // Bank key from BANK_CONFIGS
  accountType: "checking" | "savings" | "credit" | null;
  fileFormat: "csv" | "ofx" | "qfx" | null;
  confidence: number; // 0-1 scale
  reasoning: string; // Explanation of parsing
  suggestedConfig?: Partial<BankConfig>; // Custom config if needed
}

export interface NaturalLanguageImportOptions {
  apiKey?: string;
  enabled?: boolean;
  fallbackToWizard?: boolean; // Fallback to visual wizard on failure
}

const DEFAULT_OPTIONS: Required<NaturalLanguageImportOptions> = {
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || "",
  enabled: true,
  fallbackToWizard: true,
};

/**
 * Available banks for reference
 */
const AVAILABLE_BANKS = {
  canadian: [
    "BMO (Bank of Montreal)",
    "TD Canada Trust",
    "RBC (Royal Bank of Canada)",
    "Scotiabank",
    "CIBC (Canadian Imperial Bank of Commerce)",
    "Tangerine",
    "Simplii Financial",
    "Home Trust",
  ],
  american: ["Chase Bank", "Bank of America", "Wells Fargo", "Citibank", "Capital One", "US Bank"],
};

/**
 * Bank name mappings to config keys
 */
const BANK_NAME_MAP: Record<string, string> = {
  // Canadian banks
  bmo: "bmo",
  "bank of montreal": "bmo",
  td: "td",
  "td bank": "td",
  "toronto-dominion": "td",
  "td canada trust": "td",
  rbc: "rbc",
  "royal bank": "rbc",
  "royal bank of canada": "rbc",
  scotiabank: "scotiabank",
  scotia: "scotiabank",
  cibc: "cibc",
  "canadian imperial": "cibc",
  tangerine: "tangerine",
  simplii: "simplii",
  "simplii financial": "simplii",
  "home trust": "homeTrust",

  // American banks
  chase: "chase",
  "chase bank": "chase",
  "bank of america": "bofa",
  bofa: "bofa",
  "wells fargo": "wellsFargo",
  citibank: "citibank",
  citi: "citibank",
  "capital one": "capitalOne",
  "us bank": "usBank",
  usbank: "usBank",
};

/**
 * Parse natural language import intent using OpenAI API
 */
export async function parseImportIntent(
  userInput: string,
  options: NaturalLanguageImportOptions = {}
): Promise<ImportIntent> {
  const finalOptions = { ...DEFAULT_OPTIONS, ...options };

  // Privacy check
  if (!finalOptions.enabled || !isAIFeaturesEnabled()) {
    return {
      bank: null,
      accountType: null,
      fileFormat: null,
      confidence: 0,
      reasoning: "Natural language import is disabled in privacy settings",
    };
  }

  // API key check
  if (!finalOptions.apiKey) {
    console.warn("[NLImport] No API key provided. Falling back to basic parsing.");
    return parseBasicIntent(userInput);
  }

  try {
    const client = new OpenAI({ apiKey: finalOptions.apiKey, dangerouslyAllowBrowser: true });

    const prompt = `You are a financial data import assistant. Parse the user's natural language request to configure a bank import.

User input: "${userInput}"

Available banks:
Canadian: ${AVAILABLE_BANKS.canadian.join(", ")}
American: ${AVAILABLE_BANKS.american.join(", ")}

Available account types: checking, savings, credit
Available file formats: CSV, OFX, QFX

Extract:
1. Bank name (map to one of the available banks)
2. Account type (checking, savings, or credit)
3. File format (CSV, OFX, or QFX)

Respond with JSON:
{
  "bank": "bank key (e.g., 'td', 'chase', 'bmo') or null if unclear",
  "accountType": "checking" | "savings" | "credit" | null,
  "fileFormat": "csv" | "ofx" | "qfx" | null,
  "confidence": 0.0-1.0,
  "reasoning": "Brief explanation of how you parsed the request"
}`;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini", // Fast and cost-effective model
      messages: [
        {
          role: "system",
          content:
            "You are a financial data import configuration assistant. Be precise and conservative - only return high confidence matches.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1, // Low temperature for consistent results
      max_tokens: 300,
    });

    const content = response.choices[0]?.message?.content;
    if (content) {
      const result = JSON.parse(content);

      // Validate bank key exists
      const bankKey = result.bank?.toLowerCase();
      const validBankKey = bankKey && BANK_CONFIGS[bankKey] ? bankKey : null;

      return {
        bank: validBankKey,
        accountType: result.accountType || null,
        fileFormat: result.fileFormat?.toLowerCase() || null,
        confidence: Math.max(0, Math.min(1, result.confidence || 0)),
        reasoning: result.reasoning || "Parsed using OpenAI API",
      };
    }

    // Fallback if JSON parsing fails
    return parseBasicIntent(userInput);
  } catch (error) {
    console.error("[NLImport] API error:", error);
    // Fallback to basic parsing
    return parseBasicIntent(userInput);
  }
}

/**
 * Basic intent parsing without AI (fallback)
 * Uses keyword matching
 */
function parseBasicIntent(userInput: string): ImportIntent {
  const lowerInput = userInput.toLowerCase();

  // Extract bank
  let bank: string | null = null;
  for (const [key, value] of Object.entries(BANK_NAME_MAP)) {
    if (lowerInput.includes(key)) {
      bank = value;
      break;
    }
  }

  // Extract account type
  let accountType: "checking" | "savings" | "credit" | null = null;
  if (lowerInput.includes("checking")) {
    accountType = "checking";
  } else if (lowerInput.includes("savings")) {
    accountType = "savings";
  } else if (lowerInput.includes("credit")) {
    accountType = "credit";
  }

  // Extract file format
  let fileFormat: "csv" | "ofx" | "qfx" | null = null;
  if (lowerInput.includes("csv")) {
    fileFormat = "csv";
  } else if (lowerInput.includes("ofx")) {
    fileFormat = "ofx";
  } else if (lowerInput.includes("qfx")) {
    fileFormat = "qfx";
  }

  // Calculate confidence based on matches
  let confidence = 0.5; // Base confidence for keyword matching
  if (bank) confidence += 0.2;
  if (accountType) confidence += 0.15;
  if (fileFormat) confidence += 0.15;

  return {
    bank,
    accountType,
    fileFormat,
    confidence: Math.min(1, confidence),
    reasoning: "Parsed using keyword matching (AI unavailable)",
  };
}

/**
 * Auto-configure import based on natural language input
 * Returns configuration ready for import wizard
 */
export async function autoConfigureImport(
  userInput: string,
  options: NaturalLanguageImportOptions = {}
): Promise<{
  success: boolean;
  bankKey: string | null;
  accountType: "checking" | "savings" | "credit" | null;
  fileFormat: "csv" | "ofx" | "qfx" | null;
  intent: ImportIntent;
  shouldUseWizard: boolean; // True if confidence is low and should show wizard
}> {
  const intent = await parseImportIntent(userInput, options);

  // If confidence is low, suggest using wizard
  const shouldUseWizard = intent.confidence < 0.7 && options.fallbackToWizard !== false;

  return {
    success: intent.bank !== null && intent.confidence >= 0.5,
    bankKey: intent.bank,
    accountType: intent.accountType,
    fileFormat: intent.fileFormat,
    intent,
    shouldUseWizard,
  };
}

/**
 * Check if natural language import is enabled
 */
export function isNaturalLanguageImportEnabled(): boolean {
  if (typeof window === "undefined") return false;

  try {
    const settings = localStorage.getItem("budget-app-privacy-settings");
    if (settings) {
      const parsed = JSON.parse(settings);
      return parsed.enableNaturalLanguageImport === true && parsed.enableAIFeatures === true;
    }
  } catch (error) {
    console.warn("[NLImport] Failed to check privacy settings:", error);
  }

  return false;
}
