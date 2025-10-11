"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import MicroSectionProgressGrid from "@/components/progress/MicroSectionProgressGrid";
import { isLearnExperimentalEnabled } from "@/lib/flags/learnExperimental";
import { emitLearnExp } from "@/lib/telemetry/learnExperimental";

interface SectionConfig {
  id: string;
  title: string;
  estimatedMinutes: number;
}

interface LabConfig {
  title: string;
  href: string;
  description?: string;
  estimatedMinutes?: number;
}

interface LearnExperimentalModuleConfig {
  moduleId: string;
  title: string;
  description: string;
  accentColor?: string;
  route: string;
  mdxImport: () => Promise<{ default: React.ComponentType<any> }>;
  sections: SectionConfig[];
  labs: LabConfig[];
}

interface SectionProgressState {
  id: string;
  title: string;
  moduleId: string;
  moduleName: string;
  estimatedMinutes: number;
  completed: boolean;
  inProgress: boolean;
  locked: boolean;
}

function buildSectionProgress(config: LearnExperimentalModuleConfig): SectionProgressState[] {
  if (typeof window === "undefined") {
    return config.sections.map((section) => ({
      id: section.id,
      title: section.title,
      moduleId: config.moduleId,
      moduleName: config.title,
      estimatedMinutes: section.estimatedMinutes,
      completed: false,
      inProgress: false,
      locked: false,
    }));
  }

  const completionStates = config.sections.map((section) => {
    const key = `micro-section-${config.moduleId}-${section.id}`;
    return localStorage.getItem(key) === "true";
  });

  const firstIncomplete = completionStates.findIndex((state) => !state);
  const hasIncomplete = firstIncomplete !== -1;

  return config.sections.map((section, index) => ({
    id: section.id,
    title: section.title,
    moduleId: config.moduleId,
    moduleName: config.title,
    estimatedMinutes: section.estimatedMinutes,
    completed: completionStates[index] ?? false,
    inProgress: hasIncomplete ? index === firstIncomplete : false,
    locked: hasIncomplete ? index > firstIncomplete : false,
  }));
}

function useModuleProgress(config: LearnExperimentalModuleConfig, enabled: boolean) {
  const [sections, setSections] = useState<SectionProgressState[]>(() => buildSectionProgress(config));

  useEffect(() => {
    if (!enabled) return;

    const update = () => setSections(buildSectionProgress(config));
    update();

    const interval = window.setInterval(update, 2500);
    window.addEventListener("focus", update);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", update);
    };
  }, [config, enabled]);

  const completedSections = useMemo(
    () => sections.filter((section) => section.completed).length,
    [sections]
  );

  const totalSections = config.sections.length;
  const totalMinutes = config.sections.reduce((sum, section) => sum + section.estimatedMinutes, 0);

  const modules = useMemo(
    () => [
      {
        moduleId: config.moduleId,
        moduleName: config.title,
        color: config.accentColor ?? "bg-primary",
        totalSections,
        completedSections,
        totalMinutes,
        sections,
        href: config.route,
      },
    ],
    [config, completedSections, sections, totalMinutes, totalSections]
  );

  return {
    modules,
    sections,
    completedSections,
    totalSections,
  };
}

