// Privacy Controls Panel Component
// This component is appended to settings/page.tsx

import { useState } from 'react';
import { Shield, Download, Trash2 as TrashIcon, AlertTriangle } from 'lucide-react';
import { db } from '@/lib/budget-db';
import type { PrivacySettings } from '@/lib/budget-privacy-settings';
import { getPrivacySettings, resetPrivacySettings } from '@/lib/budget-privacy-settings';

export function PrivacyControlsPanel({
  settings,
  onSettingsChange,
}: {
  settings: PrivacySettings;
  onSettingsChange: (settings: PrivacySettings) => void;
}) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showExportConfirm, setShowExportConfirm] = useState(false);

  function updateSetting<K extends keyof PrivacySettings>(
    key: K,
    value: PrivacySettings[K]
  ) {
    const updated = { ...settings, [key]: value };
    onSettingsChange(updated);
  }

  async function handleExportData() {
    try {
      const transactions = await db.transactions.toArray();
      const accounts = await db.accounts.toArray();
      const categories = await db.categories.toArray();
      const budgets = await db.budgets.toArray();

      const data = {
        transactions,
        accounts,
        categories,
        budgets,
        exportedAt: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `budget-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setShowExportConfirm(false);
      alert('Data exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export data');
    }
  }

  async function handleDeleteAllData() {
    try {
      await Promise.all([
        db.transactions.clear(),
        db.accounts.clear(),
        db.categories.clear(),
        db.budgets.clear(),
        db.futurePurchases.clear(),
        db.retirementPlans.clear(),
        db.receipts.clear(),
        db.investmentAccounts.clear(),
        db.holdings.clear(),
      ]);

      setShowDeleteConfirm(false);
      alert('All data deleted successfully. Page will refresh.');
      window.location.reload();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete data');
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Privacy & AI Controls</h2>
        <p className="text-gray-600 mt-1">
          Control how your data is processed and which AI features are enabled
        </p>
      </div>

      {/* Master AI Switch */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-teal-600" />
              <h3 className="text-lg font-semibold text-gray-900">Claude API Features</h3>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Master switch for all Claude API features. When disabled, no data is sent to Anthropic's API.
            </p>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-medium mb-1">What data is sent?</p>
                  <ul className="list-disc list-inside space-y-1 text-blue-800">
                    <li>Only cleaned transaction descriptions (no account numbers, names, or addresses)</li>
                    <li>No persistent storage by Anthropic</li>
                    <li>All processing happens client-side when possible</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enableClaudeAPI}
              onChange={(e) => updateSetting('enableClaudeAPI', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
          </label>
        </div>
      </div>

      {/* AI Feature Toggles */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Features</h3>
        <div className="space-y-4">
          {/* Smart Duplicate Detection */}
          <div className="flex items-start justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">Smart Duplicate Detection</h4>
              <p className="text-sm text-gray-600 mt-1">
                Uses Claude API to detect semantic duplicates (e.g., "AMAZON PRIME" vs "AMZN MKTP CA")
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-4">
              <input
                type="checkbox"
                checked={settings.enableSmartDuplicateDetection && settings.enableClaudeAPI}
                disabled={!settings.enableClaudeAPI}
                onChange={(e) => updateSetting('enableSmartDuplicateDetection', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
            </label>
          </div>

          {/* Anomaly Detection */}
          <div className="flex items-start justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">Anomaly Detection</h4>
              <p className="text-sm text-gray-600 mt-1">
                Flags unusual spending patterns (e.g., "$85 Starbucks purchase when average is $6")
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-4">
              <input
                type="checkbox"
                checked={settings.enableAnomalyDetection && settings.enableClaudeAPI}
                disabled={!settings.enableClaudeAPI}
                onChange={(e) => updateSetting('enableAnomalyDetection', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
            </label>
          </div>

          {/* Predictive Spending */}
          <div className="flex items-start justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">Predictive Spending</h4>
              <p className="text-sm text-gray-600 mt-1">
                Forecasts monthly spending by category using LSTM neural network
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-4">
              <input
                type="checkbox"
                checked={settings.enablePredictiveSpending && settings.enableClaudeAPI}
                disabled={!settings.enableClaudeAPI}
                onChange={(e) => updateSetting('enablePredictiveSpending', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
            </label>
          </div>

          {/* Natural Language Import */}
          <div className="flex items-start justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">Natural Language Import</h4>
              <p className="text-sm text-gray-600 mt-1">
                Zero-config imports via natural language (e.g., "Import my TD checking account CSV")
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-4">
              <input
                type="checkbox"
                checked={settings.enableNaturalLanguageImport && settings.enableClaudeAPI}
                disabled={!settings.enableClaudeAPI}
                onChange={(e) => updateSetting('enableNaturalLanguageImport', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
            </label>
          </div>

          {/* OCR (Client-side only) */}
          <div className="flex items-start justify-between p-4 border border-gray-200 rounded-lg bg-green-50">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">Receipt OCR</h4>
              <p className="text-sm text-gray-600 mt-1">
                Extract merchant, amount, and date from receipt images (100% client-side, no API calls)
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-4">
              <input
                type="checkbox"
                checked={settings.enableOCR}
                onChange={(e) => updateSetting('enableOCR', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Data Security */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Security</h3>
        <div className="space-y-4">
          {/* Data Encryption */}
          <div className="flex items-start justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">Encrypt Data at Rest</h4>
              <p className="text-sm text-gray-600 mt-1">
                Encrypt transaction descriptions and amounts in IndexedDB using AES-256-GCM. Keys are stored securely and never leave your device.
              </p>
              <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-blue-900">
                    <p className="font-medium mb-1">Important:</p>
                    <ul className="list-disc list-inside space-y-0.5 text-blue-800">
                      <li>Encryption keys are stored locally on your device</li>
                      <li>If you clear browser data, encrypted data cannot be recovered</li>
                      <li>Export a backup before enabling encryption</li>
                      <li>Existing data will be encrypted when you enable this feature</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-4">
              <input
                type="checkbox"
                checked={settings.enableEncryption}
                onChange={async (e) => {
                  if (e.target.checked) {
                    // Enable encryption and migrate existing data
                    const { enableEncryption } = await import('@/lib/encryption/budget-encryption');
                    const { migrateTransactionsToEncryption } = await import('@/lib/encryption/migrate-to-encryption');
                    
                    try {
                      await enableEncryption();
                      updateSetting('enableEncryption', true);
                      
                      // Show migration prompt
                      const migrate = confirm(
                        'Encrypt existing transactions? This will encrypt all current transaction data. This cannot be undone without the encryption key.'
                      );
                      
                      if (migrate) {
                        const result = await migrateTransactionsToEncryption();
                        if (result.success) {
                          alert(`Successfully encrypted ${result.transactionsEncrypted} transactions.`);
                        } else {
                          alert(`Encryption completed with ${result.errors.length} errors. Check console for details.`);
                        }
                      }
                    } catch (error) {
                      alert('Failed to enable encryption. Please try again.');
                      console.error('[PrivacyPanel] Encryption error:', error);
                    }
                  } else {
                    // Disable encryption (doesn't decrypt existing data)
                    const { disableEncryption } = await import('@/lib/encryption/budget-encryption');
                    disableEncryption();
                    updateSetting('enableEncryption', false);
                    alert('Encryption disabled. Existing encrypted data will remain encrypted until you re-enable encryption.');
                  }
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Management</h3>
        <div className="space-y-4">
          {/* Export Data */}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3">
              <Download className="w-5 h-5 text-teal-600" />
              <div>
                <h4 className="font-medium text-gray-900">Export All Data</h4>
                <p className="text-sm text-gray-600">Download a complete backup of all your data as JSON</p>
              </div>
            </div>
            <button
              onClick={() => setShowExportConfirm(true)}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              Export
            </button>
          </div>

          {/* Delete All Data */}
          <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
            <div className="flex items-center gap-3">
              <TrashIcon className="w-5 h-5 text-red-600" />
              <div>
                <h4 className="font-medium text-gray-900">Delete All Data</h4>
                <p className="text-sm text-gray-600">Permanently delete all transactions, accounts, and settings</p>
              </div>
            </div>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Reset Privacy Settings */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Reset Privacy Settings</h3>
            <p className="text-sm text-gray-600 mt-1">Reset all privacy settings to defaults</p>
          </div>
          <button
            onClick={() => {
              resetPrivacySettings();
              onSettingsChange(getPrivacySettings());
            }}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Export Confirmation Modal */}
      {showExportConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Export Data</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                This will download a JSON file containing all your transactions, accounts, categories, and budgets.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowExportConfirm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExportData}
                  className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                >
                  Export
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-red-200 bg-red-50">
              <h3 className="text-xl font-semibold text-red-900">Delete All Data</h3>
            </div>
            <div className="p-6">
              <div className="flex items-start gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-900 font-medium mb-2">This action cannot be undone!</p>
                  <p className="text-gray-700">
                    This will permanently delete all transactions, accounts, categories, budgets, and all other data.
                    Make sure you have exported a backup first.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAllData}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete All Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

