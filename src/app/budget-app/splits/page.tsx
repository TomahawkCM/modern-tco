'use client';

/**
 * Expense Splitting Page
 *
 * Splitwise-style expense splitting with:
 * - People management (add/remove with emoji)
 * - Balance summary cards (owed to you / you owe / net)
 * - Multi-step split transaction flow (select tx -> select people -> choose mode -> preview -> confirm)
 * - Settlement tracking (Cash, E-Transfer, Venmo, PayPal, Other)
 * - Person detail view with unsettled splits and settle button
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { db } from '@/lib/budget-db';
import type { SplitPerson, ExpenseSplit, Transaction } from '@/types/budget';
import {
  previewSplit,
  getBalanceSummary,
  type SplitMode,
  type SplitPreview,
} from '@/lib/expense-splits/split-engine';
import { ConfirmDialog } from '@/components/budget/ConfirmDialog';
import { HelpTooltip } from '@/components/budget/HelpTooltip';
import {
  Users,
  ArrowLeft,
  Check,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Scale,
  Trash2,
  X,
  Loader2,
  Receipt,
  HandCoins,
  UserPlus,
  Search,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Emoji picker options
// ---------------------------------------------------------------------------
const EMOJI_OPTIONS = [
  '😀', '😎', '🥳', '🤓', '😇', '🙃', '🤗', '😺',
  '👤', '👩', '👨', '👧', '👦', '🧑', '👵', '👴',
  '🏠', '🍕', '🎮', '📱', '💼', '🎓', '🐶', '🐱',
  '⭐', '🔥', '💜', '💚', '💙', '🧡', '❤️', '🖤',
];

// ---------------------------------------------------------------------------
// Settlement method options
// ---------------------------------------------------------------------------
const SETTLEMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'e-transfer', label: 'E-Transfer' },
  { value: 'venmo', label: 'Venmo' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'other', label: 'Other' },
];

// ---------------------------------------------------------------------------
// Main page component
// ---------------------------------------------------------------------------
export default function ExpenseSplitsPage() {
  // Data state
  const [people, setPeople] = useState<SplitPerson[]>([]);
  const [splits, setSplits] = useState<ExpenseSplit[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // UI state
  const [showAddPerson, setShowAddPerson] = useState(false);
  const [newPersonName, setNewPersonName] = useState('');
  const [newPersonEmoji, setNewPersonEmoji] = useState('😀');
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [splitFlowOpen, setSplitFlowOpen] = useState(false);
  const [deletePersonId, setDeletePersonId] = useState<string | null>(null);

  // Settlement modal state
  const [settlePersonId, setSettlePersonId] = useState<string | null>(null);
  const [settleAmount, setSettleAmount] = useState('');
  const [settleMethod, setSettleMethod] = useState('cash');
  const [settleLoading, setSettleLoading] = useState(false);

  // Split flow state
  const [splitStep, setSplitStep] = useState(1);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const [selectedPeopleIds, setSelectedPeopleIds] = useState<string[]>([]);
  const [splitMode, setSplitMode] = useState<SplitMode>('equal');
  const [customAmounts, setCustomAmounts] = useState<number[]>([]);
  const [percentages, setPercentages] = useState<number[]>([]);
  const [splitPreview, setSplitPreview] = useState<SplitPreview[]>([]);
  const [splitLoading, setSplitLoading] = useState(false);
  const [txSearchQuery, setTxSearchQuery] = useState('');

  // ---------------------------------------------------------------------------
  // Data loading
  // ---------------------------------------------------------------------------
  const loadData = useCallback(async () => {
    try {
      const [peopleData, splitsData, txData] = await Promise.all([
        db.splitPeople.toArray(),
        db.expenseSplits.toArray(),
        db.transactions.orderBy('date').reverse().limit(50).toArray(),
      ]);
      setPeople(peopleData);
      setSplits(splitsData);
      setTransactions(txData);
    } catch (err) {
      console.error('Error loading split data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // ---------------------------------------------------------------------------
  // Computed values
  // ---------------------------------------------------------------------------
  const balanceSummary = useMemo(
    () => getBalanceSummary(splits, people),
    [splits, people],
  );

  const totalOwedToYou = useMemo(
    () =>
      balanceSummary
        .filter((b) => b.balance > 0)
        .reduce((sum, b) => sum + b.balance, 0),
    [balanceSummary],
  );

  const totalYouOwe = useMemo(
    () =>
      balanceSummary
        .filter((b) => b.balance < 0)
        .reduce((sum, b) => sum + Math.abs(b.balance), 0),
    [balanceSummary],
  );

  const netBalance = useMemo(
    () => Math.round((totalOwedToYou - totalYouOwe) * 100) / 100,
    [totalOwedToYou, totalYouOwe],
  );

  const selectedPerson = useMemo(
    () => people.find((p) => p.id === selectedPersonId),
    [people, selectedPersonId],
  );

  const personUnsettledSplits = useMemo(() => {
    if (!selectedPersonId) return [];
    return splits.filter((s) => s.personId === selectedPersonId && !s.settled);
  }, [splits, selectedPersonId]);

  const personSettledSplits = useMemo(() => {
    if (!selectedPersonId) return [];
    return splits.filter((s) => s.personId === selectedPersonId && s.settled);
  }, [splits, selectedPersonId]);

  const selectedTransaction = useMemo(
    () => transactions.find((t) => t.id === selectedTransactionId),
    [transactions, selectedTransactionId],
  );

  const filteredTransactions = useMemo(() => {
    if (!txSearchQuery.trim()) return transactions;
    const q = txSearchQuery.toLowerCase();
    return transactions.filter(
      (t) =>
        t.description.toLowerCase().includes(q) ||
        (t.merchant?.toLowerCase().includes(q) ?? false) ||
        Math.abs(t.amount).toFixed(2).includes(q),
    );
  }, [transactions, txSearchQuery]);

  // ---------------------------------------------------------------------------
  // Handlers: People
  // ---------------------------------------------------------------------------
  async function handleAddPerson() {
    if (!newPersonName.trim()) return;
    const person: SplitPerson = {
      id: `person_${Date.now()}`,
      name: newPersonName.trim(),
      emoji: newPersonEmoji,
      createdAt: new Date(),
    };
    await db.splitPeople.add(person);
    setPeople((prev) => [...prev, person]);
    setNewPersonName('');
    setNewPersonEmoji('😀');
    setShowAddPerson(false);
  }

  async function handleDeletePerson() {
    if (!deletePersonId) return;
    // Delete all splits for this person
    await db.expenseSplits.where('personId').equals(deletePersonId).delete();
    await db.splitPeople.delete(deletePersonId);
    setSplits((prev) => prev.filter((s) => s.personId !== deletePersonId));
    setPeople((prev) => prev.filter((p) => p.id !== deletePersonId));
    setDeletePersonId(null);
    if (selectedPersonId === deletePersonId) {
      setSelectedPersonId(null);
    }
  }

  // ---------------------------------------------------------------------------
  // Handlers: Settlement
  // ---------------------------------------------------------------------------
  function openSettleModal(personId: string) {
    const balance = balanceSummary.find((b) => b.personId === personId);
    setSettlePersonId(personId);
    setSettleAmount(balance ? Math.abs(balance.balance).toFixed(2) : '0.00');
    setSettleMethod('cash');
  }

  async function handleSettle() {
    if (!settlePersonId) return;
    setSettleLoading(true);
    try {
      // Get the unsettled split IDs for this person
      const unsettledIds = splits
        .filter((s) => s.personId === settlePersonId && !s.settled)
        .map((s) => s.id);

      // Update each split to settled
      for (const id of unsettledIds) {
        await db.expenseSplits.update(id, {
          settled: true,
          settledDate: new Date(),
          settledMethod: settleMethod,
        });
      }

      // Refresh data
      const updatedSplits = await db.expenseSplits.toArray();
      setSplits(updatedSplits);
      setSettlePersonId(null);
    } catch (err) {
      console.error('Error settling splits:', err);
    } finally {
      setSettleLoading(false);
    }
  }

  // ---------------------------------------------------------------------------
  // Handlers: Split Flow
  // ---------------------------------------------------------------------------
  function openSplitFlow() {
    setSplitFlowOpen(true);
    setSplitStep(1);
    setSelectedTransactionId(null);
    setSelectedPeopleIds([]);
    setSplitMode('equal');
    setCustomAmounts([]);
    setPercentages([]);
    setSplitPreview([]);
    setTxSearchQuery('');
  }

  function closeSplitFlow() {
    setSplitFlowOpen(false);
    setSplitStep(1);
  }

  function togglePersonSelection(personId: string) {
    setSelectedPeopleIds((prev) =>
      prev.includes(personId)
        ? prev.filter((id) => id !== personId)
        : [...prev, personId],
    );
  }

  function handleSplitStepNext() {
    if (splitStep === 1 && !selectedTransactionId) return;
    if (splitStep === 2 && selectedPeopleIds.length === 0) return;

    if (splitStep === 3) {
      // Generate preview
      generatePreview();
    }

    setSplitStep((prev) => Math.min(prev + 1, 5));
  }

  function generatePreview() {
    if (!selectedTransaction || selectedPeopleIds.length === 0) return;

    const selectedPeople = people.filter((p) =>
      selectedPeopleIds.includes(p.id),
    );
    const totalAmount = Math.abs(selectedTransaction.amount);

    try {
      const preview = previewSplit(
        totalAmount,
        selectedPeople,
        splitMode,
        splitMode === 'custom' ? customAmounts : undefined,
        splitMode === 'percentage' ? percentages : undefined,
      );
      setSplitPreview(preview);
    } catch (err) {
      console.error('Error generating preview:', err);
    }
  }

  function initializeCustomAmounts() {
    const count = selectedPeopleIds.length;
    if (!selectedTransaction || count === 0) return;
    const total = Math.abs(selectedTransaction.amount);
    const equalShare = Math.round((total / count) * 100) / 100;
    setCustomAmounts(Array.from<number>({ length: count }).fill(equalShare));
  }

  function initializePercentages() {
    const count = selectedPeopleIds.length;
    if (count === 0) return;
    const equalPct = Math.round((100 / count) * 100) / 100;
    const pcts = Array.from<number>({ length: count }).fill(equalPct);
    // Adjust last one so sum is exactly 100
    const sumOthers = pcts.slice(0, -1).reduce((a: number, b: number) => a + b, 0);
    pcts[pcts.length - 1] = Math.round((100 - sumOthers) * 100) / 100;
    setPercentages(pcts);
  }

  async function handleConfirmSplit() {
    if (!selectedTransaction || splitPreview.length === 0) return;
    setSplitLoading(true);
    try {
      const newSplits: ExpenseSplit[] = splitPreview.map((preview) => ({
        id: `split_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        transactionId: selectedTransaction.id,
        personId: preview.personId,
        amount: preview.amount,
        settled: false,
        createdAt: new Date(),
      }));

      await db.expenseSplits.bulkAdd(newSplits);
      setSplits((prev) => [...prev, ...newSplits]);
      closeSplitFlow();
    } catch (err) {
      console.error('Error creating splits:', err);
    } finally {
      setSplitLoading(false);
    }
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------
  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }

  function formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  function getTransactionForSplit(split: ExpenseSplit): Transaction | undefined {
    return transactions.find((t) => t.id === split.transactionId);
  }

  // ---------------------------------------------------------------------------
  // Loading state
  // ---------------------------------------------------------------------------
  if (loading) {
    return (
      <main className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
      </main>
    );
  }

  // ---------------------------------------------------------------------------
  // Person detail view
  // ---------------------------------------------------------------------------
  if (selectedPersonId && selectedPerson) {
    const personBalance = balanceSummary.find(
      (b) => b.personId === selectedPersonId,
    );
    const balance = personBalance?.balance ?? 0;

    return (
      <main className="space-y-6 pb-8">
        {/* Back button + header */}
        <button
          onClick={() => setSelectedPersonId(null)}
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors min-h-[48px]"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Splits
        </button>

        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-4xl">{selectedPerson.emoji ?? '👤'}</span>
            <div>
              <h1 className="text-3xl font-bold text-white">
                {selectedPerson.name}
              </h1>
              <p
                className={`mt-1 text-lg font-semibold ${
                  balance > 0
                    ? 'text-green-400'
                    : balance < 0
                      ? 'text-red-400'
                      : 'text-slate-400'
                }`}
              >
                {balance > 0
                  ? `Owes you ${formatCurrency(balance)}`
                  : balance < 0
                    ? `You owe ${formatCurrency(Math.abs(balance))}`
                    : 'All settled up'}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            {balance !== 0 && (
              <button
                onClick={() => openSettleModal(selectedPersonId)}
                className="inline-flex items-center gap-2 rounded-xl bg-teal-500 px-4 py-2.5 text-white shadow-lg shadow-teal-500/20 transition-all hover:bg-teal-400 min-h-[48px]"
              >
                <HandCoins className="h-5 w-5" />
                Settle Up
              </button>
            )}
            <button
              onClick={() => setDeletePersonId(selectedPersonId)}
              className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-red-400 hover:bg-red-500/20 transition-all min-h-[48px]"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Unsettled splits */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-white">
            Unsettled Splits ({personUnsettledSplits.length})
          </h2>
          {personUnsettledSplits.length === 0 ? (
            <div className="rounded-lg bg-white/5 border border-white/10 p-8 text-center">
              <Check className="mx-auto h-10 w-10 text-green-400 mb-3" />
              <p className="text-slate-400">All settled up with {selectedPerson.name}!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {personUnsettledSplits.map((split) => {
                const tx = getTransactionForSplit(split);
                return (
                  <div
                    key={split.id}
                    className="rounded-lg bg-white/5 border border-white/10 p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-white">
                        {tx?.description ?? 'Unknown transaction'}
                      </p>
                      <p className="text-sm text-slate-400">
                        {formatDate(split.createdAt)}
                        {tx && ` -- ${formatCurrency(Math.abs(tx.amount))} total`}
                      </p>
                    </div>
                    <span
                      className={`text-lg font-semibold ${
                        split.amount > 0 ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {split.amount > 0 ? '+' : '-'}
                      {formatCurrency(Math.abs(split.amount))}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Settled history */}
        {personSettledSplits.length > 0 && (
          <section>
            <h2 className="mb-4 text-lg font-semibold text-white">
              Settled History ({personSettledSplits.length})
            </h2>
            <div className="space-y-3">
              {personSettledSplits.map((split) => {
                const tx = getTransactionForSplit(split);
                return (
                  <div
                    key={split.id}
                    className="rounded-lg bg-white/5 border border-white/10 p-4 flex items-center justify-between opacity-60"
                  >
                    <div>
                      <p className="font-medium text-white">
                        {tx?.description ?? 'Unknown transaction'}
                      </p>
                      <p className="text-sm text-slate-400">
                        Settled {split.settledDate ? formatDate(split.settledDate) : ''}
                        {split.settledMethod && ` via ${split.settledMethod}`}
                      </p>
                    </div>
                    <span className="text-lg font-semibold text-slate-400 line-through">
                      {formatCurrency(Math.abs(split.amount))}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Settlement modal */}
        {settlePersonId === selectedPersonId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-2xl bg-slate-800 border border-white/10 p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Settle Up</h3>
                <button
                  onClick={() => setSettlePersonId(null)}
                  className="rounded-lg p-2 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={settleAmount}
                    onChange={(e) => setSettleAmount(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 min-h-[48px]"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={settleMethod}
                    onChange={(e) => setSettleMethod(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 min-h-[48px]"
                  >
                    {SETTLEMENT_METHODS.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => void handleSettle()}
                  disabled={settleLoading || !settleAmount || parseFloat(settleAmount) <= 0}
                  className="w-full rounded-xl bg-teal-500 px-4 py-3 font-semibold text-white shadow-lg shadow-teal-500/20 transition-all hover:bg-teal-400 disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
                >
                  {settleLoading ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Settling...
                    </span>
                  ) : (
                    `Settle ${formatCurrency(parseFloat(settleAmount) || 0)}`
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete person confirmation */}
        <ConfirmDialog
          open={deletePersonId === selectedPersonId}
          onOpenChange={(open) => {
            if (!open) setDeletePersonId(null);
          }}
          onConfirm={handleDeletePerson}
          title="Remove Person"
          description={`Are you sure you want to remove ${selectedPerson.name}? All their split records will be deleted.`}
          confirmLabel="Remove"
          variant="destructive"
          icon={<Trash2 className="h-5 w-5" />}
        />
      </main>
    );
  }

  // ---------------------------------------------------------------------------
  // Split flow modal
  // ---------------------------------------------------------------------------
  const renderSplitFlow = () => {
    if (!splitFlowOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-800 border border-white/10 p-6 shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-white">Split a Transaction</h3>
              <p className="text-sm text-slate-400">
                Step {splitStep} of 5
              </p>
            </div>
            <button
              onClick={closeSplitFlow}
              className="rounded-lg p-2 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="mb-6 flex gap-1">
            {[1, 2, 3, 4, 5].map((step) => (
              <div
                key={step}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  step <= splitStep ? 'bg-teal-500' : 'bg-white/10'
                }`}
              />
            ))}
          </div>

          {/* Step 1: Select transaction */}
          {splitStep === 1 && (
            <div className="space-y-4">
              <h4 className="font-semibold text-white">Select a transaction</h4>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={txSearchQuery}
                  onChange={(e) => setTxSearchQuery(e.target.value)}
                  placeholder="Search transactions..."
                  className="w-full rounded-lg border border-white/10 bg-white/5 pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 min-h-[48px]"
                />
              </div>
              <div className="max-h-[40vh] overflow-y-auto space-y-2">
                {filteredTransactions.length === 0 ? (
                  <p className="text-center text-slate-400 py-8">No transactions found</p>
                ) : (
                  filteredTransactions.map((tx) => (
                    <button
                      key={tx.id}
                      onClick={() => setSelectedTransactionId(tx.id)}
                      className={`w-full rounded-lg border p-4 text-left transition-all min-h-[48px] ${
                        selectedTransactionId === tx.id
                          ? 'border-teal-500 bg-teal-500/10'
                          : 'border-white/10 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-white truncate">
                            {tx.description}
                          </p>
                          <p className="text-sm text-slate-400">
                            {formatDate(tx.date)}
                            {tx.category && ` -- ${tx.category}`}
                          </p>
                        </div>
                        <span
                          className={`ml-3 text-lg font-semibold whitespace-nowrap ${
                            tx.amount < 0 ? 'text-red-400' : 'text-green-400'
                          }`}
                        >
                          {formatCurrency(Math.abs(tx.amount))}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Step 2: Select people */}
          {splitStep === 2 && (
            <div className="space-y-4">
              <h4 className="font-semibold text-white">Who to split with?</h4>
              {people.length === 0 ? (
                <div className="rounded-lg bg-white/5 border border-white/10 p-8 text-center">
                  <Users className="mx-auto h-10 w-10 text-slate-500 mb-3" />
                  <p className="text-slate-400 mb-4">No people added yet</p>
                  <button
                    onClick={() => {
                      closeSplitFlow();
                      setShowAddPerson(true);
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-teal-500 px-4 py-2.5 text-white hover:bg-teal-400 transition-all min-h-[48px]"
                  >
                    <UserPlus className="h-4 w-4" />
                    Add a Person
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {people.map((person) => {
                    const isSelected = selectedPeopleIds.includes(person.id);
                    return (
                      <button
                        key={person.id}
                        onClick={() => togglePersonSelection(person.id)}
                        className={`w-full rounded-lg border p-4 text-left transition-all flex items-center gap-3 min-h-[48px] ${
                          isSelected
                            ? 'border-teal-500 bg-teal-500/10'
                            : 'border-white/10 bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        <span className="text-2xl">{person.emoji ?? '👤'}</span>
                        <span className="font-medium text-white flex-1">
                          {person.name}
                        </span>
                        {isSelected && (
                          <Check className="h-5 w-5 text-teal-400" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Choose split mode */}
          {splitStep === 3 && (
            <div className="space-y-4">
              <h4 className="font-semibold text-white">How to split?</h4>
              <div className="space-y-2">
                {(
                  [
                    {
                      mode: 'equal' as SplitMode,
                      label: 'Split Equally',
                      desc: 'Everyone pays the same amount',
                    },
                    {
                      mode: 'custom' as SplitMode,
                      label: 'Custom Amounts',
                      desc: 'Set specific amounts for each person',
                    },
                    {
                      mode: 'percentage' as SplitMode,
                      label: 'By Percentage',
                      desc: 'Set percentage shares for each person',
                    },
                  ] as const
                ).map(({ mode, label, desc }) => (
                  <button
                    key={mode}
                    onClick={() => {
                      setSplitMode(mode);
                      if (mode === 'custom') initializeCustomAmounts();
                      if (mode === 'percentage') initializePercentages();
                    }}
                    className={`w-full rounded-lg border p-4 text-left transition-all min-h-[48px] ${
                      splitMode === mode
                        ? 'border-teal-500 bg-teal-500/10'
                        : 'border-white/10 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <p className="font-medium text-white">{label}</p>
                    <p className="text-sm text-slate-400">{desc}</p>
                  </button>
                ))}
              </div>

              {/* Custom amounts input */}
              {splitMode === 'custom' && selectedTransaction && (
                <div className="space-y-3 mt-4">
                  <p className="text-sm text-slate-400">
                    Total: {formatCurrency(Math.abs(selectedTransaction.amount))}
                  </p>
                  {selectedPeopleIds.map((personId, index) => {
                    const person = people.find((p) => p.id === personId);
                    return (
                      <div
                        key={personId}
                        className="flex items-center gap-3"
                      >
                        <span className="text-lg">{person?.emoji ?? '👤'}</span>
                        <span className="text-sm text-white flex-1 min-w-0 truncate">
                          {person?.name}
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          value={customAmounts[index] ?? 0}
                          onChange={(e) => {
                            const newAmounts = [...customAmounts];
                            newAmounts[index] = parseFloat(e.target.value) || 0;
                            setCustomAmounts(newAmounts);
                          }}
                          className="w-28 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white text-right focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 min-h-[48px]"
                        />
                      </div>
                    );
                  })}
                  {(() => {
                    const sum = customAmounts.reduce((a, b) => a + b, 0);
                    const total = Math.abs(selectedTransaction.amount);
                    const diff = Math.round((total - sum) * 100) / 100;
                    if (Math.abs(diff) > 0.01) {
                      return (
                        <p className="text-sm text-amber-400">
                          Remaining: {formatCurrency(diff)}
                        </p>
                      );
                    }
                    return (
                      <p className="text-sm text-green-400">
                        Amounts add up correctly
                      </p>
                    );
                  })()}
                </div>
              )}

              {/* Percentage input */}
              {splitMode === 'percentage' && (
                <div className="space-y-3 mt-4">
                  {selectedPeopleIds.map((personId, index) => {
                    const person = people.find((p) => p.id === personId);
                    return (
                      <div
                        key={personId}
                        className="flex items-center gap-3"
                      >
                        <span className="text-lg">{person?.emoji ?? '👤'}</span>
                        <span className="text-sm text-white flex-1 min-w-0 truncate">
                          {person?.name}
                        </span>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            step="0.01"
                            value={percentages[index] ?? 0}
                            onChange={(e) => {
                              const newPcts = [...percentages];
                              newPcts[index] = parseFloat(e.target.value) || 0;
                              setPercentages(newPcts);
                            }}
                            className="w-20 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white text-right focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 min-h-[48px]"
                          />
                          <span className="text-slate-400">%</span>
                        </div>
                      </div>
                    );
                  })}
                  {(() => {
                    const sum = Math.round(percentages.reduce((a, b) => a + b, 0) * 100) / 100;
                    if (Math.abs(sum - 100) > 0.01) {
                      return (
                        <p className="text-sm text-amber-400">
                          Total: {sum}% (must equal 100%)
                        </p>
                      );
                    }
                    return (
                      <p className="text-sm text-green-400">
                        Percentages add up to 100%
                      </p>
                    );
                  })()}
                </div>
              )}
            </div>
          )}

          {/* Step 4: Preview */}
          {splitStep === 4 && selectedTransaction && (
            <div className="space-y-4">
              <h4 className="font-semibold text-white">Preview Split</h4>
              <div className="rounded-lg bg-white/5 border border-white/10 p-4">
                <p className="font-medium text-white">{selectedTransaction.description}</p>
                <p className="text-sm text-slate-400">
                  {formatDate(selectedTransaction.date)} --{' '}
                  {formatCurrency(Math.abs(selectedTransaction.amount))} total
                </p>
              </div>

              <div className="space-y-2">
                {splitPreview.map((preview) => {
                  const person = people.find((p) => p.id === preview.personId);
                  return (
                    <div
                      key={preview.personId}
                      className="flex items-center justify-between rounded-lg bg-white/5 border border-white/10 p-4"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{person?.emoji ?? '👤'}</span>
                        <span className="font-medium text-white">
                          {preview.personName}
                        </span>
                      </div>
                      <span className="text-lg font-semibold text-green-400">
                        {formatCurrency(preview.amount)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 5: Confirm */}
          {splitStep === 5 && (
            <div className="space-y-4 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-teal-500/20 flex items-center justify-center">
                <Check className="h-8 w-8 text-teal-400" />
              </div>
              <h4 className="text-xl font-bold text-white">Confirm Split</h4>
              <p className="text-slate-400">
                This will create {splitPreview.length} split
                {splitPreview.length !== 1 ? 's' : ''} for this transaction.
                Each person&apos;s share will be tracked until settled.
              </p>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="mt-6 flex gap-3">
            {splitStep > 1 && (
              <button
                onClick={() => setSplitStep((prev) => prev - 1)}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-slate-300 hover:bg-white/10 transition-all min-h-[48px]"
              >
                Back
              </button>
            )}
            {splitStep < 5 ? (
              <button
                onClick={handleSplitStepNext}
                disabled={
                  (splitStep === 1 && !selectedTransactionId) ||
                  (splitStep === 2 && selectedPeopleIds.length === 0)
                }
                className="flex-1 rounded-xl bg-teal-500 px-4 py-3 font-semibold text-white shadow-lg shadow-teal-500/20 transition-all hover:bg-teal-400 disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={() => void handleConfirmSplit()}
                disabled={splitLoading}
                className="flex-1 rounded-xl bg-teal-500 px-4 py-3 font-semibold text-white shadow-lg shadow-teal-500/20 transition-all hover:bg-teal-400 disabled:opacity-50 min-h-[48px]"
              >
                {splitLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </span>
                ) : (
                  'Confirm Split'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ---------------------------------------------------------------------------
  // Main view
  // ---------------------------------------------------------------------------
  return (
    <main className="space-y-8 pb-8">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white flex items-center gap-3">
            <Users className="h-9 w-9 text-teal-400" />
            Expense Splitting
          </h1>
          <p className="mt-2 text-lg text-slate-400">
            Track shared expenses and settle up with friends
            <HelpTooltip
              content="Split transactions with friends and family. Track who owes what and settle debts via Cash, E-Transfer, Venmo, or PayPal."
              side="right"
            />
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAddPerson(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-slate-300 transition-all hover:bg-white/10 hover:text-white min-h-[48px]"
          >
            <UserPlus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Person</span>
          </button>
          <button
            onClick={openSplitFlow}
            className="inline-flex items-center gap-2 rounded-xl bg-teal-500 px-4 py-2.5 text-white shadow-lg shadow-teal-500/20 transition-all hover:bg-teal-400 min-h-[48px]"
          >
            <Receipt className="h-4 w-4" />
            <span className="hidden sm:inline">Split a Transaction</span>
          </button>
        </div>
      </header>

      {/* Balance Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-green-500/10 border border-green-500/20 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-lg bg-green-500/20 p-2">
              <TrendingUp className="h-5 w-5 text-green-400" />
            </div>
            <span className="text-sm font-medium text-green-300">Owed to You</span>
          </div>
          <p className="text-2xl font-bold text-green-400">
            {formatCurrency(totalOwedToYou)}
          </p>
        </div>

        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-lg bg-red-500/20 p-2">
              <TrendingDown className="h-5 w-5 text-red-400" />
            </div>
            <span className="text-sm font-medium text-red-300">You Owe</span>
          </div>
          <p className="text-2xl font-bold text-red-400">
            {formatCurrency(totalYouOwe)}
          </p>
        </div>

        <div
          className={`rounded-xl border p-5 ${
            netBalance >= 0
              ? 'bg-teal-500/10 border-teal-500/20'
              : 'bg-amber-500/10 border-amber-500/20'
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <div
              className={`rounded-lg p-2 ${
                netBalance >= 0 ? 'bg-teal-500/20' : 'bg-amber-500/20'
              }`}
            >
              <Scale
                className={`h-5 w-5 ${
                  netBalance >= 0 ? 'text-teal-400' : 'text-amber-400'
                }`}
              />
            </div>
            <span
              className={`text-sm font-medium ${
                netBalance >= 0 ? 'text-teal-300' : 'text-amber-300'
              }`}
            >
              Net Balance
            </span>
          </div>
          <p
            className={`text-2xl font-bold ${
              netBalance >= 0 ? 'text-teal-400' : 'text-amber-400'
            }`}
          >
            {netBalance >= 0 ? '+' : '-'}
            {formatCurrency(Math.abs(netBalance))}
          </p>
        </div>
      </div>

      {/* People Management Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">
            People ({people.length})
          </h2>
        </div>

        {people.length === 0 ? (
          <div className="rounded-xl bg-white/5 border border-white/10 p-12 text-center">
            <Users className="mx-auto h-12 w-12 text-slate-500 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No people yet</h3>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">
              Add people you split expenses with. Track shared bills, dinners,
              and more.
            </p>
            <button
              onClick={() => setShowAddPerson(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-teal-500 px-6 py-3 text-white shadow-lg shadow-teal-500/20 transition-all hover:bg-teal-400 min-h-[48px]"
            >
              <UserPlus className="h-5 w-5" />
              Add Your First Person
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {balanceSummary.map((summary) => {
              const person = people.find((p) => p.id === summary.personId);
              if (!person) return null;
              return (
                <button
                  key={person.id}
                  onClick={() => setSelectedPersonId(person.id)}
                  className="rounded-xl bg-white/5 border border-white/10 p-5 text-left transition-all hover:bg-white/10 hover:border-white/20 group min-h-[48px]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{person.emoji ?? '👤'}</span>
                      <div>
                        <p className="font-semibold text-white group-hover:text-teal-300 transition-colors">
                          {person.name}
                        </p>
                        <p className="text-sm text-slate-400">
                          {summary.splitCount} unsettled split
                          {summary.splitCount !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-lg font-bold ${
                          summary.balance > 0
                            ? 'text-green-400'
                            : summary.balance < 0
                              ? 'text-red-400'
                              : 'text-slate-400'
                        }`}
                      >
                        {summary.balance > 0
                          ? `+${formatCurrency(summary.balance)}`
                          : summary.balance < 0
                            ? `-${formatCurrency(Math.abs(summary.balance))}`
                            : formatCurrency(0)}
                      </span>
                      <ChevronRight className="h-5 w-5 text-slate-500 group-hover:text-slate-300 transition-colors" />
                    </div>
                  </div>
                  {summary.balance !== 0 && (
                    <p
                      className={`mt-2 text-xs font-medium px-2 py-1 rounded-full inline-block ${
                        summary.balance > 0
                          ? 'bg-green-500/10 text-green-400'
                          : 'bg-red-500/10 text-red-400'
                      }`}
                    >
                      {summary.balance > 0 ? 'Owes you' : 'You owe'}
                    </p>
                  )}
                </button>
              );
            })}

            {/* People with no splits yet (not in balanceSummary, or balance 0 with no splits) */}
            {people
              .filter((p) => !balanceSummary.some((b) => b.personId === p.id))
              .map((person) => (
                <button
                  key={person.id}
                  onClick={() => setSelectedPersonId(person.id)}
                  className="rounded-xl bg-white/5 border border-white/10 p-5 text-left transition-all hover:bg-white/10 hover:border-white/20 group min-h-[48px]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{person.emoji ?? '👤'}</span>
                      <div>
                        <p className="font-semibold text-white group-hover:text-teal-300 transition-colors">
                          {person.name}
                        </p>
                        <p className="text-sm text-slate-400">No splits yet</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-500 group-hover:text-slate-300 transition-colors" />
                  </div>
                </button>
              ))}
          </div>
        )}
      </section>

      {/* Add Person Modal */}
      {showAddPerson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-800 border border-white/10 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Add Person</h3>
              <button
                onClick={() => setShowAddPerson(false)}
                className="rounded-lg p-2 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Name input */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={newPersonName}
                  onChange={(e) => setNewPersonName(e.target.value)}
                  placeholder="e.g., Alice, Bob"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 min-h-[48px]"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newPersonName.trim()) {
                      void handleAddPerson();
                    }
                  }}
                />
              </div>

              {/* Emoji picker */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Emoji
                </label>
                <div className="grid grid-cols-8 gap-2">
                  {EMOJI_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setNewPersonEmoji(emoji)}
                      className={`flex items-center justify-center rounded-lg p-2 text-xl transition-all ${
                        newPersonEmoji === emoji
                          ? 'bg-teal-500/20 border-2 border-teal-500 scale-110'
                          : 'bg-white/5 border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              {newPersonName.trim() && (
                <div className="rounded-lg bg-white/5 border border-white/10 p-4 flex items-center gap-3">
                  <span className="text-3xl">{newPersonEmoji}</span>
                  <span className="font-semibold text-white">{newPersonName}</span>
                </div>
              )}

              {/* Add button */}
              <button
                onClick={() => void handleAddPerson()}
                disabled={!newPersonName.trim()}
                className="w-full rounded-xl bg-teal-500 px-4 py-3 font-semibold text-white shadow-lg shadow-teal-500/20 transition-all hover:bg-teal-400 disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
              >
                Add Person
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Split Flow Modal */}
      {renderSplitFlow()}

      {/* Delete person confirmation (from main list) */}
      <ConfirmDialog
        open={deletePersonId !== null && deletePersonId !== selectedPersonId}
        onOpenChange={(open) => {
          if (!open) setDeletePersonId(null);
        }}
        onConfirm={handleDeletePerson}
        title="Remove Person"
        description="Are you sure you want to remove this person? All their split records will be deleted."
        confirmLabel="Remove"
        variant="destructive"
        icon={<Trash2 className="h-5 w-5" />}
      />
    </main>
  );
}
