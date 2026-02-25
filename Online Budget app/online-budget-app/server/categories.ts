/**
 * Server — Category query operations
 *
 * All Supabase queries for categories live here.
 *
 * NOT allowed: Financial math (must live in /engine)
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/database.types";

/**
 * Look up a category's UUID by its key.
 * Returns null if the key doesn't match any category.
 */
export async function getCategoryIdByKey(
  supabase: SupabaseClient<Database>,
  key: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from("categories")
    .select("id")
    .eq("key", key)
    .returns<{ id: string }[]>()
    .single();

  if (error && error.code === "PGRST116") return null;
  if (error) throw error;
  return data.id;
}
