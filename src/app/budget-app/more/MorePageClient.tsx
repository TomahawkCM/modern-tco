"use client";

import { cn } from "@/lib/utils";
import {
  BarChart3,
  Bell,
  Building2,
  Calculator,
  Camera,
  CreditCard,
  FlaskConical,
  PartyPopper,
  PieChart,
  Repeat,
  Settings,
  Tags,
  Target,
  TrendingUp,
  Upload,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

interface MoreLink {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  labelKey: string;
}

const groups: { titleKey: string; links: MoreLink[] }[] = [
  {
    titleKey: "trackingAnalysis",
    links: [
      { href: "/budget-app/ocr", icon: Camera, labelKey: "scanReceipt" },
      { href: "/budget-app/categories", icon: Tags, labelKey: "categories" },
      { href: "/budget-app/subscriptions", icon: Repeat, labelKey: "subscriptions" },
      { href: "/budget-app/settings?tab=notifications", icon: Bell, labelKey: "reminders" },
      { href: "/budget-app/reports", icon: BarChart3, labelKey: "reports" },
      { href: "/budget-app/net-worth", icon: TrendingUp, labelKey: "netWorth" },
    ],
  },
  {
    titleKey: "wealthPlanning",
    links: [
      { href: "/budget-app/loans", icon: CreditCard, labelKey: "loans" },
      { href: "/budget-app/investments", icon: Wallet, labelKey: "investments" },
      { href: "/budget-app/planning/future", icon: Target, labelKey: "futurePlans" },
      { href: "/budget-app/planning/retirement", icon: TrendingUp, labelKey: "retirement" },
      { href: "/budget-app/properties", icon: Building2, labelKey: "properties" },
      { href: "/budget-app/events", icon: PartyPopper, labelKey: "events" },
      { href: "/budget-app/scenarios", icon: FlaskConical, labelKey: "scenarios" },
    ],
  },
  {
    titleKey: "toolsSettings",
    links: [
      { href: "/budget-app/calculators", icon: Calculator, labelKey: "calculators" },
      { href: "/budget-app/budgets", icon: PieChart, labelKey: "budgets" },
      { href: "/budget-app/import", icon: Upload, labelKey: "import" },
      { href: "/budget-app/settings", icon: Settings, labelKey: "settings" },
    ],
  },
];

export function MorePageClient() {
  const t = useTranslations("morePage");
  const tNav = useTranslations("sidebar.navigation");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">{t("title")}</h1>

      {groups.map((group) => (
        <section key={group.titleKey} className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            {t(`groups.${group.titleKey}`)}
          </h2>
          <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
            {group.links.map((link, i) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex min-h-touch-comfortable items-center gap-3 px-4 text-slate-200 transition-colors hover:bg-white/10",
                    i !== group.links.length - 1 && "border-b border-white/5"
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0 text-teal-400" />
                  <span className="text-sm font-medium">{tNav(link.labelKey)}</span>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
