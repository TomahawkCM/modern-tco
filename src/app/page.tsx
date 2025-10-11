'use client';

import { Suspense, lazy } from 'react'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { HeroSection } from '@/components/homepage/HeroSection'
import { QuickActions } from '@/components/homepage/QuickActions'
import { LoadingCard, LoadingSpinner } from '@/components/ui/loading-spinner'

// Lazy load below-the-fold components for better initial load performance
const LearningPath = lazy(() => import('@/components/homepage/LearningPath').then(mod => ({ default: mod.LearningPath })))
const GameificationSection = lazy(() => import('@/components/homepage/GameificationSection').then(mod => ({ default: mod.GameificationSection })))

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
  )
}

function HomepageSkeleton() {
  return (
    <div className="space-y-16">
      {/* Hero Section Skeleton */}
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center space-y-6 animate-pulse">
          <div className="h-4 bg-primary/20 rounded w-48 mx-auto"></div>
          <div className="h-16 bg-gradient-to-r from-primary/20 to-accent/20 rounded w-3/4 mx-auto"></div>
          <div className="h-6 bg-muted rounded w-2/3 mx-auto"></div>
          <div className="flex gap-4 justify-center">
            <div className="h-12 bg-primary/30 rounded w-32"></div>
            <div className="h-12 bg-primary/10 rounded w-32"></div>
          </div>
        </div>
      </div>

      {/* Quick Actions Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-64 bg-card rounded-xl border border-primary/20"></div>
          </div>
        ))}
      </div>

      {/* Learning Path Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-80 bg-card rounded-xl border border-primary/20"></div>
          </div>
        ))}
      </div>

      {/* Gamification Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="animate-pulse">
          <div className="h-96 bg-card rounded-xl border border-primary/20"></div>
        </div>
        <div className="lg:col-span-2 animate-pulse">
          <div className="h-96 bg-card rounded-xl border border-primary/20"></div>
        </div>
        <div className="lg:col-span-3 animate-pulse">
          <div className="h-80 bg-card rounded-xl border border-primary/20"></div>
        </div>
      </div>
    </div>
  )
}
