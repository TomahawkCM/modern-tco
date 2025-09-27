"use client";

import * as React from "react";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";
import { cn } from "@/lib/utils";

export { PanelGroup as ResizablePanelGroup, Panel as ResizablePanel };

export function ResizableHandle({ className }: { className?: string }) {
  return (
    <PanelResizeHandle
      className={cn(
        "group relative flex w-px items-center justify-center bg-border/60 transition-colors hover:bg-border",
        "data-[resize-handle-active]:bg-primary",
        className
      )}
    >
      <div
        className={cn(
          "pointer-events-none z-10 h-8 w-1.5 rounded bg-primary/50 opacity-0 transition-opacity",
          "group-hover:opacity-100"
        )}
      />
    </PanelResizeHandle>
  );
}

