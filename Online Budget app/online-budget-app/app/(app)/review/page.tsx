import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { formatMoney } from "@/engine";
import { ReviewDashboard } from "@/components/review/review-dashboard";

export default async function ReviewPage() {
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

  // Fetch uncategorized transactions (category_id IS NULL)
  const { data: uncategorized } = await supabase
    .from("transactions")
    .select("id, merchant_name, amount_minor, currency, transaction_date, description")
    .eq("user_id", user.id)
    .is("category_id", null)
    .order("transaction_date", { ascending: false });

  // Fetch categories for the dropdown
  const { data: categories } = await supabase
    .from("categories")
    .select("id, key, type")
    .order("display_order", { ascending: true });

  const fmt = (amt: { amountMinor: number; currency: string }) => formatMoney(amt, locale);

  const t = await getTranslations("review");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </div>
      <ReviewDashboard
        transactions={uncategorized ?? []}
        categories={categories ?? []}
        currency={currency}
        formatAmount={fmt}
      />
    </div>
  );
}
