/**
 * Sankey Diagram Utilities
 * Data transformation and aggregation for Sankey visualizations.
 */

import type { Transaction, Category } from '@/types/budget';

/**
 * Sankey node type
 */
export interface SankeyNode {
  id: string;
  name: string;
  type: 'income' | 'category' | 'subcategory' | 'savings';
  color?: string;
  value?: number;
}

/**
 * Sankey link (money flow between nodes)
 */
export interface SankeyLink {
  source: string;
  target: string;
  value: number;
}

/**
 * Complete Sankey data structure for d3-sankey
 */
export interface SankeyData {
  nodes: SankeyNode[];
  links: SankeyLink[];
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
}

/**
 * Date range filter options
 */
export interface DateRange {
  start: Date;
  end: Date;
}

/**
 * Filter transactions by date range
 */
export function filterByDateRange(
  transactions: Transaction[],
  range: DateRange
): Transaction[] {
  return transactions.filter((tx) => {
    const txDate = new Date(tx.date);
    return txDate >= range.start && txDate <= range.end;
  });
}

/**
 * Aggregate transactions by category
 */
export function aggregateByCategory(
  transactions: Transaction[],
  categories: Category[]
): Map<string, { amount: number; subcategories: Map<string, number> }> {
  const categoryMap = new Map<
    string,
    { amount: number; subcategories: Map<string, number> }
  >();

  for (const tx of transactions) {
    if (!tx.category || tx.amount >= 0) continue; // Skip income and uncategorized

    const categoryName = tx.category;
    const subcategoryName = tx.subcategory || 'Other';
    const amount = Math.abs(tx.amount);

    if (!categoryMap.has(categoryName)) {
      categoryMap.set(categoryName, { amount: 0, subcategories: new Map() });
    }

    const cat = categoryMap.get(categoryName)!;
    cat.amount += amount;

    const currentSubAmount = cat.subcategories.get(subcategoryName) || 0;
    cat.subcategories.set(subcategoryName, currentSubAmount + amount);
  }

  return categoryMap;
}

/**
 * Get income sources from transactions
 */
export function aggregateIncome(
  transactions: Transaction[]
): Map<string, number> {
  const incomeMap = new Map<string, number>();

  for (const tx of transactions) {
    if (tx.amount <= 0) continue; // Skip expenses

    const source = tx.category || 'Other Income';
    const currentAmount = incomeMap.get(source) || 0;
    incomeMap.set(source, currentAmount + tx.amount);
  }

  return incomeMap;
}

/**
 * Transform transactions into Sankey diagram data
 */
