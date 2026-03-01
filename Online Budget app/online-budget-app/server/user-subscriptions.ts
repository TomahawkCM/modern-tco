/**
 * Server — User Subscription CRUD operations
 *
 * All Supabase queries for user subscriptions live here.
 * API routes validate with Zod, then delegate to these functions.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/database.types";
import type {
  CreateUserSubscriptionInput,
  UpdateUserSubscriptionInput,
} from "./schemas/user-subscription";

type UserSubscriptionRow = Database["public"]["Tables"]["user_subscriptions"]["Row"];
type ExcludedRow = Database["public"]["Tables"]["excluded_subscription_merchants"]["Row"];

export async function listSubscriptions(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<UserSubscriptionRow[]> {
  const { data, error } = await supabase
    .from("user_subscriptions")
    .select("*")
    .eq("user_id", userId)
    .order("merchant_name", { ascending: true })
    .returns<UserSubscriptionRow[]>();

  if (error) throw error;
  return data ?? [];
}

export async function createSubscription(
  supabase: SupabaseClient<Database>,
  userId: string,
  input: CreateUserSubscriptionInput
): Promise<UserSubscriptionRow> {
  const { data, error } = await supabase
    .from("user_subscriptions")
    .insert({
      user_id: userId,
      merchant_name: input.merchant_name,
      amount_minor: input.amount_minor,
      currency: input.currency,
      frequency: input.frequency,
      category_id: input.category_id,
      next_billing_date: input.next_billing_date,
      is_active: input.is_active ?? true,
      notes: input.notes,
    })
    .select("*")
    .returns<UserSubscriptionRow[]>()
    .single();

  if (error) throw error;
  return data;
}

export async function updateSubscription(
  supabase: SupabaseClient<Database>,
  userId: string,
  id: string,
  input: UpdateUserSubscriptionInput
): Promise<UserSubscriptionRow> {
  const { data, error } = await supabase
    .from("user_subscriptions")
    .update(input)
    .eq("id", id)
    .eq("user_id", userId)
    .select("*")
    .returns<UserSubscriptionRow[]>()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteSubscription(
  supabase: SupabaseClient<Database>,
  userId: string,
  id: string
): Promise<void> {
  const { error } = await supabase
    .from("user_subscriptions")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw error;
}

export async function listExcludedMerchants(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<ExcludedRow[]> {
  const { data, error } = await supabase
    .from("excluded_subscription_merchants")
    .select("*")
    .eq("user_id", userId)
    .returns<ExcludedRow[]>();

  if (error) throw error;
  return data ?? [];
}

export async function excludeMerchant(
  supabase: SupabaseClient<Database>,
  userId: string,
  merchantToken: string
): Promise<ExcludedRow> {
  const { data, error } = await supabase
    .from("excluded_subscription_merchants")
    .insert({
      user_id: userId,
      merchant_token: merchantToken,
    })
    .select("*")
    .returns<ExcludedRow[]>()
    .single();

  if (error) throw error;
  return data;
}

export async function unexcludeMerchant(
  supabase: SupabaseClient<Database>,
  userId: string,
  merchantToken: string
): Promise<void> {
  const { error } = await supabase
    .from("excluded_subscription_merchants")
    .delete()
    .eq("user_id", userId)
    .eq("merchant_token", merchantToken);

  if (error) throw error;
}
