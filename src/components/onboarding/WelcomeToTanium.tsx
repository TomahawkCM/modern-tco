/**
 * WelcomeToTanium Component - Foundation onboarding for complete beginners
 * Provides interactive introduction to endpoint management and Tanium platform
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  ArrowLeft,
  CheckCircle, 
  Monitor,
  Shield,
  Network,
  Settings,
  Trophy,
  BookOpen,
  Lightbulb,
  Users,
  Target
} from "lucide-react";
import { cn } from "@/lib/utils";

// TypeScript interfaces for full type safety
interface OnboardingStep {
  id: string;
  title: string;
  subtitle: string;
  content: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  completable: boolean;
}

interface ProgressState {
  currentStep: number;
  completedSteps: Set<number>;
  isComplete: boolean;
}

interface WelcomeToTaniumProps {
  onComplete?: (progress: ProgressState) => void;
  onSkip?: () => void;
  className?: string;
}

interface ConceptCard {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  color: string;
}

export function WelcomeToTanium({ onComplete, onSkip, className }: WelcomeToTaniumProps) {
  const router = useRouter();
  const [progress, setProgress] = useState<ProgressState>({
    currentStep: 0,
    completedSteps: new Set(),
    isComplete: false
  });

  // Foundation concepts for complete beginners
  const concepts: ConceptCard[] = [
    {
      icon: Monitor,
      title: "Endpoints",
      description: "Computers, servers, and devices connected to your network that need monitoring and management.",
      color: "text-blue-400"
    },
    {
      icon: Shield,
      title: "Security Management",
      description: "Protecting your organization's digital assets from threats and ensuring compliance with policies.",
      color: "text-green-400"
    },
    {
      icon: Network,
      title: "Real-Time Visibility",
      description: "Seeing what's happening across all your endpoints instantly, not waiting hours or days for reports.",
      color: "text-cyan-400"
    },
    {
      icon: Settings,
      title: "Automated Actions",
      description: "Taking corrective actions across thousands of endpoints simultaneously, saving time and reducing errors.",
      color: "text-orange-400"
    }
  ];

  const steps: OnboardingStep[] = [
    {
      id: "welcome",
      title: "Welcome to Your Certification Journey!",
      subtitle: "Let's start with the absolute basics",
      icon: Trophy,
      color: "text-yellow-400",
      bgColor: "bg-yellow-900/20",
      completable: true,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <Trophy className="mx-auto mb-4 h-16 w-16 text-yellow-400" />
            <h3 className="mb-2 text-2xl font-bold text-white">
              Congratulations on Starting Your TCO Journey!
            </h3>
            <p className="text-lg text-gray-300">
              You're about to become a <strong>Tanium Certified Operator</strong> - 
              a valuable skill that organizations worldwide need.
            </p>
          </div>
          
          <Card className="glass border-white/10">
            <CardContent className="p-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center">
                  <div className="mb-2 text-2xl font-bold text-tanium-accent">$95K+</div>
                  <div className="text-sm text-gray-300">Average TCO Salary</div>
                </div>
                <div className="text-center">
                  <div className="mb-2 text-2xl font-bold text-green-400">90%</div>
                  <div className="text-sm text-gray-300">Job Placement Rate</div>
                </div>
                <div className="text-center">
                  <div className="mb-2 text-2xl font-bold text-blue-400">2 Weeks</div>
                  <div className="text-sm text-gray-300">Typical Study Time</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="rounded-lg bg-green-900/20 border border-green-400/20 p-4">
            <div className="flex items-start gap-3">
              <Lightbulb className="mt-1 h-5 w-5 text-green-400 shrink-0" />
              <div>
                <div className="font-semibold text-green-400">Perfect for Beginners</div>
                <div className="text-sm text-gray-300">
                  This course assumes zero prior knowledge of Tanium or endpoint management. 
                  We'll start with the very basics and build your expertise step by step.
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "what-is-endpoint-management",
      title: "What is Endpoint Management?",
      subtitle: "Understanding the fundamentals",
      icon: Monitor,
      color: "text-blue-400",
      bgColor: "bg-blue-900/20",
      completable: true,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <Monitor className="mx-auto mb-4 h-12 w-12 text-blue-400" />
            <h3 className="mb-4 text-xl font-bold text-white">
              Think of Your Organization's Digital Ecosystem
            </h3>
          </div>

          <div className="space-y-4">
            <p className="text-gray-300 leading-relaxed">
              Imagine you're responsible for the health and security of <strong>thousands of computers</strong> 
              across multiple offices, remote workers, and data centers. How do you:
            </p>
            
            <div className="space-y-3 ml-4">
              <div className="flex items-start gap-3">
                <Target className="mt-1 h-4 w-4 text-orange-400 shrink-0" />
                <span className="text-gray-300">Know which computers have outdated software?</span>
              </div>
              <div className="flex items-start gap-3">
                <Target className="mt-1 h-4 w-4 text-orange-400 shrink-0" />
                <span className="text-gray-300">Detect security threats in real-time?</span>
              </div>
              <div className="flex items-start gap-3">
                <Target className="mt-1 h-4 w-4 text-orange-400 shrink-0" />
                <span className="text-gray-300">Update software on all machines simultaneously?</span>
              </div>
              <div className="flex items-start gap-3">
                <Target className="mt-1 h-4 w-4 text-orange-400 shrink-0" />
                <span className="text-gray-300">Ensure compliance with security policies?</span>
              </div>
            </div>

            <div className="rounded-lg bg-blue-900/20 border border-blue-400/20 p-4">
              <div className="font-semibold text-blue-400 mb-2">This is Endpoint Management!</div>
              <div className="text-sm text-gray-300">
                It's the practice of managing, monitoring, and securing all the computers and devices 
                (called "endpoints") in an organization's network - and doing it efficiently at scale.
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "what-is-tanium",
      title: "What Makes Tanium Special?",
      subtitle: "Understanding the platform you'll master",
      icon: Network,
      color: "text-cyan-400", 
      bgColor: "bg-cyan-900/20",
      completable: true,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <Network className="mx-auto mb-4 h-12 w-12 text-cyan-400" />
            <h3 className="mb-4 text-xl font-bold text-white">
              Tanium: The Real-Time Endpoint Platform
            </h3>
          </div>

          <div className="space-y-4">
            <p className="text-gray-300 leading-relaxed">
              While traditional tools take <strong>hours or days</strong> to collect information from endpoints, 
              Tanium provides answers in <strong>15 seconds or less</strong> - across millions of endpoints.
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              {concepts.map((concept, index) => (
                <Card key={concept.title} className="glass border-white/10 transition-all hover:border-white/20">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <concept.icon className={cn("h-8 w-8 shrink-0", concept.color)} />
                      <div>
                        <div className="font-semibold text-white mb-1">{concept.title}</div>
                        <div className="text-sm text-gray-300">{concept.description}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="rounded-lg bg-cyan-900/20 border border-cyan-400/20 p-4">
              <div className="font-semibold text-cyan-400 mb-2">Why Companies Choose Tanium</div>
              <div className="text-sm text-gray-300">
                Fortune 500 companies, government agencies, and organizations worldwide use Tanium 
                because it provides unmatched speed, scale, and accuracy for endpoint management.
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "your-role",
      title: "Your Role as a TCO",
      subtitle: "What you'll be able to do",
      icon: Users,
      color: "text-green-400",
      bgColor: "bg-green-900/20", 
      completable: true,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <Users className="mx-auto mb-4 h-12 w-12 text-green-400" />
            <h3 className="mb-4 text-xl font-bold text-white">
              Tanium Certified Operator Responsibilities
            </h3>
          </div>

          <div className="space-y-4">
            <p className="text-gray-300 leading-relaxed">
              As a <strong>Tanium Certified Operator</strong>, you'll be the expert who can:
            </p>
            
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-lg bg-green-900/20 border border-green-400/20 p-3">
                <div className="font-semibold text-green-400 text-sm mb-1">Ask Questions</div>
                <div className="text-xs text-gray-300">Query endpoints for real-time information</div>
              </div>
              <div className="rounded-lg bg-blue-900/20 border border-blue-400/20 p-3">
                <div className="font-semibold text-blue-400 text-sm mb-1">Refine & Target</div>
                <div className="text-xs text-gray-300">Filter and target specific endpoint groups</div>
              </div>
              <div className="rounded-lg bg-orange-900/20 border border-orange-400/20 p-3">
                <div className="font-semibold text-orange-400 text-sm mb-1">Take Action</div>
                <div className="text-xs text-gray-300">Deploy updates and remediate issues</div>
              </div>
              <div className="rounded-lg bg-cyan-900/20 border border-cyan-400/20 p-3">
                <div className="font-semibold text-cyan-400 text-sm mb-1">Generate Reports</div>
                <div className="text-xs text-gray-300">Create compliance and status reports</div>
              </div>
            </div>

            <div className="rounded-lg bg-yellow-900/20 border border-yellow-400/20 p-4">
              <div className="flex items-start gap-3">
                <Trophy className="mt-1 h-5 w-5 text-yellow-400 shrink-0" />
                <div>
                  <div className="font-semibold text-yellow-400">Career Impact</div>
                  <div className="text-sm text-gray-300">
                    TCO certification opens doors to cybersecurity, IT operations, and compliance roles 
                    with significantly higher earning potential.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "ready-to-start",
      title: "Ready to Begin Your Journey?",
      subtitle: "Let's build your foundation",
      icon: BookOpen,
      color: "text-tanium-accent",
      bgColor: "bg-blue-900/20",
      completable: true,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <BookOpen className="mx-auto mb-4 h-12 w-12 text-tanium-accent" />
            <h3 className="mb-4 text-xl font-bold text-white">
              Your Learning Path Awaits
            </h3>
          </div>

          <div className="space-y-4">
            <p className="text-gray-300 leading-relaxed">
              You now understand the <strong>what</strong> and <strong>why</strong> of endpoint management and Tanium. 
              Next, we'll dive into the <strong>how</strong> - building your practical skills step by step.
            </p>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-900/50">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="text-sm text-gray-300">Foundation concepts mastered</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-900/20 border border-blue-400/20">
                <ArrowRight className="h-5 w-5 text-blue-400" />
                <span className="text-sm text-gray-300">Next: Prerequisites assessment</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50">
                <Target className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-400">Then: Hands-on learning modules</span>
              </div>
            </div>

            <div className="rounded-lg bg-tanium-accent/10 border border-tanium-accent/20 p-4">
              <div className="font-semibold text-tanium-accent mb-2">Confidence Boost</div>
              <div className="text-sm text-gray-300">
                Remember: Every expert was once a beginner. You've already taken the most important step 
                by starting this journey. We'll guide you every step of the way!
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  // Handle step completion
  const completeCurrentStep = (): void => {
    const currentStepIndex = progress.currentStep;
    const newCompletedSteps = new Set(progress.completedSteps).add(currentStepIndex);
    
    setProgress(prev => ({
      ...prev,
      completedSteps: newCompletedSteps,
      isComplete: newCompletedSteps.size === steps.length
    }));
  };

  // Navigation functions
  const goToNextStep = (): void => {
    if (progress.currentStep < steps.length - 1) {
      setProgress(prev => ({ ...prev, currentStep: prev.currentStep + 1 }));
    }
  };

  const goToPreviousStep = (): void => {
    if (progress.currentStep > 0) {
      setProgress(prev => ({ ...prev, currentStep: prev.currentStep - 1 }));
    }
  };

  const finishOnboarding = (): void => {
    if (onComplete) {
      onComplete(progress);
    } else {
      // Default navigation to prerequisites check
      router.push('/onboarding/prerequisites');
    }
  };

  // Auto-complete final step after a delay for better UX
  useEffect(() => {
    if (progress.currentStep === steps.length - 1) {
      const timer = setTimeout(() => {
        completeCurrentStep();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [progress.currentStep]);

  const currentStep = steps[progress.currentStep];
  const progressPercentage = Math.round(((progress.currentStep + 1) / steps.length) * 100);
  const isLastStep = progress.currentStep === steps.length - 1;
  const isFirstStep = progress.currentStep === 0;

  return (
    <div className={cn("mx-auto max-w-4xl space-y-6", className)}>
      {/* Progress Header */}
      <div className="text-center">
        <h1 className="mb-2 text-3xl font-bold text-white">Welcome to TCO Certification</h1>
        <p className="mb-4 text-gray-300">Foundation building for complete beginners</p>
        <div className="flex items-center justify-center gap-4 mb-4">
          <Progress value={progressPercentage} className="h-2 w-48" />
          <Badge variant="outline" className="text-tanium-accent border-tanium-accent">
            Step {progress.currentStep + 1} of {steps.length}
          </Badge>
        </div>
      </div>

      {/* Main Content Card */}
      <Card className={cn("glass border-2", currentStep.bgColor, "border-white/10")}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className={cn("rounded-full p-2 border-2", currentStep.bgColor, "border-current")}>
              <currentStep.icon className={cn("h-6 w-6", currentStep.color)} />
            </div>
            <div>
              <CardTitle className="text-white">{currentStep.title}</CardTitle>
              <p className="text-sm text-gray-400">{currentStep.subtitle}</p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {currentStep.content}
        </CardContent>
      </Card>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={goToPreviousStep}
          disabled={isFirstStep}
          className="border-white/20 text-white hover:bg-white/10"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>

        <div className="flex gap-3">
          {onSkip && (
            <Button
              variant="ghost"
              onClick={onSkip}
              className="text-gray-400 hover:text-white"
            >
              Skip Introduction
            </Button>
          )}
          
          {isLastStep ? (
            <Button
              onClick={finishOnboarding}
              className="bg-tanium-accent hover:bg-blue-600"
              disabled={!progress.completedSteps.has(progress.currentStep)}
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Start Learning Journey
            </Button>
          ) : (
            <Button
              onClick={() => {
                completeCurrentStep();
                goToNextStep();
              }}
              className="bg-tanium-accent hover:bg-blue-600"
            >
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Step Indicator Dots */}
      <div className="flex justify-center gap-2">
        {steps.map((_, index) => (
          <div
            key={index}
            className={cn(
              "h-2 w-2 rounded-full transition-all",
              index === progress.currentStep
                ? "bg-tanium-accent w-6"
                : progress.completedSteps.has(index)
                ? "bg-green-400"
                : "bg-gray-600"
            )}
          />
        ))}
      </div>
    </div>
  );
}