"use client";

/**
 * Sankey Diagram Component (S-011)
 * Interactive money flow visualization using d3-sankey.
 */

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import * as d3 from "d3";
import {
  sankey,
  sankeyLinkHorizontal,
  SankeyGraph,
  type SankeyNode as D3SankeyNode,
  type SankeyLink as D3SankeyLink,
} from "d3-sankey";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSeniorsMode } from "@/hooks/useSeniorsMode";
import {
  type SankeyNode,
  type SankeyLink,
  type SankeyData,
  formatCurrency,
  calculatePercentage,
} from "@/lib/charts/sankey-utils";

interface SankeyDiagramProps {
  data: SankeyData;
  width?: number;
  height?: number;
  className?: string;
  onNodeClick?: (node: SankeyNode) => void;
}

interface TooltipData {
  x: number;
  y: number;
  content: {
    type: "node" | "link";
    title: string;
    value: number;
    percentage?: number;
    source?: string;
    target?: string;
    color?: string;
  };
}

// Extended types for d3-sankey computed values
type ComputedNode = D3SankeyNode<SankeyNode, SankeyLink> & SankeyNode;
type ComputedLink = D3SankeyLink<SankeyNode, SankeyLink> &
  SankeyLink & {
    width?: number;
  };

export function SankeyDiagram({
  data,
  width = 800,
  height = 500,
  className,
  onNodeClick,
}: SankeyDiagramProps) {
  const { isSeniorsMode } = useSeniorsMode();
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [hoveredLinkIndex, setHoveredLinkIndex] = useState<number | null>(null);

  // Configuration
  const margin = { top: 20, right: 20, bottom: 20, left: 20 };
  const nodeWidth = isSeniorsMode ? 24 : 20;
  const nodePadding = isSeniorsMode ? 16 : 12;
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Compute Sankey layout
  const sankeyLayout = useMemo(() => {
    if (!data.nodes.length || !data.links.length) return null;

    // Create node index map
    const nodeIndexMap = new Map(data.nodes.map((n, i) => [n.id, i]));

    // Convert string IDs to indices for d3-sankey
    const nodesWithIndex = data.nodes.map((node, i) => ({
      ...node,
      index: i,
    }));

    const linksWithIndex = data.links
      .map((link) => ({
        ...link,
        source: nodeIndexMap.get(link.source) ?? 0,
        target: nodeIndexMap.get(link.target) ?? 0,
      }))
      .filter((link) => link.source !== link.target); // Remove self-links

    // Create sankey generator
    const sankeyGenerator = sankey<SankeyNode, SankeyLink>()
      .nodeId((d) => d.id)
      .nodeWidth(nodeWidth)
      .nodePadding(nodePadding)
      .extent([
        [0, 0],
        [innerWidth, innerHeight],
      ]);

    try {
      // Use type assertion since d3-sankey accepts numeric indices at runtime
      const graph = sankeyGenerator({
        nodes: nodesWithIndex.map((n) => ({ ...n })),
        links: linksWithIndex as unknown as Array<D3SankeyLink<SankeyNode, SankeyLink>>,
      });
      return graph;
    } catch (error) {
      console.error("Sankey layout error:", error);
      return null;
    }
  }, [data, innerWidth, innerHeight, nodeWidth, nodePadding]);

  // Get connected node IDs for highlighting
  const getConnectedIds = useCallback(
    (nodeId: string): Set<string> => {
      const connected = new Set<string>();
      connected.add(nodeId);

      data.links.forEach((link) => {
        if (link.source === nodeId) {
          connected.add(link.target);
        } else if (link.target === nodeId) {
          connected.add(link.source);
        }
      });

      return connected;
    },
    [data.links]
  );

  // Check if link is connected to hovered node
  const isLinkConnected = useCallback(
    (link: SankeyLink): boolean => {
      if (!hoveredNodeId) return false;
      const sourceId =
        typeof link.source === "object" ? (link.source as ComputedNode).id : link.source;
      const targetId =
        typeof link.target === "object" ? (link.target as ComputedNode).id : link.target;
      return sourceId === hoveredNodeId || targetId === hoveredNodeId;
    },
    [hoveredNodeId]
  );

  // Handle node hover
  const handleNodeMouseEnter = useCallback(
    (event: React.MouseEvent, node: ComputedNode) => {
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return;

      setHoveredNodeId(node.id);
      setTooltip({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        content: {
          type: "node",
          title: node.name,
          value: node.value || 0,
          percentage:
            node.type === "category" || node.type === "subcategory"
              ? calculatePercentage(node.value || 0, data.totalExpenses)
              : node.type === "income"
                ? calculatePercentage(node.value || 0, data.totalIncome)
                : undefined,
          color: node.color,
        },
      });
    },
    [data.totalExpenses, data.totalIncome]
  );

  // Handle link hover
  const handleLinkMouseEnter = useCallback(
    (event: React.MouseEvent, link: ComputedLink, index: number) => {
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return;

      const sourceNode = link.source as ComputedNode;
      const targetNode = link.target as ComputedNode;

      setHoveredLinkIndex(index);
      setTooltip({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        content: {
          type: "link",
          title: `${sourceNode.name} → ${targetNode.name}`,
          value: link.value,
          source: sourceNode.name,
          target: targetNode.name,
          percentage: calculatePercentage(link.value, data.totalIncome),
          color: sourceNode.color,
        },
      });
    },
    [data.totalIncome]
  );

  // Handle mouse leave
  const handleMouseLeave = useCallback(() => {
    setHoveredNodeId(null);
    setHoveredLinkIndex(null);
    setTooltip(null);
  }, []);

  // Get node opacity based on hover state
  const getNodeOpacity = useCallback(
    (node: ComputedNode): number => {
      if (!hoveredNodeId) return 1;
      const connected = getConnectedIds(hoveredNodeId);
      return connected.has(node.id) ? 1 : 0.2;
    },
    [hoveredNodeId, getConnectedIds]
  );

  // Get link opacity based on hover state
  const getLinkOpacity = useCallback(
    (link: ComputedLink, index: number): number => {
      if (hoveredLinkIndex === index) return 0.8;
      if (hoveredNodeId) {
        return isLinkConnected(link) ? 0.6 : 0.1;
      }
      return 0.4;
    },
    [hoveredNodeId, hoveredLinkIndex, isLinkConnected]
  );

  if (!sankeyLayout?.nodes.length) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-xl border border-white/10 bg-slate-800/50",
          className
        )}
        style={{ width, height }}
      >
        <p className="text-slate-400">No data available for visualization</p>
      </div>
    );
  }

  const computedNodes = sankeyLayout.nodes as ComputedNode[];
  const computedLinks = sankeyLayout.links as ComputedLink[];

  return (
    <div className={cn("relative", className)}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="overflow-visible"
        onMouseLeave={handleMouseLeave}
      >
        <g transform={`translate(${margin.left},${margin.top})`}>
          {/* Links */}
          <g className="links">
            {computedLinks.map((link, i) => {
              const path = sankeyLinkHorizontal()(link as any);
              if (!path) return null;

              const sourceNode = link.source as ComputedNode;

              return (
                <path
                  key={i}
                  d={path}
                  fill="none"
                  stroke={sourceNode.color || "#64748b"}
                  strokeWidth={Math.max(1, link.width || 1)}
                  strokeOpacity={getLinkOpacity(link, i)}
                  className="cursor-pointer transition-all duration-200"
                  onMouseEnter={(e) => handleLinkMouseEnter(e, link, i)}
                  onMouseLeave={handleMouseLeave}
                />
              );
            })}
          </g>

          {/* Nodes */}
          <g className="nodes">
            {computedNodes.map((node) => {
              const nodeHeight = (node.y1 || 0) - (node.y0 || 0);
              if (nodeHeight <= 0) return null;

              return (
                <g
                  key={node.id}
                  className="cursor-pointer"
                  onClick={() => onNodeClick?.(node)}
                  onMouseEnter={(e) => handleNodeMouseEnter(e, node)}
                  onMouseLeave={handleMouseLeave}
                >
                  {/* Node rectangle */}
                  <rect
                    x={node.x0}
                    y={node.y0}
                    width={(node.x1 || 0) - (node.x0 || 0)}
                    height={nodeHeight}
                    fill={node.color || "#64748b"}
                    opacity={getNodeOpacity(node)}
                    rx={4}
                    className="transition-all duration-200"
                  />

                  {/* Node label */}
                  {nodeHeight > 20 && (
                    <text
                      x={node.type === "income" ? (node.x0 || 0) - 6 : (node.x1 || 0) + 6}
                      y={(node.y0 || 0) + nodeHeight / 2}
                      dy="0.35em"
                      textAnchor={node.type === "income" ? "end" : "start"}
                      fill="white"
                      fontSize={isSeniorsMode ? 14 : 12}
                      opacity={getNodeOpacity(node)}
                      className="pointer-events-none font-medium transition-all duration-200"
                    >
                      {node.name}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        </g>
      </svg>

      {/* Tooltip */}
      <AnimatePresence>
        {tooltip && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="pointer-events-none absolute z-50 rounded-lg border border-white/10 bg-slate-800 px-3 py-2 shadow-xl"
            style={{
              left: tooltip.x + 10,
              top: tooltip.y - 10,
              transform: "translateY(-100%)",
            }}
          >
            <div className="mb-1 flex items-center gap-2">
              {tooltip.content.color && (
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: tooltip.content.color }}
                />
              )}
              <span className={cn("font-medium text-white", isSeniorsMode && "text-lg")}>
                {tooltip.content.title}
              </span>
            </div>
            <div className="text-sm text-slate-300">
              {formatCurrency(tooltip.content.value)}
              {tooltip.content.percentage !== undefined && (
                <span className="ml-2 text-slate-400">
                  ({tooltip.content.percentage.toFixed(1)}%)
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 flex gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
          <span>Income</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-slate-500" />
          <span>Expenses</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-teal-500" />
          <span>Savings</span>
        </div>
      </div>
    </div>
  );
}

export default SankeyDiagram;
