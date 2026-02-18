"use client";

/**
 * Investments Portfolio Page (Phase 8)
 * Task 8.2.1: Build investment portfolio UI
 *
 * Displays all investment accounts with holdings, purchase prices, current prices, and gain/loss
 */

import { useState, useEffect } from "react";
import {
  Plus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Edit,
  Trash2,
  Wallet,
  RefreshCw,
} from "lucide-react";
import {
  getInvestmentAccounts,
  getAllHoldings,
  deleteInvestmentAccount,
  deleteHolding,
  createInvestmentAccount,
  updateInvestmentAccount,
  addHolding,
  updateHolding,
  type InvestmentAccount,
  type Holding,
} from "@/lib/budget-db";
import { getBatchStockPrices, clearPriceCache } from "@/lib/market-data";
import { InvestmentAccountModal } from "@/components/budget/InvestmentAccountModal";
import { HoldingModal } from "@/components/budget/HoldingModal";
import { LazyInvestmentCharts } from "@/components/budget/charts/LazyChartComponents";
import { ConfirmDialog } from "@/components/budget/ConfirmDialog";
import { useToast } from "@/components/budget/Toast";
import { CountUp } from "@/hooks/useCountUp";
import { EmptyStates } from "@/components/budget/EmptyState";
import { PullToRefresh } from "@/components/budget/layout/PullToRefresh";

