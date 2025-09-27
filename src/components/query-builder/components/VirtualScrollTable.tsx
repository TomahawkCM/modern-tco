"use client";

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown, Database, AlertCircle } from 'lucide-react';
import { getVisibleItems } from '../utils/performance';

interface VirtualScrollTableProps {
  data: Record<string, any>[];
  columns: Array<{
    key: string;
    label: string;
    width?: string;
    sortable?: boolean;
    render?: (value: any, row: Record<string, any>) => React.ReactNode;
  }>;
  rowHeight?: number;
  containerHeight?: number;
  onRowClick?: (row: Record<string, any>, index: number) => void;
  className?: string;
  emptyMessage?: string;
  loading?: boolean;
  striped?: boolean;
  highlightOnHover?: boolean;
}

export function VirtualScrollTable({
  data,
  columns,
  rowHeight = 48,
  containerHeight = 600,
  onRowClick,
  className = "",
  emptyMessage = "No results found",
  loading = false,
  striped = true,
  highlightOnHover = true
}: VirtualScrollTableProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [sortConfig, setSortConfig] = useState<{
    key: string | null;
    direction: 'asc' | 'desc';
  }>({ key: null, direction: 'asc' });

  // Handle scroll events
  const handleScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      setScrollTop(scrollContainerRef.current.scrollTop);
    }
  }, []);

  // Attach scroll listener
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  // Sort data if needed
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key!];
      const bValue = b[sortConfig.key!];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (typeof aValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  // Get visible items using virtual scrolling
  const {
    visibleItems,
    startIndex,
    offsetY,
    totalHeight
  } = useMemo(() => {
    return getVisibleItems(
      sortedData,
      containerHeight,
      rowHeight,
      scrollTop
    );
  }, [sortedData, containerHeight, rowHeight, scrollTop]);

  // Handle sorting
  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent, row: any, index: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onRowClick?.(row, index);
    }
  }, [onRowClick]);

  if (loading) {
    return (
      <Card className={`glass border-white/10 ${className}`}>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tanium-accent mx-auto"></div>
            <p className="mt-4 text-gray-400">Loading results...</p>
          </div>
        </div>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card className={`glass border-white/10 ${className}`}>
        <div className="flex items-center justify-center h-96">
          <div className="text-center text-gray-400">
            <Database className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>{emptyMessage}</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`glass border-white/10 overflow-hidden ${className}`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-tanium-accent" />
          <span className="font-medium text-white">Query Results</span>
          <Badge variant="secondary">{data.length.toLocaleString()} rows</Badge>
        </div>
        {visibleItems.length < data.length && (
          <Badge variant="outline" className="text-xs">
            Showing {startIndex + 1}-{startIndex + visibleItems.length} of {data.length}
          </Badge>
        )}
      </div>

      <div className="relative">
        {/* Fixed header */}
        <div className="sticky top-0 z-10 bg-gray-800 border-b border-gray-700">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                {columns.map((column) => (
                  <TableHead
                    key={column.key}
                    style={{ width: column.width }}
                    className="text-gray-300"
                  >
                    {column.sortable !== false ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort(column.key)}
                        className="h-auto p-0 font-medium text-gray-300 hover:text-white"
                      >
                        {column.label}
                        {sortConfig.key === column.key && (
                          <span className="ml-2">
                            {sortConfig.direction === 'asc' ? (
                              <ChevronUp className="h-3 w-3" />
                            ) : (
                              <ChevronDown className="h-3 w-3" />
                            )}
                          </span>
                        )}
                      </Button>
                    ) : (
                      column.label
                    )}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
          </Table>
        </div>

        {/* Scrollable body with virtual scrolling */}
        <div
          ref={scrollContainerRef}
          className="overflow-auto"
          style={{ height: containerHeight }}
          role="region"
          aria-label="Query results table"
        >
          <div style={{ height: totalHeight, position: 'relative' }}>
            <div
              style={{
                transform: `translateY(${offsetY}px)`,
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
              }}
            >
              <Table>
                <TableBody>
                  {visibleItems.map((row, idx) => {
                    const actualIndex = startIndex + idx;
                    return (
                      <TableRow
                        key={actualIndex}
                        className={`
                          ${striped && actualIndex % 2 === 0 ? 'bg-gray-800/50' : ''}
                          ${highlightOnHover ? 'hover:bg-gray-700/50' : ''}
                          ${onRowClick ? 'cursor-pointer' : ''}
                          transition-colors
                        `}
                        style={{ height: rowHeight }}
                        onClick={() => onRowClick?.(row, actualIndex)}
                        onKeyDown={(e) => handleKeyDown(e, row, actualIndex)}
                        tabIndex={onRowClick ? 0 : undefined}
                        role={onRowClick ? "button" : undefined}
                        aria-label={onRowClick ? `Row ${actualIndex + 1}` : undefined}
                      >
                        {columns.map((column) => (
                          <TableCell
                            key={column.key}
                            style={{ width: column.width }}
                            className="text-gray-300"
                          >
                            {column.render
                              ? column.render(row[column.key], row)
                              : row[column.key]?.toString() || '-'}
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>

      {/* Performance indicator */}
      {data.length > 1000 && (
        <div className="p-2 border-t border-gray-700 bg-gray-800/50">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <AlertCircle className="h-3 w-3" />
            <span>Virtual scrolling enabled for optimal performance with {data.length.toLocaleString()} rows</span>
          </div>
        </div>
      )}
    </Card>
  );
}