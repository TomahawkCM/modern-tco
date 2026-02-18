"use client";

/**
 * Chatbot Opt-In Dialog Component
 * Task: Implement chatbot privacy controls and opt-in flow
 *
 * First-time dialog shown when user tries to access chatbot feature
 * Explains data usage, privacy settings, and obtains consent
 */

import { useState } from "react";
import { useTranslations } from "next-intl";
import { X, MessageSquare, Shield, Lock, Info } from "lucide-react";
import { savePrivacySettings } from "@/lib/budget-privacy-settings";

interface ChatbotOptInDialogProps {
  onAccept: () => void;
  onDecline: () => void;
}

export function ChatbotOptInDialog({ onAccept, onDecline }: ChatbotOptInDialogProps) {
  const t = useTranslations("chatbotOptIn");
  const [dataAccess, setDataAccess] = useState<"read-only" | "full-access">("read-only");
  const [retention, setRetention] = useState<7 | 30 | "forever">(7);

  const handleAccept = () => {
    // Save privacy settings
    savePrivacySettings({
      enableChatbot: true,
      chatbotDataAccess: dataAccess,
      chatbotConversationRetention: retention,
    });

    onAccept();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 p-4 sm:items-center sm:p-4">
      <div className="max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-xl sm:max-w-2xl sm:rounded-lg">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100">
              <MessageSquare className="h-5 w-5 text-teal-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{t("title")}</h2>
              <p className="mt-0.5 text-sm text-gray-600">{t("subtitle")}</p>
            </div>
          </div>
          <button
            onClick={onDecline}
            className="text-gray-400 transition-colors hover:text-gray-600"
            aria-label={t("closeDialog")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6 p-6">
          {/* What the Chatbot Does */}
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-gray-900">
              <Info className="h-4 w-4 text-teal-600" />
              {t("capabilities.title")}
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-teal-600">✓</span>
                <span>{t("capabilities.answer")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-teal-600">✓</span>
                <span>{t("capabilities.search")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-teal-600">✓</span>
                <span>{t("capabilities.insights")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-teal-600">✓</span>
                <span>{t("capabilities.actions")}</span>
              </li>
            </ul>
          </div>

          {/* Privacy & Data Usage */}
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-amber-900">
              <Shield className="h-4 w-4 text-amber-600" />
              {t("privacy.title")}
            </h3>
            <ul className="space-y-2 text-sm text-amber-900">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-amber-600">•</span>
                <span>{t("privacy.processedBy")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-amber-600">•</span>
                <span>{t("privacy.dataSent")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-amber-600">•</span>
                <span>{t("privacy.noTraining")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-amber-600">•</span>
                <span>{t("privacy.disable")}</span>
              </li>
            </ul>
          </div>

          {/* Privacy Controls */}
          <div>
            <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900">
              <Lock className="h-4 w-4 text-teal-600" />
              {t("controls.title")}
            </h3>

            {/* Data Access Level */}
            <div className="mb-6">
              <label className="mb-3 block text-sm font-medium text-gray-700">
                {t("controls.dataAccess.label")}
              </label>
              <div className="space-y-2">
                <label className="flex cursor-pointer items-start gap-3 rounded-lg border-2 border-gray-200 bg-gray-50 p-4 transition-colors hover:border-teal-500">
                  <input
                    type="radio"
                    name="dataAccess"
                    value="read-only"
                    checked={dataAccess === "read-only"}
                    onChange={() => setDataAccess("read-only")}
                    className="mt-1 text-teal-600 focus:ring-teal-500"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {t("controls.dataAccess.readOnly.title")}
                    </div>
                    <div className="mt-1 text-sm text-gray-600">
                      {t("controls.dataAccess.readOnly.description")}
                    </div>
                  </div>
                </label>
                <label className="flex cursor-pointer items-start gap-3 rounded-lg border-2 border-gray-200 bg-gray-50 p-4 transition-colors hover:border-teal-500">
                  <input
                    type="radio"
                    name="dataAccess"
                    value="full-access"
                    checked={dataAccess === "full-access"}
                    onChange={() => setDataAccess("full-access")}
                    className="mt-1 text-teal-600 focus:ring-teal-500"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {t("controls.dataAccess.fullAccess.title")}
                    </div>
                    <div className="mt-1 text-sm text-gray-600">
                      {t("controls.dataAccess.fullAccess.description")}
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Conversation Retention */}
            <div>
              <label className="mb-3 block text-sm font-medium text-gray-700">
                {t("controls.retention.label")}
              </label>
              <div className="space-y-2">
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border-2 border-gray-200 bg-gray-50 p-3 transition-colors hover:border-teal-500">
                  <input
                    type="radio"
                    name="retention"
                    value="7"
                    checked={retention === 7}
                    onChange={() => setRetention(7)}
                    className="text-teal-600 focus:ring-teal-500"
                  />
                  <span className="text-gray-900">{t("controls.retention.days7")}</span>
                </label>
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border-2 border-gray-200 bg-gray-50 p-3 transition-colors hover:border-teal-500">
                  <input
                    type="radio"
                    name="retention"
                    value="30"
                    checked={retention === 30}
                    onChange={() => setRetention(30)}
                    className="text-teal-600 focus:ring-teal-500"
                  />
                  <span className="text-gray-900">{t("controls.retention.days30")}</span>
                </label>
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border-2 border-gray-200 bg-gray-50 p-3 transition-colors hover:border-teal-500">
                  <input
                    type="radio"
                    name="retention"
                    value="forever"
                    checked={retention === "forever"}
                    onChange={() => setRetention("forever")}
                    className="text-teal-600 focus:ring-teal-500"
                  />
                  <span className="text-gray-900">{t("controls.retention.forever")}</span>
                </label>
              </div>
              <p className="mt-2 text-xs text-gray-600">{t("controls.retention.note")}</p>
            </div>
          </div>

          {/* GDPR Compliance Notice */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs leading-relaxed text-gray-700">
              {t.rich("gdpr.notice", {
                strong: (chunks) => <strong>{chunks}</strong>,
              })}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center gap-3 border-t border-gray-200 bg-gray-50 p-6">
          <button
            onClick={onDecline}
            className="flex-1 rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            {t("buttons.decline")}
          </button>
          <button
            onClick={handleAccept}
            className="flex-1 rounded-lg bg-teal-600 px-6 py-3 font-medium text-white transition-colors hover:bg-teal-700"
          >
            {t("buttons.enable")}
          </button>
        </div>
      </div>
    </div>
  );
}
