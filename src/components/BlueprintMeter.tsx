"use client";

import { computeCoverage, coverageFromContent, type DomainCoverage, type ObjectiveCoverage } from "@/lib/blueprint";
import type { Question } from "@/types/exam";
import { useMemo, useState } from "react";

interface BlueprintMeterProps {
  questions?: Question[];
  source?: "content" | "custom";
  compact?: boolean;
  mode?: "domain" | "objective"; // optional external control
}

export default function BlueprintMeter({ questions, source = "content", compact, mode }: BlueprintMeterProps) {
  const summary = useMemo(() => (source === "content" ? coverageFromContent() : computeCoverage(questions ?? [])), [source, questions]);
  const [view, setView] = useState<"domain" | "objective">(mode ?? "domain");
  const hasObjectives = (summary.objectives?.length ?? 0) > 0;
  const effectiveView = mode ?? (hasObjectives ? view : "domain");

  return (
    <section aria-labelledby="bp-title" className="space-y-3">
      <h2 id="bp-title" className="text-lg font-semibold">Blueprint Coverage</h2>
      {hasObjectives && !mode && (
        <div className="flex items-center gap-2 text-sm">
          <button
            type="button"
            className={`rounded px-2 py-1 ${effectiveView === "domain" ? "bg-blue-600 text-white" : "bg-slate-200 dark:bg-slate-800"}`}
            onClick={() => setView("domain")}
          >
            Domains
          </button>
          <button
            type="button"
            className={`rounded px-2 py-1 ${effectiveView === "objective" ? "bg-blue-600 text-white" : "bg-slate-200 dark:bg-slate-800"}`}
            onClick={() => setView("objective")}
          >
            Objectives
          </button>
        </div>
      )}

      <div className="space-y-2" data-testid="blueprint-meter">
        {effectiveView === "domain"
          ? summary.domains.map((d) => <DomainRow key={d.domain} data={d} compact={!!compact} />)
          : (summary.objectives ?? []).slice(0, 8).map((o) => <ObjectiveRow key={o.objectiveId} data={o} compact={!!compact} />)}
      </div>
    </section>
  );
}

function DomainRow({ data, compact }: { data: DomainCoverage; compact: boolean }) {
  const pct = Math.max(0, Math.min(200, data.coverageIndex));
  const color = pct >= 100 ? "bg-green-600" : pct >= 85 ? "bg-yellow-500" : "bg-red-600";
  const ariaNow = Math.round(Math.min(100, pct));
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{data.domain}</span>
        <span className="tabular-nums text-slate-600 dark:text-slate-400">{ariaNow}%</span>
      </div>
      <div
        role="meter"
        aria-valuemin={0}
        aria-valuemax={200}
        aria-valuenow={pct}
        aria-label={`${data.domain} coverage`}
        className="h-2 w-full rounded bg-slate-200 dark:bg-slate-800 overflow-hidden"
        data-testid="bp-meter-row"
      >
        <div className={`${color} h-full`} style={{ width: `${Math.min(100, pct)}%` }} />
      </div>
      {!compact && (
        <div className="text-xs text-slate-500">
          {data.total} questions · actual {(data.actualShare * 100).toFixed(0)}% vs target {(data.targetShare * 100).toFixed(0)}%
        </div>
      )}
    </div>
  );
}

function ObjectiveRow({ data, compact }: { data: ObjectiveCoverage; compact: boolean }) {
  const pct = Math.round(data.share * 100);
  const color = pct >= 20 ? "bg-green-600" : pct >= 10 ? "bg-yellow-500" : "bg-red-600";
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">Objective {data.objectiveId}</span>
        <span className="tabular-nums text-slate-600 dark:text-slate-400">{pct}%</span>
      </div>
      <div
        role="meter"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-label={`Objective ${data.objectiveId} coverage`}
        className="h-2 w-full rounded bg-slate-200 dark:bg-slate-800 overflow-hidden"
      >
        <div className={`${color} h-full`} style={{ width: `${pct}%` }} />
      </div>
      {!compact && (
        <div className="text-xs text-slate-500">{data.total} questions</div>
      )}
    </div>
  );
}
