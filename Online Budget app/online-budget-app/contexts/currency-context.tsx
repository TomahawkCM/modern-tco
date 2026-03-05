"use client";

import { createContext, useContext, type ReactNode } from "react";

const CurrencyContext = createContext<string>("USD");

export function CurrencyProvider({ value, children }: { value: string; children: ReactNode }) {
  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

/**
 * Returns the user's primary currency from settings.
 * Falls back to "USD" if no provider is found.
 */
export function usePrimaryCurrency(): string {
  return useContext(CurrencyContext);
}
