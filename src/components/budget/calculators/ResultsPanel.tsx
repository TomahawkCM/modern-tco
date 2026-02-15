"use client";

/**
 * ResultsPanel Component
 *
 * Display formatted calculation results with locale-aware formatting
 */

import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/i18n/utils/formatCurrency";
import { formatNumber, formatPercent } from "@/i18n/utils/formatNumber";
import type { SupportedLocale } from "@/i18n/config";
import { LOCALE_METADATA } from "@/i18n/config";

interface ResultItem {
  label: string;
  value: number | string | Date;
  type: "currency" | "number" | "percent" | "date" | "months" | "text";
  highlight?: boolean;
  variant?: "default" | "success" | "warning" | "danger";
  icon?: React.ReactNode;
}

interface ResultsPanelProps {
  title?: string;
  subtitle?: string;
  results: ResultItem[];
  currency?: string;
  locale?: SupportedLocale;
  className?: string;
  columns?: 1 | 2 | 3 | 4;
}

export function ResultsPanel({
  title,
  subtitle,
  results,
  currency: propCurrency,
  locale: propLocale,
  className,
  columns = 2,
}: ResultsPanelProps) {
  const siteLocale = useLocale() as SupportedLocale;
  const locale = propLocale || siteLocale;
  const localeMeta = LOCALE_METADATA[locale] || LOCALE_METADATA["en-US"];
  const currency = propCurrency || localeMeta.currency;
  const dir = localeMeta.dir || "ltr";

  const formatValue = (item: ResultItem): string => {
    const { value, type } = item;

    switch (type) {
      case "currency":
        return formatCurrency(value as number, currency, locale);

      case "number":
        return formatNumber(value as number, locale, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        });

      case "percent":
        return formatPercent((value as number) / 100, locale, 1);

      case "date":
        const date = value instanceof Date ? value : new Date(value as string);
        return new Intl.DateTimeFormat(locale, {
          year: "numeric",
          month: "long",
        }).format(date);

      case "months":
        const months = value as number;
        if (months < 12) {
          return `${months} ${months === 1 ? "month" : "months"}`;
        }
        const years = Math.floor(months / 12);
        const remainingMonths = months % 12;
        if (remainingMonths === 0) {
          return `${years} ${years === 1 ? "year" : "years"}`;
        }
        return `${years}y ${remainingMonths}m`;

      case "text":
      default:
        return String(value);
    }
  };

  const getVariantStyles = (variant: ResultItem["variant"] = "default") => {
    switch (variant) {
      case "success":
        return "text-green-400";
      case "warning":
        return "text-yellow-400";
      case "danger":
        return "text-red-400";
      default:
        return "text-white";
    }
  };

  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div
      className={cn("rounded-xl border border-slate-700 bg-slate-800/50 p-6", className)}
      dir={dir}
    >
      {(title || subtitle) && (
        <div className="mb-6">
          {title && <h3 className="text-lg font-semibold text-white">{title}</h3>}
          {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
        </div>
      )}

      <div className={cn("grid gap-4", gridCols[columns])}>
        {results.map((item, index) => (
          <div
            key={index}
            className={cn(
              "rounded-lg p-4",
              item.highlight ? "border border-teal-500/30 bg-teal-500/10" : "bg-slate-700/50"
            )}
          >
            <div className="mb-1 flex items-center gap-2">
              {item.icon && <span className="text-slate-400">{item.icon}</span>}
              <p className="text-sm text-slate-400">{item.label}</p>
            </div>
            <p className={cn("text-xl font-bold", getVariantStyles(item.variant))}>
              {formatValue(item)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ResultsPanel;
