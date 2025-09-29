'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Trophy,
  Target,
  Clock,
  TrendingUp,
  Award,
  BookOpen,
  CheckCircle2,
  Circle,
  Lock,
  Unlock,
  Star,
  Zap,
  Brain,
  Rocket,
  Flag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ModuleProgress {
  moduleId: string;
  title: string;
  totalSections: number;
  completedSections: number;
  totalExercises: number;
  completedExercises: number;
  checkpointPassed: boolean;
  miniProjectComplete: boolean;
  timeSpent: number; // in minutes
  lastAccessed?: string;
}

interface LearningStats {
  totalModules: number;
  completedModules: number;
  totalExercises: number;
  completedExercises: number;
  totalTimeSpent: number; // in minutes
  currentStreak: number; // days
  longestStreak: number;
  averageAccuracy: number;
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  unlocked: boolean;
  unlockedDate?: string;
  category: 'progress' | 'mastery' | 'speed' | 'consistency';
}

const SKILL_LEVELS = [
  { level: 'beginner', minProgress: 0, color: 'bg-green-500', icon: BookOpen },
  { level: 'intermediate', minProgress: 30, color: 'bg-blue-500', icon: Target },
  { level: 'advanced', minProgress: 60, color: 'bg-purple-500', icon: Brain },
  { level: 'expert', minProgress: 90, color: 'bg-orange-500', icon: Rocket }
];

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-query',
    title: 'First Query',
    description: 'Complete your first QueryPlayground exercise',
    icon: Star,
    unlocked: false,
    category: 'progress'
  },
  {
    id: 'module-master',
    title: 'Module Master',
    description: 'Complete all exercises in a module',
    icon: Trophy,
    unlocked: false,
    category: 'mastery'
  },
  {
    id: 'speed-learner',
    title: 'Speed Learner',
    description: 'Complete a module in under 2 hours',
    icon: Zap,
    unlocked: false,
    category: 'speed'
  },
  {
    id: 'consistent-student',
    title: 'Consistent Student',
    description: 'Study for 7 days in a row',
    icon: Award,
    unlocked: false,
    category: 'consistency'
  },
  {
    id: 'zero-to-hero',
    title: 'Zero to Hero',
    description: 'Complete all modules and projects',
    icon: Rocket,
    unlocked: false,
    category: 'mastery'
  }
];

