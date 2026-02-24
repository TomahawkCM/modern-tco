"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function TransactionFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromDate = searchParams.get("from") ?? "";
  const toDate = searchParams.get("to") ?? "";

  function applyFilters(formData: FormData) {
    const params = new URLSearchParams();
    const from = formData.get("from") as string;
    const to = formData.get("to") as string;
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    router.push(`/transactions?${params.toString()}`);
  }

  return (
    <form action={applyFilters} className="flex items-end gap-3">
      <div>
        <label className="mb-1 block text-xs text-muted-foreground">
          From
        </label>
        <Input type="date" name="from" defaultValue={fromDate} />
      </div>
      <div>
        <label className="mb-1 block text-xs text-muted-foreground">To</label>
        <Input type="date" name="to" defaultValue={toDate} />
      </div>
      <Button type="submit" variant="secondary" size="sm">
        Filter
      </Button>
    </form>
  );
}
