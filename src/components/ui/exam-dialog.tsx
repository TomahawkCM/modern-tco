"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Clock,
  Trophy,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BookOpen,
  Settings,
  Play,
  Pause,
  RotateCcw,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ExamMode, TCODomain } from "@/types/exam";

interface ExamStartDialogProps {
  trigger: React.ReactNode;
  mode: ExamMode;
  onStart: (config: ExamConfig) => void;
}

interface ExamConfig {
  mode: ExamMode;
  domain?: TCODomain;
  questionCount: number;
  timeLimit?: number;
  difficulty: "mixed" | "beginner" | "intermediate" | "advanced";
}

interface ExamPauseSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  timeRemaining?: number;
  currentQuestion: number;
  totalQuestions: number;
  onResume: () => void;
  onRestart: () => void;
  onQuit: () => void;
}

interface ExamResultsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  results: {
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    timeSpent: number;
    passingScore: number;
    domain?: TCODomain;
    mode: ExamMode;
  };
  onRestart: () => void;
  onReview: () => void;
  onGoHome: () => void;
}

export function ExamStartDialog({ trigger, mode, onStart }: ExamStartDialogProps) {
  const [config, setConfig] = useState<ExamConfig>({
    mode,
    questionCount: mode === ExamMode.MOCK ? 65 : 20,
    difficulty: "mixed",
  });

  const handleStart = () => {
    onStart(config);
  };

  const getModeInfo = (mode: ExamMode) => {
    switch (mode) {
      case ExamMode.PRACTICE:
        return {
          title: "Practice Mode",
          description: "Interactive learning with instant feedback",
          icon: BookOpen,
          color: "text-blue-400",
          bgColor: "bg-blue-500",
        };
      case ExamMode.MOCK:
        return {
          title: "Mock Exam",
          description: "Full certification exam simulation",
          icon: FileText,
          color: "text-green-400",
          bgColor: "bg-green-500",
        };
      case ExamMode.REVIEW:
        return {
          title: "Review Mode",
          description: "Review previously missed questions",
          icon: RotateCcw,
          color: "text-orange-400",
          bgColor: "bg-orange-500",
        };
      default:
        return {
          title: "Exam",
          description: "Test your knowledge",
          icon: BookOpen,
          color: "text-blue-400",
          bgColor: "bg-blue-500",
        };
    }
  };

  const modeInfo = getModeInfo(mode);
  const Icon = modeInfo.icon;

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="glass max-w-2xl border-white/20 text-white">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <div className={cn("rounded-lg p-3", modeInfo.bgColor)}>
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl text-white">{modeInfo.title}</DialogTitle>
              <DialogDescription className="text-gray-300">
                {modeInfo.description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Configuration Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Configuration</h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-200">Number of Questions</label>
                <select
                  value={config.questionCount}
                  onChange={(e) => setConfig({ ...config, questionCount: Number(e.target.value) })}
                  className="glass w-full rounded-lg border border-white/20 p-2 text-white"
                >
                  {mode === ExamMode.MOCK ? (
                    <option value={65}>65 (Full Exam)</option>
                  ) : (
                    <>
                      <option value={10}>10 Questions</option>
                      <option value={20}>20 Questions</option>
                      <option value={30}>30 Questions</option>
                      <option value={50}>50 Questions</option>
                    </>
                  )}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-200">Difficulty Level</label>
                <select
                  value={config.difficulty}
                  onChange={(e) => setConfig({ ...config, difficulty: e.target.value as any })}
                  className="glass w-full rounded-lg border border-white/20 p-2 text-white"
                >
                  <option value="mixed">Mixed Difficulty</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            {mode === ExamMode.PRACTICE && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-200">Focus Domain (Optional)</label>
                <select
                  value={config.domain ?? ""}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      domain: e.target.value ? (e.target.value as TCODomain) : undefined,
                    })
                  }
                  className="glass w-full rounded-lg border border-white/20 p-2 text-white"
                >
                  <option value="">All Domains</option>
                  {Object.values(TCODomain).map((domain) => (
                    <option key={domain} value={domain}>
                      {domain}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <Separator className="bg-white/10" />

          {/* Exam Info */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center space-x-2">
              <Clock className={modeInfo.color} size={16} />
              <div>
                <p className="text-sm text-gray-300">Time Limit</p>
                <p className="font-medium text-white">
                  {mode === ExamMode.MOCK ? "90 minutes" : "Unlimited"}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Trophy className={modeInfo.color} size={16} />
              <div>
                <p className="text-sm text-gray-300">Passing Score</p>
                <p className="font-medium text-white">70%</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Settings className={modeInfo.color} size={16} />
              <div>
                <p className="text-sm text-gray-300">Format</p>
                <p className="font-medium text-white">Multiple Choice</p>
              </div>
            </div>
          </div>

          {mode === ExamMode.MOCK && (
            <div className="glass rounded-lg border border-orange-500/20 bg-orange-500/5 p-4">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="mt-0.5 text-orange-400" size={16} />
                <div>
                  <p className="text-sm font-medium text-orange-200">Mock Exam Rules</p>
                  <ul className="mt-1 space-y-1 text-xs text-orange-300">
                    <li>• Timed examination (90 minutes)</li>
                    <li>• No going back to previous questions</li>
                    <li>• Results shown only at the end</li>
                    <li>• Simulates real certification exam</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={handleStart}
            className={cn("w-full", modeInfo.bgColor, "hover:opacity-90")}
            size="lg"
          >
            <Play className="mr-2 h-4 w-4" />
            Start {modeInfo.title}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ExamPauseSheet({
  isOpen,
  onOpenChange,
  timeRemaining,
  currentQuestion,
  totalQuestions,
  onResume,
  onRestart,
  onQuit,
}: ExamPauseSheetProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="glass w-96 border-white/20 text-white">
        <SheetHeader>
          <SheetTitle className="text-white">Exam Paused</SheetTitle>
          <SheetDescription className="text-gray-300">
            Your progress has been saved
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Progress */}
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Progress</span>
              <span className="text-white">
                {currentQuestion}/{totalQuestions} questions
              </span>
            </div>
            <Progress value={(currentQuestion / totalQuestions) * 100} className="h-2" />
          </div>

          {/* Time remaining */}
          {timeRemaining && (
            <div className="glass rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-orange-400" />
                  <span className="text-sm text-gray-300">Time Remaining</span>
                </div>
                <span className="text-lg font-medium text-white">
                  {Math.floor(timeRemaining / 60)}:
                  {(timeRemaining % 60).toString().padStart(2, "0")}
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <Button onClick={onResume} className="w-full bg-green-600 hover:bg-green-700" size="lg">
              <Play className="mr-2 h-4 w-4" />
              Resume Exam
            </Button>

            <Button
              onClick={onRestart}
              variant="outline"
              className="glass w-full border-white/20 text-white hover:bg-white/10"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Restart Exam
            </Button>

            <Button
              onClick={onQuit}
              variant="outline"
              className="glass w-full border-red-500/20 text-red-300 hover:bg-red-500/10"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Quit Exam
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function ExamResultsDialog({
  isOpen,
  onOpenChange,
  results,
  onRestart,
  onReview,
  onGoHome,
}: ExamResultsDialogProps) {
  const passed = results.score >= results.passingScore;
  const percentage = (results.correctAnswers / results.totalQuestions) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="glass max-w-2xl border-white/20 text-white">
        <DialogHeader>
          <div className="space-y-4 text-center">
            <div className="flex justify-center">
              {passed ? (
                <div className="rounded-full bg-green-500 p-4">
                  <CheckCircle className="h-12 w-12 text-white" />
                </div>
              ) : (
                <div className="rounded-full bg-red-500 p-4">
                  <XCircle className="h-12 w-12 text-white" />
                </div>
              )}
            </div>

            <div>
              <DialogTitle className="text-2xl text-white">
                {passed ? "Congratulations!" : "Keep Studying!"}
              </DialogTitle>
              <DialogDescription className="text-lg text-gray-300">
                {passed ? "You passed the exam!" : `You need ${results.passingScore}% to pass`}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Score Display */}
          <div className="text-center">
            <div
              className={cn("mb-2 text-6xl font-bold", passed ? "text-green-400" : "text-red-400")}
            >
              {Math.round(percentage)}%
            </div>
            <p className="text-gray-300">
              {results.correctAnswers} of {results.totalQuestions} questions correct
            </p>
          </div>

          {/* Statistics */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="glass rounded-lg p-4 text-center">
              <Trophy className="mx-auto mb-2 h-6 w-6 text-yellow-400" />
              <div className="text-xl font-bold text-white">{results.score}%</div>
              <div className="text-sm text-gray-300">Final Score</div>
            </div>

            <div className="glass rounded-lg p-4 text-center">
              <Clock className="mx-auto mb-2 h-6 w-6 text-blue-400" />
              <div className="text-xl font-bold text-white">
                {Math.floor(results.timeSpent / 60)}m {results.timeSpent % 60}s
              </div>
              <div className="text-sm text-gray-300">Time Spent</div>
            </div>

            <div className="glass rounded-lg p-4 text-center">
              <BookOpen className="mx-auto mb-2 h-6 w-6 text-cyan-400" />
              <div className="text-xl font-bold text-white">{results.mode}</div>
              <div className="text-sm text-gray-300">Exam Mode</div>
            </div>
          </div>

          {/* Performance Message */}
          <div
            className={cn(
              "glass rounded-lg p-4",
              passed ? "border-green-500/20 bg-green-500/5" : "border-red-500/20 bg-red-500/5"
            )}
          >
            <p className="text-center text-sm">
              {passed ? (
                <span className="text-green-200">
                  Excellent work! You&rsquo;re ready for the certification exam.
                </span>
              ) : (
                <span className="text-red-200">
                  Review the incorrect answers and keep practicing. You&rsquo;re getting closer!
                </span>
              )}
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col space-y-2">
          <div className="flex w-full gap-2">
            <Button
              onClick={onReview}
              variant="outline"
              className="glass flex-1 border-white/20 text-white hover:bg-white/10"
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Review Answers
            </Button>

            <Button
              onClick={onRestart}
              variant="outline"
              className="glass flex-1 border-white/20 text-white hover:bg-white/10"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Retake Exam
            </Button>
          </div>

          <Button onClick={onGoHome} className="w-full bg-tanium-accent hover:bg-blue-600">
            Back to Dashboard
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
