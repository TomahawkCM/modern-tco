"use client";

/**
 * Database Debug/Recovery Page
 * Check database status and recover data if needed
 */

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { db, isDevEnvironment, getDatabaseName } from "@/lib/budget-db";

export default function DebugPage() {
  const t = useTranslations("debug");
  const [dbInfo, setDbInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const isDev = isDevEnvironment();

  useEffect(() => {
    async function checkDatabase() {
      try {
        const info: any = {
          dbName: db.name,
          version: db.verno,
          tables: {},
          totalRecords: 0,
        };

        // Check each table
        const tables = [
          "accounts",
          "transactions",
          "categories",
          "budgets",
          "investmentAccounts",
          "holdings",
          "receipts",
          "futurePurchases",
          "retirementPlans",
        ];

        for (const tableName of tables) {
          try {
            const table = (db as any)[tableName];
            if (table) {
              const count = await table.count();
              info.tables[tableName] = count;
              info.totalRecords += count;
            }
          } catch (error) {
            info.tables[tableName] = `Error: ${error}`;
          }
        }

        setDbInfo(info);
      } catch (error) {
        console.error("Error checking database:", error);
        setDbInfo({ error: String(error) });
      } finally {
        setLoading(false);
      }
    }

    checkDatabase();
  }, []);

  async function exportAllData() {
    try {
      const allData: any = {};

      const tables = ["accounts", "transactions", "categories", "budgets"];

      for (const tableName of tables) {
        const table = (db as any)[tableName];
        if (table) {
          allData[tableName] = await table.toArray();
        }
      }

      const json = JSON.stringify(allData, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `budget-backup-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      alert(t("exportSuccess"));
    } catch (error) {
      console.error("Export error:", error);
      alert(t("exportFailed", { error: String(error) }));
    }
  }

  async function clearDatabase() {
    if (!confirm(t("clearConfirm"))) return;

    try {
      await db.delete();
      await db.open();
      alert(t("clearSuccess"));
      window.location.reload();
    } catch (error) {
      alert(t("clearFailed", { error: String(error) }));
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="mb-4 text-2xl font-bold">{t("title")}</h1>
        <p>{t("loading")}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-8">
      <h1 className="mb-6 text-3xl font-bold">{t("titleFull")}</h1>

      {/* Environment Indicator */}
      <div
        className={`mb-6 rounded-lg border-2 p-4 ${
          isDev
            ? "border-amber-300 bg-amber-50 text-amber-900"
            : "border-green-300 bg-green-50 text-green-900"
        }`}
      >
        <div className="flex items-center gap-3">
          <span
            className={`rounded-full px-3 py-1 text-sm font-bold ${
              isDev ? "bg-amber-200" : "bg-green-200"
            }`}
          >
            {isDev ? t("development") : t("production")}
          </span>
          <span className="text-sm">
            {t("database")}:{" "}
            <code className="rounded bg-white/50 px-2 py-0.5 font-mono">
              {dbInfo?.dbName || getDatabaseName()}
            </code>
          </span>
        </div>
        {isDev && <p className="mt-2 text-sm">{t("devIsolationNote")}</p>}
      </div>

      {dbInfo?.error ? (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
          <h2 className="mb-2 font-bold text-red-900">{t("error")}</h2>
          <p className="text-red-700">{dbInfo.error}</p>
        </div>
      ) : (
        <>
          <div className="mb-6 rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-bold">{t("databaseInfo")}</h2>
            <div className="space-y-2">
              <p>
                <strong>{t("name")}:</strong> {dbInfo?.dbName}
              </p>
              <p>
                <strong>{t("version")}:</strong> {dbInfo?.version}
              </p>
              <p>
                <strong>{t("totalRecords")}:</strong> {dbInfo?.totalRecords}
              </p>
            </div>
          </div>

          <div className="mb-6 rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-bold">{t("tableCounts")}</h2>
            <div className="grid grid-cols-2 gap-4">
              {dbInfo?.tables &&
                Object.entries(dbInfo.tables).map(([table, count]) => (
                  <div
                    key={table}
                    className="flex items-center justify-between rounded bg-gray-50 p-4"
                  >
                    <span className="font-medium">{table}</span>
                    <span
                      className={`font-bold ${typeof count === "number" && count > 0 ? "text-green-600" : "text-gray-400"}`}
                    >
                      {String(count)}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-bold">{t("actions")}</h2>
            <div className="space-y-4">
              <button
                onClick={exportAllData}
                className="w-full rounded-lg bg-teal-600 px-4 py-2 text-white hover:bg-teal-700"
              >
                {t("exportAllData")}
              </button>

              <a
                href="/budget-app/import"
                className="block w-full rounded-lg bg-green-600 px-4 py-2 text-center text-white hover:bg-green-700"
              >
                {t("importCsvData")}
              </a>

              <button
                onClick={clearDatabase}
                className="w-full rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
              >
                {t("clearAllData")}
              </button>
            </div>
          </div>

          {dbInfo?.totalRecords === 0 && (
            <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <h3 className="mb-2 font-bold text-amber-900">{t("noDataFound")}</h3>
              <p className="mb-4 text-amber-700">{t("noDataReason")}</p>
              <ul className="mb-4 list-inside list-disc space-y-2 text-amber-700">
                <li>{t("noDataReason1")}</li>
                <li>{t("noDataReason2")}</li>
                <li>{t("noDataReason3")}</li>
              </ul>
              <p className="text-amber-700">
                <strong>{t("solution")}:</strong> {t("noDataSolution")}
              </p>
            </div>
          )}
        </>
      )}

      <div className="mt-6">
        <a href="/budget-app" className="text-teal-600 hover:underline">
          {t("backToDashboard")}
        </a>
      </div>
    </div>
  );
}
