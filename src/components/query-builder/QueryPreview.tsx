"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Code,
  AlertCircle,
  Info,
  CheckCircle,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';

import {
  QueryPreviewProps,
  PartialQuery,
  ValidationState
} from './types/queryBuilder';

export function QueryPreview({
  query,
  validation,
  syntaxHighlight = true,
  showWarnings = true,
  className = ""
}: QueryPreviewProps) {
  const [showRaw, setShowRaw] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  // Build query string from partial query
  const queryString = useMemo(() => {
    if (query.rawQuery && query.rawQuery.trim()) {
      return query.rawQuery;
    }

    const parts: string[] = [];

    // GET clause
    if (query.sensors.length > 0 || query.aggregates.length > 0) {
      parts.push('Get');

      // Add sensors
      const sensorParts = query.sensors.map(s => {
        let sensorStr = 'name' in s.sensor ? (s.sensor.name || '') : '';
        if (s.filter) {
          sensorStr += ` ${s.filter.operator} "${s.filter.value}"`;
        }
        return sensorStr;
      });

      // Add aggregates
      const aggregateParts = query.aggregates.map(a => {
        return `${a.function}(${a.sensor || ''})`;
      });

      parts.push([...sensorParts, ...aggregateParts].join(' and '));
    }

    // FROM clause
    parts.push('from');
    if (query.scope.type === 'all') {
      parts.push('all machines');
    } else if (query.scope.type === 'group' && query.scope.computerGroup) {
      parts.push(`group "${query.scope.computerGroup}"`);
    } else if (query.scope.type === 'custom' && query.scope.customFilter) {
      // Custom targeting will be handled separately
      parts.push('all machines');
    }

    // WHERE clause
    if (query.filters.length > 0) {
      parts.push('where');
      const filterParts = query.filters.map(f => {
        return `${f.sensor} ${f.operator.replace('_', ' ')} "${f.value}"`;
      });
      parts.push(filterParts.join(` ${query.filterLogic.toLowerCase()} `));
    }

    // GROUP BY clause
    if (query.groupBy.length > 0) {
      parts.push('group by');
      parts.push(query.groupBy.join(', '));
    }

    // ORDER BY clause
    if (query.orderBy.length > 0) {
      parts.push('order by');
      const orderParts = query.orderBy.map(o => {
        return `${o.sensor} ${o.direction}`;
      });
      parts.push(orderParts.join(', '));
    }

    // LIMIT clause
    if (query.limit) {
      parts.push(`limit ${query.limit}`);
    }

    return parts.join(' ');
  }, [query]);

  // Apply syntax highlighting
  const highlightedQuery = useMemo(() => {
    if (!syntaxHighlight || showRaw) {
      return queryString;
    }

    let highlighted = queryString;

    // Keywords
    const keywords = [
      'Get', 'from', 'where', 'with', 'group by', 'order by', 'limit',
      'and', 'or', 'all machines', 'group'
    ];
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b(${keyword})\\b`, 'gi');
      highlighted = highlighted.replace(regex, `<span class="text-blue-400 font-semibold">$1</span>`);
    });

    // Operators
    const operators = [
      'contains', 'does not contain', 'equals', 'not equals',
      'greater than', 'less than', 'starts with', 'ends with', 'matches'
    ];
    operators.forEach(op => {
      const regex = new RegExp(`\\b(${op})\\b`, 'gi');
      highlighted = highlighted.replace(regex, `<span class="text-purple-400">$1</span>`);
    });

    // Aggregate functions
    const aggregates = ['count', 'min', 'max', 'avg', 'sum'];
    aggregates.forEach(func => {
      const regex = new RegExp(`\\b(${func})\\(`, 'gi');
      highlighted = highlighted.replace(regex, `<span class="text-green-400">$1</span>(`);
    });

    // Strings (quoted values)
    highlighted = highlighted.replace(/"([^"]*)"/g, `<span class="text-yellow-400">"$1"</span>`);

    // Numbers
    highlighted = highlighted.replace(/\b(\d+)\b/g, `<span class="text-orange-400">$1</span>`);

    // Sensor names (capitalize first letter of each word for common sensors)
    const commonSensors = [
      'Computer Name', 'Operating System', 'IP Address', 'CPU Percent',
      'Disk Free GB', 'Memory GB', 'Last Reboot', 'Last Logged In User'
    ];
    commonSensors.forEach(sensor => {
      const regex = new RegExp(`\\b(${sensor})\\b`, 'gi');
      highlighted = highlighted.replace(regex, `<span class="text-cyan-400">$1</span>`);
    });

    return highlighted;
  }, [queryString, syntaxHighlight, showRaw]);

  // Copy to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(queryString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Get validation icon
  const getValidationIcon = () => {
    if (!validation.isValid) {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
    if (validation.warnings.length > 0) {
      return <Info className="h-4 w-4 text-yellow-500" />;
    }
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  return (
    <Card className={`glass border-white/10 ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-white">
            <Code className="mr-2 h-5 w-5" />
            Query Preview
          </CardTitle>
          <div className="flex items-center space-x-2">
            {getValidationIcon()}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowRaw(!showRaw)}
              className="text-gray-400 hover:text-white"
            >
              {showRaw ? (
                <>
                  <Eye className="mr-1 h-3 w-3" />
                  Formatted
                </>
              ) : (
                <>
                  <EyeOff className="mr-1 h-3 w-3" />
                  Raw
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCopy}
              className="text-gray-400 hover:text-white"
            >
              {copied ? (
                <CheckCircle className="h-4 w-4 text-green-400" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Query display */}
        <div className="relative">
          <div
            className="p-4 bg-gray-900 rounded border border-gray-700 font-mono text-sm overflow-x-auto"
            style={{ minHeight: '60px' }}
          >
            {queryString ? (
              showRaw ? (
                <pre className="text-gray-300 whitespace-pre-wrap">{queryString}</pre>
              ) : (
                <div
                  className="text-gray-300"
                  dangerouslySetInnerHTML={{ __html: highlightedQuery }}
                />
              )
            ) : (
              <span className="text-gray-500 italic">
                Start building your query above...
              </span>
            )}
          </div>

          {/* Validation overlay for empty query */}
          {!queryString && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Badge variant="outline" className="border-gray-600 text-gray-400">
                Empty Query
              </Badge>
            </div>
          )}
        </div>

        {/* Validation errors */}
        {validation.errors.length > 0 && (
          <Alert className="border-red-500 bg-red-500/10">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-400">
              <div className="font-semibold mb-1">Query Errors:</div>
              <ul className="list-disc list-inside space-y-1">
                {validation.errors.map((error, index) => (
                  <li key={index} className="text-sm">
                    {error.field && <span className="font-mono">{error.field}: </span>}
                    {error.message}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Validation warnings */}
        {showWarnings && validation.warnings.length > 0 && (
          <Alert className="border-yellow-500 bg-yellow-500/10">
            <Info className="h-4 w-4 text-yellow-500" />
            <AlertDescription className="text-yellow-400">
              <div className="font-semibold mb-1">Warnings:</div>
              <ul className="list-disc list-inside space-y-1">
                {validation.warnings.map((warning, index) => (
                  <li key={index} className="text-sm">
                    {warning.field && <span className="font-mono">{warning.field}: </span>}
                    {warning.message}
                    {warning.suggestion && (
                      <div className="ml-4 text-xs text-yellow-300 mt-0.5">
                        💡 {warning.suggestion}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Success message */}
        {validation.isValid && queryString && (
          <Alert className="border-green-500 bg-green-500/10">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-400">
              Query is valid and ready to execute
            </AlertDescription>
          </Alert>
        )}

        {/* Query metadata */}
        {queryString && (
          <div className="flex flex-wrap gap-2">
            {query.sensors.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {query.sensors.length} sensor{query.sensors.length !== 1 ? 's' : ''}
              </Badge>
            )}
            {query.aggregates.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {query.aggregates.length} aggregate{query.aggregates.length !== 1 ? 's' : ''}
              </Badge>
            )}
            {query.filters.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {query.filters.length} filter{query.filters.length !== 1 ? 's' : ''}
              </Badge>
            )}
            {query.groupBy.length > 0 && (
              <Badge variant="outline" className="text-xs">
                Grouped by {query.groupBy.length} field{query.groupBy.length !== 1 ? 's' : ''}
              </Badge>
            )}
            {query.orderBy.length > 0 && (
              <Badge variant="outline" className="text-xs">
                Sorted by {query.orderBy.length} field{query.orderBy.length !== 1 ? 's' : ''}
              </Badge>
            )}
            {query.limit && (
              <Badge variant="outline" className="text-xs">
                Limited to {query.limit} rows
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}