export function createLearnExperimentalModulePage(config: LearnExperimentalModuleConfig) {
  return function LearnExperimentalModulePage() {
    const [enabledServer] = useState(() => isLearnExperimentalEnabled());
    const [enabled, setEnabled] = useState(enabledServer);
    const [loadingModule, setLoadingModule] = useState(true);
    const [ModuleComponent, setModuleComponent] = useState<React.ComponentType<any> | null>(null);
    const { modules, sections, completedSections, totalSections } = useModuleProgress(config, enabled);
    const moduleCompleteEmitted = useRef(false);
    const unitCompletionRef = useRef<Record<string, boolean>>({});
    const unitStartRef = useRef<Record<string, boolean>>({});

    useEffect(() => {
      setEnabled(isLearnExperimentalEnabled());
    }, []);

    useEffect(() => {
      if (!enabled) {
        return;
      }

      let active = true;
      setLoadingModule(true);

      config
        .mdxImport()
        .then((mod) => {
          if (!active) return;
          setModuleComponent(() => mod.default);
        })
        .finally(() => {
          if (active) {
            setLoadingModule(false);
          }
        });

      return () => {
        active = false;
      };
    }, [enabled]);

    useEffect(() => {
      if (!enabled) return;
      emitLearnExp({
        moduleId: config.moduleId,
        unitId: `${config.moduleId}-overview`,
        action: "unit_start",
      });
    }, [enabled, config.moduleId]);

    useEffect(() => {
      if (!enabled) return;

      sections.forEach((section) => {
        if (section.inProgress && !unitStartRef.current[section.id]) {
          emitLearnExp({
            moduleId: config.moduleId,
            unitId: section.id,
            action: "unit_start",
          });
          unitStartRef.current[section.id] = true;
        }

        const previouslyCompleted = unitCompletionRef.current[section.id];
        if (!previouslyCompleted && section.completed) {
          emitLearnExp({
            moduleId: config.moduleId,
            unitId: section.id,
            action: "unit_complete",
          });
        }
        unitCompletionRef.current[section.id] = section.completed;
      });
    }, [enabled, sections, config.moduleId]);

    useEffect(() => {
      if (!enabled) return;
      if (totalSections === 0) return;
      if (completedSections === totalSections && !moduleCompleteEmitted.current) {
        emitLearnExp({
          moduleId: config.moduleId,
          unitId: `${config.moduleId}-module`,
          action: "module_complete",
        });
        moduleCompleteEmitted.current = true;
      }
    }, [enabled, completedSections, totalSections, config.moduleId]);

    const navItems = [
      { href: "/study/01-learn-experimental", label: "01-L Asking Questions" },
      { href: "/study/02-learn-experimental", label: "02-L Refining & Targeting" },
      { href: "/study/03-learn-experimental", label: "03-L Taking Action" },
      { href: "/study/04-learn-experimental", label: "04-L Navigation & Modules" },
      { href: "/study/05-learn-experimental", label: "05-L Reporting & Export" },
      { href: "/study/compare-learning", label: "Compare", subtle: true },
    ];

    if (!enabled) {
      return (
        <div className="mx-auto max-w-3xl space-y-6 px-4 py-12">
          <Card className="border-border/40 bg-slate-950/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Badge variant="outline">Experimental</Badge>
                Enable Learn Experimental Path
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                The Learn-style modules are behind a feature flag. Launch the dev server with
                <code className="ml-1 rounded bg-card px-2 py-1 text-xs">NEXT_PUBLIC_LEARN_EXPERIMENTAL=1</code>
                or append
                <code className="ml-1 rounded bg-card px-2 py-1 text-xs">?path=learn-experimental</code>
                to the URL.
              </p>
              <div className="pt-2">
                <Button asChild variant="outline">
                  <Link href="?path=learn-experimental">Reload with feature flag</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    if (loadingModule || !ModuleComponent) {
      return (
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="space-y-2 text-center text-muted-foreground">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-dashed border-primary"></div>
            <p>Loading experimental module…</p>
          </div>
        </div>
      );
    }

    const totalMinutes = config.sections.reduce((sum, section) => sum + section.estimatedMinutes, 0);

    return (
      <div className="mx-auto max-w-6xl space-y-10 px-4 py-10">
        <nav className="flex flex-wrap items-center gap-2 rounded-xl border border-border/40 bg-slate-950/70 p-3 shadow-inner">
          {navItems.map((item) => {
            const isActive = item.href === config.route;
            const baseClasses =
              "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60";
            const activeClasses =
              "bg-gradient-to-r from-primary/30 via-primary/20 to-primary/30 text-foreground border border-primary/60 shadow-[0_8px_22px_-12px_rgba(96,165,250,0.85)]";
            const inactiveClasses = item.subtle
              ? "text-muted-foreground hover:text-primary/90 focus-visible:ring-1 focus-visible:ring-primary/40"
              : "text-slate-100 border border-transparent hover:border-primary/40 hover:bg-primary/10 hover:text-primary";

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                data-active={isActive ? "true" : undefined}
                className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <header className="space-y-3">
          <div className="flex items-center gap-3">
            <Badge
              className="border border-white/10 bg-gradient-to-r from-purple-500/80 via-fuchsia-500/70 to-pink-500/70 text-foreground shadow-[0_12px_26px_-16px_rgba(217,70,239,0.65)]"
              aria-label="Experimental badge"
            >
              Experimental
            </Badge>
            <span className="text-sm uppercase tracking-wide text-muted-foreground">
              Learn-style pilot track
            </span>
          </div>
          <h1 className="text-3xl font-semibold text-foreground">{config.title}</h1>
          <p className="max-w-3xl text-base text-muted-foreground">{config.description}</p>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span>Total units: {config.sections.length}</span>
            <span>Estimated time: {totalMinutes} min</span>
            <span>Completion: {completedSections}/{totalSections}</span>
          </div>
        </header>

        <MicroSectionProgressGrid
          modules={modules}
          totalCompleted={completedSections}
          totalSections={totalSections}
        />

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-foreground">Labs</h2>
            <span className="text-sm text-muted-foreground">Quick, 5–10 minute practice reps</span>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {config.labs.map((lab) => (
              <Card key={lab.href} className="border-border/50 bg-slate-950/40 transition hover:border-primary/50">
                <CardHeader>
                  <CardTitle className="text-lg text-foreground">{lab.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  {lab.description ? <p>{lab.description}</p> : null}
                  <div className="flex items-center justify-between text-xs text-muted-foreground/80">
                    <span>{lab.estimatedMinutes ? `${lab.estimatedMinutes} min` : "5–10 min"}</span>
                    <Link
                      href={lab.href}
                      className="text-primary underline-offset-4 hover:underline"
                      aria-label={`Open lab ${lab.title}`}
                    >
                      Open lab
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="prose prose-invert max-w-none">
          <ModuleComponent />
        </section>
      </div>
    );
  };
}
