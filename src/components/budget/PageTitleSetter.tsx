"use client";

/**
 * PageTitleSetter Component
 *
 * Sets document.title based on the current route and user's locale.
 * Since locale is stored client-side (localStorage), static `export const metadata`
 * in server components can't be i18n'd. This component handles client-side title
 * translation while keeping server metadata as the English default for SEO.
 */

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

/** Map path segments to pageMetadata translation keys */
const ROUTE_TITLE_MAP: Record<string, string> = {
  "/budget-app": "dashboard",
  "/budget-app/scenarios": "scenarios",
  "/budget-app/settings/merchant-rules": "merchantRules",
  "/budget-app/more": "more",
  "/budget-app/net-worth": "netWorth",
  "/budget-app/properties": "properties",
  "/budget-app/review": "review",
  "/budget-app/events": "events",
  "/budget-app/transactions": "transactions",
  "/budget-app/import": "import",
  "/budget-app/accounts": "accounts",
  "/budget-app/budgets": "budgets",
  "/budget-app/categories": "categories",
  "/budget-app/reports": "reports",
  "/budget-app/settings": "settings",
  "/budget-app/subscriptions": "subscriptions",
  "/budget-app/investments": "investments",
  "/budget-app/debt-payoff": "debtPayoff",
  "/budget-app/loans": "loans",
  "/budget-app/calculators": "calculators",
  "/budget-app/planning": "planning",
  "/budget-app/ocr": "ocr",
  "/budget-app/export": "export",
  "/budget-app/friday-review": "fridayReview",
  "/budget-app/onboarding": "onboarding",
  "/budget-app/offline": "offline",
  "/budget-app/splits": "splits",
};

export function PageTitleSetter() {
  const pathname = usePathname();
  const t = useTranslations("pageMetadata");

  useEffect(() => {
    if (!pathname) return;

    // Landing pages use their own title format
    if (pathname.startsWith("/budget-app/landing")) {
      document.title = t("landing");
      return;
    }

    // Property detail pages
    if (/^\/budget-app\/properties\/[^/]+$/.test(pathname)) {
      document.title = `${t("propertyDetail")} | ${t("appName")}`;
      return;
    }

    // Try exact match first, then progressively shorter paths
    const segments = pathname.split("/").filter(Boolean);
    let titleKey: string | undefined;

    for (let i = segments.length; i >= 1; i--) {
      const tryPath = `/${segments.slice(0, i).join("/")}`;

      if (ROUTE_TITLE_MAP[tryPath]) {
        titleKey = ROUTE_TITLE_MAP[tryPath];
        break;
      }
    }

    if (titleKey) {
      document.title = `${t(titleKey)} | ${t("appName")}`;
    }
  }, [pathname, t]);

  return null;
}
