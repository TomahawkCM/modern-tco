/**
 * Enhanced Bank Selection Step
 * Shows detected bank with confidence score and alternative suggestions
 */

import { useState } from 'react';
import { AlertCircle, CheckCircle, HelpCircle, Building2 } from 'lucide-react';
import { BANK_CONFIGS, type BankDetectionResult } from '@/lib/parsers/csv-parser';

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
        label: 'Very High',
        color: 'text-green-600 bg-green-100',
        description: 'Perfect match - we\'re confident this is the correct bank format',
      };
    } else if (confidence >= 0.7) {
      return {
        label: 'High',
        color: 'text-blue-600 bg-blue-100',
        description: 'Strong match - this bank format is very likely correct',
      };
    } else if (confidence >= 0.5) {
      return {
        label: 'Medium',
        color: 'text-yellow-600 bg-yellow-100',
        description: 'Possible match - please verify this is your bank',
      };
    } else {
      return {
        label: 'Low',
        color: 'text-red-600 bg-red-100',
        description: 'Uncertain - please select your bank manually',
      };
    }
  }

  const confidenceInfo = detectionResult
    ? getConfidenceLevel(detectionResult.confidence)
    : null;

  return (
    <div className="space-y-6">
      {/* Auto-Detection Result */}
      {detectionResult && detectionResult.bank && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-start gap-4">
            <div className={`flex-shrink-0 w-12 h-12 rounded-full ${confidenceInfo?.color} flex items-center justify-center`}>
              {detectionResult.confidence >= 0.7 ? (
                <CheckCircle className="w-6 h-6" />
              ) : detectionResult.confidence >= 0.5 ? (
                <HelpCircle className="w-6 h-6" />
              ) : (
                <AlertCircle className="w-6 h-6" />
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {BANK_CONFIGS[detectionResult.bank]?.name || detectionResult.bank}
                </h3>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${confidenceInfo?.color}`}>
                  {(detectionResult.confidence * 100).toFixed(0)}% {confidenceInfo?.label} Confidence
                </span>
                <span className="text-xs text-gray-500 px-2 py-1 rounded bg-gray-100">
                  {detectionResult.detectionMethod === 'exact'
                    ? 'Exact Match'
                    : detectionResult.detectionMethod === 'fuzzy'
                    ? 'Fuzzy Match'
                    : 'Pattern Match'}
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-3">{confidenceInfo?.description}</p>

              {/* Detection Details */}
              <div className="text-xs text-gray-500 bg-gray-50 rounded p-3">
                <p className="font-medium mb-1">Detected Columns:</p>
                <ul className="list-disc list-inside space-y-1">
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
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedBank === detectionResult.bank
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {selectedBank === detectionResult.bank ? 'Selected ✓' : 'Use This Bank'}
                </button>
                {detectionResult.confidence < 0.9 && (
                  <button
                    onClick={() => setShowAllBanks(true)}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                  >
                    Choose Different Bank
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Alternative Suggestions */}
          {detectionResult.alternatives && detectionResult.alternatives.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Alternative Matches:</h4>
              <div className="space-y-2">
                {detectionResult.alternatives.map((alt) => (
                  <div
                    key={alt.bank}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => onSelectBank(alt.bank)}
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {BANK_CONFIGS[alt.bank]?.name || alt.bank}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{alt.reason}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-600">
                        {(alt.confidence * 100).toFixed(0)}% match
                      </span>
                      {selectedBank === alt.bank && (
                        <CheckCircle className="w-5 h-5 text-teal-600" />
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
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Building2 className="w-6 h-6 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900">
              {showAllBanks ? 'Choose Your Bank' : 'Select Your Bank'}
            </h3>
          </div>

          {!detectionResult?.bank && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">Unable to auto-detect bank format</p>
                  <p className="text-xs text-yellow-700 mt-1">
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
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                🇨🇦 Canadian Banks
              </h4>
              <div className="grid gap-2">
                {['bmo', 'homeTrust', 'td', 'tdSplit', 'rbc', 'rbcSplit', 'scotiabank', 'scotiabankSplit', 'cibc', 'cibcSplit', 'tangerine', 'simplii'].map(
                  (bankKey) => {
                    const bank = BANK_CONFIGS[bankKey];
                    return (
                      <button
                        key={bankKey}
                        onClick={() => {
                          onSelectBank(bankKey);
                          setShowAllBanks(false);
                        }}
                        className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                          selectedBank === bankKey
                            ? 'border-teal-600 bg-teal-50'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">{bank.name}</span>
                          {selectedBank === bankKey && (
                            <CheckCircle className="w-5 h-5 text-teal-600" />
                          )}
                        </div>
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* American Banks */}
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                🇺🇸 American Banks
              </h4>
              <div className="grid gap-2">
                {['bankOfAmerica', 'chaseCredit', 'chaseChecking', 'capitalOne', 'capitalOneSingle', 'wellsFargo', 'citibank', 'usBank'].map(
                  (bankKey) => {
                    const bank = BANK_CONFIGS[bankKey];
                    return (
                      <button
                        key={bankKey}
                        onClick={() => {
                          onSelectBank(bankKey);
                          setShowAllBanks(false);
                        }}
                        className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                          selectedBank === bankKey
                            ? 'border-teal-600 bg-teal-50'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">{bank.name}</span>
                          {selectedBank === bankKey && (
                            <CheckCircle className="w-5 h-5 text-teal-600" />
                          )}
                        </div>
                      </button>
                    );
                  }
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={onContinue}
          disabled={!selectedBank || selectedBank === 'auto'}
          className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          Continue to Preview
        </button>
      </div>
    </div>
  );
}
