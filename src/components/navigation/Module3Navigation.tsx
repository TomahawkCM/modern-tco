/**
 * Module 3 Navigation Component
 * Enhanced navigation for the expanded 9-section structure
 */

"use client";

import { useCallback, useState } from "react";
import { ChevronRight, ChevronDown, CheckCircle, Circle, Lock, BookOpen, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Module3Section,
  MODULE_3_SECTIONS,
  getModule3LearningPath,
  getSectionCoverage
} from "@/lib/module3-section-definitions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface Module3NavigationProps {
  currentSection?: Module3Section;
  onSectionChange?: (sectionId: Module3Section) => void;
  userProgress?: Partial<Record<Module3Section, { completed: boolean; progress: number }>>;
  showProgress?: boolean;
  expandedByDefault?: boolean;
  className?: string;
}

export function Module3Navigation({
  currentSection,
  onSectionChange,
  userProgress = {},
  showProgress = true,
  expandedByDefault = false,
  className
}: Module3NavigationProps) {
  const [expandedSections, setExpandedSections] = useState<Set<Module3Section>>(
    expandedByDefault ? new Set(Object.keys(MODULE_3_SECTIONS) as Module3Section[]) : new Set()
  );

  const learningPath = getModule3LearningPath();

  const toggleSection = useCallback((sectionId: Module3Section) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  }, []);

  const getSectionIcon = (sectionId: Module3Section) => {
    const progress = userProgress[sectionId];
    if (!progress) return <Circle className="w-4 h-4 text-gray-400" />;
    if (progress.completed) return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (progress.progress > 0) return <Circle className="w-4 h-4 text-blue-500" />;
    return <Circle className="w-4 h-4 text-gray-400" />;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "bg-green-100 text-green-800";
      case "Intermediate": return "bg-yellow-100 text-yellow-800";
      case "Advanced": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const isSectionLocked = (sectionId: Module3Section): boolean => {
    const section = MODULE_3_SECTIONS[sectionId];
    if (!section.prerequisites || section.prerequisites.length === 0) return false;

    return section.prerequisites.some(prereq => {
      const prereqProgress = userProgress[prereq];
      return !prereqProgress || !prereqProgress.completed;
    });
  };

  return (
    <Card className={cn("p-4", className)}>
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Module 3: Taking Action</h3>
          {showProgress && (
            <div className="text-sm text-muted-foreground">
              {Object.values(userProgress).filter(p => p.completed).length} / {learningPath.length} sections
            </div>
          )}
        </div>

        {showProgress && (
          <div className="mb-6">
            <Progress
              value={(Object.values(userProgress).filter(p => p.completed).length / learningPath.length) * 100}
              className="h-2"
            />
          </div>
        )}

        <div className="space-y-2">
          {learningPath.map((sectionId, index) => {
            const section = MODULE_3_SECTIONS[sectionId];
            const isExpanded = expandedSections.has(sectionId);
            const isLocked = isSectionLocked(sectionId);
            const isCurrent = currentSection === sectionId;
            const progress = userProgress[sectionId];
            const coverage = getSectionCoverage(sectionId);

            return (
              <div key={sectionId} className="border rounded-lg overflow-hidden">
                <button
                  onClick={() => !isLocked && toggleSection(sectionId)}
                  disabled={isLocked}
                  className={cn(
                    "w-full px-4 py-3 flex items-center justify-between hover:bg-accent/50 transition-colors",
                    isCurrent && "bg-accent",
                    isLocked && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground w-6">
                      {index + 1}.
                    </span>
                    {isLocked ? (
                      <Lock className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      getSectionIcon(sectionId)
                    )}
                    <span className="font-medium text-left">{section.title}</span>
                    <Badge variant="outline" className={cn("text-xs", getDifficultyColor(section.difficulty))}>
                      {section.difficulty}
                    </Badge>
                    {section.currentQuestionCount === 0 && (
                      <Badge variant="destructive" className="text-xs">
                        New
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {section.estimatedTime}min
                    </span>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {isExpanded && !isLocked && (
                  <div className="px-4 py-3 bg-muted/20 border-t space-y-3">
                    <p className="text-sm text-muted-foreground">
                      {section.description}
                    </p>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium">Question Coverage</span>
                        <span className={cn(
                          "font-medium",
                          coverage === 100 ? "text-green-600" :
                          coverage > 50 ? "text-yellow-600" : "text-red-600"
                        )}>
                          {section.currentQuestionCount} / {section.questionTargetCount} questions ({coverage}%)
                        </span>
                      </div>
                      <Progress value={coverage} className="h-1.5" />
                    </div>

                    {section.learningObjectives.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-xs font-medium">Learning Objectives:</span>
                        <ul className="space-y-0.5">
                          {section.learningObjectives.map((objective, idx) => (
                            <li key={idx} className="text-xs text-muted-foreground flex items-start gap-1">
                              <span className="text-muted-foreground/50 mt-0.5">•</span>
                              <span>{objective.split(":")[1].trim()}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {section.prerequisites && section.prerequisites.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        <span className="font-medium">Prerequisites: </span>
                        {section.prerequisites.map(prereq => MODULE_3_SECTIONS[prereq].title).join(", ")}
                      </div>
                    )}

                    <div className="flex gap-2 mt-3">
                      <Button
                        variant={isCurrent ? "default" : "outline"}
                        size="sm"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSectionChange?.(sectionId);
                        }}
                      >
                        <BookOpen className="w-3 h-3 mr-1" />
                        {isCurrent ? "Continue" : "Start"} Section
                      </Button>
                      {progress && progress.progress > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle practice mode
                          }}
                        >
                          Practice ({progress.progress}%)
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Overall Statistics */}
        <div className="mt-6 p-4 bg-muted/30 rounded-lg space-y-2">
          <h4 className="text-sm font-medium">Module Statistics</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-muted-foreground">Total Sections:</span>
              <span className="ml-1 font-medium">{learningPath.length}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Total Time:</span>
              <span className="ml-1 font-medium">
                {Object.values(MODULE_3_SECTIONS).reduce((sum, s) => sum + s.estimatedTime, 0)} min
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Total Questions:</span>
              <span className="ml-1 font-medium">
                {Object.values(MODULE_3_SECTIONS).reduce((sum, s) => sum + s.currentQuestionCount, 0)}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Target Questions:</span>
              <span className="ml-1 font-medium">
                {Object.values(MODULE_3_SECTIONS).reduce((sum, s) => sum + s.questionTargetCount, 0)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}