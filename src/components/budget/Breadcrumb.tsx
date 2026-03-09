"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

export interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
  const pathname = usePathname();
  const tAria = useTranslations("aria");
  const tBreadcrumb = useTranslations("breadcrumb");

  // Auto-generate breadcrumbs from pathname if not provided
  const breadcrumbItems = items || generateBreadcrumbs(pathname || "/budget-app", tBreadcrumb);

  return (
    <nav aria-label={tAria("breadcrumb")} className={`mb-4 flex items-center text-sm ${className}`}>
      <ol className="flex items-center space-x-2">
        {/* Home crumb */}
        <li>
          <Link
            href="/budget-app"
            className="flex items-center rounded-sm px-1 text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            aria-label={tAria("home")}
          >
            <Home className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">{tBreadcrumb("home")}</span>
          </Link>
        </li>

        {/* Path crumbs */}
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;

          return (
            <li key={item.href} className="flex items-center">
              <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              {isLast ? (
                <span className="ms-2 font-medium text-foreground" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="ms-2 rounded-sm px-1 text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/**
 * Auto-generate breadcrumbs from pathname
 * Examples:
 *   /budget-app/transactions → [{ label: "Transactions", href: "/budget-app/transactions" }]
 *   /budget-app/loans/123 → [{ label: "Loans", href: "/budget-app/loans" }, { label: "Details", href: "/budget-app/loans/123" }]
 */
function generateBreadcrumbs(pathname: string, t: (key: string) => string): BreadcrumbItem[] {
  const segments = pathname.split("/").filter(Boolean);

  // Remove 'budget-app' prefix
  if (segments[0] === "budget-app") {
    segments.shift();
  }

  // If on home page, return empty
  if (segments.length === 0) {
    return [];
  }

  const breadcrumbs: BreadcrumbItem[] = [];
  let currentPath = "/budget-app";

  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;

    // Format label (capitalize, remove dashes/underscores)
    let label = segment
      .replace(/[-_]/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    // If it's a UUID or number (detail page), use generic "Details"
    if (/^[0-9a-f-]{36}$/.test(segment) || /^\d+$/.test(segment)) {
      label = t("details");
    }

    // Special labels for known routes
    const labelMap: Record<string, string> = {
      ocr: t("ocr"),
      future: t("futurePlans"),
      retirement: t("retirementPlanning"),
      "debt-payoff": t("debtPayoffCalculator"),
      "emergency-fund": t("emergencyFund"),
      "budget-analyzer": t("budgetAnalyzer"),
      "savings-goal": t("savingsGoal"),
      "subscription-cost": t("subscriptionCost"),
      "merchant-rules": t("merchantRules"),
      "net-worth": t("netWorth"),
      new: t("new"),
      edit: t("edit"),
      more: t("more"),
    };

    breadcrumbs.push({
      label: labelMap[segment] || label,
      href: currentPath,
    });
  });

  return breadcrumbs;
}

/**
 * Structured data for breadcrumbs (SEO)
 */
export function getBreadcrumbJsonLd(items: BreadcrumbItem[]): object {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: `${process.env.NEXT_PUBLIC_SITE_URL || ""}${item.href}`,
    })),
  };
}
