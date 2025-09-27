'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../../styles/assessment.css';
import { 
  BookOpen,
  Clock,
  Target,
  CheckCircle,
  Monitor,
  Server,
  Globe,
  Star,
  Award,
  Heart,
  PlayCircle
} from 'lucide-react';

// TypeScript interfaces for Phase 0 Foundation
interface FoundationModule {
  id: string;
  title: string;
  duration: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  difficulty: 'Easy' | 'Beginner';
  sections: FoundationSection[];
  milestone: string;
  confidenceBoost: string;
  isCompleted: boolean;
  progress: number;
}

interface FoundationSection {
  id: string;
  title: string;
  content: string;
  keyPoints: string[];
  examples?: string[];
  checklistItems?: string[];
  isCompleted: boolean;
}

interface FoundationMilestone {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  isUnlocked: boolean;
  isCompleted: boolean;
  reward: string;
}

interface Phase0FoundationProps {
  onModuleComplete?: (moduleId: string) => void;
  onMilestoneAchieved?: (milestoneId: string) => void;
  userProgress?: {
    completedModules: string[];
    unlockedMilestones: string[];
    confidenceLevel: 'building' | 'growing' | 'strong' | 'expert';
  };
}

export default function Phase0Foundation({
  onModuleComplete,
  onMilestoneAchieved,
  userProgress = {
    completedModules: [],
    unlockedMilestones: [],
    confidenceLevel: 'building'
  }
}: Phase0FoundationProps) {
  const [activeModule, setActiveModule] = useState<string | null>(null);

  const [completedSections, setCompletedSections] = useState<string[]>([]);
  const [showMilestone, setShowMilestone] = useState<FoundationMilestone | null>(null);
  const [overallProgress, setOverallProgress] = useState(0);

  // Foundation learning modules
  const foundationModules: FoundationModule[] = [
    {
      id: 'endpoint-management',
      title: 'Understanding Endpoint Management',
      duration: '15 minutes',
      description: 'Learn what endpoints are and why managing them is crucial for IT teams',
      icon: Monitor,
      difficulty: 'Easy',
      milestone: 'Explain endpoint management concepts confidently',
      confidenceBoost: 'You now understand the core problem Tanium solves!',
      isCompleted: userProgress.completedModules.includes('endpoint-management'),
      progress: 0,
      sections: [
        {
          id: 'what-are-endpoints',
          title: 'What Are Endpoints?',
          content: 'Endpoints are every device in your organization that connects to the network',
          keyPoints: [
            'Laptops and desktop computers used by employees',
            'Servers running critical business applications', 
            'Mobile devices accessing company resources',
            'IoT devices like printers, cameras, and sensors'
          ],
          examples: [
            'A sales rep\'s laptop connecting from a coffee shop',
            'The email server in your data center',
            'Conference room smart TVs and projectors'
          ],
          isCompleted: false
        },
        {
          id: 'endpoint-challenges',
          title: 'The Endpoint Challenge',
          content: 'Without proper management, IT teams struggle with visibility and control',
          keyPoints: [
            '"Where is that device?" - No visibility into connected devices',
            '"Is it secure?" - Unknown vulnerabilities and threats',
            '"What\'s installed?" - No software inventory or patch status',
            '"How do we fix issues?" - Manual, time-consuming processes'
          ],
          isCompleted: false
        },
        {
          id: 'tanium-solution',
          title: 'How Tanium Solves This',
          content: 'Tanium provides real-time visibility and control over all endpoints',
          keyPoints: [
            'See everything connected to your network instantly',
            'Ask questions about any endpoint in natural language', 
            'Take actions across thousands of devices simultaneously',
            'Maintain continuous security monitoring and threat detection'
          ],
          examples: [
            'Ask: "Which computers have Chrome version 90 or older?"',
            'Deploy security patches to 10,000 endpoints in minutes',
            'Automatically detect and respond to malware infections'
          ],
          isCompleted: false
        }
      ]
    },
    {
      id: 'core-concepts',
      title: 'Core Tanium Concepts',
      duration: '20 minutes',
      description: 'Master the essential building blocks of the Tanium platform',
      icon: Server,
      difficulty: 'Beginner',
      milestone: 'Navigate Tanium architecture with confidence',
      confidenceBoost: 'You\'re speaking Tanium like a pro!',
      isCompleted: userProgress.completedModules.includes('core-concepts'),
      progress: 0,
      sections: [
        {
          id: 'platform-architecture',
          title: 'Tanium Platform Architecture',
          content: 'Understanding the three core components that make Tanium work',
          keyPoints: [
            'Tanium Console: Your command center for all operations',
            'Tanium Client: Lightweight agent on every endpoint',
            'Tanium Server: Central intelligence processing everything'
          ],
          isCompleted: false
        },
        {
          id: 'key-capabilities',
          title: 'Key Tanium Capabilities',
          content: 'The three superpowers that make Tanium unique',
          keyPoints: [
            'Real-Time Questions: Ask anything about your endpoints',
            'Instant Actions: Deploy changes across your entire environment',
            'Continuous Monitoring: Always-on visibility and alerting'
          ],
          examples: [
            'Question: "Show me machines with high CPU usage"',
            'Action: "Install Windows updates on all domain controllers"',
            'Monitor: "Alert me when disk space drops below 10%"'
          ],
          isCompleted: false
        }
      ]
    },
    {
      id: 'terminology',
      title: 'Essential TCO Terminology',
      duration: '25 minutes',
      description: 'Build your Tanium vocabulary with 50+ key terms',
      icon: BookOpen,
      difficulty: 'Beginner',
      milestone: 'Define 25+ TCO terminology terms fluently',
      confidenceBoost: 'Your Tanium vocabulary is growing strong!',
      isCompleted: userProgress.completedModules.includes('terminology'),
      progress: 0,
      sections: [
        {
          id: 'must-know-terms',
          title: 'Must-Know Terms (Master These First!)',
          content: 'The fundamental terms every TCO must know by heart',
          keyPoints: [
            'Question: A query you ask about your endpoints',
            'Sensor: Pre-built data collectors (500+ available)',
            'Computer Group: Collections of endpoints grouped by criteria',
            'Action: Tasks deployed to endpoints to make changes',
            'Targeting: Selecting which endpoints receive questions/actions'
          ],
          checklistItems: [
            'I can explain what a Tanium question is',
            'I understand the difference between sensors and questions',
            'I know how computer groups organize endpoints',
            'I can describe what actions do',
            'I understand targeting concepts'
          ],
          isCompleted: false
        },
        {
          id: 'intermediate-terms',
          title: 'Intermediate Terms (Build Your Vocabulary)',
          content: 'Expand your knowledge with more advanced concepts',
          keyPoints: [
            'Package: Bundle of files, commands, and parameters',
            'Saved Question: Reusable questions for repeated use',
            'Action Group: Collection of related actions',
            'Module: Specialized Tanium applications (Patch, Asset, etc.)'
          ],
          isCompleted: false
        },
        {
          id: 'advanced-terms',
          title: 'Advanced Terms (TCO Exam Focus)',
          content: 'Master the concepts that appear on the certification exam',
          keyPoints: [
            'Linear Chain Architecture: Tanium\'s unique communication method',
            'RBAC: Role-Based Access Control security model',
            'Content Authoring: Creating custom sensors and packages'
          ],
          isCompleted: false
        }
      ]
    },
    {
      id: 'navigation',
      title: 'Navigation Essentials', 
      duration: '15 minutes',
      description: 'Move confidently through the Tanium console interface',
      icon: Globe,
      difficulty: 'Easy',
      milestone: 'Navigate Tanium console without guidance',
      confidenceBoost: 'You\'re navigating like a Tanium expert!',
      isCompleted: userProgress.completedModules.includes('navigation'),
      progress: 0,
      sections: [
        {
          id: 'console-layout',
          title: 'Console Layout Mastery',
          content: 'Learn every part of the Tanium console interface',
          keyPoints: [
            'Home: Dashboard and overview of your environment',
            'Interact: Ask questions and view real-time results',
            'Deploy: Manage actions and package deployments',
            'Modules: Access specialized applications',
            'Administration: User and system management'
          ],
          checklistItems: [
            'I can find the Interact tab for asking questions',
            'I know where to go to deploy actions',
            'I can access specialized modules',
            'I understand the administration section'
          ],
          isCompleted: false
        },
        {
          id: 'essential-workflows',
          title: 'Essential Workflows',
          content: 'Master the core workflows every TCO uses daily',
          keyPoints: [
            'Basic Question Flow: From asking to exporting results',
            'Action Deployment Flow: From selection to monitoring',
            'Computer Group Management: Creating and managing groups'
          ],
          isCompleted: false
        }
      ]
    },
    {
      id: 'learning-roadmap',
      title: 'Your Learning Roadmap',
      duration: '10 minutes',
      description: 'Plan your journey from foundation to certification success',
      icon: Target,
      difficulty: 'Easy',
      milestone: 'Create personalized study plan with confidence',
      confidenceBoost: 'You have a clear path to TCO certification success!',
      isCompleted: userProgress.completedModules.includes('learning-roadmap'),
      progress: 0,
      sections: [
        {
          id: 'certification-path',
          title: 'Phase 0 to Certification Success',
          content: 'Your complete journey from beginner to certified professional',
          keyPoints: [
            'Phase 0: Foundation (You are here!) - Build confidence',
            'Phase 1: Core Fundamentals - Master 5 TCO domains', 
            'Phase 2: Exam Preparation - Practice tests and time management',
            'Phase 3: Certification Success - Real-world application'
          ],
          isCompleted: false
        },
        {
          id: 'study-tips',
          title: 'Study Tips for Success',
          content: 'Proven strategies for mastering Tanium concepts',
          keyPoints: [
            'Take your time - this phase builds confidence',
            'Practice daily - 30 minutes beats 3-hour sessions',
            'Ask questions - use resources liberally',
            'Celebrate progress - acknowledge every milestone',
            'Connect concepts - link terms to real scenarios'
          ],
          checklistItems: [
            'I have a daily study schedule',
            'I know where to get help when stuck',
            'I celebrate my learning progress',
            'I connect new concepts to real examples'
          ],
          isCompleted: false
        }
      ]
    }
  ];

  // Foundation milestones for gamification
  const foundationMilestones: FoundationMilestone[] = [
    {
      id: 'first-module',
      title: 'First Module Complete!',
      description: 'You completed your first foundation module',
      icon: Star,
      isUnlocked: userProgress.completedModules.length >= 1,
      isCompleted: userProgress.unlockedMilestones.includes('first-module'),
      reward: 'Foundation Learner Badge'
    },
    {
      id: 'terminology-master',
      title: 'Terminology Master',
      description: 'You mastered essential TCO terminology',
      icon: BookOpen,
      isUnlocked: userProgress.completedModules.includes('terminology'),
      isCompleted: userProgress.unlockedMilestones.includes('terminology-master'),
      reward: 'Vocabulary Expert Badge'
    },
    {
      id: 'navigation-expert',
      title: 'Navigation Expert',
      description: 'You can navigate the Tanium console confidently',
      icon: Globe,
      isUnlocked: userProgress.completedModules.includes('navigation'),
      isCompleted: userProgress.unlockedMilestones.includes('navigation-expert'),
      reward: 'Console Navigator Badge'
    },
    {
      id: 'foundation-graduate',
      title: 'Foundation Graduate!',
      description: 'You completed all Phase 0 foundation modules',
      icon: Award,
      isUnlocked: userProgress.completedModules.length >= 5,
      isCompleted: userProgress.unlockedMilestones.includes('foundation-graduate'),
      reward: 'Ready for Phase 1 Badge'
    }
  ];

  // Calculate overall progress
  useEffect(() => {
    const totalSections = foundationModules.reduce((total, module) => total + module.sections.length, 0);
    const completedCount = completedSections.length;
    const progress = totalSections > 0 ? (completedCount / totalSections) * 100 : 0;
    setOverallProgress(Math.round(progress));
  }, [completedSections]);

  // Handle section completion
  const handleSectionComplete = (moduleId: string, sectionId: string) => {
    const newCompleted = [...completedSections, sectionId];
    setCompletedSections(newCompleted);

    // Check if module is complete
    const module = foundationModules.find(m => m.id === moduleId);
    if (module) {
      const moduleSections = module.sections.map(s => s.id);
      const moduleCompleted = moduleSections.every(id => newCompleted.includes(id));
      
      if (moduleCompleted) {
        onModuleComplete?.(moduleId);
        
        // Check for milestone achievements
        const milestone = foundationMilestones.find(m => 
          m.id === 'first-module' && userProgress.completedModules.length === 0 ||
          m.id === 'terminology-master' && moduleId === 'terminology' ||
          m.id === 'navigation-expert' && moduleId === 'navigation' ||
          m.id === 'foundation-graduate' && userProgress.completedModules.length >= 4
        );
        
        if (milestone && !milestone.isCompleted) {
          setShowMilestone(milestone);
          onMilestoneAchieved?.(milestone.id);
        }
      }
    }
  };

  const getModuleProgress = (module: FoundationModule): number => {
    const completedInModule = module.sections.filter(s => 
      completedSections.includes(s.id)
    ).length;
    return Math.round((completedInModule / module.sections.length) * 100);
  };

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Beginner': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header with Progress */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h1 className="text-4xl font-bold text-gray-900">
            Phase 0: Foundation
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Complete Beginner's Guide to Tanium - Build unshakeable confidence in the fundamentals
          </p>
        </motion.div>

        {/* Overall Progress */}
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Overall Progress</span>
            <span>{overallProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <motion.div
              className="bg-gradient-to-r from-cyan-500 to-sky-600 h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${overallProgress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      {/* Foundation Modules Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {foundationModules.map((module, index) => (
          <motion.div
            key={module.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              {/* Module Header */}
              <div className="flex items-start space-x-4 mb-4">
                <div className="flex-shrink-0 p-3 bg-blue-50 rounded-lg">
                  <module.icon className="w-6 h-6 text-blue-600" />
                </div>
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {module.title}
                    </h3>
                    {module.isCompleted && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-1" />
                      {module.duration}
                    </span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(module.difficulty)}`}>
                      {module.difficulty}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm">
                    {module.description}
                  </p>
                </div>
              </div>

              {/* Module Progress */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Progress</span>
                  <span className="text-gray-900 font-medium">{getModuleProgress(module)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="progress-bar"
                    style={{ width: `${getModuleProgress(module)}%` }}
                  />
                </div>
              </div>

              {/* Sections List */}
              <div className="space-y-2 mb-4">
                {module.sections.map((section) => (
                  <div key={section.id} className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      completedSections.includes(section.id) 
                        ? 'bg-green-500' 
                        : 'bg-gray-300'
                    }`} />
                    <span className={`text-sm ${
                      completedSections.includes(section.id)
                        ? 'text-gray-900 font-medium'
                        : 'text-gray-600'
                    }`}>
                      {section.title}
                    </span>
                    {completedSections.includes(section.id) && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                ))}
              </div>

              {/* Action Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveModule(activeModule === module.id ? null : module.id)}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-cyan-500 to-sky-600 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-sky-700 transition-colors"
              >
                <PlayCircle className="w-4 h-4" />
                <span>
                  {module.isCompleted ? 'Review Module' : 'Start Learning'}
                </span>
              </motion.button>
            </div>

            {/* Expandable Section Content */}
            <AnimatePresence>
              {activeModule === module.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-t border-gray-200 bg-gray-50"
                >
                  <div className="p-6 space-y-4">
                    {module.sections.map((section) => (
                      <div key={section.id} className="bg-white rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-md font-semibold text-gray-900">
                            {section.title}
                          </h4>
                          {completedSections.includes(section.id) ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleSectionComplete(module.id, section.id)}
                              className="px-3 py-1 text-xs bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                            >
                              Complete
                            </motion.button>
                          )}
                        </div>
                        
                        <p className="text-gray-600 text-sm">
                          {section.content}
                        </p>
                        
                        <div className="space-y-2">
                          <h5 className="text-sm font-medium text-gray-900">Key Points:</h5>
                          <ul className="space-y-1">
                            {section.keyPoints.map((point, idx) => (
                              <li key={idx} className="text-sm text-gray-600 flex items-start space-x-2">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                                <span>{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {section.examples && (
                          <div className="space-y-2">
                            <h5 className="text-sm font-medium text-gray-900">Examples:</h5>
                            <ul className="space-y-1">
                              {section.examples.map((example, idx) => (
                                <li key={idx} className="text-sm text-green-700 bg-green-50 rounded px-2 py-1">
                                  {example}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {section.checklistItems && (
                          <div className="space-y-2">
                            <h5 className="text-sm font-medium text-gray-900">Self-Check:</h5>
                            <ul className="space-y-1">
                              {section.checklistItems.map((item, idx) => (
                                <li key={idx} className="text-sm text-gray-600 flex items-start space-x-2">
                                  <label className="flex items-start space-x-2">
                                    <input 
                                      type="checkbox" 
                                      className="mt-1" 
                                      aria-label={`Check off: ${item}`}
                                    />
                                    <span>{item}</span>
                                  </label>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Foundation Milestones */}
      <div className="bg-gradient-to-r from-cyan-50 to-sky-50 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
          🏆 Foundation Milestones
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {foundationMilestones.map((milestone) => (
            <motion.div
              key={milestone.id}
              initial={{ opacity: 0.6 }}
              animate={{ 
                opacity: milestone.isUnlocked ? 1 : 0.6,
                scale: milestone.isCompleted ? 1.05 : 1
              }}
              className={`p-4 rounded-lg border text-center space-y-2 ${
                milestone.isCompleted 
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-400 border-yellow-500 text-white'
                  : milestone.isUnlocked
                    ? 'bg-white border-cyan-200 shadow-sm'
                    : 'bg-gray-100 border-gray-300'
              }`}
            >
              <milestone.icon className={`w-8 h-8 mx-auto ${
                milestone.isCompleted ? 'text-white' : 'text-cyan-600'
              }`} />
              <h3 className={`font-semibold ${
                milestone.isCompleted ? 'text-white' : 'text-gray-900'
              }`}>
                {milestone.title}
              </h3>
              <p className={`text-xs ${
                milestone.isCompleted ? 'text-white/90' : 'text-gray-600'
              }`}>
                {milestone.description}
              </p>
              {milestone.isCompleted && (
                <div className="text-xs bg-white/20 rounded-full px-2 py-1">
                  {milestone.reward}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Milestone Achievement Modal */}
      <AnimatePresence>
        {showMilestone && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowMilestone(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-8 max-w-md w-full text-center space-y-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mx-auto w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center"
              >
                <showMilestone.icon className="w-10 h-10 text-white" />
              </motion.div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-gray-900">
                  Milestone Achieved!
                </h3>
                <h4 className="text-lg font-semibold text-cyan-600">
                  {showMilestone.title}
                </h4>
                <p className="text-gray-600">
                  {showMilestone.description}
                </p>
              </div>

              <div className="p-4 bg-gradient-to-r from-cyan-50 to-sky-50 rounded-lg">
                <div className="flex items-center justify-center space-x-2">
                  <Award className="w-5 h-5 text-cyan-600" />
                  <span className="font-semibold text-cyan-900">
                    {showMilestone.reward}
                  </span>
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowMilestone(null)}
                className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-sky-500 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-sky-600 transition-colors"
              >
                Continue Learning! 🚀
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Completion Call to Action */}
      {overallProgress >= 100 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-8 text-white text-center"
        >
          <Heart className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-2">
            🎉 Foundation Complete!
          </h2>
          <p className="text-xl text-white/90 mb-6">
            Amazing work! You've built a solid foundation in Tanium concepts. 
            You're ready for Phase 1: Core Fundamentals!
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-white text-green-600 font-bold rounded-xl hover:bg-green-50 transition-colors"
          >
            Start Phase 1: Core Fundamentals
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}
