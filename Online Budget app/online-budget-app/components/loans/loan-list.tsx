"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PlusIcon,
  LandmarkIcon,
  CarIcon,
  GraduationCapIcon,
  UserIcon,
  CircleEllipsisIcon,
  TrendingDownIcon,
  DollarSignIcon,
  PercentIcon,
  HashIcon,
} from "lucide-react";

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

interface LoanListProps {
  loans: LoanRow[];
  totalDebt: number;
  monthlyPayments: number;
  avgRate: number;
  activeCount: number;
  currency: string;
  formatAmount: (amt: { amountMinor: number; currency: string }) => string;
}

const LOAN_TYPES = ["all", "mortgage", "auto", "personal", "student", "other"] as const;
const LOAN_STATUSES = ["all", "active", "paid_off", "refinanced", "defaulted"] as const;

const LOAN_TYPE_ICONS: Record<string, React.ReactNode> = {
  mortgage: <LandmarkIcon className="size-5" />,
  auto: <CarIcon className="size-5" />,
  personal: <UserIcon className="size-5" />,
  student: <GraduationCapIcon className="size-5" />,
  other: <CircleEllipsisIcon className="size-5" />,
};

export function LoanList({
  loans,
  totalDebt,
  monthlyPayments,
  avgRate,
  activeCount,
  currency,
  formatAmount,
}: LoanListProps) {
  const t = useTranslations("loans");
  const tc = useTranslations("common");

  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filteredLoans = useMemo(() => {
    return loans.filter((loan) => {
      if (filterType !== "all" && loan.loan_type !== filterType) return false;
      if (filterStatus !== "all" && loan.status !== filterStatus) return false;
      return true;
    });
  }, [loans, filterType, filterStatus]);

  const statCards = [
    {
      label: t("stats.totalDebt"),
      value: formatAmount({ amountMinor: totalDebt, currency }),
      icon: <TrendingDownIcon className="size-5 text-muted-foreground" />,
    },
    {
      label: t("stats.monthlyPayments"),
      value: formatAmount({ amountMinor: monthlyPayments, currency }),
      icon: <DollarSignIcon className="size-5 text-muted-foreground" />,
    },
    {
      label: t("stats.avgRate"),
      value: `${avgRate.toFixed(2)}%`,
      icon: <PercentIcon className="size-5 text-muted-foreground" />,
    },
    {
      label: t("stats.debtFreeDate"),
      value: String(activeCount),
      icon: <HashIcon className="size-5 text-muted-foreground" />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-3 py-4">
              {stat.icon}
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-xl font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters and Add button */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LOAN_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type === "all" ? tc("filter") + ": " + t("fields.loanType") : t(`types.${type}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LOAN_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {status === "all"
                  ? tc("filter") + ": " + t("fields.status")
                  : t(`statuses.${status}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="ml-auto">
          <Button asChild>
            <Link href="/loans/new">
              <PlusIcon />
              {t("addLoan")}
            </Link>
          </Button>
        </div>
      </div>

      {/* Loan cards */}
      {filteredLoans.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm font-medium">{t("noLoans")}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t("noLoansDescription")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filteredLoans.map((loan) => {
            const paidOff =
              loan.original_balance_minor > 0
                ? ((loan.original_balance_minor - loan.current_balance_minor) /
                    loan.original_balance_minor) *
                  100
                : 0;
            const progressPct = Math.min(Math.max(paidOff, 0), 100);

            return (
              <Link key={loan.id} href={`/loans/${loan.id}`} className="block">
                <Card className="transition-colors hover:bg-accent/50">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">
                          {LOAN_TYPE_ICONS[loan.loan_type] ?? LOAN_TYPE_ICONS.other}
                        </span>
                        <div>
                          <CardTitle className="text-base">{loan.name}</CardTitle>
                          <Badge variant="outline" className="mt-1">
                            {t(`types.${loan.loan_type}`)}
                          </Badge>
                        </div>
                      </div>
                      <Badge variant={loan.status === "active" ? "default" : "secondary"}>
                        {t(`statuses.${loan.status}`)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-baseline justify-between">
                      <p className="text-2xl font-bold">
                        {formatAmount({
                          amountMinor: loan.current_balance_minor,
                          currency: loan.currency,
                        })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {Number(loan.interest_rate).toFixed(2)}% APR
                      </p>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      {t("fields.minimumPayment")}:{" "}
                      {formatAmount({
                        amountMinor: loan.minimum_payment_minor,
                        currency: loan.currency,
                      })}
                    </p>

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
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
