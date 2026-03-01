import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { MorePage } from "@/components/more/more-page";

export default async function MorePageRoute() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const t = await getTranslations("morePage");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
      <MorePage />
    </div>
  );
}
