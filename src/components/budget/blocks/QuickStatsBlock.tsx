'use client';

import { useTranslations } from 'next-intl';
import {
  WalletIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  PiggyBankIcon,
} from 'lucide-react';

import { StatCard } from '@/components/budget/StatCard';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export interface QuickStatsBlockProps {
  /** Total balance formatted as currency string */
  balance: string;
  /** Income this month formatted as currency string */
  income: string;
  /** Expenses this month formatted as currency string */
  expenses: string;
  /** Savings rate as a percentage number */
  savingsRate: number;
  /** Optional trends as percentage changes */
  trends?: {
    balance?: number;
    income?: number;
    expenses?: number;
    savingsRate?: number;
  };
  /** Loading state */
  isLoading?: boolean;
  className?: string;
}

export function QuickStatsBlock({
  balance,
  income,
  expenses,
  savingsRate,
  trends,
  isLoading = false,
  className,
}: QuickStatsBlockProps) {
  const t = useTranslations('budget.quickStats');

  if (isLoading) {
    return (
      <div className={cn('grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4', className)}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[100px] w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className={cn('grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4', className)}>
      <StatCard
        label={t('balance')}
        value={balance}
        icon={WalletIcon}
        variant="info"
        trend={trends?.balance}
      />
      <StatCard
        label={t('income')}
        value={income}
        icon={TrendingUpIcon}
        variant="success"
        trend={trends?.income}
      />
      <StatCard
        label={t('expenses')}
        value={expenses}
        icon={TrendingDownIcon}
        variant="danger"
        trend={trends?.expenses}
      />
      <StatCard
        label={t('savingsRate')}
        value={`${savingsRate}%`}
        icon={PiggyBankIcon}
        variant={savingsRate >= 20 ? 'success' : savingsRate >= 10 ? 'warning' : 'danger'}
        trend={trends?.savingsRate}
        description={t('savingsRateDescription')}
      />
    </div>
  );
}

export type { QuickStatsBlockProps as QuickStatsBlockComponentProps };
