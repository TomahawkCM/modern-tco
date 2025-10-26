"use client";

import * as React from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle, Info } from "lucide-react";

interface HelpTooltipProps {
  content: React.ReactNode;
  children?: React.ReactNode;
}

export const HelpTooltip = React.memo(function HelpTooltip({ content, children }: HelpTooltipProps) {
  return (
    <div className="group relative inline-flex items-center">
      {children || <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-muted-foreground cursor-help" />}
      <div className="invisible group-hover:visible absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50">
        <div className="bg-card text-foreground text-sm rounded-lg py-2 px-3 max-w-xs whitespace-normal shadow-lg border border-gray-700">
          {content}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
        </div>
      </div>
    </div>
  );
});

interface ExamTooltipProps {
  type: "time" | "mode" | "progress" | "help";
  context: string;
  side?: "top" | "right" | "bottom" | "left";
  children?: React.ReactNode;
}

export function ExamTooltip({ type, context, side = "top", children }: ExamTooltipProps) {
  const getIcon = () => {
    switch (type) {
      case "time":
        return <HelpCircle className="h-3 w-3 text-primary hover:text-primary" />;
      case "mode":
        return <Info className="h-3 w-3 text-[#22c55e] hover:text-[#22c55e]" />;
      case "progress":
        return <HelpCircle className="h-3 w-3 text-primary hover:text-primary" />;
      default:
        return <HelpCircle className="h-3 w-3 text-muted-foreground hover:text-muted-foreground" />;
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <div className="inline-flex items-center">
            {children ?? getIcon()}
          </div>
        </TooltipTrigger>
        <TooltipContent side={side}>
          <p className="max-w-sm">{context}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function QuickTips() {
  return (
    <div className="space-y-2 text-sm text-muted-foreground">
      <div className="flex items-center space-x-2">
        <Info className="h-4 w-4 text-primary" />
        <span>Use keyboard shortcuts for faster navigation</span>
      </div>
      <div className="pl-6 text-xs text-muted-foreground">
        Press Alt + M for main menu, Alt + P for practice mode
      </div>
    </div>
  );
}
