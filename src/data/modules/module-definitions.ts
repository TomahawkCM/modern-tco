import { TCODomain } from "@/types/exam";
import { TCOVideo } from "@/components/video/TCOVideoPlayer";

export interface ModuleObjective {
  id: string;
  text: string;
  completed?: boolean;
}

export interface ModuleSection {
  id: string;
  title: string;
  content: string;
  estimatedTime: number; // minutes
  completed?: boolean;
  exercises?: Array<{
    id: string;
    title: string;
    type: "quiz" | "practice" | "simulation";
    completed?: boolean;
  }>;
  video?: TCOVideo;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  icon: string;
  domain: TCODomain;
  estimatedTime: string;
  totalMinutes: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  prerequisites?: string[];
  objectives: ModuleObjective[];
  sections: ModuleSection[];
  tags: string[];
  examWeight?: number;
  videos?: TCOVideo[];
  primaryVideo?: TCOVideo;
}

export interface ModuleProgress {
  moduleId: string;
  sectionsCompleted: number;
  totalSections: number;
  objectivesCompleted: number;
  totalObjectives: number;
  timeSpent: number; // minutes
  lastAccessed: Date;
  completed: boolean;
  score?: number;
  startedAt?: string | Date;
  completedAt?: string | Date;
  lastAccessedAt?: string | Date;
  completedObjectives?: string[];
  currentSectionIndex?: number;
  videosWatched?: string[];
  videoProgress?: { [videoId: string]: number };
  totalVideoWatchTime?: number;
}

