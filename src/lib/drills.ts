import type { Question } from "@/types/exam";
import { TCO_DOMAIN_WEIGHTS, TCODomain } from "@/types/exam";

// Static content fallback (5 items each)
import aq from "@/content/questions/asking-questions.json";
import rq from "@/content/questions/refining-questions.json";
import ta from "@/content/questions/taking-action.json";
import nb from "@/content/questions/navigation-modules.json";
import rd from "@/content/questions/reporting-export.json";

type DomainKey = keyof typeof TCO_DOMAIN_WEIGHTS;

const DOMAIN_TO_POOL: Record<string, Question[]> = {
  [TCODomain.ASKING_QUESTIONS]: aq as unknown as Question[],
  [TCODomain.REFINING_TARGETING]: rq as unknown as Question[],
  [TCODomain.TAKING_ACTION]: ta as unknown as Question[],
  [TCODomain.NAVIGATION_MODULES]: nb as unknown as Question[],
  [TCODomain.REPORTING_EXPORT]: rd as unknown as Question[],
};

/**
 * Compute per-domain counts for N questions using TCO weights for present domains.
 * Deterministic rounding: floor then allocate remainder by largest fractional part.
 */
export function computeWeightedCounts(total: number, domains: string[]): Record<string, number> {
  const weights = domains.map((d) => ({
    domain: d,
    weight: TCO_DOMAIN_WEIGHTS[d as DomainKey] ?? 1,
  }));
  const weightSum = weights.reduce((s, w) => s + w.weight, 0) || 1;
  const raws = weights.map((w) => ({
    domain: w.domain,
    raw: (total * w.weight) / weightSum,
  }));
  const base = raws.map((r) => ({ domain: r.domain, count: Math.floor(r.raw), frac: r.raw - Math.floor(r.raw) }));
  let remaining = total - base.reduce((s, b) => s + b.count, 0);
  // Sort by largest fractional part, tie-break by weight desc
  const order = [...base].sort((a, b) => {
    if (b.frac !== a.frac) return b.frac - a.frac;
    const wa = TCO_DOMAIN_WEIGHTS[a.domain as DomainKey] ?? 0;
    const wb = TCO_DOMAIN_WEIGHTS[b.domain as DomainKey] ?? 0;
    return wb - wa;
  });
  for (let i = 0; i < order.length && remaining > 0; i++) {
    base.find((x) => x.domain === order[i].domain)!.count += 1;
    remaining--;
  }
  const result: Record<string, number> = {};
  for (const b of base) result[b.domain] = b.count;
  return result;
}

/**
 * Return a deterministic Daily 10 drill set using local content and TCO weights.
 * Deterministic selection ensures stable tests.
 */
export async function getDailyDrill(total: number = 10): Promise<Question[]> {
  const availableDomains = Object.keys(DOMAIN_TO_POOL);
  const counts = computeWeightedCounts(total, availableDomains);
  const selected: Question[] = [];
  for (const d of availableDomains) {
    const pool = DOMAIN_TO_POOL[d] || [];
    const need = counts[d] ?? 0;
    for (let i = 0; i < Math.min(need, pool.length); i++) {
      selected.push(normalizeQuestion(pool[i]));
    }
  }
  // If we are short (pool too small), fill round-robin deterministically
  let i = 0;
  while (selected.length < total) {
    const d = availableDomains[i % availableDomains.length];
    const pool = DOMAIN_TO_POOL[d] || [];
    // pick next non-selected
    const next = pool.find((q) => !selected.some((s) => s.id === q.id));
    if (next) selected.push(normalizeQuestion(next));
    i++;
    if (i > 1000) break; // safety
  }
  return selected.slice(0, total);
}

function normalizeQuestion(q: Question): Question {
  // Ensure choices alias present for components that expect options
  return {
    ...q,
    options: (q as any).options ?? q.choices,
  };
}

