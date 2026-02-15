"use client";

import { cn } from "@/lib/utils";
import { Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";

interface RefundBadgeProps {
  status: "expecting" | "received" | "partial";
  className?: string;
}

const STATUS_CONFIG = {
  expecting: {
    icon: Clock,
    colorClasses: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    key: "expecting" as const,
  },
  received: {
    icon: CheckCircle2,
    colorClasses: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    key: "received" as const,
  },
  partial: {
    icon: AlertCircle,
    colorClasses: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    key: "partial" as const,
  },
};

export function RefundBadge({ status, className }: RefundBadgeProps) {
  const t = useTranslations("budget.refunds");
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium",
        config.colorClasses,
        className
      )}
    >
      <Icon className="h-3 w-3" />
      {t(config.key)}
    </span>
  );
}
