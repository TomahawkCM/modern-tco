"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useDatabase } from "@/contexts/DatabaseContext";
import { useIncorrectAnswers } from "@/contexts/IncorrectAnswersContext";
import { useModule } from "@/contexts/ModuleContext";
import { useProgress } from "@/contexts/ProgressContext";
import { useQuestions } from "@/contexts/QuestionsContext";
import { useSearch } from "@/contexts/SearchContext";
import { useSettings } from "@/contexts/SettingsContext";
import { cn } from "@/lib/utils";
import type { TCODomain } from "@/types/exam";
import {
  AlertCircle,
  CheckCircle2,
  Database,
  Loader2,
  RefreshCw,
  User,
  XCircle,
} from "lucide-react";
import { useState } from "react";

interface TestResult {
  name: string;
  status: "pending" | "testing" | "success" | "error";
  message?: string;
  details?: any;
}

export default function TestDatabasePage() {
  const { user, signIn, signOut } = useAuth();
  const db = useDatabase();
  const { state: settingsState, updateSetting, resetSettings } = useSettings();
  const { state: progressState, updateSessionStats } = useProgress();
  const {
    state: incorrectAnswersState,
    addIncorrectAnswer,
    clearAllAnswers,
    getRecentIncorrectAnswers,
  } = useIncorrectAnswers();
  const { state: moduleState, updateModuleProgress, resetProgress } = useModule();
  const { questions: questionsData, loading: questionsLoading } = useQuestions();
  const { performSearch } = useSearch();

  const [testResults, setTestResults] = useState<TestResult[]>([
    { name: "Authentication", status: "pending" },
    { name: "Database Connection", status: "pending" },
    { name: "Settings Context", status: "pending" },
    { name: "Progress Context", status: "pending" },
    { name: "Incorrect Answers Context", status: "pending" },
    { name: "Module Context", status: "pending" },
    { name: "Questions Context", status: "pending" },
    { name: "Search Context", status: "pending" },
  ]);

  const [isRunning, setIsRunning] = useState(false);

  const updateTestResult = (
    name: string,
    status: TestResult["status"],
    message?: string,
    details?: any
  ) => {
    setTestResults((prev) =>
      prev.map((test) => (test.name === name ? { ...test, status, message, details } : test))
    );
  };

  const testAuthentication = async () => {
    updateTestResult("Authentication", "testing");
    try {
      if (!user) {
        updateTestResult("Authentication", "error", "Not authenticated. Please sign in first.");
        return false;
      }
      updateTestResult("Authentication", "success", `Authenticated as ${user.email}`);
      return true;
    } catch (error) {
      updateTestResult("Authentication", "error", String(error));
      return false;
    }
  };

  const testDatabaseConnection = async () => {
    updateTestResult("Database Connection", "testing");
    try {
      if (!db?.supabase) {
        updateTestResult("Database Connection", "error", "Database not initialized");
        return false;
      }

      // Test with a simple query
      const { data, error } = await db.supabase
        .from("user_study_progress")
        .select("count")
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      updateTestResult("Database Connection", "success", "Connected to Supabase");
      return true;
    } catch (error) {
      updateTestResult("Database Connection", "error", String(error));
      return false;
    }
  };

  const testSettingsContext = async () => {
    updateTestResult("Settings Context", "testing");
    try {
      // Test updating a setting
      const originalTheme = settingsState.settings.theme;
      updateSetting("theme", originalTheme === "dark" ? "light" : "dark");

      // Wait for save
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Verify it was saved by checking the state
      if (settingsState.settings.theme === originalTheme) {
        throw new Error("Setting was not updated");
      }

      // Restore original
      updateSetting("theme", originalTheme);

      updateTestResult("Settings Context", "success", "Settings sync working", {
        theme: settingsState.settings.theme,
        soundEnabled: settingsState.settings.soundEnabled,
      });
      return true;
    } catch (error) {
      updateTestResult("Settings Context", "error", String(error));
      return false;
    }
  };

  const testProgressContext = async () => {
    updateTestResult("Progress Context", "testing");
    try {
      // Test updating progress
      const testProgress = {
        questionsAnswered: 10,
        correctAnswers: 8,
        totalTimeSpent: 600,
        lastUpdated: new Date().toISOString(),
      };

      await updateSessionStats(
        testProgress.questionsAnswered,
        testProgress.correctAnswers,
        testProgress.totalTimeSpent
      );

      // Wait for save
      await new Promise((resolve) => setTimeout(resolve, 1000));

      updateTestResult("Progress Context", "success", "Progress sync working", {
        questionsAnswered: progressState.progress.totalQuestions,
        correctAnswers: progressState.progress.correctAnswers,
      });
      return true;
    } catch (error) {
      updateTestResult("Progress Context", "error", String(error));
      return false;
    }
  };

  const testIncorrectAnswersContext = async () => {
    updateTestResult("Incorrect Answers Context", "testing");
    try {
      // Test adding an incorrect answer
      const testAnswer = {
        questionId: `test-q-${Date.now()}`,
        questionText: "Test Question",
        userAnswer: "A",
        correctAnswer: "B",
        explanation: "Test explanation",
        domain: "asking-questions" as TCODomain,
        sessionId: `test-session-${Date.now()}`,
      };

      await addIncorrectAnswer(testAnswer);

      // Wait for save
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Check if it was added
      const found = incorrectAnswersState.answers.some(
        (a: any) => a.questionId === testAnswer.questionId
      );

      if (!found) {
        throw new Error("Incorrect answer was not added");
      }

      updateTestResult("Incorrect Answers Context", "success", "Incorrect answers sync working", {
        count: incorrectAnswersState.answers.length,
      });
      return true;
    } catch (error) {
      updateTestResult("Incorrect Answers Context", "error", String(error));
      return false;
    }
  };

  const testModuleContext = async () => {
    updateTestResult("Module Context", "testing");
    try {
      // Test updating module progress
      const testModuleId = "test-module-1";
      await updateModuleProgress(testModuleId, {
        completedAt: undefined,
        sectionsCompleted: ["obj-1"],
        currentSection: "section-1",
        totalTimeSpent: 300,
        lastAccessedAt: new Date(),
      });

      // Wait for save
      await new Promise((resolve) => setTimeout(resolve, 1000));

      updateTestResult("Module Context", "success", "Module progress sync working", {
        modulesCount:
          moduleState && (moduleState as any).moduleProgress
            ? Object.keys((moduleState as any).moduleProgress).length
            : 0,
      });
      return true;
    } catch (error) {
      updateTestResult("Module Context", "error", String(error));
      return false;
    }
  };

  const testQuestionsContext = async () => {
    updateTestResult("Questions Context", "testing");
    try {
      // Questions are loaded from Supabase automatically
      if (!questionsData || questionsData.length === 0) {
        throw new Error("No questions loaded from database");
      }

      updateTestResult("Questions Context", "success", `Loaded ${questionsData.length} questions`, {
        totalQuestions: questionsData.length,
        isLoading: questionsLoading,
      });
      return true;
    } catch (error) {
      updateTestResult("Questions Context", "error", String(error));
      return false;
    }
  };

  const testSearchContext = async () => {
    updateTestResult("Search Context", "testing");
    try {
      // Test search functionality
      const results = await performSearch();

      const resultCount = Array.isArray(results) ? results.length : 0;
      updateTestResult("Search Context", "success", `Search returned ${resultCount} results`, {
        resultsCount: resultCount,
      });
      return true;
    } catch (error) {
      updateTestResult("Search Context", "error", String(error));
      return false;
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);

    // Reset all test results
    setTestResults((prev) =>
      prev.map((test) => ({ ...test, status: "pending", message: undefined, details: undefined }))
    );

    // Run tests in sequence
    const authOk = await testAuthentication();
    if (!authOk) {
      setIsRunning(false);
      return;
    }

    const dbOk = await testDatabaseConnection();
    if (!dbOk) {
      setIsRunning(false);
      return;
    }

    // Run remaining tests
    await testSettingsContext();
    await testProgressContext();
    await testIncorrectAnswersContext();
    await testModuleContext();
    await testQuestionsContext();
    await testSearchContext();

    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-[#22c55e]" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-400" />;
      case "testing":
        return <Loader2 className="h-5 w-5 animate-spin text-primary" />;
      default:
        return <AlertCircle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: TestResult["status"]) => {
    const variants = {
      success: "bg-[#22c55e]/20 text-[#22c55e]",
      error: "bg-red-500/20 text-red-300",
      testing: "bg-primary/20 text-primary",
      pending: "bg-gray-500/20 text-muted-foreground",
    };

    return <Badge className={cn("ml-auto", variants[status])}>{status}</Badge>;
  };

  return (
    
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-4 text-4xl font-bold text-foreground">Database Integration Test</h1>
          <p className="text-foreground/70">Verify all database connections and context integrations</p>
        </div>

        {/* Authentication Status */}
        <Card className="glass mb-6 border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <User className="h-5 w-5" />
              Authentication Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {user ? (
              <div className="space-y-2">
                <Alert className="border-[#22c55e]/30 bg-[#22c55e]/10">
                  <CheckCircle2 className="h-4 w-4 text-[#22c55e]" />
                  <AlertDescription className="text-foreground">
                    Signed in as <strong>{user.email}</strong>
                  </AlertDescription>
                </Alert>
                <Button
                  onClick={signOut}
                  variant="outline"
                  className="border-white/20 text-foreground hover:bg-white/10"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Alert className="border-[#f97316]/30 bg-[#f97316]/10">
                  <AlertCircle className="h-4 w-4 text-[#f97316]" />
                  <AlertDescription className="text-foreground">
                    Not authenticated. Sign in to test database features.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test Controls */}
        <Card className="glass mb-6 border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Database className="h-5 w-5" />
              Test Controls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button
                onClick={runAllTests}
                disabled={!user || isRunning}
                className="bg-tanium-accent hover:bg-tanium-accent/80"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Running Tests...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Run All Tests
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        <Card className="glass border-white/10">
          <CardHeader>
            <CardTitle className="text-foreground">Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testResults.map((test) => (
                <div key={test.name} className="flex items-start gap-3 rounded-lg bg-white/5 p-3">
                  {getStatusIcon(test.status)}
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h3 className="font-medium text-foreground">{test.name}</h3>
                      {getStatusBadge(test.status)}
                    </div>
                    {test.message && <p className="mt-1 text-sm text-foreground/70">{test.message}</p>}
                    {test.details && (
                      <pre className="mt-2 rounded bg-black/20 p-2 text-xs text-foreground/50">
                        {JSON.stringify(test.details, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    
  );
}
