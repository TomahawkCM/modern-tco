"use client";

/**
 * Settings Page
 * Manage accounts, categories, and app settings
 * Enhanced with drag-and-drop reordering, icon picker, transaction counts, and archive functionality
 */

import { db } from "@/lib/budget-db";
import {
  getPrivacySettings,
  savePrivacySettings,
  type PrivacySettings,
} from "@/lib/budget-privacy-settings";
import type { Account, Category } from "@/types/budget";
import {
  CreditCard,
  Edit,
  Plus,
  Shield,
  Tag,
  Trash2,
  Eye,
  GripVertical,
  Archive,
  RotateCcw,
  Database,
  Download,
  Upload,
  Globe,
  Wrench,
  Users,
  Bell,
  Bot,
} from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useDefaultCurrency } from "@/hooks/useDefaultCurrency";
import { formatCurrency } from "@/i18n/utils/formatCurrency";
import type { SupportedLocale } from "@/i18n/config";
import { useSearchParams } from "next/navigation";
import { PrivacyControlsPanel } from "./settings-privacy-panel";
import { AccessibilitySettingsPanel } from "@/components/budget/AccessibilitySettingsPanel";
import { LocaleSettingsPanel } from "@/components/budget/settings/LocaleSettingsPanel";
import { DeveloperTools } from "@/components/budget/settings/DeveloperTools";
import { ProfileSettingsPanel } from "@/components/budget/settings/ProfileSettingsPanel";
import { NotificationSettingsPanel } from "@/components/budget/settings/NotificationSettingsPanel";
import { IconPicker, getIconComponent } from "@/components/budget/IconPicker";
import { ExportDialog } from "@/components/budget/ExportDialog";
import { ImportDialog } from "@/components/budget/ImportDialog";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type TabType =
  | "accounts"
  | "categories"
  | "privacy"
  | "accessibility"
  | "data"
  | "locale"
  | "developer"
  | "profile"
  | "notifications";

export default function SettingsPage() {
  return (
    <Suspense fallback={<SettingsLoadingFallback />}>
      <SettingsContent />
    </Suspense>
  );
}

function SettingsLoadingFallback() {
  const t = useTranslations("settings");
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-teal-600 border-t-transparent"></div>
        <p className="mt-4 text-gray-600">{t("loading")}</p>
      </div>
    </div>
  );
}

