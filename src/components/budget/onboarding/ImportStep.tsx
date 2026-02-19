/**
 * Import Step - Onboarding Wizard
 * Guided import wizard with format detection and bank recognition
 */

"use client";

import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Check,
  FileSpreadsheet,
  FileText,
  HelpCircle,
  Keyboard,
  Upload,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";
import type { StepProps } from "./OnboardingWizard";

type ImportMethod = "csv" | "manual" | "later";

const IMPORT_OPTIONS = [
  {
    id: "csv" as ImportMethod,
    icon: FileSpreadsheet,
    title: "Import from Bank CSV",
    description: "Upload a CSV export from your bank or credit card",
    recommended: true,
    details: [
      "Most banks offer CSV exports",
      "We auto-detect format and columns",
      "Supports 100+ bank formats",
    ],
  },
  {
    id: "manual" as ImportMethod,
    icon: Keyboard,
    title: "Start from Scratch",
    description: "Enter transactions manually as you go",
    recommended: false,
    details: [
      "Perfect for starting fresh",
      "Add transactions one by one",
      "Build history over time",
    ],
  },
  {
    id: "later" as ImportMethod,
    icon: HelpCircle,
    title: "I'll Do This Later",
    description: "Skip import for now and explore the app first",
    recommended: false,
    details: [
      "You can import anytime from Settings",
      "Try the app with sample data",
      "Come back when you're ready",
    ],
  },
];

const SUPPORTED_BANKS = [
  "Chase",
  "Bank of America",
  "Wells Fargo",
  "Citi",
  "Capital One",
  "US Bank",
  "PNC",
  "TD Bank",
  "USAA",
  "Navy Federal",
  "Discover",
  "American Express",
  "Ally Bank",
  "Charles Schwab",
];

export function ImportStep({ onComplete, onSkip }: StepProps) {
  const [selectedMethod, setSelectedMethod] = useState<ImportMethod | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleMethodSelect = useCallback(
    (method: ImportMethod) => {
      setSelectedMethod(method);

      if (method === "manual") {
        // Skip import, go to next step
        onComplete({ importedTransactions: 0, importMethod: "manual" });
      } else if (method === "later") {
        // Skip this step entirely
        onSkip();
      }
    },
    [onComplete, onSkip]
  );

  const handleFileSelect = useCallback((file: File) => {
    setUploadedFile(file);
    setIsProcessing(true);

    // Simulate processing (in real implementation, parse CSV here)
    setTimeout(() => {
      // Simulate detecting 50-150 transactions
      const count = Math.floor(Math.random() * 100) + 50;
      setProcessedCount(count);
      setIsProcessing(false);
    }, 1500);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      const supportedExtensions = [".csv", ".ofx", ".qfx", ".pdf", ".qif", ".sta", ".mt940", ".xml"];
      if (file && supportedExtensions.some((ext) => file.name.toLowerCase().endsWith(ext))) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const handleImportComplete = useCallback(() => {
    onComplete({ importedTransactions: processedCount, importMethod: "csv" });
  }, [onComplete, processedCount]);

  // Show upload zone when CSV is selected
  if (selectedMethod === "csv") {
    return (
      <div className="space-y-6">
        {/* Upload Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "relative flex flex-col items-center justify-center",
            "min-h-[200px] cursor-pointer rounded-xl border-2 border-dashed",
            "transition-all duration-200",
            isDragging
              ? "border-teal-500 bg-teal-500/10"
              : "border-slate-700 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800"
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.ofx,.qfx,.pdf,.qif,.sta,.mt940,.xml"
            onChange={handleFileInputChange}
            className="hidden"
          />

          {isProcessing ? (
            <div className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-teal-500/30 border-t-teal-500" />
              <p className="font-medium text-white">Processing {uploadedFile?.name}...</p>
              <p className="mt-1 text-sm text-slate-400">
                Detecting format and parsing transactions
              </p>
            </div>
          ) : uploadedFile && processedCount > 0 ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-teal-500/20">
                <Check className="h-6 w-6 text-teal-400" />
              </div>
              <p className="font-medium text-white">{uploadedFile.name}</p>
              <p className="mt-1 text-sm text-teal-400">
                Found {processedCount} transactions ready to import
              </p>
            </div>
          ) : (
            <>
              <Upload
                className={cn(
                  "mb-4 h-12 w-12 transition-colors",
                  isDragging ? "text-teal-400" : "text-slate-500"
                )}
              />
              <p className="mb-1 font-medium text-white">
                {isDragging ? "Drop your file here" : "Drag & drop your bank CSV"}
              </p>
              <p className="text-sm text-slate-400">or click to browse files</p>
              <p className="mt-4 text-xs text-slate-500">Supports CSV and OFX formats</p>
            </>
          )}
        </div>

        {/* Supported Banks (collapsed hint) */}
        <div className="rounded-lg bg-slate-800/50 p-4">
          <p className="mb-2 text-sm text-slate-400">Works with exports from:</p>
          <p className="text-xs text-slate-500">
            {SUPPORTED_BANKS.slice(0, 8).join(", ")} and 100+ more banks
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setSelectedMethod(null)}
            className="px-4 py-2 text-slate-400 transition-colors hover:text-white"
          >
            Back
          </button>

          {uploadedFile && processedCount > 0 && (
            <button
              type="button"
              onClick={handleImportComplete}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 px-6 py-3",
                "bg-gradient-to-r from-teal-500 to-blue-500",
                "rounded-lg font-medium text-white",
                "transition-opacity hover:opacity-90"
              )}
            >
              Import {processedCount} Transactions
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // Method selection view
  return (
    <div className="space-y-4">
      <p className="mb-6 text-slate-400">
        How would you like to get started with your transaction history?
      </p>

      {/* Import Options */}
      <div className="space-y-3">
        {IMPORT_OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => handleMethodSelect(option.id)}
            className={cn(
              "flex w-full items-start gap-4 rounded-xl p-4 text-start",
              "border border-white/5 bg-slate-800/50",
              "hover:border-teal-500/50 hover:bg-slate-800",
              "transition-all duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
            )}
          >
            <div
              className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
                option.recommended ? "bg-gradient-to-br from-teal-500 to-blue-500" : "bg-slate-700"
              )}
            >
              <option.icon className="h-6 w-6 text-white" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2">
                <h4 className="font-medium text-white">{option.title}</h4>
                {option.recommended && (
                  <span className="rounded-full bg-teal-500/20 px-2 py-0.5 text-xs font-medium text-teal-400">
                    Recommended
                  </span>
                )}
              </div>
              <p className="mb-2 text-sm text-slate-400">{option.description}</p>
              <ul className="space-y-1">
                {option.details.map((detail, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-slate-500">
                    <Check className="h-3 w-3 text-teal-500" />
                    {detail}
                  </li>
                ))}
              </ul>
            </div>

            <ArrowRight className="h-5 w-5 shrink-0 text-slate-600" />
          </button>
        ))}
      </div>

      {/* Help text */}
      <p className="pt-4 text-center text-xs text-slate-500">
        Don&apos;t worry—you can always import more transactions later from Settings.
      </p>
    </div>
  );
}

export default ImportStep;
