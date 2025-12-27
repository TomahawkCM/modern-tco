'use client';

/**
 * Sankey With Accessibility Component (S-030)
 * Wrapper providing toggle between chart and accessible table views.
 */

import { useState, useCallback } from 'react';
import { BarChart3, Table2, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useSeniorsMode } from '@/hooks/useSeniorsMode';
import { SankeyDiagram } from './SankeyDiagram';
import { SankeyAccessibleTable } from './SankeyAccessibleTable';
import type { SankeyData, SankeyNode } from '@/lib/charts/sankey-utils';

type ViewMode = 'chart' | 'table';

interface SankeyWithAccessibilityProps {
  data: SankeyData;
  width?: number;
  height?: number;
  className?: string;
  defaultView?: ViewMode;
  onNodeClick?: (node: SankeyNode) => void;
}

export function SankeyWithAccessibility({
  data,
  width = 800,
  height = 500,
  className,
  defaultView = 'chart',
  onNodeClick,
}: SankeyWithAccessibilityProps) {
  const { isSeniorsMode } = useSeniorsMode();
  const [viewMode, setViewMode] = useState<ViewMode>(defaultView);
  const [showLabels, setShowLabels] = useState(true);

  const handleViewChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);
  }, []);

  return (
    <div
      className={cn('relative', className)}
      role="figure"
      aria-label="Money flow visualization showing income distribution to expense categories and savings"
    >
      {/* View Toggle Controls */}
      <div
        className="flex items-center justify-between mb-4"
        role="toolbar"
        aria-label="Visualization controls"
      >
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'text-slate-400 mr-2',
              isSeniorsMode ? 'text-base' : 'text-sm'
            )}
            id="view-mode-label"
          >
            View:
          </span>
          <div
            className="flex rounded-lg bg-slate-800 p-1"
            role="radiogroup"
            aria-labelledby="view-mode-label"
          >
            <button
              onClick={() => handleViewChange('chart')}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors',
                viewMode === 'chart'
                  ? 'bg-teal-500 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/10',
                isSeniorsMode && 'text-base px-4 py-2'
              )}
              role="radio"
              aria-checked={viewMode === 'chart'}
              aria-label="Chart view"
            >
              <BarChart3 className={cn('h-4 w-4', isSeniorsMode && 'h-5 w-5')} />
              <span className={isSeniorsMode ? 'text-base' : 'text-sm'}>Chart</span>
            </button>
            <button
              onClick={() => handleViewChange('table')}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors',
                viewMode === 'table'
                  ? 'bg-teal-500 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/10',
                isSeniorsMode && 'text-base px-4 py-2'
              )}
              role="radio"
              aria-checked={viewMode === 'table'}
              aria-label="Table view for screen readers"
            >
              <Table2 className={cn('h-4 w-4', isSeniorsMode && 'h-5 w-5')} />
              <span className={isSeniorsMode ? 'text-base' : 'text-sm'}>Table</span>
            </button>
          </div>
        </div>

        {/* Chart-specific controls */}
        {viewMode === 'chart' && (
          <button
            onClick={() => setShowLabels(!showLabels)}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors',
              isSeniorsMode && 'text-base px-4 py-2'
            )}
            aria-pressed={showLabels}
            aria-label={showLabels ? 'Hide labels' : 'Show labels'}
          >
            {showLabels ? (
              <Eye className={cn('h-4 w-4', isSeniorsMode && 'h-5 w-5')} />
            ) : (
              <EyeOff className={cn('h-4 w-4', isSeniorsMode && 'h-5 w-5')} />
            )}
            <span className={isSeniorsMode ? 'text-base' : 'text-sm'}>
              {showLabels ? 'Labels On' : 'Labels Off'}
            </span>
          </button>
        )}
      </div>

      {/* Accessibility announcement for screen readers */}
      <div
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {viewMode === 'chart'
          ? 'Showing interactive chart view. Press Tab to navigate or switch to table view for detailed data.'
          : 'Showing accessible table view with detailed money flow data.'}
      </div>

      {/* View Content */}
      <AnimatePresence mode="wait">
        {viewMode === 'chart' ? (
          <motion.div
            key="chart"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            aria-hidden={false}
          >
            <SankeyDiagram
              data={data}
              width={width}
              height={height}
              onNodeClick={onNodeClick}
            />
          </motion.div>
        ) : (
          <motion.div
            key="table"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            aria-hidden={false}
          >
            <SankeyAccessibleTable data={data} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyboard navigation hint */}
      <p
        className={cn(
          'mt-4 text-center text-slate-500',
          isSeniorsMode ? 'text-sm' : 'text-xs'
        )}
        aria-hidden="true"
      >
        {viewMode === 'chart'
          ? 'Hover over elements for details. Switch to Table view for screen reader accessibility.'
          : 'Use arrow keys to navigate table cells. Switch to Chart view for visual representation.'}
      </p>
    </div>
  );
}

export default SankeyWithAccessibility;
