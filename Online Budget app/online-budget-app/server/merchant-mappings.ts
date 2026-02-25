/**
 * Server — Merchant Mapping CRUD operations
 *
 * User-owned merchant-to-category mappings (learned from corrections).
 * These feed into the engine's categorize() function as Tier 1 rules.
 *
 * NOT allowed: Financial math (must live in /engine)
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/database.types";
import type { MerchantRule } from "@/engine";
import type {
  CreateMerchantMappingInput,
  ListMerchantMappingsInput,
} from "./schemas/merchant-mapping";

type MerchantMappingRow =
  Database["public"]["Tables"]["merchant_mappings"]["Row"];

export async function createMerchantMapping(
  supabase: SupabaseClient<Database>,
  userId: string,
  input: CreateMerchantMappingInput
): Promise<MerchantMappingRow> {
  const { data, error } = await supabase
    .from("merchant_mappings")
    .upsert(
      {
        user_id: userId,
        merchant_token: input.merchant_token,
        display_name: input.display_name,
        category_id: input.category_id,
      },
      { onConflict: "user_id,merchant_token" }
    )
    .select("*")
    .returns<MerchantMappingRow[]>()
    .single();

  if (error) throw error;
  return data;
}

export async function listMerchantMappings(
  supabase: SupabaseClient<Database>,
  userId: string,
  filters: ListMerchantMappingsInput
): Promise<{ mappings: MerchantMappingRow[]; count: number }> {
  const { data, error, count } = await supabase
    .from("merchant_mappings")
    .select("*", { count: "exact" })
    .eq("user_id", userId)
    .order("display_name", { ascending: true })
    .range(filters.offset, filters.offset + filters.limit - 1)
    .returns<MerchantMappingRow[]>();

  if (error) throw error;
  return { mappings: data ?? [], count: count ?? 0 };
}

export async function deleteMerchantMapping(
  supabase: SupabaseClient<Database>,
  userId: string,
  mappingId: string
): Promise<void> {
  const { error } = await supabase
    .from("merchant_mappings")
    .delete()
    .eq("id", mappingId)
    .eq("user_id", userId);

  if (error) throw error;
}

/**
 * Load all merchant mappings for a user, transformed into the engine's
 * MerchantRule[] format for use with categorize().
 *
 * Joins with categories to resolve category_id → categoryKey + parentKey.
 */
export async function loadMerchantRulesForEngine(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<MerchantRule[]> {
  const { data, error } = await supabase
    .from("merchant_mappings")
    .select(
      `
      merchant_token,
      display_name,
      category:categories!merchant_mappings_category_id_fkey (
        key,
        parent:categories!categories_parent_id_fkey ( key )
      )
    `
    )
    .eq("user_id", userId)
    .returns<
      {
        merchant_token: string;
        display_name: string;
        category: {
          key: string;
          parent: { key: string } | null;
        } | null;
      }[]
    >();

  if (error) throw error;

  return (data ?? [])
    .filter((row) => row.category !== null)
    .map((row) => ({
      merchantToken: row.merchant_token,
      displayName: row.display_name,
      categoryKey: row.category!.key,
      parentKey: row.category!.parent?.key ?? row.category!.key,
    }));
}
