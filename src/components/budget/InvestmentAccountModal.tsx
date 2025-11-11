'use client';

/**
 * Investment Account Modal Component
 * Add or edit investment accounts (RRSP, TFSA, Non-registered, Company shares)
 */

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { InvestmentAccount } from '@/types/budget';

interface InvestmentAccountModalProps {
  account: InvestmentAccount | null;
  onSave: (account: Omit<InvestmentAccount, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onClose: () => void;
}

const ACCOUNT_TYPES: Array<InvestmentAccount['type']> = [
  'RRSP',
  'TFSA',
  'Non-registered',
  'Company shares'
];

export function InvestmentAccountModal({
  account,
  onSave,
  onClose,
}: InvestmentAccountModalProps) {
  const [name, setName] = useState(account?.name || '');
  const [type, setType] = useState<InvestmentAccount['type']>(account?.type || 'TFSA');
  const [institution, setInstitution] = useState(account?.institution || '');
  const [accountNumber, setAccountNumber] = useState(account?.accountNumber || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim()) {
      alert('Please enter an account name');
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
      console.error('Error saving account:', error);
      alert('Failed to save account');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4 sm:p-4 p-0">
      {/* Phase 3.1.5: Mobile-optimized with bottom sheet on mobile, centered on desktop */}
      <div className="bg-white rounded-t-2xl sm:rounded-lg shadow-xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {account ? 'Edit Investment Account' : 'Add Investment Account'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Account Name */}
          <div>
            <label htmlFor="account-name" className="block text-sm font-medium text-gray-700 mb-2">
              Account Name <span className="text-red-600">*</span>
            </label>
            <input
              id="account-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., My RRSP, TFSA Savings, Company Stock"
              className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              required
            />
          </div>

          {/* Account Type */}
          <div>
            <label htmlFor="account-type" className="block text-sm font-medium text-gray-700 mb-2">
              Account Type <span className="text-red-600">*</span>
            </label>
            <select
              id="account-type"
              value={type}
              onChange={(e) => setType(e.target.value as InvestmentAccount['type'])}
              className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              required
            >
              {ACCOUNT_TYPES.map((accountType) => (
                <option key={accountType} value={accountType}>
                  {accountType}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-gray-500">
              {type === 'RRSP' && 'Registered Retirement Savings Plan - Tax-deferred growth'}
              {type === 'TFSA' && 'Tax-Free Savings Account - Tax-free growth and withdrawals'}
              {type === 'Non-registered' && 'Taxable investment account'}
              {type === 'Company shares' && 'Employee stock purchase or stock options'}
            </p>
          </div>

          {/* Institution (Optional) */}
          <div>
            <label htmlFor="institution" className="block text-sm font-medium text-gray-700 mb-2">
              Financial Institution (Optional)
            </label>
            <input
              id="institution"
              type="text"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              placeholder="e.g., Questrade, Wealthsimple, TD Direct"
              className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          {/* Account Number (Optional) */}
          <div>
            <label htmlFor="account-number" className="block text-sm font-medium text-gray-700 mb-2">
              Account Number (Optional)
            </label>
            <input
              id="account-number"
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="e.g., Last 4 digits: 1234"
              className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : account ? 'Update Account' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

