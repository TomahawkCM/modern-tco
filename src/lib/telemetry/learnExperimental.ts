import { isLearnExperimentalEnabled } from "@/lib/flags/learnExperimental";

type LearnExpAction =
  | "unit_start"
  | "unit_complete"
  | "practice_start"
  | "practice_complete"
  | "quiz_submit"
  | "module_complete";

interface LearnExpEvent {
  moduleId: string;
  unitId: string;
  action: LearnExpAction;
  correct?: boolean;
  quizId?: string;
  ts?: number;
}

export function emitLearnExp(event: LearnExpEvent): void {
  if (typeof window === "undefined") {
    return;
  }

  if (!isLearnExperimentalEnabled()) {
    return;
  }

  const detail = {
    ...event,
    ts: event.ts ?? Date.now(),
  };

  window.dispatchEvent(new CustomEvent("learnExpEvent", { detail }));
}
