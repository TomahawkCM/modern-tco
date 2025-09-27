import { Suspense } from 'react'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { StudyModuleCard } from '@/components/study/StudyModuleCard'
import { LoadingCard, LoadingSpinner } from '@/components/ui/loading-spinner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BookOpen, Clock, Trophy, BookmarkIcon, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { DashboardContent } from './DashboardContent'

export default function DashboardPage() {
  return (
    <>
      {/* Temporarily disabled for testing particle effects */}
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            TCO Study Dashboard
          </h1>
          <p className="text-slate-200">
            Master the Tanium Certified Operator certification with interactive learning modules
          </p>
        </div>

        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardContent />
        </Suspense>
      
    </>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Progress Overview Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-slate-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-slate-200 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Study Modules Skeleton */}
      <div>
        <div className="h-6 bg-slate-200 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-5 bg-slate-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-full"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-3 bg-slate-200 rounded w-full"></div>
                  <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                  <div className="h-8 bg-slate-200 rounded w-full"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
