"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useDatabase } from "@/contexts/DatabaseContext";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, BookOpen } from "lucide-react";

type ModuleMap = Record<string, { slug: string; title: string }>;

export default function ReviewCenter({ modules }: { modules: ModuleMap }) {
  const { user } = useAuth();
  const db = useDatabase();

  const [items, setItems] = useState<
    Array<{ module_id: string; module_title: string; slug: string; section_id: string; section_title: string }>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      try {
        if (user) {
          const rows = await db.getUserStudyProgress();
          const need = (rows as any[]).filter((r) => r.status === "needs_review");
          // Fetch section titles per module
          const byModule: Record<string, string[]> = {};
          for (const r of need) {
            const mid = r.module_id as string;
            const sid = r.section_id as string;
            if (!mid || !sid) continue;
            (byModule[mid] ||= []).push(sid);
          }
          const out: Array<{ module_id: string; module_title: string; slug: string; section_id: string; section_title: string }>
            = [];
          for (const [mid, sids] of Object.entries(byModule)) {
            const meta = modules[mid];
            if (!meta) continue;
            // TODO: Implement getStudySectionsPublic method
            // For now, use section IDs directly as titles
            for (const sid of sids) {
              out.push({ module_id: mid, module_title: meta.title, slug: meta.slug, section_id: sid, section_title: `Section ${sid}` });
            }
          }
          if (mounted) setItems(out);
        } else {
          // Local fallback
          const out: Array<{ module_id: string; module_title: string; slug: string; section_id: string; section_title: string }> = [];
          for (const [mid, meta] of Object.entries(modules)) {
            const key = `tco-study-progress:${mid}`;
            try {
              const raw = localStorage.getItem(key);
              if (!raw) continue;
              const v = JSON.parse(raw);
              const secs = Array.isArray(v?.sections) ? v.sections : [];
              for (const s of secs) {
                if (s?.needsReview && !s?.completed) {
                  out.push({ module_id: mid, module_title: meta.title, slug: meta.slug, section_id: s.id ?? "", section_title: s.title ?? "Section" });
                }
              }
            } catch {}
          }
          if (mounted) setItems(out);
        }
      } catch (error) {
        if (mounted) setItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, [user?.id]);

  const grouped = useMemo(() => {
    const g = new Map<string, { title: string; slug: string; items: Array<{ id: string; title: string }> }>();
    for (const it of items) {
      const key = it.module_id;
      if (!g.has(key)) g.set(key, { title: it.module_title, slug: it.slug, items: [] });
      g.get(key)!.items.push({ id: it.section_id, title: it.section_title });
    }
    return Array.from(g.entries()).map(([id, v]) => ({ id, ...v }));
  }, [items]);

  // ALL HOOKS MUST BE CALLED BEFORE ANY EARLY RETURNS (Rules of Hooks)
  const uniqueDomains = useMemo(() => {
    const set = new Set<string>();
    for (const it of items) {
      const {slug} = it;
      const slugToDomain: Record<string, string> = {
        'platform-foundation': 'Fundamentals',
        'asking-questions': 'Asking Questions',
        'refining-questions-targeting': 'Refining Questions & Targeting',
        'taking-action-packages-actions': 'Taking Action',
        'navigation-basic-modules': 'Navigation and Basic Module Functions',
        'reporting-data-export': 'Report Generation and Data Export',
      };
      const domain = slugToDomain[slug];
      if (domain) set.add(domain);
    }
    return Array.from(set);
  }, [items]);

  const mixedPracticeHref = useMemo(() => {
    if (uniqueDomains.length === 0) return null;
    const domainsParam = encodeURIComponent(uniqueDomains.join(','));
    const count = Math.min(items.length ?? 25, 25);
    return `/practice?domains=${domainsParam}&count=${count}&quick=1&reveal=1`;
  }, [uniqueDomains, items.length]);

  // Early return AFTER all hooks are called
  if (loading) {
    return (
      <div className="text-center text-gray-300">Loading review items…</div>
    );
  }

  return (
    <div className="space-y-6">
      {mixedPracticeHref && (
        <div className="flex justify-end">
          <Button className="bg-cyan-700 hover:bg-cyan-600" asChild>
            <Link href={mixedPracticeHref}>Start Mixed Review</Link>
          </Button>
        </div>
      )}
      {grouped.length === 0 ? (
        <Card className="border-green-500/30 bg-green-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-200">
              <BookOpen className="h-5 w-5" /> You're all caught up!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-green-100">No sections are flagged for review. Keep studying!</CardContent>
        </Card>
      ) : (
        grouped.map((m) => (
          <Card key={m.id} className="border-yellow-500/30 bg-yellow-900/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-200">
                <AlertTriangle className="h-5 w-5" /> {m.title}
                <Badge variant="outline" className="ml-2 border-yellow-500/50 text-yellow-200">
                  {m.items.length} to review
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-3 flex justify-end">
                {(() => {
                  const slugToDomain: Record<string, string> = {
                    'platform-foundation': 'Fundamentals',
                    'asking-questions': 'Asking Questions',
                    'refining-questions-targeting': 'Refining Questions & Targeting',
                    'taking-action-packages-actions': 'Taking Action',
                    'navigation-basic-modules': 'Navigation and Basic Module Functions',
                    'reporting-data-export': 'Report Generation and Data Export',
                  };
                  const domain = slugToDomain[m.slug] || '';
                  return domain ? (
                    <Button
                      className="bg-cyan-700 hover:bg-cyan-600"
                      asChild
                      title={`Start practice for ${m.title}`}
                    >
                      <Link href={`/practice?domain=${encodeURIComponent(domain)}&count=25&quick=1&reveal=1`}>
                        Start Practice
                      </Link>
                    </Button>
                  ) : null;
                })()}
              </div>
              <ul className="space-y-2">
                {m.items.map((s) => (
                  <li key={s.id}>
                    <Link
                      href={`/modules/${m.slug}#${encodeURIComponent(s.id)}`}
                      className="text-yellow-100 hover:underline"
                    >
                      {s.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
