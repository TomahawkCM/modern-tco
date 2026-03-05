import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboardIcon, UsersIcon, ScrollTextIcon, ArrowLeftIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { I18nProvider } from "@/components/i18n-provider";
import { getUserSettings } from "@/server/settings";
import { getValidLocale } from "@/i18n/config";
import enMessages from "@/i18n/messages/en.json";

async function loadMessages(locale: string) {
  if (locale.startsWith("en")) {
    return enMessages;
  }
  try {
    return (await import(`@/i18n/messages/${locale}.json`)).default;
  } catch {
    return enMessages;
  }
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // RBAC check: only owner/admin can access admin pages
  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();

  if (!profile || (profile.role !== "admin" && profile.role !== "owner")) {
    redirect("/dashboard");
  }

  // i18n: load user locale and messages
  const settings = await getUserSettings(supabase, user.id);
  const locale = getValidLocale(settings.locale);
  const messages = await loadMessages(locale);

  const t = await getTranslations("admin");

  const NAV_ITEMS = [
    { href: "/admin/dashboard", label: t("nav.dashboard"), icon: LayoutDashboardIcon },
    { href: "/admin/users", label: t("nav.users"), icon: UsersIcon },
    { href: "/admin/audit-log", label: t("nav.auditLog"), icon: ScrollTextIcon },
  ];

  return (
    <I18nProvider locale={locale} messages={messages}>
      <div className="flex min-h-screen">
        {/* Admin sidebar */}
        <aside className="hidden w-64 border-r bg-muted/30 md:block">
          <div className="flex h-14 items-center border-b px-4">
            <h2 className="text-lg font-semibold">{t("title")}</h2>
          </div>
          <nav aria-label="Admin navigation" className="space-y-1 p-2">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
            <div className="my-4 border-t" />
            <Link
              href="/dashboard"
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              {t("nav.backToApp")}
            </Link>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6">
          {/* Mobile nav */}
          <div className="mb-4 flex items-center gap-4 overflow-x-auto border-b pb-3 md:hidden">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex shrink-0 items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </div>
          {children}
        </main>
      </div>
    </I18nProvider>
  );
}
