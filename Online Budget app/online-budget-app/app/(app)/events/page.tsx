import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { listEventBudgets } from "@/server/events";
import { formatMoney } from "@/engine";
import { EventsDashboard } from "@/components/events/events-dashboard";

export default async function EventsPage() {
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

  const events = await listEventBudgets(supabase, user.id);

  const fmt = (amt: { amountMinor: number; currency: string }) => formatMoney(amt, locale);

  const t = await getTranslations("events");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </div>
      <EventsDashboard events={events} currency={currency} formatAmount={fmt} />
    </div>
  );
}
