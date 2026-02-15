"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import NextLink from "next/link";
import { useFormatter, useTranslations } from "next-intl";
import { ArrowLeft, Building2, TrendingUp, Home, DollarSign } from "lucide-react";
import { GlassCard } from "@/components/budget/ui/GlassCard";
import { useDefaultCurrency } from "@/hooks/useDefaultCurrency";
import { db } from "@/lib/budget-db";
import {
  calculateEquity,
  calculateAppreciation,
  calculateRentalROI,
} from "@/lib/property/property-calculator";
import type { Property, Loan } from "@/types/budget";

export function ClientPropertyDetail() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";

  const t = useTranslations("budget.property");
  const format = useFormatter();
  const currency = useDefaultCurrency();

  const [property, setProperty] = useState<Property | null>(null);
  const [loan, setLoan] = useState<Loan | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const prop = await db.properties.get(id);
        if (cancelled) return;

        if (!prop) {
          setProperty(null);
          setLoading(false);
          return;
        }

        setProperty(prop);

        if (prop.loanId) {
          const linkedLoan = await db.loans.get(prop.loanId);
          if (!cancelled) {
            setLoan(linkedLoan);
          }
        }
      } catch (err) {
        console.error("Failed to load property:", err);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const fmtCurrency = (v: number) =>
    format.number(v, { style: "currency", currency: property?.currency || currency });

  if (loading) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <div className="h-8 w-48 animate-pulse rounded bg-slate-700/50" />
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-slate-800/50" />
          ))}
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <Building2 className="mb-4 h-16 w-16 text-slate-600" />
        <h2 className="text-lg font-semibold text-slate-300">{t("notFound")}</h2>
        <NextLink
          href="/budget-app/properties"
          className="mt-4 text-sm text-teal-400 transition-colors hover:text-teal-300"
        >
          {t("backToProperties")}
        </NextLink>
      </div>
    );
  }

  const equity = calculateEquity(property, loan);
  const appreciation = calculateAppreciation(property);
  const rentalROI = calculateRentalROI(property);

  const propertyTypeLabel = property.type.replace(/_/g, " ");

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header with back button */}
      <div className="flex items-center gap-3">
        <NextLink
          href="/budget-app/properties"
          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
          aria-label={t("backToProperties")}
        >
          <ArrowLeft className="h-5 w-5" />
        </NextLink>
        <div>
          <h1 className="text-2xl font-bold text-white">{property.name}</h1>
          {property.address && <p className="text-sm text-slate-400">{property.address}</p>}
        </div>
        <span className="ml-auto rounded-full bg-teal-500/20 px-3 py-1 text-xs font-medium capitalize text-teal-300">
          {propertyTypeLabel}
        </span>
      </div>

      {/* Valuation section */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Current value */}
        <GlassCard className="p-5">
          <div className="flex items-center gap-2 text-slate-400">
            <Home className="h-4 w-4" />
            <span className="text-sm">{t("currentValue")}</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-white">{fmtCurrency(property.currentValue)}</p>
        </GlassCard>

        {/* Purchase price */}
        <GlassCard className="p-5">
          <div className="flex items-center gap-2 text-slate-400">
            <DollarSign className="h-4 w-4" />
            <span className="text-sm">{t("purchasePrice")}</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-white">
            {fmtCurrency(property.purchasePrice)}
          </p>
        </GlassCard>

        {/* Equity */}
        <GlassCard className="p-5">
          <div className="flex items-center gap-2 text-slate-400">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm">{t("equity")}</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-400">{fmtCurrency(equity)}</p>
        </GlassCard>
      </div>

      {/* Appreciation */}
      <GlassCard className="p-5">
        <h3 className="mb-4 text-base font-semibold text-white">{t("appreciation")}</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-slate-400">{t("annualAppreciation")}</p>
            <p className="mt-1 text-xl font-bold text-white">{appreciation.annual.toFixed(2)}%</p>
          </div>
          <div>
            <p className="text-sm text-slate-400">{t("totalAppreciation")}</p>
            <p className="mt-1 text-xl font-bold text-white">{appreciation.total.toFixed(2)}%</p>
          </div>
        </div>
      </GlassCard>

      {/* Rental ROI -- only shown for properties with rental income */}
      {property.monthlyRentalIncome && property.monthlyRentalIncome > 0 && (
        <GlassCard className="p-5">
          <h3 className="mb-4 text-base font-semibold text-white">{t("rentalROI")}</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-sm text-slate-400">{t("monthlyIncome")}</p>
              <p className="mt-1 text-lg font-bold text-emerald-400">
                {fmtCurrency(property.monthlyRentalIncome)}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-400">{t("monthlyROI")}</p>
              <p className="mt-1 text-lg font-bold text-white">{rentalROI.monthly.toFixed(2)}%</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">{t("annualROI")}</p>
              <p className="mt-1 text-lg font-bold text-white">{rentalROI.annual.toFixed(2)}%</p>
            </div>
          </div>
          {property.occupancyRate != null && property.occupancyRate < 100 && (
            <p className="mt-3 text-xs text-slate-500">
              {t("occupancyRate")}: {property.occupancyRate}%
            </p>
          )}
        </GlassCard>
      )}

      {/* Loan details -- only shown when a linked loan exists */}
      {loan && (
        <GlassCard className="p-5">
          <h3 className="mb-4 text-base font-semibold text-white">{t("loanDetails")}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-slate-400">{t("lender")}</p>
              <p className="mt-1 font-medium text-white">{loan.lender}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">{t("interestRate")}</p>
              <p className="mt-1 font-medium text-white">{loan.interestRate}%</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">{t("currentBalance")}</p>
              <p className="mt-1 font-medium text-white">{fmtCurrency(loan.currentBalance)}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">{t("monthlyPayment")}</p>
              <p className="mt-1 font-medium text-white">{fmtCurrency(loan.monthlyPayment)}</p>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Notes */}
      {property.notes && (
        <GlassCard className="p-5">
          <h3 className="mb-2 text-base font-semibold text-white">{t("notes")}</h3>
          <p className="whitespace-pre-wrap text-sm text-slate-300">{property.notes}</p>
        </GlassCard>
      )}
    </div>
  );
}
