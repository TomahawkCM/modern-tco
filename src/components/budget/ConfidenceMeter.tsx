'use client';

/**
 * Confidence Meter Component (Phase 5)
 * Task 5.2.3: Add confidence meter and learning
 * 
 * Visual indicator for auto-categorization confidence
 */

import { Brain, Check } from 'lucide-react';

interface ConfidenceMeterProps {
  confidence: number; // 0-1
  category: string;
  subcategory?: string;
  onLearnFromThis?: () => void;
  showLearnButton?: boolean;
}

export function ConfidenceMeter({ 
  confidence, 
  category, 
  subcategory,
  onLearnFromThis,
  showLearnButton = false 
}: ConfidenceMeterProps) {
  const bars = 5;
  const filledBars = Math.ceil(confidence * bars);
  
  // Color based on confidence level
  const getColor = () => {
    if (confidence >= 0.9) return 'bg-green-500';
    if (confidence >= 0.7) return 'bg-teal-500';
    if (confidence >= 0.5) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getTextColor = () => {
    if (confidence >= 0.9) return 'text-green-700';
    if (confidence >= 0.7) return 'text-teal-700';
    if (confidence >= 0.5) return 'text-yellow-700';
    return 'text-red-700';
  };

  const getConfidenceLabel = () => {
    if (confidence >= 0.9) return 'Very Confident';
    if (confidence >= 0.7) return 'Confident';
    if (confidence >= 0.5) return 'Moderate';
    return 'Low Confidence';
  };

  const colorClass = getColor();
  const textColorClass = getTextColor();

  return (
    <div className="inline-flex items-center gap-4">
      {/* Category Badge */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-600">Auto-categorized:</span>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          confidence >= 0.7 ? 'bg-teal-100 text-teal-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {category}
          {subcategory && ` • ${subcategory}`}
        </span>
      </div>

      {/* Confidence Meter (5 bars) */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-0.5">
          {Array.from({ length: bars }).map((_, index) => (
            <div
              key={index}
              className={`w-1.5 h-4 rounded-sm ${
                index < filledBars ? colorClass : 'bg-gray-200'
              }`}
              title={`${(confidence * 100).toFixed(0)}% confidence`}
            />
          ))}
        </div>
        <span className={`text-xs font-medium ${textColorClass}`}>
          {getConfidenceLabel()}
        </span>
      </div>

      {/* Learn Button */}
      {showLearnButton && onLearnFromThis && (
        <button
          onClick={onLearnFromThis}
          className="inline-flex items-center gap-2 px-2 py-1 text-xs font-medium text-teal-700 hover:text-teal-800 hover:bg-teal-50 rounded transition-colors"
          title="Confirm this categorization to improve accuracy"
        >
          <Brain className="w-3 h-3" />
          Learn from this
        </button>
      )}
    </div>
  );
}

/**
 * Compact confidence indicator (for table cells)
 */
export function CompactConfidenceMeter({ confidence }: { confidence: number }) {
  const bars = 5;
  const filledBars = Math.ceil(confidence * bars);
  
  const getColor = () => {
    if (confidence >= 0.9) return 'bg-green-500';
    if (confidence >= 0.7) return 'bg-teal-500';
    if (confidence >= 0.5) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const colorClass = getColor();

  return (
    <div className="inline-flex items-center gap-2" title={`${(confidence * 100).toFixed(0)}% confidence`}>
      {Array.from({ length: bars }).map((_, index) => (
        <div
          key={index}
          className={`w-1 h-3 rounded-sm ${
            index < filledBars ? colorClass : 'bg-gray-200'
          }`}
        />
      ))}
    </div>
  );
}

