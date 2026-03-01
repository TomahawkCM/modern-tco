"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SUPPORTED_LOCALES, LOCALE_METADATA } from "@/i18n/config";
import type { SupportedLocale } from "@/i18n/config";
import { CheckIcon, SettingsIcon, BellIcon } from "lucide-react";
import Link from "next/link";

interface SettingsFormProps {
  initialLocale: string;
  initialLanguage: string;
  initialCurrency: string;
}

const COMMON_CURRENCIES = [
  "USD",
  "EUR",
  "GBP",
  "CAD",
  "AUD",
  "JPY",
  "CHF",
  "CNY",
  "INR",
  "BRL",
  "MXN",
  "SGD",
  "HKD",
  "NZD",
  "SEK",
  "NOK",
  "DKK",
  "PLN",
  "CZK",
  "HUF",
  "RON",
  "TRY",
  "ZAR",
  "KRW",
  "THB",
  "IDR",
  "MYR",
  "PHP",
  "VND",
  "TWD",
];

export function SettingsForm({
  initialLocale,
  initialLanguage,
  initialCurrency,
}: SettingsFormProps) {
  const t = useTranslations("settings");
  const tc = useTranslations("common");
  const router = useRouter();

  const [locale, setLocale] = useState(initialLocale);
  const [currency, setCurrency] = useState(initialCurrency);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setSaved(false);
    try {
      // Derive language from locale (e.g., "en-US" -> "en")
      const language = locale.split("-")[0] ?? initialLanguage;
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locale,
          language,
          primary_currency: currency,
        }),
      });
      if (res.ok) {
        setSaved(true);
        router.refresh();
        // Auto-hide success message
        setTimeout(() => setSaved(false), 3000);
      }
    } finally {
      setSaving(false);
    }
  }, [locale, currency, initialLanguage, router]);

  return (
    <Tabs defaultValue="general">
      <TabsList>
        <TabsTrigger value="general">
          <SettingsIcon />
          {t("general.title")}
        </TabsTrigger>
        <TabsTrigger value="notifications">
          <BellIcon />
          {t("notifications.title")}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="general" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("general.title")}</CardTitle>
            <CardDescription>{t("general.description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Locale selector */}
            <div className="space-y-2">
              <Label>{t("locale.label")}</Label>
              <p className="text-xs text-muted-foreground">{t("locale.description")}</p>
              <Select value={locale} onValueChange={setLocale}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_LOCALES.map((loc) => (
                    <SelectItem key={loc} value={loc}>
                      {LOCALE_METADATA[loc as SupportedLocale]?.label ?? loc} ({loc})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Currency selector */}
            <div className="space-y-2">
              <Label>{t("currency.label")}</Label>
              <p className="text-xs text-muted-foreground">{t("currency.description")}</p>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COMMON_CURRENCIES.map((cur) => (
                    <SelectItem key={cur} value={cur}>
                      {cur}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Save */}
            <div className="flex items-center gap-3">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? tc("saving") : tc("save")}
              </Button>
              {saved && (
                <span className="flex items-center gap-1 text-sm text-green-600">
                  <CheckIcon className="size-4" />
                  {t("saved")}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Link to merchant rules */}
        <Card>
          <CardHeader>
            <CardTitle>{t("merchantRules.title")}</CardTitle>
            <CardDescription>{t("merchantRules.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/settings/merchant-rules">{t("merchantRules.title")}</Link>
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="notifications">
        <Card>
          <CardHeader>
            <CardTitle>{t("notifications.title")}</CardTitle>
            <CardDescription>{t("notifications.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{t("notifications.description")}</p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
