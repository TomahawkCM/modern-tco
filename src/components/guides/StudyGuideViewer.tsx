/**
 * StudyGuideViewer Component - Display study guide content
 * Handles markdown rendering, progress tracking, and navigation
 */

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BookOpen,
  Clock,
  CheckCircle,
  Circle,
  ArrowLeft,
  ArrowRight,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";
import type { StudyGuide, StudyGuideProgress } from "@/types/module";
import { cn } from "@/lib/utils";

interface StudyGuideViewerProps {
  guide: StudyGuide;
  progress?: StudyGuideProgress;
  onProgressUpdate?: (progress: Partial<StudyGuideProgress>) => void;
  onSectionComplete?: (sectionId: string) => void;
  className?: string;
}

export function StudyGuideViewer({
  guide,
  progress,
  onProgressUpdate,
  onSectionComplete,
  className,
}: StudyGuideViewerProps) {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const currentSection = guide.sections[currentSectionIndex];
  const isFirstSection = currentSectionIndex === 0;
  const isLastSection = currentSectionIndex === guide.sections.length - 1;

  // Calculate progress
  const completedSections = progress?.sectionsRead || [];
  const guideProgress = Math.round((completedSections.length / guide.sections.length) * 100);

  useEffect(() => {
    if (currentSection && !completedSections.includes(currentSection.id)) {
      // Mark section as read
      onSectionComplete?.(currentSection.id);
      onProgressUpdate?.({
        sectionsRead: [...completedSections, currentSection.id],
        readingProgress: Math.round(((completedSections.length + 1) / guide.sections.length) * 100),
        lastPosition: currentSection.id,
      });
    }
  }, [
    currentSection?.id,
    completedSections,
    onSectionComplete,
    onProgressUpdate,
    currentSection,
    guide.sections.length,
  ]);

  const navigateToSection = (index: number) => {
    if (index >= 0 && index < guide.sections.length) {
      setCurrentSectionIndex(index);
      onProgressUpdate?.({
        lastPosition: guide.sections[index].id,
      });
    }
  };

  const renderMarkdownContent = (content: string) => {
    // Simple markdown-like rendering (for more complex markdown, use a library like react-markdown)
    return (
      <div className="prose prose-slate dark:prose-invert max-w-none">
        <div dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, "<br/>") }} />
      </div>
    );
  };

  if (!currentSection) {
    return (
      <Card className={className}>
        <CardContent className="py-8 text-center">
          <BookOpen className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
          <p className="text-muted-foreground">No study guide content available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Guide Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="flex items-center">
                <BookOpen className="mr-2 h-6 w-6" />
                {guide.title}
              </CardTitle>
              <p className="text-muted-foreground">{guide.description}</p>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <span className="flex items-center">
                  <Clock className="mr-1 h-4 w-4" />
                  {guide.estimatedReadingTime} min read
                </span>
                <Badge variant="outline">{guide.sections.length} sections</Badge>
                <Badge variant="secondary">Study Guide</Badge>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => setIsBookmarked(!isBookmarked)}>
              {isBookmarked ? (
                <BookmarkCheck className="h-4 w-4" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Progress indicator */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Reading Progress</span>
              <span>{guideProgress}% complete</span>
            </div>
            <Progress value={guideProgress} className="h-2" />
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Section Navigation */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Sections</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {guide.sections.map((section, index) => {
                  const isRead = completedSections.includes(section.id);
                  const isCurrent = index === currentSectionIndex;

                  return (
                    <Button
                      key={section.id}
                      variant={isCurrent ? "default" : "ghost"}
                      className={cn(
                        "h-auto w-full justify-start p-3 text-left",
                        isRead && "bg-green-50 hover:bg-green-100 dark:bg-green-950/20"
                      )}
                      onClick={() => navigateToSection(index)}
                    >
                      <div className="flex w-full items-start">
                        {isRead ? (
                          <CheckCircle className="mr-2 mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                        ) : (
                          <Circle className="mr-2 mt-0.5 h-4 w-4 flex-shrink-0" />
                        )}
                        <div className="text-left">
                          <div className="text-sm font-medium">{section.title}</div>
                          <div className="text-xs text-muted-foreground">Level {section.level}</div>
                        </div>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{currentSection.title}</CardTitle>
              <Badge variant="outline">
                Section {currentSectionIndex + 1} of {guide.sections.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Section content */}
            <div className="min-h-[400px]">{renderMarkdownContent(currentSection.content)}</div>

            {/* Section actions */}
            <div className="flex items-center justify-between border-t pt-4">
              <Button
                variant="outline"
                onClick={() => navigateToSection(currentSectionIndex - 1)}
                disabled={isFirstSection}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>

              <div className="flex space-x-2">
                <Button
                  onClick={() => navigateToSection(currentSectionIndex + 1)}
                  disabled={isLastSection}
                >
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
