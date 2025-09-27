/**
 * Sanity checks for the question database statistics.
 */
import { getQuestionStats } from "@/lib/questionLoader";

describe("Question stats", () => {
  it("computes totals and distributions consistently", () => {
    const stats = getQuestionStats();
    const { totalQuestions, domainDistribution, difficultyDistribution, categoryDistribution } = stats;

    expect(totalQuestions).toBeGreaterThan(0);

    const domainSum = Object.values(domainDistribution).reduce((a, b) => a + b, 0);
    const diffSum = Object.values(difficultyDistribution).reduce((a, b) => a + b, 0);
    const catSum = Object.values(categoryDistribution).reduce((a, b) => a + b, 0);

    expect(domainSum).toBe(totalQuestions);
    expect(diffSum).toBe(totalQuestions);
    expect(catSum).toBe(totalQuestions);
  });
});

