import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getSubscription } from "@/lib/subscription";
import {
  aggregateIncomeExpense,
  toMajorUnits,
  ENGINE_VERSION,
} from "@/engine";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const subscription = await getSubscription();

  // Fetch user settings for currency
  const { data: settings } = await supabase
    .from("user_settings")
    .select("primary_currency")
    .eq("user_id", user.id)
    .single();

  const currency = settings?.primary_currency ?? "USD";

  // Fetch transactions for current month
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split("T")[0]!;
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    .toISOString()
    .split("T")[0]!;

  const { data: transactions } = await supabase
    .from("transactions")
    .select("amount_minor, currency")
    .eq("user_id", user.id)
    .eq("currency", currency)
    .gte("transaction_date", monthStart)
    .lte("transaction_date", monthEnd);

  // Map DB rows to engine input — all math happens in engine
  const engineInput = (transactions ?? []).map((t) => ({
    amountMinor: t.amount_minor,
    currency: t.currency,
  }));

  const summary = aggregateIncomeExpense(engineInput, currency);

  const income = toMajorUnits(summary.totalIncome.amountMinor);
  const expense = toMajorUnits(Math.abs(summary.totalExpense.amountMinor));
  const net = toMajorUnits(summary.net.amountMinor);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <main className="flex flex-col items-center gap-6 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>

        {!subscription?.isActive && (
          <p className="text-sm text-amber-600">
            Subscription required for full access
          </p>
        )}

        <div className="grid grid-cols-3 gap-8">
          <div className="flex flex-col items-center gap-1">
            <span className="text-sm text-zinc-500">Income</span>
            <span className="text-2xl font-semibold text-green-600">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency,
              }).format(income)}
            </span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-sm text-zinc-500">Expenses</span>
            <span className="text-2xl font-semibold text-red-600">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency,
              }).format(expense)}
            </span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-sm text-zinc-500">Net</span>
            <span
              className={`text-2xl font-semibold ${net >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency,
              }).format(net)}
            </span>
          </div>
        </div>

        <p className="text-xs text-zinc-400">
          {summary.transactionCount} transactions this month
        </p>

        <p className="text-xs text-zinc-300">
          Engine v{ENGINE_VERSION}
        </p>

        <a
          href="/"
          className="rounded border px-4 py-2 text-sm hover:bg-zinc-100"
        >
          Back to Home
        </a>
      </main>
    </div>
  );
}
