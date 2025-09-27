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
      {children || <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-300 cursor-help" />}
      <div className="invisible group-hover:visible absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50">
        <div className="bg-gray-800 text-white text-sm rounded-lg py-2 px-3 max-w-xs whitespace-normal shadow-lg border border-gray-700">
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
        return <HelpCircle className="h-3 w-3 text-blue-400 hover:text-blue-300" />;
      case "mode":
        return <Info className="h-3 w-3 text-green-400 hover:text-green-300" />;
      case "progress":
        return <HelpCircle className="h-3 w-3 text-cyan-400 hover:text-cyan-300" />;
      default:
        return <HelpCircle className="h-3 w-3 text-gray-400 hover:text-gray-300" />;
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <div className="inline-flex items-center">
            {children || getIcon()}
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
    <div className="space-y-2 text-sm text-gray-300">
      <div className="flex items-center space-x-2">
        <Info className="h-4 w-4 text-blue-400" />
        <span>Use keyboard shortcuts for faster navigation</span>
      </div>
      <div className="pl-6 text-xs text-gray-400">
        Press Alt + M for main menu, Alt + P for practice mode
      </div>
    </div>
  );
}
