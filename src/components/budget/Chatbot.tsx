"use client";

/**
 * Budget Chatbot Component
 *
 * AI-powered financial assistant that helps users understand their spending,
 * budgets, and financial situation using natural language queries.
 *
 * Features:
 * - Natural language queries about finances
 * - Real-time data access (transactions, budgets, loans, accounts)
 * - Privacy-controlled (opt-in required, configurable access levels)
 * - Conversation history with configurable retention
 */

import React, { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { MessageSquare, Send, Trash2, AlertCircle, X, Loader2, Download } from "lucide-react";
import { useChatbot } from "@/contexts/ChatbotContext";
import { isChatbotEnabled } from "@/lib/budget-privacy-settings";
import { ChatbotOptInDialog } from "./ChatbotOptInDialog";

export function Chatbot() {
  const t = useTranslations("chatbot");
  const { messages, isTyping, error, isEnabled, sendMessage, clearHistory, exportConversation } =
    useChatbot();
  const [input, setInput] = useState("");
  const [showOptIn, setShowOptIn] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check if chatbot is enabled on mount
  useEffect(() => {
    if (!isChatbotEnabled()) {
      setShowOptIn(true);
    }
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const message = input.trim();
    setInput("");
    await sendMessage(message);
  };

  const handleOptInAccept = () => {
    setShowOptIn(false);
    // Reload to refresh isEnabled state
    window.location.reload();
  };

  const handleOptInDecline = () => {
    setShowOptIn(false);
  };

  // Show opt-in dialog if chatbot not enabled
  if (showOptIn) {
    return <ChatbotOptInDialog onAccept={handleOptInAccept} onDecline={handleOptInDecline} />;
  }

  if (!isEnabled) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center">
          <MessageSquare className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 text-lg font-semibold text-gray-900">{t("disabled.title")}</h3>
          <p className="mb-4 text-sm text-gray-600">{t("disabled.description")}</p>
          <button
            onClick={() => setShowOptIn(true)}
            className="rounded-lg bg-teal-600 px-4 py-2 text-white transition-colors hover:bg-teal-700"
          >
            {t("disabled.enableButton")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100">
            <MessageSquare className="h-5 w-5 text-teal-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{t("header.title")}</h2>
            <p className="text-xs text-gray-600">{t("header.subtitle")}</p>
          </div>
        </div>
        {messages.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={exportConversation}
              className="p-2 text-gray-400 transition-colors hover:text-gray-600"
              title={t("buttons.exportConversation")}
            >
              <Download className="h-5 w-5" />
            </button>
            <button
              onClick={clearHistory}
              className="p-2 text-gray-400 transition-colors hover:text-gray-600"
              title={t("buttons.clearHistory")}
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="py-12 text-center">
            <MessageSquare className="mx-auto mb-4 h-16 w-16 text-gray-300" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900">{t("emptyState.title")}</h3>
            <p className="mb-6 text-sm text-gray-600">{t("emptyState.description")}</p>
            <div className="mx-auto max-w-md space-y-2">
              {(["spending", "budget", "groceries", "balance"] as const).map((key) => (
                <button
                  key={key}
                  onClick={() => setInput(t(`emptyState.examples.${key}`))}
                  className="w-full rounded-lg border border-gray-200 bg-white p-3 text-start text-sm text-gray-700 transition-colors hover:border-teal-500 hover:bg-teal-50"
                >
                  {t(`emptyState.examples.${key}`)}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                message.role === "user"
                  ? "bg-teal-600 text-white"
                  : "border border-gray-200 bg-white text-gray-900"
              }`}
            >
              <div className="whitespace-pre-wrap break-words">{message.content}</div>
              {message.functionCalls && message.functionCalls.length > 0 && (
                <div className="mt-2 border-t border-gray-300 pt-2">
                  <div className="text-xs text-gray-600">
                    <strong>{t("messages.dataAccessed")}</strong>{" "}
                    {message.functionCalls.map((fc) => fc.name).join(", ")}
                  </div>
                </div>
              )}
              <div className="mt-2 text-xs opacity-70">
                {message.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-center gap-2 text-gray-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">{t("messages.thinking")}</span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="flex justify-center">
            <div className="max-w-md rounded-lg border border-red-200 bg-red-50 p-4">
              <div className="flex items-start gap-2 text-red-800">
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium">{t("messages.error")}</div>
                  <div className="mt-1 text-sm">{error}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 bg-white p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("input.placeholder")}
            disabled={isTyping}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:cursor-not-allowed disabled:bg-gray-100"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="flex items-center gap-2 rounded-lg bg-teal-600 px-6 py-3 text-white transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            <Send className="h-5 w-5" />
            <span className="hidden sm:inline">{t("buttons.send")}</span>
          </button>
        </form>
        <p className="mt-2 text-xs text-gray-500">{t("input.disclaimer")}</p>
      </div>
    </div>
  );
}
