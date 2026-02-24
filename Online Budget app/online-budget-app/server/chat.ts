/**
 * Server — Chat orchestration
 *
 * Fetches DB rows, maps DB shape → engine input shape,
 * calls engine aggregation functions, then calls AI chat.
 * Returns ChatResult.
 *
 * NOT allowed: Financial math (must live in /engine)
 * NOT allowed: Financial interpretation logic
 * NOT allowed: Direct LLM calls (must go through /ai)
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/database.types";
import type { TransactionForCategoryAggregation, BudgetLimit } from "@/engine";
import type { ChatResult } from "@/ai/types";
import {
  aggregateIncomeExpense,
  aggregateByCategory,
  computeBudgetProgressFromTransactions,
} from "@/engine";
import { answerChat } from "@/ai";
import { listBudgets } from "./budgets";

/**
 * Handle a chat message.
 *
 * Orchestration flow:
 * 1. Fetch user settings (currency)
 * 2. Fetch current month transactions + categories + budgets in parallel
 * 3. Map DB rows → engine input shape (no math)
 * 4. Call engine: aggregateIncomeExpense, aggregateByCategory, computeBudgetProgressFromTransactions
 * 5. Call AI: answerChat (context building + LLM call)
 * 6. Return ChatResult
 */
export async function handleChat(
  supabase: SupabaseClient<Database>,
  userId: string,
  message: string
): Promise<ChatResult> {
  // 1. Fetch user settings for currency
  const { data: settings } = await supabase
    .from("user_settings")
    .select("primary_currency")
    .eq("user_id", userId)
    .single();

  const currency = settings?.primary_currency ?? "USD";

  // 2. Compute current month boundaries
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const monthStart = toDateString(new Date(Date.UTC(year, month, 1)));
  const monthEnd = toDateString(new Date(Date.UTC(year, month + 1, 0)));
  const period = `${year}-${String(month + 1).padStart(2, "0")}`;

  // 3. Fetch transactions + categories + budgets in parallel
  const [txResult, categoryResult, budgetResult] = await Promise.all([
    supabase
      .from("transactions")
      .select("amount_minor, currency, category_id")
      .eq("user_id", userId)
      .eq("currency", currency)
      .gte("transaction_date", monthStart)
      .lte("transaction_date", monthEnd),
    supabase.from("categories").select("id, key"),
    listBudgets(supabase, userId, { period: "monthly" }),
  ]);

  if (txResult.error) throw txResult.error;
  if (categoryResult.error) throw categoryResult.error;

  const transactions = txResult.data ?? [];
  const categories = categoryResult.data ?? [];
  const budgets = budgetResult.budgets;

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

  // Simple aggregation input (no category key needed)
  const aggregationInput = transactions.map((t) => ({
    amountMinor: t.amount_minor,
    currency: t.currency,
  }));

  // Budget limits
  const budgetLimits: BudgetLimit[] = budgets
    .filter((b) => b.currency === currency)
    .map((b) => ({
      categoryKey: categoryKeyMap.get(b.category_id) ?? b.category_id,
      limitMinor: b.amount_minor,
      currency: b.currency,
    }));

  // 6. Call engine functions (no financial math here)
  const summary = aggregateIncomeExpense(aggregationInput, currency);
  const categorySpending = aggregateByCategory(mapped, currency);
  const budgetProgress = computeBudgetProgressFromTransactions(mapped, budgetLimits, currency);

  // 7. Call AI: answerChat (context building + LLM call)
  return answerChat(message, summary, categorySpending, budgetProgress, currency, period);
}

/** Format Date to YYYY-MM-DD string. */
function toDateString(date: Date): string {
  return date.toISOString().split("T")[0]!;
}
