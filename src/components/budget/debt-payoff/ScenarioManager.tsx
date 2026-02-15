"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { TrendingDown, Snowflake, GripVertical, Trash2, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DebtScenario } from "@/types/budget";
import type { DebtStrategy } from "@/lib/calculators/types";
import { useTranslations } from "next-intl";

const strategyIcons: Record<DebtStrategy, React.ComponentType<{ className?: string }>> = {
  avalanche: TrendingDown,
  snowball: Snowflake,
  custom: GripVertical,
  minimum_only: CalendarDays,
};

const strategyColors: Record<DebtStrategy, string> = {
  avalanche: "text-teal-400",
  snowball: "text-blue-400",
  custom: "text-purple-400",
  minimum_only: "text-slate-400",
};

interface ScenarioManagerProps {
  scenarios: DebtScenario[];
  selectedIds: Set<number>;
  onToggleSelect: (id: number) => void;
  onDelete: (id: number) => void;
  formatCurrency: (amount: number) => string;
}

export function ScenarioManager({
  scenarios,
  selectedIds,
  onToggleSelect,
  onDelete,
  formatCurrency,
}: ScenarioManagerProps) {
  const t = useTranslations("debtPayoff");
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const handleDelete = useCallback(
    (id: number) => {
      if (confirmDelete === id) {
        onDelete(id);
        setConfirmDelete(null);
      } else {
        setConfirmDelete(id);
        setTimeout(() => setConfirmDelete(null), 3000);
      }
    },
    [confirmDelete, onDelete]
  );

  if (scenarios.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-700 px-4 py-8 text-center">
        <p className="text-sm text-slate-500">{t("noScenarios")}</p>
        <p className="mt-1 text-xs text-slate-600">{t("noScenariosHint")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-slate-400">{t("compareHint")}</p>
      {scenarios.map((scenario) => {
        const Icon = strategyIcons[scenario.strategy];
        const isSelected = selectedIds.has(scenario.id);
        const debtFreeDate = new Date(scenario.debtFreeDate);

        return (
          <div
            key={scenario.id}
            className={cn(
              "flex items-center gap-3 rounded-lg border bg-slate-800/50 px-3 py-3 transition-colors",
              isSelected ? "border-teal-500/50" : "border-slate-700"
            )}
          >
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onToggleSelect(scenario.id)}
              className="border-slate-600 data-[state=checked]:border-teal-600 data-[state=checked]:bg-teal-600"
            />
            <Icon className={cn("h-4 w-4 shrink-0", strategyColors[scenario.strategy])} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{scenario.name}</p>
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-slate-400">
                <span>
                  {scenario.totalMonths} {t("months")}
                </span>
                <span>
                  {formatCurrency(scenario.totalInterest)} {t("interest")}
                </span>
                <span>
                  {debtFreeDate.toLocaleDateString(undefined, { year: "numeric", month: "short" })}
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(scenario.id)}
              className={cn(
                "h-7 w-7 shrink-0",
                confirmDelete === scenario.id
                  ? "text-red-400 hover:text-red-300"
                  : "text-slate-500 hover:text-slate-300"
              )}
              title={confirmDelete === scenario.id ? t("confirmDelete") : t("deleteScenario")}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        );
      })}
    </div>
  );
}
