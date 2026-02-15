/**
 * Amount Range Filter Component
 * Dual-thumb slider for filtering transactions by amount
 * Features: Preset chips, precise input fields, visual feedback
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { DollarSign, X as XIcon } from "lucide-react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

export interface AmountRangeFilterProps {
  /** Minimum value selected */
  minValue?: number;
  /** Maximum value selected */
  maxValue?: number;
  /** Absolute minimum (default: 0) */
  min?: number;
  /** Absolute maximum (default: 1000) */
  max?: number;
  /** Step size (default: 5) */
  step?: number;
  /** Change handler */
  onChange: (min: number | undefined, max: number | undefined) => void;
  /** Additional CSS classes */
  className?: string;
  /** Show preset chips */
  showPresets?: boolean;
  /** Transaction amounts for distribution visualization */
  transactionAmounts?: number[];
}

// Preset amount ranges
const PRESETS = [
  { label: "Under $25", min: undefined, max: 25 },
  { label: "$25-100", min: 25, max: 100 },
  { label: "$100-500", min: 100, max: 500 },
  { label: "$500+", min: 500, max: undefined },
] as const;

export function AmountRangeFilter({
  minValue,
  maxValue,
  min = 0,
  max = 1000,
  step = 5,
  onChange,
  className,
  showPresets = true,
  transactionAmounts = [],
}: AmountRangeFilterProps) {
  const t = useTranslations("amountFilter");

  // Internal state for slider values
  const [sliderValues, setSliderValues] = useState<[number, number]>([
    minValue ?? min,
    maxValue ?? max,
  ]);

  // Input field states
  const [minInput, setMinInput] = useState(minValue?.toString() || "");
  const [maxInput, setMaxInput] = useState(maxValue?.toString() || "");

  // Active preset
  const [activePreset, setActivePreset] = useState<number | null>(null);

  // Sync slider with props
  useEffect(() => {
    setSliderValues([minValue ?? min, maxValue ?? max]);
    setMinInput(minValue?.toString() || "");
    setMaxInput(maxValue?.toString() || "");
  }, [minValue, maxValue, min, max]);

  // Handle slider change
  const handleSliderChange = useCallback(
    (values: number[]) => {
      const [newMin, newMax] = values as [number, number];
      setSliderValues([newMin, newMax]);
      setMinInput(newMin === min ? "" : newMin.toString());
      setMaxInput(newMax === max ? "" : newMax.toString());
      setActivePreset(null);

      // Emit change with undefined for min/max boundaries
      onChange(newMin === min ? undefined : newMin, newMax === max ? undefined : newMax);
    },
    [min, max, onChange]
  );

  // Handle input field change
  const handleInputChange = useCallback((type: "min" | "max", value: string) => {
    if (type === "min") {
      setMinInput(value);
    } else {
      setMaxInput(value);
    }
  }, []);

  // Handle input field blur - commit value
  const handleInputBlur = useCallback(
    (type: "min" | "max") => {
      let newMin = minInput ? parseFloat(minInput) : undefined;
      let newMax = maxInput ? parseFloat(maxInput) : undefined;

      // Validate and clamp values
      if (newMin !== undefined) {
        newMin = Math.max(min, Math.min(newMin, newMax ?? max));
      }
      if (newMax !== undefined) {
        newMax = Math.min(max, Math.max(newMax, newMin ?? min));
      }

      // Update slider
      setSliderValues([newMin ?? min, newMax ?? max]);
      setActivePreset(null);

      // Emit change
      onChange(newMin, newMax);
    },
    [minInput, maxInput, min, max, onChange]
  );

  // Handle preset click
  const handlePresetClick = useCallback(
    (preset: (typeof PRESETS)[number], index: number) => {
      setActivePreset(index);
      setSliderValues([preset.min ?? min, preset.max ?? max]);
      setMinInput(preset.min?.toString() || "");
      setMaxInput(preset.max?.toString() || "");
      onChange(preset.min, preset.max);
    },
    [min, max, onChange]
  );

  // Clear filter
  const handleClear = useCallback(() => {
    setSliderValues([min, max]);
    setMinInput("");
    setMaxInput("");
    setActivePreset(null);
    onChange(undefined, undefined);
  }, [min, max, onChange]);

  // Calculate distribution histogram (optional visualization)
  const histogram =
    transactionAmounts.length > 0 ? calculateHistogram(transactionAmounts, min, max, 20) : null;

  const hasFilter = minValue !== undefined || maxValue !== undefined;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">{t("title")}</span>
        </div>
        {hasFilter && (
          <button
            onClick={handleClear}
            className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <XIcon className="h-3 w-3" />
            {t("clear")}
          </button>
        )}
      </div>

      {/* Preset Chips */}
      {showPresets && (
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset, index) => (
            <button
              key={preset.label}
              onClick={() => handlePresetClick(preset, index)}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm font-medium transition-all",
                activePreset === index
                  ? "scale-105 bg-teal-600 text-white shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}

      {/* Histogram (optional) */}
      {histogram && (
        <div className="flex h-8 items-end gap-px px-1">
          {histogram.map((count, i) => (
            <div
              key={i}
              className="flex-1 rounded-t bg-teal-200 transition-all"
              style={{
                height: `${(count / Math.max(...histogram)) * 100}%`,
                minHeight: count > 0 ? "2px" : "0",
              }}
            />
          ))}
        </div>
      )}

      {/* Dual-Thumb Slider */}
      <div className="px-1">
        <SliderPrimitive.Root
          className="relative flex h-5 w-full touch-none select-none items-center"
          value={sliderValues}
          onValueChange={handleSliderChange}
          min={min}
          max={max}
          step={step}
          minStepsBetweenThumbs={1}
        >
          <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-muted">
            <SliderPrimitive.Range className="absolute h-full bg-teal-500" />
          </SliderPrimitive.Track>
          <SliderPrimitive.Thumb
            className="block h-5 w-5 cursor-grab rounded-full border-2 border-teal-500 bg-background shadow-lg ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:cursor-grabbing disabled:pointer-events-none disabled:opacity-50"
            aria-label={t("minThumb")}
          />
          <SliderPrimitive.Thumb
            className="block h-5 w-5 cursor-grab rounded-full border-2 border-teal-500 bg-background shadow-lg ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:cursor-grabbing disabled:pointer-events-none disabled:opacity-50"
            aria-label={t("maxThumb")}
          />
        </SliderPrimitive.Root>
      </div>

      {/* Value Labels */}
      <div className="flex justify-between px-1 text-xs text-muted-foreground">
        <span>${min}</span>
        <span>${max}+</span>
      </div>

      {/* Input Fields */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <label className="sr-only">{t("minLabel")}</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              $
            </span>
            <input
              type="number"
              value={minInput}
              onChange={(e) => handleInputChange("min", e.target.value)}
              onBlur={() => handleInputBlur("min")}
              onKeyDown={(e) => e.key === "Enter" && handleInputBlur("min")}
              placeholder={t("minPlaceholder")}
              min={min}
              max={max}
              step={step}
              className="w-full rounded-lg border border-input bg-background py-2 pl-7 pr-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>
        </div>
        <span className="text-muted-foreground">—</span>
        <div className="flex-1">
          <label className="sr-only">{t("maxLabel")}</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              $
            </span>
            <input
              type="number"
              value={maxInput}
              onChange={(e) => handleInputChange("max", e.target.value)}
              onBlur={() => handleInputBlur("max")}
              onKeyDown={(e) => e.key === "Enter" && handleInputBlur("max")}
              placeholder={t("maxPlaceholder")}
              min={min}
              max={max}
              step={step}
              className="w-full rounded-lg border border-input bg-background py-2 pl-7 pr-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>
        </div>
      </div>

      {/* Current Filter Summary */}
      {hasFilter && (
        <div className="text-center text-sm font-medium text-teal-600">
          {minValue !== undefined && maxValue !== undefined
            ? `$${minValue.toFixed(0)} — $${maxValue.toFixed(0)}`
            : minValue !== undefined
              ? `$${minValue.toFixed(0)} and up`
              : `Up to $${maxValue!.toFixed(0)}`}
        </div>
      )}
    </div>
  );
}

/**
 * Calculate histogram buckets for amount distribution
 */
function calculateHistogram(
  amounts: number[],
  min: number,
  max: number,
  buckets: number
): number[] {
  const histogram = new Array(buckets).fill(0);
  const bucketSize = (max - min) / buckets;

  for (const amount of amounts) {
    const absAmount = Math.abs(amount);
    if (absAmount < min || absAmount > max) continue;
    const bucketIndex = Math.min(Math.floor((absAmount - min) / bucketSize), buckets - 1);
    histogram[bucketIndex]++;
  }

  return histogram;
}

// Export preset type for external use
export type AmountPreset = (typeof PRESETS)[number];
export { PRESETS as AMOUNT_PRESETS };
