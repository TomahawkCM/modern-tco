import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { getUserSettings } from "@/server/settings";
import { SettingsForm } from "@/components/settings/settings-form";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const settings = await getUserSettings(supabase, user.id);
  const t = await getTranslations("settings");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </div>
      <SettingsForm
        initialLocale={settings.locale}
        initialLanguage={settings.language}
        initialCurrency={settings.primary_currency}
      />
    </div>
  );
}
