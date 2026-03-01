import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { listMerchantMappings } from "@/server/merchant-mappings";
import { listCategories } from "@/server/categories";
import { getUserSettings } from "@/server/settings";
import { MerchantRulesList } from "@/components/settings/merchant-rules-list";

export default async function MerchantRulesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const settings = await getUserSettings(supabase, user.id);
  const locale = settings.locale ?? "en-US";

  const [{ mappings, count }, categories] = await Promise.all([
    listMerchantMappings(supabase, user.id, { limit: 100, offset: 0 }),
    listCategories(supabase, locale),
  ]);

  const t = await getTranslations("settings");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("merchantRules.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("merchantRules.description")}</p>
      </div>
      <MerchantRulesList mappings={mappings} totalCount={count} categories={categories} />
    </div>
  );
}
