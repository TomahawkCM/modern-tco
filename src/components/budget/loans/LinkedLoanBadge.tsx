/**
 * Linked Loan Badge Component
 * Shows when a transaction is linked to a loan payment
 */

"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link as LinkIcon, ExternalLink, Unlink, Loader2 } from "lucide-react";
import {
  getLinkedLoanForTransaction,
  type LinkedLoanInfo,
} from "@/lib/loans/transaction-link-operations";
import { unlinkPayment } from "@/lib/loans/loan-db";
import Link from "next/link";

interface LinkedLoanBadgeProps {
  transactionId: string;
  onUnlink?: () => void;
  showUnlinkButton?: boolean;
  size?: "sm" | "md";
}

export function LinkedLoanBadge({
  transactionId,
  onUnlink,
  showUnlinkButton = true,
  size = "sm",
}: LinkedLoanBadgeProps) {
  const t = useTranslations("linkedLoan");
  const [linkedInfo, setLinkedInfo] = useState<LinkedLoanInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUnlinking, setIsUnlinking] = useState(false);

  useEffect(() => {
    async function loadLinkedInfo() {
      setIsLoading(true);
      try {
        const info = await getLinkedLoanForTransaction(transactionId);
        setLinkedInfo(info);
      } catch (error) {
        console.error("Error loading linked loan info:", error);
        setLinkedInfo(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadLinkedInfo();
  }, [transactionId]);

  async function handleUnlink() {
    if (!linkedInfo || isUnlinking) return;

    if (!confirm(t("unlinkConfirm"))) return;

    setIsUnlinking(true);
    try {
      await unlinkPayment(linkedInfo.payment.id, {
        deletePayment: false,
        resetTransactionCategory: true,
      });
      setLinkedInfo(null);
      onUnlink?.();
    } catch (error) {
      console.error("Error unlinking transaction:", error);
      alert(t("unlinkFailed"));
    } finally {
      setIsUnlinking(false);
    }
  }

  if (isLoading) {
    return (
      <span className="inline-flex items-center gap-1 rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
        <Loader2 className="h-3 w-3 animate-spin" />
      </span>
    );
  }

  if (!linkedInfo) {
    return null;
  }

  const sizeClasses = size === "sm" ? "text-xs px-2 py-0.5 gap-1" : "text-sm px-3 py-1 gap-2";

  const iconSize = size === "sm" ? "w-3 h-3" : "w-4 h-4";

  return (
    <span
      className={`inline-flex items-center rounded-full bg-teal-100 font-medium text-teal-800 ${sizeClasses}`}
    >
      <LinkIcon className={iconSize} />
      <span>{t("loanPrefix", { name: linkedInfo.loan.name })}</span>

      {/* View Loan Link */}
      <Link
        href={`/budget-app/loans/${linkedInfo.loan.id}`}
        className="text-teal-600 transition-colors hover:text-teal-800"
        title={t("viewLoanDetails")}
        onClick={(e) => e.stopPropagation()}
      >
        <ExternalLink className={iconSize} />
      </Link>

      {/* Unlink Button */}
      {showUnlinkButton && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleUnlink();
          }}
          disabled={isUnlinking}
          className="text-teal-600 transition-colors hover:text-red-600 disabled:opacity-50"
          title={t("unlinkFromLoan")}
        >
          {isUnlinking ? (
            <Loader2 className={`${iconSize} animate-spin`} />
          ) : (
            <Unlink className={iconSize} />
          )}
        </button>
      )}
    </span>
  );
}

/**
 * Inline version for use in table rows
 */
interface LinkedLoanBadgeInlineProps {
  loanName: string;
  loanId: string;
  paymentId: string;
  onUnlink?: () => void;
}

export function LinkedLoanBadgeInline({
  loanName,
  loanId,
  paymentId,
  onUnlink,
}: LinkedLoanBadgeInlineProps) {
  const t = useTranslations("linkedLoan");
  const [isUnlinking, setIsUnlinking] = useState(false);

  async function handleUnlink() {
    if (isUnlinking) return;

    if (!confirm(t("unlinkConfirm"))) return;

    setIsUnlinking(true);
    try {
      await unlinkPayment(paymentId, {
        deletePayment: false,
        resetTransactionCategory: true,
      });
      onUnlink?.();
    } catch (error) {
      console.error("Error unlinking transaction:", error);
      alert(t("unlinkFailed"));
    } finally {
      setIsUnlinking(false);
    }
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-teal-100 px-2 py-0.5 text-xs font-medium text-teal-800">
      <LinkIcon className="h-3 w-3" />
      <span>{loanName}</span>
      <Link
        href={`/budget-app/loans/${loanId}`}
        className="text-teal-600 hover:text-teal-800"
        title={t("viewLoan")}
        onClick={(e) => e.stopPropagation()}
      >
        <ExternalLink className="h-3 w-3" />
      </Link>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleUnlink();
        }}
        disabled={isUnlinking}
        className="text-teal-600 hover:text-red-600 disabled:opacity-50"
        title={t("unlink")}
      >
        {isUnlinking ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Unlink className="h-3 w-3" />
        )}
      </button>
    </span>
  );
}
