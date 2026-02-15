"use client";

/**
 * Shortcuts Help Modal Component (Phase 5)
 * Task 5.3.2: Create shortcuts help overlay
 *
 * Displays all keyboard shortcuts available in the Budget App
 */

import { X, Keyboard } from "lucide-react";
import { useTranslations } from "next-intl";
import { KEYBOARD_SHORTCUTS } from "@/hooks/useKeyboardShortcuts";

interface ShortcutsModalProps {
  onClose: () => void;
}

export function ShortcutsModal({ onClose }: ShortcutsModalProps) {
  const t = useTranslations("shortcutsModal");

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 p-4 sm:items-center sm:p-4">
      {/* Phase 3.1.5: Mobile-optimized with bottom sheet on mobile, centered on desktop */}
      <div className="max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-xl sm:max-w-2xl sm:rounded-lg">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100">
              <Keyboard className="h-5 w-5 text-teal-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{t("title")}</h2>
              <p className="mt-0.5 text-sm text-gray-600">{t("subtitle")}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 transition-colors hover:text-gray-600"
            aria-label={t("close")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="space-y-6 p-6">
          {KEYBOARD_SHORTCUTS.map((group, groupIndex) => (
            <div key={groupIndex}>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-700">
                {group.category}
              </h3>
              <div className="space-y-2">
                {group.shortcuts.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg bg-gray-50 p-4 transition-colors hover:bg-gray-100"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{shortcut.description}</div>
                      <div className="mt-0.5 text-sm text-gray-600">{shortcut.action}</div>
                    </div>
                    <kbd className="ml-4 rounded-lg border border-gray-300 bg-white px-4 py-2 font-mono text-sm font-semibold text-gray-700 shadow-sm">
                      {shortcut.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Tip */}
        <div className="px-6 pb-6">
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="mb-2 text-sm font-medium text-gray-900">{t("proTip.title")}</p>
            <p className="text-sm text-gray-700">
              {t.rich("proTip.description", {
                key: () => (
                  <kbd className="rounded bg-gray-200 py-0.5 py-2 font-mono text-xs">?</kbd>
                ),
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
