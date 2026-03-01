import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { listSplitPersons, listExpenseSplits, getBalanceSummary } from "@/server/splits";
import { formatMoney } from "@/engine";
import { SplitsDashboard } from "@/components/splits/splits-dashboard";

export default async function SplitsPage() {
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

  const [persons, splits, balances] = await Promise.all([
    listSplitPersons(supabase, user.id),
    listExpenseSplits(supabase, user.id),
    getBalanceSummary(supabase, user.id),
  ]);

  const fmt = (amt: { amountMinor: number; currency: string }) => formatMoney(amt, locale);

  const t = await getTranslations("splits");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </div>
      <SplitsDashboard
        persons={persons}
        splits={splits}
        balances={balances}
        currency={currency}
        formatAmount={fmt}
      />
    </div>
  );
}
