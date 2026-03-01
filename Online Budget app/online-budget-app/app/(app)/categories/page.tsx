import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { listCategories, listUserCategoryOverrides } from "@/server/categories";
import { getUserSettings } from "@/server/settings";
import { CategoryListView } from "@/components/categories/category-list";

export default async function CategoriesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const settings = await getUserSettings(supabase, user.id);
  const locale = settings.locale ?? "en-US";

  const [categories, overrides] = await Promise.all([
    listCategories(supabase, locale),
    listUserCategoryOverrides(supabase, user.id),
  ]);

  const t = await getTranslations("categories");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </div>
      <CategoryListView categories={categories} overrides={overrides} />
    </div>
  );
}
