import { useState, useCallback, useMemo } from 'react';
import type {
  UseNaturalLanguage,
  NaturalLanguageResult,
  QuerySuggestion,
  PartialQuery,
  SensorSelection,
  FilterSelection,
  QueryAlternative
} from '../types/queryBuilder';
import type { Sensor } from '@/lib/tanium-query-engine/types';
import { SENSORS_CATALOG } from '@/lib/tanium-query-engine/field-mappings';

// Common query patterns for recognition
const queryPatterns = [
  { pattern: /show\s+(?:me\s+)?all\s+(.+)/i, type: 'list' },
  { pattern: /get\s+(.+)\s+from\s+(.+)/i, type: 'query' },
  { pattern: /find\s+(.+)\s+where\s+(.+)/i, type: 'filter' },
  { pattern: /count\s+(.+)/i, type: 'aggregate' },
  { pattern: /how\s+many\s+(.+)/i, type: 'count' },
  { pattern: /top\s+(\d+)\s+(.+)/i, type: 'limit' },
  { pattern: /(.+)\s+with\s+(.+)\s+(?:greater|more|higher)\s+than\s+(.+)/i, type: 'comparison' },
  { pattern: /(.+)\s+(?:contains|containing)\s+(.+)/i, type: 'contains' },
];

// Sensor name mappings for natural language
const sensorMappings: Record<string, string[]> = {
  'Computer Name': ['computer', 'machine', 'endpoint', 'device', 'name', 'hostname'],
  'Operating System': ['os', 'operating system', 'windows', 'linux', 'mac', 'platform'],
  'IP Address': ['ip', 'address', 'network', 'ip address'],
  'CPU Percent': ['cpu', 'processor', 'cpu usage', 'processor usage', 'cpu percent'],
  'Memory GB': ['memory', 'ram', 'mem', 'memory usage'],
  'Disk Free GB': ['disk', 'storage', 'disk space', 'free space', 'available space'],
  'Last Logged In User': ['user', 'logged in', 'last user', 'username'],
  'Last Reboot': ['reboot', 'restart', 'boot time', 'uptime'],
  'Compliance Score': ['compliance', 'score', 'compliance score', 'security score'],
  'Is Virtual': ['virtual', 'vm', 'virtual machine', 'virtualized'],
};

// Operator mappings
const operatorMappings: Record<string, string[]> = {
  'contains': ['contains', 'containing', 'includes', 'including', 'with'],
  'equals': ['equals', 'is', 'equal to', 'exactly'],
  'greater_than': ['greater than', 'more than', 'higher than', 'above', '>'],
  'less_than': ['less than', 'lower than', 'below', 'under', '<'],
  'starts_with': ['starts with', 'beginning with', 'starting'],
  'ends_with': ['ends with', 'ending with', 'ending'],
};

