/**
 * SearchCommandPalette Component
 * Spotlight-style search overlay for transactions.
 *
 * - Desktop: Dialog (max 640px) triggered by Cmd/Ctrl+Shift+F
 * - Mobile: Bottom sheet drawer with snap points [0.5, 0.85]
 * - Wraps ResponsiveModal + Command (cmdk)
 * - Shows filter chips, instant results, keyboard navigation
 */

"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  Search,
  X as XIcon,
  ArrowRight,
  SlidersHorizontal,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalDescription,
} from "@/components/ui/responsive-modal";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { FilterChipBar } from "./FilterChipBar";
import { SearchResultCard } from "./SearchResultCard";
import type { Transaction, Category } from "@/types/budget";
import type { SearchResult } from "@/lib/search/transaction-search";
import type { ParsedQuery, ParsedFilters } from "@/lib/search/query-parser";
import { LOCALE_METADATA, type SupportedLocale } from "@/i18n/config";

export interface SearchCommandPaletteProps {
  /** Whether the palette is open */
  open: boolean;
  /** Called when open state changes */
  onOpenChange: (open: boolean) => void;
  /** Search results from the hook */
  results: SearchResult[];
  /** Whether a search is in progress */
  isSearching?: boolean;
  /** Current search query */
  query: string;
  /** Set search query */
  onQueryChange: (query: string) => void;
  /** Parsed query with active filters */
  parsedQuery: ParsedQuery | null;
  /** Total transaction count */
  totalCount: number;
  /** Categories for name resolution */
  categories?: Category[];
  /** Accounts for name resolution */
  accounts?: { id: string; name: string }[];
  /** Called when a result is selected */
  onSelectResult?: (transaction: Transaction) => void;
  /** Called when "View all" is clicked to navigate to transactions page */
  onViewAll?: () => void;
  /** Called when a filter is removed from the chip bar */
  onRemoveFilter?: (filterKey: keyof ParsedFilters) => void;
  /** Called when all filters are cleared */
  onClearFilters?: () => void;
  /** Additional CSS classes */
  className?: string;
}

