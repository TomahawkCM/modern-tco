import { supabase } from "@/lib/supabase";

export type KbModule = {
  id: string;
  title: string;
  domain: string;
  metadata?: unknown;
};

export type KbSummary = {
  hasKbTables: boolean;
  modulesCount: number;
  questionsCount: number;
  byDomain: Record<string, number>;
};

export function mapKbDomain(code: string): string {
  switch ((code || "").toUpperCase()) {
    case "AQ":
      return "Asking Questions";
    case "RQ":
      return "Refining Questions & Targeting";
    case "TA":
      return "Taking Action";
    case "NB":
      return "Navigation & Module Functions";
    case "RD":
      return "Reporting & Data Export";
    default:
      return code || "Unknown";
  }
}

export async function getKbModules(): Promise<KbModule[]> {
  try {
    const { data, error } = await supabase
      .from("kb_modules")
      .select("id,title,domain,metadata")
      .order("id");
    if (error) return [];
    return (data as KbModule[]) || [];
  } catch {
    return [];
  }
}

export async function getKbSummary(): Promise<KbSummary> {
  let modulesCount = 0;
  let questionsCount = 0;
  const byDomain: Record<string, number> = {};
  let hasKbTables = true;

  try {
    const { count: mCount, error: mErr } = await supabase
      .from("kb_modules")
      .select("*", { count: "exact", head: true });
    if (!mErr && typeof mCount === "number") modulesCount = mCount;
  } catch {
    hasKbTables = false;
  }

  try {
    const { count: qCount, error: qErr } = await supabase
      .from("kb_questions")
      .select("*", { count: "exact", head: true });
    if (!qErr && typeof qCount === "number") questionsCount = qCount;
  } catch {
    hasKbTables = false;
  }

  try {
    // PostgREST aggregates with implicit GROUP BY when mixing columns and aggregates
    const { data, error } = await supabase
      .from("kb_questions")
      .select("domain, count:count()");
    if (!error && Array.isArray(data)) {
      for (const row of data as any[]) {
        const d = row.domain as string;
        const c = Number(row.count ?? 0);
        byDomain[d] = (byDomain[d] || 0) + c;
      }
    }
  } catch {
    // ignore
  }

  return { hasKbTables, modulesCount, questionsCount, byDomain };
}
