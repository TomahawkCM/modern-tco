"use client";

import * as React from "react";
import type { DomainStatRow } from "./types";
import { type ColumnDef, getCoreRowModel, getFilteredRowModel, getSortedRowModel, type SortingState, useReactTable, flexRender, type ColumnFiltersState, type VisibilityState, type FilterFn } from "@tanstack/react-table";
import { domainColumns } from "./columns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { usePersistentState } from "@/lib/usePersistentState";
import { useAuth } from "@/contexts/AuthContext";

export function DomainStatsTable({ rows }: { rows: DomainStatRow[] }) {
  const columns = React.useMemo<ColumnDef<DomainStatRow>[]>(() => domainColumns, []);
  const { user } = useAuth();
  const scope = user?.id ? `:u:${user.id}` : "";
  const [sorting, setSorting] = usePersistentState<SortingState>(
    `tco:table:analytics-domains:sorting${scope}`,
    []
  );
  const [columnFilters, setColumnFilters] = usePersistentState<ColumnFiltersState>(
    `tco:table:analytics-domains:filters${scope}`,
    []
  );
  const [columnVisibility, setColumnVisibility] = usePersistentState<VisibilityState>(
    `tco:table:analytics-domains:visibility${scope}`,
    {}
  );
  const [selectedDomains, setSelectedDomains] = usePersistentState<string[]>(
    `tco:table:analytics-domains:facets:domains${scope}`,
    []
  );

  const domainIn: FilterFn<DomainStatRow> = (row, columnId, filterValue) => {
    const sel: string[] = Array.isArray(filterValue) ? filterValue : [];
    if (sel.length === 0) return true;
    const val = String(row.getValue(columnId));
    return sel.includes(val);
  };

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
    filterFns: {
      minNumber: (row, columnId, filterValue) => {
        const v = Number(row.getValue(columnId));
        const min = Number((filterValue)?.min ?? 0);
        return v >= min;
      },
      domainIn,
    },
  });

  // Bind score min filter to a simple set of thresholds
  const scoreColumn = table.getColumn('score');
  const currentMin = (scoreColumn?.getFilterValue() as any)?.min ?? 0;

  // Unique domain list for facet toggles
  const uniqueDomains = React.useMemo(() => Array.from(new Set(rows.map(r => r.domain))), [rows]);

  // Sync domain facet with table filter
  React.useEffect(() => {
    const col = table.getColumn('domain');
    if (col) {
      // We can't set the filter fn dynamically on the column instance; we hint via id and rely on table.filterFns
      // by setting a marker value shape (array) and handling in our custom filter.
      col.setFilterValue(selectedDomains);
    }
  }, [selectedDomains, table]);

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <Input
          placeholder="Filter domain..."
          value={(table.getColumn('domain')?.getFilterValue() as string) ?? ''}
          onChange={(e) => table.getColumn('domain')?.setFilterValue(e.target.value)}
          className="h-8 w-[220px]"
        />

        {/* Facet: Domains */}
        <div className="hidden flex-wrap gap-1 md:flex">
          {uniqueDomains.map((d) => (
            <Toggle
              key={d}
              size="sm"
              pressed={selectedDomains.includes(d)}
              onPressedChange={(v) => {
                setSelectedDomains((prev) =>
                  v ? Array.from(new Set([...prev, d])) : prev.filter((x) => x !== d)
                );
              }}
              className="data-[state=on]:bg-primary/20 data-[state=on]:text-primary"
            >
              {d}
            </Toggle>
          ))}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1">
              Score ≥ {currentMin}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Minimum Score</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {[0, 60, 70, 80, 90].map((min) => (
              <DropdownMenuCheckboxItem
                key={min}
                checked={currentMin === min}
                onCheckedChange={() => scoreColumn?.setFilterValue({ min })}
              >
                {min}%
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

      {/* Table with sticky header */}
      <div className="rounded-md border border-white/10 max-h-[420px] overflow-auto">
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
            {table.getRowModel().rows.map((row) => (
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
