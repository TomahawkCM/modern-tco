/**
 * Server — User Settings operations
 *
 * All Supabase queries for user settings live here.
 * API routes validate with Zod, then delegate to these functions.
 *
 * NOT allowed: Financial math (must live in /engine)
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/database.types";
import type { UpdateSettingsInput } from "./schemas/settings";

type UserSettingsRow = Database["public"]["Tables"]["user_settings"]["Row"];

import type { BudgetMethodology } from "@/engine";

export interface UserSettings {
  locale: string;
  language: string;
  primary_currency: string;
  budget_methodology: BudgetMethodology;
}

const DEFAULTS: UserSettings = {
  locale: "en-US",
  language: "en",
  primary_currency: "USD",
  budget_methodology: "envelope",
};

export async function getUserSettings(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<UserSettings> {
  const { data, error } = await supabase
    .from("user_settings")
    .select("locale, language, primary_currency, budget_methodology")
    .eq("user_id", userId)
    .returns<
      Pick<UserSettingsRow, "locale" | "language" | "primary_currency" | "budget_methodology">[]
    >()
    .single();

  if (error && error.code === "PGRST116") return DEFAULTS;
  if (error) throw error;
  if (!data) return DEFAULTS;

  return {
    locale: data.locale ?? DEFAULTS.locale,
    language: data.language ?? DEFAULTS.language,
    primary_currency: data.primary_currency ?? DEFAULTS.primary_currency,
    budget_methodology: data.budget_methodology ?? DEFAULTS.budget_methodology,
  };
}

export async function updateUserSettings(
  supabase: SupabaseClient<Database>,
  userId: string,
  input: UpdateSettingsInput
): Promise<UserSettings> {
  const { data, error } = await supabase
    .from("user_settings")
    .upsert(
      {
        user_id: userId,
        ...input,
      },
      { onConflict: "user_id" }
    )
    .select("locale, language, primary_currency, budget_methodology")
    .returns<
      Pick<UserSettingsRow, "locale" | "language" | "primary_currency" | "budget_methodology">[]
    >()
    .single();

  if (error) throw error;

  return {
    locale: data.locale ?? DEFAULTS.locale,
    language: data.language ?? DEFAULTS.language,
    primary_currency: data.primary_currency ?? DEFAULTS.primary_currency,
    budget_methodology: data.budget_methodology ?? DEFAULTS.budget_methodology,
  };
}
