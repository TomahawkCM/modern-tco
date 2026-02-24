import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { MinorAmount } from "@/engine";

export interface TransactionDisplay {
  id: string;
  date: string;
  description: string | null;
  merchantName: string | null;
  categoryKey: string | null;
  amount: MinorAmount;
  isPending: boolean;
}

interface TransactionTableProps {
  transactions: TransactionDisplay[];
  formatAmount: (amt: MinorAmount) => string;
}

export function TransactionTable({
  transactions,
  formatAmount,
}: TransactionTableProps) {
  if (transactions.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No transactions found
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Category</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((tx) => (
          <TableRow key={tx.id}>
            <TableCell className="text-sm">{tx.date}</TableCell>
            <TableCell>
              <span className="text-sm font-medium">
                {tx.merchantName ?? tx.description ?? "\u2014"}
              </span>
              {tx.isPending && (
                <Badge variant="secondary" className="ml-2">
                  Pending
                </Badge>
              )}
            </TableCell>
            <TableCell>
              <span className="text-sm text-muted-foreground">
                {tx.categoryKey ?? "Uncategorized"}
              </span>
            </TableCell>
            <TableCell
              className={`text-right text-sm font-medium ${
                tx.amount.amountMinor >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {formatAmount(tx.amount)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
