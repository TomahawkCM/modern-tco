"use client";

import { usePrivacy } from "@/contexts/PrivacyContext";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";

interface FinancialValueProps {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}

/**
 * FinancialValue
 * Wraps financial amounts and applies a blur effect when privacy mode is active.
 * On hover (desktop) or tap (mobile), temporarily reveals the value for 2 seconds.
 */
export function FinancialValue({
  children,
  className,
  as: Component = "span",
}: FinancialValueProps) {
  const { isPrivacyMode } = usePrivacy();
  const [isTemporarilyRevealed, setIsTemporarilyRevealed] = useState(false);
  const revealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isBlurred = isPrivacyMode && !isTemporarilyRevealed;

  const clearRevealTimer = useCallback(() => {
    if (revealTimerRef.current !== null) {
      clearTimeout(revealTimerRef.current);
      revealTimerRef.current = null;
    }
  }, []);

  const handleReveal = useCallback(() => {
    if (!isPrivacyMode) return;

    clearRevealTimer();
    setIsTemporarilyRevealed(true);

    revealTimerRef.current = setTimeout(() => {
      setIsTemporarilyRevealed(false);
      revealTimerRef.current = null;
    }, 2000);
  }, [isPrivacyMode, clearRevealTimer]);

  // Clean up timer on unmount or when privacy mode changes
  useEffect(() => {
    if (!isPrivacyMode) {
      clearRevealTimer();
      setIsTemporarilyRevealed(false);
    }
    return clearRevealTimer;
  }, [isPrivacyMode, clearRevealTimer]);

  if (!isPrivacyMode) {
    return (
      <Component className={className}>
        {children}
      </Component>
    );
  }

  return (
    <Component
      className={cn(
        "transition-[filter] duration-200",
        isBlurred && "blur-md select-none",
        className
      )}
      aria-hidden={isBlurred ? "true" : undefined}
      onMouseEnter={handleReveal}
      onClick={handleReveal}
    >
      {children}
    </Component>
  );
}
