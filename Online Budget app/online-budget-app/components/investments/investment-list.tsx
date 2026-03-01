"use client";

import { useState, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  LazyPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "@/components/charts/lazy-charts";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  TrendingUpIcon,
  WalletIcon,
  LayersIcon,
  BuildingIcon,
} from "lucide-react";

/* ---------- Types ---------- */

interface InvestmentAccountRow {
  id: string;
  user_id: string;
  name: string;
  account_type: string;
  institution: string | null;
  currency: string;
  created_at: string;
  updated_at: string;
}

interface HoldingRow {
  id: string;
  user_id: string;
  investment_account_id: string;
  symbol: string;
  name: string | null;
  shares: number;
  purchase_price_minor: number;
  purchase_date: string | null;
  currency: string;
  created_at: string;
  updated_at: string;
}

interface InvestmentListProps {
  accounts: InvestmentAccountRow[];
  holdingsByAccount: Record<string, HoldingRow[]>;
  currency: string;
  formatAmount: (amt: { amountMinor: number; currency: string }) => string;
}

/* ---------- Constants ---------- */

const ACCOUNT_TYPES = ["brokerage", "rrsp", "tfsa", "401k", "ira", "roth_ira", "other"] as const;
type InvestmentAccountType = (typeof ACCOUNT_TYPES)[number];

const CHART_COLORS = [
  "#6366f1",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#3b82f6",
  "#a855f7",
  "#ec4899",
  "#14b8a6",
];

/* ---------- Form types ---------- */

interface AccountFormData {
  name: string;
  account_type: InvestmentAccountType;
  institution: string;
  currency: string;
}

interface HoldingFormData {
  symbol: string;
  name: string;
  shares: string;
  purchasePrice: string;
  purchaseDate: string;
  currency: string;
}

const INITIAL_ACCOUNT_FORM: AccountFormData = {
  name: "",
  account_type: "brokerage",
  institution: "",
  currency: "USD",
};

const INITIAL_HOLDING_FORM: HoldingFormData = {
  symbol: "",
  name: "",
  shares: "",
  purchasePrice: "",
  purchaseDate: "",
  currency: "USD",
};

/* ---------- Helpers ---------- */

function holdingValue(h: HoldingRow): number {
  return h.shares * h.purchase_price_minor;
}

function accountTotalMinor(holdings: HoldingRow[]): number {
  return holdings.reduce((sum, h) => sum + holdingValue(h), 0);
}

/* ---------- Component ---------- */

