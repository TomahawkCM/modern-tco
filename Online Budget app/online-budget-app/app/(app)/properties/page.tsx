import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { listProperties } from "@/server/properties";
import { formatMoney } from "@/engine";
import { PropertyList } from "@/components/properties/property-list";

export default async function PropertiesPage() {
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

  const properties = await listProperties(supabase, user.id);

  // Compute totals
  const totalValue = properties.reduce((sum, p) => sum + (p.current_value_minor ?? 0), 0);
  const totalEquity = properties.reduce(
    (sum, p) => sum + ((p.current_value_minor ?? 0) - (p.mortgage_balance_minor ?? 0)),
    0
  );
  const totalMortgage = properties.reduce((sum, p) => sum + (p.mortgage_balance_minor ?? 0), 0);
  const totalMonthlyExpenses = properties.reduce(
    (sum, p) => sum + (p.monthly_expenses_minor ?? 0),
    0
  );

  const fmt = (amt: { amountMinor: number; currency: string }) => formatMoney(amt, locale);

  const t = await getTranslations("properties");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </div>
      <PropertyList
        properties={properties}
        totalValue={totalValue}
        totalEquity={totalEquity}
        totalMortgage={totalMortgage}
        totalMonthlyExpenses={totalMonthlyExpenses}
        currency={currency}
        formatAmount={fmt}
      />
    </div>
  );
}
