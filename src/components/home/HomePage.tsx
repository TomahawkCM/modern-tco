"use client";

import { useRouter } from "next/navigation";
import { TCODomain } from "@/types/exam";
import { useEffect, useMemo, useState } from "react";
import { useProgress } from "@/contexts/ProgressContext";
import { Heart, Sparkles, BookOpen, Target, Trophy, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

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
      } catch {
        // swallow; keep 0 if not available
      }
    };
    if (idle) idle(load);
    else setTimeout(load, 200);
    return () => { active = false; };
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
      map.set(s.domain as string, { score: s.percentage, answered: s.questionsAnswered, correct: s.correctAnswers });
    }
    return tcoDomains.map((d) => ({
      domain: d,
      score: map.get(d)?.score || 0,
      answered: map.get(d)?.answered || 0,
      correct: map.get(d)?.correct || 0,
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
    const recent = progressState.progress.recentSessions || [];
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
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Heart className="h-8 w-8 text-pink-400" />
            <h1 className="text-4xl font-bold text-white">Welcome to TCO Preparation</h1>
            <Sparkles className="h-8 w-8 text-yellow-400" />
          </div>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto">
            Master the Tanium Certified Operator exam with interactive practice and comprehensive study modules
          </p>
        </div>

        {/* Weakest Domain Callout */}
        <div className="mb-6 flex items-center justify-center">
          <div className="rounded-lg border border-yellow-400/40 bg-yellow-500/10 px-4 py-3 text-yellow-200">
            {weakest ? (
              <span>
                Weakest domain: <span className="font-semibold">{weakest.domain}</span> — accuracy {weakest.score}%
                <button
                  onClick={() => router.push(`/practice?domain=${encodeURIComponent(weakest.domain)}&count=25&quick=1&reveal=1`)}
                  className="ml-3 inline-flex items-center rounded bg-yellow-500/20 px-2 py-1 text-xs text-yellow-100 hover:bg-yellow-500/30"
                >
                  Drill now
                </button>
              </span>
            ) : (
              <span>No practice data yet — start a quick drill to identify your weakest domain.</span>
            )}
          </div>
        </div>

        {/* Quick Stats */}
          <div className="grid gap-6 md:grid-cols-3 mb-12">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 text-center">
              <Trophy className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{totalQuestions}</div>
              <p className="text-gray-300">Practice Questions</p>
            </div>
          
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 text-center">
            <BookOpen className="h-8 w-8 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">5</div>
            <p className="text-gray-300">Study Domains</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 text-center">
            <Target className="h-8 w-8 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">78%</div>
            <p className="text-gray-300">Average Score</p>
          </div>
        </div>

        {/* Study Domains */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white text-center">Study Domains</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "Asking Questions", desc: "Master Tanium's query system", progress: 72, domain: TCODomain.ASKING_QUESTIONS },
              { title: "Refining Questions & Targeting", desc: "Advanced computer group management", progress: 85, domain: TCODomain.REFINING_TARGETING },
              { title: "Taking Action", desc: "Package deployment workflows", progress: 58, domain: TCODomain.TAKING_ACTION },
              { title: "Navigation & Module Functions", desc: "Console navigation expertise", progress: 43, domain: TCODomain.NAVIGATION_MODULES },
              { title: "Reporting & Data Export", desc: "Data export and reporting", progress: 67, domain: TCODomain.REPORTING_EXPORT },
              { title: "Mock Exam", desc: "Full TCO simulation", progress: 0, domain: null }
            ].map((d, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 hover:bg-white/15 transition-colors cursor-pointer">
                <h3 className="text-lg font-semibold text-white mb-2">{d.title}</h3>
                <p className="text-gray-300 text-sm mb-4">{d.desc}</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Progress</span>
                    <span className="text-white font-medium">{d.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${d.progress}%` }}
                    ></div>
                  </div>
                </div>
                {d.domain ? (
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => router.push(`/practice?domain=${encodeURIComponent(d.domain)}&count=25&quick=1&reveal=1`)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm"
                    >
                      Quick Drill (25)
                    </button>
                  </div>
                ) : (
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => router.push("/mock?variant=A")}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-md text-sm"
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
          <h2 className="text-2xl font-bold text-white text-center">Your Domain Performance</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
            {domainPerf.map((d) => (
              <div key={d.domain} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
                <div className="text-sm text-blue-200 mb-1">{d.domain}</div>
                <div className="text-white text-2xl font-bold">{d.score}%</div>
                <div className="text-xs text-gray-300">Accuracy</div>
                <div className="mt-1 text-xs text-gray-300 flex items-center gap-1">
                  {(() => {
                    const delta = domainTrends.get(d.domain) || 0;
                    if (delta > 0) return (<><ArrowUpRight className="h-3 w-3 text-green-400" /> <span className="text-green-400">+{delta}</span></>);
                    if (delta < 0) return (<><ArrowDownRight className="h-3 w-3 text-red-400" /> <span className="text-red-400">{delta}</span></>);
                    return (<><Minus className="h-3 w-3 text-gray-400" /> <span className="text-gray-400">0</span></>);
                  })()}
                </div>
                <div className="mt-2 text-white/90 text-sm">
                  {d.correct}/{d.answered} correct
                </div>
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={() => router.push(`/practice?domain=${encodeURIComponent(d.domain)}&count=25&quick=1&reveal=1`)}
                    className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded"
                  >
                    Drill 25
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Sessions */}
        <div className="space-y-6 mt-10">
          <h2 className="text-2xl font-bold text-white text-center">Recent Sessions</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {(progressState.progress.recentSessions || []).slice(0,6).map((s, idx) => (
              <div key={idx} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-blue-200">
                    {s.domain || 'Mixed'}
                  </div>
                  <div className="text-white text-xl font-semibold">{s.score}%</div>
                </div>
                <div className="mt-1 text-xs text-gray-300">
                  {s.questions} questions • {Math.round((s.time||0)/60)} min • {new Date(s.at).toLocaleString()}
                </div>
                <div className="mt-3 flex justify-end">
                  {s.domain ? (
                    <button
                      onClick={() => router.push(`/practice?domain=${encodeURIComponent(s.domain || '')}&count=${s.questions || 25}&quick=1&reveal=1`)}
                      className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded"
                    >
                      Repeat Drill
                    </button>
                  ) : (
                    <button
                      onClick={() => router.push(`/mock?variant=A`)}
                      className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded"
                    >
                      Take Mock
                    </button>
                  )}
                </div>
              </div>
            ))}
            {((progressState.progress.recentSessions || []).length === 0) && (
              <div className="text-center text-gray-300 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
                No recent sessions yet. Start a Quick Drill to see your history here.
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-12 text-center space-y-4">
          <h3 className="text-xl font-semibold text-white">Quick Actions</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => router.push("/modules")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Browse Study Modules
            </button>
            <button
              onClick={() => router.push("/practice")}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Start Practice Session
            </button>
            <button
              onClick={() => router.push("/mock")}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Take Mock Exam
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
