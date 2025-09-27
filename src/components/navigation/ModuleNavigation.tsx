"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  BookOpen, 
  Target, 
  Package, 
  Navigation, 
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  Home,
  Brain,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModuleInfo {
  slug: string;
  title: string;
  icon: React.ElementType;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  weight: number;
  description: string;
}

const modules: ModuleInfo[] = [
  {
    slug: 'asking-questions',
    title: 'Asking Questions',
    icon: BookOpen,
    difficulty: 'Beginner',
    estimatedTime: '45 min',
    weight: 22,
    description: 'Master natural language queries and sensor management'
  },
  {
    slug: 'refining-questions',
    title: 'Refining Questions & Targeting',
    icon: Target,
    difficulty: 'Intermediate',
    estimatedTime: '50 min',
    weight: 23,
    description: 'Advanced targeting with computer groups and filters'
  },
  {
    slug: 'taking-action',
    title: 'Taking Action',
    icon: Package,
    difficulty: 'Intermediate',
    estimatedTime: '55 min',
    weight: 15,
    description: 'Safe package deployment and action execution'
  },
  {
    slug: 'navigation-modules',
    title: 'Navigation & Modules',
    icon: Navigation,
    difficulty: 'Beginner',
    estimatedTime: '40 min',
    weight: 23,
    description: 'Platform navigation and core module operations'
  },
  {
    slug: 'reporting-export',
    title: 'Reporting & Data Export',
    icon: FileSpreadsheet,
    difficulty: 'Intermediate',
    estimatedTime: '35 min',
    weight: 17,
    description: 'Report creation and data export systems'
  }
];

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'Beginner':
      return 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/50 dark:text-green-200 dark:border-green-500/50';
    case 'Intermediate':
      return 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/50 dark:text-orange-200 dark:border-orange-500/50';
    case 'Advanced':
      return 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/50 dark:text-red-200 dark:border-red-500/50';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-900/50 dark:text-slate-200 dark:border-slate-500/50';
  }
};

interface ModuleNavigationProps {
  currentSlug?: string;
  showAllModules?: boolean;
}

export default function ModuleNavigation({ currentSlug, showAllModules = false }: ModuleNavigationProps) {
  const pathname = usePathname() || '';
  const currentModuleIndex = modules.findIndex(m => m.slug === currentSlug);
  const previousModule = currentModuleIndex > 0 ? modules[currentModuleIndex - 1] : null;
  const nextModule = currentModuleIndex < modules.length - 1 ? modules[currentModuleIndex + 1] : null;

  if (showAllModules) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="mb-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
            TCO Study Modules
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Complete certification preparation across all 5 domains
          </p>
        </div>

        {/* Module Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => {
            const Icon = module.icon;
            const isActive = pathname.includes(module.slug);
            
            // Determine card color based on difficulty
            const getCardColor = (difficulty: string) => {
              switch (difficulty) {
                case 'Beginner':
                  return 'border-green-200 bg-gradient-to-br from-green-50 to-green-100 dark:border-green-800 dark:from-green-900/20 dark:to-green-800/20';
                case 'Intermediate':
                  return 'border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100 dark:border-orange-800 dark:from-orange-900/20 dark:to-orange-800/20';
                case 'Advanced':
                  return 'border-red-200 bg-gradient-to-br from-red-50 to-red-100 dark:border-red-800 dark:from-red-900/20 dark:to-red-800/20';
                default:
                  return 'border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 dark:border-blue-800 dark:from-blue-900/20 dark:to-blue-800/20';
              }
            };

            const getIconColor = (difficulty: string) => {
              switch (difficulty) {
                case 'Beginner':
                  return 'text-green-600 dark:text-green-400';
                case 'Intermediate':
                  return 'text-orange-600 dark:text-orange-400';
                case 'Advanced':
                  return 'text-red-600 dark:text-red-400';
                default:
                  return 'text-blue-600 dark:text-blue-400';
              }
            };

            return (
              <Link key={module.slug} href={`/modules/${module.slug}`}>
                <Card className={cn(
                  "group transition-all duration-200 hover:scale-105 cursor-pointer hover:shadow-md",
                  getCardColor(module.difficulty),
                  isActive && "ring-2 ring-blue-500"
                )}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={cn("p-2 rounded-lg", 
                        module.difficulty === 'Beginner' ? 'bg-green-500/20' :
                        module.difficulty === 'Intermediate' ? 'bg-orange-500/20' :
                        module.difficulty === 'Advanced' ? 'bg-red-500/20' : 'bg-blue-500/20'
                      )}>
                        <Icon className={cn("h-6 w-6", getIconColor(module.difficulty))} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {module.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className={getDifficultyColor(module.difficulty)}>
                            {module.difficulty}
                          </Badge>
                          <span className="text-sm text-slate-600 dark:text-slate-400">{module.estimatedTime}</span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
                      {module.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-600 dark:text-slate-400">
                        Exam Weight: {module.weight}%
                      </span>
                      <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* AI Assistant Card */}
        <Card className="border-cyan-200 bg-gradient-to-br from-cyan-50 to-cyan-100 dark:border-cyan-800 dark:from-cyan-900/20 dark:to-cyan-800/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-cyan-500/20">
                <Brain className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <h3 className="font-semibold text-cyan-700 dark:text-cyan-300 flex items-center gap-2">
                  AI Study Assistant
                  <Sparkles className="h-4 w-4 text-yellow-500" />
                </h3>
                <p className="text-sm text-cyan-600 dark:text-cyan-400">
                  Get personalized help, explanations, and practice questions
                </p>
              </div>
            </div>
            <Button className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white">
              Launch AI Assistant
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Navigation for individual module pages
  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-400">
        <Link href="/" className="hover:text-blue-400 transition-colors">
          <Home className="h-4 w-4" />
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/modules" className="hover:text-blue-400 transition-colors">
          Study Modules
        </Link>
        {currentSlug && (
          <>
            <ChevronRight className="h-4 w-4" />
            <span className="text-blue-400 font-medium">
              {modules.find(m => m.slug === currentSlug)?.title}
            </span>
          </>
        )}
      </nav>

      {/* Previous/Next Navigation */}
      {currentSlug && (
        <div className="flex justify-between items-center">
          {previousModule ? (
            <Link href={`/modules/${previousModule.slug}`}>
              <Button variant="outline" className="flex items-center gap-2">
                <ChevronLeft className="h-4 w-4" />
                <div className="text-left">
                  <div className="text-xs text-gray-400">Previous</div>
                  <div className="text-sm">{previousModule.title}</div>
                </div>
              </Button>
            </Link>
          ) : (
            <div />
          )}

          <Link href="/modules">
            <Button variant="ghost" className="text-blue-400 hover:text-blue-300">
              All Modules
            </Button>
          </Link>

          {nextModule ? (
            <Link href={`/modules/${nextModule.slug}`}>
              <Button variant="outline" className="flex items-center gap-2">
                <div className="text-right">
                  <div className="text-xs text-gray-400">Next</div>
                  <div className="text-sm">{nextModule.title}</div>
                </div>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <div />
          )}
        </div>
      )}
    </div>
  );
}
