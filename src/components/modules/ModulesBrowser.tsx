"use client";

import * as React from "react";
import ModulesGrid from "./ModulesGrid";
import { ModulesProgressTable } from "./ModulesProgressTable";
import type { ModuleListRow } from "./module-table-types";

type ModuleMeta = {
  slug: string;
  frontmatter: {
    id: string;
    title: string;
    description?: string;
    difficulty: string;
    estimatedTime?: string;
    domainEnum: string;
    learningObjectives?: string[];
  };
};

export function ModulesBrowser({ modules }: { modules: ModuleMeta[] }) {
  const [view, setView] = React.useState<'grid' | 'table'>(() => {
    if (typeof window !== 'undefined') return (localStorage.getItem('tco-modules-view') as any) || 'grid';
    return 'grid';
  });

  React.useEffect(() => {
    try { localStorage.setItem('tco-modules-view', view); } catch {}
  }, [view]);

  const rows: ModuleListRow[] = React.useMemo(() => modules.map((m) => ({
    id: m.frontmatter.id,
    title: m.frontmatter.title,
    domain: m.frontmatter.domainEnum.replace(/_/g, ' '),
    difficulty: m.frontmatter.difficulty,
    estimatedTimeMinutes: parseInt(String(m.frontmatter.estimatedTime ?? '0').split(' ')[0]) || 0,
    slug: m.slug,
  })), [modules]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <button
          className={`rounded px-2 py-1 text-sm ${view === 'grid' ? 'bg-primary/20 text-primary' : 'bg-white/5 text-gray-300'}`}
          onClick={() => setView('grid')}
          aria-pressed={view === 'grid'}
        >
          Grid
        </button>
        <button
          className={`rounded px-2 py-1 text-sm ${view === 'table' ? 'bg-primary/20 text-primary' : 'bg-white/5 text-gray-300'}`}
          onClick={() => setView('table')}
          aria-pressed={view === 'table'}
        >
          Table
        </button>
      </div>

      {view === 'grid' ? (
        <ModulesGrid modules={modules as any} />
      ) : (
        <ModulesProgressTable rows={rows} />
      )}
    </div>
  );
}

