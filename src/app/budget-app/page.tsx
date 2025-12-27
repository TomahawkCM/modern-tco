"use client";

/**
 * Budget App Dashboard - Modern 2025 Design
 *
 * DESIGN SYSTEM COMPLIANCE:
 * - Vibrant Aesthetics: Rich gradients, deep dark modes, neon accents
 * - Glassmorphism: Translucent backgrounds with backdrop blur
 * - Dynamic Animations: Smooth entrance and interaction animations
 */

import { DashboardSkeleton } from "@/components/budget/LoadingSkeleton";
import { GlassCard } from "@/components/budget/ui/GlassCard";
import { CountUp } from "@/hooks/useCountUp";
import {
  detectAnomalies,
  isAnomalyDetectionEnabled,
  type AnomalyAlert,
} from "@/lib/analytics/anomaly-detector";
import {
  detectRecurringTransactions,
  type RecurringPattern,
} from "@/lib/analytics/recurring-detector";
import {
  calculateSpendingInsights,
  getAverageMonthlyIncome,
  getAverageMonthlySpending,
} from "@/lib/analytics/spending-insights";
import {
  calculateHealthScore,
  type HealthScoreResult,
} from "@/lib/analytics/health-score";
import { db, initializeDefaultCategories } from "@/lib/budget-db";
import { HealthScoreWidget } from "@/components/budget/HealthScoreWidget";
import type { Account, Budget, Category, Transaction } from "@/types/budget";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowDown,
  ArrowDownRight,
  ArrowUp,
  ArrowUpRight,
  BarChart3,
  PiggyBank,
  Plus,
  Target,
  TrendingDown,
  TrendingUp,
  Upload,
  Wallet,
} from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";

// Dynamic chart imports
const DynamicDashboardCharts = dynamic(
  () =>
    import("recharts").then((mod) => {
      function DashboardCharts({ type, data, CustomTooltip }: any) {
        const {
          PieChart,
          Pie,
          Cell,
          ResponsiveContainer,
          Tooltip,
          AreaChart,
          Area,
          XAxis,
          YAxis,
          CartesianGrid,
          Legend,
        } = mod;

        if (type === "pie") {
          return (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(255,255,255,0.1)" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          );
        }

        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4ade80" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f87171" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.1)"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: "20px" }} />
              <Area
                type="monotone"
                dataKey="income"
                stroke="#4ade80"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorIncome)"
                name="Income"
              />
              <Area
                type="monotone"
                dataKey="expenses"
                stroke="#f87171"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorExpenses)"
                name="Expenses"
              />
            </AreaChart>
          </ResponsiveContainer>
        );
      }
      return { default: DashboardCharts };
    }),
  {
    loading: () => (
      <div className="flex h-[300px] w-full animate-pulse items-center justify-center rounded-lg bg-white/5">
        <div className="flex flex-col items-center gap-2 text-slate-400">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-teal-500" />
        </div>
      </div>
    ),
    ssr: false,
  }
);

