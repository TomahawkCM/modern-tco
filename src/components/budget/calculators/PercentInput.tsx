'use client';

/**
 * PercentInput Component
 *
 * Locale-aware percentage input
 */

import { useState, useCallback, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { cn } from '@/lib/utils';
import { parseFormattedNumber } from '@/i18n/utils/formatNumber';
import type { SupportedLocale } from '@/i18n/config';
import { LOCALE_METADATA } from '@/i18n/config';

interface PercentInputProps {
  value: number; // Stored as percentage (e.g., 7.5 for 7.5%)
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
  'aria-describedby'?: string;
}

export function PercentInput({
  value,
  onChange,
  locale: propLocale,
  label,
  id,
  min = 0,
  max = 100,
  step = 0.1,
  decimals = 2,
  helperText,
  error,
  placeholder,
  disabled = false,
  className,
  inputClassName,
  required = false,
  'aria-describedby': ariaDescribedBy,
}: PercentInputProps) {
  const siteLocale = useLocale() as SupportedLocale;
  const locale = propLocale || siteLocale;
  const localeMeta = LOCALE_METADATA[locale] || LOCALE_METADATA['en-US'];
  const dir = localeMeta.dir || 'ltr';
  const isRTL = dir === 'rtl';

  const [displayValue, setDisplayValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

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
      if (isNaN(num)) return '';
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

      const parsed = parseFormattedNumber(rawValue, locale);
      if (!isNaN(parsed)) {
        let constrained = parsed;
        if (min !== undefined) constrained = Math.max(min, constrained);
        if (max !== undefined) constrained = Math.min(max, constrained);

        const multiplier = Math.pow(10, decimals);
        const rounded = Math.round(constrained * multiplier) / multiplier;

        onChange(rounded);
      }
    },
    [locale, decimals, min, max, onChange]
  );

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    if (!isNaN(value)) {
      setDisplayValue(value.toFixed(decimals));
    }
  }, [value, decimals]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    const formatted = formatForDisplay(value, locale, decimals);
    setDisplayValue(formatted);
  }, [value, locale, decimals, formatForDisplay]);

  const inputId = id || `percent-input-${Math.random().toString(36).substr(2, 9)}`;
  const helperId = `${inputId}-helper`;
  const errorId = `${inputId}-error`;

  const describedBy = [
    ariaDescribedBy,
    helperText ? helperId : null,
    error ? errorId : null,
  ]
    .filter(Boolean)
    .join(' ') || undefined;

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
        <input
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
            isRTL ? 'pe-10 ps-4' : 'ps-4 pe-10',
            inputClassName
          )}
        />

        <span
          className={cn(
            'absolute top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none',
            isRTL ? 'start-4' : 'end-4'
          )}
        >
          %
        </span>
      </div>

      {helperText && !error && (
        <p id={helperId} className="text-xs text-slate-400">
          {helperText}
        </p>
      )}

      {error && (
        <p id={errorId} className="text-xs text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default PercentInput;
