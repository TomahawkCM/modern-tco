import Link from "next/link";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { signOut } from "./(auth)/actions";
import { getSubscription } from "@/lib/subscription";
import { SubscribeButton } from "@/components/subscribe-button";
import { getValidLocale } from "@/i18n/config";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const subscription = user ? await getSubscription() : null;

  const cookieStore = await cookies();
  const locale = getValidLocale(cookieStore.get("locale")?.value ?? "en-US");
  const t = await getTranslations({ locale, namespace: "landing" });

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl tracking-tight">{t("title")}</CardTitle>
          <CardDescription className="text-lg">{t("description")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          {user ? (
            <div className="flex flex-col items-center gap-2">
              <p className="text-sm text-zinc-500">
                {t("signedInAs", { email: user.email ?? "" })}
              </p>
              {subscription?.isActive ? (
                <>
                  <p className="text-sm text-green-600">
                    {t("subscription", { status: subscription.status ?? "" })}
                    {subscription.status === "trialing" && subscription.trialEnd && (
                      <span className="text-zinc-500">
                        {" "}
                        {t("trialEnds", {
                          date: new Date(subscription.trialEnd).toLocaleDateString(locale),
                        })}
                      </span>
                    )}
                  </p>
                  <Button asChild>
                    <Link href="/dashboard">{t("goToDashboard")}</Link>
                  </Button>
                </>
              ) : (
                <SubscribeButton />
              )}
              <form>
                <Button variant="outline" size="sm" formAction={signOut}>
                  {t("signOut")}
                </Button>
              </form>
            </div>
          ) : (
            <div className="flex gap-4">
              <Button asChild>
                <Link href="/login">{t("logIn")}</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/signup">{t("signUp")}</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
