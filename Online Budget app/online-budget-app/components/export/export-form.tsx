"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DownloadIcon, FileSpreadsheetIcon, FileJsonIcon } from "lucide-react";

interface ExportFormProps {
  currency: string;
  locale: string;
}

type DateRangePreset = "all" | "thisMonth" | "thisYear" | "lastYear" | "custom";
type ExportFormat = "csv" | "json";

interface IncludeOptions {
  transactions: boolean;
  accounts: boolean;
  budgets: boolean;
  categories: boolean;
}

function getDateRange(preset: DateRangePreset): { from: string; to: string } {
  const now = new Date();
  const fmt = (d: Date) => d.toISOString().split("T")[0]!;

  switch (preset) {
    case "thisMonth":
      return {
        from: fmt(new Date(now.getFullYear(), now.getMonth(), 1)),
        to: fmt(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
      };
    case "thisYear":
      return {
        from: fmt(new Date(now.getFullYear(), 0, 1)),
        to: fmt(new Date(now.getFullYear(), 11, 31)),
      };
    case "lastYear":
      return {
        from: fmt(new Date(now.getFullYear() - 1, 0, 1)),
        to: fmt(new Date(now.getFullYear() - 1, 11, 31)),
      };
    case "all":
    default:
      return { from: "2000-01-01", to: fmt(now) };
  }
}

export function ExportForm({ locale }: ExportFormProps) {
  // currency available in props for future export formatting
  const t = useTranslations("export");

  const [preset, setPreset] = useState<DateRangePreset>("all");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [format, setFormat] = useState<ExportFormat>("csv");
  const [include, setInclude] = useState<IncludeOptions>({
    transactions: true,
    accounts: true,
    budgets: false,
    categories: false,
  });
  const [exporting, setExporting] = useState(false);

  const toggleInclude = (key: keyof IncludeOptions) => {
    setInclude((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleExport = useCallback(async () => {
    setExporting(true);

    try {
      const dateRange =
        preset === "custom" ? { from: customFrom, to: customTo } : getDateRange(preset);

      // Fetch data from API based on includes
      const results: Record<string, unknown> = {};

      const fetches: Promise<void>[] = [];

      if (include.transactions) {
        fetches.push(
          fetch(`/api/transactions?from_date=${dateRange.from}&to_date=${dateRange.to}&limit=100`)
            .then((r) => r.json())
            .then((data) => {
              results.transactions = data;
            })
            .catch(() => {
              results.transactions = [];
            })
        );
      }

      if (include.accounts) {
        fetches.push(
          fetch("/api/accounts")
            .then((r) => r.json())
            .then((data) => {
              results.accounts = data;
            })
            .catch(() => {
              results.accounts = [];
            })
        );
      }

      if (include.budgets) {
        fetches.push(
          fetch("/api/budgets")
            .then((r) => r.json())
            .then((data) => {
              results.budgets = data;
            })
            .catch(() => {
              results.budgets = [];
            })
        );
      }

      if (include.categories) {
        fetches.push(
          fetch(`/api/categories?locale=${locale}`)
            .then((r) => r.json())
            .then((data) => {
              results.categories = data;
            })
            .catch(() => {
              results.categories = [];
            })
        );
      }

      await Promise.all(fetches);

      // Check if there's any data
      const hasData = Object.values(results).some((v) => Array.isArray(v) && v.length > 0);

      if (!hasData) {
        // No data to export — show nothing
        return;
      }

      // Generate file
      let content: string;
      let mimeType: string;
      let fileExtension: string;

      if (format === "json") {
        content = JSON.stringify(results, null, 2);
        mimeType = "application/json";
        fileExtension = "json";
      } else {
        // CSV: flatten transactions first
        const rows = (results.transactions as Record<string, unknown>[]) ?? [];
        if (rows.length === 0) {
          content = "";
        } else {
          const headers = Object.keys(rows[0]!);
          const csvRows = [
            headers.join(","),
            ...rows.map((row) =>
              headers
                .map((h) => {
                  const val = String(row[h] ?? "");
                  // Escape CSV values
                  if (val.includes(",") || val.includes('"') || val.includes("\n")) {
                    return `"${val.replace(/"/g, '""')}"`;
                  }
                  return val;
                })
                .join(",")
            ),
          ];
          content = csvRows.join("\n");
        }
        mimeType = "text/csv";
        fileExtension = "csv";
      }

      // Download
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `budget-export-${new Date().toISOString().split("T")[0]}.${fileExtension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }, [preset, customFrom, customTo, format, include, locale]);

  const anySelected = Object.values(include).some(Boolean);

  return (
    <div className="space-y-6">
      {/* Date range */}
      <Card>
        <CardHeader>
          <CardTitle>{t("dateRange.label")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {(["all", "thisMonth", "thisYear", "lastYear", "custom"] as DateRangePreset[]).map(
              (p) => (
                <Button
                  key={p}
                  variant={preset === p ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPreset(p)}
                >
                  {t(`dateRange.${p === "all" ? "allTime" : p}`)}
                </Button>
              )
            )}
          </div>

          {preset === "custom" && (
            <div className="flex items-end gap-4">
              <div className="space-y-2">
                <Label htmlFor="from">{t("dateRange.from")}</Label>
                <Input
                  id="from"
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="to">{t("dateRange.to")}</Label>
                <Input
                  id="to"
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Format selection */}
      <Card>
        <CardHeader>
          <CardTitle>{t("format.label")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              className={`flex items-center gap-3 rounded-lg border p-4 text-left transition-colors ${
                format === "csv"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
              onClick={() => setFormat("csv")}
            >
              <FileSpreadsheetIcon className="size-8 text-green-600" />
              <div>
                <p className="font-medium">{t("format.csv.label")}</p>
                <p className="text-sm text-muted-foreground">{t("format.csv.description")}</p>
              </div>
            </button>
            <button
              type="button"
              className={`flex items-center gap-3 rounded-lg border p-4 text-left transition-colors ${
                format === "json"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
              onClick={() => setFormat("json")}
            >
              <FileJsonIcon className="size-8 text-blue-600" />
              <div>
                <p className="font-medium">{t("format.json.label")}</p>
                <p className="text-sm text-muted-foreground">{t("format.json.description")}</p>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Include options */}
      <Card>
        <CardHeader>
          <CardTitle>{t("include.label")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(Object.keys(include) as (keyof IncludeOptions)[]).map((key) => (
              <label key={key} className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={include[key]}
                  onChange={() => toggleInclude(key)}
                  className="size-4 rounded border-border accent-primary"
                />
                <span className="text-sm">{t(`include.${key}`)}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Export button */}
      <Button
        size="lg"
        onClick={handleExport}
        disabled={exporting || !anySelected}
        className="w-full sm:w-auto"
      >
        {exporting ? (
          t("exporting")
        ) : (
          <>
            <DownloadIcon />
            {t("exportButton")}
          </>
        )}
      </Button>
    </div>
  );
}
