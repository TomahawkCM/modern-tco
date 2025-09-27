"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import {
  Sparkles,
  Search,
  ArrowRight,
  Clock,
  Zap,
  Database,
  Hash,
  Code,
  Loader2
} from 'lucide-react';

import {
  NaturalLanguageInputProps,
  QuerySuggestion
} from './types/queryBuilder';

export function NaturalLanguageInput({
  value,
  onChange,
  onSubmit,
  suggestions,
  isProcessing = false,
  placeholder = "Type a natural language query...",
  className = ""
}: NaturalLanguageInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [localValue, setLocalValue] = useState(value);

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Update local value when prop changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Show suggestions when there are any and input is focused
  useEffect(() => {
    setShowSuggestions(suggestions.length > 0 && isFocused && !isProcessing);
  }, [suggestions, isFocused, isProcessing]);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange(newValue);
    setSelectedIndex(-1);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        selectSuggestion(suggestions[selectedIndex]);
      } else {
        handleSubmit();
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > -1 ? prev - 1 : -1));
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  // Handle submit
  const handleSubmit = () => {
    if (localValue.trim() && !isProcessing) {
      onSubmit(localValue.trim());
      setShowSuggestions(false);
    }
  };

  // Select a suggestion
  const selectSuggestion = (suggestion: QuerySuggestion) => {
    setLocalValue(suggestion.text);
    onChange(suggestion.text);
    setShowSuggestions(false);
    setSelectedIndex(-1);

    // Auto-submit if it's a complete query suggestion
    if (suggestion.type === 'complete') {
      setTimeout(() => onSubmit(suggestion.text), 100);
    } else {
      // Focus back on input for further editing
      inputRef.current?.focus();
    }
  };

  // Get icon for suggestion type
  const getSuggestionIcon = (type: QuerySuggestion['type']) => {
    switch (type) {
      case 'sensor':
        return <Database className="h-4 w-4" />;
      case 'filter':
        return <Hash className="h-4 w-4" />;
      case 'template':
        return <Code className="h-4 w-4" />;
      case 'complete':
        return <Zap className="h-4 w-4" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  // Get confidence color
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-400';
    if (confidence >= 0.5) return 'text-yellow-400';
    return 'text-gray-400';
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {isProcessing ? (
            <Loader2 className="h-5 w-5 text-tanium-accent animate-spin" />
          ) : (
            <Sparkles className="h-5 w-5 text-tanium-accent" />
          )}
        </div>

        <Input
          ref={inputRef}
          type="text"
          value={localValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            // Delay to allow clicking on suggestions
            setTimeout(() => setIsFocused(false), 200);
          }}
          placeholder={placeholder}
          disabled={isProcessing}
          className="pl-10 pr-24 bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-tanium-accent"
        />

        <div className="absolute inset-y-0 right-0 flex items-center pr-2">
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!localValue.trim() || isProcessing}
            className="bg-tanium-accent hover:bg-blue-600"
          >
            {isProcessing ? (
              <>Processing...</>
            ) : (
              <>
                Generate
                <ArrowRight className="ml-1 h-3 w-3" />
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && (
        <Card
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-gray-800 border-gray-600 shadow-lg"
        >
          <ScrollArea className="max-h-80">
            <div className="p-1">
              <div className="text-xs text-gray-400 px-3 py-1 mb-1">
                Suggested queries
              </div>

              {suggestions.map((suggestion, index) => (
                <div
                  key={suggestion.id}
                  className={`
                    flex items-start space-x-3 px-3 py-2 cursor-pointer rounded
                    ${index === selectedIndex ? 'bg-gray-700' : 'hover:bg-gray-700/50'}
                  `}
                  onClick={() => selectSuggestion(suggestion)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getSuggestionIcon(suggestion.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="text-sm text-white">
                          {suggestion.displayText}
                        </div>
                        {suggestion.description && (
                          <div className="text-xs text-gray-400 mt-0.5">
                            {suggestion.description}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 ml-2">
                        {suggestion.runtime !== undefined && (
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              suggestion.runtime < 100
                                ? 'border-green-500 text-green-400'
                                : suggestion.runtime < 500
                                ? 'border-yellow-500 text-yellow-400'
                                : 'border-red-500 text-red-400'
                            }`}
                          >
                            <Clock className="h-3 w-3 mr-1" />
                            {suggestion.runtime}ms
                          </Badge>
                        )}

                        <Badge
                          variant="outline"
                          className={`text-xs ${getConfidenceColor(
                            suggestion.confidence
                          )}`}
                        >
                          {Math.round(suggestion.confidence * 100)}%
                        </Badge>
                      </div>
                    </div>

                    {/* Preview of the actual query */}
                    {suggestion.text !== suggestion.displayText && (
                      <div className="mt-1">
                        <code className="text-xs text-gray-500">
                          {suggestion.text.length > 80
                            ? suggestion.text.substring(0, 80) + '...'
                            : suggestion.text}
                        </code>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Help text */}
              <div className="border-t border-gray-700 mt-1 pt-1">
                <div className="px-3 py-1 text-xs text-gray-500">
                  Press <kbd className="px-1 py-0.5 bg-gray-700 rounded">↑</kbd>{' '}
                  <kbd className="px-1 py-0.5 bg-gray-700 rounded">↓</kbd> to navigate,{' '}
                  <kbd className="px-1 py-0.5 bg-gray-700 rounded">Enter</kbd> to select,{' '}
                  <kbd className="px-1 py-0.5 bg-gray-700 rounded">Esc</kbd> to close
                </div>
              </div>
            </div>
          </ScrollArea>
        </Card>
      )}

      {/* AI assistance note */}
      {!isProcessing && !showSuggestions && localValue && (
        <div className="absolute mt-1 text-xs text-gray-500">
          Press Enter or click Generate to convert to Tanium query
        </div>
      )}
    </div>
  );
}