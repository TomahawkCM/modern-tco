"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  Brain,
  Target,
  TrendingUp,
  Calendar as CalendarIcon,
  BookOpen,
  Video,
  Award,
  BarChart3,
  ChevronRight,
  ChevronLeft,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OnboardingFlowProps {
  /** Whether to show the onboarding flow (controlled) */
  open?: boolean;
  /** Callback when onboarding is completed */
  onComplete?: () => void;
  /** User's name for personalization */
  userName?: string;
}

/**
 * OnboardingFlow Component
 *
 * Interactive multi-step wizard that guides new users through the platform
 * on their first login. Explains features, sets exam date, and encourages first steps.
 */
export function OnboardingFlow({
  open: controlledOpen,
  onComplete,
  userName = "there",
}: OnboardingFlowProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [examDate, setExamDate] = useState<Date | undefined>(undefined);
  const [completed, setCompleted] = useState(false);

  // Check if user has completed onboarding before
  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem("onboarding_completed");
    if (!hasCompletedOnboarding && controlledOpen === undefined) {
      // Auto-open if user hasn't completed onboarding
      setOpen(true);
    } else if (controlledOpen !== undefined) {
      setOpen(controlledOpen);
    }
  }, [controlledOpen]);

  const totalSteps = 6;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleComplete = () => {
    // Save exam date to localStorage if set
    if (examDate) {
      localStorage.setItem("user_exam_date", examDate.toISOString());
    }

    // Mark onboarding as completed
    localStorage.setItem("onboarding_completed", "true");
    setCompleted(true);

    // Call completion callback
    if (onComplete) {
      onComplete();
    }

    // Close dialog after short delay
    setTimeout(() => {
      setOpen(false);
    }, 1500);
  };

  const handleSkip = () => {
    localStorage.setItem("onboarding_completed", "true");
    setOpen(false);
    if (onComplete) {
      onComplete();
    }
  };

  // Step configurations
  const steps = [
    {
      title: "Welcome to Modern Tanium TCO! 🎓",
      content: <WelcomeStep userName={userName} />,
    },
    {
      title: "Research-Backed Learning Techniques",
      content: <LearningTechniquesStep />,
    },
    {
      title: "Set Your Exam Date",
      content: <ExamDateStep examDate={examDate} setExamDate={setExamDate} />,
    },
    {
      title: "Your Learning Dashboard",
      content: <DashboardStep />,
    },
    {
      title: "Start Your Journey",
      content: <FirstStepsStep />,
    },
    {
      title: "You're All Set! 🚀",
      content: <CompletionStep />,
    },
  ];

  const currentStepData = steps[currentStep];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between mb-2">
            <DialogTitle className="text-2xl">
              {completed ? "Welcome Aboard! 🎉" : currentStepData.title}
            </DialogTitle>
            {!completed && (
              <Badge variant="outline" className="text-xs">
                Step {currentStep + 1} of {totalSteps}
              </Badge>
            )}
          </div>
          {!completed && (
            <Progress value={progress} className="h-2" />
          )}
        </DialogHeader>

        <div className="py-6">
          {completed ? (
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-[#22c55e]/20 rounded-full flex items-center justify-center">
                <Check className="h-8 w-8 text-[#22c55e]" />
              </div>
              <p className="text-lg text-muted-foreground">
                Onboarding complete! Redirecting you to your dashboard...
              </p>
            </div>
          ) : (
            currentStepData.content
          )}
        </div>

        {!completed && (
          <DialogFooter className="flex justify-between sm:justify-between">
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={handleSkip}
                className="text-muted-foreground"
              >
                Skip for now
              </Button>
              <Button onClick={handleNext} className="gap-2">
                {currentStep === totalSteps - 1 ? (
                  <>
                    Complete
                    <Check className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Step Components

function WelcomeStep({ userName }: { userName: string }) {
  return (
    <div className="space-y-6 text-center">
      <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
        <GraduationCap className="h-10 w-10 text-foreground" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Welcome, {userName}!</h2>
        <p className="text-muted-foreground max-w-lg mx-auto">
          You're about to experience an enterprise-grade learning platform
          designed specifically for Tanium Core Operator certification. Let's
          take a quick tour to get you started!
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
        <div className="text-left p-4 rounded-lg border border-primary/20 bg-primary/5">
          <div className="text-3xl font-bold text-primary">42%</div>
          <div className="text-xs text-muted-foreground">Better retention</div>
        </div>
        <div className="text-left p-4 rounded-lg border border-accent/20 bg-accent/5">
          <div className="text-3xl font-bold text-accent-foreground">34%</div>
          <div className="text-xs text-muted-foreground">Higher learning</div>
        </div>
        <div className="text-left p-4 rounded-lg border border-[#22c55e]/20 bg-[#22c55e]/5">
          <div className="text-3xl font-bold text-[#22c55e]">48%</div>
          <div className="text-xs text-muted-foreground">More engagement</div>
        </div>
        <div className="text-left p-4 rounded-lg border border-[#f97316]/20 bg-yellow-500/5">
          <div className="text-3xl font-bold text-[#f97316]">45%</div>
          <div className="text-xs text-muted-foreground">Study effectiveness</div>
        </div>
      </div>
      <p className="text-sm text-muted-foreground italic">
        All metrics backed by peer-reviewed research
      </p>
    </div>
  );
}

function LearningTechniquesStep() {
  const techniques = [
    {
      icon: Brain,
      title: "Spaced Repetition (2357 Method)",
      description:
        "Reviews scheduled at optimal intervals for 42% better retention",
      color: "blue",
    },
    {
      icon: Target,
      title: "Active Recall",
      description: "Testing yourself improves learning by 34%",
      color: "purple",
    },
    {
      icon: Award,
      title: "Gamification",
      description: "Points and achievements increase engagement by 48%",
      color: "green",
    },
    {
      icon: TrendingUp,
      title: "Analytics",
      description: "Data-driven insights improve study effectiveness by 45%",
      color: "yellow",
    },
  ];

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-center mb-6">
        This platform uses <strong>four research-backed techniques</strong> to
        maximize your learning efficiency:
      </p>
      <div className="grid grid-cols-1 gap-4">
        {techniques.map((technique) => {
          const Icon = technique.icon;
          return (
            <Card
              key={technique.title}
              className={cn(
                "border-l-4",
                technique.color === "blue" && "border-l-blue-500 bg-primary/5",
                technique.color === "purple" && "border-l-purple-500 bg-accent/5",
                technique.color === "green" && "border-l-green-500 bg-[#22c55e]/5",
                technique.color === "yellow" && "border-l-yellow-500 bg-yellow-500/5"
              )}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Icon
                    className={cn(
                      "h-5 w-5",
                      technique.color === "blue" && "text-primary",
                      technique.color === "purple" && "text-accent-foreground",
                      technique.color === "green" && "text-[#22c55e]",
                      technique.color === "yellow" && "text-[#f97316]"
                    )}
                  />
                  {technique.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{technique.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function ExamDateStep({
  examDate,
  setExamDate,
}: {
  examDate: Date | undefined;
  setExamDate: (date: Date | undefined) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <CalendarIcon className="mx-auto h-12 w-12 text-primary" />
        <h3 className="text-xl font-semibold">When is your exam?</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Setting your exam date helps the platform create a personalized study
          schedule and pace your learning appropriately. You can change this
          later in Settings.
        </p>
      </div>
      <div className="flex justify-center">
        <Calendar
          mode="single"
          selected={examDate}
          onSelect={setExamDate}
          disabled={(date) => date < new Date()}
          className="rounded-md border"
        />
      </div>
      {examDate && (
        <div className="text-center p-4 bg-[#22c55e]/10 border border-[#22c55e]/20 rounded-lg">
          <p className="text-sm text-[#22c55e]">
            Exam date set:{" "}
            <strong>{examDate.toLocaleDateString()}</strong>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {Math.ceil(
              (examDate.getTime() - new Date().getTime()) /
                (1000 * 60 * 60 * 24)
            )}{" "}
            days until your exam
          </p>
        </div>
      )}
    </div>
  );
}

function DashboardStep() {
  const features = [
    {
      icon: Target,
      title: "Exam Readiness",
      description: "Track your overall preparedness (aim for 85%+)",
    },
    {
      icon: BookOpen,
      title: "Today's Activities",
      description: "Reviews due today and recommended study modules",
    },
    {
      icon: BarChart3,
      title: "Progress Analytics",
      description: "Detailed metrics on retention, mastery, and performance",
    },
    {
      icon: Award,
      title: "Points & Achievements",
      description: "Level up and unlock achievements as you learn",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold">Your Learning Dashboard</h3>
        <p className="text-muted-foreground">
          Your Dashboard is mission control for your certification journey. Here's
          what you'll find:
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Card key={feature.title} className="bg-card/30">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Icon className="h-4 w-4 text-primary" />
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
        <p className="text-sm text-primary">
          💡 <strong>Pro tip:</strong> Check your Dashboard daily to stay on
          track. The platform adapts to your performance and suggests what to
          study next.
        </p>
      </div>
    </div>
  );
}

function FirstStepsStep() {
  const steps = [
    {
      number: 1,
      title: "Start with Platform Foundation",
      description:
        "Begin with the first module to build your foundational knowledge",
      action: "Go to Learn",
      icon: BookOpen,
    },
    {
      number: 2,
      title: "Watch videos & complete quizzes",
      description:
        "Interactive content adds concepts to your spaced repetition schedule",
      action: "Watch Videos",
      icon: Video,
    },
    {
      number: 3,
      title: "Do your daily reviews",
      description:
        "Complete scheduled reviews every day for maximum retention",
      action: "Start Reviews",
      icon: Brain,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold">Your Next Steps</h3>
        <p className="text-muted-foreground">
          Here's how to get started with your certification journey:
        </p>
      </div>
      <div className="space-y-4">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.number}
              className="flex gap-4 p-4 rounded-lg border border-gray-700 bg-card/30 hover:bg-card/50 transition-colors"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold">
                {step.number}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-primary" />
                  <h4 className="font-semibold text-sm">{step.title}</h4>
                </div>
                <p className="text-xs text-muted-foreground">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="p-4 bg-[#f97316]/10 border border-[#f97316]/20 rounded-lg">
        <p className="text-sm text-[#f97316]">
          ⚡ <strong>Remember:</strong> Consistency beats intensity. Study 30
          minutes daily rather than cramming 3.5 hours once a week.
        </p>
      </div>
    </div>
  );
}

function CompletionStep() {
  return (
    <div className="space-y-6 text-center">
      <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
        <Check className="h-10 w-10 text-foreground" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">You're ready to begin!</h2>
        <p className="text-muted-foreground max-w-lg mx-auto">
          You now know how to use the platform effectively. Click "Complete" to
          go to your Dashboard and start your first module.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
        <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
          <div className="text-2xl font-bold text-primary mb-1">
            Study Daily
          </div>
          <div className="text-xs text-muted-foreground">
            Build a consistent review habit
          </div>
        </div>
        <div className="p-4 rounded-lg border border-accent/20 bg-accent/5">
          <div className="text-2xl font-bold text-accent-foreground mb-1">
            Trust the System
          </div>
          <div className="text-xs text-muted-foreground">
            Let spaced repetition work its magic
          </div>
        </div>
        <div className="p-4 rounded-lg border border-[#22c55e]/20 bg-[#22c55e]/5">
          <div className="text-2xl font-bold text-[#22c55e] mb-1">
            Track Progress
          </div>
          <div className="text-xs text-muted-foreground">
            Monitor your exam readiness
          </div>
        </div>
      </div>
      <div className="p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-primary/20 rounded-lg">
        <p className="text-lg font-semibold text-primary mb-2">
          Good luck on your certification journey! 🚀
        </p>
        <p className="text-sm text-muted-foreground">
          You can replay this onboarding anytime from Settings → Help →
          Restart Tour
        </p>
      </div>
    </div>
  );
}

export default OnboardingFlow;
