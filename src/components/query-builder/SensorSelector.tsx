"use client";

import React, { useState, useMemo, useCallback, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Search,
  X,
  Database,
  Clock,
  Star,
  Filter,
  Settings,
  ChevronRight,
  Info,
  Zap,
  AlertCircle
} from 'lucide-react';

import {
  type SensorSelectorProps,
  type SensorSelection,
  type SensorCatalogEntry,
  ParameterDefinition
} from './types/queryBuilder';

function SensorSelectorComponent({
  selectedSensors,
  onAdd,
  onRemove,
  onUpdate,
  catalog,
  maxSensors = 10,
  className = ""
}: SensorSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showBrowser, setShowBrowser] = useState(false);
  const [editingSensor, setEditingSensor] = useState<number | null>(null);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = ['all', ...new Set(catalog.map(item => item.category))];
    return cats;
  }, [catalog]);

  // Filter catalog based on search and category
  const filteredCatalog = useMemo(() => {
    let filtered = catalog;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        item =>
          ('name' in item.sensor && item.sensor.name?.toLowerCase().includes(query)) ||
          item.description?.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query)
      );
    }

    // Sort by popularity and runtime
    filtered.sort((a, b) => {
      // Prioritize popular sensors
      if (a.popularity !== b.popularity) {
        return b.popularity - a.popularity;
      }
      // Then by runtime (faster first)
      const runtimeOrder = { fast: 1, medium: 2, slow: 3 };
      return (runtimeOrder[a.runtime] || 4) - (runtimeOrder[b.runtime] || 4);
    });

    return filtered;
  }, [catalog, searchQuery, selectedCategory]);

  // Get popular sensors
  const popularSensors = useMemo(() => {
    return catalog
      .filter(item => item.popularity > 0.7)
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, 6);
  }, [catalog]);

  // Handle adding a sensor
  const handleAddSensor = useCallback((entry: SensorCatalogEntry) => {
    if (selectedSensors.length >= maxSensors) {
      alert(`Maximum ${maxSensors} sensors allowed`);
      return;
    }

    const newSensor: SensorSelection = {
      sensor: entry.sensor,
      parameters: entry.parameters?.reduce((acc, param) => {
        if (param.default !== undefined) {
          acc[param.name] = param.default;
        }
        return acc;
      }, {} as Record<string, any>),
      isValid: true
    };

    onAdd(newSensor);
    setShowBrowser(false);
  }, [selectedSensors.length, maxSensors, onAdd]);

  // Handle parameter change
  const handleParameterChange = (
    sensorIndex: number,
    paramName: string,
    value: any
  ) => {
    const sensor = selectedSensors[sensorIndex];
    const updatedSensor = {
      ...sensor,
      parameters: {
        ...sensor.parameters,
        [paramName]: value
      }
    };
    onUpdate(sensorIndex, updatedSensor);
  };

  // Get runtime badge color
  const getRuntimeBadge = (runtime: string, runtimeMs?: number) => {
    const colors: Record<string, string> = {
      fast: 'border-green-500 text-[#22c55e]',
      medium: 'border-yellow-500 text-[#f97316]',
      slow: 'border-red-500 text-red-400'
    };

    return (
      <Badge variant="outline" className={`text-xs ${colors[runtime] || colors.slow}`}>
        <Clock className="h-3 w-3 mr-1" />
        {runtimeMs ? `${runtimeMs}ms` : runtime}
      </Badge>
    );
  };

  return (
    <Card className={`glass border-white/10 ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-foreground">
            <Database className="mr-2 h-5 w-5" />
            Select Sensors
            <Badge variant="secondary" className="ml-2">
              {selectedSensors.length} / {maxSensors}
            </Badge>
          </CardTitle>
          <Dialog open={showBrowser} onOpenChange={setShowBrowser}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                disabled={selectedSensors.length >= maxSensors}
                className="bg-tanium-accent hover:bg-blue-600"
              >
                <Plus className="mr-1 h-4 w-4" />
                Add Sensor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl bg-gray-900 border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-foreground">Browse Sensors</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Select sensors to include in your query
                </DialogDescription>
              </DialogHeader>

              {/* Sensor browser content */}
              <div className="space-y-4">
                {/* Search bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search sensors..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-card border-gray-600 text-foreground"
                  />
                </div>

                {/* Category tabs */}
                <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
                  <TabsList className="bg-card">
                    {categories.map(category => (
                      <TabsTrigger key={category} value={category}>
                        {category === 'all' ? 'All' : category}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  <TabsContent value={selectedCategory} className="mt-4">
                    {/* Popular sensors */}
                    {selectedCategory === 'all' && searchQuery === '' && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
                          <Star className="mr-1 h-4 w-4" />
                          Popular Sensors
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          {popularSensors.map((entry) => (
                            <Button
                              key={entry.sensor.key || ('name' in entry.sensor ? entry.sensor.name : '')}
                              variant="outline"
                              size="sm"
                              onClick={() => handleAddSensor(entry)}
                              className="justify-start text-left"
                            >
                              <div className="flex items-center justify-between w-full">
                                <span className="text-foreground">{'name' in entry.sensor ? entry.sensor.name : ''}</span>
                                {getRuntimeBadge(entry.runtime, entry.runtimeMs)}
                              </div>
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Sensor list */}
                    <ScrollArea className="h-96">
                      <div className="space-y-2">
                        {filteredCatalog.map((entry) => (
                          <div
                            key={entry.sensor.key || ('name' in entry.sensor ? entry.sensor.name : '')}
                            className="p-3 border border-gray-700 rounded hover:border-gray-600 cursor-pointer"
                            onClick={() => handleAddSensor(entry)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium text-foreground">
                                    {'name' in entry.sensor ? entry.sensor.name : ''}
                                  </span>
                                  {entry.parameters && entry.parameters.length > 0 && (
                                    <Badge variant="outline" className="text-xs">
                                      <Settings className="h-3 w-3 mr-1" />
                                      Parameterized
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {entry.description}
                                </p>
                                {entry.examples && entry.examples.length > 0 && (
                                  <div className="mt-1 text-xs text-muted-foreground">
                                    Example: {entry.examples[0]}
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center space-x-2 ml-4">
                                {getRuntimeBadge(entry.runtime, entry.runtimeMs)}
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        {selectedSensors.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Database className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No sensors selected</p>
            <p className="text-sm mt-1">Click "Add Sensor" to get started</p>
          </div>
        ) : (
          <div className="space-y-2">
            {selectedSensors.map((sensor, index) => (
              <div
                key={index}
                className="flex items-start space-x-3 p-3 bg-card rounded border border-gray-700"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-foreground">
                      {'name' in sensor.sensor ? sensor.sensor.name : ''}
                    </span>
                    {sensor.filter && (
                      <Badge variant="outline" className="text-xs">
                        <Filter className="h-3 w-3 mr-1" />
                        Filtered
                      </Badge>
                    )}
                    {!sensor.isValid && (
                      <Badge variant="destructive" className="text-xs">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Invalid
                      </Badge>
                    )}
                  </div>

                  {/* Parameters */}
                  {sensor.parameters && Object.keys(sensor.parameters).length > 0 && (
                    <div className="mt-2 space-y-2">
                      {Object.entries(sensor.parameters).map(([key, value]) => (
                        <div key={key} className="flex items-center space-x-2">
                          <label className="text-sm text-muted-foreground w-24">
                            {key}:
                          </label>
                          <Input
                            type="text"
                            value={value}
                            onChange={(e) => handleParameterChange(index, key, e.target.value)}
                            className="flex-1 h-8 bg-gray-700 border-gray-600 text-foreground"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Filter */}
                  {sensor.filter && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      Filter: {sensor.filter.operator} "{sensor.filter.value}"
                    </div>
                  )}
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onRemove(index)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Memoize the component to prevent unnecessary re-renders
export const SensorSelector = memo(SensorSelectorComponent);