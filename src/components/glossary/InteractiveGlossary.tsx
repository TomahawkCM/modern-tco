'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, BookOpen, Filter, Star, Clock, Target, ChevronRight, ArrowUpRight, CheckCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TerminologySearch, type TermDefinition, type TermCategory } from '@/lib/tco-terminology';

interface InteractiveGlossaryProps {
  className?: string;
  onTermSelect?: (term: TermDefinition) => void;
  initialCategory?: TermCategory;
  showOnlyExamRelevant?: boolean;
}

interface FilterState {
  category: TermCategory | 'all';
  difficulty: 'all' | 'beginner' | 'intermediate' | 'advanced';
  importance: 'all' | 'critical' | 'important' | 'useful';
  examRelevant: boolean | null;
  taniumSpecific: boolean | null;
}

const categoryIcons: Record<TermCategory, React.ComponentType<{ className?: string }>> = {
  'basic-it': BookOpen,
  'networking': Target,
  'security': Star,
  'endpoints': CheckCircle,
  'tanium-core': ArrowUpRight,
  'tanium-modules': Target,
  'operations': Info,
  'compliance': Star,
  'troubleshooting': ChevronRight
};

const categoryColors: Record<TermCategory, string> = {
  'basic-it': 'text-blue-600 bg-blue-50',
  'networking': 'text-[#22c55e] bg-green-50',
  'security': 'text-red-600 bg-red-50',
  'endpoints': 'text-cyan-600 bg-cyan-50',
  'tanium-core': 'text-sky-600 bg-sky-50',
  'tanium-modules': 'text-cyan-600 bg-cyan-50',
  'operations': 'text-orange-600 bg-orange-50',
  'compliance': 'text-pink-600 bg-pink-50',
  'troubleshooting': 'text-gray-600 bg-gray-50'
};

const difficultyColors = {
  'beginner': 'text-[#22c55e] bg-green-100',
  'intermediate': 'text-yellow-600 bg-yellow-100',
  'advanced': 'text-red-600 bg-red-100'
};

const importanceColors = {
  'critical': 'text-red-600 bg-red-100',
  'important': 'text-orange-600 bg-orange-100',
  'useful': 'text-blue-600 bg-blue-100'
};

