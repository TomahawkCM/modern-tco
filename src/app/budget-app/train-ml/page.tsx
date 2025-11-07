'use client';

/**
 * ML Model Training Page
 * Phase 5.2.1: Train ML categorization model
 * Admin utility to train and test the ML model
 */

import { useState } from 'react';
import { getMLCategorizer } from '@/lib/categorization/ml-categorizer';
import { Brain, Zap, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function TrainMLPage() {
  const [isTraining, setIsTraining] = useState(false);
  const [trainingComplete, setTrainingComplete] = useState(false);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [loss, setLoss] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Array<{
    input: string;
    predicted: string;
    confidence: number;
  }>>([]);

  async function handleTrain() {
    setIsTraining(true);
    setError(null);
    setTrainingComplete(false);

    try {
      const categorizer = getMLCategorizer();

      // Train the model
      const result = await categorizer.train();

      setAccuracy(result.accuracy);
      setLoss(result.loss);
      setTrainingComplete(true);

      // Save model to IndexedDB
      await categorizer.saveModel();

      // Run some test predictions
      const testInputs = [
        'TIM HORTONS #1234',
        'METRO GROCERY TORONTO',
        'NETFLIX.COM',
        'ESSO GAS STATION',
        'AMAZON.CA PURCHASE',
        'ROGERS WIRELESS BILL',
      ];

      const results = [];
      for (const input of testInputs) {
        const prediction = await categorizer.predict(input);
        if (prediction) {
          results.push({
            input,
            predicted: prediction.category,
            confidence: prediction.confidence,
          });
        }
      }

      setTestResults(results);
    } catch (err) {
      console.error('Training error:', err);
      setError(err instanceof Error ? err.message : 'Training failed');
      setIsTraining(false);
    } finally {
      setIsTraining(false);
    }
  }

  async function handleLoadModel() {
    try {
      const categorizer = getMLCategorizer();
      const loaded = await categorizer.loadModel();

      if (loaded) {
        alert('Model loaded successfully!');
      } else {
        alert('No saved model found. Please train first.');
      }
    } catch (err) {
      alert('Failed to load model: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Brain className="w-8 h-8 text-teal-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">ML Categorization Model</h1>
              <p className="text-sm text-gray-600">Train a neural network to categorize transactions</p>
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-2">
              <Zap className="w-5 h-5 text-gray-700 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-gray-900">
                <p className="font-medium mb-2">How it works:</p>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Generates ~350 training examples from 35 categorization rules</li>
                  <li>Trains a neural network (64→32 neurons) using TensorFlow.js</li>
                  <li>Achieves 90%+ accuracy on test set</li>
                  <li>Saves model to IndexedDB for fast predictions</li>
                  <li>Fallback for transactions that don't match rules</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Training Controls */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={handleTrain}
              disabled={isTraining}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isTraining ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Training Model...</span>
                </>
              ) : (
                <>
                  <Brain className="w-5 h-5" />
                  <span>Train Model</span>
                </>
              )}
            </button>

            <button
              onClick={handleLoadModel}
              disabled={isTraining}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Load Saved Model
            </button>
          </div>

          {/* Training Progress */}
          {isTraining && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-2">Training in progress... This may take 30-60 seconds.</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-teal-500 h-2 rounded-full animate-pulse" style={{ width: '100%' }} />
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-900">Training Failed</p>
                <p className="text-sm text-red-800 mt-2">{error}</p>
              </div>
            </div>
          )}

          {/* Training Results */}
          {trainingComplete && accuracy !== null && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-900">Training Complete!</p>
                  <p className="text-sm text-green-800 mt-2">
                    Model saved to IndexedDB and ready for predictions.
                  </p>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-2">Test Accuracy</p>
                  <p className="text-3xl font-bold text-teal-600">{(accuracy * 100).toFixed(1)}%</p>
                  <p className="text-xs text-gray-500 mt-2">Target: ≥90%</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-2">Final Loss</p>
                  <p className="text-3xl font-bold text-gray-900">{loss?.toFixed(4)}</p>
                  <p className="text-xs text-gray-500 mt-2">Lower is better</p>
                </div>
              </div>

              {/* Test Predictions */}
              {testResults.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Test Predictions</h3>
                  <div className="space-y-2">
                    {testResults.map((result, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{result.input}</p>
                            <p className="text-xs text-gray-600 mt-2">
                              → <span className="font-medium text-teal-600">{result.predicted}</span>
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">Confidence</p>
                            <p className="text-sm font-bold text-gray-900">
                              {(result.confidence * 100).toFixed(0)}%
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Documentation */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">How to Use</h2>
          <div className="space-y-2 text-sm text-gray-700">
            <p><strong>1. Train Model:</strong> Click "Train Model" to generate training data and train the neural network (30-60s)</p>
            <p><strong>2. Automatic Integration:</strong> The model is automatically used as a fallback when rule-based categorization fails</p>
            <p><strong>3. Hybrid System:</strong> Rules are tried first (fast), ML is used for unknown patterns</p>
            <p><strong>4. Model Persistence:</strong> Trained model is saved to IndexedDB and loads automatically</p>
            <p><strong>5. Retraining:</strong> Run training again to update the model with new data</p>
          </div>
        </div>
      </div>
    </div>
  );
}
