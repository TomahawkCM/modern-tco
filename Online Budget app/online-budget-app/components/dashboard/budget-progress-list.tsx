import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { BudgetProgressItem, MinorAmount } from "@/engine";

interface BudgetProgressListProps {
  items: BudgetProgressItem[];
  currency: string;
  formatAmount: (amt: MinorAmount) => string;
}

export function BudgetProgressList({
  items,
  currency,
  formatAmount,
}: BudgetProgressListProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {items.map((bp) => {
        const variant = bp.isOverBudget
          ? "destructive"
          : bp.percentUsed > 80
            ? "secondary"
            : "default";

        return (
          <Card key={bp.categoryKey}>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{bp.categoryKey}</span>
                <Badge variant={variant}>
                  {bp.isOverBudget
                    ? "Over budget"
                    : `${bp.percentUsed.toFixed(0)}%`}
                </Badge>
              </div>
              <Progress
                value={Math.min(bp.percentUsed, 100)}
                className="mt-2 h-2"
              />
              <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                <span>
                  {formatAmount({
                    amountMinor: bp.spentMinor,
                    currency,
                  })}{" "}
                  spent
                </span>
                <span>
                  {formatAmount({
                    amountMinor: bp.limitMinor,
                    currency,
                  })}{" "}
                  limit
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
