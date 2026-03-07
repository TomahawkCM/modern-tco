"use client";

import { LanguageSelector } from "@/components/budget/LanguageSelector";
import { ScrollReveal } from "@/components/budget/ScrollReveal";
import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, BarChart3, Lock, ShieldCheck, Sparkles, Zap } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import React, { useRef } from "react";
import { CurrencyBackground } from "./CurrencyBackground";

const featureConfig = [
  {
    icon: BarChart3,
    key: "0",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    className: "md:col-span-2 md:row-span-2",
    visual: (
      <div className="absolute inset-0 flex h-full w-full items-end gap-2 p-8 pb-4 opacity-50">
        {[40, 70, 45, 90, 60, 80, 50, 95].map((h, i) => (
          <div
            key={i}
            className="w-full rounded-t-lg bg-gradient-to-t from-amber-500/50 to-yellow-400"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    ),
  },
  {
    icon: Zap,
    key: "1",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    className: "md:col-span-1 md:row-span-1",
    visual: (
      <div className="absolute right-2 top-2 opacity-20">
        <Zap className="h-24 w-24 text-yellow-500/20" />
      </div>
    ),
  },
  {
    icon: ShieldCheck,
    key: "2",
    color: "text-lime-400",
    bg: "bg-lime-500/10",
    className: "md:col-span-1 md:row-span-1",
    visual: (
      <div className="absolute inset-0 flex items-center justify-center opacity-10">
        <div className="grid grid-cols-6 gap-1">
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              className={`h-1 w-1 rounded-full ${i % 3 === 0 ? "bg-lime-400" : "bg-lime-800"}`}
            />
          ))}
        </div>
      </div>
    ),
  },
  {
    icon: Sparkles,
    key: "3",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    className: "md:col-span-1 md:row-span-2",
    visual: (
      <div className="absolute inset-0 flex flex-col justify-center gap-2 p-8 opacity-50">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-full border-2 border-orange-400 bg-orange-500/20" />
          <div className="h-8 w-8 rounded-full border-2 border-yellow-400 bg-yellow-500/20" />
          <div className="h-8 w-8 rounded-full border-2 border-white/20 bg-white/10" />
        </div>
      </div>
    ),
  },
  {
    icon: Lock,
    key: "4",
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    className: "md:col-span-1 md:row-span-1",
    visual: (
      <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20">
        <Lock className="h-20 w-20 text-rose-500" />
      </div>
    ),
  },
  {
    icon: ArrowRight,
    key: "5",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    className: "md:col-span-2 md:row-span-1",
    visual: (
      <div className="absolute inset-0 flex items-center justify-end gap-4 p-8 opacity-40">
        <div className="h-20 w-16 -rotate-6 rounded-lg border border-yellow-500/30 bg-yellow-500/10 backdrop-blur-sm" />
        <div className="h-20 w-16 rotate-3 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm" />
      </div>
    ),
  },
];

const comparisonRows = ["dataPrivacy", "cost", "bankConnections", "storageLocation"] as const;

