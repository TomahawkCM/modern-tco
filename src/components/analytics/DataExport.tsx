"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProgress } from "@/contexts/ProgressContext";
import { useIncorrectAnswers } from "@/contexts/IncorrectAnswersContext";
import { TCODomain } from "@/types/exam";
import {
  Download,
  Upload,
  FileText,
  Database,
  Trash2,
  RefreshCw,
  BarChart3,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function DataExport() {
  const { state: progressState, getOverallStats, getDomainStats, resetProgress } = useProgress();
  const {
    state: incorrectState,
    getTotalIncorrectCount,
    getDomainStats: getIncorrectDomainStats,
    clearAllAnswers,
  } = useIncorrectAnswers();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const exportProgressData = () => {
    setIsExporting(true);

    try {
      const exportData = {
        version: "1.0.0",
        exportDate: new Date().toISOString(),
        progress: progressState.progress,
        incorrectAnswers: incorrectState.answers,
        metadata: {
          totalQuestions: getOverallStats().totalQuestions,
          averageScore: getOverallStats().averageScore,
          studyStreak: getOverallStats().studyStreak,
          hoursStudied: getOverallStats().hoursStudied,
          incorrectCount: getTotalIncorrectCount(),
          domainBreakdown: getDomainStats(),
          incorrectDomainBreakdown: getIncorrectDomainStats(),
        },
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });

      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `tco-progress-backup-${new Date().toISOString().split("T")[0]}.json`;
      link.click();

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export data:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const importProgressData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target?.result as string);

        // Validate data structure
        if (!importData.version || !importData.progress || !importData.incorrectAnswers) {
          throw new Error("Invalid backup file format");
        }

        // Import progress data
        localStorage.setItem("tco-progress", JSON.stringify(importData.progress));

        // Import incorrect answers data
        localStorage.setItem("tco-incorrect-answers", JSON.stringify(importData.incorrectAnswers));

        // Refresh the page to reload data
        window.location.reload();
      } catch (error) {
        console.error("Failed to import data:", error);
        alert("Failed to import data. Please check the file format.");
      } finally {
        setIsImporting(false);
      }
    };

    reader.readAsText(file);
    event.target.value = ""; // Reset input
  };

  const exportCSVReport = () => {
    const overallStats = getOverallStats();
    const domainStats = getDomainStats();

    const csvHeader =
      "Domain,Score,Questions Answered,Correct Answers,Time Spent (minutes),Accuracy\n";
    const csvRows = domainStats
      .map(
        (domain) =>
          `${domain.domain},${domain.score},${domain.questionsAnswered},${domain.correctAnswers},${Math.round(domain.timeSpent / 60)},${domain.percentage}%`
      )
      .join("\n");

    const csvSummary = `\nSUMMARY,,,,,\nTotal Questions,${overallStats.totalQuestions},,,,\nAverage Score,${overallStats.averageScore}%,,,,\nStudy Streak,${overallStats.studyStreak} days,,,,\nHours Studied,${overallStats.hoursStudied},,,,\nReadiness Level,${overallStats.readinessLevel},,,,\nSessions Completed,${progressState.progress.sessionCount},,,,\nAchievements,${progressState.progress.achievements.length},,,,`;

    const csvContent = csvHeader + csvRows + csvSummary;
    const csvBlob = new Blob([csvContent], { type: "text/csv" });

    const url = URL.createObjectURL(csvBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `tco-report-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportStudyPlan = () => {
    const overallStats = getOverallStats();
    const domainStats = getDomainStats();

    // Generate a personalized study plan
    const weakDomains = domainStats
      .filter((domain) => domain.score < 70)
      .sort((a, b) => a.score - b.score);
    const strongDomains = domainStats.filter((domain) => domain.score >= 80);

    const studyPlan = `# Personalized TCO Study Plan
Generated: ${new Date().toLocaleDateString()}

## Current Performance Summary
- **Overall Average**: ${overallStats.averageScore}%
- **Study Streak**: ${overallStats.studyStreak} days
- **Total Questions**: ${overallStats.totalQuestions}
- **Readiness Level**: ${overallStats.readinessLevel}

## Recommended Focus Areas
${
  weakDomains.length > 0
    ? weakDomains
        .map(
          (domain, index) =>
            `${index + 1}. **${domain.domain}** (${domain.score}%) - ${domain.questionsAnswered} questions practiced`
        )
        .join("\n")
    : "Great job! All domains are performing well."
}

## Study Recommendations
${
  overallStats.averageScore < 60
    ? "- Focus on fundamentals before attempting mock exams\n- Spend 30-45 minutes daily on weakest domains\n- Review explanations for all incorrect answers"
    : overallStats.averageScore < 80
      ? "- Continue regular practice with focus on weak areas\n- Begin incorporating mock exams\n- Aim for 70%+ consistency across all domains"
      : "- Ready for intensive mock exam practice\n- Focus on time management and exam strategy\n- Review edge cases and advanced scenarios"
}

## Weekly Goals
- Practice sessions: 5-7 per week
- Mock exams: ${overallStats.averageScore >= 70 ? "1-2" : "0-1"} per week
- Study time: ${overallStats.averageScore < 70 ? "45-60" : "30-45"} minutes daily

## Strong Areas to Maintain
${
  strongDomains.length > 0
    ? strongDomains
        .map((domain) => `- **${domain.domain}** (${domain.score}%) - Continue light practice`)
        .join("\n")
    : "Continue building strength across all domains."
}

Generated by TCO Study App - Track your progress at /analytics
`;

    const planBlob = new Blob([studyPlan], { type: "text/markdown" });
    const url = URL.createObjectURL(planBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `tco-study-plan-${new Date().toISOString().split("T")[0]}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="glass border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Download className="h-5 w-5 text-tanium-accent" />
          Export Your Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          <Button
            onClick={exportProgressData}
            className="h-auto bg-tanium-accent p-4 text-foreground hover:bg-blue-600"
          >
            <div className="text-center">
              <FileText className="mx-auto mb-2 h-6 w-6" />
              <div className="font-medium">Full Data Export</div>
              <div className="text-xs opacity-80">JSON format for backup</div>
            </div>
          </Button>

          <Button
            onClick={exportCSVReport}
            className="h-auto bg-[#22c55e] p-4 text-foreground hover:bg-green-700"
          >
            <div className="text-center">
              <BarChart3 className="mx-auto mb-2 h-6 w-6" />
              <div className="font-medium">Performance Report</div>
              <div className="text-xs opacity-80">CSV format for analysis</div>
            </div>
          </Button>

          <Button
            onClick={exportStudyPlan}
            className="h-auto bg-primary p-4 text-foreground hover:bg-cyan-700"
          >
            <div className="text-center">
              <Calendar className="mx-auto mb-2 h-6 w-6" />
              <div className="font-medium">Study Plan</div>
              <div className="text-xs opacity-80">Personalized recommendations</div>
            </div>
          </Button>
        </div>

        <div className="glass mt-4 rounded-lg border border-white/10 p-4">
          <h4 className="mb-2 font-medium text-foreground">Export Information</h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>
              • <strong>Full Data Export:</strong> Complete progress data in JSON format for backup
              and transfer
            </li>
            <li>
              • <strong>Performance Report:</strong> Domain scores and statistics in CSV format for
              spreadsheet analysis
            </li>
            <li>
              • <strong>Study Plan:</strong> Personalized study recommendations in Markdown format
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
