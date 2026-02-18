"use client";

import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import {
  Sparkles,
  Search,
  ArrowRight,
  Clock,
  Zap,
  Database,
  Hash,
  Code,
  Loader2,
} from "lucide-react";

import type { NaturalLanguageInputProps, QuerySuggestion } from "./types/queryBuilder";

export function NaturalLanguageInput({
  value,
  onChange,
  onSubmit,
  suggestions,
  isProcessing = false,
  placeholder = "Type a natural language query...",
  className = "",
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
    if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        selectSuggestion(suggestions[selectedIndex]);
      } else {
        handleSubmit();
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > -1 ? prev - 1 : -1));
    } else if (e.key === "Escape") {
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
    if (suggestion.type === "complete") {
      setTimeout(() => onSubmit(suggestion.text), 100);
    } else {
      // Focus back on input for further editing
      inputRef.current?.focus();
    }
  };

  // Get icon for suggestion type
  const getSuggestionIcon = (type: QuerySuggestion["type"]) => {
    switch (type) {
      case "sensor":
        return <Database className="h-4 w-4" />;
      case "filter":
        return <Hash className="h-4 w-4" />;
      case "template":
        return <Code className="h-4 w-4" />;
      case "complete":
        return <Zap className="h-4 w-4" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  // Get confidence color
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-[#22c55e]";
    if (confidence >= 0.5) return "text-[#f97316]";
    return "text-muted-foreground";
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          {isProcessing ? (
            <Loader2 className="text-tanium-accent h-5 w-5 animate-spin" />
          ) : (
            <Sparkles className="text-tanium-accent h-5 w-5" />
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
          className="focus:border-tanium-accent border-gray-600 bg-card pl-10 pr-24 text-foreground placeholder-gray-400"
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
          className="absolute z-50 mt-1 w-full border-gray-600 bg-card shadow-lg"
        >
          <ScrollArea className="max-h-80">
            <div className="p-1">
              <div className="mb-1 px-3 py-1 text-xs text-muted-foreground">Suggested queries</div>

              {suggestions.map((suggestion, index) => (
                <div
                  key={suggestion.id}
                  className={`flex cursor-pointer items-start space-x-3 rounded px-3 py-2 ${index === selectedIndex ? "bg-gray-700" : "hover:bg-gray-700/50"} `}
                  onClick={() => selectSuggestion(suggestion)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div className="mt-0.5 flex-shrink-0">{getSuggestionIcon(suggestion.type)}</div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="text-sm text-foreground">{suggestion.displayText}</div>
                        {suggestion.description && (
                          <div className="mt-0.5 text-xs text-muted-foreground">
                            {suggestion.description}
                          </div>
                        )}
                      </div>

                      <div className="ml-2 flex items-center space-x-2">
                        {suggestion.runtime !== undefined && (
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              suggestion.runtime < 100
                                ? "border-green-500 text-[#22c55e]"
                                : suggestion.runtime < 500
                                  ? "border-yellow-500 text-[#f97316]"
                                  : "border-red-500 text-red-400"
                            }`}
                          >
                            <Clock className="mr-1 h-3 w-3" />
                            {suggestion.runtime}ms
                          </Badge>
                        )}

                        <Badge
                          variant="outline"
                          className={`text-xs ${getConfidenceColor(suggestion.confidence)}`}
                        >
                          {Math.round(suggestion.confidence * 100)}%
                        </Badge>
                      </div>
                    </div>

                    {/* Preview of the actual query */}
                    {suggestion.text !== suggestion.displayText && (
                      <div className="mt-1">
                        <code className="text-xs text-muted-foreground">
                          {suggestion.text.length > 80
                            ? `${suggestion.text.substring(0, 80)}...`
                            : suggestion.text}
                        </code>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Help text */}
              <div className="mt-1 border-t border-gray-700 pt-1">
                <div className="px-3 py-1 text-xs text-muted-foreground">
                  Press <kbd className="rounded bg-gray-700 px-1 py-0.5">↑</kbd>{" "}
                  <kbd className="rounded bg-gray-700 px-1 py-0.5">↓</kbd> to navigate,{" "}
                  <kbd className="rounded bg-gray-700 px-1 py-0.5">Enter</kbd> to select,{" "}
                  <kbd className="rounded bg-gray-700 px-1 py-0.5">Esc</kbd> to close
                </div>
              </div>
            </div>
          </ScrollArea>
        </Card>
      )}

      {/* AI assistance note */}
      {!isProcessing && !showSuggestions && localValue && (
        <div className="absolute mt-1 text-xs text-muted-foreground">
          Press Enter or click Generate to convert to Tanium query
        </div>
      )}
    </div>
  );
}
