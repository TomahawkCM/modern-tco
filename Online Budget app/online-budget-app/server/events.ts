/**
 * Server — Event Budgets CRUD operations
 *
 * CRUD for event_budgets and event_budget_items.
 * Items ownership is verified by joining to event_budgets.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/database.types";
import type {
  CreateEventBudgetInput,
  UpdateEventBudgetInput,
  CreateEventBudgetItemInput,
  UpdateEventBudgetItemInput,
} from "./schemas/events";

type EventBudgetRow = Database["public"]["Tables"]["event_budgets"]["Row"];
type EventBudgetItemRow = Database["public"]["Tables"]["event_budget_items"]["Row"];

// ── Event Budgets ────────────────────────────────────────────────────

export async function listEventBudgets(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<EventBudgetRow[]> {
  const { data, error } = await supabase
    .from("event_budgets")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .returns<EventBudgetRow[]>();

  if (error) throw error;
  return data ?? [];
}

export async function getEventBudget(
  supabase: SupabaseClient<Database>,
  userId: string,
  eventId: string
): Promise<EventBudgetRow | null> {
  const { data, error } = await supabase
    .from("event_budgets")
    .select("*")
    .eq("id", eventId)
    .eq("user_id", userId)
    .returns<EventBudgetRow[]>()
    .single();

  // PGRST116 = "JSON object requested, multiple (or no) rows returned"
  if (error && error.code === "PGRST116") return null;
  if (error) throw error;
  return data;
}

export async function createEventBudget(
  supabase: SupabaseClient<Database>,
  userId: string,
  input: CreateEventBudgetInput
): Promise<EventBudgetRow> {
  const { data, error } = await supabase
    .from("event_budgets")
    .insert({
      user_id: userId,
      name: input.name,
      total_budget_minor: input.total_budget_minor,
      start_date: input.start_date,
      end_date: input.end_date,
      currency: input.currency,
    })
    .select("*")
    .returns<EventBudgetRow[]>()
    .single();

  if (error) throw error;
  return data;
}

export async function updateEventBudget(
  supabase: SupabaseClient<Database>,
  userId: string,
  eventId: string,
  input: UpdateEventBudgetInput
): Promise<EventBudgetRow> {
  const { data, error } = await supabase
    .from("event_budgets")
    .update(input)
    .eq("id", eventId)
    .eq("user_id", userId)
    .select("*")
    .returns<EventBudgetRow[]>()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteEventBudget(
  supabase: SupabaseClient<Database>,
  userId: string,
  eventId: string
): Promise<void> {
  const { error } = await supabase
    .from("event_budgets")
    .delete()
    .eq("id", eventId)
    .eq("user_id", userId);

  if (error) throw error;
}

// ── Event Budget Items ───────────────────────────────────────────────

/**
 * Verify the parent event_budget belongs to the user.
 * Returns the event budget row or null if not found / not owned.
 */
async function verifyEventBudgetOwnership(
  supabase: SupabaseClient<Database>,
  userId: string,
  eventBudgetId: string
): Promise<EventBudgetRow | null> {
  const { data, error } = await supabase
    .from("event_budgets")
    .select("*")
    .eq("id", eventBudgetId)
    .eq("user_id", userId)
    .returns<EventBudgetRow[]>()
    .single();

  if (error && error.code === "PGRST116") return null;
  if (error) throw error;
  return data;
}

export async function listEventBudgetItems(
  supabase: SupabaseClient<Database>,
  userId: string,
  eventBudgetId: string
): Promise<EventBudgetItemRow[]> {
  // Verify ownership first
  const budget = await verifyEventBudgetOwnership(supabase, userId, eventBudgetId);
  if (!budget) throw new Error("Event budget not found");

  const { data, error } = await supabase
    .from("event_budget_items")
    .select("*")
    .eq("event_budget_id", eventBudgetId)
    .order("category_name", { ascending: true })
    .returns<EventBudgetItemRow[]>();

  if (error) throw error;
  return data ?? [];
}

export async function getEventBudgetItem(
  supabase: SupabaseClient<Database>,
  userId: string,
  eventBudgetId: string,
  itemId: string
): Promise<EventBudgetItemRow | null> {
  // Verify ownership first
  const budget = await verifyEventBudgetOwnership(supabase, userId, eventBudgetId);
  if (!budget) return null;

  const { data, error } = await supabase
    .from("event_budget_items")
    .select("*")
    .eq("id", itemId)
    .eq("event_budget_id", eventBudgetId)
    .returns<EventBudgetItemRow[]>()
    .single();

  if (error && error.code === "PGRST116") return null;
  if (error) throw error;
  return data;
}

export async function createEventBudgetItem(
  supabase: SupabaseClient<Database>,
  userId: string,
  input: CreateEventBudgetItemInput
): Promise<EventBudgetItemRow> {
  // Verify ownership first
  const budget = await verifyEventBudgetOwnership(supabase, userId, input.event_budget_id);
  if (!budget) throw new Error("Event budget not found");

  const { data, error } = await supabase
    .from("event_budget_items")
    .insert({
      event_budget_id: input.event_budget_id,
      category_name: input.category_name,
      budget_minor: input.budget_minor,
      spent_minor: input.spent_minor ?? 0,
      notes: input.notes,
    })
    .select("*")
    .returns<EventBudgetItemRow[]>()
    .single();

  if (error) throw error;
  return data;
}

export async function updateEventBudgetItem(
  supabase: SupabaseClient<Database>,
  userId: string,
  eventBudgetId: string,
  itemId: string,
  input: UpdateEventBudgetItemInput
): Promise<EventBudgetItemRow> {
  // Verify ownership first
  const budget = await verifyEventBudgetOwnership(supabase, userId, eventBudgetId);
  if (!budget) throw new Error("Event budget not found");

  const { data, error } = await supabase
    .from("event_budget_items")
    .update(input)
    .eq("id", itemId)
    .eq("event_budget_id", eventBudgetId)
    .select("*")
    .returns<EventBudgetItemRow[]>()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteEventBudgetItem(
  supabase: SupabaseClient<Database>,
  userId: string,
  eventBudgetId: string,
  itemId: string
): Promise<void> {
  // Verify ownership first
  const budget = await verifyEventBudgetOwnership(supabase, userId, eventBudgetId);
  if (!budget) throw new Error("Event budget not found");

  const { error } = await supabase
    .from("event_budget_items")
    .delete()
    .eq("id", itemId)
    .eq("event_budget_id", eventBudgetId);

  if (error) throw error;
}
