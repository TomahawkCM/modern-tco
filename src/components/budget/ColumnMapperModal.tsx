/**
 * Column Mapper Modal Component
 * PDF Import Project - Task 6
 *
 * Manual column mapping fallback UI for when auto-detection confidence is <70%.
 * Allows users to manually map PDF columns to transaction fields.
 *
 * Features:
 * - Preview first 5 rows of PDF data
 * - Dropdown selectors for column mapping
 * - Live preview of parsed transactions
 * - Save/load mappings from localStorage
 * - Visual validation feedback
 */

"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import type { ParsedTransaction } from "@/types/budget";
import { parseAmountColumns, type ColumnMapping } from "@/lib/parsers/pdf-bank-parser";

// ============================================================================
// Types
// ============================================================================

export interface ColumnMapperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyMapping: (mapping: ManualColumnMapping) => void;
  rawRows: string[]; // First 5-10 rows from PDF OCR
  bankName?: string; // Optional bank name for saved mappings
}

export interface ManualColumnMapping {
  dateColumn: number;
  descriptionColumn: number;
  amountColumn?: number;
  debitColumn?: number;
  creditColumn?: number;
  bankFormat: "single-amount" | "debit-credit";
  bankName?: string;
}

interface SavedMapping {
  mapping: ManualColumnMapping;
  lastUsed: string;
}

// ============================================================================
// LocalStorage Utilities
// ============================================================================

const STORAGE_KEY = "pdfBankMappings";

function getSavedMappings(): Record<string, SavedMapping> {
  if (typeof window === "undefined") return {};
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function saveMappingToStorage(bankName: string, mapping: ManualColumnMapping): void {
  if (typeof window === "undefined") return;
  try {
    const mappings = getSavedMappings();
    mappings[bankName] = {
      mapping,
      lastUsed: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mappings));
  } catch (error) {
    console.error("Failed to save mapping:", error);
  }
}

function deleteMappingFromStorage(bankName: string): void {
  if (typeof window === "undefined") return;
  try {
    const mappings = getSavedMappings();
    delete mappings[bankName];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mappings));
  } catch (error) {
    console.error("Failed to delete mapping:", error);
  }
}

// ============================================================================
// Component
// ============================================================================

