"use client";

import React from "react";
import { MDXRemote } from "next-mdx-remote";
import type { ModuleData } from "@/lib/mdx/module-loader";
import PracticeButton from "@/components/mdx/PracticeButton";
import MiniProject from "@/components/mdx/MiniProject";
import QueryPlayground from "@/components/mdx/QueryPlayground";
import SkillGate from "@/components/mdx/SkillGate";
import ModuleTransition from "@/components/mdx/ModuleTransition";
import MicroSection from "@/components/mdx/MicroSection";
import MicroQuizMDX from "@/components/mdx/MicroQuizMDX";
import InfoBox from "@/components/mdx/InfoBox";
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

interface ClientMDXContentProps {
  content: ModuleData["content"];
}

// MDX Components that can be used within the module content
const mdxComponents = {
  // Custom components available in MDX
  PracticeButton: (props: React.ComponentProps<typeof PracticeButton>) => <PracticeButton {...props} />,
  MiniProject: (props: React.ComponentProps<typeof MiniProject>) => <MiniProject {...props} />,
  QueryPlayground: (props: React.ComponentProps<typeof QueryPlayground>) => <QueryPlayground {...props} />,
  SkillGate: (props: React.ComponentProps<typeof SkillGate>) => <SkillGate {...props} />,
  ModuleTransition: (props: React.ComponentProps<typeof ModuleTransition>) => <ModuleTransition {...props} />,
  MicroSection: (props: React.ComponentProps<typeof MicroSection>) => <MicroSection {...props} />,
  MicroQuizMDX: (props: React.ComponentProps<typeof MicroQuizMDX>) => <MicroQuizMDX {...props} />,
  InfoBox: (props: React.ComponentProps<typeof InfoBox>) => <InfoBox {...props} />,

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

  // Enhanced InfoBox with variants
  EnhancedInfoBox: ({
    title,
    children,
    variant = "info",
  }: {
    title?: string;
    children: React.ReactNode;
    variant?: "info" | "warning" | "success" | "tip";
  }) => {
    const variants = {
      info: { icon: Info, colors: "bg-blue-950/30 border-blue-500 text-blue-100" },
      warning: { icon: AlertCircle, colors: "bg-yellow-950/30 border-yellow-500 text-yellow-100" },
      success: { icon: CheckCircle, colors: "bg-green-950/30 border-green-500 text-green-100" },
      tip: { icon: Lightbulb, colors: "bg-cyan-950/30 border-cyan-500 text-cyan-100" },
    };

    const { icon: Icon, colors } = variants[variant];

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
};

export default function ClientMDXContent({ content }: ClientMDXContentProps) {
  return <MDXRemote {...content} components={mdxComponents} />;
}