/**
 * Achievement System Configuration
 * Research-backed gamification for TCO certification preparation
 */

export type BadgeCategory =
  | "progress"
  | "mastery"
  | "streak"
  | "practice"
  | "excellence";

export type BadgeTier = "bronze" | "silver" | "gold" | "platinum";

export interface Badge {
  id: string;
  name: string;
  description: string;
  category: BadgeCategory;
  tier: BadgeTier;
  icon: string; // Lucide icon name
  color: string; // Tailwind color class
  criteria: {
    type: string;
    threshold: number;
    description: string;
  };
  points: number; // Points awarded for earning badge
  hidden?: boolean; // Secret achievement
}

export interface Level {
  id: number;
  name: string;
  minPoints: number;
  maxPoints: number;
  color: string;
  description: string;
}

export interface UserAchievement {
  userId: string;
  badgeId: string;
  earnedAt: Date;
  progress?: number; // Current progress toward next tier
}

// Level Progression System
export const LEVELS: Level[] = [
  {
    id: 1,
    name: "Beginner",
    minPoints: 0,
    maxPoints: 499,
    color: "text-gray-500",
    description: "Starting your TCO journey",
  },
  {
    id: 2,
    name: "Apprentice",
    minPoints: 500,
    maxPoints: 1499,
    color: "text-green-500",
    description: "Building foundational knowledge",
  },
  {
    id: 3,
    name: "Intermediate",
    minPoints: 1500,
    maxPoints: 2999,
    color: "text-blue-500",
    description: "Developing expertise",
  },
  {
    id: 4,
    name: "Advanced",
    minPoints: 3000,
    maxPoints: 4999,
    color: "text-purple-500",
    description: "Near certification ready",
  },
  {
    id: 5,
    name: "Expert",
    minPoints: 5000,
    maxPoints: 7499,
    color: "text-orange-500",
    description: "Certification ready",
  },
  {
    id: 6,
    name: "Master",
    minPoints: 7500,
    maxPoints: Infinity,
    color: "text-pink-500",
    description: "TCO certification master",
  },
];

