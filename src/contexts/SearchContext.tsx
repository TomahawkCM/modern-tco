"use client";

import React, { createContext, useContext, useReducer, useEffect, useCallback } from "react";
import type { Question } from "@/types/exam";
import { useQuestions } from "@/contexts/QuestionsContext";

interface SearchFilters {
  domains: string[];
  difficulties: string[];
  categories: string[];
  hasExplanation?: boolean;
  hasConsoleSteps?: boolean;
}

interface SearchResult {
  question: Question;
  relevanceScore: number;
  matchedFields: string[];
}

interface SearchState {
  query: string;
  filters: SearchFilters;
  results: SearchResult[];
  isSearching: boolean;
  selectedQuestions: Question[];
  searchHistory: string[];
  suggestions: string[];
  currentPage: number;
  itemsPerPage: number;
  totalResults: number;
}

type SearchAction =
  | { type: "SET_QUERY"; query: string }
  | { type: "SET_FILTERS"; filters: Partial<SearchFilters> }
  | { type: "SET_RESULTS"; results: SearchResult[]; totalResults: number }
  | { type: "SET_SEARCHING"; isSearching: boolean }
  | { type: "ADD_TO_SELECTION"; question: Question }
  | { type: "REMOVE_FROM_SELECTION"; questionId: string }
  | { type: "CLEAR_SELECTION" }
  | { type: "SET_PAGE"; page: number }
  | { type: "SET_ITEMS_PER_PAGE"; itemsPerPage: number }
  | { type: "ADD_TO_HISTORY"; query: string }
  | { type: "SET_SUGGESTIONS"; suggestions: string[] }
  | { type: "RESET_SEARCH" };

const initialFilters: SearchFilters = {
  domains: [],
  difficulties: [],
  categories: [],
  hasExplanation: undefined,
  hasConsoleSteps: undefined,
};

const initialState: SearchState = {
  query: "",
  filters: initialFilters,
  results: [],
  isSearching: false,
  selectedQuestions: [],
  searchHistory: [],
  suggestions: [],
  currentPage: 1,
  itemsPerPage: 10,
  totalResults: 0,
};

const searchReducer = (state: SearchState, action: SearchAction): SearchState => {
  switch (action.type) {
    case "SET_QUERY":
      return {
        ...state,
        query: action.query,
        currentPage: 1,
      };

    case "SET_FILTERS":
      return {
        ...state,
        filters: { ...state.filters, ...action.filters },
        currentPage: 1,
      };

    case "SET_RESULTS":
      return {
        ...state,
        results: action.results,
        totalResults: action.totalResults,
        isSearching: false,
      };

    case "SET_SEARCHING":
      return {
        ...state,
        isSearching: action.isSearching,
      };

    case "ADD_TO_SELECTION":
      if (state.selectedQuestions.find((q) => q.id === action.question.id)) {
        return state;
      }
      return {
        ...state,
        selectedQuestions: [...state.selectedQuestions, action.question],
      };

    case "REMOVE_FROM_SELECTION":
      return {
        ...state,
        selectedQuestions: state.selectedQuestions.filter((q) => q.id !== action.questionId),
      };

    case "CLEAR_SELECTION":
      return {
        ...state,
        selectedQuestions: [],
      };

    case "SET_PAGE":
      return {
        ...state,
        currentPage: action.page,
      };

    case "SET_ITEMS_PER_PAGE":
      return {
        ...state,
        itemsPerPage: action.itemsPerPage,
        currentPage: 1,
      };

    case "ADD_TO_HISTORY":
      const newHistory = [
        action.query,
        ...state.searchHistory.filter((q) => q !== action.query),
      ].slice(0, 10); // Keep only last 10 searches
      return {
        ...state,
        searchHistory: newHistory,
      };

    case "SET_SUGGESTIONS":
      return {
        ...state,
        suggestions: action.suggestions,
      };

    case "RESET_SEARCH":
      return {
        ...state,
        query: "",
        filters: initialFilters,
        results: [],
        currentPage: 1,
        totalResults: 0,
      };

    default:
      return state;
  }
};

