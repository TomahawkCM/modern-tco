"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Shield,
  AlertTriangle,
  Activity,
  Database,
  Settings,
  ChevronRight,
  Trophy,
  Target,
  Lightbulb,
  BookOpen,
  CheckCircle,
  XCircle
} from 'lucide-react';

// TCO Domain definitions aligned with certification blueprint
const TCO_DOMAINS = [
  {
    id: 'asking_questions',
    name: 'Asking Questions',
    weight: 22,
    icon: Database,
    description: 'Master Tanium query construction and sensor usage',
    objectives: [
      'Construct basic queries using sensors',
      'Apply filters and conditions',
      'Use aggregate functions',
      'Optimize query performance'
    ]
  },
  {
    id: 'refining_questions',
    name: 'Refining Questions',
    weight: 23,
    icon: Settings,
    description: 'Optimize and enhance query effectiveness',
    objectives: [
      'Merge and filter questions',
      'Use advanced operators',
      'Create parameterized queries',
      'Implement drill-down logic'
    ]
  },
  {
    id: 'taking_action',
    name: 'Taking Action',
    weight: 15,
    icon: Activity,
    description: 'Execute actions based on query results',
    objectives: [
      'Deploy packages',
      'Execute remediation actions',
      'Schedule recurring actions',
      'Monitor action progress'
    ]
  },
  {
    id: 'navigation',
    name: 'Navigation & Module Functions',
    weight: 23,
    icon: Settings,
    description: 'Navigate Tanium console and use modules effectively',
    objectives: [
      'Navigate between modules',
      'Use saved questions',
      'Manage computer groups',
      'Configure user permissions'
    ]
  },
  {
    id: 'reporting',
    name: 'Report Generation & Data Export',
    weight: 17,
    icon: Database,
    description: 'Generate reports and export data for analysis',
    objectives: [
      'Create custom reports',
      'Export data in various formats',
      'Schedule automated reports',
      'Use dashboard widgets'
    ]
  }
];

// Scenario templates for each domain
const SCENARIOS = {
  asking_questions: [
    {
      id: 'basic-inventory',
      title: 'Asset Inventory Query',
      difficulty: 'beginner',
      scenario: 'Your security team needs a quick inventory of all Windows servers in production.',
      expectedQuery: 'Get Computer Name and Operating System and IP Address from all machines with Operating System containing "Windows Server"',
      hints: ['Use Operating System sensor', 'Filter for Windows Server', 'Include IP Address for network context'],
      learningPoints: ['Basic sensor selection', 'Text filtering with contains', 'Multiple sensor queries']
    },
    {
      id: 'high-cpu',
      title: 'Performance Monitoring',
      difficulty: 'intermediate',
      scenario: 'Identify systems with CPU usage above 80% that might indicate performance issues or cryptomining.',
      expectedQuery: 'Get Computer Name and CPU Percent and Running Processes from all machines with CPU Percent greater than 80',
      hints: ['Use CPU Percent sensor', 'Apply numeric comparison', 'Include process information for context'],
      learningPoints: ['Numeric comparisons', 'Performance sensors', 'Correlating metrics']
    },
    {
      id: 'compliance-check',
      title: 'Compliance Validation',
      difficulty: 'advanced',
      scenario: 'Verify that all financial systems have the latest security patches and encryption enabled.',
      expectedQuery: 'Get Computer Name and Windows Updates and Registry Value[key="HKLM\\Software\\Policies\\Microsoft\\Windows\\BitLocker",value="EncryptionMethod"] from all machines with Computer Group equals "Financial Systems"',
      hints: ['Target specific computer group', 'Check Windows Updates', 'Query registry for encryption settings'],
      learningPoints: ['Computer group targeting', 'Registry queries', 'Compliance validation']
    }
  ],
  refining_questions: [
    {
      id: 'merge-filter',
      title: 'Merge and Filter Results',
      difficulty: 'intermediate',
      scenario: 'Combine results from multiple queries to identify vulnerable systems missing critical patches.',
      expectedQuery: 'Get Computer Name and Operating System and Windows Updates from all machines with Windows Updates not containing "KB5001234" and Last Reboot greater than 30 days ago',
      hints: ['Combine multiple conditions', 'Use negative filtering', 'Check reboot time'],
      learningPoints: ['Complex filtering', 'Negative conditions', 'Time-based queries']
    }
  ],
  taking_action: [
    {
      id: 'deploy-patch',
      title: 'Deploy Critical Patch',
      difficulty: 'intermediate',
      scenario: 'Deploy a critical security patch to all vulnerable Windows 10 machines.',
      expectedQuery: 'Deploy Package "Critical Security Update" to all machines with Operating System equals "Windows 10" and Windows Updates not containing "KB5001234"',
      hints: ['Target specific OS version', 'Check for missing update', 'Use deploy action'],
      learningPoints: ['Package deployment', 'Targeted actions', 'Patch management']
    }
  ]
};

