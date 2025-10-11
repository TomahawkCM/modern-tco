"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  BookOpen,
  Server,
  Layers,
  Wrench,
  MessageSquare,
  Target,
  Play,
  Navigation,
  BarChart3,
} from "lucide-react";
import { TCODomain, TCO_DOMAIN_WEIGHTS } from "@/types/exam";

interface DomainData {
  domain: string;
  score: number;
  fullMark: number;
  weight: number;
}

interface DomainRadarChartProps {
  domainScores: Partial<Record<
    TCODomain,
    {
      score: number;
      questionsAnswered: number;
      correctAnswers: number;
      timeSpent: number;
    }
  >>;
}

export function DomainRadarChart({ domainScores }: DomainRadarChartProps) {
  // Updated icons for new TCO domains
  const domainIcons = {
    [TCODomain.ASKING_QUESTIONS]: MessageSquare,
    [TCODomain.REFINING_QUESTIONS]: Target,
    [TCODomain.REFINING_TARGETING]: Target,
    [TCODomain.TAKING_ACTION]: Play,
    [TCODomain.NAVIGATION_MODULES]: Navigation,
    [TCODomain.REPORTING_EXPORT]: BarChart3,
    // Additional domain icons
    [TCODomain.SECURITY]: Shield,
    [TCODomain.FUNDAMENTALS]: BookOpen,
    [TCODomain.TROUBLESHOOTING]: Wrench,
  };

  // Updated labels for official TCO domains
  const domainLabels = {
    [TCODomain.ASKING_QUESTIONS]: "Asking Questions",
    [TCODomain.REFINING_QUESTIONS]: "Refining Questions",
    [TCODomain.REFINING_TARGETING]: "Refining Questions & Targeting",
    [TCODomain.TAKING_ACTION]: "Taking Action",
    [TCODomain.NAVIGATION_MODULES]: "Navigation and Basic Module Functions",
    [TCODomain.REPORTING_EXPORT]: "Report Generation and Data Export",
    // Additional domain labels
    [TCODomain.SECURITY]: "Security",
    [TCODomain.FUNDAMENTALS]: "Fundamentals",
    [TCODomain.TROUBLESHOOTING]: "Troubleshooting",
  };

  const data: DomainData[] = Object.entries(domainScores).map(([domain, stats]) => ({
    domain: domainLabels[domain as TCODomain],
    score: (stats?.score) || 0,
    fullMark: 100,
    weight: TCO_DOMAIN_WEIGHTS[domain as TCODomain] || 0,
  }));

  const averageScore = Math.round(data.reduce((sum, item) => sum + item.score, 0) / data.length);
  const strongestDomain = data.reduce((max, item) => (item.score > max.score ? item : max));
  const weakestDomain = data.reduce((min, item) => (item.score < min.score ? item : min));

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-[#22c55e] border-green-400";
    if (score >= 70) return "text-primary border-blue-400";
    if (score >= 60) return "text-[#f97316] border-yellow-400";
    return "text-red-400 border-red-400";
  };

  return (
    <Card className="glass border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Shield className="h-5 w-5 text-tanium-accent" />
          Domain Performance Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Radar Chart */}
          <div className="space-y-4">
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={data}>
                <PolarGrid gridType="polygon" stroke="#374151" opacity={0.3} />
                <PolarAngleAxis dataKey="domain" tick={{ fontSize: 12, fill: "#9CA3AF" }} />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  tick={{ fontSize: 10, fill: "#6B7280" }}
                  axisLine={false}
                />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.2}
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#3B82F6" }}
                />
              </RadarChart>
            </ResponsiveContainer>

            {/* Overall Stats */}
            <div className="text-center">
              <div className="mb-1 text-2xl font-bold text-tanium-accent">{averageScore}%</div>
              <div className="text-sm text-muted-foreground">Overall Average</div>
            </div>
          </div>

          {/* Domain Breakdown */}
          <div className="space-y-4">
            <h4 className="font-medium text-foreground">Domain Breakdown</h4>
            <div className="space-y-3">
              {Object.entries(domainScores).map(([domain, stats]) => {
                const Icon = domainIcons[domain as TCODomain];
                const label = domainLabels[domain as TCODomain];

                return (
                  <div
                    key={domain}
                    className="glass flex items-center justify-between rounded-lg border border-white/5 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4 text-tanium-accent" />
                      <div>
                        <div className="text-sm font-medium text-foreground">{label}</div>
                        <div className="text-xs text-muted-foreground">
                          {stats.questionsAnswered} questions
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className={getScoreColor(stats.score)}>
                      {stats.score || 0}%
                    </Badge>
                  </div>
                );
              })}
            </div>

            {/* Quick Insights */}
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Strongest Domain</span>
                <Badge variant="secondary" className="bg-green-900/20 text-[#22c55e]">
                  {strongestDomain.domain}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Needs Focus</span>
                <Badge variant="secondary" className="bg-red-900/20 text-red-400">
                  {weakestDomain.domain}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
