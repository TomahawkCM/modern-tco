'use client';

/**
 * Quick Filters Row
 * Sticky filter bar for instant transaction filtering
 * Date presets + category chips for one-click filtering
 */

import { useState } from 'react';
import { X as XIcon, Calendar, Tag, DollarSign } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { Category } from '@/types/budget';

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
  const t = useTranslations('quickFilters');
  const [selectedPreset, setSelectedPreset] = useState('');

  const datePresets = [
    { label: t('presets.thisMonth'), value: 'this-month' },
    { label: t('presets.last30'), value: 'last-30' },
    { label: t('presets.last90'), value: 'last-90' },
    { label: t('presets.thisYear'), value: 'this-year' },
  ];

  const handlePresetClick = (preset: string) => {
    setSelectedPreset(preset);
    onDateRangeChange(preset);
  };

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-3">
        {/* Date Presets */}
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              {t('timePeriod')}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {datePresets.map((preset) => (
              <button
                key={preset.value}
                onClick={() => handlePresetClick(preset.value)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedPreset === preset.value
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category Chips */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Tag className="w-4 h-4 text-gray-500" />
            <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              {t('categories')}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onCategoryChange('all')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <DollarSign className="w-3 h-3 inline mr-1" />
              {t('all')}
            </button>
            {categories.slice(0, 8).map((cat) => (
              <button
                key={cat.id}
                onClick={() => onCategoryChange(cat.name)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === cat.name
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
            {categories.length > 8 && (
              <span className="px-3 py-1.5 text-sm text-gray-500">
                {t('moreCategories', { count: categories.length - 8 })}
              </span>
            )}
          </div>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <div className="mt-3 flex justify-end">
            <button
              onClick={() => {
                onCategoryChange('all');
                setSelectedPreset('');
              }}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <XIcon className="w-4 h-4" />
              {t('clearFilters')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
