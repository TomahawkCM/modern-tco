"use client";

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Filter,
  Plus,
  X,
  ChevronDown,
  ChevronRight,
  Layers,
  Hash,
  Type,
  Calendar,
  ToggleLeft,
} from 'lucide-react';

import type {
  FilterBuilderProps,
  FilterSelection,
  FilterOperator
} from './types/queryBuilder';

// Available operators for different data types
const operatorsByType = {
  text: [
    { value: 'contains', label: 'Contains' },
    { value: 'does_not_contain', label: 'Does not contain' },
    { value: 'equals', label: 'Equals' },
    { value: 'not_equals', label: 'Not equals' },
    { value: 'starts_with', label: 'Starts with' },
    { value: 'ends_with', label: 'Ends with' },
    { value: 'matches', label: 'Matches (regex)' },
  ],
  number: [
    { value: 'equals', label: 'Equals' },
    { value: 'not_equals', label: 'Not equals' },
    { value: 'greater_than', label: 'Greater than' },
    { value: 'less_than', label: 'Less than' },
    { value: 'greater_or_equal', label: 'Greater or equal' },
    { value: 'less_or_equal', label: 'Less or equal' },
  ],
  date: [
    { value: 'equals', label: 'On' },
    { value: 'not_equals', label: 'Not on' },
    { value: 'greater_than', label: 'After' },
    { value: 'less_than', label: 'Before' },
    { value: 'greater_or_equal', label: 'On or after' },
    { value: 'less_or_equal', label: 'On or before' },
  ],
  boolean: [
    { value: 'equals', label: 'Is' },
    { value: 'not_equals', label: 'Is not' },
  ]
};

// Common sensor data types (would be fetched from catalog in real implementation)
const sensorDataTypes: Record<string, 'text' | 'number' | 'date' | 'boolean'> = {
  'Computer Name': 'text',
  'Operating System': 'text',
  'IP Address': 'text',
  'CPU Percent': 'number',
  'Disk Free GB': 'number',
  'Memory GB': 'number',
  'Last Reboot': 'date',
  'Is Virtual': 'boolean',
  'Compliance Score': 'number',
  'Last Logged In User': 'text',
};

interface FilterGroupProps {
  filters: FilterSelection[];
  parentId?: string;
  depth?: number;
  logic: 'AND' | 'OR';
  onAdd: (filter: FilterSelection) => void;
  onRemove: (filterId: string) => void;
  onUpdate: (filterId: string, filter: FilterSelection) => void;
  onLogicChange: (logic: 'AND' | 'OR', parentId?: string) => void;
  availableSensors: string[];
  allowNested: boolean;
}

