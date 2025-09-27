/**
 * Tanium Question Builder Types
 * TypeScript interfaces for the interactive Question Builder
 */

import {
  QueryNode,
  FilterNode,
  Sensor,
  QueryResult,
  FieldMapping,
  FilterOperator
} from '@/lib/tanium-query-engine/types';

// Re-export imported types
export type { FilterOperator };

// Question Builder Modes
export type BuilderMode = 'guided' | 'advanced' | 'natural-language';

// Query Building State
export interface QueryBuilderState {
  mode: BuilderMode;
  query: PartialQuery;
  validation: ValidationState;
  suggestions: QuerySuggestion[];
  isExecuting: boolean;
  result?: QueryResult;
  history: QueryHistoryItem[];
}

// Partial Query for building
export interface PartialQuery {
  // GET clause
  sensors: SensorSelection[];
  aggregates: AggregateSelection[];

  // FROM clause
  scope: ScopeSelection;

  // WHERE clause
  filters: FilterSelection[];
  filterLogic: 'AND' | 'OR';

  // GROUP BY
  groupBy: string[];

  // ORDER BY
  orderBy: OrderBySelection[];

  // LIMIT
  limit?: number;

  // Raw query text (for advanced mode)
  rawQuery?: string;
}

// Sensor selection with parameters
export interface SensorSelection {
  sensor: Sensor | FieldMapping;
  parameters?: Record<string, any>;
  filter?: {
    operator: FilterOperator;
    value: string | number;
    column?: string;
  };
  alias?: string;
  isValid: boolean;
}

// Aggregate selection
export interface AggregateSelection {
  function: 'count' | 'min' | 'max' | 'avg' | 'sum';
  sensor?: string;
  alias?: string;
}

// Scope/targeting selection
export interface ScopeSelection {
  type: 'all' | 'group' | 'custom';
  computerGroup?: string;
  customFilter?: FilterSelection[];
}

// Filter selection for WHERE clause
export interface FilterSelection {
  id: string;
  sensor: string;
  operator: FilterOperator;
  value: string | number | boolean;
  dataType: 'text' | 'number' | 'date' | 'boolean';
  isNested?: boolean;
  parentId?: string;
  logic?: 'AND' | 'OR';
}

// Order by selection
export interface OrderBySelection {
  sensor: string;
  direction: 'asc' | 'desc';
}

// Validation state
export interface ValidationState {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  syntaxValid: boolean;
  semanticValid: boolean;
}

export interface ValidationError {
  field: string;
  message: string;
  position?: { line: number; column: number };
  severity: 'error' | 'critical';
}

export interface ValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
  severity: 'warning' | 'info';
}

// Query suggestions
export interface QuerySuggestion {
  id: string;
  type: 'sensor' | 'filter' | 'template' | 'complete';
  text: string;
  displayText: string;
  description?: string;
  confidence: number;
  category?: string;
  runtime?: number;
  icon?: string;
}

// Natural language parsing
export interface NaturalLanguageResult {
  query: PartialQuery;
  confidence: number;
  alternatives: QueryAlternative[];
  interpretation: string;
}

export interface QueryAlternative {
  query: PartialQuery;
  confidence: number;
  explanation: string;
}

// Query history
export interface QueryHistoryItem {
  id: string;
  query: string;
  timestamp: string;
  executionTime?: number;
  resultCount?: number;
  success: boolean;
  userId?: string;
  saved?: boolean;
}

// Sensor catalog
export interface SensorCatalogEntry {
  sensor: Sensor | FieldMapping;
  category: string;
  description: string;
  examples?: string[];
  runtime: 'fast' | 'medium' | 'slow';
  runtimeMs?: number;
  popularity: number;
  parameters?: ParameterDefinition[];
  columns?: string[];
}

export interface ParameterDefinition {
  name: string;
  type: 'text' | 'number' | 'select' | 'date';
  required: boolean;
  default?: any;
  options?: Array<{ value: string; label: string }>;
  description?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

// Question templates
export interface QuestionTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  query: PartialQuery;
  explanation?: string;
  tags: string[];
  usageCount: number;
  rating?: number;
}

