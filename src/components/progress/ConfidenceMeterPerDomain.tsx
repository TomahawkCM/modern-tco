"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Brain,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Info,
} from "lucide-react";
import { useState } from "react";

interface DomainConfidence {
  domain: string;
  confidence: number; // 0-100 scale
  blueprintWeight: number; // % of exam
  lastUpdated?: Date;
  objectivesMastered?: number; // Number of learning objectives marked as mastered
  totalObjectives?: number; // Total learning objectives in domain
}

interface ConfidenceMeterPerDomainProps {
  domains: DomainConfidence[];
  onUpdate?: (domain: string, confidence: number) => void;
  showRecommendations?: boolean;
}

export default function ConfidenceMeterPerDomain({
  domains,
  onUpdate,
  showRecommendations = true,
}: ConfidenceMeterPerDomainProps) {
  const [editingDomain, setEditingDomain] = useState<string | null>(null);
  const [tempConfidence, setTempConfidence] = useState<number>(50);

  // Domain colors matching DomainMasteryWheel
  const domainColors: Record<string, string> = {
    "Asking Questions": "bg-blue-500",
    Fundamentals: "bg-cyan-500",
    "Navigation and Basic Module Functions": "bg-green-500",
    "Refining Questions & Targeting": "bg-purple-500",
    "Report Generation and Data Export": "bg-pink-500",
    "Taking Action": "bg-orange-500",
  };

  const getConfidenceLevel = (confidence: number) => {
    if (confidence >= 80) return { label: "High", color: "text-green-500" };
    if (confidence >= 50)
      return { label: "Moderate", color: "text-yellow-500" };
    return { label: "Low", color: "text-red-500" };
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 80)
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    if (confidence >= 50)
      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    return <AlertCircle className="h-4 w-4 text-red-500" />;
  };

  const handleStartEdit = (domain: string, currentConfidence: number) => {
    setEditingDomain(domain);
    setTempConfidence(currentConfidence);
  };

  const handleSaveConfidence = (domain: string) => {
    if (onUpdate) {
      onUpdate(domain, tempConfidence);
    }
    setEditingDomain(null);
  };

  const handleCancelEdit = () => {
    setEditingDomain(null);
  };

  // Calculate overall confidence (weighted by exam blueprint)
  const weightedConfidence = domains.reduce((sum, d) => {
    return sum + d.confidence * (d.blueprintWeight / 100);
  }, 0);

  // Find domains needing attention (< 50% confidence + high exam weight)
  const needsAttention = domains.filter(
    (d) => d.confidence < 50 && d.blueprintWeight >= 20
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Self-Assessment Confidence
          </CardTitle>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">
              {Math.round(weightedConfidence)}%
            </div>
            <p className="text-xs text-muted-foreground">Weighted Avg</p>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              Self-assessment is a powerful learning tool. Rate your confidence
              honestly to identify areas for focused study. Update as you
              progress through the material.
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Domain Confidence Sliders */}
        {domains.map((domain) => {
          const color =
            domainColors[domain.domain] || domainColors["Fundamentals"];
          const level = getConfidenceLevel(domain.confidence);
          const isEditing = editingDomain === domain.domain;
          const displayConfidence = isEditing
            ? tempConfidence
            : domain.confidence;

          return (
            <div key={domain.domain} className="space-y-2">
              {/* Domain Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1">
                  <div className={`w-3 h-3 rounded-full ${color}`} />
                  <span className="font-medium text-sm">{domain.domain}</span>
                  {domain.blueprintWeight > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {domain.blueprintWeight}% of exam
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {getConfidenceIcon(displayConfidence)}
                  <span className={`text-sm font-medium ${level.color}`}>
                    {displayConfidence}%
                  </span>
                </div>
              </div>

              {/* Slider */}
              {isEditing ? (
                <div className="space-y-2">
                  <Slider
                    value={[tempConfidence]}
                    onValueChange={(value) => setTempConfidence(value[0])}
                    min={0}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleSaveConfidence(domain.domain)}
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </Button>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Adjust to reflect your current confidence level
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${color.replace("bg-", "bg-")} transition-all`}
                      style={{ width: `${displayConfidence}%` }}
                    />
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      handleStartEdit(domain.domain, domain.confidence)
                    }
                  >
                    Update
                  </Button>
                </div>
              )}

              {/* Objectives Progress (if available) */}
              {domain.objectivesMastered !== undefined &&
                domain.totalObjectives !== undefined && (
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      Learning Objectives: {domain.objectivesMastered}/
                      {domain.totalObjectives} mastered
                    </span>
                    {domain.lastUpdated && (
                      <span>
                        Last updated:{" "}
                        {new Date(domain.lastUpdated).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                )}
            </div>
          );
        })}

        {/* Recommendations */}
        {showRecommendations && needsAttention.length > 0 && (
          <div className="pt-4 border-t">
            <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
              <div className="flex items-start gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-orange-500 mt-0.5" />
                <p className="text-sm font-medium text-orange-500">
                  Priority Study Areas
                </p>
              </div>
              <ul className="space-y-1 text-xs text-muted-foreground">
                {needsAttention.map((domain) => (
                  <li key={domain.domain} className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        domainColors[domain.domain] ||
                        domainColors["Fundamentals"]
                      }`}
                    />
                    <strong>{domain.domain}</strong> - Low confidence with{" "}
                    {domain.blueprintWeight}% exam weight. Focus here for
                    maximum impact.
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* High Confidence Domains */}
        {showRecommendations &&
          domains.filter((d) => d.confidence >= 80).length > 0 && (
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-start gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                <p className="text-sm font-medium text-green-500">
                  Strong Areas
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                You feel confident in{" "}
                {domains.filter((d) => d.confidence >= 80).length} domain(s).
                Consider taking practice exams to validate your knowledge!
              </p>
            </div>
          )}

        {/* Confidence Scale Legend */}
        <div className="pt-4 border-t">
          <p className="text-xs font-medium mb-2">Confidence Scale Guide:</p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <p className="font-medium text-green-500">80-100% - High</p>
              <p className="text-muted-foreground">
                Ready for practice exams
              </p>
            </div>
            <div>
              <p className="font-medium text-yellow-500">50-79% - Moderate</p>
              <p className="text-muted-foreground">
                Continue focused study
              </p>
            </div>
            <div>
              <p className="font-medium text-red-500">0-49% - Low</p>
              <p className="text-muted-foreground">Needs priority attention</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