function SettingsContent() {
  const t = useTranslations("settings");
  const locale = useLocale() as SupportedLocale;
  const defaultCurrency = useDefaultCurrency();
  const searchParams = useSearchParams();
  const initialTab = searchParams?.get("tab") as TabType | null;
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryTransactionCounts, setCategoryTransactionCounts] = useState<
    Record<string, number>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>(initialTab || "accounts");
  const isDev = process.env.NODE_ENV === "development";
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>(getPrivacySettings());
  const [showArchivedCategories, setShowArchivedCategories] = useState(false);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadData();
  }, []);

  // Sync tab with URL params
  useEffect(() => {
    const tabFromUrl = searchParams?.get("tab") as TabType | null;
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  async function loadData() {
    try {
      const [accts, cats, txs] = await Promise.all([
        db.accounts.toArray(),
        db.categories.toArray(),
        db.transactions.toArray(),
      ]);

      setAccounts(accts);
      setCategories(cats.sort((a, b) => a.order - b.order));

      // Calculate transaction counts per category
      const counts: Record<string, number> = {};
      cats.forEach((cat) => {
        counts[cat.id] = txs.filter((tx) => tx.category === cat.name).length;
      });
      setCategoryTransactionCounts(counts);
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function saveAccount(account: Account) {
    try {
      if (editingAccount) {
        await db.accounts.update(account.id, { ...account, updatedAt: new Date() });
      } else {
        await db.accounts.add(account);
      }
      await loadData();
      setShowAccountModal(false);
      setEditingAccount(null);
    } catch (error) {
      console.error("Error saving account:", error);
      alert(t("accountSaveFailed"));
    }
  }

  async function deleteAccount(id: string) {
    if (!confirm(t("deleteAccountConfirm"))) return;

    try {
      await db.accounts.delete(id);
      await loadData();
    } catch (error) {
      console.error("Error deleting account:", error);
      alert(t("accountDeleteFailed"));
    }
  }

  async function saveCategory(category: Category) {
    try {
      if (editingCategory) {
        await db.categories.update(category.id, {
          name: category.name,
          type: category.type,
          subcategories: category.subcategories,
          color: category.color,
          icon: category.icon,
          order: category.order,
        });
      } else {
        await db.categories.add(category);
      }
      await loadData();
      setShowCategoryModal(false);
      setEditingCategory(null);
    } catch (error) {
      console.error("Error saving category:", error);
      alert(t("categorySaveFailed"));
    }
  }

  async function archiveCategory(id: string) {
    const transactionCount = categoryTransactionCounts[id] || 0;

    if (transactionCount > 0) {
      if (!confirm(t("archiveCategoryWithTransactions", { count: transactionCount }))) {
        return;
      }
    } else {
      if (!confirm(t("archiveCategoryConfirm"))) {
        return;
      }
    }

    try {
      await db.categories.update(id, {
        archived: true,
        archivedAt: new Date(),
      });
      await loadData();
    } catch (error) {
      console.error("Error archiving category:", error);
      alert(t("archiveFailed"));
    }
  }

  async function unarchiveCategory(id: string) {
    try {
      await db.categories.update(id, {
        archived: false,
        archivedAt: undefined,
      });
      await loadData();
    } catch (error) {
      console.error("Error unarchiving category:", error);
      alert(t("unarchiveFailed"));
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const activeCategory = categories.find((cat) => cat.id === active.id);
    const overCategory = categories.find((cat) => cat.id === over.id);

    if (!activeCategory || !overCategory) {
      return;
    }

    const oldIndex = categories.findIndex((cat) => cat.id === active.id);
    const newIndex = categories.findIndex((cat) => cat.id === over.id);

    const newCategories = arrayMove(categories, oldIndex, newIndex);

    // Update order field for all categories
    const updates = newCategories.map((cat, index) =>
      db.categories.update(cat.id, { order: index })
    );

    try {
      await Promise.all(updates);
      await loadData();
    } catch (error) {
      console.error("Error reordering categories:", error);
      alert(t("reorderFailed"));
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-teal-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">{t("loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">{t("title")}</h1>
        <p className="mt-2 text-slate-400">{t("subtitle")}</p>
      </div>

      {/* Mobile Tab Selector */}
      <div className="md:hidden">
        <label htmlFor="settings-tab-select" className="sr-only">
          {t("selectSection")}
        </label>
        <select
          id="settings-tab-select"
          value={activeTab}
          onChange={(e) => setActiveTab(e.target.value as TabType)}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
        >
          <option value="accounts" className="bg-slate-900">
            {t("tabAccounts")} ({accounts.length})
          </option>
          <option value="categories" className="bg-slate-900">
            {t("tabCategories")} ({categories.length})
          </option>
          <option value="notifications" className="bg-slate-900">
            {t("tabNotifications")}
          </option>
          <option value="privacy" className="bg-slate-900">
            {t("tabPrivacy")}
          </option>
          <option value="accessibility" className="bg-slate-900">
            {t("tabAccessibility")}
          </option>
          <option value="data" className="bg-slate-900">
            {t("tabData")}
          </option>
          <option value="locale" className="bg-slate-900">
            {t("tabLocale")}
          </option>
          <option value="profile" className="bg-slate-900">
            {t("tabProfiles")}
          </option>
          {isDev && (
            <option value="developer" className="bg-slate-900">
              {t("tabDevTools")}
            </option>
          )}
        </select>
      </div>

      {/* Desktop Tabs - Scrollable */}
      <div className="hidden overflow-x-auto border-b border-white/10 md:block">
        <div className="flex min-w-max gap-1 pb-px lg:gap-4">
          <button
            onClick={() => setActiveTab("accounts")}
            className={`whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors ${
              activeTab === "accounts"
                ? "border-teal-500 text-teal-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span>{t("tabAccounts")}</span>
              <span className="text-xs opacity-70">({accounts.length})</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("categories")}
            className={`whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors ${
              activeTab === "categories"
                ? "border-teal-500 text-teal-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              <span>{t("tabCategories")}</span>
              <span className="text-xs opacity-70">({categories.length})</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("notifications")}
            className={`whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors ${
              activeTab === "notifications"
                ? "border-teal-500 text-teal-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span>{t("tabNotifications")}</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("privacy")}
            className={`whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors ${
              activeTab === "privacy"
                ? "border-teal-500 text-teal-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>{t("tabPrivacy")}</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("accessibility")}
            className={`whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors ${
              activeTab === "accessibility"
                ? "border-teal-500 text-teal-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <span>{t("tabAccessibility")}</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("data")}
            className={`whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors ${
              activeTab === "data"
                ? "border-teal-500 text-teal-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span>{t("tabData")}</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("locale")}
            className={`whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors ${
              activeTab === "locale"
                ? "border-teal-500 text-teal-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span>{t("tabLocale")}</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors ${
              activeTab === "profile"
                ? "border-teal-500 text-teal-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>{t("tabProfiles")}</span>
            </div>
          </button>
          {isDev && (
            <button
              onClick={() => setActiveTab("developer")}
              className={`whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors ${
                activeTab === "developer"
                  ? "border-yellow-500 text-yellow-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <div className="flex items-center gap-2">
                <Wrench className="h-4 w-4" />
                <span>{t("tabDevTools")}</span>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Accounts Tab */}
      {activeTab === "accounts" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">{t("yourAccounts")}</h2>
            <button
              onClick={() => {
                setEditingAccount(null);
                setShowAccountModal(true);
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-white transition-colors hover:bg-teal-700"
            >
              <Plus className="h-4 w-4" />
              {t("addAccount")}
            </button>
          </div>

          {accounts.length > 0 ? (
            <div className="grid gap-4">
              {accounts.map((account) => (
                <div key={account.id} className="rounded-lg bg-white p-6 shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <h3 className="text-lg font-semibold text-gray-900">{account.name}</h3>
                        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                          {account.type}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-gray-600">{account.institution}</p>
                      <p className="mt-2 text-2xl font-bold text-gray-900">
                        {formatCurrency(
                          account.balance,
                          account.currency || defaultCurrency,
                          locale
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingAccount(account);
                          setShowAccountModal(true);
                        }}
                        className="text-teal-600 hover:text-teal-700"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteAccount(account.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg bg-white p-12 text-center shadow">
              <CreditCard className="mx-auto mb-4 h-16 w-16 text-gray-400" />
              <h3 className="mb-2 text-xl font-semibold text-gray-900">{t("noAccountsYet")}</h3>
              <p className="mb-6 text-gray-600">{t("addAccountsToStart")}</p>
              <button
                onClick={() => setShowAccountModal(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-6 py-2 text-white transition-colors hover:bg-teal-700"
              >
                <Plus className="h-5 w-5" />
                {t("addFirstAccount")}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Categories Tab - Enhanced */}
      {activeTab === "categories" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white">{t("categoriesTitle")}</h2>
              <p className="mt-1 text-base text-slate-400">{t("categoriesSubtitle")}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowArchivedCategories(!showArchivedCategories)}
                className={`inline-flex min-h-[48px] items-center gap-2 rounded-lg px-4 py-2 text-base font-semibold transition-all ${
                  showArchivedCategories
                    ? "bg-gray-200 text-gray-900"
                    : "border-2 border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                }`}
              >
                <Archive className="h-5 w-5" />
                {showArchivedCategories ? t("hideArchived") : t("showArchived")}
              </button>
              <button
                onClick={() => {
                  setEditingCategory(null);
                  setShowCategoryModal(true);
                }}
                className="inline-flex min-h-[48px] items-center gap-2 rounded-lg bg-teal-500 px-6 py-3 text-base font-semibold text-white shadow-md transition-all hover:bg-teal-600 hover:shadow-lg"
              >
                <Plus className="h-6 w-6" />
                {t("addCategory")}
              </button>
            </div>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={categories
                .filter((cat) => showArchivedCategories || !cat.archived)
                .map((cat) => cat.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="grid gap-4">
                {categories
                  .filter((cat) => showArchivedCategories || !cat.archived)
                  .map((category) => (
                    <SortableCategoryItem
                      key={category.id}
                      category={category}
                      transactionCount={categoryTransactionCounts[category.id] || 0}
                      onEdit={() => {
                        setEditingCategory(category);
                        setShowCategoryModal(true);
                      }}
                      onArchive={() => archiveCategory(category.id)}
                      onUnarchive={() => unarchiveCategory(category.id)}
                    />
                  ))}
              </div>
            </SortableContext>
          </DndContext>

          {categories.filter((cat) => showArchivedCategories || !cat.archived).length === 0 && (
            <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center shadow">
              <Tag className="mx-auto mb-4 h-16 w-16 text-gray-400" />
              <h3 className="mb-2 text-xl font-semibold text-gray-900">
                {showArchivedCategories ? t("noArchivedCategories") : t("noCategoriesYet")}
              </h3>
              <p className="mb-6 text-gray-600">
                {showArchivedCategories
                  ? t("archivedCategoriesAppearHere")
                  : t("addFirstCategoryToOrganize")}
              </p>
              {!showArchivedCategories && (
                <button
                  onClick={() => setShowCategoryModal(true)}
                  className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-6 py-2 text-white transition-colors hover:bg-teal-700"
                >
                  <Plus className="h-5 w-5" />
                  {t("addFirstCategory")}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Account Modal */}
      {showAccountModal && (
        <AccountModal
          account={editingAccount}
          onSave={saveAccount}
          onClose={() => {
            setShowAccountModal(false);
            setEditingAccount(null);
          }}
        />
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <CategoryModal
          category={editingCategory}
          onSave={saveCategory}
          onClose={() => {
            setShowCategoryModal(false);
            setEditingCategory(null);
          }}
        />
      )}

      {/* Privacy Tab */}
      {activeTab === "privacy" && (
        <>
          <PrivacyControlsPanel
            settings={privacySettings}
            onSettingsChange={(newSettings) => {
              setPrivacySettings(newSettings);
              savePrivacySettings(newSettings);
            }}
          />
          <WebMCPSettingsSection />
        </>
      )}

      {/* Accessibility Tab */}
      {activeTab === "accessibility" && <AccessibilitySettingsPanel />}

      {/* Data Tab */}
      {activeTab === "data" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-white">{t("dataManagement")}</h2>
            <p className="mt-1 text-base text-slate-400">{t("dataManagementSubtitle")}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Export Card */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-500/20">
                  <Download className="h-6 w-6 text-teal-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">{t("exportData")}</h3>
                  <p className="mt-1 text-sm text-slate-400">{t("exportDataDescription")}</p>
                  <button
                    onClick={() => setShowExportDialog(true)}
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-teal-500 px-4 py-2 font-medium text-white transition-colors hover:bg-teal-600"
                  >
                    <Download className="h-4 w-4" />
                    {t("exportData")}
                  </button>
                </div>
              </div>
            </div>

            {/* Import Card */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-500/20">
                  <Upload className="h-6 w-6 text-gray-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">{t("importData")}</h3>
                  <p className="mt-1 text-sm text-slate-400">{t("importDataDescription")}</p>
                  <button
                    onClick={() => setShowImportDialog(true)}
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-gray-600 px-4 py-2 font-medium text-white transition-colors hover:bg-gray-700"
                  >
                    <Upload className="h-4 w-4" />
                    {t("importData")}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Info Section */}
          <div className="rounded-xl border border-white/10 bg-slate-800/50 p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">{t("aboutBudgetFiles")}</h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-teal-400">•</span>
                {t("budgetFileInfo1")}
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-teal-400">•</span>
                {t("budgetFileInfo2")}
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-teal-400">•</span>
                {t("budgetFileInfo3")}
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-teal-400">•</span>
                {t("budgetFileInfo4")}
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Locale & Formatting Tab */}
      {activeTab === "locale" && <LocaleSettingsPanel />}

      {/* Profile Tab */}
      {activeTab === "profile" && <ProfileSettingsPanel />}

      {/* Notifications Tab */}
      {activeTab === "notifications" && <NotificationSettingsPanel />}

      {/* Developer Tools Tab (Dev Mode Only) */}
      {isDev && activeTab === "developer" && <DeveloperTools />}

      {/* Export Dialog */}
      <ExportDialog isOpen={showExportDialog} onClose={() => setShowExportDialog(false)} />

      {/* Import Dialog */}
      <ImportDialog
        isOpen={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        onImportComplete={loadData}
      />
    </div>
  );
}

// Sortable Category Item Component
function SortableCategoryItem({
  category,
  transactionCount,
  onEdit,
  onArchive,
  onUnarchive,
}: {
  category: Category;
  transactionCount: number;
  onEdit: () => void;
  onArchive: () => void;
  onUnarchive: () => void;
}) {
  const t = useTranslations("settings");
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: category.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const IconComponent = getIconComponent(category.icon);

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, borderLeftColor: category.color }}
      className={`rounded-lg border-l-4 bg-white p-6 shadow-md transition-all hover:shadow-lg ${
        category.archived ? "bg-gray-50 opacity-60" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Drag Handle */}
        {!category.isDefault && !category.archived && (
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab rounded-lg p-2 transition-colors hover:bg-gray-100 active:cursor-grabbing"
            aria-label={t("dragToReorder")}
            title={t("dragToReorder")}
          >
            <GripVertical className="h-6 w-6 text-gray-400" />
          </button>
        )}

        {/* Icon and Details */}
        <div className="flex flex-1 items-center gap-4">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-full shadow-sm"
            style={{ backgroundColor: `${category.color}20` }}
          >
            <IconComponent className="h-8 w-8" style={{ color: category.color }} />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-xl font-bold text-gray-900">{category.name}</h3>
              {category.archived && (
                <span className="rounded-full bg-gray-200 px-3 py-1 text-xs font-semibold text-gray-700">
                  {t("archived")}
                </span>
              )}
              {category.isDefault && (
                <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-600">
                  {t("default")}
                </span>
              )}
            </div>
            <p className="mt-1 text-base font-medium text-gray-600">
              <span className="capitalize">{category.type}</span> • {category.subcategories.length}{" "}
              {t("subcategories")} • {transactionCount}{" "}
              {transactionCount !== 1 ? t("transactions") : t("transaction")}
            </p>
            {category.subcategories.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {category.subcategories.map((sub, i) => (
                  <span
                    key={i}
                    className="rounded-full border border-gray-200 bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700"
                  >
                    {sub}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {!category.isDefault && (
            <>
              <button
                onClick={onEdit}
                className="flex min-h-[48px] min-w-[48px] items-center justify-center rounded-lg p-3 text-teal-600 transition-colors hover:bg-teal-50 hover:text-teal-700"
                aria-label={t("editCategory")}
                title={t("editCategory")}
              >
                <Edit className="h-6 w-6" />
              </button>
              {category.archived ? (
                <button
                  onClick={onUnarchive}
                  className="flex min-h-[48px] min-w-[48px] items-center justify-center rounded-lg p-3 text-green-600 transition-colors hover:bg-green-50 hover:text-green-700"
                  aria-label={t("unarchiveCategory")}
                  title={t("unarchiveCategory")}
                >
                  <RotateCcw className="h-6 w-6" />
                </button>
              ) : (
                <button
                  onClick={onArchive}
                  className="flex min-h-[48px] min-w-[48px] items-center justify-center rounded-lg p-3 text-orange-600 transition-colors hover:bg-orange-50 hover:text-orange-700"
                  aria-label={t("archiveCategory")}
                  title={t("archiveCategory")}
                >
                  <Archive className="h-6 w-6" />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Account Modal
function AccountModal({
  account,
  onSave,
  onClose,
}: {
  account: Account | null;
  onSave: (account: Account) => void;
  onClose: () => void;
}) {
  const t = useTranslations("settings");
  const [name, setName] = useState(account?.name || "");
  const [institution, setInstitution] = useState(account?.institution || "");
  const [type, setType] = useState<"checking" | "savings" | "credit">(account?.type || "checking");
  const [balance, setBalance] = useState(account?.balance.toString() || "0");
  const [currency, setCurrency] = useState(account?.currency || "CAD");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const newAccount: Account = {
      id: account?.id || `account_${Date.now()}`,
      name,
      institution,
      type,
      balance: parseFloat(balance),
      currency,
      createdAt: account?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    onSave(newAccount);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-white shadow-xl">
        <div className="sticky top-0 border-b border-gray-200 bg-white p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">
            {account ? t("editAccount") : t("addAccount")}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-4 sm:p-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              {t("accountName")}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("accountNamePlaceholder")}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base focus:border-transparent focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              {t("institution")}
            </label>
            <input
              type="text"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              placeholder={t("institutionPlaceholder")}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base focus:border-transparent focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              {t("accountType")}
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as "checking" | "savings" | "credit")}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base focus:border-transparent focus:ring-2 focus:ring-teal-500"
            >
              <option value="checking">{t("checking")}</option>
              <option value="savings">{t("savings")}</option>
              <option value="credit">{t("creditCard")}</option>
            </select>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">{t("balance")}</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  step="0.01"
                  inputMode="decimal"
                  className="w-full rounded-lg border border-gray-300 py-3 pl-8 pr-4 text-base focus:border-transparent focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                {t("currency")}
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base focus:border-transparent focus:ring-2 focus:ring-teal-500"
              >
                <option value="CAD">CAD</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-base font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-teal-600 px-4 py-3 text-base font-medium text-white transition-colors hover:bg-teal-700"
            >
              {account ? t("updateAccount") : t("addAccount")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Category Modal
function CategoryModal({
  category,
  onSave,
  onClose,
}: {
  category: Category | null;
  onSave: (category: Category) => void;
  onClose: () => void;
}) {
  const t = useTranslations("settings");
  const [name, setName] = useState(category?.name || "");
  const [type, setType] = useState<"expense" | "income">(category?.type || "expense");
  const [color, setColor] = useState(category?.color || "#3b82f6");
  const [icon, setIcon] = useState(category?.icon || "tag");
  const [subcategories, setSubcategories] = useState(category?.subcategories.join(", ") || "");
  const [showIconPicker, setShowIconPicker] = useState(false);

  // Preset colors for quick selection
  const presetColors = [
    "#ef4444", // Red
    "#f97316", // Orange
    "#f59e0b", // Amber
    "#eab308", // Yellow
    "#84cc16", // Lime
    "#22c55e", // Green
    "#14b8a6", // Teal
    "#06b6d4", // Cyan
    "#3b82f6", // Blue
    "#6366f1", // Indigo
    "#8b5cf6", // Violet
    "#a855f7", // Purple
    "#ec4899", // Pink
    "#f43f5e", // Rose
  ];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const newCategory: Category = {
      id: category?.id || `cat_${Date.now()}`,
      name,
      type,
      color,
      subcategories: subcategories
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      icon,
      isDefault: category?.isDefault || false,
      order: category?.order || 99,
      createdAt: category?.createdAt || new Date(),
    };

    onSave(newCategory);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4">
      <div className="max-h-[95vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white shadow-xl">
        <div className="sticky top-0 z-10 border-b-2 border-gray-200 bg-white p-4 sm:p-6">
          <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
            {category ? t("editCategory") : t("addCategory")}
          </h2>
          <p className="mt-1 text-sm text-gray-600 sm:text-base">
            {category ? t("updateCategoryDetails") : t("createCategoryDescription")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-4 sm:space-y-6 sm:p-6">
          {/* Category Name */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700 sm:text-base">
              {t("categoryName")}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("categoryNamePlaceholder")}
              className="min-h-[48px] w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-base transition-all focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
              required
            />
          </div>

          {/* Type Selection */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700 sm:text-base">
              {t("type")}
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as "expense" | "income")}
              className="min-h-[48px] w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-base transition-all focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
            >
              <option value="expense">💸 Expense</option>
              <option value="income">💰 Income</option>
            </select>
          </div>

          {/* Icon Picker */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700 sm:text-base">
              {t("icon")}
            </label>
            <button
              type="button"
              onClick={() => setShowIconPicker(true)}
              className="flex min-h-[48px] w-full items-center gap-3 rounded-lg border-2 border-gray-300 px-3 py-3 text-base transition-all hover:border-gray-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 sm:gap-4 sm:px-4"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 sm:h-12 sm:w-12">
                {(() => {
                  const IconComponent = getIconComponent(icon);
                  return <IconComponent className="h-5 w-5 text-gray-700 sm:h-7 sm:w-7" />;
                })()}
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-gray-900 sm:text-base">{icon}</p>
                <p className="text-xs text-gray-600 sm:text-sm">{t("tapToChangeIcon")}</p>
              </div>
            </button>
          </div>

          {/* Color Picker with Presets */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700 sm:text-base">
              {t("color")}
            </label>
            <div className="space-y-3">
              {/* Custom Color Input */}
              <div className="flex items-center gap-3 sm:gap-4">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-12 w-16 cursor-pointer rounded-lg border-2 border-gray-300 shadow-sm transition-shadow hover:shadow-md sm:h-14 sm:w-20"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 sm:text-base">
                    {color.toUpperCase()}
                  </p>
                  <p className="text-xs text-gray-600 sm:text-sm">{t("tapToChooseColor")}</p>
                </div>
              </div>

              {/* Preset Colors - Responsive grid */}
              <div>
                <p className="mb-2 text-xs font-medium text-gray-700 sm:text-sm">
                  {t("quickPresets")}
                </p>
                <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                  {presetColors.map((presetColor) => (
                    <button
                      key={presetColor}
                      type="button"
                      onClick={() => setColor(presetColor)}
                      className={`aspect-square w-full max-w-[44px] rounded-lg shadow-sm transition-all active:scale-95 ${
                        color === presetColor
                          ? "ring-2 ring-gray-400 ring-offset-1 sm:ring-4 sm:ring-offset-2"
                          : ""
                      }`}
                      style={{ backgroundColor: presetColor }}
                      title={presetColor}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Subcategories */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700 sm:text-base">
              {t("subcategoriesOptional")}
            </label>
            <input
              type="text"
              value={subcategories}
              onChange={(e) => setSubcategories(e.target.value)}
              placeholder={t("subcategoriesPlaceholder")}
              className="min-h-[48px] w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-base transition-all focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
            />
            <div className="mt-2 rounded border-l-4 border-teal-400 bg-teal-50 p-2 sm:p-3">
              <p className="text-xs text-gray-800 sm:text-sm">
                <span className="font-semibold">{t("tipLabel")}</span> {t("subcategoriesTip")}
              </p>
            </div>
          </div>

          {/* Action Buttons - Stack on mobile */}
          <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[48px] flex-1 rounded-lg border-2 border-gray-300 px-4 py-3 text-base font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-100 active:bg-gray-200 sm:px-6"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              className="min-h-[48px] flex-1 rounded-lg bg-teal-500 px-4 py-3 text-base font-semibold text-white shadow-md transition-all hover:bg-teal-600 active:bg-teal-700 sm:px-6"
            >
              {category ? t("updateCategory") : t("addCategory")}
            </button>
          </div>
        </form>
      </div>

      {/* Icon Picker Modal */}
      {showIconPicker && (
        <IconPicker
          value={icon}
          onChange={(newIcon) => setIcon(newIcon)}
          onClose={() => setShowIconPicker(false)}
        />
      )}
    </div>
  );
}

// WebMCP Experimental Settings Section
function WebMCPSettingsSection() {
  const t = useTranslations("settings");
  const STORAGE_KEY = "budget-webmcp-enabled";
  const [enabled, setEnabled] = useState(false);
  const [hasSupport, setHasSupport] = useState(false);

  useEffect(() => {
    setEnabled(localStorage.getItem(STORAGE_KEY) === "true");
    setHasSupport(
      typeof navigator !== "undefined" &&
        "modelContext" in navigator &&
        typeof (navigator as unknown as Record<string, unknown>).modelContext === "object"
    );
  }, []);

  function toggle() {
    const next = !enabled;
    localStorage.setItem(STORAGE_KEY, String(next));
    setEnabled(next);
    // Force reload so the WebMCPProvider picks up the change
    window.location.reload();
  }

  return (
    <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20">
          <Bot className="h-5 w-5 text-purple-400" />
        </div>
        <div>
          <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
            {t("experimental")}
          </h3>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-white">{t("webmcpTitle")}</span>
              <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-xs font-semibold text-purple-300">
                {t("experimental")}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-400">{t("webmcpDescription")}</p>
            {!hasSupport && enabled && (
              <p className="mt-2 text-xs text-amber-400">{t("webmcpNotSupported")}</p>
            )}
          </div>
          <button
            onClick={toggle}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${
              enabled ? "bg-teal-500" : "bg-slate-600"
            }`}
            role="switch"
            aria-checked={enabled}
            aria-label={t("toggleWebmcp")}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                enabled ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {enabled && (
          <div className="rounded-lg border border-white/10 bg-slate-800/50 p-4">
            <p className="text-xs text-slate-400">{t("webmcpToolsDescription")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
