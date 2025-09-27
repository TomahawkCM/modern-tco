import { TCO_DOMAIN_WEIGHTS, type Question, type TCODomain } from "@/types/exam";

export interface DomainCoverage {
  domain: TCODomain;
  total: number;
  actualShare: number; // 0..1 of total present
  targetShare: number; // 0..1 per blueprint
  coverageIndex: number; // (actualShare/targetShare)*100, rounded
}

export interface ObjectiveCoverage {
  objectiveId: string;
  total: number;
  share: number; // 0..1 of total present
}

export interface CoverageSummary {
  totals: Record<string, number>;
  totalQuestions: number;
  domains: DomainCoverage[];
  objectives?: ObjectiveCoverage[];
}

export function computeCoverage(questions: Question[]): CoverageSummary {
  const counts: Record<string, number> = {};
  const objCounts: Record<string, number> = {};
  for (const q of questions) {
    const key = q.domain as string;
    counts[key] = (counts[key] || 0) + 1;
    // Collect objectives if present
    const ids: string[] = Array.isArray((q as any).objectiveIds)
      ? ((q as any).objectiveIds as string[])
      : ((q as any).objectiveId ? [String((q as any).objectiveId)] : []);
    for (const id of ids) {
      const k = String(id);
      objCounts[k] = (objCounts[k] || 0) + 1;
    }
  }
  const total = Object.values(counts).reduce((s, n) => s + n, 0) || 1;

  // Determine which domains to consider: intersection of counts and blueprint weights
  const presentDomains = Object.keys(counts).filter((d) => d in TCO_DOMAIN_WEIGHTS);
  const weightSum = presentDomains.reduce((s, d) => s + (TCO_DOMAIN_WEIGHTS as any)[d], 0) || 1;

  const domains: DomainCoverage[] = presentDomains.map((d) => {
    const actualShare = counts[d] / total;
    const targetShare = ((TCO_DOMAIN_WEIGHTS as any)[d] as number) / weightSum;
    const coverageIndex = Math.round((actualShare / targetShare) * 100);
    return {
      domain: d as TCODomain,
      total: counts[d],
      actualShare,
      targetShare,
      coverageIndex,
    };
  });

  // Sort by blueprint order (descending weight) for stable UI
  domains.sort((a, b) => (TCO_DOMAIN_WEIGHTS as any)[b.domain] - (TCO_DOMAIN_WEIGHTS as any)[a.domain]);

  let objectives: ObjectiveCoverage[] | undefined;
  const objTotal = Object.values(objCounts).reduce((s, n) => s + n, 0);
  if (objTotal > 0) {
    objectives = Object.entries(objCounts)
      .map(([objectiveId, t]) => ({ objectiveId, total: t, share: t / objTotal }))
      .sort((a, b) => b.total - a.total);
  }

  return { totals: counts, totalQuestions: total, domains, objectives };
}

// Static content fallback loader
import aq from "@/content/questions/asking-questions.json";
import rq from "@/content/questions/refining-questions.json";
import ta from "@/content/questions/taking-action.json";
import nb from "@/content/questions/navigation-modules.json";
import rd from "@/content/questions/reporting-export.json";

export function loadContentQuestions(): Question[] {
  const all = ([] as any[])
    .concat(aq as any[])
    .concat(rq as any[])
    .concat(ta as any[])
    .concat(nb as any[])
    .concat(rd as any[]);
  // Ensure options alias present for UI compatibility
  return all.map((q) => ({ ...q, options: q.options ?? q.choices })) as Question[];
}

export function coverageFromContent(): CoverageSummary {
  return computeCoverage(loadContentQuestions());
}
