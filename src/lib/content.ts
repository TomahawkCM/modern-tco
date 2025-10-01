import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export type AdminChoice = { id: string; text: string };
export interface AdminQuestion {
  id: string;
  question: string;
  options: AdminChoice[];
  correctAnswer: string;
  explanation?: string | null;
  difficulty?: string | null;
  category?: string | null;
  tags?: string[] | null;
  domain?: string | null;
}

const LS_KEY = "tco_admin_questions_v1";

function lsGet(): AdminQuestion[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function lsSet(qs: AdminQuestion[]) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(qs)); } catch {}
}

function uuid(): string {
  if (typeof crypto !== "undefined" && (crypto as any).randomUUID) return (crypto as any).randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export const contentService = {
  newQuestion(): AdminQuestion {
    return {
      id: uuid(),
      question: "",
      options: [
        { id: "A", text: "" },
        { id: "B", text: "" },
        { id: "C", text: "" },
        { id: "D", text: "" },
      ],
      correctAnswer: "A",
      explanation: "",
      difficulty: "beginner",
      category: "",
      tags: [],
      domain: "",
    };
  },

  async list(limit = 200): Promise<AdminQuestion[]> {
    if (typeof window === "undefined") return [];
    const local = lsGet();
    try {
      const { data, error } = await (supabase as any)
        .from("questions")
        .select("id,question,options,correct_answer,explanation,difficulty,category,tags,domain")
        .order("updated_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      const remote: AdminQuestion[] = (data || []).map((r: any) => ({
        id: r.id,
        question: r.question,
        options: Array.isArray(r.options) ? r.options : [],
        correctAnswer: r.correct_answer || "",
        explanation: r.explanation,
        difficulty: r.difficulty,
        category: r.category,
        tags: r.tags || [],
        domain: r.domain,
      }));
      if (remote.length) lsSet(remote);
      return remote.length ? remote : local;
    } catch (error) {
      return local;
    }
  },

  async upsert(q: AdminQuestion, user?: User | null): Promise<AdminQuestion> {
    if (typeof window !== "undefined") {
      const cur = lsGet();
      const idx = cur.findIndex((x) => x.id === q.id);
      if (idx >= 0) cur[idx] = q; else cur.unshift(q);
      lsSet(cur);
    }
    try {
      await (supabase as any)
        .from("questions")
        .upsert({
          id: q.id,
          question: q.question,
          options: q.options,
          correct_answer: q.correctAnswer,
          explanation: q.explanation,
          difficulty: q.difficulty,
          category: q.category,
          tags: q.tags,
          domain: q.domain,
        }, { onConflict: "id" });
    } catch {}
    return q;
  },

  async remove(id: string): Promise<void> {
    if (typeof window !== "undefined") {
      const cur = lsGet().filter((x) => x.id !== id);
      lsSet(cur);
    }
    try { await (supabase as any).from("questions").delete().eq("id", id); } catch {}
  },
};

