/**
 * Guides Page - Study guides dashboard
 * Display all available study guides with progress tracking and filtering
 * Matches existing modules page structure and functionality
 */

"use client";

import { useEffect, useState } from "react";
import { StudyGuideList } from "@/components/guides/StudyGuideList";
import { StudyGuideViewer } from "@/components/guides/StudyGuideViewer";
import { useModule } from "@/contexts/ModuleContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, FileText, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// Temporary mock data - will be replaced with actual data
const mockStudyGuides = [
  {
    id: "guide-1",
    moduleId: "fundamentals-1",
    title: "Tanium Platform Overview",
    description:
      "Comprehensive guide covering the core concepts and architecture of the Tanium platform.",
    content: `# Tanium Platform Overview\n\nThis guide provides a comprehensive overview of the Tanium platform...\n\n## Core Components\n\n### Tanium Server\nThe central hub that manages all platform operations...\n\n### Tanium Clients\nLightweight agents deployed on endpoints...`,
    sections: [
      {
        id: "s1",
        title: "Introduction",
        level: 1,
        content: "Overview of Tanium platform",
        completed: false,
      },
      {
        id: "s2",
        title: "Core Components",
        level: 1,
        content: "Server, clients, modules",
        completed: false,
      },
      {
        id: "s3",
        title: "Architecture",
        level: 1,
        content: "How components work together",
        completed: false,
      },
    ],
    checkpoints: [
      {
        id: "c1",
        sectionId: "s1",
        type: "knowledge-check" as const,
        question: "What is the primary function of Tanium Server?",
        completed: false,
      },
      {
        id: "c2",
        sectionId: "s2",
        type: "hands-on" as const,
        question: "Deploy a Tanium client in a test environment",
        completed: false,
      },
    ],
    estimatedReadingTime: 15,
    lastUpdated: new Date("2024-01-15"),
  },
  {
    id: "guide-2",
    moduleId: "deployment-1",
    title: "Deployment Best Practices",
    description: "Step-by-step guide for deploying Tanium in enterprise environments.",
    content: `# Deployment Best Practices\n\nThis guide covers enterprise deployment strategies...\n\n## Planning Phase\n\n### Network Requirements\nBandwidth, ports, and connectivity considerations...`,
    sections: [
      {
        id: "s1",
        title: "Planning",
        level: 1,
        content: "Pre-deployment planning",
        completed: false,
      },
      {
        id: "s2",
        title: "Installation",
        level: 1,
        content: "Server installation process",
        completed: false,
      },
      {
        id: "s3",
        title: "Configuration",
        level: 1,
        content: "Initial configuration",
        completed: false,
      },
      {
        id: "s4",
        title: "Client Deployment",
        level: 1,
        content: "Mass client deployment",
        completed: false,
      },
    ],
    checkpoints: [
      {
        id: "c1",
        sectionId: "s1",
        type: "knowledge-check" as const,
        question: "What are the minimum system requirements for Tanium Server?",
        completed: false,
      },
      {
        id: "c2",
        sectionId: "s3",
        type: "hands-on" as const,
        question: "Configure initial server settings",
        completed: false,
      },
    ],
    estimatedReadingTime: 25,
    lastUpdated: new Date("2024-01-20"),
  },
  {
    id: "guide-3",
    moduleId: "administration-1",
    title: "User Management Guide",
    description: "Complete guide to managing users, roles, and permissions in Tanium.",
    content: `# User Management Guide\n\nManaging users and permissions effectively...\n\n## User Roles\n\n### Administrator\nFull platform access and management capabilities...`,
    sections: [
      {
        id: "s1",
        title: "User Roles",
        level: 1,
        content: "Understanding different user roles",
        completed: false,
      },
      {
        id: "s2",
        title: "Creating Users",
        level: 1,
        content: "User creation process",
        completed: false,
      },
      {
        id: "s3",
        title: "Permissions",
        level: 1,
        content: "Configuring permissions",
        completed: false,
      },
    ],
    checkpoints: [
      {
        id: "c1",
        sectionId: "s1",
        type: "knowledge-check" as const,
        question: "What permissions does a Content Set Author have?",
        completed: false,
      },
    ],
    estimatedReadingTime: 20,
    lastUpdated: new Date("2024-01-10"),
  },
];

export default function GuidesPage() {
  // Note: Using local state for study guides since ModuleContext doesn't have studyGuides yet
  const [studyGuides, setStudyGuides] = useState(mockStudyGuides);
  const [guideProgress, setGuideProgress] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedGuideId, setSelectedGuideId] = useState<string | null>(null);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    // Load study guides on mount
    if (studyGuides.length === 0) {
      setStudyGuides(mockStudyGuides);
    }
  }, [studyGuides.length]);

  const selectedGuide = selectedGuideId
    ? studyGuides.find((g) => g.id === selectedGuideId) || null
    : null;

  const handleGuideSelect = (guideId: string) => {
    setSelectedGuideId(guideId);

    // Initialize progress if not started
    const existingProgress = guideProgress[guideId];
    if (!existingProgress) {
      setGuideProgress((prev) => ({
        ...prev,
        [guideId]: {
          readingProgress: 0,
          sectionsRead: [],
          checkpointsCompleted: [],
          notes: {},
          lastPosition: "",
          totalReadingTime: 0,
        },
      }));
    }
  };

  const handleBackToList = () => {
    setSelectedGuideId(null);
  };

  const handleProgressUpdate = (progress: any) => {
    if (!selectedGuideId) return;
    setGuideProgress((prev) => ({
      ...prev,
      [selectedGuideId]: progress,
    }));
  };

  // Calculate overall statistics
  const totalGuides = studyGuides.length;
  const completedGuides = Object.values(guideProgress).filter(
    (p) => p.readingProgress >= 100
  ).length;
  const inProgressGuides = Object.values(guideProgress).filter(
    (p) => p.readingProgress > 0 && p.readingProgress < 100
  ).length;
  const overallProgress = totalGuides > 0 ? Math.round((completedGuides / totalGuides) * 100) : 0;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Loading study guides...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600 dark:text-red-400">
          <p className="mb-2 text-lg font-medium">Error loading study guides</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {selectedGuide ? (
          <div className="space-y-6">
            {/* Back button */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handleBackToList}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Study Guides</span>
              </Button>

              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export PDF
                </Button>
              </div>
            </div>

            {/* Study Guide Viewer */}
            <StudyGuideViewer
              guide={selectedGuide}
              progress={guideProgress[selectedGuide.id]}
              onProgressUpdate={handleProgressUpdate}
            />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overview Stats */}
            {totalGuides > 0 && (
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <FileText className="mr-2 h-5 w-5" />
                    Study Progress Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <BookOpen className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">Total Guides</span>
                      </div>
                      <p className="text-2xl font-bold">{totalGuides}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium">In Progress</span>
                      </div>
                      <p className="text-2xl font-bold">{inProgressGuides}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <BookOpen className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium">Completed</span>
                      </div>
                      <p className="text-2xl font-bold">{completedGuides}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">Overall Progress</span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-2xl font-bold">{overallProgress}%</p>
                        <Progress
                          value={overallProgress}
                          className="h-2"
                          aria-label={`Overall guides progress: ${overallProgress}% complete`}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Study Guide List */}
            <StudyGuideList studyGuides={studyGuides} onGuideSelect={handleGuideSelect} />
          </div>
        )}
      </div>
    </div>
  );
}
