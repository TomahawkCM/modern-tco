'use client';

/**
 * Sticky Bulk Actions Bar
 * Appears at top of viewport when transactions are selected
 * Follows user as they scroll - never loses access to bulk actions
 */

import { useState, useEffect } from 'react';
import { Check, X as XIcon } from 'lucide-react';
import type { Category } from '@/types/budget';

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
  const [bulkCategory, setBulkCategory] = useState('');
  const [bulkSubcategory, setBulkSubcategory] = useState('');
  const [isSticky, setIsSticky] = useState(false);

  // Detect if bar should be sticky (user scrolled past initial position)
  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (selectedCount === 0) return null;

  return (
    <div
      className={`${
        isSticky
          ? 'fixed top-0 left-0 right-0 z-50 shadow-lg'
          : 'relative'
      } bg-gradient-to-r from-teal-50 to-teal-100 border-t border-b border-teal-200 transition-all duration-300`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Selection Count */}
          <div className="flex items-center gap-2 min-w-[180px]">
            <div className="w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
              {selectedCount}
            </div>
            <span className="font-semibold text-teal-900">
              {selectedCount} selected
            </span>
          </div>

          {/* Category Selection */}
          <div className="flex flex-wrap items-center gap-2 flex-1">
            <select
              value={bulkCategory}
              onChange={(e) => {
                setBulkCategory(e.target.value);
                setBulkSubcategory('');
              }}
              className="px-4 py-2 border-2 border-teal-300 rounded-lg bg-white focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:border-transparent focus:outline-none text-sm font-medium"
            >
              <option value="">Select category...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>

            {bulkCategory && categories.find(c => c.name === bulkCategory)?.subcategories && (
              <select
                value={bulkSubcategory}
                onChange={(e) => setBulkSubcategory(e.target.value)}
                className="px-4 py-2 border-2 border-teal-300 rounded-lg bg-white focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:border-transparent focus:outline-none text-sm font-medium"
              >
                <option value="">No subcategory</option>
                {categories
                  .find(c => c.name === bulkCategory)
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
                  setBulkCategory('');
                  setBulkSubcategory('');
                }
              }}
              disabled={!bulkCategory}
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold shadow-md hover:shadow-lg focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:outline-none"
            >
              <Check className="w-4 h-4" />
              Apply to {selectedCount}
            </button>
          </div>

          {/* Clear Button */}
          <button
            onClick={onClearSelection}
            className="p-2 text-teal-700 hover:text-teal-900 hover:bg-teal-200 rounded-lg transition-colors"
            title="Clear selection"
            aria-label="Clear selection"
          >
            <XIcon className="w-5 h-5" />
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
