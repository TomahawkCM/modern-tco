"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => {
  // Provide default aria-label if none is provided
  const defaultAriaLabel =
    !props["aria-label"] && !props["aria-labelledby"] ? `Progress: ${value ?? 0}%` : undefined;

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full border border-primary/20 bg-card/60 shadow-[0_0_10px_rgba(34,211,238,0.05)]",
        className
      )}
      {...props}
      aria-label={props["aria-label"] || defaultAriaLabel}
    >
      <ProgressPrimitive.Indicator
        className="h-full w-full flex-1 bg-gradient-to-r from-primary to-sky-400 shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all duration-300 ease-out"
        style={{ transform: `translateX(-${100 - (value ?? 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
});
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
