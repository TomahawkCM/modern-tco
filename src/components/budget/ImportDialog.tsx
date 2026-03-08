"use client";

/**
 * Import Dialog Component (X-033)
 * Dialog for importing budget data from .budget files.
 */

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Loader2,
  X,
  FileUp,
  Info,
  AlertTriangle,
  Wallet,
  Receipt,
  Tag,
  PieChart,
  Target,
  CreditCard,
  Repeat,
  User,
  Activity,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  readBudgetFile,
  previewImport,
  importBudgetData,
  type BudgetFile,
  type ImportOptions,
  type ImportProgress,
  isEncryptedData,
} from "@/lib/export";
import { cn } from "@/lib/utils";
import { useSeniorsMode } from "@/hooks/useSeniorsMode";
import { useTranslations, useLocale } from "next-intl";

interface ImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete?: () => void;
}

type ImportStep = "select" | "preview" | "importing" | "complete";

// Icons for each data type
const tableIcons: Record<string, LucideIcon> = {
  accounts: Wallet,
  transactions: Receipt,
  categories: Tag,
  budgets: PieChart,
  goals: Target,
  loans: CreditCard,
  subscriptions: Repeat,
  profiles: User,
  activityLog: Activity,
};

// Display names for tables
const tableDisplayNames: Record<string, string> = {
  accounts: "Accounts",
  transactions: "Transactions",
  categories: "Categories",
  budgets: "Budgets",
  goals: "Goals",
  loans: "Loans",
  subscriptions: "Subscriptions",
  profiles: "Profiles",
  activityLog: "Activity Log",
};

