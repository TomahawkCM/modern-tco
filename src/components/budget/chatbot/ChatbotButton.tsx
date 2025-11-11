/**
 * Chatbot Button Component (Budget App v1)
 * Floating button in bottom-right corner to open chatbot
 *
 * Features:
 * - Always visible floating button
 * - Accessible keyboard navigation
 * - Mobile responsive
 * - WCAG 2.2 AA compliant
 */

'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';

interface ChatbotButtonProps {
  onClick: () => void;
  isOpen: boolean;
}

export const ChatbotButton: React.FC<ChatbotButtonProps> = ({ onClick, isOpen }) => {
  // Debug logging
  console.log('[ChatbotButton] Rendering - isOpen:', isOpen);

  if (isOpen) {
    console.log('[ChatbotButton] Button hidden because panel is open');
    return null; // Hide button when panel is open
  }

  console.log('[ChatbotButton] Rendering button at bottom-20 (mobile) / bottom-6 (desktop)');

  return (
    <button
      onClick={onClick}
      aria-label="Open AI chatbot"
      className="fixed bottom-20 right-4 z-[1000] h-14 w-14 rounded-full bg-teal-500 text-white shadow-lg transition-all duration-200 hover:bg-teal-600 hover:shadow-xl hover:scale-105 active:bg-teal-700 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 md:bottom-6 md:right-6"
      type="button"
      data-testid="chatbot-button"
    >
      <MessageCircle className="mx-auto h-7 w-7" aria-hidden="true" />
    </button>
  );
};
