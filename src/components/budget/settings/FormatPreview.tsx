"use client";

/**
 * Format Preview Component
 *
 * Shows live examples of how numbers, currency, and dates will be formatted
 * based on current locale preferences
 */

import type { SupportedLocale } from "@/i18n/config";
import type { CurrencyCode } from "@/i18n/utils/formatCurrency";
import { formatCurrency } from "@/i18n/utils/formatCurrency";
import { formatNumber } from "@/i18n/utils/formatNumber";
import { formatDate, formatLongDate } from "@/i18n/utils/formatDate";

interface FormatPreviewProps {
  locale: SupportedLocale;
  currency: CurrencyCode;
}

export function FormatPreview({ locale, currency }: FormatPreviewProps) {
  const now = new Date();
  const sampleNumber = 1234567.89;
  const sampleCurrency = 1234.56;

  return (
    <div className="space-y-3 text-sm">
      {/* Number Format */}
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">Number (1,234,567.89):</span>
        <span className="font-mono font-medium">{formatNumber(sampleNumber, locale)}</span>
      </div>

      {/* Currency Format */}
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">Currency (1,234.56):</span>
        <span className="font-mono font-medium">
          {formatCurrency(sampleCurrency, currency, locale)}
        </span>
      </div>

      {/* Short Date Format */}
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">Short Date:</span>
        <span className="font-mono font-medium">{formatDate(now, locale)}</span>
      </div>

      {/* Long Date Format */}
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">Long Date:</span>
        <span className="font-mono font-medium">{formatLongDate(now, locale)}</span>
      </div>

      {/* Special formats for en-IN */}
      {locale === "en-IN" && (
        <div className="mt-4 border-t pt-4">
          <div className="mb-2 text-xs text-muted-foreground">Indian Numbering System:</div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">1 lakh:</span>
            <span className="font-mono font-medium">{formatNumber(100000, locale)}</span>
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-muted-foreground">1 crore:</span>
            <span className="font-mono font-medium">{formatNumber(10000000, locale)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
