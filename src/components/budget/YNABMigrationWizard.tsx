"use client";

/**
 * YNAB Migration Wizard (Y-020)
 * Multi-step wizard for importing YNAB budget data.
 *
 * Steps:
 * 1. File Upload - Select YNAB export file (JSON/CSV)
 * 2. Category Mapping - Map YNAB categories to our categories
 * 3. Options - Configure import settings
 * 4. Preview - Review data before import
 * 5. Importing - Progress indication
 * 6. Complete - Success/summary screen
 */

import { useState, useCallback, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Loader2,
  X,
  FileUp,
  Settings,
  Eye,
  FolderTree,
  Sparkles,
  AlertTriangle,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSeniorsMode } from "@/hooks/useSeniorsMode";
import { ImportWizardStepper, type WizardStep } from "./ImportWizardStepper";

// Types for YNAB data (from our parsers)
import type { ParsedYNABData } from "@/lib/import/ynab-parser";
import type { Category, Transaction, Account, Budget } from "@/types/budget";

// ============================================================================
// Types
// ============================================================================

export type YNABMigrationStep =
  | "upload"
  | "categories"
  | "options"
  | "preview"
  | "importing"
  | "complete";

export interface YNABImportOptions {
  // Category handling
  hiddenCategoryAction: "skip" | "archive" | "import";
  mergeExistingCategories: boolean;

  // Date filtering
  importDateRange: "all" | "recent" | "custom";
  dateFrom?: Date;
  dateTo?: Date;

  // Budget handling
  rolloverMode: "preserve" | "disable" | "auto";
  importGoals: boolean;

  // Account handling
  includeClosedAccounts: boolean;
  includeOffBudgetAccounts: boolean;
}

export interface CategoryMapping {
  ynabCategoryId: string;
  ynabCategoryName: string;
  ynabGroupName: string;
  mappedCategoryId: string | null; // null = create new
  mappedCategoryName: string;
  action: "map" | "create" | "skip";
}

export interface ImportPreview {
  accounts: {
    total: number;
    new: number;
    existing: number;
  };
  transactions: {
    total: number;
    new: number;
    duplicates: number;
    dateRange: { start: Date; end: Date };
  };
  categories: {
    total: number;
    mapped: number;
    created: number;
    skipped: number;
  };
  budgets: {
    months: number;
    total: number;
  };
  warnings: string[];
}

export interface ImportResult {
  success: boolean;
  message: string;
  stats: {
    accounts: { imported: number; skipped: number };
    transactions: { imported: number; skipped: number };
    categories: { imported: number; skipped: number };
    budgets: { imported: number; skipped: number };
  };
  errors: string[];
  warnings: string[];
}

interface YNABMigrationWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete?: (result: ImportResult) => void;
  existingCategories?: Category[];
  existingAccounts?: Account[];
}

// ============================================================================
// Default Values
// ============================================================================

const DEFAULT_OPTIONS: YNABImportOptions = {
  hiddenCategoryAction: "archive",
  mergeExistingCategories: true,
  importDateRange: "all",
  rolloverMode: "auto",
  importGoals: true,
  includeClosedAccounts: false,
  includeOffBudgetAccounts: true,
};

// ============================================================================
// Step Definitions
// ============================================================================

const STEP_ORDER: YNABMigrationStep[] = [
  "upload",
  "categories",
  "options",
  "preview",
  "importing",
  "complete",
];

function getStepIndex(step: YNABMigrationStep): number {
  return STEP_ORDER.indexOf(step);
}

// ============================================================================
// Main Component
// ============================================================================