export default function ColumnMapperModal({
  isOpen,
  onClose,
  onApplyMapping,
  rawRows,
  bankName = "Unknown Bank",
}: ColumnMapperModalProps) {
  const tAria = useTranslations("aria");
  const t = useTranslations("columnMapper");
  const locale = useLocale();

  // Parse raw rows into columns (split by whitespace/tabs)
  const parsedRows = useMemo(() => {
    return rawRows.map((row) => row.split(/\s{2,}|\t/).filter((col) => col.trim().length > 0));
  }, [rawRows]);

  // Detect number of columns from first row
  const numColumns = parsedRows.length > 0 ? parsedRows[0].length : 0;

  // Column mapping state
  const [dateColumn, setDateColumn] = useState<number>(-1);
  const [descriptionColumn, setDescriptionColumn] = useState<number>(-1);
  const [amountColumn, setAmountColumn] = useState<number>(-1);
  const [debitColumn, setDebitColumn] = useState<number>(-1);
  const [creditColumn, setCreditColumn] = useState<number>(-1);
  const [bankFormat, setBankFormat] = useState<"single-amount" | "debit-credit">("single-amount");

  // Saved mappings state
  const [savedMappings, setSavedMappings] = useState<Record<string, SavedMapping>>({});
  const [showSavedMappingPrompt, setShowSavedMappingPrompt] = useState(false);

  // Load saved mappings on mount
  useEffect(() => {
    const mappings = getSavedMappings();
    setSavedMappings(mappings);

    // Check if there's a saved mapping for this bank
    if (bankName && mappings[bankName]) {
      setShowSavedMappingPrompt(true);
    }
  }, [bankName]);

  // Apply saved mapping
  const applySavedMapping = () => {
    const saved = savedMappings[bankName];
    if (saved) {
      const { mapping } = saved;
      setDateColumn(mapping.dateColumn);
      setDescriptionColumn(mapping.descriptionColumn);
      setBankFormat(mapping.bankFormat);

      if (mapping.bankFormat === "debit-credit") {
        setDebitColumn(mapping.debitColumn ?? -1);
        setCreditColumn(mapping.creditColumn ?? -1);
        setAmountColumn(-1);
      } else {
        setAmountColumn(mapping.amountColumn ?? -1);
        setDebitColumn(-1);
        setCreditColumn(-1);
      }

      setShowSavedMappingPrompt(false);
    }
  };

  // Generate live preview of parsed transactions
  const previewTransactions = useMemo(() => {
    if (dateColumn === -1 || descriptionColumn === -1) {
      return [];
    }

    if (bankFormat === "single-amount" && amountColumn === -1) {
      return [];
    }

    if (bankFormat === "debit-credit" && (debitColumn === -1 || creditColumn === -1)) {
      return [];
    }

    // Parse rows into transactions
    const transactions: ParsedTransaction[] = [];

    for (const row of parsedRows.slice(1)) {
      // Skip header row
      if (
        row.length <=
        Math.max(dateColumn, descriptionColumn, amountColumn, debitColumn, creditColumn)
      ) {
        continue;
      }

      try {
        const dateStr = row[dateColumn] || "";
        const description = row[descriptionColumn] || "";

        let amount = 0;

        if (bankFormat === "single-amount") {
          const amountStr = row[amountColumn] || "0";
          amount = parseFloat(amountStr.replace(/[^0-9.-]/g, "")) || 0;
        } else {
          const debitStr = row[debitColumn] || "0";
          const creditStr = row[creditColumn] || "0";
          const debit = parseFloat(debitStr.replace(/[^0-9.]/g, "")) || 0;
          const credit = parseFloat(creditStr.replace(/[^0-9.]/g, "")) || 0;
          amount = credit > 0 ? credit : -debit;
        }

        // Parse date (simple validation)
        const date = new Date(dateStr);
        const isValidDate = !isNaN(date.getTime());

        transactions.push({
          date: isValidDate ? date : new Date(),
          description: description || "Unknown",
          amount,
          isDuplicate: false,
          confidence: isValidDate && description ? 0.9 : 0.5,
          requiresReview: !isValidDate || !description,
        });
      } catch {
        // Skip invalid rows
      }
    }

    return transactions.slice(0, 5); // Show first 5 transactions
  }, [
    parsedRows,
    dateColumn,
    descriptionColumn,
    amountColumn,
    debitColumn,
    creditColumn,
    bankFormat,
  ]);

  // Handle apply mapping
  const handleApplyMapping = () => {
    const mapping: ManualColumnMapping = {
      dateColumn,
      descriptionColumn,
      bankFormat,
      bankName,
    };

    if (bankFormat === "single-amount") {
      mapping.amountColumn = amountColumn;
    } else {
      mapping.debitColumn = debitColumn;
      mapping.creditColumn = creditColumn;
    }

    // Save to localStorage if bank name provided
    if (bankName && bankName !== "Unknown Bank") {
      saveMappingToStorage(bankName, mapping);
    }

    onApplyMapping(mapping);
    onClose();
  };

  // Handle delete saved mapping
  const handleDeleteSavedMapping = () => {
    deleteMappingFromStorage(bankName);
    setSavedMappings(getSavedMappings());
    setShowSavedMappingPrompt(false);
  };

  // Validation
  const isValid =
    dateColumn !== -1 &&
    descriptionColumn !== -1 &&
    ((bankFormat === "single-amount" && amountColumn !== -1) ||
      (bankFormat === "debit-credit" && debitColumn !== -1 && creditColumn !== -1));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between border-b bg-white px-6 py-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{t("title")}</h2>
            <p className="mt-1 text-sm text-gray-600">{t("description")}</p>
          </div>
          <button
            onClick={onClose}
            className="text-2xl font-bold text-gray-500 hover:text-gray-700"
            aria-label={tAria("close")}
          >
            ×
          </button>
        </div>

        {/* Saved Mapping Prompt */}
        {showSavedMappingPrompt && savedMappings[bankName] && (
          <div className="mx-6 mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-blue-900">
                  {t("savedMappingFound", { bankName })}
                </p>
                <p className="mt-1 text-sm text-blue-700">
                  {t("lastUsed", {
                    date: new Date(savedMappings[bankName].lastUsed).toLocaleDateString(locale),
                  })}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={applySavedMapping}
                  className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                >
                  {t("useSavedMapping")}
                </button>
                <button
                  onClick={handleDeleteSavedMapping}
                  className="rounded bg-red-100 px-3 py-1 text-sm text-red-700 hover:bg-red-200"
                >
                  {t("delete")}
                </button>
                <button
                  onClick={() => setShowSavedMappingPrompt(false)}
                  className="rounded bg-gray-200 px-3 py-1 text-sm text-gray-700 hover:bg-gray-300"
                >
                  {t("dismiss")}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="space-y-6 p-6">
          {/* PDF Preview */}
          <div>
            <h3 className="mb-2 font-semibold text-gray-900">{t("pdfPreview")}</h3>
            <div className="overflow-x-auto rounded border">
              <table className="min-w-full text-sm">
                <tbody>
                  {parsedRows.slice(0, 5).map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className={rowIndex === 0 ? "bg-gray-100 font-semibold" : ""}
                    >
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex} className="border px-3 py-2">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bank Format Selection */}
          <div>
            <h3 className="mb-2 font-semibold text-gray-900">{t("bankStatementFormat")}</h3>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="bankFormat"
                  value="single-amount"
                  checked={bankFormat === "single-amount"}
                  onChange={(e) => setBankFormat(e.target.value as "single-amount")}
                  className="h-4 w-4"
                />
                <span className="text-sm">{t("singleAmountColumn")}</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="bankFormat"
                  value="debit-credit"
                  checked={bankFormat === "debit-credit"}
                  onChange={(e) => setBankFormat(e.target.value as "debit-credit")}
                  className="h-4 w-4"
                />
                <span className="text-sm">{t("debitCreditColumns")}</span>
              </label>
            </div>
          </div>

          {/* Column Mapping */}
          <div>
            <h3 className="mb-2 font-semibold text-gray-900">{t("mapColumnsToFields")}</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Date Column */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {t("dateColumn")} <span className="text-red-500">*</span>
                </label>
                <select
                  value={dateColumn}
                  onChange={(e) => setDateColumn(parseInt(e.target.value))}
                  className="w-full rounded border px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value={-1}>{t("selectColumn")}</option>
                  {Array.from({ length: numColumns }, (_, i) => (
                    <option key={i} value={i}>
                      {t("columnNumber", { number: i + 1 })}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description Column */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {t("descriptionColumn")} <span className="text-red-500">*</span>
                </label>
                <select
                  value={descriptionColumn}
                  onChange={(e) => setDescriptionColumn(parseInt(e.target.value))}
                  className="w-full rounded border px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value={-1}>{t("selectColumn")}</option>
                  {Array.from({ length: numColumns }, (_, i) => (
                    <option key={i} value={i}>
                      {t("columnNumber", { number: i + 1 })}
                    </option>
                  ))}
                </select>
              </div>

              {/* Single Amount Column */}
              {bankFormat === "single-amount" && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    {t("amountColumn")} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={amountColumn}
                    onChange={(e) => setAmountColumn(parseInt(e.target.value))}
                    className="w-full rounded border px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={-1}>{t("selectColumn")}</option>
                    {Array.from({ length: numColumns }, (_, i) => (
                      <option key={i} value={i}>
                        {t("columnNumber", { number: i + 1 })}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Debit/Credit Columns */}
              {bankFormat === "debit-credit" && (
                <>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      {t("debitColumn")} <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={debitColumn}
                      onChange={(e) => setDebitColumn(parseInt(e.target.value))}
                      className="w-full rounded border px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={-1}>{t("selectColumn")}</option>
                      {Array.from({ length: numColumns }, (_, i) => (
                        <option key={i} value={i}>
                          {t("columnNumber", { number: i + 1 })}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      {t("creditColumn")} <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={creditColumn}
                      onChange={(e) => setCreditColumn(parseInt(e.target.value))}
                      className="w-full rounded border px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={-1}>{t("selectColumn")}</option>
                      {Array.from({ length: numColumns }, (_, i) => (
                        <option key={i} value={i}>
                          {t("columnNumber", { number: i + 1 })}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Live Preview */}
          {previewTransactions.length > 0 && (
            <div>
              <h3 className="mb-2 font-semibold text-gray-900">{t("transactionPreview")}</h3>
              <div className="overflow-x-auto rounded border">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-3 py-2 text-start">{t("date")}</th>
                      <th className="px-3 py-2 text-start">{t("descriptionHeader")}</th>
                      <th className="px-3 py-2 text-end">{t("amount")}</th>
                      <th className="px-3 py-2 text-center">{t("status")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewTransactions.map((tx, index) => (
                      <tr key={index} className={tx.requiresReview ? "bg-orange-50" : ""}>
                        <td className="border px-3 py-2">
                          <span className={tx.requiresReview ? "text-red-600" : ""}>
                            {tx.date.toLocaleDateString(locale)}
                          </span>
                        </td>
                        <td className="border px-3 py-2">{tx.description}</td>
                        <td className="border px-3 py-2 text-end">
                          {Math.abs(tx.amount).toLocaleString(locale, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td className="border px-3 py-2 text-center">
                          {tx.requiresReview ? (
                            <span className="text-xs text-orange-600">⚠️ Review</span>
                          ) : (
                            <span className="text-xs text-green-600">✓ OK</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex items-center justify-between border-t bg-gray-50 px-6 py-4">
          <div className="text-sm text-gray-600">
            {!isValid && <span className="text-red-600">{t("selectAllRequired")}</span>}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="rounded bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
            >
              {t("cancel")}
            </button>
            <button
              onClick={handleApplyMapping}
              disabled={!isValid}
              className={`rounded px-4 py-2 ${
                isValid
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "cursor-not-allowed bg-gray-300 text-gray-500"
              }`}
            >
              {t("applyMapping")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
