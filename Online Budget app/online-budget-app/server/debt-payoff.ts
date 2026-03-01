/**
 * Server — Debt Payoff CRUD operations
 *
 * CRUD for debt_scenarios and a composite loader that returns
 * all loans + all debt scenarios for the current user.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/database.types";
import type { CreateDebtScenarioInput } from "./schemas/debt-payoff";

type DebtScenarioRow = Database["public"]["Tables"]["debt_scenarios"]["Row"];
type LoanRow = Database["public"]["Tables"]["loans"]["Row"];

export interface DebtPayoffData {
  loans: LoanRow[];
  scenarios: DebtScenarioRow[];
}

// ── Debt Scenarios ────────────────────────────────────────────────────

export async function listDebtScenarios(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<DebtScenarioRow[]> {
  const { data, error } = await supabase
    .from("debt_scenarios")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .returns<DebtScenarioRow[]>();

  if (error) throw error;
  return data ?? [];
}

export async function getDebtScenario(
  supabase: SupabaseClient<Database>,
  userId: string,
  scenarioId: string
): Promise<DebtScenarioRow | null> {
  const { data, error } = await supabase
    .from("debt_scenarios")
    .select("*")
    .eq("id", scenarioId)
    .eq("user_id", userId)
    .returns<DebtScenarioRow[]>()
    .single();

  // PGRST116 = "JSON object requested, multiple (or no) rows returned"
  if (error && error.code === "PGRST116") return null;
  if (error) throw error;
  return data;
}

export async function createDebtScenario(
  supabase: SupabaseClient<Database>,
  userId: string,
  input: CreateDebtScenarioInput
): Promise<DebtScenarioRow> {
  const { data, error } = await supabase
    .from("debt_scenarios")
    .insert({
      user_id: userId,
      name: input.name,
      strategy: input.strategy,
      extra_payment_minor: input.extra_payment_minor ?? 0,
      config: (input.config ?? {}) as import("@/supabase/database.types").Json,
    })
    .select("*")
    .returns<DebtScenarioRow[]>()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteDebtScenario(
  supabase: SupabaseClient<Database>,
  userId: string,
  scenarioId: string
): Promise<void> {
  const { error } = await supabase
    .from("debt_scenarios")
    .delete()
    .eq("id", scenarioId)
    .eq("user_id", userId);

  if (error) throw error;
}

// ── Composite Loader ──────────────────────────────────────────────────

/**
 * Load all loans and all debt scenarios for a user.
 * Used by the debt-payoff page to run payoff simulations.
 */
export async function getDebtPayoffData(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<DebtPayoffData> {
  const [loansResult, scenariosResult] = await Promise.all([
    supabase
      .from("loans")
      .select("*")
      .eq("user_id", userId)
      .order("name", { ascending: true })
      .returns<LoanRow[]>(),
    supabase
      .from("debt_scenarios")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .returns<DebtScenarioRow[]>(),
  ]);

  if (loansResult.error) throw loansResult.error;
  if (scenariosResult.error) throw scenariosResult.error;

  return {
    loans: loansResult.data ?? [],
    scenarios: scenariosResult.data ?? [],
  };
}