function FilterGroup({
  filters,
  parentId,
  depth = 0,
  logic,
  onAdd,
  onRemove,
  onUpdate,
  onLogicChange,
  availableSensors,
  allowNested
}: FilterGroupProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Get filters for this group
  const groupFilters = filters.filter(f =>
    parentId ? f.parentId === parentId : !f.parentId
  );

  // Get nested groups
  const nestedGroups = [...new Set(
    filters
      .filter(f => f.isNested && f.parentId === parentId)
      .map(f => f.id)
  )];

  const handleAddFilter = () => {
    const newFilter: FilterSelection = {
      id: `filter-${Date.now()}`,
      sensor: availableSensors[0] || 'Computer Name',
      operator: 'contains',
      value: '',
      dataType: 'text',
      ...(parentId && { parentId }),
      logic: 'AND'
    };
    onAdd(newFilter);
  };

  const handleAddGroup = () => {
    const groupId = `group-${Date.now()}`;
    const newFilter: FilterSelection = {
      id: groupId,
      sensor: '',
      operator: 'equals',
      value: '',
      dataType: 'text',
      isNested: true,
      ...(parentId && { parentId }),
      logic: 'AND'
    };
    onAdd(newFilter);
  };

  const getDataTypeIcon = (dataType: FilterSelection['dataType']) => {
    switch (dataType) {
      case 'text': return <Type className="h-3 w-3" />;
      case 'number': return <Hash className="h-3 w-3" />;
      case 'date': return <Calendar className="h-3 w-3" />;
      case 'boolean': return <ToggleLeft className="h-3 w-3" />;
      default: return null;
    }
  };

  return (
    <div
      className={`space-y-2 ${depth > 0 ? 'pl-8 border-l-2 border-gray-700' : ''}`}
    >
      {/* Group header */}
      {depth > 0 && (
        <div className="flex items-center space-x-2 mb-2">
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="p-1">
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
          </Collapsible>
          <Badge variant="secondary" className="text-xs">
            Group
          </Badge>
          <Select value={logic} onValueChange={(value) => onLogicChange(value as 'AND' | 'OR', parentId)}>
            <SelectTrigger className="w-20 h-6 bg-gray-700 border-gray-600">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AND">AND</SelectItem>
              <SelectItem value="OR">OR</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Filters */}
      {(!depth || isExpanded) && (
        <>
          {groupFilters.filter(f => !f.isNested).map((filter, index) => (
            <div key={filter.id} className="flex items-start space-x-2">
              {/* Logic connector (except for first item) */}
              {index > 0 && (
                <div className="w-12 pt-2 text-center">
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      logic === 'AND' ? 'border-blue-500 text-primary' : 'border-orange-500 text-orange-400'
                    }`}
                  >
                    {logic}
                  </Badge>
                </div>
              )}

              {/* Filter row */}
              <div className={`flex-1 flex items-start space-x-2 p-2 bg-card rounded border border-gray-700 ${index === 0 ? '' : 'ml-12'}`}>
                {/* Sensor selector */}
                <Select
                  value={filter.sensor}
                  onValueChange={(value) => {
                    const dataType = sensorDataTypes[value] || 'text';
                    onUpdate(filter.id, { ...filter, sensor: value, dataType });
                  }}
                >
                  <SelectTrigger className="w-48 bg-gray-700 border-gray-600">
                    <SelectValue placeholder="Select sensor" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSensors.map(sensor => (
                      <SelectItem key={sensor} value={sensor}>
                        <div className="flex items-center space-x-2">
                          {getDataTypeIcon(sensorDataTypes[sensor] || 'text')}
                          <span>{sensor}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Operator selector */}
                <Select
                  value={filter.operator}
                  onValueChange={(value) => onUpdate(filter.id, { ...filter, operator: value as FilterOperator })}
                >
                  <SelectTrigger className="w-40 bg-gray-700 border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {operatorsByType[filter.dataType].map(op => (
                      <SelectItem key={op.value} value={op.value}>
                        {op.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Value input */}
                {filter.dataType === 'boolean' ? (
                  <Select
                    value={filter.value.toString()}
                    onValueChange={(value) => onUpdate(filter.id, { ...filter, value: value === 'true' })}
                  >
                    <SelectTrigger className="flex-1 bg-gray-700 border-gray-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">True</SelectItem>
                      <SelectItem value="false">False</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    type={filter.dataType === 'number' ? 'number' : filter.dataType === 'date' ? 'date' : 'text'}
                    value={typeof filter.value === 'boolean' ? String(filter.value) : filter.value}
                    onChange={(e) => onUpdate(filter.id, { ...filter, value: e.target.value })}
                    placeholder={`Enter ${filter.dataType} value`}
                    className="flex-1 bg-gray-700 border-gray-600 text-foreground"
                  />
                )}

                {/* Remove button */}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onRemove(filter.id)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

          {/* Nested groups */}
          {nestedGroups.map(groupId => {
            const groupFilter = filters.find(f => f.id === groupId);
            return groupFilter ? (
              <FilterGroup
                key={groupId}
                filters={filters}
                parentId={groupId}
                depth={depth + 1}
                logic={groupFilter.logic ?? 'AND'}
                onAdd={onAdd}
                onRemove={onRemove}
                onUpdate={onUpdate}
                onLogicChange={onLogicChange}
                availableSensors={availableSensors}
                allowNested={allowNested}
              />
            ) : null;
          })}

          {/* Add buttons */}
          <div className={`flex space-x-2 ${groupFilters.length > 0 ? 'ml-12' : ''}`}>
            <Button
              size="sm"
              variant="outline"
              onClick={handleAddFilter}
              className="text-muted-foreground hover:text-foreground"
            >
              <Plus className="mr-1 h-3 w-3" />
              Add Filter
            </Button>
            {allowNested && depth < 2 && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleAddGroup}
                className="text-muted-foreground hover:text-foreground"
              >
                <Layers className="mr-1 h-3 w-3" />
                Add Group
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export function FilterBuilder({
  filters,
  onAdd,
  onRemove,
  onUpdate,
  availableSensors,
  filterLogic,
  onLogicChange,
  allowNested = false,
  className = ""
}: FilterBuilderProps) {
  return (
    <Card className={`glass border-white/10 ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-foreground">
            <Filter className="mr-2 h-5 w-5" />
            Filter Conditions
          </CardTitle>
          {filters.length > 1 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Logic:</span>
              <Select value={filterLogic} onValueChange={(value) => onLogicChange(value as 'AND' | 'OR')}>
                <SelectTrigger className="w-20 h-8 bg-gray-700 border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AND">AND</SelectItem>
                  <SelectItem value="OR">OR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {filters.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Filter className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No filters applied</p>
            <p className="text-sm mt-1">Add filters to narrow down results</p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const newFilter: FilterSelection = {
                  id: `filter-${Date.now()}`,
                  sensor: availableSensors[0] || 'Computer Name',
                  operator: 'contains',
                  value: '',
                  dataType: 'text',
                  logic: 'AND'
                };
                onAdd(newFilter);
              }}
              className="mt-4"
            >
              <Plus className="mr-1 h-3 w-3" />
              Add First Filter
            </Button>
          </div>
        ) : (
          <FilterGroup
            filters={filters}
            depth={0}
            logic={filterLogic}
            onAdd={onAdd}
            onRemove={onRemove}
            onUpdate={onUpdate}
            onLogicChange={onLogicChange}
            availableSensors={availableSensors}
            allowNested={allowNested}
          />
        )}
      </CardContent>
    </Card>
  );
}