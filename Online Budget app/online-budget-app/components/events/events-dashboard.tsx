"use client";

import { useState, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  CalendarIcon,
  DollarSignIcon,
  WalletIcon,
  PercentIcon,
  ArrowLeftIcon,
} from "lucide-react";
import type { MinorAmount } from "@/engine";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface EventBudgetRow {
  id: string;
  user_id: string;
  name: string;
  total_budget_minor: number;
  start_date: string | null;
  end_date: string | null;
  currency: string;
  created_at: string;
  updated_at: string;
}

interface EventBudgetItemRow {
  id: string;
  event_budget_id: string;
  category_name: string;
  budget_minor: number;
  spent_minor: number;
  notes: string | null;
}

interface EventsDashboardProps {
  events: EventBudgetRow[];
  currency: string;
  formatAmount: (amt: MinorAmount) => string;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

interface EventFormData {
  name: string;
  total_budget: string;
  start_date: string;
  end_date: string;
}

const INITIAL_EVENT_FORM: EventFormData = {
  name: "",
  total_budget: "",
  start_date: "",
  end_date: "",
};

interface ItemFormData {
  category_name: string;
  budget: string;
  spent: string;
  notes: string;
}

const INITIAL_ITEM_FORM: ItemFormData = {
  category_name: "",
  budget: "",
  spent: "0",
  notes: "",
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function EventsDashboard({ events, currency, formatAmount }: EventsDashboardProps) {
  const t = useTranslations("events");
  const tc = useTranslations("common");
  const router = useRouter();

  // Event-level state
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventBudgetRow | null>(null);
  const [eventForm, setEventForm] = useState<EventFormData>(INITIAL_EVENT_FORM);
  const [saving, setSaving] = useState(false);

  // Item-level state (when viewing a specific event)
  const [activeEvent, setActiveEvent] = useState<EventBudgetRow | null>(null);
  const [items, setItems] = useState<EventBudgetItemRow[]>([]);
  const [itemCreateOpen, setItemCreateOpen] = useState(false);
  const [itemEditOpen, setItemEditOpen] = useState(false);
  const [itemDeleteOpen, setItemDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<EventBudgetItemRow | null>(null);
  const [itemForm, setItemForm] = useState<ItemFormData>(INITIAL_ITEM_FORM);
  const [loadingItems, setLoadingItems] = useState(false);

  /* ---- Stats ---- */

  const stats = useMemo(() => {
    const totalBudget = events.reduce((s, e) => s + e.total_budget_minor, 0);
    return {
      totalEvents: events.length,
      totalBudget,
    };
  }, [events]);

  const itemStats = useMemo(() => {
    const totalBudget = items.reduce((s, i) => s + i.budget_minor, 0);
    const totalSpent = items.reduce((s, i) => s + i.spent_minor, 0);
    const remaining = totalBudget - totalSpent;
    const percentUsed = totalBudget > 0 ? Math.min(100, (totalSpent / totalBudget) * 100) : 0;
    return { totalBudget, totalSpent, remaining, percentUsed };
  }, [items]);

  /* ---- Fetch items ---- */

  const fetchItems = useCallback(async (eventId: string) => {
    setLoadingItems(true);
    try {
      const res = await fetch(`/api/events/${eventId}/items`);
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } finally {
      setLoadingItems(false);
    }
  }, []);

  const openEvent = useCallback(
    (event: EventBudgetRow) => {
      setActiveEvent(event);
      fetchItems(event.id);
    },
    [fetchItems]
  );

  /* ---- Event CRUD ---- */

  const handleCreateEvent = useCallback(async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: eventForm.name,
          total_budget_minor: Math.round(parseFloat(eventForm.total_budget || "0") * 100),
          start_date: eventForm.start_date || null,
          end_date: eventForm.end_date || null,
          currency,
        }),
      });
      if (res.ok) {
        setCreateOpen(false);
        setEventForm(INITIAL_EVENT_FORM);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }, [eventForm, currency, router]);

  const handleEditEvent = useCallback(async () => {
    if (!selectedEvent) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/events/${selectedEvent.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: eventForm.name,
          total_budget_minor: Math.round(parseFloat(eventForm.total_budget || "0") * 100),
          start_date: eventForm.start_date || null,
          end_date: eventForm.end_date || null,
        }),
      });
      if (res.ok) {
        setEditOpen(false);
        setSelectedEvent(null);
        setEventForm(INITIAL_EVENT_FORM);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }, [eventForm, selectedEvent, router]);

  const handleDeleteEvent = useCallback(async () => {
    if (!selectedEvent) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/events/${selectedEvent.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDeleteOpen(false);
        setSelectedEvent(null);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }, [selectedEvent, router]);

  const openEditEvent = (event: EventBudgetRow) => {
    setSelectedEvent(event);
    setEventForm({
      name: event.name,
      total_budget: (event.total_budget_minor / 100).toFixed(2),
      start_date: event.start_date ?? "",
      end_date: event.end_date ?? "",
    });
    setEditOpen(true);
  };

  const openDeleteEvent = (event: EventBudgetRow) => {
    setSelectedEvent(event);
    setDeleteOpen(true);
  };

  /* ---- Item CRUD ---- */

  const handleCreateItem = useCallback(async () => {
    if (!activeEvent) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/events/${activeEvent.id}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_budget_id: activeEvent.id,
          category_name: itemForm.category_name,
          budget_minor: Math.round(parseFloat(itemForm.budget || "0") * 100),
          spent_minor: Math.round(parseFloat(itemForm.spent || "0") * 100),
          notes: itemForm.notes || null,
        }),
      });
      if (res.ok) {
        setItemCreateOpen(false);
        setItemForm(INITIAL_ITEM_FORM);
        fetchItems(activeEvent.id);
      }
    } finally {
      setSaving(false);
    }
  }, [itemForm, activeEvent, fetchItems]);

  const handleEditItem = useCallback(async () => {
    if (!activeEvent || !selectedItem) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/events/${activeEvent.id}/items/${selectedItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category_name: itemForm.category_name,
          budget_minor: Math.round(parseFloat(itemForm.budget || "0") * 100),
          spent_minor: Math.round(parseFloat(itemForm.spent || "0") * 100),
          notes: itemForm.notes || null,
        }),
      });
      if (res.ok) {
        setItemEditOpen(false);
        setSelectedItem(null);
        setItemForm(INITIAL_ITEM_FORM);
        fetchItems(activeEvent.id);
      }
    } finally {
      setSaving(false);
    }
  }, [itemForm, activeEvent, selectedItem, fetchItems]);

  const handleDeleteItem = useCallback(async () => {
    if (!activeEvent || !selectedItem) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/events/${activeEvent.id}/items/${selectedItem.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setItemDeleteOpen(false);
        setSelectedItem(null);
        fetchItems(activeEvent.id);
      }
    } finally {
      setSaving(false);
    }
  }, [activeEvent, selectedItem, fetchItems]);

  const openEditItem = (item: EventBudgetItemRow) => {
    setSelectedItem(item);
    setItemForm({
      category_name: item.category_name,
      budget: (item.budget_minor / 100).toFixed(2),
      spent: (item.spent_minor / 100).toFixed(2),
      notes: item.notes ?? "",
    });
    setItemEditOpen(true);
  };

  const openDeleteItem = (item: EventBudgetItemRow) => {
    setSelectedItem(item);
    setItemDeleteOpen(true);
  };

  /* ---- Event form fields ---- */

  const eventFormFields = (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="event_name">{t("fields.name")}</Label>
        <Input
          id="event_name"
          placeholder={t("fields.namePlaceholder")}
          value={eventForm.name}
          onChange={(e) => setEventForm((f) => ({ ...f, name: e.target.value }))}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="total_budget">{t("fields.totalBudget")}</Label>
        <Input
          id="total_budget"
          type="number"
          step="0.01"
          value={eventForm.total_budget}
          onChange={(e) => setEventForm((f) => ({ ...f, total_budget: e.target.value }))}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="start_date">{t("fields.startDate")}</Label>
          <Input
            id="start_date"
            type="date"
            value={eventForm.start_date}
            onChange={(e) => setEventForm((f) => ({ ...f, start_date: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end_date">{t("fields.endDate")}</Label>
          <Input
            id="end_date"
            type="date"
            value={eventForm.end_date}
            onChange={(e) => setEventForm((f) => ({ ...f, end_date: e.target.value }))}
          />
        </div>
      </div>
    </div>
  );

  /* ---- Item form fields ---- */

  const itemFormFields = (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="category_name">{t("items.category")}</Label>
        <Input
          id="category_name"
          placeholder={t("items.categoryPlaceholder")}
          value={itemForm.category_name}
          onChange={(e) => setItemForm((f) => ({ ...f, category_name: e.target.value }))}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="item_budget">{t("items.budgeted")}</Label>
          <Input
            id="item_budget"
            type="number"
            step="0.01"
            value={itemForm.budget}
            onChange={(e) => setItemForm((f) => ({ ...f, budget: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="item_spent">{t("items.spent")}</Label>
          <Input
            id="item_spent"
            type="number"
            step="0.01"
            value={itemForm.spent}
            onChange={(e) => setItemForm((f) => ({ ...f, spent: e.target.value }))}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="item_notes">{t("items.notes")}</Label>
        <Input
          id="item_notes"
          value={itemForm.notes}
          onChange={(e) => setItemForm((f) => ({ ...f, notes: e.target.value }))}
        />
      </div>
    </div>
  );

  /* ---- Detail view for a single event ---- */

  if (activeEvent) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setActiveEvent(null)}>
            <ArrowLeftIcon />
            {tc("back")}
          </Button>
          <h2 className="text-lg font-semibold">{activeEvent.name}</h2>
        </div>

        {/* Item stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-3 py-4">
              <DollarSignIcon className="size-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">{t("stats.totalBudget")}</p>
                <p className="text-2xl font-bold">
                  {formatAmount({ amountMinor: itemStats.totalBudget, currency })}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 py-4">
              <WalletIcon className="size-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">{t("stats.totalSpent")}</p>
                <p className="text-2xl font-bold">
                  {formatAmount({ amountMinor: itemStats.totalSpent, currency })}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 py-4">
              <DollarSignIcon className="size-5 text-emerald-500" />
              <div>
                <p className="text-sm text-muted-foreground">{t("stats.remaining")}</p>
                <p className="text-2xl font-bold">
                  {formatAmount({ amountMinor: itemStats.remaining, currency })}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 py-4">
              <PercentIcon className="size-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">{t("stats.percentUsed")}</p>
                <p className="text-2xl font-bold">{Math.round(itemStats.percentUsed)}%</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add item button */}
        <Dialog open={itemCreateOpen} onOpenChange={setItemCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setItemForm(INITIAL_ITEM_FORM)}>
              <PlusIcon />
              {t("items.addItem")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("items.addItem")}</DialogTitle>
            </DialogHeader>
            {itemFormFields}
            <DialogFooter>
              <Button variant="outline" onClick={() => setItemCreateOpen(false)}>
                {tc("cancel")}
              </Button>
              <Button
                onClick={handleCreateItem}
                disabled={saving || !itemForm.category_name.trim()}
              >
                {saving ? tc("saving") : tc("create")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Items list */}
        {loadingItems ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-sm text-muted-foreground">{tc("loading")}</p>
            </CardContent>
          </Card>
        ) : items.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-sm font-medium">{t("items.title")}</p>
              <Button className="mt-4" onClick={() => setItemCreateOpen(true)}>
                <PlusIcon />
                {t("items.addItem")}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {items.map((item) => {
              const percent =
                item.budget_minor > 0
                  ? Math.min(100, (item.spent_minor / item.budget_minor) * 100)
                  : 0;
              return (
                <Card key={item.id}>
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{item.category_name}</p>
                          {percent >= 100 && (
                            <Badge variant="destructive">{t("stats.percentUsed")}</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>
                            {t("items.budgeted")}:{" "}
                            {formatAmount({ amountMinor: item.budget_minor, currency })}
                          </span>
                          <span>
                            {t("items.spent")}:{" "}
                            {formatAmount({ amountMinor: item.spent_minor, currency })}
                          </span>
                          <span>
                            {t("items.remaining")}:{" "}
                            {formatAmount({
                              amountMinor: item.budget_minor - item.spent_minor,
                              currency,
                            })}
                          </span>
                        </div>
                        <Progress value={percent} className="h-2" />
                        {item.notes && (
                          <p className="text-xs text-muted-foreground">{item.notes}</p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="xs" onClick={() => openEditItem(item)}>
                          <PencilIcon />
                        </Button>
                        <Button variant="ghost" size="xs" onClick={() => openDeleteItem(item)}>
                          <TrashIcon />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Edit item dialog */}
        <Dialog open={itemEditOpen} onOpenChange={setItemEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{tc("edit")}</DialogTitle>
            </DialogHeader>
            {itemFormFields}
            <DialogFooter>
              <Button variant="outline" onClick={() => setItemEditOpen(false)}>
                {tc("cancel")}
              </Button>
              <Button onClick={handleEditItem} disabled={saving || !itemForm.category_name.trim()}>
                {saving ? tc("saving") : tc("save")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete item dialog */}
        <Dialog open={itemDeleteOpen} onOpenChange={setItemDeleteOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{tc("delete")}</DialogTitle>
              <DialogDescription>{t("confirmDelete")}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setItemDeleteOpen(false)}>
                {tc("cancel")}
              </Button>
              <Button variant="destructive" onClick={handleDeleteItem} disabled={saving}>
                {saving ? tc("loading") : tc("delete")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  /* ---- Events list view ---- */

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <CalendarIcon className="size-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">{t("title")}</p>
              <p className="text-2xl font-bold">{stats.totalEvents}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <DollarSignIcon className="size-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">{t("stats.totalBudget")}</p>
              <p className="text-2xl font-bold">
                {formatAmount({ amountMinor: stats.totalBudget, currency })}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add button */}
      <div className="flex items-center justify-between">
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEventForm(INITIAL_EVENT_FORM)}>
              <PlusIcon />
              {t("actions.create")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("actions.create")}</DialogTitle>
              <DialogDescription>{t("description")}</DialogDescription>
            </DialogHeader>
            {eventFormFields}
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)}>
                {tc("cancel")}
              </Button>
              <Button onClick={handleCreateEvent} disabled={saving || !eventForm.name.trim()}>
                {saving ? tc("saving") : tc("create")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Event cards */}
      {events.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm font-medium">{t("noEvents")}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t("noEventsDescription")}</p>
            <Button className="mt-4" onClick={() => setCreateOpen(true)}>
              <PlusIcon />
              {t("actions.create")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Card
              key={event.id}
              className="cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => openEvent(event)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{event.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-lg font-semibold">
                    {formatAmount({ amountMinor: event.total_budget_minor, currency })}
                  </p>

                  {(event.start_date || event.end_date) && (
                    <p className="text-xs text-muted-foreground">
                      {event.start_date} — {event.end_date}
                    </p>
                  )}

                  <div className="flex gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="xs" onClick={() => openEditEvent(event)}>
                      <PencilIcon />
                      {tc("edit")}
                    </Button>
                    <Button variant="ghost" size="xs" onClick={() => openDeleteEvent(event)}>
                      <TrashIcon />
                      {tc("delete")}
                    </Button>
                  </div>
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
            <DialogTitle>{t("actions.edit")}</DialogTitle>
          </DialogHeader>
          {eventFormFields}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              {tc("cancel")}
            </Button>
            <Button onClick={handleEditEvent} disabled={saving || !eventForm.name.trim()}>
              {saving ? tc("saving") : tc("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("actions.delete")}</DialogTitle>
            <DialogDescription>{t("confirmDelete")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              {tc("cancel")}
            </Button>
            <Button variant="destructive" onClick={handleDeleteEvent} disabled={saving}>
              {saving ? tc("loading") : tc("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
