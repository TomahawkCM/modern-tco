import { describe, expect, it, expect as vitestExpect } from 'vitest';
import { getTargetedQuestions } from '@/lib/practice-question-targeting';
import { Difficulty, type Question, QuestionCategory, TCODomain } from '@/types/exam';

describe('Vitest setup', () => {
  it('runs a simple targeting smoke test', () => {
    const questions: Question[] = [
      {
        id: 'q1',
        question: 'Sample?',
        choices: [
          { id: 'a', text: 'A' },
          { id: 'b', text: 'B' },
        ],
        correctAnswerId: 'a',
        domain: TCODomain.ASKING_QUESTIONS,
        difficulty: Difficulty.BEGINNER,
        category: QuestionCategory.PLATFORM_FUNDAMENTALS,
        tags: ['fundamentals'],
        consoleSteps: [],
        context: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const pool = getTargetedQuestions(questions, {
      moduleId: 'module-asking-questions',
      primaryDomain: TCODomain.ASKING_QUESTIONS,
      targetObjectives: [],
      requiredTags: ['fundamentals'],
      optionalTags: [],
      minQuestions: 1,
      idealQuestions: 5,
      fallbackStrategy: 'expand-domain',
    });

    expect(pool.questions.length).toBe(1);
    expect(pool.isEmpty).toBe(false);
  });

  it('progress page placeholder module loads', async () => {
    const Page = (await import('@/app/progress/page')).default;
    vitestExpect(typeof Page).toBe('function');
  });
});
