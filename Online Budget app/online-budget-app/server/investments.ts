/**
 * Server — Investment Account & Holding CRUD operations
 *
 * All Supabase queries for investment accounts and holdings live here.
 * API routes validate with Zod, then delegate to these functions.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/database.types";
import type {
  CreateInvestmentAccountInput,
  UpdateInvestmentAccountInput,
  CreateHoldingInput,
  UpdateHoldingInput,
} from "./schemas/investment";

type InvestmentAccountRow = Database["public"]["Tables"]["investment_accounts"]["Row"];
type HoldingRow = Database["public"]["Tables"]["holdings"]["Row"];

export async function listInvestmentAccounts(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<InvestmentAccountRow[]> {
  const { data, error } = await supabase
    .from("investment_accounts")
    .select("*")
    .eq("user_id", userId)
    .order("name", { ascending: true })
    .returns<InvestmentAccountRow[]>();

  if (error) throw error;
  return data ?? [];
}

export async function getInvestmentAccount(
  supabase: SupabaseClient<Database>,
  userId: string,
  id: string
): Promise<InvestmentAccountRow | null> {
  const { data, error } = await supabase
    .from("investment_accounts")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .returns<InvestmentAccountRow[]>()
    .single();

  // PGRST116 = "JSON object requested, multiple (or no) rows returned"
  if (error && error.code === "PGRST116") return null;
  if (error) throw error;
  return data;
}

export async function createInvestmentAccount(
  supabase: SupabaseClient<Database>,
  userId: string,
  input: CreateInvestmentAccountInput
): Promise<InvestmentAccountRow> {
  const { data, error } = await supabase
    .from("investment_accounts")
    .insert({
      user_id: userId,
      name: input.name,
      account_type: input.account_type,
      institution: input.institution,
      currency: input.currency,
    })
    .select("*")
    .returns<InvestmentAccountRow[]>()
    .single();

  if (error) throw error;
  return data;
}

export async function updateInvestmentAccount(
  supabase: SupabaseClient<Database>,
  userId: string,
  id: string,
  input: UpdateInvestmentAccountInput
): Promise<InvestmentAccountRow> {
  const { data, error } = await supabase
    .from("investment_accounts")
    .update(input)
    .eq("id", id)
    .eq("user_id", userId)
    .select("*")
    .returns<InvestmentAccountRow[]>()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteInvestmentAccount(
  supabase: SupabaseClient<Database>,
  userId: string,
  id: string
): Promise<void> {
  const { error } = await supabase
    .from("investment_accounts")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw error;
}

export async function listHoldings(
  supabase: SupabaseClient<Database>,
  userId: string,
  investmentAccountId: string
): Promise<HoldingRow[]> {
  const { data, error } = await supabase
    .from("holdings")
    .select("*")
    .eq("user_id", userId)
    .eq("investment_account_id", investmentAccountId)
    .order("symbol", { ascending: true })
    .returns<HoldingRow[]>();

  if (error) throw error;
  return data ?? [];
}

export async function createHolding(
  supabase: SupabaseClient<Database>,
  userId: string,
  input: CreateHoldingInput
): Promise<HoldingRow> {
  const { data, error } = await supabase
    .from("holdings")
    .insert({
      user_id: userId,
      investment_account_id: input.investment_account_id,
      symbol: input.symbol,
      name: input.name,
      shares: input.shares,
      purchase_price_minor: input.purchase_price_minor,
      purchase_date: input.purchase_date,
      currency: input.currency,
    })
    .select("*")
    .returns<HoldingRow[]>()
    .single();

  if (error) throw error;
  return data;
}

export async function updateHolding(
  supabase: SupabaseClient<Database>,
  userId: string,
  holdingId: string,
  input: UpdateHoldingInput
): Promise<HoldingRow> {
  const { data, error } = await supabase
    .from("holdings")
    .update(input)
    .eq("id", holdingId)
    .eq("user_id", userId)
    .select("*")
    .returns<HoldingRow[]>()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteHolding(
  supabase: SupabaseClient<Database>,
  userId: string,
  holdingId: string
): Promise<void> {
  const { error } = await supabase
    .from("holdings")
    .delete()
    .eq("id", holdingId)
    .eq("user_id", userId);

  if (error) throw error;
}
