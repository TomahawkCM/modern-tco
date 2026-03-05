"use client";

import { useState, useCallback, useRef, useId } from "react";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { parseFormattedNumber } from "@/lib/format";
import { LOCALE_METADATA } from "@/i18n/config";
import type { SupportedLocale } from "@/i18n/config";

interface PercentInputProps {
  value: number;
  onChange: (value: number) => void;
  locale?: SupportedLocale;
  label?: string;
  id?: string;
  min?: number;
  max?: number;
  step?: number;
  decimals?: number;
  helperText?: string;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  required?: boolean;
}

export function PercentInput({
  value,
  onChange,
  locale: propLocale,
  label,
  id,
  min = 0,
  max = 100,
  decimals = 2,
  helperText,
  error,
  placeholder,
  disabled = false,
  className,
  inputClassName,
  required = false,
}: PercentInputProps) {
  const siteLocale = useLocale() as SupportedLocale;
  const locale = propLocale || siteLocale;
  const localeMeta = LOCALE_METADATA[locale] || LOCALE_METADATA["en-US"];
  const dir = localeMeta.dir || "ltr";
  const isRTL = dir === "rtl";

  const [editingValue, setEditingValue] = useState<string | null>(null);
  const isFocused = useRef(false);

  function formatForDisplay(num: number, loc: SupportedLocale, dec: number) {
    if (isNaN(num)) return "";
    return new Intl.NumberFormat(loc, {
      minimumFractionDigits: dec,
      maximumFractionDigits: dec,
    }).format(num);
  }

  const displayValue = editingValue ?? formatForDisplay(value, locale, decimals);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;
      setEditingValue(rawValue);

      const parsed = parseFormattedNumber(rawValue, locale);
      if (!isNaN(parsed)) {
        let constrained = parsed;
        if (min !== undefined) constrained = Math.max(min, constrained);
        if (max !== undefined) constrained = Math.min(max, constrained);

        const multiplier = Math.pow(10, decimals);
        onChange(Math.round(constrained * multiplier) / multiplier);
      }
    },
    [locale, decimals, min, max, onChange]
  );

  const handleFocus = useCallback(() => {
    isFocused.current = true;
    if (!isNaN(value)) setEditingValue(value.toFixed(decimals));
  }, [value, decimals]);

  const handleBlur = useCallback(() => {
    isFocused.current = false;
    setEditingValue(null);
  }, []);

  const reactId = useId();
  const inputId = id || `percent-input-${reactId.replace(/:/g, "")}`;
  const helperId = `${inputId}-helper`;
  const errorId = `${inputId}-error`;
  const describedBy =
    [helperText ? helperId : null, error ? errorId : null].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("space-y-1", className)} dir={dir}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-foreground">
          {label}
          {required && <span className="ms-1 text-destructive">*</span>}
        </label>
      )}
      <div className="relative">
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
            "flex h-10 w-full rounded-md border bg-transparent py-2 text-sm shadow-sm transition-colors",
            "border-input text-foreground",
            "placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-destructive focus-visible:ring-destructive",
            isRTL ? "pe-10 ps-4" : "pe-10 ps-4",
            inputClassName
          )}
        />
        <span
          className={cn(
            "pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted-foreground",
            isRTL ? "start-4" : "end-4"
          )}
        >
          %
        </span>
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

export default PercentInput;
