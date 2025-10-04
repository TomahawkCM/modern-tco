"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { MDXProvider } from "@mdx-js/react";
import { StudyModuleWrapper } from "@/components/learning/StudyModuleWrapper";
import { StudyModuleViewer } from "@/components/study/StudyModuleViewer";
import { studyModuleService } from "@/services/studyModuleService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  BookOpen,
  Target,
  Clock,
  CheckCircle,
  AlertCircle,
  Trophy,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MDXWrapper, mdxComponents } from "@/components/mdx/MDXWrapper";
import { loadMDXContent, getMDXMetadata, type MDXModule } from "@/lib/mdx-loader";
import FlashcardDashboard from "@/components/flashcards/FlashcardDashboard";
import MicrolearningProgress from "@/components/study/MicrolearningProgress";

// Domain mapping - matches the TCODomain enum values from domainMapper.ts
const DOMAIN_CONFIG = {
  "platform-foundation": {
    title: "Tanium Platform Foundation",
    description: "Complete foundation for zero-knowledge students - understand architecture, terminology, and console basics",
    icon: "🏗️",
    difficulty: "Beginner",
    estimatedTime: "180 min",
    practiceRoute: "/practice/platform-foundation",
  },
  "asking-questions": {
    title: "Asking Questions",
    description: "Learn how to effectively query the Tanium platform for system information",
    icon: "❓",
    difficulty: "Beginner",
    estimatedTime: "45 min",
    practiceRoute: "/practice/asking-questions",
  },
  "refining-questions-targeting": {
    title: "Refining Questions and Targeting",
    description: "Master advanced filtering and targeting techniques for precise queries",
    icon: "🎯",
    difficulty: "Intermediate",
    estimatedTime: "90 min",
    practiceRoute: "/practice/refining-questions-targeting",
  },
  "taking-action-packages-actions": {
    title: "Taking Action",
    description: "Learn how to execute actions and deploy solutions using Tanium",
    icon: "⚡",
    difficulty: "Intermediate",
    estimatedTime: "120 min",
    practiceRoute: "/practice/taking-action-packages-actions",
  },
  "navigation-basic-modules": {
    title: "Navigation and Basic Module Functions",
    description: "Master the Tanium interface navigation and core module functionality",
    icon: "🧭",
    difficulty: "Intermediate",
    estimatedTime: "210 min",
    practiceRoute: "/practice/navigation-basic-modules",
  },
  "reporting-data-export": {
    title: "Report Generation and Data Export",
    description: "Learn to create reports and export data for analysis and compliance",
    icon: "📊",
    difficulty: "Intermediate",
    estimatedTime: "180 min",
    practiceRoute: "/practice/reporting-data-export",
  },
};

type DomainKey = keyof typeof DOMAIN_CONFIG;

