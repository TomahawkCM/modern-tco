import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

import BlueprintMeter from '@/components/BlueprintMeter';
import { coverageFromContent, loadContentQuestions, computeCoverage } from '@/lib/blueprint';
import BlueprintMeter from '@/components/BlueprintMeter';
import { TCODomain } from '@/types/exam';

describe('BlueprintMeter + coverage', () => {
  it('computes coverage from content and renders meters', () => {
    const cov = coverageFromContent();
    // Expect all five core domains present in seeded content
    const domains = cov.domains.map((d) => d.domain);
    expect(domains).toEqual(
      expect.arrayContaining([
        TCODomain.ASKING_QUESTIONS,
        TCODomain.REFINING_TARGETING,
        TCODomain.TAKING_ACTION,
        TCODomain.NAVIGATION_MODULES,
        TCODomain.REPORTING_EXPORT,
      ])
    );

    render(<BlueprintMeter source="content" />);
    const rows = screen.getAllByTestId('bp-meter-row');
    expect(rows.length).toBeGreaterThanOrEqual(5);
    // Labels show percentages
    expect(screen.getByText(/Blueprint Coverage/)).toBeInTheDocument();
  });

  it('accepts custom questions and aligns to computed coverage', () => {
    const qs = loadContentQuestions().filter((q) => q.domain === TCODomain.TAKING_ACTION);
    const cov = computeCoverage(qs);
    // Only one domain present => actualShare 1.0, coverageIndex should be > 100 for that domain
    const d = cov.domains[0];
    expect(d.actualShare).toBe(1);
    expect(d.coverageIndex).toBeGreaterThanOrEqual(100);
  });

  it('renders objective coverage when objectives are present', () => {
    const custom = [
      { id: 'q1', question: 'x', choices: [{id:'a',text:'a'}], correctAnswerId: 'a', domain: TCODomain.ASKING_QUESTIONS, difficulty: 'Beginner', category: 'Platform Fundamentals', objectiveId: 'OBJ-1' },
      { id: 'q2', question: 'y', choices: [{id:'a',text:'a'}], correctAnswerId: 'a', domain: TCODomain.ASKING_QUESTIONS, difficulty: 'Beginner', category: 'Platform Fundamentals', objectiveIds: ['OBJ-1','OBJ-2'] },
    ] as any;
    const cov = computeCoverage(custom);
    expect(cov.objectives?.length).toBeGreaterThan(0);

    render(<BlueprintMeter source="custom" questions={custom} />);
    // Toggle exists
    // The component defaults to domain view; objective button should be present
    expect(screen.getByText(/Objectives/i)).toBeInTheDocument();
  });
});
