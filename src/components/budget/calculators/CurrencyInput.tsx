'use client';

/**
 * CurrencyInput Component
 *
 * Locale-aware currency input with proper formatting
 * Handles locale-specific decimal/thousand separators
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useLocale } from 'next-intl';
import { cn } from '@/lib/utils';
import { getCurrencyDecimals, getCurrencySymbol } from '@/i18n/utils/formatCurrency';
import { parseFormattedNumber } from '@/i18n/utils/formatNumber';
import type { SupportedLocale } from '@/i18n/config';
import { LOCALE_METADATA } from '@/i18n/config';

interface CurrencyInputProps {
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
  'aria-describedby'?: string;
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
  step,
  helperText,
  error,
  placeholder,
  disabled = false,
  className,
  inputClassName,
  required = false,
  'aria-describedby': ariaDescribedBy,
}: CurrencyInputProps) {
  const siteLocale = useLocale() as SupportedLocale;
  const locale = propLocale || siteLocale;
  const localeMeta = LOCALE_METADATA[locale] || LOCALE_METADATA['en-US'];
  const currency = propCurrency || localeMeta.currency;
  const dir = localeMeta.dir || 'ltr';
  const isRTL = dir === 'rtl';

  const decimals = getCurrencyDecimals(currency);
  const symbol = getCurrencySymbol(currency as any, locale);

  // Track display value separately for user input
  const [displayValue, setDisplayValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync display value when external value changes (and not focused)
  useEffect(() => {
    if (!isFocused) {
      const formatted = formatForDisplay(value, locale, decimals);
      setDisplayValue(formatted);
    }
  }, [value, locale, decimals, isFocused]);

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

  // Handle input change
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;
      setDisplayValue(rawValue);

      // Parse the value
      const parsed = parseFormattedNumber(rawValue, locale);
      if (!isNaN(parsed)) {
        // Apply min/max constraints
        let constrained = parsed;
        if (min !== undefined) constrained = Math.max(min, constrained);
        if (max !== undefined) constrained = Math.min(max, constrained);

        // Round to currency decimals
        const multiplier = Math.pow(10, decimals);
        const rounded = Math.round(constrained * multiplier) / multiplier;

        onChange(rounded);
      }
    },
    [locale, decimals, min, max, onChange]
  );

  // Handle focus - show raw value
  const handleFocus = useCallback(() => {
    setIsFocused(true);
    // Show raw number without thousand separators for easier editing
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
  const inputId = id || `currency-input-${Math.random().toString(36).substr(2, 9)}`;
  const helperId = `${inputId}-helper`;
  const errorId = `${inputId}-error`;

  // Determine aria-describedby
  const describedBy = [
    ariaDescribedBy,
    helperText ? helperId : null,
    error ? errorId : null,
  ]
    .filter(Boolean)
    .join(' ') || undefined;

  // Determine symbol position based on locale
  // Most locales use prefix, but some use suffix
  const suffixLocales = ['de-DE', 'fr-FR', 'es-ES', 'it-IT', 'nl-NL', 'pt-PT'];
  const useSymbolSuffix = suffixLocales.some((l) => locale.startsWith(l.split('-')[0]));

  return (
    <div className={cn('space-y-1', className)} dir={dir}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-slate-300"
        >
          {label}
          {required && <span className="text-red-400 ms-1">*</span>}
        </label>
      )}

      <div className="relative">
        {/* Prefix symbol */}
        {!useSymbolSuffix && (
          <span
            className={cn(
              'absolute top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none',
              isRTL ? 'end-4' : 'start-4'
            )}
          >
            {symbol}
          </span>
        )}

        <input
          ref={inputRef}
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
            'w-full py-2 border rounded-lg transition-colors',
            'bg-slate-800/50 border-slate-600 text-white',
            'placeholder:text-slate-500',
            'focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'border-red-500 focus:ring-red-500',
            !useSymbolSuffix && (isRTL ? 'pe-4 ps-12' : 'ps-10 pe-4'),
            useSymbolSuffix && (isRTL ? 'ps-4 pe-12' : 'pe-10 ps-4'),
            inputClassName
          )}
        />

        {/* Suffix symbol */}
        {useSymbolSuffix && (
          <span
            className={cn(
              'absolute top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none',
              isRTL ? 'start-4' : 'end-4'
            )}
          >
            {symbol}
          </span>
        )}
      </div>

      {/* Helper text */}
      {helperText && !error && (
        <p id={helperId} className="text-xs text-slate-400">
          {helperText}
        </p>
      )}

      {/* Error message */}
      {error && (
        <p id={errorId} className="text-xs text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default CurrencyInput;
