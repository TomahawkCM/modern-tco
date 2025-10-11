import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Exam utility functions
export function calculateScore(correct: number, total: number): number {
  return Math.round((correct / total) * 100);
}

export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function getScoreColor(score: number): string {
  if (score >= 90) return "text-[#22c55e] dark:text-[#22c55e]";
  if (score >= 80) return "text-blue-600 dark:text-primary";
  if (score >= 70) return "text-yellow-600 dark:text-[#f97316]";
  return "text-red-600 dark:text-red-400";
}

export function getDifficultyColor(difficulty: string): string {
  switch (difficulty.toLowerCase()) {
    case "beginner":
      return "text-[#22c55e] dark:text-[#22c55e]";
    case "intermediate":
      return "text-yellow-600 dark:text-[#f97316]";
    case "advanced":
      return "text-red-600 dark:text-red-400";
    default:
      return "text-gray-600 dark:text-muted-foreground";
  }
}
