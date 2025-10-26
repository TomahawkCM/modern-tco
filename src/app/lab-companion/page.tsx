"use client";

import React, { useEffect, useMemo, useState } from "react";

// ---------------------------------------------
// Tanium Interact Study Lab Companion (Web App)
// Professional Training Workbook — Friendly Mentor Tone
// Features:
// • Sidebar navigation for 6 modules
// • Search + filters (status, module)
// • Per‑lab checklist + expandable steps
// • Notes & reflections with autosave (localStorage)
// • Quiz engine with answer reveal
// • Progress tracker + export/import progress JSON
// • Print-friendly view + dark mode toggle
// • Accessible: keyboard nav, ARIA labels, large touch targets
// ---------------------------------------------

// ======= Data Model =======
const MODULES = [
  {
    id: "m1",
    title: "Module 1 — Asking Questions",
    objective:
      "Get comfortable with sensors, Get/From clauses, and live vs cached results.",
    examTag: "TCO Domain 1.2 — Asking Questions",
    labs: [
      {
        id: "m1-l1",
        title: "Ask a basic question: Computer Name",
        steps: [
          "Open Interact → Ask a Question.",
          "Type: Get Computer Name from all machines.",
          "Run and observe response count and timings.",
        ],
      },
      {
        id: "m1-l2",
        title: "Add multiple sensors (OS, IP)",
        steps: [
          "Ask: Get Operating System, IP Address from all machines.",
          "Sort and filter the grid; add/remove columns.",
        ],
      },
      {
        id: "m1-l3",
        title: "Filter by OS contains 'Windows'",
        steps: [
          "Ask: Get Computer Name from all machines whose Operating System contains 'Windows'.",
          "Compare to an unfiltered run: note any performance/freshness differences.",
        ],
      },
      {
        id: "m1-l4",
        title: "Compare live vs cached results",
        steps: [
          "Run a question live, then re-run to view cached behavior.",
          "Record observations in the Reflection box.",
        ],
      },
      {
        id: "m1-l5",
        title: "Save & re-ask a question",
        steps: [
          "Save your frequent question as a Saved Question.",
          "Re-ask it and confirm consistency of results.",
        ],
      },
      {
        id: "m1-l6",
        title: "Sensor Status overview",
        steps: [
          "Ask: Get Sensor Status from all machines.",
          "Identify non-responsive endpoints and note patterns.",
        ],
      },
      {
        id: "m1-l7",
        title: "Parameterized sensor: Folder Exists[\\path]",
        steps: [
          "Ask: Get Folder Exists[C:\\\\Program Files\\\\].",
          "Try a vendor path (e.g., Bluebeam) and compare response patterns.",
        ],
      },
      {
        id: "m1-l8",
        title: "Export results",
        steps: [
          "Export grid to CSV.",
          "Note: what columns were most useful for deployment decisions?",
        ],
      },
    ],
    reflection:
      "Which sensors responded fastest, and when would you rely on cached results?",
  },
  {
    id: "m2",
    title: "Module 2 — Question Builder",
    objective:
      "Design valid questions visually: dropdowns, parameters, AND/OR logic.",
    examTag: "TCO Domain 1.3 — Building & Managing Questions",
    labs: [
      {
        id: "m2-l1",
        title: "Installed Applications contains 'Bluebeam'",
        steps: [
          "Open Interact → Question Builder.",
          "Add sensor: Installed Applications → Contains → 'Bluebeam'.",
          "Ask Question → review the grid.",
        ],
      },
      {
        id: "m2-l2",
        title: "Add OS filter (Windows)",
        steps: [
          "Add AND condition: Operating System contains 'Windows'.",
          "Compare counts before/after the filter.",
        ],
      },
      {
        id: "m2-l3",
        title: "Show Columns: Uptime (days)",
        steps: [
          "Add Uptime (days) to the grid to spot long-running systems.",
        ],
      },
      {
        id: "m2-l4",
        title: "Save 'Bluebeam Audit — Windows'",
        steps: [
          "Save question → give a descriptive name for reuse.",
        ],
      },
      {
        id: "m2-l5",
        title: "Preview before Ask",
        steps: [
          "Use the Builder Preview to validate syntax and scope.",
        ],
      },
      {
        id: "m2-l6",
        title: "Parameterized Folder Exists[Vendor Path]",
        steps: [
          "Add Folder Exists[C:\\\\Program Files\\\\Bluebeam] via builder.",
          "Inspect generated text syntax vs visual config.",
        ],
      },
      {
        id: "m2-l7",
        title: "Manual text vs Builder syntax",
        steps: [
          "Switch to text entry and compare.",
          "Decide when you'd prefer builder vs manual.",
        ],
      },
      {
        id: "m2-l8",
        title: "Template library",
        steps: [
          "Save as template; standardize naming for your team.",
        ],
      },
      {
        id: "m2-l9",
        title: "Windows 11 subset",
        steps: [
          "Modify the saved question to target only Windows 11 endpoints.",
        ],
      },
      {
        id: "m2-l10",
        title: "Compare runs",
        steps: [
          "Run templates side-by-side and document differences.",
        ],
      },
    ],
    reflection:
      "How does the Builder help you avoid syntax errors, and when is manual faster?",
  },
  {
    id: "m3",
    title: "Module 3 — Refining Questions & Targeting",
    objective:
      "Narrow results safely and preview targets before taking action.",
    examTag: "TCO Domain 2.1 — Refining & Targeting",
    labs: [
      {
        id: "m3-l1",
        title: "Re-run 'Bluebeam Audit — Windows'",
        steps: [
          "Open the results grid and review freshness + counts.",
        ],
      },
      {
        id: "m3-l2",
        title: "Filter to Windows 11",
        steps: [
          "Grid filter: Operating System contains 'Windows 11'.",
        ],
      },
      {
        id: "m3-l3",
        title: "Prefix filter",
        steps: [
          "Add Computer Name starts with 'EDM' (or your site code).",
        ],
      },
      {
        id: "m3-l4",
        title: "Safe action preview",
        steps: [
          "Action → Send Message to Console (safe).",
          "Verify Target Preview matches your intention.",
        ],
      },
      {
        id: "m3-l5",
        title: "Dynamic group",
        steps: [
          "Save refined results as dynamic group: 'Win11 — Bluebeam'.",
        ],
      },
      {
        id: "m3-l6",
        title: "Uptime threshold",
        steps: [
          "Ask: Get Uptime (days) → refine to > 7 days.",
        ],
      },
      {
        id: "m3-l7",
        title: "Static vs dynamic",
        steps: [
          "Compare behavior after endpoints change state.",
        ],
      },
      {
        id: "m3-l8",
        title: "Preview before execute",
        steps: [
          "Always use Show Preview; record what you'd verify.",
        ],
      },
      {
        id: "m3-l9",
        title: "Risk reflection",
        steps: [
          "List risks if refinement is skipped; add mitigations.",
        ],
      },
      {
        id: "m3-l10",
        title: "Export refined results",
        steps: [
          "Export grid to CSV for audit or follow-up action.",
        ],
      },
    ],
    reflection:
      "Which refinements most reduced risk before action deployment?",
  },
  // Volume 2
  {
    id: "m4",
    title: "Module 4 — Scenario Practice",
    objective:
      "End-to-end workflows mirroring TCO scenarios.",
    examTag: "TCO Domains 2.2–3.2",
    labs: [
      { id: "m4-l1", title: "Audit Bluebeam on Windows 11", steps: ["Combine sensors + refine + export."] },
      { id: "m4-l2", title: "Uptime > 7 days subset", steps: ["Filter numerics; compare runs."] },
      { id: "m4-l3", title: "Outdated OS builds", steps: ["Identify and document remediation set."] },
      { id: "m4-l4", title: "Saved dynamic group", steps: ["Create, verify auto-update behavior."] },
      { id: "m4-l5", title: "Live vs cached comparison", steps: ["Time-separated reruns; note deltas."] },
      { id: "m4-l6", title: "Sensor health sweep", steps: ["Get Sensor Status + Last Reboot."] },
      { id: "m4-l7", title: "Logical operators mix", steps: ["AND/OR/NOT targeting practice."] },
      { id: "m4-l8", title: "Non-responders analysis", steps: ["Patterns + root-cause notes."] },
      { id: "m4-l9", title: "Report-ready export", steps: ["CSV discipline + naming."] },
      { id: "m4-l10", title: "Presentation of findings", steps: ["Summarize, include screenshots."] },
    ],
    reflection: "What signals show an endpoint is healthy enough for action?",
  },
  {
    id: "m5",
    title: "Module 5 — Challenge Labs",
    objective: "Regex, compliance, hardware inventory, subnet targeting.",
    examTag: "TCO Domain 4.1 — Practical Application",
    labs: [
      { id: "m5-l1", title: "Firewall state compliance", steps: ["Get Windows Firewall State → equals 'On'."] },
      { id: "m5-l2", title: "Hardware audit trio", steps: ["Chassis Type, Memory Size, Manufacturer."] },
      { id: "m5-l3", title: "Regex naming rule", steps: ["Computer Name matches ^EDM.*11$."] },
      { id: "m5-l4", title: "AV vs Firewall cross-check", steps: ["Compare two security sensors."] },
      { id: "m5-l5", title: "Version threshold", steps: ["Installed Applications contains Bluebeam; version < 21."] },
      { id: "m5-l6", title: "Offline patterns", steps: ["Use Sensor Status to spot systemic issues."] },
      { id: "m5-l7", title: "Target subnet", steps: ["Filter IP Address within 10.10.155.*"] },
      { id: "m5-l8", title: "Compound filter", steps: ["OS contains Windows AND Uptime > 10 AND Office present."] },
      { id: "m5-l9", title: "Saved question: High Uptime Windows", steps: ["Create, rerun, document."] },
      { id: "m5-l10", title: "Dynamic refresh validation", steps: ["Confirm results change over 24h."] },
    ],
    reflection: "Where did regex provide the biggest precision gain?",
  },
  {
    id: "m6",
    title: "Module 6 — Knowledge Review",
    objective: "30 exam-style questions + answer key for self-check.",
    examTag: "Comprehensive Review",
    labs: [],
    quiz: {
      items: [
        { q: "What does the From clause control?", a: "Which endpoints respond to the question." },
        { q: "Which sensor retrieves software installation info?", a: "Installed Applications." },
        { q: "Cached vs live results?", a: "Cached = stored; Live = freshly queried." },
        { q: "Benefit of parameterized sensors?", a: "Flexible inputs like paths or names." },
        { q: "Two benefits of Saved Questions?", a: "Reusability and dashboard/report integration." },
      ],
    },
    reflection: "Which domains feel strongest/weakest before your exam?",
  },
];

