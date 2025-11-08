"use client";

/**
 * Receipt Scanner (OCR) Page
 * Upload and scan receipt images to automatically extract transaction data
 * Uses Tesseract.js for client-side OCR processing
 */

import { useState, useRef } from "react";
import {
  Camera,
  Upload,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  Eye,
  Save,
} from "lucide-react";
import { extractReceiptData, type ExtractedReceiptData } from "@/lib/receipt-ocr";
import { getPrivacySettings } from "@/lib/budget-privacy-settings";
import { db } from "@/lib/budget-db";
import Link from "next/link";

export default function ReceiptScannerPage() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedReceiptData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedTransactionId, setSavedTransactionId] = useState<string | null>(null);

  // Form fields for editing extracted data
  const [merchant, setMerchant] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if OCR is enabled in privacy settings
  const privacySettings = getPrivacySettings();
  const isOCREnabled = privacySettings.enableOCR;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file (JPG, PNG)");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("Image file must be less than 10MB");
      return;
    }

    setImageFile(file);
    setError(null);
    setSavedTransactionId(null);
    setExtractedData(null);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];

    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please drop an image file (JPG, PNG)");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("Image file must be less than 10MB");
      return;
    }

    setImageFile(file);
    setError(null);
    setSavedTransactionId(null);
    setExtractedData(null);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const processReceipt = async () => {
    if (!imageFile) return;

    setIsProcessing(true);
    setError(null);
    setExtractedData(null);

    try {
      const data = await extractReceiptData(imageFile);
      setExtractedData(data);

      // Pre-fill form with extracted data
      if (data.merchant) setMerchant(data.merchant);
      if (data.amount !== null) setAmount(Math.abs(data.amount).toFixed(2));
      if (data.date) setDate(data.date.toISOString().split("T")[0]);
      if (data.merchant) setDescription(data.merchant);

      if (data.confidence < 0.5) {
        setError("Low confidence OCR result. Please verify the extracted data carefully.");
      }
    } catch (err) {
      console.error("OCR processing error:", err);
      setError("Failed to process receipt. Please try again or enter the data manually.");
    } finally {
      setIsProcessing(false);
    }
  };

  const saveTransaction = async () => {
    if (!merchant || !amount || !date) {
      setError("Please fill in merchant, amount, and date before saving");
      return;
    }

    try {
      // Get default account (or first account)
      const accounts = await db.accounts.toArray();
      if (accounts.length === 0) {
        setError("Please create an account first in the main app");
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
        subcategory: null,
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
      setError("Failed to save transaction. Please try again.");
    }
  };

  const resetForm = () => {
    setImageFile(null);
    setImagePreview(null);
    setExtractedData(null);
    setMerchant("");
    setAmount("");
    setDate("");
    setDescription("");
    setCategory("");
    setSavedTransactionId(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // If OCR is disabled, show message
  if (!isOCREnabled) {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-3xl font-bold text-gray-900">Scan Receipt</h1>

        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-6 w-6 flex-shrink-0 text-yellow-600" />
            <div>
              <h3 className="mb-2 text-lg font-semibold text-yellow-900">OCR Disabled</h3>
              <p className="mb-4 text-yellow-800">
                Receipt scanning (OCR) is currently disabled in your privacy settings. Enable it to
                automatically extract transaction details from receipt images.
              </p>
              <Link
                href="/budget-app/settings"
                className="inline-flex items-center rounded-lg bg-yellow-600 px-4 py-2 text-white transition-colors hover:bg-yellow-700"
              >
                Go to Settings
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-start gap-3">
            <Eye className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
            <div>
              <h4 className="mb-1 text-sm font-semibold text-blue-900">Privacy Note</h4>
              <p className="text-sm text-blue-800">
                OCR processing happens entirely in your browser using Tesseract.js. No receipt
                images are uploaded to any server. All data stays on your device.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Scan Receipt</h1>
        <p className="mt-2 text-gray-600">
          Upload a receipt image to automatically extract transaction details using OCR
        </p>
      </div>

      {/* Privacy Notice */}
      <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <Eye className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
          <div className="flex-1">
            <h4 className="mb-1 text-sm font-semibold text-blue-900">Privacy First</h4>
            <p className="text-sm text-blue-800">
              All OCR processing happens in your browser. No images are uploaded to servers.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Left Column: Upload & Preview */}
        <div className="space-y-6">
          {/* File Upload */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
              <Camera className="h-5 w-5 text-teal-600" />
              Upload Receipt
            </h2>

            {!imagePreview ? (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-8 text-center transition-colors hover:border-teal-500"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <p className="mb-2 text-gray-600">
                  <span className="font-semibold text-teal-600">Click to upload</span> or drag and
                  drop
                </p>
                <p className="text-sm text-gray-500">JPG, PNG up to 10MB</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            ) : (
              <div>
                <div className="relative mb-4 overflow-hidden rounded-lg border border-gray-200">
                  <img src={imagePreview} alt="Receipt preview" className="h-auto w-full" />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={processReceipt}
                    disabled={isProcessing}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-white transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Camera className="h-5 w-5" />
                        Scan Receipt
                      </>
                    )}
                  </button>
                  <button
                    onClick={resetForm}
                    disabled={isProcessing}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* OCR Results */}
          {extractedData && (
            <div className="rounded-lg bg-white p-6 shadow">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">OCR Results</h3>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-600">Confidence:</span>
                  <span
                    className={`font-semibold ${
                      extractedData.confidence >= 0.7
                        ? "text-green-600"
                        : extractedData.confidence >= 0.5
                          ? "text-yellow-600"
                          : "text-red-600"
                    }`}
                  >
                    {(extractedData.confidence * 100).toFixed(1)}%
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-600">Merchant:</span>
                  <span className="font-medium">{extractedData.merchant || "Not found"}</span>
                </div>

                <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium">
                    {extractedData.amount !== null
                      ? `$${extractedData.amount.toFixed(2)}`
                      : "Not found"}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">
                    {extractedData.date ? extractedData.date.toLocaleDateString() : "Not found"}
                  </span>
                </div>
              </div>

              {extractedData.rawText && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900">
                    View Raw OCR Text
                  </summary>
                  <pre className="mt-2 max-h-48 overflow-auto rounded bg-gray-50 p-3 text-xs text-gray-700">
                    {extractedData.rawText}
                  </pre>
                </details>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Transaction Form */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
            <Save className="h-5 w-5 text-teal-600" />
            Transaction Details
          </h2>

          <div className="space-y-4">
            {/* Merchant */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Merchant *</label>
              <input
                type="text"
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                placeholder="e.g., Walmart, Starbucks"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Amount */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Amount *</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-lg border border-gray-300 py-2 pl-7 pr-3 focus:border-transparent focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Date *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Category */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., Groceries, Dining"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Save Button */}
            <button
              onClick={saveTransaction}
              disabled={!merchant || !amount || !date}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-3 font-medium text-white transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              <Save className="h-5 w-5" />
              Save Transaction
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
              <XCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {savedTransactionId && (
            <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3">
              <div className="mb-2 flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                <p className="text-sm font-medium text-green-800">
                  Transaction saved successfully!
                </p>
              </div>
              <Link
                href="/budget-app/transactions"
                className="inline-flex items-center text-sm text-green-700 underline hover:text-green-900"
              >
                View in Transactions
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
