'use client';

/**
 * Widget Grid Component
 *
 * Responsive grid layout for dashboard widgets
 * Adapts column count based on device class
 */

import type { WidgetConfig, GridConfig } from './types';
import { PlaceholderWidget } from './PlaceholderWidget';

interface WidgetGridProps {
  widgets: WidgetConfig[];
  gridConfig: GridConfig;
}

export function WidgetGrid({ widgets, gridConfig }: WidgetGridProps) {
  // Sort widgets by order
  const sortedWidgets = [...widgets]
    .filter((w) => w.visible)
    .sort((a, b) => a.order - b.order);

  // Generate grid class based on columns
  const gridClass = `grid grid-cols-1 ${gridConfig.gap} ${
    gridConfig.columns === 2
      ? 'md:grid-cols-2'
      : gridConfig.columns === 4
        ? 'md:grid-cols-2 lg:grid-cols-4'
        : ''
  }`;

  return (
    <div className={gridClass}>
      {sortedWidgets.map((widget) => (
        <PlaceholderWidget
          key={widget.id}
          config={widget}
          showBorders={gridConfig.showBorders}
        />
      ))}
    </div>
  );
}
