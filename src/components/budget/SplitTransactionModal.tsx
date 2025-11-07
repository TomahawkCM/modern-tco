'use client';

/**
 * Split Transaction Modal Component (Phase 6)
 * Task 6.1.1 & 6.1.2: Design and implement split transaction modal
 * 
 * Allows splitting a transaction across multiple categories
 */

import { useState, useEffect } from 'react';
import { X, Plus, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import type { Transaction, Category } from '@/types/budget';

interface Split {
  id: string;
  category: string;
  subcategory: string;
  amount: number;
  notes: string;
}

interface SplitTransactionModalProps {
  transaction: Transaction;
  categories: Category[];
  onSave: (splits: Split[]) => Promise<void>;
  onClose: () => void;
}

export function SplitTransactionModal({
  transaction,
  categories,
  onSave,
  onClose,
}: SplitTransactionModalProps) {
  const originalAmount = Math.abs(transaction.amount);
  
  // Initialize with 2 splits (50/50)
  const [splits, setSplits] = useState<Split[]>([
    {
      id: `split_${Date.now()}_1`,
      category: '',
      subcategory: '',
      amount: originalAmount / 2,
      notes: '',
    },
    {
      id: `split_${Date.now()}_2`,
      category: '',
      subcategory: '',
      amount: originalAmount / 2,
      notes: '',
    },
  ]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate total and validation
  const total = splits.reduce((sum, split) => sum + (split.amount || 0), 0);
  const isValid = Math.abs(total - originalAmount) < 0.01; // Allow 1 cent rounding error
  const difference = total - originalAmount;

  function addSplit() {
    if (splits.length >= 5) {
      alert('Maximum 5 splits allowed');
      return;
    }

    const remaining = originalAmount - total;
    const newSplit: Split = {
      id: `split_${Date.now()}_${splits.length + 1}`,
      category: '',
      subcategory: '',
      amount: remaining > 0 ? remaining : 0,
      notes: '',
    };
    setSplits([...splits, newSplit]);
  }

  function removeSplit(id: string) {
    if (splits.length <= 2) {
      alert('Minimum 2 splits required');
      return;
    }
    setSplits(splits.filter(split => split.id !== id));
  }

  function updateSplit(id: string, field: keyof Split, value: string | number) {
    setSplits(splits.map(split => 
      split.id === id ? { ...split, [field]: value } : split
    ));
  }

  function handleCategoryChange(id: string, categoryName: string) {
    const category = categories.find(c => c.name === categoryName);
    setSplits(splits.map(split =>
      split.id === id ? { 
        ...split, 
        category: categoryName,
        subcategory: '' // Reset subcategory when category changes
      } : split
    ));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validation
    if (!isValid) {
      alert('Split amounts must equal the original transaction amount');
      return;
    }

    // Check all splits have categories
    const missingCategory = splits.some(split => !split.category);
    if (missingCategory) {
      alert('All splits must have a category');
      return;
    }

    setIsSubmitting(true);

    try {
      await onSave(splits);
      onClose();
    } catch (error) {
      console.error('Error saving split transaction:', error);
      alert('Failed to save split transaction');
    } finally {
      setIsSubmitting(false);
    }
  }

  function distributeEvenly() {
    const amountPerSplit = originalAmount / splits.length;
    setSplits(splits.map(split => ({
      ...split,
      amount: amountPerSplit,
    })));
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Split Transaction</h2>
            <p className="text-sm text-gray-600 mt-2">
              {transaction.description} • ${originalAmount.toFixed(2)}
            </p>
          </div>
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
          {/* Original Transaction Info */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Original Amount:</span>
                <span className="ml-2 font-semibold text-gray-900">
                  ${originalAmount.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Date:</span>
                <span className="ml-2 font-semibold text-gray-900">
                  {new Date(transaction.date).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Splits */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">
                Splits ({splits.length}/5)
              </h3>
              <button
                type="button"
                onClick={distributeEvenly}
                className="text-xs text-teal-600 hover:text-teal-700 underline"
              >
                Distribute Evenly
              </button>
            </div>

            {splits.map((split, index) => {
              const selectedCategory = categories.find(c => c.name === split.category);
              
              return (
                <div key={split.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </div>
                    
                    <div className="flex-1 space-y-4">
                      {/* Category and Amount Row */}
                      <div className="grid grid-cols-2 gap-4">
                        {/* Category */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-2">
                            Category <span className="text-red-600">*</span>
                          </label>
                          <select
                            value={split.category}
                            onChange={(e) => handleCategoryChange(split.id, e.target.value)}
                            className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            required
                          >
                            <option value="">Select category...</option>
                            {categories.map((cat) => (
                              <option key={cat.id} value={cat.name}>
                                {cat.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Amount */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-2">
                            Amount <span className="text-red-600">*</span>
                          </label>
                          <div className="relative">
                            <span className="absolute left-4 top-2 text-gray-500 text-sm">$</span>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              max={originalAmount}
                              value={split.amount || ''}
                              onChange={(e) => updateSplit(split.id, 'amount', parseFloat(e.target.value) || 0)}
                              className="w-full pl-8 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      {/* Subcategory */}
                      {selectedCategory && selectedCategory.subcategories.length > 0 && (
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-2">
                            Subcategory
                          </label>
                          <select
                            value={split.subcategory}
                            onChange={(e) => updateSplit(split.id, 'subcategory', e.target.value)}
                            className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          >
                            <option value="">None</option>
                            {selectedCategory.subcategories.map((subcat) => (
                              <option key={subcat} value={subcat}>
                                {subcat}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Notes */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2">
                          Notes (Optional)
                        </label>
                        <input
                          type="text"
                          value={split.notes}
                          onChange={(e) => updateSplit(split.id, 'notes', e.target.value)}
                          placeholder="e.g., Business expense, Personal use"
                          className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* Remove Button */}
                    {splits.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeSplit(split.id)}
                        className="flex-shrink-0 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove this split"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Add Split Button */}
            {splits.length < 5 && (
              <button
                type="button"
                onClick={addSplit}
                className="w-full py-2 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-teal-500 hover:text-teal-600 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Split ({splits.length}/5)
              </button>
            )}
          </div>

          {/* Validation Summary */}
          <div className={`rounded-lg p-4 border-2 ${
            isValid 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-start gap-4">
              {isValid ? (
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-semibold ${isValid ? 'text-green-900' : 'text-red-900'}`}>
                    Total: ${total.toFixed(2)}
                  </span>
                  <span className={`text-sm ${isValid ? 'text-green-700' : 'text-red-700'}`}>
                    {isValid ? (
                      '✓ Matches original'
                    ) : (
                      <>
                        {difference > 0 ? 'Over' : 'Under'} by ${Math.abs(difference).toFixed(2)}
                      </>
                    )}
                  </span>
                </div>
                <p className={`text-sm ${isValid ? 'text-green-700' : 'text-red-700'}`}>
                  {isValid 
                    ? 'Split amounts match the original transaction. Ready to save!'
                    : 'Adjust split amounts to match the original transaction amount.'
                  }
                </p>
              </div>
            </div>
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
              disabled={!isValid || isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Split'}
            </button>
          </div>
        </form>

        {/* Help Text */}
        <div className="px-6 pb-6">
          <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 text-sm text-teal-800">
            <p className="font-medium mb-2">How to split transactions:</p>
            <ul className="list-disc list-inside space-y-2 text-xs">
              <li>Enter the amount for each category (must total ${originalAmount.toFixed(2)})</li>
              <li>Use "Distribute Evenly" to split equally across all categories</li>
              <li>Add up to 5 splits per transaction</li>
              <li>The original transaction will be hidden and replaced with split items</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

