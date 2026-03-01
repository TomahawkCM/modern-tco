import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { getMonthlyTotals, getCategorySpendingOverTime } from "@/server/reports";
import { formatMoney } from "@/engine";
import { ReportsDashboard } from "@/components/reports/reports-dashboard";

export default async function ReportsPage() {
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

  // Default: last 12 months
  const now = new Date();
  const startDate = new Date(now);
  startDate.setFullYear(startDate.getFullYear() - 1);
  const startStr = startDate.toISOString().split("T")[0] ?? "2000-01-01";
  const endStr = now.toISOString().split("T")[0] ?? "2099-12-31";

  const [monthlyTotals, categorySpending] = await Promise.all([
    getMonthlyTotals(supabase, user.id, startStr, endStr),
    getCategorySpendingOverTime(supabase, user.id, startStr, endStr),
  ]);

  const fmt = (amt: { amountMinor: number; currency: string }) => formatMoney(amt, locale);

  const t = await getTranslations("reports");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </div>
      <ReportsDashboard
        initialMonthlyTotals={monthlyTotals}
        initialCategorySpending={categorySpending}
        currency={currency}
        locale={locale}
        formatAmount={fmt}
      />
    </div>
  );
}
