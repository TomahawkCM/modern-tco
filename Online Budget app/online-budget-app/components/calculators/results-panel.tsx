"use client";

import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";
import { LOCALE_METADATA } from "@/i18n/config";
import type { SupportedLocale } from "@/i18n/config";

export interface ResultItem {
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
  const tDuration = useTranslations("duration");
  const locale = propLocale || siteLocale;
  const localeMeta = LOCALE_METADATA[locale] || LOCALE_METADATA["en-US"];
  const currency = propCurrency || localeMeta.currency;

  const formatValue = (item: ResultItem): string => {
    const { value, type } = item;

    switch (type) {
      case "currency":
        return formatCurrency(value as number, currency, locale);
      case "number":
        return formatNumber(value as number, locale);
      case "percent":
        return formatPercent((value as number) / 100, locale, 1);
      case "date": {
        const date =
          value instanceof Date ? value : new Date(value as string);
        return new Intl.DateTimeFormat(locale, {
          year: "numeric",
          month: "long",
        }).format(date);
      }
      case "months": {
        const months = value as number;
        if (months < 12) return tDuration("months", { count: months });
        const years = Math.floor(months / 12);
        const rem = months % 12;
        if (rem === 0) return tDuration("years", { count: years });
        return tDuration("yearsAndMonths", { years, months: rem });
      }
      case "text":
      default:
        return String(value);
    }
  };

  const variantColor = (v: ResultItem["variant"] = "default") => {
    switch (v) {
      case "success":
        return "text-green-600 dark:text-green-400";
      case "warning":
        return "text-yellow-600 dark:text-yellow-400";
      case "danger":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-foreground";
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
      className={cn(
        "rounded-lg border border-border bg-card p-6",
        className
      )}
    >
      {(title || subtitle) && (
        <div className="mb-6">
          {title && (
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          )}
          {subtitle && (
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
      )}
      <div className={cn("grid gap-4", gridCols[columns])}>
        {results.map((item, index) => (
          <div
            key={index}
            className={cn(
              "rounded-lg p-4",
              item.highlight
                ? "border border-primary/30 bg-primary/5"
                : "bg-muted/50"
            )}
          >
            <div className="mb-1 flex items-center gap-2">
              {item.icon && (
                <span className="text-muted-foreground">{item.icon}</span>
              )}
              <p className="text-sm text-muted-foreground">{item.label}</p>
            </div>
            <p className={cn("text-xl font-bold", variantColor(item.variant))}>
              {formatValue(item)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ResultsPanel;
