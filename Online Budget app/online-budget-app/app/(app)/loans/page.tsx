import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { listLoans } from "@/server/loans";
import { formatMoney } from "@/engine";
import { LoanList } from "@/components/loans/loan-list";

export default async function LoansPage() {
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

  const loans = await listLoans(supabase, user.id);

  // Compute summary stats server-side
  const activeLoans = loans.filter((l) => l.status === "active");
  const totalDebt = activeLoans.reduce((sum, l) => sum + l.current_balance_minor, 0);
  const monthlyPayments = activeLoans.reduce((sum, l) => sum + l.minimum_payment_minor, 0);

  // Weighted average interest rate (weighted by current_balance_minor)
  const avgRate =
    totalDebt > 0
      ? activeLoans.reduce((sum, l) => sum + Number(l.interest_rate) * l.current_balance_minor, 0) /
        totalDebt
      : 0;

  const activeCount = activeLoans.length;

  const fmt = (amt: { amountMinor: number; currency: string }) => formatMoney(amt, locale);

  const t = await getTranslations("loans");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </div>
      <LoanList
        loans={loans}
        totalDebt={totalDebt}
        monthlyPayments={monthlyPayments}
        avgRate={avgRate}
        activeCount={activeCount}
        currency={currency}
        formatAmount={fmt}
      />
    </div>
  );
}
