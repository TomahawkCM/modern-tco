"use client";

import { useEffect, useRef } from "react";

interface UseScreenReaderOptions {
  politeness?: "polite" | "assertive";
  atomic?: boolean;
}

export function useScreenReader() {
  const liveRegionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Create live region if it doesn't exist
    if (!liveRegionRef.current) {
      const liveRegion = document.createElement("div");
      liveRegion.setAttribute("aria-live", "polite");
      liveRegion.setAttribute("aria-atomic", "true");
      liveRegion.setAttribute("aria-relevant", "additions text");
      liveRegion.style.position = "absolute";
      liveRegion.style.left = "-10000px";
      liveRegion.style.width = "1px";
      liveRegion.style.height = "1px";
      liveRegion.style.overflow = "hidden";
      liveRegion.id = "screen-reader-announcements";

      document.body.appendChild(liveRegion);
      liveRegionRef.current = liveRegion;
    }

    return () => {
      if (liveRegionRef.current) {
        document.body.removeChild(liveRegionRef.current);
        liveRegionRef.current = null;
      }
    };
  }, []);

  const announce = (message: string, options: UseScreenReaderOptions = {}) => {
    const { politeness = "polite", atomic = true } = options;

    if (!liveRegionRef.current) return;

    // Update live region attributes
    liveRegionRef.current.setAttribute("aria-live", politeness);
    liveRegionRef.current.setAttribute("aria-atomic", atomic.toString());

    // Clear existing content and add new message
    liveRegionRef.current.innerHTML = "";
    setTimeout(() => {
      if (liveRegionRef.current) {
        liveRegionRef.current.textContent = message;
      }
    }, 100);

    // Clear message after announcement
    setTimeout(() => {
      if (liveRegionRef.current) {
        liveRegionRef.current.textContent = "";
      }
    }, 5000);
  };

  const announceImmediate = (message: string) => {
    announce(message, { politeness: "assertive" });
  };

  const announcePolite = (message: string) => {
    announce(message, { politeness: "polite" });
  };

  return {
    announce,
    announceImmediate,
    announcePolite,
  };
}

// Hook for managing focus announcements
export function useFocusAnnouncement() {
  const { announce } = useScreenReader();

  const announceFocus = (element: HTMLElement) => {
    const role = element.getAttribute("role");
    const label =
      element.getAttribute("aria-label") ||
      element.getAttribute("title") ||
      element.textContent?.trim();

    if (label) {
      const announcement = role ? `${role}, ${label}` : label;
      announce(announcement, { politeness: "polite" });
    }
  };

  const announceNavigation = (current: string, total?: number, index?: number) => {
    let message = current;
    if (total && index !== undefined) {
      message += `, ${index + 1} of ${total}`;
    }
    announce(message, { politeness: "polite" });
  };

  const announceStatus = (status: string) => {
    announce(status, { politeness: "assertive" });
  };

  return {
    announceFocus,
    announceNavigation,
    announceStatus,
  };
}

// Hook for managing exam-specific screen reader announcements
export function useExamAnnouncements() {
  const { announce, announceImmediate } = useScreenReader();

  const announceQuestion = (questionNumber: number, totalQuestions: number, question: string) => {
    const message = `Question ${questionNumber} of ${totalQuestions}: ${question}`;
    announce(message, { politeness: "polite" });
  };

  const announceAnswer = (isCorrect: boolean, explanation?: string) => {
    const result = isCorrect ? "Correct answer" : "Incorrect answer";
    let message = result;
    if (explanation) {
      message += `. ${explanation}`;
    }
    announceImmediate(message);
  };

  const announceProgress = (current: number, total: number, percentage: number) => {
    const message = `Progress: ${current} of ${total} questions completed, ${percentage}% complete`;
    announce(message, { politeness: "polite" });
  };

  const announceExamStart = (mode: string, questionCount: number, timeLimit?: number) => {
    let message = `Starting ${mode} mode with ${questionCount} questions`;
    if (timeLimit) {
      message += ` and ${Math.floor(timeLimit / 60)} minute time limit`;
    }
    announceImmediate(message);
  };

  const announceExamEnd = (score: number, passed: boolean) => {
    const result = passed ? "passed" : "did not pass";
    const message = `Exam completed. You ${result} with a score of ${score}%`;
    announceImmediate(message);
  };

  const announceTimeWarning = (minutesRemaining: number) => {
    const message = `Time warning: ${minutesRemaining} minutes remaining`;
    announceImmediate(message);
  };

  return {
    announceQuestion,
    announceAnswer,
    announceProgress,
    announceExamStart,
    announceExamEnd,
    announceTimeWarning,
  };
}
