"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Play,
  CheckCircle,
  XCircle,
  Clock,
  Terminal,
  Code,
  Zap,
  ArrowRight,
  RotateCcw,
  Trophy,
} from "lucide-react";

interface LabStep {
  id: string;
  title: string;
  instruction: string;
  expectedResult: string;
  validation: {
    type: "code" | "interface" | "result";
    pattern: string;
    feedback: string;
  };
  hint?: string;
}

interface Lab {
  id: string;
  title: string;
  domain: string;
  estimatedTime: number;
  description: string;
  learningObjectives: string[];
  steps: LabStep[];
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  prerequisites?: string[];
}

// Sample Lab Definitions
const sampleLabs: Lab[] = [
  {
    id: "LAB-AQ-001",
    title: "Natural Language Query Construction",
    domain: "Asking Questions",
    estimatedTime: 12,
    difficulty: "Beginner",
    description:
      "Master Tanium console query procedures with sensor selection and real-time validation",
    learningObjectives: [
      "Construct natural language queries using Tanium syntax",
      "Select appropriate sensors for specific data collection needs",
      "Validate query results and troubleshoot common issues",
      "Optimize query performance for enterprise environments",
    ],
    steps: [
      {
        id: "step1",
        title: "Access Interact Module",
        instruction:
          "Navigate to the Interact module in Tanium Console and locate the question input field",
        expectedResult: "Question input field is visible and ready for input",
        validation: {
          type: "interface",
          pattern: "interact-module-loaded",
          feedback: "Successfully accessed Interact module!",
        },
        hint: 'Look for the "Ask a Question" interface at the top of the Interact module',
      },
      {
        id: "step2",
        title: "Basic Sensor Query",
        instruction:
          'Enter the query "Get Computer Name from all machines" and observe the auto-completion',
        expectedResult: "Query auto-completes with proper sensor syntax",
        validation: {
          type: "code",
          pattern: "^Get Computer Name from all machines$",
          feedback: "Perfect! You've constructed a basic sensor query using natural language.",
        },
      },
      {
        id: "step3",
        title: "Execute and Validate",
        instruction:
          "Execute the query and verify results show computer names from your environment",
        expectedResult: "Results display with computer names in tabular format",
        validation: {
          type: "result",
          pattern: "computer-names-displayed",
          feedback: "Excellent! Query executed successfully with valid results.",
        },
        hint: "Results should appear in the lower pane with computer names listed",
      },
    ],
  },
  {
    id: "LAB-RQ-001",
    title: "Advanced Targeting and Refinement",
    domain: "Refining Questions & Targeting",
    estimatedTime: 15,
    difficulty: "Intermediate",
    description: "Create dynamic computer groups with automated rules and complex filter logic",
    learningObjectives: [
      "Create dynamic computer groups with RBAC integration",
      "Implement complex filter logic using boolean operations",
      "Apply least privilege targeting principles",
      "Optimize targeting for enterprise-scale environments",
    ],
    steps: [
      {
        id: "step1",
        title: "Create Computer Group",
        instruction: "Navigate to Administration > Computer Groups and create a new dynamic group",
        expectedResult: "New computer group creation dialog is open",
        validation: {
          type: "interface",
          pattern: "computer-group-dialog",
          feedback: "Computer group creation interface accessed successfully!",
        },
      },
      {
        id: "step2",
        title: "Configure Filter Logic",
        instruction:
          'Set up filter: Operating System contains "Windows" AND Installed Applications contains "Chrome"',
        expectedResult: "Complex filter with AND logic is configured",
        validation: {
          type: "code",
          pattern: "windows.*AND.*chrome",
          feedback: "Excellent boolean logic configuration!",
        },
      },
      {
        id: "step3",
        title: "Test and Validate Group",
        instruction: "Save the group and verify it populates with matching endpoints",
        expectedResult: "Dynamic group shows matching computers based on criteria",
        validation: {
          type: "result",
          pattern: "group-population-success",
          feedback: "Dynamic computer group created and validated successfully!",
        },
      },
    ],
  },
];

interface InteractiveLabSystemProps {
  labId?: string;
  onComplete?: (labId: string, score: number) => void;
}

