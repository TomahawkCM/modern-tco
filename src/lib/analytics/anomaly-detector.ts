/**
 * Anomaly Detection System
 * Detects unusual transaction amounts per merchant/category
 * Uses Z-score analysis for statistical outlier detection
 *
 * Privacy: All processing happens client-side, no data sent to external APIs
 */

import type { Transaction } from "@/types/budget";

export interface AnomalyAlert {
  transaction: Transaction;
  merchant: string;
  category: string;
  amount: number;
  expectedRange: {
    min: number;
    max: number;
    average: number;
  };
  zScore: number; // Standard deviations from mean
  confidence: number; // 0-1 scale (higher = more anomalous)
  reason: string; // Human-readable explanation
  severity: "low" | "medium" | "high";
}

export interface AnomalyDetectionOptions {
  zScoreThreshold?: number; // Default: 2.5 (flags transactions >2.5 standard deviations)
  minTransactions?: number; // Minimum transactions needed for analysis (default: 5)
  enableCategoryAnalysis?: boolean; // Analyze by category (default: true)
  enableMerchantAnalysis?: boolean; // Analyze by merchant (default: true)
}

/**
 * Detect anomalies in transactions using Z-score analysis
 * Groups transactions by merchant and category to establish baselines
 */
export function detectAnomalies(
  transactions: Transaction[],
  options: AnomalyDetectionOptions = {}
): AnomalyAlert[] {
  const {
    zScoreThreshold = 2.5,
    minTransactions = 5,
    enableCategoryAnalysis = true,
    enableMerchantAnalysis = true,
  } = options;

  const alerts: AnomalyAlert[] = [];
  const expenses = transactions.filter((tx) => tx.amount < 0);

  // Analyze by merchant
  if (enableMerchantAnalysis) {
    const merchantGroups = groupByMerchant(expenses);
    for (const [merchant, txs] of merchantGroups) {
      if (txs.length < minTransactions) continue;

      const amounts = txs.map((tx) => Math.abs(tx.amount));
      const stats = calculateStatistics(amounts);

      for (const tx of txs) {
        const amount = Math.abs(tx.amount);
        const zScore = calculateZScore(amount, stats.mean, stats.stdDev);

        if (Math.abs(zScore) > zScoreThreshold) {
          const confidence = Math.min(1, Math.abs(zScore) / 4); // Normalize to 0-1
          const severity = getSeverity(Math.abs(zScore));

          alerts.push({
            transaction: tx,
            merchant,
            category: tx.category || "Uncategorized",
            amount,
            expectedRange: {
              min: stats.mean - stats.stdDev,
              max: stats.mean + stats.stdDev,
              average: stats.mean,
            },
            zScore,
            confidence,
            reason: generateReason(merchant, amount, stats.mean, zScore),
            severity,
          });
        }
      }
    }
  }

  // Analyze by category
  if (enableCategoryAnalysis) {
    const categoryGroups = groupByCategory(expenses);
    for (const [category, txs] of categoryGroups) {
      if (txs.length < minTransactions) continue;

      const amounts = txs.map((tx) => Math.abs(tx.amount));
      const stats = calculateStatistics(amounts);

      for (const tx of txs) {
        const amount = Math.abs(tx.amount);
        const zScore = calculateZScore(amount, stats.mean, stats.stdDev);

        // Only add if not already flagged by merchant analysis
        const alreadyFlagged = alerts.some((a) => a.transaction.id === tx.id);
        if (alreadyFlagged) continue;

        if (Math.abs(zScore) > zScoreThreshold) {
          const confidence = Math.min(1, Math.abs(zScore) / 4);
          const severity = getSeverity(Math.abs(zScore));

          alerts.push({
            transaction: tx,
            merchant: extractMerchant(tx.description),
            category,
            amount,
            expectedRange: {
              min: stats.mean - stats.stdDev,
              max: stats.mean + stats.stdDev,
              average: stats.mean,
            },
            zScore,
            confidence,
            reason: generateReason(category, amount, stats.mean, zScore, true),
            severity,
          });
        }
      }
    }
  }

  // Sort by confidence (most anomalous first)
  return alerts.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Group transactions by merchant (normalized description)
 */
function groupByMerchant(transactions: Transaction[]): Map<string, Transaction[]> {
  const grouped = new Map<string, Transaction[]>();

  for (const tx of transactions) {
    const merchant = normalizeMerchant(tx.description);
    if (!grouped.has(merchant)) {
      grouped.set(merchant, []);
    }
    grouped.get(merchant)!.push(tx);
  }

  return grouped;
}

/**
 * Group transactions by category
 */
function groupByCategory(transactions: Transaction[]): Map<string, Transaction[]> {
  const grouped = new Map<string, Transaction[]>();

  for (const tx of transactions) {
    const category = tx.category || "Uncategorized";
    if (!grouped.has(category)) {
      grouped.set(category, []);
    }
    grouped.get(category)!.push(tx);
  }

  return grouped;
}

/**
 * Normalize merchant name for grouping
 */
function normalizeMerchant(description: string): string {
  let normalized = description
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  // Remove common prefixes
  normalized = normalized
    .replace(/^(ONLINE PURCHASE|PURCHASE|PAYMENT|WITHDRAWAL|DEBIT)\s+/, "")
    .replace(/\d{1,2}(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)\d{4}/, "")
    .replace(/\s+(AB|BC|ON|QC|MB|SK|NS|NB|PE|NL|YT|NT|NU|CAN|CA|USA|US)\s*$/, "")
    .trim();

  // Take first 2-3 words as merchant identifier
  const words = normalized.split(" ").slice(0, 3).join(" ");
  return words || "UNKNOWN";
}

/**
 * Extract merchant name from description
 */
function extractMerchant(description: string): string {
  return normalizeMerchant(description);
}

/**
 * Calculate mean and standard deviation
 */
function calculateStatistics(values: number[]): {
  mean: number;
  stdDev: number;
  median: number;
} {
  if (values.length === 0) {
    return { mean: 0, stdDev: 0, median: 0 };
  }

  // Mean
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;

  // Standard deviation
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  // Median
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];

  return { mean, stdDev, median };
}

