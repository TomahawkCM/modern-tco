import type { CreateFlashcardLibraryCard } from "@/types/flashcard-library";

/**
 * Beginner Flashcards - Navigation & Basic Modules
 *
 * Domain: navigation
 * Difficulty: beginner (easy)
 * Count: 10 (3 terms + 4 scenarios + 3 mini-checks)
 * Generated: 2025-10-17
 * Source: Phase 2C - Expand beginner content to all domains
 * Template: Module v2 Upgrade (gold standard for student-first design)
 */

export const generatedFlashcards: CreateFlashcardLibraryCard[] = [
  // Term Flashcards (3)
  {
    front: "What is the Tanium Console?",
    back: "Web interface where you navigate between modules, access settings, and manage your Tanium environment. Think of it as your control center for all Tanium operations.",
    domain: "navigation",
    category: "terminology",
    difficulty: "easy",
    tags: ["console", "interface", "basics"],
    study_guide_ref: "tco-study-path/navigation-basic-modules/console-layout",
    source: "ai_generated",
  },
  {
    front: "What is the left side navigation panel?",
    back: "Navigation panel on the left side of the Console that shows module icons (like Interact, Trends), favorites, recently used items, and administration tools.",
    domain: "navigation",
    category: "terminology",
    difficulty: "easy",
    tags: ["navigation", "console-layout", "modules"],
    study_guide_ref: "tco-study-path/navigation-basic-modules/console-layout",
    source: "ai_generated",
  },
  {
    front: "What is global search in Tanium?",
    back: "Universal search bar at the top of the Console that lets you find sensors, saved questions, computer groups, and users across the entire platform.",
    domain: "navigation",
    category: "terminology",
    difficulty: "easy",
    tags: ["search", "navigation", "efficiency"],
    study_guide_ref: "tco-study-path/navigation-basic-modules/console-layout",
    source: "ai_generated",
  },

  // Scenario Flashcards (4)
  {
    front: "Where do you find the Interact module to ask questions?",
    back: "Click the Interact icon in the left side navigation panel (it's one of the primary module icons).",
    hint: "Look for module icons on the left side of the screen.",
    domain: "navigation",
    category: "best_practices",
    difficulty: "easy",
    tags: ["interact-module", "navigation", "modules"],
    study_guide_ref: "tco-study-path/navigation-basic-modules/console-layout",
    source: "ai_generated",
  },
  {
    front: "You want to quickly return to a screen you used 5 minutes ago. Where do you look?",
    back: "Check the 'Recently Used' section in the left side navigation panel (shows last 10 accessed screens).",
    hint: "Think about navigation features that track your history.",
    domain: "navigation",
    category: "best_practices",
    difficulty: "easy",
    tags: ["recently-used", "navigation", "efficiency"],
    study_guide_ref: "tco-study-path/navigation-basic-modules/console-layout",
    source: "ai_generated",
  },
  {
    front: "Which navigation component shows system alerts and notifications?",
    back: "The Notifications Center in the top navigation bar (shows real-time alerts for system events, scheduled actions, and mentions).",
    hint: "Look at the top bar for alert-related features.",
    domain: "navigation",
    category: "best_practices",
    difficulty: "easy",
    tags: ["notifications", "alerts", "top-navigation"],
    study_guide_ref: "tco-study-path/navigation-basic-modules/console-layout",
    source: "ai_generated",
  },
  {
    front: "You access the same sensor 20 times a day. What's faster than using search each time?",
    back: "Add it to your Favorites in the left navigation panel for one-click access.",
    hint: "Think about bookmark-like features for frequently used items.",
    domain: "navigation",
    category: "best_practices",
    difficulty: "easy",
    tags: ["favorites", "efficiency", "shortcuts"],
    study_guide_ref: "tco-study-path/navigation-basic-modules/console-layout",
    source: "ai_generated",
  },

  // Mini-check Flashcards (3)
  {
    front: "Name two items you can find using global search.",
    back: "Any two of: sensors, saved questions, computer groups, users, packages, or other platform objects.",
    hint: "Think about what types of things exist in Tanium.",
    domain: "navigation",
    category: "best_practices",
    difficulty: "easy",
    tags: ["search", "navigation", "platform-knowledge"],
    study_guide_ref: "tco-study-path/navigation-basic-modules/console-layout",
    source: "ai_generated",
  },
  {
    front: "Where do you find your account settings and role information?",
    back: "Click the User Profile Menu in the top navigation bar (usually your username or icon in the upper right).",
    hint: "Look at the top right corner of the Console.",
    domain: "navigation",
    category: "best_practices",
    difficulty: "easy",
    tags: ["user-profile", "settings", "navigation"],
    study_guide_ref: "tco-study-path/navigation-basic-modules/console-layout",
    source: "ai_generated",
  },
  {
    front: "True or false: The left navigation panel stays open all the time.",
    back: "False - The left navigation auto-collapses to save screen space. You can toggle it with Ctrl+Shift+N (keyboard shortcut).",
    hint: "Think about how interfaces save space on your screen.",
    domain: "navigation",
    category: "best_practices",
    difficulty: "easy",
    tags: ["navigation-panel", "shortcuts", "ui-behavior"],
    study_guide_ref: "tco-study-path/navigation-basic-modules/console-layout",
    source: "ai_generated",
  },
];

export const beginnerNavigationFlashcardsMetadata = {
  domain: "navigation",
  source: "phase_2c_expansion",
  difficulty: "beginner",
  totalCards: 10,
  termCards: 3,
  scenarioCards: 4,
  miniCheckCards: 3,
  generatedAt: "2025-10-17",
  specKitCompliant: true,
  template: "module_v2_upgrade",
};
