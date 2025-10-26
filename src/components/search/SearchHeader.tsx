"use client";

import { useState, useEffect } from "react";
import { Search, X, Clock, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useSearch } from "@/contexts/SearchContext";
import { cn } from "@/lib/utils";

export function SearchHeader() {
  const { state, setQuery, generateSuggestions, resetSearch } = useSearch();
  const [inputValue, setInputValue] = useState(state.query);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    setInputValue(state.query);
  }, [state.query]);

  const handleInputChange = (value: string) => {
    setInputValue(value);
    setQuery(value);
    generateSuggestions(value);
    setShowSuggestions(value.length > 0);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    setQuery(suggestion);
    setShowSuggestions(false);
  };

  const handleClear = () => {
    setInputValue("");
    setQuery("");
    setShowSuggestions(false);
  };

  const handleShowAll = () => {
    resetSearch();
    setInputValue("");
    setShowSuggestions(false);
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-4">
        {/* Main Search Input */}
        <div className="relative flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search questions, domains, or topics..."
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={() => setShowSuggestions(inputValue.length > 0)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="border-white/20 bg-white/5 pl-10 pr-10 text-foreground placeholder:text-muted-foreground focus:border-tanium-accent"
            />
            {inputValue && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 transform p-0 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Search Suggestions Dropdown */}
          {showSuggestions && (state.suggestions.length > 0 || state.searchHistory.length > 0) && (
            <Card className="glass absolute left-0 right-0 top-full z-50 mt-2 border-white/10 bg-card/95 backdrop-blur-md">
              <div className="space-y-3 p-4">
                {/* Suggestions */}
                {state.suggestions.length > 0 && (
                  <div>
                    <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <TrendingUp className="h-4 w-4" />
                      Suggestions
                    </div>
                    <div className="space-y-1">
                      {state.suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="block w-full rounded-md px-3 py-2 text-left text-foreground transition-colors hover:bg-white/10"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Search History */}
                {state.searchHistory.length > 0 && state.suggestions.length > 0 && (
                  <div className="border-t border-white/10 pt-3">
                    <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      Recent Searches
                    </div>
                    <div className="space-y-1">
                      {state.searchHistory.slice(0, 3).map((query, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(query)}
                          className="block w-full rounded-md px-3 py-2 text-left text-muted-foreground transition-colors hover:bg-white/10"
                        >
                          {query}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Show All Button */}
        <Button
          onClick={handleShowAll}
          variant="outline"
          className="border-white/20 text-foreground hover:bg-white/10"
        >
          Show All
        </Button>
      </div>

      {/* Search Stats */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {state.isSearching && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-tanium-accent"></div>
              <span className="text-sm">Searching...</span>
            </div>
          )}

          {!state.isSearching && state.totalResults > 0 && (
            <div className="text-sm text-muted-foreground">
              Found <span className="font-medium text-foreground">{state.totalResults}</span> question
              {state.totalResults !== 1 ? "s" : ""}
              {state.query && (
                <span>
                  {" "}
                  for &ldquo;<span className="text-tanium-accent">{state.query}</span>&rdquo;
                </span>
              )}
            </div>
          )}

          {/* Active Filters Count */}
          {(() => {
            const activeFilterCount =
              [...state.filters.domains, ...state.filters.difficulties, ...state.filters.categories]
                .length +
              (state.filters.hasExplanation !== undefined ? 1 : 0) +
              (state.filters.hasConsoleSteps !== undefined ? 1 : 0);

            return activeFilterCount > 0 ? (
              <Badge variant="secondary" className="text-xs">
                {activeFilterCount} filter{activeFilterCount !== 1 ? "s" : ""} active
              </Badge>
            ) : null;
          })()}
        </div>

        {/* Quick Domain Filters */}
        <div className="hidden gap-2 lg:flex">
          {(
            [
              "Asking Questions",
              "Refining Questions & Targeting",
              "Taking Action - Packages & Actions",
            ] as const
          ).map((domain) => {
            const isActive = state.filters.domains.includes(domain);
            return (
              <Button
                key={domain}
                variant={isActive ? "default" : "ghost"}
                size="sm"
                onClick={() => {
                  const newDomains = isActive
                    ? state.filters.domains.filter((d) => d !== domain)
                    : [...state.filters.domains, domain];
                  setQuery("");
                  // This would need to call setFilters from the search context
                }}
                className={cn(
                  "text-xs transition-colors",
                  isActive
                    ? "bg-tanium-accent text-foreground hover:bg-blue-600"
                    : "text-muted-foreground hover:bg-white/10 hover:text-foreground"
                )}
              >
                {domain ? domain.split(" ")[0] : domain} {/* Show first word */}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
