/**
 * Message Bubble Component (Budget App v1)
 * Display user and assistant messages in chat
 *
 * Features:
 * - User messages (right-aligned, teal)
 * - Assistant messages (left-aligned, gray)
 * - Error messages (red border)
 * - Timestamps
 * - Screen reader accessible
 */

'use client';

import React from 'react';
import { formatDistanceToNow } from 'date-fns';

interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isError?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  role,
  content,
  timestamp,
  isError = false,
}) => {
  const isUser = role === 'user';

  return (
    <div
      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
      role="article"
    >
      <span className="sr-only">{isUser ? 'You said:' : 'Assistant said:'}</span>
      
      <div
        className={`max-w-[80%] break-words rounded-2xl px-4 py-3 text-sm leading-relaxed sm:max-w-[85%] ${
          isUser
            ? 'rounded-br-sm bg-teal-500 text-white'
            : isError
            ? 'rounded-bl-sm border-2 border-red-500 bg-gray-100 text-gray-900'
            : 'rounded-bl-sm bg-gray-100 text-gray-900'
        }`}
      >
        {content}
      </div>

      <time
        className="mt-1 text-xs text-gray-500"
        dateTime={timestamp.toISOString()}
      >
        {formatDistanceToNow(timestamp, { addSuffix: true })}
      </time>
    </div>
  );
};
