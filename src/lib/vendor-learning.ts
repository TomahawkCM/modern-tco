/**
 * Vendor Learning Utilities
 *
 * Learns a mapping from normalized vendor name -> preferred category/subcategory
 * so that future transactions from the same vendor are auto-categorized.
 *
 * Storage: localStorage (client-side only, no sync)
 */

import { extractVendorName } from "@/lib/vendor-matcher";

const STORAGE_KEY = "budget-app-vendor-categories";

export interface VendorCategory {
  category: string;
  subcategory: string | null;
  updatedAt: number;
  corrections: number;
}

type VendorCategoryMap = Record<string, VendorCategory>;

function loadVendorMap(): VendorCategoryMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as VendorCategoryMap;
  } catch {
    return {};
  }
}

function saveVendorMap(map: VendorCategoryMap): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // Ignore storage failures – categorization will still work via rules
  }
}

/**
 * Learn a category for a vendor based on a user correction.
 *
 * IMPORTANT: We only learn for reasonably specific vendor names
 * (length >= 5 and not obviously generic like "ONLINE PURCHASE").
 */
export function learnVendorCategory(
  description: string,
  category: string,
  subcategory: string | null
): void {
  if (typeof window === "undefined") return;

  const vendor = extractVendorName(description).trim();
  if (!vendor || vendor.length < 5) return;

  const genericVendors = ["ONLINE PURCHASE", "PURCHASE", "PAYMENT", "TRANSFER"];
  if (genericVendors.includes(vendor.toUpperCase())) return;

  const map = loadVendorMap();
  const existing = map[vendor];

  map[vendor] = {
    category,
    subcategory,
    updatedAt: Date.now(),
    corrections: (existing?.corrections ?? 0) + 1,
  };

  saveVendorMap(map);
}

/**
 * Get a learned category for the given description, if any.
 */
export function getVendorLearnedCategory(description: string): VendorCategory | null {
  if (typeof window === "undefined") return null;

  const vendor = extractVendorName(description).trim();
  if (!vendor) return null;

  const map = loadVendorMap();
  return map[vendor] ?? null;
}