function MetricCard({
  title,
  value,
  change,
  changePercent,
  icon: Icon,
  trend,
  delay = 0,
}: {
  title: string;
  value: string | React.ReactNode;
  change?: string;
  changePercent?: string;
  icon: any;
  trend?: "up" | "down";
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <GlassCard className="group relative overflow-hidden p-6" gradient="subtle">
        <div className="absolute right-0 top-0 transform p-4 opacity-10 transition-opacity duration-500 group-hover:scale-110 group-hover:opacity-20">
          <Icon className="h-24 w-24 text-white" />
        </div>

        <div className="relative z-10">
          <div className="mb-4 flex items-center justify-between">
            <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-3 shadow-inner">
              <Icon className="h-6 w-6 text-teal-300" />
            </div>
            {changePercent && (
              <div
                className={`flex items-center gap-1 rounded-full border px-2 py-1 text-sm font-bold ${
                  trend === "up"
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                    : "border-rose-500/30 bg-rose-500/10 text-rose-400"
                }`}
              >
                {trend === "up" ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                {changePercent}
              </div>
            )}
          </div>
          <p className="mb-1 text-sm font-medium text-slate-400">{title}</p>
          <p className="text-3xl font-bold tracking-tight text-white">{value}</p>
          {change && <p className="mt-2 text-xs text-slate-500">{change}</p>}
        </div>
      </GlassCard>
    </motion.div>
  );
}

function TransactionRow({ transaction }: { transaction: Transaction }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="group flex items-center justify-between rounded-xl border border-transparent px-4 py-3 transition-all hover:border-white/5 hover:bg-white/5"
    >
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <div
          className={`rounded-full p-2 ${transaction.amount > 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"}`}
        >
          {transaction.amount > 0 ? (
            <ArrowUp className="h-4 w-4" />
          ) : (
            <ArrowDown className="h-4 w-4" />
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate font-medium text-slate-200 transition-colors group-hover:text-white">
            {transaction.description}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            {new Date(transaction.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}{" "}
            • {transaction.category || "Uncategorized"}
          </p>
        </div>
      </div>
      <div className="ml-4 text-right">
        <span
          className={`font-bold ${transaction.amount > 0 ? "text-emerald-400" : "text-slate-200"}`}
        >
          {transaction.amount > 0 ? "+" : ""}${Math.abs(transaction.amount).toFixed(2)}
        </span>
      </div>
    </motion.div>
  );
}

function BudgetProgressBar({
  category,
  budget,
  spent,
}: {
  category: string;
  budget: number;
  spent: number;
}) {
  const percentage = (spent / budget) * 100;
  const remaining = budget - spent;

  let barColor = "from-emerald-400 to-emerald-600";
  let trackColor = "bg-emerald-950/30";

  if (percentage > 100) {
    barColor = "from-rose-400 to-rose-600";
    trackColor = "bg-rose-950/30";
  } else if (percentage > 80) {
    barColor = "from-amber-400 to-amber-600";
    trackColor = "bg-amber-950/30";
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-300">{category}</span>
        <span className="text-slate-400">
          ${spent.toFixed(0)} <span className="text-slate-600">/</span> ${budget.toFixed(0)}
        </span>
      </div>
      <div className={`h-2.5 ${trackColor} overflow-hidden rounded-full border border-white/5`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(percentage, 100)}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full bg-gradient-to-r ${barColor} rounded-full shadow-lg`}
        />
      </div>
      <div className="flex items-center justify-between text-xs">
        {remaining >= 0 ? (
          <span className="text-slate-500">${remaining.toFixed(0)} left</span>
        ) : (
          <span className="flex items-center gap-1 font-semibold text-rose-400">
            <AlertCircle className="h-3 w-3" />${Math.abs(remaining).toFixed(0)} over
          </span>
        )}
        <span className="text-slate-500">{percentage.toFixed(1)}%</span>
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/90 p-4 shadow-xl backdrop-blur-md">
      <p className="mb-2 font-semibold text-white">{label}</p>
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <div
            className="h-3 w-3 rounded-full shadow-sm"
            style={{ backgroundColor: entry.color || entry.fill }}
          />
          <span className="text-slate-300">{entry.name}:</span>
          <span className="font-bold text-white">${entry.value.toFixed(2)}</span>
        </div>
      ))}
    </div>
  );
}

export default function BudgetDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [netWorth, setNetWorth] = useState(0);
  const [categorySpending, setCategorySpending] = useState<any[]>([]);
  const [monthlyTrends, setMonthlyTrends] = useState<any[]>([]);
  const [recurringPatterns, setRecurringPatterns] = useState<RecurringPattern[]>([]);
  const [spendingInsights, setSpendingInsights] = useState<any[]>([]);
  const [avgMonthlyIncome, setAvgMonthlyIncome] = useState(0);
  const [avgMonthlySpending, setAvgMonthlySpending] = useState(0);
  const [anomalyAlerts, setAnomalyAlerts] = useState<AnomalyAlert[]>([]);
  const [dismissedAnomalies, setDismissedAnomalies] = useState<Set<string>>(new Set());
  const [healthScore, setHealthScore] = useState<HealthScoreResult | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        await initializeDefaultCategories();
        const [txs, accts, cats, bdgs] = await Promise.all([
          db.transactions.toArray(),
          db.accounts.toArray(),
          db.categories.toArray(),
          db.budgets.toArray(),
        ]);

        setTransactions(txs);
        setAccounts(accts);
        setCategories(cats);
        setBudgets(bdgs);

        const now = new Date();
        const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const currentMonthTxs = txs.filter((tx) => new Date(tx.date) >= firstOfMonth);
        const income = currentMonthTxs
          .filter((tx) => tx.amount > 0)
          .reduce((sum, tx) => sum + tx.amount, 0);
        const expenses = Math.abs(
          currentMonthTxs.filter((tx) => tx.amount < 0).reduce((sum, tx) => sum + tx.amount, 0)
        );
        setTotalIncome(income);
        setTotalExpenses(expenses);
        setNetWorth(accts.reduce((sum, acc) => sum + acc.balance, 0));

        // Category spending
        const categoryMap = new Map();
        currentMonthTxs
          .filter((tx) => tx.amount < 0 && tx.category)
          .forEach((tx) => {
            const cat = cats.find((c) => c.name === tx.category);
            const existing = categoryMap.get(tx.category!);
            if (existing) existing.value += Math.abs(tx.amount);
            else
              categoryMap.set(tx.category!, {
                name: tx.category!,
                value: Math.abs(tx.amount),
                color: cat?.color || "#94a3b8",
              });
          });
        setCategorySpending(Array.from(categoryMap.values()));

        // Monthly trends
        const trends: any[] = [];
        for (let i = 5; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
          const monthTxs = txs.filter(
            (tx) => new Date(tx.date) >= date && new Date(tx.date) < nextDate
          );
          const monthIncome = monthTxs
            .filter((tx) => tx.amount > 0)
            .reduce((sum, tx) => sum + tx.amount, 0);
          const monthExpenses = Math.abs(
            monthTxs.filter((tx) => tx.amount < 0).reduce((sum, tx) => sum + tx.amount, 0)
          );
          trends.push({
            month: date.toLocaleDateString("en-US", { month: "short" }),
            income: monthIncome,
            expenses: monthExpenses,
            net: monthIncome - monthExpenses,
          });
        }
        setMonthlyTrends(trends);

        // Analytics
        setRecurringPatterns(detectRecurringTransactions(txs));
        setSpendingInsights(calculateSpendingInsights(txs, cats));
        setAvgMonthlyIncome(getAverageMonthlyIncome(txs));
        setAvgMonthlySpending(getAverageMonthlySpending(txs));

        if (isAnomalyDetectionEnabled() && txs.length >= 5) {
          setAnomalyAlerts(detectAnomalies(txs, { zScoreThreshold: 2.5, minTransactions: 5 }));
        }

        // Calculate health score
        const futurePurchases = await db.futurePurchases.toArray();
        const healthResult = calculateHealthScore({
          transactions: txs,
          budgets,
          futurePurchases,
        });
        setHealthScore(healthResult);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  if (isLoading) return <DashboardSkeleton />;

  if (transactions.length === 0 && accounts.length === 0) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="mx-auto max-w-md p-8 text-center">
          <div className="mx-auto mb-8 flex h-24 w-24 animate-bounce items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-blue-600 shadow-2xl shadow-teal-500/20">
            <PiggyBank className="h-12 w-12 text-white" />
          </div>
          <h2 className="mb-4 text-3xl font-bold text-white">Welcome to Budget App</h2>
          <p className="mb-8 text-lg text-slate-400">
            Your premium finance manager. Import your data to get started.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/budget-app/import"
              className="inline-flex items-center gap-2 rounded-xl bg-teal-500 px-6 py-3 font-medium text-white shadow-lg shadow-teal-500/25 transition-all hover:bg-teal-400"
            >
              <Upload className="h-5 w-5" />
              Import CSV
            </Link>
            <Link
              href="/budget-app/transactions"
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-6 py-3 font-medium text-white backdrop-blur-md transition-all hover:bg-white/20"
            >
              <Plus className="h-5 w-5" />
              Add Manual
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;
  const topBudgets = budgets
    .filter((b) => categories.find((c) => c.id === b.categoryId && c.type === "expense"))
    .slice(0, 5);

  return (
    <div className="space-y-8 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white">Dashboard</h1>
          <p className="mt-2 text-lg text-slate-400">
            {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/budget-app/import"
            className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-slate-300 transition-all hover:bg-white/10 hover:text-white sm:inline-flex"
          >
            <Upload className="h-4 w-4" />
            <span>Import</span>
          </Link>
          <Link
            href="/budget-app/transactions"
            className="inline-flex items-center gap-2 rounded-xl bg-teal-500 px-4 py-2.5 text-white shadow-lg shadow-teal-500/20 transition-all hover:bg-teal-400"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Transaction</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Net Worth"
          value={<CountUp end={netWorth} decimals={2} prefix="$" separator="," duration={2000} />}
          icon={Wallet}
          delay={0.1}
        />
        <MetricCard
          title="Income"
          value={
            <CountUp end={totalIncome} decimals={2} prefix="$" separator="," duration={2000} />
          }
          change="vs last month"
          changePercent="+5.2%"
          trend="up"
          icon={TrendingUp}
          delay={0.2}
        />
        <MetricCard
          title="Expenses"
          value={
            <CountUp end={totalExpenses} decimals={2} prefix="$" separator="," duration={2000} />
          }
          change="vs last month"
          changePercent="-3.1%"
          trend="down"
          icon={TrendingDown}
          delay={0.3}
        />
        <MetricCard
          title="Net Savings"
          value={<CountUp end={netSavings} decimals={2} prefix="$" separator="," duration={2000} />}
          change={`${savingsRate.toFixed(1)}% savings rate`}
          changePercent={savingsRate > 20 ? "+12%" : "-5%"}
          trend={netSavings > 0 ? "up" : "down"}
          icon={PiggyBank}
          delay={0.4}
        />
      </div>

      {/* Health Score Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <GlassCard className="lg:col-span-1 flex flex-col items-center justify-center p-6">
          <HealthScoreWidget
            result={healthScore}
            size="lg"
            showLabel={true}
            showGrade={true}
          />
          {healthScore?.topRecommendation && (
            <div className="mt-4 p-3 rounded-lg bg-teal-500/10 border border-teal-500/20 w-full">
              <p className="text-sm text-teal-300">
                <strong>Tip:</strong> {healthScore.topRecommendation}
              </p>
            </div>
          )}
        </GlassCard>

        <GlassCard className="lg:col-span-2 p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="rounded-lg bg-teal-500/20 p-2">
              <Target className="h-5 w-5 text-teal-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Score Breakdown</h2>
              <p className="text-sm text-slate-400">How your score is calculated</p>
            </div>
          </div>
          {healthScore ? (
            <div className="grid gap-3">
              {healthScore.factors.map((factor) => {
                const percentage = (factor.score / factor.maxScore) * 100;
                return (
                  <div key={factor.type} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-white capitalize">
                        {factor.type.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className="text-slate-400">
                        {factor.score.toFixed(1)} / {factor.maxScore}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          backgroundColor: percentage >= 80 ? '#22c55e' : percentage >= 60 ? '#eab308' : percentage >= 40 ? '#f97316' : '#ef4444'
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                      />
                    </div>
                    <p className="text-xs text-slate-500">{factor.description}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-slate-400 text-center py-8">
              Add transactions to see your financial health breakdown
            </p>
          )}
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <GlassCard className="p-0">
          <div className="border-b border-white/10 p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-purple-500/20 p-2">
                <BarChart3 className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Spending by Category</h2>
                <p className="text-sm text-slate-400">Current month breakdown</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            {categorySpending.length > 0 ? (
              <DynamicDashboardCharts
                type="pie"
                data={categorySpending}
                CustomTooltip={CustomTooltip}
              />
            ) : (
              <div className="flex h-[300px] items-center justify-center text-slate-500">
                No expense data for this month
              </div>
            )}
          </div>
        </GlassCard>

        <GlassCard className="p-0">
          <div className="border-b border-white/10 p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-emerald-500/20 p-2">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Income vs Expenses</h2>
                <p className="text-sm text-slate-400">Last 6 months trend</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            {monthlyTrends.length > 0 ? (
              <DynamicDashboardCharts
                type="area"
                data={monthlyTrends}
                CustomTooltip={CustomTooltip}
              />
            ) : (
              <div className="flex h-[300px] items-center justify-center text-slate-500">
                No trend data available
              </div>
            )}
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <GlassCard className="p-0">
          <div className="flex items-center justify-between border-b border-white/10 p-6">
            <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
            <Link
              href="/budget-app/transactions"
              className="text-sm font-medium text-teal-400 transition-colors hover:text-teal-300"
            >
              View all →
            </Link>
          </div>
          <div className="p-4">
            {transactions.length > 0 ? (
              <div className="space-y-1">
                {transactions
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 8)
                  .map((tx) => (
                    <TransactionRow key={tx.id} transaction={tx} />
                  ))}
              </div>
            ) : (
              <p className="py-12 text-center text-slate-500">No transactions yet</p>
            )}
          </div>
        </GlassCard>

        <GlassCard className="p-0">
          <div className="border-b border-white/10 p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-amber-500/20 p-2">
                <Target className="h-5 w-5 text-amber-400" />
              </div>
              <h2 className="text-lg font-semibold text-white">Budget Status</h2>
            </div>
          </div>
          <div className="space-y-6 p-6">
            {topBudgets.length > 0 ? (
              topBudgets.map((budget) => {
                const category = categories.find((c) => c.id === budget.categoryId);
                if (!category) return null;
                const spent = Math.abs(
                  transactions
                    .filter(
                      (tx) =>
                        tx.category === category.name &&
                        tx.amount < 0 &&
                        new Date(tx.date).getMonth() === new Date().getMonth()
                    )
                    .reduce((sum, tx) => sum + tx.amount, 0)
                );
                return (
                  <BudgetProgressBar
                    key={budget.id}
                    category={category.name}
                    budget={budget.amount}
                    spent={spent}
                  />
                );
              })
            ) : (
              <div className="py-12 text-center">
                <p className="mb-4 text-slate-500">No budgets set</p>
                <Link
                  href="/budget-app/budgets"
                  className="inline-flex items-center text-sm font-medium text-teal-400 hover:text-teal-300"
                >
                  Create your first budget →
                </Link>
              </div>
            )}
          </div>
        </GlassCard>

        <GlassCard className="p-0">
          <div className="border-b border-white/10 p-6">
            <h2 className="text-lg font-semibold text-white">Quick Actions</h2>
          </div>
          <div className="space-y-4 p-6">
            <Link
              href="/budget-app/transactions"
              className="group flex items-center gap-4 rounded-xl border border-white/5 bg-white/5 p-4 transition-all hover:border-teal-500/50 hover:bg-white/10"
            >
              <div className="rounded-lg bg-teal-500/20 p-2 transition-colors group-hover:bg-teal-500/30">
                <Plus className="h-5 w-5 text-teal-400" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white">Add Transaction</p>
                <p className="text-sm text-slate-400">Record income or expense</p>
              </div>
            </Link>
            <Link
              href="/budget-app/import"
              className="group flex items-center gap-4 rounded-xl border border-white/5 bg-white/5 p-4 transition-all hover:border-emerald-500/50 hover:bg-white/10"
            >
              <div className="rounded-lg bg-emerald-500/20 p-2 transition-colors group-hover:bg-emerald-500/30">
                <Upload className="h-5 w-5 text-emerald-400" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white">Import CSV</p>
                <p className="text-sm text-slate-400">Upload bank statements</p>
              </div>
            </Link>
            <Link
              href="/budget-app/budgets"
              className="group flex items-center gap-4 rounded-xl border border-white/5 bg-white/5 p-4 transition-all hover:border-blue-500/50 hover:bg-white/10"
            >
              <div className="rounded-lg bg-blue-500/20 p-2 transition-colors group-hover:bg-blue-500/30">
                <Target className="h-5 w-5 text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white">Set Budget</p>
                <p className="text-sm text-slate-400">Create spending limits</p>
              </div>
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
