'use client';

/**
 * Spending Trend Chart with Forecasting (Phase 4)
 * Task 4.3.1: Display trend lines with 30-day projections
 *
 * Shows historical spending with linear regression forecast
 */

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  prepareMonthlyTrendData,
  generateForecast,
  calculateLinearRegression,
  getTrendDescription,
} from '@/lib/analytics/trend-forecasting';
import { useThemeMode } from '@/hooks/useThemeMode';
import { getChartPalette } from '@/lib/budget-chart-colors';

interface SpendingTrendChartProps {
  transactions: { date: Date; amount: number }[];
  monthsBack?: number;
  forecastDays?: number;
}

export function SpendingTrendChart({
  transactions,
  monthsBack = 6,
  forecastDays = 30,
}: SpendingTrendChartProps) {
  const t = useTranslations('spendingTrendChart');
  // Get theme-aware chart colors
  const theme = useThemeMode();
  const palette = getChartPalette(theme);

  const { chartData, trendInfo, stats } = useMemo(() => {
    // Prepare historical data
    const historicalData = prepareMonthlyTrendData(transactions, monthsBack);
    
    if (historicalData.length < 2) {
      return { chartData: [], trendInfo: null, stats: null };
    }

    // Calculate trend
    const trend = calculateLinearRegression(historicalData);
    if (!trend) {
      return { chartData: [], trendInfo: null, stats: null };
    }

    // Generate forecast (convert days to months for monthly data)
    const forecast = generateForecast(historicalData, 3); // 3 months ahead
    
    const trendDesc = getTrendDescription(trend);

    // Prepare chart data
    const data = forecast.map((point) => ({
      date: point.date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      actual: point.isProjection ? null : point.projected,
      projected: point.isProjection ? point.projected : null,
      fullDate: point.date,
    }));

    // Add actual spending values
    historicalData.forEach((point, index) => {
      if (data[index]) {
        data[index].actual = point.y;
      }
    });

    // Calculate stats
    const avgSpending = historicalData.reduce((sum, p) => sum + p.y, 0) / historicalData.length;
    const lastMonth = historicalData[historicalData.length - 1]?.y || 0;
    const projectedNext = forecast.find(f => f.isProjection)?.projected || 0;

    return {
      chartData: data,
      trendInfo: trendDesc,
      stats: {
        avgSpending,
        lastMonth,
        projectedNext,
        changeFromAvg: projectedNext - avgSpending,
        changePercent: avgSpending > 0 ? ((projectedNext - avgSpending) / avgSpending) * 100 : 0,
      },
    };
  }, [transactions, monthsBack, forecastDays]);

  if (!chartData || chartData.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2">{t('title')}</h3>
        <p className="text-gray-600">
          {t('notEnoughData')}
        </p>
      </div>
    );
  }

  const TrendIcon = trendInfo?.direction === 'increasing' ? TrendingUp
    : trendInfo?.direction === 'decreasing' ? TrendingDown
    : Minus;

  const trendColor = trendInfo?.direction === 'increasing' ? 'text-red-600'
    : trendInfo?.direction === 'decreasing' ? 'text-green-600'
    : 'text-gray-600';

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-gray-900">{t('title')}</h3>
          {trendInfo && (
            <div className={`flex items-center gap-2 ${trendColor}`}>
              <TrendIcon className="w-5 h-5" />
              <span className="text-sm font-medium capitalize">{trendInfo.strength}</span>
            </div>
          )}
        </div>
        {trendInfo && (
          <p className="text-sm text-gray-600">{trendInfo.description}</p>
        )}
      </div>

      {/* Stats Summary */}
      {stats && (
        <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div>
            <div className="text-xs text-gray-600 mb-2">{t('stats.avgMonthly')}</div>
            <div className="text-lg font-bold text-gray-900">
              ${stats.avgSpending.toFixed(0)}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-600 mb-2">{t('stats.lastMonth')}</div>
            <div className="text-lg font-bold text-gray-900">
              ${stats.lastMonth.toFixed(0)}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-600 mb-2">{t('stats.projected')}</div>
            <div className={`text-lg font-bold ${
              stats.changeFromAvg > 0 ? 'text-red-600' : 'text-green-600'
            }`}>
              ${stats.projectedNext.toFixed(0)}
              <span className="text-xs ml-2">
                ({stats.changePercent >= 0 ? '+' : ''}{stats.changePercent.toFixed(1)}%)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} />
          <XAxis
            dataKey="date"
            stroke={palette.grid}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            stroke={palette.grid}
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `$${value.toFixed(0)}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: palette.background,
              border: `1px solid ${palette.grid}`,
              borderRadius: '0.5rem',
            }}
            formatter={(value: any) => [`$${value?.toFixed(2)}`, '']}
          />
          <Legend />

          {/* Actual spending (solid line) */}
          <Line
            type="monotone"
            dataKey="actual"
            stroke={palette.data[9].hex}
            strokeWidth={2}
            dot={{ fill: palette.data[9].hex, r: 4 }}
            name={t('legend.actualSpending')}
          />

          {/* Projected spending (dashed line) */}
          <Line
            type="monotone"
            dataKey="projected"
            stroke={palette.data[4].hex}
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ fill: palette.data[4].hex, r: 4 }}
            name={t('legend.projected')}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-4 text-xs text-gray-500 text-center">
        {t('forecastFooter', { months: monthsBack })}
      </div>
    </div>
  );
}

