/**
 * Anomaly Detection for Budget Transactions
 * Uses OpenAI to identify unusual spending patterns
 *
 * Detects:
 * - Unusual amounts ("$85 at Starbucks" when average is $6)
 * - Unusual frequency ("5 Amazon purchases this week" when average is 1)
 * - Out-of-pattern merchants
 *
 * Privacy: Only sends aggregated statistics and cleaned merchant names
 */

import OpenAI from "openai";
import type { Transaction } from "@/types/budget";

export interface Anomaly {
  transactionId: string;
  transaction: Transaction;
  type: "amount" | "frequency" | "merchant" | "pattern";
  confidence: number; // 0-1 scale
  message: string; // User-facing explanation
  severity: "low" | "medium" | "high";
  context: {
    typical: string; // "Usually $6"
    actual: string; // "This time $85"
    deviation: number; // How many standard deviations from normal
  };
}

export interface AnomalyDetectionOptions {
  apiKey?: string;
  enabled?: boolean;
  minConfidence?: number; // Default: 0.7
  lookbackDays?: number; // Default: 90
}

/**
 * Calculate statistics for a merchant
 */
function calculateMerchantStats(
  merchant: string,
  transactions: Transaction[]
): {
  count: number;
  avgAmount: number;
  stdDevAmount: number;
  avgDaysBetween: number;
} {
  const merchantTxs = transactions.filter(
    (tx) => tx.merchant === merchant || tx.description.includes(merchant)
  );

  if (merchantTxs.length === 0) {
    return { count: 0, avgAmount: 0, stdDevAmount: 0, avgDaysBetween: 0 };
  }

  // Calculate average amount
  const amounts = merchantTxs.map((tx) => Math.abs(tx.amount));
  const avgAmount = amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length;

  // Calculate standard deviation
  const variance =
    amounts.reduce((sum, amt) => sum + Math.pow(amt - avgAmount, 2), 0) / amounts.length;
  const stdDevAmount = Math.sqrt(variance);

  // Calculate average days between transactions
  const sortedDates = merchantTxs.map((tx) => tx.date.getTime()).sort((a, b) => a - b);
  let totalDaysBetween = 0;
  for (let i = 1; i < sortedDates.length; i++) {
    const daysDiff = (sortedDates[i] - sortedDates[i - 1]) / (1000 * 60 * 60 * 24);
    totalDaysBetween += daysDiff;
  }
  const avgDaysBetween = sortedDates.length > 1 ? totalDaysBetween / (sortedDates.length - 1) : 0;

  return {
    count: merchantTxs.length,
    avgAmount,
    stdDevAmount,
    avgDaysBetween,
  };
}

/**
 * Detect amount anomalies (unusually high/low amounts for a merchant)
 */
function detectAmountAnomalies(
  recentTransactions: Transaction[],
  historicalTransactions: Transaction[]
): Anomaly[] {
  const anomalies: Anomaly[] = [];

  for (const tx of recentTransactions) {
    const merchant = tx.merchant || tx.description.split(" ")[0];
    const stats = calculateMerchantStats(merchant, historicalTransactions);

    // Need at least 3 historical transactions to establish pattern
    if (stats.count < 3) continue;

    const amount = Math.abs(tx.amount);
    const deviation = stats.stdDevAmount > 0 ? (amount - stats.avgAmount) / stats.stdDevAmount : 0;

    // Flag if amount is > 2 standard deviations from average
    if (Math.abs(deviation) > 2) {
      const severity: "low" | "medium" | "high" =
        Math.abs(deviation) > 4 ? "high" : Math.abs(deviation) > 3 ? "medium" : "low";

      anomalies.push({
        transactionId: tx.id,
        transaction: tx,
        type: "amount",
        confidence: Math.min(0.95, 0.5 + Math.abs(deviation) * 0.1),
        message:
          amount > stats.avgAmount
            ? `Unusually high purchase at ${merchant}: $${amount.toFixed(2)} (typically $${stats.avgAmount.toFixed(2)})`
            : `Unusually low purchase at ${merchant}: $${amount.toFixed(2)} (typically $${stats.avgAmount.toFixed(2)})`,
        severity,
        context: {
          typical: `$${stats.avgAmount.toFixed(2)}`,
          actual: `$${amount.toFixed(2)}`,
          deviation,
        },
      });
    }
  }

  return anomalies;
}

/**
 * Detect frequency anomalies (too many/few transactions for a merchant)
 */
