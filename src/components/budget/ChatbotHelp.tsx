'use client';

/**
 * Chatbot Help & Suggested Questions Component
 *
 * Displays context-aware suggested questions for the AI chatbot
 * Integrates with ChatWindow.tsx to help users get started
 *
 * Usage:
 * ```tsx
 * import { ChatbotHelp } from '@/components/budget/ChatbotHelp';
 *
 * <ChatbotHelp
 *   onQuestionClick={(question) => sendMessage(question)}
 *   variant="welcome"  // or "inline" or "quick-actions"
 * />
 * ```
 */

import { useState, useEffect } from 'react';
import {
  TrendingUp,
  DollarSign,
  Calendar,
  ShoppingCart,
  PieChart,
  AlertTriangle,
  HelpCircle,
  Sparkles,
  Target,
  Receipt
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { db } from '@/lib/budget-db';
import { startOfMonth, endOfMonth, subMonths } from 'date-fns';

interface SuggestedQuestion {
  id: string;
  question: string;
  category: 'spending' | 'budget' | 'income' | 'trends' | 'quick-action';
  icon: React.ElementType;
  badge?: string;
  description?: string;
}

interface ChatbotHelpProps {
  onQuestionClick: (question: string) => void;
  variant?: 'welcome' | 'inline' | 'quick-actions';
  className?: string;
}

export function ChatbotHelp({
  onQuestionClick,
  variant = 'welcome',
  className = ''
}: ChatbotHelpProps) {
  const [suggestions, setSuggestions] = useState<SuggestedQuestion[]>([]);
  const [smartSuggestions, setSmartSuggestions] = useState<SuggestedQuestion[]>([]);

  // Load smart suggestions based on user's recent activity
  useEffect(() => {
    loadSmartSuggestions();
  }, []);

  async function loadSmartSuggestions() {
    try {
      const now = new Date();
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);

      // Get this month's transactions
      const thisMonthTransactions = await db.transactions
        .where('date')
        .between(monthStart, monthEnd)
        .toArray();

      // Get last month's transactions for comparison
      const lastMonthStart = startOfMonth(subMonths(now, 1));
      const lastMonthEnd = endOfMonth(subMonths(now, 1));
      const lastMonthTransactions = await db.transactions
        .where('date')
        .between(lastMonthStart, lastMonthEnd)
        .toArray();

      // Get budgets
      const budgets = await db.budgets.toArray();

      const smart: SuggestedQuestion[] = [];

      // Suggestion 1: Recent high-value transaction
      const recentLarge = thisMonthTransactions
        .filter(t => t.amount < 0)
        .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))[0];

      if (recentLarge && Math.abs(recentLarge.amount) > 100) {
        smart.push({
          id: 'recent-large',
          question: `Tell me about my $${Math.abs(recentLarge.amount).toFixed(2)} ${recentLarge.category} expense`,
          category: 'spending',
          icon: AlertTriangle,
          badge: 'Recent',
          description: 'Large transaction this month',
        });
      }

      // Suggestion 2: Month-over-month comparison
      if (lastMonthTransactions.length > 0) {
        smart.push({
          id: 'mom-comparison',
          question: 'How does this month compare to last month?',
          category: 'trends',
          icon: TrendingUp,
          badge: 'Trending',
          description: 'Compare monthly spending',
        });
      }

      // Suggestion 3: Budget status (if any budgets exist)
      if (budgets.length > 0) {
        smart.push({
          id: 'budget-status',
          question: 'Am I staying within my budgets this month?',
          category: 'budget',
          icon: Target,
          badge: 'Budget',
          description: 'Check budget progress',
        });
      }

      // Suggestion 4: Top spending category this month
      const categoryTotals = thisMonthTransactions
        .filter(t => t.amount < 0 && t.category)
        .reduce((acc, t) => {
          const category = t.category!; // Safe because we filtered above
          acc[category] = (acc[category] || 0) + Math.abs(t.amount);
          return acc;
        }, {} as Record<string, number>);

      const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
      if (topCategory) {
        smart.push({
          id: 'top-category',
          question: `Show me all my ${topCategory[0]} expenses this month`,
          category: 'spending',
          icon: PieChart,
          badge: 'Top Spending',
          description: `$${topCategory[1].toFixed(2)} so far`,
        });
      }

      setSmartSuggestions(smart);
    } catch (error) {
      console.error('[ChatbotHelp] Error loading smart suggestions:', error);
    }
  }

  // Static suggested questions (always available)
  const defaultSuggestions: SuggestedQuestion[] = [
    // Spending Analysis
    {
      id: 'total-spending',
      question: 'How much did I spend this month?',
      category: 'spending',
      icon: DollarSign,
      description: 'Total expenses for current month',
    },
    {
      id: 'top-categories',
      question: 'What are my top 5 spending categories?',
      category: 'spending',
      icon: PieChart,
      description: 'Breakdown by category',
    },
    {
      id: 'groceries',
      question: 'How much did I spend on groceries this month?',
      category: 'spending',
      icon: ShoppingCart,
      description: 'Category-specific total',
    },

    // Budget Status
    {
      id: 'budget-overview',
      question: 'Show me my budget progress',
      category: 'budget',
      icon: Target,
      description: 'All budgets at a glance',
    },
    {
      id: 'budget-remaining',
      question: 'How much budget do I have left?',
      category: 'budget',
      icon: DollarSign,
      description: 'Remaining amounts by category',
    },

    // Income & Savings
    {
      id: 'income-this-month',
      question: 'How much income did I earn this month?',
      category: 'income',
      icon: TrendingUp,
      description: 'Total income for current month',
    },
    {
      id: 'net-savings',
      question: "What's my net savings this month?",
      category: 'income',
      icon: DollarSign,
      description: 'Income minus expenses',
    },

    // Trends & Patterns
    {
      id: 'spending-trend',
      question: 'Show my spending trend for the past 3 months',
      category: 'trends',
      icon: TrendingUp,
      description: 'Historical comparison',
    },
    {
      id: 'average-weekly',
      question: "What's my average weekly spending?",
      category: 'trends',
      icon: Calendar,
      description: 'Weekly spending average',
    },

    // Quick Actions (Coming Soon)
    {
      id: 'add-transaction-example',
      question: 'Add $50 grocery expense',
      category: 'quick-action',
      icon: Receipt,
      badge: 'Coming Soon',
      description: 'Quick transaction entry',
    },
  ];

  const categorizedSuggestions = {
    spending: defaultSuggestions.filter(s => s.category === 'spending'),
    budget: defaultSuggestions.filter(s => s.category === 'budget'),
    income: defaultSuggestions.filter(s => s.category === 'income'),
    trends: defaultSuggestions.filter(s => s.category === 'trends'),
    actions: defaultSuggestions.filter(s => s.category === 'quick-action'),
  };

  // Render variants

  if (variant === 'welcome') {
    return (
      <div className={`space-y-6 ${className}`}>
        {/* Welcome Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">Ask me anything about your finances</h3>
          </div>
          <p className="text-sm text-gray-600">
            Try one of these questions to get started, or type your own
          </p>
        </div>

        {/* Smart Suggestions (if available) */}
        {smartSuggestions.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <h4 className="text-sm font-medium text-gray-900">Smart Suggestions</h4>
            </div>
            <div className="grid gap-2">
              {smartSuggestions.map((suggestion) => (
                <SuggestionButton
                  key={suggestion.id}
                  suggestion={suggestion}
                  onClick={() => onQuestionClick(suggestion.question)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Categorized Suggestions */}
        <Tabs defaultValue="spending" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="spending">Spending</TabsTrigger>
            <TabsTrigger value="budget">Budget</TabsTrigger>
            <TabsTrigger value="income">Income</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
          </TabsList>

          <TabsContent value="spending" className="space-y-2 mt-4">
            {categorizedSuggestions.spending.map((suggestion) => (
              <SuggestionButton
                key={suggestion.id}
                suggestion={suggestion}
                onClick={() => onQuestionClick(suggestion.question)}
              />
            ))}
          </TabsContent>

          <TabsContent value="budget" className="space-y-2 mt-4">
            {categorizedSuggestions.budget.map((suggestion) => (
              <SuggestionButton
                key={suggestion.id}
                suggestion={suggestion}
                onClick={() => onQuestionClick(suggestion.question)}
              />
            ))}
          </TabsContent>

          <TabsContent value="income" className="space-y-2 mt-4">
            {categorizedSuggestions.income.map((suggestion) => (
              <SuggestionButton
                key={suggestion.id}
                suggestion={suggestion}
                onClick={() => onQuestionClick(suggestion.question)}
              />
            ))}
          </TabsContent>

          <TabsContent value="trends" className="space-y-2 mt-4">
            {categorizedSuggestions.trends.map((suggestion) => (
              <SuggestionButton
                key={suggestion.id}
                suggestion={suggestion}
                onClick={() => onQuestionClick(suggestion.question)}
              />
            ))}
          </TabsContent>

          <TabsContent value="actions" className="space-y-2 mt-4">
            {categorizedSuggestions.actions.map((suggestion) => (
              <SuggestionButton
                key={suggestion.id}
                suggestion={suggestion}
                onClick={() => onQuestionClick(suggestion.question)}
              />
            ))}
          </TabsContent>
        </Tabs>

        {/* Help Link */}
        <div className="text-center pt-4 border-t">
          <Button
            variant="link"
            size="sm"
            className="text-gray-600 hover:text-gray-900"
            onClick={() => onQuestionClick('/help')}
          >
            <HelpCircle className="w-4 h-4 mr-2" />
            View all example questions
          </Button>
        </div>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={`space-y-3 ${className}`}>
        <h4 className="text-sm font-medium text-gray-700">Suggested Questions</h4>
        <div className="grid gap-2">
          {smartSuggestions.slice(0, 3).map((suggestion) => (
            <SuggestionButton
              key={suggestion.id}
              suggestion={suggestion}
              onClick={() => onQuestionClick(suggestion.question)}
              compact
            />
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'quick-actions') {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {[
          { q: 'Total spent this month', icon: DollarSign },
          { q: 'Budget status', icon: Target },
          { q: 'Top expenses', icon: PieChart },
          { q: 'Compare to last month', icon: TrendingUp },
        ].map((item, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => onQuestionClick(item.q)}
            className="gap-2"
          >
            <item.icon className="w-3 h-3" />
            {item.q}
          </Button>
        ))}
      </div>
    );
  }

  return null;
}

/**
 * Individual suggestion button component
 */
function SuggestionButton({
  suggestion,
  onClick,
  compact = false,
}: {
  suggestion: SuggestedQuestion;
  onClick: () => void;
  compact?: boolean;
}) {
  const Icon = suggestion.icon;

  if (compact) {
    return (
      <Button
        variant="outline"
        className="w-full justify-start text-left h-auto py-3 px-4"
        onClick={onClick}
      >
        <div className="flex items-center gap-3 w-full">
          <Icon className="w-4 h-4 text-gray-500 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {suggestion.question}
            </p>
          </div>
          {suggestion.badge && (
            <Badge variant="secondary" className="ml-2 flex-shrink-0">
              {suggestion.badge}
            </Badge>
          )}
        </div>
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      className="w-full justify-start text-left h-auto py-4 px-4 hover:bg-gray-50"
      onClick={onClick}
    >
      <div className="flex items-start gap-3 w-full">
        <div className="rounded-lg bg-gray-100 p-2 flex-shrink-0">
          <Icon className="w-5 h-5 text-gray-600" />
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-gray-900">
              "{suggestion.question}"
            </p>
            {suggestion.badge && (
              <Badge variant="secondary" className="text-xs">
                {suggestion.badge}
              </Badge>
            )}
          </div>
          {suggestion.description && (
            <p className="text-xs text-gray-500">
              {suggestion.description}
            </p>
          )}
        </div>
      </div>
    </Button>
  );
}

/**
 * Export types for use in ChatWindow.tsx
 */
export type { SuggestedQuestion, ChatbotHelpProps };
