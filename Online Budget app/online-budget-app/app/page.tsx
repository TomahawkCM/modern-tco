import { createClient } from "@/lib/supabase/server";
import { signOut } from "./(auth)/actions";
import { getSubscription } from "@/lib/subscription";
import { SubscribeButton } from "@/components/subscribe-button";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const subscription = user ? await getSubscription() : null;

  return (
    <div className="flex min-h-screen items-center justify-center">
      <main className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">
          Online Budget App
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          AI-powered, bank-connected global budgeting
        </p>
        {user ? (
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm text-zinc-500">Signed in as {user.email}</p>
            {subscription?.isActive ? (
              <p className="text-sm text-green-600">
                Subscription: {subscription.status}
                {subscription.status === "trialing" &&
                  subscription.trialEnd && (
                    <span className="text-zinc-500">
                      {" "}
                      (trial ends{" "}
                      {new Date(subscription.trialEnd).toLocaleDateString()})
                    </span>
                  )}
              </p>
            ) : (
              <SubscribeButton />
            )}
            <form>
              <button
                formAction={signOut}
                className="rounded border px-4 py-2 text-sm hover:bg-zinc-100"
              >
                Sign Out
              </button>
            </form>
          </div>
        ) : (
          <div className="flex gap-4">
            <a
              href="/login"
              className="rounded bg-zinc-900 px-4 py-2 text-white hover:bg-zinc-700"
            >
              Log In
            </a>
            <a
              href="/signup"
              className="rounded border px-4 py-2 hover:bg-zinc-100"
            >
              Sign Up
            </a>
          </div>
        )}
      </main>
    </div>
  );
}
