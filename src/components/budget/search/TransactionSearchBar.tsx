/**
 * Transaction Search Bar Component
 * Enhanced search input with fuzzy matching, autocomplete, and search tips
 *
 * Features:
 * - Instant fuzzy search as you type
 * - Autocomplete suggestions (merchants, categories, amounts)
 * - Recent searches and saved filters
 * - Search tips overlay
 * - Keyboard navigation (↑↓ to navigate, Enter to select)
 */

"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  Search,
  X as XIcon,
  History,
  Bookmark,
  Store,
  Tag,
  DollarSign,
  Filter,
  HelpCircle,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Transaction, Category } from "@/types/budget";
import {
  getAutocompleteSuggestions,
  addRecentSearch,
  getRecentSearches,
  getSavedFilters,
  saveFilter,
  type AutocompleteSuggestion,
  type SavedFilter,
  initializeAutocompleteCache,
} from "@/lib/search/autocomplete";
import { getSearchExamples } from "@/lib/search/natural-language-parser";

export interface TransactionSearchBarProps {
  /** Current search value */
  value: string;
  /** Called when search value changes */
  onChange: (value: string) => void;
  /** Called when user submits search (Enter or clicking Go) */
  onSubmit?: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Whether the search is currently loading results */
  isLoading?: boolean;
  /** Number of results found */
  resultCount?: number;
  /** Transactions for autocomplete (optional) */
  transactions?: Transaction[];
  /** Categories for autocomplete (optional) */
  categories?: Category[];
  /** Show the tips button */
  showTips?: boolean;
  /** Custom class name */
  className?: string;
  /** Auto-focus on mount */
  autoFocus?: boolean;
}

// Icon for suggestion type
function SuggestionIcon({ type }: { type: AutocompleteSuggestion["type"] }) {
  switch (type) {
    case "merchant":
      return <Store className="h-4 w-4 text-muted-foreground" />;
    case "category":
      return <Tag className="h-4 w-4 text-muted-foreground" />;
    case "amount":
      return <DollarSign className="h-4 w-4 text-muted-foreground" />;
    case "filter":
      return <Filter className="h-4 w-4 text-muted-foreground" />;
    case "recent":
      return <History className="h-4 w-4 text-muted-foreground" />;
    case "saved":
      return <Bookmark className="h-4 w-4 text-muted-foreground" />;
    default:
      return <Search className="h-4 w-4 text-muted-foreground" />;
  }
}

