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
    estimatedMinutes - Math.round(completionPercentage * estimatedMinutes / 100)
  );

  return (
    <div className="glass-card border-archon-border-bright/30 rounded-lg p-4 cyber-border">
      {/* Compact Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/20 rounded-lg">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-archon-text-primary archon-text-glow">
              Microlearning Progress
            </h3>
            <p className="text-xs text-archon-text-secondary">
              {completedSections} of {totalSections} sections • {remainingMinutes}m remaining
            </p>
          </div>
        </div>

        <Badge className="bg-gradient-to-r from-primary to-accent border-primary/30 text-foreground font-bold px-3 py-1">
          {completionPercentage}% Complete
        </Badge>
      </div>

      {/* Progress Bar */}
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-primary/20 border border-primary/30 mb-4">
        <div
          className="h-full bg-gradient-to-r from-primary to-accent transition-all progress-glow"
          style={{ width: `${completionPercentage}%` }}
        />
      </div>

      {/* Compact Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#f97316]/20 rounded-md">
            <Trophy className="h-4 w-4 text-[#f97316] drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
          </div>
          <div>
            <div className="text-lg font-bold text-primary">{completedSections}</div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-primary/20 rounded-md">
            <Target className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="text-lg font-bold text-archon-text-primary">{totalSections - completedSections}</div>
            <div className="text-xs text-archon-text-muted">Remaining</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-archon-purple-primary/20 rounded-md">
            <Clock className="h-4 w-4 text-archon-purple-primary" />
          </div>
          <div>
            <div className="text-lg font-bold text-archon-text-primary">{remainingMinutes}m</div>
            <div className="text-xs text-archon-text-muted">Time Left</div>
          </div>
        </div>
      </div>

      {/* Completion Badge */}
      {completionPercentage === 100 && (
        <div className="mt-4 rounded-lg border border-green-400/30 bg-[#22c55e]/10 p-3 text-center backdrop-blur-sm">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Trophy className="h-6 w-6 text-[#f97316] drop-shadow-[0_0_10px_rgba(250,204,21,0.7)]" />
            <p className="font-bold text-[#22c55e]">Module Complete!</p>
          </div>
          <p className="text-sm text-[#22c55e]">
            Ready for practice questions and assessment
          </p>
        </div>
      )}
    </div>
  );
}

export default MicrolearningProgress;
