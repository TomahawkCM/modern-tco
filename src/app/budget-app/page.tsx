"use client";

/**
 * Budget App Dashboard - Widget-Based Layout
 *
 * DESIGN SYSTEM COMPLIANCE:
 * - Vibrant Aesthetics: Rich gradients, deep dark modes, neon accents
 * - Glassmorphism: Translucent backgrounds with backdrop blur
 * - Dynamic Animations: Smooth entrance and interaction animations
 */

import { LanguageSelector } from "@/components/budget/LanguageSelector";
import { DashboardSkeleton } from "@/components/budget/LoadingSkeleton";
import { GlassCard } from "@/components/budget/ui/GlassCard";
import { WidgetEditMode } from "@/dashboard/widgets/WidgetEditMode";
import { WidgetGrid } from "@/dashboard/widgets/WidgetGrid";
import { getGridConfig } from "@/dashboard/widgets/presets";
import type { DashboardConfig } from "@/dashboard/widgets/types";
import { getWidgetConfig } from "@/dashboard/widgets/widget-storage";
import { useDeviceClass } from "@/lib/breakpoints";
import { db, initializeDefaultCategories } from "@/lib/budget-db";
import { Plus, Settings2, Sparkles, Upload } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  // Force HMR update
  const t = useTranslations();
  const format = useFormatter();
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(false);
  const [widgetConfig, setWidgetConfig] = useState<DashboardConfig | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const deviceClass = useDeviceClass();

  useEffect(() => {
    async function loadDashboardData() {
      try {
        await initializeDefaultCategories();

        const [transactions, accounts, categories] = await Promise.all([
          db.transactions.toArray(),
          db.accounts.toArray(),
          db.categories.toArray(),
        ]);

        // Check if user has any data
        setHasData(transactions.length > 0 || accounts.length > 0 || categories.length > 0);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  // Load widget configuration based on device class
  useEffect(() => {
    if (!deviceClass) return;

    const config = getWidgetConfig(deviceClass);
    setWidgetConfig(config);
  }, [deviceClass]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  // Welcome screen for new users
  if (!hasData) {
    return (
      <main
        id="main-content"
        className="flex min-h-[70vh] items-center justify-center"
        tabIndex={-1}
        role="main"
        aria-label="Budget app welcome screen"
      >
        <div className="max-w-md text-center">
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-gradient-to-br from-teal-500/20 to-purple-500/20 p-8">
              <Sparkles className="h-16 w-16 text-teal-400" aria-hidden="true" />
            </div>
          </div>
          <h2 className="mb-3 text-3xl font-bold text-white">{t("welcome.title")}</h2>
          <p className="mb-8 text-lg text-slate-400">{t("welcome.subtitle")}</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/budget-app/transactions"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-500 px-6 py-3 text-white shadow-lg shadow-teal-500/20 transition-all hover:bg-teal-400"
            >
              <Plus className="h-5 w-5" aria-hidden="true" />
              <span>{t("actions.addTransaction")}</span>
            </Link>
            <Link
              href="/budget-app/import"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-slate-300 transition-all hover:bg-white/10 hover:text-white"
            >
              <Upload className="h-5 w-5" aria-hidden="true" />
              <span>{t("actions.importData")}</span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const gridConfig = deviceClass ? getGridConfig(deviceClass) : null;

  // Handle edit mode save
  const handleSaveEditMode = (newConfig: DashboardConfig) => {
    setWidgetConfig(newConfig);
    setIsEditMode(false);
  };

  // Handle edit mode cancel
  const handleCancelEditMode = () => {
    setIsEditMode(false);
  };

  return (
    <main
      id="main-content"
      className="space-y-8 pb-8"
      tabIndex={-1}
      role="main"
      aria-label="Budget dashboard"
    >
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white">{t("nav.dashboard")}</h1>
          <p className="mt-2 text-lg text-slate-400">
            {format.dateTime(new Date(), { month: "long", year: "numeric" })}
          </p>
        </div>
        <nav className="flex gap-3" aria-label="Dashboard actions">
          <LanguageSelector variant="minimal" className="hidden sm:inline-flex" />
          {!isEditMode && (
            <>
              <button
                onClick={() => setIsEditMode(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-slate-300 transition-all hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                aria-label="Edit dashboard layout"
              >
                <Settings2 className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">{t("actions.editDashboard")}</span>
              </button>
              <Link
                href="/budget-app/import"
                className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-slate-300 transition-all hover:bg-white/10 hover:text-white sm:inline-flex"
              >
                <Upload className="h-4 w-4" aria-hidden="true" />
                <span>{t("actions.import")}</span>
              </Link>
              <Link
                href="/budget-app/transactions"
                className="inline-flex items-center gap-2 rounded-xl bg-teal-500 px-4 py-2.5 text-white shadow-lg shadow-teal-500/20 transition-all hover:bg-teal-400"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">{t("actions.addTransaction")}</span>
              </Link>
            </>
          )}
        </nav>
      </header>

      {/* Edit Mode */}
      {isEditMode && widgetConfig && (
        <WidgetEditMode
          config={widgetConfig}
          onSave={handleSaveEditMode}
          onCancel={handleCancelEditMode}
        />
      )}

      {/* Widget Grid (normal view) */}
      {!isEditMode && widgetConfig && gridConfig && (
        <WidgetGrid widgets={widgetConfig.widgets} gridConfig={gridConfig} />
      )}

      {/* Loading state for widget config */}
      {!isEditMode && !widgetConfig && deviceClass && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <GlassCard key={i} className="h-64 animate-pulse">
              <div className="h-full" />
            </GlassCard>
          ))}
        </div>
      )}
    </main>
  );
}
