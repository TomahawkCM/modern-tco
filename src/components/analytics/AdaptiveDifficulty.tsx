"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { useProgress } from "@/contexts/ProgressContext";
import { TCODomain } from "@/types/exam";
import {
  Activity,
  Brain,
  Gauge,
  Settings,
  Shield,
  Target,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useState } from "react";

interface DifficultyLevel {
  level: "beginner" | "intermediate" | "advanced" | "expert";
  label: string;
  description: string;
  color: string;
  icon: any;
}

interface AdaptiveSettings {
  enabled: boolean;
  sensitivity: "conservative" | "moderate" | "aggressive";
  minAccuracy: number;
  targetAccuracy: number;
  adjustmentThreshold: number;
}

const difficultyLevels: Record<string, DifficultyLevel> = {
  beginner: {
    level: "beginner",
    label: "Beginner",
    description: "Basic concepts and fundamental knowledge",
    color: "text-[#22c55e] border-green-400",
    icon: Shield,
  },
  intermediate: {
    level: "intermediate",
    label: "Intermediate",
    description: "Practical application and common scenarios",
    color: "text-primary border-blue-400",
    icon: Target,
  },
  advanced: {
    level: "advanced",
    label: "Advanced",
    description: "Complex scenarios and edge cases",
    color: "text-orange-400 border-orange-400",
    icon: Activity,
  },
  expert: {
    level: "expert",
    label: "Expert",
    description: "Master-level concepts and expert scenarios",
    color: "text-red-400 border-red-400",
    icon: Zap,
  },
};

