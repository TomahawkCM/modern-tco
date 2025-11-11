'use client';

/**
 * Budget Chatbot Component
 *
 * AI-powered financial assistant that helps users understand their spending,
 * budgets, and financial situation using natural language queries.
 *
 * Features:
 * - Natural language queries about finances
 * - Real-time data access (transactions, budgets, loans, accounts)
 * - Privacy-controlled (opt-in required, configurable access levels)
 * - Conversation history with configurable retention
 */

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Trash2, AlertCircle, X, Loader2, Download } from 'lucide-react';
import { useChatbot } from '@/contexts/ChatbotContext';
import { isChatbotEnabled } from '@/lib/budget-privacy-settings';
import { ChatbotOptInDialog } from './ChatbotOptInDialog';

export function Chatbot() {
  const { messages, isTyping, error, isEnabled, sendMessage, clearHistory, exportConversation } = useChatbot();
  const [input, setInput] = useState('');
  const [showOptIn, setShowOptIn] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check if chatbot is enabled on mount
  useEffect(() => {
    if (!isChatbotEnabled()) {
      setShowOptIn(true);
    }
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const message = input.trim();
    setInput('');
    await sendMessage(message);
  };

  const handleOptInAccept = () => {
    setShowOptIn(false);
    // Reload to refresh isEnabled state
    window.location.reload();
  };

  const handleOptInDecline = () => {
    setShowOptIn(false);
  };

  // Show opt-in dialog if chatbot not enabled
  if (showOptIn) {
    return <ChatbotOptInDialog onAccept={handleOptInAccept} onDecline={handleOptInDecline} />;
  }

  if (!isEnabled) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Chatbot Disabled</h3>
          <p className="text-sm text-gray-600 mb-4">
            Enable the chatbot in Settings → Privacy → Budget Chatbot to get started.
          </p>
          <button
            onClick={() => setShowOptIn(true)}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            Enable Chatbot
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Budget Assistant</h2>
            <p className="text-xs text-gray-600">Ask me about your finances</p>
          </div>
        </div>
        {messages.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={exportConversation}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Export conversation"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={clearHistory}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Clear chat history"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Start a Conversation</h3>
            <p className="text-sm text-gray-600 mb-6">
              Ask me anything about your finances. Here are some examples:
            </p>
            <div className="space-y-2 max-w-md mx-auto">
              {[
                'How much did I spend this month?',
                'Am I over budget in any categories?',
                'Show me my recent grocery purchases',
                "What's my total account balance?",
              ].map((example, index) => (
                <button
                  key={index}
                  onClick={() => setInput(example)}
                  className="w-full p-3 bg-white border border-gray-200 rounded-lg text-left text-sm text-gray-700 hover:border-teal-500 hover:bg-teal-50 transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                message.role === 'user'
                  ? 'bg-teal-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-900'
              }`}
            >
              <div className="whitespace-pre-wrap break-words">{message.content}</div>
              {message.functionCalls && message.functionCalls.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-300">
                  <div className="text-xs text-gray-600">
                    <strong>Data accessed:</strong>{' '}
                    {message.functionCalls.map((fc) => fc.name).join(', ')}
                  </div>
                </div>
              )}
              <div className="text-xs mt-2 opacity-70">
                {message.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="flex justify-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md">
              <div className="flex items-start gap-2 text-red-800">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-sm">Error</div>
                  <div className="text-sm mt-1">{error}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your finances..."
            disabled={isTyping}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Send className="w-5 h-5" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
        <p className="text-xs text-gray-500 mt-2">
          Powered by OpenAI GPT-4. Your data is processed securely and not used for training.
        </p>
      </div>
    </div>
  );
}
