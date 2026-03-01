import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "./(auth)/actions";
import { getSubscription } from "@/lib/subscription";
import { SubscribeButton } from "@/components/subscribe-button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const subscription = user ? await getSubscription() : null;

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl tracking-tight">
            Online Budget App
          </CardTitle>
          <CardDescription className="text-lg">
            AI-powered, bank-connected global budgeting
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          {user ? (
            <div className="flex flex-col items-center gap-2">
              <p className="text-sm text-zinc-500">
                Signed in as {user.email}
              </p>
              {subscription?.isActive ? (
                <>
                  <p className="text-sm text-green-600">
                    Subscription: {subscription.status}
                    {subscription.status === "trialing" &&
                      subscription.trialEnd && (
                        <span className="text-zinc-500">
                          {" "}
                          (trial ends{" "}
                          {new Date(
                            subscription.trialEnd
                          ).toLocaleDateString()}
                          )
                        </span>
                      )}
                  </p>
                  <Button asChild>
                    <Link href="/dashboard">Go to Dashboard</Link>
                  </Button>
                </>
              ) : (
                <SubscribeButton />
              )}
              <form>
                <Button variant="outline" size="sm" formAction={signOut}>
                  Sign Out
                </Button>
              </form>
            </div>
          ) : (
            <div className="flex gap-4">
              <Button asChild>
                <Link href="/login">Log In</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
