/**
 * FilterChip Component
 * Displays an active search filter as a removable chip/tag.
 * Uses logical CSS properties for automatic RTL support.
 */

"use client";

import { X as XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export interface FilterChipProps {
  /** Filter type label (e.g., "Category", "Amount", "Date") */
  type: string;
  /** Filter value to display */
  value: string;
  /** Called when the chip's remove button is clicked */
  onRemove: () => void;
  /** Optional icon to display before the type label */
  icon?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

export function FilterChip({ type, value, onRemove, icon, className }: FilterChipProps) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "inline-flex max-w-[200px] items-center gap-1.5 pe-1 ps-2.5 text-xs font-medium",
        "animate-in fade-in-0 zoom-in-95",
        className
      )}
    >
      {icon && <span className="shrink-0 text-muted-foreground">{icon}</span>}
      <span className="truncate">
        <span className="text-muted-foreground">{type}:</span>{" "}
        <span className="font-semibold">{value}</span>
      </span>
      <button
        onClick={onRemove}
        className="ms-0.5 shrink-0 rounded-sm p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label={`Remove ${type}: ${value} filter`}
      >
        <XIcon className="h-3 w-3" />
      </button>
    </Badge>
  );
}
