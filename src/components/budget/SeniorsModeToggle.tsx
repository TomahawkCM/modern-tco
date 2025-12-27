"use client";

import { useSeniorsMode } from "@/hooks/useSeniorsMode";
import { cn } from "@/lib/utils";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { Eye, EyeOff } from "lucide-react";
import { useCallback, useId } from "react";

interface SeniorsModeToggleProps {
  /** Show label text */
  showLabel?: boolean;
  /** Size variant */
  size?: "default" | "large";
  /** Additional className */
  className?: string;
  /** Show visual indicator icons */
  showIcons?: boolean;
}

/**
 * Accessible toggle switch for Seniors Mode
 * - Large touch target (52x52 minimum)
 * - Clear on/off state announcement
 * - Keyboard accessible (Space/Enter to toggle)
 * - Screen reader friendly with live region
 * - Visual state indicator
 */
export function SeniorsModeToggle({
  showLabel = true,
  size = "large",
  className,
  showIcons = true,
}: SeniorsModeToggleProps) {
  const { isSeniorsMode, toggleSeniorsMode, settings } = useSeniorsMode();
  const id = useId();
  const labelId = `${id}-label`;
  const descriptionId = `${id}-description`;

  const handleChange = useCallback(() => {
    toggleSeniorsMode();
  }, [toggleSeniorsMode]);

  const isLarge = size === "large" || isSeniorsMode;

  return (
    <div
      className={cn(
        "flex items-center gap-4",
        isLarge && "gap-6",
        className
      )}
    >
      {showLabel && (
        <div className="flex-1">
          <label
            id={labelId}
            htmlFor={id}
            className={cn(
              "font-medium cursor-pointer select-none",
              isLarge ? "text-lg" : "text-base",
              isSeniorsMode && "text-xl font-semibold"
            )}
          >
            Seniors Mode
          </label>
          <p
            id={descriptionId}
            className={cn(
              "text-muted-foreground",
              isLarge ? "text-base" : "text-sm",
              isSeniorsMode && "text-lg"
            )}
          >
            {isSeniorsMode
              ? "Larger text, bigger buttons, simplified interface"
              : "Enable for enhanced accessibility"}
          </p>
        </div>
      )}

      <div className="flex items-center gap-2">
        {showIcons && (
          <span
            className={cn(
              "text-muted-foreground transition-opacity",
              isSeniorsMode ? "opacity-30" : "opacity-100"
            )}
            aria-hidden="true"
          >
            <EyeOff className={isLarge ? "h-6 w-6" : "h-5 w-5"} />
          </span>
        )}

        <SwitchPrimitives.Root
          id={id}
          checked={isSeniorsMode}
          onCheckedChange={handleChange}
          aria-labelledby={showLabel ? labelId : undefined}
          aria-describedby={showLabel ? descriptionId : undefined}
          aria-label={!showLabel ? "Toggle Seniors Mode" : undefined}
          className={cn(
            // Base styles
            "peer relative inline-flex shrink-0 cursor-pointer items-center rounded-full",
            "border-2 border-transparent shadow-sm",
            "transition-all duration-200 ease-in-out",
            // Focus styles - enhanced for accessibility
            "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-500",
            "focus-visible:ring-offset-4 focus-visible:ring-offset-background",
            // Disabled state
            "disabled:cursor-not-allowed disabled:opacity-50",
            // Size variants
            isLarge
              ? "h-10 w-[76px] min-h-[52px] min-w-[76px]" // 52px touch target
              : "h-7 w-14 min-h-[44px] min-w-[56px]", // 44px touch target
            // Color states with high contrast
            isSeniorsMode
              ? "bg-teal-600 hover:bg-teal-700"
              : "bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500"
          )}
        >
          <SwitchPrimitives.Thumb
            className={cn(
              "pointer-events-none block rounded-full bg-white shadow-lg",
              "ring-0 transition-transform duration-200 ease-in-out",
              // Size variants
              isLarge ? "h-8 w-8" : "h-5 w-5",
              // Position
              isSeniorsMode
                ? isLarge
                  ? "translate-x-9"
                  : "translate-x-7"
                : "translate-x-1"
            )}
          />
        </SwitchPrimitives.Root>

        {showIcons && (
          <span
            className={cn(
              "text-teal-600 transition-opacity",
              isSeniorsMode ? "opacity-100" : "opacity-30"
            )}
            aria-hidden="true"
          >
            <Eye className={isLarge ? "h-6 w-6" : "h-5 w-5"} />
          </span>
        )}
      </div>

      {/* Live region for screen reader announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {isSeniorsMode
          ? "Seniors Mode is now enabled. Larger text and buttons are active."
          : "Seniors Mode is now disabled."}
      </div>
    </div>
  );
}

/**
 * Compact version for toolbar/header use
 */
export function SeniorsModeToggleCompact({
  className,
}: {
  className?: string;
}) {
  return (
    <SeniorsModeToggle
      showLabel={false}
      showIcons={false}
      size="default"
      className={className}
    />
  );
}

/**
 * Button version that opens settings
 */
export function SeniorsModeButton({
  className,
}: {
  className?: string;
}) {
  const { isSeniorsMode, toggleSeniorsMode } = useSeniorsMode();

  return (
    <button
      type="button"
      onClick={toggleSeniorsMode}
      aria-pressed={isSeniorsMode}
      className={cn(
        "flex items-center gap-2 px-4 py-3 rounded-lg",
        "min-h-[52px] min-w-[52px]", // 52px touch target
        "font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-500",
        "focus-visible:ring-offset-2",
        isSeniorsMode
          ? "bg-teal-100 text-teal-800 hover:bg-teal-200 dark:bg-teal-900 dark:text-teal-100"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300",
        className
      )}
    >
      {isSeniorsMode ? (
        <Eye className="h-5 w-5" aria-hidden="true" />
      ) : (
        <EyeOff className="h-5 w-5" aria-hidden="true" />
      )}
      <span className={isSeniorsMode ? "text-lg" : "text-base"}>
        {isSeniorsMode ? "Seniors Mode On" : "Seniors Mode"}
      </span>
    </button>
  );
}

export default SeniorsModeToggle;
