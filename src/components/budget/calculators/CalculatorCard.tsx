"use client";

/**
 * CalculatorCard Component
 *
 * Card for the calculator hub page
 */

import Link from "next/link";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

interface CalculatorCardProps {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  color?:
    | "teal"
    | "blue"
    | "purple"
    | "orange"
    | "green"
    | "red"
    | "indigo"
    | "amber"
    | "rose"
    | "slate";
  className?: string;
}

export function CalculatorCard({
  title,
  description,
  href,
  icon,
  color = "teal",
  className,
}: CalculatorCardProps) {
  const t = useTranslations("calculators");
  const colorStyles = {
    teal: {
      gradient: "from-teal-500/20 to-teal-600/10",
      border: "hover:border-teal-500/50",
      iconBg: "bg-teal-500/20",
      iconText: "text-teal-400",
    },
    blue: {
      gradient: "from-blue-500/20 to-blue-600/10",
      border: "hover:border-blue-500/50",
      iconBg: "bg-blue-500/20",
      iconText: "text-blue-400",
    },
    purple: {
      gradient: "from-purple-500/20 to-purple-600/10",
      border: "hover:border-purple-500/50",
      iconBg: "bg-purple-500/20",
      iconText: "text-purple-400",
    },
    orange: {
      gradient: "from-orange-500/20 to-orange-600/10",
      border: "hover:border-orange-500/50",
      iconBg: "bg-orange-500/20",
      iconText: "text-orange-400",
    },
    green: {
      gradient: "from-green-500/20 to-green-600/10",
      border: "hover:border-green-500/50",
      iconBg: "bg-green-500/20",
      iconText: "text-green-400",
    },
    red: {
      gradient: "from-red-500/20 to-red-600/10",
      border: "hover:border-red-500/50",
      iconBg: "bg-red-500/20",
      iconText: "text-red-400",
    },
    indigo: {
      gradient: "from-indigo-500/20 to-indigo-600/10",
      border: "hover:border-indigo-500/50",
      iconBg: "bg-indigo-500/20",
      iconText: "text-indigo-400",
    },
    amber: {
      gradient: "from-amber-500/20 to-amber-600/10",
      border: "hover:border-amber-500/50",
      iconBg: "bg-amber-500/20",
      iconText: "text-amber-400",
    },
    rose: {
      gradient: "from-rose-500/20 to-rose-600/10",
      border: "hover:border-rose-500/50",
      iconBg: "bg-rose-500/20",
      iconText: "text-rose-400",
    },
    slate: {
      gradient: "from-slate-500/20 to-slate-600/10",
      border: "hover:border-slate-500/50",
      iconBg: "bg-slate-500/20",
      iconText: "text-slate-400",
    },
  };

  const styles = colorStyles[color];

  return (
    <Link
      href={href}
      className={cn(
        "group relative block overflow-hidden rounded-xl",
        "border border-slate-700 bg-slate-800/50",
        "transition-all duration-300",
        "hover:bg-slate-800/80",
        styles.border,
        className
      )}
    >
      {/* Gradient overlay */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity group-hover:opacity-100",
          styles.gradient
        )}
      />

      <div className="relative p-6">
        {/* Icon */}
        <div
          className={cn(
            "mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl",
            styles.iconBg
          )}
        >
          <span className={cn("h-6 w-6", styles.iconText)}>{icon}</span>
        </div>

        {/* Content */}
        <h3 className="mb-2 text-lg font-semibold text-white">{title}</h3>
        <p className="line-clamp-2 text-sm text-slate-400">{description}</p>

        {/* Arrow */}
        <div className="mt-4 flex items-center gap-2 text-sm font-medium text-slate-400 transition-colors group-hover:text-white">
          <span>{t("openCalculator")}</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}

export default CalculatorCard;
