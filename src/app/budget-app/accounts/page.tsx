"use client";

/**
 * Accounts Page
 * Manage bank accounts and set starting balances
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Landmark,
  CreditCard,
  PiggyBank,
  Edit,
  Trash2,
  Save,
  X,
  ArrowRight,
  Eye,
  AlertCircle,
  Wallet,
} from "lucide-react";
import { db } from "@/lib/budget-db";
import type { Account, Transaction } from "@/types/budget";
import { ConfirmDialog } from "@/components/budget/ConfirmDialog";
import { useToast } from "@/components/budget/Toast";
import { v4 as uuidv4 } from "uuid";
import {
  migrateDefaultTransactions,
  assignUnassignedTransactionsTo,
} from "@/lib/smart-account-matcher";
import BalanceReconciliationModal, {
  getPendingReconciliations,
  clearPendingReconciliation,
} from "@/components/budget/BalanceReconciliationModal";
import { PullToRefresh } from "@/components/budget/layout/PullToRefresh";

export default function AccountsPage() {
  const router = useRouter();
  const toast = useToast();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactionCounts, setTransactionCounts] = useState<Record<string, number>>({});
  const [accountBalances, setAccountBalances] = useState<Record<string, number>>({});
  const [unassignedCount, setUnassignedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isMigrating, setIsMigrating] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState<Account | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTargetAccount, setSelectedTargetAccount] = useState<string>("");

  // Form state
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState<"checking" | "savings" | "credit">("checking");
  const [formInstitution, setFormInstitution] = useState("");
  const [formBalance, setFormBalance] = useState("");

  // Balance reconciliation state
  const [pendingReconciliations, setPendingReconciliations] = useState<
    Record<
      string,
      {
        accountName: string;
        transactionNetChange: number;
        skippedAt: string;
      }
    >
  >({});
  const [showReconciliationModal, setShowReconciliationModal] = useState(false);
  const [reconciliationAccountId, setReconciliationAccountId] = useState<string>("");
  const [reconciliationAccountName, setReconciliationAccountName] = useState<string>("");
  const [reconciliationAccountType, setReconciliationAccountType] = useState<
    "checking" | "savings" | "credit"
  >("checking");
  const [reconciliationNetChange, setReconciliationNetChange] = useState<number>(0);

  useEffect(() => {
    loadAccounts();
    checkUnassignedTransactions();
    loadPendingReconciliations();
  }, []);

  async function checkUnassignedTransactions() {
    try {
      // Check for transactions with empty accountId OR 'default-account'
      // Empty accountId can happen when imports occurred before accounts were set up
      const allTransactions = await db.transactions.toArray();
      const unassignedCount = allTransactions.filter(
        (tx) => !tx.accountId || tx.accountId === "" || tx.accountId === "default-account"
      ).length;
      setUnassignedCount(unassignedCount);
    } catch (error) {
      console.error("Error checking unassigned transactions:", error);
    }
  }

  function loadPendingReconciliations() {
    const pending = getPendingReconciliations();
    setPendingReconciliations(pending);
  }

  function openReconciliationModal(accountId: string) {
    const pending = pendingReconciliations[accountId];
    if (pending) {
      const account = accounts.find((a) => a.id === accountId);
      setReconciliationAccountId(accountId);
      setReconciliationAccountName(pending.accountName);
      setReconciliationAccountType(account?.type || "checking");
      setReconciliationNetChange(pending.transactionNetChange);
      setShowReconciliationModal(true);
    }
  }

  async function handleReconciliationComplete(startingBalance: number, currentBalance: number) {
    try {
      const now = new Date();
      await db.accounts.update(reconciliationAccountId, {
        balance: startingBalance,
        lastReconciledAt: now,
        lastReconciledBalance: currentBalance,
        updatedAt: now,
      });
      toast.success(`Starting balance set to $${startingBalance.toLocaleString()}`);
      clearPendingReconciliation(reconciliationAccountId);
      loadPendingReconciliations();
      loadAccounts();
    } catch (error) {
      console.error("Error updating account balance:", error);
      toast.error("Failed to update account balance");
    }
  }

  function handleReconciliationSkip() {
    // Modal component already handles localStorage, just close modal
    setShowReconciliationModal(false);
  }

  async function handleMigrateTransactions() {
    // If multiple accounts exist, show the selection modal
    if (accounts.length > 1) {
      setSelectedTargetAccount("");
      setShowAssignModal(true);
      return;
    }

    // Only one account (or zero) - use the original auto-migration
    setIsMigrating(true);
    try {
      const result = await migrateDefaultTransactions();
      if (result.migrated > 0) {
        toast.success(`Migrated ${result.migrated} transactions to accounts`);
        if (result.created.length > 0) {
          toast.info(`Created account: ${result.created.join(", ")}`);
        }
      }
      setUnassignedCount(0);
      loadAccounts();
    } catch (error) {
      console.error("Error migrating transactions:", error);
      toast.error("Failed to migrate transactions");
    } finally {
      setIsMigrating(false);
    }
  }

  async function handleAssignToSelected() {
    if (!selectedTargetAccount) return;

    setIsMigrating(true);
    try {
      const count = await assignUnassignedTransactionsTo(selectedTargetAccount);
      const targetName = accounts.find((a) => a.id === selectedTargetAccount)?.name;
      toast.success(`Assigned ${count} transactions to ${targetName}`);
      setShowAssignModal(false);
      setUnassignedCount(0);
      loadAccounts(); // Refresh balances
    } catch (error) {
      console.error("Error assigning transactions:", error);
      toast.error("Failed to assign transactions");
    } finally {
      setIsMigrating(false);
    }
  }

  async function handleClearAllTransactions() {
    try {
      await db.transactions.clear();
      toast.success("All transactions cleared. You can now re-import your statements.");
      setShowResetConfirm(false);
      loadAccounts();
      checkUnassignedTransactions();
    } catch (error) {
      console.error("Error clearing transactions:", error);
      toast.error("Failed to clear transactions");
    }
  }

  async function loadAccounts() {
    try {
      const accts = await db.accounts.toArray();
      setAccounts(accts);

      // Load transaction counts and calculated balances for each account
      const transactions = await db.transactions.toArray();
      const counts: Record<string, number> = {};
      const balances: Record<string, number> = {};

      accts.forEach((acct) => {
        const acctTransactions = transactions.filter((tx) => tx.accountId === acct.id);
        counts[acct.id] = acctTransactions.length;
        // Calculate current balance: starting balance + sum of transactions
        const transactionSum = acctTransactions.reduce((sum, tx) => sum + tx.amount, 0);
        balances[acct.id] = acct.balance + transactionSum;
      });

      setTransactionCounts(counts);
      setAccountBalances(balances);
    } catch (error) {
      console.error("Error loading accounts:", error);
      toast.error("Failed to load accounts");
    } finally {
      setIsLoading(false);
    }
  }

  function viewAccountTransactions(accountId: string) {
    router.push(`/budget-app/transactions?account=${accountId}`);
  }

  function openAddModal() {
    setFormName("");
    setFormType("checking");
    setFormInstitution("");
    setFormBalance("");
    setEditingAccount(null);
    setShowAddModal(true);
  }

  function openEditModal(account: Account) {
    setFormName(account.name);
    setFormType(account.type);
    setFormInstitution(account.institution);
    setFormBalance(account.balance.toString());
    setEditingAccount(account);
    setShowAddModal(true);
  }

  async function handleSave() {
    if (!formName.trim()) {
      toast.error("Account name is required");
      return;
    }

    const balance = parseFloat(formBalance) || 0;

    try {
      if (editingAccount) {
        // Update existing account
        await db.accounts.update(editingAccount.id, {
          name: formName.trim(),
          type: formType,
          institution: formInstitution.trim(),
          balance,
          updatedAt: new Date(),
        });
        toast.success("Account updated");
      } else {
        // Create new account
        const newAccount: Account = {
          id: uuidv4(),
          name: formName.trim(),
          type: formType,
          institution: formInstitution.trim(),
          balance,
          currency: "CAD",
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        await db.accounts.add(newAccount);
        toast.success("Account created");
      }

      setShowAddModal(false);
      loadAccounts();
    } catch (error) {
      console.error("Error saving account:", error);
      toast.error("Failed to save account");
    }
  }

  async function handleDelete() {
    if (!deletingAccount) return;

    try {
      await db.accounts.delete(deletingAccount.id);
      toast.success("Account deleted");
      setDeleteConfirmOpen(false);
      setDeletingAccount(null);
      loadAccounts();
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Failed to delete account");
    }
  }

  function getAccountIcon(type: Account["type"]) {
    switch (type) {
      case "checking":
        return <Landmark className="h-6 w-6" />;
      case "savings":
        return <PiggyBank className="h-6 w-6" />;
      case "credit":
        return <CreditCard className="h-6 w-6" />;
    }
  }

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  if (isLoading) {
    return (
      <div className="p-8">
        <h1 className="mb-4 text-2xl font-bold">Accounts</h1>
        <p>Loading accounts...</p>
      </div>
    );
  }

  return (
    <PullToRefresh onRefresh={async () => { await loadAccounts(); checkUnassignedTransactions(); loadPendingReconciliations(); }}>
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Accounts</h1>
          <p className="mt-1 text-gray-600">Manage your bank accounts and starting balances</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
        >
          <Plus className="h-5 w-5" />
          Add Account
        </button>
      </div>

      {/* Total Balance Summary */}
      <div className="mb-6 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white shadow-lg">
        <p className="mb-1 text-sm font-medium text-blue-100">Total Starting Balance</p>
        <p className="text-4xl font-bold">
          ${totalBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </p>
        <p className="mt-2 text-sm text-blue-200">
          This is added to your transaction totals to show your current balance
        </p>
      </div>

      {/* Unassigned Transactions Banner */}
      {unassignedCount > 0 && (
        <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-yellow-900">
                {unassignedCount} transaction{unassignedCount !== 1 ? "s" : ""} need
                {unassignedCount === 1 ? "s" : ""} account assignment
              </h3>
              <p className="mt-1 text-sm text-yellow-700">
                These transactions were imported before accounts were set up.
                {accounts.length > 0
                  ? " Click below to automatically assign them to your accounts."
                  : " Create an account first, then they will be automatically assigned."}
              </p>
              {accounts.length > 0 && (
                <button
                  onClick={handleMigrateTransactions}
                  disabled={isMigrating}
                  className="mt-3 inline-flex items-center gap-2 rounded-lg bg-yellow-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-yellow-700 disabled:bg-yellow-400"
                >
                  {isMigrating ? "Assigning..." : "Assign Transactions Now"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Pending Balance Reconciliation Reminders */}
      {Object.keys(pendingReconciliations).length > 0 && (
        <div className="mb-6 space-y-3">
          {Object.entries(pendingReconciliations).map(([accountId, data]) => (
            <div
              key={accountId}
              className="rounded-lg border border-teal-200 bg-teal-50 p-4 dark:border-teal-800 dark:bg-teal-950/30"
            >
              <div className="flex items-start gap-3">
                <Wallet className="mt-0.5 h-5 w-5 flex-shrink-0 text-teal-600 dark:text-teal-400" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-teal-900 dark:text-teal-100">
                    Set starting balance for {data.accountName}
                  </h3>
                  <p className="mt-1 text-sm text-teal-700 dark:text-teal-300">
                    Enter your current bank balance to ensure accurate account totals.
                  </p>
                  <button
                    onClick={() => openReconciliationModal(accountId)}
                    className="mt-3 inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-700"
                  >
                    <Wallet className="h-4 w-4" />
                    Set Balance Now
                  </button>
                </div>
                <button
                  onClick={() => {
                    clearPendingReconciliation(accountId);
                    loadPendingReconciliations();
                    toast.info("Reminder dismissed");
                  }}
                  className="rounded-lg p-1.5 text-teal-600 transition-colors hover:bg-teal-100 dark:hover:bg-teal-900"
                  aria-label="Dismiss reminder"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Accounts List */}
      {accounts.length === 0 ? (
        <div className="rounded-lg bg-white p-8 text-center shadow-md">
          <Landmark className="mx-auto mb-4 h-16 w-16 text-gray-300" />
          <h2 className="mb-2 text-xl font-semibold text-gray-700">No accounts yet</h2>
          <p className="mb-4 text-gray-500">
            Add your bank accounts to track starting balances and get accurate totals.
          </p>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            <Plus className="h-5 w-5" />
            Add Your First Account
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {accounts.map((account) => {
            const txCount = transactionCounts[account.id] || 0;
            const currentBalance = accountBalances[account.id] ?? account.balance;

            return (
              <div
                key={account.id}
                className="overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-lg"
              >
                {/* Clickable main area */}
                <button
                  onClick={() => viewAccountTransactions(account.id)}
                  className="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`rounded-full p-3 ${
                        account.type === "checking"
                          ? "bg-blue-100 text-blue-600"
                          : account.type === "savings"
                            ? "bg-green-100 text-green-600"
                            : "bg-purple-100 text-purple-600"
                      }`}
                    >
                      {getAccountIcon(account.type)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{account.name}</h3>
                      <p className="text-sm text-gray-500">
                        {account.institution} •{" "}
                        {account.type.charAt(0).toUpperCase() + account.type.slice(1)}
                      </p>
                      <p className="mt-1 flex items-center gap-1 text-xs text-blue-600">
                        <Eye className="h-3 w-3" />
                        {txCount} transaction{txCount !== 1 ? "s" : ""} • Click to view
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Starting</p>
                      <p className="text-sm text-gray-500">
                        ${account.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </p>
                      <p className="mt-2 text-xs text-gray-400">Current</p>
                      <p
                        className={`text-xl font-bold ${currentBalance >= 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        ${currentBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400" />
                  </div>
                </button>

                {/* Action buttons */}
                <div className="flex border-t border-gray-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(account);
                    }}
                    className="flex flex-1 items-center justify-center gap-2 py-3 text-sm text-gray-500 transition-colors hover:bg-blue-50 hover:text-blue-600"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </button>
                  <div className="w-px bg-gray-100" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeletingAccount(account);
                      setDeleteConfirmOpen(true);
                    }}
                    className="flex flex-1 items-center justify-center gap-2 py-3 text-sm text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {editingAccount ? "Edit Account" : "Add Account"}
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-lg p-2 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Account Name *
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g., BMO Chequing"
                  className="w-full rounded-lg border px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Account Type</label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as any)}
                  className="w-full rounded-lg border px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="checking">Checking</option>
                  <option value="savings">Savings</option>
                  <option value="credit">Credit Card</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Institution</label>
                <input
                  type="text"
                  value={formInstitution}
                  onChange={(e) => setFormInstitution(e.target.value)}
                  placeholder="e.g., BMO, TD, RBC"
                  className="w-full rounded-lg border px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Starting Balance
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={formBalance}
                    onChange={(e) => setFormBalance(e.target.value)}
                    placeholder="0.00"
                    className="w-full rounded-lg border py-2 pl-7 pr-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Enter your account balance BEFORE the first imported transaction
                </p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
              >
                <Save className="h-4 w-4" />
                {editingAccount ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Transactions Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Assign Transactions</h2>
              <button
                onClick={() => setShowAssignModal(false)}
                className="rounded-lg p-2 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mb-4 text-gray-600">
              {unassignedCount} transaction{unassignedCount !== 1 ? "s" : ""} need to be assigned to
              an account.
            </p>

            <label className="mb-2 block text-sm font-medium text-gray-700">
              Select target account:
            </label>
            <select
              value={selectedTargetAccount}
              onChange={(e) => setSelectedTargetAccount(e.target.value)}
              className="mb-4 w-full rounded-lg border px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choose an account...</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.institution})
                </option>
              ))}
            </select>

            <div className="flex gap-3">
              <button
                onClick={() => setShowAssignModal(false)}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignToSelected}
                disabled={!selectedTargetAccount || isMigrating}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                {isMigrating ? "Assigning..." : `Assign ${unassignedCount} Transactions`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Data Management Section */}
      <div className="mt-8 border-t border-gray-200 pt-6">
        <h3 className="mb-3 text-sm font-medium text-gray-500">Data Management</h3>
        <button
          onClick={() => setShowResetConfirm(true)}
          className="text-sm text-red-600 hover:text-red-800 hover:underline"
        >
          Clear all transactions and start fresh
        </button>
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={(open) => {
          setDeleteConfirmOpen(open);
          if (!open) setDeletingAccount(null);
        }}
        onConfirm={handleDelete}
        title="Delete Account"
        description={`Are you sure you want to delete "${deletingAccount?.name}"? This will not delete associated transactions.`}
        confirmLabel="Delete"
        variant="destructive"
      />

      {/* Reset Transactions Confirmation */}
      <ConfirmDialog
        open={showResetConfirm}
        onOpenChange={setShowResetConfirm}
        onConfirm={handleClearAllTransactions}
        title="Clear All Transactions"
        description="This will permanently delete ALL transactions from the database. Your accounts and their starting balances will be preserved. You can then re-import your bank statements fresh. This action cannot be undone."
        confirmLabel="Clear All Transactions"
        variant="destructive"
      />

      {/* Balance Reconciliation Modal */}
      <BalanceReconciliationModal
        open={showReconciliationModal}
        onOpenChange={setShowReconciliationModal}
        accountId={reconciliationAccountId}
        accountName={reconciliationAccountName}
        accountType={reconciliationAccountType}
        transactionNetChange={reconciliationNetChange}
        onComplete={handleReconciliationComplete}
        onSkip={handleReconciliationSkip}
      />
    </div>
    </PullToRefresh>
  );
}
