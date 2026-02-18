import { getDailyDrill } from "@/lib/drills";

export const metadata = {
  title: "Daily 10 Drill",
};

export default async function DailyDrillPage() {
  const questions = await getDailyDrill(10);

  return (
    <main className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-4 text-2xl font-semibold">Daily 10 Smart Drill</h1>
      <p className="mb-6 text-sm text-slate-600 dark:text-muted-foreground">
        A balanced set across core domains to keep skills sharp.
      </p>
      <ol className="list-decimal space-y-4 pl-5">
        {questions.map((q, idx) => (
          <li key={q.id} className="rounded border border-slate-200 p-3 dark:border-border">
            <div className="mb-2 font-medium">{q.question}</div>
            <ul className="space-y-1 text-sm">
              {q.options?.map((c) => (
                <li key={c.id} className="flex items-start gap-2">
                  <span className="mt-1 inline-block h-2 w-2 rounded-full bg-slate-400" />
                  <span>{c.text}</span>
                </li>
              ))}
            </ul>
            <div className="mt-2 text-xs text-muted-foreground">
              Domain: {q.domain} · Difficulty: {q.difficulty}
            </div>
          </li>
        ))}
      </ol>
    </main>
  );
}
