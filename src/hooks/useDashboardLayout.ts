/**
 * useDashboardLayout Hook
 *
 * Manages dashboard widget visibility and order with localStorage persistence.
 * Provides drag-and-drop reordering and show/hide functionality for dashboard widgets.
 *
 * Features:
 * - Widget visibility toggles
 * - Drag-and-drop reordering
 * - localStorage persistence
 * - Sensible defaults for first-time users
 */

import { useState, useEffect } from 'react';

export interface DashboardWidget {
  id: string;
  name: string;
  description: string;
  visible: boolean;
  order: number;
  isAlwaysVisible?: boolean; // Metric cards should always be visible
}

const DEFAULT_WIDGETS: DashboardWidget[] = [
  {
    id: 'metric-cards',
    name: 'Metric Cards',
    description: 'Net Worth, Income, Expenses, and Savings overview',
    visible: true,
    order: 0,
    isAlwaysVisible: true,
  },
  {
    id: 'spending-category',
    name: 'Spending by Category',
    description: 'Pie chart showing spending breakdown by category',
    visible: true,
    order: 1,
  },
  {
    id: 'income-expense-trend',
    name: 'Income vs Expenses',
    description: '6-month trend chart comparing income and expenses',
    visible: true,
    order: 2,
  },
  {
    id: 'recent-activity',
    name: 'Recent Activity',
    description: 'Latest transactions across all accounts',
    visible: true,
    order: 3,
  },
  {
    id: 'budget-status',
    name: 'Budget Status',
    description: 'Progress bars showing budget consumption',
    visible: true,
    order: 4,
  },
  {
    id: 'spending-insights',
    name: 'Spending Insights',
    description: 'AI-powered insights about spending patterns',
    visible: true,
    order: 5,
  },
  {
    id: 'recurring-transactions',
    name: 'Recurring Transactions',
    description: 'Detected recurring payment patterns',
    visible: true,
    order: 6,
  },
  {
    id: 'anomaly-alerts',
    name: 'Unusual Spending',
    description: 'Alerts for transactions that appear unusual',
    visible: true,
    order: 7,
  },
  {
    id: 'debt-overview',
    name: 'Debt Overview',
    description: 'Summary of all loans and debts',
    visible: true,
    order: 8,
  },
  {
    id: 'quick-actions',
    name: 'Quick Actions',
    description: 'Shortcuts to common tasks',
    visible: true,
    order: 9,
  },
];

const STORAGE_KEY = 'budget-app-dashboard-layout';

export function useDashboardLayout() {
  const [widgets, setWidgets] = useState<DashboardWidget[]>(DEFAULT_WIDGETS);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedWidgets: DashboardWidget[] = JSON.parse(stored);

        // Merge with defaults to ensure new widgets are added
        const mergedWidgets = DEFAULT_WIDGETS.map((defaultWidget) => {
          const stored = parsedWidgets.find((w) => w.id === defaultWidget.id);
          return stored ? { ...defaultWidget, ...stored } : defaultWidget;
        });

        // Sort by order
        mergedWidgets.sort((a, b) => a.order - b.order);
        setWidgets(mergedWidgets);
      }
    } catch (error) {
      console.error('Error loading dashboard layout:', error);
      // Fall back to defaults
      setWidgets(DEFAULT_WIDGETS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save to localStorage whenever widgets change
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(widgets));
      } catch (error) {
        console.error('Error saving dashboard layout:', error);
      }
    }
  }, [widgets, isLoading]);

  // Toggle widget visibility
  const toggleWidget = (widgetId: string) => {
    setWidgets((prev) =>
      prev.map((widget) =>
        widget.id === widgetId && !widget.isAlwaysVisible
          ? { ...widget, visible: !widget.visible }
          : widget
      )
    );
  };

  // Reorder widgets (for drag-and-drop)
  const reorderWidgets = (newOrder: DashboardWidget[]) => {
    const reordered = newOrder.map((widget, index) => ({
      ...widget,
      order: index,
    }));
    setWidgets(reordered);
  };

  // Reset to defaults
  const resetToDefaults = () => {
    setWidgets(DEFAULT_WIDGETS);
    localStorage.removeItem(STORAGE_KEY);
  };

  // Get visible widgets in order
  const visibleWidgets = widgets
    .filter((w) => w.visible)
    .sort((a, b) => a.order - b.order);

  return {
    widgets,
    visibleWidgets,
    isLoading,
    toggleWidget,
    reorderWidgets,
    resetToDefaults,
  };
}
