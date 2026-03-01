/**
 * Server — Expense Splits CRUD operations
 *
 * CRUD for split_persons and expense_splits, plus a balance
 * summary aggregation function.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/database.types";
import type {
  CreateSplitPersonInput,
  UpdateSplitPersonInput,
  CreateExpenseSplitInput,
  UpdateExpenseSplitInput,
} from "./schemas/splits";

type SplitPersonRow = Database["public"]["Tables"]["split_persons"]["Row"];
type ExpenseSplitRow = Database["public"]["Tables"]["expense_splits"]["Row"];

export interface BalanceSummaryEntry {
  person_id: string;
  person_name: string;
  total_unsettled_minor: number;
}

// ── Split Persons ────────────────────────────────────────────────────

export async function listSplitPersons(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<SplitPersonRow[]> {
  const { data, error } = await supabase
    .from("split_persons")
    .select("*")
    .eq("user_id", userId)
    .order("name", { ascending: true })
    .returns<SplitPersonRow[]>();

  if (error) throw error;
  return data ?? [];
}

export async function getSplitPerson(
  supabase: SupabaseClient<Database>,
  userId: string,
  personId: string
): Promise<SplitPersonRow | null> {
  const { data, error } = await supabase
    .from("split_persons")
    .select("*")
    .eq("id", personId)
    .eq("user_id", userId)
    .returns<SplitPersonRow[]>()
    .single();

  // PGRST116 = "JSON object requested, multiple (or no) rows returned"
  if (error && error.code === "PGRST116") return null;
  if (error) throw error;
  return data;
}

export async function createSplitPerson(
  supabase: SupabaseClient<Database>,
  userId: string,
  input: CreateSplitPersonInput
): Promise<SplitPersonRow> {
  const { data, error } = await supabase
    .from("split_persons")
    .insert({
      user_id: userId,
      name: input.name,
      email: input.email,
    })
    .select("*")
    .returns<SplitPersonRow[]>()
    .single();

  if (error) throw error;
  return data;
}

export async function updateSplitPerson(
  supabase: SupabaseClient<Database>,
  userId: string,
  personId: string,
  input: UpdateSplitPersonInput
): Promise<SplitPersonRow> {
  const { data, error } = await supabase
    .from("split_persons")
    .update(input)
    .eq("id", personId)
    .eq("user_id", userId)
    .select("*")
    .returns<SplitPersonRow[]>()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteSplitPerson(
  supabase: SupabaseClient<Database>,
  userId: string,
  personId: string
): Promise<void> {
  const { error } = await supabase
    .from("split_persons")
    .delete()
    .eq("id", personId)
    .eq("user_id", userId);

  if (error) throw error;
}

// ── Expense Splits ───────────────────────────────────────────────────

export async function listExpenseSplits(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<ExpenseSplitRow[]> {
  const { data, error } = await supabase
    .from("expense_splits")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .returns<ExpenseSplitRow[]>();

  if (error) throw error;
  return data ?? [];
}

export async function getExpenseSplit(
  supabase: SupabaseClient<Database>,
  userId: string,
  splitId: string
): Promise<ExpenseSplitRow | null> {
  const { data, error } = await supabase
    .from("expense_splits")
    .select("*")
    .eq("id", splitId)
    .eq("user_id", userId)
    .returns<ExpenseSplitRow[]>()
    .single();

  if (error && error.code === "PGRST116") return null;
  if (error) throw error;
  return data;
}

export async function createExpenseSplit(
  supabase: SupabaseClient<Database>,
  userId: string,
  input: CreateExpenseSplitInput
): Promise<ExpenseSplitRow> {
  const { data, error } = await supabase
    .from("expense_splits")
    .insert({
      user_id: userId,
      transaction_id: input.transaction_id,
      person_id: input.person_id,
      amount_minor: input.amount_minor,
      is_settled: input.is_settled ?? false,
    })
    .select("*")
    .returns<ExpenseSplitRow[]>()
    .single();

  if (error) throw error;
  return data;
}

export async function updateExpenseSplit(
  supabase: SupabaseClient<Database>,
  userId: string,
  splitId: string,
  input: UpdateExpenseSplitInput
): Promise<ExpenseSplitRow> {
  const { data, error } = await supabase
    .from("expense_splits")
    .update(input)
    .eq("id", splitId)
    .eq("user_id", userId)
    .select("*")
    .returns<ExpenseSplitRow[]>()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteExpenseSplit(
  supabase: SupabaseClient<Database>,
  userId: string,
  splitId: string
): Promise<void> {
  const { error } = await supabase
    .from("expense_splits")
    .delete()
    .eq("id", splitId)
    .eq("user_id", userId);

  if (error) throw error;
}

// ── Balance Summary ──────────────────────────────────────────────────

/**
 * Aggregate unsettled splits per person for the current user.
 * Returns a summary of how much each person owes (or is owed).
 */
export async function getBalanceSummary(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<BalanceSummaryEntry[]> {
  // Fetch all unsettled splits with person info
  const { data: splits, error: splitsError } = await supabase
    .from("expense_splits")
    .select("person_id, amount_minor")
    .eq("user_id", userId)
    .eq("is_settled", false)
    .returns<{ person_id: string; amount_minor: number }[]>();

  if (splitsError) throw splitsError;
  if (!splits || splits.length === 0) return [];

  // Aggregate by person_id
  const aggregated = new Map<string, number>();
  for (const split of splits) {
    const current = aggregated.get(split.person_id) ?? 0;
    aggregated.set(split.person_id, current + split.amount_minor);
  }

  // Fetch person names
  const personIds = Array.from(aggregated.keys());
  const { data: persons, error: personsError } = await supabase
    .from("split_persons")
    .select("id, name")
    .in("id", personIds)
    .returns<{ id: string; name: string }[]>();

  if (personsError) throw personsError;

  const personMap = new Map((persons ?? []).map((p) => [p.id, p.name]));

  return personIds.map((personId) => ({
    person_id: personId,
    person_name: personMap.get(personId) ?? "Unknown",
    total_unsettled_minor: aggregated.get(personId) ?? 0,
  }));
}
