"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePathname } from 'next/navigation';

// Types for learning progress management
interface LearningModule {
  id: string;
  title: string;
  domain: string;
  order: number;
  progress: number;
  isCompleted: boolean;
  lastAccessed?: string;
  timeSpent?: number;
}

interface LearningDomain {
  id: string;
  title: string;
  description: string;
  modules: LearningModule[];
  overallProgress: number;
  estimatedTime: string;
  difficulty: 'Foundation' | 'Beginner' | 'Intermediate' | 'Advanced';
}

interface ModuleProgress {
  status: 'not_started' | 'in_progress' | 'completed';
  timeSpent?: number;
  startedAt?: string;
  completedAt?: string;
  lastAccessed?: string;
  score?: number;
}

interface LearningProgressContextType {
  currentDomain: string | null;
  currentModule: string | null;
  domains: LearningDomain[];
  allDomains: LearningDomain[];
  overallProgress: number;
  updateModuleProgress: (domainId: string, moduleId: string, progress: Partial<ModuleProgress>) => void;
  getModuleProgress: (domainId: string, moduleId: string) => ModuleProgress;
  markModuleCompleted: (moduleId: string) => void;
  getNextModule: () => LearningModule | null;
  getPreviousModule: () => LearningModule | null;
  navigateToPreviousModule: () => void;
  navigateToNextModule: () => void;
  getDomainProgress: (domainId: string) => number;
  getProgress: () => { completedModules: number; totalModules: number; percentage: number; estimatedTime: number };
}

const LearningProgressContext = createContext<LearningProgressContextType | null>(null);

