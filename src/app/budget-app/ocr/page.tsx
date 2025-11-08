'use client';

/**
 * Receipt Scanner (OCR) Page
 * Upload and scan receipt images to automatically extract transaction data
 * Uses Tesseract.js for client-side OCR processing
 */

import { useState, useRef } from 'react';
import { Camera, Upload, AlertCircle, CheckCircle2, XCircle, Loader2, Eye, Save } from 'lucide-react';
import { extractReceiptData, type ExtractedReceiptData } from '@/lib/receipt-ocr';
import { getPrivacySettings } from '@/lib/budget-privacy-settings';
import { db } from '@/lib/budget-db';
import Link from 'next/link';

export default function ReceiptScannerPage() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedReceiptData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedTransactionId, setSavedTransactionId] = useState<string | null>(null);

  // Form fields for editing extracted data
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if OCR is enabled in privacy settings
  const privacySettings = getPrivacySettings();
  const isOCREnabled = privacySettings.enableOCR;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPG, PNG)');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image file must be less than 10MB');
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

    if (file && file.type.startsWith('image/')) {
      // Create a synthetic event for handleFileSelect
      const syntheticEvent = {
        target: {
          files: [file]
        }
      } as React.ChangeEvent<HTMLInputElement>;
      handleFileSelect(syntheticEvent);
    } else {
      setError('Please drop an image file (JPG, PNG)');
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

    try {
      const data = await extractReceiptData(imageFile);
      setExtractedData(data);

      // Pre-fill form with extracted data
      if (data.merchant) setMerchant(data.merchant);
      if (data.amount !== null) setAmount(Math.abs(data.amount).toFixed(2));
      if (data.date) setDate(data.date.toISOString().split('T')[0]);
      if (data.merchant) setDescription(data.merchant);

      if (data.confidence < 0.5) {
        setError('Low confidence OCR result. Please verify the extracted data carefully.');
      }
    } catch (err) {
      console.error('OCR processing error:', err);
      setError('Failed to process receipt. Please try again or enter the data manually.');
    } finally {
      setIsProcessing(false);
    }
  };

  const saveTransaction = async () => {
    if (!merchant || !amount || !date) {
      setError('Please fill in merchant, amount, and date before saving');
      return;
    }

    try {
      // Get default account (or first account)
      const accounts = await db.accounts.toArray();
      if (accounts.length === 0) {
        setError('Please create an account first in the main app');
        return;
      }

      const accountId = accounts[0].id;

      // Create transaction
      const transaction = {
        id: `txn_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        accountId,
        date: new Date(date),
        description: description || merchant,
        originalDescription: extractedData?.rawText || '',
        amount: -Math.abs(parseFloat(amount)), // Negative for expense
        category: category || null,
        subcategory: null,
        notes: extractedData ? `OCR Confidence: ${(extractedData.confidence * 100).toFixed(1)}%` : '',
        isRecurring: false,
        tags: ['receipt-scan'],
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
      console.error('Error saving transaction:', err);
      setError('Failed to save transaction. Please try again.');
    }
  };

  const resetForm = () => {
    setImageFile(null);
    setImagePreview(null);
    setExtractedData(null);
    setMerchant('');
    setAmount('');
    setDate('');
    setDescription('');
    setCategory('');
    setSavedTransactionId(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // If OCR is disabled, show message
  if (!isOCREnabled) {
    return (
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Scan Receipt</h1>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-900 mb-2">OCR Disabled</h3>
              <p className="text-yellow-800 mb-4">
                Receipt scanning (OCR) is currently disabled in your privacy settings.
                Enable it to automatically extract transaction details from receipt images.
              </p>
              <Link
                href="/budget-app/settings"
                className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                Go to Settings
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Eye className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-blue-900 mb-1">Privacy Note</h4>
              <p className="text-sm text-blue-800">
                OCR processing happens entirely in your browser using Tesseract.js.
                No receipt images are uploaded to any server. All data stays on your device.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Scan Receipt</h1>
        <p className="text-gray-600 mt-2">
          Upload a receipt image to automatically extract transaction details using OCR
        </p>
      </div>

      {/* Privacy Notice */}
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Eye className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-blue-900 mb-1">Privacy First</h4>
            <p className="text-sm text-blue-800">
              All OCR processing happens in your browser. No images are uploaded to servers.
            </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left Column: Upload & Preview */}
        <div className="space-y-6">
          {/* File Upload */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Camera className="w-5 h-5 text-teal-600" />
              Upload Receipt
            </h2>

            {!imagePreview ? (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-teal-500 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">
                  <span className="font-semibold text-teal-600">Click to upload</span> or drag and drop
                </p>
                <p className="text-sm text-gray-500">
                  JPG, PNG up to 10MB
                </p>
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
                <div className="relative rounded-lg overflow-hidden border border-gray-200 mb-4">
                  <img
                    src={imagePreview}
                    alt="Receipt preview"
                    className="w-full h-auto"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={processReceipt}
                    disabled={isProcessing}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Camera className="w-5 h-5" />
                        Scan Receipt
                      </>
                    )}
                  </button>
                  <button
                    onClick={resetForm}
                    disabled={isProcessing}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* OCR Results */}
          {extractedData && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">OCR Results</h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                  <span className="text-gray-600">Confidence:</span>
                  <span className={`font-semibold ${
                    extractedData.confidence >= 0.7 ? 'text-green-600' :
                    extractedData.confidence >= 0.5 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {(extractedData.confidence * 100).toFixed(1)}%
                  </span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                  <span className="text-gray-600">Merchant:</span>
                  <span className="font-medium">{extractedData.merchant || 'Not found'}</span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium">
                    {extractedData.amount !== null ? `$${extractedData.amount.toFixed(2)}` : 'Not found'}
                  </span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">
                    {extractedData.date ? extractedData.date.toLocaleDateString() : 'Not found'}
                  </span>
                </div>
              </div>

              {extractedData.rawText && (
                <details className="mt-4">
                  <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-900">
                    View Raw OCR Text
                  </summary>
                  <pre className="mt-2 p-3 bg-gray-50 rounded text-xs text-gray-700 overflow-auto max-h-48">
                    {extractedData.rawText}
                  </pre>
                </details>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Transaction Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Save className="w-5 h-5 text-teal-600" />
            Transaction Details
          </h2>

          <div className="space-y-4">
            {/* Merchant */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Merchant *
              </label>
              <input
                type="text"
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                placeholder="e.g., Walmart, Starbucks"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., Groceries, Dining"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            {/* Save Button */}
            <button
              onClick={saveTransaction}
              disabled={!merchant || !amount || !date}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
            >
              <Save className="w-5 h-5" />
              Save Transaction
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {savedTransactionId && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-800 font-medium">
                  Transaction saved successfully!
                </p>
              </div>
              <Link
                href="/budget-app/transactions"
                className="inline-flex items-center text-sm text-green-700 hover:text-green-900 underline"
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
