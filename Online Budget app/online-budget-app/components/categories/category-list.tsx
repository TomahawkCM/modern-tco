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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PencilIcon, TagIcon } from "lucide-react";
import type { CategoryWithTranslation } from "@/server/categories";

interface OverrideRow {
  id: string;
  user_id: string;
  category_id: string | null;
  custom_name: string;
  created_at: string;
}

interface CategoryListViewProps {
  categories: CategoryWithTranslation[];
  overrides: OverrideRow[];
}

type CategoryType = "income" | "expense" | "transfer";

export function CategoryListView({ categories, overrides }: CategoryListViewProps) {
  const t = useTranslations("categories");
  const tc = useTranslations("common");
  const router = useRouter();

  const [editOpen, setEditOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryWithTranslation | null>(null);
  const [customName, setCustomName] = useState("");
  const [saving, setSaving] = useState(false);

  // Build override lookup
  const overrideMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const o of overrides) {
      if (o.category_id) {
        map.set(o.category_id, o.custom_name);
      }
    }
    return map;
  }, [overrides]);

  // Group categories by type
  const grouped = useMemo(() => {
    const groups: Record<CategoryType, CategoryWithTranslation[]> = {
      income: [],
      expense: [],
      transfer: [],
    };
    for (const cat of categories) {
      const type = cat.type as CategoryType;
      if (groups[type]) {
        groups[type].push(cat);
      }
    }
    return groups;
  }, [categories]);

  const openEdit = (category: CategoryWithTranslation) => {
    setSelectedCategory(category);
    setCustomName(overrideMap.get(category.id) ?? "");
    setEditOpen(true);
  };

  const handleSaveOverride = useCallback(async () => {
    if (!selectedCategory) return;
    setSaving(true);
    try {
      const res = await fetch("/api/categories/overrides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category_id: selectedCategory.id,
          custom_name: customName,
        }),
      });
      if (res.ok) {
        setEditOpen(false);
        setSelectedCategory(null);
        setCustomName("");
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }, [selectedCategory, customName, router]);

  const renderCategoryGroup = (type: CategoryType) => {
    const items = grouped[type];
    if (items.length === 0) return null;

    return (
      <Card key={type}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge
              variant={
                type === "income" ? "default" : type === "expense" ? "destructive" : "secondary"
              }
            >
              {t(`types.${type}`)}
            </Badge>
            <span className="text-sm font-normal text-muted-foreground">({items.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {items.map((cat) => {
              const override = overrideMap.get(cat.id);
              const displayName = override ?? cat.display_name ?? cat.key;
              return (
                <div
                  key={cat.id}
                  className="flex items-center justify-between rounded-md border border-border px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <TagIcon className="size-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{displayName}</span>
                    {override && (
                      <span className="text-xs text-muted-foreground">
                        ({cat.display_name ?? cat.key})
                      </span>
                    )}
                  </div>
                  <Button variant="ghost" size="icon-xs" onClick={() => openEdit(cat)}>
                    <PencilIcon />
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* System categories grouped by type */}
      <section className="space-y-4">
        <h2 className="text-lg font-medium">{t("systemCategories")}</h2>
        {(["income", "expense", "transfer"] as CategoryType[]).map(renderCategoryGroup)}
      </section>

      {/* User overrides section */}
      <section className="space-y-4">
        <h2 className="text-lg font-medium">{t("userOverrides")}</h2>
        {overrides.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-sm font-medium">{t("noOverrides")}</p>
              <p className="mt-1 text-sm text-muted-foreground">{t("noOverridesDescription")}</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent>
              <div className="space-y-2">
                {overrides.map((o) => {
                  const cat = categories.find((c) => c.id === o.category_id);
                  return (
                    <div
                      key={o.id}
                      className="flex items-center justify-between rounded-md border border-border px-3 py-2"
                    >
                      <div>
                        <p className="text-sm font-medium">{o.custom_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {t("fields.originalName")}:{" "}
                          {cat?.display_name ?? cat?.key ?? o.category_id}
                        </p>
                      </div>
                      {cat && (
                        <Button variant="ghost" size="icon-xs" onClick={() => openEdit(cat)}>
                          <PencilIcon />
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Edit override dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {overrideMap.has(selectedCategory?.id ?? "") ? t("editOverride") : t("addOverride")}
            </DialogTitle>
            <DialogDescription>
              {selectedCategory?.display_name ?? selectedCategory?.key}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customName">{t("fields.customName")}</Label>
              <Input
                id="customName"
                placeholder={t("fields.customNamePlaceholder")}
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              {tc("cancel")}
            </Button>
            <Button onClick={handleSaveOverride} disabled={saving || !customName.trim()}>
              {saving ? tc("saving") : tc("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
