/**
 * Validation Warnings Modal
 * Displays transaction validation issues with review/fix options
 *
 * Features:
 * - Categorized issues (Critical, Warning, Info)
 * - Transaction preview for each issue
 * - Review options (Ignore, Remove, Continue)
 * - Summary statistics
 * - Non-blocking (user decides whether to proceed)
 */

"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { X, AlertTriangle, AlertCircle, Info, CheckCircle, Trash2 } from "lucide-react";
import type { ValidationResult, ValidationIssue } from "@/lib/ai/smart-transaction-validator";
import type { ParsedTransaction } from "@/types/budget";

// ============================================================================
// Types
// ============================================================================

export interface ValidationWarningsModalProps {
  isOpen: boolean;
  onClose: () => void;
  validationResult: ValidationResult | null;
  onProceed: (transactionsToRemove: number[]) => void; // Indices of transactions to remove
  onCancel: () => void;
}

// ============================================================================
// Component
// ============================================================================

export default function ValidationWarningsModal({
  isOpen,
  onClose,
  validationResult,
  onProceed,
  onCancel,
}: ValidationWarningsModalProps) {
  const t = useTranslations("validationWarnings");
  const locale = useLocale();
  const [transactionsToRemove, setTransactionsToRemove] = useState<Set<number>>(new Set());
  const [expandedIssue, setExpandedIssue] = useState<number | null>(null);

  if (!isOpen || !validationResult) return null;

  const { criticalCount, warningCount, infoCount, issues, aiAnalysis } = validationResult;

  const toggleRemove = (index: number) => {
    const newSet = new Set(transactionsToRemove);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    setTransactionsToRemove(newSet);
  };

  const handleProceed = () => {
    onProceed(Array.from(transactionsToRemove));
    setTransactionsToRemove(new Set());
  };

  const handleCancel = () => {
    setTransactionsToRemove(new Set());
    onCancel();
  };

  const getSeverityIcon = (severity: "critical" | "warning" | "info") => {
    switch (severity) {
      case "critical":
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case "info":
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getSeverityColor = (severity: "critical" | "warning" | "info") => {
    switch (severity) {
      case "critical":
        return "border-red-200 bg-red-50";
      case "warning":
        return "border-yellow-200 bg-yellow-50";
      case "info":
        return "border-blue-200 bg-blue-50";
    }
  };

  const getSeverityBadge = (severity: "critical" | "warning" | "info") => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "info":
        return "bg-blue-100 text-blue-800";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="border-b border-gray-200 bg-gradient-to-r from-yellow-50 to-orange-50 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{t("title")}</h2>
                <p className="mt-1 text-sm text-gray-600">
                  {t("issuesFound", { count: issues.length })}
                </p>
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
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4">
            {criticalCount > 0 && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
                <div className="text-3xl font-bold text-red-600">{criticalCount}</div>
                <div className="mt-1 text-sm text-red-700">{t("criticalIssues")}</div>
              </div>
            )}
            {warningCount > 0 && (
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-center">
                <div className="text-3xl font-bold text-yellow-600">{warningCount}</div>
                <div className="mt-1 text-sm text-yellow-700">{t("warnings")}</div>
              </div>
            )}
            {infoCount > 0 && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-center">
                <div className="text-3xl font-bold text-blue-600">{infoCount}</div>
                <div className="mt-1 text-sm text-blue-700">{t("informational")}</div>
              </div>
            )}
          </div>

          {/* AI Analysis */}
          {aiAnalysis && (
            <div className="border-s-4 border-purple-400 bg-purple-50 p-4 text-sm text-purple-800">
              <strong>{t("aiAnalysis")}</strong> {aiAnalysis}
            </div>
          )}

          {/* Issues List */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-gray-900">{t("issuesDetected")}</h3>
            <div className="space-y-3">
              {issues.map((issue, index) => {
                const isExpanded = expandedIssue === index;
                const isMarkedForRemoval = transactionsToRemove.has(issue.transactionIndex);

                return (
                  <div
                    key={index}
                    className={`overflow-hidden rounded-lg border transition-colors ${
                      isMarkedForRemoval
                        ? "border-gray-400 opacity-50"
                        : getSeverityColor(issue.severity)
                    }`}
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex flex-1 items-start gap-3">
                          {getSeverityIcon(issue.severity)}
                          <div className="flex-1">
                            <div className="mb-2 flex items-center gap-2">
                              <h4 className="font-semibold text-gray-900">{issue.title}</h4>
                              <span
                                className={`rounded px-2 py-0.5 text-xs font-semibold ${getSeverityBadge(
                                  issue.severity
                                )}`}
                              >
                                {issue.severity.toUpperCase()}
                              </span>
                              <span className="text-xs text-gray-600">
                                {t("transactionNumber", { number: issue.transactionIndex + 1 })}
                              </span>
                              {issue.confidence && (
                                <span className="text-xs text-gray-600">
                                  {t("confidence", {
                                    percent: (issue.confidence * 100).toFixed(0),
                                  })}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-700">{issue.message}</p>
                            {issue.suggestion && (
                              <p className="mt-2 text-sm text-gray-600">
                                <strong>{t("suggestion")}</strong> {issue.suggestion}
                              </p>
                            )}

                            {/* Transaction Preview */}
                            <button
                              onClick={() => setExpandedIssue(isExpanded ? null : index)}
                              className="mt-2 text-xs text-teal-600 hover:text-teal-700"
                            >
                              {isExpanded ? t("hideDetails") : t("viewDetails")}
                            </button>

                            {isExpanded && issue.transaction && (
                              <div className="mt-3 rounded border border-gray-200 bg-white p-3 text-sm">
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <strong>{t("date")}</strong>{" "}
                                    {issue.transaction.date.toLocaleDateString(locale)}
                                  </div>
                                  <div>
                                    <strong>{t("amount")}</strong>{" "}
                                    {issue.transaction.amount.toFixed(2)}
                                  </div>
                                  <div className="col-span-2">
                                    <strong>{t("description")}</strong>{" "}
                                    {issue.transaction.description}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => toggleRemove(issue.transactionIndex)}
                          className={`ms-4 flex items-center gap-2 rounded-lg px-3 py-2 transition-colors ${
                            isMarkedForRemoval
                              ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                              : "bg-red-100 text-red-700 hover:bg-red-200"
                          }`}
                        >
                          {isMarkedForRemoval ? (
                            <>
                              <CheckCircle className="h-4 w-4" />
                              {t("marked")}
                            </>
                          ) : (
                            <>
                              <Trash2 className="h-4 w-4" />
                              {t("remove")}
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Removal Summary */}
          {transactionsToRemove.size > 0 && (
            <div className="border-s-4 border-orange-400 bg-orange-50 p-4 text-sm text-orange-800">
              <strong>Note:</strong> {t("removalNote", { count: transactionsToRemove.size })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between border-t border-gray-200 bg-gray-50 p-6">
          <button
            onClick={handleCancel}
            className="rounded-lg border-2 border-gray-300 px-6 py-2 text-gray-700 transition-colors hover:bg-gray-100"
          >
            {t("cancelImport")}
          </button>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setTransactionsToRemove(new Set());
                onProceed([]);
              }}
              className="rounded-lg border-2 border-teal-600 px-6 py-2 text-teal-600 transition-colors hover:bg-teal-50"
            >
              {t("ignoreAllContinue")}
            </button>
            <button
              onClick={handleProceed}
              className="rounded-lg bg-teal-600 px-6 py-2 text-white transition-colors hover:bg-teal-700"
            >
              {transactionsToRemove.size > 0
                ? t("removeAndContinue", { count: transactionsToRemove.size })
                : t("continueWithAll")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
