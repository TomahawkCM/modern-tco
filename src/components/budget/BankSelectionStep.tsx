/**
 * Enhanced Bank Selection Step
 * Shows detected bank with confidence score and alternative suggestions
 */

import { useState } from "react";
import { AlertCircle, CheckCircle, HelpCircle, Building2 } from "lucide-react";
import { BANK_CONFIGS, type BankDetectionResult } from "@/lib/parsers/csv-parser";

interface BankSelectionStepProps {
  detectionResult: BankDetectionResult | null;
  selectedBank: string;
  onSelectBank: (bankKey: string) => void;
  onContinue: () => void;
  onBack: () => void;
}

export function BankSelectionStep({
  detectionResult,
  selectedBank,
  onSelectBank,
  onContinue,
  onBack,
}: BankSelectionStepProps) {
  const [showAllBanks, setShowAllBanks] = useState(false);

  // Get confidence level description
  function getConfidenceLevel(confidence: number): {
    label: string;
    color: string;
    description: string;
  } {
    if (confidence >= 0.9) {
      return {
        label: "Very High",
        color: "text-green-600 bg-green-100",
        description: "Perfect match - we're confident this is the correct bank format",
      };
    } else if (confidence >= 0.7) {
      return {
        label: "High",
        color: "text-blue-600 bg-blue-100",
        description: "Strong match - this bank format is very likely correct",
      };
    } else if (confidence >= 0.5) {
      return {
        label: "Medium",
        color: "text-yellow-600 bg-yellow-100",
        description: "Possible match - please verify this is your bank",
      };
    } else {
      return {
        label: "Low",
        color: "text-red-600 bg-red-100",
        description: "Uncertain - please select your bank manually",
      };
    }
  }

  const confidenceInfo = detectionResult ? getConfidenceLevel(detectionResult.confidence) : null;

  return (
    <div className="space-y-6">
      {/* Auto-Detection Result */}
      {detectionResult && detectionResult.bank && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-md">
          <div className="flex items-start gap-4">
            <div
              className={`h-12 w-12 flex-shrink-0 rounded-full ${confidenceInfo?.color} flex items-center justify-center`}
            >
              {detectionResult.confidence >= 0.7 ? (
                <CheckCircle className="h-6 w-6" />
              ) : detectionResult.confidence >= 0.5 ? (
                <HelpCircle className="h-6 w-6" />
              ) : (
                <AlertCircle className="h-6 w-6" />
              )}
            </div>

            <div className="flex-1">
              <div className="mb-2 flex items-center gap-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  {BANK_CONFIGS[detectionResult.bank]?.name || detectionResult.bank}
                </h3>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${confidenceInfo?.color}`}
                >
                  {(detectionResult.confidence * 100).toFixed(0)}% {confidenceInfo?.label}{" "}
                  Confidence
                </span>
                <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-500">
                  {detectionResult.detectionMethod === "exact"
                    ? "Exact Match"
                    : detectionResult.detectionMethod === "fuzzy"
                      ? "Fuzzy Match"
                      : "Pattern Match"}
                </span>
              </div>

              <p className="mb-3 text-sm text-gray-600">{confidenceInfo?.description}</p>

              {/* Detection Details */}
              <div className="rounded bg-gray-50 p-3 text-xs text-gray-500">
                <p className="mb-1 font-medium">Detected Columns:</p>
                <ul className="list-inside list-disc space-y-1">
                  <li>Date: {BANK_CONFIGS[detectionResult.bank]?.dateColumn}</li>
                  <li>Description: {BANK_CONFIGS[detectionResult.bank]?.descriptionColumn}</li>
                  <li>Amount: {BANK_CONFIGS[detectionResult.bank]?.amountColumn}</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => {
                    onSelectBank(detectionResult.bank!);
                  }}
                  className={`rounded-lg px-4 py-2 font-medium transition-colors ${
                    selectedBank === detectionResult.bank
                      ? "bg-teal-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {selectedBank === detectionResult.bank ? "Selected ✓" : "Use This Bank"}
                </button>
                {detectionResult.confidence < 0.9 && (
                  <button
                    onClick={() => setShowAllBanks(true)}
                    className="rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    Choose Different Bank
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Alternative Suggestions */}
          {detectionResult.alternatives && detectionResult.alternatives.length > 0 && (
            <div className="mt-6 border-t border-gray-200 pt-6">
              <h4 className="mb-3 text-sm font-medium text-gray-700">Alternative Matches:</h4>
              <div className="space-y-2">
                {detectionResult.alternatives.map((alt) => (
                  <div
                    key={alt.bank}
                    className="flex cursor-pointer items-center justify-between rounded bg-gray-50 p-3 transition-colors hover:bg-gray-100"
                    onClick={() => onSelectBank(alt.bank)}
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {BANK_CONFIGS[alt.bank]?.name || alt.bank}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-500">{alt.reason}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-600">
                        {(alt.confidence * 100).toFixed(0)}% match
                      </span>
                      {selectedBank === alt.bank && (
                        <CheckCircle className="h-5 w-5 text-teal-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Manual Bank Selection */}
      {(!detectionResult?.bank || showAllBanks) && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-md">
          <div className="mb-4 flex items-center gap-3">
            <Building2 className="h-6 w-6 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900">
              {showAllBanks ? "Choose Your Bank" : "Select Your Bank"}
            </h3>
          </div>

          {!detectionResult?.bank && (
            <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <div className="flex gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    Unable to auto-detect bank format
                  </p>
                  <p className="mt-1 text-xs text-yellow-700">
                    Please select your bank manually from the list below.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Bank List - Group by Country */}
          <div className="space-y-6">
            {/* Canadian Banks */}
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                🇨🇦 Canadian Banks
              </h4>
              <div className="grid gap-2">
                {[
                  "bmo",
                  "homeTrust",
                  "td",
                  "tdSplit",
                  "rbc",
                  "rbcSplit",
                  "scotiabank",
                  "scotiabankSplit",
                  "cibc",
                  "cibcSplit",
                  "tangerine",
                  "simplii",
                ].map((bankKey) => {
                  const bank = BANK_CONFIGS[bankKey];
                  return (
                    <button
                      key={bankKey}
                      onClick={() => {
                        onSelectBank(bankKey);
                        setShowAllBanks(false);
                      }}
                      className={`w-full rounded-lg border-2 px-4 py-3 text-left transition-all ${
                        selectedBank === bankKey
                          ? "border-teal-600 bg-teal-50"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">{bank.name}</span>
                        {selectedBank === bankKey && (
                          <CheckCircle className="h-5 w-5 text-teal-600" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* American Banks */}
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                🇺🇸 American Banks
              </h4>
              <div className="grid gap-2">
                {[
                  "bankOfAmerica",
                  "chaseCredit",
                  "chaseChecking",
                  "capitalOne",
                  "capitalOneSingle",
                  "wellsFargo",
                  "citibank",
                  "usBank",
                ].map((bankKey) => {
                  const bank = BANK_CONFIGS[bankKey];
                  return (
                    <button
                      key={bankKey}
                      onClick={() => {
                        onSelectBank(bankKey);
                        setShowAllBanks(false);
                      }}
                      className={`w-full rounded-lg border-2 px-4 py-3 text-left transition-all ${
                        selectedBank === bankKey
                          ? "border-teal-600 bg-teal-50"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">{bank.name}</span>
                        {selectedBank === bankKey && (
                          <CheckCircle className="h-5 w-5 text-teal-600" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 transition-colors hover:bg-gray-50"
        >
          Back
        </button>
        <button
          onClick={onContinue}
          disabled={!selectedBank || selectedBank === "auto"}
          className="rounded-lg bg-teal-600 px-6 py-2 text-white transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          Continue to Preview
        </button>
      </div>
    </div>
  );
}
