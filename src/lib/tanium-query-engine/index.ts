/**
 * Tanium Query Engine - Main Entry Point
 * TypeScript-based query engine replacing Python simulator
 */

import { Parser, parse } from './parser';
import { QueryExecutor, executeQuery } from './executor';
import { CacheManager, cacheManager } from './cache';
import {
  getFieldMapping,
  resolveGroupAlias,
  isKnownField,
  getAllFieldNames,
  SENSORS_CATALOG,
  AGGREGATE_FUNCTIONS
} from './field-mappings';
import {
  type QueryResult,
  type QueryNode,
  type MachineData,
  type ParserOptions,
  type ExecutorOptions,
  type SavedQuery,
  type QueryTemplate,
  QueryError,
  ParseError,
  ExecutionError
} from './types';
import { generateSampleDataWithScenarios } from './sample-data-generator';

// Generate realistic sample data with 150 machines
const SAMPLE_DATA: MachineData[] = generateSampleDataWithScenarios();

/**
 * Main TaniumQueryEngine class
 */
export class TaniumQueryEngine {
  private parser: Parser;
  private executor: QueryExecutor;
  private cache: CacheManager;
  private data: MachineData[];
  private savedQueries: Map<string, SavedQuery> = new Map();
  private templates: Map<string, QueryTemplate> = new Map();

  constructor(options?: {
    data?: MachineData[];
    parserOptions?: ParserOptions;
    executorOptions?: ExecutorOptions;
    cacheEnabled?: boolean;
  }) {
    this.parser = new Parser(options?.parserOptions);
    this.data = options?.data || SAMPLE_DATA;
    this.executor = new QueryExecutor(this.data, options?.executorOptions);
    this.cache = options?.cacheEnabled !== false ? cacheManager : new CacheManager({ enabled: false });

    // Initialize default templates
    this.initializeTemplates();
  }

  /**
   * Execute a query string
   */
  public async query(question: string, options?: ExecutorOptions): Promise<QueryResult> {
    const startTime = performance.now();

    try {
      // Validate input
      if (!question || typeof question !== 'string') {
        throw new QueryError('Question is required and must be a string');
      }

      // Normalize query
      const normalizedQuery = this.normalizeQuery(question);

      // Check cache first
      if (options?.useCache !== false) {
        const cached = this.cache.getQueryResult(normalizedQuery);
        if (cached) {
          cached.execution = {
            ...cached.execution!,
            cacheHit: true,
            totalTimeMs: performance.now() - startTime
          };
          return cached;
        }
      }

      // Parse query (check parsed cache)
      let ast = this.cache.getParsedQuery(normalizedQuery);
      if (!ast) {
        const parseStart = performance.now();
        ast = this.parser.parse(normalizedQuery);
        const parseTime = performance.now() - parseStart;

        // Cache parsed AST
        this.cache.setParsedQuery(normalizedQuery, ast);

        // Update metrics
        if (ast) {
          (ast as any).parseTimeMs = parseTime;
        }
      }

      // Execute query
      const result = await this.executor.execute(ast);

      // Update total time
      result.execution = {
        ...result.execution!,
        totalTimeMs: performance.now() - startTime
      };

      // Cache result
      if (options?.useCache !== false) {
        this.cache.setQueryResult(normalizedQuery, result);
      }

      return result;
    } catch (error) {
      // Return error result
      const errorResult: QueryResult = {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
        errorPosition: error instanceof ParseError ? error.position : undefined,
        execution: {
          parseTimeMs: 0,
          planTimeMs: 0,
          executeTimeMs: 0,
          totalTimeMs: performance.now() - startTime,
          scoped: 0,
          filtered: 0,
          rowsExamined: 0,
          cacheHit: false
        }
      };

      return errorResult;
    }
  }

  /**
   * Parse query without executing
   */
  public parse(question: string): QueryNode {
    const normalized = this.normalizeQuery(question);

    // Check cache
    const cached = this.cache.getParsedQuery(normalized);
    if (cached) {
      return cached;
    }

    const ast = this.parser.parse(normalized);
    this.cache.setParsedQuery(normalized, ast);
    return ast;
  }

  /**
   * Explain query plan
   */
  public async explain(question: string): Promise<QueryResult> {
    const ast = this.parse(question);
    return this.executor.execute(ast);
  }