export function ImportDialog({ isOpen, onClose, onImportComplete }: ImportDialogProps) {
  const { isSeniorsMode } = useSeniorsMode();
  const t = useTranslations("importDialog");
  const locale = useLocale();
  const [step, setStep] = useState<ImportStep>("select");
  const [error, setError] = useState<string | null>(null);

  // File state
  const [file, setFile] = useState<File | null>(null);
  const [budgetFile, setBudgetFile] = useState<BudgetFile | null>(null);

  // Password state
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [needsPassword, setNeedsPassword] = useState(false);
  const [passwordHint, setPasswordHint] = useState<string | null>(null);

  // Preview state
  const [preview, setPreview] = useState<Awaited<ReturnType<typeof previewImport>> | null>(null);

  // Options state
  const [conflictResolution, setConflictResolution] = useState<"skip" | "overwrite" | "rename">(
    "skip"
  );

  // Result state
  const [importResult, setImportResult] = useState<{
    success: boolean;
    message: string;
    imported: number;
  } | null>(null);

  // Import progress state
  const [importProgress, setImportProgress] = useState<ImportProgress | null>(null);

  // Handle file selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setError(null);
    setFile(selectedFile);

    try {
      const parsed = await readBudgetFile(selectedFile);
      setBudgetFile(parsed);

      // Check if encrypted
      if (isEncryptedData(parsed.data)) {
        setNeedsPassword(true);
        // Check for password hint in metadata
        if ((parsed.metadata as { passwordHint?: string }).passwordHint) {
          setPasswordHint((parsed.metadata as { passwordHint?: string }).passwordHint || null);
        }
      } else {
        // Load preview
        const previewData = await previewImport(parsed);
        setPreview(previewData);
        setStep("preview");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to read file");
    }
  };

  // Handle password submit
  const handlePasswordSubmit = async () => {
    if (!budgetFile || !password) return;

    setError(null);

    try {
      const previewData = await previewImport(budgetFile, password);
      if (previewData.valid) {
        setPreview(previewData);
        setStep("preview");
      } else {
        setError(previewData.errors[0] || "Invalid password");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Decryption failed");
    }
  };

  // Handle import
  const handleImport = async () => {
    if (!budgetFile) return;

    setStep("importing");
    setError(null);
    setImportProgress(null);

    try {
      const options: ImportOptions = {
        conflictResolution,
        password: needsPassword ? password : undefined,
        onProgress: setImportProgress,
      };

      const result = await importBudgetData(budgetFile, options);

      const totalImported = Object.values(result.stats).reduce((sum, s) => sum + s.imported, 0);

      setImportResult({
        success: result.success,
        message: result.message,
        imported: totalImported,
      });

      setStep("complete");

      if (result.success && onImportComplete) {
        onImportComplete();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
      setStep("preview");
    }
  };

  // Reset and close
  const handleClose = () => {
    if (step === "importing") return;

    onClose();
    // Reset state after animation
    setTimeout(() => {
      setStep("select");
      setFile(null);
      setBudgetFile(null);
      setPassword("");
      setNeedsPassword(false);
      setPasswordHint(null);
      setPreview(null);
      setError(null);
      setImportResult(null);
      setImportProgress(null);
    }, 200);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-slate-900 shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20">
                <FileUp className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <h2 className={cn("font-bold text-white", isSeniorsMode ? "text-2xl" : "text-xl")}>
                  {t("title")}
                </h2>
                <p className="text-sm text-slate-400">{t("subtitle")}</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={step === "importing"}
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Step: Select File */}
            {step === "select" && (
              <div className="space-y-6">
                {/* File Drop Zone */}
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/20 bg-white/5 p-8 transition-all hover:border-teal-500/50 hover:bg-white/10">
                  <Upload className="mb-4 h-12 w-12 text-slate-400" />
                  <p className={cn("font-medium text-white", isSeniorsMode && "text-lg")}>
                    {file ? file.name : t("selectFile.label")}
                  </p>
                  <p className="mt-2 text-sm text-slate-500">{t("selectFile.dragDrop")}</p>
                  <input
                    type="file"
                    accept=".budget,.json"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>

                {/* Password Input (if needed) */}
                {needsPassword && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 rounded-lg bg-amber-500/10 p-3 text-amber-400">
                      <Lock className="h-5 w-5 shrink-0" />
                      <p className="text-sm">{t("encryption.encrypted")}</p>
                    </div>

                    {passwordHint && (
                      <div className="flex items-center gap-2 rounded-lg bg-blue-500/10 p-3 text-blue-400">
                        <Info className="h-5 w-5 shrink-0" />
                        <p className="text-sm">{t("encryption.hint", { hint: passwordHint })}</p>
                      </div>
                    )}

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-400">
                        {t("encryption.password")}
                      </label>
                      <div className="relative">
                        <Lock className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder={t("encryption.enterPassword")}
                          className={cn(
                            "w-full rounded-lg border border-white/10 bg-white/5 py-3 pe-12 ps-10 text-white placeholder:text-slate-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500",
                            isSeniorsMode && "py-4 text-lg"
                          )}
                          onKeyDown={(e) => e.key === "Enter" && handlePasswordSubmit()}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <Button
                      onClick={handlePasswordSubmit}
                      disabled={!password}
                      className={cn(
                        "w-full gap-2 bg-teal-500 hover:bg-teal-600",
                        isSeniorsMode && "min-h-[52px] text-lg"
                      )}
                    >
                      {t("encryption.decrypt")}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Step: Preview */}
            {step === "preview" && preview && (
              <div className="space-y-6">
                {/* File Info */}
                <div className="rounded-xl bg-white/5 p-4">
                  <h3 className="mb-3 text-sm font-medium text-slate-400">
                    {t("preview.fileInfo")}
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">{t("preview.version")}</span>
                      <span className="text-white">{preview.metadata.version}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">{t("preview.exported")}</span>
                      <span className="text-white">
                        {new Date(preview.metadata.exportedAt).toLocaleDateString(locale)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Data Summary */}
                <div className="rounded-xl bg-white/5 p-4">
                  <h3 className="mb-3 text-sm font-medium text-slate-400">
                    {t("preview.dataToImport")}
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {Object.entries(preview.counts).map(([key, count]) => (
                      <div key={key} className="flex justify-between">
                        <span className="capitalize text-slate-500">{key}</span>
                        <span className="text-white">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Conflicts Warning */}
                {Object.keys(preview.conflicts).length > 0 && (
                  <div className="rounded-xl bg-amber-500/10 p-4">
                    <div className="mb-3 flex items-center gap-2 text-amber-400">
                      <AlertTriangle className="h-5 w-5" />
                      <h3 className="font-medium">{t("conflicts.title")}</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      {Object.entries(preview.conflicts).map(([key, count]) => (
                        <div key={key} className="flex justify-between text-amber-300">
                          <span className="capitalize">{key}</span>
                          <span>{t("conflicts.existing", { count })}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Conflict Resolution */}
                <div>
                  <label className="mb-3 block text-sm font-medium text-slate-400">
                    {t("conflicts.handleLabel")}
                  </label>
                  <div className="space-y-2">
                    {[
                      {
                        value: "skip",
                        label: t("conflicts.skip.label"),
                        desc: t("conflicts.skip.description"),
                      },
                      {
                        value: "overwrite",
                        label: t("conflicts.overwrite.label"),
                        desc: t("conflicts.overwrite.description"),
                      },
                      {
                        value: "rename",
                        label: t("conflicts.rename.label"),
                        desc: t("conflicts.rename.description"),
                      },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className={cn(
                          "flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-all",
                          conflictResolution === option.value
                            ? "border-teal-500 bg-teal-500/10"
                            : "border-white/10 bg-white/5 hover:border-white/20"
                        )}
                      >
                        <input
                          type="radio"
                          name="conflict"
                          value={option.value}
                          checked={conflictResolution === option.value}
                          onChange={(e) =>
                            setConflictResolution(e.target.value as typeof conflictResolution)
                          }
                          className="h-4 w-4 text-teal-500 focus:ring-teal-500"
                        />
                        <div>
                          <p className={cn("font-medium text-white", isSeniorsMode && "text-lg")}>
                            {option.label}
                          </p>
                          <p className="text-sm text-slate-500">{option.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step: Importing */}
            {step === "importing" && (
              <div className="flex flex-col items-center justify-center space-y-6 py-8">
                {/* Progress Bar */}
                <div className="w-full space-y-2">
                  <Progress
                    value={
                      importProgress
                        ? importProgress.stage === "complete"
                          ? 100
                          : importProgress.totalTables > 0
                            ? ((importProgress.tableIndex +
                                (importProgress.totalItems > 0
                                  ? importProgress.itemsProcessed / importProgress.totalItems
                                  : 0)) /
                                importProgress.totalTables) *
                              100
                            : 0
                        : 0
                    }
                    className="h-3"
                    aria-label={`Import progress: ${importProgress?.stage === "complete" ? "100" : Math.round(importProgress?.totalTables ? ((importProgress.tableIndex + (importProgress.totalItems > 0 ? importProgress.itemsProcessed / importProgress.totalItems : 0)) / importProgress.totalTables) * 100 : 0)}%`}
                  />
                </div>

                {/* Current Stage/Table Display */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={importProgress?.currentTable || importProgress?.stage || "loading"}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col items-center space-y-3"
                  >
                    {/* Icon and Table Name */}
                    {importProgress?.stage === "validating" && (
                      <>
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-500/20">
                          <Loader2 className="h-7 w-7 animate-spin text-blue-400" />
                        </div>
                        <p className={cn("font-medium text-white", isSeniorsMode && "text-lg")}>
                          Validating file...
                        </p>
                      </>
                    )}

                    {importProgress?.stage === "decrypting" && (
                      <>
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/20">
                          <Lock className="h-7 w-7 text-amber-400" />
                        </div>
                        <p className={cn("font-medium text-white", isSeniorsMode && "text-lg")}>
                          Decrypting data...
                        </p>
                      </>
                    )}

                    {importProgress?.stage === "importing" && importProgress.currentTable && (
                      <>
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-500/20">
                          {(() => {
                            const IconComponent = tableIcons[importProgress.currentTable] || FileUp;
                            return <IconComponent className="h-7 w-7 text-teal-400" />;
                          })()}
                        </div>
                        <p className={cn("font-medium text-white", isSeniorsMode && "text-lg")}>
                          Importing{" "}
                          {tableDisplayNames[importProgress.currentTable] ||
                            importProgress.currentTable}
                        </p>
                        <p className="text-sm text-slate-400">
                          {importProgress.itemsProcessed.toLocaleString()} of{" "}
                          {importProgress.totalItems.toLocaleString()} items
                        </p>
                      </>
                    )}

                    {(!importProgress ||
                      (importProgress.stage === "importing" && !importProgress.currentTable)) && (
                      <>
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-500/20">
                          <Loader2 className="h-7 w-7 animate-spin text-teal-400" />
                        </div>
                        <p className={cn("font-medium text-white", isSeniorsMode && "text-lg")}>
                          {t("importing.title")}
                        </p>
                      </>
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Helper Text */}
                <p className="text-center text-sm text-slate-500">{t("importing.pleaseWait")}</p>
              </div>
            )}

            {/* Step: Complete */}
            {step === "complete" && importResult && (
              <div className="flex flex-col items-center justify-center py-12">
                {importResult.success ? (
                  <>
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
                      <CheckCircle className="h-8 w-8 text-green-400" />
                    </div>
                    <p className={cn("font-medium text-white", isSeniorsMode && "text-lg")}>
                      {t("complete.success")}
                    </p>
                    <p className="mt-2 text-sm text-slate-400">
                      {t("complete.itemsImported", { count: importResult.imported })}
                    </p>
                  </>
                ) : (
                  <>
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/20">
                      <AlertTriangle className="h-8 w-8 text-amber-400" />
                    </div>
                    <p className={cn("font-medium text-white", isSeniorsMode && "text-lg")}>
                      {t("complete.withIssues")}
                    </p>
                    <p className="mt-2 text-sm text-slate-400">{importResult.message}</p>
                  </>
                )}
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-500/10 p-3 text-red-400">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex gap-4 border-t border-white/10 p-6">
            {step === "select" && !needsPassword && (
              <Button
                variant="outline"
                onClick={handleClose}
                className={cn(
                  "flex-1 border-white/20 text-slate-300 hover:bg-white/10",
                  isSeniorsMode && "min-h-[52px] text-lg"
                )}
              >
                {t("buttons.cancel")}
              </Button>
            )}

            {step === "preview" && (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setStep("select");
                    setFile(null);
                    setBudgetFile(null);
                    setPreview(null);
                  }}
                  className={cn(
                    "flex-1 border-white/20 text-slate-300 hover:bg-white/10",
                    isSeniorsMode && "min-h-[52px] text-lg"
                  )}
                >
                  {t("buttons.back")}
                </Button>
                <Button
                  onClick={handleImport}
                  className={cn(
                    "flex-1 gap-2 bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600",
                    isSeniorsMode && "min-h-[52px] text-lg"
                  )}
                >
                  <Upload className="h-4 w-4" />
                  {t("buttons.import")}
                </Button>
              </>
            )}

            {step === "complete" && (
              <Button
                onClick={handleClose}
                className={cn(
                  "flex-1 gap-2 bg-teal-500 hover:bg-teal-600",
                  isSeniorsMode && "min-h-[52px] text-lg"
                )}
              >
                <CheckCircle className="h-4 w-4" />
                {t("buttons.done")}
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default ImportDialog;
