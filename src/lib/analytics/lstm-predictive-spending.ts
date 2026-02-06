/**
 * LSTM Predictive Spending (Phase 3: AI Features)
 * Uses TensorFlow.js LSTM neural network for time-series forecasting
 * 
 * Features:
 * - Monthly spending predictions by category
 * - Confidence intervals
 * - Seasonal pattern detection
 * - Accuracy tracking
 * 
 * Privacy: All processing happens client-side, no data sent to external APIs
 */

import * as tf from '@tensorflow/tfjs';
import type { Transaction } from '@/types/budget';

export interface SpendingPrediction {
  category: string;
  month: Date;
  predictedAmount: number;
  confidenceInterval: {
    lower: number;
    upper: number;
  };
  confidence: number; // 0-1 scale
  seasonalFactor?: number; // Multiplier for seasonal adjustments
}

export interface PredictionAccuracy {
  category: string;
  month: Date;
  predicted: number;
  actual: number;
  error: number;
  errorPercent: number;
  recordedAt: Date;
}

export interface LSTMModelConfig {
  sequenceLength?: number; // Lookback window (default: 6 months)
  epochs?: number; // Training epochs (default: 50)
  batchSize?: number; // Batch size (default: 32)
  learningRate?: number; // Learning rate (default: 0.001)
  units?: number; // LSTM units (default: 64)
  validationSplit?: number; // Validation split (default: 0.2)
}

const DEFAULT_CONFIG: Required<LSTMModelConfig> = {
  sequenceLength: 6,
  epochs: 50,
  batchSize: 32,
  learningRate: 0.001,
  units: 64,
  validationSplit: 0.2,
};

// Model cache to avoid retraining
const modelCache: Map<string, tf.LayersModel> = new Map();

/**
 * Prepare time-series data for LSTM training
 * Groups transactions by month and category
 */
