/**
 * Validation Warnings Modal
 * Displays transaction validation issues with review/fix options
 *
 * Features:
 * - Categorized issues (Critical, Warning, Info)
 * - Transaction preview for each issue
 * - Review options (Ignore, Remove, Continue)
 * - Summary statistics
 * - Non-blocking (user decides whether to proceed)
 */

'use client';

import { useState } from 'react';
import { X, AlertTriangle, AlertCircle, Info, CheckCircle, Trash2 } from 'lucide-react';
import type { ValidationResult, ValidationIssue } from '@/lib/ai/smart-transaction-validator';
import type { ParsedTransaction } from '@/types/budget';

// ============================================================================
// Types
// ============================================================================

export interface ValidationWarningsModalProps {
  isOpen: boolean;
  onClose: () => void;
  validationResult: ValidationResult | null;
  onProceed: (transactionsToRemove: number[]) => void; // Indices of transactions to remove
  onCancel: () => void;
}

// ============================================================================
// Component
// ============================================================================

export default function ValidationWarningsModal({
  isOpen,
  onClose,
  validationResult,
  onProceed,
  onCancel,
}: ValidationWarningsModalProps) {
  const [transactionsToRemove, setTransactionsToRemove] = useState<Set<number>>(new Set());
  const [expandedIssue, setExpandedIssue] = useState<number | null>(null);

  if (!isOpen || !validationResult) return null;

  const { criticalCount, warningCount, infoCount, issues, aiAnalysis } = validationResult;

  const toggleRemove = (index: number) => {
    const newSet = new Set(transactionsToRemove);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    setTransactionsToRemove(newSet);
  };

  const handleProceed = () => {
    onProceed(Array.from(transactionsToRemove));
    setTransactionsToRemove(new Set());
  };

  const handleCancel = () => {
    setTransactionsToRemove(new Set());
    onCancel();
  };

  const getSeverityIcon = (severity: 'critical' | 'warning' | 'info') => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getSeverityColor = (severity: 'critical' | 'warning' | 'info') => {
    switch (severity) {
      case 'critical':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'info':
        return 'border-blue-200 bg-blue-50';
    }
  };

  const getSeverityBadge = (severity: 'critical' | 'warning' | 'info') => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'info':
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 p-6 bg-gradient-to-r from-yellow-50 to-orange-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Transaction Validation Results
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  We found {issues.length} {issues.length === 1 ? 'issue' : 'issues'} that need
                  your attention
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4">
            {criticalCount > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-red-600">{criticalCount}</div>
                <div className="text-sm text-red-700 mt-1">Critical Issues</div>
              </div>
            )}
            {warningCount > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-yellow-600">{warningCount}</div>
                <div className="text-sm text-yellow-700 mt-1">Warnings</div>
              </div>
            )}
            {infoCount > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-blue-600">{infoCount}</div>
                <div className="text-sm text-blue-700 mt-1">Informational</div>
              </div>
            )}
          </div>

          {/* AI Analysis */}
          {aiAnalysis && (
            <div className="bg-purple-50 border-s-4 border-purple-400 p-4 text-sm text-purple-800">
              <strong>AI Analysis:</strong> {aiAnalysis}
            </div>
          )}

          {/* Issues List */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Issues Detected</h3>
            <div className="space-y-3">
              {issues.map((issue, index) => {
                const isExpanded = expandedIssue === index;
                const isMarkedForRemoval = transactionsToRemove.has(issue.transactionIndex);

                return (
                  <div
                    key={index}
                    className={`border rounded-lg overflow-hidden transition-colors ${
                      isMarkedForRemoval ? 'opacity-50 border-gray-400' : getSeverityColor(issue.severity)
                    }`}
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          {getSeverityIcon(issue.severity)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-gray-900">{issue.title}</h4>
                              <span
                                className={`px-2 py-0.5 text-xs font-semibold rounded ${getSeverityBadge(
                                  issue.severity
                                )}`}
                              >
                                {issue.severity.toUpperCase()}
                              </span>
                              <span className="text-xs text-gray-600">
                                Transaction #{issue.transactionIndex + 1}
                              </span>
                              {issue.confidence && (
                                <span className="text-xs text-gray-600">
                                  {(issue.confidence * 100).toFixed(0)}% confidence
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-700">{issue.message}</p>
                            {issue.suggestion && (
                              <p className="text-sm text-gray-600 mt-2">
                                <strong>Suggestion:</strong> {issue.suggestion}
                              </p>
                            )}

                            {/* Transaction Preview */}
                            <button
                              onClick={() => setExpandedIssue(isExpanded ? null : index)}
                              className="text-xs text-teal-600 hover:text-teal-700 mt-2"
                            >
                              {isExpanded ? 'Hide' : 'View'} Transaction Details
                            </button>

                            {isExpanded && issue.transaction && (
                              <div className="mt-3 bg-white border border-gray-200 rounded p-3 text-sm">
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <strong>Date:</strong>{' '}
                                    {issue.transaction.date.toLocaleDateString()}
                                  </div>
                                  <div>
                                    <strong>Amount:</strong> ${issue.transaction.amount.toFixed(2)}
                                  </div>
                                  <div className="col-span-2">
                                    <strong>Description:</strong> {issue.transaction.description}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => toggleRemove(issue.transactionIndex)}
                          className={`ms-4 px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                            isMarkedForRemoval
                              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              : 'bg-red-100 text-red-700 hover:bg-red-200'
                          }`}
                        >
                          {isMarkedForRemoval ? (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              Marked
                            </>
                          ) : (
                            <>
                              <Trash2 className="w-4 h-4" />
                              Remove
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Removal Summary */}
          {transactionsToRemove.size > 0 && (
            <div className="bg-orange-50 border-s-4 border-orange-400 p-4 text-sm text-orange-800">
              <strong>Note:</strong> {transactionsToRemove.size}{' '}
              {transactionsToRemove.size === 1 ? 'transaction' : 'transactions'} will be removed
              from the import if you proceed.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50 flex justify-between">
          <button
            onClick={handleCancel}
            className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancel Import
          </button>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setTransactionsToRemove(new Set());
                onProceed([]);
              }}
              className="px-6 py-2 border-2 border-teal-600 text-teal-600 rounded-lg hover:bg-teal-50 transition-colors"
            >
              Ignore All & Continue
            </button>
            <button
              onClick={handleProceed}
              className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              {transactionsToRemove.size > 0
                ? `Remove ${transactionsToRemove.size} & Continue`
                : 'Continue with All'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
