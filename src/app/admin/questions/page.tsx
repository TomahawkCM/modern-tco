"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { contentService, type AdminQuestion } from "@/lib/content";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { analytics } from "@/lib/analytics";

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<AdminQuestion[]>([]);
  const [current, setCurrent] = useState<AdminQuestion | null>(null);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      const list = await contentService.list();
      if (!active) return;
      setQuestions(list);
      if (list.length) setCurrent(list[0] || null);
    })();
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return questions;
    return questions.filter((x) =>
      [x.question, x.explanation ?? "", x.category ?? "", x.domain ?? "", (x.tags ?? []).join(",")]
        .join("\n")
        .toLowerCase()
        .includes(q)
    );
  }, [filter, questions]);

  function newQuestion() {
    const q = contentService.newQuestion();
    setCurrent(q);
  }

  async function save() {
    if (!current) return;
    const saved = await contentService.upsert(current);
    void analytics.capture("admin_question_save", { id: saved.id });
    setQuestions((prev) => {
      const idx = prev.findIndex((p) => p.id === saved.id);
      const copy = [...prev];
      if (idx >= 0) copy[idx] = saved; else copy.unshift(saved);
      return copy;
    });
  }

  async function remove(id: string) {
    await contentService.remove(id);
    void analytics.capture("admin_question_delete", { id });
    setQuestions((prev) => prev.filter((p) => p.id !== id));
    if (current?.id === id) setCurrent(null);
  }

  return (
    <AdminGuard>
    <div className="mx-auto grid max-w-6xl gap-6 p-6 md:grid-cols-[1fr,2fr]">
      <div className="space-y-4">
        <Card className="glass border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Input placeholder="Filter..." value={filter} onChange={(e) => setFilter(e.target.value)} />
            <div className="max-h-[60vh] overflow-auto">
              <ul className="divide-y divide-white/10">
                {filtered.map((q) => (
                  <li key={q.id} className="flex items-center justify-between py-2">
                    <button className="text-left text-sm text-gray-100 hover:underline" onClick={() => setCurrent(q)}>
                      {q.question || <span className="italic text-gray-400">(untitled)</span>}
                    </button>
                    <div className="flex items-center gap-2">
                      {q.domain && <Badge variant="secondary">{q.domain}</Badge>}
                      <Button size="sm" variant="destructive" onClick={() => remove(q.id)}>Delete</Button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <Button onClick={newQuestion}>New Question</Button>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card className="glass border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Editor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!current ? (
              <div className="text-sm text-gray-300">Select a question or create a new one.</div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void save();
                }}
                className="space-y-3"
              >
                <div>
                  <Label className="text-gray-300">Question</Label>
                  <Textarea value={current.question} onChange={(e) => setCurrent({ ...current, question: e.target.value })} className="min-h-[100px]" />
                </div>
                <div className="grid gap-2 md:grid-cols-2">
                  {current.options.map((opt, i) => (
                    <div key={opt.id}>
                      <Label className="text-gray-300">Option {opt.id}</Label>
                      <Input
                        value={opt.text}
                        onChange={(e) => {
                          const copy = [...current.options];
                          copy[i] = { ...opt, text: e.target.value };
                          setCurrent({ ...current, options: copy });
                        }}
                      />
                    </div>
                  ))}
                </div>
                <div className="grid gap-2 md:grid-cols-2">
                  <div>
                    <Label className="text-gray-300">Correct Answer (A-D)</Label>
                    <Input value={current.correctAnswer} onChange={(e) => setCurrent({ ...current, correctAnswer: e.target.value.toUpperCase() })} />
                  </div>
                  <div>
                    <Label className="text-gray-300">Domain</Label>
                    <Input value={current.domain ?? ""} onChange={(e) => setCurrent({ ...current, domain: e.target.value })} />
                  </div>
                </div>
                <div className="grid gap-2 md:grid-cols-3">
                  <div>
                    <Label className="text-gray-300">Difficulty</Label>
                    <Input value={current.difficulty ?? ""} onChange={(e) => setCurrent({ ...current, difficulty: e.target.value })} />
                  </div>
                  <div>
                    <Label className="text-gray-300">Category</Label>
                    <Input value={current.category ?? ""} onChange={(e) => setCurrent({ ...current, category: e.target.value })} />
                  </div>
                  <div>
                    <Label className="text-gray-300">Tags (comma)</Label>
                    <Input
                      value={(current.tags ?? []).join(", ")}
                      onChange={(e) => setCurrent({ ...current, tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })}
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-gray-300">Explanation</Label>
                  <Textarea value={current.explanation ?? ""} onChange={(e) => setCurrent({ ...current, explanation: e.target.value })} className="min-h-[80px]" />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="bg-tanium-accent">Save</Button>
                  <Button type="button" variant="outline" onClick={() => setCurrent(contentService.newQuestion())}>Reset</Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </AdminGuard>
  );
}
