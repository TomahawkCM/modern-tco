import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function AuroraBackground({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)}>
      {/* Base */}
      <div className="absolute inset-0 bg-[#070A12]" />

      {/* Subtle grid + noise */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.10]" />
      <div className="absolute inset-0 opacity-[0.06] mix-blend-overlay [background-image:radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]" />

      {/* Aurora / light fields */}
      <motion.div
        aria-hidden="true"
        className="absolute -start-1/4 top-[-25%] h-[520px] w-[520px] rounded-full blur-[120px]"
        style={{
          background: "radial-gradient(closest-side, rgba(20,184,166,0.55), rgba(20,184,166,0))",
        }}
        animate={{
          x: [0, 40, -10, 0],
          y: [0, 25, -15, 0],
        }}
        transition={{ duration: 14, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" }}
      />
      <motion.div
        aria-hidden="true"
        className="absolute -end-1/4 bottom-[-30%] h-[620px] w-[620px] rounded-full blur-[140px]"
        style={{
          background: "radial-gradient(closest-side, rgba(99,102,241,0.35), rgba(99,102,241,0))",
        }}
        animate={{
          x: [0, -30, 20, 0],
          y: [0, -20, 15, 0],
        }}
        transition={{ duration: 18, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" }}
      />
      <motion.div
        aria-hidden="true"
        className="absolute start-[20%] top-[35%] h-[420px] w-[420px] rounded-full blur-[130px]"
        style={{
          background: "radial-gradient(closest-side, rgba(236,72,153,0.18), rgba(236,72,153,0))",
        }}
        animate={{ x: [0, 20, -20, 0] }}
        transition={{ duration: 22, ease: "easeInOut", repeat: Infinity }}
      />

      {/* Vignette */}
      <div className="absolute inset-0 bg-black/60 [mask-image:radial-gradient(70%_60%_at_50%_35%,black,transparent)]" />
    </div>
  );
}
