"use client";

/**
 * Receipt Scanner (OCR) Page
 * Upload and scan receipt images to automatically extract transaction data
 * Uses Tesseract.js for client-side OCR processing
 */

import { useState, useRef, useEffect } from "react";
import {
  Camera,
  Upload,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  Eye,
  Save,
  FileText,
  Plus,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { extractReceiptData, type ExtractedReceiptData } from "@/lib/receipt-ocr";
import { getPrivacySettings } from "@/lib/budget-privacy-settings";
import { db } from "@/lib/budget-db";
import { CategoryCombobox } from "@/components/budget/CategoryCombobox";
import type { Category } from "@/types/budget";
import Link from "next/link";

export default function ReceiptScannerPage() {
  const t = useTranslations("ocr");
  const locale = useLocale();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedReceiptData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedTransactionId, setSavedTransactionId] = useState<string | null>(null);

  // Form fields for editing extracted data
  const [merchant, setMerchant] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("");
  const [subcategory, setSubcategory] = useState<string>("");

  // Category state
  const [categories, setCategories] = useState<Category[]>([]);
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategorySubcats, setNewCategorySubcats] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load categories on mount
  useEffect(() => {
    db.categories
      .toArray()
      .then((cats) => setCategories(cats.filter((c) => !c.archived)))
      .catch((err) => console.error("Failed to load categories:", err));
  }, []);

  // Check if OCR is enabled in privacy settings
  const privacySettings = getPrivacySettings();
  const isOCREnabled = privacySettings.enableOCR;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type (images and PDFs supported)
    const isImage = file.type.startsWith("image/");
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

    if (!isImage && !isPdf) {
      setError(t("errorInvalidFileType"));
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError(t("errorFileSize"));
      return;
    }

    setImageFile(file);
    setError(null);
    setSavedTransactionId(null);
    setExtractedData(null);
    setProcessingProgress(null);

    // Create preview (only for images, PDFs will show file info)
    if (isImage) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      // For PDFs, set a placeholder
      setImagePreview("pdf");
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];

    if (!file) return;

    // Validate file type (images and PDFs supported)
    const isImage = file.type.startsWith("image/");
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

    if (!isImage && !isPdf) {
      setError(t("errorInvalidFileType"));
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError(t("errorFileSize"));
      return;
    }

    setImageFile(file);
    setError(null);
    setSavedTransactionId(null);
    setExtractedData(null);
    setProcessingProgress(null);

    // Create preview (only for images, PDFs will show file info)
    if (isImage) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      // For PDFs, set a placeholder
      setImagePreview("pdf");
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const processReceipt = async () => {
    if (!imageFile) return;

    setIsProcessing(true);
    setError(null);
    setExtractedData(null);
    setProcessingProgress(null);

    try {
      // Pass progress callback for multi-page PDFs
      const data = await extractReceiptData(imageFile, (current, total) => {
        setProcessingProgress({ current, total });
      });

      setExtractedData(data);
      setProcessingProgress(null);

      // Pre-fill form with extracted data
      if (data.merchant) setMerchant(data.merchant);
      if (data.amount !== null) setAmount(Math.abs(data.amount).toFixed(2));
      if (data.date) setDate(data.date.toISOString().split("T")[0]);
      if (data.merchant) setDescription(data.merchant);

      if (data.confidence < 0.5) {
        setError(t("errorLowConfidence"));
      }
    } catch (err) {
      console.error("OCR processing error:", err);
      setError(t("errorProcessingFailed"));
    } finally {
      setIsProcessing(false);
      setProcessingProgress(null);
    }
  };

  const saveTransaction = async () => {
    if (!merchant || !amount || !date) {
      setError(t("errorRequiredFields"));
      return;
    }

    try {
      // Get default account (or first account)
      const accounts = await db.accounts.toArray();
      if (accounts.length === 0) {
        setError(t("errorNoAccount"));
        return;
      }

      const accountId = accounts[0].id;

      // Create transaction
      const transaction = {
        id: `txn_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        accountId,
        date: new Date(date),
        description: description || merchant,
        originalDescription: extractedData?.rawText || "",
        amount: -Math.abs(parseFloat(amount)), // Negative for expense
        category: category || null,
        subcategory: subcategory || null,
        notes: extractedData
          ? `OCR Confidence: ${(extractedData.confidence * 100).toFixed(1)}%`
          : "",
        isRecurring: false,
        tags: ["receipt-scan"],
        merchant,
        receiptIds: [], // Could link to stored receipt blob
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await db.transactions.add(transaction);
      setSavedTransactionId(transaction.id);
      setError(null);

      // Reset form after 2 seconds
      setTimeout(() => {
        resetForm();
      }, 2000);
    } catch (err) {
      console.error("Error saving transaction:", err);
      setError(t("errorSaveFailed"));
    }
  };

  const resetForm = () => {
    setImageFile(null);
    setImagePreview(null);
    setExtractedData(null);
    setProcessingProgress(null);
    setMerchant("");
    setAmount("");
    setDate("");
    setDescription("");
    setCategory("");
    setSubcategory("");
    setShowCreateCategory(false);
    setNewCategoryName("");
    setNewCategorySubcats("");
    setSavedTransactionId(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const createNewCategory = () => {
    if (!newCategoryName.trim()) return;

    const subcatsArray = newCategorySubcats
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const newCat: Category = {
      id: `cat_${Date.now()}`,
      name: newCategoryName.trim(),
      type: "expense",
      subcategories: subcatsArray,
      color: "#3b82f6",
      icon: "tag",
      isDefault: false,
      order: categories.length + 1,
      createdAt: new Date(),
    };

    setCategories((prev) => [...prev, newCat]);
    setCategory(newCat.name);
    setSubcategory("");
    setShowCreateCategory(false);
    setNewCategoryName("");
    setNewCategorySubcats("");

    db.categories.add(newCat).catch((error) => {
      console.error("Error saving category to DB:", error);
    });
  };

  const expenseCategories = categories.filter((c) => c.type === "expense");
  const selectedCategory = expenseCategories.find((c) => c.name === category);

  // If OCR is disabled, show message
  if (!isOCREnabled) {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-3xl font-bold text-white">{t("title")}</h1>

        <div className="rounded-lg border border-yellow-500/30 bg-yellow-900/20 p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-6 w-6 flex-shrink-0 text-yellow-500" />
            <div>
              <h3 className="mb-2 text-lg font-semibold text-white">{t("ocrDisabled")}</h3>
              <p className="mb-4 text-slate-300">{t("ocrDisabledDescription")}</p>
              <Link
                href="/budget-app/settings"
                className="inline-flex items-center rounded-lg bg-yellow-600 px-4 py-2 text-white transition-colors hover:bg-yellow-700"
              >
                {t("goToSettings")}
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-white/10 bg-slate-800/50 p-4">
          <div className="flex items-start gap-3">
            <Eye className="mt-0.5 h-5 w-5 flex-shrink-0 text-teal-500" />
            <div>
              <h4 className="mb-1 text-sm font-semibold text-white">{t("privacyNote")}</h4>
              <p className="text-sm text-slate-300">{t("privacyNoteDescription")}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">{t("title")}</h1>
        <p className="mt-2 text-slate-400">{t("subtitle")}</p>
      </div>

      {/* Privacy Notice */}
      <div className="mb-6 rounded-lg border border-white/10 bg-slate-800/50 p-4">
        <div className="flex items-start gap-3">
          <Eye className="mt-0.5 h-5 w-5 flex-shrink-0 text-teal-500" />
          <div className="flex-1">
            <h4 className="mb-1 text-sm font-semibold text-white">{t("privacyFirst")}</h4>
            <p className="text-sm text-slate-300">{t("privacyFirstDescription")}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Left Column: Upload & Preview */}
        <div className="space-y-6">
          {/* File Upload */}
          <div className="rounded-lg border border-white/10 bg-slate-800/50 p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
              <Camera className="h-5 w-5 text-teal-500" />
              {t("uploadReceipt")}
            </h2>

            {!imagePreview ? (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="cursor-pointer rounded-lg border-2 border-dashed border-slate-600 p-8 text-center transition-colors hover:border-teal-500"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mx-auto mb-4 h-12 w-12 text-slate-400" />
                <p className="mb-2 text-slate-300">
                  <span className="font-semibold text-teal-500">{t("clickToUpload")}</span>{" "}
                  {t("orDragAndDrop")}
                </p>
                <p className="text-sm text-slate-400">{t("supportedFormats")}</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                  aria-label={t("uploadReceiptAriaLabel")}
                />
              </div>
            ) : (
              <div>
                {/* Show PDF icon for PDFs, image preview for images */}
                {imagePreview === "pdf" ? (
                  <div className="relative mb-4 rounded-lg border border-slate-600 bg-slate-900/50 p-8 text-center">
                    <FileText className="mx-auto mb-2 h-16 w-16 text-slate-400" />
                    <p className="text-sm font-medium text-white">{imageFile?.name}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      PDF • {((imageFile?.size || 0) / 1024).toFixed(0)} KB
                    </p>
                  </div>
                ) : (
                  <div className="relative mb-4 overflow-hidden rounded-lg border border-slate-600">
                    <img src={imagePreview} alt="Receipt preview" className="h-auto w-full" />
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={processReceipt}
                    disabled={isProcessing}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-teal-500 px-4 py-2 text-white transition-colors hover:bg-teal-600 disabled:cursor-not-allowed disabled:bg-slate-600"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        {processingProgress
                          ? t("processingPage", {
                              current: processingProgress.current,
                              total: processingProgress.total,
                            })
                          : t("processing")}
                      </>
                    ) : (
                      <>
                        <Camera className="h-5 w-5" />
                        {t("scanReceipt")}
                      </>
                    )}
                  </button>
                  <button
                    onClick={resetForm}
                    disabled={isProcessing}
                    className="rounded-lg border border-slate-600 px-4 py-2 text-slate-300 transition-colors hover:bg-slate-700"
                  >
                    {t("clear")}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* OCR Results */}
          {extractedData && (
            <div className="rounded-lg border border-white/10 bg-slate-800/50 p-6">
              <h3 className="mb-4 text-lg font-semibold text-white">{t("ocrResults")}</h3>

              {/* Show PDF info if multi-page */}
              {extractedData.pagesProcessed && extractedData.pagesProcessed > 1 && (
                <div className="mb-4 rounded-lg bg-slate-900/50 p-3 text-sm text-slate-300">
                  <p className="font-medium">
                    {t("processedPages", { count: extractedData.pagesProcessed })}
                  </p>
                  <p className="mt-1 text-xs">
                    {t("bestResultPage", { page: extractedData.bestPageNumber ?? 0 })}
                  </p>
                </div>
              )}

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                  <span className="text-slate-400">{t("confidence")}:</span>
                  <span
                    className={`font-semibold ${
                      extractedData.confidence >= 0.7
                        ? "text-green-500"
                        : extractedData.confidence >= 0.5
                          ? "text-yellow-500"
                          : "text-red-500"
                    }`}
                  >
                    {(extractedData.confidence * 100).toFixed(1)}%
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                  <span className="text-slate-400">{t("merchantLabel")}:</span>
                  <span className="font-medium text-white">
                    {extractedData.merchant || t("notFound")}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                  <span className="text-slate-400">{t("amountLabel")}:</span>
                  <span className="font-medium text-white">
                    {extractedData.amount !== null
                      ? `$${extractedData.amount.toFixed(2)}`
                      : t("notFound")}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                  <span className="text-slate-400">{t("dateLabel")}:</span>
                  <span className="font-medium text-white">
                    {extractedData.date
                      ? extractedData.date.toLocaleDateString(locale)
                      : t("notFound")}
                  </span>
                </div>
              </div>

              {extractedData.rawText && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm text-slate-400 hover:text-white">
                    {t("viewRawOcrText")}
                  </summary>
                  <pre className="mt-2 max-h-48 overflow-auto rounded bg-slate-900/50 p-3 text-xs text-slate-300">
                    {extractedData.rawText}
                  </pre>
                </details>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Transaction Form */}
        <div className="rounded-lg border border-white/10 bg-slate-800/50 p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
            <Save className="h-5 w-5 text-teal-500" />
            {t("transactionDetails")}
          </h2>

          <div className="space-y-4">
            {/* Merchant */}
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">
                {t("merchantRequired")}
              </label>
              <input
                type="text"
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                placeholder={t("merchantPlaceholder")}
                className="w-full rounded-lg border border-slate-600 bg-slate-900/50 px-3 py-2 text-white placeholder-slate-500 focus:border-transparent focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Amount */}
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">
                {t("amountRequired")}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-lg border border-slate-600 bg-slate-900/50 py-2 pl-7 pr-3 text-white placeholder-slate-500 focus:border-transparent focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* Date */}
            <div>
              <label
                htmlFor="receipt-date"
                className="mb-1 block text-sm font-medium text-slate-300"
              >
                {t("dateRequired")}
              </label>
              <input
                id="receipt-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                aria-label={t("receiptDateAriaLabel")}
                className="w-full rounded-lg border border-slate-600 bg-slate-900/50 px-3 py-2 text-white focus:border-transparent focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">
                {t("descriptionLabel")}
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("descriptionPlaceholder")}
                className="w-full rounded-lg border border-slate-600 bg-slate-900/50 px-3 py-2 text-white placeholder-slate-500 focus:border-transparent focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Category */}
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">
                {t("categoryLabel")}
              </label>
              {!showCreateCategory ? (
                <CategoryCombobox
                  options={[
                    ...expenseCategories.map((cat) => ({
                      value: cat.name,
                      label: cat.name,
                    })),
                    { value: "__create__", label: t("createNewCategory") },
                  ]}
                  value={category}
                  onChange={(value) => {
                    if (value === "__create__") {
                      setShowCreateCategory(true);
                      setCategory("");
                    } else {
                      setCategory(value);
                      setSubcategory("");
                    }
                  }}
                  placeholder={t("selectCategory")}
                />
              ) : (
                <div className="space-y-2 rounded-lg border-2 border-teal-500 bg-slate-900/50 p-3">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder={t("categoryNamePlaceholder")}
                    className="w-full rounded-lg border border-slate-600 bg-slate-900/50 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-transparent focus:ring-2 focus:ring-teal-500"
                  />
                  <input
                    type="text"
                    value={newCategorySubcats}
                    onChange={(e) => setNewCategorySubcats(e.target.value)}
                    placeholder={t("subcategoriesPlaceholder")}
                    className="w-full rounded-lg border border-slate-600 bg-slate-900/50 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-transparent focus:ring-2 focus:ring-teal-500"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={createNewCategory}
                      className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-teal-600 px-3 py-2 text-sm text-white hover:bg-teal-700"
                    >
                      <Plus className="h-4 w-4" />
                      {t("create")}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateCategory(false);
                        setNewCategoryName("");
                        setNewCategorySubcats("");
                      }}
                      className="flex-1 rounded-lg border border-slate-600 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700"
                    >
                      {t("cancel")}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Subcategory */}
            {selectedCategory && selectedCategory.subcategories.length > 0 && (
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-300">
                  {t("subcategoryLabel")}
                </label>
                <CategoryCombobox
                  options={[
                    { value: "", label: t("none") },
                    ...selectedCategory.subcategories.map((sub) => ({
                      value: sub,
                      label: sub,
                    })),
                  ]}
                  value={subcategory}
                  onChange={setSubcategory}
                  placeholder={t("selectSubcategory")}
                />
              </div>
            )}

            {/* Save Button */}
            <button
              onClick={saveTransaction}
              disabled={!merchant || !amount || !date}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-teal-500 px-4 py-3 font-medium text-white transition-colors hover:bg-teal-600 disabled:cursor-not-allowed disabled:bg-slate-600"
            >
              <Save className="h-5 w-5" />
              {t("saveTransaction")}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-900/20 p-3">
              <XCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {savedTransactionId && (
            <div className="mt-4 rounded-lg border border-green-500/30 bg-green-900/20 p-3">
              <div className="mb-2 flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                <p className="text-sm font-medium text-green-300">{t("transactionSaved")}</p>
              </div>
              <Link
                href="/budget-app/transactions"
                className="inline-flex items-center text-sm text-green-400 underline hover:text-green-300"
              >
                {t("viewInTransactions")}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
