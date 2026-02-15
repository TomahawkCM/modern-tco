/**
 * Chatbot Button Component (Budget App v1)
 * Floating button in bottom-right corner to open chatbot
 *
 * Features:
 * - Always visible floating button
 * - Accessible keyboard navigation
 * - Mobile responsive
 * - WCAG 2.2 AA compliant
 * - Premium feature badge in offline mode
 */

"use client";

import React, { useState } from "react";
import { Crown, MessageCircle, X } from "lucide-react";
import { isStandaloneMode } from "@/config/features";

interface ChatbotButtonProps {
  onClick: () => void;
  isOpen: boolean;
}

export const ChatbotButton: React.FC<ChatbotButtonProps> = ({ onClick, isOpen }) => {
  const [showPremiumTooltip, setShowPremiumTooltip] = useState(false);

  if (isOpen) {
    return null; // Hide button when panel is open
  }

  // In standalone mode, show premium feature badge instead of functional button
  if (isStandaloneMode()) {
    return (
      <>
        <button
          onClick={() => setShowPremiumTooltip(!showPremiumTooltip)}
          aria-label="AI chatbot - Premium feature"
          className="fixed bottom-20 right-4 z-[1000] h-14 w-14 rounded-full bg-slate-600 text-slate-300 shadow-lg transition-all duration-200 hover:bg-slate-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 md:bottom-6 md:right-6"
          type="button"
          data-testid="chatbot-button-premium"
        >
          <div className="relative">
            <MessageCircle className="mx-auto h-7 w-7" aria-hidden="true" />
            <Crown className="absolute -right-1 -top-1 h-4 w-4 text-amber-400" aria-hidden="true" />
          </div>
        </button>

        {/* Premium feature tooltip */}
        {showPremiumTooltip && (
          <div className="fixed bottom-36 right-4 z-[1001] w-64 rounded-lg border border-slate-600 bg-slate-800 p-4 shadow-xl md:bottom-24 md:right-6">
            <button
              onClick={() => setShowPremiumTooltip(false)}
              className="absolute right-2 top-2 text-slate-400 hover:text-white"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="mb-2 flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-400" />
              <span className="font-semibold text-white">Premium Feature</span>
            </div>
            <p className="mb-3 text-sm text-slate-300">
              AI-powered budget assistant is available in the online Premium version.
            </p>
            <div className="text-xs text-slate-400">
              Get personalized financial insights, spending analysis, and budget recommendations.
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <button
      id="chatbot-button"
      onClick={onClick}
      aria-label="Open AI chatbot"
      className="fixed bottom-20 right-4 z-[1000] h-14 w-14 rounded-full bg-teal-500 text-white shadow-lg transition-all duration-200 hover:scale-105 hover:bg-teal-600 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 active:scale-95 active:bg-teal-700 md:bottom-6 md:right-6"
      type="button"
      data-testid="chatbot-button"
    >
      <MessageCircle className="mx-auto h-7 w-7" aria-hidden="true" />
    </button>
  );
};
