/**
 * EmptyState Component
 * Reusable empty state with icon, heading, description, and CTAs
 * Based on dashboard welcome screen pattern
 *
 * Features:
 * - Customizable icon from Lucide React
 * - Clear heading and description text
 * - Primary and secondary CTA buttons
 * - Consistent styling with Budget App design
 * - WCAG 2.2 AA compliant (48px touch targets)
 */

"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

interface CTAButton {
  label: string;
  href: string;
  icon?: LucideIcon;
  variant?: "primary" | "secondary";
}

interface EmptyStateProps {
  icon: LucideIcon;
  heading: string;
  description: string;
  primaryCTA?: CTAButton;
  secondaryCTA?: CTAButton;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  heading,
  description,
  primaryCTA,
  secondaryCTA,
  className = "",
}: EmptyStateProps) {
  return (
    <div className={`py-20 text-center ${className}`}>
      <div className="mx-auto max-w-md">
        {/* Icon */}
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-teal-500 shadow-lg">
          <Icon className="h-12 w-12 text-white" aria-hidden="true" />
        </div>

        {/* Heading */}
        <h2 className="mt-8 text-3xl font-bold text-gray-900">{heading}</h2>

        {/* Description */}
        <p className="mx-auto mt-4 max-w-lg text-lg text-gray-600">{description}</p>

        {/* CTA Buttons */}
        {(primaryCTA || secondaryCTA) && (
          <div className="mt-12 flex flex-col justify-center gap-4 sm:flex-row">
            {primaryCTA && (
              <Link
                href={primaryCTA.href}
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-lg bg-teal-700 px-6 py-2 text-white shadow-md transition-all hover:bg-teal-800 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-teal-700 focus:ring-offset-2"
              >
                {primaryCTA.icon && <primaryCTA.icon className="h-5 w-5" aria-hidden="true" />}
                {primaryCTA.label}
              </Link>
            )}

            {secondaryCTA && (
              <Link
                href={secondaryCTA.href}
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-lg border-2 border-gray-300 px-6 py-2 text-gray-700 transition-all hover:border-gray-400 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              >
                {secondaryCTA.icon && <secondaryCTA.icon className="h-5 w-5" aria-hidden="true" />}
                {secondaryCTA.label}
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Section-specific empty states with predefined messaging
 * Use these for common Budget App sections
 */

import {
  Receipt,
  PieChart,
  CreditCard,
  Wallet,
  Target,
  TrendingUp,
  BarChart3,
  Tags,
  PiggyBank,
} from "lucide-react";

// Wrapper components for section-specific empty states with translations
function TransactionsEmptyState({ onAddClick }: { onAddClick?: () => void }) {
  const t = useTranslations("emptyStates.transactions");
  return (
    <EmptyState
      icon={Receipt}
      heading={t("heading")}
      description={t("description")}
      primaryCTA={{
        label: t("primaryCta"),
        href: "/budget-app/transactions",
        icon: Receipt,
      }}
      secondaryCTA={{
        label: t("secondaryCta"),
        href: "/budget-app/import",
      }}
    />
  );
}

function BudgetsEmptyState() {
  const t = useTranslations("emptyStates.budgets");
  return (
    <EmptyState
      icon={PieChart}
      heading={t("heading")}
      description={t("description")}
      primaryCTA={{
        label: t("primaryCta"),
        href: "/budget-app/budgets",
        icon: PieChart,
      }}
    />
  );
}

function LoansEmptyState() {
  const t = useTranslations("emptyStates.loans");
  return (
    <EmptyState
      icon={CreditCard}
      heading={t("heading")}
      description={t("description")}
      primaryCTA={{
        label: t("primaryCta"),
        href: "/budget-app/loans/new",
        icon: CreditCard,
      }}
    />
  );
}

function InvestmentsEmptyState() {
  const t = useTranslations("emptyStates.investments");
  return (
    <EmptyState
      icon={Wallet}
      heading={t("heading")}
      description={t("description")}
      primaryCTA={{
        label: t("primaryCta"),
        href: "/budget-app/investments",
        icon: Wallet,
      }}
    />
  );
}

function FuturePlansEmptyState() {
  const t = useTranslations("emptyStates.futurePlans");
  return (
    <EmptyState
      icon={Target}
      heading={t("heading")}
      description={t("description")}
      primaryCTA={{
        label: t("primaryCta"),
        href: "/budget-app/planning/future",
        icon: Target,
      }}
    />
  );
}

function RetirementEmptyState() {
  const t = useTranslations("emptyStates.retirement");
  return (
    <EmptyState
      icon={TrendingUp}
      heading={t("heading")}
      description={t("description")}
      primaryCTA={{
        label: t("primaryCta"),
        href: "/budget-app/planning/retirement",
        icon: TrendingUp,
      }}
    />
  );
}

function ReportsEmptyState() {
  const t = useTranslations("emptyStates.reports");
  return (
    <EmptyState
      icon={BarChart3}
      heading={t("heading")}
      description={t("description")}
      primaryCTA={{
        label: t("primaryCta"),
        href: "/budget-app/transactions",
        icon: Receipt,
      }}
      secondaryCTA={{
        label: t("secondaryCta"),
        href: "/budget-app/import",
      }}
    />
  );
}

function CategoriesEmptyState() {
  const t = useTranslations("emptyStates.categories");
  return (
    <EmptyState
      icon={Tags}
      heading={t("heading")}
      description={t("description")}
      primaryCTA={{
        label: t("primaryCta"),
        href: "/budget-app/categories",
        icon: Tags,
      }}
    />
  );
}

function DashboardEmptyState() {
  const t = useTranslations("emptyStates.dashboard");
  return (
    <EmptyState
      icon={PiggyBank}
      heading={t("heading")}
      description={t("description")}
      primaryCTA={{
        label: t("primaryCta"),
        href: "/budget-app/import",
      }}
      secondaryCTA={{
        label: t("secondaryCta"),
        href: "/budget-app/transactions",
      }}
    />
  );
}

export const EmptyStates = {
  Transactions: TransactionsEmptyState,
  Budgets: BudgetsEmptyState,
  Loans: LoansEmptyState,
  Investments: InvestmentsEmptyState,
  FuturePlans: FuturePlansEmptyState,
  Retirement: RetirementEmptyState,
  Reports: ReportsEmptyState,
  Categories: CategoriesEmptyState,
  Dashboard: DashboardEmptyState,
};
