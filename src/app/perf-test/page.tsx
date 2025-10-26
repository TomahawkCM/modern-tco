import { Suspense, lazy } from 'react'
import { HeroSection } from '@/components/homepage/HeroSection'
import { QuickActions } from '@/components/homepage/QuickActions'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

// Lazy load below-the-fold components for performance testing
const LearningPath = lazy(() => import('@/components/homepage/LearningPath').then(mod => ({ default: mod.LearningPath })))
const GameificationSection = lazy(() => import('@/components/homepage/GameificationSection').then(mod => ({ default: mod.GameificationSection })))

export default function PerfTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 p-4 bg-primary/10 border border-primary/20 rounded-lg">
          <h1 className="text-2xl font-bold text-primary">Performance Test Page</h1>
          <p className="text-sm text-muted-foreground mt-2">
            This is a public page for Lighthouse performance testing.
            It includes all optimized components without authentication.
          </p>
        </div>

        <Suspense fallback={<LoadingSpinner />}>
          {/* Hero Section - Above the fold, eagerly loaded */}
          <HeroSection />

          {/* Quick Actions - Above the fold, eagerly loaded */}
          <QuickActions />

          {/* Learning Path - Below the fold, lazy loaded */}
          <div className="mt-16">
            <LearningPath />
          </div>

          {/* Gamification Section - Below the fold, lazy loaded */}
          <div className="mt-16">
            <GameificationSection />
          </div>
        </Suspense>

        <div className="mt-16 p-4 bg-[#22c55e]/10 border border-[#22c55e]/20 rounded-lg">
          <h2 className="text-lg font-semibold text-[#22c55e]">Optimizations Active:</h2>
          <ul className="text-sm text-muted-foreground mt-2 space-y-1">
            <li>✅ Lazy loading for below-the-fold components</li>
            <li>✅ Optimized package imports (20+ packages)</li>
            <li>✅ Self-hosted fonts with preloading</li>
            <li>✅ Advanced webpack bundle splitting</li>
            <li>✅ External domain preconnects</li>
            <li>✅ CSS optimization enabled</li>
          </ul>
        </div>
      </div>
    </div>
  )
}