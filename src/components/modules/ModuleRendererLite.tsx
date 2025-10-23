'use client';

import * as MDXReact from '@mdx-js/react';
import {
  AlertCircle,
  BookOpen,
  Brain,
  CheckCircle,
  Clock,
  Info,
  Lightbulb,
  Target,
  Zap,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { MDXRemote } from 'next-mdx-remote';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as ReactJsxRuntime from 'react/jsx-runtime';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { ModuleData } from '@/lib/mdx/module-loader';
import { cn } from '@/lib/utils';

const DynamicPracticeButton = dynamic(() => import('@/components/mdx/PracticeButton'), {
  ssr: false,
  loading: () => <span>Loading practice…</span>,
});

const DynamicMiniProject = dynamic(() => import('@/components/mdx/MiniProject'), {
  ssr: false,
  loading: () => null,
});

const DynamicSkillGate = dynamic(() => import('@/components/mdx/SkillGate'), {
  ssr: false,
  loading: () => null,
});

const DynamicModuleTransition = dynamic(() => import('@/components/mdx/ModuleTransition'), {
  ssr: false,
  loading: () => null,
});

const DynamicMicroSection = dynamic(() => import('@/components/mdx/MicroSection'), {
  ssr: false,
  loading: () => null,
});

const DynamicMicroQuiz = dynamic(() => import('@/components/mdx/MicroQuizMDX'), {
  ssr: false,
  loading: () => null,
});

const DynamicQueryPlayground = dynamic(() => import('@/components/mdx/QueryPlayground'), {
  ssr: false,
  loading: () => (
    <div className="rounded border border-cyan-600/40 p-4 text-sm text-muted-foreground">
      Loading Query Playground…
    </div>
  ),
});

const DynamicInfoBox = dynamic(() => import('@/components/mdx/InfoBox'), {
  ssr: false,
  loading: () => null,
});

const DynamicCallout = dynamic(() => import('@/components/mdx/Callout'), {
  ssr: false,
  loading: () => null,
});

const DynamicSteps = dynamic(() => import('@/components/mdx/Steps'), {
  ssr: false,
  loading: () => null,
});

const DynamicStepItem = dynamic(() => import('@/components/mdx/StepItem'), {
  ssr: false,
  loading: () => null,
});

function createRuntimeWithDevSupport() {
  const baseRuntime = { ...MDXReact, ...ReactJsxRuntime } as Record<string, unknown>;

  if (typeof baseRuntime.jsxDEV !== 'function') {
    const { jsx } = ReactJsxRuntime;
    baseRuntime.jsxDEV = function jsxDEV(type: unknown, props: unknown, key?: unknown) {
      return jsx(type as any, props as any, key as any);
    };
  }

  return baseRuntime;
}

interface ModuleRendererLiteProps {
  moduleData: ModuleData;
}

type TocEntry = { id: string; title: string; level: number };

export default function ModuleRendererLite({ moduleData }: ModuleRendererLiteProps) {
  // ALL Hooks MUST be called before any conditional returns (Rules of Hooks)
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [toc, setToc] = useState<TocEntry[]>([]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) {
      setToc([]);
      return;
    }

    const headingNodes = el.querySelectorAll<HTMLHeadingElement>('h1, h2, h3');
    if (!headingNodes || headingNodes.length === 0) {
      setToc([]);
      return;
    }

    const entries = Array.from(headingNodes)
      .filter((heading): heading is HTMLHeadingElement => Boolean(heading))
      .map((heading) => ({
        id: heading.id,
        title: heading.innerText.trim(),
        level: heading.tagName === 'H3' ? 3 : heading.tagName === 'H2' ? 2 : 1,
      }));

    setToc(entries.filter((entry) => entry.id));
  }, []);

  const safeToc = Array.isArray(toc) ? toc : [];

  const mdxRuntime = useMemo(() => createRuntimeWithDevSupport(), []);

  const mdxComponents = useMemo(
    () => ({
      PracticeButton: (props: React.ComponentProps<typeof DynamicPracticeButton>) => (
        <DynamicPracticeButton {...props} />
      ),
      MiniProject: (props: React.ComponentProps<typeof DynamicMiniProject>) => (
        <DynamicMiniProject {...props} />
      ),
      SkillGate: (props: React.ComponentProps<typeof DynamicSkillGate>) => (
        <DynamicSkillGate {...props} />
      ),
      ModuleTransition: (props: React.ComponentProps<typeof DynamicModuleTransition>) => (
        <DynamicModuleTransition {...props} />
      ),
      MicroSection: (props: React.ComponentProps<typeof DynamicMicroSection>) => (
        <DynamicMicroSection {...props} />
      ),
      MicroQuizMDX: (props: React.ComponentProps<typeof DynamicMicroQuiz>) => (
        <DynamicMicroQuiz {...props} />
      ),
      QueryPlayground: (props: React.ComponentProps<typeof DynamicQueryPlayground>) => (
        <DynamicQueryPlayground {...props} />
      ),
      InfoBox: (props: React.ComponentProps<typeof DynamicInfoBox>) => (
        <DynamicInfoBox {...props} />
      ),
      Callout: (props: React.ComponentProps<typeof DynamicCallout>) => (
        <DynamicCallout {...props} />
      ),
      Steps: (props: React.ComponentProps<typeof DynamicSteps>) => <DynamicSteps {...props} />,
      StepItem: (props: React.ComponentProps<typeof DynamicStepItem>) => (
        <DynamicStepItem {...props} />
      ),
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
          className={cn(
            'mb-4 leading-7 text-muted-foreground [&:not(:first-child)]:mt-4',
            className
          )}
          {...props}
        />
      ),
      ul: ({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
        <ul
          className={cn(
            'my-4 ml-6 list-disc space-y-2 text-muted-foreground [&>li]:mt-2',
            className
          )}
          {...props}
        />
      ),
      ol: ({ className, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
        <ol
          className={cn(
            'my-4 ml-6 list-decimal space-y-2 text-muted-foreground [&>li]:mt-2',
            className
          )}
          {...props}
        />
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
          <CardContent className="pt-0 text-muted-foreground">{children}</CardContent>
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
          <CardContent className="pt-0 text-muted-foreground">{children}</CardContent>
        </Card>
      ),
      EnhancedInfoBox: ({
        title,
        children,
        variant = 'info',
      }: {
        title?: string;
        children: React.ReactNode;
        variant?: 'info' | 'warning' | 'success' | 'tip';
      }) => {
        const variants = {
          info: { icon: Info, colors: 'bg-blue-950/30 border-blue-500 text-blue-100' },
          warning: {
            icon: AlertCircle,
            colors: 'bg-yellow-950/30 border-yellow-500 text-yellow-100',
          },
          success: { icon: CheckCircle, colors: 'bg-green-950/30 border-green-500 text-green-100' },
          tip: { icon: Lightbulb, colors: 'bg-cyan-950/30 border-cyan-500 text-cyan-100' },
        };
        const { icon: Icon, colors } = variants[variant];
        return (
          <div
            className={cn('my-6 rounded-r-lg border-l-4 py-4 pl-6 pr-4 backdrop-blur-sm', colors)}
          >
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
              <div className="flex items-center gap-3 text-[#22c55e]">
                <Badge
                  variant="outline"
                  className="border-green-500/50 bg-green-900/50 text-green-200"
                >
                  {id}
                </Badge>
                <div className="flex items-center gap-1 text-sm">
                  <Clock className="h-4 w-4" />
                  {duration}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="text-muted-foreground">{children}</CardContent>
        </Card>
      ),
    }),
    []
  );

  // Safe destructuring with fallbacks (after all hooks)
  const frontmatter = moduleData?.frontmatter || {
    title: 'Loading...',
    description: '',
    difficulty: '',
    estimatedTime: '',
    version: '1',
  };
  const content = moduleData?.content;

  // Early return AFTER all hooks if module data is invalid
  if (!moduleData?.frontmatter || !moduleData.content) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="border-white/10">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Loading module content...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="rounded-2xl border border-cyan-900/40 bg-gradient-to-br from-gray-950 via-gray-950 to-cyan-950/40 p-6 shadow-lg">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-cyan-300">Module</p>
            <h1 className="text-3xl font-bold text-white md:text-4xl">
              {frontmatter?.title || 'Module'}
            </h1>
            {frontmatter?.description && (
              <p className="mt-2 max-w-2xl text-base text-muted-foreground">
                {frontmatter.description}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {frontmatter?.difficulty && (
              <Badge variant="outline" className="border-cyan-600/40 bg-cyan-900/50 text-cyan-200">
                {frontmatter.difficulty}
              </Badge>
            )}
            {frontmatter?.estimatedTime && (
              <Badge variant="outline" className="border-blue-600/40 bg-blue-900/50 text-blue-200">
                <Clock className="mr-1 inline h-3 w-3" />
                {frontmatter.estimatedTime}
              </Badge>
            )}
            <Badge
              variant="outline"
              className="border-purple-600/40 bg-purple-900/40 text-purple-200"
            >
              Version {frontmatter?.version ?? '1'}
            </Badge>
          </div>
        </div>
      </header>

      {safeToc.length > 0 && (
        <Card className="border-cyan-900/30 bg-gradient-to-b from-gray-950/50 to-cyan-950/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-muted-foreground">
              <Target className="h-5 w-5" />
              Quick Outline
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Jump to any section that interests you.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {safeToc.map((entry) => (
                <li
                  key={entry.id}
                  className={cn(entry.level > 1 ? 'ml-4' : '', entry.level > 2 ? 'ml-8' : '')}
                >
                  <button
                    className="hover:text-primary hover:underline"
                    onClick={() => {
                      const el = document.getElementById(entry.id);
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }}
                  >
                    {entry.title}
                  </button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <div ref={containerRef} className="prose prose-lg prose-invert max-w-none">
        <MDXRemote {...content} components={mdxComponents} />
      </div>

      {frontmatter?.practiceConfig?.href && (
        <Card className="border-primary/30 bg-gradient-to-r from-gray-900/50 to-blue-900/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-muted-foreground">
              <BookOpen className="h-5 w-5" />
              Ready to Practice?
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Reinforce what you just learned with targeted questions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DynamicPracticeButton
              variant="primary"
              className="w-full"
              href={frontmatter.practiceConfig.href}
            >
              Start Practice Session
            </DynamicPracticeButton>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
