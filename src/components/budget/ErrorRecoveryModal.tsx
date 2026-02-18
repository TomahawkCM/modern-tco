/**
 * Error Recovery Modal
 * Interactive UI for recovering from import failures
 *
 * Features:
 * - Clear error explanation
 * - Prioritized recovery suggestions
 * - One-click auto-fix buttons
 * - Manual action guidance
 * - Technical details for advanced users
 */

"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { X, AlertTriangle, Zap, ChevronDown, ChevronRight, RefreshCw } from "lucide-react";
import type { ErrorAnalysisResult, RecoverySuggestion } from "@/lib/ai/smart-error-recovery";

// ============================================================================
// Types
// ============================================================================

export interface ErrorRecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  errorAnalysis: ErrorAnalysisResult | null;
  onAutoFix: (suggestion: RecoverySuggestion) => void;
  onManualAction: (suggestion: RecoverySuggestion) => void;
  isFixing: boolean;
}

// ============================================================================
// Component
// ============================================================================

export default function ErrorRecoveryModal({
  isOpen,
  onClose,
  errorAnalysis,
  onAutoFix,
  onManualAction,
  isFixing,
}: ErrorRecoveryModalProps) {
  const t = useTranslations("errorRecovery");
  const [expandedSuggestion, setExpandedSuggestion] = useState<number | null>(null);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  if (!isOpen || !errorAnalysis) return null;

  const severityColor = {
    low: "text-yellow-600 bg-yellow-100",
    medium: "text-orange-600 bg-orange-100",
    high: "text-red-600 bg-red-100",
  }[errorAnalysis.severity];

  const severityIcon = {
    low: "⚠️",
    medium: "⚠️",
    high: "🚨",
  }[errorAnalysis.severity];

  const categoryDisplay = errorAnalysis.category
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="border-b border-gray-200 bg-gradient-to-r from-red-50 to-orange-50 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{t("title")}</h2>
                <p className="mt-1 text-sm text-gray-600">{t("subtitle")}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 transition-colors hover:bg-white"
              aria-label={t("closeModal")}
            >
              <X className="h-6 w-6 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          {/* Error Summary */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{t("summary.title")}</h3>
                <p className="mt-1 text-sm text-gray-600">
                  {t("summary.category", { category: categoryDisplay })}
                </p>
              </div>
              <div className={`rounded-lg px-3 py-1 font-semibold ${severityColor}`}>
                {severityIcon} {errorAnalysis.severity.toUpperCase()}
              </div>
            </div>

            {/* Detected Issues */}
            {errorAnalysis.detectedIssues.length > 0 && (
              <div className="mt-3 space-y-2">
                {errorAnalysis.detectedIssues.map((issue, i) => (
                  <div
                    key={i}
                    className="rounded border border-gray-200 bg-white p-3 text-sm text-gray-700"
                  >
                    {issue}
                  </div>
                ))}
              </div>
            )}

            {/* AI Explanation */}
            {errorAnalysis.aiAnalysis && (
              <div className="mt-3 border-s-4 border-blue-400 bg-blue-50 p-3 text-sm text-blue-800">
                <strong>{t("aiAnalysis")}</strong> {errorAnalysis.aiAnalysis}
              </div>
            )}
          </div>

          {/* Recovery Status */}
          {errorAnalysis.canRecover ? (
            <div className="border-s-4 border-green-400 bg-green-50 p-4 text-sm text-green-800">
              ✅ {t("recovery.canRecover", { count: errorAnalysis.suggestions.length })}
            </div>
          ) : (
            <div className="border-s-4 border-red-400 bg-red-50 p-4 text-sm text-red-800">
              ❌ {t("recovery.cannotRecover")}
            </div>
          )}

          {/* Recovery Suggestions */}
          {errorAnalysis.suggestions.length > 0 && (
            <div>
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                {t("recovery.optionsTitle")}
              </h3>
              <div className="space-y-3">
                {errorAnalysis.suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="overflow-hidden rounded-lg border border-gray-200 bg-white transition-colors hover:border-teal-300"
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="mb-2 flex items-center gap-2">
                            <h4 className="font-semibold text-gray-900">{suggestion.title}</h4>
                            {suggestion.autoFixable && (
                              <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">
                                <Zap className="me-1 inline h-3 w-3" />
                                {t("suggestions.autoFix")}
                              </span>
                            )}
                            <span
                              className={`rounded px-2 py-0.5 text-xs font-semibold ${
                                suggestion.confidence >= 0.9
                                  ? "bg-green-100 text-green-800"
                                  : suggestion.confidence >= 0.7
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-orange-100 text-orange-800"
                              }`}
                            >
                              {t("suggestions.confidence", {
                                percent: (suggestion.confidence * 100).toFixed(0),
                              })}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{suggestion.description}</p>

                          {/* Technical Details (Expandable) */}
                          {suggestion.technicalDetails && (
                            <button
                              onClick={() =>
                                setExpandedSuggestion(expandedSuggestion === index ? null : index)
                              }
                              className="mt-2 flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700"
                            >
                              {expandedSuggestion === index ? (
                                <ChevronDown className="h-3 w-3" />
                              ) : (
                                <ChevronRight className="h-3 w-3" />
                              )}
                              {t("suggestions.technicalDetails")}
                            </button>
                          )}

                          {expandedSuggestion === index && suggestion.technicalDetails && (
                            <div className="mt-2 rounded border border-gray-200 bg-gray-50 p-2 text-xs text-gray-600">
                              {suggestion.technicalDetails}
                            </div>
                          )}
                        </div>

                        {/* Action Button */}
                        <div className="ms-4">
                          {suggestion.autoFixable ? (
                            <button
                              onClick={() => onAutoFix(suggestion)}
                              disabled={isFixing}
                              className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-white transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                            >
                              {isFixing ? (
                                <>
                                  <RefreshCw className="h-4 w-4 animate-spin" />
                                  {t("suggestions.fixing")}
                                </>
                              ) : (
                                <>
                                  <Zap className="h-4 w-4" />
                                  {suggestion.actionLabel || t("suggestions.autoFixButton")}
                                </>
                              )}
                            </button>
                          ) : (
                            <button
                              onClick={() => onManualAction(suggestion)}
                              disabled={isFixing}
                              className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                            >
                              {suggestion.actionLabel || t("suggestions.learnMore")}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Technical Details Section */}
          <div className="border-t border-gray-200 pt-4">
            <button
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
            >
              {showTechnicalDetails ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              {t("technical.title")}
            </button>

            {showTechnicalDetails && (
              <div className="mt-3 rounded border border-gray-200 bg-gray-50 p-4 font-mono text-xs text-gray-700">
                <div>
                  <strong>{t("technical.errorCategory")}</strong> {errorAnalysis.category}
                </div>
                <div className="mt-2">
                  <strong>{t("technical.severity")}</strong> {errorAnalysis.severity}
                </div>
                <div className="mt-2">
                  <strong>{t("technical.canRecover")}</strong>{" "}
                  {errorAnalysis.canRecover ? t("technical.yes") : t("technical.no")}
                </div>
                <div className="mt-2">
                  <strong>{t("technical.suggestions")}</strong> {errorAnalysis.suggestions.length}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between border-t border-gray-200 bg-gray-50 p-6">
          <button
            onClick={onClose}
            className="rounded-lg border-2 border-gray-300 px-6 py-2 text-gray-700 transition-colors hover:bg-gray-100"
          >
            {t("footer.close")}
          </button>
          <div className="text-sm text-gray-600">
            {t("footer.needHelp")}{" "}
            <a href="/docs/import-troubleshooting" className="text-teal-600 hover:underline">
              {t("footer.viewGuide")}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
