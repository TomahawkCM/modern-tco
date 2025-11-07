/**
 * Loading Skeleton Components (Phase 4.1.3)
 * Shimmer loading skeletons to replace spinners
 *
 * Provides better perceived performance with content-aware loading states
 */

export function Skeleton({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] rounded ${className}`}
      style={{
        animation: 'shimmer 1.5s ease-in-out infinite',
        ...style,
      }}
    />
  );
}

/**
 * Dashboard skeleton - 3 metric cards + chart
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <Skeleton className="h-6 w-40" />
        <div className="flex items-end justify-between gap-2 h-64">
          {[40, 60, 55, 70, 65, 80, 75, 85].map((height, i) => (
            <Skeleton
              key={i}
              className="flex-1"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Transaction list skeleton
 */
export function TransactionListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Table header */}
      <div className="bg-gray-50 border-b px-6 py-3 flex gap-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-48 flex-1" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-20" />
      </div>

      {/* Table rows */}
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border-b px-6 py-4 flex gap-4 items-center">
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
        <div key={i} className="bg-white border rounded-lg p-4 space-y-4">
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
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
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

      <div className="flex justify-between pt-4 border-t">
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
        <div key={i} className="bg-white rounded-lg shadow p-6 space-y-4">
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
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
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
