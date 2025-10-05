"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, TrendingUp, CheckCircle2 } from "lucide-react";

interface DomainProgress {
  domain: string;
  totalSections: number;
  completedSections: number;
  masteryPercentage: number;
  confidenceLevel: "low" | "medium" | "high";
  blueprintWeight: number; // % of exam
}

interface DomainMasteryWheelProps {
  domains: DomainProgress[];
  overallMastery?: number;
}

export default function DomainMasteryWheel({
  domains,
  overallMastery = 0,
}: DomainMasteryWheelProps) {
  // TCO Certification color scheme
  const domainColors = [
    "bg-blue-500", // Asking Questions (22%)
    "bg-purple-500", // Refining & Targeting (23%)
    "bg-orange-500", // Taking Action (15%)
    "bg-green-500", // Navigation (23%)
    "bg-pink-500", // Reporting (17%)
    "bg-cyan-500", // Foundation (0% but still important)
  ];

  const getConfidenceColor = (level: string) => {
    switch (level) {
      case "high":
        return "text-green-500";
      case "medium":
        return "text-yellow-500";
      case "low":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const getConfidenceText = (level: string) => {
    switch (level) {
      case "high":
        return "Strong";
      case "medium":
        return "Developing";
      case "low":
        return "Needs Work";
      default:
        return "Not Started";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Domain Mastery Overview
          </CardTitle>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">
              {Math.round(overallMastery)}%
            </div>
            <p className="text-xs text-muted-foreground">Overall</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Domain Progress Bars */}
        <div className="space-y-4">
          {domains.map((domain, idx) => {
            const color = domainColors[idx % domainColors.length];
            const completionPercentage =
              (domain.completedSections / domain.totalSections) * 100;

            return (
              <div key={domain.domain} className="space-y-2">
                {/* Domain Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${color}`} />
                    <span className="font-medium text-sm">{domain.domain}</span>
                    {domain.blueprintWeight > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {domain.blueprintWeight}% of exam
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                      {domain.completedSections}/{domain.totalSections} sections
                    </span>
                    <span
                      className={`text-xs font-medium ${getConfidenceColor(
                        domain.confidenceLevel
                      )}`}
                    >
                      {getConfidenceText(domain.confidenceLevel)}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="relative">
                  <Progress
                    value={completionPercentage}
                    className="h-3"
                    style={
                      {
                        "--progress-background": `hsl(var(--${color.replace(
                          "bg-",
                          ""
                        )}))`,
                      } as React.CSSProperties
                    }
                  />
                  {completionPercentage === 100 && (
                    <CheckCircle2 className="absolute right-1 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                  )}
                </div>

                {/* Mastery Indicator */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    Mastery: {Math.round(domain.masteryPercentage)}%
                  </span>
                  {domain.masteryPercentage >= 80 && (
                    <span className="text-green-500 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      Ready for exam
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="pt-4 border-t">
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div>
              <p className="font-medium mb-1">Progress</p>
              <p className="text-muted-foreground">Sections completed</p>
            </div>
            <div>
              <p className="font-medium mb-1">Confidence</p>
              <p className="text-muted-foreground">Self-assessment</p>
            </div>
            <div>
              <p className="font-medium mb-1">Mastery</p>
              <p className="text-muted-foreground">Quiz + review score</p>
            </div>
          </div>
        </div>

        {/* Study Recommendations */}
        {domains.some((d) => d.masteryPercentage < 70) && (
          <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
            <p className="text-sm font-medium text-orange-500 mb-1">
              Focus Areas
            </p>
            <p className="text-xs text-muted-foreground">
              {domains
                .filter((d) => d.masteryPercentage < 70)
                .map((d) => d.domain)
                .join(", ")}{" "}
              need more practice. Try domain-specific drills!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
