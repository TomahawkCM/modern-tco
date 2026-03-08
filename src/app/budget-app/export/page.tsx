"use client";

/**
 * Export/Backup Page
 * Export data to JSON/CSV/Excel and restore from backups
 */

import { useState, useCallback } from "react";
import {
  Download,
  Upload,
  Database,
  FileText,
  CheckCircle,
  AlertCircle,
  FileSpreadsheet,
  Calendar,
  Settings2,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { db } from "@/lib/budget-db";
import {
  downloadExcelExport,
  type ExcelExportOptions,
  type ExportProgress,
} from "@/lib/export/excel/workbook-generator";

type DateRangeOption = ExcelExportOptions["dateRange"];

const DATE_RANGE_VALUES: DateRangeOption[] = [
  "all",
  "ytd",
  "last12months",
  "last6months",
  "last3months",
  "custom",
];

const SHEET_OPTIONS = [
  { key: "includeDashboard", labelKey: "sheetDashboard", descKey: "sheetDashboardDesc" },
  { key: "includeTransactions", labelKey: "sheetTransactions", descKey: "sheetTransactionsDesc" },
  {
    key: "includeMonthlySummary",
    labelKey: "sheetMonthlySummary",
    descKey: "sheetMonthlySummaryDesc",
  },
  {
    key: "includeCategoryAnalysis",
    labelKey: "sheetCategoryAnalysis",
    descKey: "sheetCategoryAnalysisDesc",
  },
  { key: "includeAccounts", labelKey: "sheetAccounts", descKey: "sheetAccountsDesc" },
  { key: "includeBudgets", labelKey: "sheetBudgets", descKey: "sheetBudgetsDesc" },
  {
    key: "includeSubscriptions",
    labelKey: "sheetSubscriptions",
    descKey: "sheetSubscriptionsDesc",
  },
  { key: "includeLoans", labelKey: "sheetLoans", descKey: "sheetLoansDesc" },
  { key: "includeInvestments", labelKey: "sheetInvestments", descKey: "sheetInvestmentsDesc" },
  { key: "includeNetWorth", labelKey: "sheetNetWorth", descKey: "sheetNetWorthDesc" },
  { key: "includeGoals", labelKey: "sheetGoals", descKey: "sheetGoalsDesc" },
  {
    key: "includeDataDictionary",
    labelKey: "sheetDataDictionary",
    descKey: "sheetDataDictionaryDesc",
  },
] as const;

type SheetOptionKey = (typeof SHEET_OPTIONS)[number]["key"];

export default function ExportPage() {
  const t = useTranslations("export");
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<"idle" | "success" | "error">("idle");
  const [importStatus, setImportStatus] = useState<"idle" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");

  // Excel export options
  const [showExcelOptions, setShowExcelOptions] = useState(false);
  const [dateRange, setDateRange] = useState<DateRangeOption>("last12months");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [sheetOptions, setSheetOptions] = useState<Record<SheetOptionKey, boolean>>({
    includeDashboard: true,
    includeTransactions: true,
    includeMonthlySummary: true,
    includeCategoryAnalysis: true,
    includeAccounts: true,
    includeBudgets: true,
    includeSubscriptions: true,
    includeLoans: true,
    includeInvestments: true,
    includeNetWorth: true,
    includeGoals: true,
    includeDataDictionary: true,
  });
  const [exportProgress, setExportProgress] = useState<ExportProgress | null>(null);

  const toggleSheet = useCallback((key: SheetOptionKey) => {
    setSheetOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const selectAllSheets = useCallback(() => {
    setSheetOptions((prev) => {
      const newOptions = { ...prev };
      SHEET_OPTIONS.forEach((opt) => {
        newOptions[opt.key] = true;
      });
      return newOptions;
    });
  }, []);

  const deselectAllSheets = useCallback(() => {
    setSheetOptions((prev) => {
      const newOptions = { ...prev };
      SHEET_OPTIONS.forEach((opt) => {
        newOptions[opt.key] = false;
      });
      return newOptions;
    });
  }, []);

  async function exportToExcel() {
    setIsExporting(true);
    setExportStatus("idle");
    setExportProgress(null);

    try {
      const options: ExcelExportOptions = {
        dateRange,
        startDate:
          dateRange === "custom" && customStartDate ? new Date(customStartDate) : undefined,
        endDate: dateRange === "custom" && customEndDate ? new Date(customEndDate) : undefined,
        ...sheetOptions,
        includeCharts: true,
        includeFormulas: true,
      };

      const result = await downloadExcelExport(options, (progress) => {
        setExportProgress(progress);
      });

      if (result.success) {
        setExportStatus("success");
        setStatusMessage(
          t("excelExportedSuccess", {
            sheets: result.sheetsIncluded.length,
            size: (result.fileSize / 1024).toFixed(1),
          })
        );
      } else {
        throw new Error(result.error || "Export failed");
      }
    } catch (error) {
      console.error("Excel export error:", error);
      setExportStatus("error");
      setStatusMessage(error instanceof Error ? error.message : t("failedToExportExcel"));
    } finally {
      setIsExporting(false);
      setExportProgress(null);
    }
  }

  async function exportToJSON() {
    setIsExporting(true);
    setExportStatus("idle");

    try {
      // Export all data from each table
      const [
        accounts,
        transactions,
        categories,
        budgets,
        futurePurchases,
        retirementPlans,
        importMappings,
        receipts,
      ] = await Promise.all([
        db.accounts.toArray(),
        db.transactions.toArray(),
        db.categories.toArray(),
        db.budgets.toArray(),
        db.futurePurchases.toArray(),
        db.retirementPlans.toArray(),
        db.importMappings.toArray(),
        db.receipts.toArray(),
      ]);

      const exportData = {
        version: "1.0.0",
        exportDate: new Date().toISOString(),
        accounts,
        transactions,
        categories,
        budgets,
        futurePurchases,
        retirementPlans,
        importMappings,
        receipts: receipts.map((r) => ({
          ...r,
          blob: null, // Don't export blob data - too large
          thumbnail: null,
        })),
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `budget-backup-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setExportStatus("success");
      setStatusMessage(t("dataExportedSuccess"));
    } catch (error) {
      console.error("Export error:", error);
      setExportStatus("error");
      setStatusMessage(t("failedToExport"));
    } finally {
      setIsExporting(false);
    }
  }

  async function exportTransactionsToCSV() {
    setIsExporting(true);
    setExportStatus("idle");

    try {
      const allTxs = await db.transactions.toArray();

      // Filter out parent transactions that have been split
      // Export only visible transactions (children + non-split) to match what users see
      const transactions = allTxs.filter((tx) => !tx.isSplit);

      // Create CSV header
      const headers = ["Date", "Description", "Category", "Subcategory", "Amount", "Notes"];
      const rows = transactions.map((tx) => [
        new Date(tx.date).toLocaleDateString(),
        tx.description,
        tx.category || "",
        tx.subcategory || "",
        tx.amount.toFixed(2),
        tx.notes || "",
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `transactions-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setExportStatus("success");
      setStatusMessage(t("csvExportedSuccess"));
    } catch (error) {
      console.error("CSV export error:", error);
      setExportStatus("error");
      setStatusMessage(t("failedToExportCsv"));
    } finally {
      setIsExporting(false);
    }
  }

  async function importFromJSON(file: File) {
    setIsImporting(true);
    setImportStatus("idle");

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!data.version || !data.exportDate) {
        throw new Error(t("invalidBackupFormat"));
      }

      // Confirm before importing
      const confirmed = confirm(
        t("confirmImport", { date: new Date(data.exportDate).toLocaleDateString() })
      );

      if (!confirmed) {
        setIsImporting(false);
        return;
      }

      // Clear existing data first
      await db.transaction("rw", db.accounts, db.transactions, db.categories, async () => {
        // Clear all tables
        await Promise.all([
          db.accounts.clear(),
          db.transactions.clear(),
          db.categories.clear(),
          db.budgets.clear(),
          db.futurePurchases.clear(),
          db.retirementPlans.clear(),
          db.importMappings.clear(),
          db.receipts.clear(),
        ]);

        // Import new data
        if (data.accounts?.length) await db.accounts.bulkAdd(data.accounts);
        if (data.transactions?.length) await db.transactions.bulkAdd(data.transactions);
        if (data.categories?.length) await db.categories.bulkAdd(data.categories);
        if (data.budgets?.length) await db.budgets.bulkAdd(data.budgets);
        if (data.futurePurchases?.length) await db.futurePurchases.bulkAdd(data.futurePurchases);
        if (data.retirementPlans?.length) await db.retirementPlans.bulkAdd(data.retirementPlans);
        if (data.importMappings?.length) await db.importMappings.bulkAdd(data.importMappings);
        // Note: Receipts without blob data won't be very useful, so skip them
      });

      setImportStatus("success");
      setStatusMessage(t("dataImportedSuccess"));
    } catch (error) {
      console.error("Import error:", error);
      setImportStatus("error");
      setStatusMessage(t("failedToImport"));
    } finally {
      setIsImporting(false);
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      importFromJSON(file);
    }
  }

  async function clearAllData() {
    const confirmed = confirm(t("confirmDeleteAll"));

    if (!confirmed) return;

    const doubleConfirm = confirm(t("confirmDeleteAllFinal"));

    if (!doubleConfirm) return;

    try {
      // Clear all tables
      await Promise.all([
        db.accounts.clear(),
        db.transactions.clear(),
        db.categories.clear(),
        db.budgets.clear(),
        db.futurePurchases.clear(),
        db.retirementPlans.clear(),
        db.importMappings.clear(),
        db.receipts.clear(),
      ]);
      alert(t("allDataDeleted"));
      window.location.reload();
    } catch (error) {
      console.error("Error clearing data:", error);
      alert(t("failedToClearData"));
    }
  }

  const selectedSheetCount = Object.values(sheetOptions).filter(Boolean).length;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">{t("title")}</h1>
        <p className="mt-2 text-slate-400">{t("subtitle")}</p>
      </div>

      {/* Status Messages */}
      {exportStatus !== "idle" && (
        <div
          className={`flex items-center gap-4 rounded-lg p-4 ${
            exportStatus === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
          }`}
        >
          {exportStatus === "success" ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <p className="font-medium">{statusMessage}</p>
        </div>
      )}

      {importStatus !== "idle" && (
        <div
          className={`flex items-center gap-4 rounded-lg p-4 ${
            importStatus === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
          }`}
        >
          {importStatus === "success" ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <p className="font-medium">{statusMessage}</p>
        </div>
      )}

      {/* Export Options */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">{t("exportData")}</h2>

        <div className="space-y-4">
          {/* Excel Export - Featured */}
          <div className="overflow-hidden rounded-lg border-2 border-teal-500">
            <div className="flex items-start gap-4 bg-gradient-to-r from-teal-50 to-emerald-50 p-4">
              <div className="rounded-full bg-teal-100 p-4">
                <FileSpreadsheet className="h-6 w-6 text-teal-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">{t("excelWorkbookTitle")}</h3>
                  <span className="rounded-full bg-teal-500 px-2 py-0.5 text-xs font-medium text-white">
                    {t("recommended")}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-600">{t("excelWorkbookDescription")}</p>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={exportToExcel}
                  disabled={isExporting || selectedSheetCount === 0}
                  className="flex items-center gap-2 whitespace-nowrap rounded-lg bg-teal-600 px-4 py-2 text-white transition-colors hover:bg-teal-700 disabled:bg-gray-400"
                >
                  {isExporting && exportProgress ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {Math.round(exportProgress.percent)}%
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      {t("exportExcel")}
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowExcelOptions(!showExcelOptions)}
                  className="flex items-center justify-center gap-1 px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  <Settings2 className="h-4 w-4" />
                  {t("options")}
                  {showExcelOptions ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Export Progress */}
            {exportProgress && (
              <div className="border-t border-teal-200 bg-teal-50 px-4 py-3">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-teal-700">
                    {exportProgress.currentSheet || exportProgress.message}
                  </span>
                  <span className="text-teal-600">
                    {exportProgress.sheetsCompleted} of {exportProgress.totalSheets}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-teal-200">
                  <div
                    className="h-2 rounded-full bg-teal-600 transition-all duration-300"
                    style={{ width: `${exportProgress.percent}%` }}
                  />
                </div>
              </div>
            )}

            {/* Excel Options Panel */}
            {showExcelOptions && (
              <div className="space-y-4 border-t border-gray-200 bg-gray-50 p-4">
                {/* Date Range */}
                <div>
                  <label className="mb-2 block flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Calendar className="h-4 w-4" />
                    {t("dateRange")}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {DATE_RANGE_VALUES.map((value) => (
                      <button
                        key={value}
                        onClick={() => setDateRange(value)}
                        className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                          dateRange === value
                            ? "border-teal-600 bg-teal-600 text-white"
                            : "border-gray-300 bg-white text-gray-700 hover:border-teal-500"
                        }`}
                      >
                        {t(`dateRange_${value}`)}
                      </button>
                    ))}
                  </div>

                  {/* Custom Date Range Inputs */}
                  {dateRange === "custom" && (
                    <div className="mt-3 flex gap-4">
                      <div>
                        <label className="mb-1 block text-xs text-gray-500">{t("startDate")}</label>
                        <input
                          type="date"
                          value={customStartDate}
                          onChange={(e) => setCustomStartDate(e.target.value)}
                          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-gray-500">{t("endDate")}</label>
                        <input
                          type="date"
                          value={customEndDate}
                          onChange={(e) => setCustomEndDate(e.target.value)}
                          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Sheet Selection */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">
                      {t("sheetsToInclude", {
                        selected: selectedSheetCount,
                        total: SHEET_OPTIONS.length,
                      })}
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={selectAllSheets}
                        className="text-xs text-teal-600 hover:text-teal-700"
                      >
                        {t("selectAll")}
                      </button>
                      <span className="text-gray-300">|</span>
                      <button
                        onClick={deselectAllSheets}
                        className="text-xs text-gray-500 hover:text-gray-700"
                      >
                        {t("deselectAll")}
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                    {SHEET_OPTIONS.map((option) => (
                      <label
                        key={option.key}
                        className={`flex cursor-pointer items-start gap-2 rounded-lg border p-2 transition-colors ${
                          sheetOptions[option.key]
                            ? "border-teal-300 bg-teal-50"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={sheetOptions[option.key]}
                          onChange={() => toggleSheet(option.key)}
                          className="mt-0.5 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                        />
                        <div>
                          <span className="text-sm font-medium text-gray-900">
                            {t(option.labelKey)}
                          </span>
                          <p className="text-xs text-gray-500">{t(option.descKey)}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Full Backup */}
          <div className="flex items-start gap-4 rounded-lg border border-gray-200 p-4 transition-colors hover:border-teal-500">
            <div className="rounded-full bg-teal-50 p-4">
              <Database className="h-6 w-6 text-teal-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{t("fullBackupTitle")}</h3>
              <p className="mt-2 text-sm text-gray-600">{t("fullBackupDescription")}</p>
            </div>
            <button
              onClick={exportToJSON}
              disabled={isExporting}
              className="flex items-center gap-2 rounded-lg bg-gray-700 px-4 py-2 text-white transition-colors hover:bg-gray-800 disabled:bg-gray-400"
            >
              <Download className="h-4 w-4" />
              {t("exportJson")}
            </button>
          </div>

          {/* Transactions CSV */}
          <div className="flex items-start gap-4 rounded-lg border border-gray-200 p-4 transition-colors hover:border-green-500">
            <div className="rounded-full bg-green-50 p-4">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{t("transactionsCsvTitle")}</h3>
              <p className="mt-2 text-sm text-gray-600">{t("transactionsCsvDescription")}</p>
            </div>
            <button
              onClick={exportTransactionsToCSV}
              disabled={isExporting}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700 disabled:bg-gray-400"
            >
              <Download className="h-4 w-4" />
              {t("exportCsv")}
            </button>
          </div>
        </div>
      </div>

      {/* Import Options */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">{t("importData")}</h2>

        <div className="flex items-start gap-4 rounded-lg border border-gray-200 p-4 transition-colors hover:border-gray-300">
          <div className="rounded-full bg-gray-100 p-4">
            <Upload className="h-6 w-6 text-gray-700" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{t("restoreFromBackup")}</h3>
            <p className="mb-4 mt-2 text-sm text-gray-600">{t("restoreDescription")}</p>
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
              {t("restoreWarning")}
            </div>
          </div>
          <div>
            <input
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
              id="import-file"
              disabled={isImporting}
            />
            <label
              htmlFor="import-file"
              className={`flex cursor-pointer items-center gap-2 rounded-lg bg-gray-700 px-4 py-2 text-white transition-colors hover:bg-gray-800 ${
                isImporting ? "cursor-not-allowed opacity-50" : ""
              }`}
            >
              <Upload className="h-4 w-4" />
              {isImporting ? t("importing") : t("importJson")}
            </label>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-lg border-2 border-red-200 bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-semibold text-red-900">{t("dangerZone")}</h2>

        <div className="flex items-start gap-4 rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex-1">
            <h3 className="font-semibold text-red-900">{t("deleteAllData")}</h3>
            <p className="mt-2 text-sm text-red-700">{t("deleteAllDataDescription")}</p>
          </div>
          <button
            onClick={clearAllData}
            className="whitespace-nowrap rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
          >
            {t("deleteEverything")}
          </button>
        </div>
      </div>

      {/* Tips */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
        <h3 className="mb-4 font-semibold text-gray-900">{t("backupTips")}</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-teal-500">•</span>
            <span>{t("tipExcel")}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-teal-500">•</span>
            <span>{t("tipJson")}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-teal-500">•</span>
            <span>{t("tipRegularBackup")}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-teal-500">•</span>
            <span>{t("tipSafeLocation")}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-teal-500">•</span>
            <span>{t("tipTestBackups")}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-teal-500">•</span>
            <span>{t("tipLocalStorage")}</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
