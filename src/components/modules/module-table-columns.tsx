"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { ModuleListRow } from "./module-table-types";
import Link from "next/link";

export const moduleColumnsStatic: ColumnDef<ModuleListRow>[] = [
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => (
      <Link href={`/modules/${row.original.slug}`} className="text-primary hover:underline">
        {row.original.title}
      </Link>
    ),
  },
  {
    accessorKey: "domain",
    header: "Domain",
    filterFn: (row, _id, value) => {
      const sel: string[] = Array.isArray(value) ? value : [];
      if (sel.length === 0) return true;
      return sel.includes(String(row.getValue('domain')));
    },
  },
  {
    accessorKey: "difficulty",
    header: "Difficulty",
    filterFn: (row, _id, value) => {
      const sel: string[] = Array.isArray(value) ? value : [];
      if (sel.length === 0) return true;
      return sel.includes(String(row.getValue('difficulty')));
    },
  },
  {
    accessorKey: "estimatedTimeMinutes",
    header: "Est. Time (min)",
    cell: ({ getValue }) => <span>{getValue<number>()}</span>,
  },
];

export const moduleColumnsWithProgress: ColumnDef<ModuleListRow>[] = [
  ...moduleColumnsStatic,
  {
    accessorKey: "status",
    header: "Status",
    filterFn: (row, _id, value) => {
      const sel: string[] = Array.isArray(value) ? value : [];
      if (sel.length === 0) return true;
      return sel.includes(String(row.getValue('status')));
    },
  },
  {
    accessorKey: "progressPct",
    header: "Progress",
    cell: ({ getValue }) => <span>{getValue<number>() ?? 0}%</span>,
    sortingFn: (a, b, id) => (Number(a.getValue(id) || 0) - Number(b.getValue(id) || 0)),
  },
];

