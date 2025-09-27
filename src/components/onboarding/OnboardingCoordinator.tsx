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
    const introSeen = localStorage.getItem('tanium-intro-seen') === 'true';
    setHasSeenIntro(introSeen);
  }, []);

  // Onboarding steps
  const steps: OnboardingStep[] = [
    {
      id: 'intro',
      title: 'Welcome to Tanium Learning',
      description: 'Let us introduce you to the most powerful endpoint management platform',
      icon: Heart,
      completed: hasSeenIntro,
      action: () => {
        localStorage.setItem('tanium-intro-seen', 'true');
        setHasSeenIntro(true);
        setCurrentStep(1);
      }
    },
    {
      id: 'beginner-mode',
      title: 'Enable Beginner Mode',
      description: 'Turn on extra guidance, tips, and confidence-building features',
      icon: User,
      completed: localStorage.getItem('tanium-beginner-mode') === 'true',
      action: () => {
        localStorage.setItem('tanium-beginner-mode', 'true');
        setCurrentStep(2);
      }
    },
    {
      id: 'foundation',
      title: 'Start Foundation Learning',
      description: 'Begin with the essentials - no prior Tanium knowledge needed',
      icon: Brain,
      completed: localStorage.getItem('tanium-foundation-started') === 'true',
      action: () => {
        localStorage.setItem('tanium-foundation-started', 'true');
        router.push('/beginner');
        onComplete?.();
      }
    },
  ];

  const completedSteps = steps.filter(step => step.completed).length;
  const progress = (completedSteps / steps.length) * 100;

  if (completedSteps === steps.length) {
    return (
      <div className="text-center space-y-6 p-8">
        <div className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
          <Trophy className="h-8 w-8 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">You're All Set!</h2>
          <p className="text-gray-300 mb-6">
            Your beginner-friendly learning environment is ready. Let's start your Tanium journey!
          </p>
          <Button 
            onClick={() => router.push('/beginner')}
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
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Progress Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-4">Let's Get You Started</h1>
        <p className="text-gray-300 mb-6">
          We'll set up your personalized learning experience in just a few steps
        </p>
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-gray-400">
            Step {currentStep + 1} of {steps.length}
          </p>
        </div>
      </div>

      {/* Current Step */}
      <Card className="glass border-white/10">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-4">
            <currentStepData.icon className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl text-white">{currentStepData.title}</CardTitle>
          <p className="text-gray-300">{currentStepData.description}</p>
        </CardHeader>
        <CardContent className="text-center">
          {currentStep === 0 && (
            <div className="space-y-4">
              <p className="text-gray-200">
                Tanium helps IT teams see, control, and secure every endpoint instantly. 
                Whether you're completely new to endpoint management or just new to Tanium, 
                we'll guide you every step of the way.
              </p>
              <div className="grid grid-cols-2 gap-4 my-6">
                <div className="bg-white/5 rounded-lg p-4">
                  <Target className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-300">Beginner-Friendly</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <BookOpen className="h-6 w-6 text-green-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-300">Step-by-Step</p>
                </div>
              </div>
            </div>
          )}
          
          {currentStep === 1 && (
            <div className="space-y-4">
              <p className="text-gray-200">
                Beginner Mode adds helpful features like:
              </p>
              <ul className="text-left space-y-2 max-w-md mx-auto">
                <li className="flex items-center text-gray-300">
                  <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                  Extra explanations and context
                </li>
                <li className="flex items-center text-gray-300">
                  <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                  Confidence-building encouragement
                </li>
                <li className="flex items-center text-gray-300">
                  <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                  Navigation assistance
                </li>
                <li className="flex items-center text-gray-300">
                  <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                  Progress celebration
                </li>
              </ul>
            </div>
          )}
          
          {currentStep === 2 && (
            <div className="space-y-4">
              <p className="text-gray-200">
                Your foundation learning covers everything you need to know about Tanium, 
                starting from the very beginning. Perfect for complete beginners!
              </p>
              <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-lg p-4 border border-blue-500/30">
                <p className="text-blue-100 text-sm">
                  <strong>5 modules • 85 minutes • No prerequisites</strong>
                </p>
              </div>
            </div>
          )}
          
          <Button
            onClick={currentStepData.action}
            className="w-full bg-tanium-accent hover:bg-blue-600 mt-6"
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
              index === currentStep ? 'border-blue-500/50 bg-blue-500/10' : ''
            } ${step.completed ? 'border-green-500/50 bg-green-500/5' : ''}`}
          >
            <CardContent className="p-4 text-center">
              <div className={`mx-auto w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                step.completed ? 'bg-green-500' : index === currentStep ? 'bg-blue-500' : 'bg-gray-600'
              }`}>
                {step.completed ? (
                  <CheckCircle className="h-4 w-4 text-white" />
                ) : (
                  <step.icon className="h-4 w-4 text-white" />
                )}
              </div>
              <p className="text-xs text-gray-300 font-medium">{step.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}