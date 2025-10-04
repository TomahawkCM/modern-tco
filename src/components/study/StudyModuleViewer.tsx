"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BookOpen,
  Clock,
  CheckCircle2,
  Circle,
  ChevronRight,
  ChevronLeft,
  BookMarked,
  Target,
  FileText,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { StudyModule, StudySection, type UserStudyProgress } from "@/types/study";
import type { TCODomain } from "@/types/exam";
import {
  getStudyModuleByDomain,
  type StudyModuleContent,
  type StudySectionContent,
} from "@/data/study-content";
import ReactMarkdown from "react-markdown";
import ModuleFlashcardPrompt from "@/components/study/ModuleFlashcardPrompt";

interface StudyModuleViewerProps {
  domain: TCODomain;
  onComplete?: () => void;
  onNavigateToQuestions?: () => void;
}

export function StudyModuleViewer({
  domain,
  onComplete,
  onNavigateToQuestions,
}: StudyModuleViewerProps) {
  const [module, setModule] = useState<StudyModuleContent | null>(null);
  const [sections, setSections] = useState<StudySectionContent[]>([]);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [userProgress, setUserProgress] = useState<UserStudyProgress | null>(null);
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);
  const [contentLoaded, setContentLoaded] = useState(false);

  // Use ref to persist loading state across Fast Refresh
  const loadingRef = useRef({ isLoadingData: false, hasLoaded: false });
  const domainRef = useRef<string | null>(null);

  useEffect(() => {
    void loadStudyContent();
  }, [domain]);

  useEffect(() => {
    if (sections.length > 0) {
      void loadUserProgress();
    }
  }, [sections, usingFallback]);

  const loadStudyContent = async () => {
    // Check if we're already loading for this domain or if content is already loaded
    if (
      loadingRef.current.isLoadingData ||
      (loadingRef.current.hasLoaded && domainRef.current === domain) ||
      (contentLoaded && module && sections.length > 0)
    ) {
      console.log("⚠️ Skipping loadStudyContent - already loaded or loading");
      setIsLoading(false);
      return;
    }

    // Reset for new domain
    if (domainRef.current !== domain) {
      loadingRef.current.hasLoaded = false;
      domainRef.current = domain;
    }

    loadingRef.current.isLoadingData = true;

    try {
      console.log("🔄 Starting loadStudyContent for domain:", domain);
      setIsLoading(true);
      setError(null);

      // Try to load from database first
      try {
        // Try multiple domain formats to match database
        const domainVariants = [
          domain,
          domain.replace(/-/g, '_').toUpperCase(),
          domain.split('-').map((word, idx) =>
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ').replace(' And ', ' & ')
        ];

        const { data: moduleData, error: moduleError } = await (supabase as any)
          .from("study_modules")
          .select("*")
          .in("domain", domainVariants)
          .limit(1)
          .maybeSingle();

        if (!moduleError && moduleData) {
          // Load study sections
          const { data: sectionsData, error: sectionsError } = await (supabase as any)
            .from("study_sections")
            .select("*")
            .eq("module_id", (moduleData).id)
            .order("order_index");

          if (!sectionsError && sectionsData && sectionsData.length > 0) {
            // Successfully loaded from database - convert to StudyModuleContent format
            const md = moduleData;
            const sd = sectionsData as any[];
            const convertedModule: StudyModuleContent = {
              id: md.id,
              title: md.title,
              description: md.description ?? '',
              domain: md.domain as TCODomain,
              estimatedTime: `${md.estimated_time_minutes} min`,
              estimatedTimeMinutes: md.estimated_time_minutes,
              examWeight: md.exam_weight,
              learningObjectives: Array.isArray(md.learning_objectives) ? (md.learning_objectives as string[]) : [],
              sections: sd.map((section: any) => ({
                id: section.id,
                title: section.title,
                content: section.content,
                sectionType: section.section_type as "overview" | "procedures" | "exam_prep" | "concepts" | "examples",
                orderIndex: section.order_index,
                estimatedTime: section.estimated_time_minutes,
                estimatedTimeMinutes: section.estimated_time_minutes,
                keyPoints: Array.isArray(section.key_points) ? (section.key_points as string[]) : [],
                procedures: Array.isArray(section.procedures) ? (section.procedures as string[]) : [],
                troubleshooting: Array.isArray(section.troubleshooting) ? (section.troubleshooting as string[]) : [],
                references: Array.isArray(section.references) ? (section.references as string[]) : [],
                playbook: section.playbook ?? {},
              })),
            };
            
            setModule(convertedModule);
            setSections(convertedModule.sections);
            setUsingFallback(false);
            setContentLoaded(true);
            setIsLoading(false);
            loadingRef.current.hasLoaded = true;
            loadingRef.current.isLoadingData = false;
            console.log("✅ Loaded study content from database");
            return;
          }
        }
      } catch (dbError) {
        console.warn("Database connection failed, using fallback content:", dbError);
      }

      // Fall back to local content
      console.log("📚 Using fallback study content for domain:", domain);
      const fallbackModule = getStudyModuleByDomain(domain);

      if (fallbackModule) {
        setModule(fallbackModule);
        setSections(fallbackModule.sections);
        setUsingFallback(true);
        setContentLoaded(true);
        setIsLoading(false);
        loadingRef.current.hasLoaded = true;
        loadingRef.current.isLoadingData = false;
        console.log(
          "✅ Successfully loaded fallback content with",
          fallbackModule.sections.length,
          "sections"
        );
        console.log("🔧 Setting isLoading to false...");
      } else {
        throw new Error(`No study content available for domain: ${domain}`);
      }
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
      setContentLoaded(false);
      loadingRef.current.hasLoaded = false;
      loadingRef.current.isLoadingData = false;
      console.error("Error loading study content:", err);
    }
  };

  const loadUserProgress = async () => {
    try {
      // If using fallback content, use local storage for progress
      if (usingFallback) {
        const localProgressKey = `tco-study-progress-${domain}`;
        const localProgress = localStorage.getItem(localProgressKey);

        if (localProgress) {
          const progressData = JSON.parse(localProgress);
          setUserProgress(progressData);
          setCompletedSections(new Set(progressData.completed_sections));

          // Find first incomplete section
          const incompleteIndex = sections.findIndex(
            (section) => !progressData.completed_sections.includes(section.id)
          );
          if (incompleteIndex !== -1) {
            setCurrentSectionIndex(incompleteIndex);
          }
        }
        return;
      }

      // Try database for authenticated users
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: progressData } = await supabase
        .from("user_study_progress")
        .select("*")
        .eq("user_id", user.id)
        .eq("domain", domain)
        .single();

      if (progressData) {
        setUserProgress(progressData as any);
        setCompletedSections(new Set((progressData as any).completed_sections ?? []));

        // Find first incomplete section
        const incompleteIndex = sections.findIndex(
          (section) => !((progressData as any).completed_sections ?? []).includes(section.id)
        );
        if (incompleteIndex !== -1) {
          setCurrentSectionIndex(incompleteIndex);
        }
      }
    } catch (err: any) {
      console.error("Error loading user progress:", err);
    }
  };

  const markSectionComplete = async (sectionId: string) => {
    try {
      const newCompletedSections = new Set(completedSections);
      newCompletedSections.add(sectionId);

      const progressData = {
        user_id: usingFallback ? "local-user" : null,
        domain,
        completed_sections: Array.from(newCompletedSections),
        total_sections: sections.length,
        completion_percentage: Math.round((newCompletedSections.size / sections.length) * 100),
        last_accessed_at: new Date().toISOString(),
      };

      if (usingFallback) {
        // Save to local storage when using fallback content
        const localProgressKey = `tco-study-progress-${domain}`;
        localStorage.setItem(localProgressKey, JSON.stringify(progressData));
        console.log("✅ Progress saved to local storage");
      } else {
        // Save to database when using database content
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        progressData.user_id = user.id;
        const { error } = await (supabase as any).from("user_study_progress").upsert(progressData);

        if (error) {
          throw new Error(`Failed to update progress: ${error.message}`);
        }
        console.log("✅ Progress saved to database");
      }

      setCompletedSections(newCompletedSections);
      setUserProgress((prev) => ({ ...(prev as any), ...(progressData as any) }));

      // Check if module is complete
      if (newCompletedSections.size === sections.length && onComplete) {
        onComplete();
      }
    } catch (err: any) {
      console.error("Error marking section complete:", err);
    }
  };

  const navigateToSection = (index: number) => {
    if (index >= 0 && index < sections.length) {
      setCurrentSectionIndex(index);
    }
  };

  const navigateNext = () => {
    if (currentSectionIndex < sections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
    }
  };

  const navigatePrevious = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
    }
  };

  // Show loading only if actually loading and content not loaded
  // Additional check: if ref says content is loaded but state doesn't reflect it, force update
  if (loadingRef.current.hasLoaded && !contentLoaded && module && sections.length > 0) {
    console.log("🔧 Force updating contentLoaded state from ref");
    setContentLoaded(true);
    setIsLoading(false);
  }

  if (isLoading && !contentLoaded && !loadingRef.current.hasLoaded) {
    console.log(
      "🔄 Showing loading spinner - isLoading:",
      isLoading,
      "contentLoaded:",
      contentLoaded,
      "refLoaded:",
      loadingRef.current.hasLoaded
    );
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Loading study content...</p>
        </div>
      </div>
    );
  }

  if (error || !module) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-800">
            <FileText className="h-5 w-5" />
            Study Content Not Available
          </CardTitle>
          <CardDescription className="text-red-600">
            {error ?? "No study content found for this domain."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-red-700">
            This domain may not have study content migrated yet, or there may be a connection issue.
          </p>
          {onNavigateToQuestions && (
            <Button onClick={onNavigateToQuestions} variant="outline">
              Go to Practice Questions
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  const currentSection = sections[currentSectionIndex];
  const completionPercentage =
    sections.length > 0 ? Math.round((completedSections.size / sections.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Study Module Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2 text-xl">
                <BookOpen className="h-5 w-5 text-blue-600" />
                {module.title}
              </CardTitle>
              <CardDescription className="mt-2">{module.description}</CardDescription>
            </div>
            <Badge variant="outline" className="ml-4">
              <Clock className="mr-1 h-3 w-3" />~
              {(module as any).estimated_time_minutes ?? (module as any).estimatedTimeMinutes ?? 0}
              min
            </Badge>
          </div>

          <div className="mt-4">
            {usingFallback && (
              <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
                <div className="flex items-center gap-2 text-sm text-blue-800">
                  <BookOpen className="h-4 w-4" />
                  <span className="font-medium">Using Professional Study Content</span>
                </div>
                <p className="mt-1 text-xs text-blue-600">
                  World-class TCO study materials with exam-focused content. Progress saved locally.
                </p>
              </div>
            )}
            <div className="mb-2 flex items-center justify-between text-sm text-gray-600">
              <span>Study Progress</span>
              <span>
                {completedSections.size} of {sections.length} sections
              </span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm text-gray-500">{completionPercentage}% Complete</span>
              {completionPercentage === 100 && onNavigateToQuestions && (
                <Button
                  onClick={onNavigateToQuestions}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Target className="mr-1 h-4 w-4" />
                  Start Practice Questions
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Section Navigation Sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Sections</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              <div className="space-y-2 p-4">
                {sections.map((section, index) => {
                  const isCompleted = completedSections.has(section.id);
                  const isCurrent = index === currentSectionIndex;

                  return (
                    <button
                      key={section.id}
                      onClick={() => navigateToSection(index)}
                      className={`w-full rounded-lg p-3 text-left transition-all hover:bg-gray-50 ${isCurrent ? "border-2 border-blue-200 bg-blue-50" : "border border-gray-200"} `}
                    >
                      <div className="flex items-start gap-3">
                        {isCompleted ? (
                          <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                        ) : (
                          <Circle className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-400" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-sm font-medium leading-snug ${
                              isCurrent ? "text-blue-900" : "text-gray-900"
                            }`}
                          >
                            {section.title}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            Section {index + 1} of {sections.length}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Main Content Area */}
        <Card className="lg:col-span-3">
          {currentSection && (
            <>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <span className="text-sm font-medium text-blue-600">
                        Section {currentSectionIndex + 1} of {sections.length}
                      </span>
                    </CardTitle>
                    <h2 className="mt-1 text-xl font-bold">{currentSection.title}</h2>
                  </div>

                  <div className="flex items-center gap-2">
                    {!completedSections.has(currentSection.id) && (
                      <Button
                        onClick={() => markSectionComplete(currentSection.id)}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle2 className="mr-1 h-4 w-4" />
                        Mark Complete
                      </Button>
                    )}
                    {completedSections.has(currentSection.id) && (
                      <Badge className="border-green-200 bg-green-100 text-green-800">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Completed
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <ScrollArea className="h-[500px] pr-4">
                  <div className="prose prose-slate max-w-none">
                    <ReactMarkdown>{currentSection.content}</ReactMarkdown>
                  </div>

                  {/* Flashcard Active Recall Integration */}
                  {module?.id && (
                    <ModuleFlashcardPrompt
                      moduleId={module.id}
                      sectionId={currentSection.id}
                      sectionTitle={currentSection.title}
                    />
                  )}
                </ScrollArea>

                <Separator className="my-6" />

                {/* Navigation Controls */}
                <div className="flex items-center justify-between">
                  <Button
                    onClick={navigatePrevious}
                    disabled={currentSectionIndex === 0}
                    variant="outline"
                    size="sm"
                  >
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Previous
                  </Button>

                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <BookMarked className="h-4 w-4" />
                    <span>
                      Section {currentSectionIndex + 1} of {sections.length}
                    </span>
                  </div>

                  <Button
                    onClick={navigateNext}
                    disabled={currentSectionIndex === sections.length - 1}
                    variant="outline"
                    size="sm"
                  >
                    Next
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
