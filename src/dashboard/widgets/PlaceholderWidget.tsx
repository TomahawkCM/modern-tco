'use client';

/**
 * Placeholder Widget Component
 *
 * Renders static placeholder widgets (no real data yet)
 * Displays widget title and placeholder message
 */

import { GlassCard } from '@/components/budget/ui/GlassCard';
import type { WidgetConfig } from './types';
import { getWidgetDefinition } from './WidgetRegistry';
import * as Icons from 'lucide-react';

interface PlaceholderWidgetProps {
  config: WidgetConfig;
  showBorders: boolean;
}

export function PlaceholderWidget({ config, showBorders }: PlaceholderWidgetProps) {
  const definition = getWidgetDefinition(config.type);

  if (!definition) {
    return null;
  }

  // Get icon component from lucide-react
  const IconComponent = (Icons as any)[definition.icon];

  // Grid span classes based on size
  const spanClass =
    config.size === 'large'
      ? 'md:col-span-2 lg:col-span-4'
      : config.size === 'medium'
        ? 'md:col-span-2'
        : '';

  return (
    <div className={spanClass}>
      <GlassCard className={`p-6 ${showBorders ? 'border border-white/10' : ''}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-lg bg-teal-500/20 p-2">
            {IconComponent && <IconComponent className="h-5 w-5 text-teal-400" />}
          </div>
          <h3 className="text-lg font-semibold text-white">
            {/* Translation key - will be translated in future */}
            {definition.title.split('.').pop()?.replace(/([A-Z])/g, ' $1').trim()}
          </h3>
        </div>

        <div className="flex items-center justify-center h-48 rounded-lg bg-white/5 border border-white/10">
          <div className="text-center space-y-2">
            <p className="text-sm text-slate-400">
              {definition.title.split('.').pop()?.replace(/([A-Z])/g, ' $1').trim()} data will
              appear here
            </p>
            <p className="text-xs text-slate-500">Connect your accounts to see real data</p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
