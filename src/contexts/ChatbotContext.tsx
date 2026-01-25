'use client';

/**
 * Chatbot Context
 *
 * React context for managing chatbot state across the application.
 * Handles message history, loading states, and OpenAI communication.
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { isChatbotEnabled, getChatbotConversationRetention } from '@/lib/budget-privacy-settings';
import { trackBudgetEvent } from '@/lib/budget-analytics';

const isDev = process.env.NODE_ENV === 'development';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  functionCalls?: Array<{ name: string; args: any; result: any }>;
  isError?: boolean;
}

interface ChatbotContextValue {
  // State
  isOpen: boolean;
  messages: ChatMessage[];
  isTyping: boolean;
  error: string | null;
  isEnabled: boolean;

  // Actions
  openChatbot: () => void;
  closeChatbot: () => void;
  toggleChatbot: () => void;
  sendMessage: (content: string) => Promise<void>;
  clearHistory: () => void;
  retryLastMessage: () => Promise<void>;
  exportConversation: () => void;
}

const ChatbotContext = createContext<ChatbotContextValue | null>(null);

const STORAGE_KEY = 'budget-chatbot-messages';
const MAX_CONTEXT_MESSAGES = 20; // Limit context window for performance

/**
 * Get expiration date based on retention policy
 */
function getExpirationDate(): Date {
  const retention = getChatbotConversationRetention();
  const now = new Date();

  if (retention === 'forever') {
    // Set far future date (100 years)
    const future = new Date(now);
    future.setFullYear(future.getFullYear() + 100);
    return future;
  }

  // Add retention days to current date
  const expirationDate = new Date(now);
  expirationDate.setDate(expirationDate.getDate() + retention);
  return expirationDate;
}

/**
 * Load messages from localStorage (with expiration check)
 */
function loadMessagesFromStorage(): ChatMessage[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const data = JSON.parse(stored);
    const { messages, expiresAt } = data;

    // Check if messages have expired
    if (new Date(expiresAt) < new Date()) {
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }

    // Parse dates
    return messages.map((msg: any) => ({
      ...msg,
      timestamp: new Date(msg.timestamp),
    }));
  } catch (error) {
    isDev && console.error('[Chatbot] Failed to load messages:', error);
    return [];
  }
}

/**
 * Save messages to localStorage (with expiration)
 */
