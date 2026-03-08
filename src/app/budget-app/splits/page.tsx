"use client";

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

import { useState, useEffect, useCallback, useMemo } from "react";
import { db } from "@/lib/budget-db";
import type { SplitPerson, ExpenseSplit, Transaction } from "@/types/budget";
import {
  previewSplit,
  getBalanceSummary,
  type SplitMode,
  type SplitPreview,
} from "@/lib/expense-splits/split-engine";
import { ConfirmDialog } from "@/components/budget/ConfirmDialog";
import { HelpTooltip } from "@/components/budget/HelpTooltip";
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
} from "lucide-react";
import { getCurrentCurrency, getCurrentLocale } from "@/lib/locale-storage";
import { LOCALE_METADATA } from "@/i18n/config";
import { formatCurrency as formatCurrencyUtil } from "@/i18n/utils/formatCurrency";
import { useTranslations } from "next-intl";

// ---------------------------------------------------------------------------
// Emoji picker options
// ---------------------------------------------------------------------------
const EMOJI_OPTIONS = [
  "😀",
  "😎",
  "🥳",
  "🤓",
  "😇",
  "🙃",
  "🤗",
  "😺",
  "👤",
  "👩",
  "👨",
  "👧",
  "👦",
  "🧑",
  "👵",
  "👴",
  "🏠",
  "🍕",
  "🎮",
  "📱",
  "💼",
  "🎓",
  "🐶",
  "🐱",
  "⭐",
  "🔥",
  "💜",
  "💚",
  "💙",
  "🧡",
  "❤️",
  "🖤",
];

// ---------------------------------------------------------------------------
// Settlement method options
// ---------------------------------------------------------------------------
const SETTLEMENT_METHODS = [
  { value: "cash", labelKey: "settlementMethods.cash" },
  { value: "e-transfer", labelKey: "settlementMethods.eTransfer" },
  { value: "venmo", labelKey: "settlementMethods.venmo" },
  { value: "paypal", labelKey: "settlementMethods.paypal" },
  { value: "other", labelKey: "settlementMethods.other" },
] as const;

