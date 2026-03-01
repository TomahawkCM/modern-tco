import { createClient } from "@/lib/supabase/server";

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

export async function getUserSettings(userId: string): Promise<UserSettings> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_settings")
    .select("locale, language, primary_currency")
    .eq("user_id", userId)
    .single();

  if (!data) return DEFAULTS;

  return {
    locale: data.locale ?? DEFAULTS.locale,
    language: data.language ?? DEFAULTS.language,
    primary_currency: data.primary_currency ?? DEFAULTS.primary_currency,
  };
}
