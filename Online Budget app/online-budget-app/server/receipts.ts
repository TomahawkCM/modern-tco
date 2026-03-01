/**
 * Server — Receipts CRUD operations
 *
 * All Supabase queries for receipts live here.
 * API routes validate with Zod, then delegate to these functions.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/database.types";
import type { CreateReceiptInput, UpdateReceiptInput } from "./schemas/receipts";

type ReceiptRow = Database["public"]["Tables"]["receipts"]["Row"];

// ── Receipts ─────────────────────────────────────────────────────────

export async function listReceipts(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<ReceiptRow[]> {
  const { data, error } = await supabase
    .from("receipts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .returns<ReceiptRow[]>();

  if (error) throw error;
  return data ?? [];
}

export async function getReceipt(
  supabase: SupabaseClient<Database>,
  userId: string,
  receiptId: string
): Promise<ReceiptRow | null> {
  const { data, error } = await supabase
    .from("receipts")
    .select("*")
    .eq("id", receiptId)
    .eq("user_id", userId)
    .returns<ReceiptRow[]>()
    .single();

  // PGRST116 = "JSON object requested, multiple (or no) rows returned"
  if (error && error.code === "PGRST116") return null;
  if (error) throw error;
  return data;
}

export async function createReceipt(
  supabase: SupabaseClient<Database>,
  userId: string,
  input: CreateReceiptInput
): Promise<ReceiptRow> {
  const { data, error } = await supabase
    .from("receipts")
    .insert({
      user_id: userId,
      transaction_id: input.transaction_id,
      storage_path: input.storage_path,
      extracted_data: (input.extracted_data ?? null) as import("@/supabase/database.types").Json,
    })
    .select("*")
    .returns<ReceiptRow[]>()
    .single();

  if (error) throw error;
  return data;
}

export async function updateReceipt(
  supabase: SupabaseClient<Database>,
  userId: string,
  receiptId: string,
  input: UpdateReceiptInput
): Promise<ReceiptRow> {
  const updateData: Record<string, unknown> = {};
  if (input.transaction_id !== undefined) updateData.transaction_id = input.transaction_id;
  if (input.extracted_data !== undefined)
    updateData.extracted_data = input.extracted_data as import("@/supabase/database.types").Json;

  const { data, error } = await supabase
    .from("receipts")
    .update(updateData)
    .eq("id", receiptId)
    .eq("user_id", userId)
    .select("*")
    .returns<ReceiptRow[]>()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteReceipt(
  supabase: SupabaseClient<Database>,
  userId: string,
  receiptId: string
): Promise<void> {
  const { error } = await supabase
    .from("receipts")
    .delete()
    .eq("id", receiptId)
    .eq("user_id", userId);

  if (error) throw error;
}
