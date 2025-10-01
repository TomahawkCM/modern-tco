import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Lock,
  Unlock,
  Trophy,
  Target,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BookOpen,
  BarChart3,
} from "lucide-react";
import { progressService } from "../lib/services/progress-service";
import type { AssessmentConfig } from "../types/assessment";
import { Difficulty, TCODomain } from "@/types/exam";

interface GatingRequirement {
  id: string;
  type: "assessment" | "module" | "time_spent" | "streak";
  name: string;
  description: string;
  threshold: number;
  current: number;
  unit?: string;
  met: boolean;
}

interface AssessmentGate {
  id: string;
  name: string;
  description: string;
  requirements: GatingRequirement[];
  unlocked: boolean;
  assessmentConfig: AssessmentConfig;
  estimatedDifficulty: "beginner" | "intermediate" | "advanced" | "expert";
  estimatedDuration: number; // minutes
  passingScore: number; // 0-1
  maxAttempts?: number;
  currentAttempts: number;
}

interface AssessmentGatingProps {
  userId: string;
  moduleId?: string;
  onAssessmentStart: (config: AssessmentConfig) => void;
  onRequirementClick?: (requirement: GatingRequirement) => void;
}

const mockGates: AssessmentGate[] = [
  {
    id: "practice-quiz-1",
    name: "Domain Knowledge Check",
    description: "Basic understanding of Tanium platform concepts",
    estimatedDifficulty: "beginner",
    estimatedDuration: 15,
    passingScore: 0.7,
    maxAttempts: 3,
    currentAttempts: 0,
    unlocked: true,
    assessmentConfig: {
      assessmentId: "practice-quiz-1",
      userId: "",
      moduleId: "",
      type: "practice",
      timeLimit: 900, // 15 minutes
      questionCount: 10,
      domainFilter: [TCODomain.ASKING_QUESTIONS],
      difficulty: Difficulty.BEGINNER,
      adaptiveDifficulty: false,
      showExplanations: true,
      allowReview: true,
      randomizeQuestions: true,
      randomizeOptions: true,
    },
    requirements: [
      {
        id: "reading-progress",
        type: "module",
        name: "Complete Module Reading",
        description: "Read through all module content",
        threshold: 100,
        current: 100,
        unit: "%",
        met: true,
      },
    ],
  },
  {
    id: "hands-on-lab-1",
    name: "Console Navigation Lab",
    description: "Hands-on practice with Tanium console interface",
    estimatedDifficulty: "intermediate",
    estimatedDuration: 25,
    passingScore: 0.8,
    maxAttempts: 2,
    currentAttempts: 0,
    unlocked: false,
    assessmentConfig: {
      assessmentId: "hands-on-lab-1",
      userId: "",
      moduleId: "",
      type: "practice",
      timeLimit: 1500, // 25 minutes
      questionCount: 8,
      domainFilter: [TCODomain.NAVIGATION_MODULES],
      difficulty: Difficulty.INTERMEDIATE,
      adaptiveDifficulty: false,
      showExplanations: true,
      allowReview: true,
      randomizeQuestions: false,
      randomizeOptions: false,
    },
    requirements: [
      {
        id: "prev-assessment",
        type: "assessment",
        name: "Pass Domain Knowledge Check",
        description: "Score 70% or higher on the practice quiz",
        threshold: 0.7,
        current: 0,
        unit: "score",
        met: false,
      },
      {
        id: "study-time",
        type: "time_spent",
        name: "Study Time",
        description: "Spend at least 30 minutes studying",
        threshold: 30,
        current: 12,
        unit: "minutes",
        met: false,
      },
    ],
  },
  {
    id: "certification-practice",
    name: "Certification Practice Exam",
    description: "Full-length practice exam simulating TAN-1000 certification",
    estimatedDifficulty: "expert",
    estimatedDuration: 105,
    passingScore: 0.75,
    maxAttempts: 1,
    currentAttempts: 0,
    unlocked: false,
    assessmentConfig: {
      assessmentId: "certification-practice",
      userId: "",
      moduleId: "",
      type: "practice",
      timeLimit: 6300, // 105 minutes
      questionCount: 65,
      domainFilter: undefined, // All domains
      difficulty: Difficulty.ADVANCED,
      adaptiveDifficulty: true,
      showExplanations: false,
      allowReview: false,
      randomizeQuestions: true,
      randomizeOptions: true,
    },
    requirements: [
      {
        id: "all-modules",
        type: "module",
        name: "Complete All Modules",
        description: "Finish all 5 TCO certification domains",
        threshold: 5,
        current: 2,
        unit: "modules",
        met: false,
      },
      {
        id: "practice-scores",
        type: "assessment",
        name: "Practice Assessment Average",
        description: "Maintain 85% average on practice assessments",
        threshold: 0.85,
        current: 0.78,
        unit: "avg score",
        met: false,
      },
      {
        id: "study-streak",
        type: "streak",
        name: "Study Consistency",
        description: "Study for 7 consecutive days",
        threshold: 7,
        current: 4,
        unit: "days",
        met: false,
      },
    ],
  },
];

