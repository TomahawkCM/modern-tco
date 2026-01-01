'use client';

import { Section } from "@/components/budget/landing/Section";
import Link from "next/link";
import { useTranslations } from 'next-intl';

export function AccessibilitySection() {
  const t = useTranslations('landing.accessibility');

  return (
    <Section className="bg-slate-950/60">
      <div className="grid gap-8 rounded-3xl border border-white/10 bg-white/[0.03] p-8 lg:grid-cols-3 lg:items-center">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {t('title')}
          </h2>
          <p className="mt-3 text-base text-slate-400">
            {t('description')}
          </p>
          <div className="mt-6 flex flex-wrap gap-2 text-xs text-slate-400">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
              {t('badges.seniorsMode')}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
              {t('badges.largeTouchTargets')}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
              {t('badges.keyboardFirst')}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/budget-app"
            className="inline-flex h-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            {t('buttons.openApp')}
          </Link>
          <Link
            href="/budget-app/settings"
            className="inline-flex h-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            {t('buttons.settings')}
          </Link>
        </div>
      </div>
    </Section>
  );
}


