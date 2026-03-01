import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { listScenarios } from "@/server/scenarios";
import { formatMoney } from "@/engine";
import { ScenariosDashboard } from "@/components/scenarios/scenarios-dashboard";

export default async function ScenariosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: settings } = await supabase
    .from("user_settings")
    .select("primary_currency, locale")
    .eq("user_id", user.id)
    .single();

  const currency = settings?.primary_currency ?? "USD";
  const locale = settings?.locale ?? "en-US";

  const scenarios = await listScenarios(supabase, user.id);

  const fmt = (amt: { amountMinor: number; currency: string }) => formatMoney(amt, locale);

  const t = await getTranslations("scenarios");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </div>
      <ScenariosDashboard scenarios={scenarios} currency={currency} formatAmount={fmt} />
    </div>
  );
}
