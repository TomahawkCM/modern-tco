import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { listInvestmentAccounts, listHoldings } from "@/server/investments";
import { formatMoney } from "@/engine";
import { InvestmentList } from "@/components/investments/investment-list";
import type { Database } from "@/supabase/database.types";

type HoldingRow = Database["public"]["Tables"]["holdings"]["Row"];

export default async function InvestmentsPage() {
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
  const fmt = (amt: { amountMinor: number; currency: string }) => formatMoney(amt, locale);

  const accounts = await listInvestmentAccounts(supabase, user.id);

  // Fetch holdings for all accounts
  const holdingsByAccount: Record<string, HoldingRow[]> = {};
  for (const account of accounts) {
    holdingsByAccount[account.id] = await listHoldings(supabase, user.id, account.id);
  }

  const t = await getTranslations("investments");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </div>
      <InvestmentList
        accounts={accounts}
        holdingsByAccount={holdingsByAccount}
        currency={currency}
        formatAmount={fmt}
      />
    </div>
  );
}
