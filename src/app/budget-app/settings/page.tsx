"use client";

/**
 * Settings Page
 * Manage accounts, categories, and app settings
 */

import { db } from "@/lib/budget-db";
import {
  getPrivacySettings,
  savePrivacySettings,
  type PrivacySettings,
} from "@/lib/budget-privacy-settings";
import type { Account, Category } from "@/types/budget";
import { CreditCard, Edit, Plus, Shield, Tag, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { PrivacyControlsPanel } from "./settings-privacy-panel";

export default function SettingsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"accounts" | "categories" | "privacy">("accounts");
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>(getPrivacySettings());

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [accts, cats] = await Promise.all([db.accounts.toArray(), db.categories.toArray()]);
      setAccounts(accts);
      setCategories(cats.sort((a, b) => a.order - b.order));
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

  async function deleteCategory(id: string) {
    const hasTransactions = (await db.transactions.toArray()).some((tx) => {
      const cat = categories.find((c) => c.id === id);
      return cat && tx.category === cat.name;
    });

    if (hasTransactions) {
      if (
        !confirm(
          "This category has transactions. Delete anyway? Transactions will be uncategorized."
        )
      ) {
        return;
      }
    }

    try {
      await db.categories.delete(id);
      await loadData();
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("Failed to delete category");
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

      {/* Categories Tab */}
      {activeTab === "categories" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Categories</h2>
            <button
              onClick={() => {
                setEditingCategory(null);
                setShowCategoryModal(true);
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-white transition-colors hover:bg-teal-700"
            >
              <Plus className="h-4 w-4" />
              Add Category
            </button>
          </div>

          <div className="grid gap-4">
            {categories.map((category) => (
              <div key={category.id} className="rounded-lg bg-white p-6 shadow">
                <div className="flex items-start justify-between">
                  <div className="flex flex-1 items-center gap-4">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-full"
                      style={{ backgroundColor: `${category.color}20` }}
                    >
                      <div
                        className="h-6 w-6 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                      <p className="text-sm text-gray-600">
                        {category.type} • {category.subcategories.length} subcategories
                      </p>
                      {category.subcategories.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {category.subcategories.map((sub, i) => (
                            <span
                              key={i}
                              className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                            >
                              {sub}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!category.isDefault && (
                      <>
                        <button
                          onClick={() => {
                            setEditingCategory(category);
                            setShowCategoryModal(true);
                          }}
                          className="text-teal-600 hover:text-teal-700"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteCategory(category.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                    {category.isDefault && (
                      <span className="rounded bg-teal-50 px-2 py-1 text-xs text-teal-600">
                        Default
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
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
  const [subcategories, setSubcategories] = useState(category?.subcategories.join(", ") || "");

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
      icon: "tag",
      isDefault: category?.isDefault || false,
      order: category?.order || 99,
      createdAt: category?.createdAt || new Date(),
    };

    onSave(newCategory);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-md rounded-lg bg-white shadow-xl">
        <div className="border-b border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {category ? "Edit Category" : "Add Category"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Category Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Entertainment"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as "expense" | "income")}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-teal-500"
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Color</label>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-10 w-full cursor-pointer rounded-lg border border-gray-300"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Subcategories (comma-separated)
            </label>
            <input
              type="text"
              value={subcategories}
              onChange={(e) => setSubcategories(e.target.value)}
              placeholder="e.g., Movies, Games, Events"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-teal-500"
            />
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
              {category ? "Update" : "Add"} Category
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
