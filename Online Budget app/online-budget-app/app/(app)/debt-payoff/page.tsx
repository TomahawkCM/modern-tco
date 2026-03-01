import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { getDebtPayoffData } from "@/server/debt-payoff";
import { formatMoney } from "@/engine";
import { DebtPayoffDashboard } from "@/components/debt-payoff/debt-payoff-dashboard";

export default async function DebtPayoffPage() {
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

  const { loans, scenarios: rawScenarios } = await getDebtPayoffData(supabase, user.id);

  // Cast JSONB config from Json to expected Record<string, unknown>
  const scenarios = rawScenarios.map((s) => ({
    ...s,
    config: (typeof s.config === "object" && s.config !== null && !Array.isArray(s.config)
      ? s.config
      : {}) as Record<string, unknown>,
  }));

  const fmt = (amt: { amountMinor: number; currency: string }) => formatMoney(amt, locale);

  const t = await getTranslations("debtPayoff");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </div>
      <DebtPayoffDashboard
        loans={loans}
        scenarios={scenarios}
        currency={currency}
        formatAmount={fmt}
      />
    </div>
  );
}