export function TransactionSearchBar({
  value,
  onChange,
  onSubmit,
  placeholder,
  isLoading = false,
  resultCount,
  transactions = [],
  categories = [],
  showTips = true,
  className,
  autoFocus = false,
}: TransactionSearchBarProps) {
  const t = useTranslations("transactionSearch");
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // State
  const [isFocused, setIsFocused] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showTipsModal, setShowTipsModal] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [saveFilterName, setSaveFilterName] = useState("");
  const [showSaveFilter, setShowSaveFilter] = useState(false);

  // Initialize autocomplete cache when transactions change
  useEffect(() => {
    if (transactions.length > 0) {
      initializeAutocompleteCache(transactions, categories);
    }
  }, [transactions, categories]);

  // Get recent searches and saved filters
  const recentSearches = useMemo(() => getRecentSearches().slice(0, 5), []);
  const savedFilters = useMemo(() => getSavedFilters().slice(0, 5), []);
  const searchExamples = useMemo(() => getSearchExamples(), []);

  // Update suggestions when value changes
  useEffect(() => {
    if (value.length >= 1) {
      const newSuggestions = getAutocompleteSuggestions(value, 6);
      setSuggestions(newSuggestions);
    } else {
      setSuggestions([]);
    }
    setSelectedIndex(-1);
  }, [value]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const items = suggestions.length > 0 ? suggestions : [];
      const totalItems = items.length + (value && showSaveFilter ? 1 : 0);

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, totalItems - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, -1));
          break;
        case "Tab":
          // Tab-to-complete: accept the selected or first suggestion
          if (showDropdown && suggestions.length > 0) {
            e.preventDefault();
            const idx = selectedIndex >= 0 ? selectedIndex : 0;
            if (idx < suggestions.length) {
              selectSuggestion(suggestions[idx]);
            }
          }
          break;
        case "Enter":
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
            selectSuggestion(suggestions[selectedIndex]);
          } else if (value) {
            handleSubmit();
          }
          break;
        case "Escape":
          setShowDropdown(false);
          inputRef.current?.blur();
          break;
      }
    },
    [suggestions, selectedIndex, value, showSaveFilter]
  );

  // Select a suggestion
  const selectSuggestion = useCallback(
    (suggestion: AutocompleteSuggestion) => {
      onChange(suggestion.value);
      setShowDropdown(false);
      inputRef.current?.focus();

      // Add to recent if it's not already a filter syntax
      if (!suggestion.value.includes(":")) {
        addRecentSearch(suggestion.value);
      }

      // Submit if it's a saved filter or recent search
      if (suggestion.type === "saved" || suggestion.type === "recent") {
        onSubmit?.(suggestion.value);
      }
    },
    [onChange, onSubmit]
  );

  // Submit search
  const handleSubmit = useCallback(() => {
    if (value.trim()) {
      addRecentSearch(value.trim());
      onSubmit?.(value);
      setShowDropdown(false);
    }
  }, [value, onSubmit]);

  // Save current filter
  const handleSaveFilter = useCallback(() => {
    if (value.trim() && saveFilterName.trim()) {
      saveFilter(saveFilterName.trim(), value.trim());
      setShowSaveFilter(false);
      setSaveFilterName("");
    }
  }, [value, saveFilterName]);

  // Clear search
  const handleClear = useCallback(() => {
    onChange("");
    inputRef.current?.focus();
  }, [onChange]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Determine what to show in dropdown
  const showSuggestions = suggestions.length > 0;
  const showRecent = !value && recentSearches.length > 0;
  const showSaved = !value && savedFilters.length > 0;
  const showAnything = showSuggestions || showRecent || showSaved;
  const isDropdownVisible = showDropdown && showAnything;

  // Generate active descendant ID for ARIA
  const activeDescendantId =
    selectedIndex >= 0 ? `search-suggestion-${selectedIndex}` : undefined;

  return (
    <div className={cn("relative", className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={isDropdownVisible}
          aria-haspopup="listbox"
          aria-controls="search-suggestions-listbox"
          aria-activedescendant={activeDescendantId}
          aria-autocomplete="list"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => {
            setIsFocused(true);
            setShowDropdown(true);
          }}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || t("placeholderExtended")}
          autoFocus={autoFocus}
          className={cn(
            "w-full rounded-lg border border-input bg-background py-3 pl-10 pr-20 text-base text-foreground",
            "focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20",
            "placeholder:text-muted-foreground",
            isLoading && "animate-pulse"
          )}
        />

        {/* Right side buttons */}
        <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
          {/* Result count badge */}
          {resultCount !== undefined && value && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {resultCount}
            </span>
          )}

          {/* Clear button */}
          {value && (
            <button
              onClick={handleClear}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Clear search"
            >
              <XIcon className="h-4 w-4" />
            </button>
          )}

          {/* Tips button */}
          {showTips && (
            <button
              onClick={() => setShowTipsModal(!showTipsModal)}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Search tips"
            >
              <HelpCircle className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Live region for screen reader announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {resultCount !== undefined && value
          ? `${resultCount} results found`
          : isDropdownVisible && suggestions.length > 0
            ? `${suggestions.length} suggestions available`
            : ""}
      </div>

      {/* Dropdown */}
      {isDropdownVisible && (
        <div
          ref={dropdownRef}
          id="search-suggestions-listbox"
          role="listbox"
          aria-label="Search suggestions"
          className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-border bg-popover shadow-lg"
        >
          {/* Suggestions */}
          {showSuggestions && (
            <div className="p-1">
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                {t("suggestionsHeading")}
              </div>
              {suggestions.map((suggestion, idx) => (
                <button
                  key={`${suggestion.type}-${suggestion.value}-${idx}`}
                  id={`search-suggestion-${idx}`}
                  role="option"
                  aria-selected={selectedIndex === idx}
                  onClick={() => selectSuggestion(suggestion)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-colors",
                    selectedIndex === idx ? "bg-accent text-accent-foreground" : "hover:bg-muted"
                  )}
                >
                  <SuggestionIcon type={suggestion.type} />
                  <span className="flex-1 truncate">{suggestion.label}</span>
                  {suggestion.description && (
                    <span className="text-xs text-muted-foreground">{suggestion.description}</span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Recent Searches */}
          {showRecent && (
            <div className="border-t border-border p-1">
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                {t("recentSearches")}
              </div>
              {recentSearches.map((search, idx) => (
                <button
                  key={`recent-${idx}`}
                  onClick={() => {
                    onChange(search);
                    onSubmit?.(search);
                    setShowDropdown(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-colors hover:bg-muted"
                >
                  <History className="h-4 w-4 text-muted-foreground" />
                  <span className="flex-1 truncate">{search}</span>
                </button>
              ))}
            </div>
          )}

          {/* Saved Filters */}
          {showSaved && (
            <div className="border-t border-border p-1">
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                {t("savedFilters")}
              </div>
              {savedFilters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => {
                    onChange(filter.query);
                    onSubmit?.(filter.query);
                    setShowDropdown(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-colors hover:bg-muted"
                >
                  <Bookmark className="h-4 w-4 text-muted-foreground" />
                  <span className="flex-1 truncate">{filter.name}</span>
                  <span className="max-w-[120px] truncate text-xs text-muted-foreground">
                    {filter.query}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Save Filter Option */}
          {value && value.length >= 3 && (
            <div className="border-t border-border bg-muted/50 p-2">
              {showSaveFilter ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={saveFilterName}
                    onChange={(e) => setSaveFilterName(e.target.value)}
                    placeholder={t("filterName")}
                    className="flex-1 rounded border border-input bg-background px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveFilter();
                      if (e.key === "Escape") setShowSaveFilter(false);
                    }}
                  />
                  <button
                    onClick={handleSaveFilter}
                    disabled={!saveFilterName.trim()}
                    className="rounded bg-teal-600 px-3 py-1 text-sm font-medium text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {t("save")}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowSaveFilter(true)}
                  className="flex w-full items-center gap-2 px-2 py-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Bookmark className="h-4 w-4" />
                  <span>{t("saveFilter")}</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tips Modal */}
      {showTipsModal && (
        <div className="absolute right-0 z-50 mt-1 w-80 rounded-lg border border-border bg-popover p-4 shadow-lg">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-medium">
              <Sparkles className="h-4 w-4 text-teal-500" />
              {t("tips.title")}
            </h3>
            <button onClick={() => setShowTipsModal(false)} className="rounded p-1 hover:bg-muted">
              <XIcon className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-2 text-sm">
            <p className="text-muted-foreground">{t("tips.fuzzy")}</p>
            <p className="text-muted-foreground">{t("tips.amount")}</p>
            <p className="text-muted-foreground">{t("tips.date")}</p>
            <p className="text-muted-foreground">{t("tips.category")}</p>
            <p className="text-muted-foreground">{t("tips.type")}</p>
          </div>

          <div className="mt-4 border-t border-border pt-3">
            <p className="mb-2 text-xs font-medium text-muted-foreground">Examples:</p>
            <div className="space-y-1">
              {searchExamples.slice(0, 4).map((example, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    onChange(example.query);
                    setShowTipsModal(false);
                    inputRef.current?.focus();
                  }}
                  className="w-full rounded px-2 py-1 text-left text-xs transition-colors hover:bg-muted"
                >
                  <code className="text-teal-600">{example.query}</code>
                  <span className="ml-2 text-muted-foreground">— {example.description}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
