"use client";

import { StudyModuleCard } from "@/components/study/StudyModuleCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useStudyProgress } from "@/hooks/useStudyProgress";
import { studyModulesService } from "@/lib/study-modules";
import type { StudyModuleWithSections } from "@/types/supabase";
import { BookOpen, BookmarkIcon, Clock, LogOut, TrendingUp, Trophy, User } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import LearningProgressTracker from "@/components/learning/LearningProgressTracker";

export function DashboardContent() {
  const { user, signOut } = useAuth();
  const { progress, getOverallStats } = useStudyProgress();
  const { getBookmarksCount, getRecentBookmarks } = useBookmarks();
  const [modules, setModules] = useState<StudyModuleWithSections[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Load study modules
        const studyModules = await studyModulesService.getAllModules();
        setModules(studyModules);

        // Load user stats if authenticated
        if (user) {
          const userStats = await studyModulesService.getUserStats(user.id);
          setStats(userStats);
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const overallStats = getOverallStats();
  const bookmarksCount = getBookmarksCount();
  const recentBookmarks = getRecentBookmarks(3);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  // Calculate module progress
  const moduleProgress = modules.map((module) => {
    const moduleStats = stats?.progressByModule[module.id] || {
      completed: 0,
      total: module.sections?.length || 0,
    };
    const percentage =
      moduleStats.total > 0 ? Math.round((moduleStats.completed / moduleStats.total) * 100) : 0;

    return {
      ...(module as any),
      progress: {
        completed: moduleStats.completed,
        total: moduleStats.total,
        percentage,
      },
    };
  });

  return (
    <div className="w-full space-y-8 pb-12">
      {/* User Info & Sign Out */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">Welcome back!</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">{user?.email}</p>
          </div>
        </div>
        <Button variant="outline" onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 dark:border-blue-800 dark:from-blue-900/20 dark:to-blue-800/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-blue-600 dark:text-blue-400">
              Total Progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-1 text-2xl font-bold text-blue-700 dark:text-blue-300">
              {overallStats.completionRate}%
            </div>
            <Progress value={overallStats.completionRate} className="h-2" />
            <p className="mt-2 text-xs text-blue-600 dark:text-blue-400">
              {overallStats.completed} of {stats?.totalSections || 0} sections
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100 dark:border-green-800 dark:from-green-900/20 dark:to-green-800/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-green-600 dark:text-green-400">
              Completed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-green-600 dark:text-green-400" />
              <span className="text-2xl font-bold text-green-700 dark:text-green-300">
                {overallStats.completed}
              </span>
            </div>
            <p className="mt-2 text-xs text-green-600 dark:text-green-400">Sections mastered</p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100 dark:border-orange-800 dark:from-orange-900/20 dark:to-orange-800/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-orange-600 dark:text-orange-400">
              In Progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              <span className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                {overallStats.inProgress}
              </span>
            </div>
            <p className="mt-2 text-xs text-orange-600 dark:text-orange-400">Currently studying</p>
          </CardContent>
        </Card>

        <Card className="border-cyan-200 bg-gradient-to-br from-cyan-50 to-cyan-100 dark:border-cyan-800 dark:from-cyan-900/20 dark:to-cyan-800/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-cyan-600 dark:text-cyan-400">
              Bookmarks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <BookmarkIcon className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
              <span className="text-2xl font-bold text-cyan-700 dark:text-cyan-300">
                {bookmarksCount}
              </span>
            </div>
            <p className="mt-2 text-xs text-cyan-600 dark:text-cyan-400">Saved for later</p>
          </CardContent>
        </Card>
      </div>

      {/* Learning Progress Tracker */}
      <div className="mb-8">
        <LearningProgressTracker />
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4">
        <Button asChild>
          <Link href="/study">
            <BookOpen className="mr-2 h-4 w-4" />
            Continue Learning
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/bookmarks">
            <BookmarkIcon className="mr-2 h-4 w-4" />
            View Bookmarks
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/progress">
            <TrendingUp className="mr-2 h-4 w-4" />
            Progress Report
          </Link>
        </Button>
      </div>

      {/* Study Modules */}
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            TCO Certification Modules
          </h2>
          <Badge variant="secondary" className="text-sm">
            5 modules • 20 sections
          </Badge>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {moduleProgress.map((module) => (
            <StudyModuleCard key={module.id} module={module} progress={module.progress} />
          ))}
        </div>
      </div>

      {/* Recent Bookmarks */}
      {recentBookmarks.length > 0 && (
        <div>
          <h3 className="mb-4 text-xl font-semibold text-slate-900 dark:text-slate-100">
            Recent Bookmarks
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {recentBookmarks.map((bookmark) => (
              <Card key={bookmark.id} className="transition-shadow hover:shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="line-clamp-2 text-sm font-medium">
                    {bookmark.section?.title || "Untitled Section"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-2 text-xs text-muted-foreground">
                    {bookmark.module?.title || "Unknown Module"}
                  </p>
                  {bookmark.notes && (
                    <p className="line-clamp-2 text-xs text-slate-600 dark:text-slate-400">
                      {bookmark.notes}
                    </p>
                  )}
                  <Button asChild size="sm" className="mt-2 w-full">
                    <Link
                      href={`/study/modules/${bookmark.module_id}/sections/${bookmark.section_id}`}
                    >
                      Continue Reading
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
