/**
 * HelpfulError Component
 *
 * Displays constitution-aligned error messages that are:
 * - Conversational and friendly
 * - Explain WHY something is wrong
 * - Provide clear "what to do next" guidance
 * - No intimidating or judgmental language
 * - Encouraging and supportive
 *
 * Usage:
 *   <HelpfulError error={ErrorMessages.noAnswerSelected} />
 *   <HelpfulError error={ErrorMessages.loginFailed} />
 *   <HelpfulError error={humanizeError(unknownError)} />
 */

import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Info, AlertTriangle } from "lucide-react";
import type { HelpfulErrorMessage } from "@/lib/error-messages";

interface HelpfulErrorProps {
  error: HelpfulErrorMessage;
  className?: string;
  showIcon?: boolean;
}

export function HelpfulError({ error, className = "", showIcon = true }: HelpfulErrorProps) {
  // Determine icon and styles based on variant
  const getVariantStyles = () => {
    switch (error.variant) {
      case "destructive":
        return {
          icon: AlertCircle,
          iconColor: "text-red-600",
          alertVariant: "destructive" as const,
        };
      case "warning":
        return {
          icon: AlertTriangle,
          iconColor: "text-orange-500",
          alertVariant: "default" as const,
        };
      case "default":
      default:
        return {
          icon: Info,
          iconColor: "text-teal-500",
          alertVariant: "default" as const,
        };
    }
  };

  const { icon: Icon, iconColor, alertVariant } = getVariantStyles();

  return (
    <Alert variant={alertVariant} className={className}>
      {showIcon && <Icon className={`h-4 w-4 ${iconColor}`} />}
      <AlertTitle>{error.title}</AlertTitle>
      <AlertDescription className="mt-2">
        <p className="mb-1">{error.message}</p>
        {error.action && (
          <p className="mt-2 text-sm font-medium">
            <span className="mr-1 inline-block">→</span>
            {error.action}
          </p>
        )}
      </AlertDescription>
    </Alert>
  );
}

/**
 * Inline variant for compact displays (e.g., form validation)
 */
export function HelpfulErrorInline({ error, className = "" }: HelpfulErrorProps) {
  const iconColor =
    error.variant === "destructive"
      ? "text-red-600"
      : error.variant === "warning"
        ? "text-orange-500"
        : "text-teal-500";

  return (
    <div className={`text-sm ${iconColor} ${className}`}>
      <p className="font-medium">{error.title}</p>
      <p className="mt-1">{error.message}</p>
      {error.action && (
        <p className="mt-1 text-xs opacity-90">
          <span className="mr-1 inline-block">→</span>
          {error.action}
        </p>
      )}
    </div>
  );
}

/**
 * Toast-compatible variant that returns formatted string
 */
export function formatErrorForToast(error: HelpfulErrorMessage): {
  title: string;
  description: string;
  variant: "default" | "destructive";
} {
  return {
    title: error.title,
    description: `${error.message}${error.action ? ` ${error.action}` : ""}`,
    variant: error.variant === "destructive" ? "destructive" : "default",
  };
}
