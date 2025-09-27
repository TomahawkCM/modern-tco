"use client";

import { useEffect, useState } from "react";

interface UseKeyboardNavigationOptions {
  enabled?: boolean;
  onEscape?: () => void;
  onEnter?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  onTab?: (shiftKey: boolean) => void;
  onSpace?: () => void;
  preventDefault?: string[];
}

export function useKeyboardNavigation({
  enabled = true,
  onEscape,
  onEnter,
  onArrowUp,
  onArrowDown,
  onArrowLeft,
  onArrowRight,
  onTab,
  onSpace,
  preventDefault = [],
}: UseKeyboardNavigationOptions = {}) {
  const [isKeyboardUser, setIsKeyboardUser] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Track keyboard usage for focus styles
      setIsKeyboardUser(true);

      const { key, shiftKey, ctrlKey, metaKey } = event;

      // Prevent default for specified keys
      if (preventDefault.includes(key.toLowerCase())) {
        event.preventDefault();
      }

      // Handle keyboard shortcuts
      switch (key) {
        case "Escape":
          if (onEscape) {
            event.preventDefault();
            onEscape();
          }
          break;

        case "Enter":
          if (onEnter && !ctrlKey && !metaKey) {
            event.preventDefault();
            onEnter();
          }
          break;

        case "ArrowUp":
          if (onArrowUp) {
            event.preventDefault();
            onArrowUp();
          }
          break;

        case "ArrowDown":
          if (onArrowDown) {
            event.preventDefault();
            onArrowDown();
          }
          break;

        case "ArrowLeft":
          if (onArrowLeft) {
            event.preventDefault();
            onArrowLeft();
          }
          break;

        case "ArrowRight":
          if (onArrowRight) {
            event.preventDefault();
            onArrowRight();
          }
          break;

        case "Tab":
          if (onTab) {
            onTab(shiftKey);
          }
          break;

        case " ":
        case "Space":
          if (onSpace) {
            event.preventDefault();
            onSpace();
          }
          break;
      }
    };

    const handleMouseDown = () => {
      setIsKeyboardUser(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleMouseDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, [
    enabled,
    onEscape,
    onEnter,
    onArrowUp,
    onArrowDown,
    onArrowLeft,
    onArrowRight,
    onTab,
    onSpace,
    preventDefault,
  ]);

  return { isKeyboardUser };
}

export function useArrowKeyNavigation<T extends HTMLElement>(
  items: T[],
  options: {
    enabled?: boolean;
    loop?: boolean;
    orientation?: "horizontal" | "vertical" | "both";
    onSelect?: (item: T, index: number) => void;
  } = {}
) {
  const [currentIndex, setCurrentIndex] = useState(-1);
  const { enabled = true, loop = true, orientation = "vertical", onSelect } = options;

  const moveToIndex = (newIndex: number) => {
    if (!items.length) return;

    let index = newIndex;

    if (loop) {
      if (index < 0) index = items.length - 1;
      if (index >= items.length) index = 0;
    } else {
      index = Math.max(0, Math.min(index, items.length - 1));
    }

    setCurrentIndex(index);
    items[index]?.focus();
  };

  const moveUp = () => {
    if (orientation === "horizontal") return;
    moveToIndex(currentIndex - 1);
  };

  const moveDown = () => {
    if (orientation === "horizontal") return;
    moveToIndex(currentIndex + 1);
  };

  const moveLeft = () => {
    if (orientation === "vertical") return;
    moveToIndex(currentIndex - 1);
  };

  const moveRight = () => {
    if (orientation === "vertical") return;
    moveToIndex(currentIndex + 1);
  };

  const selectCurrent = () => {
    if (currentIndex >= 0 && currentIndex < items.length) {
      const currentItem = items[currentIndex];
      onSelect?.(currentItem, currentIndex);
    }
  };

  useKeyboardNavigation({
    enabled,
    onArrowUp: moveUp,
    onArrowDown: moveDown,
    onArrowLeft: moveLeft,
    onArrowRight: moveRight,
    onEnter: selectCurrent,
    onSpace: selectCurrent,
  });

  // Update current index when items change
  useEffect(() => {
    if (currentIndex >= items.length) {
      setCurrentIndex(items.length > 0 ? 0 : -1);
    }
  }, [items, currentIndex]);

  // Auto-focus first item when enabled
  useEffect(() => {
    if (enabled && items.length > 0 && currentIndex === -1) {
      setCurrentIndex(0);
      items[0]?.focus();
    }
  }, [enabled, items, currentIndex]);

  return {
    currentIndex,
    setCurrentIndex,
    moveToIndex,
    moveUp,
    moveDown,
    moveLeft,
    moveRight,
    selectCurrent,
  };
}