export function transformToSankeyData(
  transactions: Transaction[],
  categories: Category[],
  dateRange?: DateRange
): SankeyData {
  // Filter by date range if provided
  const filteredTx = dateRange
    ? filterByDateRange(transactions, dateRange)
    : transactions;

  // Build category lookup for colors
  const categoryLookup = new Map(categories.map((c) => [c.name, c]));

  // Aggregate data
  const incomeBySource = aggregateIncome(filteredTx);
  const expensesByCategory = aggregateByCategory(filteredTx, categories);

  // Calculate totals
  let totalIncome = 0;
  incomeBySource.forEach((amount) => (totalIncome += amount));

  let totalExpenses = 0;
  expensesByCategory.forEach((cat) => (totalExpenses += cat.amount));

  const netSavings = totalIncome - totalExpenses;

  // Build nodes
  const nodes: SankeyNode[] = [];
  const nodeIdSet = new Set<string>();

  // Add income source nodes
  incomeBySource.forEach((amount, source) => {
    const id = `income-${source}`;
    if (!nodeIdSet.has(id)) {
      nodes.push({
        id,
        name: source,
        type: 'income',
        color: '#22c55e', // green
        value: amount,
      });
      nodeIdSet.add(id);
    }
  });

  // Add category nodes
  expensesByCategory.forEach((cat, categoryName) => {
    const categoryData = categoryLookup.get(categoryName);
    const id = `category-${categoryName}`;
    if (!nodeIdSet.has(id)) {
      nodes.push({
        id,
        name: categoryName,
        type: 'category',
        color: categoryData?.color || '#64748b',
        value: cat.amount,
      });
      nodeIdSet.add(id);
    }

    // Add subcategory nodes
    cat.subcategories.forEach((amount, subName) => {
      const subId = `subcategory-${categoryName}-${subName}`;
      if (!nodeIdSet.has(subId)) {
        nodes.push({
          id: subId,
          name: subName,
          type: 'subcategory',
          color: categoryData?.color || '#64748b',
          value: amount,
        });
        nodeIdSet.add(subId);
      }
    });
  });

  // Add savings node if positive
  if (netSavings > 0) {
    nodes.push({
      id: 'savings',
      name: 'Savings',
      type: 'savings',
      color: '#14b8a6', // teal
      value: netSavings,
    });
    nodeIdSet.add('savings');
  }

  // Build links
  const links: SankeyLink[] = [];

  // Income to categories (proportional distribution)
  if (totalIncome > 0 && totalExpenses > 0) {
    incomeBySource.forEach((incomeAmount, source) => {
      const incomeProportion = incomeAmount / totalIncome;

      // Distribute to expense categories proportionally
      expensesByCategory.forEach((cat, categoryName) => {
        const flowAmount = Math.min(
          incomeAmount * (cat.amount / totalExpenses),
          cat.amount
        );

        if (flowAmount > 0) {
          links.push({
            source: `income-${source}`,
            target: `category-${categoryName}`,
            value: flowAmount,
          });
        }
      });

      // Flow to savings
      if (netSavings > 0) {
        const savingsFlow = incomeAmount * (netSavings / totalIncome);
        if (savingsFlow > 0) {
          links.push({
            source: `income-${source}`,
            target: 'savings',
            value: savingsFlow,
          });
        }
      }
    });
  }

  // Categories to subcategories
  expensesByCategory.forEach((cat, categoryName) => {
    cat.subcategories.forEach((amount, subName) => {
      if (amount > 0) {
        links.push({
          source: `category-${categoryName}`,
          target: `subcategory-${categoryName}-${subName}`,
          value: amount,
        });
      }
    });
  });

  return {
    nodes,
    links,
    totalIncome,
    totalExpenses,
    netSavings,
  };
}

/**
 * Get predefined date ranges
 */
export function getDateRanges(): Record<string, DateRange> {
  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const thisYear = new Date(now.getFullYear(), 0, 1);
  const lastYear = new Date(now.getFullYear() - 1, 0, 1);

  return {
    thisMonth: {
      start: thisMonth,
      end: now,
    },
    lastMonth: {
      start: lastMonth,
      end: new Date(now.getFullYear(), now.getMonth(), 0),
    },
    last3Months: {
      start: new Date(now.getFullYear(), now.getMonth() - 2, 1),
      end: now,
    },
    thisYear: {
      start: thisYear,
      end: now,
    },
    lastYear: {
      start: lastYear,
      end: new Date(now.getFullYear() - 1, 11, 31),
    },
    all: {
      start: new Date(2000, 0, 1),
      end: now,
    },
  };
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

/**
 * Calculate percentage
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return (value / total) * 100;
}

/**
 * Get node by ID
 */
export function findNodeById(nodes: SankeyNode[], id: string): SankeyNode | undefined {
  return nodes.find((n) => n.id === id);
}

/**
 * Get all links connected to a node
 */
export function getConnectedLinks(
  links: SankeyLink[],
  nodeId: string
): SankeyLink[] {
  return links.filter(
    (link) => link.source === nodeId || link.target === nodeId
  );
}

/**
 * Get all nodes connected to a node (direct connections)
 */
export function getConnectedNodes(
  links: SankeyLink[],
  nodeId: string
): Set<string> {
  const connected = new Set<string>();

  links.forEach((link) => {
    if (link.source === nodeId) {
      connected.add(link.target);
    } else if (link.target === nodeId) {
      connected.add(link.source);
    }
  });

  return connected;
}
