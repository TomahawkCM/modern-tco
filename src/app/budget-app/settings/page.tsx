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
import { CreditCard, Edit, Plus, Shield, Tag, Trash2, Eye, GripVertical, Archive, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { PrivacyControlsPanel } from "./settings-privacy-panel";
import { AccessibilitySettingsPanel } from "@/components/budget/AccessibilitySettingsPanel";
import { IconPicker, getIconComponent } from "@/components/budget/IconPicker";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function SettingsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryTransactionCounts, setCategoryTransactionCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"accounts" | "categories" | "privacy" | "accessibility">("accounts");
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
      alert("Failed to save account");
    }
  }

  async function deleteAccount(id: string) {
    if (!confirm("Delete this account? Transactions will NOT be deleted.")) return;

    try {
      await db.accounts.delete(id);
      await loadData();
    } catch (error) {
      console.error("Error deleting account:", error);
      alert("Failed to delete account");
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
      alert("Failed to save category");
    }
  }

  async function archiveCategory(id: string) {
    const transactionCount = categoryTransactionCounts[id] || 0;

    if (transactionCount > 0) {
      if (
        !confirm(
          `This category has ${transactionCount} transaction${
            transactionCount !== 1 ? "s" : ""
          }. Archive it? Transactions will be preserved but the category will be hidden.`
        )
      ) {
        return;
      }
    } else {
      if (!confirm("Archive this category? You can restore it later.")) {
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
      alert("Failed to archive category");
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
      alert("Failed to unarchive category");
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
      alert("Failed to reorder categories");
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-teal-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-gray-600">Manage your accounts and categories</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab("accounts")}
            className={`border-b-2 px-2 pb-4 font-medium transition-colors ${
              activeTab === "accounts"
                ? "border-teal-600 text-teal-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Accounts ({accounts.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab("categories")}
            className={`border-b-2 px-2 pb-4 font-medium transition-colors ${
              activeTab === "categories"
                ? "border-teal-600 text-teal-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Categories ({categories.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab("privacy")}
            className={`border-b-2 px-2 pb-4 font-medium transition-colors ${
              activeTab === "privacy"
                ? "border-teal-600 text-teal-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy & AI
            </div>
          </button>
          <button
            onClick={() => setActiveTab("accessibility")}
            className={`border-b-2 px-2 pb-4 font-medium transition-colors ${
              activeTab === "accessibility"
                ? "border-teal-600 text-teal-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Accessibility
            </div>
          </button>
        </div>
      </div>

      {/* Accounts Tab */}
      {activeTab === "accounts" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Your Accounts</h2>
            <button
              onClick={() => {
                setEditingAccount(null);
                setShowAccountModal(true);
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-white transition-colors hover:bg-teal-700"
            >
              <Plus className="h-4 w-4" />
              Add Account
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
                        {account.currency} $
                        {account.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
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
              <h3 className="mb-2 text-xl font-semibold text-gray-900">No Accounts Yet</h3>
              <p className="mb-6 text-gray-600">Add your bank accounts to get started</p>
              <button
                onClick={() => setShowAccountModal(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-6 py-2 text-white transition-colors hover:bg-teal-700"
              >
                <Plus className="h-5 w-5" />
                Add Your First Account
              </button>
            </div>
          )}
        </div>
      )}

      {/* Categories Tab - Enhanced */}
      {activeTab === "categories" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Categories</h2>
              <p className="text-base text-gray-600 mt-1">
                Organize your transactions with custom categories • Drag to reorder
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowArchivedCategories(!showArchivedCategories)}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 min-h-[48px] text-base font-semibold transition-all ${
                  showArchivedCategories
                    ? "bg-gray-200 text-gray-900"
                    : "bg-white border-2 border-gray-300 text-gray-700 hover:border-gray-400"
                }`}
              >
                <Archive className="h-5 w-5" />
                {showArchivedCategories ? "Hide" : "Show"} Archived
              </button>
              <button
                onClick={() => {
                  setEditingCategory(null);
                  setShowCategoryModal(true);
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-teal-500 px-6 py-3 min-h-[48px] text-base font-semibold text-white transition-all hover:bg-teal-600 shadow-md hover:shadow-lg"
              >
                <Plus className="h-6 w-6" />
                Add Category
              </button>
            </div>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={categories.filter((cat) => showArchivedCategories || !cat.archived).map((cat) => cat.id)}
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
            <div className="rounded-lg bg-white p-12 text-center shadow border-2 border-dashed border-gray-300">
              <Tag className="mx-auto mb-4 h-16 w-16 text-gray-400" />
              <h3 className="mb-2 text-xl font-semibold text-gray-900">
                {showArchivedCategories ? "No Archived Categories" : "No Categories Yet"}
              </h3>
              <p className="mb-6 text-gray-600">
                {showArchivedCategories
                  ? "Archived categories will appear here"
                  : "Add your first category to organize transactions"}
              </p>
              {!showArchivedCategories && (
                <button
                  onClick={() => setShowCategoryModal(true)}
                  className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-6 py-2 text-white transition-colors hover:bg-teal-700"
                >
                  <Plus className="h-5 w-5" />
                  Add Your First Category
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
        <PrivacyControlsPanel
          settings={privacySettings}
          onSettingsChange={(newSettings) => {
            setPrivacySettings(newSettings);
            savePrivacySettings(newSettings);
          }}
        />
      )}

      {/* Accessibility Tab */}
      {activeTab === "accessibility" && <AccessibilitySettingsPanel />}
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
      className={`rounded-lg bg-white p-6 shadow-md hover:shadow-lg transition-all border-l-4 ${
        category.archived ? "opacity-60 bg-gray-50" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Drag Handle */}
        {!category.isDefault && !category.archived && (
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Drag to reorder"
            title="Drag to reorder"
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
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-xl font-bold text-gray-900">{category.name}</h3>
              {category.archived && (
                <span className="rounded-full bg-gray-200 px-3 py-1 text-xs font-semibold text-gray-700">
                  Archived
                </span>
              )}
              {category.isDefault && (
                <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-600">
                  Default
                </span>
              )}
            </div>
            <p className="text-base text-gray-600 mt-1 font-medium">
              <span className="capitalize">{category.type}</span> • {category.subcategories.length}{" "}
              subcategories • {transactionCount} transaction{transactionCount !== 1 ? "s" : ""}
            </p>
            {category.subcategories.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {category.subcategories.map((sub, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700 border border-gray-200"
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
                className="p-3 min-h-[48px] min-w-[48px] flex items-center justify-center text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                aria-label="Edit category"
                title="Edit category"
              >
                <Edit className="h-6 w-6" />
              </button>
              {category.archived ? (
                <button
                  onClick={onUnarchive}
                  className="p-3 min-h-[48px] min-w-[48px] flex items-center justify-center text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                  aria-label="Unarchive category"
                  title="Unarchive category"
                >
                  <RotateCcw className="h-6 w-6" />
                </button>
              ) : (
                <button
                  onClick={onArchive}
                  className="p-3 min-h-[48px] min-w-[48px] flex items-center justify-center text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors"
                  aria-label="Archive category"
                  title="Archive category"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-md rounded-lg bg-white shadow-xl">
        <div className="border-b border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {account ? "Edit Account" : "Add Account"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Account Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., BMO Checking"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Institution</label>
            <input
              type="text"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              placeholder="e.g., BMO, Home Trust"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Account Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as "checking" | "savings" | "credit")}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-teal-500"
            >
              <option value="checking">Checking</option>
              <option value="savings">Savings</option>
              <option value="credit">Credit Card</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Balance</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  step="0.01"
                  inputMode="decimal"
                  className="w-full rounded-lg border border-gray-300 py-2 pl-8 pr-4 focus:border-transparent focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-teal-500"
              >
                <option value="CAD">CAD</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-teal-600 px-4 py-2 text-white transition-colors hover:bg-teal-700"
            >
              {account ? "Update" : "Add"} Account
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-lg bg-white shadow-xl">
        <div className="border-b-2 border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {category ? "Edit Category" : "Add Category"}
          </h2>
          <p className="text-base text-gray-600 mt-1">
            {category ? "Update category details" : "Create a new category for organizing transactions"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          {/* Category Name */}
          <div>
            <label className="mb-2 block text-base font-semibold text-gray-700">Category Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Entertainment, Groceries, Salary"
              className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 min-h-[48px] text-base focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
              required
            />
          </div>

          {/* Type Selection */}
          <div>
            <label className="mb-2 block text-base font-semibold text-gray-700">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as "expense" | "income")}
              className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 min-h-[48px] text-base focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
            >
              <option value="expense">💸 Expense</option>
              <option value="income">💰 Income</option>
            </select>
          </div>

          {/* Icon Picker */}
          <div>
            <label className="mb-2 block text-base font-semibold text-gray-700">Icon</label>
            <button
              type="button"
              onClick={() => setShowIconPicker(true)}
              className="flex items-center gap-4 w-full rounded-lg border-2 border-gray-300 px-4 py-3 min-h-[48px] text-base hover:border-gray-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
                {(() => {
                  const IconComponent = getIconComponent(icon);
                  return <IconComponent className="h-7 w-7 text-gray-700" />;
                })()}
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-900">{icon}</p>
                <p className="text-sm text-gray-600">Click to change icon</p>
              </div>
            </button>
          </div>

          {/* Color Picker with Presets */}
          <div>
            <label className="mb-2 block text-base font-semibold text-gray-700">Color</label>
            <div className="space-y-3">
              {/* Custom Color Input */}
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-14 w-20 cursor-pointer rounded-lg border-2 border-gray-300 shadow-sm hover:shadow-md transition-shadow"
                />
                <div className="flex-1">
                  <p className="text-base font-medium text-gray-900">{color.toUpperCase()}</p>
                  <p className="text-sm text-gray-600">Click to choose a custom color</p>
                </div>
              </div>

              {/* Preset Colors */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Quick Presets:</p>
                <div className="grid grid-cols-7 gap-2">
                  {presetColors.map((presetColor) => (
                    <button
                      key={presetColor}
                      type="button"
                      onClick={() => setColor(presetColor)}
                      className={`h-12 w-12 rounded-lg transition-all shadow-sm hover:shadow-md hover:scale-110 ${
                        color === presetColor ? 'ring-4 ring-gray-400 ring-offset-2' : ''
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
            <label className="mb-2 block text-base font-semibold text-gray-700">
              Subcategories (Optional)
            </label>
            <input
              type="text"
              value={subcategories}
              onChange={(e) => setSubcategories(e.target.value)}
              placeholder="e.g., Movies, Games, Events"
              className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 min-h-[48px] text-base focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
            />
            <div className="mt-2 bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
              <p className="text-sm text-gray-800">
                <span className="font-semibold">Tip:</span> Separate subcategories with commas. For example: "Movies, Streaming, Concerts"
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border-2 border-gray-300 px-6 py-3 min-h-[48px] text-base font-semibold text-gray-700 transition-all hover:bg-gray-100 hover:border-gray-400 shadow-sm hover:shadow-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-teal-500 px-6 py-3 min-h-[48px] text-base font-semibold text-white transition-all hover:bg-teal-600 shadow-md hover:shadow-lg"
            >
              {category ? "Update Category" : "Add Category"}
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