function RequirementCard({
  requirement,
  onClick,
}: {
  requirement: GatingRequirement;
  onClick?: () => void;
}) {
  const progress = Math.min((requirement.current / requirement.threshold) * 100, 100);

  return (
    <motion.div
      whileHover={{ scale: onClick ? 1.02 : 1 }}
      className={`rounded-lg border p-4 transition-all duration-200 ${
        onClick ? "cursor-pointer hover:shadow-md" : ""
      } ${
        requirement.met
          ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950"
          : "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900"
      }`}
      onClick={onClick}
    >
      <div className="mb-2 flex items-start justify-between">
        <div className="flex items-center gap-2">
          {requirement.met ? (
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          ) : (
            <XCircle className="h-4 w-4 text-gray-400" />
          )}
          <span className="text-sm font-medium">{requirement.name}</span>
        </div>
        <Badge variant={requirement.met ? "default" : "secondary"} className="text-xs">
          {requirement.current} / {requirement.threshold} {requirement.unit}
        </Badge>
      </div>

      <p className="mb-3 text-xs text-gray-600 dark:text-gray-400">{requirement.description}</p>

      <div className="space-y-1">
        <Progress value={progress} className="h-2" />
        <p className="text-right text-xs text-gray-500">{progress.toFixed(0)}% Complete</p>
      </div>
    </motion.div>
  );
}

