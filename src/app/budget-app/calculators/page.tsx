"use client";

/**
 * Financial Calculators Hub
 *
 * Central page for accessing all financial calculators.
 * Organized into three sections: Core, Financial Planning, and Tools.
 */

import { useTranslations } from "next-intl";
import {
  Shield,
  TrendingDown,
  Target,
  Repeat,
  PieChart,
  TrendingUp,
  Home,
  Landmark,
  CreditCard,
  BarChart3,
  Building2,
} from "lucide-react";
import { CalculatorCard } from "@/components/budget/calculators";

export default function CalculatorsPage() {
  const t = useTranslations("calculators");

  const coreCalculators = [
    {
      id: "retirement",
      title: t("retirement.title"),
      description: t("retirement.description"),
      href: "/budget-app/calculators/retirement",
      icon: <Landmark className="h-6 w-6" />,
      color: "teal" as const,
    },
    {
      id: "compound-interest",
      title: t("compoundInterest.title"),
      description: t("compoundInterest.description"),
      href: "/budget-app/calculators/compound-interest",
      icon: <TrendingUp className="h-6 w-6" />,
      color: "indigo" as const,
    },
    {
      id: "mortgage",
      title: t("mortgage.title"),
      description: t("mortgage.description"),
      href: "/budget-app/calculators/mortgage",
      icon: <Home className="h-6 w-6" />,
      color: "amber" as const,
    },
    {
      id: "savings-goal",
      title: t("savingsGoal.title"),
      description: t("savingsGoal.description"),
      href: "/budget-app/calculators/savings-goal",
      icon: <Target className="h-6 w-6" />,
      color: "blue" as const,
    },
    {
      id: "debt-payoff",
      title: t("debtPayoff.title"),
      description: t("debtPayoff.description"),
      href: "/budget-app/calculators/debt-payoff",
      icon: <TrendingDown className="h-6 w-6" />,
      color: "orange" as const,
    },
    {
      id: "emergency-fund",
      title: t("emergencyFund.title"),
      description: t("emergencyFund.description"),
      href: "/budget-app/calculators/emergency-fund",
      icon: <Shield className="h-6 w-6" />,
      color: "green" as const,
    },
  ];

  const planningCalculators = [
    {
      id: "inflation",
      title: t("inflation.title"),
      description: t("inflation.description"),
      href: "/budget-app/calculators/inflation",
      icon: <TrendingDown className="h-6 w-6" />,
      color: "rose" as const,
    },
    {
      id: "subscription-cost",
      title: t("subscriptionCost.title"),
      description: t("subscriptionCost.description"),
      href: "/budget-app/calculators/subscription-cost",
      icon: <Repeat className="h-6 w-6" />,
      color: "purple" as const,
    },
    {
      id: "budget-analyzer",
      title: t("budgetAnalyzer.title"),
      description: t("budgetAnalyzer.description"),
      href: "/budget-app/calculators/budget-analyzer",
      icon: <PieChart className="h-6 w-6" />,
      color: "green" as const,
    },
  ];

  const toolLinks = [
    {
      id: "loan-tracker",
      title: t("loanTracker.title"),
      description: t("loanTracker.description"),
      href: "/budget-app/loans",
      icon: <CreditCard className="h-6 w-6" />,
      color: "slate" as const,
    },
    {
      id: "net-worth",
      title: t("netWorth.title"),
      description: t("netWorth.description"),
      href: "/budget-app/reports",
      icon: <BarChart3 className="h-6 w-6" />,
      color: "slate" as const,
    },
    {
      id: "property",
      title: t("property.title"),
      description: t("property.description"),
      href: "/budget-app/assets",
      icon: <Building2 className="h-6 w-6" />,
      color: "slate" as const,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">{t("hub.title")}</h1>
        <p className="mt-2 text-slate-400">{t("hub.subtitle")}</p>
      </div>

      {/* Core Calculators */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-300">{t("hub.sectionCore")}</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {coreCalculators.map((calc) => (
            <CalculatorCard
              key={calc.id}
              title={calc.title}
              description={calc.description}
              href={calc.href}
              icon={calc.icon}
              color={calc.color}
            />
          ))}
        </div>
      </section>

      {/* Financial Planning */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-300">{t("hub.sectionPlanning")}</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {planningCalculators.map((calc) => (
            <CalculatorCard
              key={calc.id}
              title={calc.title}
              description={calc.description}
              href={calc.href}
              icon={calc.icon}
              color={calc.color}
            />
          ))}
        </div>
      </section>

      {/* Tools & Links */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-300">{t("hub.sectionTools")}</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {toolLinks.map((calc) => (
            <CalculatorCard
              key={calc.id}
              title={calc.title}
              description={calc.description}
              href={calc.href}
              icon={calc.icon}
              color={calc.color}
            />
          ))}
        </div>
      </section>

      {/* Info Section */}
      <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">{t("hub.infoTitle")}</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-teal-400">{t("hub.privacyTitle")}</h3>
            <p className="text-sm text-slate-400">{t("hub.privacyDescription")}</p>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-teal-400">{t("hub.accuracyTitle")}</h3>
            <p className="text-sm text-slate-400">{t("hub.accuracyDescription")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