export function prepareTimeSeriesData(
  transactions: Transaction[],
  category: string,
  monthsBack: number = 12
): number[] {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1);
  
  // Group by month
  const monthlyTotals = new Map<string, number>();
  
  for (const tx of transactions) {
    const txDate = new Date(tx.date);
    if (txDate < startDate || tx.amount >= 0) continue; // Only expenses
    if (tx.category !== category) continue;
    
    const monthKey = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, '0')}`;
    const current = monthlyTotals.get(monthKey) || 0;
    monthlyTotals.set(monthKey, current + Math.abs(tx.amount));
  }
  
  // Convert to array, filling missing months with 0
  const data: number[] = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= now) {
    const monthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    data.push(monthlyTotals.get(monthKey) || 0);
    
    currentDate.setMonth(currentDate.getMonth() + 1);
  }
  
  return data;
}

/**
 * Create sequences for LSTM training
 * Converts time series into input/output pairs
 */
function createSequences(
  data: number[],
  sequenceLength: number
): { inputs: number[][]; outputs: number[] } {
  const inputs: number[][] = [];
  const outputs: number[] = [];
  
  for (let i = sequenceLength; i < data.length; i++) {
    inputs.push(data.slice(i - sequenceLength, i));
    outputs.push(data[i]);
  }
  
  return { inputs, outputs };
}

/**
 * Normalize data to [0, 1] range
 */
function normalizeData(data: number[]): { normalized: number[]; min: number; max: number } {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1; // Avoid division by zero
  
  const normalized = data.map((value) => (value - min) / range);
  
  return { normalized, min, max };
}

/**
 * Denormalize data back to original scale
 */
function denormalizeData(
  normalized: number,
  min: number,
  max: number
): number {
  const range = max - min || 1;
  return normalized * range + min;
}

/**
 * Build LSTM model architecture
 */
function buildLSTMModel(
  sequenceLength: number,
  units: number = 64,
  learningRate: number = 0.001
): tf.LayersModel {
  const model = tf.sequential({
    layers: [
      // Input layer
      tf.layers.lstm({
        units,
        returnSequences: true,
        inputShape: [sequenceLength, 1],
      }),
      // Dropout for regularization
      tf.layers.dropout({ rate: 0.2 }),
      // Second LSTM layer
      tf.layers.lstm({
        units: units / 2,
        returnSequences: false,
      }),
      // Dense output layer
      tf.layers.dense({ units: 1 }),
    ],
  });
  
  // Compile model
  model.compile({
    optimizer: tf.train.adam(learningRate),
    loss: 'meanSquaredError',
    metrics: ['meanAbsoluteError'],
  });
  
  return model;
}

/**
 * Train LSTM model for a category
 */
export async function trainLSTMModel(
  transactions: Transaction[],
  category: string,
  config: LSTMModelConfig = {}
): Promise<tf.LayersModel> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  // Check cache
  const cacheKey = `${category}_${finalConfig.sequenceLength}_${finalConfig.units}`;
  if (modelCache.has(cacheKey)) {
    return modelCache.get(cacheKey)!;
  }
  
  // Prepare data
  const rawData = prepareTimeSeriesData(transactions, category, 12);
  
  if (rawData.length < finalConfig.sequenceLength + 1) {
    throw new Error(`Insufficient data: need at least ${finalConfig.sequenceLength + 1} months, got ${rawData.length}`);
  }
  
  // Normalize
  const { normalized, min, max } = normalizeData(rawData);
  
  // Create sequences
  const { inputs, outputs } = createSequences(normalized, finalConfig.sequenceLength);
  
  if (inputs.length === 0) {
    throw new Error('No sequences created from data');
  }
  
  // Convert to tensors
  const inputTensor = tf.tensor3d(
    inputs.map((seq) => seq.map((val) => [val])),
    [inputs.length, finalConfig.sequenceLength, 1]
  );
  const outputTensor = tf.tensor2d(outputs, [outputs.length, 1]);
  
  // Build model
  const model = buildLSTMModel(
    finalConfig.sequenceLength,
    finalConfig.units,
    finalConfig.learningRate
  );
  
  // Train model
  await model.fit(inputTensor, outputTensor, {
    epochs: finalConfig.epochs,
    batchSize: finalConfig.batchSize,
    validationSplit: finalConfig.validationSplit,
    verbose: 0, // Set to 1 for training progress
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        // Optional: log training progress
        if (epoch % 10 === 0) {
          console.log(`[LSTM] Category: ${category}, Epoch: ${epoch}, Loss: ${logs?.loss?.toFixed(4)}`);
        }
      },
    },
  });
  
  // Cache model
  modelCache.set(cacheKey, model);
  
  // Cleanup tensors
  inputTensor.dispose();
  outputTensor.dispose();
  
  return model;
}

/**
 * Generate predictions for next N months
 */
export async function predictSpending(
  transactions: Transaction[],
  category: string,
  monthsAhead: number = 1,
  config: LSTMModelConfig = {}
): Promise<SpendingPrediction[]> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  try {
    // Train or get cached model
    const model = await trainLSTMModel(transactions, category, config);
    
    // Prepare data
    const rawData = prepareTimeSeriesData(transactions, category, 12);
    const { normalized, min, max } = normalizeData(rawData);
    
    // Get last sequence for prediction
    const lastSequence = normalized.slice(-finalConfig.sequenceLength);
    
    const predictions: SpendingPrediction[] = [];
    
    // Generate predictions for each month
    for (let i = 0; i < monthsAhead; i++) {
      // Prepare input
      const inputTensor = tf.tensor3d(
        [lastSequence.map((val) => [val])],
        [1, finalConfig.sequenceLength, 1]
      );
      
      // Predict
      const prediction = model.predict(inputTensor) as tf.Tensor;
      const predictedValue = await prediction.data();
      const predictedNormalized = predictedValue[0];
      
      // Denormalize
      const predictedAmount = Math.max(0, denormalizeData(predictedNormalized, min, max));
      
      // Calculate confidence interval (simplified: based on model uncertainty)
      // In a production system, you'd use Monte Carlo dropout or ensemble methods
      const stdDev = Math.abs(predictedAmount * 0.15); // 15% uncertainty estimate
      const confidenceInterval = {
        lower: Math.max(0, predictedAmount - 1.96 * stdDev), // 95% CI
        upper: predictedAmount + 1.96 * stdDev,
      };
      
      // Calculate confidence (inverse of relative uncertainty)
      const confidence = Math.max(0, Math.min(1, 1 - (stdDev / (predictedAmount || 1))));
      
      // Detect seasonal patterns (simplified: month-based)
      const targetMonth = new Date();
      targetMonth.setMonth(targetMonth.getMonth() + i + 1);
      const seasonalFactor = detectSeasonalFactor(rawData, targetMonth.getMonth());
      
      predictions.push({
        category,
        month: targetMonth,
        predictedAmount,
        confidenceInterval,
        confidence,
        seasonalFactor,
      });
      
      // Update sequence for next prediction (rolling window)
      lastSequence.shift();
      lastSequence.push(predictedNormalized);
      
      // Cleanup
      inputTensor.dispose();
      prediction.dispose();
    }
    
    return predictions;
  } catch (error) {
    console.error(`[LSTM] Error predicting for category ${category}:`, error);
    // Fallback to simple average
    return generateFallbackPrediction(transactions, category, monthsAhead);
  }
}

/**
 * Detect seasonal factor based on historical patterns
 */
function detectSeasonalFactor(data: number[], targetMonth: number): number {
  if (data.length < 12) return 1.0; // Not enough data
  
  // Group by month
  const monthlyAverages = new Map<number, number[]>();
  
  for (let i = 0; i < data.length; i++) {
    const month = i % 12;
    if (!monthlyAverages.has(month)) {
      monthlyAverages.set(month, []);
    }
    monthlyAverages.get(month)!.push(data[i]);
  }
  
  // Calculate average for target month
  const targetMonthData = monthlyAverages.get(targetMonth) || [];
  if (targetMonthData.length === 0) return 1.0;
  
  const targetAvg = targetMonthData.reduce((a, b) => a + b, 0) / targetMonthData.length;
  const overallAvg = data.reduce((a, b) => a + b, 0) / data.length;
  
  return overallAvg > 0 ? targetAvg / overallAvg : 1.0;
}

/**
 * Fallback prediction using simple average
 */
function generateFallbackPrediction(
  transactions: Transaction[],
  category: string,
  monthsAhead: number
): SpendingPrediction[] {
  const monthlyData = prepareTimeSeriesData(transactions, category, 6);
  const avg = monthlyData.reduce((a, b) => a + b, 0) / monthlyData.length || 0;
  
  const predictions: SpendingPrediction[] = [];
  const now = new Date();
  
  for (let i = 0; i < monthsAhead; i++) {
    const targetMonth = new Date(now.getFullYear(), now.getMonth() + i + 1, 1);
    predictions.push({
      category,
      month: targetMonth,
      predictedAmount: avg,
      confidenceInterval: {
        lower: avg * 0.7,
        upper: avg * 1.3,
      },
      confidence: 0.5, // Lower confidence for fallback
    });
  }
  
  return predictions;
}

/**
 * Calculate prediction accuracy by comparing predictions to actuals
 * Optionally stores accuracy data in database
 */
export async function calculatePredictionAccuracy(
  predictions: SpendingPrediction[],
  actualTransactions: Transaction[],
  category: string,
  storeInDb: boolean = true
): Promise<PredictionAccuracy[]> {
  const accuracy: PredictionAccuracy[] = [];
  
  for (const prediction of predictions) {
    // Get actual spending for the month
    const monthStart = new Date(prediction.month.getFullYear(), prediction.month.getMonth(), 1);
    const monthEnd = new Date(prediction.month.getFullYear(), prediction.month.getMonth() + 1, 0);
    
    const actualAmount = actualTransactions
      .filter(
        (tx) =>
          tx.category === category &&
          tx.amount < 0 &&
          new Date(tx.date) >= monthStart &&
          new Date(tx.date) <= monthEnd
      )
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    
    if (actualAmount > 0) {
      const error = Math.abs(prediction.predictedAmount - actualAmount);
      const errorPercent = (error / actualAmount) * 100;
      
      const accuracyRecord: PredictionAccuracy = {
        category,
        month: prediction.month,
        predicted: prediction.predictedAmount,
        actual: actualAmount,
        error,
        errorPercent,
        recordedAt: new Date(),
      };
      
      accuracy.push(accuracyRecord);
      
      // Store in database if requested
      if (storeInDb) {
        try {
          const { storePredictionAccuracy } = await import('@/lib/budget-db');
          await storePredictionAccuracy(accuracyRecord);
        } catch (err) {
          console.warn('[LSTM] Failed to store accuracy:', err);
        }
      }
    }
  }
  
  return accuracy;
}

/**
 * Clear model cache (useful for retraining)
 */
export function clearModelCache(): void {
  modelCache.forEach((model) => model.dispose());
  modelCache.clear();
}

/**
 * Check if predictive spending is enabled based on privacy settings
 */
export function isPredictiveSpendingEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const settings = localStorage.getItem('budget-app-privacy-settings');
    if (settings) {
      const parsed = JSON.parse(settings);
      return parsed.enablePredictiveSpending === true;
    }
  } catch (error) {
    console.warn('[LSTM] Failed to check privacy settings:', error);
  }
  
  return false;
}

