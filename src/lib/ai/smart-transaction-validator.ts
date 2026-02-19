/**
 * Smart Transaction Validator
 * Detects suspicious, unusual, or potentially incorrect transactions
 *
 * Features:
 * - High-confidence rule-based detection (same-day duplicates, future dates)
 * - Missing data validation
 * - Severity categorization (Critical, Warning, Info)
 * - User-friendly explanations
 *
 * Design Principles:
 * - Non-blocking: Warnings only, user decides
 * - High confidence: Minimize false positives
 * - Rule-based only: AI validation disabled to prevent false positives
 *
 * CHANGE LOG (2025-11-24):
 * - Disabled AI validation by default (was causing false positives)
 * - Removed amount spike detection (flagging rent/mortgage as unusual)
 * - Removed round number cluster detection (not actionable)
 * - Keeping only high-confidence rule-based checks
 */

import { chatCompletionJSON } from "./openai-service";
import type { ParsedTransaction } from "@/types/budget";

// ============================================================================
// Types
// ============================================================================

export type ValidationSeverity = "critical" | "warning" | "info";

export type ValidationIssueType =
  | "same_day_duplicate"
  | "future_date"
  | "amount_spike"
  | "zero_amount"
  | "negative_amount"
  | "missing_description"
  | "missing_date"
  | "unusual_pattern"
  | "round_number_cluster"
  | "balance_mismatch";

export interface ValidationIssue {
  transactionIndex: number; // Index in the import batch
  transaction: ParsedTransaction;
  type: ValidationIssueType;
  severity: ValidationSeverity;
  title: string;
  message: string;
  suggestion?: string; // What user should do
  confidence: number; // 0-1 confidence this is a real issue
  autoFixable: boolean; // Can this be auto-fixed?
}

export interface ValidationResult {
  hasIssues: boolean;
  criticalCount: number;
  warningCount: number;
  infoCount: number;
  issues: ValidationIssue[];
  aiAnalysis?: string; // Optional AI insights
}

interface AIValidationResponse {
  detected_issues: Array<{
    transaction_index: number;
    issue_type: ValidationIssueType;
    severity: ValidationSeverity;
    title: string;
    message: string;
    suggestion: string;
    confidence: number;
  }>;
  overall_analysis: string;
}

// ============================================================================
// Rule-Based Validation (Fast Path)
// ============================================================================

/**
 * Validate transactions using high-confidence rules
 * Rule-based only - catches obvious issues without false positives
 *
 * DISABLED RULES (too many false positives):
 * - Amount spikes: Was flagging rent/mortgage as unusual
 * - Round number clusters: Not actionable, just noise
 * - AI pattern analysis: Too aggressive, flagging legitimate transactions
 */
export function validateTransactionsWithRules(
  transactions: ParsedTransaction[]
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Rule 1: Same-day exact duplicates (HIGH confidence)
  const sameDayDuplicates = findSameDayDuplicates(transactions);
  issues.push(...sameDayDuplicates);

  // Rule 2: Future dates (HIGH confidence - likely parsing error)
  const futureDates = findFutureDates(transactions);
  issues.push(...futureDates);

  // DISABLED: Rule 3: Amount spikes - was causing false positives on rent/mortgage
  // const amountSpikes = findAmountSpikes(transactions);
  // issues.push(...amountSpikes);

  // Rule 4: Zero amounts only (not negative - those can be valid refunds)
  const zeroAmounts = findZeroAmounts(transactions);
  issues.push(...zeroAmounts);

  // Rule 5: Missing critical data (HIGH confidence)
  const missingData = findMissingData(transactions);
  issues.push(...missingData);

  // DISABLED: Rule 6: Round number clusters - not actionable, just noise
  // const roundNumberClusters = findRoundNumberClusters(transactions);
  // issues.push(...roundNumberClusters);

  return issues;
}

/**
 * Rule 1: Find same-day exact duplicates
 * Very high confidence - likely import error or double-click
 */
