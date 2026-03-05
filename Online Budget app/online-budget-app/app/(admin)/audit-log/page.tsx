import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getAuditLog } from "@/server/admin";
import { AuditLogTable } from "./audit-log-table";
import { getTranslations } from "next-intl/server";

interface Props {
  searchParams: Promise<{
    page?: string;
    action?: string;
    from?: string;
    to?: string;
  }>;
}

export default async function AuditLogPage({ searchParams }: Props) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const t = await getTranslations("admin.auditLog");
  const page = parseInt(params.page ?? "1", 10);

  const { entries, total } = await getAuditLog(user.id, {
    page,
    pageSize: 50,
    action: params.action,
    dateFrom: params.from,
    dateTo: params.to,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
      <AuditLogTable
        entries={entries}
        total={total}
        currentPage={page}
        pageSize={50}
        currentAction={params.action ?? ""}
        currentFrom={params.from ?? ""}
        currentTo={params.to ?? ""}
      />
    </div>
  );
}
