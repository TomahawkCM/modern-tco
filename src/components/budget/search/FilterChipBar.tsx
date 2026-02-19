/**
 * FilterChipBar Component
 * Horizontal scrollable container displaying active search filters as chips.
 * Includes a "Clear all" button. Uses logical CSS properties for RTL support.
 */

"use client";

import { useTranslations } from "next-intl";
import {
  DollarSign,
  Calendar,
  Tag,
  Store,
  CreditCard,
  ArrowUpDown,
  Hash,
  X as XIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FilterChip } from "./FilterChip";
import type { ParsedFilters } from "@/lib/search/query-parser";

export interface FilterChipBarProps {
  /** Parsed filters to display as chips */
  filters: ParsedFilters;
  /** Called when a specific filter is removed */
  onRemoveFilter: (filterKey: keyof ParsedFilters) => void;
  /** Called when all filters are cleared */
  onClearAll: () => void;
  /** Current locale for formatting amounts/dates */
  locale?: string;
  /** Currency code for amount formatting */
  currency?: string;
  /** Additional CSS classes */
  className?: string;
}

/** Map filter types to icons */
function getFilterIcon(type: string) {
  switch (type) {
    case "amount":
      return <DollarSign className="h-3 w-3" />;
    case "date":
      return <Calendar className="h-3 w-3" />;
    case "category":
      return <Tag className="h-3 w-3" />;
    case "merchant":
      return <Store className="h-3 w-3" />;
    case "account":
      return <CreditCard className="h-3 w-3" />;
    case "type":
      return <ArrowUpDown className="h-3 w-3" />;
    case "tag":
      return <Hash className="h-3 w-3" />;
    default:
      return null;
  }
}

export function FilterChipBar({
  filters,
  onRemoveFilter,
  onClearAll,
  locale = "en-US",
  currency = "USD",
  className,
}: FilterChipBarProps) {
  const t = useTranslations("transactionSearch");

  // Build list of active filter chips
  const chips: { key: keyof ParsedFilters; type: string; value: string }[] = [];

  // Amount range
  if (filters.amountMin !== undefined && filters.amountMax !== undefined) {
    const min = formatAmount(filters.amountMin, locale, currency);
    const max = formatAmount(filters.amountMax, locale, currency);
    chips.push({ key: "amountMin", type: "amount", value: `${min} – ${max}` });
  } else if (filters.amountMin !== undefined) {
    const min = formatAmount(filters.amountMin, locale, currency);
    chips.push({ key: "amountMin", type: "amount", value: `> ${min}` });
  } else if (filters.amountMax !== undefined) {
    const max = formatAmount(filters.amountMax, locale, currency);
    chips.push({ key: "amountMax", type: "amount", value: `< ${max}` });
  }

  // Date range
  if (filters.dateStart || filters.dateEnd) {
    const dateValue = formatDateRange(filters.dateStart, filters.dateEnd, locale);
    chips.push({ key: "dateStart", type: "date", value: dateValue });
  }

  // Category
  if (filters.category) {
    chips.push({ key: "category", type: "category", value: filters.category });
  }

  // Account
  if (filters.account) {
    chips.push({ key: "account", type: "account", value: filters.account });
  }

  // Type
  if (filters.type) {
    chips.push({ key: "type", type: "type", value: filters.type });
  }

  // Tag
  if (filters.tag) {
    chips.push({ key: "tag", type: "tag", value: filters.tag });
  }

  // Merchant
  if (filters.merchant) {
    chips.push({ key: "merchant", type: "merchant", value: filters.merchant });
  }

  // Recurring / Split
  if (filters.isRecurring) {
    chips.push({ key: "isRecurring", type: "is", value: "recurring" });
  }
  if (filters.isSplit) {
    chips.push({ key: "isSplit", type: "is", value: "split" });
  }

  if (chips.length === 0) return null;

  return (
    <div
      className={cn(
        "flex items-center gap-2 overflow-x-auto scroll-smooth py-1",
        "snap-x snap-mandatory",
        // Hide scrollbar but allow scrolling
        "scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className
      )}
      role="list"
      aria-label={t("activeFilters")}
    >
      {chips.map((chip) => (
        <div key={chip.key} className="snap-start" role="listitem">
          <FilterChip
            type={chip.type}
            value={chip.value}
            icon={getFilterIcon(chip.type)}
            onRemove={() => onRemoveFilter(chip.key)}
          />
        </div>
      ))}

      {/* Clear all button */}
      {chips.length > 1 && (
        <button
          onClick={onClearAll}
          className={cn(
            "inline-flex shrink-0 snap-start items-center gap-1 rounded-full px-2.5 py-1",
            "text-xs text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          )}
          aria-label={t("clearAllFilters")}
        >
          <XIcon className="h-3 w-3" />
          {t("clearAll")}
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatAmount(amount: number, locale: string, currency: string): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(Math.abs(amount));
  } catch {
    return `$${Math.abs(amount).toFixed(0)}`;
  }
}

function formatDateRange(
  start: Date | undefined,
  end: Date | undefined,
  locale: string
): string {
  const fmt = (d: Date) =>
    d.toLocaleDateString(locale, { month: "short", day: "numeric" });

  if (start && end) {
    // Detect common presets
    const now = new Date();
    const daysDiff = Math.floor(
      (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysDiff <= 1) return "Today";
    if (daysDiff <= 2) return "Yesterday";
    if (daysDiff <= 7) return "Last 7 days";
    if (daysDiff <= 30) return "Last 30 days";
    return `${fmt(start)} – ${fmt(end)}`;
  }
  if (start) return `From ${fmt(start)}`;
  if (end) return `Until ${fmt(end)}`;
  return "";
}
