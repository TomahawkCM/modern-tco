import { cn } from "@/lib/utils";

export function LandingCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] shadow-[0_30px_90px_-60px_rgba(0,0,0,0.95)]",
        "transition-all duration-300 hover:border-white/15 hover:bg-white/[0.045]",
        className
      )}
    >
      {/* subtle shine */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute -start-24 -top-24 h-64 w-64 rounded-full bg-gradient-to-br from-teal-400/25 via-cyan-400/10 to-indigo-400/20 blur-2xl" />
      </div>
      <div className="relative">{children}</div>
    </div>
  );
}