export default function StudyDomainPage() {
  const params = useParams<{ domain?: string | string[] }>();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mdxModule, setMdxModule] = useState<MDXModule | null>(null);
  const [mdxMetadata, setMdxMetadata] = useState<any>(null);
  const [useDatabase, setUseDatabase] = useState(true);
  const [module, setModule] = useState<any>(null);

  const raw = (params?.domain ?? "");
  const domainSlug = Array.isArray(raw) ? raw[0] : raw;
  const domainConfig = domainSlug ? DOMAIN_CONFIG[domainSlug as DomainKey] : null;

  // ALL HOOKS MUST BE CALLED BEFORE ANY EARLY RETURNS (Rules of Hooks)
  useEffect(() => {
    // FORCE MDX LOADING - Database migration in progress
    const loadContent = async () => {
      try {
        setIsLoading(true);

        if (!domainSlug) {
          setError("Domain not found");
          setIsLoading(false);
          return;
        }

        // Load directly from MDX - world-class content ready to deploy
        const module = await loadMDXContent(domainSlug);

        if (module) {
          setUseDatabase(false);
          setMdxModule(module);
          setMdxMetadata(getMDXMetadata(module));
          console.log("✅ MDX Content loaded successfully:", {
            id: getMDXMetadata(module).id,
            title: getMDXMetadata(module).title,
            objectives: getMDXMetadata(module).objectives.length,
          });
          setIsLoading(false);
        } else {
          throw new Error(`No MDX content found for domain: ${domainSlug}`);
        }
      } catch (err) {
        console.error("Error loading MDX content:", err);
        setError(err instanceof Error ? err.message : "Failed to load MDX content");
        setIsLoading(false);
      }
    };

    void loadContent();
  }, [domainSlug]);

  // Early return AFTER all hooks are called (satisfies Rules of Hooks)
  if (!domainSlug) {
    if (typeof window !== "undefined") router.replace("/study");
    return null;
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "text-green-400 border-green-400 bg-green-900/20";
      case "Intermediate":
        return "text-yellow-400 border-yellow-400 bg-yellow-900/20";
      case "Advanced":
        return "text-red-400 border-red-400 bg-red-900/20";
      default:
        return "text-gray-400 border-gray-400 bg-gray-900/20";
    }
  };

  if (isLoading) {
    return (
      
        <div className="flex min-h-[60vh] items-center justify-center">
          <Card className="glass border-white/10 p-8">
            <div className="space-y-4 text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-tanium-accent"></div>
              <p className="text-white">Loading study content...</p>
            </div>
          </Card>
        </div>
      
    );
  }

  if (error || !domainConfig) {
    return (
      
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.push("/study")}
              className="border-white/20 text-white hover:bg-white/10"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Study
            </Button>
          </div>

          <Alert className="border-red-500 bg-red-900/20">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-200">
              <strong>Domain Not Found:</strong> The requested study domain "{domainSlug}" doesn't
              exist.
            </AlertDescription>
          </Alert>

          <div className="text-center">
            <h1 className="mb-4 text-2xl font-bold text-white">Study Domain Not Found</h1>
            <p className="mb-6 text-gray-300">
              The domain you're looking for doesn't exist or may have been moved.
            </p>
            <Button
              onClick={() => router.push("/study")}
              className="bg-tanium-accent hover:bg-blue-600"
            >
              Browse Available Domains
            </Button>
          </div>
        </div>
      
    );
  }

  // If using database content, render StudyModuleViewer
  if (useDatabase && module) {
    // Map domain slug to TCODomain enum
    const domainMapping: Record<string, any> = {
      'platform-foundation': 'PLATFORM_FOUNDATION',
      'asking-questions': 'ASKING_QUESTIONS',
      'refining-questions-targeting': 'REFINING_QUESTIONS',
      'refining-questions': 'REFINING_QUESTIONS',
      'taking-action': 'TAKING_ACTION',
      'navigation-modules': 'NAVIGATION_MODULES',
      'navigation-and-basic-module-functions': 'NAVIGATION_MODULES',
      'reporting-export': 'REPORTING_EXPORT',
      'report-generation-and-data-export': 'REPORTING_EXPORT',
    };

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button
            onClick={() => router.push("/study")}
            variant="outline"
            className="mb-4 border-white/20 text-white hover:bg-white/10"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Study Center
          </Button>
        </div>

        <StudyModuleViewer
          domain={domainMapping[domainSlug] || domainSlug}
          onComplete={() => {
            router.push("/study");
          }}
          onNavigateToQuestions={() => {
            router.push(`/practice/${domainSlug}`);
          }}
        />
      </div>
    );
  }

  const objectives = mdxMetadata?.objectives ?? [
    "Master natural language query construction and sensor library usage",
    "Learn saved question management and result interpretation techniques",
    "Understand query optimization and performance best practices"
  ];

  const estimatedTimeMinutes = domainConfig?.estimatedTime
    ? parseInt(domainConfig.estimatedTime.split(" ")[0]) || 45
    : 45;

  return (
    <StudyModuleWrapper
      moduleId={domainSlug}
      domainId={domainSlug}
      title={domainConfig.title}
      description={domainConfig.description}
      estimatedTime={estimatedTimeMinutes}
      objectives={objectives}
      prerequisites={[]}
    >
      <div className="space-y-6 max-w-full">

        {/* Microlearning Progress Tracker - Top Banner */}
        {mdxMetadata?.id && (
          <MicrolearningProgress
            moduleId={mdxMetadata.id}
            totalSections={8}
            estimatedMinutes={estimatedTimeMinutes}
          />
        )}

        {/* Study Content Viewer - Full Width */}
        <Card className="glass-card border-archon-border-bright/30">
          <CardHeader className="border-b border-archon-border/30">
            <CardTitle className="flex items-center gap-3 text-archon-text-primary">
              <div className="p-2 bg-archon-cyan-primary/20 rounded-lg">
                <BookOpen className="h-5 w-5 text-archon-cyan-bright" />
              </div>
              <span className="archon-text-glow">Study Content</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6 max-w-none">
              {/* MDX Content Rendering - Full Width with Archon Theme */}
              {mdxModule ? (
                <div className="rounded-lg border border-archon-border/50 bg-archon-bg-panel/50 p-6 backdrop-blur-sm">
                  <MDXProvider components={mdxComponents}>
                    <MDXWrapper>
                      <Suspense fallback={
                        <div className="text-archon-text-primary flex items-center gap-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-archon-cyan-bright border-t-transparent"></div>
                          Loading content...
                        </div>
                      }>
                        <mdxModule.default />
                      </Suspense>
                    </MDXWrapper>
                  </MDXProvider>
                </div>
              ) : (
                <div className="rounded-lg border border-archon-cyan-primary/30 bg-archon-cyan-primary/10 p-4">
                  <div className="mb-2 flex items-center gap-2 text-archon-cyan-bright">
                    <BookOpen className="h-4 w-4" />
                    <span className="font-medium">Study Content Loading</span>
                  </div>
                  <p className="text-sm text-archon-text-secondary">
                    {domainConfig.title} (
                    {domainConfig?.estimatedTime
                      ? Math.round((parseInt(domainConfig.estimatedTime.split(" ")[0]) || 45) * 0.22 * 100) / 100
                      : 10}
                    % exam weight) - {domainConfig.description}
                  </p>
                </div>
              )}

              {/* Active Recall Flashcards */}
              {mdxMetadata?.id && (
                <div className="mt-8">
                  <FlashcardDashboard moduleId={mdxMetadata.id} />
                </div>
              )}

              <div className="flex gap-4">
                <Button
                  onClick={() => router.push(domainConfig.practiceRoute)}
                  className="glass-button bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white border-green-400/30"
                >
                  <Target className="mr-2 h-4 w-4" />
                  Start Practice Questions
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="glass-card border-archon-border-bright/30">
          <CardHeader className="border-b border-archon-border/30">
            <CardTitle className="flex items-center gap-3 text-archon-text-primary">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
              <span>Ready for Practice?</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <p className="text-archon-text-secondary">
                Once you've completed this study module, reinforce your learning with practice
                questions specifically designed for this domain.
              </p>

              <div className="flex flex-wrap gap-4">
                <Button
                  onClick={() => router.push(domainConfig.practiceRoute)}
                  className="glass-button bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white border-green-400/30"
                >
                  <Target className="mr-2 h-4 w-4" />
                  Practice Questions
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  onClick={() => router.push("/study")}
                  className="border-archon-border-bright/30 text-archon-text-primary hover:bg-archon-cyan-primary/10 hover:text-archon-cyan-bright hover:border-archon-cyan-bright/50"
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  Browse Other Domains
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Study Tips for this Domain */}
        <Alert className="border-archon-cyan-primary/30 bg-archon-cyan-primary/10 backdrop-blur-sm">
          <div className="p-1.5 bg-archon-cyan-primary/20 rounded-md inline-block">
            <BookOpen className="h-4 w-4 text-archon-cyan-bright" />
          </div>
          <AlertDescription className="text-archon-text-secondary mt-2">
            <strong className="text-archon-cyan-bright">Study Tip:</strong> Take your time with each section and use the bookmark
            feature to save important concepts you want to review later. The practice questions will
            test your understanding of the key points covered in this module.
          </AlertDescription>
        </Alert>
      </div>
    </StudyModuleWrapper>
  );
}
