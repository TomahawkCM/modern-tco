"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, Clock, Target } from "lucide-react";
import Link from "next/link";

interface MicroSection {
  id: string;
  title: string;
  moduleId: string;
  moduleName: string;
  estimatedMinutes: number;
  completed: boolean;
  inProgress: boolean;
  locked: boolean; // Requires previous section completion
}

interface ModuleProgress {
  moduleId: string;
  moduleName: string;
  color: string;
  totalSections: number;
  completedSections: number;
  totalMinutes: number;
  sections: MicroSection[];
}

interface MicroSectionProgressGridProps {
  modules: ModuleProgress[];
  totalCompleted?: number;
  totalSections?: number;
}

export default function MicroSectionProgressGrid({
  modules,
  totalCompleted = 0,
  totalSections = 83,
}: MicroSectionProgressGridProps) {
  const overallProgress = (totalCompleted / totalSections) * 100;
  const totalMinutes = modules.reduce((sum, m) => sum + m.totalMinutes, 0);
  const completedMinutes = modules.reduce((sum, m) => {
    const completed = m.sections.filter((s) => s.completed).length;
    const avgMinutesPerSection = m.totalMinutes / m.totalSections;
    return sum + completed * avgMinutesPerSection;
  }, 0);

  // Module colors matching DomainMasteryWheel
  const moduleColors: Record<string, string> = {
    foundation: "bg-cyan-500",
    "module-1": "bg-primary",
    "module-2": "bg-accent",
    "module-3": "bg-orange-500",
    "module-4": "bg-[#22c55e]",
    "module-5": "bg-pink-500",
  };

  const getSectionIcon = (section: MicroSection) => {
    if (section.completed) {
      return <CheckCircle2 className="h-4 w-4 text-[#22c55e]" />;
    }
    if (section.inProgress) {
      return <Clock className="h-4 w-4 text-[#f97316]" />;
    }
    if (section.locked) {
      return <Circle className="h-4 w-4 text-gray-600" />;
    }
    return <Circle className="h-4 w-4 text-muted-foreground" />;
  };

  const getSectionClasses = (section: MicroSection) => {
    const baseClasses =
      "flex items-center gap-2 p-2 rounded-md transition-all cursor-pointer hover:bg-accent";

    if (section.completed) {
      return `${baseClasses} bg-[#22c55e]/10 border border-[#22c55e]/20`;
    }
    if (section.inProgress) {
      return `${baseClasses} bg-[#f97316]/10 border border-[#f97316]/20`;
    }
    if (section.locked) {
      return `${baseClasses} opacity-50 cursor-not-allowed`;
    }
    return `${baseClasses} hover:border-primary/20`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Learning Path Progress
          </CardTitle>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">
              {totalCompleted}/{totalSections}
            </div>
            <p className="text-xs text-muted-foreground">Sections Complete</p>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Overall Progress</span>
            <span className="font-medium">{Math.round(overallProgress)}%</span>
          </div>
          <Progress value={overallProgress} className="h-3" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              {Math.round(completedMinutes)} / {totalMinutes} minutes
            </span>
            <span>{Math.round((completedMinutes / 60) * 10) / 10} hours</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Module Sections Grid */}
        {modules.map((module) => {
          const moduleProgress =
            (module.completedSections / module.totalSections) * 100;
          const color = moduleColors[module.moduleId] || "bg-gray-500";

          return (
            <div key={module.moduleId} className="space-y-3">
              {/* Module Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${color}`} />
                  <h3 className="font-medium">{module.moduleName}</h3>
                  <Badge variant="outline" className="text-xs">
                    {module.completedSections}/{module.totalSections}
                  </Badge>
                </div>
                <span className="text-sm text-muted-foreground">
                  {Math.round(moduleProgress)}%
                </span>
              </div>

              {/* Module Progress Bar */}
              <Progress value={moduleProgress} className="h-2" />

              {/* Section Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {module.sections.map((section) => (
                  <div
                    key={section.id}
                    className={getSectionClasses(section)}
                    onClick={() => {
                      if (!section.locked) {
                        // Navigate to section
                        window.location.href = `/study/${module.moduleId}#${section.id}`;
                      }
                    }}
                  >
                    {getSectionIcon(section)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {section.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {section.estimatedMinutes} min
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Legend */}
        <div className="pt-4 border-t">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#22c55e]" />
              <span className="text-muted-foreground">Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#f97316]" />
              <span className="text-muted-foreground">In Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <Circle className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <Circle className="h-4 w-4 text-gray-600" />
              <span className="text-muted-foreground">Locked</span>
            </div>
          </div>
        </div>

        {/* Study Recommendations */}
        {overallProgress < 100 && (
          <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
            <p className="text-sm font-medium text-primary mb-1">
              Continue Your Journey
            </p>
            <p className="text-xs text-muted-foreground">
              {totalSections - totalCompleted} sections remaining. Complete{" "}
              {Math.min(5, totalSections - totalCompleted)} today to stay on
              track for your 20-hour goal!
            </p>
          </div>
        )}

        {overallProgress === 100 && (
          <div className="p-3 bg-[#22c55e]/10 border border-[#22c55e]/20 rounded-lg text-center">
            <p className="text-sm font-medium text-[#22c55e]">
              🎉 All Sections Complete!
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Ready for practice exams and certification assessment
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
