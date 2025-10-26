/**
 * Module 3 Practice Session Component
 * Enhanced practice session interface for the expanded 9-section structure
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { usePractice } from "@/contexts/PracticeContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  type Module3Section,
  MODULE_3_SECTIONS,
  getSectionCoverage,
  getModule3LearningPath
} from "@/lib/module3-section-definitions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import {
  Play,
  Target,
  Brain,
  Clock,
  TrendingUp,
  Settings,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Module3PracticeSessionProps {
  initialSectionId?: Module3Section;
  autoStart?: boolean;
  className?: string;
}

export function Module3PracticeSession({
  initialSectionId,
  autoStart = false,
  className
}: Module3PracticeSessionProps) {
  const router = useRouter();
  const { user } = useAuth();
  const {
    startModule3SectionPractice,
    startModule3ComprehensivePractice,
    getModule3SectionProgress,
    getModule3Recommendations,
    validateModule3SectionAvailability,
    currentSession,
    isLoading
  } = usePractice();

  // Session Configuration State
  const [sessionType, setSessionType] = useState<"single" | "multiple" | "comprehensive">("single");
  const [selectedSections, setSelectedSections] = useState<Module3Section[]>(
    initialSectionId ? [initialSectionId] : []
  );
  const [questionCount, setQuestionCount] = useState<number[]>([15]);
  const [timeLimit, setTimeLimit] = useState<number[]>([30]);
  const [includePrerequisites, setIncludePrerequisites] = useState(true);
  const [includeRelatedSections, setIncludeRelatedSections] = useState(false);
  const [adaptiveDifficulty, setAdaptiveDifficulty] = useState(true);
  const [focusOnGaps, setFocusOnGaps] = useState(true);
  const [randomizeOrder, setRandomizeOrder] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Progress and Recommendations
  const [sectionProgress, setSectionProgress] = useState<Partial<Record<Module3Section, any>>>({});
  const [recommendations, setRecommendations] = useState<any>(null);
  const [availabilitySummary, setAvailabilitySummary] = useState<Partial<Record<Module3Section, any>>>({});

  const learningPath = getModule3LearningPath();

  // Load user progress and recommendations
  useEffect(() => {
    if (!user) return;

    try {
      const progress = getModule3SectionProgress();
      setSectionProgress(progress);

      const recs = getModule3Recommendations();
      setRecommendations(recs);

      // Auto-select recommended sections if none selected
      if (selectedSections.length === 0 && recs.prioritySections.length > 0) {
        setSelectedSections([recs.prioritySections[0]]);
      }
    } catch (error) {
      console.error("Failed to load Module 3 progress:", error);
    }
  }, [user, getModule3SectionProgress, getModule3Recommendations]);

  // Validate section availability
  useEffect(() => {
    const summary: Partial<Record<Module3Section, any>> = {};
    learningPath.forEach(sectionId => {
      try {
        summary[sectionId] = validateModule3SectionAvailability(sectionId);
      } catch (error) {
        console.error(`Failed to validate section ${sectionId}:`, error);
        summary[sectionId] = { available: false, questionCount: 0, coverage: 0 };
      }
    });
    setAvailabilitySummary(summary);
  }, [validateModule3SectionAvailability]);

  // Auto-start session if requested
  useEffect(() => {
    if (autoStart && initialSectionId && selectedSections.includes(initialSectionId)) {
      void handleStartSession();
    }
  }, [autoStart, initialSectionId]);

  const handleSectionToggle = useCallback((sectionId: Module3Section, checked: boolean) => {
    setSelectedSections(prev => {
      if (checked) {
        return [...prev, sectionId];
      } else {
        return prev.filter(id => id !== sectionId);
      }
    });
  }, []);

  const handleStartSession = useCallback(async () => {
    if (selectedSections.length === 0) {
      alert("Please select at least one section to practice.");
      return;
    }

    try {
      let success = false;

      if (sessionType === "single" && selectedSections.length === 1) {
        success = await startModule3SectionPractice(selectedSections[0], {
          includePrerequisites,
          includeRelatedSections,
          adaptiveDifficulty,
          focusOnGaps,
          questionCount: questionCount[0]
        });
      } else {
        success = await startModule3ComprehensivePractice(selectedSections, {
          questionsPerSection: Math.floor(questionCount[0] / selectedSections.length),
          randomizeOrder,
          focusOnWeakAreas: focusOnGaps,
          timeLimit: timeLimit[0]
        });
      }

      if (success && currentSession) {
        router.push(`/practice/session/${currentSession.id}`);
      }
    } catch (error) {
      console.error("Failed to start Module 3 practice session:", error);
      alert("Failed to start practice session. Please try again.");
    }
  }, [
    selectedSections,
    sessionType,
    questionCount,
    timeLimit,
    includePrerequisites,
    includeRelatedSections,
    adaptiveDifficulty,
    focusOnGaps,
    randomizeOrder,
    startModule3SectionPractice,
    startModule3ComprehensivePractice,
    currentSession,
    router
  ]);

  const getSectionStatusIcon = (sectionId: Module3Section) => {
    const availability = availabilitySummary[sectionId];
    const progress = sectionProgress[sectionId];

    if (!availability?.available) {
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
    if (progress?.accuracy >= 0.8) {
      return <CheckCircle className="w-4 h-4 text-[#22c55e]" />;
    }
    if (progress?.questionsAttempted > 0) {
      return <TrendingUp className="w-4 h-4 text-primary" />;
    }
    return <Target className="w-4 h-4 text-muted-foreground" />;
  };

  const getEstimatedTime = () => {
    if (sessionType === "single") {
      return Math.ceil(questionCount[0] * 1.5); // 1.5 minutes per question
    }
    return Math.ceil((questionCount[0] / selectedSections.length) * selectedSections.length * 1.5);
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with Recommendations */}
      {recommendations && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-600" />
              <CardTitle className="text-lg">Smart Recommendations</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-blue-700 border-blue-300">
                {recommendations.recommendedSessionType}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Suggested duration: {recommendations.suggestedDuration} minutes
              </span>
            </div>
            <div className="text-sm">
              <span className="font-medium">Priority sections: </span>
              {recommendations.prioritySections.map((sectionId: Module3Section, index: number) => (
                <span key={sectionId}>
                  {MODULE_3_SECTIONS[sectionId].title}
                  {index < recommendations.prioritySections.length - 1 && ", "}
                </span>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedSections(recommendations.prioritySections);
                setQuestionCount([15]);
                setTimeLimit([recommendations.suggestedDuration]);
              }}
            >
              <Zap className="w-3 h-3 mr-1" />
              Use Smart Recommendations
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Session Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Practice Session Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Session Type Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Session Type</label>
            <Select value={sessionType} onValueChange={(value: any) => setSessionType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single Section Focus</SelectItem>
                <SelectItem value="multiple">Multiple Sections</SelectItem>
                <SelectItem value="comprehensive">Comprehensive Review</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Section Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Select Sections</label>
            <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
              {learningPath.map(sectionId => {
                const section = MODULE_3_SECTIONS[sectionId];
                const availability = availabilitySummary[sectionId];
                const progress = sectionProgress[sectionId];
                const coverage = getSectionCoverage(sectionId);
                const isSelected = selectedSections.includes(sectionId);

                return (
                  <div
                    key={sectionId}
                    className={cn(
                      "flex items-center space-x-3 p-3 rounded-lg border transition-colors",
                      isSelected ? "bg-accent border-accent" : "hover:bg-muted/50",
                      !availability?.available && "opacity-50"
                    )}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) => handleSectionToggle(sectionId, checked as boolean)}
                      disabled={!availability?.available}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {getSectionStatusIcon(sectionId)}
                        <span className="font-medium text-sm">{section.title}</span>
                        <Badge variant="outline" className="text-xs">
                          {section.difficulty}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {availability?.questionCount ?? 0} questions ({coverage}% coverage)
                        </span>
                        {progress && (
                          <span className="text-xs text-muted-foreground">
                            Last: {Math.round(progress.accuracy * 100)}% accuracy
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Basic Configuration */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Questions: {questionCount[0]}</label>
              <Slider
                value={questionCount}
                onValueChange={setQuestionCount}
                max={50}
                min={5}
                step={5}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Time Limit: {timeLimit[0]} min</label>
              <Slider
                value={timeLimit}
                onValueChange={setTimeLimit}
                max={60}
                min={10}
                step={5}
                className="w-full"
              />
            </div>
          </div>

          {/* Advanced Options */}
          <div className="space-y-3">
            <Button
              variant="ghost"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full justify-between"
            >
              Advanced Options
              <span className={cn("transition-transform", showAdvanced && "rotate-180")}>▼</span>
            </Button>

            {showAdvanced && (
              <div className="space-y-3 pt-2 border-t">
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center space-x-2">
                    <Checkbox
                      checked={includePrerequisites}
                      onCheckedChange={(checked) => setIncludePrerequisites(checked === true)}
                    />
                    <span className="text-sm">Include Prerequisites</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <Checkbox
                      checked={includeRelatedSections}
                      onCheckedChange={(checked) => setIncludeRelatedSections(checked === true)}
                    />
                    <span className="text-sm">Include Related Sections</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <Checkbox
                      checked={adaptiveDifficulty}
                      onCheckedChange={(checked) => setAdaptiveDifficulty(checked === true)}
                    />
                    <span className="text-sm">Adaptive Difficulty</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <Checkbox
                      checked={focusOnGaps}
                      onCheckedChange={(checked) => setFocusOnGaps(checked === true)}
                    />
                    <span className="text-sm">Focus on Weak Areas</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <Checkbox
                      checked={randomizeOrder}
                      onCheckedChange={(checked) => setRandomizeOrder(checked === true)}
                    />
                    <span className="text-sm">Randomize Order</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Session Summary */}
          <div className="bg-muted/30 p-4 rounded-lg space-y-2">
            <h4 className="font-medium">Session Summary</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Sections:</span>
                <span className="ml-2 font-medium">{selectedSections.length}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Questions:</span>
                <span className="ml-2 font-medium">{questionCount[0]}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Estimated Time:</span>
                <span className="ml-2 font-medium">{getEstimatedTime()} min</span>
              </div>
            </div>
          </div>

          {/* Start Button */}
          <Button
            onClick={handleStartSession}
            disabled={selectedSections.length === 0 || isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              "Starting..."
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Start Practice Session
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}