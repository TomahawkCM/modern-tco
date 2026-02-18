"use client";

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
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tag, List, X, Zap } from "lucide-react";
import { extractVendorName } from "@/lib/vendor-matcher";
import type { Transaction } from "@/types/budget";

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
            <Tag className="h-5 w-5 text-teal-600" />
            Found Matching Transactions
          </DialogTitle>
          <DialogDescription className="pt-2">
            Found <span className="font-semibold text-teal-700">{matchCount}</span> other{" "}
            <span className="break-words font-semibold">{vendorName}</span> transaction
            {matchCount !== 1 ? "s" : ""}.
          </DialogDescription>
          <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
            <div className="text-sm font-medium text-gray-900">Category to apply:</div>
            <div className="mt-1 text-sm font-semibold text-teal-700">
              {category}
              {subcategory && ` - ${subcategory}`}
            </div>
          </div>
        </DialogHeader>

        <DialogFooter className="mt-4 flex-col gap-3 sm:gap-2">
          <div className="flex w-full flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={onReview} className="w-full sm:flex-1">
              <List className="me-2 h-4 w-4" />
              Review First
            </Button>
            <Button onClick={onApplyAll} className="w-full bg-teal-600 hover:bg-teal-700 sm:flex-1">
              <Zap className="me-2 h-4 w-4" />
              Apply to All {matchCount}
            </Button>
          </div>
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="w-full">
            <X className="me-2 h-4 w-4" />
            Skip
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
