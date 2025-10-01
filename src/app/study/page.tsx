"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { studyModuleService } from "@/services/studyModuleService";
import { supabase } from "@/lib/supabase";
import { StudyModeSelector } from "@/components/study/StudyModeSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  Target,
  Trophy,
  Clock,
  CheckCircle,
  ArrowRight,
  AlertCircle,
  Brain,
  Lightbulb,
  Play,
  GraduationCap,
  HelpCircle,
  Star,
  Sparkles,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

// TypeScript interface for study domains with beginner-friendly features
interface StudyDomain {
  id: string;
  title: string;
  description: string;
  icon: string;
  progress: number;
  totalSections: number;
  completedSections: number;
  estimatedTime: string;
  difficulty: "Foundation" | "Beginner" | "Intermediate" | "Advanced";
  status: "foundation" | "available" | "in_progress" | "almost-complete" | "completed";
  lastAccessed: string;
  isBeginnerFriendly: boolean;
  prerequisites?: string[];
  isFoundation?: boolean;
  beginnerBonus?: string;
  confidenceLevel?: "building" | "growing" | "strong";
  domain?: string;
  examWeight?: number;
}

// Domain icon mapping
const DOMAIN_ICONS: Record<string, string> = {
  "PLATFORM_FOUNDATION": "🎓",
  "Asking Questions": "❓",
  "Refining Questions & Targeting": "🎯",
  "Taking Action": "⚡",
  "NAVIGATION_MODULES": "🧭",
  "REPORTING_EXPORT": "📊",
};

// Domain difficulty mapping
const DOMAIN_DIFFICULTY: Record<string, "Foundation" | "Beginner" | "Intermediate" | "Advanced"> = {
  "PLATFORM_FOUNDATION": "Foundation",
  "Asking Questions": "Beginner",
  "Refining Questions & Targeting": "Intermediate",
  "Taking Action": "Intermediate",
  "NAVIGATION_MODULES": "Beginner",
  "REPORTING_EXPORT": "Intermediate",
};

// Placeholder for static domains - will be replaced by database data
const defaultStudyDomains: StudyDomain[] = [
  // PHASE 0: FOUNDATION (NEW FOR BEGINNERS)
  {
    id: "phase-0-foundation",
    title: "🌟 Phase 0: Foundation & Prerequisites",
    description: "NEW FOR BEGINNERS! Build your IT foundation with endpoint management basics, terminology, and confidence-building exercises - designed for complete newcomers",
    icon: "🎓",
    progress: 0,
    totalSections: 6,
    completedSections: 0,
    estimatedTime: "2-4 hours",
    difficulty: "Foundation",
    status: "foundation" as const,
    lastAccessed: "Never",
    isBeginnerFriendly: true,
    isFoundation: true,
    beginnerBonus: "Start here if you're completely new to IT security or Tanium!",
    confidenceLevel: "building",
  },
  
  // BEGINNER-FRIENDLY CORE DOMAINS (Reordered for beginners)
  {
    id: "tanium-fundamentals",
    title: "Tanium Fundamentals",
    description: "Core concepts, architecture, and foundational knowledge - perfect for beginners who completed Phase 0",
    icon: "📚",
    progress: 0,
    totalSections: 5,
    completedSections: 0,
    estimatedTime: "35 min",
    difficulty: "Beginner",
    status: "available" as const,
    lastAccessed: "Never",
    isBeginnerFriendly: true,
    prerequisites: ["Complete Phase 0: Foundation"],
    beginnerBonus: "Visual diagrams and simple explanations included!",
    confidenceLevel: "growing",
  },
  {
    id: "asking-questions",
    title: "Asking Questions",
    description: "Learn how to effectively query the Tanium platform for system information - with step-by-step examples",
    icon: "❓",
    progress: 0,
    totalSections: 7,
    completedSections: 0,
    estimatedTime: "45 min",
    difficulty: "Beginner",
    status: "available" as const,
    lastAccessed: "Never",
    isBeginnerFriendly: true,
    prerequisites: ["Complete Tanium Fundamentals"],
    beginnerBonus: "Interactive query builder with guided practice!",
    confidenceLevel: "growing",
  },
  
  // INTERMEDIATE DOMAINS (Available after mastering beginners)
  {
    id: "refining-questions",
    title: "Refining Questions and Targeting",
    description: "Master advanced filtering and targeting techniques for precise queries - builds on asking questions skills",
    icon: "🎯",
    progress: 0,
    totalSections: 8,
    completedSections: 0,
    estimatedTime: "50 min",
    difficulty: "Intermediate",
    status: "available" as const,
    lastAccessed: "Never",
    isBeginnerFriendly: false,
    prerequisites: ["Complete Asking Questions with 80%+ progress"],
    confidenceLevel: "strong",
  },
  {
    id: "investigate-deployment",
    title: "Investigate and Deploy",
    description: "Understand investigation workflows and deployment strategies - advanced operational procedures",
    icon: "🔍",
    progress: 0,
    totalSections: 9,
    completedSections: 0,
    estimatedTime: "60 min",
    difficulty: "Intermediate",
    status: "available" as const,
    lastAccessed: "Never",
    isBeginnerFriendly: false,
    prerequisites: ["Complete Refining Questions"],
    confidenceLevel: "strong",
  },
  
  // ADVANCED DOMAINS (For experienced learners)
  {
    id: "maintain-and-troubleshoot",
    title: "Maintain and Troubleshoot",
    description: "Learn system maintenance procedures and troubleshooting techniques - expert-level content",
    icon: "🔧",
    progress: 0,
    totalSections: 6,
    completedSections: 0,
    estimatedTime: "40 min",
    difficulty: "Advanced",
    status: "available" as const,
    lastAccessed: "Never",
    isBeginnerFriendly: false,
    prerequisites: ["Complete Investigate and Deploy"],
    confidenceLevel: "strong",
  },
];

