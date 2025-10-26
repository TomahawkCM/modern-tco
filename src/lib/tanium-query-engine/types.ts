/**
 * Tanium Query Engine - Type Definitions
 * Core types for the TypeScript-based query engine
 */

// Token types for lexical analysis
export enum TokenType {
  // Keywords
  GET = 'GET',
  FROM = 'FROM',
  WHERE = 'WHERE',
  WITH = 'WITH',
  GROUP_BY = 'GROUP_BY',
  ORDER_BY = 'ORDER_BY',
  LIMIT = 'LIMIT',
  AND = 'AND',

  // Operators
  CONTAINS = 'CONTAINS',
  DOES_NOT_CONTAIN = 'DOES_NOT_CONTAIN',
  EQUALS = 'EQUALS',
  IS_GREATER_THAN = 'IS_GREATER_THAN',
  IS_LESS_THAN = 'IS_LESS_THAN',
  STARTS_WITH = 'STARTS_WITH',
  ENDS_WITH = 'ENDS_WITH',

  // Aggregates
  COUNT = 'COUNT',
  MIN = 'MIN',
  MAX = 'MAX',
  AVG = 'AVG',
  SUM = 'SUM',

  // Literals
  IDENTIFIER = 'IDENTIFIER',
  STRING = 'STRING',
  NUMBER = 'NUMBER',

  // Punctuation
  COMMA = 'COMMA',
  LPAREN = 'LPAREN',
  RPAREN = 'RPAREN',
  DOT = 'DOT',

  // Special
  EOF = 'EOF',
  UNKNOWN = 'UNKNOWN'
}

export interface Token {
  type: TokenType;
  value: string;
  position: number;
  line: number;
  column: number;
}

export interface SourceLocation {
  start: number;
  end: number;
  line: number;
  column: number;
}

// AST Node types
export type ASTNode =
  | QueryNode
  | SelectNode
  | FromNode
  | WhereNode
  | GroupByNode
  | OrderByNode
  | LimitNode
  | ColumnNode
  | AggregateNode
  | FilterNode
  | ScopeNode;

export interface QueryNode {
  type: 'Query';
  select: SelectNode;
  from: FromNode;
  where?: WhereNode;
  groupBy?: GroupByNode;
  orderBy?: OrderByNode;
  limit?: LimitNode;
  location?: SourceLocation;
}

export interface SelectNode {
  type: 'Select';
  columns: ColumnNode[];
  aggregates: AggregateNode[];
  location?: SourceLocation;
}

export interface ColumnNode {
  type: 'Column';
  name: string;
  alias?: string;
  location?: SourceLocation;
}

export interface AggregateNode {
  type: 'Aggregate';
  function: 'count' | 'min' | 'max' | 'avg' | 'sum';
  column?: string;
  alias?: string;
  location?: SourceLocation;
}

export interface FromNode {
  type: 'From';
  scope: ScopeNode;
  location?: SourceLocation;
}

export interface ScopeNode {
  type: 'Scope';
  scopeType: 'all' | 'group' | 'filter';
  value?: string;
  location?: SourceLocation;
}

export interface WhereNode {
  type: 'Where';
  filters: FilterNode[];
  location?: SourceLocation;
}

export interface FilterNode {
  type: 'Filter';
  field: string;
  operator: FilterOperator;
  value: string | number;
  dataType?: 'text' | 'number' | 'date';
  location?: SourceLocation;
}

export type FilterOperator =
  | 'contains'
  | 'does_not_contain'
  | 'equals'
  | 'not_equals'
  | 'greater_than'
  | 'less_than'
  | 'greater_or_equal'
  | 'less_or_equal'
  | 'starts_with'
  | 'ends_with';

export interface GroupByNode {
  type: 'GroupBy';
  columns: string[];
  location?: SourceLocation;
}

export interface OrderByNode {
  type: 'OrderBy';
  columns: Array<{
    column: string;
    direction: 'asc' | 'desc';
  }>;
  location?: SourceLocation;
}