// ---------------------------------------------------------------------------
// Main page component
// ---------------------------------------------------------------------------
export default function ExpenseSplitsPage() {
  const t = useTranslations("splits");
  // Data state
  const [people, setPeople] = useState<SplitPerson[]>([]);
  const [splits, setSplits] = useState<ExpenseSplit[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // UI state
  const [showAddPerson, setShowAddPerson] = useState(false);
  const [newPersonName, setNewPersonName] = useState("");
  const [newPersonEmoji, setNewPersonEmoji] = useState("😀");
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [splitFlowOpen, setSplitFlowOpen] = useState(false);
  const [deletePersonId, setDeletePersonId] = useState<string | null>(null);

  // Settlement modal state
  const [settlePersonId, setSettlePersonId] = useState<string | null>(null);
  const [settleAmount, setSettleAmount] = useState("");
  const [settleMethod, setSettleMethod] = useState("cash");
  const [settleLoading, setSettleLoading] = useState(false);

  // Split flow state
  const [splitStep, setSplitStep] = useState(1);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const [selectedPeopleIds, setSelectedPeopleIds] = useState<string[]>([]);
  const [splitMode, setSplitMode] = useState<SplitMode>("equal");
  const [customAmounts, setCustomAmounts] = useState<number[]>([]);
  const [percentages, setPercentages] = useState<number[]>([]);
  const [splitPreview, setSplitPreview] = useState<SplitPreview[]>([]);
  const [splitLoading, setSplitLoading] = useState(false);
  const [txSearchQuery, setTxSearchQuery] = useState("");

  // ---------------------------------------------------------------------------
  // Data loading
  // ---------------------------------------------------------------------------
  const loadData = useCallback(async () => {
    try {
      const [peopleData, splitsData, txData] = await Promise.all([
        db.splitPeople.toArray(),
        db.expenseSplits.toArray(),
        db.transactions.orderBy("date").reverse().limit(50).toArray(),
      ]);
      setPeople(peopleData);
      setSplits(splitsData);
      setTransactions(txData);
    } catch (err) {
      console.error("Error loading split data:", err);
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
  const balanceSummary = useMemo(() => getBalanceSummary(splits, people), [splits, people]);

  const totalOwedToYou = useMemo(
    () => balanceSummary.filter((b) => b.balance > 0).reduce((sum, b) => sum + b.balance, 0),
    [balanceSummary]
  );

  const totalYouOwe = useMemo(
    () =>
      balanceSummary.filter((b) => b.balance < 0).reduce((sum, b) => sum + Math.abs(b.balance), 0),
    [balanceSummary]
  );

  const netBalance = useMemo(
    () => Math.round((totalOwedToYou - totalYouOwe) * 100) / 100,
    [totalOwedToYou, totalYouOwe]
  );

  const selectedPerson = useMemo(
    () => people.find((p) => p.id === selectedPersonId),
    [people, selectedPersonId]
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
    [transactions, selectedTransactionId]
  );

  const filteredTransactions = useMemo(() => {
    if (!txSearchQuery.trim()) return transactions;
    const q = txSearchQuery.toLowerCase();
    return transactions.filter(
      (t) =>
        t.description.toLowerCase().includes(q) ||
        (t.merchant?.toLowerCase().includes(q) ?? false) ||
        Math.abs(t.amount).toFixed(2).includes(q)
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
    setNewPersonName("");
    setNewPersonEmoji("😀");
    setShowAddPerson(false);
  }

  async function handleDeletePerson() {
    if (!deletePersonId) return;
    // Delete all splits for this person
    await db.expenseSplits.where("personId").equals(deletePersonId).delete();
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
    setSettleAmount(balance ? Math.abs(balance.balance).toFixed(2) : "0.00");
    setSettleMethod("cash");
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
      console.error("Error settling splits:", err);
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
    setSplitMode("equal");
    setCustomAmounts([]);
    setPercentages([]);
    setSplitPreview([]);
    setTxSearchQuery("");
  }

  function closeSplitFlow() {
    setSplitFlowOpen(false);
    setSplitStep(1);
  }

  function togglePersonSelection(personId: string) {
    setSelectedPeopleIds((prev) =>
      prev.includes(personId) ? prev.filter((id) => id !== personId) : [...prev, personId]
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

    const selectedPeople = people.filter((p) => selectedPeopleIds.includes(p.id));
    const totalAmount = Math.abs(selectedTransaction.amount);

    try {
      const preview = previewSplit(
        totalAmount,
        selectedPeople,
        splitMode,
        splitMode === "custom" ? customAmounts : undefined,
        splitMode === "percentage" ? percentages : undefined
      );
      setSplitPreview(preview);
    } catch (err) {
      console.error("Error generating preview:", err);
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
      console.error("Error creating splits:", err);
    } finally {
      setSplitLoading(false);
    }
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------
  function formatCurrency(amount: number): string {
    const currency = getCurrentCurrency() || LOCALE_METADATA[getCurrentLocale()].currency;
    return formatCurrencyUtil(amount, currency, getCurrentLocale());
  }

  function formatDate(date: Date | string): string {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString(getCurrentLocale(), {
      month: "short",
      day: "numeric",
      year: "numeric",
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
    const personBalance = balanceSummary.find((b) => b.personId === selectedPersonId);
    const balance = personBalance?.balance ?? 0;

    return (
      <main className="space-y-6 pb-8">
        {/* Back button + header */}
        <button
          onClick={() => setSelectedPersonId(null)}
          className="inline-flex min-h-[48px] items-center gap-2 text-slate-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-5 w-5" />
          {t("backToSplits")}
        </button>

        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-4xl">{selectedPerson.emoji ?? "👤"}</span>
            <div>
              <h1 className="text-3xl font-bold text-white">{selectedPerson.name}</h1>
              <p
                className={`mt-1 text-lg font-semibold ${
                  balance > 0 ? "text-green-400" : balance < 0 ? "text-red-400" : "text-slate-400"
                }`}
              >
                {balance > 0
                  ? t("owesYou", { amount: formatCurrency(balance) })
                  : balance < 0
                    ? t("youOwe", { amount: formatCurrency(Math.abs(balance)) })
                    : t("allSettledUp")}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            {balance !== 0 && (
              <button
                onClick={() => openSettleModal(selectedPersonId)}
                className="inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-teal-500 px-4 py-2.5 text-white shadow-lg shadow-teal-500/20 transition-all hover:bg-teal-400"
              >
                <HandCoins className="h-5 w-5" />
                {t("settleUp")}
              </button>
            )}
            <button
              onClick={() => setDeletePersonId(selectedPersonId)}
              className="inline-flex min-h-[48px] items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-red-400 transition-all hover:bg-red-500/20"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Unsettled splits */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-white">
            {t("unsettledSplits", { count: personUnsettledSplits.length })}
          </h2>
          {personUnsettledSplits.length === 0 ? (
            <div className="rounded-lg border border-white/10 bg-white/5 p-8 text-center">
              <Check className="mx-auto mb-3 h-10 w-10 text-green-400" />
              <p className="text-slate-400">
                {t("allSettledUpWith", { name: selectedPerson.name })}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {personUnsettledSplits.map((split) => {
                const tx = getTransactionForSplit(split);
                return (
                  <div
                    key={split.id}
                    className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4"
                  >
                    <div>
                      <p className="font-medium text-white">
                        {tx?.description ?? t("unknownTransaction")}
                      </p>
                      <p className="text-sm text-slate-400">
                        {formatDate(split.createdAt)}
                        {tx && ` -- ${formatCurrency(Math.abs(tx.amount))} ${t("total")}`}
                      </p>
                    </div>
                    <span
                      className={`text-lg font-semibold ${
                        split.amount > 0 ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {split.amount > 0 ? "+" : "-"}
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
              {t("settledHistory", { count: personSettledSplits.length })}
            </h2>
            <div className="space-y-3">
              {personSettledSplits.map((split) => {
                const tx = getTransactionForSplit(split);
                return (
                  <div
                    key={split.id}
                    className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4 opacity-60"
                  >
                    <div>
                      <p className="font-medium text-white">
                        {tx?.description ?? t("unknownTransaction")}
                      </p>
                      <p className="text-sm text-slate-400">
                        {t("settled")} {split.settledDate ? formatDate(split.settledDate) : ""}
                        {split.settledMethod && ` ${t("via")} ${split.settledMethod}`}
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-800 p-6 shadow-xl">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">{t("settleUp")}</h3>
                <button
                  onClick={() => setSettlePersonId(null)}
                  className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-300">
                    {t("amount")}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={settleAmount}
                    onChange={(e) => setSettleAmount(e.target.value)}
                    className="min-h-[48px] w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-300">
                    {t("paymentMethod")}
                  </label>
                  <select
                    value={settleMethod}
                    onChange={(e) => setSettleMethod(e.target.value)}
                    className="min-h-[48px] w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  >
                    {SETTLEMENT_METHODS.map((m) => (
                      <option key={m.value} value={m.value}>
                        {t(m.labelKey)}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => void handleSettle()}
                  disabled={settleLoading || !settleAmount || parseFloat(settleAmount) <= 0}
                  className="min-h-[48px] w-full rounded-xl bg-teal-500 px-4 py-3 font-semibold text-white shadow-lg shadow-teal-500/20 transition-all hover:bg-teal-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {settleLoading ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t("settling")}
                    </span>
                  ) : (
                    t("settleAmount", { amount: formatCurrency(parseFloat(settleAmount) || 0) })
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
          title={t("confirmRemovePerson.title")}
          description={t("confirmRemovePerson.descriptionNamed", { name: selectedPerson.name })}
          confirmLabel={t("confirmRemovePerson.confirmLabel")}
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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
        <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-slate-800 p-6 shadow-xl">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white">{t("splitFlow.title")}</h3>
              <p className="text-sm text-slate-400">
                {t("splitFlow.step", { current: splitStep, total: 5 })}
              </p>
            </div>
            <button
              onClick={closeSplitFlow}
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
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
                  step <= splitStep ? "bg-teal-500" : "bg-white/10"
                }`}
              />
            ))}
          </div>

          {/* Step 1: Select transaction */}
          {splitStep === 1 && (
            <div className="space-y-4">
              <h4 className="font-semibold text-white">{t("splitFlow.selectTransaction")}</h4>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={txSearchQuery}
                  onChange={(e) => setTxSearchQuery(e.target.value)}
                  placeholder={t("splitFlow.searchTransactions")}
                  className="min-h-[48px] w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
              <div className="max-h-[40vh] space-y-2 overflow-y-auto">
                {filteredTransactions.length === 0 ? (
                  <p className="py-8 text-center text-slate-400">{t("splitFlow.noTransactions")}</p>
                ) : (
                  filteredTransactions.map((tx) => (
                    <button
                      key={tx.id}
                      onClick={() => setSelectedTransactionId(tx.id)}
                      className={`min-h-[48px] w-full rounded-lg border p-4 text-left transition-all ${
                        selectedTransactionId === tx.id
                          ? "border-teal-500 bg-teal-500/10"
                          : "border-white/10 bg-white/5 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-white">{tx.description}</p>
                          <p className="text-sm text-slate-400">
                            {formatDate(tx.date)}
                            {tx.category && ` -- ${tx.category}`}
                          </p>
                        </div>
                        <span
                          className={`ml-3 whitespace-nowrap text-lg font-semibold ${
                            tx.amount < 0 ? "text-red-400" : "text-green-400"
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
              <h4 className="font-semibold text-white">{t("splitFlow.whoToSplitWith")}</h4>
              {people.length === 0 ? (
                <div className="rounded-lg border border-white/10 bg-white/5 p-8 text-center">
                  <Users className="mx-auto mb-3 h-10 w-10 text-slate-500" />
                  <p className="mb-4 text-slate-400">{t("noPeopleYet")}</p>
                  <button
                    onClick={() => {
                      closeSplitFlow();
                      setShowAddPerson(true);
                    }}
                    className="inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-teal-500 px-4 py-2.5 text-white transition-all hover:bg-teal-400"
                  >
                    <UserPlus className="h-4 w-4" />
                    {t("addAPerson")}
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
                        className={`flex min-h-[48px] w-full items-center gap-3 rounded-lg border p-4 text-left transition-all ${
                          isSelected
                            ? "border-teal-500 bg-teal-500/10"
                            : "border-white/10 bg-white/5 hover:bg-white/10"
                        }`}
                      >
                        <span className="text-2xl">{person.emoji ?? "👤"}</span>
                        <span className="flex-1 font-medium text-white">{person.name}</span>
                        {isSelected && <Check className="h-5 w-5 text-teal-400" />}
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
              <h4 className="font-semibold text-white">{t("splitFlow.howToSplit")}</h4>
              <div className="space-y-2">
                {(
                  [
                    {
                      mode: "equal" as SplitMode,
                      labelKey: "splitFlow.modes.equal.label",
                      descKey: "splitFlow.modes.equal.description",
                    },
                    {
                      mode: "custom" as SplitMode,
                      labelKey: "splitFlow.modes.custom.label",
                      descKey: "splitFlow.modes.custom.description",
                    },
                    {
                      mode: "percentage" as SplitMode,
                      labelKey: "splitFlow.modes.percentage.label",
                      descKey: "splitFlow.modes.percentage.description",
                    },
                  ] as const
                ).map(({ mode, labelKey, descKey }) => (
                  <button
                    key={mode}
                    onClick={() => {
                      setSplitMode(mode);
                      if (mode === "custom") initializeCustomAmounts();
                      if (mode === "percentage") initializePercentages();
                    }}
                    className={`min-h-[48px] w-full rounded-lg border p-4 text-left transition-all ${
                      splitMode === mode
                        ? "border-teal-500 bg-teal-500/10"
                        : "border-white/10 bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <p className="font-medium text-white">{t(labelKey)}</p>
                    <p className="text-sm text-slate-400">{t(descKey)}</p>
                  </button>
                ))}
              </div>

              {/* Custom amounts input */}
              {splitMode === "custom" && selectedTransaction && (
                <div className="mt-4 space-y-3">
                  <p className="text-sm text-slate-400">
                    {t("total")}: {formatCurrency(Math.abs(selectedTransaction.amount))}
                  </p>
                  {selectedPeopleIds.map((personId, index) => {
                    const person = people.find((p) => p.id === personId);
                    return (
                      <div key={personId} className="flex items-center gap-3">
                        <span className="text-lg">{person?.emoji ?? "👤"}</span>
                        <span className="min-w-0 flex-1 truncate text-sm text-white">
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
                          className="min-h-[48px] w-28 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-right text-white focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
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
                          {t("splitFlow.remaining", { amount: formatCurrency(diff) })}
                        </p>
                      );
                    }
                    return (
                      <p className="text-sm text-green-400">{t("splitFlow.amountsCorrect")}</p>
                    );
                  })()}
                </div>
              )}

              {/* Percentage input */}
              {splitMode === "percentage" && (
                <div className="mt-4 space-y-3">
                  {selectedPeopleIds.map((personId, index) => {
                    const person = people.find((p) => p.id === personId);
                    return (
                      <div key={personId} className="flex items-center gap-3">
                        <span className="text-lg">{person?.emoji ?? "👤"}</span>
                        <span className="min-w-0 flex-1 truncate text-sm text-white">
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
                            className="min-h-[48px] w-20 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-right text-white focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
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
                          {t("splitFlow.percentageTotal", { sum })}
                        </p>
                      );
                    }
                    return (
                      <p className="text-sm text-green-400">{t("splitFlow.percentagesCorrect")}</p>
                    );
                  })()}
                </div>
              )}
            </div>
          )}

          {/* Step 4: Preview */}
          {splitStep === 4 && selectedTransaction && (
            <div className="space-y-4">
              <h4 className="font-semibold text-white">{t("splitFlow.previewSplit")}</h4>
              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <p className="font-medium text-white">{selectedTransaction.description}</p>
                <p className="text-sm text-slate-400">
                  {formatDate(selectedTransaction.date)} --{" "}
                  {formatCurrency(Math.abs(selectedTransaction.amount))} {t("total")}
                </p>
              </div>

              <div className="space-y-2">
                {splitPreview.map((preview) => {
                  const person = people.find((p) => p.id === preview.personId);
                  return (
                    <div
                      key={preview.personId}
                      className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{person?.emoji ?? "👤"}</span>
                        <span className="font-medium text-white">{preview.personName}</span>
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
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal-500/20">
                <Check className="h-8 w-8 text-teal-400" />
              </div>
              <h4 className="text-xl font-bold text-white">{t("splitFlow.confirmSplit")}</h4>
              <p className="text-slate-400">
                {t("splitFlow.confirmDescription", { count: splitPreview.length })}
              </p>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="mt-6 flex gap-3">
            {splitStep > 1 && (
              <button
                onClick={() => setSplitStep((prev) => prev - 1)}
                className="min-h-[48px] flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-slate-300 transition-all hover:bg-white/10"
              >
                {t("back")}
              </button>
            )}
            {splitStep < 5 ? (
              <button
                onClick={handleSplitStepNext}
                disabled={
                  (splitStep === 1 && !selectedTransactionId) ||
                  (splitStep === 2 && selectedPeopleIds.length === 0)
                }
                className="min-h-[48px] flex-1 rounded-xl bg-teal-500 px-4 py-3 font-semibold text-white shadow-lg shadow-teal-500/20 transition-all hover:bg-teal-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t("continue")}
              </button>
            ) : (
              <button
                onClick={() => void handleConfirmSplit()}
                disabled={splitLoading}
                className="min-h-[48px] flex-1 rounded-xl bg-teal-500 px-4 py-3 font-semibold text-white shadow-lg shadow-teal-500/20 transition-all hover:bg-teal-400 disabled:opacity-50"
              >
                {splitLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("creating")}
                  </span>
                ) : (
                  t("splitFlow.confirmSplit")
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
          <h1 className="flex items-center gap-3 text-4xl font-bold tracking-tight text-white">
            <Users className="h-9 w-9 text-teal-400" />
            {t("title")}
          </h1>
          <p className="mt-2 text-lg text-slate-400">
            {t("subtitle")}
            <HelpTooltip content={t("helpTooltip")} side="right" />
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAddPerson(true)}
            className="inline-flex min-h-[48px] items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-slate-300 transition-all hover:bg-white/10 hover:text-white"
          >
            <UserPlus className="h-4 w-4" />
            <span className="hidden sm:inline">{t("addPerson")}</span>
          </button>
          <button
            onClick={openSplitFlow}
            className="inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-teal-500 px-4 py-2.5 text-white shadow-lg shadow-teal-500/20 transition-all hover:bg-teal-400"
          >
            <Receipt className="h-4 w-4" />
            <span className="hidden sm:inline">{t("splitATransaction")}</span>
          </button>
        </div>
      </header>

      {/* Balance Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-5">
          <div className="mb-2 flex items-center gap-3">
            <div className="rounded-lg bg-green-500/20 p-2">
              <TrendingUp className="h-5 w-5 text-green-400" />
            </div>
            <span className="text-sm font-medium text-green-300">{t("owedToYou")}</span>
          </div>
          <p className="text-2xl font-bold text-green-400">{formatCurrency(totalOwedToYou)}</p>
        </div>

        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-5">
          <div className="mb-2 flex items-center gap-3">
            <div className="rounded-lg bg-red-500/20 p-2">
              <TrendingDown className="h-5 w-5 text-red-400" />
            </div>
            <span className="text-sm font-medium text-red-300">{t("youOweLabel")}</span>
          </div>
          <p className="text-2xl font-bold text-red-400">{formatCurrency(totalYouOwe)}</p>
        </div>

        <div
          className={`rounded-xl border p-5 ${
            netBalance >= 0
              ? "border-teal-500/20 bg-teal-500/10"
              : "border-amber-500/20 bg-amber-500/10"
          }`}
        >
          <div className="mb-2 flex items-center gap-3">
            <div
              className={`rounded-lg p-2 ${netBalance >= 0 ? "bg-teal-500/20" : "bg-amber-500/20"}`}
            >
              <Scale
                className={`h-5 w-5 ${netBalance >= 0 ? "text-teal-400" : "text-amber-400"}`}
              />
            </div>
            <span
              className={`text-sm font-medium ${
                netBalance >= 0 ? "text-teal-300" : "text-amber-300"
              }`}
            >
              {t("netBalance")}
            </span>
          </div>
          <p
            className={`text-2xl font-bold ${netBalance >= 0 ? "text-teal-400" : "text-amber-400"}`}
          >
            {netBalance >= 0 ? "+" : "-"}
            {formatCurrency(Math.abs(netBalance))}
          </p>
        </div>
      </div>

      {/* People Management Section */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">
            {t("people", { count: people.length })}
          </h2>
        </div>

        {people.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-12 text-center">
            <Users className="mx-auto mb-4 h-12 w-12 text-slate-500" />
            <h3 className="mb-2 text-lg font-semibold text-white">{t("noPeopleTitle")}</h3>
            <p className="mx-auto mb-6 max-w-md text-slate-400">{t("noPeopleDescription")}</p>
            <button
              onClick={() => setShowAddPerson(true)}
              className="inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-teal-500 px-6 py-3 text-white shadow-lg shadow-teal-500/20 transition-all hover:bg-teal-400"
            >
              <UserPlus className="h-5 w-5" />
              {t("addFirstPerson")}
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
                  className="group min-h-[48px] rounded-xl border border-white/10 bg-white/5 p-5 text-left transition-all hover:border-white/20 hover:bg-white/10"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{person.emoji ?? "👤"}</span>
                      <div>
                        <p className="font-semibold text-white transition-colors group-hover:text-teal-300">
                          {person.name}
                        </p>
                        <p className="text-sm text-slate-400">
                          {t("unsettledSplitCount", { count: summary.splitCount })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-lg font-bold ${
                          summary.balance > 0
                            ? "text-green-400"
                            : summary.balance < 0
                              ? "text-red-400"
                              : "text-slate-400"
                        }`}
                      >
                        {summary.balance > 0
                          ? `+${formatCurrency(summary.balance)}`
                          : summary.balance < 0
                            ? `-${formatCurrency(Math.abs(summary.balance))}`
                            : formatCurrency(0)}
                      </span>
                      <ChevronRight className="h-5 w-5 text-slate-500 transition-colors group-hover:text-slate-300" />
                    </div>
                  </div>
                  {summary.balance !== 0 && (
                    <p
                      className={`mt-2 inline-block rounded-full px-2 py-1 text-xs font-medium ${
                        summary.balance > 0
                          ? "bg-green-500/10 text-green-400"
                          : "bg-red-500/10 text-red-400"
                      }`}
                    >
                      {summary.balance > 0 ? t("owesYouLabel") : t("youOweLabel")}
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
                  className="group min-h-[48px] rounded-xl border border-white/10 bg-white/5 p-5 text-left transition-all hover:border-white/20 hover:bg-white/10"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{person.emoji ?? "👤"}</span>
                      <div>
                        <p className="font-semibold text-white transition-colors group-hover:text-teal-300">
                          {person.name}
                        </p>
                        <p className="text-sm text-slate-400">{t("noSplitsYet")}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-500 transition-colors group-hover:text-slate-300" />
                  </div>
                </button>
              ))}
          </div>
        )}
      </section>

      {/* Add Person Modal */}
      {showAddPerson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-800 p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">{t("addPerson")}</h3>
              <button
                onClick={() => setShowAddPerson(false)}
                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Name input */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-300">{t("name")}</label>
                <input
                  type="text"
                  value={newPersonName}
                  onChange={(e) => setNewPersonName(e.target.value)}
                  placeholder={t("namePlaceholder")}
                  className="min-h-[48px] w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newPersonName.trim()) {
                      void handleAddPerson();
                    }
                  }}
                />
              </div>

              {/* Emoji picker */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  {t("emoji")}
                </label>
                <div className="grid grid-cols-8 gap-2">
                  {EMOJI_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setNewPersonEmoji(emoji)}
                      className={`flex items-center justify-center rounded-lg p-2 text-xl transition-all ${
                        newPersonEmoji === emoji
                          ? "scale-110 border-2 border-teal-500 bg-teal-500/20"
                          : "border border-white/10 bg-white/5 hover:bg-white/10"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              {newPersonName.trim() && (
                <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-4">
                  <span className="text-3xl">{newPersonEmoji}</span>
                  <span className="font-semibold text-white">{newPersonName}</span>
                </div>
              )}

              {/* Add button */}
              <button
                onClick={() => void handleAddPerson()}
                disabled={!newPersonName.trim()}
                className="min-h-[48px] w-full rounded-xl bg-teal-500 px-4 py-3 font-semibold text-white shadow-lg shadow-teal-500/20 transition-all hover:bg-teal-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t("addPerson")}
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
        title={t("confirmRemovePerson.title")}
        description={t("confirmRemovePerson.description")}
        confirmLabel={t("confirmRemovePerson.confirmLabel")}
        variant="destructive"
        icon={<Trash2 className="h-5 w-5" />}
      />
    </main>
  );
}