// ======= Utilities =======
const STORAGE_KEY = "tanium-lab-companion-progress-v1";

interface ProgressState {
  completed: Record<string, boolean>;
  notes: Record<string, string>;
  dark: boolean;
}

function useLocalProgress(): [ProgressState, React.Dispatch<React.SetStateAction<ProgressState>>] {
  const [state, setState] = useState<ProgressState>(() => {
    if (typeof window === 'undefined') {
      return { completed: {}, notes: {}, dark: false };
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : { completed: {}, notes: {}, dark: false };
    } catch {
      return { completed: {}, notes: {}, dark: false };
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [state]);

  return [state, setState];
}

function classNames(...xs: (string | boolean | undefined)[]) {
  return xs.filter(Boolean).join(" ");
}

// ======= Components =======
interface SidebarProps {
  current: string;
  onSelect: (id: string) => void;
  progress: ProgressState;
}

function Sidebar({ current, onSelect, progress }: SidebarProps) {
  const percent = useMemo(() => {
    const allIds = MODULES.flatMap(m => m.labs?.map(l => l.id) || []);
    const done = allIds.filter(id => progress.completed[id]).length;
    return allIds.length ? Math.round((done / allIds.length) * 100) : 0;
  }, [progress]);

  return (
    <aside className="w-full md:w-72 shrink-0 border-r border-gray-200 dark:border-gray-800 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Tanium Interact Labs</h1>
        <span className="text-sm px-2 py-1 rounded bg-gray-100 dark:bg-gray-800">{percent}%</span>
      </div>
      <nav className="space-y-1" aria-label="Modules">
        {MODULES.map(m => (
          <button
            key={m.id}
            onClick={() => onSelect(m.id)}
            className={classNames(
              "w-full text-left px-3 py-2 rounded transition focus:outline-none focus:ring",
              current === m.id ? "bg-red-600 text-white" : "hover:bg-gray-100 dark:hover:bg-gray-800"
            )}
            aria-current={current === m.id ? "page" : undefined}
          >
            <div className="font-semibold">{m.title}</div>
            <div className="text-xs opacity-80">{m.examTag}</div>
          </button>
        ))}
      </nav>
      <ExportImport progress={progress} />
      <SmallPrintHelp />
    </aside>
  );
}

function ExportImport({ progress }: { progress: ProgressState }) {
  const download = () => {
    const blob = new Blob([JSON.stringify(progress, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tanium-lab-progress.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const onImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const obj = JSON.parse(reader.result as string);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
        window.location.reload();
      } catch (e) {
        alert("Invalid JSON file");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="rounded border border-gray-200 dark:border-gray-800 p-3 space-y-2">
      <div className="text-sm font-semibold">Progress</div>
      <div className="flex gap-2">
        <button onClick={download} className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700">Export</button>
        <label className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 cursor-pointer">
          Import<input type="file" accept="application/json" className="hidden" onChange={onImport} />
        </label>
      </div>
    </div>
  );
}

function SmallPrintHelp() {
  return (
    <details className="text-xs opacity-80">
      <summary className="cursor-pointer">Tips</summary>
      <ul className="list-disc ml-5 mt-2 space-y-1">
        <li>Use the search bar to find labs quickly.</li>
        <li>Click a lab to expand steps, check off completion, and add notes.</li>
        <li>Print from your browser (Ctrl/Cmd+P) — layout is print-optimized.</li>
      </ul>
    </details>
  );
}

interface Lab {
  id: string;
  title: string;
  steps: string[];
}

interface LabCardProps {
  lab: Lab;
  completed: boolean;
  onToggle: () => void;
  notes: string | undefined;
  onNoteChange: (value: string) => void;
}

function LabCard({ lab, completed, onToggle, notes, onNoteChange }: LabCardProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-md overflow-hidden">
      <button
        className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-3"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <input type="checkbox" className="h-4 w-4" checked={!!completed} onChange={onToggle} onClick={e => e.stopPropagation()} aria-label="Mark complete" />
        <div className="font-medium">{lab.title}</div>
      </button>
      {open && (
        <div className="p-4 space-y-3">
          <ol className="list-decimal ml-5 space-y-2">
            {lab.steps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
          <div className="space-y-1">
            <label className="text-sm font-semibold">Reflection / Notes</label>
            <textarea
              className="w-full min-h-[100px] rounded border border-gray-200 dark:border-gray-800 p-2 bg-white dark:bg-gray-900"
              value={notes || ""}
              onChange={e => onNoteChange(e.target.value)}
              placeholder="Type what you observed, decisions you'd make, or screenshots you captured."
            />
          </div>
        </div>
      )}
    </div>
  );
}

interface QuizItem {
  q: string;
  a: string;
}

function Quiz({ items }: { items: QuizItem[] }) {
  const [revealed, setRevealed] = useState(false);
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Knowledge Review</h3>
        <button onClick={() => setRevealed(r => !r)} className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700">
          {revealed ? "Hide Answers" : "Reveal Answers"}
        </button>
      </div>
      <ol className="list-decimal ml-5 space-y-3">
        {items.map((it, i) => (
          <li key={i}>
            <div className="font-medium">{it.q}</div>
            {revealed && <div className="text-sm mt-1 opacity-80">Answer: {it.a}</div>}
          </li>
        ))}
      </ol>
    </section>
  );
}

export default function LabCompanionPage() {
  const [progress, setProgress] = useLocalProgress();
  const [moduleId, setModuleId] = useState(MODULES[0].id);
  const [query, setQuery] = useState("");

  const current = MODULES.find(m => m.id === moduleId) || MODULES[0];

  const filteredLabs = useMemo(() => {
    const labs = current.labs || [];
    if (!query.trim()) return labs;
    const q = query.toLowerCase();
    return labs.filter(l => l.title.toLowerCase().includes(q) || l.steps.join(" ").toLowerCase().includes(q));
  }, [current, query]);

  const toggleDark = () => setProgress(p => ({ ...p, dark: !p.dark }));

  useEffect(() => {
    document.documentElement.classList.toggle("dark", !!progress.dark);
  }, [progress.dark]);

  const completeCount = useMemo(() => {
    const labs = current.labs || [];
    return labs.filter(l => progress.completed[l.id]).length;
  }, [current, progress.completed]);

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-black dark:text-gray-100">
      <header className="border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur z-10 print:hidden">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-red-600" aria-hidden />
          <div>
            <div className="font-bold">Tanium Interact Study Lab Companion</div>
            <div className="text-xs opacity-80">Professional Workbook • Created for Rob Neveu – Edmonton, AB</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            aria-label="Search labs"
            className="px-3 py-1 rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
            placeholder="Search labs…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button onClick={toggleDark} className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700">
            {progress.dark ? "Light" : "Dark"}
          </button>
          <button onClick={() => window.print()} className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700">Print</button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid md:grid-cols-[18rem_1fr] gap-0">
        <Sidebar current={current.id} onSelect={setModuleId} progress={progress} />
        <section className="p-4 space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold text-red-600">{current.title}</h2>
            <div className="text-sm opacity-80">{current.examTag}</div>
            <p className="mt-2">{current.objective}</p>
          </div>

          {current.labs && current.labs.length > 0 && (
            <div className="space-y-3">
              <div className="text-sm font-semibold">
                Labs in this module ({completeCount} / {current.labs.length} completed)
              </div>
              <div className="space-y-3">
                {filteredLabs.map(lab => (
                  <LabCard
                    key={lab.id}
                    lab={lab}
                    completed={!!progress.completed[lab.id]}
                    onToggle={() =>
                      setProgress(p => ({ ...p, completed: { ...p.completed, [lab.id]: !p.completed[lab.id] } }))
                    }
                    notes={progress.notes[lab.id]}
                    onNoteChange={val =>
                      setProgress(p => ({ ...p, notes: { ...p.notes, [lab.id]: val } }))
                    }
                  />
                ))}
                {filteredLabs.length === 0 && (
                  <div className="text-sm opacity-70">No labs match your search.</div>
                )}
              </div>
            </div>
          )}

          {current.quiz && <Quiz items={current.quiz.items} />}

          {current.reflection && (
            <div className="space-y-2">
              <div className="font-semibold">Reflect & Apply</div>
              <p className="opacity-80">{current.reflection}</p>
              <textarea
                className="w-full min-h-[120px] rounded border border-gray-200 dark:border-gray-800 p-2 bg-white dark:bg-gray-900"
                placeholder="Write your self-assessment or next steps…"
                value={progress.notes[`${current.id}-reflection`] || ""}
                onChange={e => setProgress(p => ({ ...p, notes: { ...p.notes, [`${current.id}-reflection`]: e.target.value } }))}
              />
            </div>
          )}

          <footer className="text-xs opacity-70 pt-6 border-t border-gray-200 dark:border-gray-800">
            Tanium Interact Study Lab Companion (TCO Exam Prep) — Professional Training Web App • © {new Date().getFullYear()} • For personal study use.
          </footer>
        </section>
      </main>

      {/* Print styles */}
      <style>{`
        @media print {
          .print\\:hidden { display: none !important; }
          header, aside button { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          aside { break-inside: avoid; }
        }
      `}</style>
    </div>
  );
}
