/**
 * Chatbot Widget Component (Budget App v1)
 * Main chatbot component with button and panel
 *
 * Features:
 * - Floating button
 * - Expandable panel
 * - Context-aware state management
 * - Full accessibility support
 * - WCAG 2.2 AA compliant
 */

'use client';

import React from 'react';
import { useChatbot } from '@/contexts/ChatbotContext';
import { ChatbotButton } from './ChatbotButton';
import { ChatbotPanel } from './ChatbotPanel';

export const ChatbotWidget: React.FC = () => {
  const { isOpen, isEnabled, openChatbot, closeChatbot } = useChatbot();

  // Debug logging for testing
  console.log('[ChatbotWidget] Rendering - isEnabled:', isEnabled, 'isOpen:', isOpen);

  // Don't render if chatbot is disabled
  if (!isEnabled) {
    console.log('[ChatbotWidget] Not rendering - chatbot disabled');
    return null;
  }

  console.log('[ChatbotWidget] Rendering chatbot button and panel');

  return (
    <>
      <ChatbotButton onClick={openChatbot} isOpen={isOpen} />
      <ChatbotPanel isOpen={isOpen} onClose={closeChatbot} />
    </>
  );
};
