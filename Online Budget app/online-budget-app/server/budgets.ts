/**
 * Server — Budget CRUD operations
 *
 * Monthly category budgets. Users set spending limits per category.
 * The engine computes progress — no financial math happens here.
 *
 * NOT allowed: Financial math (must live in /engine)
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/database.types";
import type {
  CreateBudgetInput,
  UpdateBudgetInput,
  ListBudgetsInput,
} from "./schemas/budget";

type BudgetRow = Database["public"]["Tables"]["budgets"]["Row"];

export async function createBudget(
  supabase: SupabaseClient<Database>,
  userId: string,
  input: CreateBudgetInput
): Promise<BudgetRow> {
  const { data, error } = await supabase
    .from("budgets")
    .upsert(
      {
        user_id: userId,
        category_id: input.category_id,
        amount_minor: input.amount_minor,
        currency: input.currency,
        period: "monthly",
      },
      { onConflict: "user_id,category_id,period" }
    )
    .select("*")
    .returns<BudgetRow[]>()
    .single();

  if (error) throw error;
  return data;
}

export async function listBudgets(
  supabase: SupabaseClient<Database>,
  userId: string,
  filters: ListBudgetsInput
): Promise<{ budgets: BudgetRow[]; count: number }> {
  const { data, error, count } = await supabase
    .from("budgets")
    .select("*", { count: "exact" })
    .eq("user_id", userId)
    .eq("period", filters.period)
    .order("created_at", { ascending: true })
    .returns<BudgetRow[]>();

  if (error) throw error;
  return { budgets: data ?? [], count: count ?? 0 };
}

export async function getBudget(
  supabase: SupabaseClient<Database>,
  userId: string,
  budgetId: string
): Promise<BudgetRow | null> {
  const { data, error } = await supabase
    .from("budgets")
    .select("*")
    .eq("id", budgetId)
    .eq("user_id", userId)
    .returns<BudgetRow[]>()
    .single();

  if (error && error.code === "PGRST116") return null;
  if (error) throw error;
  return data;
}

export async function updateBudget(
  supabase: SupabaseClient<Database>,
  userId: string,
  budgetId: string,
  input: UpdateBudgetInput
): Promise<BudgetRow> {
  const { data, error } = await supabase
    .from("budgets")
    .update(input)
    .eq("id", budgetId)
    .eq("user_id", userId)
    .select("*")
    .returns<BudgetRow[]>()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteBudget(
  supabase: SupabaseClient<Database>,
  userId: string,
  budgetId: string
): Promise<void> {
  const { error } = await supabase
    .from("budgets")
    .delete()
    .eq("id", budgetId)
    .eq("user_id", userId);

  if (error) throw error;
}
