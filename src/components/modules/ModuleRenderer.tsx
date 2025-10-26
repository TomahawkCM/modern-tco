"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import type { ModuleData } from "@/lib/mdx/module-loader";
import PracticeButton from "@/components/mdx/PracticeButton";
import MicroSection from "@/components/mdx/MicroSection";
import MicroQuizMDX from "@/components/mdx/MicroQuizMDX";
import QueryPlayground from "@/components/mdx/QueryPlayground";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Book,
  Clock,
  Target,
  CheckCircle,
  AlertCircle,
  Info,
  BookOpen,
  Brain,
  Lightbulb,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Difficulty } from "@/types/exam";
import { useAuth } from "@/contexts/AuthContext";
import { useDatabase } from "@/contexts/DatabaseContext";
import { analytics } from "@/lib/analytics";
import { StudySessionProvider } from "@/contexts/StudySessionContext";

interface ModuleRendererProps {
  moduleData: ModuleData;
}

// Client-side MDX wrapper component
const ClientMDXContent = dynamic(
  () => import("./ClientMDXContent"),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
        <span className="ml-3 text-primary">Loading content...</span>
      </div>
    )
  }
);

// MDX Components that can be used within the module content
const mdxComponents = {
  // Custom components available in MDX
  PracticeButton: (props: React.ComponentProps<typeof PracticeButton>) => <PracticeButton {...props} />,
  MicroSection: (props: React.ComponentProps<typeof MicroSection>) => <MicroSection {...props} />,
  MicroQuizMDX: (props: React.ComponentProps<typeof MicroQuizMDX>) => <MicroQuizMDX {...props} />,
  QueryPlayground: (props: React.ComponentProps<typeof QueryPlayground>) => <QueryPlayground {...props} />,

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
        "mb-4 flex scroll-m-20 items-center gap-2 text-3xl font-semibold tracking-tight text-foreground",
        className
      )}
      {...props}
    />
  ),
  h3: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3
      className={cn(
        "mb-3 flex scroll-m-20 items-center gap-2 text-2xl font-semibold tracking-tight text-muted-foreground",
        className
      )}
      {...props}
    />
  ),

  // Enhanced paragraph
  p: ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p
      className={cn("mb-4 leading-7 text-muted-foreground [&:not(:first-child)]:mt-4", className)}
      {...props}
    />
  ),

  // Enhanced lists
  ul: ({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul
      className={cn("my-4 ml-6 list-disc space-y-2 text-muted-foreground [&>li]:mt-2", className)}
      {...props}
    />
  ),
  ol: ({ className, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
    <ol
      className={cn("my-4 ml-6 list-decimal space-y-2 text-muted-foreground [&>li]:mt-2", className)}
      {...props}
    />
  ),

  // Enhanced code blocks
  code: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <code
      className={cn(
        "relative rounded border border-gray-700 bg-card px-2 py-1 font-mono text-sm text-muted-foreground",
        className
      )}
      {...props}
    />
  ),
  pre: ({ className, ...props }: React.HTMLAttributes<HTMLPreElement>) => (
    <pre
      className={cn(
        "mb-4 mt-6 overflow-x-auto rounded-lg border border-gray-700 bg-gray-900 p-4 text-muted-foreground",
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

  // Custom callout components
  InfoBox: ({
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

  // Key concept component
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

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "Beginner":
      return "bg-green-900/50 text-green-200 border-green-500/50";
    case "Intermediate":
      return "bg-yellow-900/50 text-[#f97316] border-yellow-500/50";
    case "Advanced":
      return "bg-red-900/50 text-red-200 border-red-500/50";
    default:
      return "bg-gray-900/50 text-muted-foreground border-gray-500/50";
  }
};

const convertStringToDifficulty = (difficulty: string): Difficulty => {
  switch (difficulty) {
    case "Beginner":
      return Difficulty.BEGINNER;
    case "Intermediate":
      return Difficulty.INTERMEDIATE;
    case "Advanced":
      return Difficulty.ADVANCED;
    default:
      return Difficulty.BEGINNER; // Default fallback
  }
};

export default function ModuleRenderer({ moduleData }: ModuleRendererProps) {
  const { frontmatter, content } = moduleData;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { user } = useAuth();
  const db = useDatabase();

  type SectionState = { id: string; title: string; level: number; completed: boolean; needsReview: boolean; etaMin?: number };
  const [sections, setSections] = useState<SectionState[]>([]);
  const [lastViewed, setLastViewed] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showToc, setShowToc] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'review'>('content');

  // Track time-in-section
  const lastActiveIdRef = useRef<string | null>(null);
  const lastChangeMsRef = useRef<number>(Date.now());
  const timeSpentRef = useRef<Record<string, number>>({}); // seconds per section id

  const moduleId = frontmatter.id;
  const storageKey = `tco-study-progress:${moduleId}`;
  const [dbEtaMap, setDbEtaMap] = useState<Record<string, number>>({});

  function slugify(s: string) {
    return s
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
  }

  function stripEtaSuffix(title: string) {
    return title.replace(/\s*\((?:\d+(?:\.\d+)?\s*(?:min|minutes|m|h|hour|hours))\)\s*$/i, '').trim();
  }

  function formatMinutes(min?: number) {
    if (!min || min <= 0) return '0m';
    if (min < 60) return `${min}m`;
    const h = Math.floor(min / 60);
    const m = min % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }

  // Load persisted progress (local)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed?.lastViewed) setLastViewed(parsed.lastViewed);
      if (Array.isArray(parsed?.sections)) setSections(parsed.sections);
    } catch {}
  }, [storageKey]);

  // Build TOC from rendered content and merge with persisted state
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const heads = Array.from(el.querySelectorAll("h1, h2, h3"));
    const discovered: SectionState[] = heads.map((h) => {
      const title = (h as HTMLElement).innerText.trim();
      const id = h.id ?? slugify(title);
      if (!h.id) h.id = id;
      const level = h.tagName === "H3" ? 3 : h.tagName === 'H2' ? 2 : 1;
      let etaMin: number | undefined;
      const tm = title.match(/\(([^)]+)\)\s*$/);
      if (tm) {
        const t = tm[1].toLowerCase();
        const m = t.match(/^(\d+(?:\.\d+)?)\s*(min|minutes|m|h|hour|hours)$/);
        if (m) {
          const val = parseFloat(m[1]);
          etaMin = /h/.test(m[2]) ? Math.round(val * 60) : Math.round(val);
        }
      }
      const existing = sections.find((s) => s.id === id);
      const norm = stripEtaSuffix(title).toLowerCase();
      const dbEta = dbEtaMap[norm];
      return existing ?? { id, title, level, completed: false, needsReview: false, etaMin: dbEta ?? etaMin };
    });
    setSections(discovered);

    // Observe headings to highlight active section
  const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (a.target as HTMLElement).offsetTop - (b.target as HTMLElement).offsetTop);
        if (visible[0]) {
          const {id} = (visible[0].target as HTMLElement);
          if (id) setActiveId(id);
        }
      },
      { root: el, rootMargin: "-20% 0px -60% 0px", threshold: [0, 1] }
    );
    heads.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [content]);

  // Fetch DB-estimated times (public) and merge when available
  useEffect(() => {
    // TODO: Implement getStudySectionsPublic method in database hook
    // Temporarily disabled to fix TypeScript build errors
    // Will fetch public study section time estimates from the database
    setDbEtaMap({});
  }, [db, moduleId]);

  // Persist progress locally
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ sections, lastViewed }));
    } catch {}
  }, [sections, lastViewed, storageKey]);

  // Track scrolling to update last viewed section
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => {
      const heads = Array.from(el.querySelectorAll("h2, h3"));
      const top = heads.find((h) => h.getBoundingClientRect().top >= 0 && h.getBoundingClientRect().top < 200);
      if (top) setLastViewed(top.id);
    };
    const p = el;
    p.addEventListener("scroll", onScroll, { passive: true } as any);
    return () => p.removeEventListener("scroll", onScroll as any);
  }, []);

  // Update URL hash for shareable deep-links when active section changes
  useEffect(() => {
    if (!activeId) return;
    try {
      const url = new URL(window.location.href);
      if (url.hash.replace(/^#/, '') !== activeId) {
        url.hash = `#${activeId}`;
        window.history.replaceState({}, '', url.toString());
      }
    } catch {}
  }, [activeId]);

  // Accumulate time spent per active section and periodically sync
  useEffect(() => {
    const now = Date.now();
    const prevId = lastActiveIdRef.current;
    const deltaSec = Math.max(0, Math.floor((now - lastChangeMsRef.current) / 1000));
    if (prevId) {
      timeSpentRef.current[prevId] = (timeSpentRef.current[prevId] || 0) + deltaSec;
    }
    lastActiveIdRef.current = activeId;
    lastChangeMsRef.current = now;
  }, [activeId]);

  useEffect(() => {
    if (!user) return;
    const flush = async () => {
      const copy = { ...timeSpentRef.current };
      timeSpentRef.current = {};
      for (const [id, sec] of Object.entries(copy)) {
        if (!id) continue;
        const minutes = Math.max(0, Math.round(sec / 60));
        if (minutes <= 0) continue;
        try {
          await db.upsertUserStudyProgress({ module_id: moduleId, section_id: id, status: 'in_progress', time_spent_minutes: minutes });
        } catch {}
      }
    };
    const interval = setInterval(flush, 60000);
    return () => {
      clearInterval(interval);
      // final flush
      flush().catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, moduleId]);

  // Update HUD time spent display (client-only; simple counter since load)
  useEffect(() => {
    let seconds = 0;
    const el = () => document.getElementById('hud-time-spent');
    const tick = () => {
      seconds += 1;
      const m = Math.floor(seconds / 60).toString().padStart(2, '0');
      const s = (seconds % 60).toString().padStart(2, '0');
      try { el()!.textContent = `${m}:${s}`; } catch {}
    };
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Handle deep-link hash on initial load
  useEffect(() => {
    try {
      const hash = decodeURIComponent((window.location.hash ?? "").replace(/^#/, ""));
      if (!hash) return;
      const target = document.getElementById(hash);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        setLastViewed(hash);
      }
    } catch {}
  }, []);

  // DB sync (best-effort) when marking complete/needs review
  const markSection = async (id: string, status: "completed" | "needs_review" | "in_progress" | "not_started") => {
    let nextSections: SectionState[] = [];
    setSections((prev) => {
      nextSections = prev.map((s) =>
        s.id === id ? { ...s, completed: status === 'completed', needsReview: status === 'needs_review' } : s
      );
      return nextSections;
    });
    void analytics.capture("study_section_mark", { moduleId, id, status });
    if (!user) return;
    try {
      await db.upsertUserStudyProgress({ module_id: moduleId, section_id: id, status });
      // Update module summary
      const total = nextSections.length ?? 0;
      const completedCount = nextSections.filter((s) => s.completed).length;
      await db.upsertModuleProgress({
        module_id: moduleId,
        total_sections: total ?? undefined,
        completed_sections: completedCount ?? undefined,
        status: completedCount >= total && total > 0 ? 'completed' : (completedCount > 0 ? 'in_progress' : 'not_started'),
      });
    } catch {}
  };

  const markAllComplete = async () => {
    for (const s of sections) {
      if (!s.completed) await markSection(s.id, 'completed');
    }
  };

  const clearAllReview = async () => {
    for (const s of sections) {
      if (s.needsReview) await markSection(s.id, 'in_progress');
    }
  };

  const resetProgress = async () => {
    // Reset local section state
    setSections((prev) => prev.map((s) => ({ ...s, completed: false, needsReview: false })));
    // Persist to DB best-effort
    if (user) {
      try {
        for (const s of sections) {
          await markSection(s.id, 'not_started');
        }
      } catch {}
    }
    // Update local storage immediately
    try {
      localStorage.setItem(storageKey, JSON.stringify({ sections: sections.map((s) => ({ ...s, completed: false, needsReview: false })), lastViewed }));
    } catch {}
  };

  const domainForPractice = useMemo(() => {
    const map: Record<string, string> = {
      ASKING_QUESTIONS: "Asking Questions",
      REFINING_QUESTIONS: "Refining Questions & Targeting",
      TAKING_ACTION: "Taking Action",
      NAVIGATION_MODULES: "Navigation and Basic Module Functions",
      REPORTING_EXPORT: "Report Generation and Data Export",
      PLATFORM_FOUNDATION: "Fundamentals",
    };
    return map[String(frontmatter.domainEnum)] || String(frontmatter.domainEnum);
  }, [frontmatter.domainEnum]);

  return (
    <StudySessionProvider
      moduleId={moduleId}
      sections={sections}
      activeId={activeId}
      lastViewed={lastViewed}
      activeTab={activeTab}
      onMarkSection={markSection}
      onSetLastViewed={setLastViewed}
      onSetActiveId={setActiveId}
      onSetActiveTab={setActiveTab}
      onMarkAllComplete={markAllComplete}
      onClearAllReview={clearAllReview}
      onResetProgress={resetProgress}
    >
      <div className="container mx-auto px-4 py-8">
      {/* Module Header */}
      <div className="mb-8">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <Badge variant="outline" className="border-blue-500/50 bg-blue-900/50 text-muted-foreground">
            {frontmatter.domainEnum.replace(/_/g, " ")}
          </Badge>
          <Badge variant="outline" className={getDifficultyColor(frontmatter.difficulty)}>
            {frontmatter.difficulty}
          </Badge>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span className="text-sm">{frontmatter.estimatedTime}</span>
          </div>
        </div>

        <h1 className="mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-4xl font-bold text-transparent">
          {frontmatter.title}
        </h1>

        {frontmatter.description && (
          <p className="mb-6 text-xl leading-relaxed text-muted-foreground">{frontmatter.description}</p>
        )}

        {/* Learning Objectives */}
        {frontmatter.learningObjectives && frontmatter.learningObjectives.length > 0 && (
          <Card className="mb-6 border-primary/30 bg-gradient-to-r from-blue-950/30 to-cyan-950/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-muted-foreground">
                <Target className="h-5 w-5" />
                Learning Objectives
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {frontmatter.learningObjectives.map((objective, index) => (
                  <li key={index} className="flex items-start gap-2 text-muted-foreground">
                    <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#22c55e]" />
                    <span>{objective}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Mini Progress HUD */}
      <Card className="mb-6 border-primary/30 bg-gradient-to-r from-cyan-950/30 to-blue-950/20">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-4">
          <div className="text-cyan-100">
            <span className="text-sm">Sections</span>
            <div className="text-lg font-semibold">
              {sections.filter((s) => s.completed).length}/{sections.length} completed
            </div>
          </div>
          <div className="flex-1">
            <div className="mb-1 flex justify-between text-sm text-cyan-200">
              <span>Progress</span>
              <span>
                {sections.length > 0
                  ? Math.round((sections.filter((s) => s.completed).length / sections.length) * 100)
                  : 0}%
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded bg-cyan-900/40">
              <div
                className="h-2 rounded bg-cyan-500"
                style={{ width: `${sections.length > 0 ? Math.round((sections.filter((s) => s.completed).length / sections.length) * 100) : 0}%` }}
              />
            </div>
          </div>
          <div className="text-cyan-100">
            <span className="text-sm">Time Spent</span>
            <div className="text-lg font-semibold" id="hud-time-spent"></div>
          </div>
          <div className="text-cyan-100">
            <span className="text-sm">Remaining</span>
            <div className="text-lg font-semibold">
              {(() => {
                const total = sections.reduce((sum, s) => sum + (s.etaMin ?? 0), 0);
                const done = sections.reduce((sum, s) => sum + (s.completed ? (s.etaMin ?? 0) : 0), 0);
                return formatMinutes(Math.max(0, total - done));
              })()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="mb-4 flex gap-2">
        <Button
          variant={activeTab === 'content' ? 'default' : 'outline'}
          className={activeTab === 'content' ? 'bg-cyan-700 hover:bg-primary' : 'border-cyan-700 text-cyan-200 hover:bg-cyan-900/30'}
          onClick={() => setActiveTab('content')}
        >
          Content
        </Button>
        <Button
          variant={activeTab === 'review' ? 'default' : 'outline'}
          className={activeTab === 'review' ? 'bg-cyan-700 hover:bg-primary' : 'border-cyan-700 text-cyan-200 hover:bg-cyan-900/30'}
          onClick={() => setActiveTab('review')}
        >
          Review ({sections.filter(s => s.needsReview && !s.completed).length})
        </Button>
      </div>

      {/* Mobile TOC toggle */}
      <div className="mb-4 lg:hidden">
        <Button
          variant="outline"
          className="border-cyan-600/40 text-cyan-200 hover:bg-cyan-900/30"
          onClick={() => setShowToc((v) => !v)}
          aria-expanded={showToc}
          aria-controls="module-toc"
        >
          {showToc ? 'Hide' : 'Show'} Section List
        </Button>
        {showToc && (
          <Card className="mt-3 border-primary/30 bg-gradient-to-b from-gray-900/50 to-cyan-900/20" id="module-toc">
            <CardContent className="pt-4">
              <ul className="space-y-2">
                {sections.map((s) => (
                  <li key={s.id}>
                    <button
                      className={cn('text-left text-sm hover:underline', activeId === s.id ? 'text-primary' : 'text-blue-100')}
                      onClick={() => {
                        const el = document.getElementById(s.id);
                        if (el) {
                          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          setLastViewed(s.id);
                          setShowToc(false);
                          void analytics.capture('study_section_view', { moduleId, id: s.id });
                        }
                      }}
                    >
                      {s.title}
                    </button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Content */}
      <div ref={containerRef} className="prose prose-lg prose-invert max-w-none">
          {/* Sticky current section header */}
          <div className="sticky top-0 z-10 -mx-2 mb-2 border-b border-cyan-900/40 bg-gray-950/60 px-2 backdrop-blur">
            <div className="flex h-10 items-center justify-between">
              <div className="truncate text-sm text-cyan-200">
                {stripEtaSuffix((sections.find((s) => s.id === activeId)?.title ?? sections[0]?.title ?? frontmatter.title))}
              </div>
              <div className="text-xs text-primary">
                {formatMinutes(sections.find((s) => s.id === activeId)?.etaMin)}
              </div>
            </div>
          </div>
          {/* Review panel */}
          {activeTab === 'review' && (
            <Card className="mb-4 border-[#f97316]/40 bg-yellow-900/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-[#f97316]">
                  <AlertCircle className="h-5 w-5" />
                  Needs Review
                </CardTitle>
              </CardHeader>
              <CardContent>
                {sections.filter(s => s.needsReview && !s.completed).length === 0 ? (
                  <div className="text-muted-foreground">No sections flagged for review.</div>
                ) : (
                  <ul className="space-y-2">
                    {sections.filter(s => s.needsReview && !s.completed).map((s) => (
                      <li key={s.id} className="flex items-center gap-3">
                        <button
                          className="text-left text-sm text-[#f97316] hover:underline"
                          onClick={() => {
                            const el = document.getElementById(s.id);
                            if (el) {
                              setActiveTab('content');
                              el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                              setLastViewed(s.id);
                              void analytics.capture('study_section_view', { moduleId, id: s.id, from: 'reviewTab' });
                            }
                          }}
                        >
                          {s.title}
                        </button>
                        <Button size="sm" className="ml-auto bg-green-700 hover:bg-[#22c55e]" onClick={() => markSection(s.id, 'completed')}>
                          Mark complete
                        </Button>
                        <Button size="sm" variant="outline" className="border-yellow-600 text-[#f97316] hover:bg-[#f97316]/10" onClick={() => markSection(s.id, 'in_progress')}>
                          Clear flag
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          )}

          {/* Main content */}
          <ClientMDXContent content={content} />
        </div>

      {/* Module Footer - Practice Button */}
      {frontmatter.practiceConfig && (
        <div className="mt-12 border-t border-gray-700 pt-8">
          <Card className="border-primary/30 bg-gradient-to-r from-gray-900/50 to-blue-900/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-muted-foreground">
                <BookOpen className="h-5 w-5" />
                Ready to Practice?
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Test your knowledge with practice questions based on this module's content.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PracticeButton
                variant="primary"
                className="w-full"
                href={`/practice?domain=${encodeURIComponent(domainForPractice)}&count=25&quick=1&reveal=1`}
                onClick={() => analytics.capture('module_practice_start', { moduleId, domain: domainForPractice })}
              >
                Start {frontmatter.title} Practice
              </PracticeButton>
            </CardContent>
          </Card>
        </div>
      )}
      </div>
    </StudySessionProvider>
  );
}
