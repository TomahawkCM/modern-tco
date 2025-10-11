"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function QuestionCardSkeleton() {
  return (
    <Card className="question-card mx-auto w-full max-w-4xl">
      <CardHeader>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-16" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-12" />
          </div>
        </div>

        <Skeleton className="mb-2 h-6 w-full" />
        <Skeleton className="h-6 w-3/4" />
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-3 rounded-lg border p-4">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 flex-1" />
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardCardSkeleton() {
  return (
    <Card className="glass border-white/10">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="mb-1 h-8 w-16" />
        <Skeleton className="h-3 w-20" />
      </CardContent>
    </Card>
  );
}

export function SidebarSkeleton() {
  return (
    <div className="glass h-full border-r border-white/10 backdrop-blur-md">
      <div className="flex h-full flex-col">
        {/* Profile section skeleton */}
        <div className="p-4">
          <div className="glass rounded-lg p-3">
            <div className="flex items-center space-x-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>

            <div className="mt-3">
              <div className="mb-1 flex justify-between text-xs">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-8" />
              </div>
              <Skeleton className="h-2 w-full" />
            </div>
          </div>
        </div>

        {/* Navigation skeleton */}
        <nav className="flex-1 px-4 pb-4">
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>

          <div className="my-4">
            <Skeleton className="h-px w-full" />
          </div>

          {/* Domain progress skeleton */}
          <div className="space-y-3">
            <Skeleton className="h-4 w-24 px-2" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between px-2 text-xs">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-8" />
                </div>
                <Skeleton className="h-1.5 w-full" />
              </div>
            ))}
          </div>

          <div className="mt-4">
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        </nav>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-4">
      {/* Table header */}
      <div className="flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>

      {/* Table rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex items-center gap-4">
          {Array.from({ length: cols }).map((_, colIndex) => (
            <div key={colIndex} className="flex-1">
              {colIndex === 0 ? (
                <Skeleton className="h-4 w-20" />
              ) : colIndex === cols - 1 ? (
                <Skeleton className="h-8 w-8 rounded" />
              ) : (
                <Skeleton className="h-4 w-full" />
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export function ExamModeSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="glass border-white/10">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Skeleton className="h-12 w-12 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function ProgressChartSkeleton() {
  return (
    <Card className="glass border-white/10">
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-8" />
            </div>
            <Skeleton className="h-2 w-full" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function LoadingSpinner({
  size = "default",
  className,
}: {
  size?: "small" | "default" | "large";
  className?: string;
}) {
  const sizeClasses = {
    small: "h-4 w-4",
    default: "h-6 w-6",
    large: "h-8 w-8",
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div
        className={cn(
          "animate-spin rounded-full border-2 border-gray-300 border-t-white",
          sizeClasses[size]
        )}
      />
    </div>
  );
}

export function LoadingOverlay({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="glass space-y-4 rounded-2xl border border-white/20 p-6 text-center">
        <LoadingSpinner size="large" />
        <p className="font-medium text-foreground">{message}</p>
      </div>
    </div>
  );
}

export function PageLoadingSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header skeleton */}
      <div className="space-y-4 text-center">
        <Skeleton className="mx-auto h-10 w-80" />
        <Skeleton className="mx-auto h-6 w-96" />
      </div>

      {/* Stats cards skeleton */}
      <div className="grid gap-6 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <DashboardCardSkeleton key={i} />
        ))}
      </div>

      {/* Content sections skeleton */}
      <ExamModeSkeleton />

      {/* Sample question skeleton */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-6 w-32" />
        </div>
        <QuestionCardSkeleton />
      </div>

      {/* Activity cards skeleton */}
      <div className="grid gap-4 md:grid-cols-2">
        <ProgressChartSkeleton />
        <ProgressChartSkeleton />
      </div>
    </div>
  );
}
