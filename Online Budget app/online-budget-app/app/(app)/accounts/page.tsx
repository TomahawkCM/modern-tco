import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { listAccounts } from "@/server/accounts";
import { listConnectedBanks } from "@/server/connected-banks";
import { formatMoney, minorAmount, sumMinor } from "@/engine";
import { AccountList } from "@/components/accounts/account-list";

export default async function AccountsPage() {
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

  const [accounts, connectedBanksRaw] = await Promise.all([
    listAccounts(supabase, user.id),
    listConnectedBanks(supabase, user.id),
  ]);

  // Strip sensitive fields before sending to the client
  const connectedBanks = connectedBanksRaw.map((bank) => ({
    id: bank.id,
    provider: bank.provider,
    institution_id: bank.institution_id,
    status: bank.status,
    last_synced_at: bank.last_synced_at,
  }));

  // Compute total balance via engine
  const primaryAccounts = accounts.filter((a) => a.currency === currency);
  const accountAmounts = primaryAccounts.map((a) => minorAmount(a.balance_minor, a.currency));
  const totalBalance =
    accountAmounts.length > 0 ? sumMinor(accountAmounts, currency) : minorAmount(0, currency);

  const fmt = (amt: { amountMinor: number; currency: string }) => formatMoney(amt, locale);

  const t = await getTranslations("accounts");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("description")}</p>
        </div>
      </div>
      <AccountList
        accounts={accounts}
        totalBalance={totalBalance}
        currency={currency}
        formatAmount={fmt}
        connectedBanks={connectedBanks}
      />
    </div>
  );
}
