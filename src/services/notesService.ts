import { supabase } from "@/lib/supabase";
import { createInitialState, schedule, type SRCardState, type SRRating } from "@/lib/sr";
import { User } from "@supabase/supabase-js";

export type Note = {
  id: string;
  userId?: string; // present when synced
  text: string;
  tags: string[];
  createdAt: string; // ISO
  updatedAt: string; // ISO
  srs: SRCardState;
  moduleId?: string | null;
  sectionId?: string | null;
};

const STORAGE_KEY = "tco_notes_v1";

export const notesStorage = {
  get(): Note[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as Note[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },
  set(notes: Note[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  },
  add(note: Note) {
    const cur = notesStorage.get();
    notesStorage.set([note, ...cur]);
  },
  remove(id: string) {
    const cur = notesStorage.get();
    notesStorage.set(cur.filter((n) => n.id !== id));
  },
  upsert(note: Note) {
    const cur = notesStorage.get();
    const idx = cur.findIndex((n) => n.id === note.id);
    if (idx >= 0) cur[idx] = note;
    else cur.unshift(note);
    notesStorage.set(cur);
  },
};

function uuid(): string {
  if (typeof crypto !== "undefined" && typeof (crypto as any).randomUUID === "function") {
    return (crypto as any).randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function buildNote(
  text: string,
  tags: string[] = [],
  opts?: { moduleId?: string | null; sectionId?: string | null }
): Note {
  const id = uuid();
  const ts = new Date().toISOString();
  return {
    id,
    text: text.trim(),
    tags,
    createdAt: ts,
    updatedAt: ts,
    srs: createInitialState(id),
    moduleId: opts?.moduleId ?? null,
    sectionId: opts?.sectionId ?? null,
  };
}

export function mergeByNewest(a: Note[], b: Note[]): Note[] {
  const map = new Map<string, Note>();
  for (const n of [...a, ...b]) {
    const existing = map.get(n.id);
    if (!existing || existing.updatedAt < n.updatedAt) map.set(n.id, n);
  }
  // newest first
  return [...map.values()].sort((x, y) => (x.updatedAt < y.updatedAt ? 1 : -1));
}

export const notesRemote = {
  async list(userId: string): Promise<Note[]> {
    const { data, error } = await (supabase as any)
      .from("notes")
      .select("id, user_id, text, tags, srs, created_at, updated_at, module_id, section_id")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });
    if (error) throw error;
    const notes: Note[] = (data || []).map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      text: row.text,
      tags: Array.isArray(row.tags) ? row.tags : (row.tags || []),
      srs: row.srs || createInitialState(row.id),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      moduleId: row.module_id ?? null,
      sectionId: row.section_id ?? null,
    }));
    return notes;
  },
  async upsert(userId: string, notes: Note | Note[]): Promise<void> {
    const arr = Array.isArray(notes) ? notes : [notes];
    if (arr.length === 0) return;
    const payload = arr.map((n) => ({
      id: n.id,
      user_id: userId,
      text: n.text,
      tags: n.tags,
      srs: n.srs,
      created_at: n.createdAt,
      updated_at: n.updatedAt,
      module_id: n.moduleId ?? null,
      section_id: n.sectionId ?? null,
    }));
    const { error } = await (supabase as any)
      .from("notes")
      .upsert(payload, { onConflict: "id" });
    if (error) throw error;
  },
  async remove(userId: string, id: string): Promise<void> {
    const { error } = await (supabase as any)
      .from("notes")
      .delete()
      .eq("user_id", userId)
      .eq("id", id);
    if (error) throw error;
  },
};

export async function syncNotes(user: User | null): Promise<Note[]> {
  const local = notesStorage.get();
  if (!user?.id) return local;
  try {
    const remote = await notesRemote.list(user.id);
    if (remote.length === 0 && local.length > 0) {
      await notesRemote.upsert(user.id, local);
      return local;
    }
    if (remote.length > 0 && local.length === 0) {
      notesStorage.set(remote);
      return remote;
    }
    const merged = mergeByNewest(local, remote);
    await notesRemote.upsert(user.id, merged);
    notesStorage.set(merged);
    return merged;
  } catch (e) {
    // If Supabase fails, stay local
    return local;
  }
}

export async function saveQuickNote(
  text: string,
  opts?: { tags?: string[]; user?: User | null; moduleId?: string | null; sectionId?: string | null }
) {
  const note = buildNote(text, opts?.tags || [], { moduleId: opts?.moduleId, sectionId: opts?.sectionId });
  notesStorage.add(note);
  if (opts?.user?.id) {
    try {
      await notesRemote.upsert(opts.user.id, note);
    } catch {
      // ignore remote failure
    }
  }
  return note;
}

export async function rateNote(note: Note, rating: SRRating, user?: User | null): Promise<Note> {
  const updated = { ...note, srs: schedule(note.srs, rating), updatedAt: new Date().toISOString() };
  notesStorage.upsert(updated);
  if (user?.id) {
    try {
      await notesRemote.upsert(user.id, updated);
    } catch {}
  }
  return updated;
}

export async function updateNote(note: Note, user?: User | null): Promise<Note> {
  const updated = { ...note, updatedAt: new Date().toISOString() };
  notesStorage.upsert(updated);
  if (user?.id) {
    try { await notesRemote.upsert(user.id, updated); } catch {}
  }
  return updated;
}

export async function deleteNote(id: string, user?: User | null): Promise<void> {
  notesStorage.remove(id);
  if (user?.id) {
    try { await notesRemote.remove(user.id, id); } catch {}
  }
}

export const notesService = {
  STORAGE_KEY,
  buildNote,
  syncNotes,
  saveQuickNote,
  rateNote,
  updateNote,
  deleteNote,
  getLocal: notesStorage.get,
  setLocal: notesStorage.set,
};
