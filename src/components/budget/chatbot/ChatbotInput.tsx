/**
 * Chatbot Input Component (Budget App v1)
 * Auto-expanding textarea with send button
 *
 * Features:
 * - Auto-expanding textarea (1-4 lines)
 * - Send button with keyboard shortcuts
 * - Enter to send, Shift+Enter for new line
 * - Disabled state when sending
 * - WCAG 2.2 AA compliant
 */

"use client";

import React, { useRef, useEffect, type KeyboardEvent } from "react";
import { Send } from "lucide-react";

interface ChatbotInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled: boolean;
  placeholder?: string;
}

export const ChatbotInput: React.FC<ChatbotInputProps> = ({
  value,
  onChange,
  onSend,
  disabled,
  placeholder = "Ask about your finances...",
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const newHeight = Math.min(textarea.scrollHeight, 120); // Max 4 lines
      textarea.style.height = `${newHeight}px`;
    }
  }, [value]);

  // Handle keyboard shortcuts
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !disabled) {
        onSend();
      }
    }
  };

  return (
    <div className="flex shrink-0 items-end gap-2 border-t border-gray-200 bg-white p-3 sm:p-4">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        className="max-h-[120px] min-h-[48px] flex-1 resize-none rounded-3xl border border-gray-300 px-4 py-3 text-base leading-relaxed focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/10 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Type your question"
      />

      <button
        onClick={onSend}
        disabled={disabled || !value.trim()}
        aria-label="Send message"
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-teal-500 text-white transition-all hover:scale-105 hover:bg-teal-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 active:scale-95 active:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
        type="button"
      >
        <Send className="h-5 w-5" aria-hidden="true" />
      </button>
    </div>
  );
};
