"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  BookOpen,
  Filter,
  Star,
  Clock,
  Target,
  ChevronRight,
  ArrowUpRight,
  CheckCircle,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TerminologySearch, type TermDefinition, type TermCategory } from "@/lib/tco-terminology";

interface InteractiveGlossaryProps {
  className?: string;
  onTermSelect?: (term: TermDefinition) => void;
  initialCategory?: TermCategory;
  showOnlyExamRelevant?: boolean;
}

interface FilterState {
  category: TermCategory | "all";
  difficulty: "all" | "beginner" | "intermediate" | "advanced";
  importance: "all" | "critical" | "important" | "useful";
  examRelevant: boolean | null;
  taniumSpecific: boolean | null;
}

const categoryIcons: Record<TermCategory, React.ComponentType<{ className?: string }>> = {
  "basic-it": BookOpen,
  networking: Target,
  security: Star,
  endpoints: CheckCircle,
  "tanium-core": ArrowUpRight,
  "tanium-modules": Target,
  operations: Info,
  compliance: Star,
  troubleshooting: ChevronRight,
};

const categoryColors: Record<TermCategory, string> = {
  "basic-it": "text-blue-600 bg-blue-50",
  networking: "text-[#22c55e] bg-green-50",
  security: "text-red-600 bg-red-50",
  endpoints: "text-cyan-600 bg-cyan-50",
  "tanium-core": "text-sky-600 bg-sky-50",
  "tanium-modules": "text-cyan-600 bg-cyan-50",
  operations: "text-orange-600 bg-orange-50",
  compliance: "text-pink-600 bg-pink-50",
  troubleshooting: "text-gray-600 bg-gray-50",
};

const difficultyColors = {
  beginner: "text-[#22c55e] bg-green-100",
  intermediate: "text-yellow-600 bg-yellow-100",
  advanced: "text-red-600 bg-red-100",
};

const importanceColors = {
  critical: "text-red-600 bg-red-100",
  important: "text-orange-600 bg-orange-100",
  useful: "text-blue-600 bg-blue-100",
};

