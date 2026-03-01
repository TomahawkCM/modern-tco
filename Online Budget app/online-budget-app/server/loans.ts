/**
 * Server — Loan CRUD operations
 *
 * All Supabase queries for loans and loan payments live here.
 * API routes validate with Zod, then delegate to these functions.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/database.types";
import type { CreateLoanInput, UpdateLoanInput, CreateLoanPaymentInput } from "./schemas/loan";

type LoanRow = Database["public"]["Tables"]["loans"]["Row"];
type LoanPaymentRow = Database["public"]["Tables"]["loan_payments"]["Row"];

export async function listLoans(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<LoanRow[]> {
  const { data, error } = await supabase
    .from("loans")
    .select("*")
    .eq("user_id", userId)
    .order("name", { ascending: true })
    .returns<LoanRow[]>();

  if (error) throw error;
  return data ?? [];
}

export async function getLoan(
  supabase: SupabaseClient<Database>,
  userId: string,
  loanId: string
): Promise<LoanRow | null> {
  const { data, error } = await supabase
    .from("loans")
    .select("*")
    .eq("id", loanId)
    .eq("user_id", userId)
    .returns<LoanRow[]>()
    .single();

  // PGRST116 = "JSON object requested, multiple (or no) rows returned"
  if (error && error.code === "PGRST116") return null;
  if (error) throw error;
  return data;
}

export async function createLoan(
  supabase: SupabaseClient<Database>,
  userId: string,
  input: CreateLoanInput
): Promise<LoanRow> {
  const { data, error } = await supabase
    .from("loans")
    .insert({
      user_id: userId,
      name: input.name,
      loan_type: input.loan_type,
      original_balance_minor: input.original_balance_minor,
      current_balance_minor: input.current_balance_minor,
      interest_rate: input.interest_rate,
      minimum_payment_minor: input.minimum_payment_minor ?? 0,
      start_date: input.start_date,
      end_date: input.end_date,
      status: input.status ?? "active",
      currency: input.currency,
    })
    .select("*")
    .returns<LoanRow[]>()
    .single();

  if (error) throw error;
  return data;
}

export async function updateLoan(
  supabase: SupabaseClient<Database>,
  userId: string,
  loanId: string,
  input: UpdateLoanInput
): Promise<LoanRow> {
  const { data, error } = await supabase
    .from("loans")
    .update(input)
    .eq("id", loanId)
    .eq("user_id", userId)
    .select("*")
    .returns<LoanRow[]>()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteLoan(
  supabase: SupabaseClient<Database>,
  userId: string,
  loanId: string
): Promise<void> {
  const { error } = await supabase.from("loans").delete().eq("id", loanId).eq("user_id", userId);

  if (error) throw error;
}

export async function listLoanPayments(
  supabase: SupabaseClient<Database>,
  userId: string,
  loanId: string
): Promise<LoanPaymentRow[]> {
  const { data, error } = await supabase
    .from("loan_payments")
    .select("*")
    .eq("user_id", userId)
    .eq("loan_id", loanId)
    .order("payment_date", { ascending: false })
    .returns<LoanPaymentRow[]>();

  if (error) throw error;
  return data ?? [];
}

export async function createLoanPayment(
  supabase: SupabaseClient<Database>,
  userId: string,
  input: CreateLoanPaymentInput
): Promise<LoanPaymentRow> {
  const { data, error } = await supabase
    .from("loan_payments")
    .insert({
      user_id: userId,
      loan_id: input.loan_id,
      amount_minor: input.amount_minor,
      payment_date: input.payment_date,
      principal_minor: input.principal_minor,
      interest_minor: input.interest_minor,
      notes: input.notes,
    })
    .select("*")
    .returns<LoanPaymentRow[]>()
    .single();

  if (error) throw error;
  return data;
}
