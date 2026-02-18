/**
 * Chatbot Footer Component (Budget App v1)
 * Footer with privacy notice and powered by text
 *
 * Features:
 * - Privacy notice
 * - OpenAI attribution
 * - Optional privacy policy link
 * - WCAG 2.2 AA compliant
 */

"use client";

import React from "react";

export const ChatbotFooter: React.FC = () => {
  return (
    <footer className="shrink-0 border-t border-gray-200 bg-gray-50 px-4 py-2 text-center">
      <p className="text-xs text-gray-500">
        Powered by OpenAI •{" "}
        <button
          onClick={() => {
            // Navigate to privacy settings
            window.location.href = "/budget-app?tab=settings&section=privacy";
          }}
          className="text-teal-500 underline hover:text-teal-600"
          type="button"
        >
          Privacy Settings
        </button>
      </p>
    </footer>
  );
};
