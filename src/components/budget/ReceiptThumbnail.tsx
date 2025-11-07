'use client';

/**
 * Receipt Thumbnail Component (Phase 7)
 * Task 7.2.2: Display receipt thumbnails
 * 
 * Shows receipt thumbnail with click-to-view full size modal
 */

import { useState, useEffect } from 'react';
import { FileImage, X, Trash2, ZoomIn } from 'lucide-react';
import { getTransactionReceipts, getThumbnailBlobUrl, getReceiptBlobUrl, deleteReceipt } from '@/lib/budget-db';
import type { Receipt } from '@/types/budget';

interface ReceiptThumbnailProps {
  transactionId: string;
  onReceiptDeleted?: () => void;
}

export function ReceiptThumbnail({ transactionId, onReceiptDeleted }: ReceiptThumbnailProps) {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [thumbnailUrls, setThumbnailUrls] = useState<Record<string, string>>({});
  const [fullImageUrls, setFullImageUrls] = useState<Record<string, string>>({});
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadReceipts();
    
    // Cleanup blob URLs on unmount
    return () => {
      Object.values(thumbnailUrls).forEach(url => URL.revokeObjectURL(url));
      Object.values(fullImageUrls).forEach(url => URL.revokeObjectURL(url));
    };
  }, [transactionId]);

  async function loadReceipts() {
    try {
      const receiptsData = await getTransactionReceipts(transactionId);
      setReceipts(receiptsData);

      // Generate blob URLs for thumbnails and full images
      const thumbUrls: Record<string, string> = {};
      const fullUrls: Record<string, string> = {};

      receiptsData.forEach(receipt => {
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
      console.error('Error loading receipts:', error);
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
      console.error('Error deleting receipt:', error);
      alert('Failed to delete receipt');
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
      <div className="flex gap-2 items-center">
        {receipts.map(receipt => {
          const thumbnailUrl = thumbnailUrls[receipt.id];
          const isPdf = receipt.mimeType === 'application/pdf';

          return (
            <div key={receipt.id} className="relative group">
              <button
                onClick={() => openFullSize(receipt)}
                className="relative w-12 h-12 rounded border border-gray-300 overflow-hidden hover:border-teal-500 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
                title={`View ${receipt.filename}`}
              >
                {thumbnailUrl && !isPdf ? (
                  <img
                    src={thumbnailUrl}
                    alt={receipt.filename}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <FileImage className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <ZoomIn className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            </div>
          );
        })}
        <div className="text-xs text-gray-500">
          {receipts.length} {receipts.length === 1 ? 'receipt' : 'receipts'}
        </div>
      </div>

      {/* Full Size Modal */}
      {selectedReceipt && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={closeFullSize}
        >
          <div 
            className="relative bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{selectedReceipt.filename}</h3>
                <p className="text-sm text-gray-600 mt-2">
                  Uploaded {new Date(selectedReceipt.uploadedAt).toLocaleDateString()} • {
                    (selectedReceipt.fileSize / 1024).toFixed(1)
                  } KB
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDeleteReceipt(selectedReceipt)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete receipt"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <button
                  onClick={closeFullSize}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Close"
                  aria-label="Close receipt viewer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Receipt Image/Content */}
            <div className="overflow-auto max-h-[calc(90vh-80px)] p-6 bg-gray-50">
              {selectedReceipt.mimeType.startsWith('image/') ? (
                <img
                  src={fullImageUrls[selectedReceipt.id]}
                  alt={selectedReceipt.filename}
                  className="max-w-full h-auto mx-auto rounded-lg shadow-lg"
                />
              ) : selectedReceipt.mimeType === 'application/pdf' ? (
                <div className="text-center py-12">
                  <FileImage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">PDF Receipt</p>
                  <a
                    href={fullImageUrls[selectedReceipt.id]}
                    download={selectedReceipt.filename}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                  >
                    Download PDF
                  </a>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileImage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
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

