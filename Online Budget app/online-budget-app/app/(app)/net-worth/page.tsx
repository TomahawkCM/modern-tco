import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { formatMoney } from "@/engine";
import { listAccounts } from "@/server/accounts";
import { listInvestmentAccounts, listHoldings } from "@/server/investments";
import { listProperties } from "@/server/properties";
import { listLoans } from "@/server/loans";
import { getLatestNetWorth, listNetWorthSnapshots } from "@/server/net-worth";
import { NetWorthDashboard } from "@/components/net-worth/net-worth-dashboard";

export default async function NetWorthPage() {
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

  // Fetch all financial data in parallel
  const [accounts, investmentAccounts, properties, loans, latestSnapshot, snapshots] =
    await Promise.all([
      listAccounts(supabase, user.id),
      listInvestmentAccounts(supabase, user.id),
      listProperties(supabase, user.id),
      listLoans(supabase, user.id),
      getLatestNetWorth(supabase, user.id),
      listNetWorthSnapshots(supabase, user.id),
    ]);

  // Fetch holdings for all investment accounts
  const allHoldings = await Promise.all(
    investmentAccounts.map((acc) => listHoldings(supabase, user.id, acc.id))
  );

  // Calculate live values
  const accountsTotal = accounts.reduce((sum, a) => sum + a.balance_minor, 0);

  const investmentsTotal = allHoldings.flat().reduce((sum, h) => {
    return sum + Math.round(Number(h.shares) * h.purchase_price_minor);
  }, 0);

  const propertiesTotal = properties.reduce((sum, p) => sum + (p.current_value_minor ?? 0), 0);

  const loansTotal = loans
    .filter((l) => l.status === "active")
    .reduce((sum, l) => sum + l.current_balance_minor, 0);

  const totalAssets = accountsTotal + investmentsTotal + propertiesTotal;
  const totalLiabilities = loansTotal;
  const netWorth = totalAssets - totalLiabilities;

  const t = await getTranslations("netWorth");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </div>
      <NetWorthDashboard
        netWorth={netWorth}
        totalAssets={totalAssets}
        totalLiabilities={totalLiabilities}
        accountsTotal={accountsTotal}
        investmentsTotal={investmentsTotal}
        propertiesTotal={propertiesTotal}
        loansTotal={loansTotal}
        latestSnapshot={latestSnapshot}
        snapshots={snapshots}
        currency={currency}
        formatAmount={fmt}
      />
    </div>
  );
}
