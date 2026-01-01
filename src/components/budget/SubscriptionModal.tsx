'use client';

/**
 * Subscription Modal Component
 * Add or edit subscriptions (manual management)
 */

import { useState, useEffect } from 'react';
import type { Subscription, Category, BillingCycle, SubscriptionStatus } from '@/types/budget';
import { format, addDays, addWeeks, addMonths, addYears } from 'date-fns';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { CategoryCombobox } from './CategoryCombobox';
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
} from 'lucide-react';

interface SubscriptionModalProps {
  subscription: Subscription | null; // null for new subscription
  categories: Category[];
  onSave: (subscription: Subscription) => void;
  onClose: () => void;
  isSaving?: boolean;
}

const BILLING_CYCLES: { value: BillingCycle; label: string; days: number }[] = [
  { value: 'weekly', label: 'Weekly', days: 7 },
  { value: 'bi-weekly', label: 'Bi-weekly (every 2 weeks)', days: 14 },
  { value: 'monthly', label: 'Monthly', days: 30 },
  { value: 'quarterly', label: 'Quarterly (3 months)', days: 90 },
  { value: 'annual', label: 'Annual (12 months)', days: 365 },
];

const STATUS_OPTIONS: { value: SubscriptionStatus; label: string; color: string }[] = [
  { value: 'active', label: 'Active', color: 'bg-green-100 text-green-800 border-green-200' },
  { value: 'trial', label: 'Trial', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { value: 'paused', label: 'Paused', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800 border-red-200' },
];

export function SubscriptionModal({
  subscription,
  categories,
  onSave,
  onClose,
  isSaving = false,
}: SubscriptionModalProps) {
  // Form state
  const [name, setName] = useState(subscription?.name || '');
  const [description, setDescription] = useState(subscription?.description || '');
  const [amount, setAmount] = useState(subscription?.amount?.toString() || '');
  const [currency, setCurrency] = useState(subscription?.currency || 'CAD');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(subscription?.billingCycle || 'monthly');
  const [startDate, setStartDate] = useState(
    subscription?.startDate ? format(new Date(subscription.startDate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')
  );
  const [nextBillingDate, setNextBillingDate] = useState(
    subscription?.nextBillingDate ? format(new Date(subscription.nextBillingDate), 'yyyy-MM-dd') : ''
  );
  const [trialEndDate, setTrialEndDate] = useState(
    subscription?.trialEndDate ? format(new Date(subscription.trialEndDate), 'yyyy-MM-dd') : ''
  );
  const [status, setStatus] = useState<SubscriptionStatus>(subscription?.status || 'active');
  const [autoRenew, setAutoRenew] = useState(subscription?.autoRenew ?? true);
  const [category, setCategory] = useState(subscription?.category || '');
  const [reminderEnabled, setReminderEnabled] = useState(subscription?.reminderEnabled ?? true);
  const [reminderDaysBefore, setReminderDaysBefore] = useState(subscription?.reminderDaysBefore?.toString() || '3');
  const [paymentMethod, setPaymentMethod] = useState(subscription?.paymentMethod || '');
  const [websiteUrl, setWebsiteUrl] = useState(subscription?.websiteUrl || '');
  const [notes, setNotes] = useState(subscription?.notes || '');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Focus trap for accessibility
  const modalRef = useFocusTrap(true);

  // Auto-calculate next billing date when start date or cycle changes
  useEffect(() => {
    if (startDate && !subscription) {
      const start = new Date(startDate);
      let next: Date;
      
      switch (billingCycle) {
        case 'weekly':
          next = addWeeks(start, 1);
          break;
        case 'bi-weekly':
          next = addWeeks(start, 2);
          break;
        case 'monthly':
          next = addMonths(start, 1);
          break;
        case 'quarterly':
          next = addMonths(start, 3);
          break;
        case 'annual':
          next = addYears(start, 1);
          break;
        default:
          next = addMonths(start, 1);
      }
      
      setNextBillingDate(format(next, 'yyyy-MM-dd'));
    }
  }, [startDate, billingCycle, subscription]);

  // Set trial status if trial end date is set
  useEffect(() => {
    if (trialEndDate && status === 'active') {
      const trialEnd = new Date(trialEndDate);
      if (trialEnd > new Date()) {
        setStatus('trial');
      }
    }
  }, [trialEndDate, status]);

  // Handle Escape key
  useEffect(() => {
    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }
    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [onClose]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (!name.trim()) {
      alert('Please enter a subscription name');
      return;
    }

    if (!nextBillingDate) {
      alert('Please enter the next billing date');
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
      source: subscription?.source || 'manual',
    };

    onSave(newSubscription);
  }

  const filteredCategories = categories.filter(c => c.type === 'expense');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-card rounded-t-2xl sm:rounded-lg shadow-xl w-full sm:max-w-2xl sm:mx-4 max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-border flex-shrink-0 bg-card">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              {subscription ? 'Edit Subscription' : 'Add Subscription'}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="overflow-y-auto flex-1">
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5">
            {/* Name */}
            <div>
              <label htmlFor="sub-name" className="block text-base font-semibold text-foreground mb-2">
                <Tag className="w-4 h-4 inline-block me-2" />
                Subscription Name *
              </label>
              <input
                id="sub-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Netflix, Spotify, Adobe CC"
                className="w-full min-h-[48px] px-4 text-base border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                required
              />
            </div>

            {/* Amount and Billing Cycle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="sub-amount" className="block text-base font-semibold text-foreground mb-2">
                  <DollarSign className="w-4 h-4 inline-block me-2" />
                  Amount *
                </label>
                <div className="relative">
                  <span className="absolute start-4 top-1/2 -translate-y-1/2 text-lg text-muted-foreground">$</span>
                  <input
                    id="sub-amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    inputMode="decimal"
                    className="w-full min-h-[48px] ps-8 pe-4 text-base border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="sub-cycle" className="block text-base font-semibold text-foreground mb-2">
                  <Calendar className="w-4 h-4 inline-block me-2" />
                  Billing Cycle *
                </label>
                <select
                  id="sub-cycle"
                  value={billingCycle}
                  onChange={(e) => setBillingCycle(e.target.value as BillingCycle)}
                  className="w-full min-h-[48px] px-4 text-base border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
              <label className="block text-base font-semibold text-foreground mb-2">
                Status
              </label>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setStatus(opt.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                      status === opt.value
                        ? `${opt.color} ring-2 ring-offset-2 ring-teal-500`
                        : 'bg-muted text-muted-foreground border-border hover:bg-muted/80'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="sub-start" className="block text-base font-semibold text-foreground mb-2">
                  Start Date *
                </label>
                <input
                  id="sub-start"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full min-h-[48px] px-4 text-base border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="sub-next" className="block text-base font-semibold text-foreground mb-2">
                  Next Billing Date *
                </label>
                <input
                  id="sub-next"
                  type="date"
                  value={nextBillingDate}
                  onChange={(e) => setNextBillingDate(e.target.value)}
                  className="w-full min-h-[48px] px-4 text-base border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Trial End Date (for trial status) */}
            {(status === 'trial' || trialEndDate) && (
              <div>
                <label htmlFor="sub-trial" className="block text-base font-semibold text-foreground mb-2">
                  Trial End Date
                </label>
                <input
                  id="sub-trial"
                  type="date"
                  value={trialEndDate}
                  onChange={(e) => setTrialEndDate(e.target.value)}
                  className="w-full min-h-[48px] px-4 text-base border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Set when your free trial ends to track it
                </p>
              </div>
            )}

            {/* Category */}
            <div>
              <label className="block text-base font-semibold text-foreground mb-2">
                Category
              </label>
              <CategoryCombobox
                options={[
                  { value: '', label: 'None' },
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
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="font-medium text-foreground">Auto-renew</p>
                <p className="text-sm text-muted-foreground">
                  Will this subscription renew automatically?
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAutoRenew(!autoRenew)}
                className={`relative w-12 h-7 rounded-full transition-colors ${
                  autoRenew ? 'bg-teal-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                    autoRenew ? 'start-6' : 'start-1'
                  }`}
                />
              </button>
            </div>

            {/* Reminders */}
            <div className="p-4 bg-muted/50 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-teal-500" />
                  <p className="font-medium text-foreground">Reminders</p>
                </div>
                <button
                  type="button"
                  onClick={() => setReminderEnabled(!reminderEnabled)}
                  className={`relative w-12 h-7 rounded-full transition-colors ${
                    reminderEnabled ? 'bg-teal-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                      reminderEnabled ? 'start-6' : 'start-1'
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
                    className="px-3 py-1.5 text-sm border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-teal-500"
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
                  className={`w-5 h-5 transition-transform ${showAdvanced ? 'rotate-90' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                Advanced Options
              </button>

              {showAdvanced && (
                <div className="mt-4 space-y-4 ps-4 border-s-2 border-teal-200">
                  {/* Description */}
                  <div>
                    <label htmlFor="sub-desc" className="block text-sm font-medium text-foreground mb-2">
                      <FileText className="w-4 h-4 inline-block me-2" />
                      Description
                    </label>
                    <input
                      id="sub-desc"
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="e.g., Family plan, Pro tier"
                      className="w-full min-h-[44px] px-4 text-base border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label htmlFor="sub-payment" className="block text-sm font-medium text-foreground mb-2">
                      <CreditCard className="w-4 h-4 inline-block me-2" />
                      Payment Method
                    </label>
                    <input
                      id="sub-payment"
                      type="text"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      placeholder="e.g., Visa ending 1234"
                      className="w-full min-h-[44px] px-4 text-base border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>

                  {/* Website URL */}
                  <div>
                    <label htmlFor="sub-url" className="block text-sm font-medium text-foreground mb-2">
                      <LinkIcon className="w-4 h-4 inline-block me-2" />
                      Website / Login URL
                    </label>
                    <input
                      id="sub-url"
                      type="url"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full min-h-[44px] px-4 text-base border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <label htmlFor="sub-notes" className="block text-sm font-medium text-foreground mb-2">
                      Notes
                    </label>
                    <textarea
                      id="sub-notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any additional notes..."
                      rows={3}
                      className="w-full px-4 py-3 text-base border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                    />
                  </div>

                  {/* Currency */}
                  <div>
                    <label htmlFor="sub-currency" className="block text-sm font-medium text-foreground mb-2">
                      Currency
                    </label>
                    <select
                      id="sub-currency"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full min-h-[44px] px-4 text-base border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
            <div className="flex gap-4 pt-6 border-t border-border">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 text-base border-2 border-border text-foreground rounded-lg hover:bg-muted transition-colors font-semibold min-h-[48px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 px-6 py-3 text-base bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-semibold shadow-md hover:shadow-lg min-h-[48px] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSaving && <Loader2 className="w-5 h-5 animate-spin" />}
                {isSaving
                  ? (subscription ? 'Saving...' : 'Adding...')
                  : (subscription ? 'Save Changes' : 'Add Subscription')
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

