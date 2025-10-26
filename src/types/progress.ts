export interface ModuleProgress {
  moduleId: string;
  percentage: number; // 0.0 – 1.0
  completed?: number;
  total?: number;
  updatedAt?: Date;
}

export type ModuleProgressMap = Record<string, ModuleProgress>;