function AssessmentGateCard({
  gate,
  onStart,
  onRequirementClick,
}: {
  gate: AssessmentGate;
  onStart: () => void;
  onRequirementClick?: (requirement: GatingRequirement) => void;
}) {
  const difficultyColors = {
    beginner: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    intermediate: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    advanced: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    expert: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };

  const unmetRequirements = gate.requirements.filter((req) => !req.met);
  const canAttempt =
    gate.unlocked && (gate.maxAttempts === undefined || gate.currentAttempts < (gate.maxAttempts ?? Infinity));

  return (
    <Card
      className={`transition-all duration-300 ${
        gate.unlocked ? "shadow-md hover:shadow-lg" : "opacity-75"
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {gate.unlocked ? (
              <Unlock className="h-5 w-5 text-green-600 dark:text-green-400" />
            ) : (
              <Lock className="h-5 w-5 text-gray-400" />
            )}
            <CardTitle className="text-lg">{gate.name}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={difficultyColors[gate.estimatedDifficulty]}>
              {gate.estimatedDifficulty}
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Clock className="mr-1 h-3 w-3" />
              {gate.estimatedDuration}min
            </Badge>
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">{gate.description}</p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Assessment Details */}
        <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-900">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-sm">
              <Target className="h-4 w-4 text-blue-600" />
              <span>Pass: {(gate.passingScore * 100).toFixed(0)}%</span>
            </div>
            {gate.maxAttempts && (
              <div className="flex items-center gap-1 text-sm">
                <BarChart3 className="h-4 w-4 text-orange-600" />
                <span>
                  Attempts: {gate.currentAttempts}/{gate.maxAttempts}
                </span>
              </div>
            )}
          </div>
          {gate.assessmentConfig.type === "practice" && (
            <Trophy className="h-5 w-5 text-yellow-600" />
          )}
        </div>

        {/* Requirements */}
        {gate.requirements.length > 0 && (
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 text-sm font-medium">
              <BookOpen className="h-4 w-4" />
              Requirements ({gate.requirements.filter((r) => r.met).length}/
              {gate.requirements.length})
            </h4>
            <div className="space-y-2">
              {gate.requirements.map((requirement) => (
                <RequirementCard
                  key={requirement.id}
                  requirement={requirement}
                  onClick={() => onRequirementClick?.(requirement)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Warnings and Actions */}
        <AnimatePresence>
          {unmetRequirements.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Complete {unmetRequirements.length} requirement
                  {unmetRequirements.length !== 1 ? "s" : ""} to unlock this assessment.
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          {gate.maxAttempts && gate.currentAttempts >= gate.maxAttempts && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  Maximum attempts reached. Contact instructor for reset.
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        <Button onClick={onStart} disabled={!canAttempt} className="w-full" size="lg">
          {gate.unlocked
            ? canAttempt
              ? "Start Assessment"
              : "No Attempts Remaining"
            : "Requirements Not Met"}
        </Button>
      </CardContent>
    </Card>
  );
}

export function AssessmentGating({
  userId,
  moduleId,
  onAssessmentStart,
  onRequirementClick,
}: AssessmentGatingProps) {
  const [gates, setGates] = useState<AssessmentGate[]>(mockGates);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadGatingData = async () => {
      try {
        setIsLoading(true);

        // Load user progress to update gate requirements
        const userProgress = await progressService.getUserProgress(userId, moduleId);

        // Update gates with real progress data
        const updatedGates = gates.map((gate) => {
          const updatedRequirements = gate.requirements.map((req) => {
            // Update requirement based on actual progress
            switch (req.type) {
              case "module":
                // Get module completion percentage
                const moduleCompletion = (userProgress as any)?.moduleProgress?.[req.id] || 0;
                return {
                  ...req,
                  current: moduleCompletion,
                  met: moduleCompletion >= req.threshold,
                };

              case "assessment":
                // Get assessment scores
                const assessmentScore = (userProgress as any)?.assessmentScores?.[req.id] || 0;
                return { ...req, current: assessmentScore, met: assessmentScore >= req.threshold };

              case "time_spent":
                // Get study time
                const timeSpent = userProgress?.timeSpent ?? 0;
                return { ...req, current: timeSpent, met: timeSpent >= req.threshold };

              case "streak":
                // Get study streak
                const streak = (userProgress as any)?.studyStreak ?? userProgress?.streak ?? 0;
                return { ...req, current: streak, met: streak >= req.threshold };

              default:
                return req;
            }
          });

          // Update gate unlock status
          const allRequirementsMet = updatedRequirements.every((req) => req.met);

          return {
            ...gate,
            requirements: updatedRequirements,
            unlocked: allRequirementsMet,
            assessmentConfig: {
              ...gate.assessmentConfig,
              userId,
              moduleId: moduleId ?? "",
            },
          };
        });

        setGates(updatedGates);
      } catch (error) {
        console.error("Error loading gating data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    void loadGatingData();
  }, [userId, moduleId]);

  const handleAssessmentStart = (gate: AssessmentGate) => {
    if (gate.unlocked) {
      onAssessmentStart(gate.assessmentConfig);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 w-3/4 rounded bg-gray-200"></div>
              <div className="h-3 w-1/2 rounded bg-gray-200"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 w-full rounded bg-gray-200"></div>
                <div className="h-3 w-2/3 rounded bg-gray-200"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold tracking-tight">Assessment Center</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Progressive assessments to validate your Tanium expertise
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {gates.map((gate) => (
          <motion.div
            key={gate.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <AssessmentGateCard
              gate={gate}
              onStart={() => handleAssessmentStart(gate)}
              onRequirementClick={onRequirementClick}
            />
          </motion.div>
        ))}
      </div>

      {/* Progress Summary */}
      <Card className="bg-gradient-to-r from-blue-50 to-sky-50 dark:from-blue-950 dark:to-sky-950">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="mb-1 text-lg font-semibold">Assessment Progress</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {gates.filter((g) => g.unlocked).length} of {gates.length} assessments unlocked
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {Math.round((gates.filter((g) => g.unlocked).length / gates.length) * 100)}%
              </div>
              <div className="text-xs text-gray-500">Complete</div>
            </div>
          </div>
          <Progress
            value={(gates.filter((g) => g.unlocked).length / gates.length) * 100}
            className="mt-4"
          />
        </CardContent>
      </Card>
    </div>
  );
}
