export type ModuleListRow = {
  id: string;
  title: string;
  domain: string;
  difficulty: string;
  estimatedTimeMinutes: number;
  slug: string;
  // Optional fields when user progress is available
  status?: 'not_started' | 'in_progress' | 'completed' | 'bookmarked';
  progressPct?: number; // 0-100
};