/**
 * Calculate Z-score (standard deviations from mean)
 */
function calculateZScore(value: number, mean: number, stdDev: number): number {
  if (stdDev === 0) return 0;
  return (value - mean) / stdDev;
}

/**
 * Determine severity based on Z-score
 */
function getSeverity(zScore: number): "low" | "medium" | "high" {
  const absZ = Math.abs(zScore);
  if (absZ >= 3.5) return "high";
  if (absZ >= 2.5) return "medium";
  return "low";
}

/**
 * Generate human-readable reason for anomaly
 */
function generateReason(
  context: string,
  amount: number,
  average: number,
  zScore: number,
  isCategory = false
): string {
  const percentDiff = ((amount - average) / average) * 100;
  const absPercent = Math.abs(percentDiff);
  const direction = zScore > 0 ? "higher" : "lower";

  if (isCategory) {
    return `Your ${context} spending of $${amount.toFixed(2)} is ${absPercent.toFixed(0)}% ${direction} than your average of $${average.toFixed(2)}`;
  }

  return `Your ${context} purchase of $${amount.toFixed(2)} is ${absPercent.toFixed(0)}% ${direction} than your average of $${average.toFixed(2)}`;
}

/**
 * Filter anomalies by severity
 */
export function filterBySeverity(
  alerts: AnomalyAlert[],
  severity: "low" | "medium" | "high"
): AnomalyAlert[] {
  return alerts.filter((alert) => alert.severity === severity);
}

/**
 * Get anomalies for a specific transaction
 */
export function getAnomalyForTransaction(
  transaction: Transaction,
  allTransactions: Transaction[],
  options?: AnomalyDetectionOptions
): AnomalyAlert | null {
  const anomalies = detectAnomalies(allTransactions, options);
  return anomalies.find((a) => a.transaction.id === transaction.id) || null;
}

/**
 * Check if anomaly detection should be enabled based on privacy settings
 */
export function isAnomalyDetectionEnabled(): boolean {
  if (typeof window === "undefined") return false;

  try {
    const settings = localStorage.getItem("budget-app-privacy-settings");
    if (settings) {
      const parsed = JSON.parse(settings);
      return parsed.enableAnomalyDetection === true && parsed.enableClaudeAPI === true;
    }
  } catch (error) {
    console.warn("[AnomalyDetector] Failed to check privacy settings:", error);
  }

  return false;
}
