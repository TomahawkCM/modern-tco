"use client";

import { useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { TrendingDown, Snowflake, GripVertical, Plus, Trash2, Save } from "lucide-react";
import { CustomOrderList } from "./CustomOrderList";
import type { DebtAccount, DebtStrategy, OneTimePayment } from "@/lib/calculators/types";
import { useTranslations } from "next-intl";

interface StrategyConfiguratorProps {
  debts: DebtAccount[];
  strategy: DebtStrategy;
  extraPayment: number;
  customOrder: string[];
  oneTimePayments: OneTimePayment[];
  onStrategyChange: (strategy: DebtStrategy) => void;
  onExtraPaymentChange: (amount: number) => void;
  onCustomOrderChange: (order: string[]) => void;
  onOneTimePaymentsChange: (payments: OneTimePayment[]) => void;
  onSaveScenario: () => void;
  formatCurrency: (amount: number) => string;
  isSaving?: boolean;
}

export function StrategyConfigurator({
  debts,
  strategy,
  extraPayment,
  customOrder,
  oneTimePayments,
  onStrategyChange,
  onExtraPaymentChange,
  onCustomOrderChange,
  onOneTimePaymentsChange,
  onSaveScenario,
  formatCurrency,
  isSaving,
}: StrategyConfiguratorProps) {
  const t = useTranslations("debtPayoff");

  const strategyTab = strategy === "minimum_only" ? "avalanche" : strategy;

  const handleTabChange = useCallback(
    (value: string) => {
      onStrategyChange(value as DebtStrategy);
    },
    [onStrategyChange]
  );

  const addOneTimePayment = useCallback(() => {
    onOneTimePaymentsChange([...oneTimePayments, { targetDebtId: "", month: 1, amount: 0, label: "" }]);
  }, [oneTimePayments, onOneTimePaymentsChange]);

  const updateOneTimePayment = useCallback(
    (index: number, field: keyof OneTimePayment, value: string | number) => {
      const updated = [...oneTimePayments];
      updated[index] = { ...updated[index], [field]: value };
      onOneTimePaymentsChange(updated);
    },
    [oneTimePayments, onOneTimePaymentsChange]
  );

  const removeOneTimePayment = useCallback(
    (index: number) => {
      onOneTimePaymentsChange(oneTimePayments.filter((_, i) => i !== index));
    },
    [oneTimePayments, onOneTimePaymentsChange]
  );

  return (
    <div className="space-y-6">
      <Tabs value={strategyTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-3 bg-slate-800/50">
          <TabsTrigger
            value="avalanche"
            className="data-[state=active]:bg-teal-600/20 data-[state=active]:text-teal-300"
          >
            <TrendingDown className="me-1.5 h-3.5 w-3.5" />
            {t("strategies.avalanche")}
          </TabsTrigger>
          <TabsTrigger
            value="snowball"
            className="data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-300"
          >
            <Snowflake className="me-1.5 h-3.5 w-3.5" />
            {t("strategies.snowball")}
          </TabsTrigger>
          <TabsTrigger
            value="custom"
            className="data-[state=active]:bg-purple-600/20 data-[state=active]:text-purple-300"
          >
            <GripVertical className="me-1.5 h-3.5 w-3.5" />
            {t("strategies.custom")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="avalanche" className="mt-4">
          <p className="text-sm text-slate-400">{t("strategies.avalancheDesc")}</p>
        </TabsContent>
        <TabsContent value="snowball" className="mt-4">
          <p className="text-sm text-slate-400">{t("strategies.snowballDesc")}</p>
        </TabsContent>
        <TabsContent value="custom" className="mt-4 space-y-4">
          <p className="text-sm text-slate-400">{t("strategies.customDesc")}</p>
          {debts.length > 0 && (
            <CustomOrderList
              debts={debts}
              order={customOrder}
              onOrderChange={onCustomOrderChange}
              formatCurrency={formatCurrency}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Extra Monthly Payment Slider */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-slate-300">{t("extraPayment")}</Label>
          <span className="text-sm font-semibold text-teal-400">
            {formatCurrency(extraPayment)}
            {t("perMonth")}
          </span>
        </div>
        <Slider
          value={[extraPayment]}
          onValueChange={([val]) => onExtraPaymentChange(val)}
          min={0}
          max={2000}
          step={25}
          className="[&_[role=slider]]:bg-teal-500"
        />
        <div className="flex justify-between text-xs text-slate-500">
          <span>{formatCurrency(0)}</span>
          <span>{formatCurrency(2000)}</span>
        </div>
      </div>

      {/* One-Time Payments */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-slate-300">{t("oneTimePayments")}</Label>
          <Button
            variant="ghost"
            size="sm"
            onClick={addOneTimePayment}
            className="h-7 gap-1 text-xs text-teal-400 hover:text-teal-300"
          >
            <Plus className="h-3 w-3" />
            {t("addPayment")}
          </Button>
        </div>

        {oneTimePayments.length === 0 && (
          <p className="text-xs text-slate-500">{t("noOneTimePayments")}</p>
        )}

        {oneTimePayments.map((payment, index) => (
          <div key={index} className="flex items-end gap-2">
            <div className="w-20">
              <Label className="text-xs text-slate-400">{t("month")}</Label>
              <Input
                type="number"
                min={1}
                value={payment.month}
                onChange={(e) =>
                  updateOneTimePayment(index, "month", parseInt(e.target.value) || 1)
                }
                className="h-8 border-slate-700 bg-slate-800/50 text-sm"
              />
            </div>
            <div className="w-28">
              <Label className="text-xs text-slate-400">{t("amount")}</Label>
              <Input
                type="number"
                min={0}
                step={100}
                value={payment.amount}
                onChange={(e) =>
                  updateOneTimePayment(index, "amount", parseFloat(e.target.value) || 0)
                }
                className="h-8 border-slate-700 bg-slate-800/50 text-sm"
              />
            </div>
            <div className="flex-1">
              <Label className="text-xs text-slate-400">{t("label")}</Label>
              <Input
                value={payment.label ?? ""}
                onChange={(e) => updateOneTimePayment(index, "label", e.target.value)}
                placeholder={t("labelPlaceholder")}
                className="h-8 border-slate-700 bg-slate-800/50 text-sm"
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeOneTimePayment(index)}
              className="h-8 w-8 shrink-0 text-slate-500 hover:text-red-400"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </div>

      {/* Save Scenario */}
      <Button
        onClick={onSaveScenario}
        disabled={Boolean(isSaving) || debts.length === 0}
        className="w-full bg-teal-600 text-white hover:bg-teal-700"
      >
        <Save className="me-2 h-4 w-4" />
        {t("saveScenario")}
      </Button>
    </div>
  );
}
