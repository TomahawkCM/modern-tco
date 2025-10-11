"use client";

import React, { useReducer, useCallback, useEffect, useState, useMemo, lazy, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Search,
  Play,
  RotateCcw,
  Download,
  Save,
  History,
  Sparkles,
  Code,
  MousePointer,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';

// Sub-components
// Lazy load NaturalLanguageInput for better performance (saves ~30% bundle size)
const NaturalLanguageInput = lazy(() =>
  import('./NaturalLanguageInput').then(module => ({ default: module.NaturalLanguageInput }))
);
import { SensorSelector } from './SensorSelector';
import { FilterBuilder } from './FilterBuilder';
import { QueryPreview } from './QueryPreview';
import { ResultsViewer } from './ResultsViewer';

// Hooks (to be implemented)
import { useQueryValidation } from './hooks/useQueryValidation';
import { useNaturalLanguage } from './hooks/useNaturalLanguage';
import { useSensorCatalog } from './hooks/useSensorCatalog';
import { useDebouncedCallback } from './utils/performance';

// Query engine integration
import { TaniumQueryEngine } from '@/lib/tanium-query-engine';
import type { QueryResult } from '@/lib/tanium-query-engine/types';

// Types
import {
  type QuestionBuilderProps,
  type QueryBuilderState,
  type QueryBuilderAction,
  type BuilderMode,
  type PartialQuery,
  SensorSelection,
  FilterSelection,
  type QueryHistoryItem,
  type ValidationState,
  type ScopeSelection,
} from './types/queryBuilder';

// Query builder reducer
function queryBuilderReducer(
  state: QueryBuilderState,
  action: QueryBuilderAction
): QueryBuilderState {
  switch (action.type) {
    case 'SET_MODE':
      return { ...state, mode: action.mode };

    case 'ADD_SENSOR':
      return {
        ...state,
        query: {
          ...state.query,
          sensors: [...state.query.sensors, action.sensor]
        }
      };

    case 'REMOVE_SENSOR':
      return {
        ...state,
        query: {
          ...state.query,
          sensors: state.query.sensors.filter((_, i) => i !== action.index)
        }
      };

    case 'UPDATE_SENSOR':
      return {
        ...state,
        query: {
          ...state.query,
          sensors: state.query.sensors.map((s, i) =>
            i === action.index ? action.sensor : s
          )
        }
      };

    case 'ADD_FILTER':
      return {
        ...state,
        query: {
          ...state.query,
          filters: [...state.query.filters, action.filter]
        }
      };

    case 'REMOVE_FILTER':
      return {
        ...state,
        query: {
          ...state.query,
          filters: state.query.filters.filter(f => f.id !== action.filterId)
        }
      };

    case 'UPDATE_FILTER':
      return {
        ...state,
        query: {
          ...state.query,
          filters: state.query.filters.map(f =>
            f.id === action.filterId ? action.filter : f
          )
        }
      };

    case 'SET_SCOPE':
      return {
        ...state,
        query: {
          ...state.query,
          scope: action.scope
        }
      };

    case 'SET_GROUP_BY':
      return {
        ...state,
        query: {
          ...state.query,
          groupBy: action.groupBy
        }
      };

    case 'SET_ORDER_BY':
      return {
        ...state,
        query: {
          ...state.query,
          orderBy: action.orderBy
        }
      };

    case 'SET_LIMIT':
      return {
        ...state,
        query: {
          ...state.query,
          limit: action.limit
        }
      };

    case 'SET_RAW_QUERY':
      return {
        ...state,
        query: {
          ...state.query,
          rawQuery: action.query
        }
      };

    case 'SET_VALIDATION':
      return { ...state, validation: action.validation };

    case 'SET_SUGGESTIONS':
      return { ...state, suggestions: action.suggestions };

    case 'SET_RESULT':
      return { ...state, result: action.result };

    case 'SET_EXECUTING':
      return { ...state, isExecuting: action.isExecuting };

    case 'ADD_TO_HISTORY':
      return {
        ...state,
        history: [action.item, ...state.history].slice(0, 50) // Keep last 50
      };

    case 'RESET_QUERY':
      return {
        ...state,
        query: initialQuery,
        validation: initialValidation,
        result: undefined
      };

    default:
      return state;
  }
}

// Initial states
const initialQuery: PartialQuery = {
  sensors: [],
  aggregates: [],
  scope: { type: 'all' },
  filters: [],
  filterLogic: 'AND',
  groupBy: [],
  orderBy: [],
  limit: undefined,
  rawQuery: ''
};

const initialValidation: ValidationState = {
  isValid: false,
  errors: [],
  warnings: [],
  syntaxValid: false,
  semanticValid: false
};

const initialState: QueryBuilderState = {
  mode: 'guided',
  query: initialQuery,
  validation: initialValidation,
  suggestions: [],
  isExecuting: false,
  result: undefined,
  history: []
};

export function QuestionBuilder({
  initialQuery: providedInitialQuery,
  mode = 'guided',
  onQueryChange,
  onExecute,
  readOnly = false,
  showResults = true,
  showHistory = true,
  maxHeight = '800px',
  className = ''
}: QuestionBuilderProps) {
  const [state, dispatch] = useReducer(queryBuilderReducer, {
    ...initialState,
    mode,
    query: providedInitialQuery || initialQuery
  });

  const [queryEngine] = useState(() => new TaniumQueryEngine());
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);

  // Custom hooks
  const { validate, getQueryString } = useQueryValidation();
  const { parse: parseNaturalLanguage, getSuggestions, isProcessing } = useNaturalLanguage();
  const { catalog, search: searchSensors, categories, popularSensors } = useSensorCatalog();

  // Validate query on changes
  useEffect(() => {
    const validation = validate(state.query);
    dispatch({ type: 'SET_VALIDATION', validation });
  }, [state.query, validate]);

  // Notify parent of query changes
  useEffect(() => {
    if (onQueryChange) {
      onQueryChange(state.query);
    }
  }, [state.query, onQueryChange]);

  // Execute query
  const handleExecute = useCallback(async () => {
    if (readOnly || !state.validation.isValid) return;

    dispatch({ type: 'SET_EXECUTING', isExecuting: true });

    try {
      const queryString = getQueryString(state.query);
      const result = await queryEngine.query(queryString);

      dispatch({ type: 'SET_RESULT', result });

      // Add to history
      const historyItem: QueryHistoryItem = {
        id: `query-${Date.now()}`,
        query: queryString,
        timestamp: new Date().toISOString(),
        executionTime: result.execution?.totalTimeMs,
        resultCount: result.rowCount,
        success: result.ok
      };
      dispatch({ type: 'ADD_TO_HISTORY', item: historyItem });

      // Notify parent
      if (onExecute) {
        onExecute(queryString, result);
      }
    } catch (error) {
      console.error('Query execution error:', error);
      const errorResult: QueryResult = {
        ok: false,
        error: error instanceof Error ? error.message : 'Query execution failed'
      };
      dispatch({ type: 'SET_RESULT', result: errorResult });
    } finally {
      dispatch({ type: 'SET_EXECUTING', isExecuting: false });
    }
  }, [state.query, state.validation.isValid, queryEngine, getQueryString, onExecute, readOnly]);

  // Handle natural language input
  const handleNaturalLanguageSubmit = useCallback(async (text: string) => {
    const result = await parseNaturalLanguage(text);
    if (result.query) {
      dispatch({ type: 'RESET_QUERY' });
      // Apply the parsed query
      result.query.sensors.forEach(sensor => {
        dispatch({ type: 'ADD_SENSOR', sensor });
      });
      result.query.filters.forEach(filter => {
        dispatch({ type: 'ADD_FILTER', filter });
      });
      if (result.query.scope) {
        dispatch({ type: 'SET_SCOPE', scope: result.query.scope });
      }
    }
  }, [parseNaturalLanguage]);

  // Load query from history
  const handleLoadFromHistory = useCallback((item: QueryHistoryItem) => {
    dispatch({ type: 'SET_RAW_QUERY', query: item.query });
    if (state.mode === 'advanced') {
      // Parse and load in advanced mode
      handleExecute();
    }
    setShowHistoryPanel(false);
  }, [state.mode, handleExecute]);

  // Get validation status
  const getValidationStatus = () => {
    if (state.validation.errors.length > 0) {
      return { icon: AlertCircle, color: 'text-red-500', text: 'Invalid query' };
    }
    if (state.validation.warnings.length > 0) {
      return { icon: Info, color: 'text-[#f97316]', text: 'Query has warnings' };
    }
    if (state.validation.isValid) {
      return { icon: CheckCircle, color: 'text-[#22c55e]', text: 'Valid query' };
    }
    return { icon: AlertCircle, color: 'text-muted-foreground', text: 'Incomplete query' };
  };

  const validationStatus = getValidationStatus();

  return (
    <Card className={`glass border-white/10 ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-foreground">
            <Search className="mr-2 h-5 w-5 text-tanium-accent" />
            Tanium Question Builder
          </CardTitle>
          <div className="flex items-center space-x-2">
            {/* Validation status */}
            <div className="flex items-center space-x-1">
              <validationStatus.icon className={`h-4 w-4 ${validationStatus.color}`} />
              <span className={`text-sm ${validationStatus.color}`}>
                {validationStatus.text}
              </span>
            </div>

            {/* Action buttons */}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => dispatch({ type: 'RESET_QUERY' })}
              disabled={readOnly}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>

            {showHistory && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowHistoryPanel(!showHistoryPanel)}
              >
                <History className="h-4 w-4" />
                <Badge variant="secondary" className="ml-1">
                  {state.history.length}
                </Badge>
              </Button>
            )}

            <Button
              size="sm"
              onClick={handleExecute}
              disabled={readOnly || !state.validation.isValid || state.isExecuting}
              className="bg-tanium-accent hover:bg-blue-600"
            >
              {state.isExecuting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2" />
                  Executing...
                </div>
              ) : (
                <>
                  <Play className="mr-1 h-4 w-4" />
                  Execute Query
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4" style={{ maxHeight, overflow: 'auto' }}>
        {/* Mode selector */}
        <Tabs
          value={state.mode}
          onValueChange={(value) => dispatch({ type: 'SET_MODE', mode: value as BuilderMode })}
        >
          <TabsList className="grid w-full grid-cols-3 bg-card">
            <TabsTrigger value="guided" className="flex items-center">
              <MousePointer className="mr-2 h-4 w-4" />
              Guided
            </TabsTrigger>
            <TabsTrigger value="natural-language" className="flex items-center">
              <Sparkles className="mr-2 h-4 w-4" />
              Natural Language
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center">
              <Code className="mr-2 h-4 w-4" />
              Advanced
            </TabsTrigger>
          </TabsList>

          {/* Guided mode */}
          <TabsContent value="guided" className="space-y-4">
            <div className="space-y-4">
              {/* Sensor selection */}
              <SensorSelector
                selectedSensors={state.query.sensors}
                onAdd={(sensor) => dispatch({ type: 'ADD_SENSOR', sensor })}
                onRemove={(index) => dispatch({ type: 'REMOVE_SENSOR', index })}
                onUpdate={(index, sensor) => dispatch({ type: 'UPDATE_SENSOR', index, sensor })}
                catalog={catalog}
                className="mb-4"
              />

              {/* Filter builder */}
              <FilterBuilder
                filters={state.query.filters}
                onAdd={(filter) => dispatch({ type: 'ADD_FILTER', filter })}
                onRemove={(filterId) => dispatch({ type: 'REMOVE_FILTER', filterId })}
                onUpdate={(filterId, filter) => dispatch({ type: 'UPDATE_FILTER', filterId, filter })}
                availableSensors={catalog.map(c => 'name' in c.sensor ? c.sensor.name : '')}
                filterLogic={state.query.filterLogic}
                onLogicChange={(logic) =>
                  dispatch({
                    type: 'SET_SCOPE',
                    scope: { ...state.query.scope, customFilter: state.query.filters } as ScopeSelection
                  })
                }
                allowNested
                className="mb-4"
              />

              {/* Query preview */}
              <QueryPreview
                query={state.query}
                validation={state.validation}
                syntaxHighlight
                showWarnings
                className="mb-4"
              />
            </div>
          </TabsContent>

          {/* Natural language mode with lazy loading */}
          <TabsContent value="natural-language" className="space-y-4">
            <Suspense fallback={
              <div className="flex items-center justify-center p-8">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-tanium-accent"></div>
                  <span className="text-muted-foreground">Loading Natural Language mode...</span>
                </div>
              </div>
            }>
              <NaturalLanguageInput
                value={state.query.rawQuery || ''}
                onChange={(value) => dispatch({ type: 'SET_RAW_QUERY', query: value })}
                onSubmit={handleNaturalLanguageSubmit}
                suggestions={state.suggestions}
                isProcessing={isProcessing}
                placeholder="Type a natural language query (e.g., 'Show me all Windows servers with high CPU usage')"
                className="mb-4"
              />
            </Suspense>

            {/* Query preview */}
            {state.query.sensors.length > 0 && (
              <QueryPreview
                query={state.query}
                validation={state.validation}
                syntaxHighlight
                showWarnings
                className="mb-4"
              />
            )}
          </TabsContent>

          {/* Advanced mode */}
          <TabsContent value="advanced" className="space-y-4">
            <div className="space-y-4">
              <textarea
                className="w-full h-32 p-3 bg-card border border-gray-600 rounded text-foreground font-mono text-sm"
                placeholder="Enter Tanium query directly (e.g., Get Computer Name from all machines)"
                value={state.query.rawQuery}
                onChange={(e) => dispatch({ type: 'SET_RAW_QUERY', query: e.target.value })}
                disabled={readOnly}
              />

              {/* Validation errors/warnings */}
              {state.validation.errors.length > 0 && (
                <Alert className="border-red-500 bg-red-500/10">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <AlertDescription className="text-red-400">
                    {state.validation.errors[0].message}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Results viewer */}
        {showResults && state.result && (
          <ResultsViewer
            result={state.result}
            isLoading={state.isExecuting}
            onExport={(format) => {
              // Export functionality
              console.log('Export as:', format);
            }}
            className="mt-4"
          />
        )}

        {/* History panel */}
        {showHistory && showHistoryPanel && (
          <Card className="glass border-white/10 mt-4">
            <CardHeader>
              <CardTitle className="text-foreground text-sm">Query History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {state.history.map((item) => (
                  <div
                    key={item.id}
                    className="p-2 bg-card rounded hover:bg-gray-700 cursor-pointer"
                    onClick={() => handleLoadFromHistory(item)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <code className="text-xs text-muted-foreground block">
                          {item.query}
                        </code>
                      </div>
                      <div className="text-xs text-muted-foreground ml-2">
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                    {item.resultCount !== undefined && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {item.resultCount} results • {item.executionTime}ms
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}