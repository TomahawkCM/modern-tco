"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { MDXProvider } from "@mdx-js/react";
import { StudyModuleWrapper } from "@/components/learning/StudyModuleWrapper";
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

// Domain mapping - matches the TCODomain enum values from domainMapper.ts
const DOMAIN_CONFIG = {
  "asking-questions": {
    title: "Asking Questions",
    description: "Learn how to effectively query the Tanium platform for system information",
    icon: "❓",
    difficulty: "Beginner",
    estimatedTime: "45 min",
    practiceRoute: "/practice/asking-questions",
  },
  "refining-questions": {
    title: "Refining Questions and Targeting",
    description: "Master advanced filtering and targeting techniques for precise queries",
    icon: "🎯",
    difficulty: "Intermediate",
    estimatedTime: "50 min",
    practiceRoute: "/practice/refining-questions",
  },
  "taking-action": {
    title: "Taking Action",
    description: "Learn how to execute actions and deploy solutions using Tanium",
    icon: "⚡",
    difficulty: "Intermediate",
    estimatedTime: "55 min",
    practiceRoute: "/practice/taking-action",
  },
  "navigation-modules": {
    title: "Navigation and Basic Module Functions",
    description: "Master the Tanium interface navigation and core module functionality",
    icon: "🧭",
    difficulty: "Beginner",
    estimatedTime: "40 min",
    practiceRoute: "/practice/navigation-modules",
  },
  "reporting-export": {
    title: "Report Generation and Data Export",
    description: "Learn to create reports and export data for analysis and compliance",
    icon: "📊",
    difficulty: "Intermediate",
    estimatedTime: "50 min",
    practiceRoute: "/practice/reporting-export",
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

  const raw = (params?.domain ?? "") as string | string[];
  const domainSlug = Array.isArray(raw) ? raw[0] : raw;
  if (!domainSlug) {
    if (typeof window !== "undefined") router.replace("/study");
    return null;
  }
  const domainConfig = DOMAIN_CONFIG[domainSlug as DomainKey];

  useEffect(() => {
    // Validate domain exists
    if (!domainConfig) {
      setError("Domain not found");
      setIsLoading(false);
      return;
    }

    // Load MDX content directly
    const loadContent = async () => {
      try {
        const module = await loadMDXContent(domainSlug);

        if (module) {
          setMdxModule(module);
          setMdxMetadata(getMDXMetadata(module));
          console.log("MDX Content loaded successfully:", {
            id: getMDXMetadata(module).id,
            title: getMDXMetadata(module).title,
            objectives: getMDXMetadata(module).objectives.length,
          });
        } else {
          throw new Error("Failed to load MDX content");
        }
        setIsLoading(false);
      } catch (err) {
        console.error("Error loading MDX content:", err);
        setError(err instanceof Error ? err.message : "Failed to load MDX content");
        setIsLoading(false);
      }
    };

    loadContent();
  }, [domainConfig, domainSlug]);

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

  const objectives = mdxMetadata?.objectives || [
    "Master natural language query construction and sensor library usage",
    "Learn saved question management and result interpretation techniques",
    "Understand query optimization and performance best practices"
  ];

  const estimatedTimeMinutes = parseInt(domainConfig.estimatedTime.split(" ")[0]) || 45;

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
      <div className="space-y-6">

        {/* Study Progress Overview */}
        <Card className="glass border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-white">
              <Trophy className="h-5 w-5 text-yellow-400" />
              Study Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center">
                <div className="mb-1 text-2xl font-bold text-tanium-accent">65%</div>
                <div className="text-sm text-gray-300">Completion</div>
              </div>
              <div className="text-center">
                <div className="mb-1 text-2xl font-bold text-green-400">5/7</div>
                <div className="text-sm text-gray-300">Sections Read</div>
              </div>
              <div className="text-center">
                <div className="mb-1 text-2xl font-bold text-blue-400">3</div>
                <div className="text-sm text-gray-300">Bookmarks</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Study Content Viewer */}
        <Card className="glass border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-white">
              <BookOpen className="h-5 w-5 text-blue-400" />
              Study Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* MDX Content Rendering */}
              {mdxModule ? (
                <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-6">
                  <MDXProvider components={mdxComponents}>
                    <MDXWrapper>
                      <Suspense fallback={<div className="text-white">Loading content...</div>}>
                        <mdxModule.default />
                      </Suspense>
                    </MDXWrapper>
                  </MDXProvider>
                </div>
              ) : (
                <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
                  <div className="mb-2 flex items-center gap-2 text-blue-300">
                    <BookOpen className="h-4 w-4" />
                    <span className="font-medium">Study Content Loading</span>
                  </div>
                  <p className="text-sm text-blue-200">
                    {domainConfig.title} (
                    {Math.round((domainConfig.estimatedTime?.split(" ")[0] as any) * 0.22 * 100) /
                      100}
                    % exam weight) - {domainConfig.description}
                  </p>
                </div>
              )}

              <div className="flex gap-4">
                <Button
                  onClick={() => router.push(domainConfig.practiceRoute)}
                  className="bg-green-600 hover:bg-green-700"
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
        <Card className="glass border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-white">
              <CheckCircle className="h-5 w-5 text-green-400" />
              Ready for Practice?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-300">
                Once you've completed this study module, reinforce your learning with practice
                questions specifically designed for this domain.
              </p>

              <div className="flex gap-4">
                <Button
                  onClick={() => router.push(domainConfig.practiceRoute)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Target className="mr-2 h-4 w-4" />
                  Practice Questions
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  onClick={() => router.push("/study")}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  Browse Other Domains
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Study Tips for this Domain */}
        <Alert className="border-blue-200 bg-blue-50/10 dark:border-blue-800 dark:bg-blue-900/20">
          <BookOpen className="h-4 w-4 text-blue-400" />
          <AlertDescription className="text-blue-200">
            <strong>Study Tip:</strong> Take your time with each section and use the bookmark
            feature to save important concepts you want to review later. The practice questions will
            test your understanding of the key points covered in this module.
          </AlertDescription>
        </Alert>
      </div>
    </StudyModuleWrapper>
  );
}
