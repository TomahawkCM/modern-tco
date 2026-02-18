"use client";

/**
 * Quick Filters Row
 * Sticky filter bar for instant transaction filtering
 * Date presets + category chips for one-click filtering
 */

import { useState } from "react";
import { X as XIcon, Calendar, Tag, DollarSign } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Category } from "@/types/budget";

interface QuickFiltersRowProps {
  categories: Category[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  onDateRangeChange: (preset: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export function QuickFiltersRow({
  categories,
  selectedCategory,
  onCategoryChange,
  onDateRangeChange,
  hasActiveFilters,
}: QuickFiltersRowProps) {
  const t = useTranslations("quickFilters");
  const [selectedPreset, setSelectedPreset] = useState("");

  const datePresets = [
    { label: t("presets.thisMonth"), value: "this-month" },
    { label: t("presets.last30"), value: "last-30" },
    { label: t("presets.last90"), value: "last-90" },
    { label: t("presets.thisYear"), value: "this-year" },
  ];

  const handlePresetClick = (preset: string) => {
    setSelectedPreset(preset);
    onDateRangeChange(preset);
  };

  return (
    <div className="sticky top-0 z-30 border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 py-3 md:px-8">
        {/* Date Presets */}
        <div className="mb-3">
          <div className="mb-2 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-700">
              {t("timePeriod")}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {datePresets.map((preset) => (
              <button
                key={preset.value}
                onClick={() => handlePresetClick(preset.value)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                  selectedPreset === preset.value
                    ? "bg-teal-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category Chips */}
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Tag className="h-4 w-4 text-gray-500" />
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-700">
              {t("categories")}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onCategoryChange("all")}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                selectedCategory === "all"
                  ? "bg-teal-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <DollarSign className="mr-1 inline h-3 w-3" />
              {t("all")}
            </button>
            {categories.slice(0, 8).map((cat) => (
              <button
                key={cat.id}
                onClick={() => onCategoryChange(cat.name)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                  selectedCategory === cat.name
                    ? "bg-teal-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {cat.name}
              </button>
            ))}
            {categories.length > 8 && (
              <span className="px-3 py-1.5 text-sm text-gray-500">
                {t("moreCategories", { count: categories.length - 8 })}
              </span>
            )}
          </div>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <div className="mt-3 flex justify-end">
            <button
              onClick={() => {
                onCategoryChange("all");
                setSelectedPreset("");
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
            >
              <XIcon className="h-4 w-4" />
              {t("clearFilters")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
