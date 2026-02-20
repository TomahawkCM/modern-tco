"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700/50 bg-slate-900/20 p-8 text-center",
        className
      )}
    >
      {Icon && (
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-slate-800/50 ring-1 ring-white/10">
          <Icon className="h-8 w-8 text-slate-400" />
        </div>
      )}

      <h3 className="mb-2 text-xl font-semibold text-slate-200">{title}</h3>
      <p className="mb-8 max-w-sm text-sm leading-relaxed text-slate-400">{description}</p>

      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          className="rounded-xl bg-teal-600 px-6 font-medium text-white shadow-lg shadow-teal-900/20 transition-all hover:bg-teal-500 active:scale-95"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
