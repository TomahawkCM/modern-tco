/**
 * WebMCP Feature Detection Hook
 *
 * Checks three conditions before enabling WebMCP tools:
 * 1. Running in browser (typeof window !== 'undefined')
 * 2. navigator.modelContext?.registerTool exists (browser supports WebMCP)
 * 3. User has opted in via localStorage key 'budget-webmcp-enabled'
 */

import { useSyncExternalStore } from "react";
import { FEATURES } from "@/config/features";

const STORAGE_KEY = "budget-webmcp-enabled";

function getSnapshot(): boolean {
  if (typeof window === "undefined") return false;

  // Check feature flag (compile-time gate)
  if (!FEATURES.webMCP) return false;

  // Check browser API support
  if (!("modelContext" in navigator)) return false;
  const mc = (navigator as unknown as Record<string, unknown>).modelContext;
  if (!mc || typeof (mc as Record<string, unknown>).registerTool !== "function") return false;

  // Check user opt-in
  return localStorage.getItem(STORAGE_KEY) === "true";
}

function getServerSnapshot(): boolean {
  return false;
}

function subscribe(callback: () => void): () => void {
  // Re-check when localStorage changes (cross-tab sync)
  const handler = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) callback();
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}

export function useWebMCPEnabled(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
