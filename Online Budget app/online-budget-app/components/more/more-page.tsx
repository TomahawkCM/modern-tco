"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";
import {
  Repeat,
  CreditCard,
  Wallet,
  Building2,
  TrendingUp,
  Target,
  Umbrella,
  DollarSign,
  ArrowDownCircle,
  FlaskConical,
  CalendarDays,
  BarChart3,
  Lightbulb,
  Calculator,
  SplitSquareVertical,
  ClipboardCheck,
  CalendarCheck,
  Camera,
  Upload,
  Download,
  Settings,
  BookOpen,
  MessageCircle,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface NavItem {
  key: string;
  href: string;
  icon: LucideIcon;
}

interface NavSection {
  sectionKey: string;
  items: NavItem[];
}

/* ------------------------------------------------------------------ */
/*  Navigation structure                                               */
/* ------------------------------------------------------------------ */

const sections: NavSection[] = [
  {
    sectionKey: "financial",
    items: [
      { key: "subscriptions", href: "/subscriptions", icon: Repeat },
      { key: "loans", href: "/loans", icon: CreditCard },
      { key: "investments", href: "/investments", icon: Wallet },
      { key: "properties", href: "/properties", icon: Building2 },
      { key: "netWorth", href: "/net-worth", icon: TrendingUp },
    ],
  },
  {
    sectionKey: "planning",
    items: [
      { key: "futurePlans", href: "/planning/future", icon: Target },
      { key: "retirement", href: "/planning/retirement", icon: Umbrella },
      { key: "paycheck", href: "/planning/paycheck", icon: DollarSign },
      { key: "debtPayoff", href: "/debt-payoff", icon: ArrowDownCircle },
      { key: "scenarios", href: "/scenarios", icon: FlaskConical },
      { key: "events", href: "/events", icon: CalendarDays },
    ],
  },
  {
    sectionKey: "analysis",
    items: [
      { key: "reports", href: "/reports", icon: BarChart3 },
      { key: "insights", href: "/insights", icon: Lightbulb },
      { key: "calculators", href: "/calculators", icon: Calculator },
      { key: "splits", href: "/splits", icon: SplitSquareVertical },
      { key: "review", href: "/review", icon: ClipboardCheck },
      { key: "fridayReview", href: "/friday-review", icon: CalendarCheck },
      { key: "ocr", href: "/ocr", icon: Camera },
    ],
  },
  {
    sectionKey: "tools",
    items: [
      { key: "import", href: "/import", icon: Upload },
      { key: "export", href: "/export", icon: Download },
    ],
  },
  {
    sectionKey: "settings",
    items: [
      { key: "settings", href: "/settings", icon: Settings },
      { key: "merchantRules", href: "/settings", icon: BookOpen },
      { key: "chat", href: "/chat", icon: MessageCircle },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function MorePage() {
  const t = useTranslations("morePage");

  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <div key={section.sectionKey} className="space-y-3">
          <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            {t(`sections.${section.sectionKey}`)}
          </h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {section.items.map((item) => (
              <Link key={item.key} href={item.href}>
                <Card className="transition-colors hover:bg-accent">
                  <CardContent className="flex items-center gap-3 py-3">
                    <item.icon className="size-5 shrink-0 text-muted-foreground" />
                    <span className="text-sm font-medium">{t(`items.${item.key}`)}</span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
