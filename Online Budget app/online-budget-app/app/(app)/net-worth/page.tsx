import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { formatMoney } from "@/engine";
import { listAccounts } from "@/server/accounts";
import { listInvestmentAccounts, listHoldings } from "@/server/investments";
import { listProperties } from "@/server/properties";
import { listLoans } from "@/server/loans";
import { getLatestNetWorth, listNetWorthSnapshots } from "@/server/net-worth";
import { NetWorthDashboard } from "@/components/net-worth/net-worth-dashboard";
import { getRates } from "@/lib/currency";

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

  // Collect unique currencies across all financial items
  const allCurrencies = new Set<string>();
  accounts.forEach((a) => allCurrencies.add(a.currency));
  investmentAccounts.forEach((a) => allCurrencies.add(a.currency));
  allHoldings.flat().forEach((h) => allCurrencies.add(h.currency));
  properties.forEach((p) => allCurrencies.add(p.currency));
  loans.forEach((l) => allCurrencies.add(l.currency));

  // Fetch FX rates if multiple currencies exist
  const foreignCurrencies = [...allCurrencies].filter((c) => c !== currency);
  let rates: Record<string, number> = {};
  let fxWarning = false;

  if (foreignCurrencies.length > 0) {
    try {
      const fxResult = await getRates(currency, foreignCurrencies, supabase);
      rates = fxResult.rates;
    } catch {
      fxWarning = true;
    }
  }

  const hasConversions = foreignCurrencies.length > 0 && !fxWarning;

  // Convert a minor amount from its currency to the user's primary currency
  function toBase(amountMinor: number, itemCurrency: string): number {
    if (itemCurrency === currency) return amountMinor;
    const rate = rates[itemCurrency];
    if (!rate) return amountMinor; // fallback: no conversion
    // rates are from base→target, so to convert target→base we divide
    // e.g. if base=USD, target=EUR, rate=0.92 means 1 USD = 0.92 EUR
    // So EUR→USD: amountMinor / 0.92
    return Math.round(amountMinor / rate);
  }

  // Calculate live values with FX conversion
  const accountsTotal = accounts.reduce((sum, a) => sum + toBase(a.balance_minor, a.currency), 0);

  const investmentsTotal = allHoldings.flat().reduce((sum, h) => {
    const valueMinor = Math.round(Number(h.shares) * h.purchase_price_minor);
    return sum + toBase(valueMinor, h.currency);
  }, 0);

  const propertiesTotal = properties.reduce(
    (sum, p) => sum + toBase(p.current_value_minor ?? 0, p.currency),
    0
  );

  const loansTotal = loans
    .filter((l) => l.status === "active")
    .reduce((sum, l) => sum + toBase(l.current_balance_minor, l.currency), 0);

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
        hasConversions={hasConversions}
        fxWarning={fxWarning}
      />
    </div>
  );
}
