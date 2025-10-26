import type { Question } from "@/lib/questionBank";

const mockFrom = jest.fn();

jest.mock("@/lib/supabase", () => ({
  __esModule: true,
  supabase: {
    from: mockFrom,
  },
}));

type SupabaseResult = {
  data: unknown;
  error: Error | null;
};

function createQueryBuilder(result: SupabaseResult) {
  return {
    select: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    contains: jest.fn().mockReturnThis(),
    then<T>(onFulfilled: (value: SupabaseResult) => T, onRejected?: (reason: unknown) => T) {
      return Promise.resolve(result).then(onFulfilled, onRejected);
    },
  };
}

describe("getReadOnlyQuestions", () => {
  beforeEach(() => {
    mockFrom.mockReset();
  });

  it("normalizes rows from Supabase into Question objects", async () => {
    const response = {
      data: [
        {
          id: "123",
          question: "Which sensor returns installed software?",
          options: ["Get Software List", "Get Process Statistics"],
          correct_answer: 0,
          explanation: "The Software List sensor inventories installed applications.",
          module_id: "module-01L",
          domain: "asking-questions",
          tags: ["sensors", "inventory"],
          difficulty: "Advanced",
        },
      ],
      error: null,
    } satisfies SupabaseResult;

    const builder = createQueryBuilder(response);
    mockFrom.mockReturnValue(builder);

    const { getReadOnlyQuestions } = await import("@/lib/quiz/readOnlyQuestions");
    const result = await getReadOnlyQuestions({ domain: "asking-questions", tags: ["sensors"], limit: 1 });

    expect(mockFrom).toHaveBeenCalledWith("questions");
    expect(builder.select).toHaveBeenCalled();
    expect(builder.limit).toHaveBeenCalledWith(1);
    expect(builder.eq).toHaveBeenCalledWith("domain", "asking-questions");
    expect(builder.contains).toHaveBeenCalledWith("tags", ["sensors"]);

    const expected: Question = {
      id: "123",
      moduleId: "module-01L",
      sectionId: "asking-questions",
      concept: "sensors",
      question: "Which sensor returns installed software?",
      type: "multiple-choice",
      options: ["Get Software List", "Get Process Statistics"],
      correctAnswer: "Get Software List",
      explanation: "The Software List sensor inventories installed applications.",
      difficulty: "hard",
      tags: ["sensors", "inventory"],
    };

    expect(result).toEqual([expected]);
  });

  it("handles object options and invalid answer indexes gracefully", async () => {
    const response = {
      data: [
        {
          id: "42",
          question: "Pick the best fallback when no options exist",
          options: {
            a: "Flag the module as needing curation",
            b: { value: "Show a placeholder" },
          },
          correct_answer: 5,
          explanation: null,
          module_id: null,
          domain: null,
          tags: null,
          difficulty: "Beginner",
        },
      ],
      error: null,
    } satisfies SupabaseResult;

    const builder = createQueryBuilder(response);
    mockFrom.mockReturnValue(builder);

    const { getReadOnlyQuestions } = await import("@/lib/quiz/readOnlyQuestions");
    const result = await getReadOnlyQuestions();

    expect(builder.eq).not.toHaveBeenCalled();
    expect(builder.contains).not.toHaveBeenCalled();

    const expected: Question = {
      id: "42",
      moduleId: "learn-experimental",
      sectionId: "learn-experimental",
      concept: "Mastery",
      question: "Pick the best fallback when no options exist",
      type: "multiple-choice",
      options: [
        "Flag the module as needing curation",
        '{"value":"Show a placeholder"}',
      ],
      correctAnswer: "",
      explanation: "",
      difficulty: "easy",
    };

    expect(result).toEqual([expected]);
  });

  it("returns an empty array and logs when Supabase returns an error", async () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => undefined);

    const builder = createQueryBuilder({ data: null, error: new Error("boom") });
    mockFrom.mockReturnValue(builder);

    const { getReadOnlyQuestions } = await import("@/lib/quiz/readOnlyQuestions");
    const result = await getReadOnlyQuestions({ domain: "asking-questions" });

    expect(warnSpy).toHaveBeenCalledWith("Failed to load read-only questions", expect.objectContaining({
      error: expect.any(Error),
    }));
    expect(result).toEqual([]);

    warnSpy.mockRestore();
  });
});
