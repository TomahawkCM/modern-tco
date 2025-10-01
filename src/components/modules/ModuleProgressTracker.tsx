"use client";

/**
 * Client Component for Module Progress Tracking
 * Handles interactive progress features and state management
 */

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Book, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useDatabase } from "@/contexts/DatabaseContext";
import { analytics } from "@/lib/analytics";

interface ModuleProgressTrackerProps {
  moduleId: string;
  moduleTitle: string;
  content: string;
}

interface SectionState {
  id: string;
  title: string;
  level: number;
  completed: boolean;
  needsReview: boolean;
  etaMin?: number;
}

export default function ModuleProgressTracker({
  moduleId,
  moduleTitle,
  content,
}: ModuleProgressTrackerProps) {
  const { user } = useAuth();
  const db = useDatabase();

  const [sections, setSections] = useState<SectionState[]>([]);
  const [lastViewed, setLastViewed] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [timeSpent, setTimeSpent] = useState(0);

  const storageKey = `tco-study-progress:${moduleId}`;

  function slugify(s: string) {
    return s
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
  }

  function stripEtaSuffix(title: string) {
    return title.replace(/\s*\((?:\d+(?:\.\d+)?\s*(?:min|minutes|m|h|hour|hours))\)\s*$/i, "").trim();
  }

  function formatMinutes(min?: number) {
    if (!min || min <= 0) return "0m";
    if (min < 60) return `${min}m`;
    const h = Math.floor(min / 60);
    const m = min % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }

  // Parse sections from content
  useEffect(() => {
    const headingRegex = /^#{1,3}\s+(.+)$/gm;
    const matches = [...content.matchAll(headingRegex)];

    const discovered: SectionState[] = matches.map((match) => {
      const level = match[0].indexOf("#") === 0 ? match[0].lastIndexOf("#") + 1 : 1;
      const title = match[1].trim();
      const id = slugify(title);

      let etaMin: number | undefined;
      const tm = title.match(/\(([^)]+)\)\s*$/);
      if (tm) {
        const t = tm[1].toLowerCase();
        const m = t.match(/^(\d+(?:\.\d+)?)\s*(min|minutes|m|h|hour|hours)$/);
        if (m) {
          const val = parseFloat(m[1]);
          etaMin = /h/.test(m[2]) ? Math.round(val * 60) : Math.round(val);
        }
      }

      const existing = sections.find((s) => s.id === id);
      return existing ?? { id, title, level, completed: false, needsReview: false, etaMin };
    });

    setSections(discovered);
  }, [content]);

  // Load persisted progress
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed?.lastViewed) setLastViewed(parsed.lastViewed);
      if (Array.isArray(parsed?.sections)) setSections(parsed.sections);
    } catch {}
  }, [storageKey]);

  // Persist progress
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ sections, lastViewed }));
    } catch {}
  }, [sections, lastViewed, storageKey]);

  // Track time spent
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSpent((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Mark section complete/needs review
  const markSection = async (id: string, status: "completed" | "needs_review" | "in_progress" | "not_started") => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, completed: status === "completed", needsReview: status === "needs_review" } : s
      )
    );

    void analytics.capture("study_section_mark", { moduleId, id, status });

    if (!user) return;
    try {
      await db.upsertUserStudyProgress({ module_id: moduleId, section_id: id, status });
    } catch {}
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setLastViewed(sectionId);
      setActiveId(sectionId);
      void analytics.capture("study_section_view", { moduleId, id: sectionId });
    }
  };

  const completedCount = sections.filter((s) => s.completed).length;
  const progress = sections.length > 0 ? Math.round((completedCount / sections.length) * 100) : 0;
  const totalEta = sections.reduce((sum, s) => sum + (s.etaMin ?? 0), 0);
  const remainingEta = sections.reduce((sum, s) => sum + (s.completed ? 0 : s.etaMin ?? 0), 0);

  return (
    <div className="sticky top-24 space-y-4">
      {/* Progress Summary Card */}
      <Card className="border-cyan-500/30 bg-gradient-to-r from-cyan-950/30 to-blue-950/20">
        <CardContent className="pt-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-cyan-100">Progress</span>
              <span className="text-sm font-semibold text-cyan-100">{progress}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded bg-cyan-900/40">
              <div
                className="h-2 rounded bg-cyan-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-cyan-200">Time Spent</span>
                <div className="font-semibold text-cyan-100">{formatTime(timeSpent)}</div>
              </div>
              <div>
                <span className="text-cyan-200">Remaining</span>
                <div className="font-semibold text-cyan-100">{formatMinutes(remainingEta)}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Study Progress Card */}
      <Card className="border-blue-500/30 bg-gradient-to-b from-gray-900/50 to-blue-900/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-blue-200 text-base">
            <Book className="h-4 w-4" /> Study Progress
          </CardTitle>
          {lastViewed && (
            <CardDescription>
              <Button
                size="sm"
                className="mt-2 bg-cyan-700 hover:bg-cyan-600"
                onClick={() => scrollToSection(lastViewed)}
              >
                Continue where you left off
              </Button>
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-2 mb-4">
            <Button
              size="sm"
              className="w-full bg-green-700 hover:bg-green-600"
              onClick={async () => {
                for (const s of sections) {
                  if (!s.completed) await markSection(s.id, "completed");
                }
              }}
            >
              Mark all complete
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="w-full border-gray-600 text-gray-200 hover:bg-gray-900/30"
              onClick={() => {
                setSections((prev) => prev.map((s) => ({ ...s, completed: false, needsReview: false })));
              }}
            >
              Reset progress
            </Button>
          </div>

          <ul className="space-y-2">
            {sections.map((s) => (
              <li key={s.id} className={cn("flex items-start gap-2", activeId === s.id ? "opacity-100" : "opacity-80")}>
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={s.completed}
                  onChange={(e) => markSection(s.id, e.target.checked ? "completed" : "in_progress")}
                  aria-label={`Mark ${s.title} complete`}
                />
                <button
                  className={cn(
                    "text-left text-sm hover:underline flex-1",
                    activeId === s.id ? "text-cyan-300" : "text-blue-100"
                  )}
                  onClick={() => scrollToSection(s.id)}
                >
                  {stripEtaSuffix(s.title)}
                </button>
                {typeof s.etaMin === "number" && s.etaMin > 0 && (
                  <span className="ml-2 inline-flex items-center gap-1 text-[11px] text-gray-300">
                    <Clock className="h-3 w-3" /> {s.etaMin}m
                  </span>
                )}
                {!s.completed && (
                  <button
                    className="ml-auto text-[11px] text-yellow-300 hover:underline"
                    onClick={() => markSection(s.id, "needs_review")}
                    aria-label={`Mark ${s.title} needs review`}
                  >
                    flag
                  </button>
                )}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}