  /**
   * Normalize query string
   */
  private normalizeQuery(question: string): string {
    return question
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/^get\s+/i, 'Get ');
  }

  /**
   * Save a query
   */
  public saveQuery(name: string, question: string, description?: string): SavedQuery {
    const saved: SavedQuery = {
      id: `saved_${Date.now()}`,
      name,
      question,
      description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      executionCount: 0
    };

    this.savedQueries.set(name.toLowerCase(), saved);
    return saved;
  }

  /**
   * Get saved query
   */
  public getSavedQuery(name: string): SavedQuery | undefined {
    return this.savedQueries.get(name.toLowerCase());
  }

  /**
   * List saved queries
   */
  public listSavedQueries(): SavedQuery[] {
    return Array.from(this.savedQueries.values());
  }

  /**
   * Run saved query
   */
  public async runSavedQuery(name: string): Promise<QueryResult> {
    const saved = this.getSavedQuery(name);
    if (!saved) {
      throw new QueryError(`No saved query found with name: ${name}`);
    }

    // Update execution count
    saved.executionCount = (saved.executionCount || 0) + 1;
    saved.lastExecuted = new Date().toISOString();

    // Execute query
    const startTime = performance.now();
    const result = await this.query(saved.question);

    // Update average time
    const executionTime = performance.now() - startTime;
    if (saved.averageTimeMs) {
      saved.averageTimeMs = (saved.averageTimeMs + executionTime) / 2;
    } else {
      saved.averageTimeMs = executionTime;
    }

    return result;
  }

  /**
   * Initialize default templates
   */
  private initializeTemplates(): void {
    // Basic templates
    this.addTemplate({
      id: 'all-machines',
      name: 'All Machines',
      description: 'List all machines',
      template: 'Get Computer Name, OS Platform, Group from all machines',
      parameters: [],
      category: 'Basic',
      difficulty: 1
    });

    this.addTemplate({
      id: 'high-cpu',
      name: 'High CPU Usage',
      description: 'Find machines with high CPU usage',
      template: 'Get Computer Name, CPU Percent from all machines where CPU Percent is greater than "${threshold}" order by CPU Percent desc',
      parameters: [
        { name: 'threshold', type: 'number', required: true, default: 80 }
      ],
      category: 'Performance',
      difficulty: 2
    });

    this.addTemplate({
      id: 'low-disk',
      name: 'Low Disk Space',
      description: 'Find machines with low disk space',
      template: 'Get Computer Name, Disk Free GB from all machines where Disk Free GB is less than "${threshold}" order by Disk Free GB',
      parameters: [
        { name: 'threshold', type: 'number', required: true, default: 50 }
      ],
      category: 'Performance',
      difficulty: 2
    });

    this.addTemplate({
      id: 'compliance-check',
      name: 'Compliance Check',
      description: 'Check compliance scores by group',
      template: 'Get avg(Compliance Score), min(Compliance Score), count() from all machines group by Group',
      parameters: [],
      category: 'Governance',
      difficulty: 3
    });
  }

  /**
   * Add a query template
   */
  public addTemplate(template: QueryTemplate): void {
    this.templates.set(template.id, template);
  }

  /**
   * Get query template
   */
  public getTemplate(id: string): QueryTemplate | undefined {
    return this.templates.get(id);
  }

  /**
   * List all templates
   */
  public listTemplates(): QueryTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Apply template with parameters
   */
  public applyTemplate(templateId: string, params: Record<string, any>): string {
    const template = this.getTemplate(templateId);
    if (!template) {
      throw new QueryError(`Template not found: ${templateId}`);
    }

    let query = template.template;

    // Replace parameters
    for (const param of template.parameters) {
      const value = params[param.name] ?? param.default;
      if (param.required && value === undefined) {
        throw new QueryError(`Required parameter missing: ${param.name}`);
      }
      query = query.replace(`\${${param.name}}`, String(value));
    }

    return query;
  }

  /**
   * Set data for query execution
   */
  public setData(data: MachineData[]): void {
    this.data = data;
    this.executor.setData(data);
    // Clear cache when data changes
    this.cache.clearAll();
  }

  /**
   * Get current data
   */
  public getData(): MachineData[] {
    return this.data;
  }

  /**
   * Get field suggestions for autocomplete
   */
  public getFieldSuggestions(): string[] {
    return getAllFieldNames();
  }

  /**
   * Get sensor catalog
   */
  public getSensorsCatalog() {
    return SENSORS_CATALOG;
  }

  /**
   * Get aggregate functions
   */
  public getAggregateFunctions() {
    return AGGREGATE_FUNCTIONS;
  }

  /**
   * Clear all caches
   */
  public clearCache(): void {
    this.cache.clearAll();
  }

  /**
   * Get cache statistics
   */
  public getCacheStatistics() {
    return this.cache.getStatistics();
  }

  /**
   * Export saved queries and templates
   */
  public export(): string {
    return JSON.stringify({
      savedQueries: Array.from(this.savedQueries.entries()),
      templates: Array.from(this.templates.entries())
    }, null, 2);
  }

  /**
   * Import saved queries and templates
   */
  public import(data: string): void {
    try {
      const parsed = JSON.parse(data);
      if (parsed.savedQueries) {
        this.savedQueries = new Map(parsed.savedQueries);
      }
      if (parsed.templates) {
        this.templates = new Map(parsed.templates);
      }
    } catch (error) {
      throw new QueryError(`Failed to import data: ${error}`);
    }
  }
}

// Export singleton instance for convenience
export const queryEngine = new TaniumQueryEngine();

// Re-export types and utilities
export * from './types';
export {
  parse,
  executeQuery,
  cacheManager,
  getFieldMapping,
  resolveGroupAlias,
  isKnownField,
  getAllFieldNames,
  SENSORS_CATALOG,
  AGGREGATE_FUNCTIONS
};

// Export default
export default TaniumQueryEngine;