export function InteractiveGlossary({
  className = "",
  onTermSelect,
  initialCategory = "basic-it",
  showOnlyExamRelevant = false,
}: InteractiveGlossaryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTerm, setSelectedTerm] = useState<TermDefinition | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    category: initialCategory,
    difficulty: "all",
    importance: "all",
    examRelevant: showOnlyExamRelevant ? true : null,
    taniumSpecific: null,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize terminology search
  const terminologySearch = useMemo(() => new TerminologySearch(), []);

  // Filtered and searched terms
  const filteredTerms = useMemo(() => {
    setIsLoading(true);

    let results: TermDefinition[] = [];

    if (searchTerm.trim()) {
      results = terminologySearch.search(searchTerm);
    } else {
      results = terminologySearch.search("", { limit: 1000 });
    }

    // Apply filters
    results = results.filter((term) => {
      if (filters.category !== "all" && term.category !== filters.category) return false;
      if (filters.difficulty !== "all" && term.difficulty !== filters.difficulty) return false;
      if (filters.importance !== "all" && term.importance !== filters.importance) return false;
      if (filters.examRelevant !== null && term.examRelevance !== filters.examRelevant)
        return false;
      if (filters.taniumSpecific !== null && term.taniumSpecific !== filters.taniumSpecific)
        return false;
      return true;
    });

    setIsLoading(false);
    return results;
  }, [searchTerm, filters, terminologySearch]);

  // Handle term selection
  const handleTermSelect = (term: TermDefinition) => {
    setSelectedTerm(term);
    onTermSelect?.(term);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      category: "all",
      difficulty: "all",
      importance: "all",
      examRelevant: null,
      taniumSpecific: null,
    });
  };

  // Get active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.category !== "all") count++;
    if (filters.difficulty !== "all") count++;
    if (filters.importance !== "all") count++;
    if (filters.examRelevant !== null) count++;
    if (filters.taniumSpecific !== null) count++;
    return count;
  }, [filters]);

  return (
    <div
      className={`overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg ${className}`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-sky-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BookOpen className="h-6 w-6 text-foreground" />
            <div>
              <h2 className="text-xl font-bold text-foreground">Interactive Glossary</h2>
              <p className="text-sm text-cyan-100">
                {filteredTerms.length} terms • Search and explore TCO terminology
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="border-b border-gray-200 p-6">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search terms, definitions, examples..."
              className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-cyan-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 transform text-muted-foreground hover:text-gray-600"
              >
                ×
              </button>
            )}
          </div>

          {/* Filter Toggle */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 rounded-lg border border-gray-300 px-4 py-2 transition-colors hover:bg-gray-50"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="rounded-full bg-cyan-500 px-2 py-1 text-xs text-foreground">
                  {activeFilterCount}
                </span>
              )}
            </button>
            {activeFilterCount > 0 && (
              <button onClick={resetFilters} className="text-sm text-cyan-600 hover:text-cyan-800">
                Clear all filters
              </button>
            )}
          </div>

          {/* Filter Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 gap-4 rounded-lg bg-gray-50 p-4 md:grid-cols-2 lg:grid-cols-3">
                  {/* Category Filter */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Category</label>
                    <select
                      value={filters.category}
                      onChange={(e) =>
                        setFilters({ ...filters, category: e.target.value as TermCategory | "all" })
                      }
                      className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="all">All Categories</option>
                      <option value="basic-it">Basic IT</option>
                      <option value="networking">Networking</option>
                      <option value="security">Security</option>
                      <option value="endpoint-management">Endpoint Management</option>
                      <option value="tanium-platform">Tanium Platform</option>
                      <option value="tanium-modules">Tanium Modules</option>
                      <option value="enterprise-operations">Enterprise Operations</option>
                      <option value="compliance">Compliance</option>
                      <option value="advanced-concepts">Advanced Concepts</option>
                    </select>
                  </div>

                  {/* Difficulty Filter */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Difficulty
                    </label>
                    <select
                      value={filters.difficulty}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          difficulty: e.target.value as FilterState["difficulty"],
                        })
                      }
                      className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="all">All Levels</option>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>

                  {/* Importance Filter */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Importance
                    </label>
                    <select
                      value={filters.importance}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          importance: e.target.value as FilterState["importance"],
                        })
                      }
                      className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="all">All Importance</option>
                      <option value="critical">Critical</option>
                      <option value="important">Important</option>
                      <option value="useful">Useful</option>
                    </select>
                  </div>

                  {/* Boolean Filters */}
                  <div className="col-span-full">
                    <div className="flex flex-wrap gap-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={filters.examRelevant === true}
                          onChange={(e) =>
                            setFilters({
                              ...filters,
                              examRelevant: e.target.checked ? true : null,
                            })
                          }
                          className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                        />
                        <span className="text-sm text-gray-700">Exam Relevant Only</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={filters.taniumSpecific === true}
                          onChange={(e) =>
                            setFilters({
                              ...filters,
                              taniumSpecific: e.target.checked ? true : null,
                            })
                          }
                          className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                        />
                        <span className="text-sm text-gray-700">Tanium Specific Only</span>
                      </label>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Content */}
      <div className="flex h-96">
        {/* Terms List */}
        <div className="w-1/2 overflow-y-auto border-r border-gray-200">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-cyan-500"></div>
            </div>
          ) : filteredTerms.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center p-6 text-muted-foreground">
              <Search className="mb-4 h-12 w-12" />
              <p className="text-lg font-medium">No terms found</p>
              <p className="text-center text-sm">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="space-y-2 p-4">
              {filteredTerms.map((term, index) => {
                const IconComponent = categoryIcons[term.category];
                return (
                  <motion.div
                    key={term.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleTermSelect(term)}
                    className={`cursor-pointer rounded-lg p-3 transition-all hover:shadow-md ${
                      selectedTerm?.id === term.id
                        ? "border border-cyan-200 bg-cyan-50"
                        : "bg-gray-50 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <IconComponent className="h-4 w-4 text-muted-foreground" />
                          <h3 className="font-medium text-gray-900">{term.term}</h3>
                        </div>
                        <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                          {term.beginnerExplanation}
                        </p>
                        <div className="mt-2 flex items-center space-x-2">
                          <span
                            className={`rounded-full px-2 py-1 text-xs ${categoryColors[term.category]}`}
                          >
                            {term.category}
                          </span>
                          <span
                            className={`rounded-full px-2 py-1 text-xs ${difficultyColors[term.difficulty]}`}
                          >
                            {term.difficulty}
                          </span>
                          {term.examRelevance && (
                            <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">
                              Exam
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Term Details */}
        <div className="w-1/2 overflow-y-auto">
          {selectedTerm ? (
            <div className="p-6">
              <div className="space-y-6">
                {/* Term Header */}
                <div>
                  <div className="mb-2 flex items-center space-x-3">
                    {React.createElement(categoryIcons[selectedTerm.category], {
                      className: "w-6 h-6 text-cyan-600",
                    })}
                    <h2 className="text-2xl font-bold text-gray-900">{selectedTerm.term}</h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-sm ${categoryColors[selectedTerm.category]}`}
                    >
                      {selectedTerm.category}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-sm ${difficultyColors[selectedTerm.difficulty]}`}
                    >
                      {selectedTerm.difficulty}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-sm ${importanceColors[selectedTerm.importance]}`}
                    >
                      {selectedTerm.importance}
                    </span>
                    {selectedTerm.examRelevance && (
                      <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-800">
                        Exam Relevant
                      </span>
                    )}
                    {selectedTerm.taniumSpecific && (
                      <span className="rounded-full bg-cyan-100 px-3 py-1 text-sm text-cyan-800">
                        Tanium Specific
                      </span>
                    )}
                  </div>
                </div>

                {/* Definitions */}
                <div className="space-y-4">
                  <div>
                    <h3 className="mb-2 font-semibold text-gray-900">Definition</h3>
                    <p className="leading-relaxed text-gray-700">{selectedTerm.definition}</p>
                  </div>

                  <div>
                    <h3 className="mb-2 font-semibold text-gray-900">Beginner Explanation</h3>
                    <p className="leading-relaxed text-gray-700">
                      {selectedTerm.beginnerExplanation}
                    </p>
                  </div>
                </div>

                {/* Examples */}
                {selectedTerm.examples && selectedTerm.examples.length > 0 && (
                  <div>
                    <h3 className="mb-2 font-semibold text-gray-900">Examples</h3>
                    <ul className="space-y-1">
                      {selectedTerm.examples.map((example, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="mt-1 text-primary">•</span>
                          <span className="text-gray-700">{example}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Related Terms */}
                {selectedTerm.relatedTerms && selectedTerm.relatedTerms.length > 0 && (
                  <div>
                    <h3 className="mb-2 font-semibold text-gray-900">Related Terms</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedTerm.relatedTerms.map((relatedTerm, index) => {
                        const related = terminologySearch.getById(relatedTerm);
                        return (
                          <button
                            key={index}
                            onClick={() => related && handleTermSelect(related)}
                            className="rounded-full bg-cyan-100 px-3 py-1 text-sm text-cyan-700 transition-colors hover:bg-cyan-200"
                          >
                            {related?.term ?? relatedTerm}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center p-6 text-muted-foreground">
              <BookOpen className="mb-4 h-16 w-16" />
              <h3 className="mb-2 text-lg font-medium">Select a term to learn more</h3>
              <p className="text-center text-sm">
                Click on any term from the list to see detailed explanations, examples, and related
                concepts
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default InteractiveGlossary;
