"use client";

/**
 * ML Model Training Page
 * Phase 5.2.1: Train ML categorization model
 * Admin utility to train and test the ML model
 *
 * PERFORMANCE: TensorFlow.js (37MB) is lazy-loaded only when this page is accessed
 */

import { useState } from "react";
import { Brain, Zap, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

export default function TrainMLPage() {
  const t = useTranslations("trainMl");
  const [isTraining, setIsTraining] = useState(false);
  const [trainingComplete, setTrainingComplete] = useState(false);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [loss, setLoss] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<
    Array<{
      input: string;
      predicted: string;
      confidence: number;
    }>
  >([]);

  async function handleTrain() {
    setIsTraining(true);
    setError(null);
    setTrainingComplete(false);

    try {
      // Lazy load TensorFlow.js (37MB) only when training is initiated
      const { getMLCategorizer } = await import("@/lib/categorization/ml-categorizer");
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
        "TIM HORTONS #1234",
        "METRO GROCERY TORONTO",
        "NETFLIX.COM",
        "ESSO GAS STATION",
        "AMAZON.CA PURCHASE",
        "ROGERS WIRELESS BILL",
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
      console.error("Training error:", err);
      setError(err instanceof Error ? err.message : "Training failed");
      setIsTraining(false);
    } finally {
      setIsTraining(false);
    }
  }

  async function handleLoadModel() {
    try {
      // Lazy load TensorFlow.js only when loading model
      const { getMLCategorizer } = await import("@/lib/categorization/ml-categorizer");
      const categorizer = getMLCategorizer();
      const loaded = await categorizer.loadModel();

      if (loaded) {
        alert(t("modelLoadedSuccess"));
      } else {
        alert(t("noSavedModel"));
      }
    } catch (err) {
      alert(
        t("failedToLoadModel", { error: err instanceof Error ? err.message : t("unknownError") })
      );
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          {/* Header */}
          <div className="mb-6 flex items-center gap-4">
            <Brain className="h-8 w-8 text-teal-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
              <p className="text-sm text-gray-600">{t("subtitle")}</p>
            </div>
          </div>

          {/* Info Card */}
          <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-start gap-2">
              <Zap className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-700" />
              <div className="text-sm text-gray-900">
                <p className="mb-2 font-medium">{t("howItWorks")}:</p>
                <ul className="list-inside list-disc space-y-2 text-gray-700">
                  <li>{t("howStep1")}</li>
                  <li>{t("howStep2")}</li>
                  <li>{t("howStep3")}</li>
                  <li>{t("howStep4")}</li>
                  <li>{t("howStep5")}</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Training Controls */}
          <div className="mb-6 flex gap-4">
            <button
              onClick={handleTrain}
              disabled={isTraining}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-teal-500 px-4 py-2 font-medium text-white transition-colors hover:bg-teal-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isTraining ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>{t("trainingModel")}</span>
                </>
              ) : (
                <>
                  <Brain className="h-5 w-5" />
                  <span>{t("trainModel")}</span>
                </>
              )}
            </button>

            <button
              onClick={handleLoadModel}
              disabled={isTraining}
              className="rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t("loadSavedModel")}
            </button>
          </div>

          {/* Training Progress */}
          {isTraining && (
            <div className="mb-6 rounded-lg bg-gray-50 p-4">
              <p className="mb-2 text-sm text-gray-600">{t("trainingInProgress")}</p>
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div
                  className="h-2 animate-pulse rounded-full bg-teal-500"
                  style={{ width: "100%" }}
                />
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-6 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-4">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
              <div>
                <p className="text-sm font-medium text-red-900">{t("trainingFailed")}</p>
                <p className="mt-2 text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Training Results */}
          {trainingComplete && accuracy !== null && (
            <div className="space-y-4">
              <div className="flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 p-4">
                <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-900">{t("trainingComplete")}</p>
                  <p className="mt-2 text-sm text-green-800">{t("modelSavedReady")}</p>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                  <p className="mb-2 text-sm text-gray-600">{t("testAccuracy")}</p>
                  <p className="text-3xl font-bold text-teal-600">{(accuracy * 100).toFixed(1)}%</p>
                  <p className="mt-2 text-xs text-gray-500">{t("targetAccuracy")}</p>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-4">
                  <p className="mb-2 text-sm text-gray-600">{t("finalLoss")}</p>
                  <p className="text-3xl font-bold text-gray-900">{loss?.toFixed(4)}</p>
                  <p className="mt-2 text-xs text-gray-500">{t("lowerIsBetter")}</p>
                </div>
              </div>

              {/* Test Predictions */}
              {testResults.length > 0 && (
                <div>
                  <h3 className="mb-4 text-sm font-medium text-gray-900">{t("testPredictions")}</h3>
                  <div className="space-y-2">
                    {testResults.map((result, index) => (
                      <div key={index} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{result.input}</p>
                            <p className="mt-2 text-xs text-gray-600">
                              →{" "}
                              <span className="font-medium text-teal-600">{result.predicted}</span>
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">{t("confidence")}</p>
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
        <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-gray-900">{t("howToUse")}</h2>
          <div className="space-y-2 text-sm text-gray-700">
            <p>{t("useStep1")}</p>
            <p>{t("useStep2")}</p>
            <p>{t("useStep3")}</p>
            <p>{t("useStep4")}</p>
            <p>{t("useStep5")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
