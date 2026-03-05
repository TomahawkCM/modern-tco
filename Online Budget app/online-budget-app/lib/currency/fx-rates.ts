/**
 * FX Rate Service — fetches & caches exchange rates via frankfurter.app
 *
 * Uses Supabase fx_rates table as a 24h cache layer.
 * Falls back to direct API call on cache miss.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

const FRANKFURTER_BASE = "https://api.frankfurter.app/latest";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface FxRates {
  base: string;
  rates: Record<string, number>;
  fetchedAt: Date;
}

/**
 * Get exchange rates from base currency to target currencies.
 * Checks Supabase cache first; fetches from frankfurter.app on miss.
 */
export async function getRates(
  base: string,
  targets: string[],
  supabase?: SupabaseClient
): Promise<FxRates> {
  if (targets.length === 0) {
    return { base, rates: {}, fetchedAt: new Date() };
  }

  // Filter out same-currency targets
  const needed = targets.filter((t) => t !== base);
  if (needed.length === 0) {
    return { base, rates: {}, fetchedAt: new Date() };
  }

  // Try cache first
  if (supabase) {
    const cached = await getCachedRates(supabase, base, needed);
    if (cached) return cached;
  }

  // Fetch from API
  const rates = await fetchFrankfurterRates(base, needed);

  // Cache results
  if (supabase) {
    await cacheRates(supabase, base, rates.rates);
  }

  return rates;
}

/**
 * Convert a major-unit amount between currencies using a rate.
 */
export function convertAmount(amount: number, rate: number): number {
  return amount * rate;
}

async function getCachedRates(
  supabase: SupabaseClient,
  base: string,
  targets: string[]
): Promise<FxRates | null> {
  const cutoff = new Date(Date.now() - CACHE_TTL_MS).toISOString();

  const { data, error } = await supabase
    .from("fx_rates")
    .select("target_currency, rate, fetched_at")
    .eq("base_currency", base)
    .in("target_currency", targets)
    .gte("fetched_at", cutoff);

  if (error || !data || data.length < targets.length) {
    return null; // Cache miss — not all targets cached or stale
  }

  const rates: Record<string, number> = {};
  let oldestFetch = new Date();

  for (const row of data) {
    rates[row.target_currency] = Number(row.rate);
    const fetchedAt = new Date(row.fetched_at);
    if (fetchedAt < oldestFetch) oldestFetch = fetchedAt;
  }

  return { base, rates, fetchedAt: oldestFetch };
}

async function fetchFrankfurterRates(base: string, targets: string[]): Promise<FxRates> {
  const url = `${FRANKFURTER_BASE}?from=${encodeURIComponent(base)}&to=${encodeURIComponent(targets.join(","))}`;

  const res = await fetch(url, { next: { revalidate: 3600 } });

  if (!res.ok) {
    throw new Error(`FX rate fetch failed: ${res.status} ${res.statusText}`);
  }

  const json = (await res.json()) as {
    base: string;
    rates: Record<string, number>;
    date: string;
  };

  return {
    base: json.base,
    rates: json.rates,
    fetchedAt: new Date(),
  };
}

async function cacheRates(
  supabase: SupabaseClient,
  base: string,
  rates: Record<string, number>
): Promise<void> {
  const rows = Object.entries(rates).map(([target, rate]) => ({
    base_currency: base,
    target_currency: target,
    rate,
    fetched_at: new Date().toISOString(),
  }));

  // Upsert (base_currency, target_currency is UNIQUE)
  await supabase.from("fx_rates").upsert(rows, { onConflict: "base_currency,target_currency" });
}