// Complete module definitions based on js/modules.js
export const moduleDefinitions: Module[] = [
  {
    id: "navigation_basic_functions",
    title: "Navigation and Basic Module Functions",
    description:
      "Platform navigation, module functions, content management, and system diagnostics",
    icon: "🧭",
    domain: TCODomain.NAVIGATION_MODULES,
    estimatedTime: "90 min",
    totalMinutes: 90,
    difficulty: "Beginner",
    examWeight: 23,
    objectives: [
      {
        id: "obj-1",
        text: "Navigate Tanium's platform interface and understand linear chain architecture",
      },
      {
        id: "obj-2",
        text: "Use basic module functions and platform navigation",
      },
      {
        id: "obj-3",
        text: "Manage content sets, signing, and approval workflows",
      },
      {
        id: "obj-4",
        text: "Monitor system health and perform basic diagnostics",
      },
      {
        id: "obj-5",
        text: "Configure RBAC, computer groups, and security fundamentals",
      },
    ],
    sections: [
      {
        id: "section-1",
        title: "Platform Navigation and Basic Functions",
        content:
          "Navigating the Tanium console, understanding module functions and interface components",
        estimatedTime: 25,
      },
      {
        id: "section-2",
        title: "Content Management and Approval Workflows",
        content:
          "Managing content sets, signing processes, approval workflows, and content governance",
        estimatedTime: 30,
      },
      {
        id: "section-3",
        title: "System Health and Basic Diagnostics",
        content: "Monitoring system health, basic troubleshooting, and platform diagnostics",
        estimatedTime: 20,
      },
      {
        id: "section-4",
        title: "RBAC and Security Fundamentals",
        content: "Role-based access control, computer groups, and basic security configuration",
        estimatedTime: 15,
      },
    ],
    tags: ["navigation", "modules", "content-management", "health", "diagnostics", "rbac"],
  },

  {
    id: "asking_questions",
    title: "Asking Questions",
    description: "Natural language questions, sensors, saved questions, and query construction",
    icon: "❓",
    domain: TCODomain.ASKING_QUESTIONS,
    estimatedTime: "60 min",
    totalMinutes: 60,
    difficulty: "Beginner",
    examWeight: 22,
    objectives: [
      {
        id: "obj-1",
        text: "Create effective questions using natural language syntax",
      },
      {
        id: "obj-2",
        text: "Understand sensors, parameters, and question components",
      },
      {
        id: "obj-3",
        text: "Use saved questions and filtering techniques",
      },
      {
        id: "obj-4",
        text: "Execute packages and actions from question results",
      },
      {
        id: "obj-5",
        text: "Apply sensor best practices and troubleshooting",
      },
    ],
    sections: [
      {
        id: "section-1",
        title: "Natural Language Questions",
        content: "How to construct effective questions using Tanium's natural language interface",
        estimatedTime: 20,
      },
      {
        id: "section-2",
        title: "Sensors and Parameters",
        content: "Understanding built-in sensors, creating custom sensors, and using parameters",
        estimatedTime: 20,
      },
      {
        id: "section-3",
        title: "Saved Questions and Filtering",
        content: "Managing saved questions, applying filters, and organizing your question library",
        estimatedTime: 20,
      },
    ],
    tags: ["interact", "questions", "sensors", "natural-language"],
  },

  {
    id: "taking_action",
    title: "Taking Action",
    description: "Package deployment, action management, deployment workflows, and troubleshooting",
    icon: "⚡",
    domain: TCODomain.TAKING_ACTION,
    estimatedTime: "80 min",
    totalMinutes: 80,
    difficulty: "Intermediate",
    examWeight: 15,
    objectives: [
      {
        id: "obj-1",
        text: "Deploy packages and execute actions effectively",
      },
      {
        id: "obj-2",
        text: "Configure deployment workflows and scheduling",
      },
      {
        id: "obj-3",
        text: "Monitor action status and troubleshoot deployment failures",
      },
      {
        id: "obj-4",
        text: "Manage patch deployment and enterprise workflows",
      },
      {
        id: "obj-5",
        text: "Handle action locks, conflicts, and rollback procedures",
      },
    ],
    sections: [
      {
        id: "section-1",
        title: "Package Deployment and Actions",
        content: "Understanding package components, deploying actions, and basic action management",
        estimatedTime: 25,
      },
      {
        id: "section-2",
        title: "Enterprise Deployment Workflows",
        content: "Advanced deployment strategies, scheduling, patch management, and coordination",
        estimatedTime: 30,
      },
      {
        id: "section-3",
        title: "Action Monitoring and Troubleshooting",
        content: "Monitoring deployment progress, diagnosing failures, and handling rollbacks",
        estimatedTime: 25,
      },
    ],
    tags: ["packages", "actions", "deployment", "workflows", "patches", "troubleshooting"],
  },

  {
    id: "refining_questions",
    title: "Refining Questions",
    description: "Question refinement, targeting, filters, dynamic groups, and scoping strategies",
    icon: "🔍",
    domain: TCODomain.REFINING_QUESTIONS,
    estimatedTime: "50 min",
    totalMinutes: 50,
    difficulty: "Intermediate",
    examWeight: 23,
    objectives: [
      {
        id: "obj-1",
        text: "Create dynamic and static computer groups",
      },
      {
        id: "obj-2",
        text: "Configure filters and scoping rules",
      },
      {
        id: "obj-3",
        text: "Implement least privilege access patterns",
      },
      {
        id: "obj-4",
        text: "Manage group memberships and updates",
      },
      {
        id: "obj-5",
        text: "Optimize targeting for performance",
      },
    ],
    sections: [
      {
        id: "section-1",
        title: "Computer Groups",
        content: "Creating and managing dynamic and static computer groups for efficient targeting",
        estimatedTime: 15,
      },
      {
        id: "section-2",
        title: "Advanced Filtering",
        content: "Complex filter expressions, boolean logic, and performance considerations",
        estimatedTime: 15,
      },
      {
        id: "section-3",
        title: "Least Privilege Access",
        content: "Implementing security best practices and least privilege access patterns",
        estimatedTime: 10,
      },
    ],
    tags: ["targeting", "groups", "filters", "security"],
  },

  {
    id: "report_generation_export",
    title: "Report Generation and Data Export",
    description:
      "Report generation, data export methods, Connect integration, and automated reporting",
    icon: "📊",
    domain: TCODomain.REPORTING_EXPORT,
    estimatedTime: "45 min",
    totalMinutes: 45,
    difficulty: "Intermediate",
    examWeight: 17,
    objectives: [
      {
        id: "obj-1",
        text: "Export data in various formats for analysis",
      },
      {
        id: "obj-2",
        text: "Understand Connect integration basics",
      },
      {
        id: "obj-3",
        text: "Create basic reports and dashboards",
      },
      {
        id: "obj-4",
        text: "Schedule automated data exports",
      },
      {
        id: "obj-5",
        text: "Implement data governance and retention",
      },
    ],
    sections: [
      {
        id: "section-1",
        title: "Data Export Methods",
        content: "Various methods for exporting Tanium data for analysis and integration",
        estimatedTime: 15,
      },
      {
        id: "section-2",
        title: "Connect Integration",
        content: "Understanding Tanium Connect for third-party integrations and data feeds",
        estimatedTime: 10,
      },
      {
        id: "section-3",
        title: "Reporting & Dashboards",
        content: "Creating reports, dashboards, and automated data export schedules",
        estimatedTime: 10,
      },
    ],
    tags: ["reporting", "export", "connect", "dashboards"],
  },

  {
    id: "exam_strategy",
    title: "Exam Strategy",
    description: "TCO exam preparation, test-taking strategies, and certification overview",
    icon: "📝",
    domain: TCODomain.ASKING_QUESTIONS, // General exam prep covers all domains
    estimatedTime: "20 min",
    totalMinutes: 20,
    difficulty: "Beginner",
    examWeight: 0, // Meta-learning, not exam content
    objectives: [
      {
        id: "obj-1",
        text: "Understand TCO exam format and structure",
      },
      {
        id: "obj-2",
        text: "Apply effective test-taking strategies",
      },
      {
        id: "obj-3",
        text: "Manage exam time and stress effectively",
      },
      {
        id: "obj-4",
        text: "Review certification requirements and process",
      },
      {
        id: "obj-5",
        text: "Plan ongoing professional development",
      },
    ],
    sections: [
      {
        id: "section-1",
        title: "Exam Overview",
        content: "Understanding the TCO certification exam format, question types, and scoring",
        estimatedTime: 10,
      },
      {
        id: "section-2",
        title: "Test-Taking Strategies",
        content:
          "Effective strategies for multiple choice questions, time management, and stress reduction",
        estimatedTime: 10,
      },
    ],
    tags: ["exam", "strategy", "certification", "preparation"],
  },
];

// Export the modules array for external use
export const modules = moduleDefinitions;

// Export learningModules as an alias for compatibility
export const learningModules = moduleDefinitions;

// Utility functions for module management
export const getModuleById = (id: string): Module | undefined => {
  return moduleDefinitions.find((module) => module.id === id);
};

export const getModulesByDomain = (domain: TCODomain): Module[] => {
  return moduleDefinitions.filter((module) => module.domain === domain);
};

export const getTotalStudyTime = (): number => {
  return moduleDefinitions.reduce((total, module) => total + module.totalMinutes, 0);
};

export const getModuleProgress = (moduleId: string): ModuleProgress => {
  // This would typically come from localStorage or context
  // Returning default for now
  const moduleData = getModuleById(moduleId);
  if (!moduleData) {
    throw new Error(`Module ${moduleId} not found`);
  }

  return {
    moduleId,
    sectionsCompleted: 0,
    totalSections: moduleData.sections.length,
    objectivesCompleted: 0,
    totalObjectives: moduleData.objectives.length,
    timeSpent: 0,
    lastAccessed: new Date(),
    completed: false,
  };
};
