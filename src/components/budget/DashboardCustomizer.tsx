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

"use client";

import { Settings, RotateCcw, Eye, EyeOff, GripVertical } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import type { DashboardWidget } from "@/hooks/useDashboardLayout";

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
  const t = useTranslations("dashboardCustomizer");
  const visibleCount = widgets.filter((w) => w.visible).length;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="min-h-[44px] gap-2"
          aria-label={t("ariaLabel")}
        >
          <Settings className="h-4 w-4" />
          <span className="hidden sm:inline">{t("button")}</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{t("title")}</DialogTitle>
          <DialogDescription>
            {t("description")}
            <br />
            <span className="mt-2 block text-sm text-gray-600">
              {t("widgetsVisible", { visible: visibleCount, total: widgets.length })}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Widget Visibility Toggles */}
          <div className="space-y-3">
            <h3 className="mb-3 text-sm font-semibold text-gray-700">{t("widgetVisibility")}</h3>

            {widgets
              .sort((a, b) => a.order - b.order)
              .map((widget) => (
                <div
                  key={widget.id}
                  className={`flex items-start gap-3 rounded-lg border-2 p-3 transition-colors ${
                    widget.visible ? "border-teal-200 bg-teal-50" : "border-gray-200 bg-gray-50"
                  }`}
                >
                  {/* Drag Handle Visual (non-functional in settings) */}
                  <div className="mt-0.5 flex-shrink-0 text-gray-400" aria-hidden="true">
                    <GripVertical className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <Label
                        htmlFor={`widget-${widget.id}`}
                        className="flex-1 cursor-pointer text-sm font-medium text-gray-900"
                      >
                        {widget.name}
                        {widget.isAlwaysVisible && (
                          <span className="ml-2 text-xs text-gray-500">({t("alwaysVisible")})</span>
                        )}
                      </Label>

                      <Switch
                        id={`widget-${widget.id}`}
                        checked={widget.visible}
                        onCheckedChange={() => onToggleWidget(widget.id)}
                        disabled={widget.isAlwaysVisible}
                        aria-label={t("toggleVisibility", { name: widget.name })}
                        className="flex-shrink-0"
                      />
                    </div>

                    <p className="mt-1 text-xs text-gray-600">{widget.description}</p>
                  </div>
                </div>
              ))}
          </div>

          {/* Reordering Instructions */}
          <div className="space-y-2 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-start gap-2">
              <GripVertical className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
              <div>
                <h4 className="mb-1 text-sm font-semibold text-blue-900">{t("reorderTitle")}</h4>
                <p className="text-xs leading-relaxed text-blue-800">{t("reorderDescription")}</p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={onReset}
            className="min-h-[44px] w-full gap-2 sm:w-auto"
          >
            <RotateCcw className="h-4 w-4" />
            {t("resetButton")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
