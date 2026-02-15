/**
 * Typing Indicator Component (Budget App v1)
 * Shows animated dots when assistant is typing
 *
 * Features:
 * - 3 bouncing dots animation
 * - Screen reader accessible
 * - Matches assistant message bubble styling
 */

"use client";

import React from "react";

export const TypingIndicator: React.FC = () => {
  return (
    <div
      className="flex items-center gap-1 self-start rounded-2xl rounded-bl-sm bg-gray-100 px-4 py-3"
      role="status"
      aria-live="polite"
      aria-label="Assistant is typing"
    >
      <span className="sr-only">Assistant is typing...</span>
      <div className="flex gap-1">
        <div
          className="animate-typing-bounce h-2 w-2 rounded-full bg-gray-500"
          style={{ animationDelay: "0s" }}
        />
        <div
          className="animate-typing-bounce h-2 w-2 rounded-full bg-gray-500"
          style={{ animationDelay: "0.2s" }}
        />
        <div
          className="animate-typing-bounce h-2 w-2 rounded-full bg-gray-500"
          style={{ animationDelay: "0.4s" }}
        />
      </div>
    </div>
  );
};