export function YNABMigrationWizard({
  isOpen,
  onClose,
  onImportComplete,
  existingCategories = [],
  existingAccounts = [],
}: YNABMigrationWizardProps) {
  const t = useTranslations("ynabMigrationWizard");
  const { isSeniorsMode } = useSeniorsMode();

  // ----------------------------------------
  // State
  // ----------------------------------------

  // Current step
  const [currentStep, setCurrentStep] = useState<YNABMigrationStep>("upload");

  // Error state
  const [error, setError] = useState<string | null>(null);

  // Step 1: Upload
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedYNABData | null>(null);
  const [isParsingFile, setIsParsingFile] = useState(false);

  // Step 2: Category Mapping
  const [categoryMappings, setCategoryMappings] = useState<CategoryMapping[]>([]);

  // Step 3: Options
  const [options, setOptions] = useState<YNABImportOptions>(DEFAULT_OPTIONS);

  // Step 4: Preview
  const [preview, setPreview] = useState<ImportPreview | null>(null);

  // Step 5/6: Import
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  // ----------------------------------------
  // Computed
  // ----------------------------------------

  const currentStepIndex = useMemo(() => getStepIndex(currentStep), [currentStep]);

  const wizardSteps: WizardStep[] = useMemo(() => {
    // Only show first 4 steps in stepper (exclude importing/complete)
    const visibleSteps: YNABMigrationStep[] = ["upload", "categories", "options", "preview"];

    return visibleSteps.map((step, idx) => ({
      id: step,
      title: t(`steps.${step}.title`),
      description: t(`steps.${step}.description`),
      status:
        idx < currentStepIndex ? "complete" : idx === currentStepIndex ? "current" : "pending",
    }));
  }, [currentStepIndex, t]);

  const canGoBack = useMemo(() => {
    return currentStepIndex > 0 && currentStep !== "importing" && currentStep !== "complete";
  }, [currentStepIndex, currentStep]);

  const canGoNext = useMemo(() => {
    switch (currentStep) {
      case "upload":
        return parsedData !== null && !isParsingFile;
      case "categories":
        return categoryMappings.length > 0;
      case "options":
        return true;
      case "preview":
        return preview !== null;
      default:
        return false;
    }
  }, [currentStep, parsedData, isParsingFile, categoryMappings, preview]);

  // ----------------------------------------
  // Navigation
  // ----------------------------------------

  const goToStep = useCallback((step: YNABMigrationStep) => {
    setError(null);
    setCurrentStep(step);
  }, []);

  const goBack = useCallback(() => {
    if (!canGoBack) return;

    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      goToStep(STEP_ORDER[prevIndex]);
    }
  }, [canGoBack, currentStepIndex, goToStep]);

  const goNext = useCallback(() => {
    if (!canGoNext) return;

    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEP_ORDER.length) {
      goToStep(STEP_ORDER[nextIndex]);
    }
  }, [canGoNext, currentStepIndex, goToStep]);

  // ----------------------------------------
  // File Handling (Step 1)
  // ----------------------------------------

  const handleFileSelect = useCallback(
    async (selectedFile: File) => {
      setError(null);
      setFile(selectedFile);
      setIsParsingFile(true);

      try {
        // Read file content as text
        const content = await selectedFile.text();

        // Dynamic import of parser to reduce initial bundle
        const { parseYNABFile } = await import("@/lib/import/ynab-parser");

        const data = await parseYNABFile(content, selectedFile.name);
        setParsedData(data);

        // Generate initial category mappings
        const mappings: CategoryMapping[] = [];
        for (const group of data.categoryGroups) {
          for (const cat of group.categories) {
            // Try to find matching existing category
            const existingMatch = existingCategories.find(
              (ec) =>
                ec.name.toLowerCase() === group.name.toLowerCase() ||
                ec.subcategories?.some((sub) => sub.toLowerCase() === cat.name.toLowerCase())
            );

            mappings.push({
              ynabCategoryId: cat.id,
              ynabCategoryName: cat.name,
              ynabGroupName: group.name,
              mappedCategoryId: existingMatch?.id || null,
              mappedCategoryName: existingMatch?.name || group.name,
              action: existingMatch ? "map" : "create",
            });
          }
        }

        setCategoryMappings(mappings);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("errors.parseFailed"));
        setParsedData(null);
      } finally {
        setIsParsingFile(false);
      }
    },
    [existingCategories]
  );

  const handleFileDrop = useCallback(
    (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();

      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) {
        handleFileSelect(droppedFile);
      }
    },
    [handleFileSelect]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        handleFileSelect(selectedFile);
      }
    },
    [handleFileSelect]
  );

  // ----------------------------------------
  // Category Mapping (Step 2)
  // ----------------------------------------

  const updateCategoryMapping = useCallback(
    (ynabCategoryId: string, updates: Partial<CategoryMapping>) => {
      setCategoryMappings((prev) =>
        prev.map((mapping) =>
          mapping.ynabCategoryId === ynabCategoryId ? { ...mapping, ...updates } : mapping
        )
      );
    },
    []
  );

  // ----------------------------------------
  // Preview Generation (Step 4)
  // ----------------------------------------

  const generatePreview = useCallback(async () => {
    if (!parsedData) return;

    try {
      // Calculate preview stats
      const mappedCount = categoryMappings.filter((m) => m.action === "map").length;
      const createdCount = categoryMappings.filter((m) => m.action === "create").length;
      const skippedCount = categoryMappings.filter((m) => m.action === "skip").length;

      // Get date range from transactions
      const dates = parsedData.transactions
        .map((t) => new Date(t.date))
        .filter((d) => !isNaN(d.getTime()));

      const warnings: string[] = [];

      // Check for potential issues
      const hiddenCats = parsedData.categoryGroups
        .flatMap((g) => g.categories)
        .filter((c) => c.hidden);

      if (hiddenCats.length > 0) {
        warnings.push(
          `${hiddenCats.length} hidden categories found - will be ${options.hiddenCategoryAction}ed`
        );
      }

      const closedAccounts = parsedData.accounts.filter((a) => a.closed);
      if (closedAccounts.length > 0 && !options.includeClosedAccounts) {
        warnings.push(`${closedAccounts.length} closed accounts will be skipped`);
      }

      // Find duplicate transactions
      // TODO: Implement proper duplicate detection
      const duplicates = 0;

      setPreview({
        accounts: {
          total: parsedData.accounts.length,
          new: parsedData.accounts.length - existingAccounts.length,
          existing: existingAccounts.length,
        },
        transactions: {
          total: parsedData.transactions.length,
          new: parsedData.transactions.length - duplicates,
          duplicates,
          dateRange: {
            start:
              dates.length > 0 ? new Date(Math.min(...dates.map((d) => d.getTime()))) : new Date(),
            end:
              dates.length > 0 ? new Date(Math.max(...dates.map((d) => d.getTime()))) : new Date(),
          },
        },
        categories: {
          total: categoryMappings.length,
          mapped: mappedCount,
          created: createdCount,
          skipped: skippedCount,
        },
        budgets: {
          months: parsedData.monthlyBudgets?.length || 0,
          total:
            parsedData.monthlyBudgets?.reduce((sum, m) => sum + (m.categories?.length || 0), 0) ||
            0,
        },
        warnings,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.previewFailed"));
    }
  }, [parsedData, categoryMappings, options, existingAccounts]);

  // ----------------------------------------
  // Import Execution (Step 5)
  // ----------------------------------------

  const executeImport = useCallback(async () => {
    if (!parsedData) return;

    setCurrentStep("importing");
    setImportProgress(0);
    setError(null);

    try {
      // Import in stages with progress updates
      const stages = [
        { name: "accounts", weight: 10 },
        { name: "categories", weight: 20 },
        { name: "transactions", weight: 50 },
        { name: "budgets", weight: 20 },
      ];

      let totalProgress = 0;
      const stats = {
        accounts: { imported: 0, skipped: 0 },
        transactions: { imported: 0, skipped: 0 },
        categories: { imported: 0, skipped: 0 },
        budgets: { imported: 0, skipped: 0 },
      };
      const errors: string[] = [];
      const warnings: string[] = [];

      // Stage 1: Import accounts
      try {
        const { transformYNABAccounts } = await import("@/lib/import/ynab-account-transformer");
        const accountResult = transformYNABAccounts(parsedData, {
          includeClosedAccounts: options.includeClosedAccounts,
          includeOffBudgetAccounts: options.includeOffBudgetAccounts,
        });

        // TODO: Save accounts to IndexedDB
        stats.accounts.imported = accountResult.accounts.length;
        warnings.push(...accountResult.warnings);
      } catch (err) {
        errors.push(
          t("errors.accountImportFailed", {
            details: err instanceof Error ? err.message : t("errors.unknownError"),
          })
        );
      }
      totalProgress += stages[0].weight;
      setImportProgress(totalProgress);

      // Stage 2: Import categories
      try {
        const { transformYNABCategories } = await import("@/lib/import/ynab-category-transformer");
        const categoryResult = transformYNABCategories(parsedData, {
          hiddenCategoryAction: options.hiddenCategoryAction,
          mergeWithExisting: options.mergeExistingCategories ? existingCategories : undefined,
        });

        // TODO: Save categories to IndexedDB
        stats.categories.imported = categoryResult.categories.length;
        warnings.push(...categoryResult.warnings);
      } catch (err) {
        errors.push(
          t("errors.categoryImportFailed", {
            details: err instanceof Error ? err.message : t("errors.unknownError"),
          })
        );
      }
      totalProgress += stages[1].weight;
      setImportProgress(totalProgress);

      // Stage 3: Import transactions
      try {
        const { transformYNABData } = await import("@/lib/import/ynab-transaction-transformer");
        const txResult = transformYNABData(parsedData, {
          existingCategories,
        });

        // TODO: Save transactions to IndexedDB
        stats.transactions.imported = txResult.transactions.length;
        warnings.push(...txResult.warnings);
      } catch (err) {
        errors.push(
          t("errors.transactionImportFailed", {
            details: err instanceof Error ? err.message : t("errors.unknownError"),
          })
        );
      }
      totalProgress += stages[2].weight;
      setImportProgress(totalProgress);

      // Stage 4: Import budgets
      try {
        const { transformYNABBudgets } = await import("@/lib/import/ynab-budget-transformer");
        // Note: We need the category ID map from the category transformer
        // For now, using a placeholder
        const budgetResult = transformYNABBudgets(parsedData, {
          categoryIdMap: new Map(),
          rolloverMode: options.rolloverMode,
          importGoals: options.importGoals,
        });

        // TODO: Save budgets to IndexedDB
        stats.budgets.imported = budgetResult.budgets.length;
        warnings.push(...budgetResult.warnings);
      } catch (err) {
        errors.push(
          t("errors.budgetImportFailed", {
            details: err instanceof Error ? err.message : t("errors.unknownError"),
          })
        );
      }
      totalProgress = 100;
      setImportProgress(totalProgress);

      // Create result
      const result: ImportResult = {
        success: errors.length === 0,
        message:
          errors.length === 0
            ? t("importSuccess")
            : t("importWithErrors", { count: errors.length }),
        stats,
        errors,
        warnings,
      };

      setImportResult(result);
      setCurrentStep("complete");

      if (onImportComplete) {
        onImportComplete(result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
      setCurrentStep("preview");
    }
  }, [parsedData, options, existingCategories, onImportComplete]);

  // ----------------------------------------
  // Reset & Close
  // ----------------------------------------

  const resetWizard = useCallback(() => {
    setCurrentStep("upload");
    setFile(null);
    setParsedData(null);
    setIsParsingFile(false);
    setCategoryMappings([]);
    setOptions(DEFAULT_OPTIONS);
    setPreview(null);
    setImportProgress(0);
    setImportResult(null);
    setError(null);
  }, []);

  const handleClose = useCallback(() => {
    if (currentStep === "importing") return; // Don't allow closing during import

    onClose();
    // Reset after animation
    setTimeout(resetWizard, 200);
  }, [currentStep, onClose, resetWizard]);

  // ----------------------------------------
  // Render
  // ----------------------------------------

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl"
        >
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-white/10 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-500/20 to-teal-500/20">
                <Sparkles className="h-5 w-5 text-teal-400" />
              </div>
              <div>
                <h2 className={cn("font-bold text-white", isSeniorsMode ? "text-2xl" : "text-xl")}>
                  {t("header.title")}
                </h2>
                <p className="text-sm text-slate-400">{t("header.subtitle")}</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={currentStep === "importing"}
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              aria-label={t("header.closeLabel")}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Stepper (visible except during importing/complete) */}
          {currentStep !== "importing" && currentStep !== "complete" && (
            <div className="shrink-0 px-6 pt-6">
              <ImportWizardStepper steps={wizardSteps} currentStep={currentStepIndex} />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Step 1: Upload */}
            {currentStep === "upload" && (
              <UploadStep
                file={file}
                parsedData={parsedData}
                isParsingFile={isParsingFile}
                isSeniorsMode={isSeniorsMode}
                t={t}
                onFileDrop={handleFileDrop}
                onFileSelect={handleFileInputChange}
              />
            )}

            {/* Step 2: Categories */}
            {currentStep === "categories" && (
              <CategoryMappingStep
                mappings={categoryMappings}
                existingCategories={existingCategories}
                isSeniorsMode={isSeniorsMode}
                t={t}
                onUpdateMapping={updateCategoryMapping}
              />
            )}

            {/* Step 3: Options */}
            {currentStep === "options" && (
              <OptionsStep
                options={options}
                isSeniorsMode={isSeniorsMode}
                t={t}
                onUpdateOptions={setOptions}
              />
            )}

            {/* Step 4: Preview */}
            {currentStep === "preview" && (
              <PreviewStep
                preview={preview}
                isSeniorsMode={isSeniorsMode}
                t={t}
                onGeneratePreview={generatePreview}
              />
            )}

            {/* Step 5: Importing */}
            {currentStep === "importing" && (
              <ImportingStep progress={importProgress} isSeniorsMode={isSeniorsMode} t={t} />
            )}

            {/* Step 6: Complete */}
            {currentStep === "complete" && (
              <CompleteStep
                result={importResult}
                isSeniorsMode={isSeniorsMode}
                t={t}
                onImportAnother={resetWizard}
                onViewTransactions={() => {
                  onClose();
                  // Navigate to transactions page - handled by parent component
                }}
              />
            )}

            {/* Error Display */}
            {error && (
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-500/10 p-3 text-red-400">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex shrink-0 gap-4 border-t border-white/10 p-6">
            {/* Back button */}
            {canGoBack && (
              <Button
                variant="outline"
                onClick={goBack}
                className={cn(
                  "flex-1 gap-2 border-white/20 text-slate-300 hover:bg-white/10",
                  isSeniorsMode && "min-h-[52px] text-lg"
                )}
              >
                <ArrowLeft className="h-4 w-4" />
                {t("footer.back")}
              </Button>
            )}

            {/* Next/Import button */}
            {currentStep !== "importing" && currentStep !== "complete" && (
              <Button
                onClick={currentStep === "preview" ? executeImport : goNext}
                disabled={!canGoNext}
                className={cn(
                  "flex-1 gap-2 bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 disabled:opacity-50",
                  isSeniorsMode && "min-h-[52px] text-lg"
                )}
              >
                {currentStep === "preview" ? (
                  <>
                    <Upload className="h-4 w-4" />
                    {t("footer.startImport")}
                  </>
                ) : (
                  <>
                    {t("footer.next")}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            )}

            {/* Done button */}
            {currentStep === "complete" && (
              <Button
                onClick={handleClose}
                className={cn(
                  "flex-1 gap-2 bg-teal-500 hover:bg-teal-600",
                  isSeniorsMode && "min-h-[52px] text-lg"
                )}
              >
                <CheckCircle className="h-4 w-4" />
                {t("footer.done")}
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// ============================================================================
// Step Components
// ============================================================================

interface UploadStepProps {
  file: File | null;
  parsedData: ParsedYNABData | null;
  isParsingFile: boolean;
  isSeniorsMode: boolean;
  t: ReturnType<typeof useTranslations<"ynabMigrationWizard">>;
  onFileDrop: (e: React.DragEvent<HTMLLabelElement>) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function UploadStep({
  file,
  parsedData,
  isParsingFile,
  isSeniorsMode,
  t,
  onFileDrop,
  onFileSelect,
}: UploadStepProps) {
  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-4">
        <h3 className="mb-2 flex items-center gap-2 font-medium text-blue-400">
          <Info className="h-5 w-5" />
          {t("uploadStep.supportedFormats")}
        </h3>
        <ul className="ms-7 space-y-1 text-sm text-slate-400">
          <li>
            • <span className="text-white">{t("uploadStep.formatApiExport")}</span> -{" "}
            {t("uploadStep.formatApiExportDesc")}
          </li>
          <li>
            • <span className="text-white">{t("uploadStep.formatYfull")}</span> -{" "}
            {t("uploadStep.formatYfullDesc")}
          </li>
          <li>
            • <span className="text-white">{t("uploadStep.formatCsv")}</span> -{" "}
            {t("uploadStep.formatCsvDesc")}
          </li>
        </ul>
      </div>

      {/* Drop Zone */}
      <label
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-all",
          isParsingFile
            ? "border-teal-500/50 bg-teal-500/5"
            : file && parsedData
              ? "border-green-500/50 bg-green-500/5"
              : "border-white/20 bg-white/5 hover:border-teal-500/50 hover:bg-white/10"
        )}
        onDrop={onFileDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        {isParsingFile ? (
          <Loader2 className="mb-4 h-12 w-12 animate-spin text-teal-400" />
        ) : file && parsedData ? (
          <CheckCircle className="mb-4 h-12 w-12 text-green-400" />
        ) : (
          <Upload className="mb-4 h-12 w-12 text-slate-400" />
        )}

        <p className={cn("font-medium text-white", isSeniorsMode && "text-lg")}>
          {isParsingFile
            ? t("uploadStep.parsing")
            : file
              ? file.name
              : t("uploadStep.clickToSelect")}
        </p>
        <p className="mt-2 text-sm text-slate-500">{t("uploadStep.dragAndDrop")}</p>

        <input
          type="file"
          accept=".json,.yfull,.ynab4,.csv,.tsv"
          onChange={onFileSelect}
          className="hidden"
          disabled={isParsingFile}
        />
      </label>

      {/* File Summary */}
      {parsedData && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <h3 className="mb-3 text-sm font-medium text-slate-400">{t("uploadStep.fileSummary")}</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-500">{t("uploadStep.accounts")}</span>
              <p className="font-medium text-white">{parsedData.accounts.length}</p>
            </div>
            <div>
              <span className="text-slate-500">{t("uploadStep.transactions")}</span>
              <p className="font-medium text-white">
                {parsedData.transactions.length.toLocaleString()}
              </p>
            </div>
            <div>
              <span className="text-slate-500">{t("uploadStep.categories")}</span>
              <p className="font-medium text-white">
                {parsedData.categoryGroups.reduce((sum, g) => sum + g.categories.length, 0)}
              </p>
            </div>
            <div>
              <span className="text-slate-500">{t("uploadStep.format")}</span>
              <p className="font-medium capitalize text-white">{parsedData.version}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface CategoryMappingStepProps {
  mappings: CategoryMapping[];
  existingCategories: Category[];
  isSeniorsMode: boolean;
  t: ReturnType<typeof useTranslations<"ynabMigrationWizard">>;
  onUpdateMapping: (ynabCategoryId: string, updates: Partial<CategoryMapping>) => void;
}

function CategoryMappingStep({
  mappings,
  existingCategories,
  isSeniorsMode,
  t,
  onUpdateMapping,
}: CategoryMappingStepProps) {
  // Group by YNAB category group
  const groupedMappings = useMemo(() => {
    const groups = new Map<string, CategoryMapping[]>();
    for (const mapping of mappings) {
      const existing = groups.get(mapping.ynabGroupName) || [];
      existing.push(mapping);
      groups.set(mapping.ynabGroupName, existing);
    }
    return Array.from(groups.entries());
  }, [mappings]);

  // Calculate stats
  const stats = useMemo(
    () => ({
      total: mappings.length,
      create: mappings.filter((m) => m.action === "create").length,
      map: mappings.filter((m) => m.action === "map").length,
      skip: mappings.filter((m) => m.action === "skip").length,
    }),
    [mappings]
  );

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-4">
        <h3 className="mb-2 flex items-center gap-2 font-medium text-blue-400">
          <FolderTree className="h-5 w-5" />
          {t("categoryStep.title")}
        </h3>
        <p className="text-sm text-slate-400">{t("categoryStep.description")}</p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-teal-500/20 bg-teal-500/10 p-3 text-center">
          <p className="text-2xl font-bold text-teal-400">{stats.create}</p>
          <p className="text-xs text-slate-400">{t("categoryStep.createNew")}</p>
        </div>
        <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-3 text-center">
          <p className="text-2xl font-bold text-blue-400">{stats.map}</p>
          <p className="text-xs text-slate-400">{t("categoryStep.mapToExisting")}</p>
        </div>
        <div className="rounded-lg border border-slate-500/20 bg-slate-500/10 p-3 text-center">
          <p className="text-2xl font-bold text-slate-400">{stats.skip}</p>
          <p className="text-xs text-slate-400">{t("categoryStep.skip")}</p>
        </div>
      </div>

      <div className="max-h-[350px] space-y-4 overflow-y-auto pe-2">
        {groupedMappings.map(([groupName, items]) => (
          <div key={groupName} className="rounded-xl border border-white/10 bg-white/5 p-4">
            <h4
              className={cn(
                "mb-3 flex items-center gap-2 font-medium text-white",
                isSeniorsMode && "text-lg"
              )}
            >
              <FolderTree className="h-4 w-4 text-teal-400" />
              {groupName}
              <span className="ms-auto text-xs font-normal text-slate-500">
                {t("categoryStep.category", { count: items.length })}
              </span>
            </h4>
            <div className="space-y-2">
              {items.map((mapping) => (
                <div
                  key={mapping.ynabCategoryId}
                  className={cn(
                    "flex flex-col gap-2 rounded-lg p-3 transition-colors",
                    mapping.action === "skip" ? "bg-white/5 opacity-60" : "bg-white/5"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <span
                      className={cn(
                        "flex-1 text-sm",
                        mapping.action === "skip" ? "text-slate-500 line-through" : "text-slate-300"
                      )}
                    >
                      {mapping.ynabCategoryName}
                    </span>
                    <select
                      value={mapping.action}
                      onChange={(e) =>
                        onUpdateMapping(mapping.ynabCategoryId, {
                          action: e.target.value as CategoryMapping["action"],
                          mappedCategoryId:
                            e.target.value === "create" ? null : mapping.mappedCategoryId,
                        })
                      }
                      className="min-w-[130px] rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white focus:border-teal-500 focus:outline-none"
                    >
                      <option value="create">{t("categoryStep.createNew")}</option>
                      <option value="skip">{t("categoryStep.skip")}</option>
                      {existingCategories.length > 0 && (
                        <option value="map">{t("categoryStep.mapToExisting")}</option>
                      )}
                    </select>
                  </div>

                  {/* Show category selector when "map" is selected */}
                  {mapping.action === "map" && existingCategories.length > 0 && (
                    <div className="flex items-center gap-2 ps-4">
                      <ArrowRight className="h-4 w-4 text-slate-500" />
                      <select
                        value={mapping.mappedCategoryId || ""}
                        onChange={(e) => {
                          const selected = existingCategories.find((c) => c.id === e.target.value);
                          onUpdateMapping(mapping.ynabCategoryId, {
                            mappedCategoryId: e.target.value || null,
                            mappedCategoryName: selected?.name || mapping.ynabCategoryName,
                          });
                        }}
                        className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white focus:border-teal-500 focus:outline-none"
                      >
                        <option value="">{t("categoryStep.selectCategory")}</option>
                        {existingCategories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Show preview for "create" action */}
                  {mapping.action === "create" && (
                    <div className="flex items-center gap-2 ps-4 text-xs text-teal-400">
                      <Sparkles className="h-3 w-3" />
                      <span>
                        {t("categoryStep.willCreate")} <strong>{mapping.ynabGroupName}</strong> →{" "}
                        {mapping.ynabCategoryName}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface OptionsStepProps {
  options: YNABImportOptions;
  isSeniorsMode: boolean;
  t: ReturnType<typeof useTranslations<"ynabMigrationWizard">>;
  onUpdateOptions: (options: YNABImportOptions) => void;
}

function OptionsStep({ options, isSeniorsMode, t, onUpdateOptions }: OptionsStepProps) {
  const updateOption = <K extends keyof YNABImportOptions>(key: K, value: YNABImportOptions[K]) => {
    onUpdateOptions({ ...options, [key]: value });
  };

  return (
    <div className="space-y-6">
      {/* Hidden Categories */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <h3 className={cn("mb-3 font-medium text-white", isSeniorsMode && "text-lg")}>
          {t("optionsStep.hiddenCategories.title")}
        </h3>
        <p className="mb-4 text-sm text-slate-400">
          {t("optionsStep.hiddenCategories.description")}
        </p>
        <div className="space-y-2">
          {[
            { value: "archive", labelKey: "archive", descKey: "archiveDesc" },
            { value: "skip", labelKey: "skip", descKey: "skipDesc" },
            { value: "import", labelKey: "import", descKey: "importDesc" },
          ].map((opt) => (
            <label
              key={opt.value}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-all",
                options.hiddenCategoryAction === opt.value
                  ? "border-teal-500 bg-teal-500/10"
                  : "border-white/10 hover:border-white/20"
              )}
            >
              <input
                type="radio"
                checked={options.hiddenCategoryAction === opt.value}
                onChange={() =>
                  updateOption(
                    "hiddenCategoryAction",
                    opt.value as typeof options.hiddenCategoryAction
                  )
                }
                className="h-4 w-4 text-teal-500"
              />
              <div>
                <p className="font-medium text-white">
                  {t(`optionsStep.hiddenCategories.${opt.labelKey}`)}
                </p>
                <p className="text-sm text-slate-500">
                  {t(`optionsStep.hiddenCategories.${opt.descKey}`)}
                </p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Account Options */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <h3 className={cn("mb-3 font-medium text-white", isSeniorsMode && "text-lg")}>
          <Settings className="me-2 inline h-4 w-4" />
          {t("optionsStep.accountOptions.title")}
        </h3>
        <div className="space-y-3">
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={options.includeClosedAccounts}
              onChange={(e) => updateOption("includeClosedAccounts", e.target.checked)}
              className="h-4 w-4 rounded text-teal-500"
            />
            <span className="text-slate-300">
              {t("optionsStep.accountOptions.includeClosedAccounts")}
            </span>
          </label>
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={options.includeOffBudgetAccounts}
              onChange={(e) => updateOption("includeOffBudgetAccounts", e.target.checked)}
              className="h-4 w-4 rounded text-teal-500"
            />
            <span className="text-slate-300">
              {t("optionsStep.accountOptions.includeOffBudgetAccounts")}
            </span>
          </label>
        </div>
      </div>

      {/* Budget Options */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <h3 className={cn("mb-3 font-medium text-white", isSeniorsMode && "text-lg")}>
          {t("optionsStep.budgetOptions.title")}
        </h3>
        <div className="space-y-3">
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={options.importGoals}
              onChange={(e) => updateOption("importGoals", e.target.checked)}
              className="h-4 w-4 rounded text-teal-500"
            />
            <span className="text-slate-300">{t("optionsStep.budgetOptions.importGoals")}</span>
          </label>
        </div>
      </div>
    </div>
  );
}

interface PreviewStepProps {
  preview: ImportPreview | null;
  isSeniorsMode: boolean;
  t: ReturnType<typeof useTranslations<"ynabMigrationWizard">>;
  onGeneratePreview: () => void;
}

function PreviewStep({ preview, isSeniorsMode, t, onGeneratePreview }: PreviewStepProps) {
  const locale = useLocale();

  // Auto-generate preview on mount
  if (!preview) {
    onGeneratePreview();
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="mb-4 h-12 w-12 animate-spin text-teal-400" />
        <p className="font-medium text-white">{t("previewStep.preparingPreview")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-4">
        <h3 className="mb-2 flex items-center gap-2 font-medium text-blue-400">
          <Eye className="h-5 w-5" />
          {t("previewStep.title")}
        </h3>
        <p className="text-sm text-slate-400">{t("previewStep.description")}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          label={t("previewStep.accounts")}
          value={preview.accounts.total}
          subtext={t("previewStep.new", { count: preview.accounts.new })}
        />
        <StatCard
          label={t("previewStep.transactions")}
          value={preview.transactions.total}
          subtext={t("previewStep.duplicates", { count: preview.transactions.duplicates })}
        />
        <StatCard
          label={t("previewStep.categories")}
          value={preview.categories.total}
          subtext={t("previewStep.newMapped", {
            created: preview.categories.created,
            mapped: preview.categories.mapped,
          })}
        />
        <StatCard
          label={t("previewStep.budgetMonths")}
          value={preview.budgets.months}
          subtext={t("previewStep.allocations", { count: preview.budgets.total })}
        />
      </div>

      {/* Date Range */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <h3 className="mb-2 text-sm font-medium text-slate-400">{t("previewStep.dateRange")}</h3>
        <p className="text-white">
          {preview.transactions.dateRange.start.toLocaleDateString(locale)} —{" "}
          {preview.transactions.dateRange.end.toLocaleDateString(locale)}
        </p>
      </div>

      {/* Warnings */}
      {preview.warnings.length > 0 && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
          <h3 className="mb-2 flex items-center gap-2 font-medium text-amber-400">
            <AlertTriangle className="h-5 w-5" />
            {t("previewStep.warnings")}
          </h3>
          <ul className="ms-7 space-y-1 text-sm text-amber-300">
            {preview.warnings.map((warning, idx) => (
              <li key={idx}>• {warning}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  subtext: string;
}

function StatCard({ label, value, subtext }: StatCardProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="text-2xl font-bold text-white">{value.toLocaleString()}</p>
      <p className="text-xs text-slate-500">{subtext}</p>
    </div>
  );
}

interface ImportingStepProps {
  progress: number;
  isSeniorsMode: boolean;
  t: ReturnType<typeof useTranslations<"ynabMigrationWizard">>;
}

function ImportingStep({ progress, isSeniorsMode, t }: ImportingStepProps) {
  const stageKey =
    progress < 10
      ? "importingAccounts"
      : progress < 30
        ? "importingCategories"
        : progress < 80
          ? "importingTransactions"
          : progress < 100
            ? "importingBudgets"
            : "finishing";

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="mb-6 h-16 w-16 animate-spin text-teal-400" />
      <p className={cn("mb-4 font-medium text-white", isSeniorsMode && "text-lg")}>
        {t("importingStep.title")}
      </p>

      {/* Progress Bar */}
      <div className="mb-4 w-full max-w-xs">
        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-teal-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <p className="mt-2 text-center text-sm text-slate-400">{progress}%</p>
      </div>

      <p className="text-sm text-slate-500">{t(`importingStep.${stageKey}`)}</p>
    </div>
  );
}

interface CompleteStepProps {
  result: ImportResult | null;
  isSeniorsMode: boolean;
  t: ReturnType<typeof useTranslations<"ynabMigrationWizard">>;
  onImportAnother?: () => void;
  onViewTransactions?: () => void;
}

function CompleteStep({
  result,
  isSeniorsMode,
  t,
  onImportAnother,
  onViewTransactions,
}: CompleteStepProps) {
  if (!result) return null;

  const totalImported =
    result.stats.accounts.imported +
    result.stats.transactions.imported +
    result.stats.categories.imported +
    result.stats.budgets.imported;

  return (
    <div className="flex flex-col items-center justify-center py-8">
      {result.success ? (
        <>
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20">
            <CheckCircle className="h-10 w-10 text-green-400" />
          </div>
          <p className={cn("mb-2 font-bold text-white", isSeniorsMode ? "text-2xl" : "text-xl")}>
            {t("completeStep.success")}
          </p>
          <p className="max-w-sm text-center text-slate-400">
            {t("completeStep.successMessage", { count: totalImported })}
          </p>
        </>
      ) : (
        <>
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-500/20">
            <AlertTriangle className="h-10 w-10 text-amber-400" />
          </div>
          <p className={cn("mb-2 font-bold text-white", isSeniorsMode ? "text-2xl" : "text-xl")}>
            {t("completeStep.withIssues")}
          </p>
          <p className="mb-4 max-w-sm text-center text-slate-400">{result.message}</p>
        </>
      )}

      {/* Stats Summary */}
      <div className="mt-6 w-full max-w-sm rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">{t("previewStep.accounts")}</span>
            <span className="text-white">{result.stats.accounts.imported}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">{t("previewStep.categories")}</span>
            <span className="text-white">{result.stats.categories.imported}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">{t("previewStep.transactions")}</span>
            <span className="text-white">
              {result.stats.transactions.imported.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">{t("previewStep.budgetMonths")}</span>
            <span className="text-white">{result.stats.budgets.imported}</span>
          </div>
        </div>
      </div>

      {/* Errors */}
      {result.errors.length > 0 && (
        <div className="mt-4 w-full max-w-sm rounded-xl border border-red-500/20 bg-red-500/10 p-4">
          <h4 className="mb-2 text-sm font-medium text-red-400">{t("completeStep.errors")}</h4>
          <ul className="space-y-1 text-xs text-red-300">
            {result.errors.map((err, idx) => (
              <li key={idx}>• {err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Next Steps */}
      <div className="mt-6 w-full max-w-sm space-y-3">
        <p className="mb-3 text-center text-sm text-slate-400">{t("completeStep.whatNext")}</p>
        <div className="flex gap-3">
          {onViewTransactions && (
            <button
              onClick={onViewTransactions}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-teal-500/30 bg-teal-500/20 p-3 text-sm font-medium text-teal-400 transition-colors hover:bg-teal-500/30"
            >
              <Eye className="h-4 w-4" />
              {t("completeStep.viewTransactions")}
            </button>
          )}
          {onImportAnother && (
            <button
              onClick={onImportAnother}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 p-3 text-sm font-medium text-slate-300 transition-colors hover:bg-white/10"
            >
              <Upload className="h-4 w-4" />
              {t("completeStep.importAnother")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default YNABMigrationWizard;
