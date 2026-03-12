"use client";

/**
 * Receipt Upload Component
 * Phase 7.1.1: Drag-drop receipt upload interface
 * Phase 7.1.2: Mobile camera capture support
 * Supports JPG, PNG, PDF (max 5MB)
 */

import { useCallback, useState, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useDropzone } from "react-dropzone";
import { Upload, FileImage, X, AlertCircle, CheckCircle, Camera, Sparkles } from "lucide-react";
import { extractReceiptData, type ExtractedReceiptData } from "@/lib/receipt-ocr";

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
  const t = useTranslations("receiptUpload");
  const locale = useLocale();
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
        if (rejection.errors[0]?.code === "file-too-large") {
          setError(t("errors.tooLarge", { size: maxSize / 1024 / 1024 }));
        } else if (rejection.errors[0]?.code === "file-invalid-type") {
          setError(t("errors.invalidType"));
        } else {
          setError(t("errors.rejected"));
        }
        return;
      }

      // Handle accepted file
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setUploadedFile(file);

        // Create preview for images
        if (file.type.startsWith("image/")) {
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
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "application/pdf": [".pdf"],
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
        setError(t("errors.tooLarge", { size: maxSize / 1024 / 1024 }));
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
    if (!uploadedFile.type.startsWith("image/")) {
      setError(t("errors.ocrImagesOnly"));
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
        setError(t("errors.couldNotExtract"));
      }
    } catch (err) {
      console.error("OCR extraction error:", err);
      setError(t("errors.extractionFailed"));
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
        aria-label={t("cameraInputLabel")}
      />

      {/* Upload Area */}
      {!uploadedFile && (
        <div>
          <div
            {...getRootProps()}
            className={`group relative cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-all duration-200 ${
              isDragActive
                ? "border-teal-500 bg-teal-50"
                : error
                  ? "border-red-500 bg-red-50 hover:bg-red-100"
                  : "border-gray-300 hover:border-teal-400 hover:bg-gray-50"
            } `}
          >
            <input {...getInputProps()} />

            {/* Icon */}
            <div className="mb-4 flex justify-center">
              {error ? (
                <AlertCircle className="h-12 w-12 text-red-500" />
              ) : (
                <Upload
                  className={`h-12 w-12 ${isDragActive ? "text-teal-500" : "text-gray-400"} transition-colors group-hover:text-teal-500`}
                />
              )}
            </div>

            {/* Text */}
            <div className="space-y-2">
              <p className="text-base font-medium text-gray-900">
                {isDragActive ? t("dropzone.dropHere") : t("dropzone.dragDrop")}
              </p>
              <p className="text-sm text-gray-500">
                {t.rich("dropzone.browseFiles", {
                  link: (chunks) => <span className="font-medium text-teal-600">{chunks}</span>,
                })}
              </p>
              <p className="mt-2 text-xs text-gray-400">
                {t("dropzone.supportedFormats", { size: maxSize / 1024 / 1024 })}
              </p>
            </div>
          </div>

          {/* Mobile Camera Button - Phase 7.1.2 */}
          <div className="mt-4 sm:hidden">
            <button
              type="button"
              onClick={triggerCameraCapture}
              className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-teal-500 px-4 py-2 font-medium text-white transition-colors hover:bg-teal-600"
            >
              <Camera className="h-5 w-5" />
              <span>{t("camera.takePhoto")}</span>
            </button>
            <p className="mt-2 text-center text-xs text-gray-500">{t("camera.useDevice")}</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Preview Area */}
      {uploadedFile && (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex items-center gap-4">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">{uploadedFile.name}</p>
                <p className="text-xs text-gray-500">
                  {(uploadedFile.size / 1024).toFixed(1)}KB •{" "}
                  {uploadedFile.type.split("/")[1].toUpperCase()}
                </p>
              </div>
            </div>
            <button
              onClick={handleRemove}
              className="rounded p-2 transition-colors hover:bg-gray-100"
              aria-label={t("removeFile")}
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          </div>

          {/* Image Preview */}
          {preview && (
            <div className="relative h-64 w-full overflow-hidden rounded-lg bg-gray-100">
              <img
                src={preview}
                alt={t("receiptPreview")}
                className="h-full w-full object-contain"
              />
            </div>
          )}

          {/* PDF Preview Placeholder */}
          {uploadedFile.type === "application/pdf" && (
            <div className="flex h-64 w-full flex-col items-center justify-center rounded-lg bg-gray-50">
              <FileImage className="mb-2 h-16 w-16 text-gray-400" />
              <p className="text-sm text-gray-600">{t("pdf.title")}</p>
              <p className="mt-2 text-xs text-gray-400">{t("pdf.noPreview")}</p>
            </div>
          )}

          {/* Phase 7.3.1: Extracted Data Display */}
          {extractedData && extractedData.confidence > 0 && (
            <div className="mt-4 rounded-lg border border-teal-200 bg-teal-50 p-4">
              <div className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-teal-600" />
                <div className="flex-1">
                  <p className="mb-2 text-sm font-medium text-teal-900">{t("extracted.title")}</p>
                  <div className="space-y-2 text-xs text-teal-800">
                    {extractedData.merchant && (
                      <p>
                        <strong>{t("extracted.merchant")}</strong> {extractedData.merchant}
                      </p>
                    )}
                    {extractedData.amount && (
                      <p>
                        <strong>{t("extracted.amount")}</strong> ${extractedData.amount.toFixed(2)}
                      </p>
                    )}
                    {extractedData.date && (
                      <p>
                        <strong>{t("extracted.date")}</strong>{" "}
                        {extractedData.date.toLocaleDateString(locale)}
                      </p>
                    )}
                    <p className="mt-2 text-teal-600">
                      {t("extracted.confidence", {
                        percent: Math.round(extractedData.confidence * 100),
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-4 flex gap-4">
            <button
              onClick={handleRemove}
              className="min-h-[44px] flex-1 rounded-lg border border-gray-300 px-4 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              {t("buttons.chooseDifferent")}
            </button>

            {/* Phase 7.3.1: Extract Data Button (Optional) */}
            {onDataExtracted && uploadedFile?.type.startsWith("image/") && !extractedData && (
              <button
                onClick={handleExtractData}
                disabled={isExtracting}
                className="flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-lg border border-teal-500 px-4 py-2.5 font-medium text-teal-700 transition-colors hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isExtracting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-teal-700 border-t-transparent" />
                    <span>{t("buttons.extracting")}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>{t("buttons.extractData")}</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={handleConfirm}
              className="min-h-[44px] flex-1 rounded-lg bg-teal-500 px-4 py-2.5 font-medium text-white transition-colors hover:bg-teal-600"
            >
              {t("buttons.attachReceipt")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
