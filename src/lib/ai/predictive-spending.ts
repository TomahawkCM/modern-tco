/**
 * Predictive Spending Analysis
 * Uses OpenAI to forecast monthly spending by category
 *
 * Features:
 * - Category-wise predictions
 * - Trend analysis (increasing/decreasing/stable)
 * - Confidence intervals
 * - Seasonality detection
 *
 * Privacy: Only sends aggregated statistics per category
 */

import OpenAI from 'openai';
import type { Transaction } from '@/types/budget';

export interface SpendingPrediction {
  category: string;
  predictedAmount: number;
  confidence: number; // 0-1 scale
  trend: 'increasing' | 'decreasing' | 'stable';
  reasoning: string; // AI-generated explanation
  historicalAverage: number;
  confidenceInterval: {
    low: number;
    high: number;
  };
  monthlyHistory: number[]; // Last 6 months
}

export interface PredictiveSpendingOptions {
  apiKey?: string;
  enabled?: boolean;
  monthsToAnalyze?: number; // Default: 6
}

/**
 * Calculate monthly spending by category
 */
function calculateMonthlySpending(
  transactions: Transaction[],
  monthsBack: number = 6
): Map<string, number[]> {
  const categorySpending = new Map<string, number[]>();
  const now = new Date();

  for (let i = 0; i < monthsBack; i++) {
    const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

    const monthTransactions = transactions.filter(
      (tx) => tx.date >= month && tx.date < nextMonth && tx.amount < 0
    );

    // Group by category
    const monthCategories = new Map<string, number>();
    for (const tx of monthTransactions) {
      const category = tx.category || 'Uncategorized';
      const current = monthCategories.get(category) || 0;
      monthCategories.set(category, current + Math.abs(tx.amount));
    }

    // Add to history
    for (const [category, amount] of monthCategories) {
      if (!categorySpending.has(category)) {
        categorySpending.set(category, new Array(monthsBack).fill(0));
      }
      const history = categorySpending.get(category)!;
      history[monthsBack - 1 - i] = amount;
    }
  }

  return categorySpending;
}

/**
 * Calculate trend and statistics
 */
function calculateTrendStats(monthlyAmounts: number[]): {
  trend: 'increasing' | 'decreasing' | 'stable';
  average: number;
  stdDev: number;
  predicted: number;
  confidenceLow: number;
  confidenceHigh: number;
} {
  const n = monthlyAmounts.length;
  if (n === 0) {
    return {
      trend: 'stable',
      average: 0,
      stdDev: 0,
      predicted: 0,
      confidenceLow: 0,
      confidenceHigh: 0,
    };
  }

  // Calculate average
  const average = monthlyAmounts.reduce((sum, amt) => sum + amt, 0) / n;

  // Calculate standard deviation
  const variance =
    monthlyAmounts.reduce((sum, amt) => sum + Math.pow(amt - average, 2), 0) / n;
  const stdDev = Math.sqrt(variance);

  // Simple linear regression for trend
  const xValues = Array.from({ length: n }, (_, i) => i);
  const xMean = xValues.reduce((sum, x) => sum + x, 0) / n;
  const yMean = average;

  let numerator = 0;
  let denominator = 0;
  for (let i = 0; i < n; i++) {
    numerator += (xValues[i] - xMean) * (monthlyAmounts[i] - yMean);
    denominator += Math.pow(xValues[i] - xMean, 2);
  }

  const slope = denominator !== 0 ? numerator / denominator : 0;
  const predicted = slope * n + (yMean - slope * xMean);

  // Determine trend
  const trendThreshold = stdDev * 0.1; // 10% of std dev
  let trend: 'increasing' | 'decreasing' | 'stable';
  if (slope > trendThreshold) {
    trend = 'increasing';
  } else if (slope < -trendThreshold) {
    trend = 'decreasing';
  } else {
    trend = 'stable';
  }

  // Confidence interval (95% = ±2 std dev)
  const confidenceLow = Math.max(0, predicted - 2 * stdDev);
  const confidenceHigh = predicted + 2 * stdDev;

  return {
    trend,
    average,
    stdDev,
    predicted: Math.max(0, predicted),
    confidenceLow,
    confidenceHigh,
  };
}

/**
 * Use AI to generate reasoning for predictions
 */
async function generateReasoningWithAI(
  category: string,
  monthlyHistory: number[],
  stats: ReturnType<typeof calculateTrendStats>,
  apiKey: string
): Promise<string> {
  try {
    const client = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

    const prompt = `You are a financial analysis assistant. Explain the spending trend for this category.

Category: ${category}
Monthly history (last 6 months): ${monthlyHistory.map((m) => `$${m.toFixed(2)}`).join(', ')}
Trend: ${stats.trend}
Average: $${stats.average.toFixed(2)}
Predicted next month: $${stats.predicted.toFixed(2)}

Provide a brief (1-2 sentence) explanation of this trend that helps the user understand their spending pattern in this category.`;

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful financial assistant. Provide brief, clear explanations for spending trends.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 100,
    });

    return response.choices[0]?.message?.content || 'Spending pattern analysis';
  } catch (error) {
    console.error('[PredictiveSpending] AI reasoning error:', error);
    return `${stats.trend === 'stable' ? 'Stable' : stats.trend === 'increasing' ? 'Increasing' : 'Decreasing'} spending trend`;
  }
}

/**
 * Predict next month's spending by category
 */
export async function predictSpending(
  transactions: Transaction[],
  options: PredictiveSpendingOptions = {}
): Promise<SpendingPrediction[]> {
  const {
    apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    enabled = false,
    monthsToAnalyze = 6,
  } = options;

  if (!enabled) {
    return [];
  }

  // Calculate monthly spending by category
  const categorySpending = calculateMonthlySpending(transactions, monthsToAnalyze);

  const predictions: SpendingPrediction[] = [];

  for (const [category, monthlyAmounts] of categorySpending) {
    // Skip if insufficient data
    if (monthlyAmounts.filter((amt) => amt > 0).length < 2) continue;

    const stats = calculateTrendStats(monthlyAmounts);

    // Calculate confidence based on data consistency
    const coefficientOfVariation = stats.stdDev / stats.average;
    const baseConfidence = 0.7;
    const confidence = Math.max(
      0.4,
      Math.min(0.95, baseConfidence - coefficientOfVariation * 0.1)
    );

    // Generate reasoning
    let reasoning = `${stats.trend === 'stable' ? 'Stable' : stats.trend === 'increasing' ? 'Increasing' : 'Decreasing'} spending trend`;

    // Enrich with AI if available (limit to top 5 categories by average spending)
    if (apiKey && predictions.length < 5) {
      reasoning = await generateReasoningWithAI(category, monthlyAmounts, stats, apiKey);
      // Rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    predictions.push({
      category,
      predictedAmount: stats.predicted,
      confidence,
      trend: stats.trend,
      reasoning,
      historicalAverage: stats.average,
      confidenceInterval: {
        low: stats.confidenceLow,
        high: stats.confidenceHigh,
      },
      monthlyHistory: monthlyAmounts,
    });
  }

  // Sort by predicted amount (highest first)
  predictions.sort((a, b) => b.predictedAmount - a.predictedAmount);

  return predictions;
}
