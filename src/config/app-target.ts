export type AppTarget = "tco" | "budget-offline" | "budget-online";

export const APP_TARGET: AppTarget = (process.env.NEXT_PUBLIC_APP_TARGET as AppTarget) || "tco";

export const isTCO = APP_TARGET === "tco";
export const isBudget = APP_TARGET.startsWith("budget-");
export const isBudgetOffline = APP_TARGET === "budget-offline";
export const isBudgetOnline = APP_TARGET === "budget-online";
