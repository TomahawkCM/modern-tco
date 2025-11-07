'use client';

/**
 * Receipt Upload Component
 * Phase 7.1.1: Drag-drop receipt upload interface
 * Phase 7.1.2: Mobile camera capture support
 * Supports JPG, PNG, PDF (max 5MB)
 */

import { useCallback, useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileImage, X, AlertCircle, CheckCircle, Camera, Sparkles } from 'lucide-react';
import { extractReceiptData, type ExtractedReceiptData } from '@/lib/receipt-ocr';

interface ReceiptUploadProps {
  onFileAccepted: (file: File) => void;
  onClose?: () => void;
  maxSize?: number; // in bytes
  onDataExtracted?: (data: ExtractedReceiptData) => void; // OCR callback
}

export function ReceiptUpload({
  onFileAccepted,
  onClose,
  maxSize = 5 * 1024 * 1024, // 5MB default
  onDataExtracted,
}: ReceiptUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // OCR state (Phase 7.3.1)
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedReceiptData | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      setError(null);

      // Handle rejected files
      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        if (rejection.errors[0]?.code === 'file-too-large') {
          setError(`File is too large. Maximum size is ${maxSize / 1024 / 1024}MB`);
        } else if (rejection.errors[0]?.code === 'file-invalid-type') {
          setError('Invalid file type. Only JPG, PNG, and PDF files are allowed');
        } else {
          setError('File was rejected. Please try again');
        }
        return;
      }

      // Handle accepted file
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setUploadedFile(file);

        // Create preview for images
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e) => {
            setPreview(e.target?.result as string);
          };
          reader.readAsDataURL(file);
        } else {
          setPreview(null); // PDF files won't have preview
        }
      }
    },
    [maxSize]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'application/pdf': ['.pdf'],
    },
    maxSize,
    multiple: false,
  });

  const handleConfirm = () => {
    if (uploadedFile) {
      onFileAccepted(uploadedFile);
      // Reset state
      setUploadedFile(null);
      setPreview(null);
      setError(null);
    }
  };

  const handleRemove = () => {
    setUploadedFile(null);
    setPreview(null);
    setError(null);
  };

  // Phase 7.1.2: Handle mobile camera capture
  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size
      if (file.size > maxSize) {
        setError(`File is too large. Maximum size is ${maxSize / 1024 / 1024}MB`);
        return;
      }

      setUploadedFile(file);
      setError(null);

      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerCameraCapture = () => {
    cameraInputRef.current?.click();
  };

  // Phase 7.3.1: OCR extraction handler
  const handleExtractData = async () => {
    if (!uploadedFile || !onDataExtracted) return;

    // Only process images (PDFs not supported for OCR)
    if (!uploadedFile.type.startsWith('image/')) {
      setError('OCR is only supported for image files (JPG, PNG)');
      return;
    }

    setIsExtracting(true);
    setError(null);

    try {
      const data = await extractReceiptData(uploadedFile);
      setExtractedData(data);

      if (data.confidence > 0) {
        onDataExtracted(data);
      } else {
        setError('Could not extract data from receipt. Please enter manually.');
      }
    } catch (err) {
      console.error('OCR extraction error:', err);
      setError('Failed to extract data. Please try again or enter manually.');
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Hidden camera input for mobile - Phase 7.1.2 */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleCameraCapture}
        className="hidden"
        aria-label="Camera capture input"
      />

      {/* Upload Area */}
      {!uploadedFile && (
        <div>
          <div
            {...getRootProps()}
            className={`
              relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
              transition-all duration-200 group
              ${isDragActive
                ? 'border-teal-500 bg-teal-50'
                : error
                ? 'border-red-500 bg-red-50 hover:bg-red-100'
                : 'border-gray-300 hover:border-teal-400 hover:bg-gray-50'
              }
            `}
          >
            <input {...getInputProps()} />

          {/* Icon */}
          <div className="flex justify-center mb-4">
            {error ? (
              <AlertCircle className="w-12 h-12 text-red-500" />
            ) : (
              <Upload className={`w-12 h-12 ${isDragActive ? 'text-teal-500' : 'text-gray-400'} group-hover:text-teal-500 transition-colors`} />
            )}
          </div>

          {/* Text */}
          <div className="space-y-2">
            <p className="text-base font-medium text-gray-900">
              {isDragActive ? 'Drop the receipt here' : 'Drag & drop receipt here'}
            </p>
            <p className="text-sm text-gray-500">
              or <span className="text-teal-600 font-medium">browse files</span>
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Supports JPG, PNG, PDF • Max {maxSize / 1024 / 1024}MB
            </p>
          </div>
        </div>

          {/* Mobile Camera Button - Phase 7.1.2 */}
          <div className="mt-4 sm:hidden">
            <button
              type="button"
              onClick={triggerCameraCapture}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-medium min-h-[44px]"
            >
              <Camera className="w-5 h-5" />
              <span>Take Photo with Camera</span>
            </button>
            <p className="text-xs text-gray-500 text-center mt-2">
              Use your device camera to capture receipt
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Preview Area */}
      {uploadedFile && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">{uploadedFile.name}</p>
                <p className="text-xs text-gray-500">
                  {(uploadedFile.size / 1024).toFixed(1)}KB • {uploadedFile.type.split('/')[1].toUpperCase()}
                </p>
              </div>
            </div>
            <button
              onClick={handleRemove}
              className="p-2 rounded hover:bg-gray-100 transition-colors"
              aria-label="Remove file"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Image Preview */}
          {preview && (
            <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={preview}
                alt="Receipt preview"
                className="w-full h-full object-contain"
              />
            </div>
          )}

          {/* PDF Preview Placeholder */}
          {uploadedFile.type === 'application/pdf' && (
            <div className="flex flex-col items-center justify-center w-full h-64 bg-gray-50 rounded-lg">
              <FileImage className="w-16 h-16 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">PDF Receipt</p>
              <p className="text-xs text-gray-400 mt-2">Preview not available</p>
            </div>
          )}

          {/* Phase 7.3.1: Extracted Data Display */}
          {extractedData && extractedData.confidence > 0 && (
            <div className="mt-4 p-4 bg-teal-50 border border-teal-200 rounded-lg">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-teal-900 mb-2">Data Extracted</p>
                  <div className="space-y-2 text-xs text-teal-800">
                    {extractedData.merchant && (
                      <p><strong>Merchant:</strong> {extractedData.merchant}</p>
                    )}
                    {extractedData.amount && (
                      <p><strong>Amount:</strong> ${extractedData.amount.toFixed(2)}</p>
                    )}
                    {extractedData.date && (
                      <p><strong>Date:</strong> {extractedData.date.toLocaleDateString()}</p>
                    )}
                    <p className="text-teal-600 mt-2">
                      Confidence: {Math.round(extractedData.confidence * 100)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 mt-4">
            <button
              onClick={handleRemove}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium min-h-[44px]"
            >
              Choose Different
            </button>

            {/* Phase 7.3.1: Extract Data Button (Optional) */}
            {onDataExtracted && uploadedFile?.type.startsWith('image/') && !extractedData && (
              <button
                onClick={handleExtractData}
                disabled={isExtracting}
                className="flex-1 px-4 py-2.5 border border-teal-500 text-teal-700 rounded-lg hover:bg-teal-50 transition-colors font-medium min-h-[44px] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExtracting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-teal-700 border-t-transparent rounded-full animate-spin" />
                    <span>Extracting...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Extract Data</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={handleConfirm}
              className="flex-1 px-4 py-2.5 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-medium min-h-[44px]"
            >
              Attach Receipt
            </button>
          </div>
        </div>
      )}
    </div>
  );
}