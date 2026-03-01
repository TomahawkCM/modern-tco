/**
 * Server — Property CRUD operations
 *
 * All Supabase queries for properties live here.
 * API routes validate with Zod, then delegate to these functions.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/database.types";
import type { CreatePropertyInput, UpdatePropertyInput } from "./schemas/property";

type PropertyRow = Database["public"]["Tables"]["properties"]["Row"];

export async function listProperties(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<PropertyRow[]> {
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("user_id", userId)
    .order("address", { ascending: true })
    .returns<PropertyRow[]>();

  if (error) throw error;
  return data ?? [];
}

export async function getProperty(
  supabase: SupabaseClient<Database>,
  userId: string,
  id: string
): Promise<PropertyRow | null> {
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .returns<PropertyRow[]>()
    .single();

  // PGRST116 = "JSON object requested, multiple (or no) rows returned"
  if (error && error.code === "PGRST116") return null;
  if (error) throw error;
  return data;
}

export async function createProperty(
  supabase: SupabaseClient<Database>,
  userId: string,
  input: CreatePropertyInput
): Promise<PropertyRow> {
  const { data, error } = await supabase
    .from("properties")
    .insert({
      user_id: userId,
      address: input.address,
      purchase_price_minor: input.purchase_price_minor,
      current_value_minor: input.current_value_minor,
      mortgage_balance_minor: input.mortgage_balance_minor ?? 0,
      monthly_expenses_minor: input.monthly_expenses_minor ?? 0,
      purchase_date: input.purchase_date,
      currency: input.currency,
      notes: input.notes,
    })
    .select("*")
    .returns<PropertyRow[]>()
    .single();

  if (error) throw error;
  return data;
}

export async function updateProperty(
  supabase: SupabaseClient<Database>,
  userId: string,
  id: string,
  input: UpdatePropertyInput
): Promise<PropertyRow> {
  const { data, error } = await supabase
    .from("properties")
    .update(input)
    .eq("id", id)
    .eq("user_id", userId)
    .select("*")
    .returns<PropertyRow[]>()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteProperty(
  supabase: SupabaseClient<Database>,
  userId: string,
  id: string
): Promise<void> {
  const { error } = await supabase.from("properties").delete().eq("id", id).eq("user_id", userId);

  if (error) throw error;
}
