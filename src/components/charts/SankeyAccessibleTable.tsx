"use client";

/**
 * Sankey Accessible Table Component (S-030)
 * Data table alternative to Sankey diagram for screen readers.
 */

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { useSeniorsMode } from "@/hooks/useSeniorsMode";
import {
  type SankeyData,
  type SankeyNode,
  type SankeyLink,
  formatCurrency,
  calculatePercentage,
} from "@/lib/charts/sankey-utils";

interface SankeyAccessibleTableProps {
  data: SankeyData;
  className?: string;
}

type NodeType = "income" | "category" | "subcategory" | "savings";

interface FlowRow {
  source: string;
  sourceType: NodeType;
  target: string;
  targetType: NodeType;
  amount: number;
  percentage: number;
}

export function SankeyAccessibleTable({ data, className }: SankeyAccessibleTableProps) {
  const { isSeniorsMode } = useSeniorsMode();

  // Transform links into table rows
  const flowRows = useMemo((): FlowRow[] => {
    const nodeMap = new Map(data.nodes.map((n) => [n.id, n]));

    return data.links
      .map((link) => {
        const sourceNode = nodeMap.get(
          typeof link.source === "string" ? link.source : (link.source as SankeyNode).id
        );
        const targetNode = nodeMap.get(
          typeof link.target === "string" ? link.target : (link.target as SankeyNode).id
        );

        if (!sourceNode || !targetNode) return null;

        return {
          source: sourceNode.name,
          sourceType: sourceNode.type,
          target: targetNode.name,
          targetType: targetNode.type,
          amount: link.value,
          percentage: calculatePercentage(link.value, data.totalIncome),
        };
      })
      .filter((row): row is FlowRow => row !== null)
      .sort((a, b) => b.amount - a.amount);
  }, [data]);

  // Group nodes by type for summary
  const nodesByType = useMemo(() => {
    const groups: Record<string, SankeyNode[]> = {
      income: [],
      category: [],
      subcategory: [],
      savings: [],
    };

    data.nodes.forEach((node) => {
      if (groups[node.type]) {
        groups[node.type].push(node);
      }
    });

    // Sort each group by value
    Object.values(groups).forEach((nodes) => {
      nodes.sort((a, b) => (b.value || 0) - (a.value || 0));
    });

    return groups;
  }, [data.nodes]);

  const getTypeLabel = (type: string): string => {
    switch (type) {
      case "income":
        return "Income Source";
      case "category":
        return "Expense Category";
      case "subcategory":
        return "Subcategory";
      case "savings":
        return "Savings";
      default:
        return type;
    }
  };

  return (
    <div className={cn("space-y-6", className)} role="region" aria-label="Money flow data tables">
      {/* Summary Section */}
      <div className="rounded-lg border border-white/10 bg-slate-800/50 p-4">
        <h3
          className={cn("mb-3 font-semibold text-white", isSeniorsMode ? "text-xl" : "text-lg")}
          id="flow-summary-heading"
        >
          Financial Summary
        </h3>
        <dl
          className="grid grid-cols-1 gap-4 sm:grid-cols-3"
          aria-labelledby="flow-summary-heading"
        >
          <div className="rounded-lg bg-green-500/10 p-3 text-center">
            <dt className="text-sm text-slate-400">Total Income</dt>
            <dd className={cn("font-bold text-green-400", isSeniorsMode ? "text-2xl" : "text-xl")}>
              {formatCurrency(data.totalIncome)}
            </dd>
          </div>
          <div className="rounded-lg bg-red-500/10 p-3 text-center">
            <dt className="text-sm text-slate-400">Total Expenses</dt>
            <dd className={cn("font-bold text-red-400", isSeniorsMode ? "text-2xl" : "text-xl")}>
              {formatCurrency(data.totalExpenses)}
            </dd>
          </div>
          <div className="rounded-lg bg-teal-500/10 p-3 text-center">
            <dt className="text-sm text-slate-400">Net Savings</dt>
            <dd
              className={cn(
                "font-bold",
                data.netSavings >= 0 ? "text-teal-400" : "text-red-400",
                isSeniorsMode ? "text-2xl" : "text-xl"
              )}
            >
              {formatCurrency(data.netSavings)}
            </dd>
          </div>
        </dl>
      </div>

      {/* Income Sources Table */}
      {nodesByType.income.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-white/10 bg-slate-800/50">
          <h3
            className={cn(
              "border-b border-white/10 bg-green-500/10 p-4 font-semibold text-white",
              isSeniorsMode ? "text-lg" : "text-base"
            )}
            id="income-sources-heading"
          >
            Income Sources
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full" aria-labelledby="income-sources-heading">
              <thead>
                <tr className="border-b border-white/10">
                  <th
                    scope="col"
                    className={cn(
                      "px-4 py-3 text-left font-medium text-slate-400",
                      isSeniorsMode ? "text-base" : "text-sm"
                    )}
                  >
                    Source
                  </th>
                  <th
                    scope="col"
                    className={cn(
                      "px-4 py-3 text-right font-medium text-slate-400",
                      isSeniorsMode ? "text-base" : "text-sm"
                    )}
                  >
                    Amount
                  </th>
                  <th
                    scope="col"
                    className={cn(
                      "px-4 py-3 text-right font-medium text-slate-400",
                      isSeniorsMode ? "text-base" : "text-sm"
                    )}
                  >
                    % of Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {nodesByType.income.map((node) => (
                  <tr key={node.id} className="border-b border-white/5 hover:bg-white/5">
                    <td
                      className={cn(
                        "px-4 py-3 text-white",
                        isSeniorsMode ? "text-lg" : "text-base"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: node.color }}
                          aria-hidden="true"
                        />
                        {node.name}
                      </div>
                    </td>
                    <td
                      className={cn(
                        "px-4 py-3 text-right font-medium text-green-400",
                        isSeniorsMode ? "text-lg" : "text-base"
                      )}
                    >
                      {formatCurrency(node.value || 0)}
                    </td>
                    <td
                      className={cn(
                        "px-4 py-3 text-right text-slate-400",
                        isSeniorsMode ? "text-lg" : "text-base"
                      )}
                    >
                      {calculatePercentage(node.value || 0, data.totalIncome).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Expense Categories Table */}
      {nodesByType.category.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-white/10 bg-slate-800/50">
          <h3
            className={cn(
              "border-b border-white/10 bg-red-500/10 p-4 font-semibold text-white",
              isSeniorsMode ? "text-lg" : "text-base"
            )}
            id="expense-categories-heading"
          >
            Expense Categories
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full" aria-labelledby="expense-categories-heading">
              <thead>
                <tr className="border-b border-white/10">
                  <th
                    scope="col"
                    className={cn(
                      "px-4 py-3 text-left font-medium text-slate-400",
                      isSeniorsMode ? "text-base" : "text-sm"
                    )}
                  >
                    Category
                  </th>
                  <th
                    scope="col"
                    className={cn(
                      "px-4 py-3 text-right font-medium text-slate-400",
                      isSeniorsMode ? "text-base" : "text-sm"
                    )}
                  >
                    Amount
                  </th>
                  <th
                    scope="col"
                    className={cn(
                      "px-4 py-3 text-right font-medium text-slate-400",
                      isSeniorsMode ? "text-base" : "text-sm"
                    )}
                  >
                    % of Expenses
                  </th>
                  <th
                    scope="col"
                    className={cn(
                      "px-4 py-3 text-right font-medium text-slate-400",
                      isSeniorsMode ? "text-base" : "text-sm"
                    )}
                  >
                    % of Income
                  </th>
                </tr>
              </thead>
              <tbody>
                {nodesByType.category.map((node) => (
                  <tr key={node.id} className="border-b border-white/5 hover:bg-white/5">
                    <td
                      className={cn(
                        "px-4 py-3 text-white",
                        isSeniorsMode ? "text-lg" : "text-base"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: node.color }}
                          aria-hidden="true"
                        />
                        {node.name}
                      </div>
                    </td>
                    <td
                      className={cn(
                        "px-4 py-3 text-right font-medium text-red-400",
                        isSeniorsMode ? "text-lg" : "text-base"
                      )}
                    >
                      {formatCurrency(node.value || 0)}
                    </td>
                    <td
                      className={cn(
                        "px-4 py-3 text-right text-slate-400",
                        isSeniorsMode ? "text-lg" : "text-base"
                      )}
                    >
                      {calculatePercentage(node.value || 0, data.totalExpenses).toFixed(1)}%
                    </td>
                    <td
                      className={cn(
                        "px-4 py-3 text-right text-slate-400",
                        isSeniorsMode ? "text-lg" : "text-base"
                      )}
                    >
                      {calculatePercentage(node.value || 0, data.totalIncome).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Money Flow Details Table */}
      {flowRows.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-white/10 bg-slate-800/50">
          <h3
            className={cn(
              "border-b border-white/10 bg-teal-500/10 p-4 font-semibold text-white",
              isSeniorsMode ? "text-lg" : "text-base"
            )}
            id="money-flow-heading"
          >
            Money Flow Details
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full" aria-labelledby="money-flow-heading">
              <thead>
                <tr className="border-b border-white/10">
                  <th
                    scope="col"
                    className={cn(
                      "px-4 py-3 text-left font-medium text-slate-400",
                      isSeniorsMode ? "text-base" : "text-sm"
                    )}
                  >
                    From
                  </th>
                  <th
                    scope="col"
                    className={cn(
                      "px-4 py-3 text-left font-medium text-slate-400",
                      isSeniorsMode ? "text-base" : "text-sm"
                    )}
                  >
                    To
                  </th>
                  <th
                    scope="col"
                    className={cn(
                      "px-4 py-3 text-right font-medium text-slate-400",
                      isSeniorsMode ? "text-base" : "text-sm"
                    )}
                  >
                    Amount
                  </th>
                  <th
                    scope="col"
                    className={cn(
                      "px-4 py-3 text-right font-medium text-slate-400",
                      isSeniorsMode ? "text-base" : "text-sm"
                    )}
                  >
                    % of Income
                  </th>
                </tr>
              </thead>
              <tbody>
                {flowRows.slice(0, 20).map((row, index) => (
                  <tr key={index} className="border-b border-white/5 hover:bg-white/5">
                    <td
                      className={cn(
                        "px-4 py-3 text-white",
                        isSeniorsMode ? "text-lg" : "text-base"
                      )}
                    >
                      <span className="mr-1 text-sm text-slate-500">
                        ({getTypeLabel(row.sourceType)})
                      </span>
                      {row.source}
                    </td>
                    <td
                      className={cn(
                        "px-4 py-3 text-white",
                        isSeniorsMode ? "text-lg" : "text-base"
                      )}
                    >
                      <span className="mr-1 text-sm text-slate-500">
                        ({getTypeLabel(row.targetType)})
                      </span>
                      {row.target}
                    </td>
                    <td
                      className={cn(
                        "px-4 py-3 text-right font-medium text-teal-400",
                        isSeniorsMode ? "text-lg" : "text-base"
                      )}
                    >
                      {formatCurrency(row.amount)}
                    </td>
                    <td
                      className={cn(
                        "px-4 py-3 text-right text-slate-400",
                        isSeniorsMode ? "text-lg" : "text-base"
                      )}
                    >
                      {row.percentage.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {flowRows.length > 20 && (
            <p className="border-t border-white/10 p-4 text-center text-sm text-slate-500">
              Showing top 20 of {flowRows.length} money flows
            </p>
          )}
        </div>
      )}

      {/* Screen reader summary */}
      <div className="sr-only" aria-live="polite">
        This money flow visualization shows {formatCurrency(data.totalIncome)} in income flowing to{" "}
        {nodesByType.category.length} expense categories totaling{" "}
        {formatCurrency(data.totalExpenses)}, with {formatCurrency(data.netSavings)} in net savings.
      </div>
    </div>
  );
}

export default SankeyAccessibleTable;
