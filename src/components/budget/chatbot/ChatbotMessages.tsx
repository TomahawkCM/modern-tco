/**
 * Chatbot Messages Component (Budget App v1)
 * Scrollable message container with auto-scroll
 *
 * Features:
 * - Auto-scroll to bottom on new messages
 * - Smooth scrolling
 * - Screen reader announcements
 * - WCAG 2.2 AA compliant
 */

'use client';

import React, { useRef, useEffect } from 'react';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import type { ChatMessage } from '@/contexts/ChatbotContext';

interface ChatbotMessagesProps {
  messages: ChatMessage[];
  isTyping: boolean;
}

export const ChatbotMessages: React.FC<ChatbotMessagesProps> = ({
  messages,
  isTyping,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div
      ref={containerRef}
      className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 scroll-smooth"
      role="log"
      aria-live="polite"
      aria-atomic="false"
      aria-relevant="additions"
      aria-label="Chat messages"
      style={{
        scrollbarWidth: 'thin',
        scrollbarColor: '#e5e7eb transparent',
      }}
    >
      <div className="flex flex-col gap-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
            <div className="text-4xl">💬</div>
            <div className="max-w-xs space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">
                Welcome to Budget Assistant!
              </h3>
              <p className="text-sm text-gray-600">
                I can help you understand your finances, manage transactions, and get insights on your spending.
              </p>
              <p className="text-xs text-gray-500">
                Try asking: "How much did I spend this month?" or "Show my budget status"
              </p>
            </div>
          </div>
        ) : (
          messages.filter(m => m.role !== 'system').map((message) => (
            <MessageBubble
              key={message.id}
              role={message.role as 'user' | 'assistant'}
              content={message.content}
              timestamp={message.timestamp}
              isError={message.isError}
            />
          ))
        )}
        
        {isTyping && <TypingIndicator />}
        
        <div ref={messagesEndRef} aria-hidden="true" />
      </div>
    </div>
  );
};
