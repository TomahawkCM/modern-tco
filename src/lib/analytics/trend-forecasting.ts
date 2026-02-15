/**
 * Trend Forecasting (Phase 4)
 * Task 4.3.1: Add trend lines with projections
 *
 * Linear regression for spending forecasts (30 days forward)
 */

export interface DataPoint {
  x: number; // Time (days from start)
  y: number; // Amount
  date: Date;
}

export interface TrendLine {
  slope: number;
  intercept: number;
  r2: number; // R-squared (goodness of fit)
}

export interface ForecastPoint {
  date: Date;
  projected: number;
  isProjection: boolean;
}

/**
 * Calculate linear regression using least squares method
 */
export function calculateLinearRegression(points: DataPoint[]): TrendLine | null {
  if (points.length < 2) return null;

  const n = points.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;
  let sumY2 = 0;

  for (const point of points) {
    sumX += point.x;
    sumY += point.y;
    sumXY += point.x * point.y;
    sumX2 += point.x * point.x;
    sumY2 += point.y * point.y;
  }

  // Calculate slope and intercept
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Calculate R-squared (coefficient of determination)
  const yMean = sumY / n;
  let ssTotal = 0;
  let ssResidual = 0;

  for (const point of points) {
    const yPredicted = slope * point.x + intercept;
    ssTotal += Math.pow(point.y - yMean, 2);
    ssResidual += Math.pow(point.y - yPredicted, 2);
  }

  const r2 = ssTotal > 0 ? 1 - ssResidual / ssTotal : 0;

  return { slope, intercept, r2 };
}

/**
 * Generate forecast points for the next N days
 */
export function generateForecast(
  historicalData: DataPoint[],
  daysToForecast: number = 30
): ForecastPoint[] {
  const trend = calculateLinearRegression(historicalData);
  if (!trend) return [];

  const forecast: ForecastPoint[] = [];

  // Add historical data with trend line values
  for (const point of historicalData) {
    forecast.push({
      date: point.date,
      projected: trend.slope * point.x + trend.intercept,
      isProjection: false,
    });
  }

  // Generate future projections
  const lastPoint = historicalData[historicalData.length - 1];
  const lastX = lastPoint.x;
  const lastDate = new Date(lastPoint.date);

  for (let i = 1; i <= daysToForecast; i++) {
    const futureX = lastX + i;
    const futureDate = new Date(lastDate);
    futureDate.setDate(futureDate.getDate() + i);

    forecast.push({
      date: futureDate,
      projected: trend.slope * futureX + trend.intercept,
      isProjection: true,
    });
  }

  return forecast;
}

/**
 * Prepare monthly spending data for trend analysis
 */
export function prepareMonthlyTrendData(
  transactions: { date: Date; amount: number }[],
  monthsBack: number = 6
): DataPoint[] {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1);

  // Group by month
  const monthlyTotals = new Map<string, number>();

  for (const tx of transactions) {
    const txDate = new Date(tx.date);
    if (txDate < startDate || tx.amount >= 0) continue; // Only expenses

    const monthKey = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, "0")}`;
    const current = monthlyTotals.get(monthKey) || 0;
    monthlyTotals.set(monthKey, current + Math.abs(tx.amount));
  }

  // Convert to data points
  const dataPoints: DataPoint[] = [];
  const sortedMonths = Array.from(monthlyTotals.keys()).sort();

  sortedMonths.forEach((monthKey, index) => {
    const [year, month] = monthKey.split("-").map(Number);
    const date = new Date(year, month - 1, 15); // Middle of month
    const amount = monthlyTotals.get(monthKey) || 0;

    dataPoints.push({
      x: index,
      y: amount,
      date,
    });
  });

  return dataPoints;
}

/**
 * Prepare daily spending data for trend analysis
 */
export function prepareDailyTrendData(
  transactions: { date: Date; amount: number }[],
  daysBack: number = 30
): DataPoint[] {
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - daysBack);

  // Group by day
  const dailyTotals = new Map<string, number>();

  for (const tx of transactions) {
    const txDate = new Date(tx.date);
    if (txDate < startDate || tx.amount >= 0) continue; // Only expenses

    const dateKey = txDate.toISOString().split("T")[0];
    const current = dailyTotals.get(dateKey) || 0;
    dailyTotals.set(dateKey, current + Math.abs(tx.amount));
  }

  // Convert to data points (include zero-spending days)
  const dataPoints: DataPoint[] = [];
  const currentDate = new Date(startDate);

  for (let i = 0; i <= daysBack; i++) {
    const dateKey = currentDate.toISOString().split("T")[0];
    const amount = dailyTotals.get(dateKey) || 0;

    dataPoints.push({
      x: i,
      y: amount,
      date: new Date(currentDate),
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dataPoints;
}

/**
 * Get trend description for UI display
 */
export function getTrendDescription(trend: TrendLine): {
  direction: "increasing" | "decreasing" | "stable";
  strength: "strong" | "moderate" | "weak";
  description: string;
} {
  const absSlope = Math.abs(trend.slope);
  const direction = trend.slope > 0.5 ? "increasing" : trend.slope < -0.5 ? "decreasing" : "stable";

  const strength = trend.r2 > 0.7 ? "strong" : trend.r2 > 0.4 ? "moderate" : "weak";

  let description = "";

  if (direction === "increasing") {
    description = `Spending is ${strength}ly trending upward`;
    if (strength === "strong") {
      description += ` (${Math.abs(trend.slope).toFixed(0)} per month)`;
    }
  } else if (direction === "decreasing") {
    description = `Spending is ${strength}ly trending downward`;
    if (strength === "strong") {
      description += ` (${Math.abs(trend.slope).toFixed(0)} per month)`;
    }
  } else {
    description = "Spending is relatively stable";
  }

  return { direction, strength, description };
}