export default function InvestmentsPage() {
  const toast = useToast();
  const [accounts, setAccounts] = useState<InvestmentAccount[]>([]);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedAccount, setExpandedAccount] = useState<string | null>(null);

  // Modal states
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<InvestmentAccount | null>(null);
  const [showHoldingModal, setShowHoldingModal] = useState(false);
  const [editingHolding, setEditingHolding] = useState<Holding | null>(null);
  const [holdingModalAccount, setHoldingModalAccount] = useState<InvestmentAccount | null>(null);

  // Confirmation dialog state
  const [deleteAccountConfirmOpen, setDeleteAccountConfirmOpen] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState<{
    account: InvestmentAccount;
    holdingsCount: number;
    totalValue: number;
  } | null>(null);
  const [deleteHoldingConfirmOpen, setDeleteHoldingConfirmOpen] = useState(false);
  const [deletingHolding, setDeletingHolding] = useState<Holding | null>(null);

  // Market data
  const [currentPrices, setCurrentPrices] = useState<Record<string, number>>({});
  const [isLoadingPrices, setIsLoadingPrices] = useState(false);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [lastPriceUpdate, setLastPriceUpdate] = useState<Date | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [accountsData, holdingsData] = await Promise.all([
        getInvestmentAccounts(),
        getAllHoldings(),
      ]);
      setAccounts(accountsData);
      setHoldings(holdingsData);

      // Fetch prices for all holdings
      if (holdingsData.length > 0) {
        await loadPrices(holdingsData);
      }
    } catch (error) {
      console.error("Error loading investments:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadPrices(holdingsToPrice: Holding[]) {
    if (holdingsToPrice.length === 0) return;

    setIsLoadingPrices(true);
    setPriceError(null);

    try {
      const symbols = holdingsToPrice.map((h) => h.symbol);
      const prices = await getBatchStockPrices(symbols);

      // For any missing prices, use purchase price as fallback
      const pricesWithFallback: Record<string, number> = {};
      holdingsToPrice.forEach((holding) => {
        const symbol = holding.symbol.toUpperCase();
        pricesWithFallback[symbol] = prices[symbol] || holding.purchasePrice;
      });

      setCurrentPrices(pricesWithFallback);
      setLastPriceUpdate(new Date());

      // Check if we got any real prices (not all fallbacks)
      const realPricesCount = Object.keys(prices).length;
      if (realPricesCount === 0 && holdingsToPrice.length > 0) {
        setPriceError("Unable to fetch market prices. Using purchase prices.");
      } else if (realPricesCount < holdingsToPrice.length) {
        setPriceError(
          `Fetched ${realPricesCount}/${holdingsToPrice.length} prices. Using purchase prices for missing data.`
        );
      }
    } catch (error) {
      console.error("Error loading prices:", error);
      setPriceError("Failed to load market prices. Using purchase prices.");

      // Fallback to purchase prices
      const fallbackPrices: Record<string, number> = {};
      holdingsToPrice.forEach((holding) => {
        fallbackPrices[holding.symbol.toUpperCase()] = holding.purchasePrice;
      });
      setCurrentPrices(fallbackPrices);
    } finally {
      setIsLoadingPrices(false);
    }
  }

  async function refreshPrices() {
    await clearPriceCache();
    await loadPrices(holdings);
  }

  function initiateDeleteAccount(account: InvestmentAccount) {
    const accountHoldings = holdings.filter((h) => h.accountId === account.id);
    const totalValue = accountHoldings.reduce((sum, h) => {
      const price = currentPrices[h.symbol] || h.purchasePrice;
      return sum + h.quantity * price;
    }, 0);

    setDeletingAccount({
      account,
      holdingsCount: accountHoldings.length,
      totalValue,
    });
    setDeleteAccountConfirmOpen(true);
  }

  async function confirmDeleteAccount() {
    if (!deletingAccount) return;

    try {
      await deleteInvestmentAccount(deletingAccount.account.id);
      await loadData();
      toast.success("Investment account deleted successfully");
      setDeleteAccountConfirmOpen(false);
      setDeletingAccount(null);
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Failed to delete account");
      // Keep dialog open on error
    }
  }

  function initiateDeleteHolding(holding: Holding) {
    setDeletingHolding(holding);
    setDeleteHoldingConfirmOpen(true);
  }

  async function confirmDeleteHolding() {
    if (!deletingHolding) return;

    try {
      await deleteHolding(deletingHolding.id);
      await loadData();
      toast.success("Holding deleted successfully");
      setDeleteHoldingConfirmOpen(false);
      setDeletingHolding(null);
    } catch (error) {
      console.error("Error deleting holding:", error);
      toast.error("Failed to delete holding");
      // Keep dialog open on error
    }
  }

  function openAddAccountModal() {
    setEditingAccount(null);
    setShowAccountModal(true);
  }

  function openEditAccountModal(account: InvestmentAccount) {
    setEditingAccount(account);
    setShowAccountModal(true);
  }

  async function handleSaveAccount(
    accountData: Omit<InvestmentAccount, "id" | "createdAt" | "updatedAt">
  ) {
    try {
      if (editingAccount) {
        await updateInvestmentAccount(editingAccount.id, accountData);
      } else {
        await createInvestmentAccount(accountData);
      }
      await loadData();
      setShowAccountModal(false);
      setEditingAccount(null);
    } catch (error) {
      console.error("Error saving account:", error);
      throw error;
    }
  }

  function openAddHoldingModal(account: InvestmentAccount) {
    setHoldingModalAccount(account);
    setEditingHolding(null);
    setShowHoldingModal(true);
  }

  function openEditHoldingModal(holding: Holding, account: InvestmentAccount) {
    setHoldingModalAccount(account);
    setEditingHolding(holding);
    setShowHoldingModal(true);
  }

  async function handleSaveHolding(holdingData: Omit<Holding, "id" | "createdAt" | "updatedAt">) {
    try {
      if (editingHolding) {
        await updateHolding(editingHolding.id, holdingData);
      } else {
        await addHolding(holdingData);
      }
      await loadData();
      setShowHoldingModal(false);
      setEditingHolding(null);
      setHoldingModalAccount(null);
    } catch (error) {
      console.error("Error saving holding:", error);
      throw error;
    }
  }

  function getAccountHoldings(accountId: string): Holding[] {
    return holdings.filter((h) => h.accountId === accountId);
  }

  function calculateHoldingValue(holding: Holding): {
    currentPrice: number;
    currentValue: number;
    gainLoss: number;
    gainLossPercent: number;
  } {
    const currentPrice = currentPrices[holding.symbol] || holding.purchasePrice;
    const currentValue = holding.quantity * currentPrice;
    const cost = holding.quantity * holding.purchasePrice;
    const gainLoss = currentValue - cost;
    const gainLossPercent = cost > 0 ? (gainLoss / cost) * 100 : 0;

    return { currentPrice, currentValue, gainLoss, gainLossPercent };
  }

  function calculateAccountTotals(accountId: string) {
    const accountHoldings = getAccountHoldings(accountId);
    let totalValue = 0;
    let totalCost = 0;

    accountHoldings.forEach((holding) => {
      const { currentValue } = calculateHoldingValue(holding);
      const cost = holding.quantity * holding.purchasePrice;
      totalValue += currentValue;
      totalCost += cost;
    });

    const totalGainLoss = totalValue - totalCost;
    const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;

    return {
      totalValue,
      totalCost,
      totalGainLoss,
      totalGainLossPercent,
      holdingsCount: accountHoldings.length,
    };
  }

  function calculatePortfolioTotals() {
    let totalValue = 0;
    let totalCost = 0;

    holdings.forEach((holding) => {
      const { currentValue } = calculateHoldingValue(holding);
      const cost = holding.quantity * holding.purchasePrice;
      totalValue += currentValue;
      totalCost += cost;
    });

    const totalGainLoss = totalValue - totalCost;
    const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;

    return { totalValue, totalCost, totalGainLoss, totalGainLossPercent };
  }

  const portfolioTotals = calculatePortfolioTotals();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-500">Loading investments...</div>
      </div>
    );
  }

  return (
    <PullToRefresh onRefresh={loadData}>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Investment Portfolio</h1>
          <p className="mt-2 text-slate-400">Track your RRSP, TFSA, and investment accounts</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refreshPrices}
            disabled={isLoadingPrices || holdings.length === 0}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            title="Refresh market prices"
          >
            <RefreshCw className={`h-4 w-4 ${isLoadingPrices ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh Prices</span>
          </button>
          <button
            onClick={openAddAccountModal}
            className="inline-flex items-center gap-2 rounded-lg bg-teal-500 px-4 py-2 text-white transition-colors hover:bg-teal-600"
          >
            <Plus className="h-4 w-4" />
            Add Account
          </button>
        </div>
      </div>

      {/* Price Status Banner */}
      {priceError && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <TrendingUp className="h-5 w-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <h4 className="mb-2 text-sm font-medium text-amber-900">Market Data Notice</h4>
              <p className="text-sm text-amber-800">{priceError}</p>
            </div>
          </div>
        </div>
      )}

      {lastPriceUpdate && !priceError && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-green-800">
              <TrendingUp className="h-4 w-4" />
              <span>Market prices updated {lastPriceUpdate.toLocaleTimeString()}</span>
            </div>
            <button
              onClick={refreshPrices}
              disabled={isLoadingPrices}
              className="text-sm text-green-700 underline hover:text-green-900"
            >
              Refresh
            </button>
          </div>
        </div>
      )}

      {/* Portfolio Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="mb-2 flex items-center gap-2 text-sm text-gray-600">
            <DollarSign className="h-4 w-4" />
            Total Value
          </div>
          <div className="text-2xl font-bold text-gray-900">
            <CountUp
              end={portfolioTotals.totalValue}
              decimals={2}
              prefix="$"
              separator=","
              duration={2000}
            />
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="mb-2 flex items-center gap-2 text-sm text-gray-600">
            <Wallet className="h-4 w-4" />
            Total Cost
          </div>
          <div className="text-2xl font-bold text-gray-900">
            <CountUp
              end={portfolioTotals.totalCost}
              decimals={2}
              prefix="$"
              separator=","
              duration={2000}
            />
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="mb-2 flex items-center gap-2 text-sm text-gray-600">
            {portfolioTotals.totalGainLoss >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
            Gain/Loss
          </div>
          <div
            className={`text-2xl font-bold ${portfolioTotals.totalGainLoss >= 0 ? "text-green-600" : "text-red-600"}`}
          >
            <CountUp
              end={Math.abs(portfolioTotals.totalGainLoss)}
              decimals={2}
              prefix={portfolioTotals.totalGainLoss >= 0 ? "+$" : "-$"}
              separator=","
              duration={2000}
            />
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="mb-2 flex items-center gap-2 text-sm text-gray-600">
            <TrendingUp className="h-4 w-4" />
            Return
          </div>
          <div
            className={`text-2xl font-bold ${portfolioTotals.totalGainLossPercent >= 0 ? "text-green-600" : "text-red-600"}`}
          >
            <CountUp
              end={portfolioTotals.totalGainLossPercent}
              decimals={2}
              prefix={portfolioTotals.totalGainLossPercent >= 0 ? "+" : ""}
              suffix="%"
              duration={2000}
            />
          </div>
        </div>
      </div>

      {/* Empty State */}
      {accounts.length === 0 ? (
        <EmptyStates.Investments />
      ) : (
        /* Investment Accounts List */
        <div className="space-y-4">
          {accounts.map((account) => {
            const totals = calculateAccountTotals(account.id);
            const accountHoldings = getAccountHoldings(account.id);
            const isExpanded = expandedAccount === account.id;

            return (
              <div
                key={account.id}
                className="overflow-hidden rounded-lg border border-gray-200 bg-white"
              >
                {/* Account Header */}
                <div className="border-b border-gray-200 p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-4">
                        <h2 className="text-xl font-bold text-gray-900">{account.name}</h2>
                        <span className="rounded bg-teal-100 px-2 py-1 text-xs font-medium text-teal-700">
                          {account.type}
                        </span>
                      </div>
                      {account.institution && (
                        <p className="text-sm text-gray-600">
                          {account.institution}
                          {account.accountNumber && ` • Account ${account.accountNumber}`}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditAccountModal(account)}
                        className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                        title="Edit account"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => initiateDeleteAccount(account)}
                        className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
                        title="Delete account"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Account Summary */}
                  <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div>
                      <div className="mb-2 text-xs text-gray-600">Value</div>
                      <div className="text-lg font-bold text-gray-900">
                        $
                        {totals.totalValue.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                    </div>
                    <div>
                      <div className="mb-2 text-xs text-gray-600">Cost</div>
                      <div className="text-lg font-bold text-gray-900">
                        $
                        {totals.totalCost.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                    </div>
                    <div>
                      <div className="mb-2 text-xs text-gray-600">Gain/Loss</div>
                      <div
                        className={`text-lg font-bold ${totals.totalGainLoss >= 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {totals.totalGainLoss >= 0 ? "+" : ""}$
                        {totals.totalGainLoss.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                    </div>
                    <div>
                      <div className="mb-2 text-xs text-gray-600">Return</div>
                      <div
                        className={`text-lg font-bold ${totals.totalGainLossPercent >= 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {totals.totalGainLossPercent >= 0 ? "+" : ""}
                        {totals.totalGainLossPercent.toFixed(2)}%
                      </div>
                    </div>
                  </div>

                  {/* Holdings Count and Toggle */}
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      {totals.holdingsCount} {totals.holdingsCount === 1 ? "holding" : "holdings"}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openAddHoldingModal(account)}
                        className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-teal-600 transition-colors hover:bg-teal-50 hover:text-teal-700"
                      >
                        <Plus className="h-3 w-3" />
                        Add Holding
                      </button>
                      <button
                        onClick={() => setExpandedAccount(isExpanded ? null : account.id)}
                        className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                      >
                        {isExpanded ? "Hide Details" : "Show Details"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Holdings Table (Expanded) */}
                {isExpanded && accountHoldings.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b border-gray-200 bg-gray-50">
                        <tr>
                          <th className="px-6 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                            Symbol
                          </th>
                          <th className="px-6 py-2 text-right text-xs font-medium uppercase tracking-wider text-gray-700">
                            Shares
                          </th>
                          <th className="px-6 py-2 text-right text-xs font-medium uppercase tracking-wider text-gray-700">
                            Purchase Price
                          </th>
                          <th className="px-6 py-2 text-right text-xs font-medium uppercase tracking-wider text-gray-700">
                            Current Price
                          </th>
                          <th className="px-6 py-2 text-right text-xs font-medium uppercase tracking-wider text-gray-700">
                            Value
                          </th>
                          <th className="px-6 py-2 text-right text-xs font-medium uppercase tracking-wider text-gray-700">
                            Gain/Loss
                          </th>
                          <th className="px-6 py-2 text-right text-xs font-medium uppercase tracking-wider text-gray-700">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {accountHoldings.map((holding) => {
                          const { currentPrice, currentValue, gainLoss, gainLossPercent } =
                            calculateHoldingValue(holding);

                          return (
                            <tr key={holding.id} className="hover:bg-gray-50">
                              <td className="whitespace-nowrap px-6 py-4">
                                <div className="font-medium text-gray-900">{holding.symbol}</div>
                                {holding.notes && (
                                  <div className="mt-2 text-xs text-gray-500">{holding.notes}</div>
                                )}
                              </td>
                              <td className="whitespace-nowrap px-6 py-4 text-right text-gray-900">
                                {holding.quantity}
                              </td>
                              <td className="whitespace-nowrap px-6 py-4 text-right text-gray-900">
                                ${holding.purchasePrice.toFixed(2)}
                              </td>
                              <td className="whitespace-nowrap px-6 py-4 text-right text-gray-900">
                                ${currentPrice.toFixed(2)}
                              </td>
                              <td className="whitespace-nowrap px-6 py-4 text-right font-medium text-gray-900">
                                ${currentValue.toFixed(2)}
                              </td>
                              <td className="whitespace-nowrap px-6 py-4 text-right">
                                <div
                                  className={`font-medium ${gainLoss >= 0 ? "text-green-600" : "text-red-600"}`}
                                >
                                  {gainLoss >= 0 ? "+" : ""}${gainLoss.toFixed(2)}
                                </div>
                                <div
                                  className={`text-xs ${gainLoss >= 0 ? "text-green-600" : "text-red-600"}`}
                                >
                                  ({gainLossPercent >= 0 ? "+" : ""}
                                  {gainLossPercent.toFixed(2)}%)
                                </div>
                              </td>
                              <td className="whitespace-nowrap px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => openEditHoldingModal(holding, account)}
                                    className="rounded p-2.5 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                                    title="Edit holding"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => initiateDeleteHolding(holding)}
                                    className="rounded p-2.5 text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
                                    title="Delete holding"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Empty Holdings State */}
                {isExpanded && accountHoldings.length === 0 && (
                  <div className="p-8 text-center text-gray-500">
                    <p>No holdings in this account yet.</p>
                    <button
                      onClick={() => openAddHoldingModal(account)}
                      className="mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-teal-600 transition-colors hover:bg-teal-50 hover:text-teal-700"
                    >
                      <Plus className="h-3 w-3" />
                      Add Your First Holding
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Investment Charts */}
      {holdings.length > 0 && Object.keys(currentPrices).length > 0 && (
        <div className="mt-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Portfolio Analysis</h2>
            <p className="mt-2 text-gray-600">Visual breakdown of your investments</p>
          </div>
          <LazyInvestmentCharts
            holdings={holdings}
            accounts={accounts}
            currentPrices={currentPrices}
          />
        </div>
      )}

      {/* Modals */}
      {showAccountModal && (
        <InvestmentAccountModal
          account={editingAccount}
          onSave={handleSaveAccount}
          onClose={() => {
            setShowAccountModal(false);
            setEditingAccount(null);
          }}
        />
      )}

      {showHoldingModal && holdingModalAccount && (
        <HoldingModal
          holding={editingHolding}
          account={holdingModalAccount}
          onSave={handleSaveHolding}
          onClose={() => {
            setShowHoldingModal(false);
            setEditingHolding(null);
            setHoldingModalAccount(null);
          }}
        />
      )}

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        open={deleteAccountConfirmOpen}
        onOpenChange={setDeleteAccountConfirmOpen}
        onConfirm={confirmDeleteAccount}
        title="Delete Investment Account"
        description="This will permanently delete the account and all associated holdings."
        impact={
          deletingAccount
            ? {
                title: "You will lose:",
                items: [
                  `Account: ${deletingAccount.account.name}`,
                  `${deletingAccount.holdingsCount} holding${deletingAccount.holdingsCount === 1 ? "" : "s"}`,
                  `Total value: $${deletingAccount.totalValue.toFixed(2)}`,
                  "All transaction history",
                ],
              }
            : undefined
        }
        confirmLabel="Delete Account & Holdings"
        variant="destructive"
        icon={<Trash2 className="h-5 w-5" />}
      />

      <ConfirmDialog
        open={deleteHoldingConfirmOpen}
        onOpenChange={setDeleteHoldingConfirmOpen}
        onConfirm={confirmDeleteHolding}
        title="Delete Holding"
        description="This will permanently remove this holding from your portfolio."
        impact={
          deletingHolding
            ? {
                title: "You will lose:",
                items: [
                  `Symbol: ${deletingHolding.symbol}`,
                  `${deletingHolding.quantity} shares`,
                  `Purchase price: $${deletingHolding.purchasePrice.toFixed(2)}`,
                  currentPrices[deletingHolding.symbol]
                    ? `Current value: $${(deletingHolding.quantity * currentPrices[deletingHolding.symbol]).toFixed(2)}`
                    : null,
                ],
              }
            : undefined
        }
        confirmLabel="Delete Holding"
        variant="destructive"
        icon={<Trash2 className="h-5 w-5" />}
      />
    </div>
    </PullToRefresh>
  );
}