function findSameDayDuplicates(transactions: ParsedTransaction[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const seen = new Map<string, number>();

  transactions.forEach((tx, index) => {
    // Create key: date + amount + description
    const dateStr = tx.date.toISOString().split("T")[0];
    const key = `${dateStr}-${tx.amount.toFixed(2)}-${tx.description.trim().toLowerCase()}`;

    if (seen.has(key)) {
      const originalIndex = seen.get(key)!;
      issues.push({
        transactionIndex: index,
        transaction: tx,
        type: "same_day_duplicate",
        severity: "critical",
        title: "Exact Duplicate Transaction",
        message: `This transaction is identical to transaction #${originalIndex + 1} (same date, amount, and description). This is likely a duplicate import.`,
        suggestion: "Review and remove one of the duplicate transactions.",
        confidence: 0.95,
        autoFixable: false,
      });
    } else {
      seen.set(key, index);
    }
  });

  return issues;
}

/**
 * Rule 2: Find future-dated transactions
 * High confidence - likely date parsing error
 */
function findFutureDates(transactions: ParsedTransaction[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const now = new Date();
  const futureThreshold = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days ahead

  transactions.forEach((tx, index) => {
    if (tx.date > futureThreshold) {
      const daysInFuture = Math.floor((tx.date.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));

      issues.push({
        transactionIndex: index,
        transaction: tx,
        type: "future_date",
        severity: "critical",
        title: "Future Date Detected",
        message: `This transaction is dated ${daysInFuture} days in the future (${tx.date.toLocaleDateString()}). This may indicate a date parsing error.`,
        suggestion: "Verify the date format in your CSV file matches the expected format.",
        confidence: 0.9,
        autoFixable: false,
      });
    }
  });

  return issues;
}

/**
 * Rule 3: Find amount spikes (10x median)
 * Medium confidence - unusual but potentially valid
 */
function findAmountSpikes(transactions: ParsedTransaction[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (transactions.length < 5) {
    // Need at least 5 transactions to calculate meaningful median
    return issues;
  }

  // Calculate median absolute amount
  const amounts = transactions.map((tx) => Math.abs(tx.amount)).sort((a, b) => a - b);
  const median = amounts[Math.floor(amounts.length / 2)];

  if (median === 0) {
    // Can't detect spikes if median is zero
    return issues;
  }

  const spikeThreshold = median * 10; // 10x median

  transactions.forEach((tx, index) => {
    const absAmount = Math.abs(tx.amount);
    if (absAmount >= spikeThreshold) {
      const multiplier = (absAmount / median).toFixed(1);

      issues.push({
        transactionIndex: index,
        transaction: tx,
        type: "amount_spike",
        severity: "warning",
        title: "Unusually Large Amount",
        message: `This transaction amount ($${absAmount.toFixed(2)}) is ${multiplier}x larger than the median transaction in this import ($${median.toFixed(2)}).`,
        suggestion: "Verify this is correct and not a decimal point error.",
        confidence: 0.7,
        autoFixable: false,
      });
    }
  });

  return issues;
}

/**
 * Rule 4: Find zero amounts only
 * Medium confidence - may indicate parsing error
 * NOTE: Negative amounts are NOT flagged - they're valid refunds/credits
 */
function findZeroAmounts(transactions: ParsedTransaction[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  transactions.forEach((tx, index) => {
    if (tx.amount === 0) {
      issues.push({
        transactionIndex: index,
        transaction: tx,
        type: "zero_amount",
        severity: "warning",
        title: "Zero Amount Transaction",
        message: "This transaction has a $0.00 amount. This may indicate a parsing error.",
        suggestion: "Review the original CSV to verify this transaction should be $0.00.",
        confidence: 0.6,
        autoFixable: false,
      });
    }
  });

  return issues;
}

/**
 * Rule 5: Find missing critical data
 * High confidence - transactions need date, description, and amount
 */
function findMissingData(transactions: ParsedTransaction[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  transactions.forEach((tx, index) => {
    if (!tx.description || tx.description.trim().length === 0) {
      issues.push({
        transactionIndex: index,
        transaction: tx,
        type: "missing_description",
        severity: "critical",
        title: "Missing Description",
        message: "This transaction has no description. This may indicate incomplete data.",
        suggestion: "Check if the description column was mapped correctly.",
        confidence: 0.95,
        autoFixable: false,
      });
    }

    if (!tx.date || isNaN(tx.date.getTime())) {
      issues.push({
        transactionIndex: index,
        transaction: tx,
        type: "missing_date",
        severity: "critical",
        title: "Invalid Date",
        message: "This transaction has an invalid or missing date.",
        suggestion:
          "Verify the date column was mapped correctly and dates are in the expected format.",
        confidence: 0.95,
        autoFixable: false,
      });
    }
  });

  return issues;
}

/**
 * Rule 6: Find round number clusters
 * Low confidence - informational only
 */
function findRoundNumberClusters(transactions: ParsedTransaction[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Count how many transactions are round numbers (e.g., $100.00, $50.00)
  const roundNumbers = transactions.filter((tx) => {
    const absAmount = Math.abs(tx.amount);
    return absAmount % 10 === 0 && absAmount >= 10;
  });

  // If >50% are round numbers, flag as informational
  if (roundNumbers.length > transactions.length * 0.5 && transactions.length >= 10) {
    // Just flag the first one as representative
    if (roundNumbers.length > 0) {
      const firstIndex = transactions.indexOf(roundNumbers[0]);
      issues.push({
        transactionIndex: firstIndex,
        transaction: roundNumbers[0],
        type: "round_number_cluster",
        severity: "info",
        title: "Many Round Number Transactions",
        message: `${roundNumbers.length} out of ${transactions.length} transactions are round numbers (e.g., $50.00, $100.00). This is unusual but may be normal for your spending.`,
        suggestion: "No action needed if this is expected for your transactions.",
        confidence: 0.5,
        autoFixable: false,
      });
    }
  }

  return issues;
}

// ============================================================================
// Running Balance Validation
// ============================================================================

/**
 * Validate transactions against opening/closing balance.
 * If the statement includes balance info, verify computed balance matches.
 *
 * @param transactions - Sorted transactions (oldest first)
 * @param openingBalance - Opening balance from statement
 * @param closingBalance - Closing balance from statement
 */
export function validateRunningBalance(
  transactions: ParsedTransaction[],
  openingBalance: number,
  closingBalance: number
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Compute running balance from transactions
  let computedBalance = openingBalance;
  for (const tx of transactions) {
    computedBalance += tx.amount;
  }

  // Compare with stated closing balance (tolerance: $0.01)
  const discrepancy = Math.abs(computedBalance - closingBalance);
  if (discrepancy > 0.01) {
    issues.push({
      transactionIndex: -1, // Not tied to a specific transaction
      transaction: transactions[0], // Use first transaction as reference
      type: "balance_mismatch",
      severity: discrepancy > 100 ? "critical" : "warning",
      title: "Balance Discrepancy Detected",
      message: `Computed closing balance ($${computedBalance.toFixed(2)}) differs from stated closing balance ($${closingBalance.toFixed(2)}) by $${discrepancy.toFixed(2)}. This may indicate missing transactions or a parsing error.`,
      suggestion:
        "Compare the transaction count and amounts against your bank statement to identify missing or incorrectly parsed transactions.",
      confidence: 0.9,
      autoFixable: false,
    });
  }

  return issues;
}

// ============================================================================
// AI-Powered Validation (Deep Analysis)
// ============================================================================

/**
 * Analyze transactions using AI for subtle patterns
 * Only called if rule-based validation finds no critical issues
 *
 * @param transactions - Transactions to validate
 * @param existingIssues - Issues found by rule-based validation
 */
export async function validateTransactionsWithAI(
  transactions: ParsedTransaction[],
  existingIssues: ValidationIssue[]
): Promise<ValidationResult> {
  // If we already have critical issues, skip AI analysis (save API costs)
  const hasCritical = existingIssues.some((issue) => issue.severity === "critical");
  if (hasCritical || transactions.length === 0) {
    return {
      hasIssues: existingIssues.length > 0,
      criticalCount: existingIssues.filter((i) => i.severity === "critical").length,
      warningCount: existingIssues.filter((i) => i.severity === "warning").length,
      infoCount: existingIssues.filter((i) => i.severity === "info").length,
      issues: existingIssues,
    };
  }

  // Build AI analysis prompt
  const prompt = buildValidationPrompt(transactions, existingIssues);

  try {
    const response = await chatCompletionJSON<AIValidationResponse>(prompt, {
      model: "gpt-3.5-turbo",
      temperature: 0.3,
      maxTokens: 500,
      cacheKey: `tx-validation-${transactions.length}-${transactions[0]?.description.slice(0, 20)}`,
      systemPrompt:
        "You are an expert financial transaction analyst. Analyze transactions for anomalies and suspicious patterns. Respond with valid JSON only.",
    });

    if (!response.success || !response.data) {
      console.error("[TransactionValidator] AI analysis failed:", response.error);
      // Return rule-based issues
      return buildValidationResult(existingIssues);
    }

    const aiResult = response.data;

    // Combine AI-detected issues with rule-based issues
    const aiIssues: ValidationIssue[] = aiResult.detected_issues.map((issue) => ({
      transactionIndex: issue.transaction_index,
      transaction: transactions[issue.transaction_index],
      type: issue.issue_type,
      severity: issue.severity,
      title: issue.title,
      message: issue.message,
      suggestion: issue.suggestion,
      confidence: issue.confidence,
      autoFixable: false,
    }));

    const allIssues = [...existingIssues, ...aiIssues];

    return {
      ...buildValidationResult(allIssues),
      aiAnalysis: aiResult.overall_analysis,
    };
  } catch (error) {
    console.error("[TransactionValidator] AI validation error:", error);
    return buildValidationResult(existingIssues);
  }
}

/**
 * Build AI validation prompt
 */
function buildValidationPrompt(
  transactions: ParsedTransaction[],
  existingIssues: ValidationIssue[]
): string {
  // Send only essential data (first 20 transactions max)
  const sample = transactions.slice(0, 20).map((tx, i) => ({
    index: i,
    date: tx.date.toISOString().split("T")[0],
    description: tx.description.substring(0, 50),
    amount: tx.amount.toFixed(2),
  }));

  return `Analyze these transactions for subtle anomalies or unusual patterns.

**Transactions** (${transactions.length} total, showing first ${sample.length}):
${sample.map((tx) => `${tx.index}. ${tx.date} | $${tx.amount} | ${tx.description}`).join("\n")}

**Already Detected Issues**:
${existingIssues.map((i) => `- Transaction ${i.transactionIndex}: ${i.title}`).join("\n") || "None"}

**Task**: Find additional subtle issues that simple rules might miss:
- Unusual merchant name patterns (typos, duplicates with slight variations)
- Potential decimal point errors (e.g., $1000 instead of $10.00)
- Suspicious description patterns
- Temporal anomalies (multiple transactions at exact same time)

**Do NOT flag**:
- Normal spending patterns
- Valid refunds or returns
- Legitimate large purchases

**Issue Types**: same_day_duplicate, future_date, amount_spike, zero_amount, negative_amount, missing_description, missing_date, unusual_pattern, round_number_cluster

**Severity Levels**:
- critical: Definitely wrong, needs user attention
- warning: Unusual but might be valid
- info: Informational, no action needed

**Response Format** (JSON only):
{
  "detected_issues": [
    {
      "transaction_index": 5,
      "issue_type": "unusual_pattern",
      "severity": "warning",
      "title": "Duplicate Merchant with Typo",
      "message": "Transaction #5 'AMAZN' looks similar to #3 'AMAZON'. This may be a duplicate with a typo.",
      "suggestion": "Review if these are separate purchases or duplicates.",
      "confidence": 0.7
    }
  ],
  "overall_analysis": "Most transactions look normal. Found 1 potential duplicate with merchant name variation."
}

IMPORTANT: Only return issues with confidence >= 0.6. Minimize false positives.`;
}

/**
 * Build validation result from issues
 */
function buildValidationResult(issues: ValidationIssue[]): ValidationResult {
  return {
    hasIssues: issues.length > 0,
    criticalCount: issues.filter((i) => i.severity === "critical").length,
    warningCount: issues.filter((i) => i.severity === "warning").length,
    infoCount: issues.filter((i) => i.severity === "info").length,
    issues: issues.sort((a, b) => {
      // Sort by severity (critical > warning > info), then confidence
      const severityOrder = { critical: 0, warning: 1, info: 2 };
      if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[a.severity] - severityOrder[b.severity];
      }
      return b.confidence - a.confidence;
    }),
  };
}

// ============================================================================
// Main Validation Function
// ============================================================================

/**
 * Validate transactions using rules (AI disabled by default)
 *
 * @param transactions - Transactions to validate
 * @param useAI - Whether to use AI for deep analysis (default: false - disabled due to false positives)
 * @returns Validation result with all detected issues
 */
export async function validateTransactions(
  transactions: ParsedTransaction[],
  useAI: boolean = false // Disabled by default - AI was causing false positives
): Promise<ValidationResult> {
  console.log(
    "[TransactionValidator] Validating",
    transactions.length,
    "transactions (AI:",
    useAI ? "enabled" : "disabled",
    ")"
  );

  // Step 1: Rule-based validation (fast, 0 API calls)
  const ruleBasedIssues = validateTransactionsWithRules(transactions);
  console.log("[TransactionValidator] Rule-based found", ruleBasedIssues.length, "issues");

  // Step 2: AI validation (DISABLED by default - was causing false positives)
  // Users can opt-in via settings if they want AI analysis
  if (useAI) {
    return await validateTransactionsWithAI(transactions, ruleBasedIssues);
  }

  return buildValidationResult(ruleBasedIssues);
}
