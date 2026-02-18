"use client";

/**
 * Receipt Thumbnail Component (Phase 7)
 * Task 7.2.2: Display receipt thumbnails
 *
 * Shows receipt thumbnail with click-to-view full size modal
 */

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { FileImage, X, Trash2, ZoomIn } from "lucide-react";
import {
  getTransactionReceipts,
  getThumbnailBlobUrl,
  getReceiptBlobUrl,
  deleteReceipt,
} from "@/lib/budget-db";
import type { Receipt } from "@/types/budget";

interface ReceiptThumbnailProps {
  transactionId: string;
  onReceiptDeleted?: () => void;
}

export function ReceiptThumbnail({ transactionId, onReceiptDeleted }: ReceiptThumbnailProps) {
  const tAria = useTranslations("aria");
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [thumbnailUrls, setThumbnailUrls] = useState<Record<string, string>>({});
  const [fullImageUrls, setFullImageUrls] = useState<Record<string, string>>({});
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadReceipts();

    // Cleanup blob URLs on unmount
    return () => {
      Object.values(thumbnailUrls).forEach((url) => URL.revokeObjectURL(url));
      Object.values(fullImageUrls).forEach((url) => URL.revokeObjectURL(url));
    };
  }, [transactionId]);

  async function loadReceipts() {
    try {
      const receiptsData = await getTransactionReceipts(transactionId);
      setReceipts(receiptsData);

      // Generate blob URLs for thumbnails and full images
      const thumbUrls: Record<string, string> = {};
      const fullUrls: Record<string, string> = {};

      receiptsData.forEach((receipt) => {
        const thumbUrl = getThumbnailBlobUrl(receipt);
        const fullUrl = getReceiptBlobUrl(receipt);

        if (thumbUrl) {
          thumbUrls[receipt.id] = thumbUrl;
        }
        if (fullUrl) {
          fullUrls[receipt.id] = fullUrl;
        }
      });

      setThumbnailUrls(thumbUrls);
      setFullImageUrls(fullUrls);
    } catch (error) {
      console.error("Error loading receipts:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeleteReceipt(receipt: Receipt) {
    if (!confirm(`Delete receipt "${receipt.filename}"?`)) return;

    try {
      await deleteReceipt(receipt.id, transactionId);

      // Revoke blob URLs
      if (thumbnailUrls[receipt.id]) {
        URL.revokeObjectURL(thumbnailUrls[receipt.id]);
      }
      if (fullImageUrls[receipt.id]) {
        URL.revokeObjectURL(fullImageUrls[receipt.id]);
      }

      await loadReceipts();
      onReceiptDeleted?.();
    } catch (error) {
      console.error("Error deleting receipt:", error);
      alert("Failed to delete receipt");
    }
  }

  function openFullSize(receipt: Receipt) {
    setSelectedReceipt(receipt);
  }

  function closeFullSize() {
    setSelectedReceipt(null);
  }

  if (isLoading) {
    return null;
  }

  if (receipts.length === 0) {
    return null;
  }

  return (
    <>
      {/* Thumbnail Display */}
      <div className="flex items-center gap-2">
        {receipts.map((receipt) => {
          const thumbnailUrl = thumbnailUrls[receipt.id];
          const isPdf = receipt.mimeType === "application/pdf";

          return (
            <div key={receipt.id} className="group relative">
              <button
                onClick={() => openFullSize(receipt)}
                className="relative h-12 w-12 overflow-hidden rounded border border-gray-300 transition-colors hover:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                title={`View ${receipt.filename}`}
              >
                {thumbnailUrl && !isPdf ? (
                  <img
                    src={thumbnailUrl}
                    alt={receipt.filename}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gray-100">
                    <FileImage className="h-6 w-6 text-gray-400" />
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
                  <ZoomIn className="h-4 w-4 text-white opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              </button>
            </div>
          );
        })}
        <div className="text-xs text-gray-500">
          {receipts.length} {receipts.length === 1 ? "receipt" : "receipts"}
        </div>
      </div>

      {/* Full Size Modal */}
      {selectedReceipt && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={closeFullSize}
        >
          <div
            className="relative max-h-[90vh] max-w-4xl overflow-hidden rounded-lg bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white p-4">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{selectedReceipt.filename}</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Uploaded {new Date(selectedReceipt.uploadedAt).toLocaleDateString()} •{" "}
                  {(selectedReceipt.fileSize / 1024).toFixed(1)} KB
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDeleteReceipt(selectedReceipt)}
                  className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50"
                  title="Delete receipt"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
                <button
                  onClick={closeFullSize}
                  className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100"
                  title="Close"
                  aria-label={tAria("closeReceiptViewer")}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Receipt Image/Content */}
            <div className="max-h-[calc(90vh-80px)] overflow-auto bg-gray-50 p-6">
              {selectedReceipt.mimeType.startsWith("image/") ? (
                <img
                  src={fullImageUrls[selectedReceipt.id]}
                  alt={selectedReceipt.filename}
                  className="mx-auto h-auto max-w-full rounded-lg shadow-lg"
                />
              ) : selectedReceipt.mimeType === "application/pdf" ? (
                <div className="py-12 text-center">
                  <FileImage className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                  <p className="mb-4 text-gray-600">PDF Receipt</p>
                  <a
                    href={fullImageUrls[selectedReceipt.id]}
                    download={selectedReceipt.filename}
                    className="inline-flex items-center gap-2 rounded-lg bg-teal-500 px-4 py-2 text-white transition-colors hover:bg-teal-600"
                  >
                    Download PDF
                  </a>
                </div>
              ) : (
                <div className="py-12 text-center">
                  <FileImage className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                  <p className="text-gray-600">Unsupported file type</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
