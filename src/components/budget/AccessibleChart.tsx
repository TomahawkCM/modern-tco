/**
 * AccessibleChart Component
 *
 * WCAG 2.2 compliant chart wrapper providing:
 * - Descriptive text alternatives (aria-label, aria-describedby)
 * - Keyboard navigation through data points
 * - Data table toggle for screen reader users
 * - Visual and text descriptions
 *
 * Accessibility Features:
 * - ARIA live regions for dynamic updates
 * - Keyboard navigation (Tab, Arrow keys, Enter)
 * - Toggle between visual chart and data table
 * - Screen reader friendly descriptions
 * - Focus management
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { Table, BarChart3, Eye, EyeOff } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
  additionalInfo?: string;
}

interface AccessibleChartProps {
  /** Unique ID for the chart */
  id: string;
  /** Chart title (visible) */
  title: string;
  /** Accessible description for screen readers */
  description: string;
  /** Chart type for context */
  chartType: 'pie' | 'line' | 'area' | 'bar';
  /** Data points */
  data: ChartDataPoint[];
  /** The visual chart component */
  children: React.ReactNode;
  /** Optional summary statistics */
  summary?: {
    total?: number;
    average?: number;
    highest?: ChartDataPoint;
    lowest?: ChartDataPoint;
  };
  /** Optional footer notes */
  footer?: string;
}

export function AccessibleChart({
  id,
  title,
  description,
  chartType,
  data,
  children,
  summary,
  footer,
}: AccessibleChartProps) {
  const t = useTranslations('accessibleChart');
  const [showTable, setShowTable] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  // Generate summary text for screen readers
  const generateSummary = (): string => {
    const parts: string[] = [];
    parts.push(`${title}. ${description}`);
    parts.push(t('chartTypeDescription', { chartType, dataPoints: data.length }));

    if (summary) {
      if (summary.total !== undefined) {
        parts.push(t('summary.total', { value: summary.total }));
      }
      if (summary.average !== undefined) {
        parts.push(t('summary.average', { value: summary.average }));
      }
      if (summary.highest) {
        parts.push(t('summary.highest', { label: summary.highest.label, value: summary.highest.value }));
      }
      if (summary.lowest) {
        parts.push(t('summary.lowest', { label: summary.lowest.label, value: summary.lowest.value }));
      }
    }

    return parts.join(' ');
  };

  // Keyboard navigation for data points
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((index + 1) % data.length);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((index - 1 + data.length) % data.length);
        break;
      case 'Home':
        e.preventDefault();
        setFocusedIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setFocusedIndex(data.length - 1);
        break;
    }
  };

  // Toggle view mode
  const toggleView = () => {
    setShowTable(!showTable);
    // Announce change to screen readers
    const announcement = showTable
      ? t('switchedToChart')
      : t('switchedToTable');
    announceToScreenReader(announcement);
  };

  // Announce to screen readers
  const announceToScreenReader = (message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);
    setTimeout(() => document.body.removeChild(announcement), 1000);
  };

  return (
    <div className="space-y-4">
      {/* Chart Header with Controls */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={toggleView}
          aria-label={showTable ? t('buttons.showChart') : t('buttons.showTable')}
          aria-pressed={showTable}
          className="gap-2"
        >
          {showTable ? (
            <>
              <BarChart3 className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">{t('buttons.chart')}</span>
            </>
          ) : (
            <>
              <Table className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">{t('buttons.table')}</span>
            </>
          )}
        </Button>
      </div>

      {/* Screen Reader Only Summary */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {generateSummary()}
      </div>

      {showTable ? (
        /* Accessible Data Table */
        <div
          ref={tableRef}
          role="region"
          aria-label={`${title} data table`}
          tabIndex={0}
        >
          <table className="w-full border border-gray-300 rounded-lg overflow-hidden">
            <caption className="sr-only">{description}</caption>
            <thead className="bg-gray-100">
              <tr>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-sm font-semibold text-gray-900"
                >
                  {chartType === 'pie' ? t('tableHeaders.category') : t('tableHeaders.period')}
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-right text-sm font-semibold text-gray-900"
                >
                  {t('tableHeaders.value')}
                </th>
                {data.some((d) => d.additionalInfo) && (
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-sm font-semibold text-gray-900"
                  >
                    {t('tableHeaders.additionalInfo')}
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {data.map((point, index) => (
                <tr
                  key={index}
                  className={`border-t border-gray-200 ${
                    index === focusedIndex ? 'bg-teal-50' : 'hover:bg-gray-50'
                  }`}
                  tabIndex={0}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  onFocus={() => setFocusedIndex(index)}
                  role="row"
                >
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <div className="flex items-center gap-2">
                      {point.color && (
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: point.color }}
                          aria-hidden="true"
                        />
                      )}
                      {point.label}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                    ${point.value.toFixed(2)}
                  </td>
                  {point.additionalInfo && (
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {point.additionalInfo}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
            {summary && (
              <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                <tr>
                  <td
                    colSpan={data.some((d) => d.additionalInfo) ? 3 : 2}
                    className="px-4 py-3"
                  >
                    <div className="text-sm text-gray-700 space-y-1">
                      {summary.total !== undefined && (
                        <div className="flex justify-between">
                          <span className="font-semibold">{t('footer.total')}</span>
                          <span className="font-bold">${summary.total.toFixed(2)}</span>
                        </div>
                      )}
                      {summary.average !== undefined && (
                        <div className="flex justify-between">
                          <span>{t('footer.average')}</span>
                          <span>${summary.average.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              </tfoot>
            )}
          </table>

          {/* Keyboard Navigation Instructions */}
          <div className="mt-2 text-xs text-gray-600">
            <span className="sr-only">
              {t('keyboardNav.srOnly')}
            </span>
            <span aria-hidden="true">
              {t('keyboardNav.visual')}
            </span>
          </div>
        </div>
      ) : (
        /* Visual Chart View */
        <div
          ref={chartRef}
          role="img"
          aria-label={generateSummary()}
          aria-describedby={`${id}-desc`}
        >
          {children}
          <div id={`${id}-desc`} className="sr-only">
            {t('chartDescription', {
              description,
              dataPoints: data.length,
              dataList: data.map((d) => `${d.label}: $${d.value.toFixed(2)}`).join(', '),
            })}
          </div>
        </div>
      )}

      {/* Footer Notes */}
      {footer && (
        <p className="text-xs text-gray-600 mt-2" role="note">
          {footer}
        </p>
      )}
    </div>
  );
}
