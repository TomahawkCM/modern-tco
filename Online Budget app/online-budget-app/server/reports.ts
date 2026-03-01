/**
 * Server — Report query functions
 *
 * Aggregation helpers for monthly totals and category spending over time.
 * Since Supabase doesn't expose GROUP BY directly, we fetch the raw
 * transactions and aggregate in JS.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/database.types";

type TransactionRow = Database["public"]["Tables"]["transactions"]["Row"];

export interface MonthlyTotal {
  month: string; // "YYYY-MM"
  income: number; // sum of positive amount_minor
  expenses: number; // sum of negative amount_minor (returned as positive)
}

export interface CategoryMonthlySpending {
  categoryId: string;
  categoryKey: string;
  categoryType: "income" | "expense" | "transfer";
  month: string; // "YYYY-MM"
  total: number; // absolute value of amount_minor sum
}

/**
 * Fetch transactions in a date range and aggregate into monthly
 * income / expense totals.
 */
export async function getMonthlyTotals(
  supabase: SupabaseClient<Database>,
  userId: string,
  startDate: string,
  endDate: string
): Promise<MonthlyTotal[]> {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .gte("transaction_date", startDate)
    .lte("transaction_date", endDate)
    .returns<TransactionRow[]>();

  if (error) throw error;

  const rows = data ?? [];

  // Bucket by YYYY-MM
  const buckets = new Map<string, { income: number; expenses: number }>();

  for (const tx of rows) {
    const month = tx.transaction_date.slice(0, 7); // "YYYY-MM"
    let bucket = buckets.get(month);
    if (!bucket) {
      bucket = { income: 0, expenses: 0 };
      buckets.set(month, bucket);
    }
    if (tx.amount_minor >= 0) {
      bucket.income += tx.amount_minor;
    } else {
      bucket.expenses += Math.abs(tx.amount_minor);
    }
  }

  // Sort chronologically
  return Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, totals]) => ({ month, ...totals }));
}

interface TransactionWithCategory {
  id: string;
  amount_minor: number;
  transaction_date: string;
  categories: { key: string; type: "income" | "expense" | "transfer" } | null;
  category_id: string | null;
}

/**
 * Fetch transactions with their category join and return spending
 * per category per month.
 */
export async function getCategorySpendingOverTime(
  supabase: SupabaseClient<Database>,
  userId: string,
  startDate: string,
  endDate: string
): Promise<CategoryMonthlySpending[]> {
  const { data, error } = await supabase
    .from("transactions")
    .select("id, amount_minor, transaction_date, category_id, categories(key, type)")
    .eq("user_id", userId)
    .gte("transaction_date", startDate)
    .lte("transaction_date", endDate)
    .returns<TransactionWithCategory[]>();

  if (error) throw error;

  const rows = data ?? [];

  // Key: "categoryId|YYYY-MM"
  const buckets = new Map<
    string,
    {
      categoryId: string;
      categoryKey: string;
      categoryType: "income" | "expense" | "transfer";
      month: string;
      total: number;
    }
  >();

  for (const tx of rows) {
    const categoryId = tx.category_id ?? "uncategorized";
    const categoryKey = tx.categories?.key ?? "uncategorized";
    const categoryType = tx.categories?.type ?? "expense";
    const month = tx.transaction_date.slice(0, 7);
    const key = `${categoryId}|${month}`;

    let bucket = buckets.get(key);
    if (!bucket) {
      bucket = { categoryId, categoryKey, categoryType, month, total: 0 };
      buckets.set(key, bucket);
    }
    bucket.total += Math.abs(tx.amount_minor);
  }

  // Sort by month then category key
  return Array.from(buckets.values()).sort((a, b) => {
    const monthCmp = a.month.localeCompare(b.month);
    if (monthCmp !== 0) return monthCmp;
    return a.categoryKey.localeCompare(b.categoryKey);
  });
}
