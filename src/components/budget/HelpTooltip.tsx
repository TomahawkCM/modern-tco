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

'use client';

import * as React from 'react';
import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface HelpTooltipProps {
  /** Tooltip content - can be a string or React node */
  content: React.ReactNode;
  /** Optional "Learn More" link */
  learnMoreUrl?: string;
  /** Accessible label for screen readers */
  ariaLabel?: string;
  /** Tooltip position - defaults to "top" */
  side?: 'top' | 'bottom' | 'left' | 'right';
  /** Icon size class - defaults to h-4 w-4 (16px) */
  iconSize?: string;
}

export function HelpTooltip({
  content,
  learnMoreUrl,
  ariaLabel = 'More information',
  side = 'top',
  iconSize = 'h-4 w-4',
}: HelpTooltipProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={`inline-flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 rounded ${iconSize === 'h-4 w-4' ? 'p-1' : 'p-1.5'}`}
            aria-label={ariaLabel}
          >
            <Info className={`${iconSize} md:h-4 md:w-4`} />
            <span className="sr-only">{ariaLabel}</span>
          </button>
        </TooltipTrigger>
        <TooltipContent
          side={side}
          className="max-w-[320px] md:max-w-xs bg-gray-800 text-white px-4 py-3 text-sm leading-relaxed shadow-lg"
          sideOffset={8}
        >
          <div className="space-y-2">
            <div>{content}</div>
            {learnMoreUrl && (
              <a
                href={learnMoreUrl}
                className="inline-block text-xs text-teal-300 hover:text-teal-200 hover:underline transition-colors mt-2"
                onClick={(e) => e.stopPropagation()}
              >
                Learn more →
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
