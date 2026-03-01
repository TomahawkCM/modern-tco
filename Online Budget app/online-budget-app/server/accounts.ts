/**
 * Server — Account CRUD operations
 *
 * All Supabase queries for accounts live here.
 * API routes validate with Zod, then delegate to these functions.
 *
 * NOT allowed: Financial math (must live in /engine)
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/database.types";
import type { CreateAccountInput, UpdateAccountInput } from "./schemas/account";

type AccountRow = Database["public"]["Tables"]["accounts"]["Row"];

export async function listAccounts(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<AccountRow[]> {
  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .eq("user_id", userId)
    .order("name", { ascending: true })
    .returns<AccountRow[]>();

  if (error) throw error;
  return data ?? [];
}

export async function createAccount(
  supabase: SupabaseClient<Database>,
  userId: string,
  input: CreateAccountInput
): Promise<AccountRow> {
  const { data, error } = await supabase
    .from("accounts")
    .insert({
      user_id: userId,
      name: input.name,
      type: input.type,
      currency: input.currency,
      balance_minor: input.balance_minor,
      institution_id: input.institution_id,
      is_manual: input.is_manual ?? true,
    })
    .select("*")
    .returns<AccountRow[]>()
    .single();

  if (error) throw error;
  return data;
}

export async function updateAccount(
  supabase: SupabaseClient<Database>,
  userId: string,
  accountId: string,
  input: UpdateAccountInput
): Promise<AccountRow> {
  const { data, error } = await supabase
    .from("accounts")
    .update(input)
    .eq("id", accountId)
    .eq("user_id", userId)
    .select("*")
    .returns<AccountRow[]>()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteAccount(
  supabase: SupabaseClient<Database>,
  userId: string,
  accountId: string
): Promise<void> {
  const { error } = await supabase
    .from("accounts")
    .delete()
    .eq("id", accountId)
    .eq("user_id", userId);

  if (error) throw error;
}
