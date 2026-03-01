"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  BarChart3Icon,
  PieChartIcon,
  TargetIcon,
  LightbulbIcon,
  CheckCircle2Icon,
} from "lucide-react";
import Link from "next/link";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface CategoryRow {
  id: string;
  key: string;
}

interface OnboardingWizardProps {
  categories: CategoryRow[];
}

const TOTAL_STEPS = 5;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function OnboardingWizard({ categories }: OnboardingWizardProps) {
  const t = useTranslations("onboarding");
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [budgetCategoryId, setBudgetCategoryId] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [saving, setSaving] = useState(false);

  /* ---- Navigation ---- */

  const goNext = useCallback(() => {
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }, []);

  const goPrevious = useCallback(() => {
    setStep((s) => Math.max(s - 1, 1));
  }, []);

  /* ---- Budget creation ---- */

  const handleCreateBudget = useCallback(async () => {
    if (!budgetCategoryId || !budgetAmount) return;

    setSaving(true);
    try {
      const amountMinor = Math.round(parseFloat(budgetAmount) * 100);
      await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category_id: budgetCategoryId,
          amount_minor: amountMinor,
          currency: "USD",
          period: "monthly",
        }),
      });
      goNext();
    } finally {
      setSaving(false);
    }
  }, [budgetCategoryId, budgetAmount, goNext]);

  /* ---- Complete onboarding ---- */

  const handleComplete = useCallback(async () => {
    setSaving(true);
    try {
      await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ onboarding_complete: true }),
      });
      router.push("/dashboard");
    } finally {
      setSaving(false);
    }
  }, [router]);

  /* ---- Feature icons for welcome step ---- */

  const features = [
    { key: "track" as const, icon: BarChart3Icon },
    { key: "budget" as const, icon: PieChartIcon },
    { key: "plan" as const, icon: TargetIcon },
    { key: "insights" as const, icon: LightbulbIcon },
  ];

  /* ---- Render ---- */

  return (
    <Card className="w-full max-w-lg">
      {/* Progress indicator */}
      <CardHeader className="space-y-3">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">
            {t("progress", { current: step, total: TOTAL_STEPS })}
          </p>
          <Progress value={(step / TOTAL_STEPS) * 100} className="h-2" />
        </div>

        {/* Step 1: Welcome */}
        {step === 1 && (
          <>
            <CardTitle className="text-xl">{t("steps.welcome.title")}</CardTitle>
            <CardDescription>{t("steps.welcome.description")}</CardDescription>
          </>
        )}

        {/* Step 2: Import */}
        {step === 2 && (
          <>
            <CardTitle className="text-xl">{t("steps.import.title")}</CardTitle>
            <CardDescription>{t("steps.import.description")}</CardDescription>
          </>
        )}

        {/* Step 3: Categories */}
        {step === 3 && (
          <>
            <CardTitle className="text-xl">{t("steps.categories.title")}</CardTitle>
            <CardDescription>{t("steps.categories.description")}</CardDescription>
          </>
        )}

        {/* Step 4: First Budget */}
        {step === 4 && (
          <>
            <CardTitle className="text-xl">{t("steps.budget.title")}</CardTitle>
            <CardDescription>{t("steps.budget.description")}</CardDescription>
          </>
        )}

        {/* Step 5: Done */}
        {step === 5 && (
          <>
            <CardTitle className="text-xl">{t("steps.done.title")}</CardTitle>
            <CardDescription>{t("steps.done.description")}</CardDescription>
          </>
        )}
      </CardHeader>

      <CardContent>
        {/* Step 1: Welcome — feature list */}
        {step === 1 && (
          <ul className="space-y-3">
            {features.map(({ key, icon: Icon }) => (
              <li key={key} className="flex items-center gap-3">
                <Icon className="size-5 shrink-0 text-primary" />
                <span className="text-sm">{t(`steps.welcome.features.${key}`)}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Step 2: Import */}
        {step === 2 && (
          <div className="flex flex-col gap-3">
            <Button asChild>
              <Link href="/import">{t("steps.import.importLabel")}</Link>
            </Button>
            <Button variant="outline" onClick={goNext}>
              {t("steps.import.skipLabel")}
            </Button>
          </div>
        )}

        {/* Step 3: Categories */}
        {step === 3 && (
          <div className="flex flex-col gap-3">
            <Button variant="outline" onClick={goNext}>
              {t("steps.categories.useDefaults")}
            </Button>
            <Button asChild variant="outline">
              <Link href="/categories">{t("steps.categories.customize")}</Link>
            </Button>
          </div>
        )}

        {/* Step 4: First Budget */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="budget-category">{t("steps.budget.category")}</Label>
              <Select value={budgetCategoryId} onValueChange={setBudgetCategoryId}>
                <SelectTrigger id="budget-category">
                  <SelectValue placeholder={t("steps.budget.category")} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.key}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget-amount">{t("steps.budget.amount")}</Label>
              <Input
                id="budget-amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={budgetAmount}
                onChange={(e) => setBudgetAmount(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleCreateBudget}
                disabled={saving || !budgetCategoryId || !budgetAmount}
              >
                {t("steps.budget.createLabel")}
              </Button>
              <Button variant="outline" onClick={goNext}>
                {t("steps.budget.skipLabel")}
              </Button>
            </div>
          </div>
        )}

        {/* Step 5: Done */}
        {step === 5 && (
          <div className="flex flex-col items-center gap-4 py-4">
            <CheckCircle2Icon className="size-12 text-green-500" />
            <Button onClick={handleComplete} disabled={saving} className="w-full">
              {t("steps.done.goToDashboard")}
            </Button>
          </div>
        )}
      </CardContent>

      {/* Navigation footer (steps 1, 3 only — step 2 & 4 have their own, step 5 has "Go to Dashboard") */}
      {(step === 1 || step === 3) && (
        <CardFooter className="flex justify-between">
          <Button variant="ghost" onClick={goPrevious} disabled={step === 1}>
            {t("previous")}
          </Button>
          <Button onClick={goNext}>{t("next")}</Button>
        </CardFooter>
      )}
    </Card>
  );
}
