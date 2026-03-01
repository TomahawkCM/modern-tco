"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Home, ChevronRight } from "lucide-react";

const SEGMENT_LABELS: Record<string, string> = {
  dashboard: "dashboard",
  transactions: "transactions",
  budgets: "budgets",
  accounts: "accounts",
  categories: "categories",
  insights: "insights",
  chat: "chat",
  settings: "settings",
  import: "import",
  export: "export",
  calculators: "calculators",
  reports: "reports",
  subscriptions: "subscriptions",
  loans: "loans",
  investments: "investments",
  properties: "properties",
  "net-worth": "netWorth",
  "merchant-rules": "merchantRules",
  more: "more",
  planning: "planning",
};

function isUuid(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}

export function Breadcrumb() {
  const pathname = usePathname();
  const t = useTranslations("breadcrumb");

  if (!pathname || pathname === "/dashboard") return null;

  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return null;

  const crumbs: { label: string; href: string }[] = [
    { label: t("home"), href: "/dashboard" },
  ];

  let currentPath = "";
  for (const segment of segments) {
    currentPath += `/${segment}`;
    const labelKey = SEGMENT_LABELS[segment];
    const label = labelKey
      ? t(labelKey)
      : isUuid(segment)
        ? t("details")
        : segment.charAt(0).toUpperCase() + segment.slice(1);
    crumbs.push({ label, href: currentPath });
  }

  return (
    <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground">
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <span key={crumb.href} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="h-3 w-3" />}
            {i === 0 ? (
              <Link href={crumb.href} className="hover:text-foreground">
                <Home className="h-3.5 w-3.5" />
              </Link>
            ) : isLast ? (
              <span aria-current="page" className="font-medium text-foreground">
                {crumb.label}
              </span>
            ) : (
              <Link href={crumb.href} className="hover:text-foreground">
                {crumb.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