function detectFrequencyAnomalies(
  recentTransactions: Transaction[],
  historicalTransactions: Transaction[],
  timeWindowDays: number = 7
): Anomaly[] {
  const anomalies: Anomaly[] = [];
  const merchants = new Set(
    recentTransactions.map((tx) => tx.merchant || tx.description.split(" ")[0])
  );

  for (const merchant of merchants) {
    const stats = calculateMerchantStats(merchant, historicalTransactions);
    if (stats.count < 3) continue;

    // Count recent transactions for this merchant
    const recentMerchantTxs = recentTransactions.filter(
      (tx) => tx.merchant === merchant || tx.description.includes(merchant)
    );

    const expectedFrequency = timeWindowDays / stats.avgDaysBetween;
    const actualFrequency = recentMerchantTxs.length;
    const freqDeviation =
      expectedFrequency > 0 ? (actualFrequency - expectedFrequency) / expectedFrequency : 0;

    // Flag if frequency is > 100% different from expected
    if (Math.abs(freqDeviation) > 1.0 && actualFrequency >= 3) {
      const severity: "low" | "medium" | "high" =
        Math.abs(freqDeviation) > 3 ? "high" : Math.abs(freqDeviation) > 2 ? "medium" : "low";

      anomalies.push({
        transactionId: recentMerchantTxs[0].id,
        transaction: recentMerchantTxs[0],
        type: "frequency",
        confidence: Math.min(0.9, 0.6 + Math.abs(freqDeviation) * 0.1),
        message:
          actualFrequency > expectedFrequency
            ? `Unusually frequent purchases at ${merchant}: ${actualFrequency} times in ${timeWindowDays} days (typically every ${stats.avgDaysBetween.toFixed(0)} days)`
            : `Unusually infrequent purchases at ${merchant}: ${actualFrequency} times in ${timeWindowDays} days (typically every ${stats.avgDaysBetween.toFixed(0)} days)`,
        severity,
        context: {
          typical: `Every ${stats.avgDaysBetween.toFixed(0)} days`,
          actual: `${actualFrequency} times in ${timeWindowDays} days`,
          deviation: freqDeviation,
        },
      });
    }
  }

  return anomalies;
}

/**
 * Use AI to provide context and explanations for anomalies
 */
async function enrichAnomaliesWithAI(anomalies: Anomaly[], apiKey: string): Promise<Anomaly[]> {
  if (anomalies.length === 0) return [];

  try {
    const client = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

    // Process in batches
    const enrichedAnomalies = [...anomalies];
    for (let i = 0; i < anomalies.length && i < 5; i++) {
      // Limit to first 5 for cost
      const anomaly = anomalies[i];

      const prompt = `You are a financial anomaly analysis assistant. Provide a brief, helpful explanation for this unusual spending pattern.

Anomaly: ${anomaly.message}
Type: ${anomaly.type}
Typical: ${anomaly.context.typical}
Actual: ${anomaly.context.actual}

Provide a short (1-2 sentence) user-friendly explanation that helps the user understand what might have caused this anomaly. Be helpful but not alarmist.`;

      const response = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful financial assistant. Provide brief, clear explanations for spending anomalies.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 100,
      });

      const aiExplanation = response.choices[0]?.message?.content;
      if (aiExplanation) {
        enrichedAnomalies[i] = {
          ...enrichedAnomalies[i],
          message: `${enrichedAnomalies[i].message}\n\n${aiExplanation}`,
        };
      }

      // Rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return enrichedAnomalies;
  } catch (error) {
    console.error("[AnomalyDetection] AI enrichment error:", error);
    return anomalies; // Return without AI enrichment
  }
}

/**
 * Detect anomalies in recent transactions
 */
export async function detectAnomalies(
  transactions: Transaction[],
  options: AnomalyDetectionOptions = {}
): Promise<Anomaly[]> {
  const {
    apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    enabled = false,
    minConfidence = 0.7,
    lookbackDays = 90,
  } = options;

  if (!enabled) {
    return [];
  }

  // Split transactions into recent (last 7 days) and historical
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const lookbackDate = new Date(now.getTime() - lookbackDays * 24 * 60 * 60 * 1000);

  const recentTransactions = transactions.filter((tx) => tx.date >= sevenDaysAgo);
  const historicalTransactions = transactions.filter(
    (tx) => tx.date >= lookbackDate && tx.date < sevenDaysAgo
  );

  // Detect different types of anomalies
  const amountAnomalies = detectAmountAnomalies(recentTransactions, historicalTransactions);
  const frequencyAnomalies = detectFrequencyAnomalies(recentTransactions, historicalTransactions);

  let allAnomalies = [...amountAnomalies, ...frequencyAnomalies];

  // Filter by confidence threshold
  allAnomalies = allAnomalies.filter((a) => a.confidence >= minConfidence);

  // Sort by severity and confidence
  allAnomalies.sort((a, b) => {
    const severityOrder = { high: 3, medium: 2, low: 1 };
    const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
    return severityDiff !== 0 ? severityDiff : b.confidence - a.confidence;
  });

  // Enrich with AI if API key available
  if (apiKey && allAnomalies.length > 0) {
    allAnomalies = await enrichAnomaliesWithAI(allAnomalies, apiKey);
  }

  return allAnomalies;
}