export interface LimitNode {
  type: 'Limit';
  value: number;
  location?: SourceLocation;
}

// Field mapping for Tanium sensors
export interface FieldMapping {
  key: string;
  type: 'text' | 'number' | 'date';
  dbColumn: string;
  description?: string;
  category?: string;
}

// Query execution result
export interface QueryResult {
  ok: boolean;
  error?: string;
  errorPosition?: number;
  headers?: string[];
  rows?: Array<Array<string | number | null>>;
  rowCount?: number;
  warnings?: QueryWarning[];
  execution?: ExecutionMetrics;
  metadata?: QueryMetadata;
  cached?: boolean;
  csv?: string;
}

export interface QueryWarning {
  message: string;
  start?: number;
  end?: number;
  severity: 'info' | 'warning' | 'error';
}

export interface ExecutionMetrics {
  parseTimeMs: number;
  planTimeMs: number;
  executeTimeMs: number;
  totalTimeMs: number;
  scoped: number;
  filtered: number;
  rowsExamined: number;
  cacheHit: boolean;
}

export interface QueryMetadata {
  aggregations: string[];
  groupBy: string | null;
  orderBy: string | null;
  orderDir: string;
  limit: number | null;
  scope: string;
  filters: number;
}

// Query plan for optimization
export interface QueryPlan {
  type: 'scan' | 'index_scan' | 'filter' | 'aggregate' | 'sort' | 'limit';
  cost: number;
  rows: number;
  width: number;
  children?: QueryPlan[];
  details?: Record<string, any>;
}

// Cache entry
export interface CacheEntry<T> {
  value: T;
  timestamp: number;
  ttl: number;
  hits: number;
  size: number;
}

// Parser options
export interface ParserOptions {
  strictMode?: boolean;
  allowPartialQueries?: boolean;
  maxDepth?: number;
  validateSemantics?: boolean;
}

// Executor options
export interface ExecutorOptions {
  timeout?: number;
  maxRows?: number;
  useCache?: boolean;
  cacheTTL?: number;
  explainOnly?: boolean;
  format?: 'json' | 'csv' | 'table';
}

// Error types
export class QueryError extends Error {
  constructor(
    message: string,
    public position?: number,
    public line?: number,
    public column?: number,
    public severity: 'error' | 'warning' = 'error'
  ) {
    super(message);
    this.name = 'QueryError';
  }
}

export class ParseError extends QueryError {
  constructor(message: string, token?: Token) {
    super(
      message,
      token?.position,
      token?.line,
      token?.column
    );
    this.name = 'ParseError';
  }
}

export class ExecutionError extends QueryError {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'ExecutionError';
  }
}

// Machine data interface (matches database schema)
export interface MachineData {
  id?: string;
  computer_name: string;
  role?: string;
  os_platform?: string;
  os_version?: string;
  group_name?: string;
  location?: string;
  disk_free_gb?: number;
  memory_gb?: number;
  cpu_percent?: number;
  compliance_score?: number;
  last_reboot?: string;
  last_seen?: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

// Sensor definition
export interface Sensor {
  name: string;
  key: string;
  category: string;
  type: 'text' | 'number' | 'date' | 'boolean';
  description?: string;
  script?: string;
  parameters?: Record<string, any>;
}

// Saved query interface
export interface SavedQuery {
  id: string;
  name: string;
  question: string;
  description?: string;
  tags?: string[];
  userId?: string;
  createdAt: string;
  updatedAt: string;
  executionCount?: number;
  lastExecuted?: string;
  averageTimeMs?: number;
}

// Query template interface
export interface QueryTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
  parameters: Array<{
    name: string;
    type: 'text' | 'number' | 'date' | 'select';
    required: boolean;
    default?: any;
    options?: string[];
  }>;
  category: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  examples?: string[];
}

// Real-time subscription
export interface QuerySubscription {
  id: string;
  query: string;
  interval?: number;
  onChange?: (result: QueryResult) => void;
  onError?: (error: Error) => void;
  active: boolean;
}

// All types are already exported directly above