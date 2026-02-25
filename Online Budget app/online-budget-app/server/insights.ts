/**
 * Server — Insight orchestration
 *
 * Fetches DB rows, maps DB shape → engine input shape,
 * calls engine deterministic functions, then calls AI narrator.
 * Returns NarrativeResult.
 *
 * NOT allowed: Financial math (must live in /engine)
 * NOT allowed: Financial interpretation logic
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/database.types";
import type { TransactionForCategoryAggregation, TransactionForSubscription } from "@/engine";
import type { BudgetLimit } from "@/engine";
import type { NarrativeResult } from "@/ai/types";
import {
  aggregateIncomeExpense,
  computeSpendingTrendsFromTransactions,
  detectAnomaliesFromTransactions,
  detectSubscriptions,
  extractMerchantToken,
  computeBudgetProgressFromTransactions,
  computeAffordabilityFromSummary,
} from "@/engine";
import {
  narrateMonthlySummary,
  narrateAnomalies,
  narrateSubscriptions,
  narrateBudgetRisk,
  narrateAffordability,
} from "@/ai";
import { listBudgets } from "./budgets";

/**
 * Get a monthly spending summary with AI narrative.
 *
 * Orchestration flow:
 * 1. Fetch user settings (currency)
 * 2. Fetch current month + 3 prior months of transactions
 * 3. Fetch categories for ID → key resolution
 * 4. Map DB rows → engine input shape (no math)
 * 5. Call engine: computeSpendingTrendsFromTransactions (single engine call)
 * 6. Call AI: narrateMonthlySummary (narration only)
 * 7. Return NarrativeResult
 */
export async function getMonthlySummary(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<NarrativeResult> {
  // 1. Fetch user settings for currency
  const { data: settings } = await supabase
    .from("user_settings")
    .select("primary_currency")
    .eq("user_id", userId)
    .single();

  const currency = settings?.primary_currency ?? "USD";

  // 2. Compute date boundaries — current month + 3 prior months
  const now = new Date();
  const currentMonthStart = toDateString(
    new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
  );
  const currentMonthEnd = toDateString(
    new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0))
  );
  const baselineStart = toDateString(
    new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 3, 1))
  );

  // 3. Fetch transactions + categories in parallel
  const [txResult, categoryResult] = await Promise.all([
    supabase
      .from("transactions")
      .select("amount_minor, currency, category_id, transaction_date")
      .eq("user_id", userId)
      .eq("currency", currency)
      .gte("transaction_date", baselineStart)
      .lte("transaction_date", currentMonthEnd),
    supabase.from("categories").select("id, key"),
  ]);

  if (txResult.error) throw txResult.error;
  if (categoryResult.error) throw categoryResult.error;

  const transactions = txResult.data ?? [];
  const categories = categoryResult.data ?? [];

  // 4. Build category ID → key lookup
  const categoryKeyMap = new Map<string, string>();
  for (const cat of categories) {
    categoryKeyMap.set(cat.id, cat.key);
  }

  // 5. Split transactions by month (data selection, not math)
  const currentMonthTxns = transactions.filter(
    (t) =>
      t.transaction_date >= currentMonthStart &&
      t.transaction_date <= currentMonthEnd
  );

  const baselineMonthsData: TransactionForCategoryAggregation[][] = [];
  for (let i = 3; i >= 1; i--) {
    const mStart = toDateString(
      new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1))
    );
    const mEnd = toDateString(
      new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i + 1, 0))
    );
    const monthTxns = transactions.filter(
      (t) => t.transaction_date >= mStart && t.transaction_date <= mEnd
    );
    baselineMonthsData.push(mapToEngineInput(monthTxns, categoryKeyMap));
  }

  // 6. Map current month DB rows → engine input shape
  const currentMapped = mapToEngineInput(currentMonthTxns, categoryKeyMap);

  // 7. Call engine: computeSpendingTrendsFromTransactions (single engine call)
  const trends = computeSpendingTrendsFromTransactions(
    currentMapped,
    baselineMonthsData,
    currency
  );

  // 8. Call AI narrator (narration only)
  return narrateMonthlySummary(trends, currency);
}

/**
 * Get spending anomalies with AI narrative.
 *
 * Orchestration flow:
 * 1. Fetch user settings (currency)
 * 2. Fetch current month + 3 prior months of transactions
 * 3. Fetch categories for ID → key resolution
 * 4. Map DB rows → engine input shape (no math)
 * 5. Call engine: detectAnomaliesFromTransactions (single engine call)
 * 6. Call AI: narrateAnomalies (narration only)
 * 7. Return NarrativeResult
 */
