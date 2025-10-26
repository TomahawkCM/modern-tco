"use client";

import * as React from "react";
import { type ColumnDef, flexRender, getCoreRowModel, getFilteredRowModel, getSortedRowModel, type SortingState, useReactTable, type ColumnFiltersState, type VisibilityState } from "@tanstack/react-table";
import type { ModuleListRow } from "./module-table-types";
import { moduleColumnsWithProgress } from "./module-table-columns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { useAuth } from "@/contexts/AuthContext";
import { useDatabase } from "@/contexts/DatabaseContext";
import { usePersistentState } from "@/lib/usePersistentState";

export function ModulesProgressTable({ rows }: { rows: ModuleListRow[] }) {
  const columns = React.useMemo<ColumnDef<ModuleListRow>[]>(() => moduleColumnsWithProgress, []);
  const { user } = useAuth();
  const scope = user?.id ? `:u:${user.id}` : "";
  const [sorting, setSorting] = usePersistentState<SortingState>(`tco:table:modules-progress:sorting${scope}`, []);
  const [columnFilters, setColumnFilters] = usePersistentState<ColumnFiltersState>(`tco:table:modules-progress:filters${scope}`, []);
  const [columnVisibility, setColumnVisibility] = usePersistentState<VisibilityState>(`tco:table:modules-progress:visibility${scope}`, {});
  const [selectedDomains, setSelectedDomains] = usePersistentState<string[]>(`tco:table:modules-progress:facets:domains${scope}`, []);
  const [selectedLevels, setSelectedLevels] = usePersistentState<string[]>(`tco:table:modules-progress:facets:levels${scope}`, []);
  const [selectedStatuses, setSelectedStatuses] = usePersistentState<string[]>(`tco:table:modules-progress:facets:statuses${scope}`, []);

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting, columnFilters, columnVisibility },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const uniqueDomains = React.useMemo(() => Array.from(new Set(rows.map(r => r.domain))), [rows]);
  const uniqueLevels = React.useMemo(() => Array.from(new Set(rows.map(r => r.difficulty))), [rows]);
  const uniqueStatuses = React.useMemo(() => Array.from(new Set(rows.map(r => r.status).filter(Boolean) as string[])), [rows]);

  React.useEffect(() => { table.getColumn('domain')?.setFilterValue(selectedDomains); }, [selectedDomains, table]);
  React.useEffect(() => { table.getColumn('difficulty')?.setFilterValue(selectedLevels); }, [selectedLevels, table]);
  React.useEffect(() => { table.getColumn('status')?.setFilterValue(selectedStatuses); }, [selectedStatuses, table]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Filter title/domain..."
          value={(table.getColumn('title')?.getFilterValue() as string) ?? ''}
          onChange={(e) => table.getColumn('title')?.setFilterValue(e.target.value)}
          className="h-8 w-[240px]"
        />

        {/* Domain facets */}
        <div className="hidden flex-wrap gap-1 md:flex">
          {uniqueDomains.map((d) => (
            <Toggle key={d} size="sm" pressed={selectedDomains.includes(d)} onPressedChange={(v) => setSelectedDomains(prev => v ? Array.from(new Set([...prev, d])) : prev.filter(x => x !== d))} className="data-[state=on]:bg-primary/20 data-[state=on]:text-primary">{d}</Toggle>
          ))}
        </div>

        {/* Difficulty facets */}
        <div className="hidden flex-wrap gap-1 md:flex">
          {uniqueLevels.map((lv) => (
            <Toggle key={lv} size="sm" pressed={selectedLevels.includes(lv)} onPressedChange={(v) => setSelectedLevels(prev => v ? Array.from(new Set([...prev, lv])) : prev.filter(x => x !== lv))} className="data-[state=on]:bg-primary/20 data-[state=on]:text-primary">{lv}</Toggle>
          ))}
        </div>

        {/* Status facets */}
        <div className="hidden flex-wrap gap-1 md:flex">
          {uniqueStatuses.map((st) => (
            <Toggle key={st} size="sm" pressed={selectedStatuses.includes(st)} onPressedChange={(v) => setSelectedStatuses(prev => v ? Array.from(new Set([...prev, st])) : prev.filter(x => x !== st))} className="data-[state=on]:bg-primary/20 data-[state=on]:text-primary">{st.replace(/_/g, ' ')}</Toggle>
          ))}
        </div>

        <Button variant="ghost" size="sm" onClick={() => { table.resetColumnFilters(); table.resetSorting(); setSelectedDomains([]); setSelectedLevels([]); setSelectedStatuses([]); }}>Clear</Button>

        <div className="ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">Columns<ChevronDown className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table.getAllLeafColumns().filter((c) => c.getCanHide()).map((column) => (
                <DropdownMenuCheckboxItem key={column.id} checked={column.getIsVisible()} onCheckedChange={(v) => column.toggleVisibility(!!v)}>
                  {column.columnDef.header as any}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="rounded-md border border-white/10 max-h-[480px] overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
                  <th key={header.id} className="px-3 py-2 text-left font-medium text-muted-foreground select-none" onClick={header.column.getToggleSortingHandler()}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getIsSorted() === "asc" ? " ↑" : header.column.getIsSorted() === "desc" ? " ↓" : ""}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-3 py-2 text-muted-foreground">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
