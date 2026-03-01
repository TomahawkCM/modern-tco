import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { I18nProvider } from "@/components/i18n-provider";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { MobileLayout } from "@/components/layout/mobile-layout";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { getUserSettings } from "@/server/settings";
import { getValidLocale, LOCALE_METADATA } from "@/i18n/config";
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

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const settings = await getUserSettings(supabase, user.id);
  const locale = getValidLocale(settings.locale);
  const messages = await loadMessages(locale);

  // Set locale cookie for server-side getTranslations() in child pages
  const cookieStore = await cookies();
  cookieStore.set("locale", locale, { path: "/", httpOnly: true, sameSite: "lax" });

  const dir = LOCALE_METADATA[locale]?.dir ?? "ltr";

  return (
    <I18nProvider locale={locale} messages={messages}>
      <div className="flex min-h-screen" dir={dir}>
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <MobileLayout />
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 pb-20 md:pb-6">
            <Breadcrumb />
            {children}
          </main>
        </div>
        <MobileNav />
      </div>
    </I18nProvider>
  );
}
