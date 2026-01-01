/**
 * Error Recovery Modal
 * Interactive UI for recovering from import failures
 *
 * Features:
 * - Clear error explanation
 * - Prioritized recovery suggestions
 * - One-click auto-fix buttons
 * - Manual action guidance
 * - Technical details for advanced users
 */

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { X, AlertTriangle, Zap, ChevronDown, ChevronRight, RefreshCw } from 'lucide-react';
import type { ErrorAnalysisResult, RecoverySuggestion } from '@/lib/ai/smart-error-recovery';

// ============================================================================
// Types
// ============================================================================

export interface ErrorRecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  errorAnalysis: ErrorAnalysisResult | null;
  onAutoFix: (suggestion: RecoverySuggestion) => void;
  onManualAction: (suggestion: RecoverySuggestion) => void;
  isFixing: boolean;
}

// ============================================================================
// Component
// ============================================================================

export default function ErrorRecoveryModal({
  isOpen,
  onClose,
  errorAnalysis,
  onAutoFix,
  onManualAction,
  isFixing,
}: ErrorRecoveryModalProps) {
  const t = useTranslations('errorRecovery');
  const [expandedSuggestion, setExpandedSuggestion] = useState<number | null>(null);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  if (!isOpen || !errorAnalysis) return null;

  const severityColor = {
    low: 'text-yellow-600 bg-yellow-100',
    medium: 'text-orange-600 bg-orange-100',
    high: 'text-red-600 bg-red-100',
  }[errorAnalysis.severity];

  const severityIcon = {
    low: '⚠️',
    medium: '⚠️',
    high: '🚨',
  }[errorAnalysis.severity];

  const categoryDisplay = errorAnalysis.category
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 p-6 bg-gradient-to-r from-red-50 to-orange-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-red-600" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{t('title')}</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {t('subtitle')}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white rounded-lg transition-colors"
              aria-label={t('closeModal')}
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Error Summary */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{t('summary.title')}</h3>
                <p className="text-sm text-gray-600 mt-1">{t('summary.category', { category: categoryDisplay })}</p>
              </div>
              <div className={`px-3 py-1 rounded-lg font-semibold ${severityColor}`}>
                {severityIcon} {errorAnalysis.severity.toUpperCase()}
              </div>
            </div>

            {/* Detected Issues */}
            {errorAnalysis.detectedIssues.length > 0 && (
              <div className="mt-3 space-y-2">
                {errorAnalysis.detectedIssues.map((issue, i) => (
                  <div
                    key={i}
                    className="text-sm text-gray-700 bg-white border border-gray-200 rounded p-3"
                  >
                    {issue}
                  </div>
                ))}
              </div>
            )}

            {/* AI Explanation */}
            {errorAnalysis.aiAnalysis && (
              <div className="mt-3 bg-blue-50 border-s-4 border-blue-400 p-3 text-sm text-blue-800">
                <strong>{t('aiAnalysis')}</strong> {errorAnalysis.aiAnalysis}
              </div>
            )}
          </div>

          {/* Recovery Status */}
          {errorAnalysis.canRecover ? (
            <div className="bg-green-50 border-s-4 border-green-400 p-4 text-sm text-green-800">
              ✅ {t('recovery.canRecover', { count: errorAnalysis.suggestions.length })}
            </div>
          ) : (
            <div className="bg-red-50 border-s-4 border-red-400 p-4 text-sm text-red-800">
              ❌ {t('recovery.cannotRecover')}
            </div>
          )}

          {/* Recovery Suggestions */}
          {errorAnalysis.suggestions.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('recovery.optionsTitle')}</h3>
              <div className="space-y-3">
                {errorAnalysis.suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-teal-300 transition-colors"
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-gray-900">{suggestion.title}</h4>
                            {suggestion.autoFixable && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-semibold rounded">
                                <Zap className="w-3 h-3 inline me-1" />
                                {t('suggestions.autoFix')}
                              </span>
                            )}
                            <span
                              className={`px-2 py-0.5 text-xs font-semibold rounded ${
                                suggestion.confidence >= 0.9
                                  ? 'bg-green-100 text-green-800'
                                  : suggestion.confidence >= 0.7
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-orange-100 text-orange-800'
                              }`}
                            >
                              {t('suggestions.confidence', { percent: (suggestion.confidence * 100).toFixed(0) })}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{suggestion.description}</p>

                          {/* Technical Details (Expandable) */}
                          {suggestion.technicalDetails && (
                            <button
                              onClick={() =>
                                setExpandedSuggestion(
                                  expandedSuggestion === index ? null : index
                                )
                              }
                              className="mt-2 text-xs text-teal-600 hover:text-teal-700 flex items-center gap-1"
                            >
                              {expandedSuggestion === index ? (
                                <ChevronDown className="w-3 h-3" />
                              ) : (
                                <ChevronRight className="w-3 h-3" />
                              )}
                              {t('suggestions.technicalDetails')}
                            </button>
                          )}

                          {expandedSuggestion === index && suggestion.technicalDetails && (
                            <div className="mt-2 text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded p-2">
                              {suggestion.technicalDetails}
                            </div>
                          )}
                        </div>

                        {/* Action Button */}
                        <div className="ms-4">
                          {suggestion.autoFixable ? (
                            <button
                              onClick={() => onAutoFix(suggestion)}
                              disabled={isFixing}
                              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                            >
                              {isFixing ? (
                                <>
                                  <RefreshCw className="w-4 h-4 animate-spin" />
                                  {t('suggestions.fixing')}
                                </>
                              ) : (
                                <>
                                  <Zap className="w-4 h-4" />
                                  {suggestion.actionLabel || t('suggestions.autoFixButton')}
                                </>
                              )}
                            </button>
                          ) : (
                            <button
                              onClick={() => onManualAction(suggestion)}
                              disabled={isFixing}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                            >
                              {suggestion.actionLabel || t('suggestions.learnMore')}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Technical Details Section */}
          <div className="border-t border-gray-200 pt-4">
            <button
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2"
            >
              {showTechnicalDetails ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
              {t('technical.title')}
            </button>

            {showTechnicalDetails && (
              <div className="mt-3 bg-gray-50 border border-gray-200 rounded p-4 text-xs text-gray-700 font-mono">
                <div>
                  <strong>{t('technical.errorCategory')}</strong> {errorAnalysis.category}
                </div>
                <div className="mt-2">
                  <strong>{t('technical.severity')}</strong> {errorAnalysis.severity}
                </div>
                <div className="mt-2">
                  <strong>{t('technical.canRecover')}</strong> {errorAnalysis.canRecover ? t('technical.yes') : t('technical.no')}
                </div>
                <div className="mt-2">
                  <strong>{t('technical.suggestions')}</strong> {errorAnalysis.suggestions.length}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50 flex justify-between">
          <button
            onClick={onClose}
            className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {t('footer.close')}
          </button>
          <div className="text-sm text-gray-600">
            {t('footer.needHelp')}{' '}
            <a href="/docs/import-troubleshooting" className="text-teal-600 hover:underline">
              {t('footer.viewGuide')}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
