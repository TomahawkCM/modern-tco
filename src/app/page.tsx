'use client';

import { GameificationSection } from '@/components/homepage/GameificationSection';
import { HeroSection } from '@/components/homepage/HeroSection';
import { LearningPath } from '@/components/homepage/LearningPath';
import { QuickActions } from '@/components/homepage/QuickActions';
import { Suspense } from 'react';

export default function Home() {
  return (
    <>
      {/* Temporarily disabled for testing particle effects */}
      {/* World-Class Homepage Sections */}
      <Suspense fallback={<HomepageSkeleton />}>
        {/* Hero Section with TCO Mastery Journey Welcome */}
        <HeroSection />

        {/* Quick Actions for Immediate Engagement */}
        <QuickActions />

        {/* Interactive Learning Path with 5 TCO Domains */}
        <LearningPath />

        {/* Gamification - Achievements, Leaderboard, Study Streaks */}
        <GameificationSection />
      </Suspense>
    </>
  );
}

function HomepageSkeleton() {
  return (
    <div className="space-y-16">
      {/* Hero Section Skeleton */}
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="animate-pulse space-y-6 text-center">
          <div className="mx-auto h-4 w-48 rounded bg-primary/20"></div>
          <div className="mx-auto h-16 w-3/4 rounded bg-gradient-to-r from-primary/20 to-accent/20"></div>
          <div className="mx-auto h-6 w-2/3 rounded bg-muted"></div>
          <div className="flex justify-center gap-4">
            <div className="h-12 w-32 rounded bg-primary/30"></div>
            <div className="h-12 w-32 rounded bg-primary/10"></div>
          </div>
        </div>
      </div>

      {/* Quick Actions Skeleton */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-64 rounded-xl border border-primary/20 bg-card"></div>
          </div>
        ))}
      </div>

      {/* Learning Path Skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-80 rounded-xl border border-primary/20 bg-card"></div>
          </div>
        ))}
      </div>

      {/* Gamification Skeleton */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="animate-pulse">
          <div className="h-96 rounded-xl border border-primary/20 bg-card"></div>
        </div>
        <div className="animate-pulse lg:col-span-2">
          <div className="h-96 rounded-xl border border-primary/20 bg-card"></div>
        </div>
        <div className="animate-pulse lg:col-span-3">
          <div className="h-80 rounded-xl border border-primary/20 bg-card"></div>
        </div>
      </div>
    </div>
  );
}