export function InteractiveLabSystem({ labId, onComplete }: InteractiveLabSystemProps) {
  const [selectedLab, setSelectedLab] = useState<Lab | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [userInput, setUserInput] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [labStartTime, setLabStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Timer effect
  useEffect(() => {
    if (labStartTime) {
      const interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - labStartTime.getTime()) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [labStartTime]);

  // Auto-select lab if labId provided
  useEffect(() => {
    if (labId) {
      const lab = sampleLabs.find((l) => l.id === labId);
      if (lab) {
        setSelectedLab(lab);
        setLabStartTime(new Date());
      }
    }
  }, [labId]);

  const handleLabSelect = (lab: Lab) => {
    setSelectedLab(lab);
    setCurrentStep(0);
    setCompletedSteps(new Set());
    setUserInput("");
    setValidationResult(null);
    setLabStartTime(new Date());
  };

  const validateStep = async (step: LabStep) => {
    setIsValidating(true);

    // Simulate validation (in real implementation, this would validate against actual Tanium console)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    let success = false;

    // Simple validation simulation
    switch (step.validation.type) {
      case "code":
        success = new RegExp(step.validation.pattern, "i").test(userInput);
        break;
      case "interface":
      case "result":
        // Simulate successful validation for demo
        success = true;
        break;
    }

    setValidationResult({
      success,
      message: success
        ? step.validation.feedback
        : "Validation failed. Please check your input and try again.",
    });

    if (success) {
      setCompletedSteps((prev) => new Set([...prev, step.id]));

      // Move to next step after delay
      setTimeout(() => {
        if (currentStep < selectedLab!.steps.length - 1) {
          setCurrentStep((prev) => prev + 1);
          setUserInput("");
          setValidationResult(null);
        } else {
          // Lab completed
          const score = Math.round(
            ((selectedLab!.steps.length - 0) / selectedLab!.steps.length) * 100
          );
          onComplete?.(selectedLab!.id, score);
        }
      }, 2000);
    }

    setIsValidating(false);
  };

  const resetLab = () => {
    setCurrentStep(0);
    setCompletedSteps(new Set());
    setUserInput("");
    setValidationResult(null);
    setLabStartTime(new Date());
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const calculateProgress = () => {
    if (!selectedLab) return 0;
    return (completedSteps.size / selectedLab.steps.length) * 100;
  };

  if (!selectedLab) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="mb-4 text-3xl font-bold text-foreground">Interactive Lab System</h2>
          <p className="mb-8 text-muted-foreground">
            Practice real Tanium procedures with step-by-step guided exercises
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {sampleLabs.map((lab) => (
            <Card
              key={lab.id}
              className="glass cursor-pointer border-white/10 transition-all hover:border-white/20"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg text-foreground">{lab.title}</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">{lab.domain}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      lab.difficulty === "Beginner"
                        ? "border-green-500 text-[#22c55e]"
                        : lab.difficulty === "Intermediate"
                          ? "border-yellow-500 text-[#f97316]"
                          : "border-red-500 text-red-400"
                    }
                  >
                    {lab.difficulty}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{lab.description}</p>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{lab.estimatedTime} min</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Code className="h-4 w-4" />
                      <span>{lab.steps.length} steps</span>
                    </div>
                  </div>
                </div>
                <Button
                  className="w-full bg-tanium-accent hover:bg-blue-600"
                  onClick={() => handleLabSelect(lab)}
                >
                  <Play className="mr-2 h-4 w-4" />
                  Start Lab
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const currentStepData = selectedLab.steps[currentStep];
  const isCompleted = completedSteps.size === selectedLab.steps.length;

  return (
    <div className="space-y-6">
      {/* Lab Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{selectedLab.title}</h2>
          <p className="text-muted-foreground">{selectedLab.domain}</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Elapsed Time</div>
            <div className="font-mono text-lg text-foreground">{formatTime(elapsedTime)}</div>
          </div>
          <Button variant="outline" size="sm" onClick={resetLab}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="text-foreground">
            {completedSteps.size}/{selectedLab.steps.length} steps
          </span>
        </div>
        <Progress value={calculateProgress()} className="h-2" />
      </div>

      {isCompleted ? (
        // Completion Screen
        <Card className="glass border-green-500/50 bg-[#22c55e]/10">
          <CardContent className="p-8 text-center">
            <Trophy className="mx-auto mb-4 h-16 w-16 text-[#f97316]" />
            <h3 className="mb-2 text-2xl font-bold text-foreground">Lab Completed!</h3>
            <p className="mb-4 text-muted-foreground">
              You successfully completed {selectedLab.title} in {formatTime(elapsedTime)}
            </p>
            <div className="flex justify-center space-x-4">
              <Button onClick={() => setSelectedLab(null)}>Return to Labs</Button>
              <Button variant="outline" onClick={resetLab}>
                Retry Lab
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        // Active Lab Step
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Instructions Panel */}
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center text-foreground">
                <Terminal className="mr-2 h-5 w-5" />
                Step {currentStep + 1}: {currentStepData.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Code className="h-4 w-4" />
                <AlertDescription className="text-muted-foreground">
                  {currentStepData.instruction}
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <h4 className="font-semibold text-foreground">Expected Result:</h4>
                <p className="rounded bg-card/50 p-3 text-sm text-muted-foreground">
                  {currentStepData.expectedResult}
                </p>
              </div>

              {currentStepData.hint && (
                <Alert className="border-yellow-500/50">
                  <Zap className="h-4 w-4" />
                  <AlertDescription className="text-[#f97316]">
                    <strong>Hint:</strong> {currentStepData.hint}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Validation Panel */}
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="text-foreground">Validation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentStepData.validation.type === "code" && (
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Enter your query/command:</label>
                  <textarea
                    className="w-full rounded border border-gray-600 bg-card p-3 font-mono text-foreground"
                    rows={3}
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Enter your Tanium query here..."
                  />
                </div>
              )}

              {validationResult && (
                <Alert
                  className={
                    validationResult.success
                      ? "border-green-500/50 bg-[#22c55e]/10"
                      : "border-red-500/50 bg-red-500/10"
                  }
                >
                  {validationResult.success ? (
                    <CheckCircle className="h-4 w-4 text-[#22c55e]" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-400" />
                  )}
                  <AlertDescription
                    className={validationResult.success ? "text-[#22c55e]" : "text-red-300"}
                  >
                    {validationResult.message}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                className="w-full"
                onClick={() => validateStep(currentStepData)}
                disabled={
                  isValidating || (currentStepData.validation.type === "code" && !userInput.trim())
                }
              >
                {isValidating ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                    Validating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Validate Step
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          {selectedLab.steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                completedSteps.has(step.id)
                  ? "bg-[#22c55e] text-foreground"
                  : index === currentStep
                    ? "bg-tanium-accent text-foreground"
                    : "bg-gray-700 text-muted-foreground"
              }`}
            >
              {completedSteps.has(step.id) ? <CheckCircle className="h-4 w-4" /> : index + 1}
            </div>
          ))}
        </div>

        <Button
          variant="ghost"
          onClick={() => setSelectedLab(null)}
          className="text-muted-foreground hover:text-foreground"
        >
          Exit Lab
        </Button>
      </div>
    </div>
  );
}