interface TCOLearningModeProps {
  onQuerySubmit?: (query: string) => void;
  onProgressUpdate?: (domain: string, progress: number) => void;
}

export function TCOLearningMode({ onQuerySubmit, onProgressUpdate }: TCOLearningModeProps) {
  const [selectedDomain, setSelectedDomain] = useState(TCO_DOMAINS[0]);
  const [currentScenario, setCurrentScenario] = useState(SCENARIOS.asking_questions[0]);
  const [userQuery, setUserQuery] = useState('');
  const [showHints, setShowHints] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
  const [domainProgress, setDomainProgress] = useState<Record<string, number>>({});

  // Get scenarios for selected domain
  const domainScenarios = useMemo(() => {
    return SCENARIOS[selectedDomain.id as keyof typeof SCENARIOS] || [];
  }, [selectedDomain]);

  // Calculate overall progress
  const overallProgress = useMemo(() => {
    const totalWeight = TCO_DOMAINS.reduce((sum, d) => sum + d.weight, 0);
    const weightedProgress = TCO_DOMAINS.reduce((sum, d) => {
      const progress = domainProgress[d.id] || 0;
      return sum + (progress * d.weight);
    }, 0);
    return Math.round(weightedProgress / totalWeight);
  }, [domainProgress]);

  const handleQuerySubmit = () => {
    // Simplified validation - in production, would use full parser
    const queryLower = userQuery.toLowerCase();
    const expectedLower = currentScenario.expectedQuery.toLowerCase();

    if (queryLower.includes('get') && queryLower.includes('from all machines')) {
      setFeedback({
        type: 'success',
        message: `Excellent! Your query correctly addresses the scenario. Key concepts mastered: ${  currentScenario.learningPoints.join(', ')}`
      });

      // Update progress
      const newProgress = Math.min(100, (domainProgress[selectedDomain.id] || 0) + 20);
      setDomainProgress(prev => ({ ...prev, [selectedDomain.id]: newProgress }));
      onProgressUpdate?.(selectedDomain.id, newProgress);

      // Move to next scenario after delay
      setTimeout(() => {
        const currentIndex = domainScenarios.indexOf(currentScenario);
        if (currentIndex < domainScenarios.length - 1) {
          setCurrentScenario(domainScenarios[currentIndex + 1]);
          setUserQuery('');
          setFeedback({ type: null, message: '' });
          setShowHints(false);
        }
      }, 3000);
    } else {
      setFeedback({
        type: 'error',
        message: 'Not quite right. Review the scenario requirements and try again. Consider using the hints if you\'re stuck.'
      });
    }

    onQuerySubmit?.(userQuery);
  };

  return (
    <div className="space-y-6">
      {/* TCO Progress Overview */}
      <Card className="glass border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">TCO Certification Preparation</CardTitle>
              <CardDescription>
                Master query building aligned with certification objectives
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-tanium-accent">{overallProgress}%</div>
              <div className="text-sm text-gray-400">Overall Progress</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={overallProgress} className="mb-4" />

          {/* Domain progress breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {TCO_DOMAINS.map(domain => {
              const DomainIcon = domain.icon;
              const progress = domainProgress[domain.id] || 0;
              return (
                <button
                  key={domain.id}
                  onClick={() => setSelectedDomain(domain)}
                  className={`p-3 rounded-lg border transition-all ${
                    selectedDomain.id === domain.id
                      ? 'bg-tanium-accent/20 border-tanium-accent'
                      : 'glass border-white/10 hover:bg-white/5'
                  }`}
                >
                  <DomainIcon className="h-5 w-5 mb-1 text-tanium-accent" />
                  <div className="text-xs font-medium text-white">{domain.weight}%</div>
                  <div className="text-xs text-gray-400">{domain.name}</div>
                  <Progress value={progress} className="mt-2 h-1" />
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Learning Interface */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Scenario Panel */}
        <div className="md:col-span-2 space-y-4">
          <Card className="glass border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Target className="h-5 w-5 text-tanium-accent" />
                    {currentScenario.title}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={
                      currentScenario.difficulty === 'beginner' ? 'default' :
                      currentScenario.difficulty === 'intermediate' ? 'secondary' :
                      'destructive'
                    }>
                      {currentScenario.difficulty}
                    </Badge>
                    <span className="text-sm text-gray-400">
                      Domain: {selectedDomain.name}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Scenario description */}
              <Alert className="border-blue-500 bg-blue-500/10">
                <AlertTriangle className="h-4 w-4 text-blue-400" />
                <AlertDescription className="text-blue-300">
                  <strong>Scenario:</strong> {currentScenario.scenario}
                </AlertDescription>
              </Alert>

              {/* Query input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Your Query:</label>
                <textarea
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  placeholder="Type your Tanium query here..."
                  className="w-full h-32 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-tanium-accent focus:border-transparent"
                />
              </div>

              {/* Hints */}
              {showHints && (
                <Alert className="border-yellow-500 bg-yellow-500/10">
                  <Lightbulb className="h-4 w-4 text-yellow-400" />
                  <AlertDescription className="text-yellow-300">
                    <strong>Hints:</strong>
                    <ul className="list-disc list-inside mt-2">
                      {currentScenario.hints.map((hint, idx) => (
                        <li key={idx}>{hint}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Feedback */}
              {feedback.type && (
                <Alert className={`border-${feedback.type === 'success' ? 'green' : 'red'}-500 bg-${feedback.type === 'success' ? 'green' : 'red'}-500/10`}>
                  {feedback.type === 'success' ? (
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-400" />
                  )}
                  <AlertDescription className={`text-${feedback.type === 'success' ? 'green' : 'red'}-300`}>
                    {feedback.message}
                  </AlertDescription>
                </Alert>
              )}

              {/* Actions */}
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setShowHints(!showHints)}
                  className="text-yellow-400 border-yellow-400"
                >
                  <Lightbulb className="h-4 w-4 mr-2" />
                  {showHints ? 'Hide Hints' : 'Show Hints'}
                </Button>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setUserQuery(currentScenario.expectedQuery)}
                    className="text-gray-400"
                  >
                    Show Solution
                  </Button>
                  <Button
                    onClick={handleQuerySubmit}
                    className="bg-tanium-accent hover:bg-tanium-accent/80"
                  >
                    <ChevronRight className="h-4 w-4 mr-2" />
                    Submit Query
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Learning Resources */}
        <div className="space-y-4">
          {/* Domain objectives */}
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-tanium-accent" />
                Learning Objectives
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {selectedDomain.objectives.map((obj, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-tanium-accent mt-0.5" />
                    <span className="text-sm text-gray-300">{obj}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Key concepts */}
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Trophy className="h-4 w-4 text-tanium-accent" />
                Key Concepts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {currentScenario.learningPoints.map((point, idx) => (
                  <Badge key={idx} variant="secondary" className="mr-2">
                    {point}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick tips */}
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-sm">Quick Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• Start with basic sensors</li>
                <li>• Add filters incrementally</li>
                <li>• Test queries in small groups</li>
                <li>• Use saved questions for efficiency</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}