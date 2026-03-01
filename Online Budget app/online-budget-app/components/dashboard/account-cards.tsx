"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { MinorAmount } from "@/engine";

interface Account {
  readonly id: string;
  readonly name: string;
  readonly type: string;
  readonly balance_minor: number;
  readonly currency: string;
}

interface AccountCardsProps {
  accounts: Account[];
  totalBalance: MinorAmount;
  formatAmount: (amt: MinorAmount) => string;
}

export function AccountCards({
  accounts,
  totalBalance,
  formatAmount,
}: AccountCardsProps) {
  const t = useTranslations("dashboard.accounts");

  if (accounts.length === 0) {
    return (
      <Card>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {t("noAccounts")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {accounts.map((account) => (
          <Card key={account.id}>
            <CardContent>
              <p className="text-sm text-muted-foreground">{account.name}</p>
              <p className="text-lg font-semibold">
                {formatAmount({
                  amountMinor: account.balance_minor,
                  currency: account.currency,
                })}
              </p>
              <Badge variant="outline">{account.type}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        {t("netBalance", { balance: formatAmount(totalBalance) })}
      </p>
    </div>
  );
}
