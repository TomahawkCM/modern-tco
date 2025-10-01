"use client";

import * as React from "react";
import { type ColumnDef, flexRender, getCoreRowModel, getFilteredRowModel, getSortedRowModel, type SortingState, useReactTable, type ColumnFiltersState, type VisibilityState } from "@tanstack/react-table";
import type { ModuleListRow } from "./module-table-types";
import { moduleColumnsStatic } from "./module-table-columns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { usePersistentState } from "@/lib/usePersistentState";
import { useAuth } from "@/contexts/AuthContext";

export function ModulesStaticTable({ rows }: { rows: ModuleListRow[] }) {
  const columns = React.useMemo<ColumnDef<ModuleListRow>[]>(() => moduleColumnsStatic, []);
  const { user } = useAuth();
  const scope = user?.id ? `:u:${user.id}` : "";
  const [sorting, setSorting] = usePersistentState<SortingState>(`tco:table:modules-static:sorting${scope}`, []);
  const [columnFilters, setColumnFilters] = usePersistentState<ColumnFiltersState>(`tco:table:modules-static:filters${scope}`, []);
  const [columnVisibility, setColumnVisibility] = usePersistentState<VisibilityState>(`tco:table:modules-static:visibility${scope}`, {});
  const [selectedDomains, setSelectedDomains] = usePersistentState<string[]>(`tco:table:modules-static:facets:domains${scope}`, []);
  const [selectedLevels, setSelectedLevels] = usePersistentState<string[]>(`tco:table:modules-static:facets:levels${scope}`, []);
  const [maxTime, setMaxTime] = usePersistentState<number | null>(`tco:table:modules-static:facet:maxTime${scope}`, null);

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

  // Unique facet values
  const uniqueDomains = React.useMemo(() => Array.from(new Set(rows.map(r => r.domain))), [rows]);
  const uniqueLevels = React.useMemo(() => Array.from(new Set(rows.map(r => r.difficulty))), [rows]);

  // Apply filters
  React.useEffect(() => {
    table.getColumn('domain')?.setFilterValue(selectedDomains);
  }, [selectedDomains, table]);
  React.useEffect(() => {
    table.getColumn('difficulty')?.setFilterValue(selectedLevels);
  }, [selectedLevels, table]);
  React.useEffect(() => {
    if (maxTime == null) {
      table.getColumn('estimatedTimeMinutes')?.setFilterValue(undefined);
    } else {
      table.getColumn('estimatedTimeMinutes')?.setFilterValue({ max: maxTime });
    }
  }, [maxTime, table]);

  // custom filter for estimated time
  const estCol = table.getColumn('estimatedTimeMinutes');
  if (estCol && !estCol.getFilterFn()) {
    // monkey-patch filter behavior via columnDef provided filterFn isn't easily changed at runtime
    // We will rely on getFilteredRowModel with a predicate using setFilterValue shape
  }

  // client-side filter on rows for estimatedTimeMinutes max (simple approach to avoid custom filter wiring)
  const filteredRows = React.useMemo(() => {
    const rows0 = table.getRowModel().rows;
    if (maxTime == null) return rows0;
    return rows0.filter(r => {
      const v = Number(r.getValue('estimatedTimeMinutes'));
      return !Number.isNaN(v) && v <= maxTime;
    });
  }, [table.getRowModel().rows, maxTime]);

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
            <Toggle
              key={d}
              size="sm"
              pressed={selectedDomains.includes(d)}
              onPressedChange={(v) => setSelectedDomains(prev => v ? Array.from(new Set([...prev, d])) : prev.filter(x => x !== d))}
              className="data-[state=on]:bg-primary/20 data-[state=on]:text-primary"
            >
              {d}
            </Toggle>
          ))}
        </div>

        {/* Difficulty facets */}
        <div className="hidden flex-wrap gap-1 md:flex">
          {uniqueLevels.map((lv) => (
            <Toggle
              key={lv}
              size="sm"
              pressed={selectedLevels.includes(lv)}
              onPressedChange={(v) => setSelectedLevels(prev => v ? Array.from(new Set([...prev, lv])) : prev.filter(x => x !== lv))}
              className="data-[state=on]:bg-primary/20 data-[state=on]:text-primary"
            >
              {lv}
            </Toggle>
          ))}
        </div>

        {/* Estimated time thresholds */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1">
              {maxTime == null ? 'Any time' : `≤ ${maxTime} min`}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Max Estimated Time</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {[null, 30, 45, 60, 90, 120, 180].map((t, i) => (
              <DropdownMenuCheckboxItem
                key={i}
                checked={maxTime === t}
                onCheckedChange={() => setMaxTime(t as any)}
              >
                {t == null ? 'Any' : `≤ ${t} min`}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            table.resetColumnFilters();
            table.resetSorting();
            setSelectedDomains([]);
            setSelectedLevels([]);
            setMaxTime(null);
          }}
        >
          Clear
        </Button>

        <div className="ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                Columns
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table.getAllLeafColumns().filter((c) => c.getCanHide()).map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={column.getIsVisible()}
                  onCheckedChange={(v) => column.toggleVisibility(!!v)}
                >
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
                  <th
                    key={header.id}
                    className="px-3 py-2 text-left font-medium text-gray-200 select-none"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getIsSorted() === "asc" ? " ↑" : header.column.getIsSorted() === "desc" ? " ↓" : ""}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {filteredRows.map((row) => (
              <tr key={row.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-3 py-2 text-gray-300">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