export function useNaturalLanguage(): UseNaturalLanguage {
  const [isProcessing, setIsProcessing] = useState(false);

  // Parse natural language to query
  const parse = useCallback(async (text: string): Promise<NaturalLanguageResult> => {
    setIsProcessing(true);

    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const query: PartialQuery = {
        sensors: [],
        aggregates: [],
        scope: { type: 'all' },
        filters: [],
        filterLogic: 'AND',
        groupBy: [],
        orderBy: [],
        limit: undefined
      };

      const alternatives: QueryAlternative[] = [];
      let confidence = 0;
      let interpretation = '';

      // Try to match patterns
      for (const { pattern, type } of queryPatterns) {
        const match = text.match(pattern);
        if (match) {
          switch (type) {
            case 'list':
            case 'query':
              // Extract sensors
              const sensorText = match[1] || match[2];
              const sensors = extractSensors(sensorText);
              sensors.forEach(sensor => {
                query.sensors.push({
                  sensor: { name: sensor, key: sensor.toLowerCase().replace(/\s+/g, '_'), type: 'text', category: 'General' } as Sensor,
                  isValid: true
                });
              });
              confidence = 0.8;
              interpretation = `Query for ${sensors.join(', ')}`;
              break;

            case 'filter':
            case 'contains':
            case 'comparison':
              // Extract filters
              const filterInfo = extractFilters(text);
              query.filters = filterInfo.filters;
              query.sensors = filterInfo.sensors;
              confidence = 0.75;
              interpretation = `Filter by ${filterInfo.filters.map(f => f.sensor).join(', ')}`;
              break;

            case 'count':
            case 'aggregate':
              // Add count aggregate
              query.aggregates.push({ function: 'count' });
              const countSensors = extractSensors(match[1]);
              countSensors.forEach(sensor => {
                query.sensors.push({
                  sensor: { name: sensor, key: sensor.toLowerCase().replace(/\s+/g, '_'), type: 'text', category: 'General' } as Sensor,
                  isValid: true
                });
              });
              confidence = 0.85;
              interpretation = `Count ${countSensors.join(', ')}`;
              break;

            case 'limit':
              // Extract limit
              query.limit = parseInt(match[1]);
              const limitSensors = extractSensors(match[2]);
              limitSensors.forEach(sensor => {
                query.sensors.push({
                  sensor: { name: sensor, key: sensor.toLowerCase().replace(/\s+/g, '_'), type: 'text', category: 'General' } as Sensor,
                  isValid: true
                });
              });
              confidence = 0.9;
              interpretation = `Top ${query.limit} ${limitSensors.join(', ')}`;
              break;
          }
          break;
        }
      }

      // Fallback: try to extract any sensors mentioned
      if (query.sensors.length === 0) {
        const sensors = extractSensors(text);
        if (sensors.length > 0) {
          sensors.forEach(sensor => {
            query.sensors.push({
              sensor: { name: sensor, key: sensor.toLowerCase().replace(/\s+/g, '_'), type: 'text', category: 'General' } as Sensor,
              isValid: true
            });
          });
          confidence = 0.5;
          interpretation = `Query for ${sensors.join(', ')}`;
        } else {
          // Default to Computer Name
          query.sensors.push({
            sensor: { name: 'Computer Name', key: 'computer_name', type: 'text', category: 'System' } as Sensor,
            isValid: true
          });
          confidence = 0.3;
          interpretation = 'Default query for Computer Name';
        }
      }

      // Generate alternatives
      if (confidence < 0.8) {
        alternatives.push({
          query: {
            ...query,
            sensors: [
              { sensor: { name: 'Computer Name', key: 'computer_name', type: 'text', category: 'System' } as Sensor, isValid: true },
              { sensor: { name: 'Operating System', key: 'os_platform', type: 'text', category: 'System' } as Sensor, isValid: true }
            ]
          },
          confidence: 0.6,
          explanation: 'Show computer names and operating systems'
        });

        alternatives.push({
          query: {
            ...query,
            sensors: [{ sensor: { name: 'Computer Name', key: 'computer_name', type: 'text', category: 'System' } as Sensor, isValid: true }],
            filters: [{
              id: 'filter-1',
              sensor: 'Operating System',
              operator: 'contains',
              value: 'Windows',
              dataType: 'text'
            }]
          },
          confidence: 0.5,
          explanation: 'Show Windows computers'
        });
      }

      return {
        query,
        confidence,
        alternatives,
        interpretation
      };
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // Extract sensors from text
  const extractSensors = useCallback((text: string): string[] => {
    const foundSensors: string[] = [];
    const lowerText = text.toLowerCase();

    for (const [sensor, keywords] of Object.entries(sensorMappings)) {
      for (const keyword of keywords) {
        if (lowerText.includes(keyword)) {
          foundSensors.push(sensor);
          break;
        }
      }
    }

    return foundSensors.length > 0 ? foundSensors : ['Computer Name'];
  }, []);

  // Extract filters from text
  const extractFilters = useCallback((text: string): { filters: FilterSelection[], sensors: SensorSelection[] } => {
    const filters: FilterSelection[] = [];
    const sensors: SensorSelection[] = [];
    const lowerText = text.toLowerCase();

    // Look for filter conditions
    for (const [operator, keywords] of Object.entries(operatorMappings)) {
      for (const keyword of keywords) {
        if (lowerText.includes(keyword)) {
          // Try to extract sensor and value
          const pattern = new RegExp(`(\\w+(?:\\s+\\w+)*?)\\s+${keyword}\\s+["']?([^"']+)["']?`, 'i');
          const match = text.match(pattern);

          if (match) {
            const sensorName = extractSensors(match[1])[0] || 'Computer Name';
            filters.push({
              id: `filter-${Date.now()}`,
              sensor: sensorName,
              operator: operator as any,
              value: match[2].trim(),
              dataType: 'text'
            });

            sensors.push({
              sensor: { name: sensorName, key: sensorName.toLowerCase().replace(/\s+/g, '_'), type: 'text', category: 'General' } as Sensor,
              isValid: true
            });
          }
        }
      }
    }

    return { filters, sensors };
  }, [extractSensors]);

  // Get suggestions based on partial input
  const getSuggestions = useCallback((text: string, context: PartialQuery): QuerySuggestion[] => {
    const suggestions: QuerySuggestion[] = [];
    const lowerText = text.toLowerCase();

    if (text.length < 2) return suggestions;

    // Suggest sensors
    for (const [sensor, keywords] of Object.entries(sensorMappings)) {
      if (keywords.some(k => k.includes(lowerText) || lowerText.includes(k))) {
        suggestions.push({
          id: `sensor-${sensor}`,
          type: 'sensor',
          text: `Get ${sensor} from all machines`,
          displayText: sensor,
          description: `Add ${sensor} sensor to query`,
          confidence: 0.8,
          category: 'Sensors'
        });
      }
    }

    // Suggest common templates
    if (lowerText.includes('cpu') || lowerText.includes('high')) {
      suggestions.push({
        id: 'template-high-cpu',
        type: 'template',
        text: 'Get Computer Name and CPU Percent from all machines where CPU Percent greater than 80',
        displayText: 'High CPU usage',
        description: 'Find machines with CPU > 80%',
        confidence: 0.9,
        category: 'Templates',
        runtime: 150
      });
    }

    if (lowerText.includes('disk') || lowerText.includes('space')) {
      suggestions.push({
        id: 'template-low-disk',
        type: 'template',
        text: 'Get Computer Name and Disk Free GB from all machines where Disk Free GB less than 50',
        displayText: 'Low disk space',
        description: 'Find machines with < 50GB free',
        confidence: 0.9,
        category: 'Templates',
        runtime: 120
      });
    }

    if (lowerText.includes('windows')) {
      suggestions.push({
        id: 'filter-windows',
        type: 'filter',
        text: 'where Operating System contains "Windows"',
        displayText: 'Filter Windows machines',
        description: 'Add Windows filter',
        confidence: 0.85,
        category: 'Filters'
      });
    }

    // Sort by confidence
    suggestions.sort((a, b) => b.confidence - a.confidence);

    return suggestions.slice(0, 10);
  }, []);

  return {
    parse,
    getSuggestions,
    isProcessing
  };
}