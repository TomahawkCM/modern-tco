"use client";

import { useState, useEffect } from "react";
import { QuestionCard } from "@/components/exam/question-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  ArrowRight,
  Play,
  BookOpen,
  Target,
  Trophy,
  CheckCircle,
  XCircle,
  Brain,
  Clock,
  Zap,
  Shield,
  Server,
  Wrench,
  Layers,
  AlertTriangle,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { sampleQuestions } from "@/data/sample-questions";
import { ModuleVideos } from "@/components/videos/ModuleVideos";
import { useExam } from "@/contexts/ExamContext";
import { TCODomain, ExamMode, Question } from "@/types/exam";
import { cn } from "@/lib/utils";

const domainInfo = {
  "asking-questions": {
    title: "Asking Questions",
    description:
      "Master the fundamentals of creating and executing questions in Tanium to gather real-time endpoint data",
    icon: Brain,
    color: "text-green-400",
    bgColor: "bg-green-900/20",
    borderColor: "border-green-400",
    topics: [
      "Natural Language Interface & Question Syntax",
      "Question Builder and Interactive Console",
      "Built-in Sensors and Custom Sensor Creation",
      "Parameterized Questions and Dynamic Queries",
      "Question History, Favorites, and Management",
      "Real-time Data Collection Strategies",
      "Question Performance Optimization",
    ],
    objectives: [
      "Create effective questions using natural language syntax",
      "Navigate the Question Builder interface efficiently",
      "Understand and utilize built-in Tanium sensors",
      "Build and deploy custom sensors for specific data needs",
      "Use parameterized questions for dynamic, reusable queries",
      "Manage question history and organize saved questions",
      "Optimize question performance for large environments",
      "Interpret question results and understand data context",
    ],
    examWeight: 22,
    keySkills: [
      "Natural language question formulation",
      "Sensor selection and customization",
      "Question performance optimization",
      "Real-time data interpretation",
    ],
  },
  "refining-targeting": {
    title: "Refining Questions & Targeting",
    description:
      "Advanced targeting techniques and question refinement strategies for precise endpoint management",
    icon: Target,
    color: "text-blue-400",
    bgColor: "bg-blue-900/20",
    borderColor: "border-blue-400",
    topics: [
      "Computer Groups Creation and Management",
      "Advanced Filter Expressions and Logic",
      "Drill-down Techniques and Investigation",
      "Dynamic Targeting and Conditional Logic",
      "Question Chaining and Result Correlation",
      "Targeting by Network Location and Properties",
      "Performance Optimization for Large Queries",
    ],
    objectives: [
      "Create static and dynamic computer groups effectively",
      "Apply complex boolean filters to refine target sets",
      "Use drill-down functionality to investigate specific endpoints",
      "Implement advanced targeting strategies for complex scenarios",
      "Chain questions together for comprehensive endpoint analysis",
      "Optimize targeting performance in large enterprise environments",
      "Troubleshoot targeting issues and validate results",
      "Apply conditional logic for sophisticated query refinement",
    ],
    examWeight: 23,
    keySkills: [
      "Boolean filter logic",
      "Computer group management",
      "Advanced targeting strategies",
      "Query optimization techniques",
    ],
  },
  "taking-action": {
    title: "Taking Action - Packages & Actions",
    description:
      "Deploy packages and execute actions across your environment safely and efficiently",
    icon: Zap,
    color: "text-cyan-400",
    bgColor: "bg-cyan-900/20",
    borderColor: "border-cyan-400",
    topics: [
      "Package Creation and Command Structure",
      "Action Deployment and Execution Strategies",
      "Scheduled Actions and Recurring Tasks",
      "Action Groups and Bulk Operations",
      "Action Approval Workflow and Governance",
      "Action Status Monitoring and Troubleshooting",
      "Security Considerations and Best Practices",
      "Custom Tools and Advanced Package Development",
    ],
    objectives: [
      "Create and configure packages with proper parameters",
      "Deploy actions safely across targeted endpoint groups",
      "Schedule actions for optimal timing and minimal disruption",
      "Implement action approval workflows for governance",
      "Monitor action status and troubleshoot failed deployments",
      "Apply security best practices for action deployment",
      "Use action groups for efficient bulk operations",
      "Develop custom tools and advanced package solutions",
    ],
    examWeight: 15,
    keySkills: [
      "Package development and configuration",
      "Action deployment strategies",
      "Workflow approval processes",
      "Action monitoring and troubleshooting",
    ],
  },
  "navigation-modules": {
    title: "Navigation and Basic Module Functions",
    description:
      "Navigate the Tanium Console efficiently and utilize core Tanium modules for endpoint management",
    icon: Layers,
    color: "text-yellow-400",
    bgColor: "bg-yellow-900/20",
    borderColor: "border-yellow-400",
    topics: [
      "Tanium Console Navigation and Interface Layout",
      "Core Module Overview and Integration",
      "Interact Module Fundamentals and Operations",
      "Asset Discovery and Management Workflows",
      "Client Health Monitoring and Management",
      "User Permissions and Role-Based Access",
      "Console Customization and Preferences",
      "Multi-tenancy and Organization Management",
    ],
    objectives: [
      "Navigate the Tanium Console interface efficiently",
      "Understand the purpose and functionality of core modules",
      "Perform essential operations within the Interact module",
      "Manage endpoint assets and maintain asset inventory",
      "Monitor and troubleshoot Tanium client health",
      "Configure user permissions and implement role-based access",
      "Customize console settings for optimal workflow",
      "Work within multi-tenant environments and organizational structures",
    ],
    examWeight: 23,
    keySkills: [
      "Console navigation proficiency",
      "Module integration understanding",
      "Asset management workflows",
      "Client administration",
    ],
  },
  "reporting-export": {
    title: "Report Generation and Data Export",
    description:
      "Generate comprehensive reports and export data for analysis, compliance, and business intelligence",
    icon: BookOpen,
    color: "text-red-400",
    bgColor: "bg-red-900/20",
    borderColor: "border-red-400",
    topics: [
      "Report Generation and Customization",
      "Data Export Formats and Options",
      "Scheduled Reporting and Automation",
      "Tanium Connect Integration and Data Feeds",
      "Dashboard Creation and Visualization",
      "Compliance Reporting and Audit Trails",
      "Performance Metrics and KPI Tracking",
      "Data Analysis and Business Intelligence Integration",
    ],
    objectives: [
      "Create customized reports for various stakeholders",
      "Export data in multiple formats for different use cases",
      "Configure automated scheduled reporting workflows",
      "Integrate with external systems using Tanium Connect",
      "Build interactive dashboards for real-time monitoring",
      "Generate compliance reports for regulatory requirements",
      "Track performance metrics and key performance indicators",
      "Analyze exported data for business intelligence insights",
    ],
    examWeight: 17,
    keySkills: [
      "Report customization and automation",
      "Data export and integration",
      "Dashboard development",
      "Compliance and audit reporting",
    ],
  },
};

