// src/types/study.ts
export type TCODomain =
  | "Platform"
  | "Asset Discovery"
  | "Deploy"
  | "Patch"
  | "Comply"
  | "Trends"
  | "Interact"
  | "Reporting"
  | "Sensors"
  | "Packages";

export type Question = {
  id: string;
  prompt: string;
  answers: string[];
  correctIndex: number; // index in answers
  domain: TCODomain;
  explanation?: string;
  tags?: string[];
};

export type AssessmentStatus = "not-started" | "in-progress" | "completed";

export type AssessmentResponse = {
  questionId: string;
  selectedIndex: number | null;
  correct: boolean | null;
  timeSpentMs?: number;
};

export type AssessmentConfig = {
  moduleId?: string;
  domainFilter?: TCODomain | null;
  questions?: Question[];
  timeLimit?: number | null;
};

export type AssessmentSession = {
  id: string;
  userId: string;
  questions: Question[];
  responses: Record<string, AssessmentResponse>;
  status: AssessmentStatus;
  startTime?: number | null;
  endTime?: number | null;
  timeLimit?: number | null;
};
