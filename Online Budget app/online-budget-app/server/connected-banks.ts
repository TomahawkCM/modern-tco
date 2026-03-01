/**
 * Server — Connected Banks CRUD operations
 *
 * All Supabase queries for connected_banks live here.
 * API routes validate with Zod, then delegate to these functions.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/database.types";
import type { CreateConnectedBankInput, UpdateConnectedBankInput } from "./schemas/connected-banks";

type ConnectedBankRow = Database["public"]["Tables"]["connected_banks"]["Row"];

// ── Connected Banks ──────────────────────────────────────────────────

export async function listConnectedBanks(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<ConnectedBankRow[]> {
  const { data, error } = await supabase
    .from("connected_banks")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .returns<ConnectedBankRow[]>();

  if (error) throw error;
  return data ?? [];
}

export async function getConnectedBank(
  supabase: SupabaseClient<Database>,
  userId: string,
  id: string
): Promise<ConnectedBankRow | null> {
  const { data, error } = await supabase
    .from("connected_banks")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .returns<ConnectedBankRow[]>()
    .single();

  // PGRST116 = "JSON object requested, multiple (or no) rows returned"
  if (error && error.code === "PGRST116") return null;
  if (error) throw error;
  return data;
}

export async function createConnectedBank(
  supabase: SupabaseClient<Database>,
  userId: string,
  input: CreateConnectedBankInput
): Promise<ConnectedBankRow> {
  const { data, error } = await supabase
    .from("connected_banks")
    .insert({
      user_id: userId,
      provider: input.provider,
      access_token_encrypted: input.access_token_encrypted,
      institution_id: input.institution_id ?? null,
      status: input.status ?? "active",
    })
    .select("*")
    .returns<ConnectedBankRow[]>()
    .single();

  if (error) throw error;
  return data;
}

export async function updateConnectedBank(
  supabase: SupabaseClient<Database>,
  userId: string,
  id: string,
  input: UpdateConnectedBankInput
): Promise<ConnectedBankRow> {
  const updateData: Record<string, unknown> = {};
  if (input.institution_id !== undefined) updateData.institution_id = input.institution_id;
  if (input.last_synced_at !== undefined) updateData.last_synced_at = input.last_synced_at;
  if (input.sync_cursor !== undefined) updateData.sync_cursor = input.sync_cursor;
  if (input.status !== undefined) updateData.status = input.status;

  const { data, error } = await supabase
    .from("connected_banks")
    .update(updateData)
    .eq("id", id)
    .eq("user_id", userId)
    .select("*")
    .returns<ConnectedBankRow[]>()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteConnectedBank(
  supabase: SupabaseClient<Database>,
  userId: string,
  id: string
): Promise<void> {
  const { error } = await supabase
    .from("connected_banks")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw error;
}
