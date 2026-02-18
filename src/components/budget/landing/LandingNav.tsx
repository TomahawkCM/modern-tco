"use client";

import { Button } from "@/components/ui/button";
import { useLandingContent } from "@/components/budget/landing/content";
import Link from "next/link";
import { useTranslations } from "next-intl";

export function LandingNav() {
  const content = useLandingContent();
  const t = useTranslations("landing.nav");
  const tAria = useTranslations("aria");

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#070A12]/60 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/budget-app/landing" className="flex items-center gap-3">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 shadow-lg shadow-black/40">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-teal-400/60 via-cyan-400/20 to-indigo-500/40 opacity-80" />
            <span className="text-lg font-bold text-white">$</span>
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-white">{content.brand.name}</div>
            <div className="text-[11px] text-slate-400">{t("tagline")}</div>
          </div>
        </Link>

        <nav aria-label={tAria("primaryNav")} className="flex items-center gap-3">
          <Link
            href={content.hero.secondaryCta.href}
            className="hidden text-sm font-medium text-slate-300 transition-colors hover:text-white sm:inline"
          >
            {content.hero.secondaryCta.label}
          </Link>
          <Link href={content.hero.primaryCta.href}>
            <Button className="h-10 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-400 px-4 font-semibold text-slate-900 hover:from-teal-300 hover:to-cyan-300">
              {content.hero.primaryCta.label}
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