export function AdaptiveDifficulty() {
  const { getDomainStats, getOverallStats, state } = useProgress();
  const [settings, setSettings] = useState<AdaptiveSettings>({
    enabled: true,
    sensitivity: "moderate",
    minAccuracy: 60,
    targetAccuracy: 75,
    adjustmentThreshold: 5,
  });

  const [domainDifficulty, setDomainDifficulty] = useState<Record<TCODomain, string>>({
    [TCODomain.ASKING_QUESTIONS]: "intermediate",
    [TCODomain.REFINING_QUESTIONS]: "intermediate",
    [TCODomain.REFINING_TARGETING]: "intermediate",
    [TCODomain.TAKING_ACTION]: "intermediate",
    [TCODomain.NAVIGATION_MODULES]: "intermediate",
    [TCODomain.REPORTING_EXPORT]: "intermediate",
    [TCODomain.SECURITY]: "intermediate",
    [TCODomain.FUNDAMENTALS]: "intermediate",
    [TCODomain.TROUBLESHOOTING]: "intermediate",
  });

  const domainStats = getDomainStats();
  const overallStats = getOverallStats();

  // Calculate recommended difficulty adjustments
  const calculateDifficultyAdjustments = () => {
    const adjustments: Record<TCODomain, { current: string; recommended: string; reason: string }> =
      {} as any;

    domainStats.forEach((domain) => {
      const currentLevel = domainDifficulty[domain.domain];
      let recommendedLevel = currentLevel;
      let reason = "Performance is stable";

      if (domain.questionsAnswered >= 5) {
        // Only adjust if enough data
        const accuracy = domain.percentage;
        const recentTrend = calculateRecentTrend(domain.domain);

        if (accuracy >= settings.targetAccuracy + settings.adjustmentThreshold) {
          // Performance is high, increase difficulty
          if (currentLevel === "beginner") recommendedLevel = "intermediate";
          else if (currentLevel === "intermediate") recommendedLevel = "advanced";
          else if (currentLevel === "advanced") recommendedLevel = "expert";

          if (recommendedLevel !== currentLevel) {
            reason = `High accuracy (${accuracy}%) suggests readiness for harder questions`;
          }
        } else if (accuracy < settings.minAccuracy) {
          // Performance is low, decrease difficulty
          if (currentLevel === "expert") recommendedLevel = "advanced";
          else if (currentLevel === "advanced") recommendedLevel = "intermediate";
          else if (currentLevel === "intermediate") recommendedLevel = "beginner";

          if (recommendedLevel !== currentLevel) {
            reason = `Low accuracy (${accuracy}%) suggests need for easier questions`;
          }
        } else if (recentTrend === "improving" && accuracy >= settings.targetAccuracy) {
          // Consistent improvement, consider increasing
          if (settings.sensitivity === "aggressive") {
            if (currentLevel === "beginner") recommendedLevel = "intermediate";
            else if (currentLevel === "intermediate") recommendedLevel = "advanced";
            reason = "Consistent improvement trend detected";
          }
        } else if (recentTrend === "declining" && accuracy < settings.targetAccuracy) {
          // Declining performance, consider decreasing
          if (settings.sensitivity !== "conservative") {
            if (currentLevel === "expert") recommendedLevel = "advanced";
            else if (currentLevel === "advanced") recommendedLevel = "intermediate";
            reason = "Declining performance trend detected";
          }
        }
      } else {
        reason = "Insufficient data for adjustment";
      }

      adjustments[domain.domain] = {
        current: currentLevel,
        recommended: recommendedLevel,
        reason,
      };
    });

    return adjustments;
  };

  const calculateRecentTrend = (domain: TCODomain): "improving" | "declining" | "stable" => {
    // Mock implementation - in real app, analyze recent session history
    const domainData = domainStats.find((d) => d.domain === domain);
    if (!domainData || domainData.questionsAnswered < 10) return "stable";

    // Simulate trend analysis based on current performance
    if (domainData.percentage > 80) return "improving";
    if (domainData.percentage < 60) return "declining";
    return "stable";
  };

  const applyDifficultyAdjustment = (domain: TCODomain, newLevel: string) => {
    setDomainDifficulty((prev) => ({
      ...prev,
      [domain]: newLevel,
    }));
  };

  const applyAllRecommendations = () => {
    const adjustments = calculateDifficultyAdjustments();
    const newDifficulty = { ...domainDifficulty };

    Object.entries(adjustments).forEach(([domain, adjustment]) => {
      if (adjustment.recommended !== adjustment.current) {
        newDifficulty[domain as TCODomain] = adjustment.recommended;
      }
    });

    setDomainDifficulty(newDifficulty);
  };

  const adjustments = calculateDifficultyAdjustments();
  const hasRecommendations = Object.values(adjustments).some(
    (adj) => adj.recommended !== adj.current
  );

  return (
    <Card className="glass border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-foreground">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-tanium-accent" />
            Adaptive Difficulty System
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Auto-Adjust</span>
            <Switch
              checked={settings.enabled}
              onCheckedChange={(enabled) => setSettings((prev) => ({ ...prev, enabled }))}
            />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Status */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <h4 className="font-medium text-foreground">Current Difficulty Settings</h4>
            {Object.entries(domainDifficulty).map(([domain, level]) => {
              const difficultyInfo = difficultyLevels[level];
              const Icon = difficultyInfo.icon;

              return (
                <div
                  key={domain}
                  className="glass flex items-center justify-between rounded-lg border border-white/5 p-3"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-tanium-accent" />
                    <span className="text-sm text-foreground">{domain}</span>
                  </div>
                  <Badge variant="outline" className={difficultyInfo.color}>
                    {difficultyInfo.label}
                  </Badge>
                </div>
              );
            })}
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-foreground">Adjustment Settings</h4>
            <div className="glass space-y-4 rounded-lg border border-white/5 p-4">
              <div>
                <label htmlFor="sensitivity-select" className="mb-2 block text-sm text-muted-foreground">
                  Sensitivity
                </label>
                <select
                  id="sensitivity-select"
                  value={settings.sensitivity}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, sensitivity: e.target.value as any }))
                  }
                  className="w-full rounded border border-gray-600 bg-card p-2 text-sm text-foreground"
                  aria-label="Select sensitivity level for adaptive difficulty adjustments"
                >
                  <option value="conservative">Conservative</option>
                  <option value="moderate">Moderate</option>
                  <option value="aggressive">Aggressive</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm text-muted-foreground">
                  Target Accuracy: {settings.targetAccuracy}%
                </label>
                <Progress value={settings.targetAccuracy} className="h-2" />
              </div>
              <div>
                <label className="mb-2 block text-sm text-muted-foreground">
                  Min Accuracy: {settings.minAccuracy}%
                </label>
                <Progress value={settings.minAccuracy} className="h-2" />
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {settings.enabled && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-foreground">Recommended Adjustments</h4>
              {hasRecommendations && (
                <Button
                  size="sm"
                  onClick={applyAllRecommendations}
                  className="bg-tanium-accent hover:bg-blue-600"
                >
                  Apply All
                </Button>
              )}
            </div>

            {!hasRecommendations ? (
              <div className="py-8 text-center">
                <Gauge className="mx-auto mb-4 h-12 w-12 text-[#22c55e]" />
                <h3 className="mb-2 font-medium text-foreground">Difficulty Levels Optimal</h3>
                <p className="text-muted-foreground">
                  Current difficulty settings are well-suited to your performance across all
                  domains.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(adjustments).map(([domain, adjustment]) => {
                  if (adjustment.recommended === adjustment.current) return null;

                  const currentInfo = difficultyLevels[adjustment.current];
                  const recommendedInfo = difficultyLevels[adjustment.recommended];
                  const isIncrease =
                    difficultyLevels[adjustment.recommended].level >
                    difficultyLevels[adjustment.current].level;

                  return (
                    <div key={domain} className="glass rounded-lg border border-white/10 p-4">
                      <div className="mb-3 flex items-start justify-between">
                        <div>
                          <h5 className="font-medium text-foreground">{domain}</h5>
                          <p className="text-sm text-muted-foreground">{adjustment.reason}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            applyDifficultyAdjustment(domain as TCODomain, adjustment.recommended)
                          }
                          className="shrink-0"
                        >
                          Apply
                        </Button>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={currentInfo.color}>
                            {currentInfo.label}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-2">
                          {isIncrease ? (
                            <TrendingUp className="h-4 w-4 text-orange-400" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-primary" />
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={recommendedInfo.color}>
                            {recommendedInfo.label}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Information Panel */}
        <div className="glass rounded-lg border border-white/10 p-4">
          <h4 className="mb-3 flex items-center gap-2 font-medium text-foreground">
            <Settings className="h-4 w-4 text-tanium-accent" />
            How Adaptive Difficulty Works
          </h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              • <strong>Performance Analysis:</strong> Monitors your accuracy and response patterns
            </li>
            <li>
              • <strong>Trend Detection:</strong> Identifies improving or declining performance
            </li>
            <li>
              • <strong>Smart Adjustments:</strong> Suggests difficulty changes based on your
              progress
            </li>
            <li>
              • <strong>Domain-Specific:</strong> Each TCO domain has independent difficulty
              settings
            </li>
            <li>
              • <strong>Configurable:</strong> Adjust sensitivity and accuracy thresholds to your
              preference
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
