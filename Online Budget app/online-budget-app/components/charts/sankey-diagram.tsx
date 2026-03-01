"use client";

/**
 * Sankey / Money Flow Diagram Component
 * Simplified SVG-based flow visualization showing income sources -> categories.
 * Provides a table/list fallback view for accessibility.
 * Ported from offline app SankeyWithAccessibility — no d3-sankey dependency.
 */

import { useState, useMemo, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

/* ---------- types ---------- */

interface FlowDataPoint {
  /** Source node label (e.g., "Salary") */
  source: string;
  /** Target node label (e.g., "Housing") */
  target: string;
  /** Flow amount in display units */
  value: number;
}

interface SankeyDiagramProps {
  data: FlowDataPoint[];
  currency: string;
  formatAmount: (amt: { amountMinor: number; currency: string }) => string;
}

type ViewMode = "chart" | "table";

/* ---------- colour palette ---------- */

const PALETTE = [
  "#6366f1", // indigo
  "#f59e0b", // amber
  "#10b981", // emerald
  "#ef4444", // red
  "#8b5cf6", // violet
  "#06b6d4", // cyan
  "#f97316", // orange
  "#84cc16", // lime
  "#ec4899", // pink
  "#14b8a6", // teal
];

function getColor(index: number): string {
  return PALETTE[index % PALETTE.length] ?? "#6366f1";
}

/* ---------- layout engine ---------- */

interface LayoutNode {
  id: string;
  label: string;
  value: number;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  side: "left" | "right";
}

interface LayoutLink {
  source: LayoutNode;
  target: LayoutNode;
  value: number;
  sourceY: number;
  targetY: number;
  thickness: number;
  color: string;
}

function computeLayout(
  data: FlowDataPoint[],
  width: number,
  height: number
): { nodes: LayoutNode[]; links: LayoutLink[] } {
  if (data.length === 0) return { nodes: [], links: [] };

  const padding = { top: 10, bottom: 10, left: 10, right: 10 };
  const nodeWidth = 18;
  const nodePadding = 6;
  const innerHeight = height - padding.top - padding.bottom;

  // Collect unique sources and targets with totals
  const sourceMap = new Map<string, number>();
  const targetMap = new Map<string, number>();

  for (const d of data) {
    sourceMap.set(d.source, (sourceMap.get(d.source) ?? 0) + d.value);
    targetMap.set(d.target, (targetMap.get(d.target) ?? 0) + d.value);
  }

  // Sort by value descending
  const sources = [...sourceMap.entries()].sort((a, b) => b[1] - a[1]);
  const targets = [...targetMap.entries()].sort((a, b) => b[1] - a[1]);

  const totalSource = sources.reduce((s, [, v]) => s + v, 0);
  const totalTarget = targets.reduce((s, [, v]) => s + v, 0);

  // Compute node positions
  const leftX = padding.left;
  const rightX = width - padding.right - nodeWidth;

  // Left nodes (sources)
  const leftTotalPadding = Math.max(0, (sources.length - 1) * nodePadding);
  const leftAvailableHeight = innerHeight - leftTotalPadding;
  let leftY = padding.top;
  const leftNodes: LayoutNode[] = sources.map(([label, value], i) => {
    const h = totalSource > 0 ? (value / totalSource) * leftAvailableHeight : 0;
    const node: LayoutNode = {
      id: `source-${label}`,
      label,
      value,
      x: leftX,
      y: leftY,
      width: nodeWidth,
      height: Math.max(h, 2),
      color: getColor(i),
      side: "left",
    };
    leftY += node.height + nodePadding;
    return node;
  });

  // Right nodes (targets)
  const rightTotalPadding = Math.max(0, (targets.length - 1) * nodePadding);
  const rightAvailableHeight = innerHeight - rightTotalPadding;
  let rightY = padding.top;
  const rightNodes: LayoutNode[] = targets.map(([label, value], i) => {
    const h = totalTarget > 0 ? (value / totalTarget) * rightAvailableHeight : 0;
    const node: LayoutNode = {
      id: `target-${label}`,
      label,
      value,
      x: rightX,
      y: rightY,
      width: nodeWidth,
      height: Math.max(h, 2),
      color: getColor(sources.length + i),
      side: "right",
    };
    rightY += node.height + nodePadding;
    return node;
  });

  const nodeMap = new Map<string, LayoutNode>();
  for (const n of leftNodes) nodeMap.set(n.id, n);
  for (const n of rightNodes) nodeMap.set(n.id, n);

  // Track cumulative offsets for stacking links within each node
  const sourceOffsets = new Map<string, number>();
  const targetOffsets = new Map<string, number>();

  // Build links - sort by value descending for better visual layering
  const sortedData = [...data].sort((a, b) => b.value - a.value);
  const links: LayoutLink[] = [];

  for (const d of sortedData) {
    const sourceNode = nodeMap.get(`source-${d.source}`);
    const targetNode = nodeMap.get(`target-${d.target}`);
    if (!sourceNode || !targetNode) continue;

    // Calculate thickness proportional to node height
    const sourceThickness =
      sourceNode.value > 0 ? (d.value / sourceNode.value) * sourceNode.height : 1;
    const targetThickness =
      targetNode.value > 0 ? (d.value / targetNode.value) * targetNode.height : 1;
    const thickness = Math.max(Math.min(sourceThickness, targetThickness), 1);

    const sOffset = sourceOffsets.get(d.source) ?? 0;
    const tOffset = targetOffsets.get(d.target) ?? 0;

    links.push({
      source: sourceNode,
      target: targetNode,
      value: d.value,
      sourceY: sourceNode.y + sOffset + thickness / 2,
      targetY: targetNode.y + tOffset + thickness / 2,
      thickness,
      color: sourceNode.color,
    });

    sourceOffsets.set(d.source, sOffset + sourceThickness);
    targetOffsets.set(d.target, tOffset + targetThickness);
  }

  return { nodes: [...leftNodes, ...rightNodes], links };
}

/**
 * Generate a cubic bezier path for a Sankey link.
 */
function linkPath(link: LayoutLink, nodeWidth: number): string {
  const sx = link.source.x + nodeWidth;
  const sy = link.sourceY;
  const tx = link.target.x;
  const ty = link.targetY;
  const mx = (sx + tx) / 2;
  return `M ${sx},${sy} C ${mx},${sy} ${mx},${ty} ${tx},${ty}`;
}

/* ---------- component ---------- */

export function SankeyDiagram({ data, currency, formatAmount }: SankeyDiagramProps) {
  const t = useTranslations("reports");
  const [viewMode, setViewMode] = useState<ViewMode>("chart");
  const [hoveredLink, setHoveredLink] = useState<number | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Layout dimensions
  const svgWidth = 600;
  const svgHeight = 360;
  const nodeWidth = 18;

  const layout = useMemo(() => computeLayout(data, svgWidth, svgHeight), [data]);

  const fmt = useCallback(
    (value: number) => formatAmount({ amountMinor: Math.round(value * 100), currency }),
    [formatAmount, currency]
  );

  // Total for percentage calculations
  const total = useMemo(() => data.reduce((s, d) => s + d.value, 0), [data]);

  // Table rows sorted by value
  const tableRows = useMemo(() => [...data].sort((a, b) => b.value - a.value), [data]);

  // Check if a node is connected to the hovered node
  const isConnected = useCallback(
    (nodeId: string): boolean => {
      if (!hoveredNode) return true;
      if (nodeId === hoveredNode) return true;
      // Check links
      for (const d of data) {
        if (
          (`source-${d.source}` === hoveredNode && `target-${d.target}` === nodeId) ||
          (`target-${d.target}` === hoveredNode && `source-${d.source}` === nodeId)
        ) {
          return true;
        }
      }
      return false;
    },
    [hoveredNode, data]
  );

  const isLinkHighlighted = useCallback(
    (link: LayoutLink): boolean => {
      if (!hoveredNode) return false;
      return link.source.id === hoveredNode || link.target.id === hoveredNode;
    },
    [hoveredNode]
  );

  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="mb-2 text-lg font-semibold text-foreground">{t("sankey.title")}</h3>
        <p className="text-sm text-muted-foreground">{t("sankey.noData")}</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      {/* Header with view toggle */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">{t("sankey.title")}</h3>

        <div
          className="flex rounded-md border border-border bg-muted p-0.5"
          role="radiogroup"
          aria-label={t("sankey.viewToggle")}
        >
          <button
            onClick={() => setViewMode("chart")}
            className={cn(
              "rounded-sm px-3 py-1 text-sm transition-colors",
              viewMode === "chart"
                ? "bg-background font-medium text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
            role="radio"
            aria-checked={viewMode === "chart"}
          >
            {t("sankey.chartView")}
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={cn(
              "rounded-sm px-3 py-1 text-sm transition-colors",
              viewMode === "table"
                ? "bg-background font-medium text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
            role="radio"
            aria-checked={viewMode === "table"}
          >
            {t("sankey.tableView")}
          </button>
        </div>
      </div>

      {/* Screen reader announcement */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {viewMode === "chart" ? t("sankey.chartAnnouncement") : t("sankey.tableAnnouncement")}
      </div>

      {viewMode === "chart" ? (
        /* ---- SVG Flow Diagram ---- */
        <div className="overflow-x-auto">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full max-w-[600px]"
            role="img"
            aria-label={t("sankey.chartLabel")}
            onMouseLeave={() => {
              setHoveredNode(null);
              setHoveredLink(null);
            }}
          >
            {/* Links */}
            <g>
              {layout.links.map((link, i) => {
                const path = linkPath(link, nodeWidth);
                const highlighted = isLinkHighlighted(link);
                const dimmed = hoveredNode && !highlighted;

                return (
                  <path
                    key={i}
                    d={path}
                    fill="none"
                    stroke={link.color}
                    strokeWidth={Math.max(link.thickness, 1)}
                    strokeOpacity={
                      hoveredLink === i ? 0.8 : highlighted ? 0.6 : dimmed ? 0.08 : 0.35
                    }
                    className="cursor-pointer transition-[stroke-opacity] duration-200"
                    onMouseEnter={() => setHoveredLink(i)}
                    onMouseLeave={() => setHoveredLink(null)}
                  >
                    <title>
                      {`${link.source.label} → ${link.target.label}: ${fmt(link.value)}`}
                    </title>
                  </path>
                );
              })}
            </g>

            {/* Nodes */}
            <g>
              {layout.nodes.map((node) => {
                const connected = isConnected(node.id);
                const opacity = hoveredNode ? (connected ? 1 : 0.2) : 1;

                return (
                  <g
                    key={node.id}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredNode(node.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                  >
                    {/* Node rect */}
                    <rect
                      x={node.x}
                      y={node.y}
                      width={node.width}
                      height={node.height}
                      fill={node.color}
                      rx={3}
                      opacity={opacity}
                      className="transition-opacity duration-200"
                    >
                      <title>{`${node.label}: ${fmt(node.value)}`}</title>
                    </rect>

                    {/* Node label */}
                    {node.height > 12 && (
                      <text
                        x={node.side === "left" ? node.x - 4 : node.x + node.width + 4}
                        y={node.y + node.height / 2}
                        dy="0.35em"
                        textAnchor={node.side === "left" ? "end" : "start"}
                        className="fill-foreground text-[11px] font-medium transition-opacity duration-200"
                        opacity={opacity}
                      >
                        {node.label}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          </svg>

          {/* Legend */}
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span>{t("sankey.legendIncome")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
              <span>{t("sankey.legendExpenses")}</span>
            </div>
          </div>
        </div>
      ) : (
        /* ---- Accessible Table View ---- */
        <div className="overflow-x-auto" role="region" aria-label={t("sankey.tableLabel")}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th scope="col" className="px-3 py-2 text-left font-medium text-muted-foreground">
                  {t("sankey.colFrom")}
                </th>
                <th scope="col" className="px-3 py-2 text-left font-medium text-muted-foreground">
                  {t("sankey.colTo")}
                </th>
                <th scope="col" className="px-3 py-2 text-right font-medium text-muted-foreground">
                  {t("sankey.colAmount")}
                </th>
                <th scope="col" className="px-3 py-2 text-right font-medium text-muted-foreground">
                  {t("sankey.colPercent")}
                </th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row, i) => (
                <tr key={i} className="border-b border-border/50 hover:bg-muted/50">
                  <td className="px-3 py-2 text-foreground">{row.source}</td>
                  <td className="px-3 py-2 text-foreground">{row.target}</td>
                  <td className="px-3 py-2 text-right font-medium text-foreground">
                    {fmt(row.value)}
                  </td>
                  <td className="px-3 py-2 text-right text-muted-foreground">
                    {total > 0 ? ((row.value / total) * 100).toFixed(1) : "0.0"}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Hint */}
      <p className="mt-4 text-center text-xs text-muted-foreground" aria-hidden="true">
        {viewMode === "chart" ? t("sankey.chartHint") : t("sankey.tableHint")}
      </p>

      {/* Screen reader summary */}
      <div className="sr-only" aria-live="polite">
        {t("sankey.srSummary", {
          flows: data.length,
          total: fmt(total),
        })}
      </div>
    </div>
  );
}
