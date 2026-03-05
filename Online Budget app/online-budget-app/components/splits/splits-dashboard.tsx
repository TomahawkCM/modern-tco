"use client";

import { useState, useCallback, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  UsersIcon,
  SplitIcon,
  DollarSignIcon,
  CheckCircleIcon,
  CircleIcon,
} from "lucide-react";
import type { MinorAmount } from "@/engine";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface SplitPersonRow {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  created_at: string;
}

interface ExpenseSplitRow {
  id: string;
  user_id: string;
  transaction_id: string | null;
  person_id: string;
  amount_minor: number;
  is_settled: boolean;
  created_at: string;
}

interface BalanceSummaryEntry {
  person_id: string;
  person_name: string;
  total_unsettled_minor: number;
}

interface SplitsDashboardProps {
  persons: SplitPersonRow[];
  splits: ExpenseSplitRow[];
  balances: BalanceSummaryEntry[];
  currency: string;
  formatAmount: (amt: MinorAmount) => string;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

interface PersonFormData {
  name: string;
  email: string;
}

const INITIAL_PERSON_FORM: PersonFormData = {
  name: "",
  email: "",
};

interface SplitFormData {
  person_id: string;
  amount: string;
  transaction_id: string;
}

const INITIAL_SPLIT_FORM: SplitFormData = {
  person_id: "",
  amount: "",
  transaction_id: "",
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function SplitsDashboard({
  persons,
  splits,
  balances,
  currency,
  formatAmount,
}: SplitsDashboardProps) {
  const t = useTranslations("splits");
  const tc = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();

  // Person state
  const [personCreateOpen, setPersonCreateOpen] = useState(false);
  const [personEditOpen, setPersonEditOpen] = useState(false);
  const [personDeleteOpen, setPersonDeleteOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<SplitPersonRow | null>(null);
  const [personForm, setPersonForm] = useState<PersonFormData>(INITIAL_PERSON_FORM);

  // Split state
  const [splitCreateOpen, setSplitCreateOpen] = useState(false);
  const [splitDeleteOpen, setSplitDeleteOpen] = useState(false);
  const [selectedSplit, setSelectedSplit] = useState<ExpenseSplitRow | null>(null);
  const [splitForm, setSplitForm] = useState<SplitFormData>(INITIAL_SPLIT_FORM);

  const [saving, setSaving] = useState(false);

  /* ---- Stats ---- */

  const stats = useMemo(() => {
    const totalOwed = balances.reduce(
      (s, b) => s + (b.total_unsettled_minor > 0 ? b.total_unsettled_minor : 0),
      0
    );
    const totalOwing = balances.reduce(
      (s, b) => s + (b.total_unsettled_minor < 0 ? Math.abs(b.total_unsettled_minor) : 0),
      0
    );
    return { totalOwed, totalOwing };
  }, [balances]);

  /* ---- Person name lookup ---- */

  const personMap = useMemo(() => {
    return new Map(persons.map((p) => [p.id, p.name]));
  }, [persons]);

  /* ---- Person CRUD ---- */

  const handleCreatePerson = useCallback(async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/splits/persons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: personForm.name,
          email: personForm.email || null,
        }),
      });
      if (res.ok) {
        setPersonCreateOpen(false);
        setPersonForm(INITIAL_PERSON_FORM);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }, [personForm, router]);

  const handleEditPerson = useCallback(async () => {
    if (!selectedPerson) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/splits/persons/${selectedPerson.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: personForm.name,
          email: personForm.email || null,
        }),
      });
      if (res.ok) {
        setPersonEditOpen(false);
        setSelectedPerson(null);
        setPersonForm(INITIAL_PERSON_FORM);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }, [personForm, selectedPerson, router]);

  const handleDeletePerson = useCallback(async () => {
    if (!selectedPerson) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/splits/persons/${selectedPerson.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setPersonDeleteOpen(false);
        setSelectedPerson(null);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }, [selectedPerson, router]);

  const openEditPerson = (person: SplitPersonRow) => {
    setSelectedPerson(person);
    setPersonForm({
      name: person.name,
      email: person.email ?? "",
    });
    setPersonEditOpen(true);
  };

  const openDeletePerson = (person: SplitPersonRow) => {
    setSelectedPerson(person);
    setPersonDeleteOpen(true);
  };

  /* ---- Split CRUD ---- */

  const handleCreateSplit = useCallback(async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/splits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          person_id: splitForm.person_id,
          amount_minor: Math.round(parseFloat(splitForm.amount || "0") * 100),
          transaction_id: splitForm.transaction_id || null,
          is_settled: false,
        }),
      });
      if (res.ok) {
        setSplitCreateOpen(false);
        setSplitForm(INITIAL_SPLIT_FORM);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }, [splitForm, router]);

  const handleToggleSettled = useCallback(
    async (split: ExpenseSplitRow) => {
      setSaving(true);
      try {
        const res = await fetch(`/api/splits/${split.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            is_settled: !split.is_settled,
          }),
        });
        if (res.ok) {
          router.refresh();
        }
      } finally {
        setSaving(false);
      }
    },
    [router]
  );

  const handleDeleteSplit = useCallback(async () => {
    if (!selectedSplit) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/splits/${selectedSplit.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setSplitDeleteOpen(false);
        setSelectedSplit(null);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }, [selectedSplit, router]);

  const openDeleteSplit = (split: ExpenseSplitRow) => {
    setSelectedSplit(split);
    setSplitDeleteOpen(true);
  };

  /* ---- Person form fields ---- */

  const personFormFields = (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="person_name">{t("persons.name")}</Label>
        <Input
          id="person_name"
          value={personForm.name}
          onChange={(e) => setPersonForm((f) => ({ ...f, name: e.target.value }))}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="person_email">{t("persons.email")}</Label>
        <Input
          id="person_email"
          type="email"
          value={personForm.email}
          onChange={(e) => setPersonForm((f) => ({ ...f, email: e.target.value }))}
        />
      </div>
    </div>
  );

  /* ---- Render ---- */

  return (
    <div className="space-y-8">
      {/* Balance Summary */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">{t("balance.title")}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardContent className="flex items-center gap-3 py-4">
              <DollarSignIcon className="size-5 text-emerald-500" />
              <div>
                <p className="text-sm text-muted-foreground">{t("balance.totalOwed")}</p>
                <p className="text-2xl font-bold">
                  {formatAmount({ amountMinor: stats.totalOwed, currency })}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 py-4">
              <DollarSignIcon className="size-5 text-rose-500" />
              <div>
                <p className="text-sm text-muted-foreground">{t("balance.totalOwing")}</p>
                <p className="text-2xl font-bold">
                  {formatAmount({ amountMinor: stats.totalOwing, currency })}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {balances.length > 0 && (
          <div className="space-y-2">
            {balances.map((b) => (
              <Card key={b.person_id}>
                <CardContent className="flex items-center justify-between py-3">
                  <span className="font-medium">{b.person_name}</span>
                  <span
                    className={
                      b.total_unsettled_minor > 0
                        ? "font-medium text-emerald-600"
                        : b.total_unsettled_minor < 0
                          ? "font-medium text-rose-600"
                          : "text-muted-foreground"
                    }
                  >
                    {b.total_unsettled_minor > 0
                      ? `${t("balance.owes")} ${formatAmount({ amountMinor: b.total_unsettled_minor, currency })}`
                      : b.total_unsettled_minor < 0
                        ? `${t("balance.youOwe")} ${formatAmount({ amountMinor: Math.abs(b.total_unsettled_minor), currency })}`
                        : t("balance.settled")}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* People Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t("persons.title")}</h2>
          <Dialog open={personCreateOpen} onOpenChange={setPersonCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => setPersonForm(INITIAL_PERSON_FORM)}>
                <PlusIcon />
                {t("persons.addPerson")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("persons.addPerson")}</DialogTitle>
              </DialogHeader>
              {personFormFields}
              <DialogFooter>
                <Button variant="outline" onClick={() => setPersonCreateOpen(false)}>
                  {tc("cancel")}
                </Button>
                <Button onClick={handleCreatePerson} disabled={saving || !personForm.name.trim()}>
                  {saving ? tc("saving") : tc("create")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {persons.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <UsersIcon className="mx-auto mb-2 size-8 text-muted-foreground" />
              <p className="text-sm font-medium">{t("persons.noPeople")}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("persons.noPeopleDescription")}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {persons.map((person) => (
              <Card key={person.id}>
                <CardContent className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">{person.name}</p>
                    {person.email && (
                      <p className="text-xs text-muted-foreground">{person.email}</p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="xs" onClick={() => openEditPerson(person)}>
                      <PencilIcon />
                    </Button>
                    <Button variant="ghost" size="xs" onClick={() => openDeletePerson(person)}>
                      <TrashIcon />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Splits Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t("expenses.title")}</h2>
          <Dialog open={splitCreateOpen} onOpenChange={setSplitCreateOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                disabled={persons.length === 0}
                onClick={() => setSplitForm(INITIAL_SPLIT_FORM)}
              >
                <PlusIcon />
                {t("expenses.addSplit")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("expenses.addSplit")}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="split_person">{t("expenses.person")}</Label>
                  <Select
                    value={splitForm.person_id}
                    onValueChange={(v) => setSplitForm((f) => ({ ...f, person_id: v }))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {persons.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="split_amount">{t("expenses.amount")}</Label>
                  <Input
                    id="split_amount"
                    type="number"
                    step="0.01"
                    value={splitForm.amount}
                    onChange={(e) => setSplitForm((f) => ({ ...f, amount: e.target.value }))}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSplitCreateOpen(false)}>
                  {tc("cancel")}
                </Button>
                <Button
                  onClick={handleCreateSplit}
                  disabled={saving || !splitForm.person_id || !splitForm.amount}
                >
                  {saving ? tc("saving") : tc("create")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {splits.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <SplitIcon className="mx-auto mb-2 size-8 text-muted-foreground" />
              <p className="text-sm font-medium">{t("expenses.noSplits")}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("expenses.noSplitsDescription")}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {splits.map((split) => (
              <Card key={split.id}>
                <CardContent className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => handleToggleSettled(split)}
                      disabled={saving}
                    >
                      {split.is_settled ? (
                        <CheckCircleIcon className="size-5 text-emerald-500" />
                      ) : (
                        <CircleIcon className="size-5 text-muted-foreground" />
                      )}
                    </Button>
                    <div>
                      <p className="font-medium">
                        {personMap.get(split.person_id) ?? split.person_id}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(split.created_at).toLocaleDateString(locale)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium">
                      {formatAmount({ amountMinor: split.amount_minor, currency })}
                    </span>
                    <Badge variant={split.is_settled ? "secondary" : "default"}>
                      {split.is_settled ? t("expenses.settled") : t("expenses.unsettled")}
                    </Badge>
                    <Button variant="ghost" size="xs" onClick={() => openDeleteSplit(split)}>
                      <TrashIcon />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Edit person dialog */}
      <Dialog open={personEditOpen} onOpenChange={setPersonEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("persons.editPerson")}</DialogTitle>
          </DialogHeader>
          {personFormFields}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPersonEditOpen(false)}>
              {tc("cancel")}
            </Button>
            <Button onClick={handleEditPerson} disabled={saving || !personForm.name.trim()}>
              {saving ? tc("saving") : tc("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete person dialog */}
      <Dialog open={personDeleteOpen} onOpenChange={setPersonDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("persons.deletePerson")}</DialogTitle>
            <DialogDescription>{t("confirmDelete")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPersonDeleteOpen(false)}>
              {tc("cancel")}
            </Button>
            <Button variant="destructive" onClick={handleDeletePerson} disabled={saving}>
              {saving ? tc("loading") : tc("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete split dialog */}
      <Dialog open={splitDeleteOpen} onOpenChange={setSplitDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("actions.delete")}</DialogTitle>
            <DialogDescription>{t("confirmDelete")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSplitDeleteOpen(false)}>
              {tc("cancel")}
            </Button>
            <Button variant="destructive" onClick={handleDeleteSplit} disabled={saving}>
              {saving ? tc("loading") : tc("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
