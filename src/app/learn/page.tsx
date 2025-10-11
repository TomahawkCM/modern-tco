'use client';

import Link from "next/link";
import manifest from "@/config/modules.manifest.json";
import type { ModuleManifest } from "@/types/manifest";

export default function LearnIndexPage() {
  const data = manifest as ModuleManifest;
  const modules = [...data.modules].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">TCO Study Modules</h1>
      <p className="text-slate-600 dark:text-muted-foreground">
        Select a module from the left to begin, or pick one below.
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((m) => (
          <Link
            key={m.id}
            href={`/learn/${m.slug}`}
            className="rounded border border-slate-200 p-4 transition-colors hover:border-blue-300 dark:border-border dark:hover:border-blue-600"
          >
            <div className="font-medium">{m.title}</div>
            {m.description ? (
              <div className="text-sm text-slate-600 dark:text-muted-foreground">{m.description}</div>
            ) : null}
          </Link>
        ))}
      </div>
    </div>
  );
}
