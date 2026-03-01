"use client";

/**
 * ExportButton Component
 *
 * Dropdown button for exporting calculator results as CSV or JSON.
 */

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { exportCSV, exportJSON } from "@/lib/financial-engine/export";
import type { ExportColumn } from "@/lib/financial-engine/export";

interface ExportButtonProps {
  filename: string;
  columns: ExportColumn[];
  rows: Record<string, unknown>[];
  className?: string;
}

export function ExportButton({ filename, columns, rows, className }: ExportButtonProps) {
  const t = useTranslations("calculators");
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className={cn("relative inline-block", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-1.5 text-sm text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
      >
        <Download className="h-4 w-4" />
        Export
      </button>

      {isOpen && (
        <div className="absolute right-0 z-10 mt-1 w-36 rounded-lg border border-slate-600 bg-slate-800 shadow-lg">
          <button
            onClick={() => {
              exportCSV({ filename, columns, rows });
              setIsOpen(false);
            }}
            className="w-full px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-700"
          >
            {t("export.exportCSV")}
          </button>
          <button
            onClick={() => {
              exportJSON({ filename, columns, rows });
              setIsOpen(false);
            }}
            className="w-full px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-700"
          >
            {t("export.exportJSON")}
          </button>
        </div>
      )}
    </div>
  );
}

export default ExportButton;
