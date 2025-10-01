"use client";

import React, { useEffect, useState } from "react";
import { getKbModules, getKbSummary, mapKbDomain } from "@/lib/kb-service";
import { cn } from "@/lib/utils";

export default function KbPage() {
  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState<any[]>([]);
  const [summary, setSummary] = useState<{ hasKbTables: boolean; modulesCount: number; questionsCount: number; byDomain: Record<string, number>; } | null>(null);

  useEffect(() => {
    (async () => {
      const [mods, sum] = await Promise.all([getKbModules(), getKbSummary()]);
      setModules(mods);
      setSummary(sum);
      setLoading(false);
    })();
  }, []);

  const Card = ({ className, children }: { className?: string; children: React.ReactNode }) => (
    <div className={cn("rounded-xl border border-cyan-500/20 bg-black/30 backdrop-blur px-5 py-4", className)}>
      {children}
    </div>
  );

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-cyan-200">Knowledge Base (KB)</h1>
          <span className="text-xs text-cyan-300/70">Read-only integration</span>
        </div>

        {loading && (
          <Card>
            <div className="text-cyan-100/80">Loading KB status…</div>
          </Card>
        )}

        {!loading && summary && !summary.hasKbTables && (
          <Card className="border-amber-500/30">
            <div className="text-amber-300 font-medium">KB tables not detected</div>
            <div className="text-cyan-100/80 text-sm mt-2">
              Create tables using <code className="font-mono">docs/KB/export/SCHEMA_SQL_SETUP_KB.sql</code> then run the importer with <code className="font-mono">TABLE_PREFIX=kb_</code>.
            </div>
          </Card>
        )}

        {!loading && summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <div className="text-cyan-300 text-sm">Modules</div>
              <div className="text-3xl text-cyan-100 font-bold">{summary.modulesCount}</div>
            </Card>
            <Card>
              <div className="text-cyan-300 text-sm">Questions</div>
              <div className="text-3xl text-cyan-100 font-bold">{summary.questionsCount}</div>
            </Card>
            <Card>
              <div className="text-cyan-300 text-sm">Domains</div>
              <div className="mt-2 space-y-1">
                {Object.keys(summary.byDomain || {}).length === 0 ? (
                  <div className="text-cyan-100/70 text-sm">No question distribution available</div>
                ) : (
                  Object.entries(summary.byDomain).map(([code, count]) => (
                    <div key={code} className="flex items-center justify-between text-cyan-100/90 text-sm">
                      <span>{mapKbDomain(code)} ({code})</span>
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
            <div className="text-cyan-200 font-medium mb-3">Modules</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {modules.map((m) => {
                const lessonCount = Array.isArray((m).metadata?.lessons)
                  ? (m).metadata.lessons.length
                  : 0;
                return (
                  <div key={m.id} className="p-3 rounded-lg bg-black/20 border border-cyan-500/10">
                    <div className="text-cyan-100 font-semibold">{m.title}</div>
                    <div className="text-xs text-cyan-300/70 mt-1">
                      {mapKbDomain(m.domain)} ({m.domain})
                      {lessonCount > 0 && (
                        <span className="ml-2 text-cyan-200/80">• {lessonCount} lesson{lessonCount>1?'s':''}</span>
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
