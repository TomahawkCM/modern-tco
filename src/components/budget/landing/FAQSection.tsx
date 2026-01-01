'use client';

import { Section } from "@/components/budget/landing/Section";
import { useLandingContent } from "@/components/budget/landing/content";
import { LandingCard } from "@/components/budget/landing/LandingCard";
import { useTranslations } from 'next-intl';

export function FAQSection() {
  const content = useLandingContent();
  const t = useTranslations('landing.faqSection');

  return (
    <Section className="bg-[#070A12]/25">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{t('title')}</h2>
        <p className="mt-3 text-base text-slate-400">
          {t('description')}
        </p>

        <div className="mt-8 space-y-3">
          {content.faq.map((item) => (
            <LandingCard key={item.q} className="px-5 py-4">
              <details className="group open:bg-transparent">
              <summary
                className="cursor-pointer list-none select-none rounded-xl text-base font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              >
                <div className="flex items-center justify-between gap-4">
                  <span>{item.q}</span>
                  <span className="text-slate-400 transition-transform group-open:rotate-45">
                    +
                  </span>
                </div>
              </summary>
              <div className="mt-3 text-sm text-slate-400">{item.a}</div>
              </details>
            </LandingCard>
          ))}
        </div>
      </div>
    </Section>
  );
}