// Badge Definitions
export const BADGES: Badge[] = [
  // Progress Badges
  {
    id: "first-steps",
    name: "First Steps",
    description: "Complete your first micro-section",
    category: "progress",
    tier: "bronze",
    icon: "FootprintsIcon",
    color: "text-amber-600",
    criteria: {
      type: "sections_completed",
      threshold: 1,
      description: "Complete 1 micro-section",
    },
    points: 50,
  },
  {
    id: "foundation-complete",
    name: "Foundation Complete",
    description: "Complete all 18 Foundation module sections",
    category: "progress",
    tier: "gold",
    icon: "Building2Icon",
    color: "text-cyan-500",
    criteria: {
      type: "module_completed",
      threshold: 1,
      description: "Complete Foundation module (18 sections)",
    },
    points: 500,
  },
  {
    id: "module-1-complete",
    name: "Question Master",
    description: "Complete Module 1: Asking Questions",
    category: "progress",
    tier: "gold",
    icon: "MessageSquareQuoteIcon",
    color: "text-blue-500",
    criteria: {
      type: "module_completed",
      threshold: 2,
      description: "Complete Module 1 (5 sections)",
    },
    points: 300,
  },
  {
    id: "module-2-complete",
    name: "Targeting Specialist",
    description: "Complete Module 2: Refining & Targeting",
    category: "progress",
    tier: "gold",
    icon: "TargetIcon",
    color: "text-purple-500",
    criteria: {
      type: "module_completed",
      threshold: 3,
      description: "Complete Module 2 (9 sections)",
    },
    points: 400,
  },
  {
    id: "module-3-complete",
    name: "Action Taker",
    description: "Complete Module 3: Taking Action",
    category: "progress",
    tier: "gold",
    icon: "ZapIcon",
    color: "text-orange-500",
    criteria: {
      type: "module_completed",
      threshold: 4,
      description: "Complete Module 3 (12 sections)",
    },
    points: 450,
  },
  {
    id: "module-4-complete",
    name: "Navigation Expert",
    description: "Complete Module 4: Navigation & Basic Modules",
    category: "progress",
    tier: "gold",
    icon: "CompassIcon",
    color: "text-green-500",
    criteria: {
      type: "module_completed",
      threshold: 5,
      description: "Complete Module 4 (21 sections)",
    },
    points: 600,
  },
  {
    id: "module-5-complete",
    name: "Reporting Pro",
    description: "Complete Module 5: Reporting & Data Export",
    category: "progress",
    tier: "gold",
    icon: "FileBarChartIcon",
    color: "text-pink-500",
    criteria: {
      type: "module_completed",
      threshold: 6,
      description: "Complete Module 5 (18 sections)",
    },
    points: 550,
  },
  {
    id: "halfway-there",
    name: "Halfway There",
    description: "Complete 50% of all micro-sections",
    category: "progress",
    tier: "silver",
    icon: "TrendingUpIcon",
    color: "text-gray-400",
    criteria: {
      type: "sections_completed",
      threshold: 42,
      description: "Complete 42 of 83 sections",
    },
    points: 300,
  },
  {
    id: "completion-master",
    name: "Completion Master",
    description: "Complete all 83 micro-sections",
    category: "progress",
    tier: "platinum",
    icon: "TrophyIcon",
    color: "text-yellow-500",
    criteria: {
      type: "sections_completed",
      threshold: 83,
      description: "Complete all 83 sections",
    },
    points: 1000,
  },

  // Streak Badges
  {
    id: "consistent-learner",
    name: "Consistent Learner",
    description: "Maintain a 3-day study streak",
    category: "streak",
    tier: "bronze",
    icon: "FlameIcon",
    color: "text-orange-400",
    criteria: {
      type: "streak_days",
      threshold: 3,
      description: "Study 3 days in a row",
    },
    points: 100,
  },
  {
    id: "week-warrior",
    name: "Week Warrior",
    description: "Maintain a 7-day study streak",
    category: "streak",
    tier: "silver",
    icon: "FlameIcon",
    color: "text-orange-500",
    criteria: {
      type: "streak_days",
      threshold: 7,
      description: "Study 7 days in a row",
    },
    points: 250,
  },
  {
    id: "unstoppable",
    name: "Unstoppable",
    description: "Maintain a 14-day study streak",
    category: "streak",
    tier: "gold",
    icon: "FlameIcon",
    color: "text-orange-600",
    criteria: {
      type: "streak_days",
      threshold: 14,
      description: "Study 14 days in a row",
    },
    points: 500,
  },
  {
    id: "legendary-streak",
    name: "Legendary Streak",
    description: "Maintain a 30-day study streak",
    category: "streak",
    tier: "platinum",
    icon: "FlameIcon",
    color: "text-red-500",
    criteria: {
      type: "streak_days",
      threshold: 30,
      description: "Study 30 days in a row",
    },
    points: 1000,
    hidden: true,
  },

  // Mastery Badges
  {
    id: "quiz-champion",
    name: "Quiz Champion",
    description: "Score 100% on any quiz",
    category: "mastery",
    tier: "bronze",
    icon: "BrainIcon",
    color: "text-green-500",
    criteria: {
      type: "quiz_perfect",
      threshold: 1,
      description: "Score 100% on 1 quiz",
    },
    points: 100,
  },
  {
    id: "domain-master",
    name: "Domain Master",
    description: "Achieve 90%+ mastery in any domain",
    category: "mastery",
    tier: "gold",
    icon: "StarIcon",
    color: "text-yellow-500",
    criteria: {
      type: "domain_mastery",
      threshold: 90,
      description: "90%+ mastery in 1 domain",
    },
    points: 400,
  },
  {
    id: "all-domain-master",
    name: "All-Domain Master",
    description: "Achieve 90%+ mastery in all 6 domains",
    category: "mastery",
    tier: "platinum",
    icon: "CrownIcon",
    color: "text-purple-500",
    criteria: {
      type: "all_domains_mastery",
      threshold: 90,
      description: "90%+ mastery in all domains",
    },
    points: 1500,
  },

  // Practice Badges
  {
    id: "practice-novice",
    name: "Practice Novice",
    description: "Complete 50 review questions",
    category: "practice",
    tier: "bronze",
    icon: "BookOpenIcon",
    color: "text-blue-400",
    criteria: {
      type: "questions_answered",
      threshold: 50,
      description: "Answer 50 questions",
    },
    points: 100,
  },
  {
    id: "practice-enthusiast",
    name: "Practice Enthusiast",
    description: "Complete 200 review questions",
    category: "practice",
    tier: "silver",
    icon: "BookOpenIcon",
    color: "text-blue-500",
    criteria: {
      type: "questions_answered",
      threshold: 200,
      description: "Answer 200 questions",
    },
    points: 300,
  },
  {
    id: "practice-master",
    name: "Practice Master",
    description: "Complete 500 review questions",
    category: "practice",
    tier: "gold",
    icon: "BookOpenIcon",
    color: "text-blue-600",
    criteria: {
      type: "questions_answered",
      threshold: 500,
      description: "Answer 500 questions",
    },
    points: 600,
  },
  {
    id: "mock-exam-ready",
    name: "Mock Exam Ready",
    description: "Pass a full mock exam with 80%+",
    category: "practice",
    tier: "gold",
    icon: "GraduationCapIcon",
    color: "text-indigo-500",
    criteria: {
      type: "mock_exam_pass",
      threshold: 80,
      description: "Score 80%+ on mock exam",
    },
    points: 500,
  },

  // Excellence Badges
  {
    id: "time-efficient",
    name: "Time Efficient",
    description: "Reach 20-hour study goal",
    category: "excellence",
    tier: "gold",
    icon: "ClockIcon",
    color: "text-purple-500",
    criteria: {
      type: "study_hours",
      threshold: 20,
      description: "Study for 20 hours total",
    },
    points: 400,
  },
  {
    id: "early-bird",
    name: "Early Bird",
    description: "Complete a study session before 8 AM",
    category: "excellence",
    tier: "bronze",
    icon: "SunriseIcon",
    color: "text-yellow-400",
    criteria: {
      type: "early_session",
      threshold: 1,
      description: "Study before 8 AM",
    },
    points: 50,
    hidden: true,
  },
  {
    id: "night-owl",
    name: "Night Owl",
    description: "Complete a study session after 10 PM",
    category: "excellence",
    tier: "bronze",
    icon: "MoonIcon",
    color: "text-indigo-400",
    criteria: {
      type: "late_session",
      threshold: 1,
      description: "Study after 10 PM",
    },
    points: 50,
    hidden: true,
  },
  {
    id: "weekend-warrior",
    name: "Weekend Warrior",
    description: "Study on both Saturday and Sunday",
    category: "excellence",
    tier: "silver",
    icon: "CalendarIcon",
    color: "text-green-500",
    criteria: {
      type: "weekend_study",
      threshold: 1,
      description: "Study on a weekend",
    },
    points: 150,
  },
];

