import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { formatMoney } from "@/engine";
import { FridayReviewWizard } from "@/components/review/friday-review-wizard";

export default async function FridayReviewPage() {
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

  // Compute this week (Monday to Sunday)
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon...
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const thisMonday = new Date(now);
  thisMonday.setDate(now.getDate() + mondayOffset);
  thisMonday.setHours(0, 0, 0, 0);

  const lastMonday = new Date(thisMonday);
  lastMonday.setDate(thisMonday.getDate() - 7);

  const thisMondayStr = thisMonday.toISOString().slice(0, 10);
  const lastMondayStr = lastMonday.toISOString().slice(0, 10);
  const todayStr = now.toISOString().slice(0, 10);

  // This week's transactions
  const { data: thisWeekTxns } = await supabase
    .from("transactions")
    .select("id, merchant_name, amount_minor, currency, transaction_date, description, category_id")
    .eq("user_id", user.id)
    .gte("transaction_date", thisMondayStr)
    .lte("transaction_date", todayStr)
    .order("transaction_date", { ascending: false });

  // Last week's transactions (for comparison)
  const { data: lastWeekTxns } = await supabase
    .from("transactions")
    .select("id, amount_minor, currency, transaction_date, category_id")
    .eq("user_id", user.id)
    .gte("transaction_date", lastMondayStr)
    .lt("transaction_date", thisMondayStr);

  // Budget progress (current month budgets)
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const { data: budgets } = await supabase
    .from("budgets")
    .select("id, category_id, amount_minor, currency")
    .eq("user_id", user.id);

  // Categories for lookup
  const { data: categories } = await supabase
    .from("categories")
    .select("id, key, type")
    .order("display_order", { ascending: true });

  // Upcoming subscriptions (next 7 days)
  const nextWeek = new Date(now);
  nextWeek.setDate(now.getDate() + 7);
  const nextWeekStr = nextWeek.toISOString().slice(0, 10);

  const { data: upcomingSubs } = await supabase
    .from("user_subscriptions")
    .select("id, merchant_name, amount_minor, currency, next_billing_date")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .gte("next_billing_date", todayStr)
    .lte("next_billing_date", nextWeekStr);

  const fmt = (amt: { amountMinor: number; currency: string }) => formatMoney(amt, locale);

  const t = await getTranslations("weeklyRecap");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </div>
      <FridayReviewWizard
        thisWeekTransactions={thisWeekTxns ?? []}
        lastWeekTransactions={lastWeekTxns ?? []}
        budgets={budgets ?? []}
        categories={categories ?? []}
        upcomingSubscriptions={upcomingSubs ?? []}
        currency={currency}
        formatAmount={fmt}
      />
    </div>
  );
}
