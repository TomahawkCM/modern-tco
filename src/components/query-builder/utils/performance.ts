/**
 * Performance utility functions for Query Builder
 * Includes debouncing, throttling, and memoization helpers
 */

import { useEffect, useRef, useCallback, useMemo } from 'react';

/**
 * Custom hook for debouncing a value
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Custom hook for debouncing a callback function
 * @param callback - The function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);

  // Update callback ref when it changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callbackRef.current(...args);
    }, delay);
  }, [delay]);
}

/**
 * Custom hook for throttling a callback function
 * @param callback - The function to throttle
 * @param delay - Minimum time between calls in milliseconds
 * @returns Throttled function
 */
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const lastRun = useRef(Date.now());
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    const timeSinceLastRun = now - lastRun.current;

    if (timeSinceLastRun >= delay) {
      callback(...args);
      lastRun.current = now;
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
        lastRun.current = Date.now();
      }, delay - timeSinceLastRun);
    }
  }, [callback, delay]);
}

/**
 * Memoize expensive computations with cache
 * @param fn - Function to memoize
 * @param resolver - Optional function to compute cache key
 * @returns Memoized function
 */
export function memoizeWithCache<T extends (...args: any[]) => any>(
  fn: T,
  resolver?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>) => {
    const key = resolver ? resolver(...args) : JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = fn(...args);
    cache.set(key, result);

    // Limit cache size to prevent memory leaks
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value;
      if (firstKey !== undefined) {
        cache.delete(firstKey);
      }
    }

    return result;
  }) as T;
}

/**
 * Virtual scrolling helper for large lists
 * @param items - Full list of items
 * @param containerHeight - Height of the container in pixels
 * @param itemHeight - Height of each item in pixels
 * @param scrollTop - Current scroll position
 * @returns Visible items and their positioning
 */
export function getVisibleItems<T>(
  items: T[],
  containerHeight: number,
  itemHeight: number,
  scrollTop: number
): {
  visibleItems: T[];
  startIndex: number;
  endIndex: number;
  offsetY: number;
  totalHeight: number;
} {
  const totalHeight = items.length * itemHeight;
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    items.length - 1,
    Math.floor((scrollTop + containerHeight) / itemHeight)
  );

  // Add buffer for smoother scrolling
  const buffer = 5;
  const bufferedStartIndex = Math.max(0, startIndex - buffer);
  const bufferedEndIndex = Math.min(items.length - 1, endIndex + buffer);

  return {
    visibleItems: items.slice(bufferedStartIndex, bufferedEndIndex + 1),
    startIndex: bufferedStartIndex,
    endIndex: bufferedEndIndex,
    offsetY: bufferedStartIndex * itemHeight,
    totalHeight
  };
}

/**
 * Batch state updates to prevent excessive re-renders
 * @param updates - Array of state update functions
 */
export function batchUpdates(updates: (() => void)[]): void {
  // React 18+ automatically batches updates, but this ensures compatibility
  if ('startTransition' in React) {
    React.startTransition(() => {
      updates.forEach(update => update());
    });
  } else {
    updates.forEach(update => update());
  }
}

// Import React for hooks
import * as React from 'react';