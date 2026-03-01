import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { listFuturePurchases } from "@/server/planning";
import { formatMoney } from "@/engine";
import { FuturePlansList } from "@/components/planning/future-plans-list";

export default async function FuturePlansPage() {
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

  const purchases = await listFuturePurchases(supabase, user.id);

  const fmt = (amt: { amountMinor: number; currency: string }) => formatMoney(amt, locale);

  const t = await getTranslations("planning.future");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </div>
      <FuturePlansList purchases={purchases} currency={currency} formatAmount={fmt} />
    </div>
  );
}
