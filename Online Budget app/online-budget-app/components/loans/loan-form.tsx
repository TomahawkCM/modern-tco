"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
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

interface LoanRow {
  id: string;
  user_id: string;
  name: string;
  loan_type: string;
  original_balance_minor: number;
  current_balance_minor: number;
  interest_rate: number;
  minimum_payment_minor: number;
  start_date: string | null;
  end_date: string | null;
  status: string;
  currency: string;
  created_at: string;
  updated_at: string;
}

interface LoanFormProps {
  initialData?: LoanRow;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  isEdit?: boolean;
  defaultCurrency?: string;
}

const LOAN_TYPES = ["mortgage", "auto", "personal", "student", "other"] as const;
const LOAN_STATUSES = ["active", "paid_off", "refinanced", "defaulted"] as const;

export function LoanForm({
  initialData,
  onSubmit,
  isEdit,
  defaultCurrency = "USD",
}: LoanFormProps) {
  const t = useTranslations("loans");
  const tc = useTranslations("common");

  const [name, setName] = useState(initialData?.name ?? "");
  const [loanType, setLoanType] = useState(initialData?.loan_type ?? "personal");
  const [originalBalance, setOriginalBalance] = useState(
    initialData ? (initialData.original_balance_minor / 100).toFixed(2) : ""
  );
  const [currentBalance, setCurrentBalance] = useState(
    initialData ? (initialData.current_balance_minor / 100).toFixed(2) : ""
  );
  const [interestRate, setInterestRate] = useState(
    initialData ? String(Number(initialData.interest_rate)) : ""
  );
  const [minimumPayment, setMinimumPayment] = useState(
    initialData ? (initialData.minimum_payment_minor / 100).toFixed(2) : ""
  );
  const [startDate, setStartDate] = useState(initialData?.start_date ?? "");
  const [endDate, setEndDate] = useState(initialData?.end_date ?? "");
  const [status, setStatus] = useState(initialData?.status ?? "active");
  const [currency, setCurrency] = useState(initialData?.currency ?? defaultCurrency);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data: Record<string, unknown> = {
        name,
        loan_type: loanType,
        original_balance_minor: Math.round(parseFloat(originalBalance || "0") * 100),
        current_balance_minor: Math.round(parseFloat(currentBalance || "0") * 100),
        interest_rate: parseFloat(interestRate || "0"),
        minimum_payment_minor: Math.round(parseFloat(minimumPayment || "0") * 100),
        currency,
      };

      if (startDate) data.start_date = startDate;
      if (endDate) data.end_date = endDate;
      if (isEdit) data.status = status;

      await onSubmit(data);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t("fields.name")}</Label>
            <Input
              id="name"
              placeholder={t("fields.namePlaceholder")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="loanType">{t("fields.loanType")}</Label>
            <Select value={loanType} onValueChange={setLoanType}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LOAN_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {t(`types.${type}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="originalBalance">{t("fields.originalBalance")}</Label>
              <Input
                id="originalBalance"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={originalBalance}
                onChange={(e) => setOriginalBalance(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentBalance">{t("fields.currentBalance")}</Label>
              <Input
                id="currentBalance"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={currentBalance}
                onChange={(e) => setCurrentBalance(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="interestRate">{t("fields.interestRate")}</Label>
              <Input
                id="interestRate"
                type="number"
                step="0.01"
                min="0"
                max="100"
                placeholder="0.00"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minimumPayment">{t("fields.minimumPayment")}</Label>
              <Input
                id="minimumPayment"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={minimumPayment}
                onChange={(e) => setMinimumPayment(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startDate">{t("fields.startDate")}</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">{t("fields.endDate")}</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {isEdit && (
            <div className="space-y-2">
              <Label htmlFor="status">{t("fields.status")}</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LOAN_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {t(`statuses.${s}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="currency">{t("fields.currency")}</Label>
            <Input
              id="currency"
              maxLength={3}
              value={currency}
              onChange={(e) => setCurrency(e.target.value.toUpperCase())}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="submit" disabled={saving || !name.trim()}>
              {saving ? tc("saving") : isEdit ? tc("save") : tc("create")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
