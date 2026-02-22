"use client";

/**
 * TransparencyPanel Component
 *
 * Collapsible card showing calculation assumptions and formula.
 * Builds trust by making the math visible and explainable.
 */

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Info, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Assumption {
  label: string;
  value: string;
  explanation?: string;
}

interface TransparencyPanelProps {
  assumptions: Assumption[];
  formula?: string;
  formulaExplanation?: string;
  className?: string;
}

export function TransparencyPanel({
  assumptions,
  formula,
  formulaExplanation,
  className,
}: TransparencyPanelProps) {
  const t = useTranslations("calculators");
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={cn("rounded-xl border border-slate-700 bg-slate-800/50", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-4 text-start transition-colors hover:bg-slate-700/30"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-300">{t("transparency.title")}</span>
        </div>
        <ChevronDown
          className={cn("h-4 w-4 text-slate-400 transition-transform", isOpen && "rotate-180")}
        />
      </button>

      {isOpen && (
        <div className="space-y-4 border-t border-slate-700 p-4">
          {/* Assumptions */}
          {assumptions.length > 0 && (
            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                {t("transparency.assumptions")}
              </h4>
              <div className="space-y-2">
                {assumptions.map((assumption, i) => (
                  <div key={i} className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <span className="text-sm text-slate-400">{assumption.label}</span>
                      {assumption.explanation && (
                        <p className="mt-0.5 text-xs text-slate-500">{assumption.explanation}</p>
                      )}
                    </div>
                    <span className="shrink-0 text-sm font-medium text-slate-300">
                      {assumption.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Formula */}
          {formula && (
            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                {t("transparency.formula")}
              </h4>
              <div className="rounded-lg bg-slate-900/50 p-3">
                <code className="text-sm text-teal-400">{formula}</code>
              </div>
              {formulaExplanation && (
                <p className="mt-2 text-xs text-slate-500">{formulaExplanation}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default TransparencyPanel;
