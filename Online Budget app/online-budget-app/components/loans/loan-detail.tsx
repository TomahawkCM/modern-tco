"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  LazyAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "@/components/charts/lazy-charts";
import { PencilIcon, TrashIcon, PlusIcon } from "lucide-react";

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

interface LoanPaymentRow {
  id: string;
  user_id: string;
  loan_id: string;
  amount_minor: number;
  payment_date: string;
  principal_minor: number | null;
  interest_minor: number | null;
  notes: string | null;
  created_at: string;
}

interface AmortizationEntry {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  extraPayment: number;
  balance: number;
  cumulativeInterest: number;
  cumulativePrincipal: number;
}

interface LoanDetailProps {
  loan: LoanRow;
  payments: LoanPaymentRow[];
  schedule: AmortizationEntry[];
  formatAmount: (amt: { amountMinor: number; currency: string }) => string;
}

export function LoanDetail({ loan, payments, schedule, formatAmount }: LoanDetailProps) {
  const t = useTranslations("loans");
  const tc = useTranslations("common");
  const router = useRouter();

  const [paymentOpen, setPaymentOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Payment form state
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentPrincipal, setPaymentPrincipal] = useState("");
  const [paymentInterest, setPaymentInterest] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");

  const handleRecordPayment = useCallback(async () => {
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        amount_minor: Math.round(parseFloat(paymentAmount || "0") * 100),
        payment_date: paymentDate,
      };
      if (paymentPrincipal) body.principal_minor = Math.round(parseFloat(paymentPrincipal) * 100);
      if (paymentInterest) body.interest_minor = Math.round(parseFloat(paymentInterest) * 100);
      if (paymentNotes.trim()) body.notes = paymentNotes.trim();

      const res = await fetch(`/api/loans/${loan.id}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setPaymentOpen(false);
        setPaymentAmount("");
        setPaymentPrincipal("");
        setPaymentInterest("");
        setPaymentNotes("");
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }, [
    loan.id,
    paymentDate,
    paymentAmount,
    paymentPrincipal,
    paymentInterest,
    paymentNotes,
    router,
  ]);

  const handleDelete = useCallback(async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/loans/${loan.id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/loans");
      }
    } finally {
      setSaving(false);
    }
  }, [loan.id, router]);

  // Prepare chart data: sample every Nth point if schedule is long
  const chartData = useMemo(() => {
    if (schedule.length <= 60) return schedule;
    const step = Math.ceil(schedule.length / 60);
    return schedule.filter((_, i) => i % step === 0 || i === schedule.length - 1);
  }, [schedule]);

  const paidOff =
    loan.original_balance_minor > 0
      ? ((loan.original_balance_minor - loan.current_balance_minor) / loan.original_balance_minor) *
        100
      : 0;
  const progressPct = Math.min(Math.max(paidOff, 0), 100);

  return (
    <div className="space-y-6">
      {/* Loan summary card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">{loan.name}</CardTitle>
              <div className="mt-2 flex gap-2">
                <Badge variant="outline">{t(`types.${loan.loan_type}`)}</Badge>
                <Badge variant={loan.status === "active" ? "default" : "secondary"}>
                  {t(`statuses.${loan.status}`)}
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/loans/${loan.id}/edit`}>
                  <PencilIcon />
                  {tc("edit")}
                </Link>
              </Button>
              <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <TrashIcon />
                    {tc("delete")}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t("deleteLoan")}</DialogTitle>
                    <DialogDescription>{t("confirmDelete")}</DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDeleteOpen(false)}>
                      {tc("cancel")}
                    </Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={saving}>
                      {saving ? tc("loading") : tc("delete")}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">{t("fields.currentBalance")}</p>
              <p className="text-2xl font-bold">
                {formatAmount({ amountMinor: loan.current_balance_minor, currency: loan.currency })}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("fields.interestRate")}</p>
              <p className="text-2xl font-bold">{Number(loan.interest_rate).toFixed(2)}%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("fields.minimumPayment")}</p>
              <p className="text-2xl font-bold">
                {formatAmount({
                  amountMinor: loan.minimum_payment_minor,
                  currency: loan.currency,
                })}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{t("progress")}</span>
              <span>
                {progressPct.toFixed(0)}% {t("paidOff")}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Amortization chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("amortization.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LazyAreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    dataKey="month"
                    label={{ value: t("amortization.month"), position: "insideBottom", offset: -5 }}
                    className="text-xs"
                  />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                    }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="balance"
                    name={t("amortization.balance")}
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.3}
                  />
                  <Area
                    type="monotone"
                    dataKey="cumulativeInterest"
                    name={t("amortization.interest")}
                    stroke="hsl(var(--muted-foreground))"
                    fill="hsl(var(--muted-foreground))"
                    fillOpacity={0.15}
                  />
                </LazyAreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment history */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t("payments.title")}</CardTitle>
            <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <PlusIcon />
                  {t("payments.addPayment")}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t("payments.addPayment")}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="paymentDate">{t("payments.date")}</Label>
                    <Input
                      id="paymentDate"
                      type="date"
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paymentAmount">{t("payments.amount")}</Label>
                    <Input
                      id="paymentAmount"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="paymentPrincipal">{t("payments.principal")}</Label>
                      <Input
                        id="paymentPrincipal"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={paymentPrincipal}
                        onChange={(e) => setPaymentPrincipal(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="paymentInterest">{t("payments.interest")}</Label>
                      <Input
                        id="paymentInterest"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={paymentInterest}
                        onChange={(e) => setPaymentInterest(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paymentNotes">{t("payments.notes")}</Label>
                    <Input
                      id="paymentNotes"
                      placeholder=""
                      value={paymentNotes}
                      onChange={(e) => setPaymentNotes(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setPaymentOpen(false)}>
                    {tc("cancel")}
                  </Button>
                  <Button onClick={handleRecordPayment} disabled={saving || !paymentAmount}>
                    {saving ? tc("saving") : tc("create")}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {t("payments.noPayments")}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="pb-2 pr-4 font-medium text-muted-foreground">
                      {t("payments.date")}
                    </th>
                    <th className="pb-2 pr-4 text-right font-medium text-muted-foreground">
                      {t("payments.amount")}
                    </th>
                    <th className="pb-2 pr-4 text-right font-medium text-muted-foreground">
                      {t("payments.principal")}
                    </th>
                    <th className="pb-2 pr-4 text-right font-medium text-muted-foreground">
                      {t("payments.interest")}
                    </th>
                    <th className="pb-2 font-medium text-muted-foreground">
                      {t("payments.notes")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id} className="border-b border-border last:border-0">
                      <td className="py-2 pr-4">{payment.payment_date}</td>
                      <td className="py-2 pr-4 text-right">
                        {formatAmount({
                          amountMinor: payment.amount_minor,
                          currency: loan.currency,
                        })}
                      </td>
                      <td className="py-2 pr-4 text-right">
                        {payment.principal_minor != null
                          ? formatAmount({
                              amountMinor: payment.principal_minor,
                              currency: loan.currency,
                            })
                          : "-"}
                      </td>
                      <td className="py-2 pr-4 text-right">
                        {payment.interest_minor != null
                          ? formatAmount({
                              amountMinor: payment.interest_minor,
                              currency: loan.currency,
                            })
                          : "-"}
                      </td>
                      <td className="py-2 text-muted-foreground">{payment.notes ?? ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
