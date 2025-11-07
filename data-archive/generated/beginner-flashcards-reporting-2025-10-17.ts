import type { CreateFlashcardLibraryCard } from '@/types/flashcard-library';

/**
 * Beginner Flashcards - Reporting & Data Export
 *
 * Domain: reporting
 * Difficulty: beginner (easy)
 * Count: 4 (1 term + 2 scenarios + 1 mini-check)
 * Generated: 2025-10-17
 * Source: Phase 2C - Expand beginner content to all domains
 */

export const generatedFlashcards: CreateFlashcardLibraryCard[] = [
  // Term Flashcard (1)
  {
    front: 'What is the Reporting module in Tanium?',
    back: 'Module where you create dashboards, schedule reports, and export data to share with stakeholders outside Tanium. Think of it as your presentation and communication tool.',
    domain: 'reporting',
    category: 'terminology',
    difficulty: 'easy',
    tags: ['reporting-module', 'dashboards', 'exports'],
    study_guide_ref: 'tco-study-path/reporting/reporting-basics',
    source: 'ai_generated',
  },

  // Scenario Flashcards (2)
  {
    front:
      'Your manager needs a weekly report on patch compliance. Which Tanium feature helps you automate this?',
    back: 'Use the Reporting module to create a scheduled report that automatically generates and sends the patch compliance data weekly.',
    hint: 'Think about automation and regular delivery.',
    domain: 'reporting',
    category: 'best_practices',
    difficulty: 'easy',
    tags: ['scheduled-reports', 'automation', 'compliance'],
    study_guide_ref: 'tco-study-path/reporting/scheduled-reports',
    source: 'ai_generated',
  },
  {
    front:
      "You need to send question results to a colleague who doesn't have Tanium access. What's the best way?",
    back: 'Export the results to CSV format, which can be opened in Excel and easily shared via email.',
    hint: 'Think about portable file formats anyone can open.',
    domain: 'reporting',
    category: 'best_practices',
    difficulty: 'easy',
    tags: ['export', 'csv', 'sharing'],
    study_guide_ref: 'tco-study-path/reporting/data-export',
    source: 'ai_generated',
  },

  // Mini-check Flashcard (1)
  {
    front: 'Name two common export formats Tanium supports.',
    back: 'Any two of: CSV (Excel-compatible), JSON (for APIs), XML (for data exchange), or PDF (for reports).',
    hint: 'Think about file formats used for data and documents.',
    domain: 'reporting',
    category: 'best_practices',
    difficulty: 'easy',
    tags: ['export-formats', 'data-formats', 'reporting'],
    study_guide_ref: 'tco-study-path/reporting/data-export',
    source: 'ai_generated',
  },
];

export const beginnerReportingFlashcardsMetadata = {
  domain: 'reporting',
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
