'use client';

/**
 * Shortcuts Help Modal Component (Phase 5)
 * Task 5.3.2: Create shortcuts help overlay
 * 
 * Displays all keyboard shortcuts available in the Budget App
 */

import { X, Keyboard } from 'lucide-react';
import { KEYBOARD_SHORTCUTS } from '@/hooks/useKeyboardShortcuts';

interface ShortcutsModalProps {
  onClose: () => void;
}

export function ShortcutsModal({ onClose }: ShortcutsModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
              <Keyboard className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Keyboard Shortcuts</h2>
              <p className="text-sm text-gray-600 mt-0.5">Power-user productivity tips</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close shortcuts help"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="p-6 space-y-6">
          {KEYBOARD_SHORTCUTS.map((group, groupIndex) => (
            <div key={groupIndex}>
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
                {group.category}
              </h3>
              <div className="space-y-2">
                {group.shortcuts.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{shortcut.description}</div>
                      <div className="text-sm text-gray-600 mt-0.5">{shortcut.action}</div>
                    </div>
                    <kbd className="ml-4 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-mono font-semibold text-gray-700 shadow-sm">
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
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-900 font-medium mb-2">💡 Pro Tip</p>
            <p className="text-sm text-gray-700">
              Keyboard shortcuts work on any page except when typing in forms. Press <kbd className="py-2 py-0.5 bg-gray-200 rounded text-xs font-mono">?</kbd> anytime to see this help.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

