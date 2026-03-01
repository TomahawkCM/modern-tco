import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { getLoan } from "@/server/loans";
import { EditLoanPage } from "@/components/loans/edit-loan-page";

type RouteProps = { params: Promise<{ id: string }> };

export default async function EditLoanRoute({ params }: RouteProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const loan = await getLoan(supabase, user.id, id);
  if (!loan) return notFound();

  const t = await getTranslations("loans");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">{t("editLoan")}</h1>
      <EditLoanPage loan={loan} />
    </div>
  );
}
