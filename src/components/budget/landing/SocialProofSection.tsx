import { Section } from "@/components/budget/landing/Section";
import { Sparkles, Keyboard, Smartphone, Download } from "lucide-react";
import { LandingCard } from "@/components/budget/landing/LandingCard";

export function SocialProofSection() {
  return (
    <Section>
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-10 lg:grid-cols-3 lg:items-start">
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Premium polish, built in
            </h2>
            <p className="mt-3 text-base text-slate-400">
              The details that make budgeting stick: onboarding, shortcuts, mobile navigation, and
              offline-ready performance.
            </p>
          </div>

          <div className="lg:col-span-2">
            <div className="grid gap-6 sm:grid-cols-2">
              {[
                {
                  icon: Sparkles,
                  title: "Onboarding tour",
                  description: "A guided tour helps new users get to value quickly.",
                },
                {
                  icon: Keyboard,
                  title: "Keyboard shortcuts",
                  description: "Move fast with search and action shortcuts built into the UI.",
                },
                {
                  icon: Smartphone,
                  title: "Mobile-first UX",
                  description: "Bottom navigation and responsive layouts that feel native.",
                },
                {
                  icon: Download,
                  title: "PWA install",
                  description: "Install like an app and keep going even with spotty internet.",
                },
              ].map((item) => (
                <LandingCard key={item.title} className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5">
                      <item.icon className="h-5 w-5 text-teal-200" />
                    </div>
                    <div className="text-base font-semibold text-white">{item.title}</div>
                  </div>
                  <p className="mt-3 text-sm text-slate-400">{item.description}</p>
                </LandingCard>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}


