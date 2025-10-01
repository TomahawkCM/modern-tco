"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { isDue, getDueQueue, type SRRating, nextDue } from "@/lib/sr";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  notesService,
  type Note,
  syncNotes,
  updateNote as updateNoteRemote,
  deleteNote as deleteNoteRemote,
  rateNote as rateNoteRemote,
} from "@/services/notesService";
import { analytics } from "@/lib/analytics";

function formatDue(due: Date): string {
  const now = new Date();
  const diff = due.getTime() - now.getTime();
  const abs = Math.abs(diff);
  const minutes = Math.round(abs / (60 * 1000));
  const hours = Math.round(abs / (60 * 60 * 1000));
  const days = Math.round(abs / (24 * 60 * 60 * 1000));

  if (Math.abs(diff) < 60 * 1000) return diff >= 0 ? "in < 1 min" : "due now";
  if (abs < 60 * 60 * 1000) return diff >= 0 ? `in ${minutes} min` : `${minutes} min overdue`;
  if (abs < 24 * 60 * 60 * 1000) return diff >= 0 ? `in ${hours} h` : `${hours} h overdue`;
  return diff >= 0 ? `in ${days} d` : `${days} d overdue`;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [text, setText] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  // Use a non-empty sentinel for "Unassigned" because Radix Select disallows empty string values
  const UNASSIGNED = "__unassigned__";
  const [selectedSectionId, setSelectedSectionId] = useState<string>(UNASSIGNED);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { user } = useAuth();

  const [sections, setSections] = useState<Array<{ id: string; title: string; module_id: string }>>([]);
  const [modulesMap, setModulesMap] = useState<Record<string, string>>({});

  useEffect(() => {
    let mounted = true;
    (async () => {
      const initial = await syncNotes(user);
      if (mounted) setNotes(initial);
    })();
    return () => {
      mounted = false;
    };
  }, [user?.id]);

  // Load sections and modules for grouping and selection
  useEffect(() => {
    let active = true;
    (async () => {
      if (!user?.id) {
        setSections([]);
        setModulesMap({});
        return;
      }
      try {
        const [{ data: secs }, { data: mods }] = await Promise.all([
          (supabase as any).from("study_sections").select("id,title,module_id").order("title", { ascending: true }),
          (supabase as any).from("study_modules").select("id,title").order("title", { ascending: true }),
        ]);
        if (!active) return;
        const modMap: Record<string, string> = {};
        for (const m of mods ?? []) modMap[m.id] = m.title;
        setModulesMap(modMap);
        setSections((secs ?? []).map((s: any) => ({ id: s.id, title: s.title, module_id: s.module_id })));
      } catch (error) {
        // ignore fetch errors; selection will be disabled
      }
    })();
    return () => {
      active = false;
    };
  }, [user?.id]);

  const dueQueue = useMemo(() => getDueQueue(notes.map((n) => n.srs)), [notes]);
  const nextDueNote = useMemo(() => {
    if (dueQueue.length === 0) return null;
    const first = dueQueue[0];
    return notes.find((n) => n.id === first.id) || null;
  }, [dueQueue, notes]);

  async function handleAddOrUpdate() {
    const trimmed = text.trim();
    if (!trimmed) return;
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const pickedSection = selectedSectionId === UNASSIGNED ? null : (sections.find((s) => s.id === selectedSectionId) || null);
    const moduleId = pickedSection?.module_id ?? null;
    const sectionId = pickedSection?.id ?? null;

    if (editingId) {
      const existing = notes.find((n) => n.id === editingId);
      if (existing) {
        const updated = await updateNoteRemote(
          { ...existing, text: trimmed, tags, moduleId, sectionId },
          user
        );
        setNotes((prev) => prev.map((n) => (n.id === editingId ? updated : n)));
      }
      setEditingId(null);
    } else {
      const note = notesService.buildNote(trimmed, tags, { moduleId, sectionId });
      notesService.setLocal([note, ...notes]);
      setNotes((prev) => [note, ...prev]);
      void analytics.capture("note_add", { tags: note.tags, hasSection: Boolean(note.sectionId) });
      // fire-and-forget remote upsert
      if (user?.id) {
        try { await (await import("@/services/notesService")).notesRemote.upsert(user.id, note); } catch {}
      }
    }
    setText("");
    setTagsInput("");
    setSelectedSectionId(UNASSIGNED);
  }

  function handleEdit(n: Note) {
    setEditingId(n.id);
    setText(n.text);
    setTagsInput(n.tags.join(", "));
    setSelectedSectionId(n.sectionId ?? UNASSIGNED);
  }

  async function handleDelete(id: string) {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    await deleteNoteRemote(id, user);
    if (editingId === id) {
      setEditingId(null);
      setText("");
      setTagsInput("");
    }
  }

  async function handleRate(note: Note, rating: SRRating) {
    const updated = await rateNoteRemote(note, rating, user);
    setNotes((prev) => prev.map((n) => (n.id === note.id ? updated : n)));
  }

  const sortedNotes = useMemo(
    () => [...notes].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1)),
    [notes]
  );

  // Group notes by section
  const sectionsById = useMemo(() => {
    const m = new Map<string, { id: string; title: string; module_id: string }>();
    for (const s of sections) m.set(s.id, s);
    return m;
  }, [sections]);

  const groupedBySection = useMemo(() => {
    const groups: Record<string, Note[]> = {};
    for (const n of sortedNotes) {
      const key = n.sectionId ?? "__unassigned__";
      if (!groups[key]) groups[key] = [];
      groups[key].push(n);
    }
    const entries = Object.entries(groups).map(([key, items]) => {
      if (key === "__unassigned__") return { key, label: "Unassigned", items };
      const sec = sectionsById.get(key);
      const modTitle = sec ? modulesMap[sec.module_id] : undefined;
      const label = sec ? `${modTitle ? `${modTitle  } — ` : ""}${sec.title}` : "Unknown Section";
      return { key, label, items };
    });
    // Sort groups by label
    return entries.sort((a, b) => a.label.localeCompare(b.label));
  }, [sortedNotes, sectionsById, modulesMap]);

  const totalDue = dueQueue.length;

  return (
    <div className="mx-auto max-w-6xl p-6 text-gray-900">
      <h1 className="mb-6 text-2xl font-semibold text-white">Notes & Spaced Repetition (MVP)</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{editingId ? "Edit Note" : "Add Note"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write your note, summary, or key fact..."
              className="min-h-[120px]"
            />
            <div className="grid grid-cols-1 gap-2">
              <Label className="text-sm text-gray-200">Section (optional)</Label>
              <Select value={selectedSectionId} onValueChange={(v) => setSelectedSectionId(v)}>
                <SelectTrigger>
                  <SelectValue placeholder={sections.length ? "Select a section" : "No sections available"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
                  {sections.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {modulesMap[s.module_id] ? `${modulesMap[s.module_id]} — ${s.title}` : s.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Tags (comma-separated), e.g. fundamentals, sensors"
            />
            <div className="flex gap-2">
              <Button onClick={handleAddOrUpdate}>{editingId ? "Save" : "Add"}</Button>
              {editingId && (
                <Button variant="outline" onClick={() => { setEditingId(null); setText(""); setTagsInput(""); }}>
                  Cancel
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Review Queue ({totalDue} due)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {nextDueNote ? (
              <div>
                <div className="mb-3 text-sm text-gray-600">
                  Next due {formatDue(nextDue(nextDueNote.srs))}
                </div>
                <div className="rounded-md bg-gray-50 p-4 text-gray-800">
                  {nextDueNote.text}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button variant="destructive" onClick={() => handleRate(nextDueNote, 'again')}>Again</Button>
                  <Button variant="outline" onClick={() => handleRate(nextDueNote, 'hard')}>Hard</Button>
                  <Button onClick={() => handleRate(nextDueNote, 'good')}>Good</Button>
                  <Button variant="secondary" onClick={() => handleRate(nextDueNote, 'easy')}>Easy</Button>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-600">No notes are due now. Add notes or come back later!</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Your Notes ({notes.length}) — Grouped by Section</CardTitle>
        </CardHeader>
        <CardContent>
          {sortedNotes.length === 0 ? (
            <div className="text-sm text-gray-600">No notes yet. Add your first note above.</div>
          ) : (
            <div className="space-y-6">
              {groupedBySection.map((grp) => (
                <div key={grp.key}>
                  <div className="mb-2 text-sm font-medium text-gray-200">{grp.label}</div>
                  <ul className="divide-y divide-gray-200">
                    {grp.items.map((n) => (
                      <li key={n.id} className="flex items-start justify-between gap-4 py-3">
                        <div className="min-w-0 flex-1">
                          <div className="whitespace-pre-wrap break-words text-gray-100">{n.text}</div>
                          <div className="mt-1 text-xs text-gray-400">
                            Next review: {isDue(n.srs) ? (
                              <span className="font-medium text-red-400">due now</span>
                            ) : (
                              <span>{formatDue(nextDue(n.srs))}</span>
                            )}
                            {n.tags.length > 0 && (
                              <span className="ml-2">• Tags: {n.tags.join(", ")}</span>
                            )}
                          </div>
                        </div>
                        <div className="shrink-0 space-x-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(n)}>Edit</Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(n.id)}>Delete</Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
