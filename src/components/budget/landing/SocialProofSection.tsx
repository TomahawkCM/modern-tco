'use client';

import { Section } from "@/components/budget/landing/Section";
import { Sparkles, Keyboard, Smartphone, Download } from "lucide-react";
import { LandingCard } from "@/components/budget/landing/LandingCard";
import { useTranslations } from 'next-intl';

export function SocialProofSection() {
  const t = useTranslations('landing.socialProof');

  const features = [
    {
      key: 'onboarding',
      icon: Sparkles,
      title: t('features.onboarding.title'),
      description: t('features.onboarding.description'),
    },
    {
      key: 'shortcuts',
      icon: Keyboard,
      title: t('features.shortcuts.title'),
      description: t('features.shortcuts.description'),
    },
    {
      key: 'mobileUx',
      icon: Smartphone,
      title: t('features.mobileUx.title'),
      description: t('features.mobileUx.description'),
    },
    {
      key: 'pwaInstall',
      icon: Download,
      title: t('features.pwaInstall.title'),
      description: t('features.pwaInstall.description'),
    },
  ];

  return (
    <Section>
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-10 lg:grid-cols-3 lg:items-start">
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {t('title')}
            </h2>
            <p className="mt-3 text-base text-slate-400">
              {t('description')}
            </p>
          </div>

          <div className="lg:col-span-2">
            <div className="grid gap-6 sm:grid-cols-2">
              {features.map((item) => (
                <LandingCard key={item.key} className="p-6">
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


