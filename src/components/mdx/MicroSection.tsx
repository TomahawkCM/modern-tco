"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, Clock, BookOpen, ChevronDown, ChevronUp, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { addReviewItem, getAllReviewItems, saveReviewItems } from "@/lib/spacedRepetition";

interface MicroSectionProps {
  /** Unique identifier for progress tracking */
  id: string;
  /** Module ID for grouping sections */
  moduleId: string;
  /** Section title */
  title: string;
  /** Estimated time in minutes */
  estimatedMinutes: number;
  /** Section number (1-indexed) */
  sectionNumber: number;
  /** Total sections in module */
  totalSections: number;
  /** Section content */
  children: React.ReactNode;
  /** Optional quick check quiz */
  quickCheck?: React.ReactNode;
  /** Optional key takeaways */
  keyTakeaways?: string[];
  /** Require quiz completion before marking complete (default: true) */
  requireQuizPass?: boolean;
}

export function MicroSection({
  id,
  moduleId,
  title,
  estimatedMinutes,
  sectionNumber,
  totalSections,
  children,
  quickCheck,
  keyTakeaways,
  requireQuizPass = true,
}: MicroSectionProps) {
  const [isCompleted, setIsCompleted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [showQuickCheck, setShowQuickCheck] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);

  // Load completion and quiz status from localStorage
  useEffect(() => {
    const storageKey = `micro-section-${moduleId}-${id}`;
    const completed = localStorage.getItem(storageKey) === "true";
    setIsCompleted(completed);

    // Check if quiz was passed (if quiz exists)
    if (quickCheck && requireQuizPass) {
      const quizStorageKey = `quiz-passed-${moduleId}-${id}`;
      const passed = localStorage.getItem(quizStorageKey) === "true";
      setQuizPassed(passed);
    } else {
      // No quiz requirement, allow completion
      setQuizPassed(true);
    }
  }, [moduleId, id, quickCheck, requireQuizPass]);

  const handleMarkComplete = () => {
    // Enforce quiz requirement if applicable
    if (quickCheck && requireQuizPass && !quizPassed) {
      alert("Please complete and pass the Quick Check quiz (80%+) before marking this section complete.");
      setShowQuickCheck(true);
      return;
    }

    const storageKey = `micro-section-${moduleId}-${id}`;
    localStorage.setItem(storageKey, "true");
    setIsCompleted(true);

    // Update module progress
    updateModuleProgress(moduleId);

    // Add to spaced repetition schedule
    addToSpacedRepetition();
  };

  const addToSpacedRepetition = () => {
    // Get existing review items for this module
    const existingItems = getAllReviewItems(moduleId);

    // Check if this section is already being tracked
    const alreadyTracked = existingItems.some(
      item => item.sectionId === id && item.moduleId === moduleId
    );

    if (!alreadyTracked) {
      // Add this section to spaced repetition
      const newItem = addReviewItem({
        moduleId,
        sectionId: id,
        concept: title,
        type: "micro-section",
        title,
      });

      existingItems.push(newItem);
      saveReviewItems(moduleId, existingItems);

      console.log("✅ Added to spaced repetition:", {
        title,
        nextReview: newItem.nextReview,
      });
    }
  };

  const handleQuizPass = () => {
    setQuizPassed(true);
    // Automatically show completion button after passing quiz
  };

  const updateModuleProgress = (moduleId: string) => {
    const progressKey = `module-progress-${moduleId}`;
    const currentProgress = JSON.parse(localStorage.getItem(progressKey) || "{}");
    const completedSections = new Set(currentProgress.completedSections || []);
    completedSections.add(id);

    localStorage.setItem(
      progressKey,
      JSON.stringify({
        ...currentProgress,
        completedSections: Array.from(completedSections),
        lastAccessed: new Date().toISOString(),
        completionPercentage: Math.round((completedSections.size / totalSections) * 100),
      })
    );
  };

  return (
    <Card
      className={cn(
        "mb-6 border-2 transition-all",
        isCompleted
          ? "border-green-500/30 bg-green-500/5"
          : "border-blue-500/20 bg-slate-900/50"
      )}
    >
      <CardHeader className="cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            {isCompleted ? (
              <CheckCircle2 className="h-6 w-6 flex-shrink-0 text-green-500 mt-1" />
            ) : (
              <Circle className="h-6 w-6 flex-shrink-0 text-blue-400 mt-1" />
            )}

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-xs">
                  Section {sectionNumber}/{totalSections}
                </Badge>
                <Badge variant="outline" className="text-xs flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {estimatedMinutes} min
                </Badge>
              </div>
              <CardTitle className="text-xl text-white mb-1">{title}</CardTitle>
              <Progress
                value={(sectionNumber / totalSections) * 100}
                className="h-1 w-32"
                aria-label={`Progress: Section ${sectionNumber} of ${totalSections}`}
              />
            </div>
          </div>

          <Button variant="ghost" size="sm" className="text-gray-400">
            {isExpanded ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-6">
          {/* Learning Content */}
          <div className="prose prose-invert max-w-none">
            {children}
          </div>

          {/* Key Takeaways */}
          {keyTakeaways && keyTakeaways.length > 0 && (
            <Card className="border-blue-500/20 bg-blue-500/5">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2 text-blue-300">
                  <BookOpen className="h-4 w-4" />
                  Key Takeaways
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {keyTakeaways.map((takeaway, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                      <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-500 mt-0.5" />
                      <span>{takeaway}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Quick Check Quiz */}
          {quickCheck && (
            <div className="space-y-3">
              {!showQuickCheck ? (
                <div>
                  <Button
                    onClick={() => setShowQuickCheck(true)}
                    className={cn(
                      "w-full",
                      quizPassed
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-purple-600 hover:bg-purple-700"
                    )}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    {quizPassed ? "Review Quick Check ✓" : "Take Quick Check (2 min)"}
                  </Button>
                  {requireQuizPass && !quizPassed && (
                    <p className="mt-2 text-xs text-orange-400 flex items-center gap-1">
                      <Lock className="h-3 w-3" />
                      Must pass Quick Check (80%+) to mark section complete
                    </p>
                  )}
                </div>
              ) : (
                <Card className="border-purple-500/20 bg-purple-500/5">
                  <CardHeader>
                    <CardTitle className="text-sm text-purple-300 flex items-center justify-between">
                      <span>Quick Check: Test Your Understanding</span>
                      {quizPassed && (
                        <Badge className="bg-green-600 text-white">Passed ✓</Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>{quickCheck}</CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Mark Complete Button */}
          {!isCompleted && (
            <div>
              <Button
                onClick={handleMarkComplete}
                disabled={Boolean(quickCheck && requireQuizPass && !quizPassed)}
                className={cn(
                  "w-full",
                  quickCheck && requireQuizPass && !quizPassed
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                )}
              >
                {quickCheck && requireQuizPass && !quizPassed ? (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Complete Quiz to Unlock
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Mark Section Complete
                  </>
                )}
              </Button>
              {quickCheck && requireQuizPass && !quizPassed && (
                <p className="mt-2 text-center text-xs text-gray-500">
                  Pass the Quick Check above to mark this section complete
                </p>
              )}
            </div>
          )}

          {isCompleted && (
            <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-center">
              <CheckCircle2 className="mx-auto mb-2 h-6 w-6 text-green-500" />
              <p className="text-sm font-medium text-green-300">Section Completed!</p>
              <p className="text-xs text-green-400 mt-1">
                Progress saved. Continue to the next section.
              </p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

export default MicroSection;
