"use client";

/**
 * Widget Grid Component
 *
 * Responsive grid layout for dashboard widgets
 * Adapts column count based on device class
 */

import { PlaceholderWidget } from "./PlaceholderWidget";
import { AccountBalancesWidget } from "./implementations/AccountBalancesWidget";
import { BudgetProgressWidget } from "./implementations/BudgetProgressWidget";
import { IncomeVsExpensesWidget } from "./implementations/IncomeVsExpensesWidget";
import { MonthlyTrendsWidget } from "./implementations/MonthlyTrendsWidget";
import { RecentTransactionsWidget } from "./implementations/RecentTransactionsWidget";
import { SpendingByCategoryWidget } from "./implementations/SpendingByCategoryWidget";
import { UpcomingBillsWidget } from "./implementations/UpcomingBillsWidget";
import type { GridConfig, WidgetConfig } from "./types";

interface WidgetGridProps {
  widgets: WidgetConfig[];
  gridConfig: GridConfig;
}

export function WidgetGrid({ widgets, gridConfig }: WidgetGridProps) {
  // Sort widgets by order
  const sortedWidgets = [...widgets].filter((w) => w.visible).sort((a, b) => a.order - b.order);

  // Generate grid class based on columns
  const gridClass = `grid grid-cols-1 ${gridConfig.gap} ${
    gridConfig.columns === 2
      ? "md:grid-cols-2"
      : gridConfig.columns === 4
        ? "md:grid-cols-2 lg:grid-cols-4"
        : ""
  }`;

  const renderWidget = (widget: WidgetConfig) => {
    switch (widget.type) {
      case "account-balances":
        return <AccountBalancesWidget key={widget.id} config={widget} />;
      case "recent-transactions":
        return <RecentTransactionsWidget key={widget.id} config={widget} />;
      case "spending-by-category":
        return <SpendingByCategoryWidget key={widget.id} config={widget} />;
      case "budget-progress":
        return <BudgetProgressWidget key={widget.id} config={widget} />;
      case "income-vs-expenses":
        return <IncomeVsExpensesWidget key={widget.id} config={widget} />;
      case "monthly-trends":
        return <MonthlyTrendsWidget key={widget.id} config={widget} />;
      case "upcoming-bills":
        return <UpcomingBillsWidget key={widget.id} config={widget} />;
      default:
        return (
          <PlaceholderWidget key={widget.id} config={widget} showBorders={gridConfig.showBorders} />
        );
    }
  };

  return <div id="dashboard-widgets" className={gridClass}>{sortedWidgets.map((widget) => renderWidget(widget))}</div>;
}
