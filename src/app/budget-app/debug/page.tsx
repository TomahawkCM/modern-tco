"use client";

/**
 * Database Debug/Recovery Page
 * Check database status and recover data if needed
 */

import { useEffect, useState } from "react";
import { db, isDevEnvironment, getDatabaseName } from "@/lib/budget-db";

export default function DebugPage() {
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

      alert("Data exported successfully!");
    } catch (error) {
      console.error("Export error:", error);
      alert(`Export failed: ${error}`);
    }
  }

  async function clearDatabase() {
    if (!confirm("Clear ALL data? This cannot be undone!")) return;

    try {
      await db.delete();
      await db.open();
      alert("Database cleared. Refresh the page.");
      window.location.reload();
    } catch (error) {
      alert(`Clear failed: ${error}`);
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="mb-4 text-2xl font-bold">Database Debug</h1>
        <p>Loading database information...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-8">
      <h1 className="mb-6 text-3xl font-bold">Database Debug & Recovery</h1>

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
            {isDev ? "DEVELOPMENT" : "PRODUCTION"}
          </span>
          <span className="text-sm">
            Database:{" "}
            <code className="rounded bg-white/50 px-2 py-0.5 font-mono">
              {dbInfo?.dbName || getDatabaseName()}
            </code>
          </span>
        </div>
        {isDev && (
          <p className="mt-2 text-sm">
            Development data is isolated from production. Test freely without affecting real users.
          </p>
        )}
      </div>

      {dbInfo?.error ? (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
          <h2 className="mb-2 font-bold text-red-900">Error</h2>
          <p className="text-red-700">{dbInfo.error}</p>
        </div>
      ) : (
        <>
          <div className="mb-6 rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-bold">Database Information</h2>
            <div className="space-y-2">
              <p>
                <strong>Name:</strong> {dbInfo?.dbName}
              </p>
              <p>
                <strong>Version:</strong> {dbInfo?.version}
              </p>
              <p>
                <strong>Total Records:</strong> {dbInfo?.totalRecords}
              </p>
            </div>
          </div>

          <div className="mb-6 rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-bold">Table Counts</h2>
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
            <h2 className="mb-4 text-xl font-bold">Actions</h2>
            <div className="space-y-4">
              <button
                onClick={exportAllData}
                className="w-full rounded-lg bg-teal-600 px-4 py-2 text-white hover:bg-teal-700"
              >
                Export All Data (Backup)
              </button>

              <a
                href="/budget-app/import"
                className="block w-full rounded-lg bg-green-600 px-4 py-2 text-center text-white hover:bg-green-700"
              >
                Import CSV Data
              </a>

              <button
                onClick={clearDatabase}
                className="w-full rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
              >
                Clear All Data (Dangerous!)
              </button>
            </div>
          </div>

          {dbInfo?.totalRecords === 0 && (
            <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <h3 className="mb-2 font-bold text-amber-900">⚠️ No Data Found</h3>
              <p className="mb-4 text-amber-700">
                Your transactions are not showing up. This could be because:
              </p>
              <ul className="mb-4 list-inside list-disc space-y-2 text-amber-700">
                <li>Data was cleared during development</li>
                <li>Wrong browser profile or incognito mode</li>
                <li>Browser storage was cleared</li>
              </ul>
              <p className="text-amber-700">
                <strong>Solution:</strong> Re-import your CSV file using the Import page.
              </p>
            </div>
          )}
        </>
      )}

      <div className="mt-6">
        <a href="/budget-app" className="text-teal-600 hover:underline">
          ← Back to Dashboard
        </a>
      </div>
    </div>
  );
}