export function InteractiveGlossary({ 
  className = '', 
  onTermSelect,
  initialCategory = 'basic-it',
  showOnlyExamRelevant = false 
}: InteractiveGlossaryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTerm, setSelectedTerm] = useState<TermDefinition | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    category: initialCategory,
    difficulty: 'all',
    importance: 'all',
    examRelevant: showOnlyExamRelevant ? true : null,
    taniumSpecific: null
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
      results = terminologySearch.search('', { limit: 1000 });
    }

    // Apply filters
    results = results.filter(term => {
      if (filters.category !== 'all' && term.category !== filters.category) return false;
      if (filters.difficulty !== 'all' && term.difficulty !== filters.difficulty) return false;
      if (filters.importance !== 'all' && term.importance !== filters.importance) return false;
      if (filters.examRelevant !== null && term.examRelevance !== filters.examRelevant) return false;
      if (filters.taniumSpecific !== null && term.taniumSpecific !== filters.taniumSpecific) return false;
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
      category: 'all',
      difficulty: 'all',
      importance: 'all',
      examRelevant: null,
      taniumSpecific: null
    });
  };

  // Get active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.category !== 'all') count++;
    if (filters.difficulty !== 'all') count++;
    if (filters.importance !== 'all') count++;
    if (filters.examRelevant !== null) count++;
    if (filters.taniumSpecific !== null) count++;
    return count;
  }, [filters]);

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-sky-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BookOpen className="w-6 h-6 text-foreground" />
            <div>
              <h2 className="text-xl font-bold text-foreground">Interactive Glossary</h2>
              <p className="text-cyan-100 text-sm">
                {filteredTerms.length} terms • Search and explore TCO terminology
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="p-6 border-b border-gray-200">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search terms, definitions, examples..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-gray-600"
              >
                ×
              </button>
            )}
          </div>

          {/* Filter Toggle */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="bg-cyan-500 text-foreground text-xs rounded-full px-2 py-1">
                  {activeFilterCount}
                </span>
              )}
            </button>
            {activeFilterCount > 0 && (
              <button
                onClick={resetFilters}
                className="text-sm text-cyan-600 hover:text-cyan-800"
              >
                Clear all filters
              </button>
            )}
          </div>

          {/* Filter Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={filters.category}
                      onChange={(e) => setFilters({ ...filters, category: e.target.value as TermCategory | 'all' })}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500"
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                    <select
                      value={filters.difficulty}
                      onChange={(e) => setFilters({ ...filters, difficulty: e.target.value as FilterState['difficulty'] })}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="all">All Levels</option>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>

                  {/* Importance Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Importance</label>
                    <select
                      value={filters.importance}
                      onChange={(e) => setFilters({ ...filters, importance: e.target.value as FilterState['importance'] })}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500"
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
                          onChange={(e) => setFilters({ 
                            ...filters, 
                            examRelevant: e.target.checked ? true : null 
                          })}
                          className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                        />
                        <span className="text-sm text-gray-700">Exam Relevant Only</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={filters.taniumSpecific === true}
                          onChange={(e) => setFilters({ 
                            ...filters, 
                            taniumSpecific: e.target.checked ? true : null 
                          })}
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
        <div className="w-1/2 border-r border-gray-200 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
            </div>
          ) : filteredTerms.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6">
              <Search className="w-12 h-12 mb-4" />
              <p className="text-lg font-medium">No terms found</p>
              <p className="text-sm text-center">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="p-4 space-y-2">
              {filteredTerms.map((term, index) => {
                const IconComponent = categoryIcons[term.category];
                return (
                  <motion.div
                    key={term.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleTermSelect(term)}
                    className={`p-3 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                      selectedTerm?.id === term.id 
                        ? 'bg-cyan-50 border border-cyan-200' 
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <IconComponent className="w-4 h-4 text-muted-foreground" />
                          <h3 className="font-medium text-gray-900">{term.term}</h3>
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {term.beginnerExplanation}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${categoryColors[term.category]}`}>
                            {term.category}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${difficultyColors[term.difficulty]}`}>
                            {term.difficulty}
                          </span>
                          {term.examRelevance && (
                            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                              Exam
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
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
                  <div className="flex items-center space-x-3 mb-2">
                    {React.createElement(categoryIcons[selectedTerm.category], { 
                      className: "w-6 h-6 text-cyan-600" 
                    })}
                    <h2 className="text-2xl font-bold text-gray-900">{selectedTerm.term}</h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-3 py-1 text-sm rounded-full ${categoryColors[selectedTerm.category]}`}>
                      {selectedTerm.category}
                    </span>
                    <span className={`px-3 py-1 text-sm rounded-full ${difficultyColors[selectedTerm.difficulty]}`}>
                      {selectedTerm.difficulty}
                    </span>
                    <span className={`px-3 py-1 text-sm rounded-full ${importanceColors[selectedTerm.importance]}`}>
                      {selectedTerm.importance}
                    </span>
                    {selectedTerm.examRelevance && (
                      <span className="px-3 py-1 text-sm rounded-full bg-green-100 text-green-800">
                        Exam Relevant
                      </span>
                    )}
                    {selectedTerm.taniumSpecific && (
                      <span className="px-3 py-1 text-sm rounded-full bg-cyan-100 text-cyan-800">
                        Tanium Specific
                      </span>
                    )}
                  </div>
                </div>

                {/* Definitions */}
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Definition</h3>
                    <p className="text-gray-700 leading-relaxed">{selectedTerm.definition}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Beginner Explanation</h3>
                    <p className="text-gray-700 leading-relaxed">{selectedTerm.beginnerExplanation}</p>
                  </div>
                </div>

                {/* Examples */}
                {selectedTerm.examples && selectedTerm.examples.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Examples</h3>
                    <ul className="space-y-1">
                      {selectedTerm.examples.map((example, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-primary mt-1">•</span>
                          <span className="text-gray-700">{example}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Related Terms */}
                {selectedTerm.relatedTerms && selectedTerm.relatedTerms.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Related Terms</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedTerm.relatedTerms.map((relatedTerm, index) => {
                        const related = terminologySearch.getById(relatedTerm);
                        return (
                          <button
                            key={index}
                            onClick={() => related && handleTermSelect(related)}
                            className="px-3 py-1 text-sm bg-cyan-100 text-cyan-700 rounded-full hover:bg-cyan-200 transition-colors"
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
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6">
              <BookOpen className="w-16 h-16 mb-4" />
              <h3 className="text-lg font-medium mb-2">Select a term to learn more</h3>
              <p className="text-sm text-center">
                Click on any term from the list to see detailed explanations, examples, and related concepts
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default InteractiveGlossary;