import type { CreateFlashcardLibraryCard } from "@/types/flashcard-library";

/**
 * Beginner Flashcards - Taking Action (Packages & Actions)
 *
 * Domain: taking_action
 * Difficulty: beginner (easy)
 * Count: 6 (2 terms + 2 scenarios + 2 mini-checks)
 * Generated: 2025-10-17
 * Source: Phase 2C - Expand beginner content to all domains
 */

export const generatedFlashcards: CreateFlashcardLibraryCard[] = [
  // Term Flashcards (2)
  {
    front: "What is a Package in Tanium?",
    back: "Pre-built software component that contains files and instructions to install, update, or configure software on endpoint computers. Think of it like an app installer that runs on target machines.",
    domain: "taking_action",
    category: "terminology",
    difficulty: "easy",
    tags: ["packages", "deployment", "basics"],
    study_guide_ref: "tco-study-path/taking-action/package-basics",
    source: "ai_generated",
  },
  {
    front: "What is an Action in Tanium?",
    back: "Command that deploys a package to specific target computers. An action tells Tanium which package to run, where to run it, and when to start.",
    domain: "taking_action",
    category: "terminology",
    difficulty: "easy",
    tags: ["actions", "deployment", "packages"],
    study_guide_ref: "tco-study-path/taking-action/action-deployment",
    source: "ai_generated",
  },

  // Scenario Flashcards (2)
  {
    front: "You need to install Chrome browser on 50 computers. What Tanium feature should you use?",
    back: "Use a Package (containing Chrome installer) and create an Action to deploy it to the target computer group.",
    hint: "Think about Tanium's deployment tools.",
    domain: "taking_action",
    category: "best_practices",
    difficulty: "easy",
    tags: ["package-deployment", "use-cases", "software-installation"],
    study_guide_ref: "tco-study-path/taking-action/package-basics",
    source: "ai_generated",
  },
  {
    front: "Before deploying a package to 500 servers, what should you do first?",
    back: "Test the package on a small group first (5-10 computers) to verify it works correctly before wide deployment.",
    hint: "Think about risk management and validation.",
    domain: "taking_action",
    category: "best_practices",
    difficulty: "easy",
    tags: ["testing", "best-practices", "validation"],
    study_guide_ref: "tco-study-path/taking-action/package-basics",
    source: "ai_generated",
  },

  // Mini-check Flashcards (2)
  {
    front: "Name one type of package parameter you might configure.",
    back: "Any one of: text parameters (file paths), number parameters (timeouts), or yes/no parameters (enable/disable features).",
    hint: "Think about settings you'd need to customize for software installation.",
    domain: "taking_action",
    category: "best_practices",
    difficulty: "easy",
    tags: ["parameters", "configuration", "package-basics"],
    study_guide_ref: "tco-study-path/taking-action/package-basics",
    source: "ai_generated",
  },
  {
    front: "What are the three main components of a basic package deployment?",
    back: "1) Choose the right package, 2) Configure parameters, 3) Select target systems.",
    hint: "Think about the workflow from selection to deployment.",
    domain: "taking_action",
    category: "best_practices",
    difficulty: "easy",
    tags: ["deployment-workflow", "packages", "actions"],
    study_guide_ref: "tco-study-path/taking-action/package-basics",
    source: "ai_generated",
  },
];

export const beginnerTakingActionFlashcardsMetadata = {
  domain: "taking_action",
  source: "phase_2c_expansion",
  difficulty: "beginner",
  totalCards: 6,
  termCards: 2,
  scenarioCards: 2,
  miniCheckCards: 2,
  generatedAt: "2025-10-17",
  specKitCompliant: true,
  template: "module_v2_upgrade",
};
