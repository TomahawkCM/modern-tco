'use client';

/**
 * Investments Portfolio Page (Phase 8)
 * Task 8.2.1: Build investment portfolio UI
 * 
 * Displays all investment accounts with holdings, purchase prices, current prices, and gain/loss
 */

import { useState, useEffect } from 'react';
import { Plus, TrendingUp, TrendingDown, DollarSign, Edit, Trash2, Wallet, RefreshCw } from 'lucide-react';
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
} from '@/lib/budget-db';
import { getBatchStockPrices, clearPriceCache } from '@/lib/market-data';
import { InvestmentAccountModal } from '@/components/budget/InvestmentAccountModal';
import { HoldingModal } from '@/components/budget/HoldingModal';
import { InvestmentCharts } from '@/components/budget/InvestmentCharts';
import { useToast } from '@/components/budget/Toast';
import { CountUp } from '@/hooks/useCountUp';

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
      console.error('Error loading investments:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadPrices(holdingsToPrice: Holding[]) {
    if (holdingsToPrice.length === 0) return;

    setIsLoadingPrices(true);
    setPriceError(null);

    try {
      const symbols = holdingsToPrice.map(h => h.symbol);
      const prices = await getBatchStockPrices(symbols);
      
      // For any missing prices, use purchase price as fallback
      const pricesWithFallback: Record<string, number> = {};
      holdingsToPrice.forEach(holding => {
        const symbol = holding.symbol.toUpperCase();
        pricesWithFallback[symbol] = prices[symbol] || holding.purchasePrice;
      });
      
      setCurrentPrices(pricesWithFallback);
      setLastPriceUpdate(new Date());

      // Check if we got any real prices (not all fallbacks)
      const realPricesCount = Object.keys(prices).length;
      if (realPricesCount === 0 && holdingsToPrice.length > 0) {
        setPriceError('Unable to fetch market prices. Using purchase prices.');
      } else if (realPricesCount < holdingsToPrice.length) {
        setPriceError(`Fetched ${realPricesCount}/${holdingsToPrice.length} prices. Using purchase prices for missing data.`);
      }
    } catch (error) {
      console.error('Error loading prices:', error);
      setPriceError('Failed to load market prices. Using purchase prices.');
      
      // Fallback to purchase prices
      const fallbackPrices: Record<string, number> = {};
      holdingsToPrice.forEach(holding => {
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

  async function handleDeleteAccount(accountId: string) {
    const confirmed = await toast.confirm('Delete this investment account and all its holdings?');
    if (!confirmed) return;

    try {
      await deleteInvestmentAccount(accountId);
      await loadData();
      toast.success('Investment account deleted successfully');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account');
    }
  }

  async function handleDeleteHolding(holdingId: string) {
    const confirmed = await toast.confirm('Delete this holding?');
    if (!confirmed) return;

    try {
      await deleteHolding(holdingId);
      await loadData();
      toast.success('Holding deleted successfully');
    } catch (error) {
      console.error('Error deleting holding:', error);
      toast.error('Failed to delete holding');
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

  async function handleSaveAccount(accountData: Omit<InvestmentAccount, 'id' | 'createdAt' | 'updatedAt'>) {
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
      console.error('Error saving account:', error);
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

  async function handleSaveHolding(holdingData: Omit<Holding, 'id' | 'createdAt' | 'updatedAt'>) {
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
      console.error('Error saving holding:', error);
      throw error;
    }
  }

  function getAccountHoldings(accountId: string): Holding[] {
    return holdings.filter(h => h.accountId === accountId);
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

    accountHoldings.forEach(holding => {
      const { currentValue } = calculateHoldingValue(holding);
      const cost = holding.quantity * holding.purchasePrice;
      totalValue += currentValue;
      totalCost += cost;
    });

    const totalGainLoss = totalValue - totalCost;
    const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;

    return { totalValue, totalCost, totalGainLoss, totalGainLossPercent, holdingsCount: accountHoldings.length };
  }

  function calculatePortfolioTotals() {
    let totalValue = 0;
    let totalCost = 0;

    holdings.forEach(holding => {
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading investments...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Investment Portfolio</h1>
          <p className="text-gray-600 mt-2">
            Track your RRSP, TFSA, and investment accounts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refreshPrices}
            disabled={isLoadingPrices || holdings.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Refresh market prices"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingPrices ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh Prices</span>
          </button>
          <button
            onClick={openAddAccountModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Account
          </button>
        </div>
      </div>

      {/* Price Status Banner */}
      {priceError && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-amber-900 mb-2">Market Data Notice</h4>
              <p className="text-sm text-amber-800">{priceError}</p>
            </div>
          </div>
        </div>
      )}

      {lastPriceUpdate && !priceError && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-green-800">
              <TrendingUp className="w-4 h-4" />
              <span>Market prices updated {lastPriceUpdate.toLocaleTimeString()}</span>
            </div>
            <button
              onClick={refreshPrices}
              disabled={isLoadingPrices}
              className="text-sm text-green-700 hover:text-green-900 underline"
            >
              Refresh
            </button>
          </div>
        </div>
      )}

      {/* Portfolio Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
            <DollarSign className="w-4 h-4" />
            Total Value
          </div>
          <div className="text-2xl font-bold text-gray-900">
            <CountUp end={portfolioTotals.totalValue} decimals={2} prefix="$" separator="," duration={2000} />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
            <Wallet className="w-4 h-4" />
            Total Cost
          </div>
          <div className="text-2xl font-bold text-gray-900">
            <CountUp end={portfolioTotals.totalCost} decimals={2} prefix="$" separator="," duration={2000} />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
            {portfolioTotals.totalGainLoss >= 0 ? (
              <TrendingUp className="w-4 h-4 text-green-600" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-600" />
            )}
            Gain/Loss
          </div>
          <div className={`text-2xl font-bold ${portfolioTotals.totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            <CountUp 
              end={Math.abs(portfolioTotals.totalGainLoss)} 
              decimals={2} 
              prefix={portfolioTotals.totalGainLoss >= 0 ? '+$' : '-$'} 
              separator="," 
              duration={2000} 
            />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
            <TrendingUp className="w-4 h-4" />
            Return
          </div>
          <div className={`text-2xl font-bold ${portfolioTotals.totalGainLossPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            <CountUp 
              end={portfolioTotals.totalGainLossPercent} 
              decimals={2} 
              prefix={portfolioTotals.totalGainLossPercent >= 0 ? '+' : ''} 
              suffix="%" 
              duration={2000} 
            />
          </div>
        </div>
      </div>

      {/* Empty State */}
      {accounts.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Wallet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No investment accounts yet
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Start tracking your investments by creating an account for your RRSP, TFSA, or other investment accounts.
          </p>
          <button
            onClick={openAddAccountModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Your First Account
          </button>
        </div>
      ) : (
        /* Investment Accounts List */
        <div className="space-y-4">
          {accounts.map(account => {
            const totals = calculateAccountTotals(account.id);
            const accountHoldings = getAccountHoldings(account.id);
            const isExpanded = expandedAccount === account.id;

            return (
              <div key={account.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {/* Account Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <h2 className="text-xl font-bold text-gray-900">{account.name}</h2>
                        <span className="px-2 py-1 bg-teal-100 text-teal-700 text-xs font-medium rounded">
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
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit account"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAccount(account.id)}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete account"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Account Summary */}
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <div className="text-xs text-gray-600 mb-2">Value</div>
                      <div className="text-lg font-bold text-gray-900">
                        ${totals.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-2">Cost</div>
                      <div className="text-lg font-bold text-gray-900">
                        ${totals.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-2">Gain/Loss</div>
                      <div className={`text-lg font-bold ${totals.totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {totals.totalGainLoss >= 0 ? '+' : ''}${totals.totalGainLoss.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-2">Return</div>
                      <div className={`text-lg font-bold ${totals.totalGainLossPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {totals.totalGainLossPercent >= 0 ? '+' : ''}{totals.totalGainLossPercent.toFixed(2)}%
                      </div>
                    </div>
                  </div>

                  {/* Holdings Count and Toggle */}
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      {totals.holdingsCount} {totals.holdingsCount === 1 ? 'holding' : 'holdings'}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openAddHoldingModal(account)}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                        Add Holding
                      </button>
                      <button
                        onClick={() => setExpandedAccount(isExpanded ? null : account.id)}
                        className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        {isExpanded ? 'Hide Details' : 'Show Details'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Holdings Table (Expanded) */}
                {isExpanded && accountHoldings.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Symbol</th>
                          <th className="px-6 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">Shares</th>
                          <th className="px-6 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">Purchase Price</th>
                          <th className="px-6 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">Current Price</th>
                          <th className="px-6 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">Value</th>
                          <th className="px-6 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">Gain/Loss</th>
                          <th className="px-6 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {accountHoldings.map(holding => {
                          const { currentPrice, currentValue, gainLoss, gainLossPercent } = calculateHoldingValue(holding);
                          
                          return (
                            <tr key={holding.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="font-medium text-gray-900">{holding.symbol}</div>
                                {holding.notes && (
                                  <div className="text-xs text-gray-500 mt-2">{holding.notes}</div>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900">
                                {holding.quantity}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900">
                                ${holding.purchasePrice.toFixed(2)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900">
                                ${currentPrice.toFixed(2)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right font-medium text-gray-900">
                                ${currentValue.toFixed(2)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right">
                                <div className={`font-medium ${gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {gainLoss >= 0 ? '+' : ''}${gainLoss.toFixed(2)}
                                </div>
                                <div className={`text-xs ${gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  ({gainLossPercent >= 0 ? '+' : ''}{gainLossPercent.toFixed(2)}%)
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => openEditHoldingModal(holding, account)}
                                    className="p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                                    title="Edit holding"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteHolding(holding.id)}
                                    className="p-2.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                    title="Delete holding"
                                  >
                                    <Trash2 className="w-4 h-4" />
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
                      className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                    >
                      <Plus className="w-3 h-3" />
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
            <p className="text-gray-600 mt-2">Visual breakdown of your investments</p>
          </div>
          <InvestmentCharts 
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
    </div>
  );
}

