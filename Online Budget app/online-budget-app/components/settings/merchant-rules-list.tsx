"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlusIcon, TrashIcon } from "lucide-react";
import type { CategoryWithTranslation } from "@/server/categories";

interface MerchantMapping {
  id: string;
  merchant_token: string;
  display_name: string;
  category_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface MerchantRulesListProps {
  mappings: MerchantMapping[];
  totalCount: number;
  categories: CategoryWithTranslation[];
}

export function MerchantRulesList({ mappings, categories }: MerchantRulesListProps) {
  const t = useTranslations("settings.merchantRules");
  const tc = useTranslations("common");
  const router = useRouter();

  const [createOpen, setCreateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [merchantName, setMerchantName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [saving, setSaving] = useState(false);

  // Build category lookup
  const categoryMap = new Map<string, string>();
  for (const cat of categories) {
    categoryMap.set(cat.id, cat.display_name ?? cat.key);
  }

  const handleCreate = useCallback(async () => {
    if (!merchantName.trim() || !categoryId) return;
    setSaving(true);
    try {
      const res = await fetch("/api/merchant-mappings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchant_token: merchantName.trim().toUpperCase(),
          display_name: merchantName.trim(),
          category_id: categoryId,
        }),
      });
      if (res.ok) {
        setCreateOpen(false);
        setMerchantName("");
        setCategoryId("");
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }, [merchantName, categoryId, router]);

  const handleDelete = useCallback(async () => {
    if (!selectedId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/merchant-mappings/${selectedId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDeleteOpen(false);
        setSelectedId(null);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }, [selectedId, router]);

  const openDelete = (id: string) => {
    setSelectedId(id);
    setDeleteOpen(true);
  };

  // Expense categories for the selector
  const expenseCategories = categories.filter((c) => c.type === "expense");

  return (
    <div className="space-y-4">
      {/* Add rule button */}
      <div className="flex justify-end">
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon />
              {t("addRule")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("addRule")}</DialogTitle>
              <DialogDescription>{t("description")}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="merchant">{t("fields.merchant")}</Label>
                <Input
                  id="merchant"
                  placeholder={t("fields.merchantPlaceholder")}
                  value={merchantName}
                  onChange={(e) => setMerchantName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">{t("fields.category")}</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("fields.selectCategory")} />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.display_name ?? cat.key}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)}>
                {tc("cancel")}
              </Button>
              <Button
                onClick={handleCreate}
                disabled={saving || !merchantName.trim() || !categoryId}
              >
                {saving ? tc("saving") : tc("create")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Rules table or empty state */}
      {mappings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm font-medium">{t("noRules")}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t("noRulesDescription")}</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("fields.merchant")}</TableHead>
                  <TableHead>{t("fields.category")}</TableHead>
                  <TableHead className="w-16" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {mappings.map((mapping) => (
                  <TableRow key={mapping.id}>
                    <TableCell className="font-medium">{mapping.display_name}</TableCell>
                    <TableCell>
                      {categoryMap.get(mapping.category_id) ?? mapping.category_id}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon-xs" onClick={() => openDelete(mapping.id)}>
                        <TrashIcon />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("deleteRule")}</DialogTitle>
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
    </div>
  );
}
