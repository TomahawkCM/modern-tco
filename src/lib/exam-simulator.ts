import type { AssessmentConfig } from "@/types/assessment";

export type ExamModeSim = "practice-test" | "mock-exam";

export function getExamDefaults(mode: ExamModeSim): { questionCount: number; timeLimit: number } {
  switch (mode) {
    case "mock-exam":
      return { questionCount: 75, timeLimit: 105 };
    case "practice-test":
    default:
      return { questionCount: 25, timeLimit: 35 };
  }
}

export function buildExamConfig(
  mode: ExamModeSim,
  opts: { userId?: string; moduleId?: string } = {}
): AssessmentConfig {
  const { questionCount, timeLimit } = getExamDefaults(mode);
  return {
    assessmentType: mode,
    type: mode, // legacy alias
    userId: opts.userId,
    moduleId: opts.moduleId,
    questionCount,
    timeLimit,
    allowReview: false,
    showExplanations: false,
    showFeedback: false,
    shuffleQuestions: true,
    shuffleAnswers: true,
    enableAnalytics: true,
  } as AssessmentConfig;
}

