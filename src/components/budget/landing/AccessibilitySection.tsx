import { Section } from "@/components/budget/landing/Section";
import Link from "next/link";

export function AccessibilitySection() {
  return (
    <Section className="bg-slate-950/60">
      <div className="grid gap-8 rounded-3xl border border-white/10 bg-white/[0.03] p-8 lg:grid-cols-3 lg:items-center">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Accessible by default
          </h2>
          <p className="mt-3 text-base text-slate-400">
            Seniors Mode provides simplified navigation and larger touch targets. Keyboard shortcuts,
            focus states, and clear contrast help everyone move faster.
          </p>
          <div className="mt-6 flex flex-wrap gap-2 text-xs text-slate-400">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
              Seniors Mode
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
              Large touch targets
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
              Keyboard-first
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/budget-app"
            className="inline-flex h-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            Open the app
          </Link>
          <Link
            href="/budget-app/settings"
            className="inline-flex h-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            Accessibility settings
          </Link>
        </div>
      </div>
    </Section>
  );
}


