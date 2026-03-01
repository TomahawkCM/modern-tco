"use client";

/**
 * Financial Calculators Hub
 *
 * Central page for accessing all financial calculators.
 * Organized into three sections: Core, Financial Planning, and Tools.
 */

import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  BarChart3,
  Building2,
  CircleDollarSign,
  CreditCard,
  Dice1,
  FileText,
  Flame,
  Home,
  Landmark,
  PieChart,
  Repeat,
  Shield,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

interface CalculatorItem {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
}

function CalculatorCard({ title, description, href, icon }: CalculatorItem) {
  return (
    <Link href={href} className="group">
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardHeader>
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground group-hover:text-primary transition-colors">
              {icon}
            </span>
            <CardTitle className="text-base">{title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription>{description}</CardDescription>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function CalculatorsPage() {
  const t = useTranslations("calculators");

  const coreCalculators: CalculatorItem[] = [
    {
      id: "retirement",
      title: t("retirement.title"),
      description: t("retirement.description"),
      href: "/calculators/retirement",
      icon: <TrendingUp className="h-6 w-6" />,
    },
    {
      id: "compound-interest",
      title: t("compoundInterest.title"),
      description: t("compoundInterest.description"),
      href: "/calculators/compound-interest",
      icon: <CircleDollarSign className="h-6 w-6" />,
    },
    {
      id: "mortgage",
      title: t("mortgage.title"),
      description: t("mortgage.description"),
      href: "/calculators/mortgage",
      icon: <Home className="h-6 w-6" />,
    },
    {
      id: "savings-goal",
      title: t("savingsGoal.title"),
      description: t("savingsGoal.description"),
      href: "/calculators/savings-goal",
      icon: <Target className="h-6 w-6" />,
    },
    {
      id: "debt-payoff",
      title: t("debtPayoff.title"),
      description: t("debtPayoff.description"),
      href: "/calculators/debt-payoff",
      icon: <CreditCard className="h-6 w-6" />,
    },
    {
      id: "emergency-fund",
      title: t("emergencyFund.title"),
      description: t("emergencyFund.description"),
      href: "/calculators/emergency-fund",
      icon: <Shield className="h-6 w-6" />,
    },
  ];

  const planningCalculators: CalculatorItem[] = [
    {
      id: "fire",
      title: t("fire.title"),
      description: t("fire.description"),
      href: "/calculators/fire",
      icon: <Flame className="h-6 w-6" />,
    },
    {
      id: "tax-estimator",
      title: t("taxEstimator.title"),
      description: t("taxEstimator.description"),
      href: "/calculators/tax-estimator",
      icon: <FileText className="h-6 w-6" />,
    },
    {
      id: "net-worth-forecast",
      title: t("netWorthForecast.title"),
      description: t("netWorthForecast.description"),
      href: "/calculators/net-worth-forecast",
      icon: <BarChart3 className="h-6 w-6" />,
    },
    {
      id: "inflation",
      title: t("inflation.title"),
      description: t("inflation.description"),
      href: "/calculators/inflation",
      icon: <TrendingDown className="h-6 w-6" />,
    },
    {
      id: "subscription-cost",
      title: t("subscriptionCost.title"),
      description: t("subscriptionCost.description"),
      href: "/calculators/subscription-cost",
      icon: <Repeat className="h-6 w-6" />,
    },
    {
      id: "monte-carlo",
      title: t("monteCarlo.title"),
      description: t("monteCarlo.description"),
      href: "/calculators/monte-carlo",
      icon: <Dice1 className="h-6 w-6" />,
    },
    {
      id: "budget-analyzer",
      title: t("budgetAnalyzer.title"),
      description: t("budgetAnalyzer.description"),
      href: "/calculators/budget-analyzer",
      icon: <PieChart className="h-6 w-6" />,
    },
  ];

  const toolLinks: CalculatorItem[] = [
    {
      id: "loan-tracker",
      title: t("loanTracker.title"),
      description: t("loanTracker.description"),
      href: "/loans",
      icon: <Landmark className="h-6 w-6" />,
    },
    {
      id: "net-worth",
      title: t("netWorth.title"),
      description: t("netWorth.description"),
      href: "/reports",
      icon: <TrendingUp className="h-6 w-6" />,
    },
    {
      id: "property",
      title: t("property.title"),
      description: t("property.description"),
      href: "/assets",
      icon: <Building2 className="h-6 w-6" />,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">{t("hub.title")}</h1>
        <p className="mt-2 text-muted-foreground">{t("hub.subtitle")}</p>
      </div>

      {/* Core Calculators */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          {t("hub.sectionCore")}
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {coreCalculators.map((calc) => (
            <CalculatorCard key={calc.id} {...calc} />
          ))}
        </div>
      </section>

      {/* Financial Planning */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          {t("hub.sectionPlanning")}
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {planningCalculators.map((calc) => (
            <CalculatorCard key={calc.id} {...calc} />
          ))}
        </div>
      </section>

      {/* Tools & Links */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          {t("hub.sectionTools")}
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {toolLinks.map((calc) => (
            <CalculatorCard key={calc.id} {...calc} />
          ))}
        </div>
      </section>

      {/* Info Section */}
      <Card>
        <CardHeader>
          <CardTitle>{t("hub.infoTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-primary">
                {t("hub.privacyTitle")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("hub.privacyDescription")}
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-primary">
                {t("hub.accuracyTitle")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("hub.accuracyDescription")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
