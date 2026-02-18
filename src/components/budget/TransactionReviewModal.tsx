"use client";

/**
 * Transaction Review Modal
 * Shows list of matching transactions with checkboxes for selective categorization
 */

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tag, CheckSquare, Square } from "lucide-react";
import { format } from "date-fns";
import type { Transaction } from "@/types/budget";

interface TransactionReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactions: Transaction[];
  category: string;
  subcategory: string | null;
  onApplySelected: (selectedIds: string[]) => void;
}

export function TransactionReviewModal({
  open,
  onOpenChange,
  transactions,
  category,
  subcategory,
  onApplySelected,
}: TransactionReviewModalProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(transactions.map((tx) => tx.id))
  );

  const toggleTransaction = (id: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === transactions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(transactions.map((tx) => tx.id)));
    }
  };

  const handleApply = () => {
    onApplySelected(Array.from(selectedIds));
  };

  const allSelected = selectedIds.size === transactions.length;
  const noneSelected = selectedIds.size === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[80vh] flex-col sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-teal-600" />
            Review Transactions
          </DialogTitle>
          <DialogDescription>
            Select which transactions to categorize as{" "}
            <span className="font-semibold text-teal-700">
              {category}
              {subcategory && ` - ${subcategory}`}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {/* Select All */}
          <div className="sticky top-0 flex items-center gap-3 border-b border-gray-200 bg-white p-3">
            <Checkbox
              id="select-all"
              checked={allSelected}
              onCheckedChange={toggleAll}
              className="mt-0.5"
            />
            <label htmlFor="select-all" className="cursor-pointer select-none text-sm font-medium">
              {allSelected ? (
                <>
                  <CheckSquare className="me-1.5 inline h-4 w-4" />
                  Deselect All
                </>
              ) : (
                <>
                  <Square className="me-1.5 inline h-4 w-4" />
                  Select All ({transactions.length})
                </>
              )}
            </label>
          </div>

          {/* Transaction List */}
          <div className="divide-y divide-gray-200">
            {transactions.map((tx) => {
              const isSelected = selectedIds.has(tx.id);
              return (
                <div
                  key={tx.id}
                  className={`flex items-start gap-3 p-3 transition-colors hover:bg-gray-50 ${
                    isSelected ? "bg-teal-50/30" : ""
                  }`}
                >
                  <Checkbox
                    id={`tx-${tx.id}`}
                    checked={isSelected}
                    onCheckedChange={() => toggleTransaction(tx.id)}
                    className="mt-1"
                  />
                  <label htmlFor={`tx-${tx.id}`} className="flex-1 cursor-pointer select-none">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-gray-900">
                          {tx.description}
                        </div>
                        <div className="mt-0.5 text-xs text-gray-500">
                          {format(new Date(tx.date), "MMM d, yyyy")}
                        </div>
                      </div>
                      <div
                        className={`whitespace-nowrap text-sm font-semibold ${
                          tx.amount < 0 ? "text-red-600" : "text-green-600"
                        }`}
                      >
                        {tx.amount < 0 ? "-" : "+"}${Math.abs(tx.amount).toFixed(2)}
                      </div>
                    </div>
                  </label>
                </div>
              );
            })}
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
          <div className="text-xs text-gray-500">
            {selectedIds.size} of {transactions.length} selected
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleApply}
              disabled={noneSelected}
              className="bg-teal-600 hover:bg-teal-700"
            >
              <Tag className="me-2 h-4 w-4" />
              Apply to {selectedIds.size} Transaction{selectedIds.size !== 1 ? "s" : ""}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
