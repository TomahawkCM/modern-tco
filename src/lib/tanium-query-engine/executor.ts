/**
 * Tanium Query Engine - Executor
 * High-performance query execution with optimization
 */

import {
  type QueryNode,
  type QueryResult,
  type QueryPlan,
  ExecutionError,
  type ExecutorOptions,
  type MachineData,
  type ExecutionMetrics,
  type QueryWarning,
  type FilterNode,
  type AggregateNode
} from './types';
import { getFieldMapping, getDbColumn, validateFieldOperator, resolveGroupAlias } from './field-mappings';

export class QueryExecutor {
  private data: MachineData[] = [];
  private options: ExecutorOptions;
  private warnings: QueryWarning[] = [];
  private metrics: ExecutionMetrics;

  constructor(data: MachineData[] = [], options: ExecutorOptions = {}) {
    this.data = data;
    this.options = {
      timeout: 5000,
      maxRows: 10000,
      useCache: true,
      cacheTTL: 60000,
      explainOnly: false,
      format: 'json',
      ...options
    };
    this.metrics = this.initMetrics();
  }

  /**
   * Initialize execution metrics
   */
  private initMetrics(): ExecutionMetrics {
    return {
      parseTimeMs: 0,
      planTimeMs: 0,
      executeTimeMs: 0,
      totalTimeMs: 0,
      scoped: 0,
      filtered: 0,
      rowsExamined: 0,
      cacheHit: false
    };
  }

  /**
   * Execute a parsed query
   */
  public async execute(query: QueryNode): Promise<QueryResult> {
    const startTime = performance.now();
    this.warnings = [];
    this.metrics = this.initMetrics();

    try {
      // Generate query plan
      const planStart = performance.now();
      const plan = this.generateQueryPlan(query);
      this.metrics.planTimeMs = performance.now() - planStart;

      // If explain only, return plan
      if (this.options.explainOnly) {
        return this.createExplainResult(plan);
      }

      // Execute query plan
      const execStart = performance.now();
      const result = await this.executePlan(query, plan);
      this.metrics.executeTimeMs = performance.now() - execStart;

      // Update metrics
      this.metrics.totalTimeMs = performance.now() - startTime;
      result.execution = { ...this.metrics };
      result.warnings = this.warnings;

      return result;
    } catch (error) {
      if (error instanceof ExecutionError) {
        throw error;
      }
      throw new ExecutionError(`Query execution failed: ${error}`);
    }
  }

  /**
   * Generate optimized query plan
   */
  private generateQueryPlan(query: QueryNode): QueryPlan {
    const plan: QueryPlan = {
      type: 'scan',
      cost: this.data.length,
      rows: this.data.length,
      width: 100,
      children: []
    };

    // Add scope filtering
    if (query.from.scope.scopeType === 'group' && query.from.scope.value) {
      plan.children?.push({
        type: 'filter',
        cost: plan.rows * 0.1,
        rows: Math.floor(plan.rows * 0.3), // Estimate 30% match
        width: plan.width,
        details: { scope: query.from.scope.value }
      });
    }

    // Add WHERE filters
    if (query.where && query.where.filters.length > 0) {
      const selectivity = 0.5 ** query.where.filters.length; // Each filter reduces by half
      plan.children?.push({
        type: 'filter',
        cost: plan.rows * 0.2,
        rows: Math.floor(plan.rows * selectivity),
        width: plan.width,
        details: { filters: query.where.filters.length }
      });
    }

    // Add GROUP BY
    if (query.groupBy && query.groupBy.columns.length > 0) {
      plan.children?.push({
        type: 'aggregate',
        cost: plan.rows * 0.5,
        rows: Math.floor(plan.rows * 0.1), // Estimate 10% unique groups
        width: 50,
        details: { groupBy: query.groupBy.columns }
      });
    }

    // Add ORDER BY
    if (query.orderBy && query.orderBy.columns.length > 0) {
      const sortCost = plan.rows * Math.log2(plan.rows);
      plan.children?.push({
        type: 'sort',
        cost: sortCost,
        rows: plan.rows,
        width: plan.width,
        details: { orderBy: query.orderBy.columns }
      });
    }

    // Add LIMIT
    if (query.limit) {
      plan.children?.push({
        type: 'limit',
        cost: 1,
        rows: Math.min(query.limit.value, plan.rows),
        width: plan.width,
        details: { limit: query.limit.value }
      });
    }

    return plan;
  }

