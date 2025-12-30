import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  hoverEffect?: boolean;
  gradient?: "none" | "subtle" | "strong";
}

export function GlassCard({
  children,
  className,
  hoverEffect = true,
  gradient = "none",
  ...htmlProps
}: GlassCardProps) {
  return (
    <div
      {...htmlProps}
      className={cn(
        "relative overflow-hidden rounded-xl border border-white/10 shadow-xl backdrop-blur-md transition-all duration-300",
        // Base background
        "bg-slate-900/60",
        // Gradient variants
        gradient === "subtle" && "bg-gradient-to-br from-slate-800/60 to-slate-900/60",
        gradient === "strong" && "bg-gradient-to-br from-slate-800/80 to-slate-950/80",
        // Hover effects
        hoverEffect &&
          "hover:-translate-y-1 hover:border-white/20 hover:bg-slate-800/70 hover:shadow-2xl",
        className
      )}
    >
      {/* Glossy reflection effect */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
