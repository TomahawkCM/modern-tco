"use client";

import { LandingCard } from "@/components/budget/landing/LandingCard";
import { Section } from "@/components/budget/landing/Section";
import { useLandingContent } from "@/components/budget/landing/content";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

export function FeaturesDeepDive() {
  const content = useLandingContent();
  const t = useTranslations("landing.featuresDeepDive");

  return (
    <Section className="bg-[#070A12]/25">
      <div className="grid gap-10 lg:grid-cols-3 lg:items-start">
        <div className="lg:sticky lg:top-24">
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {t("heading1")}
            <br />
            <span className="text-teal-200">{t("heading2")}</span>
          </h2>
          <p className="mt-3 text-base text-slate-400">{t("description")}</p>
          <div className="mt-6">
            <Link
              href="/budget-app/auth/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-300 to-cyan-300 px-4 py-2.5 text-sm font-extrabold text-slate-900 transition-colors hover:from-teal-200 hover:to-cyan-200"
            >
              {t("cta")} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="grid gap-5 sm:grid-cols-2">
            {content.features.map((f) => (
              <LandingCard key={f.title} className="p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-base font-semibold text-white">{f.title}</div>
                    <p className="mt-2 text-sm text-slate-400">{f.description}</p>
                  </div>
                </div>

                <div className="mt-5">
                  <Link
                    href={f.href}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-teal-300 transition-colors hover:text-teal-200"
                  >
                    {t("explore")}{" "}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </LandingCard>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
