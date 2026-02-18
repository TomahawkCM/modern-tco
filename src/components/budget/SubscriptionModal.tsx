"use client";

/**
 * Subscription Modal Component
 * Add or edit subscriptions (manual management)
 */

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import type { Subscription, Category, BillingCycle, SubscriptionStatus } from "@/types/budget";
import { format, addDays, addWeeks, addMonths, addYears } from "date-fns";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { CategoryCombobox } from "./CategoryCombobox";
import {
  X,
  Loader2,
  Calendar,
  DollarSign,
  Bell,
  Link as LinkIcon,
  CreditCard,
  FileText,
  Tag,
} from "lucide-react";

interface SubscriptionModalProps {
  subscription: Subscription | null; // null for new subscription
  categories: Category[];
  onSave: (subscription: Subscription) => void;
  onClose: () => void;
  isSaving?: boolean;
}

const BILLING_CYCLES: { value: BillingCycle; label: string; days: number }[] = [
  { value: "weekly", label: "Weekly", days: 7 },
  { value: "bi-weekly", label: "Bi-weekly (every 2 weeks)", days: 14 },
  { value: "monthly", label: "Monthly", days: 30 },
  { value: "quarterly", label: "Quarterly (3 months)", days: 90 },
  { value: "annual", label: "Annual (12 months)", days: 365 },
];

