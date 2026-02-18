"use client";

import { useRouter } from "next/navigation";
import { TCODomain } from "@/types/exam";
import { useEffect, useMemo, useState } from "react";
import { useProgress } from "@/contexts/ProgressContext";
import {
  Heart,
  Sparkles,
  BookOpen,
  Target,
  Trophy,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";

export function HomePage() {
  const router = useRouter();
  const [totalQuestions, setTotalQuestions] = useState<number>(0);
  // Defer heavy question bank import to reduce initial bundle
  useEffect(() => {
    let active = true;
    const idle = (window as any).requestIdleCallback as undefined | ((cb: any) => void);
    const load = async () => {
      try {
        const mod = await import("@/lib/questionLoader");
        if (active) setTotalQuestions(mod.getAllQuestions().length);
      } catch (error) {
        // swallow; keep 0 if not available
      }
    };
    if (idle) idle(load);
    else setTimeout(load, 200);
    return () => {
      active = false;
    };
  }, []);
  const { getDomainStats, state: progressState } = useProgress();
  const tcoDomains = [
    TCODomain.ASKING_QUESTIONS,
    TCODomain.REFINING_TARGETING,
    TCODomain.TAKING_ACTION,
    TCODomain.NAVIGATION_MODULES,
    TCODomain.REPORTING_EXPORT,
  ];
  const domainPerf = useMemo(() => {
    const stats = getDomainStats();
    const map = new Map<string, { score: number; answered: number; correct: number }>();
    for (const s of stats) {
      map.set(s.domain as string, {
        score: s.percentage,
        answered: s.questionsAnswered,
        correct: s.correctAnswers,
      });
    }
    return tcoDomains.map((d) => ({
      domain: d,
      score: map.get(d)?.score ?? 0,
      answered: map.get(d)?.answered ?? 0,
      correct: map.get(d)?.correct ?? 0,
    }));
  }, [getDomainStats]);

  // Weakest domain among those with data
  const weakest = useMemo(() => {
    const withData = domainPerf.filter((d) => d.answered > 0);
    if (withData.length === 0) return null;
    return withData.reduce((min, d) => (d.score < min.score ? d : min), withData[0]);
  }, [domainPerf]);

  // Trend (delta of last two sessions per domain)
  const domainTrends = useMemo(() => {
    const trends = new Map<string, number>();
    const recent = progressState.progress.recentSessions ?? [];
    for (const d of tcoDomains) {
      const ds = recent.filter((s) => s.domain === d).slice(0, 2);
      const delta = ds.length >= 2 ? ds[0].score - ds[1].score : 0;
      trends.set(d, delta);
    }
    return trends;
  }, [progressState.progress.recentSessions]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-cyan-900">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-12 text-center">
          <div className="mb-4 flex items-center justify-center space-x-3">
            <Heart className="h-8 w-8 text-pink-400" />
            <h1 className="text-4xl font-bold text-foreground">Welcome to TCO Preparation</h1>
            <Sparkles className="h-8 w-8 text-[#f97316]" />
          </div>
          <p className="mx-auto max-w-3xl text-xl text-muted-foreground">
            Master the Tanium Certified Operator exam with interactive practice and comprehensive
            study modules
          </p>
        </div>

        {/* Weakest Domain Callout */}
        <div className="mb-6 flex items-center justify-center">
          <div className="rounded-lg border border-yellow-400/40 bg-[#f97316]/10 px-4 py-3 text-[#f97316]">
            {weakest ? (
              <span>
                Weakest domain: <span className="font-semibold">{weakest.domain}</span> — accuracy{" "}
                {weakest.score}%
                <button
                  onClick={() =>
                    router.push(
                      `/practice?domain=${encodeURIComponent(weakest.domain)}&count=25&quick=1&reveal=1`
                    )
                  }
                  className="ml-3 inline-flex items-center rounded bg-[#f97316]/20 px-2 py-1 text-xs text-yellow-100 hover:bg-yellow-500/30"
                >
                  Drill now
                </button>
              </span>
            ) : (
              <span>
                No practice data yet — start a quick drill to identify your weakest domain.
              </span>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mb-12 grid gap-6 md:grid-cols-3">
          <div className="rounded-lg border border-white/20 bg-white/10 p-6 text-center backdrop-blur-sm">
            <Trophy className="mx-auto mb-2 h-8 w-8 text-[#f97316]" />
            <div className="text-2xl font-bold text-foreground">{totalQuestions}</div>
            <p className="text-muted-foreground">Practice Questions</p>
          </div>

          <div className="rounded-lg border border-white/20 bg-white/10 p-6 text-center backdrop-blur-sm">
            <BookOpen className="mx-auto mb-2 h-8 w-8 text-primary" />
            <div className="text-2xl font-bold text-foreground">5</div>
            <p className="text-muted-foreground">Study Domains</p>
          </div>

          <div className="rounded-lg border border-white/20 bg-white/10 p-6 text-center backdrop-blur-sm">
            <Target className="mx-auto mb-2 h-8 w-8 text-[#22c55e]" />
            <div className="text-2xl font-bold text-foreground">78%</div>
            <p className="text-muted-foreground">Average Score</p>
          </div>
        </div>

        {/* Study Domains */}
        <div className="space-y-6">
          <h2 className="text-center text-2xl font-bold text-foreground">Study Domains</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Asking Questions",
                desc: "Master Tanium's query system",
                progress: 72,
                domain: TCODomain.ASKING_QUESTIONS,
              },
              {
                title: "Refining Questions & Targeting",
                desc: "Advanced computer group management",
                progress: 85,
                domain: TCODomain.REFINING_TARGETING,
              },
              {
                title: "Taking Action",
                desc: "Package deployment workflows",
                progress: 58,
                domain: TCODomain.TAKING_ACTION,
              },
              {
                title: "Navigation & Module Functions",
                desc: "Console navigation expertise",
                progress: 43,
                domain: TCODomain.NAVIGATION_MODULES,
              },
              {
                title: "Reporting & Data Export",
                desc: "Data export and reporting",
                progress: 67,
                domain: TCODomain.REPORTING_EXPORT,
              },
              { title: "Mock Exam", desc: "Full TCO simulation", progress: 0, domain: null },
            ].map((d, index) => (
              <div
                key={index}
                className="cursor-pointer rounded-lg border border-white/20 bg-white/10 p-6 backdrop-blur-sm transition-colors hover:bg-white/15"
              >
                <h3 className="mb-2 text-lg font-semibold text-foreground">{d.title}</h3>
                <p className="mb-4 text-sm text-muted-foreground">{d.desc}</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium text-foreground">{d.progress}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-700">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-primary transition-all duration-300"
                      style={{ width: `${d.progress}%` }}
                    ></div>
                  </div>
                </div>
                {d.domain ? (
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() =>
                        router.push(
                          `/practice?domain=${encodeURIComponent(d.domain)}&count=25&quick=1&reveal=1`
                        )
                      }
                      className="rounded-md bg-blue-600 px-3 py-2 text-sm text-foreground hover:bg-blue-700"
                    >
                      Quick Drill (25)
                    </button>
                  </div>
                ) : (
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => router.push("/mock?variant=A")}
                      className="rounded-md bg-accent px-3 py-2 text-sm text-foreground hover:bg-purple-700"
                    >
                      Start Mock Exam
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Your Domain Performance */}
        <div className="space-y-6">
          <h2 className="text-center text-2xl font-bold text-foreground">
            Your Domain Performance
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
            {domainPerf.map((d) => (
              <div
                key={d.domain}
                className="rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur-sm"
              >
                <div className="mb-1 text-sm text-muted-foreground">{d.domain}</div>
                <div className="text-2xl font-bold text-foreground">{d.score}%</div>
                <div className="text-xs text-muted-foreground">Accuracy</div>
                <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  {(() => {
                    const delta = domainTrends.get(d.domain) || 0;
                    if (delta > 0)
                      return (
                        <>
                          <ArrowUpRight className="h-3 w-3 text-[#22c55e]" />{" "}
                          <span className="text-[#22c55e]">+{delta}</span>
                        </>
                      );
                    if (delta < 0)
                      return (
                        <>
                          <ArrowDownRight className="h-3 w-3 text-red-400" />{" "}
                          <span className="text-red-400">{delta}</span>
                        </>
                      );
                    return (
                      <>
                        <Minus className="h-3 w-3 text-muted-foreground" />{" "}
                        <span className="text-muted-foreground">0</span>
                      </>
                    );
                  })()}
                </div>
                <div className="mt-2 text-sm text-foreground/90">
                  {d.correct}/{d.answered} correct
                </div>
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={() =>
                      router.push(
                        `/practice?domain=${encodeURIComponent(d.domain)}&count=25&quick=1&reveal=1`
                      )
                    }
                    className="rounded bg-blue-600 px-2 py-1 text-xs text-foreground hover:bg-blue-700"
                  >
                    Drill 25
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Sessions */}
        <div className="mt-10 space-y-6">
          <h2 className="text-center text-2xl font-bold text-foreground">Recent Sessions</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {(progressState.progress.recentSessions ?? []).slice(0, 6).map((s, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">{s.domain ?? "Mixed"}</div>
                  <div className="text-xl font-semibold text-foreground">{s.score}%</div>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {s.questions} questions • {Math.round((s.time ?? 0) / 60)} min •{" "}
                  {new Date(s.at).toLocaleString()}
                </div>
                <div className="mt-3 flex justify-end">
                  {s.domain ? (
                    <button
                      onClick={() =>
                        router.push(
                          `/practice?domain=${encodeURIComponent(s.domain ?? "")}&count=${s.questions ?? 25}&quick=1&reveal=1`
                        )
                      }
                      className="rounded bg-blue-600 px-2 py-1 text-xs text-foreground hover:bg-blue-700"
                    >
                      Repeat Drill
                    </button>
                  ) : (
                    <button
                      onClick={() => router.push(`/mock?variant=A`)}
                      className="rounded bg-accent px-2 py-1 text-xs text-foreground hover:bg-purple-700"
                    >
                      Take Mock
                    </button>
                  )}
                </div>
              </div>
            ))}
            {(progressState.progress.recentSessions ?? []).length === 0 && (
              <div className="rounded-lg border border-white/20 bg-white/10 p-6 text-center text-muted-foreground backdrop-blur-sm">
                No recent sessions yet. Start a Quick Drill to see your history here.
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-12 space-y-4 text-center">
          <h3 className="text-xl font-semibold text-foreground">Quick Actions</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => router.push("/modules")}
              className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-foreground transition-colors hover:bg-blue-700"
            >
              Browse Study Modules
            </button>
            <button
              onClick={() => router.push("/practice")}
              className="rounded-lg bg-[#22c55e] px-6 py-3 font-medium text-foreground transition-colors hover:bg-green-700"
            >
              Start Practice Session
            </button>
            <button
              onClick={() => router.push("/mock")}
              className="rounded-lg bg-accent px-6 py-3 font-medium text-foreground transition-colors hover:bg-purple-700"
            >
              Take Mock Exam
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
