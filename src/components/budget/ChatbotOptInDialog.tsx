'use client';

/**
 * Chatbot Opt-In Dialog Component
 * Task: Implement chatbot privacy controls and opt-in flow
 *
 * First-time dialog shown when user tries to access chatbot feature
 * Explains data usage, privacy settings, and obtains consent
 */

import { useState } from 'react';
import { X, MessageSquare, Shield, Lock, Info } from 'lucide-react';
import { savePrivacySettings } from '@/lib/budget-privacy-settings';

interface ChatbotOptInDialogProps {
  onAccept: () => void;
  onDecline: () => void;
}

export function ChatbotOptInDialog({ onAccept, onDecline }: ChatbotOptInDialogProps) {
  const [dataAccess, setDataAccess] = useState<'read-only' | 'full-access'>('read-only');
  const [retention, setRetention] = useState<7 | 30 | 'forever'>(7);

  const handleAccept = () => {
    // Save privacy settings
    savePrivacySettings({
      enableChatbot: true,
      chatbotDataAccess: dataAccess,
      chatbotConversationRetention: retention,
    });

    onAccept();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4 sm:p-4 p-0">
      <div className="bg-white rounded-t-2xl sm:rounded-lg shadow-xl w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Enable Budget Chatbot?</h2>
              <p className="text-sm text-gray-600 mt-0.5">AI-powered financial assistant</p>
            </div>
          </div>
          <button
            onClick={onDecline}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close chatbot opt-in dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* What the Chatbot Does */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Info className="w-4 h-4 text-teal-600" />
              What the Chatbot Can Do
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-teal-600 mt-0.5">✓</span>
                <span>Answer questions about your transactions, budgets, and spending patterns</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-600 mt-0.5">✓</span>
                <span>Search your financial data using natural language</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-600 mt-0.5">✓</span>
                <span>Provide insights and recommendations based on your data</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-600 mt-0.5">✓</span>
                <span>Optionally perform actions like adding transactions or creating budgets</span>
              </li>
            </ul>
          </div>

          {/* Privacy & Data Usage */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h3 className="text-base font-semibold text-amber-900 mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-600" />
              Privacy & Data Usage
            </h3>
            <ul className="space-y-2 text-sm text-amber-900">
              <li className="flex items-start gap-2">
                <span className="text-amber-600 mt-0.5">•</span>
                <span>Your conversations are processed by OpenAI's GPT-4 API</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 mt-0.5">•</span>
                <span>Financial data is sent to the API to answer your questions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 mt-0.5">•</span>
                <span>OpenAI does not use API data to train models (as of their policy)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 mt-0.5">•</span>
                <span>You can disable the chatbot anytime in Settings → Privacy</span>
              </li>
            </ul>
          </div>

          {/* Privacy Controls */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Lock className="w-4 h-4 text-teal-600" />
              Privacy Controls
            </h3>

            {/* Data Access Level */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                What can the chatbot do with your data?
              </label>
              <div className="space-y-2">
                <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-teal-500 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="dataAccess"
                    value="read-only"
                    checked={dataAccess === 'read-only'}
                    onChange={() => setDataAccess('read-only')}
                    className="mt-1 text-teal-600 focus:ring-teal-500"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Read-Only (Recommended)</div>
                    <div className="text-sm text-gray-600 mt-1">
                      Chatbot can view your data and answer questions, but cannot add, edit, or delete transactions/budgets
                    </div>
                  </div>
                </label>
                <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-teal-500 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="dataAccess"
                    value="full-access"
                    checked={dataAccess === 'full-access'}
                    onChange={() => setDataAccess('full-access')}
                    className="mt-1 text-teal-600 focus:ring-teal-500"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Full Access</div>
                    <div className="text-sm text-gray-600 mt-1">
                      Chatbot can perform actions like adding transactions, creating budgets, and making changes to your data
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Conversation Retention */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                How long should we keep your conversations?
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-teal-500 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="retention"
                    value="7"
                    checked={retention === 7}
                    onChange={() => setRetention(7)}
                    className="text-teal-600 focus:ring-teal-500"
                  />
                  <span className="text-gray-900">7 days (Recommended)</span>
                </label>
                <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-teal-500 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="retention"
                    value="30"
                    checked={retention === 30}
                    onChange={() => setRetention(30)}
                    className="text-teal-600 focus:ring-teal-500"
                  />
                  <span className="text-gray-900">30 days</span>
                </label>
                <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-teal-500 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="retention"
                    value="forever"
                    checked={retention === 'forever'}
                    onChange={() => setRetention('forever')}
                    className="text-teal-600 focus:ring-teal-500"
                  />
                  <span className="text-gray-900">Keep forever</span>
                </label>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Conversations are stored locally in your browser. You can delete them anytime in Settings → Privacy.
              </p>
            </div>
          </div>

          {/* GDPR Compliance Notice */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-700 leading-relaxed">
              <strong>Your Rights:</strong> By enabling the chatbot, you consent to processing your financial data via OpenAI's API.
              You can withdraw consent anytime by disabling the chatbot in Settings → Privacy.
              Your data is processed in accordance with our Privacy Policy and GDPR requirements.
              You have the right to access, delete, and export your conversation history at any time.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onDecline}
            className="flex-1 px-6 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            No Thanks
          </button>
          <button
            onClick={handleAccept}
            className="flex-1 px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
          >
            Enable Chatbot
          </button>
        </div>
      </div>
    </div>
  );
}
