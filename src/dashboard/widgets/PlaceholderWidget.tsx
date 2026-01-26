"use client";

/**
 * Placeholder Widget Component
 *
 * Renders static placeholder widgets (no real data yet)
 * Displays widget title and placeholder message
 */

import { GlassCard } from "@/components/budget/ui/GlassCard";
import * as Icons from "lucide-react";
import { getWidgetDefinition } from "./WidgetRegistry";
import type { WidgetConfig } from "./types";

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
    config.size === "large"
      ? "md:col-span-2 lg:col-span-4"
      : config.size === "medium"
        ? "md:col-span-2"
        : "";

  const widgetTitle =
    definition.title
      .split(".")
      .pop()
      ?.replace(/([A-Z])/g, " $1")
      .trim() || "Widget";
  const widgetId = `widget-${config.type}`;

  return (
    <div className={spanClass}>
      <GlassCard
        className={`p-6 ${showBorders ? "border border-white/10" : ""}`}
        role="region"
        aria-labelledby={widgetId}
      >
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-lg bg-teal-500/20 p-2" aria-hidden="true">
            {IconComponent && <IconComponent className="h-5 w-5 text-teal-400" />}
          </div>
          <h3 id={widgetId} className="text-lg font-semibold text-white">
            {/* Translation key - will be translated in future */}
            {widgetTitle}
          </h3>
        </div>

        <div
          className="flex h-48 items-center justify-center rounded-lg border border-white/10 bg-white/5"
          role="status"
          aria-label={`${widgetTitle} placeholder: No data available yet`}
        >
          <div className="space-y-2 text-center">
            <p className="text-sm text-slate-400">{widgetTitle} data will appear here</p>
            <p className="text-xs text-slate-500">Connect your accounts to see real data</p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
