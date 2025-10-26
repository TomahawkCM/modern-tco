import { Difficulty } from '../types/exam';

export const ALL_DIFFICULTIES: Difficulty[] = [
  Difficulty.BEGINNER,
  Difficulty.INTERMEDIATE,
  Difficulty.ADVANCED,
  Difficulty.EXPERT,
];

export function canonicalizeDifficulty(input: string | undefined | null): Difficulty | undefined {
  if (!input) return undefined;
  const normalized = input.trim().toLowerCase();
  switch (normalized) {
    case 'beginner':
      return Difficulty.BEGINNER;
    case 'intermediate':
      return Difficulty.INTERMEDIATE;
    case 'advanced':
      return Difficulty.ADVANCED;
    case 'expert':
      return Difficulty.EXPERT;
    default:
      return undefined;
  }
}

export function defaultDifficultyRecord<T>(valueFactory: (d: Difficulty) => T): Record<Difficulty, T> {
  return ALL_DIFFICULTIES.reduce((acc, d) => {
    acc[d] = valueFactory(d);
    return acc;
  }, {} as Record<Difficulty, T>);
}
