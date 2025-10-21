import type { CreateFlashcardLibraryCard } from '@/types/flashcard-library';

/**
 * Beginner Flashcards - Refining Questions & Targeting
 *
 * Domain: refining_targeting
 * Difficulty: beginner (easy)
 * Count: 4 (1 term + 2 scenarios + 1 mini-check)
 * Generated: 2025-10-17
 * Source: Phase 2C - Expand beginner content to all domains
 */

export const generatedFlashcards: CreateFlashcardLibraryCard[] = [
  // Term Flashcard (1)
  {
    front: "What does 'targeting' mean in Tanium?",
    back: 'Selecting which specific computers will receive your question or action. You can target all machines, specific computer groups, or use filters to narrow down.',
    domain: 'refining_targeting',
    category: 'terminology',
    difficulty: 'easy',
    tags: ['targeting', 'computer-groups', 'basics'],
    study_guide_ref: 'tco-study-path/refining-targeting/targeting-basics',
    source: 'ai_generated',
  },

  // Scenario Flashcards (2)
  {
    front: 'You only want to query Windows 10 laptops, not all computers. How do you achieve this?',
    back: "Use targeting to select a computer group like 'Windows 10 Laptops' or add a filter like 'Operating System contains Windows 10'.",
    hint: 'Think about limiting which machines see your question.',
    domain: 'refining_targeting',
    category: 'best_practices',
    difficulty: 'easy',
    tags: ['targeting', 'filtering', 'computer-groups'],
    study_guide_ref: 'tco-study-path/refining-targeting/targeting-basics',
    source: 'ai_generated',
  },
  {
    front: "When is it better to use a computer group instead of 'all machines'?",
    back: "When you need to repeatedly target the same set of computers (like 'Finance Department' or 'IT Lab Machines') or want to limit scope for safety.",
    hint: 'Think about reusability and scope control.',
    domain: 'refining_targeting',
    category: 'best_practices',
    difficulty: 'easy',
    tags: ['computer-groups', 'targeting', 'best-practices'],
    study_guide_ref: 'tco-study-path/refining-targeting/computer-groups',
    source: 'ai_generated',
  },

  // Mini-check Flashcard (1)
  {
    front: "What's the difference between filtering results and targeting computers?",
    back: 'Targeting chooses which computers to query. Filtering narrows down the results shown from those computers (e.g., only show machines with low disk space).',
    hint: 'One happens before the question runs, one happens after.',
    domain: 'refining_targeting',
    category: 'best_practices',
    difficulty: 'easy',
    tags: ['filtering', 'targeting', 'question-structure'],
    study_guide_ref: 'tco-study-path/refining-targeting/filtering-vs-targeting',
    source: 'ai_generated',
  },
];

export const beginnerRefiningTargetingFlashcardsMetadata = {
  domain: 'refining_targeting',
  source: 'phase_2c_expansion',
  difficulty: 'beginner',
  totalCards: 4,
  termCards: 1,
  scenarioCards: 2,
  miniCheckCards: 1,
  generatedAt: '2025-10-17',
  specKitCompliant: true,
  template: 'module_v2_upgrade',
};
