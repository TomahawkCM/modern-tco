'use client';

/**
 * Health Score Widget Component (H-020)
 * Circular gauge displaying the user's financial health score
 */

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import {
  type HealthScoreResult,
  getGradeColor,
  getScoreInterpretation,
} from '@/lib/analytics/health-score';
import { useSeniorsMode } from '@/hooks/useSeniorsMode';

interface HealthScoreWidgetProps {
  result: HealthScoreResult | null;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showGrade?: boolean;
  className?: string;
  onClick?: () => void;
}

export function HealthScoreWidget({
  result,
  size = 'md',
  showLabel = true,
  showGrade = true,
  className,
  onClick,
}: HealthScoreWidgetProps) {
  const t = useTranslations('healthScore');
  const { isSeniorsMode } = useSeniorsMode();

  // Size configurations
  const sizeConfig = {
    sm: { width: 100, strokeWidth: 8, fontSize: 24, labelSize: 10 },
    md: { width: 160, strokeWidth: 12, fontSize: 36, labelSize: 12 },
    lg: { width: 220, strokeWidth: 16, fontSize: 48, labelSize: 14 },
  };

  const config = isSeniorsMode
    ? { ...sizeConfig[size], width: sizeConfig[size].width * 1.2, fontSize: sizeConfig[size].fontSize * 1.2 }
    : sizeConfig[size];

  // Calculate gauge properties
  const { score, color, circumference, dashOffset, interpretation } = useMemo(() => {
    const normalizedScore = result?.normalizedScore ?? 0;
    const radius = (config.width - config.strokeWidth) / 2;
    const circ = 2 * Math.PI * radius;

    // Calculate color based on score
    let scoreColor: string;
    if (normalizedScore >= 80) {
      scoreColor = '#22c55e'; // green-500
    } else if (normalizedScore >= 60) {
      scoreColor = '#eab308'; // yellow-500
    } else if (normalizedScore >= 40) {
      scoreColor = '#f97316'; // orange-500
    } else {
      scoreColor = '#ef4444'; // red-500
    }

    // Calculate dash offset for progress (start from top, 270 degrees = 75%)
    const progress = normalizedScore / 100;
    const offset = circ * (1 - progress * 0.75); // 0.75 for 270-degree arc

    return {
      score: normalizedScore,
      color: scoreColor,
      circumference: circ,
      dashOffset: offset,
      interpretation: result ? getScoreInterpretation(result.normalizedScore) : 'No data',
    };
  }, [result, config.width, config.strokeWidth]);

  const radius = (config.width - config.strokeWidth) / 2;
  const center = config.width / 2;

  // Empty state
  if (!result) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center rounded-xl bg-slate-800/50 border border-white/10 p-4',
          className
        )}
        style={{ width: config.width + 32, height: config.width + (showLabel ? 48 : 32) }}
      >
        <div className="text-slate-400 text-center">
          <p className="text-sm">{t('emptyState.line1')}</p>
          <p className="text-sm font-medium">{t('emptyState.line2')}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center cursor-pointer transition-transform hover:scale-105',
        className
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={t('ariaLabel', { score: score.toFixed(0), interpretation })}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick?.();
        }
      }}
    >
      {/* Gauge Container */}
      <div className="relative" style={{ width: config.width, height: config.width }}>
        <svg
          width={config.width}
          height={config.width}
          className="transform -rotate-[135deg]"
          aria-hidden="true"
        >
          {/* Background arc */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth={config.strokeWidth}
            strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
            strokeLinecap="round"
          />

          {/* Progress arc */}
          <motion.circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={config.strokeWidth}
            strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference * 0.75 }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
          />

          {/* Glow effect */}
          <motion.circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={config.strokeWidth + 4}
            strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
            strokeLinecap="round"
            opacity={0.2}
            filter="blur(8px)"
            initial={{ strokeDashoffset: circumference * 0.75 }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {/* Score number */}
          <motion.span
            className="font-bold text-white"
            style={{ fontSize: config.fontSize }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            {Math.round(score)}
          </motion.span>

          {/* Grade */}
          {showGrade && result.grade && (
            <motion.span
              className="font-semibold"
              style={{
                color: getGradeColor(result.grade),
                fontSize: config.labelSize + 2,
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.8 }}
            >
              {t('grade', { grade: result.grade })}
            </motion.span>
          )}
        </div>
      </div>

      {/* Label */}
      {showLabel && (
        <motion.div
          className="mt-2 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <p className="text-sm font-medium text-white">{t('title')}</p>
          <p className="text-xs text-slate-400">{interpretation}</p>
        </motion.div>
      )}

      {/* Missing factors indicator */}
      {result.missingFactors.length > 0 && (
        <motion.p
          className="mt-1 text-xs text-slate-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          {t('missingFactors', { count: result.missingFactors.length })}
        </motion.p>
      )}
    </div>
  );
}

export default HealthScoreWidget;
