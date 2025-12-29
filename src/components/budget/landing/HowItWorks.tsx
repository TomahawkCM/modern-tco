import { Section } from "@/components/budget/landing/Section";
import { LANDING_CONTENT } from "@/components/budget/landing/content";

export function HowItWorks() {
  return (
    <Section>
      <div className="flex flex-col gap-3">
        <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">How it works</h2>
        <p className="max-w-2xl text-base text-slate-400">
          A workflow that gets you to clarity fast, without locking you into a complicated system.
        </p>
      </div>

      <ol className="mt-10 grid gap-6 md:grid-cols-3">
        {LANDING_CONTENT.howItWorks.map((step, idx) => (
          <li
            key={step.title}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/15 text-sm font-bold text-teal-300">
                {idx + 1}
              </div>
              <div className="text-base font-semibold text-white">{step.title}</div>
            </div>
            <p className="mt-3 text-sm text-slate-400">{step.description}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}


