"use client";

/**
 * Virtual Transaction Table Component
 * High-performance table with virtual scrolling for 1000+ transactions
 * Uses @tanstack/react-virtual for windowed rendering
 */

import { useTranslations } from "next-intl";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef, useMemo } from "react";
import { Edit, Trash2, Tag, Split, ArrowUp, ArrowDown } from "lucide-react";
import type { Transaction, Category } from "@/types/budget";
import { ReceiptThumbnail } from "./ReceiptThumbnail";

interface VirtualTransactionTableProps {
  transactions: Transaction[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
  onSplit: (transaction: Transaction) => void;
  onUnsplit: (transaction: Transaction) => void;
  onQuickCategorize: (transaction: Transaction) => void;
  quickCategorizingId: string | null;
  categories: Category[];
  onCategorySelect: (
    transaction: Transaction,
    category: string,
    subcategory: string | null
  ) => void;
  onReceiptDeleted: () => void;
}

export function VirtualTransactionTable({
  transactions,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onClearSelection,
  onEdit,
  onDelete,
  onSplit,
  onUnsplit,
  onQuickCategorize,
  quickCategorizingId,
  categories,
  onCategorySelect,
  onReceiptDeleted,
}: VirtualTransactionTableProps) {
  const tAria = useTranslations("aria");
  const parentRef = useRef<HTMLDivElement>(null);

  // Memoize row virtualizer for performance
  const rowVirtualizer = useVirtualizer({
    count: transactions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60, // Estimated row height in pixels
    overscan: 10, // Render 10 extra rows above/below viewport
  });

  // Memoize virtual items to prevent unnecessary re-renders
  const virtualItems = useMemo(() => rowVirtualizer.getVirtualItems(), [rowVirtualizer]);

  const allSelected = transactions.length > 0 && transactions.every((tx) => selectedIds.has(tx.id));

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow">
      {/* Table Header - Sticky */}
      <div className="sticky top-0 z-20 border-b border-gray-200 bg-gray-50 shadow-sm">
        <div className="grid grid-cols-[40px_100px_1fr_150px_120px] gap-4 px-4 py-3 sm:grid-cols-[40px_100px_1fr_150px_150px_120px] md:px-6 lg:grid-cols-[40px_100px_1fr_150px_80px_150px_120px]">
          <div>
            <input
              type="checkbox"
              checked={allSelected}
              onChange={(e) => {
                if (e.target.checked) {
                  onSelectAll();
                } else {
                  onClearSelection();
                }
              }}
              className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
              title="Select all visible transactions"
            />
          </div>
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-700">Date</div>
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-700">
            Description
          </div>
          <div className="hidden text-xs font-semibold uppercase tracking-wider text-gray-700 sm:block">
            Category
          </div>
          <div className="hidden text-xs font-semibold uppercase tracking-wider text-gray-700 lg:block">
            Receipt
          </div>
          <div className="text-end text-xs font-semibold uppercase tracking-wider text-gray-700">
            Amount
          </div>
          <div className="text-end text-xs font-semibold uppercase tracking-wider text-gray-700">
            Actions
          </div>
        </div>
      </div>

      {/* Virtual Scrolling Container */}
      <div
        ref={parentRef}
        className="relative"
        style={{
          height: "600px",
          overflow: "auto",
        }}
      >
        {/* Virtual list with calculated height */}
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {/* Only render visible rows */}
          {virtualItems.map((virtualRow) => {
            const tx = transactions[virtualRow.index];
            const isSelected = selectedIds.has(tx.id);

            return (
              <div
                key={tx.id}
                data-index={virtualRow.index}
                ref={rowVirtualizer.measureElement}
                className={`absolute start-0 top-0 w-full border-b border-gray-200 transition-colors ${
                  isSelected ? "bg-teal-50/50" : "bg-white hover:bg-gray-50/50"
                }`}
                style={{
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <div className="grid grid-cols-[40px_100px_1fr_150px_120px] items-center gap-4 px-4 py-4 sm:grid-cols-[40px_100px_1fr_150px_150px_120px] md:px-6 lg:grid-cols-[40px_100px_1fr_150px_80px_150px_120px]">
                  {/* Checkbox */}
                  <div>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect(tx.id)}
                      className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>

                  {/* Date */}
                  <div className="whitespace-nowrap text-sm font-medium text-gray-900">
                    {new Date(tx.date).toLocaleDateString()}
                  </div>

                  {/* Description */}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{tx.description}</span>
                      {tx.splitFromId && (
                        <span className="inline-flex items-center rounded bg-teal-100 px-2 py-0.5 text-xs font-medium text-teal-700">
                          Split
                        </span>
                      )}
                    </div>
                    {tx.notes && <div className="mt-1 text-xs text-gray-600">{tx.notes}</div>}
                  </div>

                  {/* Category */}
                  <div className="hidden sm:block">
                    {tx.category ? (
                      <span className="inline-flex items-center rounded-full bg-teal-100 px-2.5 py-1 text-xs font-medium text-teal-800">
                        {tx.category}
                        {tx.subcategory && ` • ${tx.subcategory}`}
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-800">
                        Uncategorized
                      </span>
                    )}
                  </div>

                  {/* Receipt */}
                  <div className="hidden lg:block">
                    <ReceiptThumbnail transactionId={tx.id} onReceiptDeleted={onReceiptDeleted} />
                  </div>

                  {/* Amount */}
                  <div className="text-end">
                    <div className="flex items-center justify-end gap-1.5">
                      {tx.amount > 0 ? (
                        <>
                          <ArrowUp className="h-4 w-4 text-green-600" aria-hidden="true" />
                          <span className="text-sm font-semibold text-green-600">
                            <span className="sr-only">Income: </span>
                            +${Math.abs(tx.amount).toFixed(2)}
                          </span>
                        </>
                      ) : (
                        <>
                          <ArrowDown className="h-4 w-4 text-red-600" aria-hidden="true" />
                          <span className="text-sm font-semibold text-red-600">
                            <span className="sr-only">Expense: </span>
                            -${Math.abs(tx.amount).toFixed(2)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="text-end">
                    <div className="flex items-center justify-end gap-1">
                      {/* Quick Categorize */}
                      {!tx.category && (
                        <div className="relative">
                          <button
                            onClick={() => onQuickCategorize(tx)}
                            className="rounded-md p-1.5 text-green-600 transition-colors hover:bg-green-50 hover:text-green-700"
                            title="Quick Categorize"
                          >
                            <Tag className="h-4 w-4" />
                          </button>

                          {/* Quick Category Dropdown */}
                          {quickCategorizingId === tx.id && (
                            <>
                              <div
                                className="fixed inset-0 z-10"
                                onClick={() => onQuickCategorize(tx)}
                              />
                              <div className="absolute end-0 top-8 z-20 max-h-96 w-64 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                                <div className="sticky top-0 border-b border-gray-200 bg-white p-3">
                                  <p className="text-sm font-semibold text-gray-700">
                                    Quick Categorize
                                  </p>
                                </div>
                                <div className="p-2">
                                  {categories.map((cat) => (
                                    <div key={cat.id}>
                                      <button
                                        onClick={() => onCategorySelect(tx, cat.name, null)}
                                        className="w-full rounded px-4 py-3 text-start text-base font-medium hover:bg-gray-100"
                                      >
                                        {cat.name}
                                      </button>
                                      {cat.subcategories.length > 0 && (
                                        <div className="ms-4 border-s-2 border-gray-200">
                                          {cat.subcategories.map((sub) => (
                                            <button
                                              key={sub}
                                              onClick={() => onCategorySelect(tx, cat.name, sub)}
                                              className="w-full rounded px-4 py-3 text-start text-sm text-gray-600 hover:bg-gray-100"
                                            >
                                              {sub}
                                            </button>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      )}

                      {/* Split/Unsplit */}
                      {tx.splitFromId ? (
                        <button
                          onClick={() => onUnsplit(tx)}
                          className="rounded-md p-1.5 text-teal-600 transition-colors hover:bg-teal-50 hover:text-teal-700"
                          title="Unsplit transaction"
                        >
                          <Split className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => onSplit(tx)}
                          className="rounded-md p-1.5 text-teal-600 transition-colors hover:bg-teal-50 hover:text-teal-700"
                          title="Split transaction"
                        >
                          <Split className="h-4 w-4" />
                        </button>
                      )}

                      {/* Edit */}
                      <button
                        onClick={() => onEdit(tx)}
                        className="rounded-md p-1.5 text-teal-600 transition-colors hover:bg-teal-50 hover:text-teal-700"
                        title="Edit"
                        aria-label={tAria("editTransaction")}
                      >
                        <Edit className="h-4 w-4" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => onDelete(tx)}
                        className="rounded-md p-1.5 text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
                        title="Delete"
                        aria-label={tAria("deleteTransaction")}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Performance Stats (dev mode) */}
      {process.env.NODE_ENV === "development" && (
        <div className="border-t bg-gray-100 px-4 py-2 text-xs text-gray-600">
          Rendering {virtualItems.length} of {transactions.length} rows (Start:{" "}
          {virtualItems[0]?.index ?? 0}, End: {virtualItems[virtualItems.length - 1]?.index ?? 0})
        </div>
      )}
    </div>
  );
}
