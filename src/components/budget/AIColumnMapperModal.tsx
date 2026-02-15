/**
 * AI Column Mapper Modal
 * Interactive UI for reviewing and adjusting AI-detected column mappings
 *
 * Features:
 * - Shows AI suggestions with confidence scores
 * - Allows manual override via dropdowns
 * - Live preview of transactions
 * - Color-coded confidence indicators
 * - Option to save custom bank config
 *
 * UPDATE (2025-11-24):
 * - Now calls server-side API route /api/import/analyze-columns
 * - Client-side AI calls removed for security
 */

"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { X, Check, AlertCircle, Save, Sparkles } from "lucide-react";
import type { CSVRow } from "@/types/budget";
import type { ColumnMapping, ColumnAnalysisResult } from "@/lib/ai/smart-column-mapper";
import { saveCustomBankConfig } from "@/lib/ai/smart-column-mapper";

// ============================================================================
// Types
// ============================================================================

export interface AIColumnMapperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyMapping: (mapping: ColumnMapping, bankName?: string) => void;
  headers: string[];
  sampleRows: CSVRow[];
  fileName: string;
}

type ColumnType = "date" | "description" | "amount" | "debit" | "credit" | "balance" | "ignore";

// ============================================================================
// Component
// ============================================================================

export default function AIColumnMapperModal({
  isOpen,
  onClose,
  onApplyMapping,
  headers,
  sampleRows,
  fileName,
}: AIColumnMapperModalProps) {
  const t = useTranslations("aiColumnMapper");
  const [analysisResult, setAnalysisResult] = useState<ColumnAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [customMapping, setCustomMapping] = useState<Record<string, ColumnType>>({});
  const [customBankName, setCustomBankName] = useState("");
  const [saveForFuture, setSaveForFuture] = useState(true);

  // Run AI analysis when modal opens
  useEffect(() => {
    if (isOpen && !analysisResult) {
      runAIAnalysis();
    }
  }, [isOpen]);

  async function runAIAnalysis() {
    setIsAnalyzing(true);
    try {
      // Call server-side API route instead of client-side AI
      const response = await fetch("/api/import/analyze-columns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          headers,
          sampleData: sampleRows,
        }),
      });

      const data = await response.json();

      if (!data.success || !data.mapping) {
        throw new Error(data.error || "Failed to analyze columns");
      }

      // Convert API response to ColumnAnalysisResult format
      const result: ColumnAnalysisResult = {
        mapping: data.mapping,
        suggestions: data.suggestions || [],
        warnings: data.warnings || [],
        samplePreview: data.samplePreview || [],
      };

      setAnalysisResult(result);

      // Initialize custom mapping from AI suggestions
      const initial: Record<string, ColumnType> = {};
      headers.forEach((header) => {
        if (header === result.mapping.dateColumn) initial[header] = "date";
        else if (header === result.mapping.descriptionColumn) initial[header] = "description";
        else if (header === result.mapping.amountColumn) initial[header] = "amount";
        else if (header === result.mapping.debitColumn) initial[header] = "debit";
        else if (header === result.mapping.creditColumn) initial[header] = "credit";
        else if (header === result.mapping.balanceColumn) initial[header] = "balance";
        else initial[header] = "ignore";
      });
      setCustomMapping(initial);

      // Suggest bank name from file name
      const suggestedName = fileName
        .replace(/\.csv$/i, "")
        .replace(/[-_]/g, " ")
        .trim();
      setCustomBankName(suggestedName);
    } catch (error) {
      console.error("[AIColumnMapperModal] Analysis error:", error);
    } finally {
      setIsAnalyzing(false);
    }
  }

  function handleColumnTypeChange(header: string, type: ColumnType) {
    setCustomMapping((prev) => ({
      ...prev,
      [header]: type,
    }));
  }

  function handleApply() {
    if (!analysisResult) return;

    // Build final mapping from custom selections
    const finalMapping: ColumnMapping = {
      dateColumn: null,
      descriptionColumn: null,
      amountColumn: null,
      debitColumn: null,
      creditColumn: null,
      balanceColumn: null,
      confidence: analysisResult.mapping.confidence,
      columnConfidences: analysisResult.mapping.columnConfidences,
      detectionMethod: "user-manual",
      amountFormat: "single",
      dateFormat: analysisResult.mapping.dateFormat,
    };

    headers.forEach((header) => {
      const type = customMapping[header];
      if (type === "date") finalMapping.dateColumn = header;
      else if (type === "description") finalMapping.descriptionColumn = header;
      else if (type === "amount") finalMapping.amountColumn = header;
      else if (type === "debit") finalMapping.debitColumn = header;
      else if (type === "credit") finalMapping.creditColumn = header;
      else if (type === "balance") finalMapping.balanceColumn = header;
    });

    // Determine amount format
    if (finalMapping.debitColumn && finalMapping.creditColumn) {
      finalMapping.amountFormat = "split";
    }

    // Save custom bank config if requested
    let savedBankName: string | undefined;
    if (saveForFuture && customBankName.trim()) {
      const config = saveCustomBankConfig(customBankName.trim(), finalMapping);
      savedBankName = config.name;
      console.log("[AIColumnMapperModal] Saved custom bank config:", config.customKey);
    }

    onApplyMapping(finalMapping, savedBankName);
  }

  function getConfidenceColor(confidence: number): string {
    if (confidence >= 0.9) return "text-green-600 bg-green-100";
    if (confidence >= 0.7) return "text-yellow-600 bg-yellow-100";
    return "text-orange-600 bg-orange-100";
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-purple-600" />
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
          {/* AI Analysis Status */}
          {isAnalyzing && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-center gap-3">
                <svg
                  className="h-5 w-5 animate-spin text-blue-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span className="text-sm font-medium text-blue-800">{t("analyzing")}</span>
              </div>
            </div>
          )}

          {/* Analysis Results */}
          {analysisResult && (
            <>
              {/* Overall Confidence */}
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{t("confidence.title")}</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      {t("confidence.analyzed", {
                        columnCount: headers.length,
                        rowCount: sampleRows.length,
                      })}
                    </p>
                  </div>
                  <div
                    className={`rounded-lg px-4 py-2 font-bold ${getConfidenceColor(
                      analysisResult.mapping.confidence
                    )}`}
                  >
                    {(analysisResult.mapping.confidence * 100).toFixed(0)}%
                  </div>
                </div>
              </div>

              {/* Suggestions & Warnings */}
              {(analysisResult.suggestions.length > 0 || analysisResult.warnings.length > 0) && (
                <div className="space-y-2">
                  {analysisResult.suggestions.map((suggestion, i) => (
                    <div
                      key={`suggestion-${i}`}
                      className="border-s-4 border-blue-400 bg-blue-50 p-3 text-sm text-blue-800"
                    >
                      💡 {suggestion}
                    </div>
                  ))}
                  {analysisResult.warnings.map((warning, i) => (
                    <div
                      key={`warning-${i}`}
                      className="flex items-start gap-2 border-s-4 border-yellow-400 bg-yellow-50 p-3 text-sm text-yellow-800"
                    >
                      <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                      <span>{warning}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Column Mappings */}
              <div>
                <h3 className="mb-4 text-lg font-semibold text-gray-900">{t("columnMappings")}</h3>
                <div className="space-y-2">
                  {headers.map((header) => {
                    const confidence = analysisResult.mapping.columnConfidences[header] || 0;
                    const selectedType = customMapping[header] || "ignore";

                    return (
                      <div
                        key={header}
                        className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">{header}</span>
                            <span
                              className={`rounded px-2 py-0.5 text-xs font-semibold ${getConfidenceColor(
                                confidence
                              )}`}
                            >
                              {(confidence * 100).toFixed(0)}%
                            </span>
                          </div>
                          {/* Show sample values */}
                          <div className="mt-1 truncate text-xs text-gray-600">
                            {t("samples")}{" "}
                            {sampleRows
                              .slice(0, 3)
                              .map((row) => `"${row[header] || ""}"`)
                              .join(", ")}
                          </div>
                        </div>

                        {/* Dropdown */}
                        <select
                          value={selectedType}
                          onChange={(e) =>
                            handleColumnTypeChange(header, e.target.value as ColumnType)
                          }
                          className="ms-4 rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="ignore">{t("columnTypes.ignore")}</option>
                          <option value="date">{t("columnTypes.date")}</option>
                          <option value="description">{t("columnTypes.description")}</option>
                          <option value="amount">{t("columnTypes.amount")}</option>
                          <option value="debit">{t("columnTypes.debit")}</option>
                          <option value="credit">{t("columnTypes.credit")}</option>
                          <option value="balance">{t("columnTypes.balance")}</option>
                        </select>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Transaction Preview */}
              {analysisResult.samplePreview.length > 0 && (
                <div>
                  <h3 className="mb-4 text-lg font-semibold text-gray-900">{t("preview.title")}</h3>
                  <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                    <table className="w-full">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">
                            {t("preview.date")}
                          </th>
                          <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">
                            {t("preview.description")}
                          </th>
                          <th className="px-4 py-2 text-right text-sm font-semibold text-gray-900">
                            {t("preview.amount")}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {analysisResult.samplePreview.map((preview, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-sm text-gray-900">{preview.date}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">
                              {preview.description}
                            </td>
                            <td
                              className={`px-4 py-2 text-right text-sm font-semibold ${
                                preview.amount > 0 ? "text-green-600" : "text-gray-900"
                              }`}
                            >
                              {preview.amount > 0 ? "+" : ""}${Math.abs(preview.amount).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Save for Future */}
              <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="save-for-future"
                    checked={saveForFuture}
                    onChange={(e) => setSaveForFuture(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <div className="flex-1">
                    <label
                      htmlFor="save-for-future"
                      className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900"
                    >
                      <Save className="h-4 w-4 text-purple-600" />
                      {t("saveConfig.label")}
                    </label>
                    {saveForFuture && (
                      <input
                        type="text"
                        value={customBankName}
                        onChange={(e) => setCustomBankName(e.target.value)}
                        placeholder={t("saveConfig.placeholder")}
                        className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-purple-500"
                      />
                    )}
                    <p className="mt-1 text-xs text-gray-600">{t("saveConfig.hint")}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between border-t border-gray-200 bg-gray-50 p-6">
          <button
            onClick={onClose}
            className="rounded-lg border-2 border-gray-300 px-6 py-2 text-gray-700 transition-colors hover:bg-gray-100"
          >
            {t("buttons.cancel")}
          </button>
          <button
            onClick={handleApply}
            disabled={!analysisResult || isAnalyzing}
            className="flex items-center gap-2 rounded-lg bg-purple-600 px-6 py-2 text-white transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            <Check className="h-5 w-5" />
            {t("buttons.apply")}
          </button>
        </div>
      </div>
    </div>
  );
}