  /**
   * Execute the query plan
   */
  private async executePlan(query: QueryNode, plan: QueryPlan): Promise<QueryResult> {
    let workingSet = [...this.data];
    this.metrics.rowsExamined = workingSet.length;

    // Apply scope filter
    workingSet = this.applyScope(workingSet, query);
    this.metrics.scoped = workingSet.length;

    // Apply WHERE filters
    if (query.where) {
      workingSet = this.applyFilters(workingSet, query.where.filters);
      this.metrics.filtered = workingSet.length;
    } else {
      this.metrics.filtered = this.metrics.scoped;
    }

    // Build result based on query type
    let headers: string[] = [];
    let rows: Array<Array<string | number | null>> = [];

    if (query.groupBy || query.select.aggregates.length > 0) {
      // Aggregate query
      const aggregateResult = this.executeAggregates(workingSet, query);
      headers = aggregateResult.headers;
      rows = aggregateResult.rows;
    } else {
      // Regular select query
      const selectResult = this.executeSelect(workingSet, query);
      headers = selectResult.headers;
      rows = selectResult.rows;
    }

    // Apply ORDER BY
    if (query.orderBy) {
      rows = this.applyOrderBy(rows, headers, query.orderBy);
    }

    // Apply LIMIT
    if (query.limit) {
      rows = rows.slice(0, query.limit.value);
    }

    // Format result based on options
    const result: QueryResult = {
      ok: true,
      headers,
      rows,
      rowCount: rows.length,
      metadata: this.buildMetadata(query)
    };

    // Add CSV format if requested
    if (this.options.format === 'csv') {
      result.csv = this.formatAsCSV(headers, rows);
    }

    return result;
  }

  /**
   * Apply scope filtering
   */
  private applyScope(data: MachineData[], query: QueryNode): MachineData[] {
    const {scope} = query.from;

    if (scope.scopeType === 'all') {
      return data;
    }

    if (scope.scopeType === 'group' && scope.value) {
      const resolvedGroup = resolveGroupAlias(scope.value);
      return data.filter(row => row.group_name === resolvedGroup);
    }

    return data;
  }

  /**
   * Apply WHERE filters
   */
  private applyFilters(data: MachineData[], filters: FilterNode[]): MachineData[] {
    let filtered = data;

    for (const filter of filters) {
      const dbColumn = getDbColumn(filter.field);
      if (!dbColumn) {
        this.warnings.push({
          message: `Unknown field: ${filter.field}`,
          severity: 'warning'
        });
        continue;
      }

      // Validate operator compatibility
      if (!validateFieldOperator(filter.field, filter.operator)) {
        this.warnings.push({
          message: `Operator '${filter.operator}' may not be compatible with field '${filter.field}'`,
          severity: 'warning'
        });
      }

      filtered = filtered.filter(row => this.evaluateFilter(row, filter, dbColumn));
    }

    return filtered;
  }

  /**
   * Evaluate a single filter
   */
  private evaluateFilter(row: MachineData, filter: FilterNode, dbColumn: string): boolean {
    const value = (row as any)[dbColumn];
    if (value === null || value === undefined) return false;

    const textValue = String(value).toLowerCase();
    const filterValue = String(filter.value).toLowerCase();

    switch (filter.operator) {
      case 'contains':
        return textValue.includes(filterValue);
      case 'does_not_contain':
        return !textValue.includes(filterValue);
      case 'equals':
        return textValue === filterValue;
      case 'not_equals':
        return textValue !== filterValue;
      case 'starts_with':
        return textValue.startsWith(filterValue);
      case 'ends_with':
        return textValue.endsWith(filterValue);
      case 'greater_than':
        return Number(value) > Number(filter.value);
      case 'less_than':
        return Number(value) < Number(filter.value);
      case 'greater_or_equal':
        return Number(value) >= Number(filter.value);
      case 'less_or_equal':
        return Number(value) <= Number(filter.value);
      default:
        return false;
    }
  }

