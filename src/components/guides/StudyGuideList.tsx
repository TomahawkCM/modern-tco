/**
 * StudyGuideList Component - Display available study guides
 * Provides overview of all study guides with progress indicators and filtering
 * Matches existing ModuleList styling and functionality
 */

"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Clock,
  CheckCircle,
  Play,
  Search,
  Filter,
  BookOpen,
  Target,
  User,
  Calendar,
  Eye,
} from "lucide-react";
import { type StudyGuide, StudyGuideProgress } from "@/types/module";
import { useModule } from "@/contexts/ModuleContext";
import { cn } from "@/lib/utils";

interface StudyGuideListProps {
  studyGuides: StudyGuide[];
  onGuideSelect?: (guideId: string) => void;
  className?: string;
}

export function StudyGuideList({ studyGuides, onGuideSelect, className }: StudyGuideListProps) {
  const { state } = useModule();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModule, setSelectedModule] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("title");

  // Filter guides based on search and filters
  const filteredGuides = studyGuides.filter((guide) => {
    const matchesSearch =
      guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesModule = selectedModule === "all" || guide.moduleId === selectedModule;

    return matchesSearch && matchesModule;
  });

  // Sort guides
  const sortedGuides = [...filteredGuides].sort((a, b) => {
    switch (sortBy) {
      case "title":
        return a.title.localeCompare(b.title);
      case "readingTime":
        return a.estimatedReadingTime - b.estimatedReadingTime;
      case "lastUpdated":
        return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
      case "progress":
        const progressA = getProgressInfo(a).progress;
        const progressB = getProgressInfo(b).progress;
        return progressB - progressA;
      default:
        return 0;
    }
  });

  // Get unique module IDs
  const moduleIds = Array.from(new Set(studyGuides.map((g) => g.moduleId)));

  const handleGuideClick = (guideId: string) => {
    onGuideSelect?.(guideId);
  };

  const getProgressInfo = (guide: StudyGuide) => {
    const progress = undefined as any;
    return {
      progress: progress?.readingProgress ?? 0,
      sectionsRead: progress?.sectionsRead?.length ?? 0,
      totalSections: guide.sections.length,
      checkpointsCompleted: progress?.checkpointsCompleted?.length ?? 0,
      totalCheckpoints: guide.checkpoints.length,
      totalReadingTime: progress?.totalReadingTime ?? 0,
      lastPosition: progress?.lastPosition,
      hasStarted: !!progress,
    };
  };

  const getStatusColor = (progress: number) => {
    if (progress >= 100) return "text-[#22c55e] dark:text-[#22c55e]";
    if (progress > 0) return "text-blue-600 dark:text-primary";
    return "text-gray-600 dark:text-muted-foreground";
  };

  const getStatusIcon = (progress: number) => {
    if (progress >= 100) return <CheckCircle className="h-5 w-5" />;
    if (progress > 0) return <Play className="h-5 w-5" />;
    return <FileText className="h-5 w-5" />;
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Study Guides</h2>
          <p className="text-muted-foreground">
            Comprehensive study guides for quick reference and review
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center space-x-1">
            <FileText className="h-4 w-4" />
            <span>{filteredGuides.length} guides</span>
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Filter className="mr-2 h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search guides..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Module</label>
              <Select value={selectedModule} onValueChange={setSelectedModule}>
                <SelectTrigger>
                  <SelectValue placeholder="All modules" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Modules</SelectItem>
                  {moduleIds.map((moduleId) => (
                    <SelectItem key={moduleId} value={moduleId}>
                      Module {moduleId}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Sort By</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="readingTime">Reading Time</SelectItem>
                  <SelectItem value="progress">Progress</SelectItem>
                  <SelectItem value="lastUpdated">Last Updated</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedModule("all");
                  setSortBy("title");
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Guide Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sortedGuides.map((guide) => {
          const progressInfo = getProgressInfo(guide);
          const statusClass = getStatusColor(progressInfo.progress);

          return (
            <Card
              key={guide.id}
              className="glass group cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg"
              onClick={() => handleGuideClick(guide.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className={statusClass}>{getStatusIcon(progressInfo.progress)}</div>
                      <CardTitle className="text-lg group-hover:text-primary">
                        {guide.title}
                      </CardTitle>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        Module {guide.moduleId}
                      </Badge>
                      {progressInfo.hasStarted && (
                        <Badge variant="secondary" className="text-xs">
                          {progressInfo.progress >= 100 ? "Completed" : "In Progress"}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <p className="line-clamp-2 text-sm text-muted-foreground">{guide.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Progress */}
                {progressInfo.progress > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Reading Progress</span>
                      <span>{progressInfo.progress}%</span>
                    </div>
                    <Progress value={progressInfo.progress} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>
                        {progressInfo.sectionsRead}/{progressInfo.totalSections} sections
                      </span>
                      <span>
                        {progressInfo.checkpointsCompleted}/{progressInfo.totalCheckpoints}{" "}
                        checkpoints
                      </span>
                    </div>
                  </div>
                )}

                {/* Guide Info */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Eye className="h-4 w-4" />
                      <span>{guide.estimatedReadingTime} min read</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Target className="h-4 w-4" />
                      <span>{guide.sections.length} sections</span>
                    </div>
                  </div>

                  {guide.checkpoints.length > 0 && (
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4" />
                      <span>{guide.checkpoints.length} checkpoints</span>
                    </div>
                  )}
                </div>

                {/* Reading time spent */}
                {progressInfo.totalReadingTime > 0 && (
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Time spent: {progressInfo.totalReadingTime} min</span>
                    <span>Updated: {new Date(guide.lastUpdated).toLocaleDateString()}</span>
                  </div>
                )}

                {/* Action Button */}
                <Button
                  className="w-full"
                  variant={progressInfo.progress >= 100 ? "outline" : "default"}
                >
                  {progressInfo.progress >= 100
                    ? "Review Guide"
                    : progressInfo.hasStarted
                      ? "Continue Reading"
                      : "Start Reading"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredGuides.length === 0 && (
        <Card className="glass">
          <CardContent className="py-8 text-center">
            <FileText className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
            <p className="mb-2 text-lg font-medium">No study guides found</p>
            <p className="text-muted-foreground">Try adjusting your search criteria or filters</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
