"use client";

import type { LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const statCardVariants = cva("relative overflow-hidden", {
  variants: {
    variant: {
      default: "bg-card",
      success: "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800",
      warning: "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800",
      danger: "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800",
      info: "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800",
    },
    size: {
      sm: "p-3",
      default: "p-4",
      lg: "p-6",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

const iconVariantMap = {
  default: "text-muted-foreground",
  success: "text-emerald-600 dark:text-emerald-400",
  warning: "text-amber-600 dark:text-amber-400",
  danger: "text-red-600 dark:text-red-400",
  info: "text-blue-600 dark:text-blue-400",
} as const;

export interface StatCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statCardVariants> {
  /** The stat label (i18n key or plain text) */
  label: string;
  /** The stat value to display */
  value: string | number;
  /** Optional icon component from lucide-react */
  icon?: LucideIcon;
  /** Optional trend indicator: positive = green arrow up, negative = red arrow down */
  trend?: number;
  /** Optional description text below the value */
  description?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  description,
  variant,
  size,
  className,
  ...props
}: StatCardProps) {
  const t = useTranslations("budget.stats");

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className={cn(
          statCardVariants({ variant, size }),
          "card-interactive transition-all",
          className
        )}
        {...props}
      >
        <CardContent className="flex items-start justify-between gap-3 p-0">
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-semibold tracking-tight">{value}</p>
              {trend !== undefined && (
                <span
                  className={cn(
                    "text-xs font-medium",
                    trend >= 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-600 dark:text-red-400"
                  )}
                >
                  {trend >= 0 ? "+" : ""}
                  {trend}%
                </span>
              )}
            </div>
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
          </div>
          {Icon && (
            <div className={cn("rounded-md p-2", iconVariantMap[variant ?? "default"])}>
              <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export type { StatCardProps as StatCardComponentProps };
