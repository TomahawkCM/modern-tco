// Privacy Controls Panel Component
// This component is appended to settings/page.tsx

import { useState } from "react";
import { Shield, Download, Trash2 as TrashIcon, AlertTriangle } from "lucide-react";
import { db } from "@/lib/budget-db";
import type { PrivacySettings } from "@/lib/budget-privacy-settings";
import { getPrivacySettings, resetPrivacySettings } from "@/lib/budget-privacy-settings";

export function PrivacyControlsPanel({
  settings,
  onSettingsChange,
}: {
  settings: PrivacySettings;
  onSettingsChange: (settings: PrivacySettings) => void;
}) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showExportConfirm, setShowExportConfirm] = useState(false);

  function updateSetting<K extends keyof PrivacySettings>(key: K, value: PrivacySettings[K]) {
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
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `budget-backup-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setShowExportConfirm(false);
      alert("Data exported successfully!");
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export data");
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
      alert("All data deleted successfully. Page will refresh.");
      window.location.reload();
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete data");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Privacy & AI Controls</h2>
        <p className="mt-1 text-gray-600">
          Control how your data is processed and which AI features are enabled
        </p>
      </div>

      {/* Master AI Switch */}
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-teal-600" />
              <h3 className="text-lg font-semibold text-gray-900">AI Features</h3>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              Master switch for all AI features powered by OpenAI. When disabled, no data is sent to
              OpenAI's API.
            </p>
            <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                <div className="text-sm text-blue-900">
                  <p className="mb-1 font-medium">What data is sent?</p>
                  <ul className="list-inside list-disc space-y-1 text-blue-800">
                    <li>
                      Only cleaned transaction descriptions (no account numbers, names, or
                      addresses)
                    </li>
                    <li>No persistent storage by OpenAI</li>
                    <li>All processing happens client-side when possible</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={settings.enableAIFeatures}
              onChange={(e) => updateSetting("enableAIFeatures", e.target.checked)}
              className="peer sr-only"
            />
            <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-teal-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300"></div>
          </label>
        </div>
      </div>

      {/* AI Feature Toggles */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">AI Features</h3>
        <div className="space-y-4">
          {/* Smart Duplicate Detection */}
          <div className="flex items-start justify-between rounded-lg border border-gray-200 p-4">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">Smart Duplicate Detection</h4>
              <p className="mt-1 text-sm text-gray-600">
                Uses AI to detect semantic duplicates (e.g., "AMAZON PRIME" vs "AMZN MKTP CA")
              </p>
            </div>
            <label className="relative ml-4 inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={settings.enableSmartDuplicateDetection && settings.enableAIFeatures}
                disabled={!settings.enableAIFeatures}
                onChange={(e) => updateSetting("enableSmartDuplicateDetection", e.target.checked)}
                className="peer sr-only"
              />
              <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-teal-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 peer-disabled:cursor-not-allowed peer-disabled:opacity-50"></div>
            </label>
          </div>

          {/* Anomaly Detection */}
          <div className="flex items-start justify-between rounded-lg border border-gray-200 p-4">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">Anomaly Detection</h4>
              <p className="mt-1 text-sm text-gray-600">
                Flags unusual spending patterns (e.g., "$85 Starbucks purchase when average is $6")
              </p>
            </div>
            <label className="relative ml-4 inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={settings.enableAnomalyDetection && settings.enableAIFeatures}
                disabled={!settings.enableAIFeatures}
                onChange={(e) => updateSetting("enableAnomalyDetection", e.target.checked)}
                className="peer sr-only"
              />
              <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-teal-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 peer-disabled:cursor-not-allowed peer-disabled:opacity-50"></div>
            </label>
          </div>

          {/* Predictive Spending */}
          <div className="flex items-start justify-between rounded-lg border border-gray-200 p-4">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">Predictive Spending</h4>
              <p className="mt-1 text-sm text-gray-600">
                Forecasts monthly spending by category using AI analysis
              </p>
            </div>
            <label className="relative ml-4 inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={settings.enablePredictiveSpending && settings.enableAIFeatures}
                disabled={!settings.enableAIFeatures}
                onChange={(e) => updateSetting("enablePredictiveSpending", e.target.checked)}
                className="peer sr-only"
              />
              <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-teal-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 peer-disabled:cursor-not-allowed peer-disabled:opacity-50"></div>
            </label>
          </div>

          {/* Natural Language Import */}
          <div className="flex items-start justify-between rounded-lg border border-gray-200 p-4">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">Natural Language Import</h4>
              <p className="mt-1 text-sm text-gray-600">
                Zero-config imports via natural language (e.g., "Import my TD checking account CSV")
              </p>
            </div>
            <label className="relative ml-4 inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={settings.enableNaturalLanguageImport && settings.enableAIFeatures}
                disabled={!settings.enableAIFeatures}
                onChange={(e) => updateSetting("enableNaturalLanguageImport", e.target.checked)}
                className="peer sr-only"
              />
              <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-teal-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 peer-disabled:cursor-not-allowed peer-disabled:opacity-50"></div>
            </label>
          </div>

          {/* OCR (Client-side only) */}
          <div className="flex items-start justify-between rounded-lg border border-gray-200 bg-green-50 p-4">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">Receipt OCR</h4>
              <p className="mt-1 text-sm text-gray-600">
                Extract merchant, amount, and date from receipt images (100% client-side, no API
                calls)
              </p>
            </div>
            <label className="relative ml-4 inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={settings.enableOCR}
                onChange={(e) => updateSetting("enableOCR", e.target.checked)}
                className="peer sr-only"
              />
              <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-teal-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Data Security */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Data Security</h3>
        <div className="space-y-4">
          {/* Data Encryption */}
          <div className="flex items-start justify-between rounded-lg border border-gray-200 p-4">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">Encrypt Data at Rest</h4>
              <p className="mt-1 text-sm text-gray-600">
                Encrypt transaction descriptions and amounts in IndexedDB using AES-256-GCM. Keys
                are stored securely and never leave your device.
              </p>
              <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
                  <div className="text-xs text-blue-900">
                    <p className="mb-1 font-medium">Important:</p>
                    <ul className="list-inside list-disc space-y-0.5 text-blue-800">
                      <li>Encryption keys are stored locally on your device</li>
                      <li>If you clear browser data, encrypted data cannot be recovered</li>
                      <li>Export a backup before enabling encryption</li>
                      <li>Existing data will be encrypted when you enable this feature</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <label className="relative ml-4 inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={settings.enableEncryption}
                onChange={async (e) => {
                  if (e.target.checked) {
                    // Enable encryption and migrate existing data
                    const { enableEncryption } = await import("@/lib/encryption/budget-encryption");
                    const { migrateTransactionsToEncryption } = await import(
                      "@/lib/encryption/migrate-to-encryption"
                    );

                    try {
                      await enableEncryption();
                      updateSetting("enableEncryption", true);

                      // Show migration prompt
                      const migrate = confirm(
                        "Encrypt existing transactions? This will encrypt all current transaction data. This cannot be undone without the encryption key."
                      );

                      if (migrate) {
                        const result = await migrateTransactionsToEncryption();
                        if (result.success) {
                          alert(
                            `Successfully encrypted ${result.transactionsEncrypted} transactions.`
                          );
                        } else {
                          alert(
                            `Encryption completed with ${result.errors.length} errors. Check console for details.`
                          );
                        }
                      }
                    } catch (error) {
                      alert("Failed to enable encryption. Please try again.");
                      console.error("[PrivacyPanel] Encryption error:", error);
                    }
                  } else {
                    // Disable encryption (doesn't decrypt existing data)
                    const { disableEncryption } = await import(
                      "@/lib/encryption/budget-encryption"
                    );
                    disableEncryption();
                    updateSetting("enableEncryption", false);
                    alert(
                      "Encryption disabled. Existing encrypted data will remain encrypted until you re-enable encryption."
                    );
                  }
                }}
                className="peer sr-only"
              />
              <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-teal-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Data Management</h3>
        <div className="space-y-4">
          {/* Export Data */}
          <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <Download className="h-5 w-5 text-teal-600" />
              <div>
                <h4 className="font-medium text-gray-900">Export All Data</h4>
                <p className="text-sm text-gray-600">
                  Download a complete backup of all your data as JSON
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowExportConfirm(true)}
              className="rounded-lg bg-teal-600 px-4 py-2 text-white transition-colors hover:bg-teal-700"
            >
              Export
            </button>
          </div>

          {/* Delete All Data */}
          <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-center gap-3">
              <TrashIcon className="h-5 w-5 text-red-600" />
              <div>
                <h4 className="font-medium text-gray-900">Delete All Data</h4>
                <p className="text-sm text-gray-600">
                  Permanently delete all transactions, accounts, and settings
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Reset Privacy Settings */}
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Reset Privacy Settings</h3>
            <p className="mt-1 text-sm text-gray-600">Reset all privacy settings to defaults</p>
          </div>
          <button
            onClick={() => {
              resetPrivacySettings();
              onSettingsChange(getPrivacySettings());
            }}
            className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Export Confirmation Modal */}
      {showExportConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white shadow-xl">
            <div className="border-b border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900">Export Data</h3>
            </div>
            <div className="p-6">
              <p className="mb-4 text-gray-700">
                This will download a JSON file containing all your transactions, accounts,
                categories, and budgets.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowExportConfirm(false)}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExportData}
                  className="flex-1 rounded-lg bg-teal-600 px-4 py-2 text-white transition-colors hover:bg-teal-700"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white shadow-xl">
            <div className="border-b border-red-200 bg-red-50 p-6">
              <h3 className="text-xl font-semibold text-red-900">Delete All Data</h3>
            </div>
            <div className="p-6">
              <div className="mb-4 flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-6 w-6 flex-shrink-0 text-red-600" />
                <div>
                  <p className="mb-2 font-medium text-gray-900">This action cannot be undone!</p>
                  <p className="text-gray-700">
                    This will permanently delete all transactions, accounts, categories, budgets,
                    and all other data. Make sure you have exported a backup first.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAllData}
                  className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
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
