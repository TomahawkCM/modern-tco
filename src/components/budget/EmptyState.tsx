/**
 * EmptyState Component
 * Reusable empty state with icon, heading, description, and CTAs
 * Based on dashboard welcome screen pattern
 *
 * Features:
 * - Customizable icon from Lucide React
 * - Clear heading and description text
 * - Primary and secondary CTA buttons
 * - Consistent styling with Budget App design
 * - WCAG 2.2 AA compliant (48px touch targets)
 */

'use client';

import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CTAButton {
  label: string;
  href: string;
  icon?: LucideIcon;
  variant?: 'primary' | 'secondary';
}

interface EmptyStateProps {
  icon: LucideIcon;
  heading: string;
  description: string;
  primaryCTA?: CTAButton;
  secondaryCTA?: CTAButton;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  heading,
  description,
  primaryCTA,
  secondaryCTA,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`text-center py-20 ${className}`}>
      <div className="max-w-md mx-auto">
        {/* Icon */}
        <div className="bg-teal-500 rounded-full w-24 h-24 flex items-center justify-center mx-auto shadow-lg">
          <Icon className="w-12 h-12 text-white" aria-hidden="true" />
        </div>

        {/* Heading */}
        <h2 className="mt-8 text-3xl font-bold text-gray-900">
          {heading}
        </h2>

        {/* Description */}
        <p className="mt-4 text-lg text-gray-600 max-w-lg mx-auto">
          {description}
        </p>

        {/* CTA Buttons */}
        {(primaryCTA || secondaryCTA) && (
          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
            {primaryCTA && (
              <Link
                href={primaryCTA.href}
                className="inline-flex items-center justify-center gap-2 px-6 py-2 min-h-[48px] bg-teal-700 text-white rounded-lg hover:bg-teal-800 transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-teal-700 focus:ring-offset-2"
              >
                {primaryCTA.icon && <primaryCTA.icon className="w-5 h-5" aria-hidden="true" />}
                {primaryCTA.label}
              </Link>
            )}

            {secondaryCTA && (
              <Link
                href={secondaryCTA.href}
                className="inline-flex items-center justify-center gap-2 px-6 py-2 min-h-[48px] border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              >
                {secondaryCTA.icon && <secondaryCTA.icon className="w-5 h-5" aria-hidden="true" />}
                {secondaryCTA.label}
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Section-specific empty states with predefined messaging
 * Use these for common Budget App sections
 */

import {
  Receipt,
  PieChart,
  CreditCard,
  Wallet,
  Target,
  TrendingUp,
  BarChart3,
  Tags,
  PiggyBank
} from 'lucide-react';

export const EmptyStates = {
  Transactions: ({
    onAddClick,
  }: {
    onAddClick?: () => void;
  }) => (
    <EmptyState
      icon={Receipt}
      heading="No Transactions Yet"
      description="Start tracking your spending by adding your first transaction. You can add manually or import from a CSV file."
      primaryCTA={{
        label: 'Add Transaction',
        href: '/budget-app/transactions',
        icon: Receipt,
      }}
      secondaryCTA={{
        label: 'Import CSV',
        href: '/budget-app/import',
      }}
    />
  ),

  Budgets: () => (
    <EmptyState
      icon={PieChart}
      heading="No Budgets Created"
      description="Create budgets to track spending in different categories and achieve your financial goals."
      primaryCTA={{
        label: 'Create Your First Budget',
        href: '/budget-app/budgets',
        icon: PieChart,
      }}
    />
  ),

  Loans: () => (
    <EmptyState
      icon={CreditCard}
      heading="No Loans Tracked"
      description="Track your loans, mortgages, and debts to visualize payoff progress and plan payments."
      primaryCTA={{
        label: 'Add Your First Loan',
        href: '/budget-app/loans/new',
        icon: CreditCard,
      }}
    />
  ),

  Investments: () => (
    <EmptyState
      icon={Wallet}
      heading="No Investments Tracked"
      description="Track your investment accounts and holdings to monitor portfolio performance and net worth."
      primaryCTA={{
        label: 'Add Investment Account',
        href: '/budget-app/investments',
        icon: Wallet,
      }}
    />
  ),

  FuturePlans: () => (
    <EmptyState
      icon={Target}
      heading="No Future Plans"
      description="Set financial goals like buying a house, saving for education, or planning a vacation."
      primaryCTA={{
        label: 'Create a Goal',
        href: '/budget-app/planning/future',
        icon: Target,
      }}
    />
  ),

  Retirement: () => (
    <EmptyState
      icon={TrendingUp}
      heading="No Retirement Plans"
      description="Plan for retirement by tracking accounts, estimating needs, and visualizing your retirement timeline."
      primaryCTA={{
        label: 'Start Planning',
        href: '/budget-app/planning/retirement',
        icon: TrendingUp,
      }}
    />
  ),

  Reports: () => (
    <EmptyState
      icon={BarChart3}
      heading="No Data to Report"
      description="Add transactions and budgets to generate insightful reports about your spending patterns and trends."
      primaryCTA={{
        label: 'Add Transactions',
        href: '/budget-app/transactions',
        icon: Receipt,
      }}
      secondaryCTA={{
        label: 'Import CSV',
        href: '/budget-app/import',
      }}
    />
  ),

  Categories: () => (
    <EmptyState
      icon={Tags}
      heading="No Custom Categories"
      description="Create custom categories to organize your transactions beyond the default ones."
      primaryCTA={{
        label: 'Add Category',
        href: '/budget-app/categories',
        icon: Tags,
      }}
    />
  ),

  Dashboard: () => (
    <EmptyState
      icon={PiggyBank}
      heading="Welcome to Your Budget App!"
      description="Get started by importing your bank transactions or adding accounts manually to see your financial overview."
      primaryCTA={{
        label: 'Import CSV',
        href: '/budget-app/import',
      }}
      secondaryCTA={{
        label: 'Add Transaction',
        href: '/budget-app/transactions',
      }}
    />
  ),
};
