"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AssessmentProvider } from "../../contexts/AssessmentContext";

// Dynamically import heavy components to improve initial page load
const AssessmentGating = dynamic(
  () =>
    import("../../components/AssessmentGating").then((mod) => ({ default: mod.AssessmentGating })),
  {
    loading: () => <AssessmentGatingSkeleton />,
    ssr: false,
  }
);

const AssessmentSession = dynamic(
  () =>
    import("../../components/AssessmentSession").then((mod) => ({
      default: mod.AssessmentSession,
    })),
  {
    loading: () => <AssessmentSessionSkeleton />,
    ssr: false,
  }
);

const ReviewMode = dynamic(
  () => import("../../components/ReviewMode").then((mod) => ({ default: mod.ReviewMode })),
  {
    loading: () => <ReviewModeSkeleton />,
    ssr: false,
  }
);

const AssessmentDashboard = dynamic(
  () =>
    import("../../components/AssessmentDashboard").then((mod) => ({
      default: mod.AssessmentDashboard,
    })),
  {
    loading: () => <DashboardSkeleton />,
    ssr: false,
  }
);

function AssessmentGatingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <Skeleton className="mx-auto h-8 w-64" />
        <Skeleton className="mx-auto h-4 w-96" />
      </div>
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-16 w-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function AssessmentSessionSkeleton() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-6 w-24" />
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-full" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ReviewModeSkeleton() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="space-y-2 text-center">
        <Skeleton className="mx-auto h-8 w-48" />
        <Skeleton className="mx-auto h-4 w-96" />
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="h-12 w-12 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Skeleton className="h-96 w-full" />
    </div>
  );
}

interface AssessmentPageProps {
  searchParams: Promise<{
    mode?: "gating" | "session" | "review" | "dashboard";
    userId?: string;
    moduleId?: string;
    sessionId?: string;
    assessmentId?: string;
  }>;
}

export default async function AssessmentsPage({ searchParams }: AssessmentPageProps) {
  const params = await searchParams;
  const { mode = "gating", userId = "default-user", moduleId, sessionId, assessmentId } = params;

  return (
    <AssessmentProvider>
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={<div className="animate-pulse">Loading...</div>}>
          {mode === "gating" && (
            <AssessmentGating
              userId={userId}
              moduleId={moduleId}
              onAssessmentStart={(config) => {
                // Navigate to assessment session
                const params = new URLSearchParams();
                params.set("mode", "session");
                if (config.userId) params.set("userId", config.userId);
                if (config.moduleId) params.set("moduleId", config.moduleId);
                if (config.assessmentId) params.set("assessmentId", config.assessmentId);
                // Respect basePath when navigating from client components
                const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
                window.location.href = `${base}/assessments?${params.toString()}`;
              }}
              onRequirementClick={(requirement) => {
                // Navigate to specific content based on requirement
                console.log("Requirement clicked:", requirement);
                // Could navigate to specific module, practice area, etc.
              }}
            />
          )}

          {mode === "session" && assessmentId && (
            <AssessmentSession
              assessmentType="practice" // Could be derived from assessmentId
              moduleId={moduleId}
              domainFilter={undefined} // Could be derived from assessment config
              onComplete={(result) => {
                // Navigate to review mode
                const params = new URLSearchParams({
                  mode: "review",
                  userId,
                  moduleId: moduleId || "",
                  sessionId: result.sessionId,
                });
                const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
                window.location.href = `${base}/assessments?${params.toString()}`;
              }}
              onExit={() => {
                // Navigate back to gating
                const params = new URLSearchParams({
                  mode: "gating",
                  userId,
                  moduleId: moduleId || "",
                });
                const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
                window.location.href = `${base}/assessments?${params.toString()}`;
              }}
            />
          )}

          {mode === "review" && sessionId && (
            <ReviewMode
              result={null as any} // TODO: Load from session
              session={null as any} // TODO: Load from sessionId
              onRetakeAssessment={() => {
                // Navigate back to assessment session
                const params = new URLSearchParams();
                params.set("mode", "session");
                if (userId) params.set("userId", userId);
                if (moduleId) params.set("moduleId", moduleId);
                if (assessmentId) params.set("assessmentId", assessmentId);
                const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
                window.location.href = `${base}/assessments?${params.toString()}`;
              }}
              onStartRemediation={(plan) => {
                console.log("Starting remediation:", plan);
                // Could navigate to specific study content
              }}
              onExitReview={() => {
                // Navigate back to gating
                const params = new URLSearchParams({
                  mode: "gating",
                  userId,
                  moduleId: moduleId || "",
                });
                const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
                window.location.href = `${base}/assessments?${params.toString()}`;
              }}
            />
          )}

          {mode === "dashboard" && (
            <AssessmentDashboard
              userId={userId}
              timeRange="30d"
              onTimeRangeChange={(range) => {
                // Update URL with new time range
                const params = new URLSearchParams(window.location.search);
                params.set("timeRange", range);
                window.history.replaceState(
                  {},
                  "",
                  `${window.location.pathname}?${params.toString()}`
                );
              }}
            />
          )}
        </Suspense>
      </div>
    </AssessmentProvider>
  );
}

// Note: metadata export removed since this is now a Client Component
// Next.js will use the default metadata from layout.tsx for this page