const STATUS_OPTIONS: { value: SubscriptionStatus; label: string; color: string }[] = [
  { value: "active", label: "Active", color: "bg-green-100 text-green-800 border-green-200" },
  { value: "trial", label: "Trial", color: "bg-blue-100 text-blue-800 border-blue-200" },
  { value: "paused", label: "Paused", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-800 border-red-200" },
];

export function SubscriptionModal({
  subscription,
  categories,
  onSave,
  onClose,
  isSaving = false,
}: SubscriptionModalProps) {
  const tAria = useTranslations("aria");
  // Form state
  const [name, setName] = useState(subscription?.name || "");
  const [description, setDescription] = useState(subscription?.description || "");
  const [amount, setAmount] = useState(subscription?.amount?.toString() || "");
  const [currency, setCurrency] = useState(subscription?.currency || "CAD");
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(
    subscription?.billingCycle || "monthly"
  );
  const [startDate, setStartDate] = useState(
    subscription?.startDate
      ? format(new Date(subscription.startDate), "yyyy-MM-dd")
      : format(new Date(), "yyyy-MM-dd")
  );
  const [nextBillingDate, setNextBillingDate] = useState(
    subscription?.nextBillingDate
      ? format(new Date(subscription.nextBillingDate), "yyyy-MM-dd")
      : ""
  );
  const [trialEndDate, setTrialEndDate] = useState(
    subscription?.trialEndDate ? format(new Date(subscription.trialEndDate), "yyyy-MM-dd") : ""
  );
  const [status, setStatus] = useState<SubscriptionStatus>(subscription?.status || "active");
  const [autoRenew, setAutoRenew] = useState(subscription?.autoRenew ?? true);
  const [category, setCategory] = useState(subscription?.category || "");
  const [reminderEnabled, setReminderEnabled] = useState(subscription?.reminderEnabled ?? true);
  const [reminderDaysBefore, setReminderDaysBefore] = useState(
    subscription?.reminderDaysBefore?.toString() || "3"
  );
  const [paymentMethod, setPaymentMethod] = useState(subscription?.paymentMethod || "");
  const [websiteUrl, setWebsiteUrl] = useState(subscription?.websiteUrl || "");
  const [notes, setNotes] = useState(subscription?.notes || "");
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Focus trap for accessibility
  const modalRef = useFocusTrap(true);

  // Auto-calculate next billing date when start date or cycle changes
  useEffect(() => {
    if (startDate && !subscription) {
      const start = new Date(startDate);
      let next: Date;

      switch (billingCycle) {
        case "weekly":
          next = addWeeks(start, 1);
          break;
        case "bi-weekly":
          next = addWeeks(start, 2);
          break;
        case "monthly":
          next = addMonths(start, 1);
          break;
        case "quarterly":
          next = addMonths(start, 3);
          break;
        case "annual":
          next = addYears(start, 1);
          break;
        default:
          next = addMonths(start, 1);
      }

      setNextBillingDate(format(next, "yyyy-MM-dd"));
    }
  }, [startDate, billingCycle, subscription]);

  // Set trial status if trial end date is set
  useEffect(() => {
    if (trialEndDate && status === "active") {
      const trialEnd = new Date(trialEndDate);
      if (trialEnd > new Date()) {
        setStatus("trial");
      }
    }
  }, [trialEndDate, status]);

  // Handle Escape key
  useEffect(() => {
    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    document.addEventListener("keydown", handleEscapeKey);
    return () => document.removeEventListener("keydown", handleEscapeKey);
  }, [onClose]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    if (!name.trim()) {
      alert("Please enter a subscription name");
      return;
    }

    if (!nextBillingDate) {
      alert("Please enter the next billing date");
      return;
    }

    const newSubscription: Subscription = {
      id: subscription?.id || `sub_${Date.now()}`,
      name: name.trim(),
      description: description.trim() || undefined,
      amount: amountNum,
      currency,
      billingCycle,
      startDate: new Date(startDate),
      nextBillingDate: new Date(nextBillingDate),
      trialEndDate: trialEndDate ? new Date(trialEndDate) : undefined,
      cancelledDate: subscription?.cancelledDate,
      status,
      autoRenew,
      category: category || undefined,
      linkedTransactionIds: subscription?.linkedTransactionIds || [],
      merchantToken: subscription?.merchantToken,
      reminderDaysBefore: parseInt(reminderDaysBefore) || 3,
      reminderEnabled,
      paymentMethod: paymentMethod.trim() || undefined,
      websiteUrl: websiteUrl.trim() || undefined,
      notes: notes.trim() || undefined,
      createdAt: subscription?.createdAt || new Date(),
      updatedAt: new Date(),
      source: subscription?.source || "manual",
    };

    onSave(newSubscription);
  }

  const filteredCategories = categories.filter((c) => c.type === "expense");

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
      <div
        ref={modalRef}
        className="flex max-h-[90vh] w-full flex-col overflow-hidden rounded-t-2xl bg-card shadow-xl sm:mx-4 sm:max-w-2xl sm:rounded-lg"
      >
        {/* Header */}
        <div className="flex-shrink-0 border-b border-border bg-card p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground sm:text-2xl">
              {subscription ? "Edit Subscription" : "Add Subscription"}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label={tAria("closeModal")}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-5 p-4 sm:p-6">
            {/* Name */}
            <div>
              <label
                htmlFor="sub-name"
                className="mb-2 block text-base font-semibold text-foreground"
              >
                <Tag className="me-2 inline-block h-4 w-4" />
                Subscription Name *
              </label>
              <input
                id="sub-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Netflix, Spotify, Adobe CC"
                className="min-h-[48px] w-full rounded-lg border border-input bg-background px-4 text-base text-foreground focus:border-transparent focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>

            {/* Amount and Billing Cycle */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="sub-amount"
                  className="mb-2 block text-base font-semibold text-foreground"
                >
                  <DollarSign className="me-2 inline-block h-4 w-4" />
                  Amount *
                </label>
                <div className="relative">
                  <span className="absolute start-4 top-1/2 -translate-y-1/2 text-lg text-muted-foreground">
                    $
                  </span>
                  <input
                    id="sub-amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    inputMode="decimal"
                    className="min-h-[48px] w-full rounded-lg border border-input bg-background pe-4 ps-8 text-base text-foreground focus:border-transparent focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="sub-cycle"
                  className="mb-2 block text-base font-semibold text-foreground"
                >
                  <Calendar className="me-2 inline-block h-4 w-4" />
                  Billing Cycle *
                </label>
                <select
                  id="sub-cycle"
                  value={billingCycle}
                  onChange={(e) => setBillingCycle(e.target.value as BillingCycle)}
                  className="min-h-[48px] w-full rounded-lg border border-input bg-background px-4 text-base text-foreground focus:border-transparent focus:ring-2 focus:ring-teal-500"
                >
                  {BILLING_CYCLES.map((cycle) => (
                    <option key={cycle.value} value={cycle.value}>
                      {cycle.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="mb-2 block text-base font-semibold text-foreground">Status</label>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setStatus(opt.value)}
                    className={`rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
                      status === opt.value
                        ? `${opt.color} ring-2 ring-teal-500 ring-offset-2`
                        : "border-border bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="sub-start"
                  className="mb-2 block text-base font-semibold text-foreground"
                >
                  Start Date *
                </label>
                <input
                  id="sub-start"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="min-h-[48px] w-full rounded-lg border border-input bg-background px-4 text-base text-foreground focus:border-transparent focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="sub-next"
                  className="mb-2 block text-base font-semibold text-foreground"
                >
                  Next Billing Date *
                </label>
                <input
                  id="sub-next"
                  type="date"
                  value={nextBillingDate}
                  onChange={(e) => setNextBillingDate(e.target.value)}
                  className="min-h-[48px] w-full rounded-lg border border-input bg-background px-4 text-base text-foreground focus:border-transparent focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
            </div>

            {/* Trial End Date (for trial status) */}
            {(status === "trial" || trialEndDate) && (
              <div>
                <label
                  htmlFor="sub-trial"
                  className="mb-2 block text-base font-semibold text-foreground"
                >
                  Trial End Date
                </label>
                <input
                  id="sub-trial"
                  type="date"
                  value={trialEndDate}
                  onChange={(e) => setTrialEndDate(e.target.value)}
                  className="min-h-[48px] w-full rounded-lg border border-input bg-background px-4 text-base text-foreground focus:border-transparent focus:ring-2 focus:ring-teal-500"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Set when your free trial ends to track it
                </p>
              </div>
            )}

            {/* Category */}
            <div>
              <label className="mb-2 block text-base font-semibold text-foreground">Category</label>
              <CategoryCombobox
                options={[
                  { value: "", label: "None" },
                  ...filteredCategories.map((cat) => ({
                    value: cat.name,
                    label: cat.name,
                  })),
                ]}
                value={category}
                onChange={setCategory}
                placeholder="Select category..."
              />
            </div>

            {/* Auto-renew Toggle */}
            <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
              <div>
                <p className="font-medium text-foreground">Auto-renew</p>
                <p className="text-sm text-muted-foreground">
                  Will this subscription renew automatically?
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAutoRenew(!autoRenew)}
                className={`relative h-7 w-12 rounded-full transition-colors ${
                  autoRenew ? "bg-teal-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-md transition-transform ${
                    autoRenew ? "start-6" : "start-1"
                  }`}
                />
              </button>
            </div>

            {/* Reminders */}
            <div className="space-y-3 rounded-lg bg-muted/50 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-teal-500" />
                  <p className="font-medium text-foreground">Reminders</p>
                </div>
                <button
                  type="button"
                  onClick={() => setReminderEnabled(!reminderEnabled)}
                  className={`relative h-7 w-12 rounded-full transition-colors ${
                    reminderEnabled ? "bg-teal-500" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-md transition-transform ${
                      reminderEnabled ? "start-6" : "start-1"
                    }`}
                  />
                </button>
              </div>

              {reminderEnabled && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">Remind me</span>
                  <select
                    value={reminderDaysBefore}
                    onChange={(e) => setReminderDaysBefore(e.target.value)}
                    className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm text-foreground focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="1">1 day</option>
                    <option value="3">3 days</option>
                    <option value="5">5 days</option>
                    <option value="7">1 week</option>
                    <option value="14">2 weeks</option>
                  </select>
                  <span className="text-sm text-muted-foreground">before billing</span>
                </div>
              )}
            </div>

            {/* Advanced Options */}
            <div className="border-t border-border pt-4">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-base font-semibold text-teal-600 hover:text-teal-700"
              >
                <svg
                  className={`h-5 w-5 transition-transform ${showAdvanced ? "rotate-90" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
                Advanced Options
              </button>

              {showAdvanced && (
                <div className="mt-4 space-y-4 border-s-2 border-teal-200 ps-4">
                  {/* Description */}
                  <div>
                    <label
                      htmlFor="sub-desc"
                      className="mb-2 block text-sm font-medium text-foreground"
                    >
                      <FileText className="me-2 inline-block h-4 w-4" />
                      Description
                    </label>
                    <input
                      id="sub-desc"
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="e.g., Family plan, Pro tier"
                      className="min-h-[44px] w-full rounded-lg border border-input bg-background px-4 text-base text-foreground focus:border-transparent focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label
                      htmlFor="sub-payment"
                      className="mb-2 block text-sm font-medium text-foreground"
                    >
                      <CreditCard className="me-2 inline-block h-4 w-4" />
                      Payment Method
                    </label>
                    <input
                      id="sub-payment"
                      type="text"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      placeholder="e.g., Visa ending 1234"
                      className="min-h-[44px] w-full rounded-lg border border-input bg-background px-4 text-base text-foreground focus:border-transparent focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  {/* Website URL */}
                  <div>
                    <label
                      htmlFor="sub-url"
                      className="mb-2 block text-sm font-medium text-foreground"
                    >
                      <LinkIcon className="me-2 inline-block h-4 w-4" />
                      Website / Login URL
                    </label>
                    <input
                      id="sub-url"
                      type="url"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      placeholder="https://..."
                      className="min-h-[44px] w-full rounded-lg border border-input bg-background px-4 text-base text-foreground focus:border-transparent focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <label
                      htmlFor="sub-notes"
                      className="mb-2 block text-sm font-medium text-foreground"
                    >
                      Notes
                    </label>
                    <textarea
                      id="sub-notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any additional notes..."
                      rows={3}
                      className="w-full resize-none rounded-lg border border-input bg-background px-4 py-3 text-base text-foreground focus:border-transparent focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  {/* Currency */}
                  <div>
                    <label
                      htmlFor="sub-currency"
                      className="mb-2 block text-sm font-medium text-foreground"
                    >
                      Currency
                    </label>
                    <select
                      id="sub-currency"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="min-h-[44px] w-full rounded-lg border border-input bg-background px-4 text-base text-foreground focus:border-transparent focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="CAD">CAD - Canadian Dollar</option>
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-4 border-t border-border pt-6">
              <button
                type="button"
                onClick={onClose}
                className="min-h-[48px] flex-1 rounded-lg border-2 border-border px-6 py-3 text-base font-semibold text-foreground transition-colors hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-lg bg-teal-500 px-6 py-3 text-base font-semibold text-white shadow-md transition-colors hover:bg-teal-600 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving && <Loader2 className="h-5 w-5 animate-spin" />}
                {isSaving
                  ? subscription
                    ? "Saving..."
                    : "Adding..."
                  : subscription
                    ? "Save Changes"
                    : "Add Subscription"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
