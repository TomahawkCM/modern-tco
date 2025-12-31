"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import React from "react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  desc: string;
  color: string;
  bg: string;
  className?: string;
  visual?: React.ReactNode;
}

export const FeatureCard = ({
  icon: Icon,
  title,
  desc,
  color,
  bg,
  className,
  visual,
}: FeatureCardProps) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/5 bg-white/5 p-8 transition-all hover:border-teal-500/30 hover:bg-slate-800/50 hover:shadow-2xl hover:shadow-teal-500/10 ${className || ""}`}
    >
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-teal-500/0 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      {/* Visual Content for larger cards */}
      {visual && <div className="relative mb-4 w-full flex-1">{visual}</div>}

      <div>
        <div className={`mb-4 inline-flex rounded-xl p-3 ${bg} w-fit`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
        <h3 className="mb-2 text-xl font-bold text-white">{title}</h3>
        <p className="text-sm text-slate-400">{desc}</p>
      </div>
    </motion.div>
  );
};
