"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  CheckCircle,
  ArrowRight,
  User,
  Brain,
  Target,
  Trophy,
  Sparkles,
  Heart,
} from "lucide-react";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  completed: boolean;
  action: () => void;
}

interface OnboardingCoordinatorProps {
  onComplete?: () => void;
}

export function OnboardingCoordinator({ onComplete }: OnboardingCoordinatorProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenIntro, setHasSeenIntro] = useState(false);

  // Initialize onboarding state
  useEffect(() => {
    const introSeen = localStorage.getItem("tanium-intro-seen") === "true";
    setHasSeenIntro(introSeen);
  }, []);

  // Onboarding steps
  const steps: OnboardingStep[] = [
    {
      id: "intro",
      title: "Welcome to Tanium Learning",
      description: "Let us introduce you to the most powerful endpoint management platform",
      icon: Heart,
      completed: hasSeenIntro,
      action: () => {
        localStorage.setItem("tanium-intro-seen", "true");
        setHasSeenIntro(true);
        setCurrentStep(1);
      },
    },
    {
      id: "beginner-mode",
      title: "Enable Beginner Mode",
      description: "Turn on extra guidance, tips, and confidence-building features",
      icon: User,
      completed: localStorage.getItem("tanium-beginner-mode") === "true",
      action: () => {
        localStorage.setItem("tanium-beginner-mode", "true");
        setCurrentStep(2);
      },
    },
    {
      id: "foundation",
      title: "Start Foundation Learning",
      description: "Begin with the essentials - no prior Tanium knowledge needed",
      icon: Brain,
      completed: localStorage.getItem("tanium-foundation-started") === "true",
      action: () => {
        localStorage.setItem("tanium-foundation-started", "true");
        router.push("/beginner");
        onComplete?.();
      },
    },
  ];

  const completedSteps = steps.filter((step) => step.completed).length;
  const progress = (completedSteps / steps.length) * 100;

  if (completedSteps === steps.length) {
    return (
      <div className="space-y-6 p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#22c55e]">
          <Trophy className="h-8 w-8 text-foreground" />
        </div>
        <div>
          <h2 className="mb-2 text-2xl font-bold text-foreground">You're All Set!</h2>
          <p className="mb-6 text-muted-foreground">
            Your beginner-friendly learning environment is ready. Let's start your Tanium journey!
          </p>
          <Button
            onClick={() => router.push("/beginner")}
            className="bg-tanium-accent hover:bg-blue-600"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Begin Learning
          </Button>
        </div>
      </div>
    );
  }

  const currentStepData = steps[currentStep];

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Progress Header */}
      <div className="text-center">
        <h1 className="mb-4 text-3xl font-bold text-foreground">Let's Get You Started</h1>
        <p className="mb-6 text-muted-foreground">
          We'll set up your personalized learning experience in just a few steps
        </p>
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground">
            Step {currentStep + 1} of {steps.length}
          </p>
        </div>
      </div>

      {/* Current Step */}
      <Card className="glass border-white/10">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary">
            <currentStepData.icon className="h-8 w-8 text-foreground" />
          </div>
          <CardTitle className="text-2xl text-foreground">{currentStepData.title}</CardTitle>
          <p className="text-muted-foreground">{currentStepData.description}</p>
        </CardHeader>
        <CardContent className="text-center">
          {currentStep === 0 && (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Tanium helps IT teams see, control, and secure every endpoint instantly. Whether
                you're completely new to endpoint management or just new to Tanium, we'll guide you
                every step of the way.
              </p>
              <div className="my-6 grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-white/5 p-4">
                  <Target className="mx-auto mb-2 h-6 w-6 text-primary" />
                  <p className="text-sm text-muted-foreground">Beginner-Friendly</p>
                </div>
                <div className="rounded-lg bg-white/5 p-4">
                  <BookOpen className="mx-auto mb-2 h-6 w-6 text-[#22c55e]" />
                  <p className="text-sm text-muted-foreground">Step-by-Step</p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-4">
              <p className="text-muted-foreground">Beginner Mode adds helpful features like:</p>
              <ul className="mx-auto max-w-md space-y-2 text-left">
                <li className="flex items-center text-muted-foreground">
                  <CheckCircle className="mr-2 h-4 w-4 text-[#22c55e]" />
                  Extra explanations and context
                </li>
                <li className="flex items-center text-muted-foreground">
                  <CheckCircle className="mr-2 h-4 w-4 text-[#22c55e]" />
                  Confidence-building encouragement
                </li>
                <li className="flex items-center text-muted-foreground">
                  <CheckCircle className="mr-2 h-4 w-4 text-[#22c55e]" />
                  Navigation assistance
                </li>
                <li className="flex items-center text-muted-foreground">
                  <CheckCircle className="mr-2 h-4 w-4 text-[#22c55e]" />
                  Progress celebration
                </li>
              </ul>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Your foundation learning covers everything you need to know about Tanium, starting
                from the very beginning. Perfect for complete beginners!
              </p>
              <div className="rounded-lg border border-primary/30 bg-gradient-to-r from-blue-500/20 to-primary/20 p-4">
                <p className="text-sm text-blue-100">
                  <strong>5 modules • 85 minutes • No prerequisites</strong>
                </p>
              </div>
            </div>
          )}

          <Button
            onClick={currentStepData.action}
            className="bg-tanium-accent mt-6 w-full hover:bg-blue-600"
            size="lg"
          >
            {currentStep === steps.length - 1 ? (
              <>
                <BookOpen className="mr-2 h-4 w-4" />
                Start Learning
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Step Overview */}
      <div className="grid grid-cols-3 gap-4">
        {steps.map((step, index) => (
          <Card
            key={step.id}
            className={`glass border-white/10 ${
              index === currentStep ? "border-blue-500/50 bg-primary/10" : ""
            } ${step.completed ? "border-green-500/50 bg-[#22c55e]/5" : ""}`}
          >
            <CardContent className="p-4 text-center">
              <div
                className={`mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full ${
                  step.completed
                    ? "bg-[#22c55e]"
                    : index === currentStep
                      ? "bg-primary"
                      : "bg-muted"
                }`}
              >
                {step.completed ? (
                  <CheckCircle className="h-4 w-4 text-foreground" />
                ) : (
                  <step.icon className="h-4 w-4 text-foreground" />
                )}
              </div>
              <p className="text-xs font-medium text-muted-foreground">{step.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