export default function DomainPage() {
  const params = useParams<{ domain?: string | string[] }>();
  const router = useRouter();
  const raw = (params?.domain ?? "") as string | string[];
  const domain = Array.isArray(raw) ? raw[0] : raw;
  if (!domain) {
    if (typeof window !== "undefined") router.replace("/modules");
    return null;
  }
  const domainKey = domain.toLowerCase() as keyof typeof domainInfo;

  const {
    state,
    startExam,
    answerQuestion,
    nextQuestion,
    previousQuestion,
    finishExam,
    resetExam,
    getCurrentQuestion,
    getProgress,
    getScore,
  } = useExam();

  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [studyMode, setStudyMode] = useState<"learn" | "practice">("learn");

  // Reset selected answer when question changes
  useEffect(() => {
    if (getCurrentQuestion() && state.currentSession) {
      const existingAnswer = state.currentSession.answers[getCurrentQuestion()!.id];
      setSelectedAnswer(existingAnswer || "");
    }
  }, [state.currentSession, getCurrentQuestion]);

  // Map URL domain to TCODomain enum value
  const domainMap: Record<string, TCODomain> = {
    "asking-questions": TCODomain.ASKING_QUESTIONS,
    "refining-targeting": TCODomain.REFINING_TARGETING,
    "taking-action": TCODomain.TAKING_ACTION,
    "navigation-modules": TCODomain.NAVIGATION_MODULES,
    "reporting-export": TCODomain.REPORTING_EXPORT,
  };

  // Get mapped TCODomain enum value for filtering
  const mappedDomain = domainMap[domainKey];

  // Get domain-specific questions with proper enum matching and null safety
  const domainQuestions = mappedDomain
    ? sampleQuestions.filter((q) => q.domain === mappedDomain)
    : [];

  const currentQuestion = getCurrentQuestion();
  const progress = getProgress();
  const currentScore = getScore();
  const isLastQuestion = currentQuestion && progress.current === progress.total;
  const isFirstQuestion = progress.current === 1;

  const info = domainInfo[domainKey];
  // Map domain to learn module slug for videos/study content
  const learnSlugMap: Record<string, string> = {
    "asking-questions": "asking-questions",
    "refining-targeting": "refining-questions",
    "taking-action": "taking-action",
    "navigation-modules": "navigation-modules",
    "reporting-export": "reporting-export",
  };
  const learnSlug = learnSlugMap[domainKey];

  if (!info) {
    return (
        <div className="mx-auto max-w-4xl py-20 text-center">
          <h1 className="mb-4 text-4xl font-bold text-white">Domain Not Found</h1>
          <p className="mb-8 text-gray-300">The requested domain does not exist.</p>
          <Button
            onClick={() => router.push("/")}
            className="bg-tanium-accent hover:bg-blue-600"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
    );
  }

  const Icon = info.icon;

  const handleStartPractice = () => {
    resetExam();
    // In real app, would filter questions by domain
    startExam(ExamMode.PRACTICE, domainQuestions);
    setStudyMode("practice");
  };

  const handleAnswerSelect = (answerId: string) => {
    setSelectedAnswer(answerId);
    if (currentQuestion) {
      answerQuestion(currentQuestion.id, answerId);
    }
  };

  const handleNext = () => {
    if (isLastQuestion) {
      finishExam();
    } else {
      nextQuestion();
    }
  };

  const handlePrevious = () => {
    previousQuestion();
  };

  const handleBackToLearn = () => {
    resetExam();
    setStudyMode("learn");
  };

  // Mock progress data (in real app, would come from user analytics)
  // Using fixed values to prevent hydration mismatch
  const domainProgress = {
    completed:
      domainKey === "asking-questions"
        ? 79
        : domainKey === "refining-targeting"
          ? 72
          : domainKey === "taking-action"
            ? 68
            : domainKey === "navigation-modules"
              ? 45
              : domainKey === "reporting-export"
                ? 38
                : 50,
    totalQuestions: domainQuestions.length > 0 ? domainQuestions.length : 14,
    averageScore:
      domainKey === "asking-questions"
        ? 86
        : domainKey === "refining-targeting"
          ? 78
          : domainKey === "taking-action"
            ? 71
            : domainKey === "navigation-modules"
              ? 65
              : domainKey === "reporting-export"
                ? 59
                : 70,
    timeSpent:
      domainKey === "asking-questions"
        ? 4
        : domainKey === "refining-targeting"
          ? 3
          : domainKey === "taking-action"
            ? 5
            : domainKey === "navigation-modules"
              ? 2
              : domainKey === "reporting-export"
                ? 3
                : 3,
  };

  // Practice mode (question flow)
  if (studyMode === "practice" && state.currentSession && !state.currentSession.completed) {
    return (
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Practice header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon className={cn("h-6 w-6", info.color)} />
              <div>
                <h1 className="text-2xl font-bold text-white">{info.title} Practice</h1>
                <p className="text-gray-300">
                  Question {progress.current} of {progress.total}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleBackToLearn}
              className="border-white/20 text-white hover:bg-white/10"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Study
            </Button>
          </div>

          {/* Progress */}
          <Progress value={progress.percentage} className="h-3" />

          {/* Question */}
          {currentQuestion && (
            <QuestionCard
              question={currentQuestion}
              questionNumber={progress.current}
              totalQuestions={progress.total}
              selectedAnswer={selectedAnswer}
              onAnswerSelect={handleAnswerSelect}
              showExplanation={true}
              mode="practice"
            />
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={isFirstQuestion}
              className="border-white/20 text-white hover:bg-white/10 disabled:opacity-50"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            <div className="text-sm text-gray-400">
              {selectedAnswer ? "Answer selected" : "Select an answer to continue"}
            </div>

            <Button
              onClick={handleNext}
              disabled={!selectedAnswer}
              className="bg-tanium-accent hover:bg-blue-600 disabled:opacity-50"
            >
              {isLastQuestion ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Finish Practice
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
    );
  }

  // Completed practice
  if (studyMode === "practice" && state.currentSession?.completed) {
    const { score, questions, answers } = state.currentSession;
    const correctCount = questions.filter((q) => answers[q.id] === q.correctAnswerId).length;

    return (
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="text-center">
            <Icon className={cn("mx-auto mb-4 h-16 w-16", info.color)} />
            <h1 className="mb-4 text-4xl font-bold text-white">{info.title} Practice Complete!</h1>
          </div>

          <Card className={cn("glass border-2", info.borderColor, info.bgColor)}>
            <CardContent className="py-8 text-center">
              <div className="mb-2 text-5xl font-bold text-white">{score}%</div>
              <p className="mb-6 text-gray-300">
                {correctCount} out of {questions.length} correct
              </p>
              <div className="flex justify-center gap-4">
                <Button
                  onClick={handleStartPractice}
                  className="bg-tanium-accent hover:bg-blue-600"
                >
                  <Target className="mr-2 h-4 w-4" />
                  Practice Again
                </Button>
                <Button
                  onClick={handleBackToLearn}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  Back to Study
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
    );
  }

  // Main learning mode
  return (
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <div className="text-center">
          <Icon className={cn("mx-auto mb-4 h-16 w-16", info.color)} />
          <h1 className="mb-4 text-4xl font-bold text-white">{info.title}</h1>
          <p className="mb-6 text-xl text-gray-200">{info.description}</p>
        </div>

        {/* Progress overview */}
        <Card className={cn("glass border-2", info.borderColor, info.bgColor)}>
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-white">
              <Trophy className="h-5 w-5 text-yellow-400" />
              Your Progress in {info.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6 grid gap-6 md:grid-cols-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{domainProgress.completed}%</div>
                <div className="text-sm text-gray-300">Completion</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{domainProgress.totalQuestions}</div>
                <div className="text-sm text-gray-300">Questions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{domainProgress.averageScore}%</div>
                <div className="text-sm text-gray-300">Average Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{domainProgress.timeSpent}h</div>
                <div className="text-sm text-gray-300">Study Time</div>
              </div>
            </div>

            <Progress value={domainProgress.completed} className="mb-4 h-4" />

            <div className="flex justify-center">
              <Button
                onClick={handleStartPractice}
                disabled={domainQuestions.length === 0}
                className="bg-tanium-accent hover:bg-blue-600"
              >
                <Play className="mr-2 h-4 w-4" />
                {domainQuestions.length === 0
                  ? "No Questions Available"
                  : `Start Practice (${domainQuestions.length} Questions)`}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="glass grid w-full grid-cols-3 border border-white/10">
            <TabsTrigger
              value="overview"
              className="text-white data-[state=active]:bg-tanium-accent"
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="topics" className="text-white data-[state=active]:bg-tanium-accent">
              <Target className="mr-2 h-4 w-4" />
              Key Topics
            </TabsTrigger>
            <TabsTrigger
              value="objectives"
              className="text-white data-[state=active]:bg-tanium-accent"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Learning Objectives
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card className="glass border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Domain Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="leading-relaxed text-gray-300">
                  {info.description}. This domain covers essential concepts and practical skills
                  needed to work effectively with Tanium in this area.
                </p>

                {/* Videos section for this domain's learn module */}
                {learnSlug && (
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-white">Videos</h3>
                      <Button size="sm" onClick={() => router.push(`/learn/${learnSlug}`)} className="bg-tanium-accent hover:bg-blue-600">
                        Open Study Module
                      </Button>
                    </div>
                    <ModuleVideos slug={learnSlug} />
                  </div>
                )}

                {domainQuestions.length === 0 && (
                  <Alert className="border-yellow-200 bg-yellow-50/10 dark:border-yellow-800 dark:bg-yellow-900/20">
                    <AlertTriangle className="h-4 w-4 text-yellow-400" />
                    <AlertDescription className="text-yellow-200">
                      <strong>Content Coming Soon:</strong> Questions for this domain are being
                      developed. Check back soon for practice questions and assessments.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="topics" className="space-y-6">
            <Card className="glass border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Key Topics Covered</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {info.topics.map((topic, index) => (
                    <div
                      key={index}
                      className="glass flex items-center space-x-3 rounded-lg border border-white/10 p-3"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-tanium-accent/20">
                        <span className="text-sm font-medium text-tanium-accent">{index + 1}</span>
                      </div>
                      <span className="text-white">{topic}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="objectives" className="space-y-6">
            <Card className="glass border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Learning Objectives</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {info.objectives.map((objective, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-400" />
                      <span className="text-gray-300">{objective}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Related Learning Modules - NEW */}
        <Card className={cn("glass border-2", info.borderColor, info.bgColor)}>
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-white">
              <BookOpen className="h-5 w-5 text-blue-400" />
              Study Modules for {info.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-gray-300">
              Deepen your understanding with comprehensive study modules covering this domain's core
              concepts.
            </p>
            <div className="space-y-3">
              {/* Filter modules by domain */}
              {(() => {
                const domainModules = [
                  // Module mapping based on domain
                  ...(mappedDomain === TCODomain.ASKING_QUESTIONS
                    ? [
                        { id: "interact", title: "Interact Module", icon: "🎯", time: "60 min" },
                        { id: "exam_strategy", title: "Exam Strategy", icon: "📝", time: "20 min" },
                      ]
                    : []),
                  ...(mappedDomain === TCODomain.REFINING_QUESTIONS
                    ? [
                        {
                          id: "targeting_groups",
                          title: "Targeting & Groups",
                          icon: "🎯",
                          time: "40 min",
                        },
                      ]
                    : []),
                  ...(mappedDomain === TCODomain.TAKING_ACTION
                    ? [
                        {
                          id: "packages_actions",
                          title: "Packages & Actions",
                          icon: "📦",
                          time: "50 min",
                        },
                        { id: "deploy_patch", title: "Deploy & Patch", icon: "🚀", time: "30 min" },
                      ]
                    : []),
                  ...(mappedDomain === TCODomain.NAVIGATION_MODULES
                    ? [
                        {
                          id: "platform_basics",
                          title: "Platform & Client Basics",
                          icon: "🏗️",
                          time: "45 min",
                        },
                        {
                          id: "content_management",
                          title: "Content Management",
                          icon: "📄",
                          time: "35 min",
                        },
                        {
                          id: "troubleshooting",
                          title: "Troubleshooting & Health",
                          icon: "🔧",
                          time: "25 min",
                        },
                      ]
                    : []),
                  ...(mappedDomain === TCODomain.REPORTING_EXPORT
                    ? [
                        {
                          id: "reporting_export",
                          title: "Report Generation and Data Export",
                          icon: "📊",
                          time: "35 min",
                        },
                      ]
                    : []),
                ];

                return domainModules.map((module) => (
                  <div
                    key={module.id}
                    className="glass flex items-center justify-between rounded-lg border border-white/10 p-3 transition-colors hover:border-blue-400/30"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{module.icon}</div>
                      <div>
                        <div className="font-medium text-white">{module.title}</div>
                        <div className="text-sm text-gray-400">{module.time}</div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => router.push(`/modules?from=${domain}&module=${module.id}`)}
                      className="border-blue-400/30 bg-blue-500/20 text-blue-300 hover:bg-blue-500/30"
                    >
                      Study Module
                    </Button>
                  </div>
                ));
              })()}
            </div>

            <div className="mt-4 border-t border-white/10 pt-4">
              <Button
                onClick={() => router.push(`/modules?from=${domain}`)}
                className="w-full border border-blue-400/30 bg-blue-500/20 text-blue-300 hover:bg-blue-500/30"
              >
                <BookOpen className="mr-2 h-4 w-4" />
                View All Study Modules
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Additional resources */}
        <Card className="glass border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Additional Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <Button
                variant="outline"
                onClick={() => router.push("/practice")}
                className="h-auto border-white/20 p-4 text-white hover:bg-white/10"
              >
                <div className="text-center">
                  <Target className="mx-auto mb-2 h-6 w-6" />
                  <div className="font-medium">Mixed Practice</div>
                  <div className="text-xs opacity-80">Practice questions from all domains</div>
                </div>
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/review")}
                className="h-auto border-white/20 p-4 text-white hover:bg-white/10"
              >
                <div className="text-center">
                  <Brain className="mx-auto mb-2 h-6 w-6" />
                  <div className="font-medium">Review Mistakes</div>
                  <div className="text-xs opacity-80">Learn from incorrect answers</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
  );
}
