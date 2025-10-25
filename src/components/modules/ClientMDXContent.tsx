'use client';

import Callout from '@/components/mdx/Callout';
import InfoBox from '@/components/mdx/InfoBox';
import MicroQuizMDX from '@/components/mdx/MicroQuizMDX';
import MiniProject from '@/components/mdx/MiniProject';
import ModuleTransition from '@/components/mdx/ModuleTransition';
import PracticeButton from '@/components/mdx/PracticeButton';
import QueryPlayground from '@/components/mdx/QueryPlayground';
import SkillGate from '@/components/mdx/SkillGate';
import StepItem from '@/components/mdx/StepItem';
import Steps from '@/components/mdx/Steps';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MDXRemoteClient } from '@/lib/mdx/MDXRemoteClient';
import { cn } from '@/lib/utils';
import { AlertCircle, Brain, CheckCircle, Clock, Info, Lightbulb, Target, Zap } from 'lucide-react';
import type { MDXRemoteSerializeResult } from 'next-mdx-remote';
import React from 'react';

interface ClientMDXContentProps {
  content: MDXRemoteSerializeResult;
}

const mdxComponents = {
  // MDX Custom Components
  Callout: (props: React.ComponentProps<typeof Callout>) => <Callout {...props} />,
  InfoBox: (props: React.ComponentProps<typeof InfoBox>) => <InfoBox {...props} />,
  MicroQuizMDX: (props: React.ComponentProps<typeof MicroQuizMDX>) => <MicroQuizMDX {...props} />,
  MiniProject: (props: React.ComponentProps<typeof MiniProject>) => <MiniProject {...props} />,
  ModuleTransition: (props: React.ComponentProps<typeof ModuleTransition>) => (
    <ModuleTransition {...props} />
  ),
  PracticeButton: (props: React.ComponentProps<typeof PracticeButton>) => (
    <PracticeButton {...props} />
  ),
  QueryPlayground: (props: React.ComponentProps<typeof QueryPlayground>) => (
    <QueryPlayground {...props} />
  ),
  SkillGate: (props: React.ComponentProps<typeof SkillGate>) => <SkillGate {...props} />,
  StepItem: (props: React.ComponentProps<typeof StepItem>) => <StepItem {...props} />,
  Steps: (props: React.ComponentProps<typeof Steps>) => <Steps {...props} />,
  // HTML Elements
  h1: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1
      className={cn(
        'mb-6 scroll-m-20 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent lg:text-5xl',
        className
      )}
      {...props}
    />
  ),
  h2: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      className={cn(
        'mb-4 flex scroll-m-20 items-center gap-2 text-3xl font-semibold tracking-tight text-foreground',
        className
      )}
      {...props}
    />
  ),
  h3: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3
      className={cn(
        'mb-3 flex scroll-m-20 items-center gap-2 text-2xl font-semibold tracking-tight text-muted-foreground',
        className
      )}
      {...props}
    />
  ),
  p: ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p
      className={cn('mb-4 leading-7 text-muted-foreground [&:not(:first-child)]:mt-4', className)}
      {...props}
    />
  ),
  ul: ({ className, children, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul
      className={cn('my-4 ml-6 list-disc space-y-2 text-muted-foreground [&>li]:mt-2', className)}
      {...props}
    >
      {React.Children.map(children, (child, index) =>
        React.isValidElement(child) ? React.cloneElement(child as React.ReactElement<any>, { key: index }) : child
      )}
    </ul>
  ),
  ol: ({ className, children, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
    <ol
      className={cn(
        'my-4 ml-6 list-decimal space-y-2 text-muted-foreground [&>li]:mt-2',
        className
      )}
      {...props}
    >
      {React.Children.map(children, (child, index) =>
        React.isValidElement(child) ? React.cloneElement(child as React.ReactElement<any>, { key: index }) : child
      )}
    </ol>
  ),
  li: ({ className, ...props }: React.HTMLAttributes<HTMLLIElement>) => (
    <li className={cn('mt-2', className)} {...props} />
  ),
  code: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <code
      className={cn(
        'relative rounded border border-gray-700 bg-card px-2 py-1 font-mono text-sm text-muted-foreground',
        className
      )}
      {...props}
    />
  ),
  pre: ({ className, ...props }: React.HTMLAttributes<HTMLPreElement>) => (
    <pre
      className={cn(
        'mb-4 mt-6 overflow-x-auto rounded-lg border border-gray-700 bg-gray-900 p-4 text-muted-foreground',
        className
      )}
      {...props}
    />
  ),
  blockquote: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <blockquote
      className={cn(
        'mt-6 rounded-r-lg border-l-4 border-blue-500 bg-blue-950/30 py-4 pl-6 pr-4 italic text-blue-100 backdrop-blur-sm',
        className
      )}
      {...props}
    />
  ),
  LearningObjective: ({ children }: { children: React.ReactNode }) => (
    <Card className="my-6 border-primary/30 bg-gradient-to-r from-blue-950/50 to-cyan-950/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-muted-foreground">
          <Target className="h-5 w-5" />
          Learning Objective
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-muted-foreground">{children}</div>
      </CardContent>
    </Card>
  ),
  KeyConcept: ({ title, children }: { title: string; children: React.ReactNode }) => (
    <Card className="my-6 border-primary/30 bg-gradient-to-r from-cyan-950/50 to-sky-950/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-cyan-200">
          <Brain className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-muted-foreground">{children}</div>
      </CardContent>
    </Card>
  ),
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
    <Card className="my-6 border-[#22c55e]/30 bg-gradient-to-r from-green-950/50 to-emerald-950/50">
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
            <div className="flex items-center gap-1 text-[#22c55e]">
              <Clock className="h-4 w-4" />
              <span className="text-sm">{duration}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-muted-foreground">{children}</div>
      </CardContent>
    </Card>
  ),
};

export default function ClientMDXContent({ content }: ClientMDXContentProps) {
  if (!content) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-cyan-500" />
        <span className="ml-3 text-primary">Loading content...</span>
      </div>
    );
  }

  return <MDXRemoteClient {...content} components={mdxComponents} />;
}