// Points Calculation
export const POINTS = {
  // Learning Activities
  SECTION_COMPLETE: 50,
  QUIZ_PASS_80: 20,
  QUIZ_PASS_90: 30,
  QUIZ_PASS_100: 50,

  // Review Activities
  FLASHCARD_REVIEW: 5,
  QUESTION_REVIEW: 10,
  REVIEW_SESSION_COMPLETE: 25,

  // Practice Activities
  PRACTICE_QUESTION_CORRECT: 5,
  PRACTICE_QUESTION_INCORRECT: 1, // Participation credit
  PRACTICE_SET_COMPLETE: 50,
  MOCK_EXAM_COMPLETE: 100,
  MOCK_EXAM_PASS: 200, // Additional bonus

  // Engagement Bonuses
  DAILY_GOAL_MET: 15,
  WEEK_GOAL_MET: 100,
  FIRST_ACTIVITY_OF_DAY: 10,
};

// Helper Functions
export function getLevelFromPoints(points: number): Level {
  return (
    LEVELS.find((level) => points >= level.minPoints && points <= level.maxPoints) ||
    LEVELS[0]
  );
}

export function getNextLevel(currentPoints: number): Level | null {
  const currentLevel = getLevelFromPoints(currentPoints);
  const nextLevelId = currentLevel.id + 1;
  return LEVELS.find((level) => level.id === nextLevelId) || null;
}

export function getProgressToNextLevel(currentPoints: number): number {
  const currentLevel = getLevelFromPoints(currentPoints);
  const nextLevel = getNextLevel(currentPoints);

  if (!nextLevel) return 100; // Max level reached

  const levelRange = nextLevel.minPoints - currentLevel.minPoints;
  const currentProgress = currentPoints - currentLevel.minPoints;

  return Math.min((currentProgress / levelRange) * 100, 100);
}

export function getBadgesByCategory(category: BadgeCategory): Badge[] {
  return BADGES.filter((badge) => badge.category === category);
}

export function checkBadgeEligibility(
  badge: Badge,
  userStats: Record<string, number>
): boolean {
  const statValue = userStats[badge.criteria.type] || 0;
  return statValue >= badge.criteria.threshold;
}

export function calculateTotalPoints(earnedBadges: string[]): number {
  return BADGES.filter((badge) => earnedBadges.includes(badge.id)).reduce(
    (sum, badge) => sum + badge.points,
    0
  );
}
