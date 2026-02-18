"use client";

import { Section } from "@/components/budget/landing/Section";
import { LandingCard } from "@/components/budget/landing/LandingCard";
import Link from "next/link";
import { useTranslations } from "next-intl";

export function SecuritySection() {
  const t = useTranslations("landing.security");

  const cards = [
    {
      key: "localStorage",
      title: t("cards.localStorage.title"),
      description: t("cards.localStorage.description"),
    },
    {
      key: "encryption",
      title: t("cards.encryption.title"),
      description: t("cards.encryption.description"),
    },
    {
      key: "aiControls",
      title: t("cards.aiControls.title"),
      description: t("cards.aiControls.description"),
    },
    {
      key: "exportDelete",
      title: t("cards.exportDelete.title"),
      description: t("cards.exportDelete.description"),
    },
  ];

  return (
    <Section className="bg-[#070A12]/25">
      <div className="grid gap-8 lg:grid-cols-3 lg:items-start">
        <div className="lg:sticky lg:top-24">
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{t("title")}</h2>
          <p className="mt-3 text-base text-slate-400">{t("description")}</p>
          <div className="mt-6 flex flex-col gap-3">
            <Link
              href="/budget-app/settings"
              className="inline-flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-teal-300 to-cyan-300 px-5 text-sm font-extrabold text-slate-900 transition-colors hover:from-teal-200 hover:to-cyan-200"
            >
              {t("buttons.privacy")}
            </Link>
            <Link
              href="/budget-app/offline"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              {t("buttons.offline")}
            </Link>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="grid gap-6 sm:grid-cols-2">
            {cards.map((card) => (
              <LandingCard key={card.key} className="p-6">
                <div className="text-base font-semibold text-white">{card.title}</div>
                <p className="mt-2 text-sm text-slate-400">{card.description}</p>
              </LandingCard>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
