'use client';

/**
 * CalculatorCard Component
 *
 * Card for the calculator hub page
 */

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

interface CalculatorCardProps {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  color?: 'teal' | 'blue' | 'purple' | 'orange' | 'green';
  className?: string;
}

export function CalculatorCard({
  title,
  description,
  href,
  icon,
  color = 'teal',
  className,
}: CalculatorCardProps) {
  const colorStyles = {
    teal: {
      gradient: 'from-teal-500/20 to-teal-600/10',
      border: 'hover:border-teal-500/50',
      iconBg: 'bg-teal-500/20',
      iconText: 'text-teal-400',
    },
    blue: {
      gradient: 'from-blue-500/20 to-blue-600/10',
      border: 'hover:border-blue-500/50',
      iconBg: 'bg-blue-500/20',
      iconText: 'text-blue-400',
    },
    purple: {
      gradient: 'from-purple-500/20 to-purple-600/10',
      border: 'hover:border-purple-500/50',
      iconBg: 'bg-purple-500/20',
      iconText: 'text-purple-400',
    },
    orange: {
      gradient: 'from-orange-500/20 to-orange-600/10',
      border: 'hover:border-orange-500/50',
      iconBg: 'bg-orange-500/20',
      iconText: 'text-orange-400',
    },
    green: {
      gradient: 'from-green-500/20 to-green-600/10',
      border: 'hover:border-green-500/50',
      iconBg: 'bg-green-500/20',
      iconText: 'text-green-400',
    },
  };

  const styles = colorStyles[color];

  return (
    <Link
      href={href}
      className={cn(
        'group relative block overflow-hidden rounded-xl',
        'bg-slate-800/50 border border-slate-700',
        'transition-all duration-300',
        'hover:bg-slate-800/80',
        styles.border,
        className
      )}
    >
      {/* Gradient overlay */}
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity',
          styles.gradient
        )}
      />

      <div className="relative p-6">
        {/* Icon */}
        <div
          className={cn(
            'inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4',
            styles.iconBg
          )}
        >
          <span className={cn('w-6 h-6', styles.iconText)}>{icon}</span>
        </div>

        {/* Content */}
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <p className="text-sm text-slate-400 line-clamp-2">{description}</p>

        {/* Arrow */}
        <div className="mt-4 flex items-center gap-2 text-sm font-medium text-slate-400 group-hover:text-white transition-colors">
          <span>Open calculator</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}

export default CalculatorCard;
