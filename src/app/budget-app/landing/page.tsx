"use client";

import { LanguageSelector } from "@/components/budget/LanguageSelector";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, Lock, ShieldCheck, Sparkles, Zap } from "lucide-react";
import Link from "next/link";

// Force HMR update - Transaction Text Fix content

export default function BudgetAppLandingPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white selection:bg-teal-500/30">
      {/* Navbar */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-slate-900/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 shadow-lg shadow-teal-500/20">
              <span className="text-lg font-bold text-white">$</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Budget<span className="text-teal-400">Pro</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSelector variant="minimal" />
            <Link
              href="/budget-app/auth/login"
              className="text-sm font-medium text-slate-300 transition-colors hover:text-white"
            >
              Log in
            </Link>
            <Link href="/budget-app/auth/signup">
              <Button className="rounded-full bg-teal-500 px-6 font-semibold text-white shadow-lg shadow-teal-500/25 transition-all hover:bg-teal-400 hover:shadow-teal-500/40">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden pt-20">
        {/* Background Effects */}
        <div className="absolute left-1/2 top-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-500/20 blur-[120px]" />
        <div className="absolute left-1/4 top-1/4 -z-10 h-[300px] w-[300px] rounded-full bg-blue-600/20 blur-[80px]" />

        <div className="container relative z-10 mx-auto px-4 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-1.5 text-sm font-medium text-teal-400 backdrop-blur-sm">
            <Sparkles className="h-4 w-4" />
            <span>The Future of Personal Finance</span>
          </div>

          <h1 className="mb-8 text-5xl font-extrabold tracking-tight text-white sm:text-7xl">
            Master Your Money <br />
            <span className="bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">
              With Precision
            </span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-400 sm:text-xl">
            Experience financial clarity like never before. Real-time analytics, smart
            categorization, and anomaly detection in one beautiful interface.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/budget-app/auth/signup">
              <Button
                size="lg"
                className="h-12 rounded-full bg-teal-500 px-8 text-lg font-semibold text-white shadow-xl shadow-teal-500/25 transition-all hover:scale-105 hover:bg-teal-400"
              >
                Start 7-Day Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <p className="mt-2 text-sm text-slate-500 sm:mt-0">One-time payment of $19.99</p>
          </div>
        </div>

        {/* Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="perspective-1000 container mx-auto mt-20 max-w-6xl px-4"
        >
          <div className="relative overflow-hidden rounded-xl border border-white/10 bg-slate-900/50 shadow-2xl backdrop-blur-xl">
            {/* Abstract UI Representation */}
            {/* CSS-only Dashboard Mockup */}
            <div className="flex flex-col p-6 md:h-[600px]">
              {/* Header */}
              <div className="mb-8 flex items-center justify-between border-b border-white/5 pb-6">
                <div className="space-y-1">
                  <div className="h-6 w-32 rounded bg-white/10" />
                  <div className="h-4 w-48 rounded bg-white/5" />
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2 rounded-full border border-white/5 bg-white/5 px-3 py-1">
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    <div className="h-3 w-16 rounded bg-white/10" />
                  </div>
                  <div className="h-8 w-8 rounded-full bg-white/10" />
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {/* Total Balance */}
                <div className="rounded-xl border border-teal-500/20 bg-gradient-to-br from-teal-500/10 to-teal-600/5 p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500/20 text-teal-400">
                      <span className="text-xl font-bold">$</span>
                    </div>
                    <span className="text-sm font-medium text-slate-400">Total Balance</span>
                  </div>
                  <div className="mb-2 text-3xl font-bold text-white">$24,500.00</div>
                  <div className="flex items-center gap-2 text-sm text-emerald-400">
                    <span>+12.5%</span>
                    <span className="text-slate-500">vs last month</span>
                  </div>
                </div>

                {/* Monthly Expenses */}
                <div className="rounded-xl border border-rose-500/20 bg-gradient-to-br from-rose-500/10 to-rose-600/5 p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500/20 text-rose-400">
                      <BarChart3 className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-medium text-slate-400">Expenses</span>
                  </div>
                  <div className="mb-2 text-3xl font-bold text-white">$1,250.00</div>
                  <div className="flex items-center gap-2 text-sm text-emerald-400">
                    <span>-5.2%</span>
                    <span className="text-slate-500">vs last month</span>
                  </div>
                </div>

                {/* Savings Goal */}
                <div className="rounded-xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-blue-600/5 p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-medium text-slate-400">Savings Goal</span>
                  </div>
                  <div className="mb-4 text-3xl font-bold text-white">85%</div>
                  <div className="h-2 w-full rounded-full bg-slate-700">
                    <div className="h-2 w-[85%] rounded-full bg-blue-500" />
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
                        className={`font-medium ${tx.amount.startsWith("+") ? "text-emerald-400" : "text-white"}`}
                      >
                        {tx.amount}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Pro Features for Pro Users
            </h2>
            <p className="mt-4 text-lg text-slate-400">
              Everything you need to take control of your wealth.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: BarChart3,
                title: "Advanced Analytics",
                desc: "Visualize spending patterns with interactive, real-time charts.",
                color: "text-blue-400",
                bg: "bg-blue-500/10",
              },
              {
                icon: Zap,
                title: "Smart Automations",
                desc: "Auto-categorize transactions and detect recurring bills instantly.",
                color: "text-amber-400",
                bg: "bg-amber-500/10",
              },
              {
                icon: ShieldCheck,
                title: "Bank-Grade Security",
                desc: "Your financial data is encrypted and protected with RLS policies.",
                color: "text-emerald-400",
                bg: "bg-emerald-500/10",
              },
              {
                icon: Sparkles,
                title: "Anomaly Detection",
                desc: "AI-powered alerts for unusual spending activity.",
                color: "text-purple-400",
                bg: "bg-purple-500/10",
              },
              {
                icon: Lock,
                title: "Private & Secure",
                desc: "No ads, no data selling. Your business is your business.",
                color: "text-rose-400",
                bg: "bg-rose-500/10",
              },
              {
                icon: ArrowRight,
                title: "Export & Report",
                desc: "Generate professional PDF reports and export CSVs anytime.",
                color: "text-teal-400",
                bg: "bg-teal-500/10",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group rounded-2xl border border-white/5 bg-white/5 p-8 transition-colors hover:border-white/10 hover:bg-white/10"
              >
                <div className={`mb-6 inline-flex rounded-xl p-3 ${feature.bg}`}>
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <h3 className="mb-3 text-xl font-bold text-white">{feature.title}</h3>
                <p className="text-slate-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing / CTA */}
      <section className="relative py-24 pb-32">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-900/20 blur-[120px]" />
        </div>

        <div className="container mx-auto px-4 text-center">
          <div className="mx-auto max-w-3xl rounded-3xl border border-teal-500/30 bg-slate-900/80 p-12 shadow-2xl backdrop-blur-xl">
            <h2 className="mb-6 text-4xl font-bold text-white">Start Your Journey Today</h2>
            <p className="mb-8 text-xl text-slate-400">
              Join thousands of users mastering their finances. <br />
              Try it risk-free for 7 days.
            </p>
            <div className="mb-8 flex flex-col items-center justify-center gap-2">
              <span className="text-5xl font-bold text-white">$19.99</span>
              <span className="text-slate-400">Lifetime Access</span>
            </div>

            <Link href="/budget-app/auth/signup">
              <Button
                size="lg"
                className="h-14 w-full max-w-sm rounded-full bg-teal-500 text-xl font-bold text-white shadow-xl shadow-teal-500/25 transition-all hover:scale-105 hover:bg-teal-400"
              >
                Get Started Now
              </Button>
            </Link>
            <p className="mt-6 text-sm text-slate-500">
              Secure checkout • 7-day money-back guarantee • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-slate-900 py-8">
        <div className="container mx-auto px-4 text-center text-slate-500">
          <p>&copy; {new Date().getFullYear()} BudgetPro App. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
