'use client';

/**
 * Recommendations Panel Component (H-032)
 * Shows top 3 financial health recommendations with links to relevant sections
 */

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Lightbulb,
  TrendingUp,
  CreditCard,
  Target,
  Shield,
  BarChart3,
  PiggyBank,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { type HealthScoreResult, type FactorType } from '@/lib/analytics/health-score';
import { useSeniorsMode } from '@/hooks/useSeniorsMode';

interface RecommendationsPanelProps {
  result: HealthScoreResult | null;
  maxRecommendations?: number;
  className?: string;
}

// Map factor types to icons and app sections
const FACTOR_CONFIG: Record<
  FactorType,
  { icon: typeof TrendingUp; label: string; link: string; linkLabel: string }
> = {
  savingsRate: {
    icon: PiggyBank,
    label: 'Savings',
    link: '/budget-app/transactions?filter=income',
    linkLabel: 'View Income',
  },
  debtToIncome: {
    icon: CreditCard,
    label: 'Debt',
    link: '/budget-app/loans',
    linkLabel: 'Manage Loans',
  },
  budgetAdherence: {
    icon: Target,
    label: 'Budget',
    link: '/budget-app/budgets',
    linkLabel: 'Adjust Budgets',
  },
  emergencyFund: {
    icon: Shield,
    label: 'Emergency Fund',
    link: '/budget-app/planning/future',
    linkLabel: 'Plan Savings',
  },
  investmentGrowth: {
    icon: TrendingUp,
    label: 'Investments',
    link: '/budget-app/investments',
    linkLabel: 'View Portfolio',
  },
  expenseStability: {
    icon: BarChart3,
    label: 'Expenses',
    link: '/budget-app/reports',
    linkLabel: 'View Reports',
  },
};

export function RecommendationsPanel({
  result,
  maxRecommendations = 3,
  className,
}: RecommendationsPanelProps) {
  const { isSeniorsMode } = useSeniorsMode();

  // Get top recommendations sorted by lowest percentage (most room for improvement)
  const recommendations = useMemo(() => {
    if (!result || result.factors.length === 0) return [];

    return result.factors
      .filter((f) => f.improvementTip)
      .sort((a, b) => a.percentage - b.percentage)
      .slice(0, maxRecommendations)
      .map((factor) => ({
        ...factor,
        config: FACTOR_CONFIG[factor.type],
      }));
  }, [result, maxRecommendations]);

  // Empty state
  if (!result || recommendations.length === 0) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center rounded-xl bg-slate-800/50 border border-white/10 p-8',
          className
        )}
      >
        <Lightbulb className="h-12 w-12 text-slate-600 mb-3" />
        <p className="text-slate-400 text-center">
          Add more financial data to receive personalized recommendations
        </p>
      </div>
    );
  }

  return (
    <motion.div
      className={cn(
        'rounded-xl bg-slate-800/50 border border-white/10 p-6',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/20">
          <Lightbulb className="h-5 w-5 text-amber-400" />
        </div>
        <div>
          <h3 className={cn('font-semibold text-white', isSeniorsMode && 'text-lg')}>
            Top Recommendations
          </h3>
          <p className="text-xs text-slate-400">
            Ways to improve your financial health
          </p>
        </div>
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        {recommendations.map((rec, index) => {
          const Icon = rec.config.icon;

          return (
            <motion.div
              key={rec.type}
              className="rounded-lg bg-white/5 border border-white/10 p-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg shrink-0"
                  style={{ backgroundColor: `${rec.config.label === 'Savings' ? '#22c55e' : '#94a3b8'}20` }}
                >
                  <Icon
                    className="h-4 w-4"
                    style={{ color: rec.config.label === 'Savings' ? '#22c55e' : '#94a3b8' }}
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Factor Label & Score */}
                  <div className="flex items-center justify-between mb-1">
                    <span className={cn('font-medium text-white', isSeniorsMode && 'text-base')}>
                      {rec.config.label}
                    </span>
                    <span
                      className={cn(
                        'text-xs font-medium px-2 py-0.5 rounded',
                        rec.percentage >= 60 && 'bg-green-500/20 text-green-400',
                        rec.percentage >= 40 && rec.percentage < 60 && 'bg-yellow-500/20 text-yellow-400',
                        rec.percentage < 40 && 'bg-red-500/20 text-red-400'
                      )}
                    >
                      {rec.score.toFixed(0)}/{rec.maxScore}
                    </span>
                  </div>

                  {/* Tip */}
                  <p className={cn('text-slate-400 mb-3', isSeniorsMode ? 'text-sm' : 'text-xs')}>
                    {rec.improvementTip}
                  </p>

                  {/* Link */}
                  <Link
                    href={rec.config.link}
                    className={cn(
                      'inline-flex items-center gap-1 text-teal-400 hover:text-teal-300 transition-colors',
                      isSeniorsMode ? 'text-sm' : 'text-xs'
                    )}
                  >
                    {rec.config.linkLabel}
                    <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-3 h-1.5 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    backgroundColor:
                      rec.percentage >= 60
                        ? '#22c55e'
                        : rec.percentage >= 40
                        ? '#eab308'
                        : '#ef4444',
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${rec.percentage}%` }}
                  transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* View All Link */}
      {result.factors.length > maxRecommendations && (
        <Link
          href="/budget-app/reports"
          className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          View all factors
          <ChevronRight className="h-4 w-4" />
        </Link>
      )}
    </motion.div>
  );
}

export default RecommendationsPanel;
