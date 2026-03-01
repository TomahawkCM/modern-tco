import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { NewLoanPage } from "@/components/loans/new-loan-page";

export default async function NewLoanRoute() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: settings } = await supabase
    .from("user_settings")
    .select("primary_currency")
    .eq("user_id", user.id)
    .single();

  const currency = settings?.primary_currency ?? "USD";
  const t = await getTranslations("loans");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">{t("newLoan")}</h1>
      <NewLoanPage currency={currency} />
    </div>
  );
}
