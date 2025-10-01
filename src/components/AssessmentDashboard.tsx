import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart3,
  TrendingUp,
  Clock,
  Target,
  Award,
  Brain,
  Users,
  Calendar,
  Download,
  Filter,
  RefreshCw,
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { analyticsService } from "../lib/services/analytics-service";
import { progressService } from "../lib/services/progress-service";
import type { UserAnalytics, ContentAnalytics } from "../types/assessment";

interface AssessmentDashboardProps {
  userId: string;
  timeRange?: "7d" | "30d" | "90d" | "1y";
  onTimeRangeChange?: (range: "7d" | "30d" | "90d" | "1y") => void;
}

interface DashboardMetrics {
  totalAssessments: number;
  averageScore: number;
  timeSpent: number;
  streakDays: number;
  domainMastery: Record<string, number>;
  recentActivity: Array<{
    date: string;
    assessments: number;
    averageScore: number;
    timeSpent: number;
  }>;
  performanceTrends: Array<{
    domain: string;
    current: number;
    previous: number;
    change: number;
  }>;
  upcomingAssessments: Array<{
    id: string;
    name: string;
    due: string;
    difficulty: string;
  }>;
  achievements: Array<{
    id: string;
    name: string;
    description: string;
    earned: boolean;
    progress: number;
  }>;
}

const mockMetrics: DashboardMetrics = {
  totalAssessments: 12,
  averageScore: 0.82,
  timeSpent: 450, // minutes
  streakDays: 7,
  domainMastery: {
    "asking-questions": 0.85,
    "refining-questions": 0.78,
    "taking-action": 0.72,
    "navigation-basics": 0.9,
    "reporting-data": 0.68,
  },
  recentActivity: [
    { date: "2024-01-01", assessments: 2, averageScore: 0.85, timeSpent: 45 },
    { date: "2024-01-02", assessments: 1, averageScore: 0.78, timeSpent: 30 },
    { date: "2024-01-03", assessments: 3, averageScore: 0.82, timeSpent: 60 },
    { date: "2024-01-04", assessments: 1, averageScore: 0.9, timeSpent: 25 },
    { date: "2024-01-05", assessments: 2, averageScore: 0.75, timeSpent: 50 },
    { date: "2024-01-06", assessments: 1, averageScore: 0.88, timeSpent: 35 },
    { date: "2024-01-07", assessments: 2, averageScore: 0.83, timeSpent: 40 },
  ],
  performanceTrends: [
    { domain: "Asking Questions", current: 85, previous: 78, change: 7 },
    { domain: "Refining & Targeting", current: 78, previous: 82, change: -4 },
    { domain: "Taking Action", current: 72, previous: 68, change: 4 },
    { domain: "Navigation", current: 90, previous: 85, change: 5 },
    { domain: "Reporting", current: 68, previous: 65, change: 3 },
  ],
  upcomingAssessments: [
    { id: "1", name: "Advanced Targeting Lab", due: "2024-01-10", difficulty: "Advanced" },
    { id: "2", name: "Certification Practice Exam", due: "2024-01-15", difficulty: "Expert" },
  ],
  achievements: [
    {
      id: "1",
      name: "First Steps",
      description: "Complete your first assessment",
      earned: true,
      progress: 100,
    },
    {
      id: "2",
      name: "Perfect Score",
      description: "Score 100% on any assessment",
      earned: true,
      progress: 100,
    },
    {
      id: "3",
      name: "Consistent Learner",
      description: "Study for 7 consecutive days",
      earned: true,
      progress: 100,
    },
    {
      id: "4",
      name: "Domain Expert",
      description: "Master all 5 TCO domains",
      earned: false,
      progress: 60,
    },
    {
      id: "5",
      name: "Speed Demon",
      description: "Complete assessment in under 10 minutes",
      earned: false,
      progress: 0,
    },
  ],
};

const DOMAIN_COLORS = {
  "asking-questions": "#3B82F6",
  "refining-questions": "#EF4444",
  "taking-action": "#10B981",
  "navigation-basics": "#F59E0B",
  "reporting-data": "#8B5CF6",
};

