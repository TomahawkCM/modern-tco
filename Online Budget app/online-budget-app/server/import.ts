/**
 * Server — Import operations
 *
 * Handles bulk transaction import, FITID deduplication, and import metadata.
 * Used by the CSV/OFX/PDF import pipeline.
 *
 * Auto-categorization: each transaction is categorized using the same
 * engine pipeline as single-transaction creation (user merchant mappings
 * then pattern rules).
 *
 * NOT allowed: Financial math (must live in /engine)
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/database.types";
import { categorize } from "@/engine";
import { getCategoryIdByKey } from "./categories";
import { loadMerchantRulesForEngine } from "./merchant-mappings";
import type { BulkTransactionItem, RecordImportInput } from "./schemas/import";

type TransactionRow = Database["public"]["Tables"]["transactions"]["Row"];
type ImportMetadataRow = Database["public"]["Tables"]["import_metadata"]["Row"];

/**
 * Bulk-insert transactions with auto-categorization.
 *
 * For each transaction without a category_id, runs the categorization
 * engine (user merchant mappings, then pattern rules) to assign one.
 * Merchant rules are loaded once and reused across all transactions.
 */
export async function bulkCreateTransactions(
  supabase: SupabaseClient<Database>,
  userId: string,
  transactions: BulkTransactionItem[]
): Promise<TransactionRow[]> {
  // Load merchant rules once for the entire batch
  const merchantRules = await loadMerchantRulesForEngine(supabase, userId);

  const rows = await Promise.all(
    transactions.map(async (tx) => {
      let categoryId = tx.category_id ?? null;
      let confidenceScore: number | null = null;

      // Auto-categorize when no category_id is provided
      if (!categoryId) {
        const description = tx.merchant_name ?? tx.description ?? "";
        if (description) {
          const result = categorize(description, merchantRules);
          if (result) {
            const resolvedId = await getCategoryIdByKey(supabase, result.categoryKey);
            if (resolvedId) {
              categoryId = resolvedId;
              confidenceScore = result.confidence;
            }
          }
        }
      }

      return {
        user_id: userId,
        account_id: tx.account_id,
        amount_minor: tx.amount_minor,
        currency: tx.currency,
        transaction_date: tx.transaction_date,
        description: tx.description ?? null,
        merchant_name: tx.merchant_name ?? null,
        category_id: categoryId,
        is_pending: false,
        confidence_score: confidenceScore,
      };
    })
  );

  const { data, error } = await supabase
    .from("transactions")
    .insert(rows)
    .select("*")
    .returns<TransactionRow[]>();

  if (error) throw error;
  return data ?? [];
}

/**
 * Check which FITIDs already exist for a user.
 * Returns a Set of FITIDs that are already imported.
 */
export async function checkDuplicateFitids(
  supabase: SupabaseClient<Database>,
  userId: string,
  fitids: string[]
): Promise<Set<string>> {
  const { data, error } = await supabase
    .from("imported_fitids")
    .select("fitid")
    .eq("user_id", userId)
    .in("fitid", fitids)
    .returns<{ fitid: string }[]>();

  if (error) throw error;
  return new Set((data ?? []).map((row) => row.fitid));
}

/**
 * Record metadata about an import session.
 */
export async function recordImport(
  supabase: SupabaseClient<Database>,
  userId: string,
  metadata: RecordImportInput
): Promise<ImportMetadataRow> {
  const { data, error } = await supabase
    .from("import_metadata")
    .insert({
      user_id: userId,
      filename: metadata.filename,
      bank_slug: metadata.bank_slug ?? null,
      row_count: metadata.row_count,
      imported_count: metadata.imported_count,
      skipped_count: metadata.skipped_count ?? 0,
    })
    .select("*")
    .returns<ImportMetadataRow[]>()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Save FITIDs to the deduplication table.
 * Skips duplicates silently (upsert with onConflict).
 */
export async function saveFitids(
  supabase: SupabaseClient<Database>,
  userId: string,
  fitids: string[],
  accountId?: string
): Promise<void> {
  if (fitids.length === 0) return;

  const rows = fitids.map((fitid) => ({
    user_id: userId,
    fitid,
    account_id: accountId ?? null,
  }));

  const { error } = await supabase
    .from("imported_fitids")
    .upsert(rows, { onConflict: "user_id,fitid", ignoreDuplicates: true });

  if (error) throw error;
}
