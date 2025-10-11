"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Clock,
  BookOpen,
  AlertCircle,
  Play,
  Settings,
  Shield,
  CheckCircle,
  Timer,
  Target,
  Brain,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { analytics } from "@/lib/analytics";
import { useRouter } from "next/navigation";

interface ExamConfiguration {
  duration: number;
  questionCount: number;
  passingScore: number;
  difficulty: "mixed" | "beginner" | "intermediate" | "advanced";
  domains: string[];
}

export default function MockExamPage() {
  const router = useRouter();
  const [examStarted, setExamStarted] = useState(false);
  const [showConfiguration, setShowConfiguration] = useState(false);

  const defaultConfig: ExamConfiguration = {
    duration: 90, // minutes
    questionCount: 75,
    passingScore: 70,
    difficulty: "mixed",
    domains: ["all"],
  };

  const handleStartExam = () => {
    void analytics.capture("mock_exam_start", { duration: defaultConfig.duration, questions: defaultConfig.questionCount });
    // Redirect to the working mock exam flow
    router.push("/mock");
  };

  if (examStarted) {
    return (
        <div className="flex min-h-[60vh] items-center justify-center">
          <Card className="glass-card border-tanium-orange/20 max-w-lg">
            <CardContent className="p-6 text-center">
              <div className="bg-tanium-orange/20 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <Timer className="text-tanium-orange h-8 w-8" />
              </div>
              <h2 className="mb-2 text-xl font-semibold text-foreground">Redirecting to Mock Exam…</h2>
              <p className="mb-6 text-foreground/70">Launching the timed exam experience.</p>
              <div className="animate-pulse">
                <div className="bg-tanium-orange/30 h-2 overflow-hidden rounded-full">
                  <div className="bg-tanium-orange h-full w-3/4 rounded-full transition-all duration-1000"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
    );
  }

  return (
    
      <div className="space-y-6">
        {/* Header */}
        <div className="glass-card border-tanium-orange/20 p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="bg-tanium-orange/20 flex h-12 w-12 items-center justify-center rounded-lg">
              <Target className="text-tanium-orange h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Mock Examination</h1>
              <p className="text-foreground/70">
                Full-length timed practice exam simulating real TCO conditions
              </p>
            </div>
          </div>

          <Alert className="border-tanium-orange/30 bg-tanium-orange/10">
            <AlertCircle className="text-tanium-orange h-4 w-4" />
            <AlertDescription className="text-foreground">
              <strong>Exam Simulation:</strong> This mock exam replicates the actual TCO
              certification exam format, timing, and difficulty level.
            </AlertDescription>
          </Alert>
        </div>

        {/* Exam Overview */}
        <Card className="glass-card border-tanium-blue/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Brain className="h-5 w-5" />
              Examination Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-center">
                <Clock className="text-tanium-blue mx-auto mb-2 h-8 w-8" />
                <div className="text-2xl font-bold text-foreground">{defaultConfig.duration}</div>
                <div className="text-sm text-foreground/60">Minutes</div>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-center">
                <BookOpen className="text-tanium-green mx-auto mb-2 h-8 w-8" />
                <div className="text-2xl font-bold text-foreground">{defaultConfig.questionCount}</div>
                <div className="text-sm text-foreground/60">Questions</div>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-center">
                <CheckCircle className="text-tanium-orange mx-auto mb-2 h-8 w-8" />
                <div className="text-2xl font-bold text-foreground">{defaultConfig.passingScore}%</div>
                <div className="text-sm text-foreground/60">Passing Score</div>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-center">
                <Shield className="text-primary mx-auto mb-2 h-8 w-8" />
                <div className="text-2xl font-bold capitalize text-foreground">
                  {defaultConfig.difficulty}
                </div>
                <div className="text-sm text-foreground/60">Difficulty</div>
              </div>
            </div>

            <Separator className="bg-white/10" />

            <div>
              <h3 className="mb-3 flex items-center gap-2 font-semibold text-foreground">
                <Target className="h-4 w-4" />
                Exam Coverage
              </h3>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3">
                  <span className="text-foreground/80">Asking Questions</span>
                  <Badge
                    variant="secondary"
                    className="bg-tanium-blue/20 text-tanium-blue border-tanium-blue/30"
                  >
                    22%
                  </Badge>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3">
                  <span className="text-foreground/80">Refining Questions</span>
                  <Badge
                    variant="secondary"
                    className="bg-tanium-green/20 text-tanium-green border-tanium-green/30"
                  >
                    23%
                  </Badge>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3">
                  <span className="text-foreground/80">Taking Action</span>
                  <Badge
                    variant="secondary"
                    className="bg-tanium-orange/20 text-tanium-orange border-tanium-orange/30"
                  >
                    15%
                  </Badge>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3">
                  <span className="text-foreground/80">Navigation and Basic Module Functions</span>
                  <Badge
                    variant="secondary"
                    className="bg-tanium-red/20 text-tanium-red border-tanium-red/30"
                  >
                    23%
                  </Badge>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3">
                  <span className="text-foreground/80">Report Generation and Data Export</span>
                  <Badge
                    variant="secondary"
                    className="bg-primary/20 text-primary border-primary/30"
                  >
                    17%
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Exam Rules */}
        <Card className="glass-card border-tanium-red/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <AlertCircle className="text-tanium-red h-5 w-5" />
              Examination Rules
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="bg-tanium-red mt-2 h-2 w-2 flex-shrink-0 rounded-full"></div>
                <div>
                  <strong className="text-foreground">Time Limit:</strong>
                  <p className="text-sm text-foreground/70">
                    You have exactly {defaultConfig.duration} minutes to complete all{" "}
                    {defaultConfig.questionCount} questions.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-tanium-orange mt-2 h-2 w-2 flex-shrink-0 rounded-full"></div>
                <div>
                  <strong className="text-foreground">No Pausing:</strong>
                  <p className="text-sm text-foreground/70">
                    Once started, the exam cannot be paused. Closing the browser will end your
                    session.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-tanium-blue mt-2 h-2 w-2 flex-shrink-0 rounded-full"></div>
                <div>
                  <strong className="text-foreground">Review Allowed:</strong>
                  <p className="text-sm text-foreground/70">
                    You can review and change answers before final submission.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-tanium-green mt-2 h-2 w-2 flex-shrink-0 rounded-full"></div>
                <div>
                  <strong className="text-foreground">Immediate Results:</strong>
                  <p className="text-sm text-foreground/70">
                    Your score and detailed feedback will be provided immediately upon completion.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Button
            onClick={handleStartExam}
            className="bg-tanium-orange hover:bg-tanium-orange/80 px-8 py-3 text-lg font-semibold text-foreground"
            size="lg"
          >
            <Play className="mr-2 h-5 w-5" />
            Start Mock Exam
          </Button>

          <Button
            variant="outline"
            onClick={() => setShowConfiguration(!showConfiguration)}
            className="border-white/20 px-8 py-3 text-foreground hover:bg-white/5"
            size="lg"
          >
            <Settings className="mr-2 h-4 w-4" />
            Customize Settings
          </Button>
        </div>

        {/* Configuration Panel (if shown) */}
        {showConfiguration && (
          <Card className="glass-card border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Settings className="h-5 w-5" />
                Exam Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className="border-primary/30 bg-primary/10">
                <AlertCircle className="text-primary h-4 w-4" />
                <AlertDescription className="text-foreground">
                  <strong>Coming Soon:</strong> Custom exam configurations will be available in a
                  future update.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}
      </div>
  );
}