function saveMessagesToStorage(messages: ChatMessage[]): void {
  if (typeof window === 'undefined') return;

  try {
    const data = {
      messages,
      expiresAt: getExpirationDate().toISOString(),
      savedAt: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    isDev && console.error('[Chatbot] Failed to save messages:', error);
  }
}

/**
 * Chatbot Context Provider
 */
export function ChatbotProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const [lastUserMessage, setLastUserMessage] = useState<string>('');

  // Load messages on mount
  useEffect(() => {
    isDev && console.log('[ChatbotContext] useEffect running - checking if chatbot enabled');
    const enabled = isChatbotEnabled();
    isDev && console.log('[ChatbotContext] isChatbotEnabled() returned:', enabled);

    // Also log the raw localStorage value for debugging
    if (isDev) {
      const rawSettings = localStorage.getItem('budget-app-privacy-settings');
      console.log('[ChatbotContext] Raw localStorage value:', rawSettings);
    }

    setIsEnabled(enabled);

    if (enabled) {
      const stored = loadMessagesFromStorage();
      setMessages(stored);
      isDev && console.log('[ChatbotContext] Loaded messages from storage:', stored.length);
    } else {
      isDev && console.log('[ChatbotContext] Chatbot disabled - not loading messages');
    }
  }, []);

  // Listen for localStorage changes (e.g., when settings are updated)
  useEffect(() => {
    const handleStorageChange = () => {
      isDev && console.log('[ChatbotContext] Storage changed - rechecking chatbot enabled status');
      const enabled = isChatbotEnabled();
      isDev && console.log('[ChatbotContext] New enabled status:', enabled);
      setIsEnabled(enabled);

      if (enabled) {
        const stored = loadMessagesFromStorage();
        setMessages(stored);
        isDev && console.log('[ChatbotContext] Reloaded messages after settings change:', stored.length);
      }
    };

    // Listen for storage events (fired when localStorage changes in other tabs/windows)
    window.addEventListener('storage', handleStorageChange);

    // Custom event for same-tab localStorage changes
    window.addEventListener('chatbot-settings-changed', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('chatbot-settings-changed', handleStorageChange);
    };
  }, []);

  /**
   * Open chatbot panel
   */
  const openChatbot = useCallback(() => {
    setIsOpen(true);
    trackBudgetEvent('chatbot_action', {
      section: 'chatbot',
      action: 'open',
      success: true,
    });
  }, []);

  /**
   * Close chatbot panel
   */
  const closeChatbot = useCallback(() => {
    setIsOpen(false);
    trackBudgetEvent('chatbot_action', {
      section: 'chatbot',
      action: 'close',
      success: true,
    });
  }, []);

  /**
   * Toggle chatbot panel
   */
  const toggleChatbot = useCallback(() => {
    setIsOpen(prev => !prev);
    trackBudgetEvent('chatbot_action', {
      section: 'chatbot',
      action: isOpen ? 'close' : 'open',
      success: true,
    });
  }, [isOpen]);

  // Save messages whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      saveMessagesToStorage(messages);
    }
  }, [messages]);

  /**
   * Send a message to the chatbot (with streaming support)
   */
  const sendMessage = useCallback(async (content: string) => {
    if (!isChatbotEnabled()) {
      setError('Chatbot is disabled. Enable it in Settings → Privacy → Budget Chatbot');
      return;
    }

    const trimmedContent = content.trim();
    if (!trimmedContent) return;

    // Store for retry
    setLastUserMessage(trimmedContent);

    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      role: 'user',
      content: trimmedContent,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    setError(null);

    // Track analytics
    trackBudgetEvent('chatbot_query', {
      section: 'chatbot',
      success: true,
    });

    try {
      // Build message history for API (limit to last MAX_CONTEXT_MESSAGES)
      const recentMessages = messages.slice(-MAX_CONTEXT_MESSAGES);
      const apiMessages = [...recentMessages, userMessage].map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      // Call streaming API endpoint
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') break;

              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  assistantContent += parsed.content;

                  // Update assistant message in real-time
                  setMessages(prev => {
                    const messages = [...prev];
                    const lastMessage = messages[messages.length - 1];

                    if (lastMessage && lastMessage.role === 'assistant') {
                      // Update existing assistant message
                      messages[messages.length - 1] = {
                        ...lastMessage,
                        content: assistantContent,
                      };
                    } else {
                      // Create new assistant message
                      messages.push({
                        id: `assistant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        role: 'assistant',
                        content: assistantContent,
                        timestamp: new Date(),
                      });
                    }

                    return messages;
                  });
                  setIsTyping(false);
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }
      }

      // Ensure typing indicator is off
      setIsTyping(false);

      // Track successful query
      trackBudgetEvent('chatbot_query', {
        section: 'chatbot',
        success: true,
      });
    } catch (err: any) {
      isDev && console.error('[Chatbot] Error:', err);

      // Provide user-friendly error messages
      let errorMessage = err.message || 'Failed to get response from chatbot';
      let userFriendlyMessage = errorMessage;

      // Detect specific error types
      if (errorMessage.includes('OPENAI_API_KEY not configured') || errorMessage.includes('Invalid API key')) {
        userFriendlyMessage = 'The chatbot is not configured yet. Please contact your administrator to add an OpenAI API key.';
      } else if (errorMessage.includes('rate limit') || errorMessage.includes('Rate limit')) {
        userFriendlyMessage = 'Too many requests. Please wait a moment and try again.';
      } else if (errorMessage.includes('quota') || errorMessage.includes('insufficient_quota')) {
        userFriendlyMessage = 'The AI service quota has been exceeded. Please contact your administrator.';
      } else if (errorMessage.includes('API error: 500')) {
        userFriendlyMessage = 'The chatbot service is temporarily unavailable. Please try again later.';
      }

      setError(userFriendlyMessage);

      // Add error message
      const errorChatMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `Sorry, I encountered an error: ${userFriendlyMessage}`,
        timestamp: new Date(),
        isError: true,
      };

      setMessages(prev => [...prev, errorChatMessage]);
      setIsTyping(false);

      // Track error
      trackBudgetEvent('chatbot_query', {
        section: 'chatbot',
        success: false,
        errorType: 'api_error',
      });
    }
  }, [messages]);

  /**
   * Retry the last user message
   */
  const retryLastMessage = useCallback(async () => {
    if (lastUserMessage) {
      await sendMessage(lastUserMessage);
    }
  }, [lastUserMessage, sendMessage]);

  /**
   * Clear chat history
   */
  const clearHistory = useCallback(() => {
    setMessages([]);
    setError(null);
    localStorage.removeItem(STORAGE_KEY);

    // Track analytics
    trackBudgetEvent('chatbot_action', {
      section: 'chatbot',
      action: 'clear_history',
      success: true,
    });
  }, []);

  /**
   * Export conversation as JSON
   */
  const exportConversation = useCallback(() => {
    if (messages.length === 0) {
      return;
    }

    // Build export data
    const exportData = {
      exportedAt: new Date().toISOString(),
      messageCount: messages.length,
      conversations: messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp.toISOString(),
        functionCalls: msg.functionCalls?.map(fc => ({
          function: fc.name,
          summary: `Called ${fc.name}`,
        })),
      })),
    };

    // Create blob and download
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `budget-chat-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Track analytics
    trackBudgetEvent('chatbot_action', {
      section: 'chatbot',
      action: 'export_conversation',
      success: true,
      count: messages.length,
    });
  }, [messages]);

  const value: ChatbotContextValue = {
    isOpen,
    messages,
    isTyping,
    error,
    isEnabled,
    openChatbot,
    closeChatbot,
    toggleChatbot,
    sendMessage,
    clearHistory,
    retryLastMessage,
    exportConversation,
  };

  return <ChatbotContext.Provider value={value}>{children}</ChatbotContext.Provider>;
}

/**
 * Hook to use chatbot context
 */
export function useChatbot() {
  const context = useContext(ChatbotContext);

  if (!context) {
    throw new Error('useChatbot must be used within ChatbotProvider');
  }

  return context;
}
