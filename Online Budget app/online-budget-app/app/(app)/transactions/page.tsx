import { createClient } from "@/lib/supabase/server";
import { formatMoney, minorAmount } from "@/engine";
import { TransactionTable } from "@/components/transactions/transaction-table";
import { TransactionFilters } from "@/components/transactions/transaction-filters";

interface Props {
  searchParams: Promise<{ from?: string; to?: string }>;
}

export default async function TransactionsPage({ searchParams }: Props) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch user settings for currency + locale
  const { data: settings } = await supabase
    .from("user_settings")
    .select("primary_currency, locale")
    .eq("user_id", user.id)
    .single();

  const currency = settings?.primary_currency ?? "USD";
  const locale = settings?.locale ?? "en-US";

  // Default to current month when no filters provided
  const now = new Date();
  const defaultFrom = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split("T")[0]!;
  const defaultTo = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    .toISOString()
    .split("T")[0]!;
  const fromDate = params.from ?? defaultFrom;
  const toDate = params.to ?? defaultTo;

  // Fetch transactions + categories in parallel
  const [txResult, categoryRows] = await Promise.all([
    supabase
      .from("transactions")
      .select(
        "id, amount_minor, currency, description, merchant_name, category_id, transaction_date, is_pending"
      )
      .eq("user_id", user.id)
      .gte("transaction_date", fromDate)
      .lte("transaction_date", toDate)
      .order("transaction_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(100),
    supabase.from("categories").select("id, key"),
  ]);

  const transactions = txResult.data ?? [];
  const categories = categoryRows.data ?? [];

  // Build category ID -> key lookup
  const categoryKeyMap = new Map<string, string>();
  for (const cat of categories) {
    categoryKeyMap.set(cat.id, cat.key);
  }

  const fmt = (amt: { amountMinor: number; currency: string }) =>
    formatMoney(amt, locale);

  const displayTransactions = transactions.map((tx) => ({
    id: tx.id,
    date: tx.transaction_date,
    description: tx.description,
    merchantName: tx.merchant_name,
    categoryKey: tx.category_id
      ? (categoryKeyMap.get(tx.category_id) ?? null)
      : null,
    amount: minorAmount(tx.amount_minor, tx.currency),
    isPending: tx.is_pending,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Transactions</h1>
        <span className="text-sm text-muted-foreground">
          {transactions.length} results
        </span>
      </div>
      <TransactionFilters />
      <TransactionTable
        transactions={displayTransactions}
        formatAmount={fmt}
      />
    </div>
  );
}
