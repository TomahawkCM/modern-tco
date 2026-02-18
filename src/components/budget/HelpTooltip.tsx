/**
 * HelpTooltip Component
 * Reusable wrapper for contextual help tooltips throughout the Budget App
 *
 * Features:
 * - Info icon with hover/focus/tap support
 * - Dark-themed tooltip with white text for high contrast
 * - Optional "Learn More" link
 * - WCAG 2.2 AA accessible (keyboard, screen reader)
 * - Responsive (larger on mobile)
 */

"use client";

import * as React from "react";
import { Info } from "lucide-react";
import { useTranslations } from "next-intl";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface HelpTooltipProps {
  /** Tooltip content - can be a string or React node */
  content: React.ReactNode;
  /** Optional "Learn More" link */
  learnMoreUrl?: string;
  /** Accessible label for screen readers */
  ariaLabel?: string;
  /** Tooltip position - defaults to "top" */
  side?: "top" | "bottom" | "left" | "right";
  /** Icon size class - defaults to h-4 w-4 (16px) */
  iconSize?: string;
}

export function HelpTooltip({
  content,
  learnMoreUrl,
  ariaLabel,
  side = "top",
  iconSize = "h-4 w-4",
}: HelpTooltipProps) {
  const t = useTranslations("tooltip");
  const effectiveAriaLabel = ariaLabel || t("ariaLabel");

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={`inline-flex items-center justify-center rounded text-gray-500 transition-colors hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 ${iconSize === "h-4 w-4" ? "p-1" : "p-1.5"}`}
            aria-label={effectiveAriaLabel}
          >
            <Info className={`${iconSize} md:h-4 md:w-4`} />
            <span className="sr-only">{effectiveAriaLabel}</span>
          </button>
        </TooltipTrigger>
        <TooltipContent
          side={side}
          className="max-w-[320px] bg-gray-800 px-4 py-3 text-sm leading-relaxed text-white shadow-lg md:max-w-xs"
          sideOffset={8}
        >
          <div className="space-y-2">
            <div>{content}</div>
            {learnMoreUrl && (
              <a
                href={learnMoreUrl}
                className="mt-2 inline-block text-xs text-teal-300 transition-colors hover:text-teal-200 hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {t("learnMore")}
              </a>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Usage Examples:
 *
 * // Simple tooltip
 * <HelpTooltip content="Your total assets minus total debts." />
 *
 * // With Learn More link
 * <HelpTooltip
 *   content="Shows how your loan payment splits between principal and interest."
 *   learnMoreUrl="/docs/user-guide#amortization"
 *   ariaLabel="More information about amortization"
 * />
 *
 * // With complex content
 * <HelpTooltip
 *   content={
 *     <>
 *       <strong>Principal</strong> reduces your loan balance.
 *       <br />
 *       <strong>Interest</strong> is the cost to borrow.
 *     </>
 *   }
 *   learnMoreUrl="/docs/user-guide#loan-breakdown"
 * />
 *
 * // Larger icon for mobile
 * <HelpTooltip
 *   content="Budget resets monthly, weekly, or yearly."
 *   iconSize="h-5 w-5"
 * />
 */
