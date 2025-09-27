import { calculateExamResults } from '@/lib/examLogic';
import { ExamMode, type ExamSession, type Question, Difficulty, QuestionCategory, TCODomain } from '@/types/exam';

function q(id: string, domain: TCODomain): Question {
  return {
    id,
    question: `Q ${id}`,
    choices: [
      { id: 'a', text: 'A' },
      { id: 'b', text: 'B' },
      { id: 'c', text: 'C' },
      { id: 'd', text: 'D' },
    ],
    correctAnswerId: 'b',
    domain,
    difficulty: Difficulty.BEGINNER,
    category: QuestionCategory.PLATFORM_FUNDAMENTALS,
  };
}

describe('calculateExamResults', () => {
  it('computes score, domain breakdown, and pass flag', () => {
    const questions = [
      q('1', TCODomain.ASKING_QUESTIONS),
      q('2', TCODomain.REFINING_TARGETING),
      q('3', TCODomain.TAKING_ACTION),
    ];
    const session: ExamSession = {
      id: 's1',
      mode: ExamMode.PRACTICE,
      questions,
      currentIndex: 3,
      answers: { '1': 'b', '2': 'a', '3': 'b' },
      startTime: new Date(Date.now() - 60_000),
      endTime: new Date(),
      completed: true,
    };
    const result = calculateExamResults(session);
    expect(result.totalCount).toBe(3);
    expect(result.correctCount).toBe(2);
    expect(result.score).toBe(67);
    expect(typeof result.passed).toBe('boolean');
    // domain breakdown sums to total
    const sum = Object.values(result.domainBreakdown).reduce((a, b: any) => a + b.total, 0);
    expect(sum).toBe(3);
  });
});

