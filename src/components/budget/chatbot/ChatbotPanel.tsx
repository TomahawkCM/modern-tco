/**
 * Chatbot Panel Component (Budget App v1)
 * Expandable chat panel with all sub-components
 *
 * Features:
 * - Expandable panel with animations
 * - Focus trap for accessibility
 * - Keyboard navigation (Escape to close)
 * - Mobile-responsive (full-screen on mobile)
 * - WCAG 2.2 AA compliant
 */

"use client";

import React, { useState, useEffect } from "react";
import { useChatbot } from "@/contexts/ChatbotContext";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { ChatbotHeader } from "./ChatbotHeader";
import { ChatbotMessages } from "./ChatbotMessages";
import { ChatbotInput } from "./ChatbotInput";
import { ChatbotFooter } from "./ChatbotFooter";

interface ChatbotPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChatbotPanel: React.FC<ChatbotPanelProps> = ({ isOpen, onClose }) => {
  const { messages, isTyping, sendMessage } = useChatbot();
  const [inputValue, setInputValue] = useState("");
  const panelRef = useFocusTrap(isOpen);

  // Handle Escape key to close panel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent body scroll when chatbot is open
  useEffect(() => {
    if (isOpen) {
      // Save current scroll position
      const { scrollY } = window;
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";

      return () => {
        // Restore scroll position
        document.body.style.overflow = "";
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  // Handle send message
  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return;

    const message = inputValue;
    setInputValue(""); // Clear input immediately
    await sendMessage(message);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop for mobile */}
      <div
        className="fixed inset-0 z-[998] bg-black/50 sm:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="chatbot-title"
        className="fixed bottom-6 right-6 z-[999] flex h-[calc(100vh-80px)] max-h-[600px] w-full flex-col rounded-lg border border-gray-200 bg-white shadow-2xl sm:w-[400px]"
        style={{
          animation: "chatbot-panel-enter 200ms ease-out",
        }}
      >
        {/* Header - no wrapper height constraint */}
        <div className="flex-none bg-white">
          <ChatbotHeader onClose={onClose} />
        </div>

        {/* Messages area - grows to fill, scrollable */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden bg-white" style={{ minHeight: 0 }}>
          <ChatbotMessages messages={messages} isTyping={isTyping} />
        </div>

        {/* Input - fixed height */}
        <div className="flex-none bg-white">
          <ChatbotInput
            value={inputValue}
            onChange={setInputValue}
            onSend={handleSend}
            disabled={isTyping}
          />
        </div>

        {/* Footer - fixed height */}
        <div className="flex-none bg-white">
          <ChatbotFooter />
        </div>
      </div>

      <style jsx>{`
        @keyframes chatbot-panel-enter {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </>
  );
};