export function SearchCommandPalette({
  open,
  onOpenChange,
  results,
  isSearching = false,
  query,
  onQueryChange,
  parsedQuery,
  totalCount,
  categories = [],
  accounts = [],
  onSelectResult,
  onViewAll,
  onRemoveFilter,
  onClearFilters,
  className,
}: SearchCommandPaletteProps) {
  const t = useTranslations("transactionSearch");
  const locale = useLocale();
  const inputRef = useRef<HTMLInputElement>(null);
  const [activeSnap, setActiveSnap] = useState<number | string | null>(0.85);

  // Get locale metadata for currency and direction
  const localeData = LOCALE_METADATA[locale as SupportedLocale] || LOCALE_METADATA["en-US"];
  const currency = localeData?.currency || "USD";

  // Build category/account lookup maps
  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of categories) {
      map.set(c.id, c.name);
      map.set(c.name, c.name);
    }
    return map;
  }, [categories]);

  const accountMap = useMemo(() => {
    return new Map(accounts.map((a) => [a.id, a.name]));
  }, [accounts]);

  // Register global keyboard shortcut: Cmd/Ctrl + Shift + F
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "f") {
        e.preventDefault();
        onOpenChange(!open);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  // Focus input when palette opens
  useEffect(() => {
    if (open) {
      // Use rAF to wait for dialog animation
      const id = requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
      return () => cancelAnimationFrame(id);
    }
  }, [open]);

  // Handle result selection
  const handleSelectResult = useCallback(
    (result: SearchResult) => {
      onSelectResult?.(result.item);
      onOpenChange(false);
    },
    [onSelectResult, onOpenChange]
  );

  // Handle "View all" action
  const handleViewAll = useCallback(() => {
    onViewAll?.();
    onOpenChange(false);
  }, [onViewAll, onOpenChange]);

  // Determine if there are active filters
  const hasFilters = parsedQuery?.hasStructuredFilters ?? false;
  const resultCount = results.length;

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={[0.5, 0.85]}
      activeSnapPoint={activeSnap}
      setActiveSnapPoint={setActiveSnap}
      shouldScaleBackground
    >
      <ResponsiveModalContent
        className={cn(
          "overflow-hidden p-0",
          // Desktop: fixed max width
          "sm:max-w-[640px]",
          className
        )}
        hideCloseButton
      >
        {/* Accessible title (sr-only for Dialog) */}
        <ResponsiveModalHeader className="sr-only">
          <ResponsiveModalTitle>{t("commandPaletteTitle")}</ResponsiveModalTitle>
          <ResponsiveModalDescription>{t("commandPaletteDescription")}</ResponsiveModalDescription>
        </ResponsiveModalHeader>

        <Command
          className="flex h-full flex-col"
          shouldFilter={false} // We handle filtering via Fuse.js
        >
          {/* Search input */}
          <div className="flex items-center border-b px-3">
            <Search className="me-2 h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder={t("commandPalettePlaceholder")}
              className={cn(
                "flex h-12 w-full bg-transparent py-3 text-sm outline-none",
                "placeholder:text-muted-foreground"
              )}
              autoFocus
            />
            {isSearching && (
              <Loader2 className="ms-2 h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
            )}
            {query && !isSearching && (
              <button
                onClick={() => onQueryChange("")}
                className="ms-2 shrink-0 rounded-sm p-1 text-muted-foreground hover:text-foreground"
              >
                <XIcon className="h-4 w-4" />
              </button>
            )}
            {/* Keyboard shortcut hint */}
            <kbd className="ms-2 hidden shrink-0 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline-block">
              ESC
            </kbd>
          </div>

          {/* Filter chip bar */}
          {hasFilters && parsedQuery && onRemoveFilter && onClearFilters && (
            <div className="border-b px-3 py-2">
              <FilterChipBar
                filters={parsedQuery.filters}
                onRemoveFilter={onRemoveFilter}
                onClearAll={onClearFilters}
                locale={locale}
                currency={currency}
              />
            </div>
          )}

          {/* Results header */}
          {query && (
            <div className="flex items-center justify-between border-b px-4 py-2 text-xs text-muted-foreground">
              <span>
                {isSearching
                  ? t("searching")
                  : resultCount > 0
                    ? t("resultsFound", { count: resultCount })
                    : t("noResultsFound")}
              </span>
              {resultCount > 0 && (
                <span className="flex items-center gap-1">
                  <SlidersHorizontal className="h-3 w-3" />
                  {t("sortByRelevance")}
                </span>
              )}
            </div>
          )}

          {/* Results list */}
          <CommandList className="max-h-[50vh] overflow-y-auto sm:max-h-[400px]">
            {query && !isSearching && resultCount === 0 && (
              <CommandEmpty className="py-8 text-center">
                <Search className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">{t("noResultsFound")}</p>
                <p className="mt-1 text-xs text-muted-foreground/60">{t("tryDifferentQuery")}</p>
              </CommandEmpty>
            )}

            {!query && (
              <CommandGroup heading={t("quickActions")}>
                <CommandItem
                  onSelect={() => onQueryChange("type:expense")}
                  className="cursor-pointer"
                >
                  <span className="flex-1">{t("showExpenses")}</span>
                </CommandItem>
                <CommandItem
                  onSelect={() => onQueryChange("type:income")}
                  className="cursor-pointer"
                >
                  <span className="flex-1">{t("showIncome")}</span>
                </CommandItem>
                <CommandItem
                  onSelect={() => onQueryChange("date:last30")}
                  className="cursor-pointer"
                >
                  <span className="flex-1">{t("showLast30Days")}</span>
                </CommandItem>
                <CommandItem
                  onSelect={() => onQueryChange("is:recurring")}
                  className="cursor-pointer"
                >
                  <span className="flex-1">{t("showRecurring")}</span>
                </CommandItem>
              </CommandGroup>
            )}

            {resultCount > 0 && (
              <CommandGroup heading={t("results")}>
                {results.slice(0, 20).map((result) => {
                  const catName = result.item.category
                    ? categoryMap.get(result.item.category)
                    : undefined;
                  const acctName = accountMap.get(result.item.accountId);

                  return (
                    <CommandItem
                      key={result.item.id}
                      value={result.item.id}
                      onSelect={() => handleSelectResult(result)}
                      className="cursor-pointer p-0"
                    >
                      <SearchResultCard
                        result={result}
                        categoryName={catName}
                        accountName={acctName}
                        locale={locale}
                        currency={currency}
                      />
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}
          </CommandList>

          {/* Footer: View all */}
          {resultCount > 0 && onViewAll && (
            <div className="border-t p-2">
              <button
                onClick={handleViewAll}
                className={cn(
                  "flex w-full items-center justify-center gap-2 rounded-md py-2 text-sm font-medium",
                  "text-teal-600 transition-colors hover:bg-teal-50 dark:text-teal-400 dark:hover:bg-teal-950"
                )}
              >
                {t("viewAllOnTransactions")}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Keyboard hint footer */}
          <div className="hidden items-center justify-center gap-4 border-t bg-muted/30 px-4 py-1.5 text-[10px] text-muted-foreground sm:flex">
            <span>
              <kbd className="rounded border px-1 font-mono">↑↓</kbd> {t("navigate")}
            </span>
            <span>
              <kbd className="rounded border px-1 font-mono">↵</kbd> {t("select")}
            </span>
            <span>
              <kbd className="rounded border px-1 font-mono">esc</kbd> {t("close")}
            </span>
          </div>
        </Command>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
