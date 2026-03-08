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
import { useTranslations } from "next-intl";

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
  const t = useTranslations("privacyPanel");
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
      alert(t("exportFailed"));
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
        deleteSelections.transactions && t("dataTransactions"),
        deleteSelections.accounts && t("dataAccounts"),
        deleteSelections.balances && !deleteSelections.accounts && t("dataAccountBalances"),
        deleteSelections.categories && t("dataCategories"),
        deleteSelections.budgets && t("dataBudgets"),
        deleteSelections.privacySettings && t("dataPrivacySettings"),
      ]
        .filter(Boolean)
        .join(", ");

      alert(t("successfullyCleared", { items: deletedItems }));

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
      alert(t("deleteFailed"));
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
        <h2 className="text-xl font-semibold text-gray-900">{t("title")}</h2>
        <p className="mt-1 text-sm text-gray-600">{t("subtitle")}</p>
      </div>

      {/* Privacy Notice */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
          <div className="flex-1">
            <h3 className="mb-1 text-sm font-semibold text-blue-900">{t("privacyFirst")}</h3>
            <p className="text-sm text-blue-800">{t("privacyNotice")}</p>
          </div>
        </div>
      </div>

      {/* AI Features Section */}
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="mb-4 flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">{t("aiFeatures")}</h3>
        </div>

        {/* AI Features Master Switch */}
        <div className="mb-6 border-b border-gray-200 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-gray-900">{t("aiFeaturesTitle")}</h4>
                {aiFeaturesEnabled && (
                  <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-700">
                    {t("active")}
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-gray-600">{t("aiFeaturesDescription")}</p>
              {aiFeaturesEnabled && (
                <div className="mt-2 text-xs text-gray-500">
                  <strong>{t("whatsSent")}</strong> {t("whatsSentDescription")}
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
          title={t("smartDuplicateDetection")}
          description={t("smartDuplicateDetectionDescription")}
          checked={settings.enableSmartDuplicateDetection}
          onChange={() => handleToggle("enableSmartDuplicateDetection")}
          disabled={!aiFeaturesEnabled}
          requiresAI={true}
          requiresAILabel={t("requiresAIFeatures")}
        />

        {/* Anomaly Detection */}
        <SettingRow
          title={t("anomalyDetection")}
          description={t("anomalyDetectionDescription")}
          checked={settings.enableAnomalyDetection}
          onChange={() => handleToggle("enableAnomalyDetection")}
          disabled={!aiFeaturesEnabled}
          requiresAI={true}
          requiresAILabel={t("requiresAIFeatures")}
        />

        {/* Predictive Spending */}
        <SettingRow
          title={t("predictiveSpending")}
          description={t("predictiveSpendingDescription")}
          checked={settings.enablePredictiveSpending}
          onChange={() => handleToggle("enablePredictiveSpending")}
          disabled={!aiFeaturesEnabled}
          requiresAI={true}
          requiresAILabel={t("requiresAIFeatures")}
        />

        {/* Natural Language Import */}
        <SettingRow
          title={t("naturalLanguageImport")}
          description={t("naturalLanguageImportDescription")}
          checked={settings.enableNaturalLanguageImport}
          onChange={() => handleToggle("enableNaturalLanguageImport")}
          disabled={!aiFeaturesEnabled}
          requiresAI={true}
          requiresAILabel={t("requiresAIFeatures")}
        />
      </div>

      {/* Chatbot Section */}
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="mb-4 flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-900">{t("budgetChatbot")}</h3>
        </div>

        {/* Chatbot Master Switch */}
        <div className="mb-6 border-b border-gray-200 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-gray-900">{t("enableChatbot")}</h4>
                {settings.enableChatbot && (
                  <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs text-indigo-700">
                    {t("active")}
                  </span>
                )}
                {!aiFeaturesEnabled && (
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                    {t("requiresAIFeatures")}
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-gray-600">{t("chatbotDescription")}</p>
              {settings.enableChatbot && (
                <div className="mt-2 text-xs text-gray-500">
                  <strong>{t("privacy")}</strong> {t("chatbotPrivacyNotice")}
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
              <h4 className="mb-3 font-medium text-gray-900">{t("dataAccessPermission")}</h4>
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
                    <div className="font-medium text-gray-900">{t("readOnlyRecommended")}</div>
                    <div className="mt-1 text-sm text-gray-600">{t("readOnlyDescription")}</div>
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
                    <div className="font-medium text-gray-900">{t("fullAccess")}</div>
                    <div className="mt-1 text-sm text-gray-600">{t("fullAccessDescription")}</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Conversation Retention */}
            <div className="mb-4">
              <h4 className="mb-3 font-medium text-gray-900">{t("conversationHistory")}</h4>
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
                  <span className="text-gray-900">{t("deleteAfter7Days")}</span>
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
                  <span className="text-gray-900">{t("deleteAfter30Days")}</span>
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
                  <span className="text-gray-900">{t("keepForever")}</span>
                </label>
              </div>
              <p className="mt-2 text-xs text-gray-600">{t("conversationStorageNotice")}</p>
            </div>
          </>
        )}
      </div>

      {/* Analytics & Monitoring Section */}
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">{t("analyticsAndMonitoring")}</h3>
        </div>

        <SettingRow
          title={t("enableAnalytics")}
          description={t("enableAnalyticsDescription")}
          checked={settings.enableAnalytics}
          onChange={() => handleToggle("enableAnalytics")}
        />

        <SettingRow
          title={t("enableErrorTracking")}
          description={t("enableErrorTrackingDescription")}
          checked={settings.enableErrorTracking}
          onChange={() => handleToggle("enableErrorTracking")}
        />
      </div>

      {/* Data Processing Section */}
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="mb-4 flex items-center gap-2">
          <Eye className="h-5 w-5 text-teal-600" />
          <h3 className="text-lg font-semibold text-gray-900">{t("dataProcessing")}</h3>
        </div>

        <SettingRow
          title={t("receiptOCR")}
          description={t("receiptOCRDescription")}
          checked={settings.enableOCR}
          onChange={() => handleToggle("enableOCR")}
        />
      </div>

      {/* Data Security Section */}
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="mb-4 flex items-center gap-2">
          <Lock className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">{t("dataSecurity")}</h3>
        </div>

        <SettingRow
          title={t("encryptStoredData")}
          description={t("encryptStoredDataDescription")}
          checked={settings.enableEncryption}
          onChange={async () => {
            const newValue = !settings.enableEncryption;
            if (newValue) {
              // Enable encryption - check if encryption is available
              const { isEncryptionAvailable } = await import("@/lib/encryption");
              if (!isEncryptionAvailable()) {
                alert(t("encryptionNotAvailable"));
                return;
              }
              // Generate encryption key if needed
              const { getOrCreateEncryptionKey } = await import("@/lib/encryption");
              try {
                await getOrCreateEncryptionKey();
                handleToggle("enableEncryption");
              } catch (error) {
                console.error("Failed to initialize encryption:", error);
                alert(t("encryptionFailed"));
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
            {t("encryptionActive")}
          </div>
        )}
      </div>

      {/* Data Management Section */}
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">{t("dataManagement")}</h3>
        </div>

        <div className="space-y-4">
          {/* Export Data */}
          <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Download className="h-5 w-5 text-gray-600" />
                <h4 className="font-medium text-gray-900">{t("exportAllData")}</h4>
              </div>
              <p className="mt-1 text-sm text-gray-600">{t("exportAllDataDescription")}</p>
            </div>
            <button
              onClick={handleExportData}
              className="rounded-lg bg-teal-600 px-4 py-2 text-white transition-colors hover:bg-teal-700"
            >
              {t("export")}
            </button>
          </div>

          {/* Selective Data Deletion */}
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-red-600" />
                <h4 className="font-medium text-gray-900">{t("deleteData")}</h4>
              </div>
              <button
                onClick={selectAllForDeletion}
                className="text-sm text-red-600 underline hover:text-red-700"
              >
                {Object.values(deleteSelections).every((v) => v)
                  ? t("deselectAll")
                  : t("selectAll")}
              </button>
            </div>

            <p className="mb-4 text-sm text-gray-600">{t("selectDataToDelete")}</p>

            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <DeleteCheckbox
                label={t("deleteTransactionsLabel")}
                description={t("deleteTransactionsDescription")}
                checked={deleteSelections.transactions}
                onChange={() => toggleDeleteSelection("transactions")}
              />
              <DeleteCheckbox
                label={t("deleteAccountsLabel")}
                description={t("deleteAccountsDescription")}
                checked={deleteSelections.accounts}
                onChange={() => toggleDeleteSelection("accounts")}
              />
              <DeleteCheckbox
                label={t("deleteBalancesLabel")}
                description={t("deleteBalancesDescription")}
                checked={deleteSelections.balances}
                onChange={() => toggleDeleteSelection("balances")}
                disabled={deleteSelections.accounts}
                includedInLabel={t("includedInAccounts")}
              />
              <DeleteCheckbox
                label={t("deleteCategoriesLabel")}
                description={t("deleteCategoriesDescription")}
                checked={deleteSelections.categories}
                onChange={() => toggleDeleteSelection("categories")}
              />
              <DeleteCheckbox
                label={t("deleteBudgetsLabel")}
                description={t("deleteBudgetsDescription")}
                checked={deleteSelections.budgets}
                onChange={() => toggleDeleteSelection("budgets")}
              />
              <DeleteCheckbox
                label={t("deletePrivacySettingsLabel")}
                description={t("deletePrivacySettingsDescription")}
                checked={deleteSelections.privacySettings}
                onChange={() => toggleDeleteSelection("privacySettings")}
              />
            </div>

            {showConfirmDelete && hasAnySelection && (
              <div className="mb-4 flex items-start gap-2 rounded-lg bg-red-100 p-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-red-800">{t("cannotBeUndone")}</p>
                  <p className="mt-1 text-sm text-red-700">
                    {t("confirmDeleteWarning", { count: selectedCount })}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                {hasAnySelection ? t("nSelected", { count: selectedCount }) : t("nothingSelected")}
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
                  ? t("deleting")
                  : showConfirmDelete
                    ? t("confirmDelete")
                    : t("deleteSelected")}
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
  requiresAILabel?: string;
}

function SettingRow({
  title,
  description,
  checked,
  onChange,
  disabled = false,
  requiresAI = false,
  requiresAILabel,
}: SettingRowProps) {
  return (
    <div className={`mb-4 pb-4 ${disabled ? "opacity-50" : ""}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-gray-900">{title}</h4>
            {requiresAI && (
              <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-700">
                {requiresAILabel}
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
  includedInLabel?: string;
}

function DeleteCheckbox({
  label,
  description,
  checked,
  onChange,
  disabled = false,
  includedInLabel,
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
          {disabled && includedInLabel && (
            <span className="italic text-gray-400"> ({includedInLabel})</span>
          )}
        </div>
      </div>
    </label>
  );
}