export default function StudyPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"overview" | "domains">("overview");
  const [studyDomains, setStudyDomains] = useState<StudyDomain[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    void loadModules();
    void checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const loadModules = async () => {
    try {
      setIsLoading(true);

      // Get user ID for progress tracking
      const { data: { user } } = await supabase.auth.getUser();

      // Fetch modules with progress
      const modules = await studyModuleService.getModulesWithProgress(user?.id);

      // Get section counts for each module
      const modulesWithSections = await Promise.all(
        modules.map(async (module) => {
          const sections = await studyModuleService.getModuleSections(module.id);
          return { ...module, totalSections: sections.length };
        })
      );

      // Transform database modules to UI format
      const transformedDomains: StudyDomain[] = modulesWithSections.map((module, index) => {
        const progress = module.progress ?? 0;
        const completedSections = module.completedSections ?? 0;
        const totalSections = module.totalSections ?? 1;

        // Determine status based on progress
        let status: StudyDomain["status"] = "available";
        if (module.domain === "PLATFORM_FOUNDATION") {
          status = "foundation";
        } else if (progress >= 80) {
          status = "almost-complete";
        } else if (progress === 100) {
          status = "completed";
        } else if (progress > 0) {
          status = "in_progress";
        }

        // Determine beginner-friendliness and confidence level
        const difficulty = DOMAIN_DIFFICULTY[module.domain] || "Intermediate";
        const isBeginnerFriendly = difficulty === "Foundation" || difficulty === "Beginner";
        let confidenceLevel: "building" | "growing" | "strong" = "strong";
        if (difficulty === "Foundation") confidenceLevel = "building";
        else if (difficulty === "Beginner") confidenceLevel = "growing";

        return {
          id: module.id,
          title: module.title,
          description: module.description ?? "",
          icon: DOMAIN_ICONS[module.domain] || "\ud83d\udcda",
          progress,
          totalSections,
          completedSections,
          estimatedTime: module.estimated_time_minutes ? `${module.estimated_time_minutes} min` : "45 min",
          difficulty,
          status,
          lastAccessed: progress > 0 ? "Recently" : "Never",
          isBeginnerFriendly,
          prerequisites: index === 0 ? [] : index === 1 ? ["Complete Phase 0: Foundation"] : [`Complete ${modulesWithSections[index - 1].title}`],
          isFoundation: module.domain === "PLATFORM_FOUNDATION",
          beginnerBonus: isBeginnerFriendly ? "Interactive examples and guided practice!" : undefined,
          confidenceLevel,
          domain: module.domain,
          examWeight: module.exam_weight,
        };
      });

      // Sort domains to put foundation first, then by order
      transformedDomains.sort((a, b) => {
        if (a.isFoundation) return -1;
        if (b.isFoundation) return 1;
        return 0;
      });

      setStudyDomains(transformedDomains);
    } catch (error) {
      console.error("Error loading study modules:", error);
      // Fall back to default domains if database fails
      setStudyDomains(defaultStudyDomains);
    } finally {
      setIsLoading(false);
    }
  };

  const overallProgress = Math.round(
    studyDomains.reduce((acc, domain) => acc + domain.progress, 0) / studyDomains.length
  );

  const totalSections = studyDomains.reduce((acc, domain) => acc + domain.totalSections, 0);
  const completedSections = studyDomains.reduce((acc, domain) => acc + domain.completedSections, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-400 border-green-400 bg-green-900/20";
      case "almost-complete":
        return "text-blue-400 border-blue-400 bg-blue-900/20";
      case "in_progress":
        return "text-yellow-400 border-yellow-400 bg-yellow-900/20";
      case "foundation":
        return "text-cyan-400 border-cyan-400 bg-cyan-900/20";
      case "available":
        return "text-gray-400 border-gray-400 bg-gray-900/20";
      default:
        return "text-gray-400 border-gray-400 bg-gray-900/20";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "almost-complete":
        return "Almost Done";
      case "in_progress":
        return "In Progress";
      case "foundation":
        return "🌟 NEW!";
      case "available":
        return "Available";
      default:
        return "Available";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Foundation":
        return "text-cyan-400 bg-cyan-900/20 border-cyan-400";
      case "Beginner":
        return "text-green-400 bg-green-900/20 border-green-400";
      case "Intermediate":
        return "text-yellow-400 bg-yellow-900/20 border-yellow-400";
      case "Advanced":
        return "text-red-400 bg-red-900/20 border-red-400";
      default:
        return "text-gray-400 bg-gray-900/20 border-gray-400";
    }
  };

  const getConfidenceLevelIcon = (level?: string) => {
    switch (level) {
      case "building":
        return <Sparkles className="h-3 w-3 text-cyan-400" />;
      case "growing":
        return <Zap className="h-3 w-3 text-green-400" />;
      case "strong":
        return <Star className="h-3 w-3 text-yellow-400" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="text-gray-200">Loading study modules...</p>
        </div>
      </div>
    );
  }

  if (viewMode === "overview") {
  return (
        <div className="mx-auto max-w-6xl space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="mb-4 text-4xl font-bold text-white">TCO Study Center</h1>
            <p className="mb-4 text-xl text-gray-200">
              🌟 Now 100% beginner-friendly! Start with Phase 0: Foundation if you're new to IT security.
            </p>
            <p className="mb-8 text-lg text-gray-300">
              Master the fundamentals before practicing with questions - complete beginner path available!
            </p>
          </div>

          {/* Study Mode Selector */}
          <StudyModeSelector />

          {/* Quick Access */}
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <Brain className="h-6 w-6 text-tanium-accent" />
                Quick Study Access
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center gap-4">
                <Button
                  onClick={() => setViewMode("domains")}
                  className="bg-tanium-accent hover:bg-blue-600"
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  Browse Study Domains
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push("/practice")}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <Target className="mr-2 h-4 w-4" />
                  Skip to Practice
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      
  );
  }

  return (
    
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-white">Study Domains</h1>
            <p className="text-gray-200">
              Complete study modules to build your foundation knowledge
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setViewMode("overview")}
            className="border-white/20 text-white hover:bg-white/10"
          >
            Back to Overview
          </Button>
        </div>

        {/* Overall Progress */}
        <Card className="glass border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-white">
              <Trophy className="h-6 w-6 text-yellow-400" />
              Your Study Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="text-center">
                <div className="mb-2 text-3xl font-bold text-tanium-accent">{overallProgress}%</div>
                <div className="text-sm text-gray-300">Overall Progress</div>
              </div>
              <div className="text-center">
                <div className="mb-2 text-3xl font-bold text-green-400">
                  {completedSections}/{totalSections}
                </div>
                <div className="text-sm text-gray-300">Sections Complete</div>
              </div>
              <div className="text-center">
                <div className="mb-2 text-3xl font-bold text-yellow-400">~4h</div>
                <div className="text-sm text-gray-300">Time Remaining</div>
              </div>
            </div>
            <Progress
              value={overallProgress}
              className="mt-4 h-3"
              aria-label={`Overall study progress: ${overallProgress}%`}
            />
          </CardContent>
        </Card>

        {/* Study Domains Grid */}
        <div className="relative z-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {studyDomains.map((domain) => (
            <Card
              key={domain.id}
              className={cn(
                "glass cursor-pointer border-2 transition-all hover:border-opacity-50",
                getStatusColor(domain.status)
              )}
              onClick={() => {
                // Use domain slug for routing
                const domainSlug = domain.domain?.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-').replace(/_/g, '-') || domain.id;
                router.push(`/study/${domainSlug}`);
              }}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="mb-2 text-3xl">{domain.icon}</div>
                  <Badge
                    variant="outline"
                    className={cn("border-current text-xs", getDifficultyColor(domain.difficulty))}
                  >
                    {domain.difficulty}
                  </Badge>
                </div>
                <CardTitle className="text-lg leading-tight text-white">{domain.title}</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm leading-relaxed text-gray-300">{domain.description}</p>

                {/* Beginner-Friendly Indicators */}
                {domain.isBeginnerFriendly && (
                  <div className="flex items-center gap-2 rounded-md bg-green-900/20 p-2">
                    <GraduationCap className="h-4 w-4 text-green-400" />
                    <span className="text-xs text-green-300">Beginner-Friendly</span>
                    {domain.confidenceLevel && getConfidenceLevelIcon(domain.confidenceLevel)}
                  </div>
                )}

                {/* Foundation Special Indicator */}
                {domain.isFoundation && (
                  <div className="flex items-center gap-2 rounded-md bg-cyan-900/30 p-2 border border-cyan-400/20">
                    <Sparkles className="h-4 w-4 text-cyan-400" />
                    <span className="text-xs text-cyan-300 font-medium">🌟 PERFECT FOR COMPLETE BEGINNERS</span>
                  </div>
                )}

                {/* Beginner Bonus */}
                {domain.beginnerBonus && (
                  <div className="flex items-start gap-2 rounded-md bg-blue-900/20 p-2">
                    <Lightbulb className="mt-0.5 h-3 w-3 text-blue-400 shrink-0" />
                    <span className="text-xs text-blue-300 leading-relaxed">{domain.beginnerBonus}</span>
                  </div>
                )}

                {/* Prerequisites */}
                {domain.prerequisites && domain.prerequisites.length > 0 && (
                  <div className="flex items-start gap-2 rounded-md bg-orange-900/20 p-2">
                    <AlertCircle className="mt-0.5 h-3 w-3 text-orange-400 shrink-0" />
                    <div>
                      <span className="text-xs text-orange-300 font-medium">Prerequisites:</span>
                      <div className="text-xs text-orange-200 mt-1">
                        {domain.prerequisites.map((prereq, index) => (
                          <div key={index}>• {prereq}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Progress</span>
                    <span className="text-sm font-medium text-white">{domain.progress}%</span>
                  </div>
                  <Progress
                    value={domain.progress}
                    className="h-2"
                    aria-label={`${domain.title} progress: ${domain.progress}%`}
                  />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>
                      {domain.completedSections}/{domain.totalSections} sections
                    </span>
                    <span>{getStatusText(domain.status)}</span>
                  </div>
                </div>

                {/* Time & Last Accessed with Confidence Level */}
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{domain.estimatedTime}</span>
                    {domain.confidenceLevel && (
                      <span className="ml-2 flex items-center gap-1">
                        {getConfidenceLevelIcon(domain.confidenceLevel)}
                        <span className="text-xs capitalize">{domain.confidenceLevel}</span>
                      </span>
                    )}
                  </div>
                  <span>Last: {domain.lastAccessed}</span>
                </div>

                {/* Action Button */}
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    const domainSlug = domain.domain?.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-').replace(/_/g, '-') || domain.id;
                    router.push(`/study/${domainSlug}`);
                  }}
                  className="w-full"
                  variant={domain.progress > 0 ? "default" : "outline"}
                >
                  {domain.progress > 0 ? (
                    <>
                      <BookOpen className="mr-2 h-4 w-4" />
                      Continue Reading
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Start Learning
                    </>
                  )}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Study Tips for Beginners */}
        <Card className="glass border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-white">
              <GraduationCap className="h-5 w-5 text-green-400" />
              Study Tips for Success - Especially for Beginners!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex items-start gap-2">
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
                  <span>
                    <strong>🌟 NEW TO IT? Start with Phase 0:</strong> Complete beginners should 
                    start with the Foundation phase - it's designed specifically for you!
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
                  <span>
                    <strong>Follow the sequence:</strong> Complete domains in the recommended order
                    for best learning outcomes - prerequisites are clearly marked
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
                  <span>
                    <strong>Take notes:</strong> Use the built-in bookmark feature to save important
                    concepts and terminology
                  </span>
                </div>
              </div>
              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex items-start gap-2">
                  <Zap className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
                  <span>
                    <strong>Build confidence gradually:</strong> Each module includes confidence-building
                    exercises and beginner bonuses to help you succeed
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-400" />
                  <span>
                    <strong>Practice early:</strong> Test your knowledge with questions after
                    completing each domain - start simple and progress
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
                  <span>
                    <strong>Review regularly:</strong> Revisit completed sections before taking mock
                    exams - repetition builds mastery
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    
  );
}
