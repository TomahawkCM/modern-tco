"use client";

/**
 * ConfirmDialog Component
 *
 * Unified confirmation dialog for destructive actions across the budget app.
 * Replaces inconsistent toast.confirm() and native confirm() calls.
 *
 * Features:
 * - Shows detailed impact messaging (what will be lost)
 * - Clear action labels ("Delete Transaction" not "OK")
 * - Prominent cancel button
 * - Optional two-step confirmation for critical actions
 * - Keyboard accessible (Escape closes, Tab navigation, Enter confirms)
 * - Screen reader compatible
 * - Loading states during async operations
 *
 * Based on best practices from ResetProgressDialog.tsx
 *
 * @example
 * ```tsx
 * <ConfirmDialog
 *   open={deleteConfirmOpen}
 *   onOpenChange={setDeleteConfirmOpen}
 *   onConfirm={async () => {
 *     await db.transactions.delete(id);
 *   }}
 *   title="Delete Transaction"
 *   description="This action cannot be undone."
 *   impact={{
 *     title: "You will lose:",
 *     items: [
 *       `$${amount} transaction from ${date}`,
 *       `Description: "${description}"`,
 *     ]
 *   }}
 *   confirmLabel="Delete Transaction"
 *   variant="destructive"
 * />
 * ```
 */

import { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

export interface ConfirmDialogProps {
  /** Whether the dialog is open */
  open: boolean;

  /** Callback when open state changes */
  onOpenChange: (open: boolean) => void;

  /** Async callback when user confirms action */
  onConfirm: () => Promise<void> | void;

  /** Dialog title */
  title: string;

  /** Dialog description/explanation */
  description: string;

  /** Optional impact details (what will be lost/changed) */
  impact?: {
    /** Impact section title (e.g., "You will lose:") */
    title: string;
    /** List of specific impacts */
    items: (string | null | undefined)[];
  };

  /** Confirm button label (default: "Confirm") */
  confirmLabel?: string;

  /** Cancel button label (default: "Cancel") */
  cancelLabel?: string;

  /** Visual style variant (default: "default") */
  variant?: "destructive" | "default";

  /** Optional icon to display in header */
  icon?: React.ReactNode;

  /** Optional two-step confirmation for critical actions */
  requireTypedConfirmation?: {
    /** Text user must type to enable confirm button (e.g., "DELETE") */
    text: string;
    /** Input placeholder text */
    placeholder: string;
  };
}

export function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  impact,
  confirmLabel,
  cancelLabel,
  variant = "default",
  icon,
  requireTypedConfirmation,
}: ConfirmDialogProps) {
  const t = useTranslations("dialog");
  const [isLoading, setIsLoading] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  // Use prop if provided, otherwise use translation
  const effectiveConfirmLabel = confirmLabel || t("confirm");
  const effectiveCancelLabel = cancelLabel || t("cancel");

  // Filter out null/undefined impact items
  const validImpactItems = impact?.items.filter((item): item is string => Boolean(item)) ?? [];

  // Check if confirm button should be enabled
  const isConfirmEnabled = requireTypedConfirmation
    ? confirmText === requireTypedConfirmation.text && !isLoading
    : !isLoading;

  async function handleConfirm() {
    if (!isConfirmEnabled) return;

    try {
      setIsLoading(true);
      await onConfirm();

      // Reset state on success
      setConfirmText("");
      onOpenChange(false);
    } catch (error) {
      console.error("Confirmation action failed:", error);
      // Keep dialog open on error so user can see the error message
      // (Parent component should show toast error)
    } finally {
      setIsLoading(false);
    }
  }

  // Reset state when dialog closes
  function handleOpenChange(newOpen: boolean) {
    if (!newOpen) {
      setConfirmText("");
      setIsLoading(false);
    }
    onOpenChange(newOpen);
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {icon && (
              <span className={variant === "destructive" ? "text-red-600" : "text-teal-600"}>
                {icon}
              </span>
            )}
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-left">{description}</AlertDialogDescription>
        </AlertDialogHeader>

        {/* Impact Details */}
        {impact && validImpactItems.length > 0 && (
          <div className="my-4">
            <Alert
              className={
                variant === "destructive"
                  ? "border-red-200 bg-red-50/10"
                  : "border-teal-200 bg-teal-50/10"
              }
            >
              <AlertTriangle
                className={`h-4 w-4 ${variant === "destructive" ? "text-red-600" : "text-teal-600"}`}
              />
              <AlertDescription className="ml-2">
                <strong className="mb-2 block">{impact.title}</strong>
                <ul className="list-inside list-disc space-y-1 text-sm">
                  {validImpactItems.map((item, index) => (
                    <li key={index} className="text-gray-700">
                      {item}
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Two-Step Typed Confirmation */}
        {requireTypedConfirmation && (
          <div className="my-4">
            <Alert className="border-amber-200 bg-amber-50/10">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="ml-2">
                <strong className="mb-2 block">{t("finalConfirmation")}</strong>
                <p className="mb-2 text-sm text-gray-700">
                  {t("typeToConfirm", { text: requireTypedConfirmation.text })}
                </p>
                <Input
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                  placeholder={requireTypedConfirmation.placeholder}
                  className="mt-2"
                  disabled={isLoading}
                  autoComplete="off"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && isConfirmEnabled) {
                      handleConfirm();
                    }
                  }}
                />
              </AlertDescription>
            </Alert>
          </div>
        )}

        <AlertDialogFooter className="gap-2 sm:gap-2">
          {/* Cancel Button - Prominent */}
          <AlertDialogCancel disabled={isLoading} className="sm:order-1">
            {effectiveCancelLabel}
          </AlertDialogCancel>

          {/* Confirm Button */}
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleConfirm();
            }}
            disabled={!isConfirmEnabled}
            className={`sm:order-2 ${
              variant === "destructive"
                ? "bg-red-600 hover:bg-red-700 focus:ring-red-500"
                : "bg-teal-600 hover:bg-teal-700 focus:ring-teal-500"
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("processing")}
              </>
            ) : (
              effectiveConfirmLabel
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
