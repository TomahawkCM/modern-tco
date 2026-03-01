"use client";

import type { HealthScoreResult } from "@/engine/insights/health-score";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface HealthScoreWidgetProps {
  result: HealthScoreResult;
}

const gradeColor: Record<string, string> = {
  A: "text-green-600",
  B: "text-green-600",
  C: "text-amber-600",
  D: "text-red-600",
  F: "text-red-600",
};

const componentKeys: { key: keyof HealthScoreResult["components"]; labelKey: string }[] = [
  { key: "savingsScore", labelKey: "savingsRate" },
  { key: "budgetScore", labelKey: "budgetAdherence" },
  { key: "emergencyFundScore", labelKey: "emergencyFund" },
  { key: "debtScore", labelKey: "debtManagement" },
];

export function HealthScoreWidget({ result }: HealthScoreWidgetProps) {
  const t = useTranslations("dashboard.healthScore");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{t("title")}</span>
          <span className={cn("text-3xl font-bold", gradeColor[result.grade])}>
            {result.grade}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <span className="text-4xl font-bold">{result.score}</span>
          <span className="text-sm text-muted-foreground"> {t("score", { score: result.score })}</span>
        </div>

        <div className="space-y-3">
          {componentKeys.map(({ key, labelKey }) => {
            const value = result.components[key];
            return (
              <div key={key} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{t(labelKey)}</span>
                  <span className="text-muted-foreground">{value}%</span>
                </div>
                <Progress value={value} />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
