import { useCallback } from 'react';
import {
  UseQueryValidation,
  PartialQuery,
  ValidationState,
  ValidationError,
  ValidationWarning,
  SensorSelection,
  FilterSelection
} from '../types/queryBuilder';

export function useQueryValidation(): UseQueryValidation {
  // Validate entire query
  const validate = useCallback((query: PartialQuery): ValidationState => {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Check if query has at least one sensor or aggregate
    if (query.sensors.length === 0 && query.aggregates.length === 0) {
      errors.push({
        field: 'sensors',
        message: 'Query must have at least one sensor or aggregate function',
        severity: 'error'
      });
    }

    // Validate sensors
    query.sensors.forEach((sensor, index) => {
      const sensorName = 'name' in sensor.sensor ? sensor.sensor.name : undefined;
      if (!sensorName || sensorName.trim() === '') {
        errors.push({
          field: `sensor[${index}]`,
          message: 'Sensor name cannot be empty',
          severity: 'error'
        });
      }

      // Check for parameterized sensors without values
      if (sensor.parameters) {
        Object.entries(sensor.parameters).forEach(([key, value]) => {
          if (value === undefined || value === '') {
            warnings.push({
              field: `sensor[${index}].${key}`,
              message: `Parameter "${key}" is empty`,
              suggestion: 'Provide a value or use default',
              severity: 'warning'
            });
          }
        });
      }
    });

    // Validate filters
    query.filters.forEach((filter) => {
      if (!filter.sensor || filter.sensor.trim() === '') {
        errors.push({
          field: `filter[${filter.id}]`,
          message: 'Filter must have a sensor selected',
          severity: 'error'
        });
      }

      if (filter.value === '' || filter.value === undefined) {
        errors.push({
          field: `filter[${filter.id}]`,
          message: 'Filter value cannot be empty',
          severity: 'error'
        });
      }

      // Type-specific validation
      if (filter.dataType === 'number' && isNaN(Number(filter.value))) {
        errors.push({
          field: `filter[${filter.id}]`,
          message: 'Filter value must be a valid number',
          severity: 'error'
        });
      }
    });

    // Validate GROUP BY
    if (query.groupBy.length > 0) {
      // Check if non-grouped sensors are aggregated
      const groupedSensors = new Set(query.groupBy);
      const hasNonAggregatedSensors = query.sensors.some(
        s => !groupedSensors.has('name' in s.sensor ? (s.sensor.name || '') : '')
      );

      if (hasNonAggregatedSensors && query.aggregates.length === 0) {
        errors.push({
          field: 'groupBy',
          message: 'Non-grouped sensors must be aggregated when using GROUP BY',
          severity: 'error'
        });
      }
    }

    // Validate ORDER BY
    if (query.orderBy.length > 0) {
      query.orderBy.forEach((order, index) => {
        if (!order.sensor || order.sensor.trim() === '') {
          errors.push({
            field: `orderBy[${index}]`,
            message: 'ORDER BY must specify a sensor',
            severity: 'error'
          });
        }
      });
    }

    // Validate LIMIT
    if (query.limit !== undefined) {
      if (query.limit <= 0) {
        errors.push({
          field: 'limit',
          message: 'LIMIT must be greater than 0',
          severity: 'error'
        });
      }
      if (query.limit > 10000) {
        warnings.push({
          field: 'limit',
          message: 'LIMIT is very high',
          suggestion: 'Consider using a smaller limit for better performance',
          severity: 'warning'
        });
      }
    }

    // Performance warnings
    if (query.sensors.length > 10) {
      warnings.push({
        field: 'sensors',
        message: 'Many sensors selected',
        suggestion: 'Consider reducing sensors for better performance',
        severity: 'warning'
      });
    }

    if (query.filters.length === 0 && query.scope.type === 'all') {
      warnings.push({
        field: 'filters',
        message: 'No filters applied',
        suggestion: 'Consider adding filters to reduce result set',
        severity: 'info'
      });
    }

    // Determine overall validity
    const isValid = errors.length === 0;
    const syntaxValid = errors.filter(e => e.severity === 'critical').length === 0;
    const semanticValid = isValid;

    return {
      isValid,
      errors,
      warnings,
      syntaxValid,
      semanticValid
    };
  }, []);

  // Validate individual sensor
  const validateSensor = useCallback((sensor: SensorSelection): boolean => {
    const sensorName = 'name' in sensor.sensor ? sensor.sensor.name : undefined;
    if (!sensorName || sensorName.trim() === '') {
      return false;
    }

    // Check required parameters
    if (sensor.parameters) {
      const hasEmptyRequired = Object.entries(sensor.parameters).some(
        ([_, value]) => value === undefined || value === ''
      );
      if (hasEmptyRequired) {
        return false;
      }
    }

    return true;
  }, []);

  // Validate individual filter
  const validateFilter = useCallback((filter: FilterSelection): boolean => {
    if (!filter.sensor || filter.sensor.trim() === '') {
      return false;
    }

    if (filter.value === '' || filter.value === undefined) {
      return false;
    }

    // Type validation
    if (filter.dataType === 'number' && isNaN(Number(filter.value))) {
      return false;
    }

    return true;
  }, []);

  // Convert partial query to query string
  const getQueryString = useCallback((query: PartialQuery): string => {
    const parts: string[] = [];

    // Handle raw query
    if (query.rawQuery && query.rawQuery.trim()) {
      return query.rawQuery;
    }

    // Build GET clause
    if (query.sensors.length > 0 || query.aggregates.length > 0) {
      parts.push('Get');

      const items: string[] = [];

      // Add sensors
      query.sensors.forEach(s => {
        let sensorStr = 'name' in s.sensor ? (s.sensor.name || '') : '';

        // Add parameters if any
        if (s.parameters && Object.keys(s.parameters).length > 0) {
          const paramStr = Object.entries(s.parameters)
            .map(([key, value]) => `${key}="${value}"`)
            .join(', ');
          sensorStr += `[${paramStr}]`;
        }

        // Add filter if any
        if (s.filter) {
          sensorStr += ` ${s.filter.operator.replace(/_/g, ' ')} "${s.filter.value}"`;
        }

        items.push(sensorStr);
      });

      // Add aggregates
      query.aggregates.forEach(a => {
        const aggStr = a.sensor
          ? `${a.function}(${a.sensor})`
          : `${a.function}()`;
        items.push(aggStr);
      });

      parts.push(items.join(' and '));
    } else {
      // Default to Computer Name if nothing selected
      parts.push('Get Computer Name');
    }

    // Build FROM clause
    parts.push('from');
    if (query.scope.type === 'all') {
      parts.push('all machines');
    } else if (query.scope.type === 'group' && query.scope.computerGroup) {
      parts.push(`group "${query.scope.computerGroup}"`);
    } else {
      parts.push('all machines');
    }

    // Build WHERE clause
    if (query.filters.length > 0) {
      parts.push('where');

      const buildFilterString = (filters: FilterSelection[], parentId?: string): string => {
        const groupFilters = filters.filter(f =>
          parentId ? f.parentId === parentId : !f.parentId && !f.isNested
        );

        const filterStrings = groupFilters.map(f => {
          const operator = f.operator.replace(/_/g, ' ');
          return `${f.sensor} ${operator} "${f.value}"`;
        });

        // Handle nested groups
        const nestedGroups = filters.filter(f =>
          f.isNested && f.parentId === parentId
        );

        nestedGroups.forEach(group => {
          const nestedString = buildFilterString(filters, group.id);
          if (nestedString) {
            filterStrings.push(`(${nestedString})`);
          }
        });

        return filterStrings.join(` ${query.filterLogic.toLowerCase()} `);
      };

      parts.push(buildFilterString(query.filters));
    }

    // Build GROUP BY clause
    if (query.groupBy.length > 0) {
      parts.push('group by');
      parts.push(query.groupBy.join(', '));
    }

    // Build ORDER BY clause
    if (query.orderBy.length > 0) {
      parts.push('order by');
      const orderParts = query.orderBy.map(o =>
        `${o.sensor} ${o.direction}`
      );
      parts.push(orderParts.join(', '));
    }

    // Build LIMIT clause
    if (query.limit) {
      parts.push(`limit ${query.limit}`);
    }

    return parts.join(' ');
  }, []);

  return {
    validate,
    validateSensor,
    validateFilter,
    getQueryString
  };
}