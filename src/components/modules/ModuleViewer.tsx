"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  CheckCircle,
  Clock,
  Play,
  ArrowLeft,
  ArrowRight,
  Trophy,
  Target,
  Brain,
} from "lucide-react";
import { type Module, ModuleSection, type ModuleProgress } from "@/data/modules/module-definitions";
import { cn } from "@/lib/utils";

interface ModuleViewerProps {
  module: Module;
  progress?: ModuleProgress;
  onSectionComplete: (sectionId: string) => void;
  onObjectiveComplete: (objectiveId: string) => void;
  onModuleComplete: () => void;
  className?: string;
}

export function ModuleViewer({
  module,
  progress,
  onSectionComplete,
  onObjectiveComplete,
  onModuleComplete,
  className,
}: ModuleViewerProps) {
  const [currentSection, setCurrentSection] = useState(0);
  const [completedObjectives, setCompletedObjectives] = useState<Set<string>>(new Set());
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());

  // Calculate progress percentages
  const objectiveProgress = Math.round((completedObjectives.size / module.objectives.length) * 100);
  const sectionProgress = Math.round((completedSections.size / module.sections.length) * 100);
  const overallProgress = Math.round((objectiveProgress + sectionProgress) / 2);

  // Domain color mapping
  const getDomainColors = (domain: string) => {
    const colors = {
      ASKING_QUESTIONS: {
        color: "text-[#22c55e]",
        bgColor: "bg-green-900/20",
        borderColor: "border-green-400",
      },
      REFINING_QUESTIONS: {
        color: "text-primary",
        bgColor: "bg-blue-900/20",
        borderColor: "border-blue-400",
      },
      TAKING_ACTION: {
        color: "text-primary",
        bgColor: "bg-primary/20",
        borderColor: "border-cyan-400",
      },
      NAVIGATION_MODULES: {
        color: "text-[#f97316]",
        bgColor: "bg-yellow-900/20",
        borderColor: "border-yellow-400",
      },
      REPORTING_EXPORT: {
        color: "text-red-400",
        bgColor: "bg-red-900/20",
        borderColor: "border-red-400",
      },
    };
    return colors[domain as keyof typeof colors] || colors["NAVIGATION_MODULES"];
  };

  const domainColors = getDomainColors(module.domain);

  const handleObjectiveToggle = (objectiveId: string) => {
    const newCompleted = new Set(completedObjectives);
    if (newCompleted.has(objectiveId)) {
      newCompleted.delete(objectiveId);
    } else {
      newCompleted.add(objectiveId);
    }
    setCompletedObjectives(newCompleted);
    onObjectiveComplete(objectiveId);
  };

  const handleSectionComplete = (sectionId: string) => {
    const newCompleted = new Set(completedSections);
    newCompleted.add(sectionId);
    setCompletedSections(newCompleted);
    onSectionComplete(sectionId);
  };

  const nextSection = () => {
    if (currentSection < module.sections.length - 1) {
      setCurrentSection(currentSection + 1);
    }
  };

  const prevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const currentSectionData = module.sections[currentSection];
  const isLastSection = currentSection === module.sections.length - 1;
  const isFirstSection = currentSection === 0;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Module Header */}
      <Card className={cn("glass border-2", domainColors.borderColor, domainColors.bgColor)}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="text-4xl">{module.icon}</div>
              <div>
                <CardTitle className="text-2xl text-foreground">{module.title}</CardTitle>
                <p className="mt-2 text-muted-foreground">{module.description}</p>
                <div className="mt-3 flex items-center gap-4">
                  <Badge variant="outline" className={cn("border-white/20", domainColors.color)}>
                    <Clock className="mr-1 h-3 w-3" />
                    {module.estimatedTime}
                  </Badge>
                  <Badge variant="outline" className={cn("border-white/20", domainColors.color)}>
                    <Target className="mr-1 h-3 w-3" />
                    {module.objectives.length} objectives
                  </Badge>
                  <Badge variant="outline" className={cn("border-white/20", domainColors.color)}>
                    <Trophy className="mr-1 h-3 w-3" />
                    {module.examWeight}% exam weight
                  </Badge>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-foreground">{overallProgress}%</div>
              <div className="text-sm text-muted-foreground">Complete</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={overallProgress} className="h-3" />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="mb-1 text-sm text-muted-foreground">Objectives</div>
                <div className="flex items-center gap-2">
                  <Progress value={objectiveProgress} className="h-2 flex-1" />
                  <span className="text-sm text-foreground">
                    {completedObjectives.size}/{module.objectives.length}
                  </span>
                </div>
              </div>
              <div>
                <div className="mb-1 text-sm text-muted-foreground">Sections</div>
                <div className="flex items-center gap-2">
                  <Progress value={sectionProgress} className="h-2 flex-1" />
                  <span className="text-sm text-foreground">
                    {completedSections.size}/{module.sections.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Module Content Tabs */}
      <Tabs defaultValue="content" className="space-y-6">
        <TabsList className="glass grid w-full grid-cols-3 border border-white/10">
          <TabsTrigger value="content" className="text-foreground data-[state=active]:bg-tanium-accent">
            <BookOpen className="mr-2 h-4 w-4" />
            Content
          </TabsTrigger>
          <TabsTrigger
            value="objectives"
            className="text-foreground data-[state=active]:bg-tanium-accent"
          >
            <Target className="mr-2 h-4 w-4" />
            Objectives
          </TabsTrigger>
          <TabsTrigger value="progress" className="text-foreground data-[state=active]:bg-tanium-accent">
            <Trophy className="mr-2 h-4 w-4" />
            Progress
          </TabsTrigger>
        </TabsList>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6">
          <Card className="glass border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <span className="text-tanium-accent">Section {currentSection + 1}:</span>
                  {currentSectionData.title}
                </CardTitle>
                <Badge variant="outline" className="border-white/20 text-foreground">
                  <Clock className="mr-1 h-3 w-3" />
                  {currentSectionData.estimatedTime} min
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Section Content */}
              <div className="prose prose-invert max-w-none">
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {currentSectionData.content}
                </p>
              </div>

              {/* Section Navigation */}
              <div className="flex items-center justify-between border-t border-white/10 pt-6">
                <Button
                  variant="outline"
                  onClick={prevSection}
                  disabled={isFirstSection}
                  className="border-white/20 text-foreground hover:bg-white/10 disabled:opacity-50"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Previous Section
                </Button>

                <div className="text-center">
                  <div className="mb-2 text-sm text-muted-foreground">
                    Section {currentSection + 1} of {module.sections.length}
                  </div>
                  <Button
                    onClick={() => handleSectionComplete(currentSectionData.id)}
                    disabled={completedSections.has(currentSectionData.id)}
                    className="bg-[#22c55e] text-foreground hover:bg-green-700 disabled:bg-green-800"
                  >
                    {completedSections.has(currentSectionData.id) ? (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Completed
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Mark Complete
                      </>
                    )}
                  </Button>
                </div>

                <Button
                  onClick={nextSection}
                  disabled={isLastSection}
                  className="bg-tanium-accent hover:bg-blue-600 disabled:opacity-50"
                >
                  Next Section
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Section Overview */}
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="text-foreground">All Sections</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {module.sections.map((section, index) => (
                  <div
                    key={section.id}
                    className={cn(
                      "flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-colors",
                      currentSection === index
                        ? "border-tanium-accent bg-tanium-accent/10"
                        : "border-white/10 hover:border-white/20",
                      completedSections.has(section.id) && "border-green-400 bg-green-900/20"
                    )}
                    onClick={() => setCurrentSection(index)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-tanium-accent">{index + 1}</span>
                        {completedSections.has(section.id) && (
                          <CheckCircle className="h-4 w-4 text-[#22c55e]" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{section.title}</div>
                        <div className="text-sm text-muted-foreground">{section.content}</div>
                      </div>
                    </div>
                    <Badge variant="outline" className="border-white/20 text-foreground">
                      {section.estimatedTime}m
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Objectives Tab */}
        <TabsContent value="objectives" className="space-y-6">
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="text-foreground">Learning Objectives</CardTitle>
              <p className="text-muted-foreground">
                Track your progress through the key learning objectives for this module.
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {module.objectives.map((objective, index) => (
                  <div
                    key={objective.id}
                    className={cn(
                      "flex cursor-pointer items-start gap-4 rounded-lg border p-4 transition-colors",
                      completedObjectives.has(objective.id)
                        ? "border-green-400 bg-green-900/20"
                        : "border-white/10 hover:border-white/20"
                    )}
                    onClick={() => handleObjectiveToggle(objective.id)}
                  >
                    <div className="mt-1 flex items-center gap-3">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full border border-white/20 text-xs font-medium text-tanium-accent">
                        {index + 1}
                      </div>
                      <div
                        className={cn(
                          "flex h-5 w-5 items-center justify-center rounded border-2 transition-colors",
                          completedObjectives.has(objective.id)
                            ? "border-green-400 bg-green-400"
                            : "border-white/20 hover:border-white/40"
                        )}
                      >
                        {completedObjectives.has(objective.id) && (
                          <CheckCircle className="h-3 w-3 text-green-900" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <p
                        className={cn(
                          "leading-relaxed text-foreground",
                          completedObjectives.has(objective.id) && "line-through opacity-60"
                        )}
                      >
                        {objective.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Progress Stats */}
            <Card className="glass border-white/10">
              <CardHeader>
                <CardTitle className="text-foreground">Progress Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="text-muted-foreground">Overall Progress</span>
                      <span className="text-foreground">{overallProgress}%</span>
                    </div>
                    <Progress value={overallProgress} className="h-2" />
                  </div>

                  <div>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="text-muted-foreground">Objectives Completed</span>
                      <span className="text-foreground">
                        {completedObjectives.size}/{module.objectives.length}
                      </span>
                    </div>
                    <Progress value={objectiveProgress} className="h-2" />
                  </div>

                  <div>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="text-muted-foreground">Sections Completed</span>
                      <span className="text-foreground">
                        {completedSections.size}/{module.sections.length}
                      </span>
                    </div>
                    <Progress value={sectionProgress} className="h-2" />
                  </div>
                </div>

                {/* Completion Button */}
                {overallProgress === 100 && (
                  <Button
                    onClick={onModuleComplete}
                    className="w-full bg-[#22c55e] text-foreground hover:bg-green-700"
                  >
                    <Trophy className="mr-2 h-4 w-4" />
                    Complete Module
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Module Info */}
            <Card className="glass border-white/10">
              <CardHeader>
                <CardTitle className="text-foreground">Module Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Domain</span>
                    <Badge className={cn("text-xs", domainColors.color, domainColors.bgColor)}>
                      {module.domain.replace("_", " ")}
                    </Badge>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Difficulty</span>
                    <Badge variant="outline" className="border-white/20 text-xs text-foreground">
                      {module.difficulty}
                    </Badge>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Exam Weight</span>
                    <span className="text-foreground">{module.examWeight}%</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Time</span>
                    <span className="text-foreground">{module.totalMinutes} minutes</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="border-t border-white/10 pt-4">
                  <div className="mb-2 text-sm text-muted-foreground">Tags</div>
                  <div className="flex flex-wrap gap-2">
                    {module.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="border-white/20 text-xs text-foreground"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
