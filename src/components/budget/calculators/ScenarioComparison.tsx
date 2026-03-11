"use client";

/**
 * ScenarioComparison Component
 *
 * Side-by-side comparison of saved calculator scenarios.
 * Supports duplicate/branch, delete, and delta visualization.
 * Works with the scenario-store.ts persistence layer.
 */

import { useState, useEffect, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Copy, Trash2, ChevronDown, GitBranch, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/i18n/utils/formatCurrency";
import type { SupportedLocale } from "@/i18n/config";
import { LOCALE_METADATA } from "@/i18n/config";
import type { CalculatorScenario, CalculatorType } from "@/lib/financial-engine/scenario-store";
import { getScenarios, saveScenario, deleteScenario } from "@/lib/financial-engine/scenario-store";

// ============================================================================
// Types
// ============================================================================

interface ComparisonField {
  key: string;
  label: string;
  type: "currency" | "number" | "percent" | "text";
}

interface ScenarioComparisonProps {
  calculatorType: CalculatorType;
  fields: ComparisonField[];
  /** Extract comparison values from a scenario's input/output */
  extractValues: (scenario: CalculatorScenario) => Record<string, number | string>;
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

export function ScenarioComparison({
  calculatorType,
  fields,
  extractValues,
  className,
}: ScenarioComparisonProps) {
  const t = useTranslations("calculators");
  const locale = useLocale() as SupportedLocale;
  const localeMeta = LOCALE_METADATA[locale] || LOCALE_METADATA["en-US"];
  const currency = localeMeta.currency as string;

  const [scenarios, setScenarios] = useState<CalculatorScenario[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Load scenarios
  const loadScenarios = useCallback(async () => {
    try {
      const loaded = await getScenarios(calculatorType);
      setScenarios(loaded);
    } catch {
      // IndexedDB may not be available in SSR
    }
  }, [calculatorType]);

  useEffect(() => {
    loadScenarios();
  }, [loadScenarios]);

  // Duplicate a scenario
  const handleDuplicate = useCallback(
    async (scenario: CalculatorScenario) => {
      await saveScenario({
        calculatorType: scenario.calculatorType,
        name: `${scenario.name} ${t("copySuffix")}`,
        input: { ...scenario.input },
        assumptions: scenario.assumptions ? { ...scenario.assumptions } : undefined,
      });
      await loadScenarios();
    },
    [loadScenarios]
  );

  // Delete a scenario
  const handleDelete = useCallback(
    async (id: number) => {
      await deleteScenario(id);
      setSelectedIds((prev) => prev.filter((sid) => sid !== id));
      await loadScenarios();
    },
    [loadScenarios]
  );

  // Toggle scenario selection for comparison
  const toggleSelection = useCallback((id: number) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((sid) => sid !== id);
      if (prev.length >= 3) return prev; // Max 3 for comparison
      return [...prev, id];
    });
  }, []);

  const selectedScenarios = scenarios.filter((s) => s.id && selectedIds.includes(s.id));

  // Format a value for display
  const formatValue = (value: number | string, type: ComparisonField["type"]): string => {
    if (typeof value === "string") return value;
    switch (type) {
      case "currency":
        return formatCurrency(value, currency, locale);
      case "percent":
        return `${value.toFixed(1)}%`;
      case "number":
        return value.toLocaleString(locale);
      default:
        return String(value);
    }
  };

  // Calculate delta between two values
  const getDelta = (
    a: number | string,
    b: number | string
  ): { value: string; positive: boolean } | null => {
    if (typeof a !== "number" || typeof b !== "number") return null;
    const diff = b - a;
    if (diff === 0) return null;
    return {
      value: diff > 0 ? `+${formatValue(diff, "currency")}` : formatValue(diff, "currency"),
      positive: diff > 0,
    };
  };

  if (scenarios.length === 0) return null;

  return (
    <div className={cn("rounded-xl border border-slate-700 bg-slate-800/50", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-4 text-start transition-colors hover:bg-slate-700/30"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-300">
            {t("scenario.compare", { count: scenarios.length })}
          </span>
        </div>
        <ChevronDown
          className={cn("h-4 w-4 text-slate-400 transition-transform", isOpen && "rotate-180")}
        />
      </button>

      {isOpen && (
        <div className="space-y-4 border-t border-slate-700 p-4">
          {/* Scenario List */}
          <div className="space-y-2">
            <p className="text-xs text-slate-500">{t("scenario.selectUpTo")}</p>
            {scenarios.map((scenario) => (
              <div
                key={scenario.id}
                className={cn(
                  "flex items-center justify-between rounded-lg px-3 py-2 transition-colors",
                  selectedIds.includes(scenario.id!)
                    ? "border border-teal-500/50 bg-teal-500/10"
                    : "border border-slate-600 bg-slate-700/30 hover:bg-slate-700/50"
                )}
              >
                <button
                  onClick={() => toggleSelection(scenario.id!)}
                  className="flex flex-1 items-center gap-2 text-start"
                >
                  <div
                    className={cn(
                      "h-4 w-4 rounded border",
                      selectedIds.includes(scenario.id!)
                        ? "border-teal-500 bg-teal-500"
                        : "border-slate-500"
                    )}
                  />
                  <div>
                    <span className="text-sm font-medium text-white">{scenario.name}</span>
                    <span className="ms-2 text-xs text-slate-500">
                      {new Date(scenario.updatedAt).toLocaleDateString(locale)}
                    </span>
                  </div>
                </button>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDuplicate(scenario)}
                    className="rounded p-1 text-slate-500 hover:text-slate-300"
                    title={t("scenario.duplicate")}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(scenario.id!)}
                    className="rounded p-1 text-slate-500 hover:text-red-400"
                    title={t("scenario.delete")}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Comparison Table */}
          {selectedScenarios.length >= 2 && (
            <div className="overflow-x-auto">
              <div className="mb-3 flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-teal-400" />
                <span className="text-sm font-medium text-teal-400">
                  {t("scenario.sideBySide")}
                </span>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="py-2 text-left text-xs font-medium uppercase text-slate-500">
                      {t("scenario.field")}
                    </th>
                    {selectedScenarios.map((s) => (
                      <th
                        key={s.id}
                        className="py-2 text-right text-xs font-medium uppercase text-slate-400"
                      >
                        {s.name}
                      </th>
                    ))}
                    {selectedScenarios.length === 2 && (
                      <th className="py-2 text-right text-xs font-medium uppercase text-slate-500">
                        {t("scenario.delta")}
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {fields.map((field) => {
                    const values = selectedScenarios.map((s) => {
                      const extracted = extractValues(s);
                      return extracted[field.key];
                    });

                    const delta =
                      selectedScenarios.length === 2 ? getDelta(values[0], values[1]) : null;

                    return (
                      <tr key={field.key} className="border-b border-slate-700/50">
                        <td className="py-2 text-slate-400">{field.label}</td>
                        {values.map((val, i) => (
                          <td key={i} className="py-2 text-right font-medium text-white">
                            {formatValue(val, field.type)}
                          </td>
                        ))}
                        {selectedScenarios.length === 2 && (
                          <td
                            className={cn(
                              "py-2 text-right text-xs font-medium",
                              delta?.positive ? "text-green-400" : "text-red-400",
                              !delta && "text-slate-600"
                            )}
                          >
                            {delta?.value ?? "—"}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {selectedScenarios.length === 1 && (
            <p className="text-center text-xs text-slate-500">{t("scenario.selectOneMore")}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default ScenarioComparison;
