import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { listUsers } from "@/server/admin";
import { AdminUsersTable } from "./users-table";
import { getTranslations } from "next-intl/server";

interface Props {
  searchParams: Promise<{
    search?: string;
    page?: string;
    sort?: string;
    order?: string;
  }>;
}

export default async function AdminUsersPage({ searchParams }: Props) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const t = await getTranslations("admin.users");
  const page = parseInt(params.page ?? "1", 10);
  const sortBy = params.sort ?? "created_at";
  const sortOrder = (params.order ?? "desc") as "asc" | "desc";

  const { users, total } = await listUsers(user.id, {
    search: params.search,
    page,
    pageSize: 20,
    sortBy,
    sortOrder,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
      <AdminUsersTable
        users={users}
        total={total}
        currentPage={page}
        pageSize={20}
        currentSearch={params.search ?? ""}
        adminUserId={user.id}
      />
    </div>
  );
}