// Learning domains configuration - matches your existing study structure
const LEARNING_DOMAINS: LearningDomain[] = [
  {
    id: 'phase-0-foundation',
    title: '🌟 Phase 0: Foundation & Prerequisites',
    description: 'Build your IT foundation with endpoint management basics, terminology, and confidence-building exercises',
    estimatedTime: '2-4 hours',
    difficulty: 'Foundation',
    overallProgress: 0,
    modules: [
      { id: 'intro-to-it-security', title: 'Introduction to IT Security', domain: 'phase-0-foundation', order: 1, progress: 0, isCompleted: false },
      { id: 'endpoint-management-basics', title: 'Endpoint Management Basics', domain: 'phase-0-foundation', order: 2, progress: 0, isCompleted: false },
      { id: 'network-fundamentals', title: 'Network Fundamentals', domain: 'phase-0-foundation', order: 3, progress: 0, isCompleted: false },
      { id: 'security-terminology', title: 'Security Terminology', domain: 'phase-0-foundation', order: 4, progress: 0, isCompleted: false },
      { id: 'confidence-building', title: 'Confidence Building Exercises', domain: 'phase-0-foundation', order: 5, progress: 0, isCompleted: false },
      { id: 'foundation-assessment', title: 'Foundation Assessment', domain: 'phase-0-foundation', order: 6, progress: 0, isCompleted: false },
    ]
  },
  {
    id: 'asking-questions',
    title: 'Asking Questions',
    description: 'Learn how to effectively query the Tanium platform for system information',
    estimatedTime: '45 min',
    difficulty: 'Beginner',
    overallProgress: 0,
    modules: [
      { id: 'natural-language-queries', title: 'Natural Language Query Construction', domain: 'asking-questions', order: 1, progress: 0, isCompleted: false },
      { id: 'sensor-library', title: 'Sensor Library Mastery', domain: 'asking-questions', order: 2, progress: 0, isCompleted: false },
      { id: 'saved-questions', title: 'Saved Question Management', domain: 'asking-questions', order: 3, progress: 0, isCompleted: false },
      { id: 'query-optimization', title: 'Query Optimization', domain: 'asking-questions', order: 4, progress: 0, isCompleted: false },
      { id: 'result-interpretation', title: 'Result Interpretation', domain: 'asking-questions', order: 5, progress: 0, isCompleted: false },
      { id: 'troubleshooting-queries', title: 'Troubleshooting Query Issues', domain: 'asking-questions', order: 6, progress: 0, isCompleted: false },
      { id: 'asking-questions-lab', title: 'Hands-On Lab: Query Construction', domain: 'asking-questions', order: 7, progress: 0, isCompleted: false },
    ]
  },
  {
    id: 'refining-questions',
    title: 'Refining Questions and Targeting',
    description: 'Master advanced filtering and targeting techniques for precise queries',
    estimatedTime: '50 min',
    difficulty: 'Intermediate',
    overallProgress: 0,
    modules: [
      { id: 'computer-groups', title: 'Dynamic Computer Groups', domain: 'refining-questions', order: 1, progress: 0, isCompleted: false },
      { id: 'static-groups', title: 'Static Computer Groups', domain: 'refining-questions', order: 2, progress: 0, isCompleted: false },
      { id: 'complex-filters', title: 'Complex Filter Creation', domain: 'refining-questions', order: 3, progress: 0, isCompleted: false },
      { id: 'targeting-optimization', title: 'Targeting Optimization', domain: 'refining-questions', order: 4, progress: 0, isCompleted: false },
      { id: 'rbac-integration', title: 'RBAC Integration', domain: 'refining-questions', order: 5, progress: 0, isCompleted: false },
      { id: 'enterprise-targeting', title: 'Enterprise-Scale Targeting', domain: 'refining-questions', order: 6, progress: 0, isCompleted: false },
      { id: 'logical-operators', title: 'Logical Operators & Boolean Logic', domain: 'refining-questions', order: 7, progress: 0, isCompleted: false },
      { id: 'refining-questions-lab', title: 'Hands-On Lab: Advanced Targeting', domain: 'refining-questions', order: 8, progress: 0, isCompleted: false },
    ]
  },
  {
    id: 'taking-action',
    title: 'Taking Action',
    description: 'Learn how to execute actions and deploy solutions using Tanium',
    estimatedTime: '55 min',
    difficulty: 'Intermediate',
    overallProgress: 0,
    modules: [
      { id: 'package-selection', title: 'Package Selection & Validation', domain: 'taking-action', order: 1, progress: 0, isCompleted: false },
      { id: 'deployment-procedures', title: 'Deployment Procedures', domain: 'taking-action', order: 2, progress: 0, isCompleted: false },
      { id: 'action-execution', title: 'Action Execution & Monitoring', domain: 'taking-action', order: 3, progress: 0, isCompleted: false },
      { id: 'approval-workflows', title: 'Approval Workflows', domain: 'taking-action', order: 4, progress: 0, isCompleted: false },
      { id: 'rollback-procedures', title: 'Rollback Procedures', domain: 'taking-action', order: 5, progress: 0, isCompleted: false },
      { id: 'safety-protocols', title: 'Safety Protocols', domain: 'taking-action', order: 6, progress: 0, isCompleted: false },
      { id: 'taking-action-lab', title: 'Hands-On Lab: Safe Action Deployment', domain: 'taking-action', order: 7, progress: 0, isCompleted: false },
    ]
  },
  {
    id: 'navigation-modules',
    title: 'Navigation and Basic Module Functions',
    description: 'Master the Tanium interface navigation and core module functionality',
    estimatedTime: '40 min',
    difficulty: 'Beginner',
    overallProgress: 0,
    modules: [
      { id: 'console-navigation', title: 'Console Navigation Mastery', domain: 'navigation-modules', order: 1, progress: 0, isCompleted: false },
      { id: 'interact-module', title: 'Interact Module Operations', domain: 'navigation-modules', order: 2, progress: 0, isCompleted: false },
      { id: 'deploy-module', title: 'Deploy Module Functions', domain: 'navigation-modules', order: 3, progress: 0, isCompleted: false },
      { id: 'asset-module', title: 'Asset Module Management', domain: 'navigation-modules', order: 4, progress: 0, isCompleted: false },
      { id: 'patch-module', title: 'Patch Module Operations', domain: 'navigation-modules', order: 5, progress: 0, isCompleted: false },
      { id: 'threat-response', title: 'Threat Response Module', domain: 'navigation-modules', order: 6, progress: 0, isCompleted: false },
      { id: 'workflow-management', title: 'Workflow Management', domain: 'navigation-modules', order: 7, progress: 0, isCompleted: false },
      { id: 'navigation-lab', title: 'Hands-On Lab: Platform Navigation', domain: 'navigation-modules', order: 8, progress: 0, isCompleted: false },
    ]
  },
  {
    id: 'reporting-export',
    title: 'Report Generation and Data Export',
    description: 'Learn to create reports and export data for analysis and compliance',
    estimatedTime: '50 min',
    difficulty: 'Intermediate',
    overallProgress: 0,
    modules: [
      { id: 'report-creation', title: 'Report Creation & Templates', domain: 'reporting-export', order: 1, progress: 0, isCompleted: false },
      { id: 'data-export-formats', title: 'Data Export Formats', domain: 'reporting-export', order: 2, progress: 0, isCompleted: false },
      { id: 'automated-reporting', title: 'Automated Reporting Systems', domain: 'reporting-export', order: 3, progress: 0, isCompleted: false },
      { id: 'custom-reports', title: 'Custom Report Development', domain: 'reporting-export', order: 4, progress: 0, isCompleted: false },
      { id: 'data-integrity', title: 'Data Integrity & Quality Assurance', domain: 'reporting-export', order: 5, progress: 0, isCompleted: false },
      { id: 'compliance-reporting', title: 'Compliance Reporting', domain: 'reporting-export', order: 6, progress: 0, isCompleted: false },
      { id: 'reporting-lab', title: 'Hands-On Lab: Report Creation & Export', domain: 'reporting-export', order: 7, progress: 0, isCompleted: false },
    ]
  },
];

