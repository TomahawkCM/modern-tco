/**
 * Widget Registry
 *
 * Central registry of all available dashboard widgets
 * Each widget has metadata, default configuration, and rendering requirements
 */

import type { WidgetDefinition } from './types';

/**
 * Widget Definitions Array (7 widgets)
 * Defines all available widgets for the dashboard system
 */
export const WIDGET_DEFINITIONS: WidgetDefinition[] = [
  {
    type: 'spending-by-category',
    title: 'widget.spendingByCategory.title',
    description: 'widget.spendingByCategory.description',
    icon: 'PieChart',
    defaultSize: 'medium',
    minSize: 'small',
    maxSize: 'large',
    requiresData: true,
    tags: ['spending', 'categories', 'analysis', 'popular'],
  },
  {
    type: 'recent-transactions',
    title: 'widget.recentTransactions.title',
    description: 'widget.recentTransactions.description',
    icon: 'Receipt',
    defaultSize: 'large',
    minSize: 'medium',
    maxSize: 'large',
    requiresData: true,
    tags: ['transactions', 'recent', 'list', 'popular'],
  },
  {
    type: 'budget-progress',
    title: 'widget.budgetProgress.title',
    description: 'widget.budgetProgress.description',
    icon: 'TrendingUp',
    defaultSize: 'medium',
    minSize: 'small',
    maxSize: 'large',
    requiresData: true,
    tags: ['budget', 'progress', 'goals', 'popular'],
  },
  {
    type: 'account-balances',
    title: 'widget.accountBalances.title',
    description: 'widget.accountBalances.description',
    icon: 'Wallet',
    defaultSize: 'medium',
    minSize: 'small',
    maxSize: 'medium',
    requiresData: true,
    tags: ['accounts', 'balance', 'summary'],
  },
  {
    type: 'income-vs-expenses',
    title: 'widget.incomeVsExpenses.title',
    description: 'widget.incomeVsExpenses.description',
    icon: 'BarChart3',
    defaultSize: 'medium',
    minSize: 'small',
    maxSize: 'large',
    requiresData: true,
    tags: ['income', 'expenses', 'comparison', 'analysis'],
  },
  {
    type: 'monthly-trends',
    title: 'widget.monthlyTrends.title',
    description: 'widget.monthlyTrends.description',
    icon: 'LineChart',
    defaultSize: 'large',
    minSize: 'medium',
    maxSize: 'large',
    requiresData: true,
    tags: ['trends', 'monthly', 'analysis', 'charts'],
  },
  {
    type: 'upcoming-bills',
    title: 'widget.upcomingBills.title',
    description: 'widget.upcomingBills.description',
    icon: 'Calendar',
    defaultSize: 'small',
    minSize: 'small',
    maxSize: 'medium',
    requiresData: false,
    tags: ['bills', 'upcoming', 'reminders'],
  },
];

/**
 * Get widget definition by type
 */
export function getWidgetDefinition(type: string): WidgetDefinition | undefined {
  return WIDGET_DEFINITIONS.find((def) => def.type === type);
}

/**
 * Get all widget definitions with optional tag filter
 */
export function getWidgetDefinitions(tag?: string): WidgetDefinition[] {
  if (!tag) return WIDGET_DEFINITIONS;
  return WIDGET_DEFINITIONS.filter((def) => def.tags.includes(tag));
}

/**
 * Get popular widgets (tagged as 'popular')
 */
export function getPopularWidgets(): WidgetDefinition[] {
  return getWidgetDefinitions('popular');
}
