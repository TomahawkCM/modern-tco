"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Video, Play, CheckCircle2, Clock, TrendingUp } from "lucide-react";
import {
  getVideoAnalytics,
  getVideoCompletionByModule,
  type VideoAnalyticsSummary,
} from "@/lib/videoAnalytics";

interface VideoAnalyticsDashboardProps {
  /** Optional module slug to filter analytics */
  moduleSlug?: string;
  /** Custom className */
  className?: string;
}

/**
 * Video Analytics Dashboard
 *
 * Displays comprehensive video watch analytics and progress
 *
 * Research: Video learning increases engagement by 60% (Mayer, 2021)
 */
export function VideoAnalyticsDashboard({
  moduleSlug,
  className,
}: VideoAnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<VideoAnalyticsSummary | null>(null);
  const [moduleCompletion, setModuleCompletion] = useState<Record<string, any>>({});

  useEffect(() => {
    loadAnalytics();

    // Listen for video progress updates
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "video-progress") {
        loadAnalytics();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [moduleSlug]);

  function loadAnalytics() {
    const data = getVideoAnalytics(moduleSlug);
    setAnalytics(data);

    const completion = getVideoCompletionByModule();
    setModuleCompletion(completion);
  }

  if (!analytics) {
    return (
      <Card className={className}>
        <CardContent className="py-12 text-center">
          <p className="text-gray-400">Loading video analytics...</p>
        </CardContent>
      </Card>
    );
  }

  if (analytics.totalVideos === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5 text-purple-500" />
            Video Analytics
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-12">
          <Video className="mx-auto mb-4 h-16 w-16 text-gray-600 opacity-50" />
          <p className="text-gray-400 mb-2">No videos watched yet</p>
          <p className="text-sm text-gray-500">
            Start watching videos to see your progress here
          </p>
        </CardContent>
      </Card>
    );
  }

  const getCompletionColor = (rate: number) => {
    if (rate >= 80) return "text-green-400";
    if (rate >= 60) return "text-blue-400";
    if (rate >= 40) return "text-yellow-400";
    return "text-orange-400";
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Summary Card */}
      <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-blue-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5 text-purple-500" />
            Video Learning Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Video className="h-4 w-4 text-blue-400" />
                <span className="text-xs text-gray-400">Videos Watched</span>
              </div>
              <div className="text-3xl font-bold text-blue-400">{analytics.totalVideos}</div>
            </div>

            <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                <span className="text-xs text-gray-400">Completed</span>
              </div>
              <div className="text-3xl font-bold text-green-400">{analytics.videosCompleted}</div>
            </div>

            <div className="rounded-lg border border-purple-500/20 bg-purple-500/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-purple-400" />
                <span className="text-xs text-gray-400">Watch Time</span>
              </div>
              <div className="text-3xl font-bold text-purple-400">
                {analytics.totalWatchTime.toFixed(1)}h
              </div>
            </div>

            <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-yellow-400" />
                <span className="text-xs text-gray-400">Completion Rate</span>
              </div>
              <div className={`text-3xl font-bold ${getCompletionColor(analytics.completionRate)}`}>
                {Math.round(analytics.completionRate)}%
              </div>
            </div>
          </div>

          {/* Overall Completion Progress */}
          <div>
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-gray-400">Overall Video Completion</span>
              <span className={getCompletionColor(analytics.completionRate)}>
                {analytics.videosCompleted} / {analytics.totalVideos}
              </span>
            </div>
            <Progress value={analytics.completionRate} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Module Completion Breakdown */}
      {!moduleSlug && Object.keys(moduleCompletion).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Play className="h-5 w-5 text-blue-400" />
              Video Completion by Module
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(moduleCompletion)
              .filter(([module]) => module !== "unknown")
              .map(([module, stats]) => (
                <div key={module} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300 capitalize">
                      {module.replace(/-/g, " ")}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {stats.completed} / {stats.total}
                      </span>
                      <Badge
                        variant="outline"
                        className={getCompletionColor(stats.percentage)}
                      >
                        {Math.round(stats.percentage)}%
                      </Badge>
                    </div>
                  </div>
                  <Progress value={stats.percentage} className="h-1" />
                </div>
              ))}
          </CardContent>
        </Card>
      )}

      {/* Recent Videos */}
      {analytics.recentVideos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-5 w-5 text-gray-400" />
              Recently Watched
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {analytics.recentVideos.slice(0, 5).map((video, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded border border-gray-700/50 bg-gray-800/30 p-3"
              >
                <div className="flex-1">
                  <div className="text-sm text-gray-300 mb-1">{video.title}</div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>{new Date(video.lastWatched).toLocaleDateString()}</span>
                    {video.moduleSlug && (
                      <>
                        <span>•</span>
                        <span className="capitalize">{video.moduleSlug.replace(/-/g, " ")}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {video.completed ? (
                    <Badge variant="outline" className="text-green-400 border-green-400">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Complete
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-blue-400 border-blue-400">
                      {Object.entries(video.milestones)
                        .reverse()
                        .find(([_, reached]) => reached)?.[0] || "0"}%
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Most Watched Videos */}
      {analytics.mostWatched.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-5 w-5 text-orange-400" />
              Most Watched Videos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {analytics.mostWatched.slice(0, 5).map((video, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded border border-gray-700/50 bg-gray-800/30 p-3"
              >
                <div className="flex-1">
                  <div className="text-sm text-gray-300 mb-1">{video.title}</div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>{video.viewCount} views</span>
                    <span>•</span>
                    <span>{Math.round(video.totalWatchTime / 60)} min total</span>
                  </div>
                </div>
                {video.completed && (
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default VideoAnalyticsDashboard;
