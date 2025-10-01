"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getModuleProgress } from "@/lib/progress";
import type { ModuleProgressMap } from "@/types/progress";
import type { ModuleManifest } from "@/types/manifest";
import manifest from "@/config/modules.manifest.json";

function isActive(pathname: string, slug: string) {
  return pathname === `/learn/${slug}`;
}

export default function SideNav() {
  const pathname = usePathname() || "";
  const { user } = useAuth();
  const data = manifest as ModuleManifest;
  const modules = [...data.modules].sort((a, b) => a.order - b.order);

  const [progress, setProgress] = useState<ModuleProgressMap>({});

  // Precompute IDs to avoid effect churn
  const moduleIds = useMemo(() => modules.map((m) => m.id), [modules]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!user?.id) return;
      const entries = await Promise.all(
        moduleIds.map(async (id) => [id, await getModuleProgress(user.id, id)] as const)
      );
      if (!cancelled) {
        const next: ModuleProgressMap = {};
        for (const [id, mp] of entries) next[id] = mp;
        setProgress(next);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [user?.id, moduleIds.join("|")]);

  function ProgressDots({ pct }: { pct: number | undefined }) {
    const percent = Math.max(0, Math.min(1, pct ?? 0));
    const filled = Math.round(percent * 5);
    const label = `Progress: ${Math.round(percent * 100)}%`;
    return (
      <div aria-label={label} className="flex items-center gap-1" data-testid="progress">
        {Array.from({ length: 5 }).map((_, i) => {
          const isFilled = i < filled;
          return (
            <span
              key={i}
              data-testid="progress-dot"
              data-filled={isFilled ? "true" : "false"}
              className={[
                "h-1.5 w-1.5 rounded-full",
                isFilled ? "bg-blue-500" : "bg-slate-300 dark:bg-slate-700",
              ].join(" ")}
            />
          );
        })}
      </div>
    );
  }

  return (
    <nav aria-label="Study modules navigation" className="w-full md:w-64 md:min-h-[calc(100vh-4rem)] md:border-r md:border-slate-200 dark:md:border-slate-800 md:pr-4">
      <div className="px-4 py-3 md:px-0">
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Curriculum</h2>
      </div>
      <ul className="space-y-1 px-2 md:px-0 pb-4">
        {modules.map((m) => {
          const active = isActive(pathname, m.slug);
          return (
            <li key={m.id}>
              <Link
                href={`/learn/${m.slug}`}
                className={[
                  "block rounded px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-blue-600 text-white"
                    : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800",
                ].join(" ")}
                aria-current={active ? "page" : undefined}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex flex-col min-w-0">
                    <span className="font-medium truncate">{m.title}</span>
                    {m.description ? (
                      <span className="text-xs opacity-75 truncate">{m.description}</span>
                    ) : null}
                  </div>
                  <ProgressDots pct={progress[m.id]?.percentage} />
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
