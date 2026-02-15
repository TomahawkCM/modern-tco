"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, Target, Clock, CheckCircle2, TrendingUp } from "lucide-react";

interface MicrolearningProgressProps {
  moduleId: string;
  totalSections: number;
  estimatedMinutes: number;
}

export function MicrolearningProgress({
  moduleId,
  totalSections,
  estimatedMinutes,
}: MicrolearningProgressProps) {
  const [completedSections, setCompletedSections] = useState(0);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);

  useEffect(() => {
    // Load progress from localStorage
    const progressKey = `module-progress-${moduleId}`;
    const progress = JSON.parse(localStorage.getItem(progressKey) || "{}");
    const completed = progress.completedSections?.length || 0;

    setCompletedSections(completed);
    setCompletionPercentage(Math.round((completed / totalSections) * 100));
    setTimeSpent(progress.timeSpent || 0);
  }, [moduleId, totalSections]);

  const remainingMinutes = Math.max(
    0,
    estimatedMinutes - Math.round((completionPercentage * estimatedMinutes) / 100)
  );

  return (
    <div className="glass-card border-archon-border-bright/30 cyber-border rounded-lg p-4">
      {/* Compact Header Row */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/20 p-2">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-archon-text-primary archon-text-glow text-sm font-bold">
              Microlearning Progress
            </h3>
            <p className="text-archon-text-secondary text-xs">
              {completedSections} of {totalSections} sections • {remainingMinutes}m remaining
            </p>
          </div>
        </div>

        <Badge className="border-primary/30 bg-gradient-to-r from-primary to-accent px-3 py-1 font-bold text-foreground">
          {completionPercentage}% Complete
        </Badge>
      </div>

      {/* Progress Bar */}
      <div className="relative mb-4 h-2 w-full overflow-hidden rounded-full border border-primary/30 bg-primary/20">
        <div
          className="progress-glow h-full bg-gradient-to-r from-primary to-accent transition-all"
          style={{ width: `${completionPercentage}%` }}
        />
      </div>

      {/* Compact Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="flex items-center gap-2">
          <div className="rounded-md bg-[#f97316]/20 p-1.5">
            <Trophy className="h-4 w-4 text-[#f97316] drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
          </div>
          <div>
            <div className="text-lg font-bold text-primary">{completedSections}</div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="rounded-md bg-primary/20 p-1.5">
            <Target className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="text-archon-text-primary text-lg font-bold">
              {totalSections - completedSections}
            </div>
            <div className="text-archon-text-muted text-xs">Remaining</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-archon-purple-primary/20 rounded-md p-1.5">
            <Clock className="text-archon-purple-primary h-4 w-4" />
          </div>
          <div>
            <div className="text-archon-text-primary text-lg font-bold">{remainingMinutes}m</div>
            <div className="text-archon-text-muted text-xs">Time Left</div>
          </div>
        </div>
      </div>

      {/* Completion Badge */}
      {completionPercentage === 100 && (
        <div className="mt-4 rounded-lg border border-green-400/30 bg-[#22c55e]/10 p-3 text-center backdrop-blur-sm">
          <div className="mb-1 flex items-center justify-center gap-2">
            <Trophy className="h-6 w-6 text-[#f97316] drop-shadow-[0_0_10px_rgba(250,204,21,0.7)]" />
            <p className="font-bold text-[#22c55e]">Module Complete!</p>
          </div>
          <p className="text-sm text-[#22c55e]">Ready for practice questions and assessment</p>
        </div>
      )}
    </div>
  );
}

export default MicrolearningProgress;
