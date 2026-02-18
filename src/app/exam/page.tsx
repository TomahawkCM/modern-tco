"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load ExamSimulator to improve initial page load performance
const ExamSimulator = dynamic(() => import("@/components/exam/ExamSimulator"), {
  loading: () => <ExamSimulatorSkeleton />,
  ssr: false,
});

function ExamSimulatorSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
}

export default function ExamPage() {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-4 text-2xl font-semibold">Exam Simulator</h1>
      <p className="mb-6 text-sm text-slate-600 dark:text-muted-foreground">
        Run a timed mock exam or a shorter practice test using the assessment engine.
      </p>
      <ExamSimulator />
    </main>
  );
}
