/**
 * DashboardCustomizer Component
 *
 * Provides UI for customizing dashboard widget visibility and order.
 * Features:
 * - Toggle widget visibility
 * - Drag-and-drop reordering preview
 * - Reset to defaults
 * - Accessible with keyboard navigation
 */

'use client';

import { Settings, RotateCcw, Eye, EyeOff, GripVertical } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import type { DashboardWidget } from '@/hooks/useDashboardLayout';

interface DashboardCustomizerProps {
  widgets: DashboardWidget[];
  onToggleWidget: (widgetId: string) => void;
  onReset: () => void;
}

export function DashboardCustomizer({
  widgets,
  onToggleWidget,
  onReset,
}: DashboardCustomizerProps) {
  const t = useTranslations('dashboardCustomizer');
  const visibleCount = widgets.filter((w) => w.visible).length;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 min-h-[44px]"
          aria-label={t('ariaLabel')}
        >
          <Settings className="w-4 h-4" />
          <span className="hidden sm:inline">{t('button')}</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {t('title')}
          </DialogTitle>
          <DialogDescription>
            {t('description')}
            <br />
            <span className="text-sm text-gray-600 mt-2 block">
              {t('widgetsVisible', { visible: visibleCount, total: widgets.length })}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Widget Visibility Toggles */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              {t('widgetVisibility')}
            </h3>

            {widgets
              .sort((a, b) => a.order - b.order)
              .map((widget) => (
                <div
                  key={widget.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border-2 transition-colors ${
                    widget.visible
                      ? 'border-teal-200 bg-teal-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  {/* Drag Handle Visual (non-functional in settings) */}
                  <div
                    className="flex-shrink-0 mt-0.5 text-gray-400"
                    aria-hidden="true"
                  >
                    <GripVertical className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3">
                      <Label
                        htmlFor={`widget-${widget.id}`}
                        className="text-sm font-medium text-gray-900 cursor-pointer flex-1"
                      >
                        {widget.name}
                        {widget.isAlwaysVisible && (
                          <span className="ml-2 text-xs text-gray-500">
                            ({t('alwaysVisible')})
                          </span>
                        )}
                      </Label>

                      <Switch
                        id={`widget-${widget.id}`}
                        checked={widget.visible}
                        onCheckedChange={() => onToggleWidget(widget.id)}
                        disabled={widget.isAlwaysVisible}
                        aria-label={t('toggleVisibility', { name: widget.name })}
                        className="flex-shrink-0"
                      />
                    </div>

                    <p className="text-xs text-gray-600 mt-1">
                      {widget.description}
                    </p>
                  </div>
                </div>
              ))}
          </div>

          {/* Reordering Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
            <div className="flex items-start gap-2">
              <GripVertical className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-blue-900 mb-1">
                  {t('reorderTitle')}
                </h4>
                <p className="text-xs text-blue-800 leading-relaxed">
                  {t('reorderDescription')}
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onReset}
            className="gap-2 min-h-[44px] w-full sm:w-auto"
          >
            <RotateCcw className="w-4 h-4" />
            {t('resetButton')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
