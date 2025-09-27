"use client";

import { BookOpen, Clock, Target } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Local module data for fallback
const localModules = [
  {
    id: "local-asking-questions",
    title: "Asking Questions",
    domain: "asking-questions",
    description:
      "Master the art of querying the Tanium platform with natural language and advanced sensor usage.",
    exam_weight: 22,
    estimated_time_minutes: 180,
    difficulty_level: "Intermediate",
    sections: [
      { title: "Natural Language Queries", estimated_time_minutes: 45 },
      { title: "Sensor Library Mastery", estimated_time_minutes: 60 },
      { title: "Saved Questions", estimated_time_minutes: 45 },
      { title: "Query Optimization", estimated_time_minutes: 30 },
    ],
  },
  {
    id: "local-refining-targeting",
    title: "Refining Questions & Targeting",
    domain: "refining-questions",
    description:
      "Advanced targeting techniques using computer groups, filters, and scope management.",
    exam_weight: 23,
    estimated_time_minutes: 195,
    difficulty_level: "Advanced",
    sections: [
      { title: "Dynamic Computer Groups", estimated_time_minutes: 60 },
      { title: "Static Computer Groups", estimated_time_minutes: 45 },
      { title: "Complex Filtering", estimated_time_minutes: 60 },
      { title: "Targeting Strategies", estimated_time_minutes: 30 },
    ],
  },
  {
    id: "local-taking-action",
    title: "Taking Action",
    domain: "taking-action",
    description: "Safe and effective action deployment with comprehensive approval workflows.",
    exam_weight: 15,
    estimated_time_minutes: 150,
    difficulty_level: "Intermediate",
    sections: [
      { title: "Package Selection", estimated_time_minutes: 45 },
      { title: "Deployment Procedures", estimated_time_minutes: 60 },
      { title: "Approval Workflows", estimated_time_minutes: 30 },
      { title: "Troubleshooting Actions", estimated_time_minutes: 15 },
    ],
  },
  {
    id: "local-navigation-modules",
    title: "Navigation & Module Functions",
    domain: "navigation-modules",
    description:
      "Platform navigation and core module operations for efficient workflow management.",
    exam_weight: 23,
    estimated_time_minutes: 210,
    difficulty_level: "Intermediate",
    sections: [
      { title: "Console Navigation", estimated_time_minutes: 45 },
      { title: "Interact Module", estimated_time_minutes: 45 },
      { title: "Deploy Module", estimated_time_minutes: 45 },
      { title: "Asset & Patch Modules", estimated_time_minutes: 45 },
      { title: "Threat Response", estimated_time_minutes: 30 },
    ],
  },
  {
    id: "local-reporting-export",
    title: "Reporting & Data Export",
    domain: "reporting-export",
    description: "Comprehensive reporting solutions and automated data export systems.",
    exam_weight: 17,
    estimated_time_minutes: 165,
    difficulty_level: "Beginner",
    sections: [
      { title: "Report Creation", estimated_time_minutes: 60 },
      { title: "Export Formats", estimated_time_minutes: 45 },
      { title: "Automation & Scheduling", estimated_time_minutes: 45 },
      { title: "Data Integrity", estimated_time_minutes: 15 },
    ],
  },
];

export function ModulesPage() {
  const router = useRouter();
  
  const toSlug = (domain: string) => domain.replace(/_/g, "-");

  // Calculate overall progress (placeholder - will integrate with real progress system)
  const overallProgress = 0; // TODO: Connect to actual progress tracking
  const completedModules = 0;
  const totalStudyTime = Math.round(
    localModules.reduce((acc, m) => acc + m.estimated_time_minutes, 0) / 60
  );

  return (
    <div className="container mx-auto px-4 py-8">
        {/* Enhanced Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-5xl font-bold text-white">TCO Study Center</h1>
          <p className="mx-auto max-w-3xl text-xl text-blue-200">
            🌟 Unified study experience! Master the Tanium Certified Operator certification 
            with comprehensive modules, progress tracking, and beginner-friendly content.
          </p>
          <p className="mx-auto max-w-2xl text-lg text-gray-300 mt-4">
            Each module aligns with the official exam blueprint. Start with foundations if you're new!
          </p>
        </div>

        {/* Progress Overview - New Feature */}
        <div className="mb-8 rounded-lg bg-white/5 p-6 backdrop-blur-sm">
          <h2 className="mb-4 text-2xl font-bold text-white flex items-center gap-2">
            <Target className="h-6 w-6 text-cyan-400" />
            Your Learning Progress
          </h2>
          <div className="grid grid-cols-1 gap-6 text-center md:grid-cols-4">
            <div>
              <div className="mb-2 text-3xl font-bold text-cyan-400">{overallProgress}%</div>
              <div className="text-gray-300">Overall Progress</div>
            </div>
            <div>
              <div className="mb-2 text-3xl font-bold text-green-400">
                {completedModules}/{localModules.length}
              </div>
              <div className="text-gray-300">Modules Complete</div>
            </div>
            <div>
              <div className="mb-2 text-3xl font-bold text-yellow-400">{totalStudyTime}h</div>
              <div className="text-gray-300">Total Study Time</div>
            </div>
            <div>
              <div className="mb-2 text-3xl font-bold text-blue-400">100%</div>
              <div className="text-gray-300">Exam Coverage</div>
            </div>
          </div>
        </div>

        {/* Study Modules Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {localModules.map((module, index) => (
            <div
              key={module.id}
              className="group rounded-lg border border-white/20 bg-white/10 backdrop-blur-sm transition-all duration-300 hover:border-green-400/50"
            >
              <div className="p-6">
                <div className="mb-4 flex items-start justify-between">
                  <div className="rounded-lg bg-green-500/20 p-3 transition-colors group-hover:bg-green-500/30">
                    <BookOpen className="h-6 w-6 text-green-400" />
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-green-300">
                      {module.exam_weight}% Exam Weight
                    </span>
                    <div className="mt-1 text-xs text-gray-400">{module.difficulty_level}</div>
                  </div>
                </div>

                <h3 className="mb-2 text-xl font-bold text-white transition-colors group-hover:text-green-300">
                  {module.title}
                </h3>

                <p className="mb-4 text-sm text-gray-300">{module.description}</p>

                <div className="mb-4 flex items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{Math.round(module.estimated_time_minutes / 60)}h</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Target className="h-4 w-4" />
                    <span>{module.sections.length} sections</span>
                  </div>
                </div>

                <Link
                  href={`/modules/${toSlug(module.domain)}`}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
                >
                  Start Learning
                  <BookOpen className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="mt-12 rounded-lg bg-white/5 p-6 backdrop-blur-sm">
          <div className="grid grid-cols-1 gap-6 text-center md:grid-cols-4">
            <div>
              <div className="mb-2 text-3xl font-bold text-blue-400">
                {localModules.length}
              </div>
              <div className="text-gray-300">Total Modules</div>
            </div>
            <div>
              <div className="mb-2 text-3xl font-bold text-green-400">
                {Math.round(
                  localModules.reduce((acc, m) => acc + m.estimated_time_minutes, 0) / 60
                )}h
              </div>
              <div className="text-gray-300">Study Time</div>
            </div>
            <div>
              <div className="mb-2 text-3xl font-bold text-cyan-400">
                {localModules.reduce((acc, m) => acc + m.sections.length, 0)}
              </div>
              <div className="text-gray-300">Total Sections</div>
            </div>
            <div>
              <div className="mb-2 text-3xl font-bold text-yellow-400">100%</div>
              <div className="text-gray-300">Exam Coverage</div>
            </div>
          </div>
        </div>
    </div>
  );
}