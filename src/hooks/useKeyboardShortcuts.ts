/**
 * Keyboard Shortcuts Hook (Phase 5)
 * Task 5.3.1: Implement keyboard shortcuts
 * 
 * Global keyboard shortcuts for Budget App
 */

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface ShortcutHandlers {
  onNewTransaction?: () => void;
  onSearch?: () => void;
  onShowHelp?: () => void;
  onCloseModal?: () => void;
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      
      // Ignore if typing in input/textarea/select or contenteditable
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      ) {
        // Allow Esc to close modals even when in inputs
        if (e.key === 'Escape' && handlers.onCloseModal) {
          handlers.onCloseModal();
        }
        return;
      }

      // Ignore if any modifier keys are pressed (Ctrl, Alt, Meta)
      // This prevents conflicts with browser shortcuts
      if (e.ctrlKey || e.altKey || e.metaKey) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'n':
          e.preventDefault();
          handlers.onNewTransaction?.();
          break;

        case '/':
          e.preventDefault();
          handlers.onSearch?.();
          break;

        case 'b':
          e.preventDefault();
          router.push('/budget-app/budgets');
          break;

        case 'd':
          e.preventDefault();
          router.push('/budget-app');
          break;

        case 't':
          e.preventDefault();
          router.push('/budget-app/transactions');
          break;

        case 'i':
          e.preventDefault();
          router.push('/budget-app/investments');
          break;

        case 'r':
          e.preventDefault();
          router.push('/budget-app/reports');
          break;

        case '?':
          e.preventDefault();
          handlers.onShowHelp?.();
          break;

        case 'escape':
          e.preventDefault();
          handlers.onCloseModal?.();
          break;

        default:
          break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router, handlers]);
}

/**
 * Keyboard shortcuts reference
 */
export const KEYBOARD_SHORTCUTS = [
  {
    category: 'Navigation',
    shortcuts: [
      { key: 'D', description: 'Go to Dashboard', action: 'Navigate to home page' },
      { key: 'T', description: 'Go to Transactions', action: 'View all transactions' },
      { key: 'B', description: 'Go to Budgets', action: 'Manage budgets' },
      { key: 'I', description: 'Go to Investments', action: 'View portfolio' },
      { key: 'R', description: 'Go to Reports', action: 'View financial reports' },
    ],
  },
  {
    category: 'Actions',
    shortcuts: [
      { key: 'N', description: 'New Transaction', action: 'Open new transaction modal' },
      { key: '/', description: 'Search', action: 'Focus search input' },
    ],
  },
  {
    category: 'General',
    shortcuts: [
      { key: '?', description: 'Show Shortcuts', action: 'Display this help dialog' },
      { key: 'Esc', description: 'Close Modal', action: 'Close any open modal or dialog' },
    ],
  },
];

