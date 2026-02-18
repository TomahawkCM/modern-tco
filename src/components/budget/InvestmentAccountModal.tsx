"use client";

/**
 * Investment Account Modal Component
 * Add or edit investment accounts (RRSP, TFSA, Non-registered, Company shares)
 */

import { useState } from "react";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import type { InvestmentAccount } from "@/types/budget";

interface InvestmentAccountModalProps {
  account: InvestmentAccount | null;
  onSave: (account: Omit<InvestmentAccount, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  onClose: () => void;
}

const ACCOUNT_TYPES: Array<InvestmentAccount["type"]> = [
  "RRSP",
  "TFSA",
  "Non-registered",
  "Company shares",
];

export function InvestmentAccountModal({ account, onSave, onClose }: InvestmentAccountModalProps) {
  const t = useTranslations("investmentAccountModal");
  const [name, setName] = useState(account?.name || "");
  const [type, setType] = useState<InvestmentAccount["type"]>(account?.type || "TFSA");
  const [institution, setInstitution] = useState(account?.institution || "");
  const [accountNumber, setAccountNumber] = useState(account?.accountNumber || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim()) {
      alert(t("validation.nameRequired"));
      return;
    }

    setIsSubmitting(true);

    try {
      await onSave({
        name: name.trim(),
        type,
        institution: institution.trim() || undefined,
        accountNumber: accountNumber.trim() || undefined,
      });
      onClose();
    } catch (error) {
      console.error("Error saving account:", error);
      alert(t("errors.saveFailed"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 p-4 sm:items-center sm:p-4">
      {/* Phase 3.1.5: Mobile-optimized with bottom sheet on mobile, centered on desktop */}
      <div className="max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-xl sm:max-w-md sm:rounded-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900">
            {account ? t("title.edit") : t("title.add")}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 transition-colors hover:text-gray-600"
            aria-label={t("closeModal")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {/* Account Name */}
          <div>
            <label htmlFor="account-name" className="mb-2 block text-sm font-medium text-gray-700">
              {t("fields.name.label")} <span className="text-red-600">*</span>
            </label>
            <input
              id="account-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("fields.name.placeholder")}
              className="h-12 w-full rounded-lg border border-gray-300 px-4 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>

          {/* Account Type */}
          <div>
            <label htmlFor="account-type" className="mb-2 block text-sm font-medium text-gray-700">
              {t("fields.type.label")} <span className="text-red-600">*</span>
            </label>
            <select
              id="account-type"
              value={type}
              onChange={(e) => setType(e.target.value as InvestmentAccount["type"])}
              className="h-12 w-full rounded-lg border border-gray-300 px-4 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            >
              {ACCOUNT_TYPES.map((accountType) => (
                <option key={accountType} value={accountType}>
                  {accountType}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-gray-500">
              {type === "RRSP" && t("fields.type.descriptions.RRSP")}
              {type === "TFSA" && t("fields.type.descriptions.TFSA")}
              {type === "Non-registered" && t("fields.type.descriptions.Non-registered")}
              {type === "Company shares" && t("fields.type.descriptions.Company shares")}
            </p>
          </div>

          {/* Institution (Optional) */}
          <div>
            <label htmlFor="institution" className="mb-2 block text-sm font-medium text-gray-700">
              {t("fields.institution.label")}
            </label>
            <input
              id="institution"
              type="text"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              placeholder={t("fields.institution.placeholder")}
              className="h-12 w-full rounded-lg border border-gray-300 px-4 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Account Number (Optional) */}
          <div>
            <label
              htmlFor="account-number"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              {t("fields.accountNumber.label")}
            </label>
            <input
              id="account-number"
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder={t("fields.accountNumber.placeholder")}
              className="h-12 w-full rounded-lg border border-gray-300 px-4 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
              disabled={isSubmitting}
            >
              {t("buttons.cancel")}
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-teal-500 px-4 py-2 text-white transition-colors hover:bg-teal-600 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? t("buttons.saving")
                : account
                  ? t("buttons.update")
                  : t("buttons.create")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
