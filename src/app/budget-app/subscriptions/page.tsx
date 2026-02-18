"use client";

/**
 * Subscriptions Page
 *
 * Full subscription management with:
 * - Manual subscription CRUD
 * - Auto-detected subscription display
 * - Hybrid merge (manual + auto-detected)
 * - Cost analysis and insights
 * - Filtering and sorting
 */

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  db,
  getAllSubscriptions,
  addSubscription,
  updateSubscription,
  deleteSubscription,
  cancelSubscription,
  pauseSubscription,
  resumeSubscription,
  excludeSubscription,
  getExcludedMerchantTokens,
} from "@/lib/budget-db";
import type { Transaction, Subscription, Category } from "@/types/budget";
import {
  detectSubscriptions,
  enrichSubscriptionsWithMerchantData,
  calculateMonthlySubscriptionCost,
  getActiveSubscriptions,
  getInactiveSubscriptions,
  type SubscriptionPattern,
} from "@/lib/subscription-detector";
import { SubscriptionCard } from "@/components/budget/SubscriptionCard";
import { SubscriptionModal } from "@/components/budget/SubscriptionModal";
import { SubscriptionCostChart } from "@/components/budget/SubscriptionCostChart";
import { ConfirmDialog } from "@/components/budget/ConfirmDialog";
import { CalendarExportButton } from "@/components/budget/calendar";
import {
  Loader2,
  TrendingUp,
  DollarSign,
  Calendar,
  AlertTriangle,
  Plus,
  Filter,
  ArrowUpDown,
  Search,
  RefreshCw,
  Sparkles,
  CreditCard,
  PieChart,
  BarChart2,
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { PullToRefresh } from "@/components/budget/layout/PullToRefresh";

type ViewMode = "all" | "manual" | "auto-detected" | "active" | "inactive" | "analysis";
type SortOption = "name" | "amount" | "nextBilling" | "createdAt";

// Unified subscription type for display
interface UnifiedSubscription {
  id: string;
  name: string;
  amount: number;
  billingCycle: "weekly" | "bi-weekly" | "monthly" | "quarterly" | "annual";
  nextBillingDate: Date;
  status: "active" | "paused" | "cancelled" | "trial";
  category?: string;
  source: "manual" | "auto-detected" | "merged";
  confidence?: number;
  isActive: boolean;
  // Original data
  manualSubscription?: Subscription;
  autoDetectedPattern?: SubscriptionPattern;
}

export default function SubscriptionsPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [manualSubscriptions, setManualSubscriptions] = useState<Subscription[]>([]);
  const [autoDetectedPatterns, setAutoDetectedPatterns] = useState<SubscriptionPattern[]>([]);
  const [excludedTokens, setExcludedTokens] = useState<Set<string>>(new Set());
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Filters and sorting
  const [viewMode, setViewMode] = useState<ViewMode>("all");
  const [sortBy, setSortBy] = useState<SortOption>("nextBilling");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    try {
      // Load categories
      const cats = await db.categories.toArray();
      setCategories(cats);

      // Load manual subscriptions
      const manual = await getAllSubscriptions();
      setManualSubscriptions(manual);

      // Load excluded merchant tokens
      const excluded = await getExcludedMerchantTokens();
      setExcludedTokens(excluded);

      // Load transactions for auto-detection
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

      const allTransactions = await db.transactions.where("date").above(twelveMonthsAgo).toArray();

      setTransactions(allTransactions);

      // Detect patterns
      const detected = detectSubscriptions(allTransactions, "bmo");
      const enriched = await enrichSubscriptionsWithMerchantData(detected);

      // Filter out excluded patterns
      const filtered = enriched.filter(
        (pattern) => !excluded.has(pattern.merchant_token.toLowerCase())
      );
      setAutoDetectedPatterns(filtered);
    } catch (error) {
      console.error("Failed to load subscriptions:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRefresh() {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  }

  // Merge manual and auto-detected subscriptions
  const unifiedSubscriptions = useMemo((): UnifiedSubscription[] => {
    const unified: UnifiedSubscription[] = [];
    const matchedAutoIds = new Set<string>();

    // Add manual subscriptions first
    for (const sub of manualSubscriptions) {
      // Check if this matches an auto-detected pattern
      let matchedPattern: SubscriptionPattern | undefined;

      if (sub.merchantToken) {
        matchedPattern = autoDetectedPatterns.find(
          (p) => p.merchant_token.toLowerCase() === sub.merchantToken?.toLowerCase()
        );
        if (matchedPattern) {
          matchedAutoIds.add(matchedPattern.id);
        }
      }

      unified.push({
        id: sub.id,
        name: sub.name,
        amount: sub.amount,
        billingCycle: sub.billingCycle,
        nextBillingDate: new Date(sub.nextBillingDate),
        status: sub.status,
        category: sub.category,
        source: matchedPattern ? "merged" : "manual",
        confidence: matchedPattern?.confidence,
        isActive: sub.status === "active" || sub.status === "trial",
        manualSubscription: sub,
        autoDetectedPattern: matchedPattern,
      });
    }

    // Add unmatched auto-detected patterns
    for (const pattern of autoDetectedPatterns) {
      if (matchedAutoIds.has(pattern.id)) continue;

      const billingCycle =
        pattern.interval_type === "weekly"
          ? "weekly"
          : pattern.interval_type === "annual"
            ? "annual"
            : pattern.interval_type === "irregular"
              ? "monthly"
              : "monthly";

      unified.push({
        id: pattern.id,
        name: pattern.merchant_name,
        amount: pattern.average_amount,
        billingCycle,
        nextBillingDate: pattern.next_expected_charge || new Date(),
        status: pattern.is_active ? "active" : "cancelled",
        category: pattern.category || undefined,
        source: "auto-detected",
        confidence: pattern.confidence,
        isActive: pattern.is_active,
        autoDetectedPattern: pattern,
      });
    }

    return unified;
  }, [manualSubscriptions, autoDetectedPatterns]);

  // Filter and sort subscriptions
  const filteredSubscriptions = useMemo(() => {
    let filtered = [...unifiedSubscriptions];

    // View mode filter
    switch (viewMode) {
      case "manual":
        filtered = filtered.filter((s) => s.source === "manual" || s.source === "merged");
        break;
      case "auto-detected":
        filtered = filtered.filter((s) => s.source === "auto-detected");
        break;
      case "active":
        filtered = filtered.filter((s) => s.isActive);
        break;
      case "inactive":
        filtered = filtered.filter((s) => !s.isActive);
        break;
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((s) => s.category === categoryFilter);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) => s.name.toLowerCase().includes(query) || s.category?.toLowerCase().includes(query)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "amount":
          comparison = a.amount - b.amount;
          break;
        case "nextBilling":
          comparison =
            new Date(a.nextBillingDate).getTime() - new Date(b.nextBillingDate).getTime();
          break;
        case "createdAt":
          const aDate =
            a.manualSubscription?.createdAt || a.autoDetectedPattern?.first_charge || new Date();
          const bDate =
            b.manualSubscription?.createdAt || b.autoDetectedPattern?.first_charge || new Date();
          comparison = new Date(aDate).getTime() - new Date(bDate).getTime();
          break;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [unifiedSubscriptions, viewMode, categoryFilter, searchQuery, sortBy, sortDirection]);

  // Calculate stats
  const stats = useMemo(() => {
    const activeManual = manualSubscriptions.filter(
      (s) => s.status === "active" || s.status === "trial"
    );
    const activeAuto = autoDetectedPatterns.filter((p) => p.is_active);

    // Deduplicate for total count
    const matchedTokens = new Set(
      manualSubscriptions.filter((s) => s.merchantToken).map((s) => s.merchantToken?.toLowerCase())
    );
    const uniqueAuto = activeAuto.filter((p) => !matchedTokens.has(p.merchant_token.toLowerCase()));

    const totalActive = activeManual.length + uniqueAuto.length;

    // Calculate monthly cost
    let monthlyTotal = 0;

    for (const sub of activeManual) {
      switch (sub.billingCycle) {
        case "weekly":
          monthlyTotal += sub.amount * 4.33;
          break;
        case "bi-weekly":
          monthlyTotal += sub.amount * 2.17;
          break;
        case "monthly":
          monthlyTotal += sub.amount;
          break;
        case "quarterly":
          monthlyTotal += sub.amount / 3;
          break;
        case "annual":
          monthlyTotal += sub.amount / 12;
          break;
      }
    }

    for (const pattern of uniqueAuto) {
      monthlyTotal += calculateMonthlySubscriptionCost([pattern]);
    }

    // Count upcoming in next 7 days
    const now = new Date();
    const weekFromNow = new Date();
    weekFromNow.setDate(weekFromNow.getDate() + 7);

    const upcomingCount = filteredSubscriptions.filter((s) => {
      if (!s.isActive) return false;
      const nextDate = new Date(s.nextBillingDate);
      return nextDate >= now && nextDate <= weekFromNow;
    }).length;

    return {
      totalActive,
      totalInactive: unifiedSubscriptions.length - totalActive,
      monthlyTotal,
      annualTotal: monthlyTotal * 12,
      upcomingCount,
    };
  }, [manualSubscriptions, autoDetectedPatterns, unifiedSubscriptions, filteredSubscriptions]);

  // Unique categories from all subscriptions
  const uniqueCategories = useMemo(() => {
    const cats = new Set<string>();
    unifiedSubscriptions.forEach((s) => {
      if (s.category) cats.add(s.category);
    });
    return Array.from(cats).sort();
  }, [unifiedSubscriptions]);

  // Handle save subscription
  async function handleSaveSubscription(subscription: Subscription) {
    setIsSaving(true);
    try {
      if (editingSubscription) {
        await updateSubscription(subscription.id, subscription);
      } else {
        await addSubscription(subscription);
      }
      await loadData();
      setShowAddModal(false);
      setEditingSubscription(null);
    } catch (error) {
      console.error("Error saving subscription:", error);
      alert("Failed to save subscription");
    } finally {
      setIsSaving(false);
    }
  }

  // Handle delete subscription
  async function handleDeleteSubscription(id: string) {
    try {
      await deleteSubscription(id);
      await loadData();
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting subscription:", error);
      alert("Failed to delete subscription");
    }
  }

  // Handle pause/resume
  async function handlePauseResume(subscription: UnifiedSubscription) {
    if (!subscription.manualSubscription) return;

    try {
      if (subscription.status === "paused") {
        await resumeSubscription(subscription.id);
      } else {
        await pauseSubscription(subscription.id);
      }
      await loadData();
    } catch (error) {
      console.error("Error updating subscription status:", error);
    }
  }

  // Handle cancel subscription
  async function handleCancelSubscription(id: string) {
    try {
      await cancelSubscription(id);
      await loadData();
    } catch (error) {
      console.error("Error cancelling subscription:", error);
    }
  }

  // Claim auto-detected as manual subscription
  async function handleClaimSubscription(pattern: SubscriptionPattern) {
    const newSubscription: Subscription = {
      id: `sub_${Date.now()}`,
      name: pattern.merchant_name,
      amount: pattern.average_amount,
      currency: "CAD",
      billingCycle:
        pattern.interval_type === "weekly"
          ? "weekly"
          : pattern.interval_type === "annual"
            ? "annual"
            : "monthly",
      startDate: pattern.first_charge,
      nextBillingDate: pattern.next_expected_charge || new Date(),
      status: pattern.is_active ? "active" : "cancelled",
      autoRenew: true,
      category: pattern.category || undefined,
      linkedTransactionIds: pattern.transaction_ids,
      merchantToken: pattern.merchant_token,
      reminderDaysBefore: 3,
      reminderEnabled: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      source: "merged",
    };

    setEditingSubscription(newSubscription);
    setShowAddModal(true);
  }

  // Toggle reminder for a subscription
  async function handleToggleReminder(subscription: Subscription) {
    try {
      await updateSubscription(subscription.id, {
        ...subscription,
        reminderEnabled: !subscription.reminderEnabled,
        updatedAt: new Date(),
      });
      await loadData();
    } catch (error) {
      console.error("Error toggling reminder:", error);
    }
  }

  // Dismiss auto-detected subscription (mark as not a subscription)
  async function handleDismissSubscription(pattern: SubscriptionPattern) {
    try {
      await excludeSubscription(
        pattern.merchant_token,
        pattern.merchant_name,
        "User dismissed - not a subscription"
      );
      // Remove from displayed patterns
      setAutoDetectedPatterns((prev) =>
        prev.filter((p) => p.merchant_token.toLowerCase() !== pattern.merchant_token.toLowerCase())
      );
    } catch (error) {
      console.error("Error dismissing subscription:", error);
      alert("Failed to dismiss subscription");
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-teal-500" />
          <p className="text-muted-foreground">Loading subscriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <PullToRefresh onRefresh={loadData}>
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Subscriptions</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage your recurring payments and subscriptions
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                title="Refresh auto-detection"
              >
                <RefreshCw className={`h-5 w-5 ${isRefreshing ? "animate-spin" : ""}`} />
              </button>
              {manualSubscriptions.length > 0 && (
                <CalendarExportButton
                  subscriptions={manualSubscriptions}
                  variant="outline"
                  size="default"
                />
              )}
              <button
                onClick={() => {
                  setEditingSubscription(null);
                  setShowAddModal(true);
                }}
                className="flex items-center gap-2 rounded-lg bg-teal-500 px-4 py-2.5 font-medium text-white transition-colors hover:bg-teal-600"
              >
                <Plus className="h-5 w-5" />
                Add Subscription
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {/* Active Subscriptions */}
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Active</h3>
              <TrendingUp className="h-5 w-5 text-teal-500" />
            </div>
            <p className="text-3xl font-bold text-foreground">{stats.totalActive}</p>
            <p className="mt-1 text-xs text-muted-foreground">{stats.totalInactive} inactive</p>
          </div>

          {/* Monthly Cost */}
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Monthly</h3>
              <DollarSign className="h-5 w-5 text-teal-500" />
            </div>
            <p className="text-3xl font-bold text-foreground">${stats.monthlyTotal.toFixed(2)}</p>
            <p className="mt-1 text-xs text-muted-foreground">Estimated cost</p>
          </div>

          {/* Annual Cost */}
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Annual</h3>
              <Calendar className="h-5 w-5 text-teal-500" />
            </div>
            <p className="text-3xl font-bold text-foreground">${stats.annualTotal.toFixed(2)}</p>
            <p className="mt-1 text-xs text-muted-foreground">Projected spend</p>
          </div>

          {/* Upcoming Charges */}
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Next 7 Days</h3>
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
            </div>
            <p className="text-3xl font-bold text-foreground">{stats.upcomingCount}</p>
            <p className="mt-1 text-xs text-muted-foreground">Upcoming charges</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="mb-6 rounded-lg border border-border bg-card p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search subscriptions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-input bg-background py-2 pl-10 pr-4 text-sm text-foreground focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* View Mode Tabs */}
            <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
              {[
                { value: "all", label: "All" },
                { value: "active", label: "Active" },
                { value: "manual", label: "Manual" },
                { value: "auto-detected", label: "Detected" },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setViewMode(tab.value as ViewMode)}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    viewMode === tab.value
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
              <button
                onClick={() => setViewMode("analysis")}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  viewMode === "analysis"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <BarChart2 className="h-4 w-4" />
                Analysis
              </button>
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Categories</option>
              {uniqueCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-teal-500"
              >
                <option value="nextBilling">Next Billing</option>
                <option value="name">Name</option>
                <option value="amount">Amount</option>
                <option value="createdAt">Date Added</option>
              </select>
              <button
                onClick={() => setSortDirection((d) => (d === "asc" ? "desc" : "asc"))}
                className="rounded-lg border border-input p-2 transition-colors hover:bg-muted"
                title={`Sort ${sortDirection === "asc" ? "descending" : "ascending"}`}
              >
                <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>

        {/* Cost Analysis View */}
        {viewMode === "analysis" ? (
          <SubscriptionCostChart
            manualSubscriptions={manualSubscriptions}
            autoDetectedPatterns={autoDetectedPatterns}
          />
        ) : filteredSubscriptions.length === 0 ? (
          /* Empty State */
          <div className="rounded-lg border border-border bg-card p-12 text-center">
            {unifiedSubscriptions.length === 0 ? (
              <>
                <CreditCard className="mx-auto mb-4 h-16 w-16 text-muted-foreground opacity-50" />
                <h3 className="mb-2 text-lg font-semibold text-foreground">No subscriptions yet</h3>
                <p className="mx-auto mb-6 max-w-md text-sm text-muted-foreground">
                  Add your subscriptions manually or import transactions to auto-detect recurring
                  payments.
                </p>
                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="rounded-lg bg-teal-500 px-6 py-2.5 font-medium text-white transition-colors hover:bg-teal-600"
                  >
                    Add Subscription
                  </button>
                  <button
                    onClick={() => router.push("/budget-app/import")}
                    className="rounded-lg border border-border px-6 py-2.5 font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    Import Transactions
                  </button>
                </div>
              </>
            ) : (
              <>
                <Search className="mx-auto mb-4 h-16 w-16 text-muted-foreground opacity-50" />
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  No matching subscriptions
                </h3>
                <p className="mx-auto max-w-md text-sm text-muted-foreground">
                  Try adjusting your filters or search query.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setViewMode("all");
                    setCategoryFilter("all");
                  }}
                  className="mt-4 px-4 py-2 text-sm font-medium text-teal-600 hover:text-teal-700"
                >
                  Clear filters
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {filteredSubscriptions.map((subscription) => (
              <SubscriptionCard
                key={subscription.id}
                subscription={
                  subscription.autoDetectedPattern || {
                    id: subscription.id,
                    merchant_token: subscription.manualSubscription?.merchantToken || "",
                    merchant_name: subscription.name,
                    category: subscription.category || null,
                    subcategory: null,
                    average_amount: subscription.amount,
                    min_amount: subscription.amount,
                    max_amount: subscription.amount,
                    currency: "CAD",
                    interval_type:
                      subscription.billingCycle === "weekly"
                        ? "weekly"
                        : subscription.billingCycle === "bi-weekly"
                          ? "bi-weekly"
                          : subscription.billingCycle === "quarterly"
                            ? "quarterly"
                            : subscription.billingCycle === "annual"
                              ? "annual"
                              : "monthly",
                    interval_days:
                      subscription.billingCycle === "weekly"
                        ? 7
                        : subscription.billingCycle === "bi-weekly"
                          ? 14
                          : subscription.billingCycle === "quarterly"
                            ? 90
                            : subscription.billingCycle === "annual"
                              ? 365
                              : 30,
                    confidence: subscription.confidence || 1,
                    occurrence_count: 1,
                    first_charge: subscription.manualSubscription?.startDate || new Date(),
                    last_charge: subscription.manualSubscription?.startDate || new Date(),
                    next_expected_charge: subscription.nextBillingDate,
                    is_active: subscription.isActive,
                    is_subscription_merchant: subscription.source !== "auto-detected",
                    transaction_ids: subscription.manualSubscription?.linkedTransactionIds || [],
                    total_spent: subscription.amount,
                    annual_cost_estimate:
                      subscription.billingCycle === "annual"
                        ? subscription.amount
                        : subscription.billingCycle === "quarterly"
                          ? subscription.amount * 4
                          : subscription.billingCycle === "weekly"
                            ? subscription.amount * 52
                            : subscription.billingCycle === "bi-weekly"
                              ? subscription.amount * 26
                              : subscription.amount * 12,
                  }
                }
                source={subscription.source}
                manualSubscription={subscription.manualSubscription}
                onViewTransactions={() => {
                  const token =
                    subscription.manualSubscription?.merchantToken ||
                    subscription.autoDetectedPattern?.merchant_token;
                  if (token) {
                    router.push(`/budget-app/transactions?merchant=${token}`);
                  }
                }}
                onEdit={
                  subscription.manualSubscription
                    ? () => {
                        setEditingSubscription(subscription.manualSubscription!);
                        setShowAddModal(true);
                      }
                    : undefined
                }
                onDelete={
                  subscription.manualSubscription
                    ? () => {
                        setDeleteConfirm(subscription.id);
                      }
                    : undefined
                }
                onPauseResume={
                  subscription.manualSubscription
                    ? () => {
                        handlePauseResume(subscription);
                      }
                    : undefined
                }
                onCancel={
                  subscription.manualSubscription && subscription.status !== "cancelled"
                    ? () => {
                        handleCancelSubscription(subscription.id);
                      }
                    : undefined
                }
                onClaim={
                  subscription.source === "auto-detected"
                    ? () => {
                        handleClaimSubscription(subscription.autoDetectedPattern!);
                      }
                    : undefined
                }
                onDismiss={
                  subscription.source === "auto-detected"
                    ? () => {
                        handleDismissSubscription(subscription.autoDetectedPattern!);
                      }
                    : undefined
                }
                onToggleReminder={
                  subscription.manualSubscription
                    ? () => {
                        handleToggleReminder(subscription.manualSubscription!);
                      }
                    : undefined
                }
              />
            ))}
          </div>
        )}

        {/* Help Text */}
        <div className="mt-8 rounded-lg border border-white/10 bg-slate-800/50 p-6">
          <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
            <Sparkles className="h-4 w-4 text-teal-500" />
            Smart Subscription Management
          </h3>
          <p className="text-sm text-slate-300">
            <strong>Manual:</strong> Add subscriptions you want to track precisely.{" "}
            <strong>Auto-detected:</strong> We analyze your transactions to find recurring patterns.{" "}
            <strong>Claim</strong> auto-detected subscriptions to manage them manually with
            reminders and more control.
          </p>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <SubscriptionModal
          subscription={editingSubscription}
          categories={categories}
          onSave={handleSaveSubscription}
          onClose={() => {
            setShowAddModal(false);
            setEditingSubscription(null);
          }}
          isSaving={isSaving}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteConfirm}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
        title="Delete Subscription"
        description="Are you sure you want to delete this subscription? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() =>
          deleteConfirm ? handleDeleteSubscription(deleteConfirm) : Promise.resolve()
        }
      />
    </div>
    </PullToRefresh>
  );
}
