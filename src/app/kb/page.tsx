"use client";

import React, { useEffect, useState } from "react";
import { getKbModules, getKbSummary, mapKbDomain } from "@/lib/kb-service";
import { cn } from "@/lib/utils";

export default function KbPage() {
  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState<any[]>([]);
  const [summary, setSummary] = useState<{
    hasKbTables: boolean;
    modulesCount: number;
    questionsCount: number;
    byDomain: Record<string, number>;
  } | null>(null);

  useEffect(() => {
    void (async () => {
      const [mods, sum] = await Promise.all([getKbModules(), getKbSummary()]);
      setModules(mods);
      setSummary(sum);
      setLoading(false);
    })();
  }, []);

  const Card = ({ className, children }: { className?: string; children: React.ReactNode }) => (
    <div
      className={cn(
        "rounded-xl border border-primary/20 bg-black/30 px-5 py-4 backdrop-blur",
        className
      )}
    >
      {children}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-cyan-200">Knowledge Base (KB)</h1>
        <span className="text-xs text-primary/70">Read-only integration</span>
      </div>

      {loading && (
        <Card>
          <div className="text-cyan-100/80">Loading KB status…</div>
        </Card>
      )}

      {!loading && summary && !summary.hasKbTables && (
        <Card className="border-amber-500/30">
          <div className="font-medium text-amber-300">KB tables not detected</div>
          <div className="mt-2 text-sm text-cyan-100/80">
            Create tables using{" "}
            <code className="font-mono">docs/KB/export/SCHEMA_SQL_SETUP_KB.sql</code> then run the
            importer with <code className="font-mono">TABLE_PREFIX=kb_</code>.
          </div>
        </Card>
      )}

      {!loading && summary && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card>
            <div className="text-sm text-primary">Modules</div>
            <div className="text-3xl font-bold text-cyan-100">{summary.modulesCount}</div>
          </Card>
          <Card>
            <div className="text-sm text-primary">Questions</div>
            <div className="text-3xl font-bold text-cyan-100">{summary.questionsCount}</div>
          </Card>
          <Card>
            <div className="text-sm text-primary">Domains</div>
            <div className="mt-2 space-y-1">
              {Object.keys(summary.byDomain || {}).length === 0 ? (
                <div className="text-sm text-cyan-100/70">No question distribution available</div>
              ) : (
                Object.entries(summary.byDomain).map(([code, count]) => (
                  <div
                    key={code}
                    className="flex items-center justify-between text-sm text-cyan-100/90"
                  >
                    <span>
                      {mapKbDomain(code)} ({code})
                    </span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      )}

      {!loading && modules.length > 0 && (
        <Card>
          <div className="mb-3 font-medium text-cyan-200">Modules</div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {modules.map((m) => {
              const lessonCount = Array.isArray(m.metadata?.lessons)
                ? m.metadata.lessons.length
                : 0;
              return (
                <div key={m.id} className="rounded-lg border border-primary/10 bg-black/20 p-3">
                  <div className="font-semibold text-cyan-100">{m.title}</div>
                  <div className="mt-1 text-xs text-primary/70">
                    {mapKbDomain(m.domain)} ({m.domain})
                    {lessonCount > 0 && (
                      <span className="ml-2 text-cyan-200/80">
                        • {lessonCount} lesson{lessonCount > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
