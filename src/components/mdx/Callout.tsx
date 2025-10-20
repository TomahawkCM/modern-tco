import React from "react";
import { Lightbulb, AlertTriangle, Beaker } from "lucide-react";
import { cn } from "@/lib/utils";

type CalloutType = "tip" | "warning" | "lab";

interface CalloutProps {
  type: CalloutType;
  title?: string;
  children: React.ReactNode;
}

const calloutConfig = {
  tip: {
    icon: Lightbulb,
    borderColor: "border-blue-500",
    bgColor: "bg-blue-500/10",
    iconColor: "text-blue-500",
    titleColor: "text-blue-700 dark:text-blue-400",
  },
  warning: {
    icon: AlertTriangle,
    borderColor: "border-orange-500",
    bgColor: "bg-orange-500/10",
    iconColor: "text-orange-500",
    titleColor: "text-orange-700 dark:text-orange-400",
  },
  lab: {
    icon: Beaker,
    borderColor: "border-green-500",
    bgColor: "bg-green-500/10",
    iconColor: "text-green-500",
    titleColor: "text-green-700 dark:text-green-400",
  },
};

export default function Callout({ type, title, children }: CalloutProps) {
  const config = calloutConfig[type];
  const Icon = config.icon;

  return (
    <aside className={cn("my-4 rounded-lg border-2 p-4", config.borderColor, config.bgColor)}>
      <div className="flex gap-3">
        <Icon className={cn("mt-0.5 h-5 w-5 flex-shrink-0", config.iconColor)} />
        <div className="flex-1">
          {title && <div className={cn("mb-2 font-semibold", config.titleColor)}>{title}</div>}
          <div className="prose prose-sm dark:prose-invert max-w-none text-foreground/90">
            {children}
          </div>
        </div>
      </div>
    </aside>
  );
}