  /**
   * Execute SELECT columns
   */
  private executeSelect(data: MachineData[], query: QueryNode): {
    headers: string[];
    rows: Array<Array<string | number | null>>;
  } {
    const {columns} = query.select;
    const headers = columns.length > 0
      ? columns.map(col => col.name)
      : ['Computer Name']; // Default column

    const rows = data.map(row => {
      return headers.map(header => {
        const dbColumn = getDbColumn(header);
        if (!dbColumn) return null;
        const value = (row as any)[dbColumn];
        return this.formatValue(value);
      });
    });

    return { headers, rows };
  }

  /**
   * Execute aggregate functions
   */
  private executeAggregates(data: MachineData[], query: QueryNode): {
    headers: string[];
    rows: Array<Array<string | number | null>>;
  } {
    const headers: string[] = [];
    const {aggregates} = query.select;
    const groupBy = query.groupBy?.columns[0]; // Support single group by for now

    // Add group by column to headers
    if (groupBy) {
      headers.push(groupBy);
    }

    // Add aggregate columns to headers
    if (aggregates.length > 0) {
      aggregates.forEach(agg => {
        headers.push(`${agg.function}(${agg.column || ''})`);
      });
    } else {
      headers.push('count()');
    }

    // Calculate aggregates
    if (groupBy) {
      // Grouped aggregates
      const groups = this.groupData(data, groupBy);
      const rows: Array<Array<string | number | null>> = [];

      for (const [groupValue, groupData] of groups.entries()) {
        const row: Array<string | number | null> = [groupValue];

        if (aggregates.length > 0) {
          aggregates.forEach(agg => {
            row.push(this.calculateAggregate(groupData, agg));
          });
        } else {
          row.push(groupData.length); // Default count
        }

        rows.push(row);
      }

      return { headers, rows };
    } else {
      // Simple aggregates
      const row: Array<string | number | null> = [];

      if (aggregates.length > 0) {
        aggregates.forEach(agg => {
          row.push(this.calculateAggregate(data, agg));
        });
      } else {
        row.push(data.length); // Default count
      }

      return { headers, rows: [row] };
    }
  }

  /**
   * Group data by column
   */
  private groupData(data: MachineData[], column: string): Map<string, MachineData[]> {
    const groups = new Map<string, MachineData[]>();
    const dbColumn = getDbColumn(column);

    if (!dbColumn) {
      this.warnings.push({
        message: `Unknown group by column: ${column}`,
        severity: 'error'
      });
      return groups;
    }

    for (const row of data) {
      const key = String((row as any)[dbColumn] || 'null');
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(row);
    }

    return groups;
  }

  /**
   * Calculate aggregate function
   */
  private calculateAggregate(data: MachineData[], aggregate: AggregateNode): string | number | null {
    if (aggregate.function === 'count') {
      if (!aggregate.column) {
        return data.length;
      }
      const dbColumn = getDbColumn(aggregate.column);
      if (!dbColumn) return 0;
      return data.filter(row => (row as any)[dbColumn] != null).length;
    }

    if (!aggregate.column) return null;
    const dbColumn = getDbColumn(aggregate.column);
    if (!dbColumn) return null;

    const values = data
      .map(row => (row as any)[dbColumn])
      .filter(v => v != null && !isNaN(Number(v)))
      .map(Number);

    if (values.length === 0) return null;

    switch (aggregate.function) {
      case 'min':
        return Math.min(...values);
      case 'max':
        return Math.max(...values);
      case 'avg':
        return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100;
      case 'sum':
        return Math.round(values.reduce((a, b) => a + b, 0) * 100) / 100;
      default:
        return null;
    }
  }

