"use client";

/**
 * Sticky Bulk Actions Bar
 * Appears at top of viewport when transactions are selected
 * Follows user as they scroll - never loses access to bulk actions
 */

import { useState, useEffect } from "react";
import { Check, X as XIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Category } from "@/types/budget";

interface StickyBulkActionsBarProps {
  selectedCount: number;
  categories: Category[];
  onApplyCategory: (category: string, subcategory: string) => void;
  onClearSelection: () => void;
}

export function StickyBulkActionsBar({
  selectedCount,
  categories,
  onApplyCategory,
  onClearSelection,
}: StickyBulkActionsBarProps) {
  const t = useTranslations("bulkActions");
  const [bulkCategory, setBulkCategory] = useState("");
  const [bulkSubcategory, setBulkSubcategory] = useState("");
  const [isSticky, setIsSticky] = useState(false);

  // Detect if bar should be sticky (user scrolled past initial position)
  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (selectedCount === 0) return null;

  return (
    <div
      className={`${
        isSticky ? "fixed left-0 right-0 top-0 z-50 shadow-lg" : "relative"
      } border-b border-t border-teal-200 bg-gradient-to-r from-teal-50 to-teal-100 transition-all duration-300`}
    >
      <div className="mx-auto max-w-7xl px-4 py-3 md:px-8">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          {/* Selection Count */}
          <div className="flex min-w-[180px] items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-600 text-sm font-bold text-white">
              {selectedCount}
            </div>
            <span className="font-semibold text-teal-900">
              {t("selected", { count: selectedCount })}
            </span>
          </div>

          {/* Category Selection */}
          <div className="flex flex-1 flex-wrap items-center gap-2">
            <select
              value={bulkCategory}
              onChange={(e) => {
                setBulkCategory(e.target.value);
                setBulkSubcategory("");
              }}
              className="rounded-lg border-2 border-teal-300 bg-white px-4 py-2 text-sm font-medium focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
            >
              <option value="">{t("selectCategory")}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>

            {bulkCategory && categories.find((c) => c.name === bulkCategory)?.subcategories && (
              <select
                value={bulkSubcategory}
                onChange={(e) => setBulkSubcategory(e.target.value)}
                className="rounded-lg border-2 border-teal-300 bg-white px-4 py-2 text-sm font-medium focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
              >
                <option value="">{t("noSubcategory")}</option>
                {categories
                  .find((c) => c.name === bulkCategory)
                  ?.subcategories.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
              </select>
            )}

            <button
              onClick={() => {
                if (bulkCategory) {
                  onApplyCategory(bulkCategory, bulkSubcategory);
                  setBulkCategory("");
                  setBulkSubcategory("");
                }
              }}
              disabled={!bulkCategory}
              className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-colors hover:bg-teal-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
              {t("applyTo", { count: selectedCount })}
            </button>
          </div>

          {/* Clear Button */}
          <button
            onClick={onClearSelection}
            className="rounded-lg p-2 text-teal-700 transition-colors hover:bg-teal-200 hover:text-teal-900"
            title={t("clearSelection")}
            aria-label={t("clearSelection")}
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Sticky Indicator */}
      {isSticky && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-teal-600"></div>
      )}
    </div>
  );
}
