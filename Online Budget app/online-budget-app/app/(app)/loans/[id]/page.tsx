import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { getLoan, listLoanPayments } from "@/server/loans";
import { generateAmortizationSchedule } from "@/engine/loans/calculations";
import { formatMoney } from "@/engine";
import { LoanDetail } from "@/components/loans/loan-detail";

type RouteProps = { params: Promise<{ id: string }> };

export default async function LoanDetailPage({ params }: RouteProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const loan = await getLoan(supabase, user.id, id);
  if (!loan) return notFound();

  const payments = await listLoanPayments(supabase, user.id, id);

  const { data: settings } = await supabase
    .from("user_settings")
    .select("primary_currency, locale")
    .eq("user_id", user.id)
    .single();

  const locale = settings?.locale ?? "en-US";

  // Estimate term months from start/end dates, default 360 (30 years)
  const termMonths =
    loan.start_date && loan.end_date
      ? Math.round(
          (new Date(loan.end_date).getTime() - new Date(loan.start_date).getTime()) /
            (1000 * 60 * 60 * 24 * 30.44)
        )
      : 360;

  const schedule = generateAmortizationSchedule({
    principal: loan.original_balance_minor / 100,
    annualRate: Number(loan.interest_rate),
    termMonths: Math.max(termMonths, 1),
  });

  const fmt = (amt: { amountMinor: number; currency: string }) => formatMoney(amt, locale);

  const t = await getTranslations("loans");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">{t("detail")}</h1>
      <LoanDetail loan={loan} payments={payments} schedule={schedule.schedule} formatAmount={fmt} />
    </div>
  );
}