function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = "blue",
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: { value: number; label: string };
  color?: string;
}) {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && <p className="mt-1 text-xs text-gray-500">{subtitle}</p>}
          </div>
          <div className={`rounded-full p-3 bg-${color}-100 dark:bg-${color}-900`}>
            <Icon className={`h-6 w-6 text-${color}-600 dark:text-${color}-400`} />
          </div>
        </div>

        {trend && (
          <div className="mt-4 flex items-center border-t pt-4">
            <TrendingUp
              className={`mr-1 h-4 w-4 ${trend.value >= 0 ? "text-green-600" : "text-red-600"}`}
            />
            <span
              className={`text-sm font-medium ${
                trend.value >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {trend.value >= 0 ? "+" : ""}
              {trend.value}%
            </span>
            <span className="ml-1 text-sm text-gray-500">{trend.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DomainMasteryChart({ data }: { data: Record<string, number> }) {
  const chartData = Object.entries(data).map(([domain, score]) => ({
    domain: domain.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase()),
    score: Math.round(score * 100),
    color: DOMAIN_COLORS[domain as keyof typeof DOMAIN_COLORS] || "#6B7280",
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis dataKey="domain" fontSize={12} angle={-45} textAnchor="end" height={80} />
        <YAxis fontSize={12} domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
        <Tooltip
          formatter={(value) => [`${value}%`, "Mastery"]}
          labelStyle={{ color: "#374151" }}
          contentStyle={{
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            border: "1px solid #E5E7EB",
            borderRadius: "8px",
          }}
        />
        <Bar dataKey="score" radius={[4, 4, 0, 0]} fill="#6B7280">
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function ActivityChart({
  data,
}: {
  data: Array<{ date: string; assessments: number; averageScore: number; timeSpent: number }>;
}) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis
          dataKey="date"
          fontSize={12}
          tickFormatter={(value) =>
            new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
          }
        />
        <YAxis fontSize={12} />
        <Tooltip
          labelFormatter={(value) => new Date(value).toLocaleDateString()}
          formatter={(value, name) => {
            if (name === "averageScore")
              return [`${Math.round((value as number) * 100)}%`, "Avg Score"];
            if (name === "timeSpent") return [`${value}min`, "Time Spent"];
            return [value, name];
          }}
          contentStyle={{
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            border: "1px solid #E5E7EB",
            borderRadius: "8px",
          }}
        />
        <Area
          type="monotone"
          dataKey="assessments"
          stackId="1"
          stroke="#3B82F6"
          fill="#3B82F6"
          fillOpacity={0.3}
          name="Assessments"
        />
        <Area
          type="monotone"
          dataKey="timeSpent"
          stackId="2"
          stroke="#10B981"
          fill="#10B981"
          fillOpacity={0.3}
          name="Time Spent"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function AssessmentDashboard({
  userId,
  timeRange = "30d",
  onTimeRangeChange,
}: AssessmentDashboardProps) {
  const [metrics, setMetrics] = useState<DashboardMetrics>(mockMetrics);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("overview");

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);

        // Load analytics data
        const analytics = await analyticsService.getUserAnalytics(userId, timeRange);
        const progress = await progressService.getUserProgress(userId);

        // Process and set metrics
        // This would normally transform the real data
        // For now, using mock data

        setMetrics(mockMetrics);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    void loadDashboardData();
  }, [userId, timeRange]);

  const handleExportData = async () => {
    try {
      // Export dashboard data as PDF or CSV
      const analytics = await analyticsService.getUserAnalytics(userId, timeRange);
      const blob = new Blob([JSON.stringify(analytics, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `assessment-analytics-${timeRange}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting data:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-1/4 rounded bg-gray-200"></div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 rounded bg-gray-200"></div>
          ))}
        </div>
        <div className="h-96 rounded bg-gray-200"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Assessment Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your learning progress and performance insights
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => onTimeRangeChange?.(e.target.value as "7d" | "30d" | "90d" | "1y")}
            className="rounded-lg border bg-white px-3 py-2 text-sm dark:bg-gray-800"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>

          <Button variant="outline" size="sm" onClick={handleExportData}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>

          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Assessments"
          value={metrics.totalAssessments}
          subtitle="Completed"
          icon={BarChart3}
          trend={{ value: 15, label: "vs last period" }}
          color="blue"
        />

        <MetricCard
          title="Average Score"
          value={`${Math.round(metrics.averageScore * 100)}%`}
          subtitle="Across all assessments"
          icon={Target}
          trend={{ value: 5, label: "improvement" }}
          color="green"
        />

        <MetricCard
          title="Study Time"
          value={`${Math.floor(metrics.timeSpent / 60)}h ${metrics.timeSpent % 60}m`}
          subtitle="Total learning time"
          icon={Clock}
          trend={{ value: 23, label: "increase" }}
          color="cyan"
        />

        <MetricCard
          title="Study Streak"
          value={`${metrics.streakDays} days`}
          subtitle="Current streak"
          icon={Award}
          trend={{ value: 0, label: "maintain streak" }}
          color="orange"
        />
      </div>

      {/* Dashboard Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Domain Mastery */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Domain Mastery
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DomainMasteryChart data={metrics.domainMastery} />
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ActivityChart data={metrics.recentActivity} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {/* Performance Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.performanceTrends.map((trend, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div>
                      <h4 className="font-medium">{trend.domain}</h4>
                      <p className="text-sm text-gray-600">Current: {trend.current}%</p>
                    </div>
                    <div className="text-right">
                      <div
                        className={`flex items-center gap-1 ${
                          trend.change >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        <TrendingUp className="h-4 w-4" />
                        <span className="font-medium">
                          {trend.change >= 0 ? "+" : ""}
                          {trend.change}%
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">vs previous</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          {/* Upcoming Assessments */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Assessments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metrics.upcomingAssessments.map((assessment) => (
                  <div
                    key={assessment.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div>
                      <h4 className="font-medium">{assessment.name}</h4>
                      <p className="text-sm text-gray-600">
                        Due: {new Date(assessment.due).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge
                      variant={assessment.difficulty === "Expert" ? "destructive" : "secondary"}
                    >
                      {assessment.difficulty}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          {/* Achievements */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {metrics.achievements.map((achievement) => (
              <Card
                key={achievement.id}
                className={`transition-all ${
                  achievement.earned
                    ? "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950"
                    : ""
                }`}
              >
                <CardContent className="p-6">
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <h4 className="flex items-center gap-2 font-semibold">
                        {achievement.earned ? (
                          <Award className="h-5 w-5 text-green-600" />
                        ) : (
                          <Award className="h-5 w-5 text-gray-400" />
                        )}
                        {achievement.name}
                      </h4>
                      <p className="mt-1 text-sm text-gray-600">{achievement.description}</p>
                    </div>
                    {achievement.earned && (
                      <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                        Earned
                      </Badge>
                    )}
                  </div>

                  {!achievement.earned && (
                    <div className="space-y-2">
                      <Progress value={achievement.progress} className="h-2" />
                      <p className="text-right text-xs text-gray-500">
                        {achievement.progress}% Complete
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
