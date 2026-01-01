'use client';

import { Section } from "@/components/budget/landing/Section";
import { useLandingContent } from "@/components/budget/landing/content";
import { LandingCard } from "@/components/budget/landing/LandingCard";
import { ArrowUpRight } from "lucide-react";
import { useTranslations } from 'next-intl';

export function OutcomesSection() {
  const content = useLandingContent();
  const t = useTranslations('landing.outcomesSection');

  return (
    <Section>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {t('title')}
          </h2>
          <p className="mt-3 max-w-2xl text-base text-slate-400">
            {t('description')}
          </p>
        </div>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {content.outcomes.map((o) => (
          <LandingCard key={o.title} className="p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-lg font-semibold text-white">{o.title}</div>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{o.description}</p>
              </div>
              <div className="mt-1 rounded-2xl border border-white/10 bg-white/[0.03] p-2 text-slate-300">
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </div>
            </div>
          </LandingCard>
        ))}
      </div>
    </Section>
  );
}


