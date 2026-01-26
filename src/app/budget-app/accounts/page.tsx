'use client';

/**
 * Accounts Page
 * Manage bank accounts and set starting balances
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Landmark, CreditCard, PiggyBank, Edit, Trash2, Save, X, ArrowRight, Eye, AlertCircle, Wallet } from 'lucide-react';
import { db } from '@/lib/budget-db';
import type { Account, Transaction } from '@/types/budget';
import { ConfirmDialog } from '@/components/budget/ConfirmDialog';
import { useToast } from '@/components/budget/Toast';
import { v4 as uuidv4 } from 'uuid';
import { migrateDefaultTransactions, assignUnassignedTransactionsTo } from '@/lib/smart-account-matcher';
import BalanceReconciliationModal, {
  getPendingReconciliations,
  clearPendingReconciliation,
} from '@/components/budget/BalanceReconciliationModal';

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
  const [selectedTargetAccount, setSelectedTargetAccount] = useState<string>('');

  // Form state
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<'checking' | 'savings' | 'credit'>('checking');
  const [formInstitution, setFormInstitution] = useState('');
  const [formBalance, setFormBalance] = useState('');

  // Balance reconciliation state
  const [pendingReconciliations, setPendingReconciliations] = useState<Record<string, {
    accountName: string;
    transactionNetChange: number;
    skippedAt: string;
  }>>({});
  const [showReconciliationModal, setShowReconciliationModal] = useState(false);
  const [reconciliationAccountId, setReconciliationAccountId] = useState<string>('');
  const [reconciliationAccountName, setReconciliationAccountName] = useState<string>('');
  const [reconciliationAccountType, setReconciliationAccountType] = useState<'checking' | 'savings' | 'credit'>('checking');
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
        tx => !tx.accountId || tx.accountId === '' || tx.accountId === 'default-account'
      ).length;
      setUnassignedCount(unassignedCount);
    } catch (error) {
      console.error('Error checking unassigned transactions:', error);
    }
  }

  function loadPendingReconciliations() {
    const pending = getPendingReconciliations();
    setPendingReconciliations(pending);
  }

  function openReconciliationModal(accountId: string) {
    const pending = pendingReconciliations[accountId];
    if (pending) {
      const account = accounts.find(a => a.id === accountId);
      setReconciliationAccountId(accountId);
      setReconciliationAccountName(pending.accountName);
      setReconciliationAccountType(account?.type || 'checking');
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
      console.error('Error updating account balance:', error);
      toast.error('Failed to update account balance');
    }
  }

  function handleReconciliationSkip() {
    // Modal component already handles localStorage, just close modal
    setShowReconciliationModal(false);
  }

  async function handleMigrateTransactions() {
    // If multiple accounts exist, show the selection modal
    if (accounts.length > 1) {
      setSelectedTargetAccount('');
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
          toast.info(`Created account: ${result.created.join(', ')}`);
        }
      }
      setUnassignedCount(0);
      loadAccounts();
    } catch (error) {
      console.error('Error migrating transactions:', error);
      toast.error('Failed to migrate transactions');
    } finally {
      setIsMigrating(false);
    }
  }

  async function handleAssignToSelected() {
    if (!selectedTargetAccount) return;

    setIsMigrating(true);
    try {
      const count = await assignUnassignedTransactionsTo(selectedTargetAccount);
      const targetName = accounts.find(a => a.id === selectedTargetAccount)?.name;
      toast.success(`Assigned ${count} transactions to ${targetName}`);
      setShowAssignModal(false);
      setUnassignedCount(0);
      loadAccounts(); // Refresh balances
    } catch (error) {
      console.error('Error assigning transactions:', error);
      toast.error('Failed to assign transactions');
    } finally {
      setIsMigrating(false);
    }
  }
  
  async function handleClearAllTransactions() {
    try {
      await db.transactions.clear();
      toast.success('All transactions cleared. You can now re-import your statements.');
      setShowResetConfirm(false);
      loadAccounts();
      checkUnassignedTransactions();
    } catch (error) {
      console.error('Error clearing transactions:', error);
      toast.error('Failed to clear transactions');
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
      
      accts.forEach(acct => {
        const acctTransactions = transactions.filter(tx => tx.accountId === acct.id);
        counts[acct.id] = acctTransactions.length;
        // Calculate current balance: starting balance + sum of transactions
        const transactionSum = acctTransactions.reduce((sum, tx) => sum + tx.amount, 0);
        balances[acct.id] = acct.balance + transactionSum;
      });
      
      setTransactionCounts(counts);
      setAccountBalances(balances);
    } catch (error) {
      console.error('Error loading accounts:', error);
      toast.error('Failed to load accounts');
    } finally {
      setIsLoading(false);
    }
  }

  function viewAccountTransactions(accountId: string) {
    router.push(`/budget-app/transactions?account=${accountId}`);
  }

  function openAddModal() {
    setFormName('');
    setFormType('checking');
    setFormInstitution('');
    setFormBalance('');
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
      toast.error('Account name is required');
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
        toast.success('Account updated');
      } else {
        // Create new account
        const newAccount: Account = {
          id: uuidv4(),
          name: formName.trim(),
          type: formType,
          institution: formInstitution.trim(),
          balance,
          currency: 'CAD',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        await db.accounts.add(newAccount);
        toast.success('Account created');
      }

      setShowAddModal(false);
      loadAccounts();
    } catch (error) {
      console.error('Error saving account:', error);
      toast.error('Failed to save account');
    }
  }

  async function handleDelete() {
    if (!deletingAccount) return;

    try {
      await db.accounts.delete(deletingAccount.id);
      toast.success('Account deleted');
      setDeleteConfirmOpen(false);
      setDeletingAccount(null);
      loadAccounts();
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account');
    }
  }

  function getAccountIcon(type: Account['type']) {
    switch (type) {
      case 'checking':
        return <Landmark className="w-6 h-6" />;
      case 'savings':
        return <PiggyBank className="w-6 h-6" />;
      case 'credit':
        return <CreditCard className="w-6 h-6" />;
    }
  }

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  if (isLoading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Accounts</h1>
        <p>Loading accounts...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Accounts</h1>
          <p className="text-gray-600 mt-1">Manage your bank accounts and starting balances</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Account
        </button>
      </div>

      {/* Total Balance Summary */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white mb-6 shadow-lg">
        <p className="text-blue-100 text-sm font-medium mb-1">Total Starting Balance</p>
        <p className="text-4xl font-bold">${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
        <p className="text-blue-200 text-sm mt-2">
          This is added to your transaction totals to show your current balance
        </p>
      </div>
      
      {/* Unassigned Transactions Banner */}
      {unassignedCount > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-yellow-900">
                {unassignedCount} transaction{unassignedCount !== 1 ? 's' : ''} need{unassignedCount === 1 ? 's' : ''} account assignment
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                These transactions were imported before accounts were set up. 
                {accounts.length > 0 
                  ? ' Click below to automatically assign them to your accounts.'
                  : ' Create an account first, then they will be automatically assigned.'}
              </p>
              {accounts.length > 0 && (
                <button
                  onClick={handleMigrateTransactions}
                  disabled={isMigrating}
                  className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700 disabled:bg-yellow-400 transition-colors"
                >
                  {isMigrating ? 'Assigning...' : 'Assign Transactions Now'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Pending Balance Reconciliation Reminders */}
      {Object.keys(pendingReconciliations).length > 0 && (
        <div className="space-y-3 mb-6">
          {Object.entries(pendingReconciliations).map(([accountId, data]) => (
            <div key={accountId} className="bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Wallet className="w-5 h-5 text-teal-600 dark:text-teal-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-teal-900 dark:text-teal-100">
                    Set starting balance for {data.accountName}
                  </h3>
                  <p className="text-sm text-teal-700 dark:text-teal-300 mt-1">
                    Enter your current bank balance to ensure accurate account totals.
                  </p>
                  <button
                    onClick={() => openReconciliationModal(accountId)}
                    className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors"
                  >
                    <Wallet className="w-4 h-4" />
                    Set Balance Now
                  </button>
                </div>
                <button
                  onClick={() => {
                    clearPendingReconciliation(accountId);
                    loadPendingReconciliations();
                    toast.info('Reminder dismissed');
                  }}
                  className="p-1.5 rounded-lg text-teal-600 hover:bg-teal-100 dark:hover:bg-teal-900 transition-colors"
                  aria-label="Dismiss reminder"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Accounts List */}
      {accounts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <Landmark className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No accounts yet</h2>
          <p className="text-gray-500 mb-4">
            Add your bank accounts to track starting balances and get accurate totals.
          </p>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
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
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Clickable main area */}
                <button
                  onClick={() => viewAccountTransactions(account.id)}
                  className="w-full p-6 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${
                      account.type === 'checking' ? 'bg-blue-100 text-blue-600' :
                      account.type === 'savings' ? 'bg-green-100 text-green-600' :
                      'bg-purple-100 text-purple-600'
                    }`}>
                      {getAccountIcon(account.type)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{account.name}</h3>
                      <p className="text-sm text-gray-500">
                        {account.institution} • {account.type.charAt(0).toUpperCase() + account.type.slice(1)}
                      </p>
                      <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {txCount} transaction{txCount !== 1 ? 's' : ''} • Click to view
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Starting</p>
                      <p className="text-sm text-gray-500">
                        ${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">Current</p>
                      <p className={`text-xl font-bold ${currentBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                  </div>
                </button>
                
                {/* Action buttons */}
                <div className="flex border-t border-gray-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(account);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 py-3 text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors text-sm"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <div className="w-px bg-gray-100" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeletingAccount(account);
                      setDeleteConfirmOpen(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 py-3 text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">
                {editingAccount ? 'Edit Account' : 'Add Account'}
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Name *
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g., BMO Chequing"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Type
                </label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as any)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="checking">Checking</option>
                  <option value="savings">Savings</option>
                  <option value="credit">Credit Card</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Institution
                </label>
                <input
                  type="text"
                  value={formInstitution}
                  onChange={(e) => setFormInstitution(e.target.value)}
                  placeholder="e.g., BMO, TD, RBC"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    className="w-full pl-7 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Enter your account balance BEFORE the first imported transaction
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                {editingAccount ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Transactions Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Assign Transactions</h2>
              <button
                onClick={() => setShowAssignModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-gray-600 mb-4">
              {unassignedCount} transaction{unassignedCount !== 1 ? 's' : ''} need to be assigned to an account.
            </p>

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select target account:
            </label>
            <select
              value={selectedTargetAccount}
              onChange={(e) => setSelectedTargetAccount(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
            >
              <option value="">Choose an account...</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.institution})
                </option>
              ))}
            </select>

            <div className="flex gap-3">
              <button
                onClick={() => setShowAssignModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignToSelected}
                disabled={!selectedTargetAccount || isMigrating}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
              >
                {isMigrating ? 'Assigning...' : `Assign ${unassignedCount} Transactions`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Data Management Section */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-500 mb-3">Data Management</h3>
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
  );
}
