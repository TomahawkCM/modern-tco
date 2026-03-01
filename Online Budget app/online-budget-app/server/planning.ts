/**
 * Server — Planning CRUD operations
 *
 * All Supabase queries for future_purchases, retirement_plans, and
 * paycheck_plans live here. API routes validate with Zod, then
 * delegate to these functions.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/database.types";
import type {
  CreateFuturePurchaseInput,
  UpdateFuturePurchaseInput,
  CreateRetirementPlanInput,
  UpdateRetirementPlanInput,
  CreatePaycheckPlanInput,
  UpdatePaycheckPlanInput,
} from "./schemas/planning";

type FuturePurchaseRow = Database["public"]["Tables"]["future_purchases"]["Row"];
type RetirementPlanRow = Database["public"]["Tables"]["retirement_plans"]["Row"];
type PaycheckPlanRow = Database["public"]["Tables"]["paycheck_plans"]["Row"];

// ── Future Purchases ──────────────────────────────────────────────────

export async function listFuturePurchases(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<FuturePurchaseRow[]> {
  const { data, error } = await supabase
    .from("future_purchases")
    .select("*")
    .eq("user_id", userId)
    .order("priority", { ascending: true })
    .order("target_date", { ascending: true })
    .returns<FuturePurchaseRow[]>();

  if (error) throw error;
  return data ?? [];
}

export async function getFuturePurchase(
  supabase: SupabaseClient<Database>,
  userId: string,
  purchaseId: string
): Promise<FuturePurchaseRow | null> {
  const { data, error } = await supabase
    .from("future_purchases")
    .select("*")
    .eq("id", purchaseId)
    .eq("user_id", userId)
    .returns<FuturePurchaseRow[]>()
    .single();

  // PGRST116 = "JSON object requested, multiple (or no) rows returned"
  if (error && error.code === "PGRST116") return null;
  if (error) throw error;
  return data;
}

export async function createFuturePurchase(
  supabase: SupabaseClient<Database>,
  userId: string,
  input: CreateFuturePurchaseInput
): Promise<FuturePurchaseRow> {
  const { data, error } = await supabase
    .from("future_purchases")
    .insert({
      user_id: userId,
      name: input.name,
      target_amount_minor: input.target_amount_minor,
      current_savings_minor: input.current_savings_minor ?? 0,
      monthly_savings_minor: input.monthly_savings_minor ?? 0,
      target_date: input.target_date,
      priority: input.priority ?? "medium",
      currency: input.currency,
    })
    .select("*")
    .returns<FuturePurchaseRow[]>()
    .single();

  if (error) throw error;
  return data;
}

export async function updateFuturePurchase(
  supabase: SupabaseClient<Database>,
  userId: string,
  purchaseId: string,
  input: UpdateFuturePurchaseInput
): Promise<FuturePurchaseRow> {
  const { data, error } = await supabase
    .from("future_purchases")
    .update(input)
    .eq("id", purchaseId)
    .eq("user_id", userId)
    .select("*")
    .returns<FuturePurchaseRow[]>()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteFuturePurchase(
  supabase: SupabaseClient<Database>,
  userId: string,
  purchaseId: string
): Promise<void> {
  const { error } = await supabase
    .from("future_purchases")
    .delete()
    .eq("id", purchaseId)
    .eq("user_id", userId);

  if (error) throw error;
}

// ── Retirement Plans ──────────────────────────────────────────────────

export async function listRetirementPlans(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<RetirementPlanRow[]> {
  const { data, error } = await supabase
    .from("retirement_plans")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .returns<RetirementPlanRow[]>();

  if (error) throw error;
  return data ?? [];
}

export async function getRetirementPlan(
  supabase: SupabaseClient<Database>,
  userId: string,
  planId: string
): Promise<RetirementPlanRow | null> {
  const { data, error } = await supabase
    .from("retirement_plans")
    .select("*")
    .eq("id", planId)
    .eq("user_id", userId)
    .returns<RetirementPlanRow[]>()
    .single();

  if (error && error.code === "PGRST116") return null;
  if (error) throw error;
  return data;
}

export async function createRetirementPlan(
  supabase: SupabaseClient<Database>,
  userId: string,
  input: CreateRetirementPlanInput
): Promise<RetirementPlanRow> {
  const { data, error } = await supabase
    .from("retirement_plans")
    .insert({
      user_id: userId,
      current_age: input.current_age,
      retirement_age: input.retirement_age ?? 65,
      current_savings_minor: input.current_savings_minor ?? 0,
      monthly_contribution_minor: input.monthly_contribution_minor ?? 0,
      expected_return_percent: input.expected_return_percent ?? 7.0,
      currency: input.currency,
      notes: input.notes,
    })
    .select("*")
    .returns<RetirementPlanRow[]>()
    .single();

  if (error) throw error;
  return data;
}

export async function updateRetirementPlan(
  supabase: SupabaseClient<Database>,
  userId: string,
  planId: string,
  input: UpdateRetirementPlanInput
): Promise<RetirementPlanRow> {
  const { data, error } = await supabase
    .from("retirement_plans")
    .update(input)
    .eq("id", planId)
    .eq("user_id", userId)
    .select("*")
    .returns<RetirementPlanRow[]>()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteRetirementPlan(
  supabase: SupabaseClient<Database>,
  userId: string,
  planId: string
): Promise<void> {
  const { error } = await supabase
    .from("retirement_plans")
    .delete()
    .eq("id", planId)
    .eq("user_id", userId);

  if (error) throw error;
}

// ── Paycheck Plans ────────────────────────────────────────────────────

export async function listPaycheckPlans(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<PaycheckPlanRow[]> {
  const { data, error } = await supabase
    .from("paycheck_plans")
    .select("*")
    .eq("user_id", userId)
    .order("next_pay_date", { ascending: true })
    .returns<PaycheckPlanRow[]>();

  if (error) throw error;
  return data ?? [];
}

export async function getPaycheckPlan(
  supabase: SupabaseClient<Database>,
  userId: string,
  planId: string
): Promise<PaycheckPlanRow | null> {
  const { data, error } = await supabase
    .from("paycheck_plans")
    .select("*")
    .eq("id", planId)
    .eq("user_id", userId)
    .returns<PaycheckPlanRow[]>()
    .single();

  if (error && error.code === "PGRST116") return null;
  if (error) throw error;
  return data;
}

export async function createPaycheckPlan(
  supabase: SupabaseClient<Database>,
  userId: string,
  input: CreatePaycheckPlanInput
): Promise<PaycheckPlanRow> {
  const { data, error } = await supabase
    .from("paycheck_plans")
    .insert({
      user_id: userId,
      schedule_type: input.schedule_type,
      pay_amount_minor: input.pay_amount_minor,
      next_pay_date: input.next_pay_date,
      currency: input.currency,
      allocations: input.allocations ?? [],
    })
    .select("*")
    .returns<PaycheckPlanRow[]>()
    .single();

  if (error) throw error;
  return data;
}

export async function updatePaycheckPlan(
  supabase: SupabaseClient<Database>,
  userId: string,
  planId: string,
  input: UpdatePaycheckPlanInput
): Promise<PaycheckPlanRow> {
  const { data, error } = await supabase
    .from("paycheck_plans")
    .update(input)
    .eq("id", planId)
    .eq("user_id", userId)
    .select("*")
    .returns<PaycheckPlanRow[]>()
    .single();

  if (error) throw error;
  return data;
}

export async function deletePaycheckPlan(
  supabase: SupabaseClient<Database>,
  userId: string,
  planId: string
): Promise<void> {
  const { error } = await supabase
    .from("paycheck_plans")
    .delete()
    .eq("id", planId)
    .eq("user_id", userId);

  if (error) throw error;
}
