'use client';

/**
 * Privacy Controls Panel
 * UI component for managing AI features and privacy settings
 * Part of Phase 4: Privacy & Security
 */

import { type PrivacySettings } from '@/lib/budget-privacy-settings';
import {
  Shield,
  Brain,
  Eye,
  Lock,
  Download,
  Trash2,
  AlertTriangle,
  Info,
  CheckCircle2,
  XCircle,
  MessageSquare,
  BarChart3
} from 'lucide-react';
import { useState } from 'react';

interface PrivacyControlsPanelProps {
  settings: PrivacySettings;
  onSettingsChange: (settings: PrivacySettings) => void;
}

export function PrivacyControlsPanel({ 
  settings, 
  onSettingsChange 
}: PrivacyControlsPanelProps) {
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  function handleToggle(field: keyof PrivacySettings) {
    if (field === 'updatedAt') return; // Don't allow toggling timestamp
    if (field === 'chatbotDataAccess' || field === 'chatbotConversationRetention') return; // Don't toggle non-boolean fields

    const newSettings: PrivacySettings = {
      ...settings,
      [field]: !settings[field],
    };

    // If disabling AI Features master switch, disable all AI-dependent features (including chatbot)
    if (field === 'enableAIFeatures' && !newSettings.enableAIFeatures) {
      newSettings.enableSmartDuplicateDetection = false;
      newSettings.enableAnomalyDetection = false;
      newSettings.enablePredictiveSpending = false;
      newSettings.enableNaturalLanguageImport = false;
      newSettings.enableChatbot = false; // Chatbot also requires AI features
    }

    // If enabling an AI feature, automatically enable AI Features
    if (
      (field === 'enableSmartDuplicateDetection' ||
       field === 'enableAnomalyDetection' ||
       field === 'enablePredictiveSpending' ||
       field === 'enableNaturalLanguageImport' ||
       field === 'enableChatbot') &&
      newSettings[field]
    ) {
      newSettings.enableAIFeatures = true;
    }

    onSettingsChange(newSettings);
  }

  function handleChatbotDataAccessChange(value: 'read-only' | 'full-access') {
    onSettingsChange({
      ...settings,
      chatbotDataAccess: value,
    });
  }

  function handleChatbotRetentionChange(value: 7 | 30 | 'forever') {
    onSettingsChange({
      ...settings,
      chatbotConversationRetention: value,
    });
  }

  async function handleExportData() {
    try {
      const { db } = await import('@/lib/budget-db');
      const [accounts, categories, transactions, budgets] = await Promise.all([
        db.accounts.toArray(),
        db.categories.toArray(),
        db.transactions.toArray(),
        db.budgets.toArray(),
      ]);

      const exportData = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        accounts,
        categories,
        transactions,
        budgets,
        privacySettings: settings,
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `budget-app-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data. Please try again.');
    }
  }

  async function handleDeleteAllData() {
    if (!showConfirmDelete) {
      setShowConfirmDelete(true);
      return;
    }

    try {
      const { db } = await import('@/lib/budget-db');
      await Promise.all([
        db.accounts.clear(),
        db.categories.clear(),
        db.transactions.clear(),
        db.budgets.clear(),
      ]);
      
      // Reset privacy settings to defaults
      const { resetPrivacySettings } = await import('@/lib/budget-privacy-settings');
      resetPrivacySettings();
      
      alert('All data has been deleted.');
      window.location.reload(); // Reload to reflect changes
    } catch (error) {
      console.error('Error deleting data:', error);
      alert('Failed to delete data. Please try again.');
    }
  }

  async function handleResetSettings() {
    if (!showConfirmReset) {
      setShowConfirmReset(true);
      return;
    }

    const { resetPrivacySettings, getPrivacySettings } = await import('@/lib/budget-privacy-settings');
    resetPrivacySettings();
    onSettingsChange(getPrivacySettings());
    setShowConfirmReset(false);
  }

  const aiFeaturesEnabled = settings.enableAIFeatures;
  const hasAIDependentFeatures =
    settings.enableSmartDuplicateDetection ||
    settings.enableAnomalyDetection ||
    settings.enablePredictiveSpending ||
    settings.enableNaturalLanguageImport;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Privacy & AI Controls</h2>
        <p className="text-sm text-gray-600 mt-1">
          Control how your data is processed and which AI features are enabled
        </p>
      </div>

      {/* Privacy Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-blue-900 mb-1">Privacy First</h3>
            <p className="text-sm text-blue-800">
              All processing happens in your browser. No transaction data is uploaded to servers. 
              AI features are opt-in and only send cleaned transaction descriptions (no account numbers, 
              names, or addresses) when enabled.
            </p>
          </div>
        </div>
      </div>

      {/* AI Features Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">AI Features</h3>
        </div>

        {/* AI Features Master Switch */}
        <div className="mb-6 pb-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-gray-900">AI Features (Master Switch)</h4>
                {aiFeaturesEnabled && (
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                    Active
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Enable AI Features powered by OpenAI for advanced functionality. When disabled, all AI-dependent
                features are automatically disabled.
              </p>
              {aiFeaturesEnabled && (
                <div className="mt-2 text-xs text-gray-500">
                  <strong>What's sent:</strong> Only cleaned transaction descriptions (e.g., "AMAZON.COM").
                  No account numbers, names, or addresses. Powered by OpenAI GPT-4o-mini.
                </div>
              )}
            </div>
            <ToggleSwitch
              checked={settings.enableAIFeatures}
              onChange={() => handleToggle('enableAIFeatures')}
            />
          </div>
        </div>

        {/* Smart Duplicate Detection */}
        <SettingRow
          title="Smart Duplicate Detection"
          description="Use AI to detect duplicate transactions even when merchant names differ (e.g., 'AMAZON PRIME' vs 'AMZN MKTP CA')"
          checked={settings.enableSmartDuplicateDetection}
          onChange={() => handleToggle('enableSmartDuplicateDetection')}
          disabled={!aiFeaturesEnabled}
          requiresAI={true}
        />

        {/* Anomaly Detection */}
        <SettingRow
          title="Anomaly Detection"
          description="Flag unusual spending patterns (e.g., 'Your Starbucks purchase of $85 is unusual')"
          checked={settings.enableAnomalyDetection}
          onChange={() => handleToggle('enableAnomalyDetection')}
          disabled={!aiFeaturesEnabled}
          requiresAI={true}
        />

        {/* Predictive Spending */}
        <SettingRow
          title="Predictive Spending"
          description="Forecast monthly spending by category using AI analysis"
          checked={settings.enablePredictiveSpending}
          onChange={() => handleToggle('enablePredictiveSpending')}
          disabled={!aiFeaturesEnabled}
          requiresAI={true}
        />

        {/* Natural Language Import */}
        <SettingRow
          title="Natural Language Import"
          description="Auto-configure bank imports using natural language (e.g., 'Import my TD checking account CSV')"
          checked={settings.enableNaturalLanguageImport}
          onChange={() => handleToggle('enableNaturalLanguageImport')}
          disabled={!aiFeaturesEnabled}
          requiresAI={true}
        />
      </div>

      {/* Chatbot Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-900">Budget Chatbot</h3>
        </div>

        {/* Chatbot Master Switch */}
        <div className="mb-6 pb-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-gray-900">Enable Chatbot</h4>
                {settings.enableChatbot && (
                  <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded-full">
                    Active
                  </span>
                )}
                {!aiFeaturesEnabled && (
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">
                    Requires AI Features
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                AI-powered assistant that can answer questions about your transactions, budgets, and spending patterns.
                Conversations are processed via OpenAI API.
              </p>
              {settings.enableChatbot && (
                <div className="mt-2 text-xs text-gray-500">
                  <strong>Privacy:</strong> Your financial data is sent to OpenAI to answer questions.
                  OpenAI does not use API data to train models. You can disable anytime.
                </div>
              )}
            </div>
            <ToggleSwitch
              checked={settings.enableChatbot}
              onChange={() => handleToggle('enableChatbot')}
              disabled={!aiFeaturesEnabled}
            />
          </div>
        </div>

        {/* Data Access Level */}
        {settings.enableChatbot && (
          <>
            <div className="mb-6 pb-6 border-b border-gray-200">
              <h4 className="font-medium text-gray-900 mb-3">Data Access Permission</h4>
              <div className="space-y-2">
                <label className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-indigo-500 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="chatbotDataAccess"
                    value="read-only"
                    checked={settings.chatbotDataAccess === 'read-only'}
                    onChange={() => handleChatbotDataAccessChange('read-only')}
                    className="mt-1 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Read-Only (Recommended)</div>
                    <div className="text-sm text-gray-600 mt-1">
                      Chatbot can view data and answer questions but cannot modify anything
                    </div>
                  </div>
                </label>
                <label className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-indigo-500 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="chatbotDataAccess"
                    value="full-access"
                    checked={settings.chatbotDataAccess === 'full-access'}
                    onChange={() => handleChatbotDataAccessChange('full-access')}
                    className="mt-1 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Full Access</div>
                    <div className="text-sm text-gray-600 mt-1">
                      Chatbot can perform actions like adding transactions and creating budgets
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Conversation Retention */}
            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-3">Conversation History</h4>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-indigo-500 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="chatbotRetention"
                    value="7"
                    checked={settings.chatbotConversationRetention === 7}
                    onChange={() => handleChatbotRetentionChange(7)}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-gray-900">Delete after 7 days (Recommended)</span>
                </label>
                <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-indigo-500 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="chatbotRetention"
                    value="30"
                    checked={settings.chatbotConversationRetention === 30}
                    onChange={() => handleChatbotRetentionChange(30)}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-gray-900">Delete after 30 days</span>
                </label>
                <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-indigo-500 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="chatbotRetention"
                    value="forever"
                    checked={settings.chatbotConversationRetention === 'forever'}
                    onChange={() => handleChatbotRetentionChange('forever')}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-gray-900">Keep forever</span>
                </label>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Conversations are stored locally in your browser. You can manually delete them anytime.
              </p>
            </div>
          </>
        )}
      </div>

      {/* Analytics & Monitoring Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Analytics & Monitoring</h3>
        </div>

        <SettingRow
          title="Enable Analytics"
          description="Track feature usage and app performance using PostHog. No personal financial data (amounts, descriptions) is collected."
          checked={settings.enableAnalytics}
          onChange={() => handleToggle('enableAnalytics')}
        />

        <SettingRow
          title="Enable Error Tracking"
          description="Automatically report errors and crashes to Sentry to help improve the app. No financial data is included in error reports."
          checked={settings.enableErrorTracking}
          onChange={() => handleToggle('enableErrorTracking')}
        />
      </div>

      {/* Data Processing Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <Eye className="w-5 h-5 text-teal-600" />
          <h3 className="text-lg font-semibold text-gray-900">Data Processing</h3>
        </div>

        <SettingRow
          title="Receipt OCR"
          description="Extract transaction details from receipt images using client-side OCR (Tesseract.js). No data leaves your device."
          checked={settings.enableOCR}
          onChange={() => handleToggle('enableOCR')}
        />
      </div>

      {/* Data Security Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Data Security</h3>
        </div>

        <SettingRow
          title="Encrypt Stored Data"
          description="Encrypt sensitive transaction data at rest using AES-GCM encryption. Requires key generation on first enable."
          checked={settings.enableEncryption}
          onChange={async () => {
            const newValue = !settings.enableEncryption;
            if (newValue) {
              // Enable encryption - check if encryption is available
              const { isEncryptionAvailable } = await import('@/lib/encryption');
              if (!isEncryptionAvailable()) {
                alert('Encryption is not available in this browser. Please use a modern browser with Web Crypto API support.');
                return;
              }
              // Generate encryption key if needed
              const { getOrCreateEncryptionKey } = await import('@/lib/encryption');
              try {
                await getOrCreateEncryptionKey();
                handleToggle('enableEncryption');
              } catch (error) {
                console.error('Failed to initialize encryption:', error);
                alert('Failed to enable encryption. Please try again.');
              }
            } else {
              // Disable encryption (doesn't decrypt existing data, just stops encrypting new data)
              handleToggle('enableEncryption');
            }
          }}
        />
        {settings.enableEncryption && (
          <div className="mt-2 text-xs text-green-700 bg-green-50 p-2 rounded">
            <CheckCircle2 className="w-4 h-4 inline mr-1" />
            Encryption is active. Your data is encrypted in IndexedDB.
          </div>
        )}
      </div>

      {/* Data Management Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Data Management</h3>
        </div>

        <div className="space-y-4">
          {/* Export Data */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Download className="w-5 h-5 text-gray-600" />
                <h4 className="font-medium text-gray-900">Export All Data</h4>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Download all your accounts, transactions, categories, and budgets as JSON
              </p>
            </div>
            <button
              onClick={handleExportData}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              Export
            </button>
          </div>

          {/* Delete All Data */}
          <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-600" />
                <h4 className="font-medium text-gray-900">Delete All Data</h4>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Permanently delete all accounts, transactions, categories, budgets, and reset privacy settings
              </p>
              {showConfirmDelete && (
                <div className="mt-2 flex items-center gap-2 text-sm text-red-700">
                  <AlertTriangle className="w-4 h-4" />
                  <span>This action cannot be undone. Click again to confirm.</span>
                </div>
              )}
            </div>
            <button
              onClick={handleDeleteAllData}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              {showConfirmDelete ? 'Confirm Delete' : 'Delete All'}
            </button>
          </div>

          {/* Reset Settings */}
          <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-yellow-600" />
                <h4 className="font-medium text-gray-900">Reset Privacy Settings</h4>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Reset all privacy settings to defaults (does not delete data)
              </p>
              {showConfirmReset && (
                <div className="mt-2 flex items-center gap-2 text-sm text-yellow-700">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Click again to confirm reset.</span>
                </div>
              )}
            </div>
            <button
              onClick={handleResetSettings}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              {showConfirmReset ? 'Confirm Reset' : 'Reset'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface SettingRowProps {
  title: string;
  description: string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  requiresAI?: boolean;
}

function SettingRow({
  title,
  description,
  checked,
  onChange,
  disabled = false,
  requiresAI = false
}: SettingRowProps) {
  return (
    <div className={`mb-4 pb-4 ${disabled ? 'opacity-50' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-gray-900">{title}</h4>
            {requiresAI && (
              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                Requires AI Features
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
        <ToggleSwitch
          checked={checked}
          onChange={onChange}
          disabled={disabled}
        />
      </div>
    </div>
  );
}

interface ToggleSwitchProps {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}

function ToggleSwitch({ checked, onChange, disabled = false }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${
        checked ? 'bg-teal-600' : 'bg-gray-200'
      } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