interface SearchContextValue {
  state: SearchState;
  setQuery: (query: string) => void;
  setFilters: (filters: Partial<SearchFilters>) => void;
  performSearch: () => Promise<void>;
  addToSelection: (question: Question) => void;
  removeFromSelection: (questionId: string) => void;
  clearSelection: () => void;
  setPage: (page: number) => void;
  setItemsPerPage: (itemsPerPage: number) => void;
  resetSearch: () => void;
  generateSuggestions: (query: string) => void;
}

const SearchContext = createContext<SearchContextValue | null>(null);

// Search algorithm with relevance scoring
const calculateRelevanceScore = (
  question: Question,
  query: string,
  filters: SearchFilters
): number => {
  if (
    !query.trim() &&
    Object.values(filters).every((v) => !v || (Array.isArray(v) && v.length === 0))
  ) {
    return 1; // Default score for no search/filters
  }

  let score = 0;
  const queryLower = query.toLowerCase();
  const questionText = question.question.toLowerCase();
  const explanation = question.explanation?.toLowerCase() || "";
  const choices = question.choices.map((c) => c.text.toLowerCase()).join(" ");

  // Text relevance scoring
  if (queryLower) {
    if (questionText.includes(queryLower)) score += 10;
    if (question.domain.toLowerCase().includes(queryLower)) score += 8;
    if (choices.includes(queryLower)) score += 5;
    if (explanation.includes(queryLower)) score += 3;

    // Bonus for exact matches
    if (questionText === queryLower) score += 5;
    if (questionText.startsWith(queryLower)) score += 3;
  }

  return Math.max(score, 0.1); // Minimum score to avoid zero
};

