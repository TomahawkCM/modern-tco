/**
 * Predictive Spending Chart Component
 * Displays LSTM-based spending predictions with confidence intervals
 */

'use client';

import { useMemo, useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, AlertCircle, Loader2 } from 'lucide-react';
import { predictSpending, isPredictiveSpendingEnabled, type SpendingPrediction } from '@/lib/analytics/lstm-predictive-spending';
import type { Transaction } from '@/types/budget';
import { useThemeMode } from '@/hooks/useThemeMode';
import { getChartPalette } from '@/lib/budget-chart-colors';

interface PredictiveSpendingChartProps {
  transactions: Transaction[];
  category: string;
  monthsAhead?: number;
  showHistorical?: boolean;
}

export function PredictiveSpendingChart({
  transactions,
  category,
  monthsAhead = 3,
  showHistorical = true,
}: PredictiveSpendingChartProps) {
  // Get theme-aware chart colors
  const theme = useThemeMode();
  const palette = getChartPalette(theme);

  const [predictions, setPredictions] = useState<SpendingPrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPredictions() {
      if (!isPredictiveSpendingEnabled()) {
        setError('Predictive spending is disabled in privacy settings');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const preds = await predictSpending(transactions, category, monthsAhead);
        setPredictions(preds);
      } catch (err) {
        console.error('[PredictiveSpending] Error:', err);
        setError(err instanceof Error ? err.message : 'Failed to generate predictions');
      } finally {
        setIsLoading(false);
      }
    }

    if (transactions.length > 0 && category) {
      loadPredictions();
    }
  }, [transactions, category, monthsAhead]);

  const chartData = useMemo(() => {
    const data: Array<{
      month: string;
      actual?: number;
      predicted?: number;
      lower?: number;
      upper?: number;
      isPrediction: boolean;
    }> = [];

    // Add historical data
    if (showHistorical) {
      const now = new Date();
      const historicalMonths = 6;
      
      for (let i = historicalMonths; i >= 0; i--) {
        const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
        const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
        
        const actual = transactions
          .filter(
            (tx) =>
              tx.category === category &&
              tx.amount < 0 &&
              new Date(tx.date) >= monthStart &&
              new Date(tx.date) <= monthEnd
          )
          .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

        data.push({
          month: month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          actual: actual > 0 ? actual : undefined,
          isPrediction: false,
        });
      }
    }

    // Add predictions
    predictions.forEach((pred) => {
      data.push({
        month: pred.month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        predicted: pred.predictedAmount,
        lower: pred.confidenceInterval.lower,
        upper: pred.confidenceInterval.upper,
        isPrediction: true,
      });
    });

    return data;
  }, [transactions, category, predictions, showHistorical]);

  if (error) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-yellow-900 mb-1">Prediction Unavailable</h3>
            <p className="text-sm text-yellow-800">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Training model and generating predictions...</p>
        </div>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <p className="text-gray-600">No data available for predictions</p>
      </div>
    );
  }

  const avgConfidence = predictions.length > 0
    ? predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length
    : 0;

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-xs text-gray-600 mb-1">Next Month</p>
          <p className="text-2xl font-bold text-gray-900">
            ${predictions[0]?.predictedAmount.toFixed(0) || '0'}
          </p>
          {predictions[0] && (
            <p className="text-xs text-gray-500 mt-1">
              ±${((predictions[0].confidenceInterval.upper - predictions[0].confidenceInterval.lower) / 2).toFixed(0)}
            </p>
          )}
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-xs text-gray-600 mb-1">Avg Confidence</p>
          <p className="text-2xl font-bold text-teal-600">
            {(avgConfidence * 100).toFixed(0)}%
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-xs text-gray-600 mb-1">3-Month Avg</p>
          <p className="text-2xl font-bold text-gray-900">
            ${predictions.length > 0
              ? (predictions.slice(0, 3).reduce((sum, p) => sum + p.predictedAmount, 0) / Math.min(3, predictions.length)).toFixed(0)
              : '0'}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Spending Forecast: {category}
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} />
            <XAxis
              dataKey="month"
              stroke={palette.grid}
              fontSize={12}
              tick={{ fill: palette.text }}
            />
            <YAxis
              stroke={palette.grid}
              fontSize={12}
              tick={{ fill: palette.text }}
              tickFormatter={(value) => `$${value.toFixed(0)}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: palette.background,
                border: `1px solid ${palette.grid}`,
                borderRadius: '8px',
              }}
              formatter={(value: number, name: string) => [
                `$${value.toFixed(2)}`,
                name === 'actual' ? 'Actual' : name === 'predicted' ? 'Predicted' : name,
              ]}
            />
            <Legend />

            {/* Confidence interval area */}
            {predictions.length > 0 && (
              <Area
                type="monotone"
                dataKey="upper"
                stroke="none"
                fill={palette.data[1].hex}
                fillOpacity={0.1}
                name="Confidence Interval"
              />
            )}

            {/* Actual spending line */}
            {showHistorical && (
              <Line
                type="monotone"
                dataKey="actual"
                stroke={palette.positive.hex}
                strokeWidth={2}
                dot={{ fill: palette.positive.hex, r: 4 }}
                name="Actual"
              />
            )}

            {/* Predicted spending line */}
            {predictions.length > 0 && (
              <Line
                type="monotone"
                dataKey="predicted"
                stroke={palette.data[1].hex}
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: palette.data[1].hex, r: 4 }}
                name="Predicted"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Predictions Table */}
      {predictions.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900">Monthly Predictions</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Month</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-700">Predicted</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-700">Range</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-700">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {predictions.map((pred, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {pred.month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                      ${pred.predictedAmount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 text-right">
                      ${pred.confidenceInterval.lower.toFixed(0)} - ${pred.confidenceInterval.upper.toFixed(0)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          pred.confidence > 0.7
                            ? 'bg-green-100 text-green-800'
                            : pred.confidence > 0.5
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {(pred.confidence * 100).toFixed(0)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

