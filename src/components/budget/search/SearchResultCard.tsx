/**
 * SearchResultCard Component
 * Compact card for displaying a single search result in the command palette.
 * Shows merchant/description with highlighted matches, amount, date, category.
 */

"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { highlightMatches, getMatchIndicesForField } from "@/lib/search/highlight-matches";
import type { SearchResult } from "@/lib/search/transaction-search";

export interface SearchResultCardProps {
  /** Search result from Fuse.js */
  result: SearchResult;
  /** Category name (resolved from ID) */
  categoryName?: string;
  /** Account name (resolved from ID) */
  accountName?: string;
  /** Locale for formatting */
  locale?: string;
  /** Currency code */
  currency?: string;
  /** Click handler */
  onClick?: () => void;
  /** Whether this card is selected/focused */
  isSelected?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export function SearchResultCard({
  result,
  categoryName,
  accountName,
  locale = "en-US",
  currency = "USD",
  onClick,
  isSelected = false,
  className,
}: SearchResultCardProps) {
  const { item, matches } = result;
  const isIncome = item.amount > 0;

  // Format amount with locale
  const formattedAmount = formatCurrency(item.amount, locale, currency);

  // Format date with locale
  const formattedDate = new Date(item.date).toLocaleDateString(locale, {
    month: "short",
    day: "numeric",
  });

  // Highlight matched text
  const descriptionIndices = getMatchIndicesForField(matches, "description");
  const merchantIndices = getMatchIndicesForField(matches, "merchant");

  // Primary display: merchant or description
  const primaryText = item.merchant || item.description;
  const primaryIndices = item.merchant ? merchantIndices : descriptionIndices;
  const highlightedPrimary = highlightMatches(primaryText, primaryIndices, locale);

  // Secondary: description if merchant is primary
  let highlightedSecondary: ReactNode = null;
  if (item.merchant && item.description !== item.merchant) {
    highlightedSecondary = highlightMatches(
      item.description,
      descriptionIndices,
      locale
    );
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-start transition-colors",
        isSelected ? "bg-accent text-accent-foreground" : "hover:bg-muted",
        className
      )}
    >
      {/* Left: description + metadata */}
      <div className="min-w-0 flex-1">
        {/* Primary text (merchant or description) */}
        <div className="truncate text-sm font-medium">{highlightedPrimary}</div>

        {/* Secondary line: category, date, account */}
        <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
          {categoryName && (
            <Badge variant="outline" className="h-4 px-1.5 text-[10px] font-normal">
              {categoryName}
            </Badge>
          )}
          <span>{formattedDate}</span>
          {accountName && (
            <>
              <span className="text-border">·</span>
              <span className="truncate">{accountName}</span>
            </>
          )}
        </div>

        {/* Tertiary: description excerpt if merchant is shown */}
        {highlightedSecondary && (
          <div className="mt-0.5 truncate text-xs text-muted-foreground">
            {highlightedSecondary}
          </div>
        )}
      </div>

      {/* Right: amount */}
      <div
        className={cn(
          "shrink-0 text-end text-sm font-semibold tabular-nums",
          isIncome ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"
        )}
      >
        {isIncome ? "+" : ""}
        {formattedAmount}
      </div>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCurrency(amount: number, locale: string, currency: string): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      signDisplay: "never",
    }).format(Math.abs(amount));
  } catch {
    return `$${Math.abs(amount).toFixed(2)}`;
  }
}