const filterQuestion = (question: Question, filters: SearchFilters): boolean => {
  // Domain filter
  if (filters.domains.length > 0 && !filters.domains.includes(question.domain)) {
    return false;
  }

  // Difficulty filter
  if (filters.difficulties.length > 0 && !filters.difficulties.includes(question.difficulty)) {
    return false;
  }

  // Category filter (if categories exist in question type)
  if (filters.categories.length > 0) {
    // This would need to be implemented based on question categorization
    // For now, we'll skip this filter
  }

  // Has explanation filter
  if (filters.hasExplanation !== undefined) {
    const hasExplanation = !!question.explanation;
    if (filters.hasExplanation !== hasExplanation) {
      return false;
    }
  }

  // Has console steps filter (placeholder for future implementation)
  if (filters.hasConsoleSteps !== undefined) {
    // This would check for console-specific content in questions
    // For now, we'll assume all questions could have console steps
  }

  return true;
};

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(searchReducer, initialState);
  const { questions } = useQuestions();

  // Load search history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem("tco-search-history");
    if (savedHistory) {
      try {
        const history = JSON.parse(savedHistory) as string[];
        history.forEach((query) => {
          dispatch({ type: "ADD_TO_HISTORY", query });
        });
      } catch (error) {
        console.error("Failed to load search history:", error);
      }
    }
  }, []);

  // Save search history to localStorage
  useEffect(() => {
    if (state.searchHistory.length > 0) {
      localStorage.setItem("tco-search-history", JSON.stringify(state.searchHistory));
    }
  }, [state.searchHistory]);

  const setQuery = useCallback((query: string) => {
    dispatch({ type: "SET_QUERY", query });
  }, []);

  const setFilters = useCallback((filters: Partial<SearchFilters>) => {
    dispatch({ type: "SET_FILTERS", filters });
  }, []);

  const performSearch = useCallback(async () => {
    dispatch({ type: "SET_SEARCHING", isSearching: true });

    // Add to search history if query exists
    if (state.query.trim()) {
      dispatch({ type: "ADD_TO_HISTORY", query: state.query.trim() });
    }

    // Simulate async search (in real app, this might be an API call)
    await new Promise((resolve) => setTimeout(resolve, 300));

    try {
      // Check if questions are available before filtering
      if (!questions || !Array.isArray(questions) || questions.length === 0) {
        dispatch({
          type: "SET_RESULTS",
          results: [],
          totalResults: 0,
        });
        dispatch({ type: "SET_SEARCHING", isSearching: false });
        return;
      }

      // Filter and score all questions
      const searchResults: SearchResult[] = questions
        .filter((question) => filterQuestion(question, state.filters))
        .map((question) => ({
          question,
          relevanceScore: calculateRelevanceScore(question, state.query, state.filters),
          matchedFields: getMatchedFields(question, state.query),
        }))
        .filter((result) => result.relevanceScore > 0)
        .sort((a, b) => b.relevanceScore - a.relevanceScore);

      dispatch({
        type: "SET_RESULTS",
        results: searchResults,
        totalResults: searchResults.length,
      });
    } catch (error) {
      console.error("Search failed:", error);
      dispatch({ type: "SET_SEARCHING", isSearching: false });
    }
  }, [state.query, state.filters, questions]);

  // Auto-search when query or filters change (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [performSearch]);

  const addToSelection = useCallback((question: Question) => {
    dispatch({ type: "ADD_TO_SELECTION", question });
  }, []);

  const removeFromSelection = useCallback((questionId: string) => {
    dispatch({ type: "REMOVE_FROM_SELECTION", questionId });
  }, []);

  const clearSelection = useCallback(() => {
    dispatch({ type: "CLEAR_SELECTION" });
  }, []);

  const setPage = useCallback((page: number) => {
    dispatch({ type: "SET_PAGE", page });
  }, []);

  const setItemsPerPage = useCallback((itemsPerPage: number) => {
    dispatch({ type: "SET_ITEMS_PER_PAGE", itemsPerPage });
  }, []);

  const resetSearch = useCallback(() => {
    dispatch({ type: "RESET_SEARCH" });
  }, []);

  const generateSuggestions = useCallback(
    (query: string) => {
      if (!query.trim()) {
        dispatch({ type: "SET_SUGGESTIONS", suggestions: [] });
        return;
      }

      const queryLower = query.toLowerCase();
      const suggestions = new Set<string>();

      // Add domain suggestions
      const domains = [
        "Platform Fundamentals",
        "Endpoint Management",
        "Content Management",
        "Advanced Features",
        "Troubleshooting",
      ];
      domains.forEach((domain) => {
        if (domain.toLowerCase().includes(queryLower)) {
          suggestions.add(domain);
        }
      });

      // Add common search terms from questions
      const commonTerms = [
        "console",
        "sensor",
        "package",
        "action",
        "question",
        "endpoint",
        "compliance",
        "patch",
        "deployment",
      ];
      commonTerms.forEach((term) => {
        if (term.includes(queryLower)) {
          suggestions.add(term);
        }
      });

      // Add from search history
      state.searchHistory.forEach((historyQuery) => {
        if (historyQuery.toLowerCase().includes(queryLower) && historyQuery !== query) {
          suggestions.add(historyQuery);
        }
      });

      dispatch({
        type: "SET_SUGGESTIONS",
        suggestions: Array.from(suggestions).slice(0, 5),
      });
    },
    [state.searchHistory]
  );

  const value: SearchContextValue = {
    state,
    setQuery,
    setFilters,
    performSearch,
    addToSelection,
    removeFromSelection,
    clearSelection,
    setPage,
    setItemsPerPage,
    resetSearch,
    generateSuggestions,
  };

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

// Helper function to identify matched fields
function getMatchedFields(question: Question, query: string): string[] {
  if (!query.trim()) return [];

  const fields: string[] = [];
  const queryLower = query.toLowerCase();

  if (question.question.toLowerCase().includes(queryLower)) {
    fields.push("question");
  }
  if (question.domain.toLowerCase().includes(queryLower)) {
    fields.push("domain");
  }
  if (question.choices.some((c) => c.text.toLowerCase().includes(queryLower))) {
    fields.push("choices");
  }
  if (question.explanation?.toLowerCase().includes(queryLower)) {
    fields.push("explanation");
  }

  return fields;
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
}
