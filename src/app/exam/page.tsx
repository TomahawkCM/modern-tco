import ExamSimulator from "@/components/exam/ExamSimulator";

export const metadata = {
  title: "Exam Simulator",
};

export default function ExamPage() {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold mb-4">Exam Simulator</h1>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
        Run a timed mock exam or a shorter practice test using the assessment engine.
      </p>
      <ExamSimulator />
    </main>
  );
}

