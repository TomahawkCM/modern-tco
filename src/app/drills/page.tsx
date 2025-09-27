import { getDailyDrill } from "@/lib/drills";

export const metadata = {
  title: "Daily 10 Drill",
};

export default async function DailyDrillPage() {
  const questions = await getDailyDrill(10);

  return (
    <main className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold mb-4">Daily 10 Smart Drill</h1>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
        A balanced set across core domains to keep skills sharp.
      </p>
      <ol className="space-y-4 list-decimal pl-5">
        {questions.map((q, idx) => (
          <li key={q.id} className="rounded border border-slate-200 dark:border-slate-800 p-3">
            <div className="mb-2 font-medium">{q.question}</div>
            <ul className="text-sm space-y-1">
              {q.options?.map((c) => (
                <li key={c.id} className="flex items-start gap-2">
                  <span className="mt-1 inline-block h-2 w-2 rounded-full bg-slate-400" />
                  <span>{c.text}</span>
                </li>
              ))}
            </ul>
            <div className="mt-2 text-xs text-slate-500">
              Domain: {q.domain} · Difficulty: {q.difficulty}
            </div>
          </li>
        ))}
      </ol>
    </main>
  );
}