export default function LearningProgressTracker() {
  const [moduleProgress, setModuleProgress] = useState<ModuleProgress[]>([]);
  const [learningStats, setLearningStats] = useState<LearningStats>({
    totalModules: 6,
    completedModules: 0,
    totalExercises: 50,
    completedExercises: 0,
    totalTimeSpent: 0,
    currentStreak: 0,
    longestStreak: 0,
    averageAccuracy: 0,
    skillLevel: 'beginner'
  });
  const [achievements, setAchievements] = useState<Achievement[]>(ACHIEVEMENTS);
  const [selectedView, setSelectedView] = useState<'overview' | 'modules' | 'achievements'>('overview');

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = () => {
    // Load from localStorage
    const queryProgress = JSON.parse(localStorage.getItem('queryPlaygroundProgress') || '{}');
    const gateProgress = JSON.parse(localStorage.getItem('skillGateProgress') || '{}');
    const projectProgress = JSON.parse(localStorage.getItem('miniProjectProgress') || '{}');

    // Calculate module progress
    const modules: ModuleProgress[] = [
      {
        moduleId: 'foundation',
        title: 'Platform Foundation',
        totalSections: 5,
        completedSections: 0,
        totalExercises: 0,
        completedExercises: 0,
        checkpointPassed: gateProgress['Foundation Module Checkpoint']?.completed || false,
        miniProjectComplete: projectProgress['Network Discovery & Architecture Mapping']?.completed || false,
        timeSpent: 180,
        lastAccessed: new Date().toISOString()
      },
      {
        moduleId: 'asking-questions',
        title: 'Asking Questions',
        totalSections: 8,
        completedSections: 0,
        totalExercises: 10,
        completedExercises: Object.keys(queryProgress).filter(k => k.startsWith('Practice:')).length,
        checkpointPassed: false,
        miniProjectComplete: false,
        timeSpent: 45,
        lastAccessed: new Date().toISOString()
      },
      {
        moduleId: 'refining-questions',
        title: 'Refining Questions',
        totalSections: 6,
        completedSections: 0,
        totalExercises: 8,
        completedExercises: 0,
        checkpointPassed: false,
        miniProjectComplete: false,
        timeSpent: 0
      },
      {
        moduleId: 'taking-action',
        title: 'Taking Action',
        totalSections: 7,
        completedSections: 0,
        totalExercises: 8,
        completedExercises: 0,
        checkpointPassed: false,
        miniProjectComplete: false,
        timeSpent: 0
      },
      {
        moduleId: 'navigation',
        title: 'Navigation & Modules',
        totalSections: 9,
        completedSections: 0,
        totalExercises: 10,
        completedExercises: 0,
        checkpointPassed: false,
        miniProjectComplete: false,
        timeSpent: 0
      },
      {
        moduleId: 'reporting',
        title: 'Reporting & Export',
        totalSections: 5,
        completedSections: 0,
        totalExercises: 7,
        completedExercises: 0,
        checkpointPassed: false,
        miniProjectComplete: false,
        timeSpent: 0
      }
    ];

    // Update stats
    const completedModules = modules.filter(m => m.checkpointPassed && m.miniProjectComplete).length;
    const totalExercisesCompleted = modules.reduce((sum, m) => sum + m.completedExercises, 0);
    const totalTime = modules.reduce((sum, m) => sum + m.timeSpent, 0);

    setModuleProgress(modules);
    setLearningStats(prev => ({
      ...prev,
      completedModules,
      completedExercises: totalExercisesCompleted,
      totalTimeSpent: totalTime,
      skillLevel: getSkillLevel(completedModules, modules.length)
    }));

    // Check achievements
    updateAchievements(queryProgress, gateProgress, projectProgress);
  };

  const getSkillLevel = (completed: number, total: number): 'beginner' | 'intermediate' | 'advanced' | 'expert' => {
    const percentage = (completed / total) * 100;
    if (percentage >= 90) return 'expert';
    if (percentage >= 60) return 'advanced';
    if (percentage >= 30) return 'intermediate';
    return 'beginner';
  };

  const updateAchievements = (queries: any, gates: any, projects: any) => {
    const newAchievements = [...ACHIEVEMENTS];

    // Check first query
    if (Object.keys(queries).length > 0) {
      const firstQuery = newAchievements.find(a => a.id === 'first-query');
      if (firstQuery) {
        firstQuery.unlocked = true;
        const queryValues = Object.values(queries);
        if (queryValues.length > 0 && queryValues[0] && typeof queryValues[0] === 'object' && 'timestamp' in queryValues[0]) {
          firstQuery.unlockedDate = (queryValues[0] as { timestamp: string }).timestamp;
        }
      }
    }

    // Check module completion
    if (Object.keys(queries).filter(k => k.startsWith('Practice:')).length >= 10) {
      const moduleMaster = newAchievements.find(a => a.id === 'module-master');
      if (moduleMaster) {
        moduleMaster.unlocked = true;
        moduleMaster.unlockedDate = new Date().toISOString();
      }
    }

    setAchievements(newAchievements);
  };

  const getModuleStatus = (module: ModuleProgress) => {
    if (module.checkpointPassed && module.miniProjectComplete) {
      return { icon: CheckCircle2, color: 'text-green-600', label: 'Complete' };
    }
    if (module.completedExercises > 0 || module.timeSpent > 0) {
      return { icon: Circle, color: 'text-blue-600', label: 'In Progress' };
    }
    return { icon: Lock, color: 'text-gray-400', label: 'Not Started' };
  };

  const getCurrentLevel = () => {
    const progress = (learningStats.completedModules / learningStats.totalModules) * 100;
    return SKILL_LEVELS.find(level => progress >= level.minProgress) || SKILL_LEVELS[0];
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold">Your Learning Journey</CardTitle>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="px-3 py-1">
              <Clock className="w-4 h-4 mr-1" />
              {formatTime(learningStats.totalTimeSpent)} studied
            </Badge>
            <Badge className={cn('px-3 py-1', getCurrentLevel().color)}>
              {(() => {
                const IconComponent = getCurrentLevel().icon;
                return IconComponent ? <IconComponent className="w-4 h-4 mr-1" /> : null;
              })()}
              {learningStats.skillLevel.charAt(0).toUpperCase() + learningStats.skillLevel.slice(1)}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={selectedView} onValueChange={(v) => setSelectedView(v as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="modules">Modules</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Overall Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Overall Progress</span>
                <span className="text-gray-600">
                  {learningStats.completedModules} of {learningStats.totalModules} modules
                </span>
              </div>
              <Progress
                value={(learningStats.completedModules / learningStats.totalModules) * 100}
                className="h-3"
              />
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Exercises</p>
                      <p className="text-2xl font-bold">
                        {learningStats.completedExercises}/{learningStats.totalExercises}
                      </p>
                    </div>
                    <Target className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Accuracy</p>
                      <p className="text-2xl font-bold">
                        {learningStats.averageAccuracy || 85}%
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Streak</p>
                      <p className="text-2xl font-bold">
                        {learningStats.currentStreak} days
                      </p>
                    </div>
                    <Zap className="w-8 h-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Achievements</p>
                      <p className="text-2xl font-bold">
                        {achievements.filter(a => a.unlocked).length}/{achievements.length}
                      </p>
                    </div>
                    <Trophy className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Next Steps */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader className="pb-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Flag className="w-5 h-5 text-blue-600" />
                  Recommended Next Steps
                </h3>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-2">
                  {moduleProgress.filter(m => !m.checkpointPassed).slice(0, 3).map(module => (
                    <li key={module.moduleId} className="flex items-center gap-2 text-sm">
                      <Circle className="w-3 h-3 text-blue-600" />
                      <span>Continue {module.title} - {module.completedExercises}/{module.totalExercises} exercises done</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="modules" className="space-y-4 mt-6">
            {moduleProgress.map((module, index) => {
              const status = getModuleStatus(module);
              const progress = module.totalExercises > 0
                ? (module.completedExercises / module.totalExercises) * 100
                : 0;

              return (
                <Card key={module.moduleId} className={cn(
                  'transition-all hover:shadow-md',
                  status.label === 'Complete' && 'bg-green-50 border-green-200'
                )}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <status.icon className={cn('w-6 h-6', status.color)} />
                        <div>
                          <h3 className="font-semibold">
                            Module {index + 1}: {module.title}
                          </h3>
                          <p className="text-sm text-gray-600">{status.label}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {module.checkpointPassed && (
                          <Badge variant="outline" className="bg-green-50">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Checkpoint
                          </Badge>
                        )}
                        {module.miniProjectComplete && (
                          <Badge variant="outline" className="bg-purple-50">
                            <Trophy className="w-3 h-3 mr-1" />
                            Project
                          </Badge>
                        )}
                        {module.timeSpent > 0 && (
                          <span className="text-sm text-gray-500">
                            {formatTime(module.timeSpent)}
                          </span>
                        )}
                      </div>
                    </div>

                    {module.totalExercises > 0 && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Exercises</span>
                          <span>{module.completedExercises}/{module.totalExercises}</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="achievements" className="mt-6">
            <div className="grid grid-cols-2 gap-4">
              {achievements.map(achievement => (
                <Card
                  key={achievement.id}
                  className={cn(
                    'transition-all',
                    achievement.unlocked
                      ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-orange-200'
                      : 'opacity-50 grayscale'
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <achievement.icon className={cn(
                        'w-8 h-8',
                        achievement.unlocked ? 'text-orange-500' : 'text-gray-400'
                      )} />
                      <div className="flex-1">
                        <h4 className="font-semibold">{achievement.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{achievement.description}</p>
                        {achievement.unlocked && achievement.unlockedDate && (
                          <p className="text-xs text-gray-500 mt-2">
                            Unlocked {new Date(achievement.unlockedDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      {achievement.unlocked && (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}