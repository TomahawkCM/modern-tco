"use client";

/**
 * Privacy Controls Panel
 * UI component for managing AI features and privacy settings
 * Part of Phase 4: Privacy & Security
 */

import type { PrivacySettings } from "@/lib/budget-privacy-settings";
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
  MessageSquare,
  BarChart3,
} from "lucide-react";
import { useState } from "react";

interface PrivacyControlsPanelProps {
  settings: PrivacySettings;
  onSettingsChange: (settings: PrivacySettings) => void;
}

interface DeleteSelections {
  transactions: boolean;
  accounts: boolean;
  balances: boolean;
  categories: boolean;
  budgets: boolean;
  privacySettings: boolean;
}

export function PrivacyControlsPanel({ settings, onSettingsChange }: PrivacyControlsPanelProps) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleteSelections, setDeleteSelections] = useState<DeleteSelections>({
    transactions: false,
    accounts: false,
    balances: false,
    categories: false,
    budgets: false,
    privacySettings: false,
  });
  const [isDeleting, setIsDeleting] = useState(false);

  function handleToggle(field: keyof PrivacySettings) {
    if (field === "updatedAt") return; // Don't allow toggling timestamp
    if (field === "chatbotDataAccess" || field === "chatbotConversationRetention") return; // Don't toggle non-boolean fields

    const newSettings: PrivacySettings = {
      ...settings,
      [field]: !settings[field],
    };

    // If disabling AI Features master switch, disable all AI-dependent features (including chatbot)
    if (field === "enableAIFeatures" && !newSettings.enableAIFeatures) {
      newSettings.enableSmartDuplicateDetection = false;
      newSettings.enableAnomalyDetection = false;
      newSettings.enablePredictiveSpending = false;
      newSettings.enableNaturalLanguageImport = false;
      newSettings.enableChatbot = false; // Chatbot also requires AI features
    }

    // If enabling an AI feature, automatically enable AI Features
    if (
      (field === "enableSmartDuplicateDetection" ||
        field === "enableAnomalyDetection" ||
        field === "enablePredictiveSpending" ||
        field === "enableNaturalLanguageImport" ||
        field === "enableChatbot") &&
      newSettings[field]
    ) {
      newSettings.enableAIFeatures = true;
    }

    onSettingsChange(newSettings);
  }

  function handleChatbotDataAccessChange(value: "read-only" | "full-access") {
    onSettingsChange({
      ...settings,
      chatbotDataAccess: value,
    });
  }

  function handleChatbotRetentionChange(value: 7 | 30 | "forever") {
    onSettingsChange({
      ...settings,
      chatbotConversationRetention: value,
    });
  }

  async function handleExportData() {
    try {
      const { db } = await import("@/lib/budget-db");
      const [accounts, categories, transactions, budgets] = await Promise.all([
        db.accounts.toArray(),
        db.categories.toArray(),
        db.transactions.toArray(),
        db.budgets.toArray(),
      ]);

      const exportData = {
        version: "1.0",
        exportedAt: new Date().toISOString(),
        accounts,
        categories,
        transactions,
        budgets,
        privacySettings: settings,
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `budget-app-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting data:", error);
      alert("Failed to export data. Please try again.");
    }
  }

  function toggleDeleteSelection(key: keyof DeleteSelections) {
    setDeleteSelections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    setShowConfirmDelete(false); // Reset confirmation when selection changes
  }

  function selectAllForDeletion() {
    const allSelected = Object.values(deleteSelections).every((v) => v);
    setDeleteSelections({
      transactions: !allSelected,
      accounts: !allSelected,
      balances: !allSelected,
      categories: !allSelected,
      budgets: !allSelected,
      privacySettings: !allSelected,
    });
    setShowConfirmDelete(false);
  }

  const hasAnySelection = Object.values(deleteSelections).some((v) => v);
  const selectedCount = Object.values(deleteSelections).filter((v) => v).length;

  async function handleDeleteSelectedData() {
    if (!hasAnySelection) return;

    if (!showConfirmDelete) {
      setShowConfirmDelete(true);
      return;
    }

    setIsDeleting(true);
    try {
      const { db } = await import("@/lib/budget-db");
      const deletions: Promise<void>[] = [];

      if (deleteSelections.transactions) {
        deletions.push(db.transactions.clear());
      }
      if (deleteSelections.accounts) {
        deletions.push(db.accounts.clear());
      }
      if (deleteSelections.balances && !deleteSelections.accounts) {
        // Only reset balances if we're not deleting accounts entirely
        deletions.push(
          db.accounts
            .toCollection()
            .modify({ balance: 0 })
            .then(() => undefined) // Convert number result to void
        );
      }
      if (deleteSelections.categories) {
        deletions.push(db.categories.clear());
      }
      if (deleteSelections.budgets) {
        deletions.push(db.budgets.clear());
      }

      await Promise.all(deletions);

      if (deleteSelections.privacySettings) {
        const { resetPrivacySettings, getPrivacySettings } = await import(
          "@/lib/budget-privacy-settings"
        );
        resetPrivacySettings();
        onSettingsChange(getPrivacySettings());
      }

      const deletedItems = [
        deleteSelections.transactions && "transactions",
        deleteSelections.accounts && "accounts",
        deleteSelections.balances && !deleteSelections.accounts && "account balances",
        deleteSelections.categories && "categories",
        deleteSelections.budgets && "budgets",
        deleteSelections.privacySettings && "privacy settings",
      ]
        .filter(Boolean)
        .join(", ");

      alert(`Successfully cleared: ${deletedItems}`);

      // Reset selections
      setDeleteSelections({
        transactions: false,
        accounts: false,
        balances: false,
        categories: false,
        budgets: false,
        privacySettings: false,
      });
      setShowConfirmDelete(false);

      // Reload if accounts, balances, or transactions were deleted (affects most of the app)
      if (deleteSelections.accounts || deleteSelections.transactions || deleteSelections.balances) {
        window.location.reload();
      }
    } catch (error) {
      console.error("Error deleting data:", error);
      alert("Failed to delete data. Please try again.");
    } finally {
      setIsDeleting(false);
    }
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
        <p className="mt-1 text-sm text-gray-600">
          Control how your data is processed and which AI features are enabled
        </p>
      </div>

      {/* Privacy Notice */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
          <div className="flex-1">
            <h3 className="mb-1 text-sm font-semibold text-blue-900">Privacy First</h3>
            <p className="text-sm text-blue-800">
              All processing happens in your browser. No transaction data is uploaded to servers. AI
              features are opt-in and only send cleaned transaction descriptions (no account
              numbers, names, or addresses) when enabled.
            </p>
          </div>
        </div>
      </div>

      {/* AI Features Section */}
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="mb-4 flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">AI Features</h3>
        </div>

        {/* AI Features Master Switch */}
        <div className="mb-6 border-b border-gray-200 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-gray-900">AI Features (Master Switch)</h4>
                {aiFeaturesEnabled && (
                  <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-700">
                    Active
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-gray-600">
                Enable AI Features powered by OpenAI for advanced functionality. When disabled, all
                AI-dependent features are automatically disabled.
              </p>
              {aiFeaturesEnabled && (
                <div className="mt-2 text-xs text-gray-500">
                  <strong>What's sent:</strong> Only cleaned transaction descriptions (e.g.,
                  "AMAZON.COM"). No account numbers, names, or addresses. Powered by OpenAI
                  GPT-4o-mini.
                </div>
              )}
            </div>
            <ToggleSwitch
              checked={settings.enableAIFeatures}
              onChange={() => handleToggle("enableAIFeatures")}
            />
          </div>
        </div>

        {/* Smart Duplicate Detection */}
        <SettingRow
          title="Smart Duplicate Detection"
          description="Use AI to detect duplicate transactions even when merchant names differ (e.g., 'AMAZON PRIME' vs 'AMZN MKTP CA')"
          checked={settings.enableSmartDuplicateDetection}
          onChange={() => handleToggle("enableSmartDuplicateDetection")}
          disabled={!aiFeaturesEnabled}
          requiresAI={true}
        />

        {/* Anomaly Detection */}
        <SettingRow
          title="Anomaly Detection"
          description="Flag unusual spending patterns (e.g., 'Your Starbucks purchase of $85 is unusual')"
          checked={settings.enableAnomalyDetection}
          onChange={() => handleToggle("enableAnomalyDetection")}
          disabled={!aiFeaturesEnabled}
          requiresAI={true}
        />

        {/* Predictive Spending */}
        <SettingRow
          title="Predictive Spending"
          description="Forecast monthly spending by category using AI analysis"
          checked={settings.enablePredictiveSpending}
          onChange={() => handleToggle("enablePredictiveSpending")}
          disabled={!aiFeaturesEnabled}
          requiresAI={true}
        />

        {/* Natural Language Import */}
        <SettingRow
          title="Natural Language Import"
          description="Auto-configure bank imports using natural language (e.g., 'Import my TD checking account CSV')"
          checked={settings.enableNaturalLanguageImport}
          onChange={() => handleToggle("enableNaturalLanguageImport")}
          disabled={!aiFeaturesEnabled}
          requiresAI={true}
        />
      </div>

      {/* Chatbot Section */}
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="mb-4 flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-900">Budget Chatbot</h3>
        </div>

        {/* Chatbot Master Switch */}
        <div className="mb-6 border-b border-gray-200 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-gray-900">Enable Chatbot</h4>
                {settings.enableChatbot && (
                  <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs text-indigo-700">
                    Active
                  </span>
                )}
                {!aiFeaturesEnabled && (
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                    Requires AI Features
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-gray-600">
                AI-powered assistant that can answer questions about your transactions, budgets, and
                spending patterns. Conversations are processed via OpenAI API.
              </p>
              {settings.enableChatbot && (
                <div className="mt-2 text-xs text-gray-500">
                  <strong>Privacy:</strong> Your financial data is sent to OpenAI to answer
                  questions. OpenAI does not use API data to train models. You can disable anytime.
                </div>
              )}
            </div>
            <ToggleSwitch
              checked={settings.enableChatbot}
              onChange={() => handleToggle("enableChatbot")}
              disabled={!aiFeaturesEnabled}
            />
          </div>
        </div>

        {/* Data Access Level */}
        {settings.enableChatbot && (
          <>
            <div className="mb-6 border-b border-gray-200 pb-6">
              <h4 className="mb-3 font-medium text-gray-900">Data Access Permission</h4>
              <div className="space-y-2">
                <label className="flex cursor-pointer items-start gap-3 rounded-lg border-2 border-gray-200 bg-gray-50 p-3 transition-colors hover:border-indigo-500">
                  <input
                    type="radio"
                    name="chatbotDataAccess"
                    value="read-only"
                    checked={settings.chatbotDataAccess === "read-only"}
                    onChange={() => handleChatbotDataAccessChange("read-only")}
                    className="mt-1 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Read-Only (Recommended)</div>
                    <div className="mt-1 text-sm text-gray-600">
                      Chatbot can view data and answer questions but cannot modify anything
                    </div>
                  </div>
                </label>
                <label className="flex cursor-pointer items-start gap-3 rounded-lg border-2 border-gray-200 bg-gray-50 p-3 transition-colors hover:border-indigo-500">
                  <input
                    type="radio"
                    name="chatbotDataAccess"
                    value="full-access"
                    checked={settings.chatbotDataAccess === "full-access"}
                    onChange={() => handleChatbotDataAccessChange("full-access")}
                    className="mt-1 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Full Access</div>
                    <div className="mt-1 text-sm text-gray-600">
                      Chatbot can perform actions like adding transactions and creating budgets
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Conversation Retention */}
            <div className="mb-4">
              <h4 className="mb-3 font-medium text-gray-900">Conversation History</h4>
              <div className="space-y-2">
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border-2 border-gray-200 bg-gray-50 p-3 transition-colors hover:border-indigo-500">
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
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border-2 border-gray-200 bg-gray-50 p-3 transition-colors hover:border-indigo-500">
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
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border-2 border-gray-200 bg-gray-50 p-3 transition-colors hover:border-indigo-500">
                  <input
                    type="radio"
                    name="chatbotRetention"
                    value="forever"
                    checked={settings.chatbotConversationRetention === "forever"}
                    onChange={() => handleChatbotRetentionChange("forever")}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-gray-900">Keep forever</span>
                </label>
              </div>
              <p className="mt-2 text-xs text-gray-600">
                Conversations are stored locally in your browser. You can manually delete them
                anytime.
              </p>
            </div>
          </>
        )}
      </div>

      {/* Analytics & Monitoring Section */}
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Analytics & Monitoring</h3>
        </div>

        <SettingRow
          title="Enable Analytics"
          description="Track feature usage and app performance using PostHog. No personal financial data (amounts, descriptions) is collected."
          checked={settings.enableAnalytics}
          onChange={() => handleToggle("enableAnalytics")}
        />

        <SettingRow
          title="Enable Error Tracking"
          description="Automatically report errors and crashes to Sentry to help improve the app. No financial data is included in error reports."
          checked={settings.enableErrorTracking}
          onChange={() => handleToggle("enableErrorTracking")}
        />
      </div>

      {/* Data Processing Section */}
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="mb-4 flex items-center gap-2">
          <Eye className="h-5 w-5 text-teal-600" />
          <h3 className="text-lg font-semibold text-gray-900">Data Processing</h3>
        </div>

        <SettingRow
          title="Receipt OCR"
          description="Extract transaction details from receipt images using client-side OCR (Tesseract.js). No data leaves your device."
          checked={settings.enableOCR}
          onChange={() => handleToggle("enableOCR")}
        />
      </div>

      {/* Data Security Section */}
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="mb-4 flex items-center gap-2">
          <Lock className="h-5 w-5 text-green-600" />
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
              const { isEncryptionAvailable } = await import("@/lib/encryption");
              if (!isEncryptionAvailable()) {
                alert(
                  "Encryption is not available in this browser. Please use a modern browser with Web Crypto API support."
                );
                return;
              }
              // Generate encryption key if needed
              const { getOrCreateEncryptionKey } = await import("@/lib/encryption");
              try {
                await getOrCreateEncryptionKey();
                handleToggle("enableEncryption");
              } catch (error) {
                console.error("Failed to initialize encryption:", error);
                alert("Failed to enable encryption. Please try again.");
              }
            } else {
              // Disable encryption (doesn't decrypt existing data, just stops encrypting new data)
              handleToggle("enableEncryption");
            }
          }}
        />
        {settings.enableEncryption && (
          <div className="mt-2 rounded bg-green-50 p-2 text-xs text-green-700">
            <CheckCircle2 className="mr-1 inline h-4 w-4" />
            Encryption is active. Your data is encrypted in IndexedDB.
          </div>
        )}
      </div>

      {/* Data Management Section */}
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Data Management</h3>
        </div>

        <div className="space-y-4">
          {/* Export Data */}
          <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Download className="h-5 w-5 text-gray-600" />
                <h4 className="font-medium text-gray-900">Export All Data</h4>
              </div>
              <p className="mt-1 text-sm text-gray-600">
                Download all your accounts, transactions, categories, and budgets as JSON
              </p>
            </div>
            <button
              onClick={handleExportData}
              className="rounded-lg bg-teal-600 px-4 py-2 text-white transition-colors hover:bg-teal-700"
            >
              Export
            </button>
          </div>

          {/* Selective Data Deletion */}
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-red-600" />
                <h4 className="font-medium text-gray-900">Delete Data</h4>
              </div>
              <button
                onClick={selectAllForDeletion}
                className="text-sm text-red-600 underline hover:text-red-700"
              >
                {Object.values(deleteSelections).every((v) => v) ? "Deselect All" : "Select All"}
              </button>
            </div>

            <p className="mb-4 text-sm text-gray-600">
              Select which data you want to permanently delete:
            </p>

            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <DeleteCheckbox
                label="Transactions"
                description="All imported and manual transactions"
                checked={deleteSelections.transactions}
                onChange={() => toggleDeleteSelection("transactions")}
              />
              <DeleteCheckbox
                label="Accounts"
                description="Bank accounts and credit cards"
                checked={deleteSelections.accounts}
                onChange={() => toggleDeleteSelection("accounts")}
              />
              <DeleteCheckbox
                label="Account Balances"
                description="Reset all account balances to $0"
                checked={deleteSelections.balances}
                onChange={() => toggleDeleteSelection("balances")}
                disabled={deleteSelections.accounts}
              />
              <DeleteCheckbox
                label="Categories"
                description="Custom spending categories"
                checked={deleteSelections.categories}
                onChange={() => toggleDeleteSelection("categories")}
              />
              <DeleteCheckbox
                label="Budgets"
                description="Monthly budget allocations"
                checked={deleteSelections.budgets}
                onChange={() => toggleDeleteSelection("budgets")}
              />
              <DeleteCheckbox
                label="Privacy Settings"
                description="Reset all settings to defaults"
                checked={deleteSelections.privacySettings}
                onChange={() => toggleDeleteSelection("privacySettings")}
              />
            </div>

            {showConfirmDelete && hasAnySelection && (
              <div className="mb-4 flex items-start gap-2 rounded-lg bg-red-100 p-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-red-800">This action cannot be undone!</p>
                  <p className="mt-1 text-sm text-red-700">
                    You are about to permanently delete {selectedCount} data type
                    {selectedCount > 1 ? "s" : ""}. Click &quot;Confirm Delete&quot; to proceed.
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                {hasAnySelection ? `${selectedCount} selected` : "Nothing selected"}
              </span>
              <button
                onClick={handleDeleteSelectedData}
                disabled={!hasAnySelection || isDeleting}
                className={`rounded-lg px-4 py-2 transition-colors ${
                  hasAnySelection
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "cursor-not-allowed bg-gray-300 text-gray-500"
                } ${isDeleting ? "cursor-wait opacity-50" : ""}`}
              >
                {isDeleting
                  ? "Deleting..."
                  : showConfirmDelete
                    ? "Confirm Delete"
                    : "Delete Selected"}
              </button>
            </div>
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
  requiresAI = false,
}: SettingRowProps) {
  return (
    <div className={`mb-4 pb-4 ${disabled ? "opacity-50" : ""}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-gray-900">{title}</h4>
            {requiresAI && (
              <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-700">
                Requires AI Features
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-gray-600">{description}</p>
        </div>
        <ToggleSwitch checked={checked} onChange={onChange} disabled={disabled} />
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
        checked ? "bg-teal-600" : "bg-gray-200"
      } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

interface DeleteCheckboxProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}

function DeleteCheckbox({
  label,
  description,
  checked,
  onChange,
  disabled = false,
}: DeleteCheckboxProps) {
  return (
    <label
      className={`flex items-start gap-3 rounded-lg border-2 p-3 transition-colors ${
        disabled
          ? "cursor-not-allowed border-gray-200 bg-gray-100 opacity-50"
          : checked
            ? "cursor-pointer border-red-400 bg-red-100"
            : "cursor-pointer border-gray-200 bg-white hover:border-red-300"
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="mt-0.5 h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500 disabled:opacity-50"
      />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-gray-900">{label}</div>
        <div className="mt-0.5 text-xs text-gray-500">
          {description}
          {disabled && <span className="italic text-gray-400"> (included in Accounts)</span>}
        </div>
      </div>
    </label>
  );
}
