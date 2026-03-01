/**
 * Server — Category query operations
 *
 * All Supabase queries for categories live here.
 *
 * NOT allowed: Financial math (must live in /engine)
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/database.types";

type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];
type UserCategoryOverrideRow = Database["public"]["Tables"]["user_category_overrides"]["Row"];

export interface CategoryWithTranslation {
  id: string;
  key: string;
  parent_id: string | null;
  is_system: boolean;
  type: "income" | "expense" | "transfer";
  display_order: number;
  created_at: string;
  display_name: string | null;
}

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

/**
 * List all categories with their translated display names for a given locale.
 * Joins categories with category_translations on the specified locale.
 * Falls back to null display_name if no translation exists for the locale.
 */
export async function listCategories(
  supabase: SupabaseClient<Database>,
  locale: string
): Promise<CategoryWithTranslation[]> {
  const { data, error } = await supabase
    .from("categories")
    .select(
      `
      id,
      key,
      parent_id,
      is_system,
      type,
      display_order,
      created_at,
      category_translations!left (
        display_name
      )
    `
    )
    .eq("category_translations.locale", locale)
    .order("display_order", { ascending: true })
    .returns<
      (CategoryRow & {
        category_translations: { display_name: string }[] | null;
      })[]
    >();

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    key: row.key,
    parent_id: row.parent_id,
    is_system: row.is_system,
    type: row.type,
    display_order: row.display_order,
    created_at: row.created_at,
    display_name: row.category_translations?.[0]?.display_name ?? null,
  }));
}

/**
 * List all category name overrides for a user.
 */
export async function listUserCategoryOverrides(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<UserCategoryOverrideRow[]> {
  const { data, error } = await supabase
    .from("user_category_overrides")
    .select("*")
    .eq("user_id", userId)
    .returns<UserCategoryOverrideRow[]>();

  if (error) throw error;
  return data ?? [];
}

/**
 * Create or update a user's category name override.
 * Upserts on (user_id, category_id) to prevent duplicates.
 */
export async function createUserCategoryOverride(
  supabase: SupabaseClient<Database>,
  userId: string,
  input: { category_id: string; custom_name: string }
): Promise<UserCategoryOverrideRow> {
  const { data, error } = await supabase
    .from("user_category_overrides")
    .upsert(
      {
        user_id: userId,
        category_id: input.category_id,
        custom_name: input.custom_name,
      },
      { onConflict: "user_id,category_id" }
    )
    .select("*")
    .returns<UserCategoryOverrideRow[]>()
    .single();

  if (error) throw error;
  return data;
}
