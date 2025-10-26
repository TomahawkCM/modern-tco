"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Clock,
  Target,
  ArrowRight,
  GraduationCap,
  Lightbulb,
  CheckCircle2,
} from "lucide-react";

// Module configuration with all 6 study modules
const STUDY_MODULES = [
  {
    slug: "platform-foundation",
    title: "Tanium Platform Foundation",
    description: "Complete foundation for zero-knowledge students - understand architecture, terminology, and console basics",
    icon: "🏗️",
    difficulty: "Beginner",
    estimatedTime: "180 min",
    examWeight: "0%",
    order: 0,
    objectives: [
      "Understand Tanium's linear chain architecture",
      "Master essential platform terminology",
      "Navigate the Tanium console interface",
    ],
  },
  {
    slug: "asking-questions",
    title: "Asking Questions",
    description: "Master the art of querying in Tanium - construct effective queries and interpret results",
    icon: "❓",
    difficulty: "Beginner",
    estimatedTime: "45 min",
    examWeight: "22%",
    order: 1,
    objectives: [
      "Construct effective natural language queries",
      "Master the 500+ built-in sensors",
      "Manage saved questions lifecycle",
    ],
  },
  {
    slug: "refining-questions-targeting",
    title: "Refining Questions and Targeting",
    description: "Master advanced filtering and targeting techniques for precise queries",
    icon: "🎯",
    difficulty: "Intermediate",
    estimatedTime: "90 min",
    examWeight: "23%",
    order: 2,
    objectives: [
      "Apply advanced filtering techniques",
      "Target specific computer groups",
      "Optimize query performance",
    ],
  },
  {
    slug: "taking-action-packages-actions",
    title: "Taking Action",
    description: "Learn how to execute actions and deploy solutions using Tanium packages",
    icon: "⚡",
    difficulty: "Intermediate",
    estimatedTime: "120 min",
    examWeight: "15%",
    order: 3,
    objectives: [
      "Deploy packages safely to endpoints",
      "Create and manage actions",
      "Monitor action execution status",
    ],
  },
  {
    slug: "navigation-basic-modules",
    title: "Navigation and Basic Module Functions",
    description: "Master the Tanium interface navigation and core module functionality",
    icon: "🧭",
    difficulty: "Intermediate",
    estimatedTime: "210 min",
    examWeight: "23%",
    order: 4,
    objectives: [
      "Navigate the Tanium console efficiently",
      "Use essential modules (Comply, Patch, etc.)",
      "Manage user roles and permissions",
    ],
  },
  {
    slug: "reporting-data-export",
    title: "Report Generation and Data Export",
    description: "Learn to create reports and export data for analysis and compliance",
    icon: "📊",
    difficulty: "Intermediate",
    estimatedTime: "180 min",
    examWeight: "17%",
    order: 5,
    objectives: [
      "Create and schedule reports",
      "Export data in multiple formats",
      "Build dashboards for stakeholders",
    ],
  },
];

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "Beginner":
      return "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-[#22c55e]";
    case "Intermediate":
      return "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950 dark:text-[#f97316]";
    case "Advanced":
      return "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300";
    default:
      return "border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-800 dark:bg-gray-950 dark:text-muted-foreground";
  }
};

export default function StudyPage() {
  const router = useRouter();

  const totalTime = STUDY_MODULES.reduce((acc, module) => {
    return acc + parseInt(module.estimatedTime.split(" ")[0]);
  }, 0);

  return (
    <div className="container mx-auto max-w-7xl space-y-8 px-4 py-8">
      {/* Hero Section */}
      <div className="space-y-4 text-center">
        <div className="flex items-center justify-center gap-3">
          <GraduationCap className="h-12 w-12 text-blue-600" />
          <h1 className="text-4xl font-bold text-foreground">Tanium TCO Study Center</h1>
        </div>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          World-class certification preparation with 11.6 hours of comprehensive study content.
          Master the Tanium platform with learning science-based modules.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/10 px-4 py-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <div className="text-left">
              <div className="text-sm font-medium text-primary">6 Core Modules</div>
              <div className="text-xs text-primary/80">Complete curriculum</div>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-[#22c55e]/20 bg-[#22c55e]/10 px-4 py-2">
            <Clock className="h-5 w-5 text-[#22c55e]" />
            <div className="text-left">
              <div className="text-sm font-medium text-[#22c55e]">
                {Math.floor(totalTime / 60)}h {totalTime % 60}m Total
              </div>
              <div className="text-xs text-[#22c55e]/80">Estimated time</div>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-accent/20 bg-accent/10 px-4 py-2">
            <Target className="h-5 w-5 text-accent-foreground" />
            <div className="text-left">
              <div className="text-sm font-medium text-accent-foreground">85%+ Pass Rate</div>
              <div className="text-xs text-accent-foreground/80">Expected outcome</div>
            </div>
          </div>
        </div>
      </div>

      {/* Learning Path Notice */}
      <Card className="border-primary/20 bg-gradient-to-r from-blue-500/10 to-indigo-500/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Lightbulb className="h-5 w-5 text-primary" />
            Recommended Learning Path
          </CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground">
          <p className="mb-3">
            <strong className="text-primary">New to Tanium?</strong> Start with the Platform Foundation module for a
            complete introduction. Then progress through each module in order.
          </p>
          <p className="text-sm text-muted-foreground">
            Each module includes interactive examples, practice questions, and active recall
            flashcards for optimal retention.
          </p>
        </CardContent>
      </Card>

      {/* Module Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {STUDY_MODULES.map((module) => (
          <Card
            key={module.slug}
            className="group cursor-pointer border-white/10 bg-card/50 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-blue-500/10"
            onClick={() => router.push(`/study/${module.slug}`)}
          >
            <CardHeader>
              <div className="mb-2 flex items-start justify-between">
                <span className="text-3xl">{module.icon}</span>
                <Badge variant="outline" className={getDifficultyColor(module.difficulty)}>
                  {module.difficulty}
                </Badge>
              </div>
              <CardTitle className="text-xl text-foreground group-hover:text-primary">
                {module.title}
              </CardTitle>
              <CardDescription className="line-clamp-2 text-muted-foreground">
                {module.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {module.estimatedTime}
                  </span>
                  {module.examWeight !== "0%" && (
                    <span className="font-medium text-primary">{module.examWeight} exam</span>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">Learning Objectives:</p>
                {module.objectives.slice(0, 2).map((objective, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="mt-0.5 h-3 w-3 flex-shrink-0 text-[#22c55e]" />
                    <span>{objective}</span>
                  </div>
                ))}
                {module.objectives.length > 2 && (
                  <p className="text-xs text-muted-foreground">
                    +{module.objectives.length - 2} more objectives
                  </p>
                )}
              </div>

              <Button className="w-full bg-blue-600 hover:bg-blue-700 group-hover:bg-primary">
                Start Learning
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bottom CTA */}
      <Card className="border-[#22c55e]/20 bg-gradient-to-r from-green-500/10 to-emerald-500/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#22c55e]">
            <Target className="h-5 w-5 text-[#22c55e]" />
            Ready to Get Started?
          </CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground">
          <p className="mb-4">
            Begin your journey to Tanium TCO certification. All modules are ready with
            enterprise-grade content, interactive examples, and spaced repetition for maximum
            retention.
          </p>
          <Button
            onClick={() => router.push("/study/platform-foundation")}
            className="bg-[#22c55e] hover:bg-green-700"
          >
            Start with Platform Foundation
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
