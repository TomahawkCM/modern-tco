import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";

import { LearnExperimentalQuizGroup } from "@/components/learn-experimental/LearnExperimentalQuizGroup";

const baseQuestion = {
  moduleId: "learn-experimental",
  sectionId: "unit-01",
  concept: "Concept",
  type: "multiple-choice" as const,
  explanation: "",
  difficulty: "easy" as const,
};

describe("LearnExperimentalQuizGroup", () => {
  it("renders fallback messaging when no questions resolve", async () => {
    render(<LearnExperimentalQuizGroup questions={Promise.resolve([])} />);

    expect(await screen.findByText(/No questions available/i)).toBeInTheDocument();
    expect(
      screen.getByText(/We couldn't load quick-check questions for this unit right now/i)
    ).toBeInTheDocument();
  });

  it("renders options when a question is provided", async () => {
    render(
      <LearnExperimentalQuizGroup
        questions={[
          {
            ...baseQuestion,
            id: "q1",
            question: "What is the first step in the Learn-style loop?",
            options: ["Frame intent", "Deploy actions"],
            correctAnswer: "Frame intent",
          },
        ]}
      />
    );

    expect(
      await screen.findByText("What is the first step in the Learn-style loop?")
    ).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Frame intent" })).toBeInTheDocument();
  });
});
