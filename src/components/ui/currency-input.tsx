'use client';

import * as React from 'react';
import { useState, useCallback, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { cn } from '@/lib/utils';
import { getCurrencyDecimals, getCurrencySymbol } from '@/i18n/utils/formatCurrency';
import { parseFormattedNumber } from '@/i18n/utils/formatNumber';
import type { SupportedLocale } from '@/i18n/config';
import { LOCALE_METADATA } from '@/i18n/config';

export interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  currency?: string;
  locale?: SupportedLocale;
  label?: string;
  id?: string;
  min?: number;
  max?: number;
  step?: number;
  helperText?: string;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  required?: boolean;
  allowNegative?: boolean;
  showCurrency?: boolean;
  'aria-describedby'?: string;
}

/**
 * Detect whether the currency symbol is a suffix for the given locale
 * using Intl.NumberFormat formatToParts.
 */
function isCurrencySuffix(locale: string, currency: string): boolean {
  try {
    const parts = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      currencyDisplay: 'symbol',
    }).formatToParts(1);

    const currencyIndex = parts.findIndex((p) => p.type === 'currency');
    const integerIndex = parts.findIndex((p) => p.type === 'integer');
    return currencyIndex > integerIndex;
  } catch {
    return false;
  }
}

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  (
    {
      value,
      onChange,
      currency: propCurrency,
      locale: propLocale,
      label,
      id,
      min,
      max,
      step,
      helperText,
      error,
      placeholder,
      disabled = false,
      className,
      inputClassName,
      required = false,
      allowNegative = false,
      showCurrency = true,
      'aria-describedby': ariaDescribedBy,
    },
    ref
  ) => {
    const siteLocale = useLocale() as SupportedLocale;
    const locale = propLocale || siteLocale;
    const localeMeta = LOCALE_METADATA[locale] || LOCALE_METADATA['en-US'];
    const currency = propCurrency || localeMeta.currency;
    const dir = localeMeta.dir || 'ltr';
    const isRTL = dir === 'rtl';

    const decimals = getCurrencyDecimals(currency);
    const symbol = getCurrencySymbol(currency, locale);

    const [displayValue, setDisplayValue] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    // Format number for display
    const formatForDisplay = useCallback(
      (num: number, loc: SupportedLocale, dec: number) => {
        if (isNaN(num) || num === 0) return '';
        return new Intl.NumberFormat(loc, {
          minimumFractionDigits: dec,
          maximumFractionDigits: dec,
        }).format(num);
      },
      []
    );

    // Sync display value when external value changes (and not focused)
    useEffect(() => {
      if (!isFocused) {
        const formatted = formatForDisplay(value, locale, decimals);
        setDisplayValue(formatted);
      }
    }, [value, locale, decimals, isFocused, formatForDisplay]);

    // Handle input change
    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;

        // Block negative sign if not allowed
        if (!allowNegative && rawValue.includes('-')) {
          return;
        }

        setDisplayValue(rawValue);

        // Preserve sign since parseFormattedNumber strips non-digit chars
        const isNegative = rawValue.trimStart().startsWith('-');
        const parsed = parseFormattedNumber(rawValue, locale);
        if (!isNaN(parsed)) {
          let constrained = isNegative ? -Math.abs(parsed) : parsed;

          if (!allowNegative && constrained < 0) {
            constrained = 0;
          }
          if (min !== undefined) constrained = Math.max(min, constrained);
          if (max !== undefined) constrained = Math.min(max, constrained);

          const multiplier = Math.pow(10, decimals);
          const rounded = Math.round(constrained * multiplier) / multiplier;

          onChange(rounded);
        }
      },
      [locale, decimals, min, max, onChange, allowNegative]
    );

    // Handle focus - show raw value
    const handleFocus = useCallback(() => {
      setIsFocused(true);
      if (value !== 0) {
        setDisplayValue(value.toFixed(decimals));
      }
    }, [value, decimals]);

    // Handle blur - format for display
    const handleBlur = useCallback(() => {
      setIsFocused(false);
      const formatted = formatForDisplay(value, locale, decimals);
      setDisplayValue(formatted);
    }, [value, locale, decimals, formatForDisplay]);

    // Generate IDs for accessibility
    const inputId = id || `currency-input-${React.useId().replace(/:/g, '')}`;
    const helperId = `${inputId}-helper`;
    const errorId = `${inputId}-error`;

    const describedBy = [
      ariaDescribedBy,
      helperText ? helperId : null,
      error ? errorId : null,
    ]
      .filter(Boolean)
      .join(' ') || undefined;

    const useSymbolSuffix = isCurrencySuffix(locale, currency);
    const showSymbol = showCurrency;

    return (
      <div className={cn('space-y-1', className)} dir={dir}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-foreground"
          >
            {label}
            {required && <span className="text-destructive ms-1">*</span>}
          </label>
        )}

        <div className="relative">
          {/* Prefix symbol */}
          {showSymbol && !useSymbolSuffix && (
            <span
              className={cn(
                'absolute top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none',
                isRTL ? 'end-4' : 'start-4'
              )}
            >
              {symbol}
            </span>
          )}

          <input
            ref={ref}
            type="text"
            inputMode="decimal"
            id={inputId}
            value={displayValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder || '0'}
            disabled={disabled}
            required={required}
            aria-describedby={describedBy}
            aria-invalid={!!error}
            className={cn(
              'flex h-12 w-full rounded-md border bg-transparent py-1 text-base shadow-sm transition-colors',
              'border-input text-foreground',
              'placeholder:text-muted-foreground',
              'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'md:text-sm',
              error && 'border-destructive focus-visible:ring-destructive',
              showSymbol && !useSymbolSuffix && (isRTL ? 'pe-4 ps-12' : 'ps-10 pe-4'),
              showSymbol && useSymbolSuffix && (isRTL ? 'ps-4 pe-12' : 'pe-10 ps-4'),
              !showSymbol && 'px-3',
              inputClassName
            )}
          />

          {/* Suffix symbol */}
          {showSymbol && useSymbolSuffix && (
            <span
              className={cn(
                'absolute top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none',
                isRTL ? 'start-4' : 'end-4'
              )}
            >
              {symbol}
            </span>
          )}
        </div>

        {/* Helper text */}
        {helperText && !error && (
          <p id={helperId} className="text-xs text-muted-foreground">
            {helperText}
          </p>
        )}

        {/* Error message */}
        {error && (
          <p id={errorId} className="text-xs text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

CurrencyInput.displayName = 'CurrencyInput';

export { CurrencyInput };
export default CurrencyInput;
