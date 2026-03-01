"use client";

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
    <div className={cn("rounded-lg border border-border bg-card", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-4 text-start transition-colors hover:bg-muted/50"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">
            {t("transparency.title")}
          </span>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div className="space-y-4 border-t border-border p-4">
          {assumptions.length > 0 && (
            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("transparency.assumptions")}
              </h4>
              <div className="space-y-2">
                {assumptions.map((assumption, i) => (
                  <div
                    key={i}
                    className="flex items-start justify-between gap-4"
                  >
                    <div className="min-w-0 flex-1">
                      <span className="text-sm text-muted-foreground">
                        {assumption.label}
                      </span>
                      {assumption.explanation && (
                        <p className="mt-0.5 text-xs text-muted-foreground/70">
                          {assumption.explanation}
                        </p>
                      )}
                    </div>
                    <span className="shrink-0 text-sm font-medium text-foreground">
                      {assumption.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {formula && (
            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("transparency.formula")}
              </h4>
              <div className="rounded-lg bg-muted p-3">
                <code className="text-sm text-primary">{formula}</code>
              </div>
              {formulaExplanation && (
                <p className="mt-2 text-xs text-muted-foreground">
                  {formulaExplanation}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default TransparencyPanel;
