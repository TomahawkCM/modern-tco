'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Target,
  CheckCircle,
  BookOpen,
  Play,
  Pause,
  RotateCcw,
  Award
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLearningProgress } from './LearningProgressProvider';

interface StudyModuleWrapperProps {
  children: React.ReactNode;
  moduleId: string;
  domainId: string;
  title: string;
  description?: string;
  estimatedTime?: number;
  objectives?: string[];
  prerequisites?: string[];
  className?: string;
}

export function StudyModuleWrapper({
  children,
  moduleId,
  domainId,
  title,
  description,
  estimatedTime = 15,
  objectives = [],
  prerequisites = [],
  className
}: StudyModuleWrapperProps) {
  const router = useRouter();
  const {
    updateModuleProgress,
    getModuleProgress,
    navigateToPreviousModule,
    navigateToNextModule,
    domains,
    currentDomain,
    currentModule
  } = useLearningProgress();

  const [timeSpent, setTimeSpent] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [moduleStartTime, setModuleStartTime] = useState<Date | null>(null);

  // Get current module and navigation info - with safety checks
  const domain = domains?.find(d => d.id === domainId);
  const currentModuleIndex = domain?.modules?.findIndex(m => m.id === moduleId) ?? -1;
  const previousModule = currentModuleIndex > 0 ? domain?.modules?.[currentModuleIndex - 1] : null;
  const nextModule = currentModuleIndex < (domain?.modules?.length ?? 0) - 1 ? domain?.modules?.[currentModuleIndex + 1] : null;

  const moduleProgress = getModuleProgress(domainId, moduleId);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && moduleStartTime) {
      interval = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - moduleStartTime.getTime()) / 1000 / 60);
        setTimeSpent(elapsed);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, moduleStartTime]);

  // Auto-start timer when component mounts
  useEffect(() => {
    setModuleStartTime(new Date());
    setIsActive(true);

    return () => {
      // Update progress when leaving module
      if (timeSpent > 0) {
        updateModuleProgress(domainId, moduleId, {
          timeSpent: Math.max(timeSpent, moduleProgress.timeSpent ?? 0),
          lastAccessed: new Date().toISOString()
        });
      }
    };
  }, []);

  const handleStartModule = () => {
    setModuleStartTime(new Date());
    setIsActive(true);
    updateModuleProgress(domainId, moduleId, {
      status: 'in_progress',
      startedAt: new Date().toISOString()
    });
  };

  const handleCompleteModule = () => {
    setIsActive(false);
    updateModuleProgress(domainId, moduleId, {
      status: 'completed',
      completedAt: new Date().toISOString(),
      timeSpent,
      score: 100 // Default completion score
    });
  };

  const handleResetProgress = () => {
    setTimeSpent(0);
    setModuleStartTime(new Date());
    setIsActive(true);
    updateModuleProgress(domainId, moduleId, {
      status: 'not_started',
      timeSpent: 0,
      startedAt: undefined,
      completedAt: undefined,
      score: undefined
    });
  };

  const handlePreviousModule = () => {
    if (previousModule) {
      navigateToPreviousModule();
      router.push(`/learning/${domainId}/${previousModule.id}`);
    }
  };

  const handleNextModule = () => {
    if (nextModule) {
      navigateToNextModule();
      router.push(`/learning/${domainId}/${nextModule.id}`);
    } else {
      // Navigate back to domain overview if this is the last module
      router.push(`/learning/${domainId}`);
    }
  };

  const progressPercentage = moduleProgress.status === 'completed' ? 100 :
    moduleProgress.status === 'in_progress' ? Math.min((timeSpent / estimatedTime) * 100, 95) : 0;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Module Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card border-archon-border-bright/30 rounded-xl p-6 cyber-border"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/20 rounded-lg shadow-[0_0_15px_hsl(var(--primary)/0.3)]">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-archon-text-primary archon-text-glow">{title}</h1>
                <div className="text-sm text-archon-text-muted">
                  Module {currentModuleIndex + 1} of {domain?.modules.length}
                </div>
              </div>
            </div>
            {description && (
              <p className="text-archon-text-secondary mb-4">{description}</p>
            )}
          </div>

          {/* Module Status */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-foreground font-medium">
                  {timeSpent}min / {estimatedTime}min
                </span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Status: <span className={cn(
                  moduleProgress.status === 'completed' && 'text-[#22c55e] font-bold',
                  moduleProgress.status === 'in_progress' && 'text-primary font-bold',
                  moduleProgress.status === 'not_started' && 'text-muted-foreground'
                )}>
                  {moduleProgress.status === 'completed' ? 'Completed' :
                   moduleProgress.status === 'in_progress' ? 'In Progress' : 'Not Started'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-primary/20 rounded-full h-2 mb-4 border border-primary/30">
          <motion.div
            className="bg-gradient-to-r from-primary to-accent h-2 rounded-full progress-glow"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Learning Objectives */}
        {objectives.length > 0 && (
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <h3 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                Learning Objectives
              </h3>
              <ul className="space-y-1">
                {objectives.map((objective, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                    <CheckCircle className="h-3 w-3 text-[#22c55e] mt-0.5 flex-shrink-0" />
                    {objective}
                  </li>
                ))}
              </ul>
            </div>

            {/* Prerequisites */}
            {prerequisites.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-foreground mb-2">Prerequisites</h3>
                <ul className="space-y-1">
                  {prerequisites.map((prereq, index) => (
                    <li key={index} className="text-sm text-muted-foreground">
                      • {prereq}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Module Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {moduleProgress.status === 'not_started' && (
              <button
                onClick={handleStartModule}
                className="glass-button inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-primary/80 text-foreground rounded-lg"
              >
                <Play className="h-4 w-4" />
                Start Module
              </button>
            )}

            {moduleProgress.status === 'in_progress' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsActive(!isActive)}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-primary hover:bg-blue-600 text-foreground rounded-lg transition-colors"
                >
                  {isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  {isActive ? 'Pause' : 'Resume'}
                </button>
                <button
                  onClick={handleCompleteModule}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#22c55e] hover:bg-[#22c55e] text-foreground rounded-lg transition-colors"
                >
                  <CheckCircle className="h-4 w-4" />
                  Complete Module
                </button>
              </div>
            )}

            {moduleProgress.status === 'completed' && (
              <div className="flex items-center gap-2">
                <div className="inline-flex items-center gap-2 px-3 py-2 bg-[#22c55e]/20 text-[#22c55e] rounded-lg">
                  <Award className="h-4 w-4" />
                  Completed
                </div>
                <button
                  onClick={handleResetProgress}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-muted hover:bg-gray-700 text-foreground rounded-lg transition-colors"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </button>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePreviousModule}
              disabled={!previousModule}
              className={cn(
                "inline-flex items-center gap-2 px-3 py-2 rounded-lg transition-colors",
                previousModule
                  ? "bg-muted hover:bg-gray-700 text-foreground"
                  : "bg-card text-muted-foreground cursor-not-allowed"
              )}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>

            <button
              onClick={handleNextModule}
              disabled={!nextModule && moduleProgress.status !== 'completed'}
              className={cn(
                "inline-flex items-center gap-2 px-3 py-2 rounded-lg transition-colors",
                (nextModule ?? moduleProgress.status === 'completed')
                  ? "bg-cyan-500 hover:bg-primary text-foreground"
                  : "bg-card text-muted-foreground cursor-not-allowed"
              )}
            >
              {nextModule ? 'Next' : 'Finish'}
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Module Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={moduleId}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="glass-card border-archon-border-bright/30 rounded-xl p-6"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}