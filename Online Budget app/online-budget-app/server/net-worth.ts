/**
 * Server — Net Worth Snapshot CRUD operations
 *
 * All Supabase queries for net worth snapshots live here.
 * API routes validate with Zod, then delegate to these functions.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/supabase/database.types";
import type { CreateNetWorthSnapshotInput } from "./schemas/net-worth";

type NetWorthSnapshotRow = Database["public"]["Tables"]["net_worth_snapshots"]["Row"];

export async function getLatestNetWorth(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<NetWorthSnapshotRow | null> {
  const { data, error } = await supabase
    .from("net_worth_snapshots")
    .select("*")
    .eq("user_id", userId)
    .order("snapshot_date", { ascending: false })
    .limit(1)
    .returns<NetWorthSnapshotRow[]>()
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function listNetWorthSnapshots(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<NetWorthSnapshotRow[]> {
  const { data, error } = await supabase
    .from("net_worth_snapshots")
    .select("*")
    .eq("user_id", userId)
    .order("snapshot_date", { ascending: false })
    .returns<NetWorthSnapshotRow[]>();

  if (error) throw error;
  return data ?? [];
}

export async function createNetWorthSnapshot(
  supabase: SupabaseClient<Database>,
  userId: string,
  input: CreateNetWorthSnapshotInput
): Promise<NetWorthSnapshotRow> {
  const { data, error } = await supabase
    .from("net_worth_snapshots")
    .upsert(
      {
        user_id: userId,
        snapshot_date: input.snapshot_date,
        total_assets_minor: input.total_assets_minor,
        total_liabilities_minor: input.total_liabilities_minor,
        net_worth_minor: input.net_worth_minor,
        breakdown: input.breakdown as Json | undefined,
        currency: input.currency,
      },
      { onConflict: "user_id,snapshot_date" }
    )
    .select("*")
    .returns<NetWorthSnapshotRow[]>()
    .single();

  if (error) throw error;
  return data;
}
