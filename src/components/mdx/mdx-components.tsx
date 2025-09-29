/**
 * Unified MDX component definitions
 * These components can be used in both server and client contexts
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Target,
  CheckCircle,
  AlertCircle,
  Info,
  Brain,
  Lightbulb,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import dynamic from 'next/dynamic';

// Dynamically import client components
const QueryPlayground = dynamic(() => import('./QueryPlayground'), { ssr: false });
const SkillGate = dynamic(() => import('./SkillGate'), { ssr: false });

// Server-safe components (no client-side state or effects)
export const serverSafeMdxComponents = {
  // Enhanced typography
  h1: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1
      className={cn(
        "mb-6 scroll-m-20 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent lg:text-5xl",
        className
      )}
      {...props}
    />
  ),
  h2: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      className={cn(
        "mb-4 flex scroll-m-20 items-center gap-2 text-3xl font-semibold tracking-tight text-white",
        className
      )}
      {...props}
    />
  ),
  h3: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3
      className={cn(
        "mb-3 flex scroll-m-20 items-center gap-2 text-2xl font-semibold tracking-tight text-blue-200",
        className
      )}
      {...props}
    />
  ),

  // Enhanced paragraph
  p: ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p
      className={cn("mb-4 leading-7 text-gray-200 [&:not(:first-child)]:mt-4", className)}
      {...props}
    />
  ),

  // Enhanced lists
  ul: ({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul
      className={cn("my-4 ml-6 list-disc space-y-2 text-gray-200 [&>li]:mt-2", className)}
      {...props}
    />
  ),
  ol: ({ className, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
    <ol
      className={cn("my-4 ml-6 list-decimal space-y-2 text-gray-200 [&>li]:mt-2", className)}
      {...props}
    />
  ),

  // Enhanced code blocks
  code: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <code
      className={cn(
        "relative rounded border border-gray-700 bg-gray-800 px-2 py-1 font-mono text-sm text-blue-200",
        className
      )}
      {...props}
    />
  ),
  pre: ({ className, ...props }: React.HTMLAttributes<HTMLPreElement>) => (
    <pre
      className={cn(
        "mb-4 mt-6 overflow-x-auto rounded-lg border border-gray-700 bg-gray-900 p-4 text-gray-200",
        className
      )}
      {...props}
    />
  ),

  // Enhanced blockquotes
  blockquote: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <blockquote
      className={cn(
        "mt-6 rounded-r-lg border-l-4 border-blue-500 bg-blue-950/30 py-4 pl-6 pr-4 italic text-blue-100 backdrop-blur-sm",
        className
      )}
      {...props}
    />
  ),

  // Enhanced tables
  table: ({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="my-6 w-full overflow-y-auto">
      <table className={cn("w-full", className)} {...props} />
    </div>
  ),
  th: ({ className, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <th
      className={cn(
        "border border-gray-600 bg-gray-800 px-4 py-2 text-left font-bold text-gray-200",
        className
      )}
      {...props}
    />
  ),
  td: ({ className, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <td
      className={cn("border border-gray-700 px-4 py-2 text-gray-300", className)}
      {...props}
    />
  ),

  // Custom callout components
  InfoBox: ({
    title,
    children,
    type = "info",
  }: {
    title?: string;
    children: React.ReactNode;
    type?: "info" | "warning" | "success" | "tip";
  }) => {
    const variants = {
      info: { icon: Info, colors: "bg-blue-950/30 border-blue-500 text-blue-100" },
      warning: { icon: AlertCircle, colors: "bg-yellow-950/30 border-yellow-500 text-yellow-100" },
      success: { icon: CheckCircle, colors: "bg-green-950/30 border-green-500 text-green-100" },
      tip: { icon: Lightbulb, colors: "bg-cyan-950/30 border-cyan-500 text-cyan-100" },
    };

    const { icon: Icon, colors } = variants[type];

    return (
      <div className={cn("my-6 rounded-r-lg border-l-4 py-4 pl-6 pr-4 backdrop-blur-sm", colors)}>
        {title && (
          <div className="mb-2 flex items-center gap-2 font-semibold">
            <Icon className="h-5 w-5" />
            {title}
          </div>
        )}
        <div>{children}</div>
      </div>
    );
  },

  // Learning objective component
  LearningObjective: ({ children }: { children: React.ReactNode }) => (
    <Card className="my-6 border-blue-500/30 bg-gradient-to-r from-blue-950/50 to-cyan-950/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-blue-200">
          <Target className="h-5 w-5" />
          Learning Objective
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-gray-200">{children}</div>
      </CardContent>
    </Card>
  ),

  // Key concept component
  KeyConcept: ({ title, children }: { title: string; children: React.ReactNode }) => (
    <Card className="my-6 border-cyan-500/30 bg-gradient-to-r from-cyan-950/50 to-sky-950/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-cyan-200">
          <Brain className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-gray-200">{children}</div>
      </CardContent>
    </Card>
  ),

  // Lab exercise component
  LabExercise: ({
    id,
    title,
    duration,
    children,
  }: {
    id: string;
    title: string;
    duration: string;
    children: React.ReactNode;
  }) => (
    <Card className="my-6 border-green-500/30 bg-gradient-to-r from-green-950/50 to-emerald-950/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-green-200">
            <Zap className="h-5 w-5" />
            {title}
          </CardTitle>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="border-green-500/50 bg-green-900/50 text-green-200">
              {id}
            </Badge>
            <div className="flex items-center gap-1 text-green-300">
              <Clock className="h-4 w-4" />
              <span className="text-sm">{duration}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-gray-200">{children}</div>
      </CardContent>
    </Card>
  ),

  // Interactive learning components (client-side)
  QueryPlayground: QueryPlayground,
  SkillGate: SkillGate,
};