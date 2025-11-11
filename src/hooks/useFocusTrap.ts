/**
 * useFocusTrap Hook
 * Traps focus within a modal or dialog for keyboard accessibility
 *
 * Usage:
 * const trapRef = useFocusTrap(isOpen);
 * <div ref={trapRef}>Modal content...</div>
 */

import { useEffect, useRef } from 'react';

export function useFocusTrap(isActive: boolean = true) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive || !elementRef.current) return;

    const element = elementRef.current;

    // Store the previously focused element to restore later
    const previouslyFocused = document.activeElement as HTMLElement;

    // Get all focusable elements within the container
    function getFocusableElements(): HTMLElement[] {
      const focusableSelectors = [
        'a[href]',
        'button:not([disabled])',
        'textarea:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
      ].join(', ');

      return Array.from(
        element.querySelectorAll<HTMLElement>(focusableSelectors)
      ).filter((el) => {
        return (
          el.offsetParent !== null && // element is visible
          !el.hasAttribute('disabled') &&
          !el.getAttribute('aria-hidden')
        );
      });
    }

    // Focus the first focusable element
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    // Handle Tab and Shift+Tab keyboard navigation
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      // Shift + Tab (backwards)
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      }
      // Tab (forwards)
      else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }

    element.addEventListener('keydown', handleKeyDown);

    // Cleanup: restore focus and remove event listener
    return () => {
      element.removeEventListener('keydown', handleKeyDown);
      if (previouslyFocused && previouslyFocused.focus) {
        previouslyFocused.focus();
      }
    };
  }, [isActive]);

  return elementRef;
}