export function InvestmentList({
  accounts,
  holdingsByAccount,
  currency,
  formatAmount,
}: InvestmentListProps) {
  const t = useTranslations("investments");
  const tc = useTranslations("common");
  const router = useRouter();

  /* Expanded accounts */
  const [expandedAccounts, setExpandedAccounts] = useState<Set<string>>(new Set());

  /* Account dialogs */
  const [createAccountOpen, setCreateAccountOpen] = useState(false);
  const [editAccountOpen, setEditAccountOpen] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<InvestmentAccountRow | null>(null);
  const [accountForm, setAccountForm] = useState<AccountFormData>(INITIAL_ACCOUNT_FORM);

  /* Holding dialogs */
  const [createHoldingOpen, setCreateHoldingOpen] = useState(false);
  const [editHoldingOpen, setEditHoldingOpen] = useState(false);
  const [deleteHoldingOpen, setDeleteHoldingOpen] = useState(false);
  const [holdingAccountId, setHoldingAccountId] = useState<string>("");
  const [selectedHolding, setSelectedHolding] = useState<HoldingRow | null>(null);
  const [holdingForm, setHoldingForm] = useState<HoldingFormData>(INITIAL_HOLDING_FORM);

  const [saving, setSaving] = useState(false);

  /* ---------- Computed stats ---------- */

  const allHoldings = useMemo(() => Object.values(holdingsByAccount).flat(), [holdingsByAccount]);

  const totalValueMinor = useMemo(
    () => allHoldings.reduce((sum, h) => sum + holdingValue(h), 0),
    [allHoldings]
  );

  const pieData = useMemo(
    () =>
      accounts
        .map((account) => ({
          name: account.name,
          value: accountTotalMinor(holdingsByAccount[account.id] ?? []),
        }))
        .filter((d) => d.value > 0),
    [accounts, holdingsByAccount]
  );

  /* ---------- Toggle expand ---------- */

  const toggleExpand = (id: string) => {
    setExpandedAccounts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  /* ---------- Account CRUD ---------- */

  const handleCreateAccount = useCallback(async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/investments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: accountForm.name,
          account_type: accountForm.account_type,
          institution: accountForm.institution || null,
          currency: accountForm.currency,
        }),
      });
      if (res.ok) {
        setCreateAccountOpen(false);
        setAccountForm(INITIAL_ACCOUNT_FORM);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }, [accountForm, router]);

  const handleEditAccount = useCallback(async () => {
    if (!selectedAccount) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/investments/${selectedAccount.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: accountForm.name,
          account_type: accountForm.account_type,
          institution: accountForm.institution || null,
          currency: accountForm.currency,
        }),
      });
      if (res.ok) {
        setEditAccountOpen(false);
        setSelectedAccount(null);
        setAccountForm(INITIAL_ACCOUNT_FORM);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }, [accountForm, selectedAccount, router]);

  const handleDeleteAccount = useCallback(async () => {
    if (!selectedAccount) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/investments/${selectedAccount.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDeleteAccountOpen(false);
        setSelectedAccount(null);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }, [selectedAccount, router]);

  const openEditAccount = (account: InvestmentAccountRow) => {
    setSelectedAccount(account);
    setAccountForm({
      name: account.name,
      account_type: account.account_type as InvestmentAccountType,
      institution: account.institution ?? "",
      currency: account.currency,
    });
    setEditAccountOpen(true);
  };

  const openDeleteAccount = (account: InvestmentAccountRow) => {
    setSelectedAccount(account);
    setDeleteAccountOpen(true);
  };

  /* ---------- Holding CRUD ---------- */

  const handleCreateHolding = useCallback(async () => {
    if (!holdingAccountId) return;
    setSaving(true);
    try {
      const purchasePriceMinor = Math.round(parseFloat(holdingForm.purchasePrice || "0") * 100);
      const res = await fetch(`/api/investments/${holdingAccountId}/holdings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: holdingForm.symbol.toUpperCase(),
          name: holdingForm.name || null,
          shares: parseFloat(holdingForm.shares || "0"),
          purchase_price_minor: purchasePriceMinor,
          purchase_date: holdingForm.purchaseDate || null,
          currency: holdingForm.currency,
        }),
      });
      if (res.ok) {
        setCreateHoldingOpen(false);
        setHoldingForm(INITIAL_HOLDING_FORM);
        setHoldingAccountId("");
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }, [holdingForm, holdingAccountId, router]);

  const handleEditHolding = useCallback(async () => {
    if (!selectedHolding || !holdingAccountId) return;
    setSaving(true);
    try {
      const purchasePriceMinor = Math.round(parseFloat(holdingForm.purchasePrice || "0") * 100);
      const res = await fetch(
        `/api/investments/${holdingAccountId}/holdings/${selectedHolding.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            symbol: holdingForm.symbol.toUpperCase(),
            name: holdingForm.name || null,
            shares: parseFloat(holdingForm.shares || "0"),
            purchase_price_minor: purchasePriceMinor,
            purchase_date: holdingForm.purchaseDate || null,
            currency: holdingForm.currency,
          }),
        }
      );
      if (res.ok) {
        setEditHoldingOpen(false);
        setSelectedHolding(null);
        setHoldingForm(INITIAL_HOLDING_FORM);
        setHoldingAccountId("");
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }, [holdingForm, selectedHolding, holdingAccountId, router]);

  const handleDeleteHolding = useCallback(async () => {
    if (!selectedHolding || !holdingAccountId) return;
    setSaving(true);
    try {
      const res = await fetch(
        `/api/investments/${holdingAccountId}/holdings/${selectedHolding.id}`,
        {
          method: "DELETE",
        }
      );
      if (res.ok) {
        setDeleteHoldingOpen(false);
        setSelectedHolding(null);
        setHoldingAccountId("");
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }, [selectedHolding, holdingAccountId, router]);

  const openAddHolding = (accountId: string) => {
    setHoldingAccountId(accountId);
    const account = accounts.find((a) => a.id === accountId);
    setHoldingForm({ ...INITIAL_HOLDING_FORM, currency: account?.currency ?? currency });
    setCreateHoldingOpen(true);
  };

  const openEditHolding = (holding: HoldingRow) => {
    setSelectedHolding(holding);
    setHoldingAccountId(holding.investment_account_id);
    setHoldingForm({
      symbol: holding.symbol,
      name: holding.name ?? "",
      shares: String(holding.shares),
      purchasePrice: (holding.purchase_price_minor / 100).toFixed(2),
      purchaseDate: holding.purchase_date ?? "",
      currency: holding.currency,
    });
    setEditHoldingOpen(true);
  };

  const openDeleteHolding = (holding: HoldingRow) => {
    setSelectedHolding(holding);
    setHoldingAccountId(holding.investment_account_id);
    setDeleteHoldingOpen(true);
  };

  /* ---------- Form fields (account) ---------- */

  const accountFormFields = (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="acct-name">{t("fields.name")}</Label>
        <Input
          id="acct-name"
          placeholder={t("fields.namePlaceholder")}
          value={accountForm.name}
          onChange={(e) => setAccountForm((f) => ({ ...f, name: e.target.value }))}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="acct-type">{t("fields.accountType")}</Label>
        <Select
          value={accountForm.account_type}
          onValueChange={(v) =>
            setAccountForm((f) => ({ ...f, account_type: v as InvestmentAccountType }))
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ACCOUNT_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {t(`accountTypes.${type}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="acct-institution">{t("fields.institution")}</Label>
        <Input
          id="acct-institution"
          placeholder={t("fields.institutionPlaceholder")}
          value={accountForm.institution}
          onChange={(e) => setAccountForm((f) => ({ ...f, institution: e.target.value }))}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="acct-currency">{t("fields.currency")}</Label>
        <Input
          id="acct-currency"
          maxLength={3}
          value={accountForm.currency}
          onChange={(e) =>
            setAccountForm((f) => ({
              ...f,
              currency: e.target.value.toUpperCase(),
            }))
          }
        />
      </div>
    </div>
  );

  /* ---------- Form fields (holding) ---------- */

  const holdingFormFields = (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="hold-symbol">{t("holdingFields.symbol")}</Label>
        <Input
          id="hold-symbol"
          placeholder={t("holdingFields.symbolPlaceholder")}
          value={holdingForm.symbol}
          onChange={(e) => setHoldingForm((f) => ({ ...f, symbol: e.target.value.toUpperCase() }))}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="hold-name">{t("holdingFields.holdingName")}</Label>
        <Input
          id="hold-name"
          value={holdingForm.name}
          onChange={(e) => setHoldingForm((f) => ({ ...f, name: e.target.value }))}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="hold-shares">{t("holdingFields.shares")}</Label>
        <Input
          id="hold-shares"
          type="number"
          step="0.0001"
          value={holdingForm.shares}
          onChange={(e) => setHoldingForm((f) => ({ ...f, shares: e.target.value }))}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="hold-price">{t("holdingFields.purchasePrice")}</Label>
        <Input
          id="hold-price"
          type="number"
          step="0.01"
          value={holdingForm.purchasePrice}
          onChange={(e) => setHoldingForm((f) => ({ ...f, purchasePrice: e.target.value }))}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="hold-date">{t("holdingFields.purchaseDate")}</Label>
        <Input
          id="hold-date"
          type="date"
          value={holdingForm.purchaseDate}
          onChange={(e) => setHoldingForm((f) => ({ ...f, purchaseDate: e.target.value }))}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="hold-currency">{t("holdingFields.currency")}</Label>
        <Input
          id="hold-currency"
          maxLength={3}
          value={holdingForm.currency}
          onChange={(e) =>
            setHoldingForm((f) => ({
              ...f,
              currency: e.target.value.toUpperCase(),
            }))
          }
        />
      </div>
    </div>
  );

  /* ---------- Empty state ---------- */

  if (accounts.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm font-medium">{t("noAccounts")}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t("noAccountsDescription")}</p>
            <Button
              className="mt-4"
              onClick={() => {
                setAccountForm({ ...INITIAL_ACCOUNT_FORM, currency });
                setCreateAccountOpen(true);
              }}
            >
              <PlusIcon />
              {t("addAccount")}
            </Button>
          </CardContent>
        </Card>

        {/* Create account dialog (also needed for empty state) */}
        <Dialog open={createAccountOpen} onOpenChange={setCreateAccountOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("addAccount")}</DialogTitle>
              <DialogDescription>{t("description")}</DialogDescription>
            </DialogHeader>
            {accountFormFields}
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateAccountOpen(false)}>
                {tc("cancel")}
              </Button>
              <Button onClick={handleCreateAccount} disabled={saving || !accountForm.name.trim()}>
                {saving ? tc("saving") : tc("create")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  /* ---------- Main render ---------- */

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <TrendingUpIcon className="size-4" />
              {t("stats.totalValue")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatAmount({ amountMinor: totalValueMinor, currency })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <WalletIcon className="size-4" />
              {t("stats.totalCost")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatAmount({ amountMinor: totalValueMinor, currency })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <BuildingIcon className="size-4" />
              {tc("filter")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{accounts.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <LayersIcon className="size-4" />
              {t("holdings")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{allHoldings.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Add account button */}
      <div className="flex justify-end">
        <Button
          onClick={() => {
            setAccountForm({ ...INITIAL_ACCOUNT_FORM, currency });
            setCreateAccountOpen(true);
          }}
        >
          <PlusIcon />
          {t("addAccount")}
        </Button>
      </div>

      {/* Investment account cards */}
      <div className="space-y-4">
        {accounts.map((account) => {
          const holdings = holdingsByAccount[account.id] ?? [];
          const accountValue = accountTotalMinor(holdings);
          const isExpanded = expandedAccounts.has(account.id);

          return (
            <Card key={account.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <TrendingUpIcon className="size-5 text-muted-foreground" />
                    <div>
                      <CardTitle className="text-base">{account.name}</CardTitle>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge variant="outline">
                          {t(`accountTypes.${account.account_type as InvestmentAccountType}`)}
                        </Badge>
                        {account.institution && (
                          <span className="text-xs text-muted-foreground">
                            {account.institution}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="xs" onClick={() => openEditAccount(account)}>
                      <PencilIcon />
                      {tc("edit")}
                    </Button>
                    <Button variant="ghost" size="xs" onClick={() => openDeleteAccount(account)}>
                      <TrashIcon />
                      {tc("delete")}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xl font-semibold">
                      {formatAmount({ amountMinor: accountValue, currency: account.currency })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {holdings.length} {t("holdings")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => openAddHolding(account.id)}>
                      <PlusIcon />
                      {t("addHolding")}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => toggleExpand(account.id)}>
                      {isExpanded ? (
                        <>
                          <ChevronUpIcon />
                          {t("hideDetails")}
                        </>
                      ) : (
                        <>
                          <ChevronDownIcon />
                          {t("showDetails")}
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Holdings table (expanded) */}
                {isExpanded && (
                  <div className="mt-4 overflow-x-auto">
                    {holdings.length === 0 ? (
                      <p className="py-4 text-center text-sm text-muted-foreground">
                        {t("noAccountsDescription")}
                      </p>
                    ) : (
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b text-left text-muted-foreground">
                            <th className="pb-2 pr-4 font-medium">{t("holdingFields.symbol")}</th>
                            <th className="pb-2 pr-4 font-medium">
                              {t("holdingFields.holdingName")}
                            </th>
                            <th className="pb-2 pr-4 text-right font-medium">
                              {t("holdingFields.shares")}
                            </th>
                            <th className="pb-2 pr-4 text-right font-medium">
                              {t("holdingFields.purchasePrice")}
                            </th>
                            <th className="pb-2 pr-4 text-right font-medium">
                              {t("stats.totalValue")}
                            </th>
                            <th className="pb-2 font-medium" />
                          </tr>
                        </thead>
                        <tbody>
                          {holdings.map((holding) => (
                            <tr key={holding.id} className="border-b last:border-0">
                              <td className="py-2 pr-4 font-mono font-medium">{holding.symbol}</td>
                              <td className="py-2 pr-4 text-muted-foreground">
                                {holding.name ?? "-"}
                              </td>
                              <td className="py-2 pr-4 text-right">{holding.shares}</td>
                              <td className="py-2 pr-4 text-right">
                                {formatAmount({
                                  amountMinor: holding.purchase_price_minor,
                                  currency: holding.currency,
                                })}
                              </td>
                              <td className="py-2 pr-4 text-right font-medium">
                                {formatAmount({
                                  amountMinor: holdingValue(holding),
                                  currency: holding.currency,
                                })}
                              </td>
                              <td className="py-2 text-right">
                                <div className="flex justify-end gap-1">
                                  <Button
                                    variant="ghost"
                                    size="xs"
                                    onClick={() => openEditHolding(holding)}
                                  >
                                    <PencilIcon />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="xs"
                                    onClick={() => openDeleteHolding(holding)}
                                  >
                                    <TrashIcon />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Portfolio Allocation PieChart */}
      {pieData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("portfolio")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LazyPieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name }) => name}
                  >
                    {pieData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number | undefined) =>
                      formatAmount({ amountMinor: value ?? 0, currency })
                    }
                  />
                </LazyPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create account dialog */}
      <Dialog open={createAccountOpen} onOpenChange={setCreateAccountOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("addAccount")}</DialogTitle>
            <DialogDescription>{t("description")}</DialogDescription>
          </DialogHeader>
          {accountFormFields}
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateAccountOpen(false)}>
              {tc("cancel")}
            </Button>
            <Button onClick={handleCreateAccount} disabled={saving || !accountForm.name.trim()}>
              {saving ? tc("saving") : tc("create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit account dialog */}
      <Dialog open={editAccountOpen} onOpenChange={setEditAccountOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("editAccount")}</DialogTitle>
          </DialogHeader>
          {accountFormFields}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditAccountOpen(false)}>
              {tc("cancel")}
            </Button>
            <Button onClick={handleEditAccount} disabled={saving || !accountForm.name.trim()}>
              {saving ? tc("saving") : tc("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete account confirmation */}
      <Dialog open={deleteAccountOpen} onOpenChange={setDeleteAccountOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("deleteAccount")}</DialogTitle>
            <DialogDescription>{t("confirmDeleteAccount")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteAccountOpen(false)}>
              {tc("cancel")}
            </Button>
            <Button variant="destructive" onClick={handleDeleteAccount} disabled={saving}>
              {saving ? tc("loading") : tc("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create holding dialog */}
      <Dialog open={createHoldingOpen} onOpenChange={setCreateHoldingOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("addHolding")}</DialogTitle>
          </DialogHeader>
          {holdingFormFields}
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateHoldingOpen(false)}>
              {tc("cancel")}
            </Button>
            <Button onClick={handleCreateHolding} disabled={saving || !holdingForm.symbol.trim()}>
              {saving ? tc("saving") : tc("create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit holding dialog */}
      <Dialog open={editHoldingOpen} onOpenChange={setEditHoldingOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("editHolding")}</DialogTitle>
          </DialogHeader>
          {holdingFormFields}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditHoldingOpen(false)}>
              {tc("cancel")}
            </Button>
            <Button onClick={handleEditHolding} disabled={saving || !holdingForm.symbol.trim()}>
              {saving ? tc("saving") : tc("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete holding confirmation */}
      <Dialog open={deleteHoldingOpen} onOpenChange={setDeleteHoldingOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("deleteHolding")}</DialogTitle>
            <DialogDescription>{t("confirmDeleteHolding")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteHoldingOpen(false)}>
              {tc("cancel")}
            </Button>
            <Button variant="destructive" onClick={handleDeleteHolding} disabled={saving}>
              {saving ? tc("loading") : tc("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
