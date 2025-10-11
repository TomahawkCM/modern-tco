'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HelpCircle,
  X,
  ChevronRight,
  ChevronLeft,
  Home,
  BookOpen,
  Target,
  Trophy,
  MessageCircle,
  Compass,
  Map,
  Lightbulb,
  Info,
  ArrowRight,
  MousePointer,
  Sparkles,
  CheckCircle
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { getArchonOverlay, getHoverGradient } from '@/lib/archon-theme';

// TypeScript interfaces for navigation helper
interface NavigationTip {
  id: string;
  path: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  tips: string[];
  nextStep?: string;
  isBeginnerEssential: boolean;
}

interface NavigationStep {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  path: string;
  order: number;
  isCompleted: boolean;
}

interface NavigationHelperProps {
  isBeginnerMode?: boolean;
  showHelper?: boolean;
  onClose?: () => void;
  completedPaths?: string[];
}

export default function NavigationHelper({
  isBeginnerMode = true,
  showHelper = true,
  onClose,
  completedPaths = []
}: NavigationHelperProps) {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showTips, setShowTips] = useState(true);
  const [currentTip, setCurrentTip] = useState<NavigationTip | null>(null);
  const [visitedPaths, setVisitedPaths] = useState<string[]>([]);
  const [showWelcome, setShowWelcome] = useState(false);

  // Navigation tips for different pages
  const navigationTips: NavigationTip[] = [
    {
      id: 'home',
      path: '/',
      title: 'Welcome to Tanium TCO Platform',
      description: 'Your journey to certification starts here',
      icon: Home,
      tips: [
        'Start with Phase 0: Foundation if you\'re new to Tanium',
        'Check your progress dashboard regularly',
        'Use the quick links for easy navigation',
        'Enable beginner mode for extra guidance'
      ],
      nextStep: '/study',
      isBeginnerEssential: true
    },
    {
      id: 'study',
      path: '/study',
      title: 'Study Modules',
      description: 'Structured learning path to certification',
      icon: BookOpen,
      tips: [
        'Begin with Phase 0: Foundation (blue banner at top)',
        'Complete modules in order for best results',
        'Each module builds on previous knowledge',
        'Track your progress with the progress bars'
      ],
      nextStep: '/practice',
      isBeginnerEssential: true
    },
    {
      id: 'practice',
      path: '/practice',
      title: 'Practice Questions',
      description: 'Test your knowledge with real exam questions',
      icon: Target,
      tips: [
        'Start with "Foundation" difficulty questions',
        'Review explanations for both correct and incorrect answers',
        'Use practice mode before attempting timed tests',
        'Focus on domains where you scored lowest'
      ],
      nextStep: '/labs',
      isBeginnerEssential: true
    },
    {
      id: 'labs',
      path: '/labs',
      title: 'Hands-On Labs',
      description: 'Apply your knowledge in simulated environments',
      icon: Compass,
      tips: [
        'Complete study modules before attempting labs',
        'Follow step-by-step instructions carefully',
        'Use hints if you get stuck',
        'Practice labs multiple times for mastery'
      ],
      nextStep: '/progress',
      isBeginnerEssential: true
    },
    {
      id: 'progress',
      path: '/progress',
      title: 'Progress Tracking',
      description: 'Monitor your learning journey',
      icon: Trophy,
      tips: [
        'Review your confidence level progression',
        'Check milestone achievements',
        'Identify weak areas for focused study',
        'Celebrate your accomplishments!'
      ],
      nextStep: '/exam',
      isBeginnerEssential: false
    },
    {
      id: 'exam',
      path: '/exam',
      title: 'Mock Exam',
      description: 'Full-length practice exam simulation',
      icon: CheckCircle,
      tips: [
        'Complete all study modules first',
        'Take practice questions to prepare',
        'Simulate real exam conditions (105 minutes)',
        'Review all incorrect answers thoroughly'
      ],
      isBeginnerEssential: false
    }
  ];

  // Beginner's learning journey steps
  const learningJourney: NavigationStep[] = [
    {
      id: 'welcome',
      label: 'Welcome & Orientation',
      icon: Sparkles,
      description: 'Get familiar with the platform',
      path: '/',
      order: 1,
      isCompleted: visitedPaths.includes('/')
    },
    {
      id: 'foundation',
      label: 'Phase 0: Foundation',
      icon: BookOpen,
      description: 'Build your Tanium knowledge base',
      path: '/study',
      order: 2,
      isCompleted: completedPaths.includes('phase-0-foundation')
    },
    {
      id: 'practice-basics',
      label: 'Practice Fundamentals',
      icon: Target,
      description: 'Test your foundation knowledge',
      path: '/practice',
      order: 3,
      isCompleted: completedPaths.includes('foundation-practice')
    },
    {
      id: 'first-lab',
      label: 'First Hands-On Lab',
      icon: Compass,
      description: 'Apply knowledge practically',
      path: '/labs',
      order: 4,
      isCompleted: completedPaths.includes('first-lab')
    },
    {
      id: 'progress-check',
      label: 'Progress Review',
      icon: Trophy,
      description: 'Check your achievements',
      path: '/progress',
      order: 5,
      isCompleted: completedPaths.includes('progress-review')
    }
  ];

  // Get current page tip
  useEffect(() => {
    const tip = navigationTips.find(t => t.path === pathname);
    setCurrentTip(tip ?? null);
    
    // Track visited paths
    if (pathname && !visitedPaths.includes(pathname)) {
      setVisitedPaths(prev => [...prev, pathname]);
    }
    
    // Show welcome for first-time visitors
    if (visitedPaths.length === 0 && pathname === '/') {
      setShowWelcome(true);
    }
  }, [pathname, visitedPaths]);

  // Calculate journey progress
  const journeyProgress = Math.round(
    (learningJourney.filter(step => step.isCompleted).length / learningJourney.length) * 100
  );

  const getCurrentStepIndex = (): number => {
    const currentStep = learningJourney.findIndex(step => step.path === pathname);
    return currentStep >= 0 ? currentStep : 0;
  };

  const getNextStep = (): NavigationStep | null => {
    const incompleteSteps = learningJourney.filter(step => !step.isCompleted);
    return incompleteSteps.length > 0 ? incompleteSteps[0] : null;
  };

  if (!showHelper || !isBeginnerMode) return null;

  return (
    <>
      {/* Floating Helper Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsExpanded(!isExpanded)}
        className="fixed bottom-6 right-6 z-40 p-4 text-foreground rounded-full shadow-lg transition-colors border"
        style={{
          background: getArchonOverlay().background,
          borderColor: 'rgba(0, 255, 255, 0.3)',
          backdropFilter: 'blur(12px)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = getHoverGradient();
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = getArchonOverlay().background;
        }}
      >
        <div className="relative">
          <HelpCircle className="w-6 h-6" />
          {currentTip?.isBeginnerEssential && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
          )}
        </div>
      </motion.button>

      {/* Expanded Helper Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 h-full w-96 shadow-2xl z-50 overflow-y-auto border-l"
            style={{
              background: getArchonOverlay().background,
              backdropFilter: 'blur(20px)',
              borderColor: 'rgba(0, 255, 255, 0.3)'
            }}
          >
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Compass className="w-6 h-6 text-primary" />
                  <h2 className="text-xl font-bold text-cyan-100">Navigation Helper</h2>
                </div>
                <button
                  onClick={() => setIsExpanded(false)}
                  aria-label="Close navigation helper"
                  className="p-2 text-primary hover:text-cyan-100 rounded-lg transition-colors"
                  style={{
                    backgroundColor: 'rgba(0, 255, 255, 0.1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 255, 255, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 255, 255, 0.1)';
                  }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Beginner Mode Badge */}
              <div className="flex items-center justify-center p-3 rounded-lg border" style={{
                background: 'rgba(0, 255, 255, 0.1)',
                borderColor: 'rgba(0, 255, 255, 0.3)'
              }}>
                <Sparkles className="w-5 h-5 text-primary mr-2" />
                <span className="text-sm font-semibold text-cyan-100">
                  Beginner Mode Active
                </span>
              </div>

              {/* Journey Progress */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-cyan-100">Your Learning Journey</h3>
                  <span className="text-sm text-primary/80">{journeyProgress}% Complete</span>
                </div>
                <div className="w-full rounded-full h-2" style={{
                  background: 'rgba(0, 255, 255, 0.1)',
                  border: '1px solid rgba(0, 255, 255, 0.2)'
                }}>
                  <motion.div
                    className="h-2 rounded-full"
                    style={{ background: getHoverGradient() }}
                    initial={{ width: 0 }}
                    animate={{ width: `${journeyProgress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* Current Page Tips */}
              {currentTip && (
                <div className="space-y-4 p-4 rounded-lg border" style={{
                  background: 'rgba(0, 255, 255, 0.05)',
                  borderColor: 'rgba(0, 255, 255, 0.2)'
                }}>
                  <div className="flex items-start space-x-3">
                    <currentTip.icon className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                    <div className="flex-1 space-y-2">
                      <h3 className="font-semibold text-cyan-100">{currentTip.title}</h3>
                      <p className="text-sm text-cyan-200/80">{currentTip.description}</p>
                    </div>
                  </div>
                  
                  {showTips && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-cyan-100 flex items-center">
                        <Lightbulb className="w-4 h-4 text-primary mr-1" />
                        Tips for This Page:
                      </h4>
                      <ul className="space-y-1">
                        {currentTip.tips.map((tip, index) => (
                          <li key={index} className="text-sm text-cyan-200/80 flex items-start space-x-2">
                            <span className="text-primary mt-1">•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Learning Journey Steps */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-cyan-100">Learning Path</h3>
                <div className="space-y-2">
                  {learningJourney.map((step, index) => {
                    const isCurrent = step.path === pathname;
                    const isPast = step.isCompleted;
                    const isFuture = !isPast && !isCurrent;
                    
                    return (
                      <motion.div
                        key={step.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center space-x-3 p-3 rounded-lg transition-colors border"
                        style={{
                          background: isCurrent 
                            ? 'rgba(0, 255, 255, 0.15)' 
                            : isPast 
                              ? 'rgba(34, 211, 238, 0.1)'
                              : 'rgba(0, 255, 255, 0.05)',
                          borderColor: isCurrent 
                            ? 'rgba(0, 255, 255, 0.4)' 
                            : isPast 
                              ? 'rgba(34, 211, 238, 0.3)'
                              : 'rgba(0, 255, 255, 0.2)'
                        }}
                      >
                        <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-foreground"
                          style={{
                            background: isPast 
                              ? 'rgba(34, 211, 238, 0.8)'
                              : isCurrent
                                ? 'rgba(0, 255, 255, 0.8)'
                                : 'rgba(100, 116, 139, 0.6)'
                          }}>
                          {isPast ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <span className="text-xs font-bold">{step.order}</span>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <step.icon className={`w-4 h-4 ${
                              isCurrent ? 'text-primary' : isPast ? 'text-primary' : 'text-primary/60'
                            }`} />
                            <span className={`text-sm font-medium ${
                              isCurrent ? 'text-cyan-100' : isPast ? 'text-cyan-200' : 'text-cyan-200/80'
                            }`}>
                              {step.label}
                            </span>
                          </div>
                          <p className="text-xs text-primary/70 mt-1">
                            {step.description}
                          </p>
                        </div>
                        
                        {isCurrent && (
                          <span className="px-2 py-1 text-xs text-foreground rounded-full font-semibold" style={{
                            background: 'rgba(0, 255, 255, 0.8)'
                          }}>
                            You are here
                          </span>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Next Step Suggestion */}
              {(() => {
                const nextStep = getNextStep();
                return nextStep && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-lg border"
                    style={{
                      background: 'rgba(34, 211, 238, 0.1)',
                      borderColor: 'rgba(34, 211, 238, 0.3)'
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-cyan-200">Suggested Next Step</h4>
                      <ArrowRight className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex items-center space-x-3">
                      <nextStep.icon className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-cyan-100">{nextStep.label}</p>
                        <p className="text-xs text-cyan-200/80">{nextStep.description}</p>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full mt-3 px-4 py-2 text-foreground text-sm font-semibold rounded-lg transition-colors border"
                      style={{
                        background: 'rgba(34, 211, 238, 0.6)',
                        borderColor: 'rgba(34, 211, 238, 0.4)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(34, 211, 238, 0.8)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(34, 211, 238, 0.6)';
                      }}
                    >
                      Go to {nextStep.label}
                    </motion.button>
                  </motion.div>
                );
              })()}

              {/* Quick Actions */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-cyan-100">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button className="p-3 text-sm rounded-lg transition-colors text-left border" style={{
                    background: 'rgba(0, 255, 255, 0.05)',
                    borderColor: 'rgba(0, 255, 255, 0.2)'
                  }}>
                    <Map className="w-4 h-4 text-primary mb-1" />
                    <span className="text-xs text-cyan-200/80">Site Map</span>
                  </button>
                  <button className="p-3 text-sm rounded-lg transition-colors text-left border" style={{
                    background: 'rgba(0, 255, 255, 0.05)',
                    borderColor: 'rgba(0, 255, 255, 0.2)'
                  }}>
                    <MessageCircle className="w-4 h-4 text-primary mb-1" />
                    <span className="text-xs text-cyan-200/80">Get Help</span>
                  </button>
                  <button className="p-3 text-sm rounded-lg transition-colors text-left border" style={{
                    background: 'rgba(0, 255, 255, 0.05)',
                    borderColor: 'rgba(0, 255, 255, 0.2)'
                  }}>
                    <BookOpen className="w-4 h-4 text-primary mb-1" />
                    <span className="text-xs text-cyan-200/80">Glossary</span>
                  </button>
                  <button className="p-3 text-sm rounded-lg transition-colors text-left border" style={{
                    background: 'rgba(0, 255, 255, 0.05)',
                    borderColor: 'rgba(0, 255, 255, 0.2)'
                  }}>
                    <Info className="w-4 h-4 text-primary mb-1" />
                    <span className="text-xs text-cyan-200/80">About TCO</span>
                  </button>
                </div>
              </div>

              {/* Tutorial Prompt */}
              <div className="p-3 rounded-lg border" style={{
                background: 'rgba(0, 255, 255, 0.08)',
                borderColor: 'rgba(0, 255, 255, 0.25)'
              }}>
                <div className="flex items-start space-x-2">
                  <MousePointer className="w-4 h-4 text-primary flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <p className="text-xs text-cyan-200/90">
                      <span className="font-semibold">Pro tip:</span> Click on any element with a 
                      <span className="inline-flex items-center mx-1 px-1 py-0.5 rounded text-xs" style={{
                        background: 'rgba(0, 255, 255, 0.2)',
                        color: 'rgb(165, 243, 252)'
                      }}>
                        <Sparkles className="w-3 h-3 mr-0.5" />
                        cyan sparkle
                      </span>
                      for beginner-friendly explanations!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Welcome Modal for First-Time Users */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center p-4 z-50"
            style={{
              background: 'rgba(0, 0, 0, 0.7)'
            }}
            onClick={() => setShowWelcome(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="rounded-2xl p-8 max-w-md w-full border"
              style={{
                background: getArchonOverlay().background,
                backdropFilter: 'blur(20px)',
                borderColor: 'rgba(0, 255, 255, 0.3)'
              }}
            >
              <div className="text-center space-y-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="mx-auto w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ background: getHoverGradient() }}
                >
                  <Compass className="w-8 h-8 text-foreground" />
                </motion.div>
                
                <h2 className="text-2xl font-bold text-cyan-100">
                  Welcome, Beginner! 🌟
                </h2>
                
                <p className="text-cyan-200/80">
                  I'm your Navigation Helper! I'll guide you through your Tanium TCO certification journey 
                  step by step. Look for the blue help button in the corner for tips and guidance on every page.
                </p>
                
                <div className="p-4 rounded-lg border" style={{
                  background: 'rgba(0, 255, 255, 0.1)',
                  borderColor: 'rgba(0, 255, 255, 0.3)'
                }}>
                  <h3 className="text-sm font-semibold text-cyan-100 mb-2">
                    Your First Steps:
                  </h3>
                  <ol className="text-left space-y-1 text-sm text-cyan-200/90">
                    <li>1. Complete the welcome orientation</li>
                    <li>2. Start Phase 0: Foundation in Study</li>
                    <li>3. Practice with beginner questions</li>
                    <li>4. Try your first hands-on lab</li>
                  </ol>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setShowWelcome(false);
                    setIsExpanded(true);
                  }}
                  className="w-full px-6 py-3 text-foreground font-semibold rounded-lg transition-colors border"
                  style={{
                    background: getArchonOverlay().background,
                    borderColor: 'rgba(0, 255, 255, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = getHoverGradient();
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = getArchonOverlay().background;
                  }}
                >
                  Let's Get Started! 🚀
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}