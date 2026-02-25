/**
 * Server — Account query operations
 *
 * Fetches account data for dashboard display.
 * No financial math — aggregation happens in engine.
 *
 * NOT allowed: Financial math (must live in /engine)
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/database.types";

type AccountRow = Database["public"]["Tables"]["accounts"]["Row"];

export async function listAccounts(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<AccountRow[]> {
  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .eq("user_id", userId)
    .order("name", { ascending: true })
    .returns<AccountRow[]>();

  if (error) throw error;
  return data ?? [];
}