interface LearningProgressProviderProps {
  children: ReactNode;
}

export function LearningProgressProvider({ children }: LearningProgressProviderProps) {
  const pathname = usePathname();
  const [domains, setDomains] = useState<LearningDomain[]>(LEARNING_DOMAINS);
  const [currentDomain, setCurrentDomain] = useState<LearningDomain | null>(null);
  const [currentModule, setCurrentModule] = useState<LearningModule | null>(null);
  const [moduleProgress, setModuleProgress] = useState<Record<string, ModuleProgress>>({});

  // Calculate overall progress across all domains
  const overallProgress = Math.round(
    domains.reduce((acc, domain) => {
      const domainProgress = domain.modules.reduce((modAcc, module) => modAcc + module.progress, 0) / domain.modules.length;
      return acc + domainProgress;
    }, 0) / domains.length
  );

  // Update module progress - new signature to match StudyModuleWrapper
  const updateModuleProgress = (domainId: string, moduleId: string, progress: Partial<ModuleProgress>) => {
    const key = `${domainId}:${moduleId}`;
    setModuleProgress(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        ...progress,
        lastAccessed: new Date().toISOString()
      }
    }));
    
    // Also update the domains state for compatibility
    const progressPercent = progress.status === 'completed' ? 100 : 
                           progress.status === 'in_progress' ? 50 : 0;
    setDomains(prevDomains =>
      prevDomains.map(domain => ({
        ...domain,
        modules: domain.modules.map(module =>
          module.id === moduleId
            ? { ...module, progress: progressPercent, lastAccessed: new Date().toISOString() }
            : module
        ),
        overallProgress: Math.round(
          domain.modules.reduce((acc, mod) => acc + (mod.id === moduleId ? progressPercent : mod.progress), 0) / domain.modules.length
        )
      }))
    );
  };
  
  // Get module progress - new function to match StudyModuleWrapper
  const getModuleProgress = (domainId: string, moduleId: string): ModuleProgress => {
    const key = `${domainId}:${moduleId}`;
    return moduleProgress[key] || {
      status: 'not_started',
      timeSpent: 0
    };
  };

  // Mark module as completed
  const markModuleCompleted = (moduleId: string) => {
    // Find domain that contains this module
    const containingDomain = domains.find(domain => 
      domain.modules.some(module => module.id === moduleId)
    );
    
    if (containingDomain) {
      updateModuleProgress(containingDomain.id, moduleId, { 
        status: 'completed',
        completedAt: new Date().toISOString(),
        score: 100 
      });
    }
    
    setDomains(prevDomains =>
      prevDomains.map(domain => ({
        ...domain,
        modules: domain.modules.map(module =>
          module.id === moduleId ? { ...module, isCompleted: true } : module
        )
      }))
    );
  };

  // Get domain progress
  const getDomainProgress = (domainId: string): number => {
    const domain = domains.find(d => d.id === domainId);
    if (!domain) return 0;
    
    return Math.round(
      domain.modules.reduce((acc, module) => acc + module.progress, 0) / domain.modules.length
    );
  };

  // Get next module in learning sequence
  const getNextModule = (): LearningModule | null => {
    if (!currentModule || !currentDomain) return null;
    
    const currentModuleIndex = currentDomain.modules.findIndex(m => m.id === currentModule.id);
    
    // Next module in same domain
    if (currentModuleIndex < currentDomain.modules.length - 1) {
      return currentDomain.modules[currentModuleIndex + 1];
    }
    
    // First module of next domain
    const currentDomainIndex = domains.findIndex(d => d.id === currentDomain.id);
    if (currentDomainIndex < domains.length - 1) {
      const nextDomain = domains[currentDomainIndex + 1];
      return nextDomain.modules[0] || null;
    }
    
    return null;
  };

  // Get previous module in learning sequence
  const getPreviousModule = (): LearningModule | null => {
    if (!currentModule || !currentDomain) return null;
    
    const currentModuleIndex = currentDomain.modules.findIndex(m => m.id === currentModule.id);
    
    // Previous module in same domain
    if (currentModuleIndex > 0) {
      return currentDomain.modules[currentModuleIndex - 1];
    }
    
    // Last module of previous domain
    const currentDomainIndex = domains.findIndex(d => d.id === currentDomain.id);
    if (currentDomainIndex > 0) {
      const prevDomain = domains[currentDomainIndex - 1];
      return prevDomain.modules[prevDomain.modules.length - 1] || null;
    }
    
    return null;
  };
  
  // Navigation functions for StudyModuleWrapper compatibility
  const navigateToPreviousModule = () => {
    // This will be handled by the router in StudyModuleWrapper
    // Just a placeholder for the interface
  };
  
  const navigateToNextModule = () => {
    // This will be handled by the router in StudyModuleWrapper
    // Just a placeholder for the interface
  };
  
  // Get progress summary
  const getProgress = () => {
    const totalModules = domains.reduce((acc, domain) => acc + domain.modules.length, 0);
    const completedModules = domains.reduce((acc, domain) => 
      acc + domain.modules.filter(module => module.isCompleted).length, 0
    );
    const percentage = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;
    const estimatedTime = domains.reduce((acc, domain) => 
      acc + (domain.estimatedTime ? parseInt(domain.estimatedTime.split(' ')[0]) || 0 : 0), 0
    );
    
    return {
      completedModules,
      totalModules,
      percentage,
      estimatedTime
    };
  };

  // Update current context based on pathname
  useEffect(() => {
    // Parse pathname to determine current domain and module
    // Patterns: /study/domain-id or /learning/domain-id or /learning/domain-id/module-id
    const currentPath = pathname || '';
    const pathParts = currentPath.split('/').filter(Boolean);
    
    if (pathParts.length >= 2 && (pathParts[0] === 'learning' || pathParts[0] === 'study')) {
      const domainId = pathParts[1];
      const moduleId = pathParts[2];
      
      const domain = domains.find(d => d.id === domainId);
      if (domain) {
        setCurrentDomain(domain);
        
        if (moduleId) {
          const module = domain.modules.find(m => m.id === moduleId);
          setCurrentModule(module || null);
        } else {
          setCurrentModule(null);
        }
      }
    } else {
      setCurrentDomain(null);
      setCurrentModule(null);
    }
  }, [pathname, domains]);

  const contextValue: LearningProgressContextType = {
    currentDomain: currentDomain?.id || null,
    currentModule: currentModule?.id || null,
    domains,
    allDomains: domains,
    overallProgress,
    updateModuleProgress,
    getModuleProgress,
    markModuleCompleted,
    getNextModule,
    getPreviousModule,
    navigateToPreviousModule,
    navigateToNextModule,
    getDomainProgress,
    getProgress,
  };

  return (
    <LearningProgressContext.Provider value={contextValue}>
      {children}
    </LearningProgressContext.Provider>
  );
}

export function useLearningProgress() {
  const context = useContext(LearningProgressContext);
  if (!context) {
    throw new Error('useLearningProgress must be used within a LearningProgressProvider');
  }
  return context;
}
