/**
 * Loading Skeleton Components (Phase 4.1.3)
 * Shimmer loading skeletons to replace spinners
 *
 * Provides better perceived performance with content-aware loading states
 */

export function Skeleton({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`animate-pulse bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-[length:200%_100%] rounded ${className}`}
      style={{
        animation: 'shimmer 1.5s ease-in-out infinite',
        ...style,
      }}
    />
  );
}

/**
 * Dashboard skeleton - Updated to match mobile-optimized layout
 * Features:
 * - 4 metric cards (responsive grid)
 * - Responsive header with mobile-optimized button layout
 * - 2 chart skeletons (desktop: charts, mobile: progress bars)
 * - Matches actual dashboard structure for better perceived performance
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-8 pb-8">
      {/* Responsive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 sm:h-10 w-48" />
          <Skeleton className="h-5 sm:h-6 w-32" />
        </div>
        <div className="flex gap-2 sm:gap-3">
          <Skeleton className="h-12 w-24 sm:w-32 flex-1 sm:flex-initial rounded-lg" />
          <Skeleton className="h-12 w-12 sm:w-24 rounded-lg" />
          <Skeleton className="hidden sm:block h-12 w-24 rounded-lg" />
        </div>
      </div>

      {/* Metric Cards - 4 cards with responsive grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-slate-900/50 border border-white/10 backdrop-blur-sm rounded-xl p-6 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="w-4 h-4 rounded-full" />
            </div>
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>

      {/* Charts Section - 2 charts side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 1: Category Spending */}
        <div className="bg-slate-900/50 border border-white/10 backdrop-blur-sm rounded-xl">
          <div className="p-6 border-b border-white/10 flex items-center gap-4">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
          <div className="p-6">
            {/* Desktop: Pie chart skeleton */}
            <div className="hidden md:flex items-center justify-center h-[300px]">
              <Skeleton className="w-48 h-48 rounded-full" />
            </div>
            {/* Mobile: Progress bars skeleton */}
            <div className="md:hidden space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Skeleton className="w-3 h-3 rounded-full" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-2 w-full rounded-full" />
                  <Skeleton className="h-3 w-20" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chart 2: Income vs Expenses */}
        <div className="bg-slate-900/50 border border-white/10 backdrop-blur-sm rounded-xl">
          <div className="p-6 border-b border-white/10 flex items-center gap-4">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
          <div className="p-6">
            {/* Desktop: Area chart skeleton */}
            <div className="hidden md:flex items-end justify-between gap-2 h-[300px]">
              {[40, 60, 55, 70, 65, 80].map((height, i) => (
                <Skeleton
                  key={i}
                  className="flex-1 rounded-t"
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
            {/* Mobile: Monthly trend bars skeleton */}
            <div className="md:hidden space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-1.5 w-full rounded-full" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-1.5 w-full rounded-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Additional sections placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-slate-900/50 border border-white/10 backdrop-blur-sm rounded-xl">
            <div className="p-6 border-b border-white/10">
              <Skeleton className="h-5 w-32" />
            </div>
            <div className="p-6 space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Transaction list skeleton
 */
export function TransactionListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="bg-slate-900/50 border border-white/10 backdrop-blur-sm rounded-lg overflow-hidden">
      {/* Table header */}
      <div className="bg-slate-800/50 border-b border-white/10 px-6 py-3 flex gap-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-48 flex-1" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-20" />
      </div>

      {/* Table rows */}
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border-b border-white/10 px-6 py-4 flex gap-4 items-center">
          <Skeleton className="h-4 w-24" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  );
}

/**
 * Transaction card skeleton (mobile)
 */
export function TransactionCardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4 p-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-slate-900/50 border border-white/10 backdrop-blur-sm rounded-lg p-4 space-y-4">
          {/* Header */}
          <div className="flex items-start gap-4">
            <Skeleton className="w-5 h-5 rounded flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-6 w-20" />
          </div>

          {/* Body */}
          <div className="flex items-center gap-4">
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="h-3 w-20" />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Skeleton className="h-10 w-20 rounded-lg" />
            <Skeleton className="h-10 w-20 rounded-lg" />
            <Skeleton className="h-10 w-20 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Chart skeleton
 */
export function ChartSkeleton() {
  return (
    <div className="bg-slate-900/50 border border-white/10 backdrop-blur-sm rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>

      <div className="flex items-end justify-between gap-2 h-64">
        {[30, 50, 45, 60, 55, 70, 65, 75, 70, 80, 75, 85].map((height, i) => (
          <Skeleton
            key={i}
            className="flex-1 rounded-t"
            style={{ height: `${height}%` }}
          />
        ))}
      </div>

      <div className="flex justify-between pt-4 border-t border-white/10">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-3 w-16" />
        ))}
      </div>
    </div>
  );
}

/**
 * Budget card skeleton
 */
export function BudgetCardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-slate-900/50 border border-white/10 backdrop-blur-sm rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-2 w-full rounded-full" />
          <div className="flex justify-between text-sm">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Generic card skeleton
 */
export function CardSkeleton() {
  return (
    <div className="bg-slate-900/50 border border-white/10 backdrop-blur-sm rounded-lg p-6 space-y-4">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-4/6" />
    </div>
  );
}

/* Add shimmer animation to global CSS */
export const shimmerAnimation = `
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
`;
