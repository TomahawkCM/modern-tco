'use client';

import { motion } from "framer-motion";
import { useTranslations } from 'next-intl';

export function LogoMarquee() {
  const t = useTranslations('landing.marquee');
  const logos = t.raw('logos') as string[];
  const row = [...logos, ...logos];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#070A12] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#070A12] to-transparent" />

      <motion.div
        className="flex items-center gap-4 py-4"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 18, ease: "linear", repeat: Infinity }}
        style={{ width: "200%" }}
      >
        {row.map((name, idx) => (
          <div
            key={`${name}-${idx}`}
            className="flex items-center gap-3 whitespace-nowrap rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-slate-200"
          >
            <span className="h-2 w-2 rounded-full bg-teal-400/80" />
            {name}
          </div>
        ))}
      </motion.div>
    </div>
  );
}


