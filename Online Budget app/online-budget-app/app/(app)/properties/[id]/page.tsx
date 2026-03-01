import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { getProperty } from "@/server/properties";
import { formatMoney } from "@/engine";
import { PropertyDetail } from "@/components/properties/property-detail";
import { notFound } from "next/navigation";

type RouteProps = { params: Promise<{ id: string }> };

export default async function PropertyDetailPage({ params }: RouteProps) {
  const { id } = await params;

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

  const property = await getProperty(supabase, user.id, id);
  if (!property) notFound();

  const equity = (property.current_value_minor ?? 0) - (property.mortgage_balance_minor ?? 0);

  const fmt = (amt: { amountMinor: number; currency: string }) => formatMoney(amt, locale);

  const t = await getTranslations("properties");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("detail")}</h1>
        <p className="text-sm text-muted-foreground">{property.address}</p>
      </div>
      <PropertyDetail property={property} equity={equity} currency={currency} formatAmount={fmt} />
    </div>
  );
}
