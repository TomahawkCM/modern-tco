/**
 * Custom Count-Up Animation Hook (Phase 4)
 * Task 4.1.5: Animated progress counters
 * 
 * Smooth number animations for dashboard metrics
 * Custom implementation (zero dependencies)
 */

import { useEffect, useState, useRef } from 'react';

interface UseCountUpOptions {
  end: number;
  start?: number;
  duration?: number; // in milliseconds
  decimals?: number;
  prefix?: string;
  suffix?: string;
  separator?: string;
  easingFn?: (t: number, b: number, c: number, d: number) => number;
}

/**
 * Easing functions for smooth animations
 */
export const easingFunctions = {
  // No easing, linear
  linear: (t: number, b: number, c: number, d: number) => c * (t / d) + b,
  
  // Ease out quad
  easeOutQuad: (t: number, b: number, c: number, d: number) => {
    t /= d;
    return -c * t * (t - 2) + b;
  },
  
  // Ease out cubic
  easeOutCubic: (t: number, b: number, c: number, d: number) => {
    t /= d;
    t--;
    return c * (t * t * t + 1) + b;
  },
  
  // Ease in out quad
  easeInOutQuad: (t: number, b: number, c: number, d: number) => {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t + b;
    t--;
    return -c / 2 * (t * (t - 2) - 1) + b;
  },
};

/**
 * Custom count-up animation hook
 */
export function useCountUp({
  end,
  start = 0,
  duration = 2000,
  decimals = 0,
  prefix = '',
  suffix = '',
  separator = ',',
  easingFn = easingFunctions.easeOutCubic,
}: UseCountUpOptions) {
  const [count, setCount] = useState(start);
  const [isComplete, setIsComplete] = useState(false);
  const frameRef = useRef<number>();
  const startTimeRef = useRef<number>();

  useEffect(() => {
    // Reset state when end value changes
    setIsComplete(false);
    startTimeRef.current = undefined;

    const animate = (currentTime: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = currentTime;
      }

      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Calculate current value using easing function
      const currentValue = easingFn(
        elapsed,
        start,
        end - start,
        duration
      );

      if (progress < 1) {
        setCount(currentValue);
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setCount(end);
        setIsComplete(true);
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [end, start, duration, easingFn]);

  // Format the number
  const formattedValue = formatNumber(count, decimals, separator);

  return {
    value: count,
    formattedValue: `${prefix}${formattedValue}${suffix}`,
    isComplete,
  };
}

/**
 * Format number with decimals and thousands separator
 */
function formatNumber(
  num: number,
  decimals: number,
  separator: string
): string {
  const fixed = num.toFixed(decimals);
  const [integer, decimal] = fixed.split('.');

  // Add thousands separator
  const withSeparator = integer.replace(/\B(?=(\d{3})+(?!\d))/g, separator);

  return decimal ? `${withSeparator}.${decimal}` : withSeparator;
}

/**
 * Simple count-up component for easy use
 */
interface CountUpProps extends UseCountUpOptions {
  className?: string;
}

export function CountUp({
  end,
  start = 0,
  duration = 2000,
  decimals = 0,
  prefix = '',
  suffix = '',
  separator = ',',
  easingFn = easingFunctions.easeOutCubic,
  className = '',
}: CountUpProps) {
  const { formattedValue } = useCountUp({
    end,
    start,
    duration,
    decimals,
    prefix,
    suffix,
    separator,
    easingFn,
  });

  return <span className={className}>{formattedValue}</span>;
}