export async function getAnomalies(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<NarrativeResult> {
  // 1. Fetch user settings for currency
  const { data: settings } = await supabase
    .from("user_settings")
    .select("primary_currency")
    .eq("user_id", userId)
    .single();

  const currency = settings?.primary_currency ?? "USD";

  // 2. Compute date boundaries — current month + 3 prior months
  const now = new Date();
  const currentMonthStart = toDateString(
    new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
  );
  const currentMonthEnd = toDateString(
    new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0))
  );
  const baselineStart = toDateString(
    new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 3, 1))
  );

  // 3. Fetch transactions + categories in parallel
  const [txResult, categoryResult] = await Promise.all([
    supabase
      .from("transactions")
      .select("amount_minor, currency, category_id, transaction_date")
      .eq("user_id", userId)
      .eq("currency", currency)
      .gte("transaction_date", baselineStart)
      .lte("transaction_date", currentMonthEnd),
    supabase.from("categories").select("id, key"),
  ]);

  if (txResult.error) throw txResult.error;
  if (categoryResult.error) throw categoryResult.error;

  const transactions = txResult.data ?? [];
  const categories = categoryResult.data ?? [];

  // 4. Build category ID → key lookup
  const categoryKeyMap = new Map<string, string>();
  for (const cat of categories) {
    categoryKeyMap.set(cat.id, cat.key);
  }

  // 5. Split transactions by month (data selection, not math)
  const currentMonthTxns = transactions.filter(
    (t) =>
      t.transaction_date >= currentMonthStart &&
      t.transaction_date <= currentMonthEnd
  );

  const baselineMonthsData: TransactionForCategoryAggregation[][] = [];
  for (let i = 3; i >= 1; i--) {
    const mStart = toDateString(
      new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1))
    );
    const mEnd = toDateString(
      new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i + 1, 0))
    );
    const monthTxns = transactions.filter(
      (t) => t.transaction_date >= mStart && t.transaction_date <= mEnd
    );
    baselineMonthsData.push(mapToEngineInput(monthTxns, categoryKeyMap));
  }

  // 6. Map current month DB rows → engine input shape
  const currentMapped = mapToEngineInput(currentMonthTxns, categoryKeyMap);

  // 7. Call engine: detectAnomaliesFromTransactions (single engine call)
  const anomalies = detectAnomaliesFromTransactions(
    currentMapped,
    baselineMonthsData,
    currency
  );

  // 8. Call AI narrator (narration only)
  return narrateAnomalies(anomalies, currency);
}

/**
 * Get detected recurring subscriptions with AI narrative.
 *
 * Orchestration flow:
 * 1. Fetch user settings (currency)
 * 2. Fetch 6 months of transactions (longer window for recurring detection)
 * 3. Map DB rows → engine TransactionForSubscription[] via extractMerchantToken
 * 4. Call engine: detectSubscriptions (engine groups by merchant, checks recurrence)
 * 5. Call AI: narrateSubscriptions (narration only)
 * 6. Return NarrativeResult
 */
export async function getSubscriptions(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<NarrativeResult> {
  // 1. Fetch user settings for currency
  const { data: settings } = await supabase
    .from("user_settings")
    .select("primary_currency")
    .eq("user_id", userId)
    .single();

  const currency = settings?.primary_currency ?? "USD";

  // 2. Compute date boundaries — 6 months lookback for subscription detection
  const now = new Date();
  const endDate = toDateString(
    new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0))
  );
  const startDate = toDateString(
    new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1))
  );
  const todayStr = toDateString(now);

  // 3. Fetch transactions with merchant info
  const { data: transactions, error } = await supabase
    .from("transactions")
    .select("amount_minor, currency, merchant_name, description, transaction_date")
    .eq("user_id", userId)
    .eq("currency", currency)
    .gte("transaction_date", startDate)
    .lte("transaction_date", endDate);

  if (error) throw error;

  // 4. Map DB rows → engine TransactionForSubscription[]
  //    Uses engine's extractMerchantToken for normalization — no raw string math here
  const engineInput: TransactionForSubscription[] = [];
  for (const t of transactions ?? []) {
    const rawText = t.merchant_name ?? t.description ?? "";
    const token = extractMerchantToken(rawText);
    if (token) {
      engineInput.push({
        merchantToken: token,
        amountMinor: t.amount_minor,
        transactionDate: t.transaction_date,
      });
    }
  }

  // 5. Call engine: detectSubscriptions (deterministic)
  const detected = detectSubscriptions({
    transactions: engineInput,
    today: todayStr,
  });

  // 6. Call AI narrator (narration only)
  return narrateSubscriptions(detected, currency);
}

/**
 * Get budget risk assessment with AI narrative.
 *
 * Orchestration flow:
 * 1. Fetch user settings (currency)
 * 2. Fetch current month transactions + budgets + categories in parallel
 * 3. Map DB rows → engine input shape (no math)
 * 4. Call engine: computeBudgetProgressFromTransactions (single engine call)
 * 5. Call AI: narrateBudgetRisk (narration only)
 * 6. Return NarrativeResult
 */
