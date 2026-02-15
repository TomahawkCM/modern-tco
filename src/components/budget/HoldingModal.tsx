"use client";

/**
 * Holding Modal Component
 * Add or edit investment holdings (stocks, ETFs, etc.)
 */

import { useState } from "react";
import { X, Search } from "lucide-react";
import type { Holding, InvestmentAccount } from "@/types/budget";

interface HoldingModalProps {
  holding: Holding | null;
  account: InvestmentAccount;
  onSave: (holding: Omit<Holding, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  onClose: () => void;
}

// Common stock symbols for autocomplete suggestions
const COMMON_SYMBOLS = [
  // US Tech
  { symbol: "AAPL", name: "Apple Inc." },
  { symbol: "MSFT", name: "Microsoft Corporation" },
  { symbol: "GOOGL", name: "Alphabet Inc." },
  { symbol: "AMZN", name: "Amazon.com Inc." },
  { symbol: "TSLA", name: "Tesla Inc." },
  { symbol: "NVDA", name: "NVIDIA Corporation" },
  { symbol: "META", name: "Meta Platforms Inc." },

  // Canadian Stocks
  { symbol: "TD.TO", name: "TD Bank" },
  { symbol: "RY.TO", name: "Royal Bank" },
  { symbol: "BMO.TO", name: "Bank of Montreal" },
  { symbol: "ENB.TO", name: "Enbridge Inc." },
  { symbol: "CNQ.TO", name: "Canadian Natural Resources" },
  { symbol: "SU.TO", name: "Suncor Energy" },

  // Canadian ETFs
  { symbol: "VGRO.TO", name: "Vanguard Growth ETF Portfolio" },
  { symbol: "VEQT.TO", name: "Vanguard All-Equity ETF Portfolio" },
  { symbol: "VBAL.TO", name: "Vanguard Balanced ETF Portfolio" },
  { symbol: "XEQT.TO", name: "iShares Core Equity ETF Portfolio" },
  { symbol: "VFV.TO", name: "Vanguard S&P 500 Index ETF" },
  { symbol: "XAW.TO", name: "iShares Core MSCI All Country World ex Canada" },
];

export function HoldingModal({ holding, account, onSave, onClose }: HoldingModalProps) {
  const [symbol, setSymbol] = useState(holding?.symbol || "");
  const [quantity, setQuantity] = useState(holding?.quantity.toString() || "");
  const [purchasePrice, setPurchasePrice] = useState(holding?.purchasePrice.toString() || "");
  const [purchaseDate, setPurchaseDate] = useState(
    holding?.purchaseDate
      ? new Date(holding.purchaseDate).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0]
  );
  const [notes, setNotes] = useState(holding?.notes || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredSuggestions = symbol
    ? COMMON_SYMBOLS.filter(
        (s) =>
          s.symbol.toLowerCase().includes(symbol.toLowerCase()) ||
          s.name.toLowerCase().includes(symbol.toLowerCase())
      )
    : COMMON_SYMBOLS;

  function selectSymbol(selectedSymbol: string) {
    setSymbol(selectedSymbol);
    setShowSuggestions(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!symbol.trim()) {
      alert("Please enter a stock symbol");
      return;
    }

    const quantityNum = parseFloat(quantity);
    const priceNum = parseFloat(purchasePrice);

    if (isNaN(quantityNum) || quantityNum <= 0) {
      alert("Please enter a valid quantity");
      return;
    }

    if (isNaN(priceNum) || priceNum <= 0) {
      alert("Please enter a valid purchase price");
      return;
    }

    setIsSubmitting(true);

    try {
      await onSave({
        accountId: account.id,
        symbol: symbol.trim().toUpperCase(),
        quantity: quantityNum,
        purchasePrice: priceNum,
        purchaseDate: new Date(purchaseDate),
        notes: notes.trim() || undefined,
      });
      onClose();
    } catch (error) {
      console.error("Error saving holding:", error);
      alert("Failed to save holding");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 p-4 sm:items-center sm:p-4">
      {/* Phase 3.1.5: Mobile-optimized with bottom sheet on mobile, centered on desktop */}
      <div className="max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-xl sm:max-w-md sm:rounded-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {holding ? "Edit Holding" : "Add Holding"}
            </h2>
            <p className="mt-2 text-sm text-gray-600">{account.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 transition-colors hover:text-gray-600"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {/* Stock Symbol with Autocomplete */}
          <div className="relative">
            <label htmlFor="symbol" className="mb-2 block text-sm font-medium text-gray-700">
              Stock Symbol <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <input
                id="symbol"
                type="text"
                value={symbol}
                onChange={(e) => {
                  setSymbol(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="e.g., AAPL, VGRO.TO, TD.TO"
                className="h-12 w-full rounded-lg border border-gray-300 px-4 pr-10 uppercase focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
              <Search className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            </div>

            {/* Autocomplete Suggestions */}
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div className="absolute z-10 mt-2 max-h-60 w-full overflow-y-auto rounded-lg border border-gray-300 bg-white shadow-lg">
                {filteredSuggestions.slice(0, 10).map((suggestion) => (
                  <button
                    key={suggestion.symbol}
                    type="button"
                    onClick={() => selectSymbol(suggestion.symbol)}
                    className="w-full px-4 py-2 text-left transition-colors hover:bg-gray-50"
                  >
                    <div className="font-medium text-gray-900">{suggestion.symbol}</div>
                    <div className="text-sm text-gray-600">{suggestion.name}</div>
                  </button>
                ))}
              </div>
            )}

            <p className="mt-2 text-xs text-gray-500">
              Use .TO for Canadian stocks (e.g., TD.TO, VGRO.TO)
            </p>
          </div>

          {/* Quantity */}
          <div>
            <label htmlFor="quantity" className="mb-2 block text-sm font-medium text-gray-700">
              Number of Shares <span className="text-red-600">*</span>
            </label>
            <input
              id="quantity"
              type="number"
              step="0.0001"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="100"
              inputMode="decimal"
              className="h-12 w-full rounded-lg border border-gray-300 px-4 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>

          {/* Purchase Price */}
          <div>
            <label
              htmlFor="purchase-price"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Purchase Price per Share <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                id="purchase-price"
                type="number"
                step="0.01"
                min="0"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                placeholder="50.00"
                inputMode="decimal"
                className="h-12 w-full rounded-lg border border-gray-300 pl-8 pr-4 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>
          </div>

          {/* Purchase Date */}
          <div>
            <label htmlFor="purchase-date" className="mb-2 block text-sm font-medium text-gray-700">
              Purchase Date <span className="text-red-600">*</span>
            </label>
            <input
              id="purchase-date"
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className="h-12 w-full rounded-lg border border-gray-300 px-4 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>

          {/* Notes (Optional) */}
          <div>
            <label htmlFor="notes" className="mb-2 block text-sm font-medium text-gray-700">
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Part of retirement portfolio, employee stock purchase"
              rows={3}
              className="min-h-[48px] w-full resize-none rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Total Cost Preview */}
          {quantity &&
            purchasePrice &&
            !isNaN(parseFloat(quantity)) &&
            !isNaN(parseFloat(purchasePrice)) && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="mb-2 text-sm text-gray-600">Total Investment</div>
                <div className="text-2xl font-bold text-gray-900">
                  $
                  {(parseFloat(quantity) * parseFloat(purchasePrice)).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>
            )}

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-teal-500 px-4 py-2 text-white transition-colors hover:bg-teal-600 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : holding ? "Update Holding" : "Add Holding"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