export default function BudgetAppLandingPage() {
  const t = useTranslations("landing");
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  // Parallax & 3D Tilt Effects
  const rotateX = useTransform(scrollY, [0, 500], [20, 0]);
  const scale = useTransform(scrollY, [0, 500], [0.9, 1]);
  const y = useTransform(scrollY, [0, 500], [0, -50]);

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen bg-neutral-950 text-white selection:bg-yellow-500/30"
    >
      <CurrencyBackground />
      {/* Noise Texture Overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-[100] opacity-[0.05] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Navbar */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-neutral-950/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-yellow-400 to-amber-500 shadow-lg shadow-yellow-500/20">
              <span className="text-lg font-bold text-black">$</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-white">{t("brand.name")}</span>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSelector variant="minimal" />
            <Link
              href={t("hero.secondaryCta.href")}
              className="text-sm font-medium text-slate-300 transition-colors hover:text-white"
            >
              {t("hero.secondaryCta.label")}
            </Link>
            <Link href={t("hero.primaryCta.href")}>
              <Button className="rounded-full bg-yellow-400 px-6 font-semibold text-neutral-950 shadow-lg shadow-yellow-500/25 transition-all hover:bg-yellow-300 hover:shadow-yellow-500/40">
                {t("hero.primaryCta.label")}
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative flex min-h-[120vh] flex-col items-center justify-start overflow-hidden pt-32">
        {/* Background Effects */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          className="absolute left-1/2 top-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-500/20 blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: "reverse",
            delay: 1,
          }}
          className="absolute left-1/4 top-1/4 -z-10 h-[300px] w-[300px] rounded-full bg-amber-600/20 blur-[80px]"
        />

        <div className="container relative z-10 mx-auto px-4 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-1.5 text-sm font-medium text-yellow-400 backdrop-blur-sm">
            <Sparkles className="h-4 w-4" />
            <span>{t("hero.badge")}</span>
          </div>

          <h1 className="mb-8 text-5xl font-extrabold tracking-tight text-white sm:text-7xl">
            <span className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
              {t("hero.headline")}
            </span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-400 sm:text-xl">
            {t("hero.subhead")}
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href={t("hero.primaryCta.href")}>
              <Button
                size="lg"
                className="h-12 rounded-full bg-yellow-400 px-8 text-lg font-bold text-neutral-950 shadow-xl shadow-yellow-500/25 transition-all hover:scale-105 hover:bg-yellow-300"
              >
                {t("hero.primaryCta.label")}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <p className="mt-2 text-sm text-slate-500 sm:mt-0">{t("hero.finePrint")}</p>
          </div>
        </div>

        {/* Dashboard Preview */}
        <motion.div
          style={{
            rotateX,
            scale,
            y,
          }}
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="perspective-1000 container mx-auto mt-20 max-w-6xl px-4 [perspective:2000px]"
        >
          <div className="relative overflow-hidden rounded-xl border border-white/10 bg-neutral-900/50 shadow-2xl backdrop-blur-xl">
            {/* CSS-only Dashboard Mockup — decorative, not translated */}
            <div className="flex flex-col p-6 md:h-[600px]">
              {/* Header */}
              <div className="mb-8 flex items-center justify-between border-b border-white/5 pb-6">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-white">Overview</h3>
                  <p className="text-sm text-slate-400">Welcome back, Alex</p>
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2 rounded-full border border-lime-500/20 bg-lime-500/10 px-3 py-1">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-lime-500" />
                    <span className="text-xs font-medium text-lime-400">Live</span>
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 text-xs font-bold text-black shadow-lg">
                    AJ
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="rounded-xl border border-yellow-500/20 bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/20 text-yellow-400">
                      <span className="text-xl font-bold">$</span>
                    </div>
                    <span className="text-sm font-medium text-slate-400">Total Balance</span>
                  </div>
                  <div className="mb-2 text-3xl font-bold text-white">$24,500.00</div>
                  <div className="flex items-center gap-2 text-sm text-lime-400">
                    <span>+12.5%</span>
                    <span className="text-slate-500">vs last month</span>
                  </div>
                </div>

                <div className="rounded-xl border border-orange-500/20 bg-gradient-to-br from-orange-500/10 to-orange-600/5 p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/20 text-orange-400">
                      <BarChart3 className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-medium text-slate-400">Expenses</span>
                  </div>
                  <div className="mb-2 text-3xl font-bold text-white">$1,250.00</div>
                  <div className="flex items-center gap-2 text-sm text-lime-400">
                    <span>-5.2%</span>
                    <span className="text-slate-500">vs last month</span>
                  </div>
                </div>

                <div className="rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-amber-600/5 p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-medium text-slate-400">Savings Goal</span>
                  </div>
                  <div className="mb-4 text-3xl font-bold text-white">85%</div>
                  <div className="h-2 w-full rounded-full bg-slate-700">
                    <div className="h-2 w-[85%] rounded-full bg-amber-500" />
                  </div>
                </div>
              </div>

              {/* Transactions List */}
              <div className="mt-6 flex-1 overflow-hidden rounded-xl border border-white/5 bg-white/5 p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Recent Transactions</h3>
                  <div className="h-8 w-24 rounded-lg bg-white/5" />
                </div>
                <div className="space-y-4">
                  {[
                    {
                      name: "Grocery Store",
                      date: "Today, 2:30 PM",
                      amount: "-$124.50",
                      icon: "🛒",
                    },
                    {
                      name: "Tech Solutions Inc.",
                      date: "Yesterday, 9:00 AM",
                      amount: "+$4,250.00",
                      icon: "💼",
                    },
                    {
                      name: "Netflix Subscription",
                      date: "Oct 24, 2025",
                      amount: "-$15.99",
                      icon: "🎬",
                    },
                  ].map((tx, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between border-b border-white/5 pb-4 last:border-0 last:pb-0"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-lg">
                          {tx.icon}
                        </div>
                        <div className="space-y-0.5">
                          <div className="font-medium text-white">{tx.name}</div>
                          <div className="text-xs text-slate-500">{tx.date}</div>
                        </div>
                      </div>
                      <div
                        className={`font-medium ${tx.amount.startsWith("+") ? "text-lime-400" : "text-white"}`}
                      >
                        {tx.amount}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent" />
          </div>
        </motion.div>
      </section>

      {/* Trust Pillars */}
      <section className="border-y border-white/5 bg-neutral-900/50 py-12 backdrop-blur-sm">
        <ScrollReveal>
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {(["0", "1", "2", "3"] as const).map((key) => (
                <div key={key} className="text-center">
                  <h3 className="mb-2 text-lg font-bold text-white">{t(`trust.${key}.title`)}</h3>
                  <p className="text-sm text-slate-400">{t(`trust.${key}.description`)}</p>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Features Grid */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="mb-16 text-center">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                {t("featuresDeepDive.heading1")} {t("featuresDeepDive.heading2")}
              </h2>
              <p className="mt-4 text-lg text-slate-400">{t("featuresDeepDive.description")}</p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div className="grid grid-cols-1 gap-6 md:auto-rows-[300px] md:grid-cols-4">
              {featureConfig.map((feature, i) => (
                <motion.div
                  whileHover={{ y: -5 }}
                  key={i}
                  className={`group relative flex flex-col overflow-hidden rounded-3xl border border-white/5 bg-white/5 p-8 transition-all hover:border-yellow-500/30 hover:bg-neutral-800/50 hover:shadow-2xl hover:shadow-yellow-500/10 ${feature.className || ""}`}
                >
                  <div className="absolute inset-0 -z-10 bg-gradient-to-br from-yellow-500/0 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                  {feature.visual}

                  <div className="relative z-10 mt-auto">
                    <div className={`mb-4 inline-flex rounded-xl p-3 ${feature.bg} w-fit`}>
                      <feature.icon className={`h-6 w-6 ${feature.color}`} />
                    </div>
                    <h3 className="mb-2 text-xl font-bold text-white">
                      {t(`features.${feature.key}.title`)}
                    </h3>
                    <p className="text-sm text-slate-400">
                      {t(`features.${feature.key}.description`)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Outcomes */}
      <section className="bg-neutral-900/50 py-24">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="mb-16 text-center">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                {t("outcomesSection.title")}
              </h2>
              <p className="mt-4 text-lg text-slate-400">{t("outcomesSection.description")}</p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {(["0", "1", "2", "3"] as const).map((key, i) => (
              <ScrollReveal key={key} delay={i * 0.1}>
                <div className="rounded-2xl border border-white/5 bg-neutral-800/50 p-8 shadow-xl backdrop-blur-sm">
                  <h3 className="mb-3 text-lg font-bold text-white">
                    {t(`outcomes.${key}.title`)}
                  </h3>
                  <p className="text-sm text-slate-400">{t(`outcomes.${key}.description`)}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="border-t border-white/5 bg-neutral-900/30 py-24">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="mb-16 text-center">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                {t("pricingSection.whyChoose")}
              </h2>
              <p className="mt-4 text-lg text-slate-400">
                {t("pricingSection.whyChooseDescription")}
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-neutral-900 shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left font-medium">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5">
                      <th className="px-6 py-6 text-slate-400">
                        {t("comparison.headers.feature")}
                      </th>
                      <th className="px-6 py-6 text-xl font-bold text-yellow-400">
                        {t("comparison.headers.local")}
                      </th>
                      <th className="px-6 py-6 text-slate-300">{t("comparison.headers.sync")}</th>
                      <th className="px-6 py-6 text-slate-300">{t("comparison.headers.cloud")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm sm:text-base">
                    {comparisonRows.map((row) => (
                      <tr key={row} className="hover:bg-white/5">
                        <td className="px-6 py-4 text-white">{t(`comparison.${row}.feature`)}</td>
                        <td className="px-6 py-4 font-bold text-lime-400">
                          {t(`comparison.${row}.local`)}
                        </td>
                        <td className="px-6 py-4 text-slate-400">{t(`comparison.${row}.sync`)}</td>
                        <td className="px-6 py-4 text-slate-400">{t(`comparison.${row}.cloud`)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="mb-16 text-center">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                {t("security.title")}
              </h2>
              <p className="mt-4 text-lg text-slate-400">{t("security.description")}</p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {(["localStorage", "encryption", "aiControls", "exportDelete"] as const).map(
                (card) => (
                  <div
                    key={card}
                    className="rounded-2xl border border-white/5 bg-neutral-800/50 p-8 shadow-xl backdrop-blur-sm transition-all hover:border-yellow-500/30"
                  >
                    <h3 className="mb-3 text-lg font-bold text-white">
                      {t(`security.cards.${card}.title`)}
                    </h3>
                    <p className="text-sm text-slate-400">
                      {t(`security.cards.${card}.description`)}
                    </p>
                  </div>
                )
              )}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Pricing / CTA */}
      <section className="relative py-24 pb-32">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-900/20 blur-[120px]" />
        </div>

        <div className="container mx-auto px-4 text-center">
          <ScrollReveal>
            <div className="mx-auto max-w-3xl rounded-3xl border border-yellow-500/30 bg-neutral-900/80 p-12 shadow-2xl backdrop-blur-xl">
              <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-yellow-400">
                {t("pricing.eyebrow")}
              </p>
              <h2 className="mb-6 text-4xl font-bold text-white">{t("pricing.title")}</h2>
              <p className="mb-8 text-xl text-slate-400">{t("pricing.description")}</p>
              <div className="mb-8 flex flex-col items-center justify-center gap-2">
                <span className="text-5xl font-bold text-white">{t("pricing.priceLabel")}</span>
              </div>

              <Link href={t("pricing.cta.href")}>
                <Button
                  size="lg"
                  className="h-14 w-full max-w-sm rounded-full bg-yellow-400 text-xl font-bold text-neutral-950 shadow-xl shadow-yellow-500/25 transition-all hover:scale-105 hover:bg-yellow-300"
                >
                  {t("pricing.cta.label")}
                </Button>
              </Link>
              <p className="mt-6 text-sm text-slate-500">{t("pricing.guarantee")}</p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-neutral-950 pb-8 pt-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 grid grid-cols-2 gap-8 md:grid-cols-4 lg:gap-12">
            <div className="col-span-2 md:col-span-1">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-yellow-400 to-amber-600">
                  <span className="text-lg font-bold text-black">$</span>
                </div>
                <span className="text-xl font-bold text-white">{t("brand.name")}</span>
              </div>
              <p className="text-sm text-slate-500">{t("pricingSection.productDescription")}</p>
            </div>

            <div>
              <h4 className="mb-4 font-semibold text-white">Product</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <Link href="#" className="transition-colors hover:text-yellow-400">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="transition-colors hover:text-yellow-400">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="transition-colors hover:text-yellow-400">
                    Download
                  </Link>
                </li>
                <li>
                  <Link href="#" className="transition-colors hover:text-yellow-400">
                    Changelog
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 font-semibold text-white">Resources</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <Link href="#" className="transition-colors hover:text-yellow-400">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="transition-colors hover:text-yellow-400">
                    API
                  </Link>
                </li>
                <li>
                  <Link href="#" className="transition-colors hover:text-yellow-400">
                    Community
                  </Link>
                </li>
                <li>
                  <Link href="#" className="transition-colors hover:text-yellow-400">
                    Help Center
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 font-semibold text-white">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <Link href="#" className="transition-colors hover:text-yellow-400">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="transition-colors hover:text-yellow-400">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="#" className="transition-colors hover:text-yellow-400">
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/5 pt-8 text-center text-sm text-slate-500">
            <p>
              &copy; {new Date().getFullYear()} {t("brand.name")}. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
