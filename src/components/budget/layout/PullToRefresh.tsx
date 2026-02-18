"use client";

import { RefreshCw } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { useTranslations } from "next-intl";

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  threshold?: number;
  enabled?: boolean;
}

export function PullToRefresh({
  onRefresh,
  children,
  threshold = 80,
  enabled = true,
}: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef(0);
  const pullDistanceRef = useRef(0);
  const t = useTranslations("pullToRefresh");

  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    await onRefresh();
    setTimeout(() => {
      setIsRefreshing(false);
      setPullDistance(0);
      pullDistanceRef.current = 0;
    }, 500);
  }, [isRefreshing, onRefresh]);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!enabled || isRefreshing) return;
      const el = containerRef.current;
      if (el && el.scrollTop === 0) {
        startYRef.current = e.touches[0].clientY;
        pullDistanceRef.current = 0;
      }
    },
    [enabled, isRefreshing]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!enabled || isRefreshing || startYRef.current === 0) return;
      const currentY = e.touches[0].clientY;
      const distance = Math.max(0, currentY - startYRef.current);
      if (distance > 0 && distance < 120) {
        pullDistanceRef.current = distance;
        setPullDistance(distance);
      }
    },
    [enabled, isRefreshing]
  );

  const handleTouchEnd = useCallback(() => {
    if (!enabled || startYRef.current === 0) return;
    if (pullDistanceRef.current > threshold) {
      void handleRefresh();
    } else {
      setPullDistance(0);
      pullDistanceRef.current = 0;
    }
    startYRef.current = 0;
  }, [enabled, threshold, handleRefresh]);

  return (
    <div
      ref={containerRef}
      className="relative md:hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull-to-refresh indicator */}
      {(pullDistance > 0 || isRefreshing) && (
        <div
          className="absolute end-0 start-0 top-0 z-10 flex items-center justify-center py-4 transition-opacity"
          style={{
            transform: `translateY(-${isRefreshing ? 0 : Math.max(0, 50 - pullDistance)}px)`,
            opacity: Math.min(1, pullDistance / threshold),
          }}
        >
          <RefreshCw className={`h-6 w-6 text-teal-400 ${isRefreshing ? "animate-spin" : ""}`} />
          {!isRefreshing && pullDistance > threshold && (
            <span className="ms-2 text-sm font-medium text-teal-400">{t("release")}</span>
          )}
          {!isRefreshing && pullDistance > 0 && pullDistance <= threshold && (
            <span className="ms-2 text-sm text-slate-400">{t("pull")}</span>
          )}
        </div>
      )}

      <div style={{ marginTop: pullDistance > 0 ? `${Math.min(pullDistance, 100)}px` : 0 }}>
        {children}
      </div>
    </div>
  );
}
