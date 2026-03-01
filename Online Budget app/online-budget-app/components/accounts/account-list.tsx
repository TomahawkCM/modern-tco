"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import type { MinorAmount } from "@/engine";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  WalletIcon,
  BuildingIcon,
  CreditCardIcon,
  TrendingUpIcon,
  LandmarkIcon,
  CircleEllipsisIcon,
  LinkIcon,
} from "lucide-react";
import { PlaidLinkButton } from "@/components/bank-sync/plaid-link-button";
import { SyncStatus } from "@/components/bank-sync/sync-status";

interface AccountRow {
  id: string;
  user_id: string;
  institution_id: string | null;
  provider_account_id: string | null;
  name: string;
  type: "checking" | "savings" | "credit" | "investment" | "loan" | "other";
  currency: string;
  balance_minor: number;
  is_manual: boolean;
  created_at: string;
  updated_at: string;
}

/** Client-safe subset of ConnectedBankRow (no access_token_encrypted). */
interface ConnectedBankSafe {
  id: string;
  provider: string;
  institution_id: string | null;
  status: string;
  last_synced_at: string | null;
}

interface AccountListProps {
  accounts: AccountRow[];
  totalBalance: MinorAmount;
  currency: string;
  formatAmount: (amt: MinorAmount) => string;
  connectedBanks?: ConnectedBankSafe[];
}

const ACCOUNT_TYPES = ["checking", "savings", "credit", "investment", "loan", "other"] as const;

type AccountType = (typeof ACCOUNT_TYPES)[number];

const ACCOUNT_TYPE_ICONS: Record<AccountType, React.ReactNode> = {
  checking: <WalletIcon className="size-5" />,
  savings: <BuildingIcon className="size-5" />,
  credit: <CreditCardIcon className="size-5" />,
  investment: <TrendingUpIcon className="size-5" />,
  loan: <LandmarkIcon className="size-5" />,
  other: <CircleEllipsisIcon className="size-5" />,
};

interface AccountFormData {
  name: string;
  type: AccountType;
  currency: string;
  balance: string;
}

const INITIAL_FORM: AccountFormData = {
  name: "",
  type: "checking",
  currency: "USD",
  balance: "0",
};

export function AccountList({
  accounts,
  totalBalance,
  currency,
  formatAmount,
  connectedBanks = [],
}: AccountListProps) {
  const t = useTranslations("accounts");
  const tc = useTranslations("common");
  const tbs = useTranslations("bankSync");
  const router = useRouter();

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<AccountRow | null>(null);
  const [form, setForm] = useState<AccountFormData>(INITIAL_FORM);
  const [saving, setSaving] = useState(false);

  const handleCreate = useCallback(async () => {
    setSaving(true);
    try {
      const balanceMinor = Math.round(parseFloat(form.balance || "0") * 100);
      const res = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          type: form.type,
          currency: form.currency,
          balance_minor: balanceMinor,
          is_manual: true,
        }),
      });
      if (res.ok) {
        setCreateOpen(false);
        setForm(INITIAL_FORM);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }, [form, router]);

  const handleEdit = useCallback(async () => {
    if (!selectedAccount) return;
    setSaving(true);
    try {
      const balanceMinor = Math.round(parseFloat(form.balance || "0") * 100);
      const res = await fetch(`/api/accounts/${selectedAccount.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          type: form.type,
          currency: form.currency,
          balance_minor: balanceMinor,
        }),
      });
      if (res.ok) {
        setEditOpen(false);
        setSelectedAccount(null);
        setForm(INITIAL_FORM);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }, [form, selectedAccount, router]);

  const handleDelete = useCallback(async () => {
    if (!selectedAccount) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/accounts/${selectedAccount.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDeleteOpen(false);
        setSelectedAccount(null);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }, [selectedAccount, router]);

  const openEdit = (account: AccountRow) => {
    setSelectedAccount(account);
    setForm({
      name: account.name,
      type: account.type,
      currency: account.currency,
      balance: (account.balance_minor / 100).toFixed(2),
    });
    setEditOpen(true);
  };

  const openDelete = (account: AccountRow) => {
    setSelectedAccount(account);
    setDeleteOpen(true);
  };

  const formFields = (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">{t("fields.name")}</Label>
        <Input
          id="name"
          placeholder={t("fields.namePlaceholder")}
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="type">{t("fields.type")}</Label>
        <Select
          value={form.type}
          onValueChange={(v) => setForm((f) => ({ ...f, type: v as AccountType }))}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ACCOUNT_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {t(`types.${type}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="currency">{t("fields.currency")}</Label>
        <Input
          id="currency"
          maxLength={3}
          value={form.currency}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              currency: e.target.value.toUpperCase(),
            }))
          }
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="balance">{t("fields.balance")}</Label>
        <Input
          id="balance"
          type="number"
          step="0.01"
          value={form.balance}
          onChange={(e) => setForm((f) => ({ ...f, balance: e.target.value }))}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Total balance summary */}
      <Card>
        <CardContent className="flex items-center justify-between py-4">
          <div>
            <p className="text-sm text-muted-foreground">{t("totalBalance")}</p>
            <p className="text-2xl font-bold">{formatAmount(totalBalance)}</p>
          </div>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setForm({ ...INITIAL_FORM, currency })}>
                <PlusIcon />
                {t("addAccount")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("addAccount")}</DialogTitle>
                <DialogDescription>{t("description")}</DialogDescription>
              </DialogHeader>
              {formFields}
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateOpen(false)}>
                  {tc("cancel")}
                </Button>
                <Button onClick={handleCreate} disabled={saving || !form.name.trim()}>
                  {saving ? tc("saving") : tc("create")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Account cards */}
      {accounts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm font-medium">{t("noAccounts")}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t("noAccountsDescription")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => (
            <Card key={account.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">
                      {ACCOUNT_TYPE_ICONS[account.type] ?? ACCOUNT_TYPE_ICONS.other}
                    </span>
                    <div>
                      <CardTitle className="text-base">{account.name}</CardTitle>
                      <CardDescription>{t(`types.${account.type}`)}</CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline">{account.is_manual ? t("manual") : t("linked")}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-semibold">
                  {formatAmount({
                    amountMinor: account.balance_minor,
                    currency: account.currency,
                  })}
                </p>
                <div className="mt-3 flex gap-2">
                  <Button variant="ghost" size="xs" onClick={() => openEdit(account)}>
                    <PencilIcon />
                    {tc("edit")}
                  </Button>
                  <Button variant="ghost" size="xs" onClick={() => openDelete(account)}>
                    <TrashIcon />
                    {tc("delete")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("editAccount")}</DialogTitle>
          </DialogHeader>
          {formFields}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              {tc("cancel")}
            </Button>
            <Button onClick={handleEdit} disabled={saving || !form.name.trim()}>
              {saving ? tc("saving") : tc("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("deleteAccount")}</DialogTitle>
            <DialogDescription>{t("confirmDelete")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              {tc("cancel")}
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={saving}>
              {saving ? tc("loading") : tc("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bank Sync section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">{tbs("connectedBanks")}</h2>
          </div>
          <PlaidLinkButton onSuccess={() => router.refresh()} />
        </div>

        {connectedBanks.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-sm text-muted-foreground">{tbs("noConnectedBanks")}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {connectedBanks.map((bank) => (
              <SyncStatus
                key={bank.id}
                connectedBankId={bank.id}
                provider={bank.provider}
                status={bank.status}
                lastSyncedAt={bank.last_synced_at}
                onSyncComplete={() => router.refresh()}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
