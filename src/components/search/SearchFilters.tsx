"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { ChevronDown, ChevronRight, RotateCcw } from "lucide-react";
import { useSearch } from "@/contexts/SearchContext";
import { TCODomain, Difficulty, QuestionCategory } from "@/types/exam";
import { cn } from "@/lib/utils";

export function SearchFilters() {
  const { state, setFilters } = useSearch();
  const [expandedSections, setExpandedSections] = useState({
    domains: true,
    difficulties: true,
    categories: true,
    features: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleDomainChange = (domain: string, checked: boolean) => {
    const newDomains = checked
      ? [...state.filters.domains, domain]
      : state.filters.domains.filter((d) => d !== domain);

    setFilters({ domains: newDomains });
  };

  const handleDifficultyChange = (difficulty: string, checked: boolean) => {
    const newDifficulties = checked
      ? [...state.filters.difficulties, difficulty]
      : state.filters.difficulties.filter((d) => d !== difficulty);

    setFilters({ difficulties: newDifficulties });
  };

  const handleCategoryChange = (category: string, checked: boolean) => {
    const newCategories = checked
      ? [...state.filters.categories, category]
      : state.filters.categories.filter((c) => c !== category);

    setFilters({ categories: newCategories });
  };

  const handleFeatureChange = (
    feature: "hasExplanation" | "hasConsoleSteps",
    checked: boolean | undefined
  ) => {
    setFilters({ [feature]: checked });
  };

  const clearAllFilters = () => {
    setFilters({
      domains: [],
      difficulties: [],
      categories: [],
      hasExplanation: undefined,
      hasConsoleSteps: undefined,
    });
  };

  const activeFilterCount =
    [...state.filters.domains, ...state.filters.difficulties, ...state.filters.categories].length +
    (state.filters.hasExplanation !== undefined ? 1 : 0) +
    (state.filters.hasConsoleSteps !== undefined ? 1 : 0);

  return (
    <div className="space-y-6">
      {/* Clear All Filters */}
      {activeFilterCount > 0 && (
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="text-xs">
            {activeFilterCount} active
          </Badge>
          <Button
            onClick={clearAllFilters}
            variant="ghost"
            size="sm"
            className="h-auto p-2 text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="mr-1 h-3 w-3" />
            Clear
          </Button>
        </div>
      )}

      {/* TCO Domains */}
      <Collapsible open={expandedSections.domains} onOpenChange={() => toggleSection("domains")}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="h-auto w-full justify-between p-0 text-left">
            <span className="text-sm font-medium text-foreground">TCO Domains</span>
            {expandedSections.domains ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3 space-y-3">
          {Object.values(TCODomain).map((domain) => {
            const isChecked = state.filters.domains.includes(domain);
            return (
              <div key={domain} className="flex items-center space-x-2">
                <Checkbox
                  id={`domain-${domain}`}
                  checked={isChecked}
                  onCheckedChange={(checked) => handleDomainChange(domain, checked as boolean)}
                  className="border-white/20 data-[state=checked]:bg-tanium-accent"
                />
                <Label
                  htmlFor={`domain-${domain}`}
                  className={cn(
                    "flex-1 cursor-pointer text-sm transition-colors",
                    isChecked ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {domain}
                </Label>
                {isChecked && (
                  <Badge variant="secondary" className="text-xs">
                    ✓
                  </Badge>
                )}
              </div>
            );
          })}
        </CollapsibleContent>
      </Collapsible>

      <Separator className="bg-white/10" />

      {/* Difficulty Levels */}
      <Collapsible
        open={expandedSections.difficulties}
        onOpenChange={() => toggleSection("difficulties")}
      >
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="h-auto w-full justify-between p-0 text-left">
            <span className="text-sm font-medium text-foreground">Difficulty</span>
            {expandedSections.difficulties ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3 space-y-3">
          {Object.values(Difficulty).map((difficulty) => {
            const isChecked = state.filters.difficulties.includes(difficulty);
            return (
              <div key={difficulty} className="flex items-center space-x-2">
                <Checkbox
                  id={`difficulty-${difficulty}`}
                  checked={isChecked}
                  onCheckedChange={(checked) =>
                    handleDifficultyChange(difficulty, checked as boolean)
                  }
                  className="border-white/20 data-[state=checked]:bg-tanium-accent"
                />
                <Label
                  htmlFor={`difficulty-${difficulty}`}
                  className={cn(
                    "flex-1 cursor-pointer text-sm transition-colors",
                    isChecked ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {difficulty}
                </Label>
                <div className="flex items-center gap-1">
                  {difficulty === "Beginner" && (
                    <div className="flex gap-px">
                      <div className="h-2 w-2 rounded-full bg-[#22c55e]"></div>
                      <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                      <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                    </div>
                  )}
                  {difficulty === "Intermediate" && (
                    <div className="flex gap-px">
                      <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                      <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                      <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                    </div>
                  )}
                  {difficulty === "Advanced" && (
                    <div className="flex gap-px">
                      <div className="h-2 w-2 rounded-full bg-red-500"></div>
                      <div className="h-2 w-2 rounded-full bg-red-500"></div>
                      <div className="h-2 w-2 rounded-full bg-red-500"></div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </CollapsibleContent>
      </Collapsible>

      <Separator className="bg-white/10" />

      {/* Question Categories */}
      <Collapsible
        open={expandedSections.categories}
        onOpenChange={() => toggleSection("categories")}
      >
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="h-auto w-full justify-between p-0 text-left">
            <span className="text-sm font-medium text-foreground">Categories</span>
            {expandedSections.categories ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3 space-y-3">
          {Object.values(QuestionCategory).map((category) => {
            const isChecked = state.filters.categories.includes(category);
            return (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category}`}
                  checked={isChecked}
                  onCheckedChange={(checked) => handleCategoryChange(category, checked as boolean)}
                  className="border-white/20 data-[state=checked]:bg-tanium-accent"
                />
                <Label
                  htmlFor={`category-${category}`}
                  className={cn(
                    "flex-1 cursor-pointer text-sm transition-colors",
                    isChecked ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {category}
                </Label>
              </div>
            );
          })}
        </CollapsibleContent>
      </Collapsible>

      <Separator className="bg-white/10" />

      {/* Special Features */}
      <Collapsible open={expandedSections.features} onOpenChange={() => toggleSection("features")}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="h-auto w-full justify-between p-0 text-left">
            <span className="text-sm font-medium text-foreground">Features</span>
            {expandedSections.features ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3 space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="has-explanation"
              checked={state.filters.hasExplanation === true}
              onCheckedChange={(checked) =>
                handleFeatureChange("hasExplanation", checked ? true : undefined)
              }
              className="border-white/20 data-[state=checked]:bg-tanium-accent"
            />
            <Label
              htmlFor="has-explanation"
              className="flex-1 cursor-pointer text-sm text-muted-foreground"
            >
              Has detailed explanation
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="has-console-steps"
              checked={state.filters.hasConsoleSteps === true}
              onCheckedChange={(checked) =>
                handleFeatureChange("hasConsoleSteps", checked ? true : undefined)
              }
              className="border-white/20 data-[state=checked]:bg-tanium-accent"
            />
            <Label
              htmlFor="has-console-steps"
              className="flex-1 cursor-pointer text-sm text-muted-foreground"
            >
              Includes console steps
            </Label>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