// Builder actions for state management
export type QueryBuilderAction =
  | { type: 'SET_MODE'; mode: BuilderMode }
  | { type: 'ADD_SENSOR'; sensor: SensorSelection }
  | { type: 'REMOVE_SENSOR'; index: number }
  | { type: 'UPDATE_SENSOR'; index: number; sensor: SensorSelection }
  | { type: 'ADD_FILTER'; filter: FilterSelection }
  | { type: 'REMOVE_FILTER'; filterId: string }
  | { type: 'UPDATE_FILTER'; filterId: string; filter: FilterSelection }
  | { type: 'SET_SCOPE'; scope: ScopeSelection }
  | { type: 'SET_GROUP_BY'; groupBy: string[] }
  | { type: 'SET_ORDER_BY'; orderBy: OrderBySelection[] }
  | { type: 'SET_LIMIT'; limit: number }
  | { type: 'SET_RAW_QUERY'; query: string }
  | { type: 'SET_VALIDATION'; validation: ValidationState }
  | { type: 'SET_SUGGESTIONS'; suggestions: QuerySuggestion[] }
  | { type: 'SET_RESULT'; result: QueryResult }
  | { type: 'SET_EXECUTING'; isExecuting: boolean }
  | { type: 'ADD_TO_HISTORY'; item: QueryHistoryItem }
  | { type: 'LOAD_TEMPLATE'; template: QuestionTemplate }
  | { type: 'RESET_QUERY' };

// Component props
export interface QuestionBuilderProps {
  initialQuery?: PartialQuery;
  mode?: BuilderMode;
  onQueryChange?: (query: PartialQuery) => void;
  onExecute?: (query: string, result: QueryResult) => void;
  readOnly?: boolean;
  showResults?: boolean;
  showHistory?: boolean;
  maxHeight?: string;
  className?: string;
}

export interface NaturalLanguageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  suggestions: QuerySuggestion[];
  isProcessing?: boolean;
  placeholder?: string;
  className?: string;
}

export interface SensorSelectorProps {
  selectedSensors: SensorSelection[];
  onAdd: (sensor: SensorSelection) => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, sensor: SensorSelection) => void;
  catalog: SensorCatalogEntry[];
  maxSensors?: number;
  className?: string;
}

export interface FilterBuilderProps {
  filters: FilterSelection[];
  onAdd: (filter: FilterSelection) => void;
  onRemove: (filterId: string) => void;
  onUpdate: (filterId: string, filter: FilterSelection) => void;
  availableSensors: string[];
  filterLogic: 'AND' | 'OR';
  onLogicChange: (logic: 'AND' | 'OR') => void;
  allowNested?: boolean;
  className?: string;
}

export interface QueryPreviewProps {
  query: PartialQuery;
  validation: ValidationState;
  syntaxHighlight?: boolean;
  showWarnings?: boolean;
  className?: string;
}

export interface ResultsViewerProps {
  result: QueryResult;
  isLoading?: boolean;
  onExport?: (format: 'csv' | 'json') => void;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  pageSize?: number;
  className?: string;
}

// Hooks return types
export interface UseQueryValidation {
  validate: (query: PartialQuery) => ValidationState;
  validateSensor: (sensor: SensorSelection) => boolean;
  validateFilter: (filter: FilterSelection) => boolean;
  getQueryString: (query: PartialQuery) => string;
}

export interface UseNaturalLanguage {
  parse: (text: string) => Promise<NaturalLanguageResult>;
  getSuggestions: (text: string, context: PartialQuery) => QuerySuggestion[];
  isProcessing: boolean;
}

export interface UseSensorCatalog {
  catalog: SensorCatalogEntry[];
  search: (query: string) => SensorCatalogEntry[];
  getByCategory: (category: string) => SensorCatalogEntry[];
  categories: string[];
  popularSensors: SensorCatalogEntry[];
}