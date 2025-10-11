"use client";

import React from "react";
import { useStudySession } from "@/contexts/StudySessionContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Book, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { analytics } from "@/lib/analytics";

export function StudyProgressPanel() {
  const session = useStudySession();

  // Don't render if no active study session
  if (!session) {
    return null;
  }

  const {
    moduleId,
    sections,
    activeId,
    lastViewed,
    markSection,
    setLastViewed,
    markAllComplete,
    clearAllReview,
    resetProgress,
  } = session;

  const handleScrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setLastViewed(sectionId);
      void analytics.capture('study_section_view', { moduleId, id: sectionId, from: 'sidebar' });
    }
  };

  const handleMarkAllComplete = async () => {
    await markAllComplete();
    void analytics.capture('study_mark_all_complete', { moduleId, from: 'sidebar' });
  };

  const handleClearAllReview = async () => {
    await clearAllReview();
    void analytics.capture('study_clear_all_review', { moduleId, from: 'sidebar' });
  };

  const handleResetProgress = async () => {
    await resetProgress();
    void analytics.capture('study_reset_progress', { moduleId, from: 'sidebar' });
  };

  const completedCount = sections.filter(s => s.completed).length;
  const totalSections = sections.length;
  const progressPercent = totalSections > 0 ? Math.round((completedCount / totalSections) * 100) : 0;

  return (
    <Card className="border-primary/30 bg-gradient-to-b from-gray-900/50 to-blue-900/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
          <Book className="h-4 w-4" /> Study Progress
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          {completedCount} of {totalSections} sections ({progressPercent}%)
        </CardDescription>

        {/* Action Buttons */}
        <div className="mt-3 flex flex-col gap-2">
          <Button
            size="sm"
            className="w-full bg-green-700 hover:bg-[#22c55e] text-xs h-8"
            onClick={handleMarkAllComplete}
          >
            Mark all complete
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="w-full border-yellow-600 text-[#f97316] hover:bg-[#f97316]/10 text-xs h-8"
            onClick={handleClearAllReview}
          >
            Clear all review
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="w-full border-gray-600 text-muted-foreground hover:bg-gray-900/30 text-xs h-8"
            onClick={handleResetProgress}
          >
            Reset progress
          </Button>
        </div>

        {/* Continue where you left off */}
        {lastViewed && (
          <div className="mt-3">
            <Button
              size="sm"
              className="w-full bg-cyan-700 hover:bg-primary text-xs h-8"
              onClick={() => handleScrollToSection(lastViewed)}
            >
              Continue where you left off
            </Button>
          </div>
        )}
      </CardHeader>

      {/* Section List */}
      <CardContent className="max-h-[300px] overflow-y-auto">
        <ul className="space-y-2">
          {sections.map((s) => (
            <li
              key={s.id}
              className={cn(
                "flex items-start gap-2 text-xs",
                activeId === s.id ? "opacity-100" : "opacity-80"
              )}
            >
              <input
                type="checkbox"
                className="mt-0.5 h-3 w-3"
                checked={s.completed}
                onChange={(e) => markSection(s.id, e.target.checked ? 'completed' : 'in_progress')}
                aria-label={`Mark ${s.title} complete`}
              />
              <button
                className={cn(
                  "flex-1 text-left text-xs hover:underline",
                  activeId === s.id ? "text-primary font-medium" : "text-blue-100"
                )}
                onClick={() => handleScrollToSection(s.id)}
                aria-current={activeId === s.id ? "true" : undefined}
              >
                {s.title}
              </button>
              {typeof s.etaMin === 'number' && (
                <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                  <Clock className="h-2.5 w-2.5" /> {s.etaMin}m
                </span>
              )}
              {!s.completed && (
                <button
                  className="text-[10px] text-[#f97316] hover:underline"
                  onClick={() => markSection(s.id, 'needs_review')}
                  aria-label={`Mark ${s.title} needs review`}
                >
                  review
                </button>
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
