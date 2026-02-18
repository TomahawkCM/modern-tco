"use client";

import { LANDING_CONTENT } from "@/components/budget/landing/content";
import Link from "next/link";
import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="border-t border-white/10 bg-[#070A12]">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div>
          <div className="text-sm font-semibold text-white">{LANDING_CONTENT.brand.name}</div>
          <div className="mt-1 text-sm text-slate-500">{t("tagline")}</div>
        </div>

        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <Link href="/budget-app/auth/login" className="text-slate-400 hover:text-white">
            {t("links.login")}
          </Link>
          <Link href="/budget-app/auth/signup" className="text-slate-400 hover:text-white">
            {t("links.signup")}
          </Link>
          <Link href="/budget-app/auth/upgrade" className="text-slate-400 hover:text-white">
            {t("links.upgrade")}
          </Link>
          <Link href="/budget-app/settings" className="text-slate-400 hover:text-white">
            {t("links.settings")}
          </Link>
        </nav>

        <div className="text-sm text-slate-500">
          {t("copyright", {
            year: new Date().getFullYear(),
            brandName: LANDING_CONTENT.brand.name,
          })}
        </div>
      </div>
    </footer>
  );
}
