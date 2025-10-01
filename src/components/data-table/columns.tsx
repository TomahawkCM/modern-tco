"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { DomainStatRow } from "./types";

export const domainColumns: ColumnDef<DomainStatRow>[] = [
  {
    accessorKey: "domain",
    header: "Domain",
    filterFn: (row, _id, value) => {
      const sel: string[] = Array.isArray(value) ? value : [];
      if (sel.length === 0) return true;
      return sel.includes(String(row.getValue('domain')));
    },
    cell: ({ row }) => <span className="font-medium">{row.original.domain}</span>,
  },
  {
    accessorKey: "score",
    header: "Score",
    cell: ({ getValue }) => <span>{getValue<number>()}%</span>,
  },
  {
    accessorKey: "questions",
    header: "Questions",
  },
  {
    accessorKey: "correct",
    header: "Correct",
  },
];
