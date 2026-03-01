import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { syncTransactions, isPlaidConfigured } from "@/integrations/plaid";
import { getConnectedBank, updateConnectedBank } from "@/server/connected-banks";
import { decrypt } from "@/lib/encryption";

const syncSchema = z.object({
  connected_bank_id: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  if (!isPlaidConfigured()) {
    return NextResponse.json({ error: "Bank sync is not configured" }, { status: 503 });
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = syncSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  try {
    // Fetch the connected bank record
    const bank = await getConnectedBank(supabase, user.id, parsed.data.connected_bank_id);

    if (!bank) {
      return NextResponse.json({ error: "Connected bank not found" }, { status: 404 });
    }

    if (bank.status !== "active") {
      return NextResponse.json({ error: "Connected bank is not active" }, { status: 400 });
    }

    // Decrypt access token
    const accessToken = decrypt(bank.access_token_encrypted);

    // Sync transactions with cursor-based pagination
    const result = await syncTransactions(accessToken, bank.sync_cursor ?? undefined);

    // ── Persist synced transactions ─────────────────────────────────

    // Resolve account_id: look up by provider_account_id from the connected bank,
    // or fall back to the first account for this user linked to the same institution.
    let defaultAccountId: string | null = null;

    if (bank.institution_id) {
      const { data: existingAccounts } = await supabase
        .from("accounts")
        .select("id")
        .eq("user_id", user.id)
        .eq("institution_id", bank.institution_id)
        .limit(1);

      if (existingAccounts && existingAccounts.length > 0 && existingAccounts[0]) {
        defaultAccountId = existingAccounts[0].id;
      }
    }

    // If no linked account exists, create a placeholder for this bank connection
    if (!defaultAccountId) {
      const { data: newAccount, error: accountError } = await supabase
        .from("accounts")
        .insert({
          user_id: user.id,
          name: `Bank Connection ${bank.id.slice(0, 8)}`,
          type: "checking" as const,
          currency: "USD",
          balance_minor: 0,
          is_manual: false,
          institution_id: bank.institution_id ?? null,
        })
        .select("id")
        .single();

      if (accountError) throw accountError;
      defaultAccountId = newAccount.id;
    }

    // Upsert added transactions
    if (result.added.length > 0) {
      const rows = result.added.map((t) => ({
        user_id: user.id,
        account_id: defaultAccountId!,
        provider_transaction_id: t.transaction_id,
        amount_minor: Math.round(-t.amount * 100), // Plaid: positive = debit, negate for outflows
        currency: t.iso_currency_code ?? t.unofficial_currency_code ?? "USD",
        description: t.name,
        merchant_name: t.merchant_name ?? null,
        transaction_date: t.date,
        posted_at: t.datetime ?? null,
        is_pending: t.pending,
      }));

      const { error: upsertError } = await supabase
        .from("transactions")
        .upsert(rows, { onConflict: "provider_transaction_id" });

      if (upsertError) throw upsertError;
    }

    // Update modified transactions
    for (const t of result.modified) {
      const { error: updateError } = await supabase
        .from("transactions")
        .update({
          amount_minor: Math.round(-t.amount * 100),
          currency: t.iso_currency_code ?? t.unofficial_currency_code ?? "USD",
          description: t.name,
          merchant_name: t.merchant_name ?? null,
          transaction_date: t.date,
          posted_at: t.datetime ?? null,
          is_pending: t.pending,
        })
        .eq("provider_transaction_id", t.transaction_id)
        .eq("user_id", user.id);

      if (updateError) throw updateError;
    }

    // Delete removed transactions
    if (result.removed.length > 0) {
      const removedIds = result.removed.map((t) => t.transaction_id);
      const { error: deleteError } = await supabase
        .from("transactions")
        .delete()
        .eq("user_id", user.id)
        .in("provider_transaction_id", removedIds);

      if (deleteError) throw deleteError;
    }

    // Update the connected bank with new cursor and sync timestamp AFTER successful persistence
    await updateConnectedBank(supabase, user.id, bank.id, {
      sync_cursor: result.nextCursor,
      last_synced_at: new Date().toISOString(),
    });

    return NextResponse.json({
      added: result.added.length,
      modified: result.modified.length,
      removed: result.removed.length,
      next_cursor: result.nextCursor,
      transactions: {
        added: result.added.map((t) => ({
          transaction_id: t.transaction_id,
          amount: t.amount,
          date: t.date,
          name: t.name,
          merchant_name: t.merchant_name,
          category: t.category,
          pending: t.pending,
        })),
        modified: result.modified.map((t) => ({
          transaction_id: t.transaction_id,
          amount: t.amount,
          date: t.date,
          name: t.name,
          merchant_name: t.merchant_name,
          category: t.category,
          pending: t.pending,
        })),
        removed: result.removed.map((t) => ({
          transaction_id: t.transaction_id,
        })),
      },
    });
  } catch (err) {
    console.error("[plaid/sync]", err);
    return NextResponse.json({ error: "Failed to sync transactions" }, { status: 500 });
  }
}
