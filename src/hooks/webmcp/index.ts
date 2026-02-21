/**
 * WebMCPProvider — conditionally registers all budget tools with the browser's
 * WebMCP API. When the feature is disabled or the browser lacks support,
 * this renders only {children} with zero additional bundle cost.
 */

"use client";

import { type ReactNode, useCallback, useEffect, useState, createElement } from "react";
import dynamic from "next/dynamic";
import { useWebMCPEnabled } from "./useWebMCPEnabled";

// Lazy-load the registrar so all tool code is code-split away when disabled
const WebMCPToolsRegistrar = dynamic(
  () => import("./WebMCPToolsRegistrar").then((m) => ({ default: m.WebMCPToolsRegistrar })),
  { ssr: false }
);

export function WebMCPProvider({ children }: { children: ReactNode }) {
  const enabled = useWebMCPEnabled();

  if (!enabled) {
    return createElement("div", { "data-webmcp": "disabled" }, children);
  }

  return createElement(WebMCPToolsRegistrar, null, children);
}
