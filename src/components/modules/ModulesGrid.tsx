"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useDatabase } from "@/contexts/DatabaseContext";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Clock } from "lucide-react";

type ModuleMeta = {
  slug: string;
  frontmatter: {
    id: string;
    title: string;
    description?: string;
    difficulty: string;
    estimatedTime?: string;
    domainEnum: string;
    learningObjectives?: string[];
  };
};

export function ModulesGrid({ modules }: { modules: ModuleMeta[] }) {
  const { user } = useAuth();
  const { getModuleProgress, getStudyNeedsReviewMap, getLastViewedSectionsMap } = useDatabase();

  const [progress, setProgress] = useState<
    Record<
      string,
      {
        completed_sections?: number;
        total_sections?: number;
        status?: string;
        last_updated?: string;
      }
    >
  >({});
  const [local, setLocal] = useState<
    Record<
      string,
      { lastViewed?: string | null; completed?: number; total?: number; needs?: number }
    >
  >({});
  const [error, setError] = useState<string | null>(null);
  const [needsMap, setNeedsMap] = useState<Record<string, number>>({});
  const [lastMap, setLastMap] = useState<Record<string, string>>({});

  const moduleIds = useMemo(() => modules.map((m) => m.frontmatter.id), [modules]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setError(null);
      if (user) {
        try {
          const rows = await getModuleProgress(moduleIds);
          if (!mounted) return;
          const map: Record<string, any> = {};
          for (const r of rows as any[]) {
            map[r.module_id] = r;
          }
          setProgress(map);
          // Load needs-review counts from DB
          try {
            const nm = await getStudyNeedsReviewMap(moduleIds);
            if (mounted) setNeedsMap(nm);
          } catch {}
          // Load lastViewed per module
          try {
            const lm = await getLastViewedSectionsMap(moduleIds);
            if (mounted) setLastMap(lm);
          } catch {}
        } catch (e: any) {
          // Fail gracefully if table/policies aren’t ready
          setError(e?.message ?? "Unable to load progress");
          setProgress({});
        }
      } else {
        setProgress({});
      }

      // Load local fallback progress saved by ModuleRenderer
      try {
        const out: Record<
          string,
          { lastViewed?: string | null; completed?: number; total?: number }
        > = {};
        for (const m of modules) {
          const key = `tco-study-progress:${m.frontmatter.id}`;
          try {
            const raw = localStorage.getItem(key);
            if (!raw) continue;
            const parsed = JSON.parse(raw);
            const sections = Array.isArray(parsed?.sections) ? parsed.sections : [];
            const completed = sections.filter((s: any) => s?.completed).length;
            const total = sections.length ?? undefined;
            const needs = sections.filter((s: any) => s?.needsReview && !s?.completed).length;
            (out as any)[m.frontmatter.id] = {
              lastViewed: parsed?.lastViewed ?? null,
              completed,
              total,
              needs,
            };
          } catch {}
        }
        if (mounted) setLocal(out);
      } catch {}
    }
    void load();
    return () => {
      mounted = false;
    };
  }, [getModuleProgress, moduleIds, user]);

  return (
    <>
      {!user && (
        <div className="mb-4 rounded border border-blue-500/30 bg-blue-950/30 p-3 text-blue-100">
          Sign in to track module progress.
        </div>
      )}
      {error && (
        <div className="mb-4 rounded border border-yellow-500/30 bg-yellow-950/30 p-3 text-yellow-100">
          Progress unavailable right now. Content remains accessible.
        </div>
      )}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {modules.map(({ frontmatter, slug }) => {
          const p = progress[frontmatter.id];
          const completed = p?.completed_sections ?? 0;
          const total = p?.total_sections ?? 0;
          let percent = total > 0 ? Math.round((completed / total) * 100) : 0;
          if (!p && local[frontmatter.id]?.total) {
            const lc = local[frontmatter.id];
            percent = lc.total! > 0 ? Math.round(((lc.completed ?? 0) / lc.total!) * 100) : 0;
          }
          const status =
            (p?.status as string) ||
            (percent >= 100 ? "completed" : percent > 0 ? "in_progress" : "not_started");
          const needs = needsMap[frontmatter.id] ?? local[frontmatter.id]?.needs ?? 0;
          const lastViewed = lastMap[frontmatter.id] || (local[frontmatter.id]?.lastViewed ?? null);

          const statusColor =
            status === "completed"
              ? "border-green-500/50 bg-green-900/50 text-green-200"
              : status === "in_progress"
                ? "border-yellow-500/50 bg-yellow-900/50 text-yellow-200"
                : status === "bookmarked"
                  ? "border-cyan-500/50 bg-cyan-900/50 text-cyan-200"
                  : "border-gray-500/50 bg-gray-900/50 text-gray-200";

          return (
            <Link key={slug} href={`/modules/${slug}`} className="no-underline">
              <Card className="h-full border-blue-500/20 bg-gradient-to-br from-gray-900/60 to-blue-900/40 transition hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-900/20">
                <CardHeader className="space-y-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Badge
                      variant="outline"
                      className="border-blue-500/50 bg-blue-900/50 text-blue-200"
                    >
                      {frontmatter.domainEnum.replace(/_/g, " ")}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="border-cyan-500/40 bg-cyan-900/40 text-cyan-200"
                    >
                      {frontmatter.difficulty}
                    </Badge>
                    <span className="flex items-center gap-1 text-sm text-gray-300">
                      <Clock className="h-4 w-4" /> {frontmatter.estimatedTime ?? "—"}
                    </span>
                    <Badge variant="outline" className={statusColor}>
                      {status.replace(/_/g, " ")}
                    </Badge>
                    {needs > 0 && (
                      <Badge
                        variant="outline"
                        className="border-yellow-500/60 bg-yellow-900/40 text-yellow-200"
                        aria-label={`Needs review ${needs}`}
                        title={`Needs review: ${needs}`}
                      >
                        Review {needs}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl text-white">{frontmatter.title}</CardTitle>
                  {frontmatter.description && (
                    <CardDescription className="text-gray-300">
                      {frontmatter.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="mb-3">
                    <div className="mb-1 flex justify-between text-sm text-gray-300">
                      <span>Progress</span>
                      <span>{percent}%</span>
                    </div>
                    <Progress
                      value={percent}
                      aria-label={`${frontmatter.title} progress: ${percent}% complete`}
                    />
                  </div>
                  {frontmatter.learningObjectives && frontmatter.learningObjectives.length > 0 && (
                    <ul className="ml-5 list-disc space-y-1 text-gray-200">
                      {frontmatter.learningObjectives.slice(0, 3).map((o, i) => (
                        <li key={i}>{o}</li>
                      ))}
                      {frontmatter.learningObjectives.length > 3 && (
                        <li className="italic text-gray-400">More inside…</li>
                      )}
                    </ul>
                  )}
                  {lastViewed && (
                    <div className="mt-3 text-right">
                      <Link
                        href={`/modules/${slug}#${encodeURIComponent(lastViewed)}`}
                        className="text-xs text-cyan-300 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Continue where you left off →
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </>
  );
}

export default ModulesGrid;
