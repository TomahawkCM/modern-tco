"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, CheckCircle2, Target, Clock } from "lucide-react";
import {
  calculateModuleProgress,
  type ModuleProgress,
} from "@/lib/progressVisualization";

interface ModuleCompletionDashboardProps {
  /** Custom className */
  className?: string;
  /** Show only specific module */
  moduleId?: string;
}

/**
 * Module Completion Dashboard
 *
 * Displays completion progress for all modules or a specific module
 *
 * Research: Progress tracking increases goal achievement by 32% (Locke & Latham, 2002)
 */
export function ModuleCompletionDashboard({
  className,
  moduleId,
}: ModuleCompletionDashboardProps) {
  const [modules, setModules] = useState<ModuleProgress[]>([]);
  const [totalProgress, setTotalProgress] = useState(0);

  useEffect(() => {
    loadProgress();

    // Listen for review updates
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "review-items") {
        loadProgress();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [moduleId]);

  function loadProgress() {
    let moduleData = calculateModuleProgress();

    if (moduleId) {
      moduleData = moduleData.filter(m => m.moduleId === moduleId);
    }

    setModules(moduleData);

    // Calculate overall progress
    if (moduleData.length > 0) {
      const avgCompletion = moduleData.reduce((sum, m) => sum + m.completionPercentage, 0) / moduleData.length;
      setTotalProgress(avgCompletion);
    }
  }

  if (modules.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-purple-500" />
            Module Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-12">
          <p className="text-gray-400">No module data yet</p>
          <p className="text-sm text-gray-500 mt-2">
            Start reviewing to track your module progress
          </p>
        </CardContent>
      </Card>
    );
  }

  const getCompletionColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-400 border-green-400";
    if (percentage >= 60) return "text-blue-400 border-blue-400";
    if (percentage >= 40) return "text-yellow-400 border-yellow-400";
    return "text-orange-400 border-orange-400";
  };

  const getRetentionColor = (retention: number) => {
    if (retention >= 90) return "text-green-400";
    if (retention >= 70) return "text-blue-400";
    if (retention >= 50) return "text-yellow-400";
    return "text-orange-400";
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-purple-500" />
            Module Progress
          </CardTitle>
          {!moduleId && (
            <Badge variant="outline" className="text-purple-400">
              {Math.round(totalProgress)}% Overall
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Summary (if viewing all modules) */}
        {!moduleId && modules.length > 1 && (
          <div className="rounded-lg border border-purple-500/20 bg-purple-500/5 p-4">
            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Overall Completion</span>
                <span className="text-sm font-semibold text-purple-400">
                  {Math.round(totalProgress)}%
                </span>
              </div>
              <Progress value={totalProgress} className="h-2" />
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xs text-gray-500 mb-1">Modules</div>
                <div className="text-lg font-bold text-purple-400">{modules.length}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Completed</div>
                <div className="text-lg font-bold text-green-400">
                  {modules.filter(m => m.completionPercentage >= 80).length}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">In Progress</div>
                <div className="text-lg font-bold text-blue-400">
                  {modules.filter(m => m.completionPercentage > 0 && m.completionPercentage < 80).length}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Module List */}
        <div className="space-y-4">
          {modules.map((module, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-gray-700/50 bg-gray-800/30 p-4 space-y-3"
            >
              {/* Module Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-200">{module.moduleName}</h4>
                    {module.completionPercentage >= 80 && (
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      {module.totalConcepts} concepts
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Last: {new Date(module.lastActivity).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={getCompletionColor(module.completionPercentage)}
                >
                  {Math.round(module.completionPercentage)}%
                </Badge>
              </div>

              {/* Progress Bar */}
              <div>
                <Progress value={module.completionPercentage} className="h-2" />
              </div>

              {/* Module Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded border border-gray-700 bg-gray-800/50 p-2 text-center">
                  <div className="text-xs text-gray-500 mb-1">Started</div>
                  <div className="text-sm font-semibold text-blue-400">
                    {module.conceptsStarted}
                  </div>
                </div>
                <div className="rounded border border-gray-700 bg-gray-800/50 p-2 text-center">
                  <div className="text-xs text-gray-500 mb-1">Mastered</div>
                  <div className="text-sm font-semibold text-green-400">
                    {module.conceptsMastered}
                  </div>
                </div>
                <div className="rounded border border-gray-700 bg-gray-800/50 p-2 text-center">
                  <div className="text-xs text-gray-500 mb-1">Retention</div>
                  <div className={`text-sm font-semibold ${getRetentionColor(module.averageRetention)}`}>
                    {Math.round(module.averageRetention)}%
                  </div>
                </div>
              </div>

              {/* Progress Breakdown */}
              <div className="flex items-center gap-2 text-xs">
                <div className="flex-1 flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-gray-400">
                    Mastered: {module.conceptsMastered}
                  </span>
                </div>
                <div className="flex-1 flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-gray-400">
                    In Progress: {module.conceptsStarted - module.conceptsMastered}
                  </span>
                </div>
                <div className="flex-1 flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-gray-600" />
                  <span className="text-gray-400">
                    Remaining: {module.totalConcepts - module.conceptsStarted}
                  </span>
                </div>
              </div>

              {/* Completion Status */}
              {module.completionPercentage >= 80 ? (
                <div className="text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded px-2 py-1">
                  ✓ Module Complete - Excellent Work!
                </div>
              ) : module.completionPercentage >= 50 ? (
                <div className="text-xs text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded px-2 py-1">
                  ⚡ Making Great Progress!
                </div>
              ) : module.completionPercentage > 0 ? (
                <div className="text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 rounded px-2 py-1">
                  📚 Keep Going!
                </div>
              ) : (
                <div className="text-xs text-gray-400 bg-gray-500/10 border border-gray-500/20 rounded px-2 py-1">
                  🎯 Ready to Start
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default ModuleCompletionDashboard;
