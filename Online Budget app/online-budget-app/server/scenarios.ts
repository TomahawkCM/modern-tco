/**
 * Server — Financial Scenarios CRUD operations
 *
 * All Supabase queries for financial_scenarios live here.
 * API routes validate with Zod, then delegate to these functions.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/database.types";
import type { CreateScenarioInput, UpdateScenarioInput } from "./schemas/scenarios";

type ScenarioRow = Database["public"]["Tables"]["financial_scenarios"]["Row"];

// ── Financial Scenarios ──────────────────────────────────────────────

export async function listScenarios(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<ScenarioRow[]> {
  const { data, error } = await supabase
    .from("financial_scenarios")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .returns<ScenarioRow[]>();

  if (error) throw error;
  return data ?? [];
}

export async function getScenario(
  supabase: SupabaseClient<Database>,
  userId: string,
  scenarioId: string
): Promise<ScenarioRow | null> {
  const { data, error } = await supabase
    .from("financial_scenarios")
    .select("*")
    .eq("id", scenarioId)
    .eq("user_id", userId)
    .returns<ScenarioRow[]>()
    .single();

  // PGRST116 = "JSON object requested, multiple (or no) rows returned"
  if (error && error.code === "PGRST116") return null;
  if (error) throw error;
  return data;
}

export async function createScenario(
  supabase: SupabaseClient<Database>,
  userId: string,
  input: CreateScenarioInput
): Promise<ScenarioRow> {
  const { data, error } = await supabase
    .from("financial_scenarios")
    .insert({
      user_id: userId,
      name: input.name,
      description: input.description,
      config: (input.config ?? {}) as import("@/supabase/database.types").Json,
      results: (input.results ?? null) as import("@/supabase/database.types").Json,
    })
    .select("*")
    .returns<ScenarioRow[]>()
    .single();

  if (error) throw error;
  return data;
}

export async function updateScenario(
  supabase: SupabaseClient<Database>,
  userId: string,
  scenarioId: string,
  input: UpdateScenarioInput
): Promise<ScenarioRow> {
  const updateData: Record<string, unknown> = {};
  if (input.name !== undefined) updateData.name = input.name;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.config !== undefined)
    updateData.config = input.config as import("@/supabase/database.types").Json;
  if (input.results !== undefined)
    updateData.results = input.results as import("@/supabase/database.types").Json;

  const { data, error } = await supabase
    .from("financial_scenarios")
    .update(updateData)
    .eq("id", scenarioId)
    .eq("user_id", userId)
    .select("*")
    .returns<ScenarioRow[]>()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteScenario(
  supabase: SupabaseClient<Database>,
  userId: string,
  scenarioId: string
): Promise<void> {
  const { error } = await supabase
    .from("financial_scenarios")
    .delete()
    .eq("id", scenarioId)
    .eq("user_id", userId);

  if (error) throw error;
}
