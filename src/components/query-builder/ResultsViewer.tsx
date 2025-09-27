"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Database,
  Download,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  CheckCircle,
  FileJson,
  FileText,
  BarChart3,
  Eye,
  Table as TableIcon
} from 'lucide-react';
import { VirtualScrollTable } from './components/VirtualScrollTable';

import { ResultsViewerProps } from './types/queryBuilder';
import { QueryResult } from '@/lib/tanium-query-engine/types';

export function ResultsViewer({
  result,
  isLoading = false,
  onExport,
  onSort,
  pageSize = 50,
  className = ""
}: ResultsViewerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'table' | 'virtual' | 'summary'>('table');
  const [useVirtualScroll, setUseVirtualScroll] = useState(false);

  // Filter and sort data
  const processedData = useMemo(() => {
    if (!result || !result.rows) return [];

    let data = [...result.rows];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      data = data.filter(row =>
        row.some(cell =>
          String(cell).toLowerCase().includes(term)
        )
      );
    }

    // Apply sorting
    if (sortColumn !== null && result.headers) {
      const columnIndex = result.headers.indexOf(sortColumn);
      if (columnIndex >= 0) {
        data.sort((a, b) => {
          const aVal = a[columnIndex];
          const bVal = b[columnIndex];

          if (aVal === null || aVal === undefined) return 1;
          if (bVal === null || bVal === undefined) return -1;

          const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
          return sortDirection === 'asc' ? comparison : -comparison;
        });
      }
    }

    return data;
  }, [result, searchTerm, sortColumn, sortDirection]);

  // Auto-enable virtual scrolling for large datasets
  useMemo(() => {
    if (processedData.length > 1000 && !useVirtualScroll) {
      setUseVirtualScroll(true);
      setViewMode('virtual');
    }
  }, [processedData.length, useVirtualScroll]);

  // Convert data for VirtualScrollTable
  const tableData = useMemo(() => {
    if (!result || !result.headers || !processedData) return [];

    return processedData.map(row => {
      const obj: Record<string, any> = {};
      result.headers?.forEach((header, index) => {
        obj[header] = row[index];
      });
      return obj;
    });
  }, [result, processedData]);

  // Prepare columns for VirtualScrollTable
  const virtualColumns = useMemo(() => {
    if (!result || !result.headers) return [];

    return result.headers.map(header => ({
      key: header,
      label: header,
      sortable: true,
      render: (value: any) => {
        if (value === null || value === undefined) {
          return <span className="text-gray-500 italic">null</span>;
        }
        if (typeof value === 'boolean') {
          return (
            <Badge
              variant="outline"
              className={value ? 'border-green-500 text-green-400' : 'border-red-500 text-red-400'}
            >
              {String(value)}
            </Badge>
          );
        }
        return String(value);
      }
    }));
  }, [result]);

  // Pagination
  const totalPages = Math.ceil(processedData.length / pageSize);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return processedData.slice(start, end);
  }, [processedData, currentPage, pageSize]);

  // Handle column sort
  const handleSort = useCallback((column: string) => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }

    if (onSort) {
      onSort(column, sortDirection === 'asc' ? 'desc' : 'asc');
    }
  }, [sortColumn, sortDirection, onSort]);

  // Handle export
  const handleExport = useCallback((format: 'csv' | 'json') => {
    if (!result || !result.rows || !onExport) return;

    if (format === 'csv' && result.csv) {
      // Use pre-generated CSV if available
      const blob = new Blob([result.csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `query-results-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      onExport(format);
    }
  }, [result, onExport]);

  // Get sort icon
  const getSortIcon = (column: string) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="h-3 w-3 opacity-50" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="h-3 w-3" />
    ) : (
      <ArrowDown className="h-3 w-3" />
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <Card className={`glass border-white/10 ${className}`}>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-tanium-accent mx-auto mb-3" />
            <p className="text-gray-400">Executing query...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (result && !result.ok) {
    return (
      <Card className={`glass border-white/10 ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <Database className="mr-2 h-5 w-5" />
            Query Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border-red-500 bg-red-500/10">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-400">
              <div className="font-semibold">Query execution failed</div>
              <div className="mt-1 text-sm">{result.error}</div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // No results
  if (!result || !result.rows || result.rows.length === 0) {
    return (
      <Card className={`glass border-white/10 ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <Database className="mr-2 h-5 w-5" />
            Query Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-400">
            <Database className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No results found</p>
            {result && result.execution && (
              <p className="text-sm mt-2">
                Query executed in {result.execution.totalTimeMs}ms
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`glass border-white/10 ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-white">
            <Database className="mr-2 h-5 w-5" />
            Query Results
            <Badge variant="secondary" className="ml-2">
              {processedData.length} {processedData.length === 1 ? 'row' : 'rows'}
            </Badge>
          </CardTitle>
          <div className="flex items-center space-x-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search results..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-8 w-48 h-8 bg-gray-800 border-gray-600 text-white"
              />
            </div>

            {/* Export buttons */}
            {onExport && (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleExport('csv')}
                  className="text-gray-400 hover:text-white"
                >
                  <FileText className="mr-1 h-3 w-3" />
                  CSV
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleExport('json')}
                  className="text-gray-400 hover:text-white"
                >
                  <FileJson className="mr-1 h-3 w-3" />
                  JSON
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Execution metrics */}
        {result.execution && (
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs border-green-500 text-green-400">
              <CheckCircle className="mr-1 h-3 w-3" />
              Success
            </Badge>
            <Badge variant="outline" className="text-xs">
              Execution: {result.execution.totalTimeMs}ms
            </Badge>
            {result.execution.cacheHit && (
              <Badge variant="outline" className="text-xs border-blue-500 text-blue-400">
                Cached
              </Badge>
            )}
            {result.execution.rowsExamined !== undefined && (
              <Badge variant="outline" className="text-xs">
                Examined: {result.execution.rowsExamined} rows
              </Badge>
            )}
          </div>
        )}

        {/* View mode tabs for large datasets */}
        {processedData.length > 100 && (
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
            <TabsList className="bg-gray-800">
              <TabsTrigger value="table">
                <TableIcon className="h-4 w-4 mr-2" />
                Paginated
              </TabsTrigger>
              <TabsTrigger value="virtual">
                <BarChart3 className="h-4 w-4 mr-2" />
                Virtual Scroll
                {processedData.length > 1000 && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    Recommended
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="summary">
                <Eye className="h-4 w-4 mr-2" />
                Summary
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        {/* Results table - Regular or Virtual */}
        {viewMode === 'table' && (
          <ScrollArea className="w-full">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700">
                  {result.headers?.map((header, index) => (
                    <TableHead
                      key={index}
                      className="text-gray-300 cursor-pointer hover:text-white"
                      onClick={() => handleSort(header)}
                    >
                      <div className="flex items-center space-x-1">
                        <span>{header}</span>
                        {getSortIcon(header)}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((row, rowIndex) => (
                  <TableRow key={rowIndex} className="border-gray-700">
                    {row.map((cell, cellIndex) => (
                      <TableCell key={cellIndex} className="text-gray-300">
                        {cell === null || cell === undefined ? (
                          <span className="text-gray-500 italic">null</span>
                        ) : typeof cell === 'boolean' ? (
                          <Badge
                            variant="outline"
                            className={cell ? 'border-green-500 text-green-400' : 'border-red-500 text-red-400'}
                          >
                            {String(cell)}
                          </Badge>
                        ) : (
                          String(cell)
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        )}

        {/* Virtual scrolling for large datasets */}
        {viewMode === 'virtual' && (
          <VirtualScrollTable
            data={tableData}
            columns={virtualColumns}
            rowHeight={48}
            containerHeight={600}
            striped={true}
            highlightOnHover={true}
          />
        )}

        {/* Summary view */}
        {viewMode === 'summary' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="glass border-white/10">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-white">{processedData.length}</div>
                  <div className="text-sm text-gray-400">Total Rows</div>
                </CardContent>
              </Card>
              <Card className="glass border-white/10">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-white">{result.headers?.length || 0}</div>
                  <div className="text-sm text-gray-400">Columns</div>
                </CardContent>
              </Card>
              {result.execution && (
                <>
                  <Card className="glass border-green-500/50">
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-green-400">{result.execution.totalTimeMs}ms</div>
                      <div className="text-sm text-gray-400">Query Time</div>
                    </CardContent>
                  </Card>
                  {result.execution.rowsExamined !== undefined && (
                    <Card className="glass border-blue-500/50">
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold text-blue-400">{result.execution.rowsExamined}</div>
                        <div className="text-sm text-gray-400">Rows Examined</div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </div>

            {/* Sample data preview */}
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-400 mb-2">Data Preview (First 10 rows)</h4>
              <div className="bg-gray-800 rounded-lg p-4 overflow-auto max-h-64">
                <pre className="text-xs text-gray-300 font-mono">
                  {JSON.stringify(tableData.slice(0, 10), null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Pagination - only for table view */}
        {viewMode === 'table' && totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Showing {((currentPage - 1) * pageSize) + 1} to{' '}
              {Math.min(currentPage * pageSize, processedData.length)} of{' '}
              {processedData.length} results
            </div>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Select
                value={String(currentPage)}
                onValueChange={(value) => setCurrentPage(Number(value))}
              >
                <SelectTrigger className="w-20 h-8 bg-gray-800 border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <SelectItem key={page} value={String(page)}>
                      {page}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-sm text-gray-400">of {totalPages}</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}