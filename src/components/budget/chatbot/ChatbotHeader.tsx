/**
 * Chatbot Header Component (Budget App v1)
 * Header with title and close button
 *
 * Features:
 * - Title display
 * - Close button
 * - Mobile-responsive sizing
 * - WCAG 2.2 AA compliant
 */

'use client';

import React from 'react';
import { X } from 'lucide-react';

interface ChatbotHeaderProps {
  onClose: () => void;
  title?: string;
}

export const ChatbotHeader: React.FC<ChatbotHeaderProps> = ({
  onClose,
  title = 'Budget Assistant',
}) => {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 sm:h-14 sm:px-4">
      <h2 id="chatbot-title" className="text-lg font-semibold text-gray-900">
        {title}
      </h2>

      <button
        onClick={onClose}
        aria-label="Close chatbot"
        className="flex h-8 w-8 items-center justify-center rounded-md text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
        type="button"
      >
        <X className="h-5 w-5" aria-hidden="true" />
      </button>
    </header>
  );
};
