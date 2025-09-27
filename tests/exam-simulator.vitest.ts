import { describe, it, expect } from 'vitest';
import { buildExamConfig, getExamDefaults } from '@/lib/exam-simulator';

describe('exam-simulator core', () => {
  it('provides sensible defaults per mode', () => {
    const mock = getExamDefaults('mock-exam');
    expect(mock.questionCount).toBe(75);
    expect(mock.timeLimit).toBe(105);

    const practice = getExamDefaults('practice-test');
    expect(practice.questionCount).toBe(25);
    expect(practice.timeLimit).toBe(35);
  });

  it('builds an AssessmentConfig aligned to engine expectations', () => {
    const cfg = buildExamConfig('mock-exam', { userId: 'u1', moduleId: 'm1' });
    expect(cfg.assessmentType).toBe('mock-exam');
    expect(cfg.type).toBe('mock-exam');
    expect(cfg.userId).toBe('u1');
    expect(cfg.moduleId).toBe('m1');
    expect(cfg.questionCount).toBe(75);
    expect(cfg.timeLimit).toBe(105);
    expect(cfg.shuffleQuestions).toBe(true);
    expect(cfg.shuffleAnswers).toBe(true);
    expect(cfg.showFeedback).toBe(false);
  });
});

