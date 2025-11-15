'use client';

/**
 * Bulk Categorize Confirmation Dialog
 * Prompts user to apply category to matching vendor transactions
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tag, List, X, Zap } from 'lucide-react';
import { extractVendorName } from '@/lib/vendor-matcher';
import type { Transaction } from '@/types/budget';

interface BulkCategorizeConfirmationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceTransaction: Transaction;
  matchingTransactions: Transaction[];
  category: string;
  subcategory: string | null;
  onApplyAll: () => void;
  onReview: () => void;
}

export function BulkCategorizeConfirmation({
  open,
  onOpenChange,
  sourceTransaction,
  matchingTransactions,
  category,
  subcategory,
  onApplyAll,
  onReview,
}: BulkCategorizeConfirmationProps) {
  const vendorName = extractVendorName(sourceTransaction.description);
  const matchCount = matchingTransactions.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-teal-600" />
            Found Matching Transactions
          </DialogTitle>
          <DialogDescription className="pt-2">
            Found <span className="font-semibold text-teal-700">{matchCount}</span> other{' '}
            <span className="font-semibold break-words">{vendorName}</span> transaction{matchCount !== 1 ? 's' : ''}.
          </DialogDescription>
          <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-sm font-medium text-gray-900">
              Category to apply:
            </div>
            <div className="text-sm text-teal-700 font-semibold mt-1">
              {category}
              {subcategory && ` - ${subcategory}`}
            </div>
          </div>
        </DialogHeader>

        <DialogFooter className="flex-col gap-3 sm:gap-2 mt-4">
          <div className="flex flex-col sm:flex-row gap-2 w-full">
            <Button
              variant="outline"
              onClick={onReview}
              className="w-full sm:flex-1"
            >
              <List className="w-4 h-4 mr-2" />
              Review First
            </Button>
            <Button
              onClick={onApplyAll}
              className="w-full sm:flex-1 bg-teal-600 hover:bg-teal-700"
            >
              <Zap className="w-4 h-4 mr-2" />
              Apply to All {matchCount}
            </Button>
          </div>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="w-full"
          >
            <X className="w-4 h-4 mr-2" />
            Skip
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
