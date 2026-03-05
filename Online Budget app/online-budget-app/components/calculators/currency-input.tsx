"use client";

import * as React from "react";
import { useState, useCallback, useRef } from "react";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { parseFormattedNumber, getCurrencyDecimals, getCurrencySymbol } from "@/lib/format";
import { LOCALE_METADATA } from "@/i18n/config";
import type { SupportedLocale } from "@/i18n/config";

export interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  currency?: string;
  locale?: SupportedLocale;
  label?: string;
  id?: string;
  min?: number;
  max?: number;
  helperText?: string;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  required?: boolean;
  allowNegative?: boolean;
  showCurrency?: boolean;
}

function isCurrencySuffix(locale: string, currency: string): boolean {
  try {
    const parts = new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      currencyDisplay: "symbol",
    }).formatToParts(1);
    const currencyIndex = parts.findIndex((p) => p.type === "currency");
    const integerIndex = parts.findIndex((p) => p.type === "integer");
    return currencyIndex > integerIndex;
  } catch {
    return false;
  }
}

export function CurrencyInput({
  value,
  onChange,
  currency: propCurrency,
  locale: propLocale,
  label,
  id,
  min,
  max,
  helperText,
  error,
  placeholder,
  disabled = false,
  className,
  inputClassName,
  required = false,
  allowNegative = false,
  showCurrency = true,
}: CurrencyInputProps) {
  const siteLocale = useLocale() as SupportedLocale;
  const locale = propLocale || siteLocale;
  const localeMeta = LOCALE_METADATA[locale] || LOCALE_METADATA["en-US"];
  const currency = propCurrency || localeMeta.currency;
  const dir = localeMeta.dir || "ltr";
  const isRTL = dir === "rtl";

  const decimals = getCurrencyDecimals(currency);
  const symbol = getCurrencySymbol(currency, locale);

  const [editingValue, setEditingValue] = useState<string | null>(null);
  const isFocused = useRef(false);

  function formatForDisplay(num: number, loc: SupportedLocale, dec: number) {
    if (isNaN(num) || num === 0) return "";
    return new Intl.NumberFormat(loc, {
      minimumFractionDigits: dec,
      maximumFractionDigits: dec,
    }).format(num);
  }

  const displayValue = editingValue ?? formatForDisplay(value, locale, decimals);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;
      if (!allowNegative && rawValue.includes("-")) return;
      setEditingValue(rawValue);

      const isNegative = rawValue.trimStart().startsWith("-");
      const parsed = parseFormattedNumber(rawValue, locale);
      if (!isNaN(parsed)) {
        let constrained = isNegative ? -Math.abs(parsed) : parsed;
        if (!allowNegative && constrained < 0) constrained = 0;
        if (min !== undefined) constrained = Math.max(min, constrained);
        if (max !== undefined) constrained = Math.min(max, constrained);

        const multiplier = Math.pow(10, decimals);
        onChange(Math.round(constrained * multiplier) / multiplier);
      }
    },
    [locale, decimals, min, max, onChange, allowNegative]
  );

  const handleFocus = useCallback(() => {
    isFocused.current = true;
    if (value !== 0) setEditingValue(value.toFixed(decimals));
  }, [value, decimals]);

  const handleBlur = useCallback(() => {
    isFocused.current = false;
    setEditingValue(null);
  }, []);

  const reactId = React.useId();
  const inputId = id || `currency-input-${reactId.replace(/:/g, "")}`;
  const helperId = `${inputId}-helper`;
  const errorId = `${inputId}-error`;
  const describedBy =
    [helperText ? helperId : null, error ? errorId : null].filter(Boolean).join(" ") || undefined;

  const useSymbolSuffix = isCurrencySuffix(locale, currency);

  return (
    <div className={cn("space-y-1", className)} dir={dir}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-foreground">
          {label}
          {required && <span className="ms-1 text-destructive">*</span>}
        </label>
      )}
      <div className="relative">
        {showCurrency && !useSymbolSuffix && (
          <span
            className={cn(
              "pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted-foreground",
              isRTL ? "end-4" : "start-4"
            )}
          >
            {symbol}
          </span>
        )}
        <input
          type="text"
          inputMode="decimal"
          id={inputId}
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder || "0"}
          disabled={disabled}
          required={required}
          aria-describedby={describedBy}
          aria-invalid={!!error}
          className={cn(
            "flex h-10 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm transition-colors",
            "border-input text-foreground",
            "placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-destructive focus-visible:ring-destructive",
            showCurrency && !useSymbolSuffix && (isRTL ? "pe-4 ps-10" : "pe-4 ps-10"),
            showCurrency && useSymbolSuffix && (isRTL ? "pe-10 ps-4" : "pe-10 ps-4"),
            !showCurrency && "px-3",
            inputClassName
          )}
        />
        {showCurrency && useSymbolSuffix && (
          <span
            className={cn(
              "pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted-foreground",
              isRTL ? "start-4" : "end-4"
            )}
          >
            {symbol}
          </span>
        )}
      </div>
      {helperText && !error && (
        <p id={helperId} className="text-xs text-muted-foreground">
          {helperText}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default CurrencyInput;
