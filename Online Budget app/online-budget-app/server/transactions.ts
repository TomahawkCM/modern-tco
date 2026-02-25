/**
 * Server — Transaction CRUD operations
 *
 * All Supabase queries for transactions live here.
 * API routes validate with Zod, then delegate to these functions.
 *
 * Auto-categorization: when category_id is not provided on creation,
 * the engine's categorize() function is called to classify the transaction.
 * Cascade: user merchant mappings (0.99) → pattern rules (0.85-0.95).
 * The engine is pure — no financial math happens here.
 *
 * NOT allowed: Financial math (must live in /engine)
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/database.types";
import { categorize } from "@/engine";
import { getCategoryIdByKey } from "./categories";
import { loadMerchantRulesForEngine } from "./merchant-mappings";
import type {
  CreateTransactionInput,
  UpdateTransactionInput,
  ListTransactionsInput,
} from "./schemas/transaction";

type TransactionRow = Database["public"]["Tables"]["transactions"]["Row"];

export async function createTransaction(
  supabase: SupabaseClient<Database>,
  userId: string,
  input: CreateTransactionInput
): Promise<TransactionRow> {
  let categoryId = input.category_id;
  let confidenceScore: number | null = null;

  // Auto-categorize when no category_id is provided
  // Priority: 1. User merchant mappings → 2. Pattern rules → 3. Fallback (none)
  if (!categoryId) {
    const description = input.merchant_name ?? input.description ?? "";
    if (description) {
      const merchantRules = await loadMerchantRulesForEngine(supabase, userId);
      const result = categorize(description, merchantRules);
      if (result) {
        const resolvedId = await getCategoryIdByKey(
          supabase,
          result.categoryKey
        );
        if (resolvedId) {
          categoryId = resolvedId;
          confidenceScore = result.confidence;
        }
      }
    }
  }

  const { data, error } = await supabase
    .from("transactions")
    .insert({
      user_id: userId,
      account_id: input.account_id,
      amount_minor: input.amount_minor,
      currency: input.currency,
      transaction_date: input.transaction_date,
      description: input.description,
      merchant_name: input.merchant_name,
      category_id: categoryId,
      is_pending: input.is_pending ?? false,
      confidence_score: confidenceScore,
    })
    .select("*")
    .returns<TransactionRow[]>()
    .single();

  if (error) throw error;
  return data;
}

export async function getTransaction(
  supabase: SupabaseClient<Database>,
  userId: string,
  transactionId: string
): Promise<TransactionRow | null> {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("id", transactionId)
    .eq("user_id", userId)
    .returns<TransactionRow[]>()
    .single();

  // PGRST116 = "JSON object requested, multiple (or no) rows returned"
  if (error && error.code === "PGRST116") return null;
  if (error) throw error;
  return data;
}

export async function listTransactions(
  supabase: SupabaseClient<Database>,
  userId: string,
  filters: ListTransactionsInput
): Promise<{ transactions: TransactionRow[]; count: number }> {
  let query = supabase
    .from("transactions")
    .select("*", { count: "exact" })
    .eq("user_id", userId);

  if (filters.account_id) {
    query = query.eq("account_id", filters.account_id);
  }
  if (filters.category_id) {
    query = query.eq("category_id", filters.category_id);
  }
  if (filters.from_date) {
    query = query.gte("transaction_date", filters.from_date);
  }
  if (filters.to_date) {
    query = query.lte("transaction_date", filters.to_date);
  }
  if (filters.is_pending !== undefined) {
    query = query.eq("is_pending", filters.is_pending === "true");
  }

  const { data, error, count } = await query
    .order("transaction_date", { ascending: false })
    .order("created_at", { ascending: false })
    .range(filters.offset, filters.offset + filters.limit - 1)
    .returns<TransactionRow[]>();

  if (error) throw error;
  return { transactions: data ?? [], count: count ?? 0 };
}

export async function updateTransaction(
  supabase: SupabaseClient<Database>,
  userId: string,
  transactionId: string,
  input: UpdateTransactionInput
): Promise<TransactionRow> {
  const { data, error } = await supabase
    .from("transactions")
    .update(input)
    .eq("id", transactionId)
    .eq("user_id", userId)
    .select("*")
    .returns<TransactionRow[]>()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteTransaction(
  supabase: SupabaseClient<Database>,
  userId: string,
  transactionId: string
): Promise<void> {
  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", transactionId)
    .eq("user_id", userId);

  if (error) throw error;
}