export async function getBudgetRisk(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<NarrativeResult> {
  // 1. Fetch user settings for currency
  const { data: settings } = await supabase
    .from("user_settings")
    .select("primary_currency")
    .eq("user_id", userId)
    .single();

  const currency = settings?.primary_currency ?? "USD";

  // 2. Compute current month boundaries
  const now = new Date();
  const monthStart = toDateString(
    new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
  );
  const monthEnd = toDateString(
    new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0))
  );

  // 3. Fetch transactions + budgets + categories in parallel
  const [txResult, budgetResult, categoryResult] = await Promise.all([
    supabase
      .from("transactions")
      .select("amount_minor, currency, category_id")
      .eq("user_id", userId)
      .eq("currency", currency)
      .gte("transaction_date", monthStart)
      .lte("transaction_date", monthEnd),
    listBudgets(supabase, userId, { period: "monthly" }),
    supabase.from("categories").select("id, key"),
  ]);

  if (txResult.error) throw txResult.error;
  if (categoryResult.error) throw categoryResult.error;

  const transactions = txResult.data ?? [];
  const budgets = budgetResult.budgets;
  const categories = categoryResult.data ?? [];

  // 4. Build category ID → key lookup
  const categoryKeyMap = new Map<string, string>();
  for (const cat of categories) {
    categoryKeyMap.set(cat.id, cat.key);
  }

  // 5. Map DB rows → engine input shape (no math)
  const mapped: TransactionForCategoryAggregation[] = transactions.map((t) => ({
    amountMinor: t.amount_minor,
    currency: t.currency,
    categoryKey: t.category_id
      ? (categoryKeyMap.get(t.category_id) ?? null)
      : null,
  }));

  const budgetLimits: BudgetLimit[] = budgets
    .filter((b) => b.currency === currency)
    .map((b) => ({
      categoryKey: categoryKeyMap.get(b.category_id) ?? b.category_id,
      limitMinor: b.amount_minor,
      currency: b.currency,
    }));

  // 6. Call engine: computeBudgetProgressFromTransactions (single engine call)
  const progress = computeBudgetProgressFromTransactions(mapped, budgetLimits, currency);

  // 7. Call AI narrator (narration only)
  return narrateBudgetRisk(progress, currency);
}

/**
 * Get affordability assessment with AI narrative.
 *
 * Orchestration flow:
 * 1. Fetch user settings (currency)
 * 2. Fetch current month transactions
 * 3. Map DB rows → engine input shape (no math)
 * 4. Call engine: aggregateIncomeExpense → computeAffordabilityFromSummary
 * 5. Call AI: narrateAffordability (narration only)
 * 6. Return NarrativeResult
 */
export async function getAffordability(
  supabase: SupabaseClient<Database>,
  userId: string,
  amountMinor: number,
  itemDescription: string,
  isRecurring: boolean
): Promise<NarrativeResult> {
  // 1. Fetch user settings for currency
  const { data: settings } = await supabase
    .from("user_settings")
    .select("primary_currency")
    .eq("user_id", userId)
    .single();

  const currency = settings?.primary_currency ?? "USD";

  // 2. Compute current month boundaries
  const now = new Date();
  const monthStart = toDateString(
    new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
  );
  const monthEnd = toDateString(
    new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0))
  );

  // 3. Fetch current month transactions
  const { data: transactions, error } = await supabase
    .from("transactions")
    .select("amount_minor, currency")
    .eq("user_id", userId)
    .eq("currency", currency)
    .gte("transaction_date", monthStart)
    .lte("transaction_date", monthEnd);

  if (error) throw error;

  // 4. Map DB rows → engine input shape (no math)
  const txInput = (transactions ?? []).map((t) => ({
    amountMinor: t.amount_minor,
    currency: t.currency,
  }));

  // 5. Call engine: aggregateIncomeExpense → computeAffordabilityFromSummary
  const summary = aggregateIncomeExpense(txInput, currency);
  const result = computeAffordabilityFromSummary(summary, amountMinor, isRecurring);

  // 6. Call AI narrator (narration only)
  return narrateAffordability(result, currency, itemDescription, isRecurring);
}

/**
 * Map DB transaction rows to engine TransactionForCategoryAggregation[].
 * Field rename only — no math.
 */
function mapToEngineInput(
  rows: { amount_minor: number; currency: string; category_id: string | null }[],
  categoryKeyMap: Map<string, string>
): TransactionForCategoryAggregation[] {
  return rows.map((t) => ({
    amountMinor: t.amount_minor,
    currency: t.currency,
    categoryKey: t.category_id
      ? (categoryKeyMap.get(t.category_id) ?? null)
      : null,
  }));
}

/** Format Date to YYYY-MM-DD string. */
function toDateString(date: Date): string {
  return date.toISOString().split("T")[0]!;
}