  /**
   * Apply ORDER BY
   */
  private applyOrderBy(
    rows: Array<Array<string | number | null>>,
    headers: string[],
    orderBy: QueryNode['orderBy']
  ): Array<Array<string | number | null>> {
    if (!orderBy) return rows;

    const sorted = [...rows];
    const sortColumns = orderBy.columns;

    sorted.sort((a, b) => {
      for (const sortCol of sortColumns) {
        const index = headers.indexOf(sortCol.column);
        if (index === -1) continue;

        const aVal = a[index];
        const bVal = b[index];

        if (aVal === null && bVal === null) continue;
        if (aVal === null) return sortCol.direction === 'asc' ? -1 : 1;
        if (bVal === null) return sortCol.direction === 'asc' ? 1 : -1;

        let comparison = 0;
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          comparison = aVal - bVal;
        } else {
          comparison = String(aVal).localeCompare(String(bVal));
        }

        if (comparison !== 0) {
          return sortCol.direction === 'asc' ? comparison : -comparison;
        }
      }
      return 0;
    });

    return sorted;
  }

  /**
   * Format value for output
   */
  private formatValue(value: any): string | number | null {
    if (value === null || value === undefined) return null;
    if (typeof value === 'number') {
      return Math.round(value * 1000) / 1000; // Round to 3 decimal places
    }
    if (value instanceof Date) {
      return value.toISOString();
    }
    return String(value);
  }

  /**
   * Format result as CSV
   */
  private formatAsCSV(headers: string[], rows: Array<Array<string | number | null>>): string {
    const lines: string[] = [];

    // Add headers
    lines.push(headers.map(h => this.escapeCSV(h)).join(','));

    // Add rows
    for (const row of rows) {
      lines.push(row.map(cell => this.escapeCSV(cell)).join(','));
    }

    return lines.join('\n');
  }

  /**
   * Escape CSV value
   */
  private escapeCSV(value: any): string {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  /**
   * Build query metadata
   */
  private buildMetadata(query: QueryNode): QueryResult['metadata'] {
    return {
      aggregations: query.select.aggregates.map(a => a.function),
      groupBy: query.groupBy?.columns[0] || null,
      orderBy: query.orderBy?.columns[0]?.column || null,
      orderDir: query.orderBy?.columns[0]?.direction || 'asc',
      limit: query.limit?.value || null,
      scope: query.from.scope.value || query.from.scope.scopeType,
      filters: query.where?.filters.length || 0
    };
  }

  /**
   * Create explain result
   */
  private createExplainResult(plan: QueryPlan): QueryResult {
    return {
      ok: true,
      headers: ['Operation', 'Cost', 'Rows', 'Details'],
      rows: this.planToRows(plan),
      rowCount: 1,
      metadata: {
        aggregations: [],
        groupBy: null,
        orderBy: null,
        orderDir: 'asc',
        limit: null,
        scope: 'all',
        filters: 0
      }
    };
  }

  /**
   * Convert query plan to rows for display
   */
  private planToRows(plan: QueryPlan, depth: number = 0): Array<Array<string | number | null>> {
    const rows: Array<Array<string | number | null>> = [];
    const indent = '  '.repeat(depth);

    rows.push([
      `${indent}${plan.type}`,
      plan.cost,
      plan.rows,
      plan.details ? JSON.stringify(plan.details) : null
    ]);

    if (plan.children) {
      for (const child of plan.children) {
        rows.push(...this.planToRows(child, depth + 1));
      }
    }

    return rows;
  }

  /**
   * Set data for executor
   */
  public setData(data: MachineData[]): void {
    this.data = data;
  }

  /**
   * Get current data
   */
  public getData(): MachineData[] {
    return this.data;
  }
}

// Export factory function
export function executeQuery(
  query: QueryNode,
  data: MachineData[],
  options?: ExecutorOptions
): Promise<QueryResult> {
  const executor = new QueryExecutor(data, options);
  return executor.execute(query);
}