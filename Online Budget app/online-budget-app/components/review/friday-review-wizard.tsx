"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowRightIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  WalletIcon,
  CalendarIcon,
  TargetIcon,
  BarChart3Icon,
  SparklesIcon,
} from "lucide-react";
import type { MinorAmount } from "@/engine";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface TransactionRow {
  id: string;
  merchant_name?: string | null;
  amount_minor: number;
  currency: string;
  transaction_date: string;
  description?: string | null;
  category_id?: string | null;
}

interface BudgetRow {
  id: string;
  category_id: string;
  amount_minor: number;
  currency: string;
}

interface CategoryRow {
  id: string;
  key: string;
  type: "income" | "expense" | "transfer";
}

interface SubscriptionRow {
  id: string;
  merchant_name: string;
  amount_minor: number;
  currency: string;
  next_billing_date: string | null;
}

interface FridayReviewWizardProps {
  thisWeekTransactions: TransactionRow[];
  lastWeekTransactions: TransactionRow[];
  budgets: BudgetRow[];
  categories: CategoryRow[];
  upcomingSubscriptions: SubscriptionRow[];
  currency: string;
  formatAmount: (amt: MinorAmount) => string;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const STEPS = [
  "welcome",
  "spending",
  "categories",
  "budget",
  "upcoming",
  "goals",
  "summary",
] as const;

type Step = (typeof STEPS)[number];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function FridayReviewWizard({
  thisWeekTransactions,
  lastWeekTransactions,
  budgets,
  categories,
  upcomingSubscriptions,
  currency,
  formatAmount,
}: FridayReviewWizardProps) {
  const t = useTranslations("weeklyRecap");
  const tc = useTranslations("common");
  const tTx = useTranslations("transactions.table");

  const [currentStep, setCurrentStep] = useState(0);
  const [started, setStarted] = useState(false);

  const step: Step = STEPS[currentStep] ?? "welcome";

  /* ---- Category name lookup ---- */

  const categoryMap = useMemo(() => {
    return new Map(categories.map((c) => [c.id, c.key]));
  }, [categories]);

  /* ---- Computed stats ---- */

  const weekStats = useMemo(() => {
    // Spending = sum of negative amounts (expense transactions)
    const thisWeekSpending = thisWeekTransactions
      .filter((tx) => tx.amount_minor < 0)
      .reduce((s, tx) => s + Math.abs(tx.amount_minor), 0);

    const lastWeekSpending = lastWeekTransactions
      .filter((tx) => tx.amount_minor < 0)
      .reduce((s, tx) => s + Math.abs(tx.amount_minor), 0);

    const spendingDiff =
      lastWeekSpending > 0 ? ((thisWeekSpending - lastWeekSpending) / lastWeekSpending) * 100 : 0;

    const transactionCount = thisWeekTransactions.length;
    const dailyAverage = transactionCount > 0 ? thisWeekSpending / 7 : 0;

    // Category breakdown
    const byCat = new Map<string, number>();
    for (const tx of thisWeekTransactions) {
      if (tx.amount_minor >= 0) continue; // only expenses
      const catId = tx.category_id ?? "uncategorized";
      const current = byCat.get(catId) ?? 0;
      byCat.set(catId, current + Math.abs(tx.amount_minor));
    }

    const categoryBreakdown = Array.from(byCat.entries())
      .map(([catId, total]) => ({
        categoryId: catId,
        categoryName:
          catId === "uncategorized" ? tTx("uncategorized") : (categoryMap.get(catId) ?? catId),
        total,
      }))
      .sort((a, b) => b.total - a.total);

    const topCategory = categoryBreakdown[0] ?? null;

    // Budget progress
    const budgetProgress = budgets.map((b) => {
      const spent = thisWeekTransactions
        .filter((tx) => tx.category_id === b.category_id && tx.amount_minor < 0)
        .reduce((s, tx) => s + Math.abs(tx.amount_minor), 0);
      // Note: this is weekly spending vs monthly budget, a partial view
      const percent = b.amount_minor > 0 ? Math.min(100, (spent / b.amount_minor) * 100) : 0;
      return {
        categoryId: b.category_id,
        categoryName: categoryMap.get(b.category_id) ?? b.category_id,
        limit: b.amount_minor,
        spent,
        percent,
      };
    });

    return {
      thisWeekSpending,
      lastWeekSpending,
      spendingDiff,
      transactionCount,
      dailyAverage,
      categoryBreakdown,
      topCategory,
      budgetProgress,
    };
  }, [thisWeekTransactions, lastWeekTransactions, budgets, categoryMap]);

  /* ---- Navigation ---- */

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((s) => s + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  };

  /* ---- Welcome screen (before starting) ---- */

  if (!started) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <SparklesIcon className="mx-auto mb-4 size-12 text-primary" />
          <h2 className="text-xl font-semibold">{t("steps.welcome")}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{t("steps.welcomeDescription")}</p>
          <Button className="mt-6" onClick={() => setStarted(true)}>
            {t("actions.startReview")}
            <ArrowRightIcon />
          </Button>
        </CardContent>
      </Card>
    );
  }

  /* ---- Step progress indicator ---- */

  const progressPercent = ((currentStep + 1) / STEPS.length) * 100;

  /* ---- Render current step ---- */

  const renderStep = () => {
    switch (step) {
      case "welcome":
        return (
          <div className="space-y-4 text-center">
            <SparklesIcon className="mx-auto size-10 text-primary" />
            <h2 className="text-xl font-semibold">{t("steps.welcome")}</h2>
            <p className="text-sm text-muted-foreground">{t("steps.welcomeDescription")}</p>
          </div>
        );

      case "spending":
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">{t("steps.spending")}</h2>
            <p className="text-sm text-muted-foreground">{t("steps.spendingDescription")}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Card>
                <CardContent className="flex items-center gap-3 py-4">
                  <WalletIcon className="size-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">{t("stats.weeklySpending")}</p>
                    <p className="text-2xl font-bold">
                      {formatAmount({ amountMinor: weekStats.thisWeekSpending, currency })}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-3 py-4">
                  {weekStats.spendingDiff <= 0 ? (
                    <TrendingDownIcon className="size-5 text-emerald-500" />
                  ) : (
                    <TrendingUpIcon className="size-5 text-rose-500" />
                  )}
                  <div>
                    <p className="text-xs text-muted-foreground">{t("stats.vsLastWeek")}</p>
                    <p className="text-2xl font-bold">
                      {weekStats.spendingDiff > 0 ? "+" : ""}
                      {weekStats.spendingDiff.toFixed(1)}%
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-3 py-4">
                  <BarChart3Icon className="size-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">{t("stats.transactionCount")}</p>
                    <p className="text-2xl font-bold">{weekStats.transactionCount}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-3 py-4">
                  <CalendarIcon className="size-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">{t("stats.dailyAverage")}</p>
                    <p className="text-2xl font-bold">
                      {formatAmount({ amountMinor: Math.round(weekStats.dailyAverage), currency })}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case "categories":
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">{t("steps.categories")}</h2>
            <p className="text-sm text-muted-foreground">{t("steps.categoriesDescription")}</p>
            {weekStats.topCategory && (
              <Card>
                <CardContent className="flex items-center gap-3 py-4">
                  <TargetIcon className="size-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">{t("stats.topCategory")}</p>
                    <p className="text-lg font-bold">{weekStats.topCategory.categoryName}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatAmount({ amountMinor: weekStats.topCategory.total, currency })}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
            <div className="space-y-2">
              {weekStats.categoryBreakdown.map((cat) => {
                const maxAmount = weekStats.categoryBreakdown[0]?.total ?? 1;
                const barPercent = (cat.total / maxAmount) * 100;
                return (
                  <div key={cat.categoryId} className="flex items-center gap-3">
                    <span className="w-28 truncate text-sm">{cat.categoryName}</span>
                    <div className="flex-1">
                      <Progress value={barPercent} className="h-2" />
                    </div>
                    <span className="text-sm font-medium">
                      {formatAmount({ amountMinor: cat.total, currency })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case "budget":
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">{t("steps.budget")}</h2>
            <p className="text-sm text-muted-foreground">{t("steps.budgetDescription")}</p>
            {weekStats.budgetProgress.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-sm text-muted-foreground">{tc("noResults")}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {weekStats.budgetProgress.map((bp) => (
                  <Card key={bp.categoryId}>
                    <CardContent className="py-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{bp.categoryName}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatAmount({ amountMinor: bp.spent, currency })} /{" "}
                          {formatAmount({ amountMinor: bp.limit, currency })}
                        </span>
                      </div>
                      <Progress
                        value={bp.percent}
                        className={`mt-2 h-2 ${bp.percent >= 90 ? "[&>div]:bg-rose-500" : ""}`}
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );

      case "upcoming":
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">{t("steps.upcoming")}</h2>
            <p className="text-sm text-muted-foreground">{t("steps.upcomingDescription")}</p>
            {upcomingSubscriptions.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <CheckCircleIcon className="mx-auto mb-2 size-8 text-emerald-500" />
                  <p className="text-sm text-muted-foreground">{tc("noResults")}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {upcomingSubscriptions.map((sub) => (
                  <Card key={sub.id}>
                    <CardContent className="flex items-center justify-between py-3">
                      <div>
                        <p className="font-medium">{sub.merchant_name}</p>
                        <p className="text-xs text-muted-foreground">{sub.next_billing_date}</p>
                      </div>
                      <span className="font-medium">
                        {formatAmount({
                          amountMinor: sub.amount_minor,
                          currency: sub.currency || currency,
                        })}
                      </span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );

      case "goals":
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">{t("steps.goals")}</h2>
            <p className="text-sm text-muted-foreground">{t("steps.goalsDescription")}</p>
            <Card>
              <CardContent className="py-8 text-center">
                <TargetIcon className="mx-auto mb-2 size-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">{tc("noResults")}</p>
              </CardContent>
            </Card>
          </div>
        );

      case "summary":
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">{t("steps.summary")}</h2>
            <p className="text-sm text-muted-foreground">{t("steps.summaryDescription")}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Card>
                <CardContent className="py-4 text-center">
                  <p className="text-xs text-muted-foreground">{t("stats.weeklySpending")}</p>
                  <p className="text-2xl font-bold">
                    {formatAmount({ amountMinor: weekStats.thisWeekSpending, currency })}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="py-4 text-center">
                  <p className="text-xs text-muted-foreground">{t("stats.vsLastWeek")}</p>
                  <p
                    className={`text-2xl font-bold ${
                      weekStats.spendingDiff <= 0 ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {weekStats.spendingDiff > 0 ? "+" : ""}
                    {weekStats.spendingDiff.toFixed(1)}%
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="py-4 text-center">
                  <p className="text-xs text-muted-foreground">{t("stats.transactionCount")}</p>
                  <p className="text-2xl font-bold">{weekStats.transactionCount}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="py-4 text-center">
                  <p className="text-xs text-muted-foreground">{t("stats.topCategory")}</p>
                  <p className="text-2xl font-bold">{weekStats.topCategory?.categoryName ?? "—"}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {currentStep + 1} / {STEPS.length}
          </span>
          <span>{t(`steps.${step}`)}</span>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>

      {/* Step content */}
      <Card>
        <CardContent className="py-6">{renderStep()}</CardContent>
      </Card>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 0}>
          <ArrowLeftIcon />
          {t("actions.previous")}
        </Button>

        {currentStep < STEPS.length - 1 ? (
          <Button onClick={handleNext}>
            {t("actions.next")}
            <ArrowRightIcon />
          </Button>
        ) : (
          <Button onClick={() => setStarted(false)}>
            <CheckCircleIcon />
            {t("actions.finish")}
          </Button>
        )}
      </div>
    </div>
  );
}
