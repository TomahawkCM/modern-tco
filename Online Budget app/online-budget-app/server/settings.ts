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

export interface UserSettings {
  locale: string;
  language: string;
  primary_currency: string;
}

const DEFAULTS: UserSettings = {
  locale: "en-US",
  language: "en",
  primary_currency: "USD",
};

export async function getUserSettings(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<UserSettings> {
  const { data, error } = await supabase
    .from("user_settings")
    .select("locale, language, primary_currency")
    .eq("user_id", userId)
    .returns<Pick<UserSettingsRow, "locale" | "language" | "primary_currency">[]>()
    .single();

  if (error && error.code === "PGRST116") return DEFAULTS;
  if (error) throw error;
  if (!data) return DEFAULTS;

  return {
    locale: data.locale ?? DEFAULTS.locale,
    language: data.language ?? DEFAULTS.language,
    primary_currency: data.primary_currency ?? DEFAULTS.primary_currency,
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
    .select("locale, language, primary_currency")
    .returns<Pick<UserSettingsRow, "locale" | "language" | "primary_currency">[]>()
    .single();

  if (error) throw error;

  return {
    locale: data.locale ?? DEFAULTS.locale,
    language: data.language ?? DEFAULTS.language,
    primary_currency: data.primary_currency ?? DEFAULTS.primary_currency,
  };
}
