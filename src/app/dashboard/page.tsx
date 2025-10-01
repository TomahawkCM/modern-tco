"use client";

import { Suspense } from "react";
import { DashboardContent } from "./DashboardContent";

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse space-y-3 rounded-lg border border-white/10 p-4"
          >
            <div className="h-4 w-1/2 rounded bg-slate-200" />
            <div className="h-8 w-3/4 rounded bg-slate-200" />
            <div className="h-2 w-full rounded bg-slate-200" />
          </div>
        ))}
      </div>

      <div>
        <div className="mb-6 h-6 w-1/4 animate-pulse rounded bg-slate-200" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="animate-pulse space-y-4 rounded-lg border border-white/10 p-6"
            >
              <div className="h-5 w-3/4 rounded bg-slate-200" />
              <div className="h-4 w-full rounded bg-slate-200" />
              <div className="h-3 w-2/3 rounded bg-slate-200" />
              <div className="h-8 w-full rounded bg-slate-200" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">TCO Study Dashboard</h1>
        <p className="text-slate-200">
          Master the Tanium Certified Operator certification with interactive learning modules
        </p>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}
