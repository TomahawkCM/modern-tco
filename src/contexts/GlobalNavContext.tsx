"use client";

import React, { createContext, useContext } from "react";

const GlobalNavContext = createContext<boolean>(false);

export function useGlobalNavActive(): boolean {
  return useContext(GlobalNavContext);
}

export function GlobalNavProvider({ children, value = true }: { children: React.ReactNode; value?: boolean }) {
  return <GlobalNavContext.Provider value={value}>{children}</GlobalNavContext.Provider>;
}

