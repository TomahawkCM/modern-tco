'use client';

import { LandingCard } from "@/components/budget/landing/LandingCard";
import { Section } from "@/components/budget/landing/Section";
import { useLandingContent } from "@/components/budget/landing/content";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import Link from "next/link";
import { ComparisonTable } from "./ComparisonTable";
import { useTranslations } from 'next-intl';

export function PricingSection() {
  const content = useLandingContent();
  const t = useTranslations('landing.pricingSection');
  const p = content.pricing;

  return (
    <Section id="pricing">
      <div className="mx-auto max-w-4xl text-center">
        <div className="text-xs font-semibold uppercase tracking-wider text-teal-200">
          {p.eyebrow}
        </div>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          <span className="bg-gradient-to-r from-teal-200 via-cyan-200 to-indigo-200 bg-clip-text text-transparent">
            {p.title}
          </span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base text-slate-400">{p.description}</p>
      </div>

      <div className="mx-auto mt-12 max-w-4xl text-left">
        <LandingCard className="relative overflow-hidden p-8 sm:p-10">
          <div className="absolute right-0 top-0 h-32 w-32 translate-x-12 translate-y-[-10px] rounded-full bg-teal-500/10 blur-3xl" />

          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-xs font-semibold text-teal-300">
                {t('recommended')}
              </div>
              <h3 className="text-2xl font-bold text-white">{t('productName')}</h3>
              <p className="mt-2 max-w-sm text-slate-400">
                {t('productDescription')}
              </p>

              <div className="mt-6 flex items-baseline gap-2">
                <div className="text-5xl font-extrabold text-white">{p.priceLabel}</div>
              </div>
              <p className="mt-2 text-sm text-slate-500">{p.guarantee}</p>
            </div>

            <div className="flex flex-col gap-4 lg:min-w-[280px]">
              <Link href={p.cta.href}>
                <Button className="h-14 w-full rounded-xl bg-gradient-to-r from-teal-300 to-cyan-300 text-lg font-bold text-slate-900 shadow-xl shadow-teal-900/20 hover:from-teal-200 hover:to-cyan-200 hover:shadow-teal-900/40">
                  {p.cta.label}
                </Button>
              </Link>
              <div className="rounded-lg border border-white/5 bg-slate-900/50 p-3 text-xs text-slate-400">
                <Info className="mb-2 h-4 w-4 text-teal-400" />
                {t('features')}
              </div>
            </div>
          </div>
        </LandingCard>
      </div>

      {/* Comparison Table */}
      <div className="mx-auto mt-20 max-w-5xl">
        <div className="mb-10 text-center">
          <h3 className="text-xl font-bold text-white">{t('whyChoose')}</h3>
          <p className="mt-2 text-slate-400">{t('whyChooseDescription')}</p>
        </div>
        <ComparisonTable />
      </div>
    </Section>
  );
}
